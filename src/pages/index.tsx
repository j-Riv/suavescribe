import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Badge,
  Button,
  Card,
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
import Table from '../components/Table';
import LoadingIndex from '../components/LoadingIndex';

const SearchBar = styled.div`
  display: inline-grid;
  grid-template-columns: 9fr 1fr;
`;

function Index() {
  // search state
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const { loading, error, data, fetchMore } = useQuery(
    GET_SUBSCRIPTION_CONTRACTS,
    {
      variables: {
        first: 3,
      },
    }
  );

  if (loading) return <LoadingIndex tableRows={5} />;
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;

  const subscriptionContracts = data?.subscriptionContracts?.edges;
  const pageInfo = data?.subscriptionContracts?.pageInfo;
  const firstCursor = subscriptionContracts[0]?.cursor;
  const lastCursor =
    subscriptionContracts[subscriptionContracts.length - 1].cursor;

  const appRedirect = (href: string) => {
    console.log('redirecting');
    redirect.dispatch(Redirect.Action.APP, href);
  };

  return (
    <Page
      title="Dashboard"
      titleMetadata={<Badge status="info">Something</Badge>}
      subtitle="Subscription Contracts"
    >
      <TitleBar title="Subscriptions" />
      <Card title="Subscriptions" sectioned>
        {data && (
          <Table
            contentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
            headings={[
              'ID',
              'Email',
              'Customer ID',
              'Created At',
              'Next Order Date',
              'Actions',
            ]}
            rows={subscriptionContracts.map(contract => {
              return [
                formatId(contract.node.id),
                contract.node.customer.email,
                formatId(contract.node.customer.id),
                formatDate(contract.node.createdAt),
                formatDate(contract.node.nextBillingDate),
                <Button
                  plain
                  onClick={() =>
                    appRedirect(
                      `/subscriptions?customer_id=${formatId(
                        contract.node.customer.id
                      )}&id=${formatId(contract.node.id)}`
                    )
                  }
                >
                  View
                </Button>,
              ];
            })}
          />
        )}
        {data && (
          <Pagination
            hasPrevious={pageInfo.hasPreviousPage}
            onPrevious={() => {
              console.log('Prev');
              fetchMore({
                query: GET_PREV_SUBSCRIPTION_CONTRACTS,
                variables: {
                  last: 3,
                  before: firstCursor,
                },
              });
            }}
            hasNext={pageInfo.hasNextPage}
            onNext={() => {
              console.log('Next');
              fetchMore({
                variables: {
                  first: 3,
                  after: lastCursor,
                },
              });
            }}
          />
        )}
      </Card>
    </Page>
  );
}

export default Index;
