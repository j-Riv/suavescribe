import React, { useState } from 'react';
import { Button } from '@shopify/polaris';
import { useMutation } from '@apollo/client';
import { UPDATE_PAYMENT_METHOD } from '../handlers';

interface Props {
  id: string;
  toggleActive: () => void;
  setMsg: (msg: string) => void;
  setToastError: (error: boolean) => void;
  refetch: () => void;
}

function UpdatePaymentMethodButton(props: Props) {
  const { id, toggleActive, setMsg, setToastError, refetch } = props;
  const [loading, setLoading] = useState<boolean>(false);
  // send the payment update email, update toast message and make it active
  const [updatePaymentMethod] = useMutation(UPDATE_PAYMENT_METHOD, {
    onCompleted: () => {
      setLoading(false);
      setMsg('Update Payment Email Sent');
      toggleActive();
      refetch();
    },
  });

  const handleClick = (id: string) => {
    try {
      setLoading(true);
      updatePaymentMethod({
        variables: {
          customerPaymentMethodId: id,
        },
      });
    } catch (e) {
      setToastError(true);
      setMsg('Error Sending Payment Method Email');
      toggleActive();
    }
  };

  return (
    <Button primary loading={loading} onClick={() => handleClick(id)}>
      Send
    </Button>
  );
}

export default UpdatePaymentMethodButton;
