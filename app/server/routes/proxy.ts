import dotenv from 'dotenv';
import Router from 'koa-router';
import crypto from 'crypto';
import fs from 'fs';
import { Context, Next } from 'koa';
import {
  applicationProxy,
  updateCustomerSubscription,
  updateSubscriptionPaymentMethod,
  generateCustomerAuth,
  getCustomerSubscriptions,
  liquidApplicationProxy,
  updateSubscriptionShippingAddress,
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

// App Proxy routes

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

router.post(
  '/app_proxy/subscription/address',
  validateSignature,
  updateSubscriptionShippingAddress
);

// send react app as liquid
router.get('/app_proxy', validateSignature, liquidApplicationProxy);
// router.get('/app_proxy/', validateSignature, applicationProxy);

router.get('/app_proxy/static/css/:file', (ctx: Context) => {
  ctx.set('Content-Type', 'text/css');
  ctx.body = fs.createReadStream(
    `${process.env.APP_PROXY}/build/static/css/${ctx.params.file}`
  );
});

router.get('/app_proxy/static/js/:file', (ctx: Context) => {
  ctx.set('Content-Type', 'text/javascript');
  ctx.body = fs.createReadStream(
    `${process.env.APP_PROXY}/build/static/js/${ctx.params.file}`
  );
});

router.post(
  '/app_proxy/subscriptions',
  validateSignature,
  getCustomerSubscriptions
);

router.post('/app_proxy/auth', validateSignature, generateCustomerAuth);

export default router;
