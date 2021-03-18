import { gql } from '@apollo/client';

export const GET_SELLING_PLAN_GROUP_BY_ID = gql`
  query sellingPlanGroup($id: ID!) {
    sellingPlanGroup(id: $id) {
      id
      name
      summary
      merchantCode
      productCount
      productVariantCount
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
    }
  }
`;
