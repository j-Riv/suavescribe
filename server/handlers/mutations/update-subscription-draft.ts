import 'isomorphic-fetch';
import DefaultClient, { gql } from 'apollo-boost';

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
  client: DefaultClient<unknown>,
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
      console.log('+++++ RESPONSE +++++', response);
      return response.data.subscriptionDraftUpdate.draft.id;
    });

  return subscriptionDraftUpdate;
};
