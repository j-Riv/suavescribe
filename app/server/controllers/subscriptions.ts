import dotenv from 'dotenv';
import 'isomorphic-fetch';
import { Context } from 'koa';
import {
  addProductToSellingPlanGroups,
  removeProductsFromSellingPlanGroup,
  addProductVariantToSellingPlanGroups,
  removeProductVariantFromSellingPlanGroups,
  createClient,
  createSellingPlanGroup,
  createSellingPlanGroupV2,
  updateSellingPlanGroup,
  deleteSellingPlanGroup,
  getSellingPlans,
  getSellingPlanById,
} from '../handlers';
import PgStore from '../pg-store';
import logger from '../logger';
dotenv.config();

const pgStorage = new PgStore();

export const getAllSubscriptionGroups = async (ctx: Context) => {
  try {
    const shop = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await pgStorage.loadCurrentShop(shop);
    if (res) {
      ctx.client = createClient(shop, res.accessToken);
      const plans = await getSellingPlans(ctx);
      ctx.body = plans;
    } else {
      return (ctx.status = 401);
    }
  } catch (err: any) {
    logger.log('error', err.message);
    return (ctx.status = 500);
  }
};

export const getSubscriptionGroup = async (ctx: Context) => {
  try {
    const shop = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await pgStorage.loadCurrentShop(shop);
    if (res) {
      ctx.client = createClient(shop, res.accessToken);
      const plan = await getSellingPlanById(ctx);
      ctx.body = plan;
    } else {
      return (ctx.status = 401);
    }
  } catch (err: any) {
    logger.log('error', err.message);
    return (ctx.status = 500);
  }
};

export const addProductToSubscriptionPlanGroup = async (ctx: Context) => {
  try {
    const shop = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await pgStorage.loadCurrentShop(shop);
    if (res) {
      const body = ctx.request.body as {
        productId: string;
        variantId?: string;
        selectedPlans: string[];
      };
      ctx.client = createClient(shop, res.accessToken);
      let product: any;
      if (body.variantId) {
        product = await addProductVariantToSellingPlanGroups(ctx);
      } else {
        product = await addProductToSellingPlanGroups(ctx);
      }
      ctx.body = product;
    } else {
      return (ctx.status = 401);
    }
  } catch (err: any) {
    logger.log('error', err.message);
    return (ctx.status = 500);
  }
};

export const createSubscriptionPlanGroup = async (ctx: Context) => {
  try {
    const shop = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await pgStorage.loadCurrentShop(shop);
    if (res) {
      ctx.client = createClient(shop, res.accessToken);
      const id = await createSellingPlanGroup(ctx);
      ctx.body = id;
    } else {
      return (ctx.status = 401);
    }
  } catch (err: any) {
    logger.log('error', err.message);
    return (ctx.status = 500);
  }
};

export const createSubscriptionPlanGroupV2 = async (ctx: Context) => {
  try {
    const shop = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await pgStorage.loadCurrentShop(shop);
    if (res) {
      ctx.client = createClient(shop, res.accessToken);
      const response = await createSellingPlanGroupV2(ctx);
      ctx.body = response;
    } else {
      return (ctx.status = 401);
    }
  } catch (err: any) {
    logger.log('error', err.message);
    return (ctx.status = 500);
  }
};

export const editSubscriptionPlanGroup = async (ctx: Context) => {
  try {
    const shop = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await pgStorage.loadCurrentShop(shop);
    if (res) {
      ctx.client = createClient(shop, res.accessToken);
      const id = await updateSellingPlanGroup(ctx);
      ctx.body = id;
    } else {
      return (ctx.status = 401);
    }
  } catch (err: any) {
    logger.log('error', err.message);
    return (ctx.status = 500);
  }
};

export const removeProductFromSubscriptionPlanGroup = async (ctx: Context) => {
  try {
    const shop = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await pgStorage.loadCurrentShop(shop);
    if (res) {
      const body = ctx.request.body as {
        productId: string;
        variantId?: string;
        selectedPlans: string[];
      };
      ctx.client = createClient(shop, res.accessToken);
      let product: any;
      if (body.variantId) {
        product = await removeProductVariantFromSellingPlanGroups(ctx);
      } else {
        product = await removeProductsFromSellingPlanGroup(ctx);
      }
      // const products = await removeProductsFromSellingPlanGroup(ctx);
      ctx.body = product;
    } else {
      return (ctx.status = 401);
    }
  } catch (err: any) {
    logger.log('error', err.message);
    return (ctx.status = 500);
  }
};

export const deleteSubscriptionPlanGroup = async (ctx: Context) => {
  try {
    const shop = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await pgStorage.loadCurrentShop(shop);
    if (res) {
      ctx.client = createClient(shop, res.accessToken);
      const id = await deleteSellingPlanGroup(ctx);
      ctx.body = id;
    } else {
      return (ctx.status = 401);
    }
  } catch (err: any) {
    logger.log('error', err.message);
    return (ctx.status = 500);
  }
};
