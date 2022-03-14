import dotenv from 'dotenv';
import schedule from 'node-schedule';
import PgStore from './pg-store';
import 'isomorphic-fetch';
import {
  createClient,
  createSubscriptionBillingAttempt,
  getSubscriptionContract,
  updateSubscriptionContract,
  updateSubscriptionDraft,
  commitSubscriptionDraft,
  getProductVariantById,
} from './handlers';
import { sendMailGunPause, sendMailGunRenew } from './utils';
import logger from './logger';
import { SubscriptionContract, SubscriptionLine } from './types/subscriptions';
dotenv.config();

const pgStorage = new PgStore();

export const scheduler = () => {
  runBillingAttempts();
  // logger.log('info', `Scheduler initialized ...`);
  const every10sec = '*/10 * * * *'; // every 10 seconds for testing
  const everymin = '*/1 * * * *'; // every min
  const everyday3am = '0 0 3 * * *'; // every day at 1 am
  const everyday6am = '0 0 6 * * *'; // every day at 6 am
  const everyday10am = '0 0 10 * * *'; // every day at 10 am
  const everyday12am = '0 0 0 * * *'; // every day at 12 am
  const everyhour = '0 0 */2 * * *'; // every 2 hours

  const scheduleJob = schedule.scheduleJob(everyday6am, async function () {
    logger.log('info', `Running Billing Attempt Rule: ${everyday6am}`);
    runBillingAttempts();
  });
  const syncJob = schedule.scheduleJob(everyhour, async function () {
    logger.log('info', `Running Contract Sync Rule: ${everyhour}`);
    runSubscriptionContractSync();
  });

  const cleanupJob = schedule.scheduleJob(everyday3am, async function () {
    logger.log('info', `Running Cleanup Sync Rule: ${everyday3am}`);
    runCancellation();
  });

  // const renewalNotificationJob = schedule.scheduleJob(
  //   everyday10am,
  //   async function () {
  //     logger.log(
  //       'info',
  //       `Running Renewal Notification Sync Rule: ${everyday10am}`
  //     );
  //     runRenewalNotification();
  //   }
  // );
};

export const runBillingAttempts = async () => {
  console.log('RUNNING BILLING ATTEMPTS');
  // get active shopify stores
  const ACTIVE_SHOPIFY_SHOPS = await pgStorage.loadActiveShops();
  const shops = Object.keys(ACTIVE_SHOPIFY_SHOPS);
  // loop through active shops
  shops.forEach(async (shop: string) => {
    // get token
    const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
    // get all active contracts for shop
    const contracts = await pgStorage.getLocalContractsByShop(shop);
    if (contracts) {
      console.log(`FOUND ${contracts.length} TO BILL`);
      // loop through contracts
      contracts.forEach(async contract => {
        // create billing attempt
        try {
          const client = createClient(shop, token);
          // check billing date on shopify
          const shopifyContract: SubscriptionContract =
            await getSubscriptionContract(client, contract.id);
          if (
            shopifyContract.nextBillingDate.split('T')[0] ===
            contract.next_billing_date.toISOString().substring(0, 10)
          ) {
            // check if quantity exists
            let oosProducts: string[] = [];
            shopifyContract.lines.edges.forEach(
              async (line: SubscriptionLine) => {
                console.log('CHECKING PRODUCT', line.node.variantId);
                const variantProduct = await getProductVariantById(
                  client,
                  line.node.variantId
                );
                if (variantProduct.inventoryQuantity <= line.node.quantity) {
                  console.log('FOUND OUT OF STOCK ITEM', line.node.variantId);
                  oosProducts.push(variantProduct.product.title);
                }
              }
            );
            // create billing attempt
            if (oosProducts.length === 0) {
              const billingAttempt = await createSubscriptionBillingAttempt(
                client,
                contract.id
              );
              logger.log('info', `Created Billing Attempt: ${billingAttempt}`);
            } else {
              // pause subscription and send email
              // update subscription
              let draftId = await updateSubscriptionContract(
                client,
                contract.id
              );
              draftId = await updateSubscriptionDraft(client, draftId, {
                status: 'PAUSED',
              });
              const subscriptionId = await commitSubscriptionDraft(
                client,
                draftId
              );
              // send email
              if (subscriptionId === contract.id) {
                const email = shopifyContract.customer.email;
                sendMailGunPause(shop, email, shopifyContract, oosProducts);
              }
            }
          }
        } catch (err: any) {
          logger.log('error', err.message);
        }
      });
    }
  });
};

// export const runBillingAttempts = async () => {
//   console.log('RUNNING BILLING ATTEMPTS');
//   // get active shopify stores
//   const ACTIVE_SHOPIFY_SHOPS = await pgStorage.loadActiveShops();
//   const shops = Object.keys(ACTIVE_SHOPIFY_SHOPS);
//   // loop through active shops
//   shops.forEach(async (shop: string) => {
//     // get token
//     const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
//     // get all active contracts for shop
//     const contracts = await pgStorage.getLocalContractsByShop(shop);
//     if (contracts) {
//       // loop through contracts
//       contracts.forEach(async contract => {
//         // create billing attempt
//         try {
//           const client = createClient(shop, token);
//           const billingAttempt = await createSubscriptionBillingAttempt(
//             client,
//             contract.id
//           );
//           logger.log('info', `Created Billing Attempt: ${billingAttempt}`);
//         } catch (err: any) {
//           logger.log('error', err.message);
//         }
//       });
//     }
//   });
// };

export const runRenewalNotification = async () => {
  console.log('RUNNING RENEWING SOON');
  // get active shopify stores
  const ACTIVE_SHOPIFY_SHOPS = await pgStorage.loadActiveShops();
  const shops = Object.keys(ACTIVE_SHOPIFY_SHOPS);
  // loop through active shops
  shops.forEach(async (shop: string) => {
    // get token
    const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
    // get all active contracts for shop
    const now = new Date();
    now.setDate(now.getDate() + 7);
    const nextBillingDate = new Date(now).toISOString().substring(0, 10);
    const contracts = await pgStorage.getLocalContractsRenewingSoonByShop(
      shop,
      nextBillingDate
    );
    if (contracts) {
      console.log(`FOUND ${contracts.length} RENEWING SOON`);
      // loop through contracts
      contracts.forEach(async contract => {
        // create billing attempt
        try {
          const client = createClient(shop, token);
          // check billing date on shopify
          const shopifyContract: SubscriptionContract =
            await getSubscriptionContract(client, contract.id);

          // send mailgun
          await sendMailGunRenew(
            shop,
            shopifyContract.customer.email,
            shopifyContract.customer.firstName,
            nextBillingDate
          );
        } catch (err: any) {
          logger.log('error', err.message);
        }
      });
    }
  });
};

export const runSubscriptionContractSync = async () => {
  console.log('RUNNING SUBSCRIPTION CONTRACT SYNC');
  // get active shopify stores
  const ACTIVE_SHOPIFY_SHOPS = await pgStorage.loadActiveShops();
  const shops = Object.keys(ACTIVE_SHOPIFY_SHOPS);
  shops.forEach(async (shop: string) => {
    try {
      logger.log('info', `Syncing contracts for shop: ${shop}`);
      const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
      await pgStorage.saveAllContracts(shop, token);
      return { msg: true };
    } catch (err: any) {
      logger.log('error', err.message);
    }
  });
};

export const runCancellation = async () => {
  console.log('RUNNING CLEANUP');
  // get active shopify stores
  const ACTIVE_SHOPIFY_SHOPS = await pgStorage.loadActiveShops();
  const shops = Object.keys(ACTIVE_SHOPIFY_SHOPS);
  // loop through active shops
  shops.forEach(async (shop: string) => {
    // get token
    const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
    // get all active contracts for shop
    const contracts =
      await pgStorage.getLocalContractsWithPaymentFailuresByShop(shop);
    if (contracts) {
      // loop through contracts
      contracts.forEach(async contract => {
        // if payment failures > 2 change status to cancelled.
        try {
          const client = createClient(shop, token);
          // get draft id
          const draftId = await updateSubscriptionContract(client, contract.id);
          logger.log('info', `Draft Id: ${draftId}`);
          // create input & update draft
          const input = {
            status: 'CANCELLED',
          };
          const updatedDraftId = await updateSubscriptionDraft(
            client,
            draftId,
            input
          );
          logger.log('info', `Updated Draft Id: ${updatedDraftId}`);
          // commit changes to draft
          const contractId = await commitSubscriptionDraft(
            client,
            updatedDraftId
          );
          logger.log('info', `Contract Id: ${contractId}`);
        } catch (err: any) {
          logger.log('error', err.message);
        }
      });
    }
  });
};
