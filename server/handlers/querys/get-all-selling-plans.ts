import 'isomorphic-fetch';
import { gql } from 'apollo-boost';
import { Context } from 'koa';

export function SELLING_PLAN_GET() {
  return gql`
    query {
      sellingPlanGroups(first: 5) {
        edges {
          node {
            id
            appId
            description
            options
            name
            sellingPlans(first: 5) {
              edges {
                node {
                  id
                  name
                  options
                }
              }
            }
          }
        }
      }
    }
  `;
}

export const getSellingPlans = async (ctx: Context) => {
  const { client } = ctx;
  const sellingPlanGroups = await client
    .query({
      query: SELLING_PLAN_GET(),
    })
    .then((response: { data: any }) => {
      return response.data.sellingPlanGroups.edges;
    });

  return sellingPlanGroups;
};
