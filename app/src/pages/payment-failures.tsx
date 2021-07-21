import React, { useEffect, useState, useCallback } from 'react';
// import { useQuery } from '@apollo/client';
import { Badge, Button, Card, Frame, Page, Toast } from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import { Redirect } from '@shopify/app-bridge/actions';
import { formatDate, formatId } from '../utils/formatters';
import Table from '../components/Table';
import LoadingIndex from '../components/LoadingIndex';
import ErrorState from '../components/ErrorState';
import SearchBar from '../components/SearchBar';

function Index() {
  // state
  const [active, setActive] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);

  const getPaymentFailures = async () => {
    const fetchFunction = authenticatedFetch(app);
    try {
      const response = await fetchFunction('/payment-failed', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('DATA', data);
      if (data) {
        setData(data);
        setLoading(false);
      }
    } catch (err) {
      console.log('ERROR', err.message);
      setError(true);
      setMsg(err.message);
      setToastError(true);
      toggleActive();
    }
  };

  useEffect(() => {
    getPaymentFailures();
  }, []);

  // Toast
  const toggleActive = useCallback(() => setActive(active => !active), []);
  const setMsg = useCallback(msg => setToastMsg(msg), []);
  const setToastError = useCallback(error => setIsError(error), []);
  const toastMarkup = active ? (
    <Toast content={toastMsg} onDismiss={toggleActive} error={isError} />
  ) : null;
  // search state
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  if (loading) return <LoadingIndex tableRows={5} />;
  if (error) return <ErrorState err="Unexpected Error..." />;

  const subscriptionContracts = data.contracts;

  const appRedirect = (href: string) => {
    redirect.dispatch(Redirect.Action.APP, href);
  };

  return (
    <Page
      title="Payment Failures"
      // titleMetadata={<Badge status="critical">FAILED</Badge>}
      subtitle="Subscription Contracts"
    >
      <Frame>
        <TitleBar title="Payment Failures" />
        {toastMarkup}
        <Card sectioned>
          <SearchBar />
        </Card>
        <Card title="Subscriptions" sectioned>
          {data && subscriptionContracts.length > 0 ? (
            <Table
              contentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
              headings={[
                'Status',
                'ID',
                'Email',
                'Next Order Date',
                'Last Payment Status',
                'Actions',
              ]}
              rows={subscriptionContracts.map(c => {
                const { contract } = c;
                return [
                  <Badge
                    status={
                      contract.status === 'ACTIVE' ? 'success' : 'warning'
                    }
                  >
                    {contract.status}
                  </Badge>,
                  formatId(contract.id),
                  contract.customer.email,
                  formatDate(contract.nextBillingDate),
                  contract.lastPaymentStatus,
                  <Button
                    plain
                    onClick={() =>
                      appRedirect(
                        `/subscriptions?customer_id=${formatId(
                          contract.customer.id
                        )}&id=${formatId(contract.id)}`
                      )
                    }
                  >
                    View
                  </Button>,
                ];
              })}
            />
          ) : (
            <p style={{ textAlign: 'center' }}>No Subscriptions Found</p>
          )}
        </Card>
      </Frame>
    </Page>
  );
}

export default Index;
