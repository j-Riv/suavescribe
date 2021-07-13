import { gql } from '@apollo/client';

export const GET_SUBSCRIPTION_BY_ID = gql`
  query subscriptionContract($id: ID!) {
    subscriptionContract(id: $id) {
      id
      status
      createdAt
      nextBillingDate
      lastPaymentStatus
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
      deliveryPolicy {
        interval
        intervalCount
      }
      billingPolicy {
        interval
        intervalCount
      }
      deliveryMethod {
        ... on SubscriptionDeliveryMethodShipping {
          address {
            address1
            address2
            city
            country
            province
            zip
            name
            company
            firstName
            lastName
          }
        }
      }
    }
  }
`;
