import React, { useState } from 'react';
import { Button } from '@shopify/polaris';
import { useMutation } from '@apollo/client';
import { UPDATE_SELLING_PLAN_GROUP } from '../handlers';

interface Props {
  id: string;
  groupName: string;
  groupDescription: string;
  groupOptions: string[];
  merchantCode: string;
  sellingPlans: any[];
  toggleActive: () => void;
  setMsg: (msg: string) => void;
  setToastError: (error: boolean) => void;
  refetch: () => void;
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

function UpdateSellingPlanGroupButton(props: Props) {
  const { setMsg, toggleActive, setToastError, refetch } = props;

  const [loading, setLoading] = useState<boolean>(false);
  const [updateSellingPlanGroup] = useMutation(UPDATE_SELLING_PLAN_GROUP, {
    onCompleted: data => {
      setLoading(false);
      setMsg('Updated Selling Plan Group');
      toggleActive();
      refetch();
    },
  });

  const handleClick = () => {
    try {
      const input = createInput(props);
      setLoading(true);
      updateSellingPlanGroup({
        variables: {
          id: props.id,
          input: input,
        },
      });
    } catch (e) {
      console.log('ERROR', e.message);
      setToastError(true);
      setMsg('Error Updating Selling Plan Group');
      toggleActive();
    }
  };

  return (
    <Button primary loading={loading} onClick={() => handleClick()}>
      Update
    </Button>
  );
}

const cleanInterval = (interval: string) => {
  interval = interval.toLowerCase();
  const cap = interval.substr(0, 1);
  return `${cap.toUpperCase()}${interval.substr(1)}`;
};

const createInput = (props: Props) => {
  const {
    groupName,
    groupDescription,
    merchantCode,
    groupOptions,
    sellingPlans,
  } = props;

  // TODO SET GROUP INPUTS HERE, ALSO DEAL WITH UPDATING DESCRIPTION BASED ON NEW INPUTS

  // Set interval for naming
  const plans: SellingPlan[] = [];
  sellingPlans.forEach(plan => {
    // Set interval for naming
    const intervalTitle = cleanInterval(plan.node.billingPolicy.interval);
    const percentage = plan.node.pricingPolicies[0].adjustmentValue.percentage;
    const intervalCount = plan.node.billingPolicy.intervalCount;
    const interval = plan.node.billingPolicy.interval;
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
      id: plan.node.id,
      name: planOption, // plan.node.name makes this use user input, right now it's being overwritten for better naming
      description: `${planOption}${savingsDescription}. Auto renews, skip, cancel anytime.`,
      options: plan.node.options[0],
      position: plan.node.position,
      billingPolicy: {
        recurring: {
          interval: interval,
          intervalCount: intervalCount,
        },
      },
      deliveryPolicy: {
        recurring: {
          interval: interval,
          intervalCount: intervalCount,
        },
      },
      pricingPolicies: [
        {
          fixed: {
            adjustmentType: 'PERCENTAGE',
            adjustmentValue: { percentage: percentage },
          },
        },
      ],
    };
    plans.push(sellingPlan);
  });
  const input = {
    appId: '4975729',
    name: groupName,
    merchantCode: merchantCode, // 'subscribe-and-save'
    description: groupDescription,
    options: [...groupOptions], // 'Delivery every'
    position: 1,
    sellingPlansToUpdate: plans,
  };
  return input;
};

export default UpdateSellingPlanGroupButton;
