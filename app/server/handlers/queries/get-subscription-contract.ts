import 'isomorphic-fetch';
import { gql, ApolloClient } from '@apollo/client';
import { SubscriptionContract } from '../../types/subscriptions';

export function SUBSCRIPTION_CONTRACT_GET() {
  return gql`
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
        # lineCount
        lines(first: 10) {
          edges {
            node {
              id
              productId
              variantId
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
        lastPaymentStatus
        customerPaymentMethod {
          id
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
}

export const getSubscriptionContract = async (
  client: ApolloClient<unknown>,
  id: string
) => {
  const subscriptionContract = await client
    .query({
      query: SUBSCRIPTION_CONTRACT_GET(),
      variables: {
        id: id,
      },
    })
    .then(
      (response: {
        data: {
          subscriptionContract: SubscriptionContract;
        };
      }) => {
        return response.data.subscriptionContract;
      }
    );

  return subscriptionContract;
};
