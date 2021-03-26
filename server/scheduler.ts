import schedule from 'node-schedule';
import PgStore from './pg-store';
import 'isomorphic-fetch';
import {
  createClient,
  getSubscriptionContracts,
  createSubscriptionBillingAttempt,
} from './handlers';

const pgStorage = new PgStore();

// export const scheduler = () => {
//   console.log('SCHEDULER HAS STARTED +++++++++++++');
//   // 5 sec for testing
//   const rule = '*/5 * * * * *';
//   // let rule = new schedule.RecurrenceRule();
//   // rule.second = 30;
//   // rule.tz = 'Etc/UTC';

//   const job = schedule.scheduleJob(rule, async function () {
//     console.log('A new day has begun!');
//     console.log('Rule', rule);
//   });
// };

export const scheduler = async () => {
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
