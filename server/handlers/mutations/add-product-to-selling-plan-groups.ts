import 'isomorphic-fetch';
import { gql } from 'apollo-boost';
import { Context } from 'koa';

export function SELLING_PLAN_ADD_PRODUCT() {
  return gql`
    mutation productJoinSellingPlanGroups(
      $id: ID!
      $sellingPlanGroupIds: [ID!]!
    ) {
      productJoinSellingPlanGroups(
        id: $id
        sellingPlanGroupIds: $sellingPlanGroupIds
      ) {
        product {
          id
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;
}

export const addProductToSellingPlanGroups = async (ctx: Context) => {
  const { client } = ctx;
  const body = JSON.parse(ctx.request.body);
  const { productId, selectedPlans } = body;
  const variables = {
    id: productId,
    sellingPlanGroupIds: selectedPlans,
  };
  const product = await client
    .mutate({
      mutation: SELLING_PLAN_ADD_PRODUCT(),
      variables: variables,
    })
    .then((response: { data: any }) => {
      return response.data;
    });

  return product;
};
