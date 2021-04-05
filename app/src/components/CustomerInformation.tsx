import React from 'react';
import { Avatar, Card } from '@shopify/polaris';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  grid-template-columns: 50px auto;
  .bold {
    font-weight: bold;
  }
`;

interface Props {
  data: {
    subscriptionContract: {
      customer: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  };
}

function CustomerInformation(props: Props) {
  const { data } = props;

  return (
    <Card title="Customer" sectioned>
      <Container>
        <Avatar
          customer
          size="medium"
          name={`${data.subscriptionContract.customer.firstName} ${data.subscriptionContract.customer.lastName}`}
        />
        <div>
          <p>
            <span className="bold">Name: </span>
            {`${data.subscriptionContract.customer.firstName} ${data.subscriptionContract.customer.lastName}`}
          </p>
          <p>
            <span className="bold">Email: </span>
            {data.subscriptionContract.customer.email}
          </p>
        </div>
      </Container>
    </Card>
  );
}

export default CustomerInformation;
