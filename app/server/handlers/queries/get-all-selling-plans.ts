import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

export function SELLING_PLAN_GET() {
  return gql`
    query {
      sellingPlanGroups(first: 20) {
        edges {
          node {
            id
            appId
            description
            options
            name
            sellingPlans(first: 20) {
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
    .then(
      (response: {
        data: {
          sellingPlanGroups: {
            edges: [
              {
                node: {
                  id: string;
                  appId: string;
                  description: string;
                  options: string;
                  name: string;
                  sellingPlans: {
                    edges: [
                      {
                        node: {
                          id: string;
                          name: string;
                          options: string;
                        };
                      }
                    ];
                  };
                };
              }
            ];
          };
        };
      }) => {
        return response.data.sellingPlanGroups.edges;
      }
    );

  return sellingPlanGroups;
};
