import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

interface Body {
  planTitle: string;
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
    planTitle,
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
      const currentPlan = sellingPlans[i];
      // Set interval for naming
      const intervalTitle = cleanInterval(currentPlan.intervalOption);
      // savings
      let savingsDescription: string = '';
      let savingsName: string = '';
      if (parseInt(currentPlan.percentageOff) > 0) {
        savingsDescription = `, save ${currentPlan.percentageOff}% on every order`;
        savingsName = ` (Save ${currentPlan.percentageOff}%)`;
      }
      let deliveryOption: string = `Delivered every `;
      if (currentPlan.intervalCount > 1) {
        deliveryOption = `${deliveryOption}${currentPlan.intervalCount} `;
      }
      deliveryOption = `${deliveryOption}${intervalTitle}`;
      if (currentPlan.intervalCount > 1) {
        deliveryOption = `${deliveryOption}s`;
      }

      const planName = `${deliveryOption}${savingsName}`;

      let sellingPlan = {
        name: planName,
        description: `${deliveryOption}${savingsDescription}. Auto renews, skip, cancel anytime.`,
        options: deliveryOption,
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
      plans.push(sellingPlan);
    }
  }

  const variables = {
    input: {
      appId: '4975729',
      name: planTitle,
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
          };
        };
      }) => {
        return response.data.sellingPlanGroupCreate.sellingPlanGroup.id;
      }
    );

  return sellingPlanGroupId;
};
