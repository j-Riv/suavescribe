import schedule from 'node-schedule';
import PgStore from './pg-store';
import 'isomorphic-fetch';
import { createClient, createSubscriptionBillingAttempt } from './handlers';

const pgStorage = new PgStore();

export const scheduler = () => {
  console.log('SCHEDULER INIT +++++++++++++');
  // const rule = '*/10 * * * *'; // every 10 seconds for testing
  const rule = '*/1 * * * *';
  // const rule = '0 0 6 * * *'; // every day at 6 am

  const job = schedule.scheduleJob(rule, async function () {
    console.log('Rule', rule);
    // run();
    sync();
  });
};

const run = async () => {
  console.log('SCHEDULER HAS STARTED +++++++++++++');
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
      // loop through contracts
      contracts.forEach(async contract => {
        // create billing attempt
        try {
          const client = createClient(shop, token);
          const billingAttempt = await createSubscriptionBillingAttempt(
            client,
            contract.id
          );
          console.log('Billing Attempt', billingAttempt);
        } catch (err) {
          console.log('ERROR', err);
        }
      });
    }
  });
};

const sync = async () => {
  // get active shopify stores
  const ACTIVE_SHOPIFY_SHOPS = await pgStorage.loadActiveShops();
  const shops = Object.keys(ACTIVE_SHOPIFY_SHOPS);
  shops.forEach(async (shop: string) => {
    const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
    await pgStorage.saveAllContracts(shop, token);
  });
};
