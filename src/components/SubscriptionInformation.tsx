import React from 'react';
import { Button, Card, Thumbnail } from '@shopify/polaris';
import styled from 'styled-components';
import { formatDate, formatMoney } from '../utils/formatters';

const Container = styled.div`
  .product {
    display: grid;
    grid-template-columns: 50px auto;
    .information {
      padding: 10px;
    }
  }
  .bold {
    font-weight: bold;
  }
`;

function SubscriptionInformation(props: {
  data: any;
  adminRedirect: (url: string) => void;
}) {
  const { data, adminRedirect } = props;

  return (
    <Card title="Subscription" sectioned>
      <Container>
        <Button
          plain
          onClick={() =>
            adminRedirect(
              `/orders/${data.subscriptionContract.originOrder.legacyResourceId}`
            )
          }
        >
          View Original Order
        </Button>
        <p>
          <span className="bold">Next Order Date: </span>
          {formatDate(data.subscriptionContract.nextBillingDate)}
        </p>
        <div className="products">
          {data.subscriptionContract.lines.edges.length ? (
            data.subscriptionContract.lines.edges.map(line => (
              <div key={line.node.id} className="product">
                <Thumbnail
                  source={line.node.variantImage.originalSrc}
                  alt={line.node.variantImage.altText}
                />
                <div className="information">
                  <p>{`${line.node.title} - ${line.node.variantTitle}`}</p>
                  <p>
                    {` x ${line.node.quantity} @ $${formatMoney(
                      line.node.pricingPolicy.cycleDiscounts[0].computedPrice
                        .amount
                    )}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>There are currently no products with this Selling Plan Group.</p>
          )}
        </div>
      </Container>
    </Card>
  );
}

export default SubscriptionInformation;
