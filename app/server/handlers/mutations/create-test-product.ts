import 'isomorphic-fetch';
import { gql } from '@apollo/client';
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
    .then(
      (response: {
        data: {
          productCreate: {
            product: {
              id: string;
              title: string;
              productType: string;
            };
          };
        };
      }) => {
        return response.data;
      }
    );

  return testProduct;
};
