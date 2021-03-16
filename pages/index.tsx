import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Heading, Page, TextStyle } from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import styled from 'styled-components';

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
`;

const GET_ALL_SUBSCRIPTION_CONTRACTS = gql`
  query {
    subscriptionContracts(first: 10) {
      edges {
        node {
          id
          createdAt
          status
          nextBillingDate
          appAdminUrl
          customer {
            id
            firstName
            lastName
            email
          }
          lines(first: 10) {
            edges {
              node {
                id
                productId
                pricingPolicy {
                  cycleDiscounts {
                    adjustmentType
                    adjustmentValue {
                      __typename
                    }
                    computedPrice {
                      amount
                    }
                  }
                  basePrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          billingPolicy {
            interval
            intervalCount
          }
          billingPolicy {
            interval
            intervalCount
          }
        }
      }
    }
  }
`;

function Index() {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const { loading, error, data } = useQuery(GET_ALL_SUBSCRIPTION_CONTRACTS);

  if (loading) return <TextStyle variation="positive">Loading...</TextStyle>;
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;

  const handleClick = (href: string) => {
    console.log('redirecting');
    redirect.dispatch(Redirect.Action.APP, href);
  };

  const formatId = (id: string) => {
    const strippedId = id.split('/');
    return strippedId[strippedId.length - 1];
  };

  const formatDate = (date: string) => {
    const formattedDate = date.split('T');
    return formattedDate[0];
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
          data.subscriptionContracts.edges.map(contract => (
            <TableRow key={contract.node.id}>
              <div>{formatId(contract.node.id)}</div>
              <div>{contract.node.customer.email}</div>
              <div>{formatId(contract.node.id)}</div>
              <div>{formatDate(contract.node.createdAt)}</div>
              <div>{formatDate(contract.node.nextBillingDate)}</div>
              <div>
                <button
                  onClick={() =>
                    handleClick(
                      `/subscriptions?customer_id=${contract.node.customer.id}&id=${contract.node.id}`
                    )
                  }
                >
                  View
                </button>
              </div>
            </TableRow>
          ))}
      </div>
    </Page>
  );
}

export default Index;
