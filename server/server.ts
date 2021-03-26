import '@babel/polyfill';
import dotenv from 'dotenv';
import 'isomorphic-fetch';
import createShopifyAuth, { verifyRequest } from '@shopify/koa-shopify-auth';
import Shopify, { ApiVersion } from '@shopify/shopify-api';
import Koa, { Context, Next } from 'koa';
import next from 'next';
import Router from 'koa-router';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import subscriptionRouter from './routes/subscriptions';
import RedisStore from './redis-store';
import PgStore from './pg-store';
import { scheduler } from './scheduler';

dotenv.config();
const sessionStorage = new RedisStore();
const pgStorage = new PgStore();
const port = parseInt(process.env.PORT as string, 10) || 8081;
const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev,
});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY!,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET!,
  SCOPES: process.env.SCOPES!!.split(','),
  HOST_NAME: process.env.HOST!.replace(/https:\/\//, ''),
  API_VERSION: ApiVersion.January21,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  // SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
  SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
    sessionStorage.storeCallback,
    sessionStorage.loadCallback,
    sessionStorage.deleteCallback
  ),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
// const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  const ACTIVE_SHOPIFY_SHOPS = await pgStorage.loadActiveShops();
  console.log(
    '++++++++++++++ ACTIVE_SHOPIFY_SHOPS ++++++++++++++',
    ACTIVE_SHOPIFY_SHOPS
  );
  // scheduler
  // scheduler();

  const server = new Koa();
  // Add cors & bodyparser
  server.use(cors());
  server.use(async (ctx, next) => {
    if (ctx.path === '/graphql' || ctx.path === '/webhooks')
      ctx.disableBodyParser = true;
    await next();
  });
  server.use(bodyParser({ enableTypes: ['json', 'text'] }));

  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      // accessMode: 'offline',
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        ACTIVE_SHOPIFY_SHOPS[shop] = { shop, scope, accessToken };
        // save active shop
        pgStorage.storeActiveShop({ shop, scope, accessToken });

        const registerUninstallWebhook = await Shopify.Webhooks.Registry.register(
          {
            shop,
            accessToken,
            path: '/webhooks',
            topic: 'APP_UNINSTALLED',
            webhookHandler: async (_topic, shop, _body) => {
              console.log('App uninstalled');
              delete ACTIVE_SHOPIFY_SHOPS[shop];
              pgStorage.deleteActiveShop(shop);
            },
          }
        );

        if (!registerUninstallWebhook.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${registerUninstallWebhook.result}`
          );
        }
        // Register Create Contract Webhook
        const registerCreateSubscription = await Shopify.Webhooks.Registry.register(
          {
            shop,
            accessToken,
            path: '/webhooks',
            topic: 'SUBSCRIPTION_CONTRACTS_CREATE',
            webhookHandler: async (_topic, shop, body) => {
              console.log('SUBSCRIPTION_CONTRACTS_CREATE');
              const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
              pgStorage.createContract(shop, token, body);
            },
          }
        );

        if (!registerCreateSubscription.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${registerCreateSubscription.result}`
          );
        }
        // Register Update Contract Webhook
        const registerUpdateSubscription = await Shopify.Webhooks.Registry.register(
          {
            shop,
            accessToken,
            path: '/webhooks',
            topic: 'SUBSCRIPTION_CONTRACTS_UPDATE',
            webhookHandler: async (_topic, shop, body) => {
              console.log('SUBSCRIPTION_CONTRACTS_UPDATE');
              const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
              pgStorage.updateContract(shop, token, body);
            },
          }
        );

        if (!registerUpdateSubscription.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${registerUpdateSubscription.result}`
          );
        }
        // Billing Attempt Success Webhook
        const registerBillingAttemptSuccess = await Shopify.Webhooks.Registry.register(
          {
            shop,
            accessToken,
            path: '/webhooks',
            topic: 'SUBSCRIPTION_BILLING_ATTEMPTS_SUCCESS',
            webhookHandler: async (_topic, shop, body) => {
              console.log('SUBSCRIPTION_BILLING_ATTEMPTS_SUCCESS');
              const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
              pgStorage.updateNextBillingDate(shop, token, body);
            },
          }
        );

        if (!registerBillingAttemptSuccess.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${registerBillingAttemptSuccess.result}`
          );
        }
        // Billing Attempt Success Webhook
        const registerBillingAttemptFailure = await Shopify.Webhooks.Registry.register(
          {
            shop,
            accessToken,
            path: '/webhooks',
            topic: 'SUBSCRIPTION_BILLING_ATTEMPTS_FAILURE',
            webhookHandler: async (_topic, shop, body) => {
              console.log('SUBSCRIPTION_BILLING_ATTEMPTS_FAILURE');
              const token = ACTIVE_SHOPIFY_SHOPS[shop].accessToken;
              // Will more than likely create  an errors table to display error notifications to user.
              console.log('body', JSON.stringify(body));
            },
          }
        );

        if (!registerBillingAttemptFailure.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${registerBillingAttemptFailure.result}`
          );
        }

        // Start scheduler for testing this will be triggered by node-scheduler
        scheduler();

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}`);
      },
    })
  );

  // GraphQL proxy
  router.post('/graphql', verifyRequest(), async (ctx: Context, next: Next) => {
    await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
  });

  const handleRequest = async (ctx: Context) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.get('/', async (ctx: Context) => {
    const shop = ctx.query.shop;
    console.log('SHOP ====>', shop);
    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop as string] === undefined) {
      console.log('STORE DOESNT EXIST LETS AUTHENTICATE');
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      console.log('STORE EXISTS ===== MOVE ON');
      await handleRequest(ctx);
    }
  });

  router.post('/webhooks', async (ctx: Context) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  // App Extension
  server.use(subscriptionRouter.routes());
  server.use(subscriptionRouter.allowedMethods());

  router.get('(/_next/static/.*)', handleRequest); // Static content is clear
  router.get('/_next/webpack-hmr', handleRequest); // Webpack content is clear
  // router.get('(.*)', verifyRequest(), handleRequest);
  router.get('(.*)', handleRequest);

  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
