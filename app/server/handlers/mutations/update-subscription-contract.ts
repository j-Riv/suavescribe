import 'isomorphic-fetch';
import { gql, ApolloClient } from '@apollo/client';

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
  client: ApolloClient<unknown>,
  id: string
) => {
  console.log('UPDATING SUBSCRIPTION CONTRACT ID', id);
  const subscriptionContractUpdate = await client
    .mutate({
      mutation: SUBSCRIPTION_CONTRACT_UPDATE(),
      variables: {
        contractId: id,
      },
    })
    .then((response: { data?: any }) => {
      return response.data.subscriptionContractUpdate.draft.id;
    });

  return subscriptionContractUpdate;
};
