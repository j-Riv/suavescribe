import React, { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import {
  Badge,
  Button,
  Card,
  Frame,
  Page,
  Pagination,
  Toast,
} from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import { Redirect } from '@shopify/app-bridge/actions';
import {
  GET_SUBSCRIPTION_CONTRACTS,
  GET_PREV_SUBSCRIPTION_CONTRACTS,
} from '../handlers';
import { formatDate, formatId } from '../utils/formatters';
import Table from '../components/Table';
import LoadingIndex from '../components/LoadingIndex';
import ErrorState from '../components/ErrorState';
import SearchBar from '../components/SearchBar';
import { Contract } from '../types/subscriptions';

function Index() {
  // state
  const [active, setActive] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  // Toast
  const toggleActive = useCallback(() => setActive(active => !active), []);
  const setMsg = useCallback(msg => setToastMsg(msg), []);
  const setToastError = useCallback(error => setIsError(error), []);
  const toastMarkup = active ? (
    <Toast content={toastMsg} onDismiss={toggleActive} error={isError} />
  ) : null;
  // set subscriptions per page
  const subsPerPage = 15;
  // search state
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const { loading, error, data, fetchMore } = useQuery(
    GET_SUBSCRIPTION_CONTRACTS,
    {
      variables: {
        first: subsPerPage,
      },
    }
  );

  if (loading) return <LoadingIndex tableRows={5} />;
  if (error) return <ErrorState err={error.message} />;

  const subscriptionContracts = data?.subscriptionContracts?.edges;
  const pageInfo = data?.subscriptionContracts?.pageInfo;
  let firstCursor: string = '';
  let lastCursor: string = '';
  if (subscriptionContracts.length > 0) {
    firstCursor = subscriptionContracts[0]?.cursor;
    lastCursor = subscriptionContracts[subscriptionContracts.length - 1].cursor;
  }

  const appRedirect = (href: string) => {
    redirect.dispatch(Redirect.Action.APP, href);
  };

  const handleManualSync = async () => {
    const fetchFunction = authenticatedFetch(app);
    try {
      await fetchFunction('/sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setMsg('Syncing');
      setToastError(false);
      toggleActive();
    } catch (err) {
      console.log('ERROR', err.message);
      setMsg(err.message);
      setToastError(true);
      toggleActive();
    }
  };

  return (
    <Page
      title="Dashboard"
      // titleMetadata={<Badge status="success">Active</Badge>}
      subtitle="Subscription Contracts"
    >
      <Frame>
        <TitleBar
          title="Subscriptions"
          primaryAction={{
            content: 'Run Sync',
            onAction: handleManualSync,
            destructive: false,
            disabled: subscriptionContracts.length === 0,
          }}
        />
        {toastMarkup}
        <Card sectioned>
          <SearchBar />
        </Card>
        <Card title="Subscriptions" sectioned>
          {data && subscriptionContracts.length > 0 ? (
            <>
              <Table
                contentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                headings={[
                  'Status',
                  'ID',
                  'Email',
                  // 'Customer ID',
                  'Next Order Date',
                  'Last Payment Status',
                  'Actions',
                ]}
                rows={subscriptionContracts.map((contract: Contract) => {
                  return [
                    <Badge
                      status={
                        contract.node.status === 'ACTIVE'
                          ? 'success'
                          : contract.node.status === 'PAUSED'
                          ? 'warning'
                          : 'critical'
                      }
                    >
                      {contract.node.status}
                    </Badge>,
                    formatId(contract.node.id),
                    contract.node.customer.email,
                    // formatId(contract.node.customer.id),
                    formatDate(contract.node.nextBillingDate),
                    contract.node.lastPaymentStatus,
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
              <Pagination
                hasPrevious={pageInfo.hasPreviousPage}
                onPrevious={() => {
                  fetchMore({
                    query: GET_PREV_SUBSCRIPTION_CONTRACTS,
                    variables: {
                      last: subsPerPage,
                      before: firstCursor,
                    },
                  });
                }}
                hasNext={pageInfo.hasNextPage}
                onNext={() => {
                  fetchMore({
                    variables: {
                      first: subsPerPage,
                      after: lastCursor,
                    },
                  });
                }}
              />
            </>
          ) : (
            <p style={{ textAlign: 'center' }}>No Subscriptions Found</p>
          )}
        </Card>
      </Frame>
    </Page>
  );
}

export default Index;
