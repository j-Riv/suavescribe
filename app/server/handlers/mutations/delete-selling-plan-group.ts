import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

export function SELLING_PLAN_GROUP_DELETE() {
  return gql`
    mutation sellingPlanGroupDelete($id: ID!) {
      sellingPlanGroupDelete(id: $id) {
        deletedSellingPlanGroupId
        userErrors {
          code
          field
          message
        }
      }
    }
  `;
}

export const deleteSellingPlanGroup = async (ctx: Context) => {
  const { client } = ctx;
  const body = ctx.request.body as {
    sellingPlanGroupId: string;
  };
  const { sellingPlanGroupId } = body;
  const variables = {
    id: sellingPlanGroupId,
  };
  const deletedSellingPlanGroupId = await client
    .mutate({
      mutation: SELLING_PLAN_GROUP_DELETE(),
      variables: variables,
    })
    .then(
      (response: {
        data: {
          sellingPlanGroupDelete: {
            deletedSellingPlanGroupId: string;
          };
        };
      }) => {
        return response.data.sellingPlanGroupDelete.deletedSellingPlanGroupId;
      }
    );

  return deletedSellingPlanGroupId;
};
