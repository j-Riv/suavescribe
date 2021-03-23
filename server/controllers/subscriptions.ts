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
import PgStore from '../pg-store';
dotenv.config();

const sessionStorage = new PgStore();

export const getAllSubscriptionGroups = async (ctx: Context) => {
  console.log('SHOPIFY GET ALL SUBSCRIPTION PLANS CONTROLLER');
  try {
    const store = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await sessionStorage.loadCurrentShop(store);
    if (res) {
      ctx.client = createClient(store, res.accessToken);
      const plans = await getSellingPlans(ctx);
      console.log('THE SELLING PLANS', plans);
      ctx.body = plans;
    } else {
      return (ctx.status = 401);
    }
  } catch (err) {
    return (ctx.status = 500);
  }
};

export const getSubscriptionGroup = async (ctx: Context) => {
  console.log('SHOPIFY GET SUBSCRIPTION GROUP CONTROLLER');
  try {
    const store = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await sessionStorage.loadCurrentShop(store);
    if (res) {
      ctx.client = createClient(store, res.accessToken);
      const plan = await getSellingPlanById(ctx);
      console.log('THE SELLING PLAN', plan);
      ctx.body = plan;
    } else {
      return (ctx.status = 401);
    }
  } catch (err) {
    return (ctx.status = 500);
  }
};

export const addProductToSubscriptionPlanGroup = async (ctx: Context) => {
  try {
    const store = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await sessionStorage.loadCurrentShop(store);
    if (res) {
      ctx.client = createClient(store, res.accessToken);
      const product = await addProductToSellingPlanGroups(ctx);
      ctx.body = product;
    } else {
      return (ctx.status = 401);
    }
  } catch (err) {
    return (ctx.status = 500);
  }
};

export const createSubscriptionPlanGroup = async (ctx: Context) => {
  console.log('SHOPIFY CREATE SUBSCRIPTION PLAN GROUP CONTROLLER');
  try {
    const store = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await sessionStorage.loadCurrentShop(store);
    if (res) {
      ctx.client = createClient(store, res.accessToken);
      const id = await createSellingPlanGroup(ctx);
      ctx.body = id;
    } else {
      return (ctx.status = 401);
    }
  } catch (err) {
    console.log('ERROR');
    console.log(err);
    return (ctx.status = 500);
  }
};

export const editSubscriptionPlanGroup = async (ctx: Context) => {
  console.log('SHOPIFY EDIT SUBSCRIPTION PLAN GROUP CONTROLLER');
  try {
    const store = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await sessionStorage.loadCurrentShop(store);
    if (res) {
      ctx.client = createClient(store, res.accessToken);
      const id = await updateSellingPlanGroup(ctx);
      ctx.body = id;
    } else {
      return (ctx.status = 401);
    }
  } catch (err) {
    console.log('ERROR');
    console.log(err);
    return (ctx.status = 500);
  }
};

export const removeProductFromSubscriptionPlanGroup = async (ctx: Context) => {
  console.log('SHOPIFY REMOVE PRODUCT FROM SELLING PLAN CONTROLLER');
  try {
    const store = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await sessionStorage.loadCurrentShop(store);
    if (res) {
      ctx.client = createClient(store, res.accessToken);
      const products = await removeProductsFromSellingPlanGroup(ctx);
      ctx.body = products;
    } else {
      return (ctx.status = 401);
    }
  } catch (err) {
    return (ctx.status = 500);
  }
};

export const deleteSubscriptionPlanGroup = async (ctx: Context) => {
  console.log('SHOPIFY DELETE SELLING PLAN CONTROLLER');
  try {
    const store = ctx.state.shop;
    // this will have to call db and get accessToken
    const res = await sessionStorage.loadCurrentShop(store);
    if (res) {
      ctx.client = createClient(store, res.accessToken);
      const id = await deleteSellingPlanGroup(ctx);
      ctx.body = id;
    } else {
      return (ctx.status = 401);
    }
  } catch (err) {
    return (ctx.status = 500);
  }
};
