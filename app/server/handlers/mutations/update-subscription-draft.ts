import 'isomorphic-fetch';
import { gql, ApolloClient } from '@apollo/client';

export function SUBSCRIPTION_DRAFT_UPDATE() {
  return gql`
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
}

export const updateSubscriptionDraft = async (
  client: ApolloClient<unknown>,
  draftId: string,
  input: any
) => {
  console.log('INPUT', input);
  const subscriptionDraftUpdate = await client
    .mutate({
      mutation: SUBSCRIPTION_DRAFT_UPDATE(),
      variables: {
        draftId: draftId,
        input: input,
      },
    })
    .then((response: any) => {
      const data = response.data.subscriptionDraftUpdate;
      if (data.userErrors.length > 0) {
        return data.userErrors;
      }
      return data.draft.id;
    });

  return subscriptionDraftUpdate;
};
