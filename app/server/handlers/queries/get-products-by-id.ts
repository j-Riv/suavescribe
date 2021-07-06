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
  const products = await client
    .query({
      query: PRODUCTS_BY_ID_GET(),
      variables: {
        ids: ids,
      },
    })
    .then((response: { data: any }) => {
      return response.data.nodes;
    });
  return products;
};
