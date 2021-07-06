import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

export function CUSTOMER_SUBSCRIPTIONS_CONTRACTS_BY_ID_GET() {
  return gql`
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
                  customerPaymentMethod {
                    id
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
                        phone
                      }
                    }
                  }
                  customerPaymentMethod {
                    id
                  }
                  lines(first: 5) {
                    edges {
                      node {
                        id
                        productId
                        variantId
                        quantity
                        title
                        variantTitle
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
}

export const getCustomerSubscriptionContractsById = async (
  ctx: Context,
  customerId: string
) => {
  const { client } = ctx;
  const subscriptionContracts = await client
    .query({
      query: CUSTOMER_SUBSCRIPTIONS_CONTRACTS_BY_ID_GET(),
      variables: {
        first: 20,
        query: `id:${customerId}`,
      },
    })
    .then((response: { data: any }) => {
      return response.data.customers.edges.length > 0
        ? response.data.customers.edges[0].node.subscriptionContracts.edges
        : response.data.customers.edges;
    });
  return subscriptionContracts;
};
