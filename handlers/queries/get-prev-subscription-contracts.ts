import { gql } from '@apollo/client';

export const GET_PREV_SUBSCRIPTION_CONTRACTS = gql`
  query prevSubscriptionContracts($last: Int, $before: String) {
    subscriptionContracts(last: $last, before: $before) {
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
