export interface Contract {
  node: {
    id: string;
    status: string;
    customer: {
      id: string;
      email: string;
    };
    nextBillingDate: string;
    lastPaymentStatus: string;
  };
}

export interface Product {
  node: {
    id: string;
    title: string;
    featuredImage: {
      originalSrc: string;
      altText: string;
    };
    variants: {
      edges: ProductVariant[];
    };
  };
}

export interface ProductVariant {
  node: {
    id: string;
    title: string;
    sku: string;
  };
}

export interface SellingPlanGroup {
  node: {
    id: string;
    name: string;
    summary: string;
    merchantCode: string;
    productCount: number;
    productVariantCount: number;
    options: string;
    sellingPlans: {
      edges: SellingPlan[];
    };
    products: {
      edges: Product[];
    };
  };
}

export interface SellingPlan {
  node: {
    id: string;
    name: string;
    options: string;
    position: number;
    billingPolicy: {
      interval: string;
      intervalCount: number;
    };
    pricingPolicies: {
      adjustmentType: string;
      adjustmentValue: {
        percentage: string;
      };
    };
  };
}

export interface SubscriptionContract {
  id: string;
  status: string;
  createdAt: string;
  nextBillingDate: string;
  lastPaymentStatus: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  customerPaymentMethod: {
    id: string;
  };
  deliveryPrice: {
    currencyCode: string;
    amount: number;
  };
  lineCount: number;
  lines: {
    edges: Line[];
  };
  originOrder: {
    legacyResourceId: string;
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

export interface Line {
  node: {
    id: string;
    productId: string;
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
          amount: number;
        };
      };
      basePrice: {
        amount: number;
        currencyCode: string;
      };
    };
  };
}
