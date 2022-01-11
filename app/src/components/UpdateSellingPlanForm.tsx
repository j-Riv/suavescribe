import React, { useState } from 'react';
import { Card, Layout, Select, TextField } from '@shopify/polaris';
import { SellingPlan } from '../types/sellingplans';

interface Props {
  sellingPlan: SellingPlan;
  handleSellingPlans: (id: string, sellingPlan: any) => void;
  index: number;
}

function UpdateSellingPlanForm(props: Props) {
  const { sellingPlan, handleSellingPlans, index } = props;
  const plan = sellingPlan.node;
  const planId = plan.id;
  // inital state values
  const initialName = plan.name;
  const initialOptions = plan.options[0];
  const initialIntervalOption = plan.billingPolicy.interval;
  const initialIntervalCount = plan.billingPolicy.intervalCount.toString();
  const initialDiscountPercentage =
    plan.pricingPolicies[0].adjustmentValue.percentage.toString();

  const [planName, setPlanName] = useState<string>(initialName);
  const [planOptions, setPlanOptions] = useState<string>(initialOptions);
  const [planIntervalOption, setPlanIntervalOption] = useState<string>(
    initialIntervalOption
  );
  const [planIntervalCount, setPlanIntervalCount] =
    useState<string>(initialIntervalCount);
  const [intervalCount, setIntervalCount] =
    useState<string>(initialIntervalCount);
  const [percentOff, setPercentOff] = useState<string>(
    initialDiscountPercentage
  );

  const handlePlanName = (name: string) => {
    setPlanName(name);
    handleSellingPlans(planId, {
      name: name,
      options: planOptions,
      interval: planIntervalOption,
      intervalCount: parseInt(planIntervalCount),
      percentOff: parseInt(percentOff),
    });
  };

  const handlePlanOptions = (options: string) => {
    setPlanOptions(options);
    handleSellingPlans(planId, {
      name: planName,
      options: options,
      interval: planIntervalOption,
      intervalCount: parseInt(planIntervalCount),
      percentOff: parseInt(percentOff),
    });
  };

  const handleIntervalOption = (option: string) => {
    setPlanIntervalOption(option);
    handleSellingPlans(planId, {
      name: planName,
      options: planOptions,
      interval: option,
      intervalCount: parseInt(planIntervalCount),
      percentOff: parseInt(percentOff),
    });
  };

  const handleIntervalCount = (count: string) => {
    setPlanIntervalCount(count);
    handleSellingPlans(planId, {
      name: planName,
      options: planOptions,
      interval: planIntervalOption,
      intervalCount: parseInt(count),
      percentOff: parseInt(percentOff),
    });
  };

  const handlePercentOff = (percent: string) => {
    setPercentOff(percent);
    handleSellingPlans(planId, {
      name: planName,
      options: planOptions,
      interval: planIntervalOption,
      intervalCount: parseInt(planIntervalCount),
      percentOff: parseInt(percent),
    });
  };

  return (
    <Card title={`Selling Plan ${index + 1}`} sectioned>
      <Layout>
        <Layout.Section>
          <TextField
            value={planName}
            onChange={value => handlePlanName(value)}
            label="Plan Name"
            type="text"
          />
          <TextField
            value={planOptions}
            onChange={value => handlePlanOptions(value)}
            label="Options"
            type="text"
          />
        </Layout.Section>
        <Layout.Section>
          <Select
            label="Interval"
            options={[
              { label: 'Daily', value: 'DAY' },
              { label: 'Weekly', value: 'WEEK' },
              { label: 'Monthly', value: 'MONTH' },
              { label: 'Yearly', value: 'YEAR' },
            ]}
            onChange={value => handleIntervalOption(value)}
            value={planIntervalOption}
          />
          <Select
            label="Interval Count"
            options={Array.from({ length: 9 }, (_, i) => i + 1).map(
              (i: number) => {
                return {
                  label: `${i}`,
                  value: `${i}`,
                };
              }
            )}
            onChange={value => handleIntervalCount(value)}
            value={planIntervalCount}
          />
          <TextField
            value={percentOff}
            onChange={value => handlePercentOff(value)}
            label="Percent Off (%)"
            type="number"
          />
        </Layout.Section>
      </Layout>
    </Card>
  );
}

export default UpdateSellingPlanForm;
