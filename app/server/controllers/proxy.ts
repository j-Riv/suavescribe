import dotenv from 'dotenv';
import 'isomorphic-fetch';
import { Context } from 'koa';
import {
  commitSubscriptionDraft,
  createClient,
  getCustomerSubscriptionContractsById,
  getSubscriptionContract,
  updateSubscriptionContract,
  updateSubscriptionDraft,
  updatePaymentMethod,
} from '../handlers';
import PgStore from '../pg-store';
import logger from '../logger';
dotenv.config();

const pgStorage = new PgStore();

export const getCustomerSubscriptions = async (ctx: Context) => {
  const params = ctx.request.query;
  const body = JSON.parse(ctx.request.body);
  console.log('REACT HITTING SERVER');
  console.log('PARAMS', params);
  console.log('BODY', body);
  const customerId = body.customerId as string;
  if (customerId) {
    try {
      const shop = params.shop as string;
      if (shop) {
        const res = await pgStorage.loadCurrentShop(shop);
        if (res) {
          ctx.client = createClient(shop, res.accessToken);
          const subscriptions = await getCustomerSubscriptionContractsById(
            ctx,
            customerId
          );
          if (subscriptions.length > 0) {
            ctx.body = subscriptions;
          } else {
            ctx.body = { msg: 'No Subs Found' };
          }
        } else {
          return (ctx.status = 401);
        }
      }
    } catch (e) {
      console.log('ERROR', e.message);
      return (ctx.status = 403);
    }
  } else {
    ctx.body = `
      <a href="/apps/app_proxy/?customerId={{ customer.id}}">View Subscriptions</a>
    `;
  }
};

export const updateCustomerSubscription = async (ctx: Context) => {
  console.log('APP PROXY -> UPDATING CUSTOMER SUBSCRIPTION');
  console.log('REQUEST', ctx.request);
  console.log('REQ', ctx.req);
  const params = ctx.request.query;
  console.log('QUERY', ctx.request.query);
  console.log('REQ BODY', ctx.request.body);
  const body = ctx.request.body;
  const subscriptionContractId = body.subscriptionContractId as string;
  const status = body.status as string;
  console.log('PARAMS', params);
  console.log('BODY', body);
  try {
    const shop = params.shop as string;
    if (shop) {
      const res = await pgStorage.loadCurrentShop(shop);
      if (res) {
        const client = createClient(shop, res.accessToken);
        let draftId = await updateSubscriptionContract(
          client,
          subscriptionContractId
        );
        draftId = await updateSubscriptionDraft(client, draftId, {
          status: status,
        });
        const subscriptionId = await commitSubscriptionDraft(client, draftId);
        // send data
        ctx.body = { updatedSubscriptionContractId: subscriptionId };
      } else {
        return (ctx.status = 401);
      }
    }
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 403);
  }
};

export const updateSubscriptionPaymentMethod = async (ctx: Context) => {
  console.log('APP PROXY -> UPDATING PAYMENT METHOD');
  const params = ctx.request.query;
  const body = ctx.request.body;
  const paymentMethodId = body.paymentMethodId as string;
  try {
    const shop = params.shop as string;
    if (shop) {
      const res = await pgStorage.loadCurrentShop(shop);
      if (res) {
        const client = createClient(shop, res.accessToken);
        const customerId = await updatePaymentMethod(client, paymentMethodId);
        // send data
        ctx.body = { customerId: customerId };
      } else {
        return (ctx.status = 401);
      }
    }
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 403);
  }
};

export const updateSubscriptionShippingAddress = async (ctx: Context) => {
  const params = ctx.request.query;
  const body = JSON.parse(ctx.request.body);
  const {
    subscriptionContractId,
    address1,
    address2,
    city,
    province,
    country,
    zip,
    firstName,
    lastName,
    company,
    phone,
  } = body;
  try {
    const shop = params.shop as string;
    if (shop) {
      const res = await pgStorage.loadCurrentShop(shop);
      if (res) {
        const client = createClient(shop, res.accessToken);
        let draftId = await updateSubscriptionContract(
          client,
          subscriptionContractId
        );
        draftId = await updateSubscriptionDraft(client, draftId, {
          deliveryMethod: {
            shipping: {
              address: {
                address1,
                address2,
                city,
                province,
                country,
                zip,
                firstName,
                lastName,
                company,
                phone,
              },
            },
          },
        });
        if (typeof draftId !== 'string') {
          return (ctx.body = { errors: draftId });
        }
        const subscriptionId = await commitSubscriptionDraft(client, draftId);
        console.log('SUBSCRIPTION ID');
        // send data
        ctx.body = { updatedSubscriptionContractId: subscriptionId };
      } else {
        return (ctx.status = 401);
      }
    }
  } catch (e) {
    console.log('ERROR', e.message);
    return (ctx.status = 401);
  }
};
