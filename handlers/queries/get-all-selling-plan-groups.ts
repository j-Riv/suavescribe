import { gql } from '@apollo/client';

export const GET_ALL_SELLING_PLANS = gql`
  query {
    sellingPlanGroups(first: 5) {
      edges {
        node {
          id
          appId
          description
          options
          name
          summary
          sellingPlans(first: 5) {
            edges {
              node {
                id
                name
                options
              }
            }
          }
        }
      }
    }
  }
`;
