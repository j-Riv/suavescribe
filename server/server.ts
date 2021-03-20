import '@babel/polyfill';
import dotenv from 'dotenv';
import 'isomorphic-fetch';
import createShopifyAuth, { verifyRequest } from '@shopify/koa-shopify-auth';
import Shopify, { ApiVersion } from '@shopify/shopify-api';
import Koa from 'koa';
import next from 'next';
import Router from 'koa-router';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
// import session from 'koa-session';
import subscriptionRouter from './routes/subscriptions';
import RedisStore from './redis-store';

dotenv.config();
const sessionStorage = new RedisStore();
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
const ACTIVE_SHOPIFY_SHOPS = {};
ACTIVE_SHOPIFY_SHOPS[process.env.SHOP] = {
  scope: process.env.SCOPES,
  accessToken: process.env.ACCESS_TOKEN,
};

app.prepare().then(async () => {
  const server = new Koa();

  // Add cors & bodyparser
  server.use(cors());
  // server.use(bodyParser());
  server.use(async (ctx, next) => {
    if (ctx.path === '/graphql') ctx.disableBodyParser = true;
    await next();
  });
  server.use(bodyParser({ enableTypes: ['json', 'text'] }));
  // server.use(session({ secure: true, sameSite: 'none' }, server));
  server.use((ctx, next) => {
    ctx.state.ACTIVE_SHOPIFY_SHOPS = ACTIVE_SHOPIFY_SHOPS;
    return next();
  });

  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        ACTIVE_SHOPIFY_SHOPS[shop] = { scope, accessToken };

        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: '/webhooks',
          topic: 'APP_UNINSTALLED',
          webhookHandler: async (topic, shop, body) => {
            delete ACTIVE_SHOPIFY_SHOPS[shop];
          },
        });

        if (!response.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          );
        }

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}`);
      },
    })
  );

  // GraphQL proxy
  router.post('/graphql', verifyRequest(), async (ctx, next) => {
    await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
  });

  const handleRequest = async ctx => {
    await handle(ctx.req, ctx.res);
    // console.log('SESSION STORAGE ======>');
    // console.log(Shopify.Context.SESSION_STORAGE);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.get('/', async ctx => {
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

  router.post('/webhooks', async ctx => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.get('(/_next/static/.*)', handleRequest); // Static content is clear
  router.get('/_next/webpack-hmr', handleRequest); // Webpack content is clear
  // router.get('(.*)', verifyRequest(), handleRequest); // Everything else must have sessions
  // removed verifyRequest because it was causing Admin link -> App to completely reload. Will need to fis this.
  router.get('(.*)', handleRequest);
  // Subscriptions
  server.use(subscriptionRouter.routes());
  server.use(subscriptionRouter.allowedMethods());

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
