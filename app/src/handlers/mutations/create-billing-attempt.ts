import { gql } from '@apollo/client';

export const CREATE_BILLING_ATTEMPT = gql`
  mutation subscriptionBillingAttemptCreate(
    $subscriptionContractId: ID!
    $subscriptionBillingAttemptInput: SubscriptionBillingAttemptInput!
  ) {
    subscriptionBillingAttemptCreate(
      subscriptionContractId: $subscriptionContractId
      subscriptionBillingAttemptInput: $subscriptionBillingAttemptInput
    ) {
      subscriptionBillingAttempt {
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
