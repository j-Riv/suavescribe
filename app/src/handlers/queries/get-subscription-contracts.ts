import { gql } from '@apollo/client';

export const GET_SUBSCRIPTION_CONTRACTS = gql`
  query subscriptionContracts($first: Int!, $after: String) {
    subscriptionContracts(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          id
          createdAt
          status
          nextBillingDate
          appAdminUrl
          customer {
            id
            firstName
            lastName
            email
          }
          lines(first: 10) {
            edges {
              node {
                id
                productId
                pricingPolicy {
                  cycleDiscounts {
                    adjustmentType
                    adjustmentValue {
                      __typename
                    }
                    computedPrice {
                      amount
                    }
                  }
                  basePrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          billingPolicy {
            interval
            intervalCount
          }
          billingPolicy {
            interval
            intervalCount
          }
        }
      }
    }
  }
`;
