import 'isomorphic-fetch';
import { gql, ApolloClient } from '@apollo/client';

export function SUBSCRIPTION_CONTRACTS_GET() {
  return gql`
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
      }
    }
  `;
}

export const getSubscriptionContracts = async (
  client: ApolloClient<unknown>,
  variables: any
) => {
  const subscriptionContracts = await client
    .query({
      query: SUBSCRIPTION_CONTRACTS_GET(),
      variables: variables,
    })
    .then(
      (response: {
        data: {
          subscriptionContracts: {
            pageInfo: {
              hasNextPage: boolean;
              hasPreviousPage: boolean;
            };
            edges: any[];
          };
        };
      }) => {
        return response.data.subscriptionContracts;
      }
    );

  return subscriptionContracts;
};
