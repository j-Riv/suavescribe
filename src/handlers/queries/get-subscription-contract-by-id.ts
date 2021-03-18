import { gql } from '@apollo/client';

export const GET_SUBSCRIPTION_BY_ID = gql`
  query subscriptionContract($id: ID!) {
    subscriptionContract(id: $id) {
      id
      status
      nextBillingDate
      customer {
        id
        firstName
        lastName
        email
      }
      customerPaymentMethod {
        id
      }
      deliveryPrice {
        currencyCode
        amount
      }
      lineCount
      lines(first: 10) {
        edges {
          node {
            id
            productId
            title
            variantTitle
            quantity
            requiresShipping
            variantImage {
              originalSrc
              altText
            }
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
      originOrder {
        legacyResourceId
      }
      status
      lastPaymentStatus
      customerPaymentMethod {
        id
      }
      deliveryPolicy {
        interval
        intervalCount
      }
    }
  }
`;
