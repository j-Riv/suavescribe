import React from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { Avatar, Heading, Page, TextStyle, Thumbnail } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import styled from 'styled-components';

const CustomerInfo = styled.div`
  font-size: 1em;
  margin: 20px 0;
  h3,
  .bold {
    font-weight: bold;
  }
  .customer {
    display: grid;
    grid-template-columns: 50px auto;
  }
`;

const SubscriptionInformation = styled.div`
  margin: 20px 0;
  h3,
  h4,
  .bold {
    font-weight: bold;
  }
  .product {
    display: grid;
    grid-template-columns: 50px auto;
    .information {
      padding: 10px;
    }
  }
`;

const GET_SUBSCRIPTION_BY_ID = gql`
  query subscriptionContract($id: ID!) {
    subscriptionContract(id: $id) {
      id
      status
      nextBillingDate
      customer {
        id
        firstName
        lastName
        email
      }
      deliveryPrice {
        currencyCode
        amount
      }
      lineCount
      lines(first: 10) {
        edges {
          node {
            id
            productId
            title
            quantity
            requiresShipping
            variantImage {
              originalSrc
              altText
            }
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
    }
  }
`;

function Subscriptions() {
  const router = useRouter();

  if (!router?.query.id)
    return (
      <div>
        <TextStyle variation="negative">
          Error! No Subscription Contract ID Supplied.
        </TextStyle>
      </div>
    );

  const { loading, error, data } = useQuery(GET_SUBSCRIPTION_BY_ID, {
    variables: {
      id: router.query.id,
    },
  });

  if (loading) return <TextStyle variation="positive">Loading...</TextStyle>;
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;
  const d = data.subscriptionContract;

  return (
    <Page>
      <TitleBar title="Subscription Contract" />
      <Heading>
        <TextStyle variation="positive">Subscription Contract</TextStyle>
      </Heading>
      {data && (
        <>
          <CustomerInfo>
            <h3>Customer Information</h3>
            <hr />
            <div className="customer">
              <Avatar
                customer
                size="medium"
                name={`${d.customer.firstName} ${d.customer.lastName}`}
              />
              <div>
                <p>
                  <span className="bold">Name: </span>
                  {`${d.customer.firstName} ${d.customer.lastName}`}
                </p>
                <p>
                  <span className="bold">Email: </span>
                  {d.customer.email}
                </p>
              </div>
            </div>
          </CustomerInfo>
          <SubscriptionInformation>
            <h3>Subscription Information</h3>
            <hr />
            <p>
              <span className="bold">Next Order Date: </span>{' '}
              {d.nextBillingDate}
            </p>
            <h4>Products</h4>
            <div className="products">
              {d.lines.edges.map(line => (
                <div key={line.node.id} className="product">
                  <Thumbnail
                    source={line.node.variantImage.originalSrc}
                    alt={line.node.variantImage.altText}
                  />
                  <div className="information">
                    {line.node.title} x {line.node.quantity} @{' '}
                    {
                      line.node.pricingPolicy.cycleDiscounts[0].computedPrice
                        .amount
                    }
                  </div>
                </div>
              ))}
            </div>
          </SubscriptionInformation>
        </>
      )}
    </Page>
  );
}

export default Subscriptions;
