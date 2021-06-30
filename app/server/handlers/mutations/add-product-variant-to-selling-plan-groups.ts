import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

export function SELLING_PLAN_ADD_PRODUCT_VARIANT() {
  return gql`
    mutation productVariantJoinSellingPlanGroups(
      $id: ID!
      $sellingPlanGroupIds: [ID!]!
    ) {
      productVariantJoinSellingPlanGroups(
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

export const addProductVariantToSellingPlanGroups = async (ctx: Context) => {
  const { client } = ctx;
  const body = ctx.request.body as {
    variantId: string;
    selectedPlans: string[];
  };
  const { variantId, selectedPlans } = body;
  const variables = {
    id: variantId,
    sellingPlanGroupIds: selectedPlans,
  };
  const productVariant = await client
    .mutate({
      mutation: SELLING_PLAN_ADD_PRODUCT_VARIANT(),
      variables: variables,
    })
    .then(
      (response: {
        data: {
          productVariantJoinSellingPlanGroups: {
            productVariant: {
              id: string;
            };
          };
        };
      }) => {
        return response.data;
      }
    );

  return productVariant;
};
