import 'isomorphic-fetch';
import { gql } from 'apollo-boost';
import { Context } from 'koa';

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
          }
        }
      }
    }
  `;
}

export const getSubscriptionContracts = async client => {
  const subscriptionContracts = await client
    .query({
      query: SUBSCRIPTION_CONTRACTS_GET(),
    })
    .then((response: { data: any }) => {
      return response.data.sellingPlanGroups.edges;
    });

  return subscriptionContracts;
};
