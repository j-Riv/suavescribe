import 'isomorphic-fetch';
import DefaultClient, { gql } from 'apollo-boost';
import { v4 as uuidv4 } from 'uuid';

export function CREATE_SUBSCRIPTION_BILLING_ATTEMPT() {
  return gql`
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
}

export const createSubscriptionBillingAttempt = async (
  client: DefaultClient<unknown>,
  subscriptionContractId: string
) => {
  const variables = {
    subscriptionContractId: subscriptionContractId,
    subscriptionBillingAttemptInput: {
      // idempotencyKey: uuidv4(), // needs to be generated
      idempotencyKey: 'random-string-3',
    },
  };
  const subscriptionBillingAttemptId = await client
    .mutate({
      mutation: CREATE_SUBSCRIPTION_BILLING_ATTEMPT(),
      variables: variables,
    })
    .then((response: any) => {
      return response.data.subscriptionBillingAttemptCreate
        .subscriptionBillingAttempt;
    });

  return subscriptionBillingAttemptId;
};
