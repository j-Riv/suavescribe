import { gql } from '@apollo/client';

export const UPDATE_SUBSCRIPTION_DRAFT = gql`
  mutation subscriptionDraftUpdate(
    $draftId: ID!
    $input: SubscriptionDraftInput!
  ) {
    subscriptionDraftUpdate(draftId: $draftId, input: $input) {
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
