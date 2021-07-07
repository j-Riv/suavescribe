import 'isomorphic-fetch';
import { gql, ApolloClient } from '@apollo/client';

export function PAYMENT_METHOD_UPDATE() {
  return gql`
    mutation customerPaymentMethodSendUpdateEmail(
      $customerPaymentMethodId: ID!
    ) {
      customerPaymentMethodSendUpdateEmail(
        customerPaymentMethodId: $customerPaymentMethodId
      ) {
        customer {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
}

export const updatePaymentMethod = async (
  client: ApolloClient<unknown>,
  id: string
) => {
  console.log('UPDATING PAYMENT METHOD', id);
  const subscriptionContractUpdate = await client
    .mutate({
      mutation: PAYMENT_METHOD_UPDATE(),
      variables: {
        customerPaymentMethodId: id,
      },
    })
    .then((response: { data?: any }) => {
      return response.data.customerPaymentMethodSendUpdateEmail.customer.id;
    });

  return subscriptionContractUpdate;
};
