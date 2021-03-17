import 'isomorphic-fetch';
import { gql } from 'apollo-boost';
import { Context } from 'koa';

interface SellingPlanGroup {
  id: string;
  appId: string;
  description: string;
  options: string[];
  name: string;
  merchantCode: string;
  summary: string;
  sellingPlans: {
    edges: [SellingPlan];
  };
}

interface SellingPlan {
  node: {
    id: string;
    name: string;
    options: string[];
    position: number;
    billingPolicy: {
      interval: string;
      intervalCount: number;
    };
    deliveryPolicty: {
      interval: string;
      intervalCount: number;
    };
    pricingPolicies: [
      {
        adjustmentType: string;
        adjustmentValue: {
          percentage: number;
        };
      }
    ];
  };
}

interface FilteredPlan {
  id: string;
  name: string;
  options: string[];
  position: string | number;
}

export function SELLING_PLAN_GET() {
  return gql`
    query sellingPlanGroup($id: ID!) {
      sellingPlanGroup(id: $id) {
        id
        appId
        description
        options
        name
        merchantCode
        summary
        sellingPlans(first: 5) {
          edges {
            node {
              id
              name
              options
              position
              billingPolicy {
                ... on SellingPlanRecurringBillingPolicy {
                  interval
                  intervalCount
                }
              }
              deliveryPolicy {
                ... on SellingPlanRecurringDeliveryPolicy {
                  interval
                  intervalCount
                }
              }
              pricingPolicies {
                ... on SellingPlanFixedPricingPolicy {
                  adjustmentType
                  adjustmentValue {
                    ... on SellingPlanPricingPolicyPercentageValue {
                      percentage
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

const buildResponse = (data: SellingPlanGroup) => {
  const sellingPlans = data.sellingPlans.edges;
  const plans: FilteredPlan[] = [];
  sellingPlans.forEach(plan => {
    let planData: FilteredPlan = {
      id: plan.node.id,
      name: plan.node.name,
      options: plan.node.options,
      position: plan.node.position,
    };
    plans.push(planData);
  });
  const response = {
    description: data.description,
    id: data.id,
    name: data.name,
    merchantCode: data.merchantCode,
    options: data.options,
    percentageOff:
      data.sellingPlans.edges[0].node.pricingPolicies[0].adjustmentValue
        .percentage,
    sellingPlans: plans,
  };
  return response;
};

export const getSellingPlanById = async (ctx: Context) => {
  const { client } = ctx;
  const body = JSON.parse(ctx.request.body);
  const { sellingPlanGroupId } = body;
  const sellingPlanGroup = await client
    .query({
      query: SELLING_PLAN_GET(),
      variables: {
        id: sellingPlanGroupId,
      },
    })
    .then((response: { data: any }) => {
      console.log('============= RESPONSE ====================');
      console.log(response);
      const filtered = buildResponse(response.data.sellingPlanGroup);
      return filtered;
    });

  return sellingPlanGroup;
};
