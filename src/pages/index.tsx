import React from 'react';
import { useQuery } from '@apollo/client';
import {
  Button,
  Frame,
  Heading,
  Loading,
  Page,
  Pagination,
  TextStyle,
} from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import styled from 'styled-components';
import {
  GET_SUBSCRIPTION_CONTRACTS,
  GET_PREV_SUBSCRIPTION_CONTRACTS,
} from '../handlers';
import { formatDate, formatId } from '../utils/formatters';

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 15% 25% 15% 15% 15% 15%;
  div {
    padding: 5px;
    word-wrap: break-word;
  }
  &.bold {
    font-weight: bold;
  }
  &.row {
    border-top: 1px solid #000;
  }
`;

function Index() {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const { loading, error, data, fetchMore } = useQuery(
    GET_SUBSCRIPTION_CONTRACTS,
    {
      variables: {
        first: 10,
      },
    }
  );

  if (loading)
    return (
      <Frame>
        <Loading />
      </Frame>
    );
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;

  const subscriptionContracts = data.subscriptionContracts.edges;
  const pageInfo = data.subscriptionContracts.pageInfo;
  const firstCursor = subscriptionContracts[0].cursor;
  const lastCursor =
    subscriptionContracts[subscriptionContracts.length - 1].cursor;
  console.log('fCursor', firstCursor);
  console.log('lCursor', lastCursor);

  const appRedirect = (href: string) => {
    console.log('redirecting');
    redirect.dispatch(Redirect.Action.APP, href);
  };

  return (
    <Page>
      <TitleBar
        title="Subscriptions"
        // primaryAction={{
        //   content: 'Get Selling Plans',
        //   onAction: () => console.log('clicked'),
        // }}
      />
      <Heading>
        <TextStyle variation="positive">Subscription Contracts</TextStyle>
      </Heading>
      <div>
        <TableRow className="bold">
          <div>ID</div>
          <div>Customer Email</div>
          <div>Customer ID</div>
          <div>Created At</div>
          <div>Next Order Date</div>
          <div>Action</div>
        </TableRow>
        {data &&
          subscriptionContracts.map(contract => (
            <TableRow key={contract.node.id} className="row">
              <div>{formatId(contract.node.id)}</div>
              <div>{contract.node.customer.email}</div>
              <div>{formatId(contract.node.customer.id)}</div>
              <div>{formatDate(contract.node.createdAt)}</div>
              <div>{formatDate(contract.node.nextBillingDate)}</div>
              <div>
                <Button
                  onClick={() =>
                    appRedirect(
                      `/subscriptions?customer_id=${contract.node.customer.id}&id=${contract.node.id}`
                    )
                  }
                >
                  View
                </Button>
                <Button
                  onClick={() =>
                    appRedirect(
                      `/edit-subscription?customer_id=${contract.node.customer.id}&id=${contract.node.id}`
                    )
                  }
                >
                  Edit
                </Button>
              </div>
            </TableRow>
          ))}
        {data && (
          <Pagination
            hasPrevious={pageInfo.hasPreviousPage}
            onPrevious={() => {
              console.log('Prev');
              fetchMore({
                query: GET_PREV_SUBSCRIPTION_CONTRACTS,
                variables: {
                  last: 10,
                  before: lastCursor,
                },
              });
            }}
            hasNext={pageInfo.hasNextPage}
            onNext={() => {
              console.log('Next');
              fetchMore({
                variables: {
                  first: 10,
                  after: lastCursor,
                },
              });
            }}
          />
        )}
      </div>
    </Page>
  );
}

export default Index;
