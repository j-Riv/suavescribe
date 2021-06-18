import dotenv from 'dotenv';
import Router from 'koa-router';
import crypto from 'crypto';
import fs from 'fs';
import { Context, Next } from 'koa';
import {
  getCustomerSubscriptionByIdTemplate,
  updateCustomerSubscription,
  updateSubscriptionPaymentMethod,
} from '../controllers/proxy';

const router = new Router();
dotenv.config();

const validateSignature = (ctx: Context, next: Next) => {
  const query = ctx.request.query;
  const parameters: string[] = [];
  for (let key in query) {
    if (key != 'signature') {
      parameters.push(key + '=' + query[key]);
    }
  }
  const message = parameters.sort().join('');
  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex');
  console.log('DIGEST === QUERY.SIGNATURE', digest === query.signature);
  if (digest === query.signature) {
    console.log('SHOPIFY APP PROXY REQEST VERIFIED');
    return next();
  } else {
    return (ctx.status = 403);
  }
};

const readFileThunk = src => {
  return new Promise((resolve, reject) => {
    fs.readFile(src, { encoding: 'utf8' }, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

// App Proxy routes

router.get(
  '/app_proxy/',
  validateSignature,
  getCustomerSubscriptionByIdTemplate
);

router.post(
  '/app_proxy/subscription/edit',
  validateSignature,
  updateCustomerSubscription
);

router.post(
  '/app_proxy/subscription/payment',
  validateSignature,
  updateSubscriptionPaymentMethod
);

export default router;
