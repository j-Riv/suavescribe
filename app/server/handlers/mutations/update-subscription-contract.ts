import 'isomorphic-fetch';
import DefaultClient, { gql } from 'apollo-boost';

export function SUBSCRIPTION_CONTRACT_UPDATE() {
  return gql`
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
}

export const updateSubscriptionContract = async (
  client: DefaultClient<unknown>,
  id: string
) => {
  const subscriptionContractUpdate = await client
    .mutate({
      mutation: SUBSCRIPTION_CONTRACT_UPDATE(),
      variables: {
        contractId: id,
      },
    })
    .then((response: any) => {
      return response.data.subscriptionContractUpdate.draft.id;
    });

  return subscriptionContractUpdate;
};
