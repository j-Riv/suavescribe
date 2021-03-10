import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import 'isomorphic-fetch';
import { Context } from 'koa';
import {
  addProductToSellingPlanGroups,
  createClient,
  createSellingPlanGroup,
  removeProductsFromSellingPlanGroup,
  updateSellingPlanGroup,
  deleteSellingPlanGroup,
  getSellingPlans,
  getSellingPlanById,
} from '../handlers';
dotenv.config();

// Extension routes
// const verifyJwt = (ctx, token) => {
//   try {
//     const decoded = jwt.verify(token, process.env.SHOPIFY_API_SECRET!);
//     return decoded;
//   } catch (err) {
//     console.log(err);
//     return (ctx.status = 500);
//   }
// };

export const getAllSubscriptionGroups = async (ctx: Context) => {
  console.log('SHOPIFY GET ALL SUBSCRIPTION PLANS CONTROLLER');
  console.log(ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS);
  const token = ctx.request.headers['x-suavescribe-token'];
  console.log('TOKEN', token);
  if (!token) return (ctx.status = 401);

  try {
    const decoded: any = jwt.verify(
      token as string,
      process.env.SHOPIFY_API_SECRET!
    );
    const store = decoded.dest.replace(/https:\/\//, '');
    console.log('STORE', store);
    // this will have to call db and get store + accessToken
    ctx.client = createClient(
      store,
      ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS[store]
    );
    const plans = await getSellingPlans(ctx);
    console.log('THE SELLING PLANS', plans);
    ctx.body = plans;
  } catch (err) {
    return (ctx.status = 500);
  }
};

export const getSubscriptionGroup = async (ctx: Context) => {
  console.log('SHOPIFY GET SUBSCRIPTION GROUP CONTROLLER');
  console.log(ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS);
  const token = ctx.request.headers['x-suavescribe-token'];
  console.log('TOKEN', token);
  if (!token) return (ctx.status = 401);

  try {
    const decoded: any = jwt.verify(
      token as string,
      process.env.SHOPIFY_API_SECRET!
    );
    const store = decoded.dest.replace(/https:\/\//, '');
    console.log('STORE', store);
    // this will have to call db and get store + accessToken
    ctx.client = createClient(
      store,
      ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS[store]
    );
    const plan = await getSellingPlanById(ctx);
    console.log('THE SELLING PLAN', plan);
    ctx.body = plan;
  } catch (err) {
    return (ctx.status = 500);
  }
};

export const addProductToSubscriptionPlanGroup = async (ctx: Context) => {
  const body = ctx.request.body;
  console.log('ADD --- BODY');
  // productId, variantId, selectedPlans[]
  console.log(body);
  console.log('SHOPIFY ADD PRODUCT TO SELLING PLAN CONTROLLER');
  console.log(ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS);
  const token = ctx.request.headers['x-suavescribe-token'];
  console.log('TOKEN', token);
  if (!token) return (ctx.status = 401);

  try {
    const decoded: any = jwt.verify(
      token as string,
      process.env.SHOPIFY_API_SECRET!
    );
    const store = decoded.dest.replace(/https:\/\//, '');
    console.log('STORE', store);
    // this will have to call db and get store + accessToken
    ctx.client = createClient(
      store,
      ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS[store]
    );
    const product = await addProductToSellingPlanGroups(ctx);
    console.log('THE PRODUCT', product);
    ctx.body = product;
  } catch (err) {
    return (ctx.status = 500);
  }
};

export const createSubscriptionPlanGroup = async (ctx: Context) => {
  console.log('SHOPIFY CREATE SUBSCRIPTION PLAN GROUP CONTROLLER');
  console.log(ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS);
  const body = ctx.request.body;
  // productId, variantId, planTitle, percentageOff, deliveryFrequency
  console.log('BODY=======>', JSON.stringify(body));
  const token = ctx.request.headers['x-suavescribe-token'];
  console.log('TOKEN', token);
  if (!token) return (ctx.status = 401);

  try {
    const decoded: any = jwt.verify(
      token as string,
      process.env.SHOPIFY_API_SECRET!
    );
    const store = decoded.dest.replace(/https:\/\//, '');
    console.log('STORE', store);
    // this will have to call db and get store + accessToken
    ctx.client = createClient(
      store,
      ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS[store]
    );
    const id = await createSellingPlanGroup(ctx);
    console.log('THE SELLING PLAN GROUP ID', id);
    ctx.body = id;
  } catch (err) {
    console.log('ERROR');
    console.log(err);
    return (ctx.status = 500);
  }
};

export const editSubscriptionPlanGroup = async (ctx: Context) => {
  console.log('SHOPIFY EDIT SUBSCRIPTION PLAN GROUP CONTROLLER');
  console.log(ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS);
  const body = ctx.request.body;
  // productId, variantId, planTitle, percentageOff, deliveryFrequency
  console.log('BODY=======>', JSON.stringify(body));
  const token = ctx.request.headers['x-suavescribe-token'];
  console.log('TOKEN', token);
  if (!token) return (ctx.status = 401);

  try {
    const decoded: any = jwt.verify(
      token as string,
      process.env.SHOPIFY_API_SECRET!
    );
    const store = decoded.dest.replace(/https:\/\//, '');
    console.log('STORE', store);
    // this will have to call db and get store + accessToken
    ctx.client = createClient(
      store,
      ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS[store]
    );
    const id = await updateSellingPlanGroup(ctx);
    console.log('THE SELLING PLAN GROUP ID', id);
    ctx.body = id;
  } catch (err) {
    console.log('ERROR');
    console.log(err);
    return (ctx.status = 500);
  }
};

export const removeProductFromSubscriptionPlanGroup = async (ctx: Context) => {
  const body = ctx.request.body;
  console.log('REMOVE --- BODY');
  // productId, variantId, variantIds, sellingPlanGroupId
  console.log(body);
  console.log('SHOPIFY REMOVE PRODUCT FROM SELLING PLAN CONTROLLER');
  console.log(ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS);
  const token = ctx.request.headers['x-suavescribe-token'];
  console.log('TOKEN', token);
  if (!token) return (ctx.status = 401);

  try {
    const decoded: any = jwt.verify(
      token as string,
      process.env.SHOPIFY_API_SECRET!
    );
    const store = decoded.dest.replace(/https:\/\//, '');
    console.log('STORE', store);
    // this will have to call db and get store + accessToken
    ctx.client = createClient(
      store,
      ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS[store]
    );
    const products = await removeProductsFromSellingPlanGroup(ctx);
    console.log('THE PRODUCTS', products);
    ctx.body = products;
  } catch (err) {
    return (ctx.status = 500);
  }
};

export const deleteSubscriptionPlanGroup = async (ctx: Context) => {
  const body = ctx.request.body;
  console.log('DELETE SUBSCRIPTION PLAN --- BODY');
  // productId, variantId, variantIds, sellingPlanGroupId
  console.log(body);
  console.log('SHOPIFY DELETE SELLING PLAN CONTROLLER');
  console.log(ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS);
  const token = ctx.request.headers['x-suavescribe-token'];
  console.log('TOKEN', token);
  if (!token) return (ctx.status = 401);

  try {
    const decoded: any = jwt.verify(
      token as string,
      process.env.SHOPIFY_API_SECRET!
    );
    const store = decoded.dest.replace(/https:\/\//, '');
    console.log('STORE', store);
    // this will have to call db and get store + accessToken
    ctx.client = createClient(
      store,
      ctx.state.ACTIVE_SHOPIFY_SHOP_ACCESS_TOKENS[store]
    );
    const id = await deleteSellingPlanGroup(ctx);
    console.log('DELETED PLAN ID', id);
    ctx.body = id;
  } catch (err) {
    return (ctx.status = 500);
  }
};
