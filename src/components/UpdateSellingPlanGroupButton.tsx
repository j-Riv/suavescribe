import React, { useState } from 'react';
import { Button } from '@shopify/polaris';
import { useMutation } from '@apollo/client';
import { UPDATE_SELLING_PLAN_GROUP } from '../handlers';

interface Props {
  id: string;
  planTitle: string;
  percentOff: string;
  merchantCode: string;
  interval: string;
  options: string;
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
      console.log('Update Selling Plan Group Error', e.message);
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
    planTitle,
    percentOff,
    merchantCode,
    interval,
    options,
    sellingPlans,
  } = props;
  // Set interval for naming
  const intervalTitle = cleanInterval(interval);
  const plans: SellingPlan[] = [];
  sellingPlans.forEach(plan => {
    let deliveryOption = `Delivered every ${plan.node.position} ${intervalTitle}s`;
    let planName = `${deliveryOption} (Save ${percentOff}%)`;
    if (plan.node.position === 1) {
      deliveryOption = `Delivered every ${intervalTitle}`;
      planName = `${deliveryOption} (Save ${percentOff}%)`;
    }
    let sellingPlan: SellingPlan = {
      id: plan.node.id,
      name: planName,
      description: `${deliveryOption}, save ${percentOff}% on every order. Auto renews, skip, cancel anytime.`,
      options: deliveryOption,
      position: plan.node.position,
      billingPolicy: {
        recurring: { interval: interval, intervalCount: plan.node.position },
      },
      deliveryPolicy: {
        recurring: { interval: interval, intervalCount: plan.node.position },
      },
      pricingPolicies: [
        {
          fixed: {
            adjustmentType: 'PERCENTAGE',
            adjustmentValue: { percentage: parseFloat(percentOff) },
          },
        },
      ],
    };
    plans.push(sellingPlan);
  });
  const input = {
    appId: '4975729',
    name: planTitle,
    merchantCode: merchantCode, // 'subscribe-and-save'
    description: `Delivered at ${intervalTitle}ly intervals at ${percentOff}% discount.`,
    options: [options], // 'Delivery every'
    position: 1,
    sellingPlansToUpdate: plans,
  };
  return input;
};

export default UpdateSellingPlanGroupButton;
