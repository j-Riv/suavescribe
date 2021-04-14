import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

interface Body {
  sellingPlanGroupId: string;
  planTitle: string;
  percentageOff: string;
  merchantCode: string;
  intervalOption: string;
  planGroupOption: string;
  sellingPlans: any[];
}

interface SellingPlan {
  id: string;
  name: string;
  description: string;
  options: string;
  position: string | number;
  billingPolicy: {
    recurring: {
      interval: string;
      intervalCount: number;
    };
  };
  deliveryPolicy: {
    recurring: {
      interval: string;
      intervalCount: number;
    };
  };
  pricingPolicies: [
    {
      fixed: {
        adjustmentType: string;
        adjustmentValue: {
          percentage: number;
        };
      };
    }
  ];
}

export function SELLING_PLAN_GROUP_UPDATE() {
  return gql`
    mutation sellingPlanGroupUpdate($id: ID!, $input: SellingPlanGroupInput!) {
      sellingPlanGroupUpdate(id: $id, input: $input) {
        deletedSellingPlanIds
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
    sellingPlanGroupId,
    planTitle,
    percentageOff,
    merchantCode,
    intervalOption,
    planGroupOption,
    sellingPlans,
  } = body;
  // Set interval for naming
  const intervalTitle = cleanInterval(intervalOption);
  const plans: SellingPlan[] = [];
  sellingPlans.forEach(plan => {
    let deliveryOption = `Delivered every ${plan.position} ${intervalTitle}s`;
    let planName = `${deliveryOption} (Save ${percentageOff}%)`;
    if (plan.position === 1) {
      deliveryOption = `Delivered every ${intervalTitle}`;
      planName = `${deliveryOption} (Save ${percentageOff}%)`;
    }
    let sellingPlan: SellingPlan = {
      id: plan.id,
      name: planName,
      description: `${deliveryOption}, save ${percentageOff}% on every order. Auto renews, skip, cancel anytime.`,
      options: deliveryOption,
      position: plan.position,
      billingPolicy: {
        recurring: { interval: intervalOption, intervalCount: plan.position },
      },
      deliveryPolicy: {
        recurring: { interval: intervalOption, intervalCount: plan.position },
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
    plans.push(sellingPlan);
  });
  const variables = {
    id: sellingPlanGroupId,
    input: {
      appId: '4975729',
      name: planTitle,
      merchantCode: merchantCode, // 'subscribe-and-save'
      description: `Delivered at ${intervalTitle}ly intervals at ${percentageOff}% discount.`,
      options: [planGroupOption], // 'Delivery every'
      position: 1,
      sellingPlansToUpdate: plans,
    },
  };
  return variables;
};

export const updateSellingPlanGroup = async (ctx: Context) => {
  const { client } = ctx;
  const body = JSON.parse(ctx.request.body);
  const variables = createInput(body);
  const updatedSellingPlanGroupId = await client
    .mutate({
      mutation: SELLING_PLAN_GROUP_UPDATE(),
      variables: variables,
    })
    .then(
      (response: {
        data: {
          sellingPlanGroupUpdate: {
            deletedSellingPlanIds: string;
            sellingPlanGroup: {
              id: string;
            };
          };
        };
      }) => {
        return response.data.sellingPlanGroupUpdate.sellingPlanGroup.id;
      }
    );

  return updatedSellingPlanGroupId;
};
