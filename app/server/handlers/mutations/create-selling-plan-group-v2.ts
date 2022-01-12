import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

interface Body {
  planGroupName: string;
  merchantCode: string;
  numberOfPlans: string;
  planGroupOption: string;
  planGroupDescription: string;
  sellingPlans: any;
}

export function SELLING_PLAN_CREATE() {
  return gql`
    mutation sellingPlanGroupCreate($input: SellingPlanGroupInput!) {
      sellingPlanGroupCreate(input: $input) {
        sellingPlanGroup {
          id
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;
}

const cleanInterval = (interval: string) => {
  interval = interval.toLowerCase();
  const cap = interval.substr(0, 1);
  return `${cap.toUpperCase()}${interval.substr(1)}`;
};

const createInput = (body: Body) => {
  const {
    planGroupName,
    merchantCode,
    numberOfPlans,
    planGroupOption,
    planGroupDescription,
    sellingPlans,
  } = body;

  // Set number of plans
  let plans: any[] = [];
  const planCount = parseInt(numberOfPlans);
  if (planCount > 1) {
    for (let i = 1; i <= planCount; i++) {
      const currentPlan = sellingPlans[i.toString()];
      // Set interval for naming
      const intervalTitle = cleanInterval(currentPlan.intervalOption);
      // savings
      let savingsDescription: string = '';
      let savingsName: string = '';
      if (parseInt(currentPlan.percentageOff) > 0) {
        savingsDescription = `, save ${currentPlan.percentageOff}% on every order`;
        savingsName = ` (Save ${currentPlan.percentageOff}%)`;
      }
      let planOption: string = `Delivered every `;
      if (parseInt(currentPlan.intervalCount) > 1) {
        planOption = `${planOption}${currentPlan.intervalCount} `;
      }
      planOption = `${planOption}${intervalTitle}`;
      if (parseInt(currentPlan.intervalCount) > 1) {
        planOption = `${planOption}s`;
      }
      // plan option
      if (parseInt(currentPlan.percentageOff) > 0) {
        planOption = `${planOption}${savingsName}`;
      }

      let sellingPlan = {
        name: planOption,
        description: `${planOption}${savingsDescription}. Auto renews, skip, cancel anytime.`,
        options: planOption,
        position: currentPlan.id,
        billingPolicy: {
          recurring: {
            interval: currentPlan.intervalOption,
            intervalCount: parseInt(currentPlan.intervalCount),
          },
        },
        deliveryPolicy: {
          recurring: {
            interval: currentPlan.intervalOption,
            intervalCount: parseInt(currentPlan.intervalCount),
          },
        },
        pricingPolicies: [
          {
            fixed: {
              adjustmentType: 'PERCENTAGE',
              adjustmentValue: {
                percentage: parseInt(currentPlan.percentageOff),
              },
            },
          },
        ],
      };
      console.log('SELLING PLAN', sellingPlan);
      plans.push(sellingPlan);
    }
  }

  const variables = {
    input: {
      appId: '4975729',
      name: planGroupName,
      merchantCode: merchantCode, // 'subscribe-and-save'
      description: planGroupDescription,
      options: [planGroupOption], // 'Delivery every'
      position: 1,
      sellingPlansToCreate: plans,
    },
  };
  return variables;
};

export const createSellingPlanGroupV2 = async (ctx: Context) => {
  const { client } = ctx;
  const body = ctx.request.body as any;
  // create input
  const variables = createInput(body);
  console.log('VARIABLES', variables);
  const sellingPlanGroupId = await client
    .mutate({
      mutation: SELLING_PLAN_CREATE(),
      variables: variables,
    })
    .then(
      (response: {
        data: {
          sellingPlanGroupCreate: {
            sellingPlanGroup: {
              id: string;
            };
            userErrors?: any;
          };
        };
      }) => {
        const errors = response.data.sellingPlanGroupCreate.userErrors[0];
        if (errors) {
          console.log(
            'ERRORS',
            response.data.sellingPlanGroupCreate.userErrors[0]
          );
        }
        return response.data.sellingPlanGroupCreate.sellingPlanGroup.id;
      }
    );

  return sellingPlanGroupId;
};
