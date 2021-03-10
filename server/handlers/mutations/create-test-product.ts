import 'isomorphic-fetch';
import { gql } from 'apollo-boost';
import { Context } from 'koa';

export function TEST_PRODUCT_CREATE() {
  return gql`
    mutation exampleProductCreate($input: ProductInput!) {
      productCreate(input: $input) {
        userErrors {
          field
          message
        }
        product {
          id
          title
          productType
        }
      }
    }
  `;
}

export const createTestProduct = async (ctx: Context) => {
  const { client } = ctx;
  const testProduct = await client
    .mutate({
      mutation: TEST_PRODUCT_CREATE(),
      variables: {
        input: { title: 'test product', productType: 'test type' },
      },
    })
    .then((response: { data: any }) => {
      return response.data;
    });

  return testProduct;
};
