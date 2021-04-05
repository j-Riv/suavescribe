import { gql } from '@apollo/client';

export const COMMIT_SUBSCRIPTION_DRAFT = gql`
  mutation subscriptionDraftCommit($draftId: ID!) {
    subscriptionDraftCommit(draftId: $draftId) {
      contract {
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
