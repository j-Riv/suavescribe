import { ApolloClient, InMemoryCache } from '@apollo/client';

export const createClient = (shop: string, accessToken: string) => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    uri: `https://${shop}/admin/api/2021-07/graphql.json`,
    name: `shopify-app-node ${process.env.npm_package_version} | Shopify App CLI`,
    version: `0.1`,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'User-Agent': `shopify-app-node ${process.env.npm_package_version} | Shopify App CLI`,
    },
  });
};
