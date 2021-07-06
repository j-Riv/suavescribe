import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Badge, Button, Card, Page } from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { GET_CUSTOMER_SUBSCRIPTION_CONTRACTS_BY_EMAIL } from '../handlers';
import { formatDate, formatId } from '../utils/formatters';
import Table from '../components/Table';
import LoadingIndex from '../components/LoadingIndex';
import ErrorState from '../components/ErrorState';
import SearchBar from '../components/SearchBar';

function Index() {
  const router = useRouter();
  // search state
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const { loading, error, data } = useQuery(
    GET_CUSTOMER_SUBSCRIPTION_CONTRACTS_BY_EMAIL,
    {
      variables: {
        first: 50,
        query: `email:${router?.query.email}`,
      },
    }
  );

  if (loading) return <LoadingIndex tableRows={5} />;
  if (error) return <ErrorState err={error.message} />;

  if (data?.customers?.edges.length > 0) {
    const customer = data?.customers?.edges[0].node;
    const subscriptionContracts = customer.subscriptionContracts?.edges;

    const appRedirect = (href: string) => {
      redirect.dispatch(Redirect.Action.APP, href);
    };

    return (
      <Page
        title="Search"
        titleMetadata={<Badge status="success">Active</Badge>}
        subtitle={`Subscription Contracts for Customer: ${router?.query.email}`}
      >
        <TitleBar title="Subscriptions" />
        <Card sectioned>
          <SearchBar />
        </Card>
        <Card title="Subscriptions" sectioned>
          {data && (
            <Table
              contentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
              headings={[
                'Status',
                'ID',
                'Email',
                'Customer ID',
                'Next Order Date',
                'Actions',
              ]}
              rows={subscriptionContracts.map(contract => {
                return [
                  <Badge
                    status={
                      contract.node.status === 'ACTIVE' ? 'success' : 'warning'
                    }
                  >
                    {contract.node.status}
                  </Badge>,
                  formatId(contract.node.id),
                  contract.node.customer.email,
                  formatId(contract.node.customer.id),
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
        </Card>
      </Page>
    );
  } else {
    return (
      <Page
        title="Search"
        titleMetadata={<Badge status="success">Active</Badge>}
        subtitle={`Subscription Contracts for Customer: ${router?.query.email}`}
      >
        <TitleBar title="Subscriptions" />
        <Card sectioned>
          <SearchBar />
        </Card>
        <Card title="Subscriptions" sectioned>
          <p>No Subscription Contracts Found!</p>
        </Card>
      </Page>
    );
  }
}

export default Index;
