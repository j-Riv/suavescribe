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
    let deliveryOption = `Delivered every ${plan.node.billingPolicy.intervalCount} ${intervalTitle}s`;
    let planName = `${deliveryOption} (Save ${percentage}%)`;
    if (plan.node.position === 1) {
      deliveryOption = `Delivered every ${intervalTitle}`;
      planName = `${deliveryOption} (Save ${percentage}%)`;
    }
    let sellingPlan: SellingPlan = {
      id: plan.node.id,
      name: planName, // plan.node.name makes this use user input, right now it's being overwritten for better naming
      description: `${deliveryOption}, save ${percentage}% on every order. Auto renews, skip, cancel anytime.`,
      options: plan.node.options[0],
      position: plan.node.position,
      billingPolicy: {
        recurring: {
          interval: plan.node.billingPolicy.interval,
          intervalCount: plan.node.billingPolicy.intervalCount,
        },
      },
      deliveryPolicy: {
        recurring: {
          interval: plan.node.deliveryPolicy.interval,
          intervalCount: plan.node.deliveryPolicy.intervalCount,
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
