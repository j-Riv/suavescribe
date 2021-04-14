import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

export function SELLING_PLAN_REMOVE_PRODUCT_VARIANTS() {
  return gql`
    mutation sellingPlanGroupRemoveProductVariants(
      $id: ID!
      $productVariantIds: [ID!]!
    ) {
      sellingPlanGroupRemoveProductVariants(
        id: $id
        productVariantIds: $productVariantIds
      ) {
        userErrors {
          field
          message
        }
        removedProductVariantIds
      }
    }
  `;
}

export const removeProductVariantsFromSellingPlanGroup = async (
  ctx: Context
) => {
  const { client } = ctx;
  const body = JSON.parse(ctx.request.body);
  const { sellingPlanGroupId, variantIds } = body;
  const variables = {
    id: sellingPlanGroupId,
    variantIds: variantIds,
  };
  const productVariants = await client
    .mutate({
      mutation: SELLING_PLAN_REMOVE_PRODUCT_VARIANTS(),
      variables: variables,
    })
    .then(
      (response: {
        data: {
          sellingPlanGroupRemoveProductVariants: {
            removedProductVariantIds: string[];
          };
        };
      }) => {
        return response.data.sellingPlanGroupRemoveProductVariants
          .removedProductVariantIds;
      }
    );

  return productVariants;
};
