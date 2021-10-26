import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

interface Body {
  planTitle: string;
  percentageOff: string;
  merchantCode: string;
  intervalOption: string;
  numberOfPlans: string;
  intervalCount: string;
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
    intervalCount,
    planGroupOption,
  } = body;
  // Set interval for naming
  const intervalTitle = cleanInterval(intervalOption);
  // Set number of plans
  let sellingPlans: any[] = [];
  const intervalCountNumber = parseInt(intervalCount);
  const percentageOffNumber = parseFloat(percentageOff);
  const plans = parseInt(numberOfPlans);
  // savings
  let savingsDescription = '';
  let savingsName = '';
  if (percentageOffNumber > 0) {
    savingsDescription = `, save ${percentageOff}% on every order`;
    savingsName = ` (Save ${percentageOff}%)`;
  }
  if (plans > 1) {
    for (let i = 1; i <= plans; i++) {
      let deliveryOption = `Delivered every ${
        i * intervalCountNumber
      } ${intervalTitle}s`;
      const planName = `${deliveryOption}${savingsName}`;
      if (i === 1) {
        deliveryOption = `Delivered every ${intervalTitle}`;
      }
      let sellingPlan = {
        name: planName,
        description: `${deliveryOption}${savingsDescription}. Auto renews, skip, cancel anytime.`,
        options: deliveryOption,
        position: i,
        billingPolicy: {
          recurring: {
            interval: intervalOption,
            intervalCount: i * intervalCountNumber,
          },
        },
        deliveryPolicy: {
          recurring: {
            interval: intervalOption,
            intervalCount: i * intervalCountNumber,
          },
        },
        pricingPolicies: [
          {
            fixed: {
              adjustmentType: 'PERCENTAGE',
              adjustmentValue: { percentage: percentageOffNumber },
            },
          },
        ],
      };
      sellingPlans.push(sellingPlan);
    }
  } else {
    let deliveryOption = `Delivered every ${intervalCount} ${intervalTitle}s`;
    if (intervalCountNumber === 1) {
      deliveryOption = `Delivered every ${intervalTitle}`;
    }
    sellingPlans = [
      {
        name: `${deliveryOption}${savingsName}`,
        description: `${deliveryOption}${savingsDescription}. Auto renews, skip, cancel anytime.`,
        options: deliveryOption,
        position: 0,
        billingPolicy: {
          recurring: {
            interval: intervalOption,
            intervalCount: intervalCountNumber,
          },
        },
        deliveryPolicy: {
          recurring: {
            interval: intervalOption,
            intervalCount: intervalCountNumber,
          },
        },
        pricingPolicies: [
          {
            fixed: {
              adjustmentType: 'PERCENTAGE',
              adjustmentValue: { percentage: percentageOffNumber },
            },
          },
        ],
      },
    ];
  }
  // fix for day
  let fixedIntervalTitle: string;
  if (intervalTitle === 'Day') {
    fixedIntervalTitle = 'Daily';
  } else {
    fixedIntervalTitle = `${intervalTitle}ly`;
  }
  const variables = {
    input: {
      appId: '4975729',
      name: planTitle,
      merchantCode: merchantCode, // 'subscribe-and-save'
      description: `Delivered at ${fixedIntervalTitle} intervals at ${percentageOff}% discount.`,
      options: [planGroupOption], // 'Delivery every'
      position: 1,
      sellingPlansToCreate: sellingPlans,
    },
  };
  return variables;
};

export const createSellingPlanGroup = async (ctx: Context) => {
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
