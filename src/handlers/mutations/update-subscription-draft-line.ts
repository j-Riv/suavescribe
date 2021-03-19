import { gql } from '@apollo/client';

export const UPDATE_SUBSCRIPTION_DRAFT_LINE = gql`
  mutation subscriptionDraftLineUpdate(
    $draftId: ID!
    $lineId: ID!
    $input: SubscriptionLineUpdateInput!
  ) {
    subscriptionDraftLineUpdate(
      draftId: $draftId
      lineId: $lineId
      input: $input
    ) {
      draft {
        id
      }
      lineUpdated {
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
