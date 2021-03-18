import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import {
  Avatar,
  Button,
  Frame,
  Heading,
  Loading,
  Page,
  TextStyle,
  Thumbnail,
  Toast,
} from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import styled from 'styled-components';
import {
  GET_SUBSCRIPTION_BY_ID,
  UPDATE_PAYMENT_METHOD,
  UPDATE_SUBSCRIPTION_CONTRACT,
  UPDATE_SUBSCRIPTION_DRAFT,
  COMMIT_SUBSCRIPTION_DRAFT,
} from '../handlers';
import { formatDate } from '../utils/formatters';

const CustomerInfo = styled.div`
  font-size: 1em;
  margin: 20px 0;
  h3,
  .bold {
    font-weight: bold;
  }
  .customer {
    display: grid;
    grid-template-columns: 50px auto auto;
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

function UpdatePaymentMethod(props: {
  id: string;
  toggleActive: () => void;
  setMsg: (msg: string) => void;
}) {
  const { id, toggleActive, setMsg } = props;
  // send the payment update email, update toast message and make it active
  const [updatePaymentMethod] = useMutation(UPDATE_PAYMENT_METHOD, {
    onCompleted: () => {
      setMsg('Sent Update Payment Email');
      toggleActive();
    },
  });

  const handleClick = (id: string) => {
    updatePaymentMethod({
      variables: {
        customerPaymentMethodId: id,
      },
    });
  };

  return (
    <Button onClick={() => handleClick(id)}>
      Send Update Payment Method Email
    </Button>
  );
}

function UpdateSubscriptionContract(props: {
  id: string;
  toggleActive: () => void;
  setMsg: (msg: string) => void;
}) {
  const { id, toggleActive, setMsg } = props;
  // update subscription contract -> draft id
  const [updateSubscriptionContract] = useMutation(
    UPDATE_SUBSCRIPTION_CONTRACT,
    {
      onCompleted: data =>
        updateDraft(data.subscriptionContractUpdate.draft.id),
    }
  );
  // update subscription draft -> draft id
  const [updateSubscriptionDraft] = useMutation(UPDATE_SUBSCRIPTION_DRAFT, {
    onCompleted: data => commitDraft(data.subscriptionDraftUpdate.draft.id),
  });
  // commit subscription draft -> update toast msg and make it active
  const [commitSubscriptionDraft] = useMutation(COMMIT_SUBSCRIPTION_DRAFT, {
    onCompleted: () => {
      setMsg('Updated Subscription');
      toggleActive();
    },
  });

  const handleClick = (id: string) => {
    console.log('Handling Update Click', id);
    try {
      updateSubscriptionContract({
        variables: {
          contractId: id,
        },
      });
    } catch (e) {
      console.log('Update Contract Error', e.message);
    }
  };

  const updateDraft = (draftId: string) => {
    console.log('Updateing Draft', draftId);
    const input = {
      nextBillingDate: new Date('3/19/2021'),
    };
    try {
      updateSubscriptionDraft({
        variables: {
          draftId: draftId,
          input: input,
        },
      });
    } catch (e) {
      console.log('Update Draft Error', e.message);
    }
  };

  const commitDraft = (draftId: string) => {
    console.log('Committing Draft', draftId);
    try {
      commitSubscriptionDraft({
        variables: {
          draftId: draftId,
        },
      });
    } catch (e) {
      console.log('Commit Draft Error', e.message);
    }
  };

  return (
    <Button onClick={() => handleClick(id)}>
      Update Subscription Contract
    </Button>
  );
}

function Subscriptions() {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const router = useRouter();

  const [active, setActive] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const toggleActive = useCallback(() => setActive(active => !active), []);
  const setMsg = useCallback(msg => setToastMsg(msg), []);

  const toastMarkup = active ? (
    <Toast content={toastMsg} onDismiss={toggleActive} />
  ) : null;

  const adminRedirect = (href: string) => {
    console.log('redirecting');
    redirect.dispatch(Redirect.Action.ADMIN_PATH, href);
  };

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

  if (loading)
    return (
      <Frame>
        <Loading />
      </Frame>
    );
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;
  const d = data.subscriptionContract;

  return (
    <Page>
      <Frame>
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
                <div className="actions">
                  <UpdatePaymentMethod
                    id={d.customerPaymentMethod.id}
                    toggleActive={toggleActive}
                    setMsg={setMsg}
                  />
                  <UpdateSubscriptionContract
                    id={d.id}
                    toggleActive={toggleActive}
                    setMsg={setMsg}
                  />
                </div>
              </div>
            </CustomerInfo>
            <SubscriptionInformation>
              <h3>Subscription Information</h3>
              <hr />
              <p>
                <span className="bold">Original Order: </span>
                <Button
                  onClick={() =>
                    adminRedirect(`/orders/${d.originOrder.legacyResourceId}`)
                  }
                >
                  View
                </Button>
              </p>
              <p>
                <span className="bold">Next Order Date: </span>
                {formatDate(d.nextBillingDate)}
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
                      {line.node.title} {line.node.variantTitle} x{' '}
                      {line.node.quantity} @{' '}
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
        {toastMarkup}
      </Frame>
    </Page>
  );
}

export default Subscriptions;
