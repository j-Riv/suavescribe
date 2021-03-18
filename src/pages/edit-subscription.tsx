import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Card,
  Form,
  FormLayout,
  Frame,
  Heading,
  Layout,
  Loading,
  Page,
  Select,
  SettingToggle,
  Stack,
  TextField,
  TextStyle,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { Redirect } from '@shopify/app-bridge/actions';
import styled from 'styled-components';
import {
  GET_SUBSCRIPTION_BY_ID,
  UPDATE_PAYMENT_METHOD,
  UPDATE_SUBSCRIPTION_CONTRACT,
  UPDATE_SUBSCRIPTION_DRAFT,
  COMMIT_SUBSCRIPTION_DRAFT,
} from '../handlers';
import { formatDate, formatId } from '../utils/formatters';

function EditSubscription() {
  const router = useRouter();
  // const { loading, error, data } = useQuery(GET_SUBSCRIPTION_BY_ID, {
  //   variables: {
  //     id: router.query.id,
  //   },
  //   onCompleted: data => setData(data),
  // });
  const { loading, error, data } = useQuery(GET_SUBSCRIPTION_BY_ID, {
    variables: {
      id: router.query.id,
    },
    onCompleted: data => setInitialData(data),
  });

  const [nextBillingDate, setNextBillingDate] = useState<string>();
  const [lineItems, setLineItems] = useState<any[]>();
  const [lineItem, setLineItem] = useState<string>();
  const [lineItemQuantity, setLineItemQuantity] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<string>();

  const setInitialData = (data: any) => {
    console.log('data', data);
    const d = data.subscriptionContract;
    console.log('Setting Next Billing Date', d.nextBillingDate.split('T')[0]);
    setNextBillingDate(d.nextBillingDate.split('T')[0]);
    console.log('Setting Line Item', d.lines.edges[0].node.productId);
    setLineItem(d.lines.edges[0].node.productId);
    console.log('Setting Line Item Quantity', d.lines.edges[0].node.quantity);
    setLineItemQuantity(String(d.lines.edges[0].node.quantity));
    console.log('Setting Line Items', d.lines.edges);
    setLineItems(d.lines.edges);
    console.log('Setting Payment Method Id', d.customerPaymentMethod.id);
    setPaymentMethod(d.customerPaymentMethod.id);
  };

  const handleSubmitNextBillingDate = () => {
    console.log('submission', nextBillingDate);
  };

  const handleNextBillingDateChange = (date: string) => {
    setNextBillingDate(date);
    console.log('hasChanged', nextBillingDate);
  };

  const handleSubmitLineItemQuantity = () => {
    console.log('submission', lineItemQuantity);
  };

  const handleLineItemChange = (productId: string) => {
    lineItems.map(node => {
      if (node.productId === productId) {
        console.log('Setting Quantity in Loop', node.quantity);
        setLineItemQuantity(node.quantity);
      }
    });
    setLineItem(productId);
  };

  const handleLineItemQuantityChange = (quantity: string) => {
    setLineItemQuantity(quantity);
  };

  if (loading)
    return (
      <Frame>
        <Loading />
      </Frame>
    );
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;

  return (
    <Page>
      <TitleBar title="Edit Subscription" />
      <Heading>
        <TextStyle variation="positive">
          Edit Subscription ({formatId(data.subscriptionContract.id)})
        </TextStyle>
      </Heading>
      <Layout>
        <Layout.AnnotatedSection
          title="Next Billing Date"
          description="Change / Update Next Billing Date"
        >
          <Card sectioned>
            <Form onSubmit={() => handleSubmitNextBillingDate}>
              <FormLayout>
                <TextField
                  value={nextBillingDate}
                  onChange={nextBillingDate =>
                    handleNextBillingDateChange(nextBillingDate)
                  }
                  label="Next Billing Date"
                  type="date"
                />
                <Stack distribution="trailing">
                  <Button primary submit>
                    Update
                  </Button>
                </Stack>
              </FormLayout>
            </Form>
          </Card>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection
          title="Product"
          description="Select Product to Update Quantity"
        >
          <Card sectioned>
            <Form onSubmit={() => handleSubmitLineItemQuantity}>
              <FormLayout>
                <Select
                  label="Item"
                  options={data.subscriptionContract.lines.edges.map(line => {
                    return {
                      label: `${line.node.title} - ${line.node.variantTitle}`,
                      value: line.node.productId,
                    };
                  })}
                  onChange={lineItem => handleLineItemChange(lineItem)}
                  value={lineItem}
                />
                <TextField
                  value={lineItemQuantity}
                  onChange={lineItemQuantity =>
                    handleLineItemQuantityChange(lineItemQuantity)
                  }
                  label="Quantity"
                  type="number"
                />
                <Stack distribution="trailing">
                  <Button primary submit>
                    Update
                  </Button>
                </Stack>
              </FormLayout>
            </Form>
          </Card>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection
          title="Payment Method"
          description="Send Update Payment Method Email"
        >
          <Card sectioned>
            <Form onSubmit={() => console.log('clicked')}>
              <FormLayout>
                <TextField
                  label="Payment Method ID"
                  disabled
                  value={paymentMethod}
                />
                <Stack distribution="trailing">
                  <Button primary submit>
                    Update
                  </Button>
                </Stack>
              </FormLayout>
            </Form>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}

export default EditSubscription;
