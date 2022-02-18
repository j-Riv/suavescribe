import 'isomorphic-fetch';
import { gql } from '@apollo/client';
import { Context } from 'koa';

interface Body {
  sellingPlanGroupId: string;
  planGroupName: string;
  planGroupDescription: string;
  merchantCode: string;
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
    planGroupName,
    planGroupDescription,
    merchantCode,
    planGroupOption,
    sellingPlans,
  } = body;
  // Set interval for naming
  const plans: SellingPlan[] = [];
  sellingPlans.forEach(plan => {
    // Set interval for naming
    const intervalTitle = cleanInterval(plan.intervalOption);
    const percentage = plan.percentageOff;
    const intervalCount = plan.intervalCount;
    const interval = plan.intervalOption;

    // savings
    let savingsDescription: string = '';
    let savingsName: string = '';
    if (parseInt(percentage) > 0) {
      savingsDescription = `, save ${percentage}% on every order`;
      savingsName = ` (Save ${percentage}%)`;
    }
    let planOption: string = `Delivered every `;
    if (parseInt(intervalCount) > 1) {
      planOption = `${planOption}${intervalCount} `;
    }
    planOption = `${planOption}${intervalTitle}`;
    if (parseInt(intervalCount) > 1) {
      planOption = `${planOption}s`;
    }
    if (parseInt(percentage) > 0) {
      planOption = `${planOption}${savingsName}`;
    }

    let sellingPlan: SellingPlan = {
      id: plan.id,
      name: planOption,
      description: `${planOption}${savingsDescription}. Auto renews, skip, cancel anytime.`,
      options: planOption,
      position: plan.position,
      billingPolicy: {
        recurring: {
          interval: interval,
          intervalCount: parseInt(intervalCount),
        },
      },
      deliveryPolicy: {
        recurring: {
          interval: interval,
          intervalCount: parseInt(intervalCount),
        },
      },
      pricingPolicies: [
        {
          fixed: {
            adjustmentType: 'PERCENTAGE',
            adjustmentValue: { percentage: parseInt(percentage) },
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
      name: planGroupName,
      merchantCode: merchantCode, // 'subscribe-and-save'
      description: planGroupDescription,
      options: [planGroupOption], // 'Delivery every'
      position: 1,
      sellingPlansToUpdate: plans,
    },
  };
  return variables;
};

export const updateSellingPlanGroup = async (ctx: Context) => {
  const { client } = ctx;
  const body = ctx.request.body as any;
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
            userErrors?: any;
          };
        };
      }) => {
        const error = response.data.sellingPlanGroupUpdate.userErrors[0];
        if (error) {
          console.log('ERROR', error);
          return error;
        }
        return response.data.sellingPlanGroupUpdate.sellingPlanGroup.id;
      }
    );

  return updatedSellingPlanGroupId;
};
