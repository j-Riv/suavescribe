import 'isomorphic-fetch';
import DefaultClient, { gql } from 'apollo-boost';
import { stringify } from 'node:querystring';

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
      }
    }
  `;
}

export const getSubscriptionContract = async (
  client: DefaultClient<unknown>,
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
            // lineCount: number;
            // lines: {
            //   edges: [
            //     {
            //       node: {
            //         id: string;
            //         productId: string;
            //         title: string;
            //         variantTitle: string;
            //         quantity: number;
            //         requiresShipping: boolean;
            //         variantImage: {
            //           originalSrc: string;
            //           altText: string;
            //         };
            //         pricingPolicy: {
            //           cycleDiscounts: {
            //             adjustmentType: string;
            //             adjustmentValue: {
            //               __typename: string;
            //             };
            //             computedPrice: {
            //               amount: string;
            //             };
            //           };
            //           basePrice: {
            //             amount: string;
            //             currencyCode: string;
            //           };
            //         };
            //       };
            //     }
            //   ];
            // };
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
          };
        };
      }) => {
        return response.data.subscriptionContract;
      }
    );

  return subscriptionContract;
};
