import schedule from 'node-schedule';
import PgStore from './pg-store';
import 'isomorphic-fetch';
import { createClient, createSubscriptionBillingAttempt } from './handlers';
import logger from './logger';

const pgStorage = new PgStore();

export const scheduler = () => {
  logger.log('info', `Scheduler initialized ...`);
  const every10sec = '*/10 * * * *'; // every 10 seconds for testing
  const everymin = '*/1 * * * *'; // every min
  const everyday6am = '0 0 6 * * *'; // every day at 6 am
  const everyday12am = '0 0 0 * * *'; // every day at 12 am

  const scheduleJob = schedule.scheduleJob(everyday6am, async function () {
    logger.log('info', `Running Billing Attempt Rule: ${everyday6am}`);
    run();
  });
  const syncJob = schedule.scheduleJob(everyday12am, async function () {
    logger.log('info', `Running Contract Sync Rule: ${everyday12am}`);
    sync();
  });
};

const run = async () => {
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
          logger.log('info', `Created Billing Attempt: ${billingAttempt}`);
        } catch (err) {
          logger.log('error', err.message);
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
    try {
      logger.log('info', `Syncing contracts for shop: ${shop}`);
      const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
      await pgStorage.saveAllContracts(shop, token);
    } catch (err) {
      logger.log('error', err.message);
    }
  });
};
