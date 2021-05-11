import { gql } from '@apollo/client';

export const GET_CUSTOMER_SUBSCRIPTION_CONTRACTS_BY_EMAIL = gql`
  query customers($first: Int!, $query: String!) {
    customers(first: 1, query: $query) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          verifiedEmail
          firstName
          lastName
          subscriptionContracts(first: $first) {
            edges {
              cursor
              node {
                id
                status
                nextBillingDate
                customer {
                  id
                  email
                }
              }
            }
          }
        }
      }
    }
  }
`;
