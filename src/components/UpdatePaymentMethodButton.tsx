import React, { useState } from 'react';
import { Button } from '@shopify/polaris';
import { useMutation } from '@apollo/client';
import { UPDATE_PAYMENT_METHOD } from '../handlers';

function UpdatePaymentMethodButton(props: {
  id: string;
  toggleActive: () => void;
  setMsg: (msg: string) => void;
  refetch: () => void;
}) {
  const { id, toggleActive, setMsg, refetch } = props;
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
    setLoading(true);
    updatePaymentMethod({
      variables: {
        customerPaymentMethodId: id,
      },
    });
  };

  return (
    <Button primary loading={loading} onClick={() => handleClick(id)}>
      Send
    </Button>
  );
}

export default UpdatePaymentMethodButton;
