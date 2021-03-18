import React from 'react';
import { useQuery } from '@apollo/client';
import {
  Badge,
  Button,
  Card,
  Frame,
  Loading,
  Page,
  Pagination,
  TextStyle,
} from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import {
  GET_SUBSCRIPTION_CONTRACTS,
  GET_PREV_SUBSCRIPTION_CONTRACTS,
} from '../handlers';
import { formatDate, formatId } from '../utils/formatters';
import Table from '../components/Table';

function Index() {
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

  if (loading)
    return (
      <Frame>
        <Loading />
      </Frame>
    );
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;

  const subscriptionContracts = data?.subscriptionContracts?.edges;
  const pageInfo = data?.subscriptionContracts?.pageInfo;
  const firstCursor = subscriptionContracts[0]?.cursor;
  const lastCursor =
    subscriptionContracts[subscriptionContracts.length - 1].cursor;
  console.log('fCursor', firstCursor);
  console.log('lCursor', lastCursor);

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
      <TitleBar
        title="Subscriptions"
        // primaryAction={{
        //   content: 'Get Selling Plans',
        //   onAction: () => console.log('clicked'),
        // }}
      />
      <Card sectioned>
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
                      `/subscriptions?customer_id=${contract.node.customer.id}&id=${contract.node.id}`
                    )
                  }
                >
                  View / Edit
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
