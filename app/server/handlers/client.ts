import { ApolloClient, InMemoryCache } from '@apollo/client';

export const createClient = (shop: string, accessToken: string) => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    uri: `https://${shop}/admin/api/2021-01/graphql.json`,
    name: `shopify-app-node ${process.env.npm_package_version} | Shopify App CLI`,
    version: `0.1`,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'User-Agent': `shopify-app-node ${process.env.npm_package_version} | Shopify App CLI`,
    },
  });
};

// export const createClient = (shop, accessToken) => {
//   return new ApolloClient({
//     uri: `https://${shop}/admin/api/2021-01/graphql.json`,
//     request: operation => {
//       operation.setContext({
//         headers: {
//           'X-Shopify-Access-Token': accessToken,
//           'User-Agent': `shopify-app-node ${process.env.npm_package_version} | Shopify App CLI`,
//         },
//       });
//     },
//   });
// };
