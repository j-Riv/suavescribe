import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

export function PRODUCTS_BY_ID_GET() {
  return gql`
    query products($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          variants(first: 5) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    }
  `;
}

export const getProductsById = async (ctx: Context, ids: string[]) => {
  const { client } = ctx;
  console.log('LOOKING FOR ALL PRODUCTS MATCHING THESE IDS', ids);
  const products = await client
    .query({
      query: PRODUCTS_BY_ID_GET(),
      variables: {
        ids: ids,
      },
    })
    .then((response: { data: any }) => {
      console.log('PRODUCTS BY ID', response.data.nodes);
      return response.data.nodes;
    });
  return products;
};
