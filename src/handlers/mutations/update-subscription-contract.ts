import { gql } from '@apollo/client';

export const UPDATE_SUBSCRIPTION_CONTRACT = gql`
  mutation subscriptionContractUpdate($contractId: ID!) {
    subscriptionContractUpdate(contractId: $contractId) {
      draft {
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
