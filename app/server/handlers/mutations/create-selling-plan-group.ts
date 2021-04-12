import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

interface Body {
  planTitle: string;
  percentageOff: string;
  merchantCode: string;
  intervalOption: string;
  numberOfPlans: string;
  planGroupOption: string;
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
    percentageOff,
    merchantCode,
    intervalOption,
    numberOfPlans,
    planGroupOption,
  } = body;
  // Set interval for naming
  const intervalTitle = cleanInterval(intervalOption);
  // Set number of plans
  const plans = parseInt(numberOfPlans);
  const sellingPlans: any[] = [];
  for (let i = 1; i <= plans; i++) {
    let deliveryOption = `Delivered every ${i} ${intervalTitle}s`;
    let planName = `${deliveryOption} (Save ${percentageOff}%)`;
    if (i === 1) {
      deliveryOption = `Delivered every ${intervalTitle}`;
      planName = `${deliveryOption} (Save ${percentageOff}%)`;
    }
    let sellingPlan = {
      name: planName,
      description: `${deliveryOption}, save ${percentageOff}% on every order. Auto renews, skip, cancel anytime.`,
      options: deliveryOption,
      position: i,
      billingPolicy: {
        recurring: { interval: intervalOption, intervalCount: i },
      },
      deliveryPolicy: {
        recurring: { interval: intervalOption, intervalCount: i },
      },
      pricingPolicies: [
        {
          fixed: {
            adjustmentType: 'PERCENTAGE',
            adjustmentValue: { percentage: parseFloat(percentageOff) },
          },
        },
      ],
    };
    sellingPlans.push(sellingPlan);
  }
  const variables = {
    input: {
      appId: '4975729',
      name: planTitle,
      merchantCode: merchantCode, // 'subscribe-and-save'
      description: `Delivered at ${intervalTitle}ly intervals at ${percentageOff}% discount.`,
      options: [planGroupOption], // 'Delivery every'
      position: 1,
      sellingPlansToCreate: sellingPlans,
    },
  };
  return variables;
};

export const createSellingPlanGroup = async (ctx: Context) => {
  const { client } = ctx;
  const body = JSON.parse(ctx.request.body);
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
