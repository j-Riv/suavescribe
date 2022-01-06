export interface SellingPlanGroup {
  id: string;
  appId: string;
  description: string;
  options: string[];
  name: string;
  merchantCode: string;
  summary: string;
  sellingPlans: {
    edges: SellingPlan[];
  };
}

export interface SellingPlan {
  node: {
    id: string;
    name: string;
    description: string;
    options: string[];
    position: number;
    billingPolicty: {
      interval: string;
      intervalCount: number;
    };
    deliveryPolicy: {
      interval: string;
      intervalcount: number;
    };
    pricingPolicies: [
      {
        adjustmentType: string;
        adjustmentValue: {
          percentage: number;
        };
      }
    ];
  };
}
