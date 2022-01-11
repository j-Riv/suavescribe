import { gql } from '@apollo/client';

export const GET_SELLING_PLAN_GROUP_BY_ID = gql`
  query sellingPlanGroup($id: ID!) {
    sellingPlanGroup(id: $id) {
      id
      name
      summary
      description
      merchantCode
      productCount
      productVariantCount
      options
      sellingPlans(first: 10) {
        edges {
          node {
            id
            name
            options
            position
            billingPolicy {
              ... on SellingPlanRecurringBillingPolicy {
                interval
                intervalCount
              }
            }
            pricingPolicies {
              ... on SellingPlanFixedPricingPolicy {
                adjustmentType
                adjustmentValue {
                  ... on SellingPlanPricingPolicyPercentageValue {
                    percentage
                  }
                }
              }
            }
            deliveryPolicy {
              ... on SellingPlanRecurringDeliveryPolicy {
                interval
                intervalCount
              }
            }
          }
        }
      }
      products(first: 10) {
        edges {
          node {
            id
            title
            featuredImage {
              originalSrc
              altText
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  sku
                }
              }
            }
          }
        }
      }
      productVariants(first: 10) {
        edges {
          node {
            id
            title
            sku
            image {
              src
              altText
            }
          }
        }
      }
    }
  }
`;
