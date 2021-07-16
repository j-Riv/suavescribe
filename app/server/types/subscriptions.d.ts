export interface SubscriptionContract {
  id: string;
  status: string;
  nextBillingDate: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  deliveryPrice: {
    currencyCode: string;
    amount: string;
  };
  lines: {
    edges: SubscriptionLine[];
  };
  originOrder: {
    legacyResourceId: string;
  };
  lastPaymentStatus: string;
  customerPaymentMethod: {
    id: string;
  };
  deliveryPolicy: {
    interval: string;
    intervalCount: number;
  };
  billingPolicy: {
    interval: string;
    intervalCount: number;
  };
  deliveryMethod: {
    address: {
      address1: string;
      address2: string;
      city: string;
      country: string;
      province: string;
      zip: string;
      name: string;
      company: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface SubscriptionLine {
  node: {
    id: string;
    productId: string;
    variantId: string;
    title: string;
    variantTitle: string;
    quantity: string;
    requiresShipping: boolean;
    variantImage: {
      originalSrc: string;
      altText: string;
    };
    pricingPolicy: {
      cycleDiscounts: {
        adjustmentType: string;
        computedPrice: {
          amount: string;
        };
      };
      basePrice: {
        amount: string;
        currency: string;
      };
    };
  };
}
