import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

export function SELLING_PLAN_REMOVE_PRODUCT_VARIANT() {
  return gql`
    mutation productVariantLeaveSellingPlanGroups(
      $id: ID!
      $sellingPlanGroupIds: [ID!]!
    ) {
      productVariantLeaveSellingPlanGroups(
        id: $id
        sellingPlanGroupIds: $sellingPlanGroupIds
      ) {
        productVariant {
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

export const removeProductVariantFromSellingPlanGroups = async (
  ctx: Context
) => {
  const { client } = ctx;
  const body = ctx.request.body as {
    variantId: string;
    sellingPlanGroupId: string;
  };
  const { variantId, sellingPlanGroupId } = body;
  const variables = {
    id: variantId,
    sellingPlanGroupIds: [sellingPlanGroupId],
  };
  console.log('VARIABLES', variables);
  const productVariant = await client
    .mutate({
      mutation: SELLING_PLAN_REMOVE_PRODUCT_VARIANT(),
      variables: variables,
    })
    .then((response: { data: any }) => {
      // response.data.productVariantLeaveSellingPlanGroups.productVariant.id;
      console.log('response', response.data);
      return response.data;
    });

  return productVariant;
};
