import { gql } from '@apollo/client';

export const UPDATE_SELLING_PLAN_GROUP = gql`
  mutation sellingPlanGroupUpdate($id: ID!, $input: SellingPlanGroupInput!) {
    sellingPlanGroupUpdate(id: $id, input: $input) {
      deletedSellingPlanIds
      sellingPlanGroup {
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
