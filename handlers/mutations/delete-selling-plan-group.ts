import { gql } from '@apollo/client';

export const DELETE_SELLING_PLAN_GROUP = gql`
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
