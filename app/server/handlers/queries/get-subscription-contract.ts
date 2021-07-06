import 'isomorphic-fetch';
import { gql, ApolloClient } from '@apollo/client';

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
        # lines(first: 10) {
        #   edges {
        #     node {
        #       id
        #       productId
        #       title
        #       variantTitle
        #       quantity
        #       requiresShipping
        #       variantImage {
        #         originalSrc
        #         altText
        #       }
        #       pricingPolicy {
        #         cycleDiscounts {
        #           adjustmentType
        #           adjustmentValue {
        #             __typename
        #           }
        #           computedPrice {
        #             amount
        #           }
        #         }
        #         basePrice {
        #           amount
        #           currencyCode
        #         }
        #       }
        #     }
        #   }
        # }
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
          subscriptionContract: {
            id: string;
            status: string;
            nextBillingDate: string;
            customer: {
              id: string;
              firstName: string;
              lastName: string;
              email: string;
            };
            deliveryPrice: {
              currencyCode: string;
              amount: string;
            };
            originOrder: {
              legacyResourceId: string;
            };
            lastPaymentStatus: string;
            customerPaymentMethod: {
              id: string;
            };
            deliveryPolicy: {
              interval: string;
              intervalCount: number;
            };
            billingPolicy: {
              interval: string;
              intervalCount: number;
            };
            deliveryMethod: {
              address: {
                address1: string;
                address2: string;
                city: string;
                country: string;
                province: string;
                zip: string;
                name: string;
                company: string;
                firstName: string;
                lastName: string;
              };
            };
          };
        };
      }) => {
        return response.data.subscriptionContract;
      }
    );

  return subscriptionContract;
};
