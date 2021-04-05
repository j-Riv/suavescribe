import { gql } from '@apollo/client';

export const UPDATE_PAYMENT_METHOD = gql`
  mutation customerPaymentMethodSendUpdateEmail($customerPaymentMethodId: ID!) {
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
