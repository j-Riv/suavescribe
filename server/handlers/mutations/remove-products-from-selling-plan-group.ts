import 'isomorphic-fetch';
import { gql } from 'apollo-boost';
import { Context } from 'koa';

export function SELLING_PLAN_REMOVE_PRODUCT() {
  return gql`
    mutation sellingPlanGroupRemoveProducts($id: ID!, $productIds: [ID!]!) {
      sellingPlanGroupRemoveProducts(id: $id, productIds: $productIds) {
        userErrors {
          field
          message
        }
        removedProductIds
      }
    }
  `;
}

export const removeProductsFromSellingPlanGroup = async (ctx: Context) => {
  const { client } = ctx;
  const body = JSON.parse(ctx.request.body);
  const { sellingPlanGroupId, productId } = body;
  const variables = {
    id: sellingPlanGroupId,
    productIds: [productId],
  };
  const products = await client
    .mutate({
      mutation: SELLING_PLAN_REMOVE_PRODUCT(),
      variables: variables,
    })
    .then((response: { data: any }) => {
      return response.data.sellingPlanGroupRemoveProducts.removedProductIds;
    });

  return products;
};
