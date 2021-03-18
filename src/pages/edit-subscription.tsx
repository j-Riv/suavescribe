import React, { useState, useEffect } from 'react';
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
import { useQuery, useMutation } from '@apollo/client';
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
  const [nextBillingDate, setNextBillingDate] = useState<string>();
  const [lineItems, setLineItems] = useState<any[]>();
  const [lineItem, setLineItem] = useState<string>();
  const [lineItemQuantity, setLineItemQuantity] = useState<string>();
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_SUBSCRIPTION_BY_ID, {
    variables: {
      id: router.query.id,
    },
    onCompleted: data => {
      const d = data.subscriptionContract;
      console.log('Setting Next Billing Date', d.nextBillingDate.split('T')[0]);
      setNextBillingDate(d.nextBillingDate.split('T')[0]);
      console.log('Setting Line Item', d.lines.edges[0].node.productId);
      setLineItem(d.lines.edges[0].node.productId);
      console.log('Setting Line Item Quantity', d.lines.edges[0].node.quantity);
      setLineItemQuantity(d.lines.edges[0].node.quantity);
      console.log('Setting Line Items', d.lines.edges);
      setLineItems(d.lines.edges);
    },
  });

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
      {data && (
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
                      Save
                    </Button>
                  </Stack>
                </FormLayout>
              </Form>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title="Product Updates"
            description="Select Product to Update Quantity"
          >
            <Card sectioned>
              <Form onSubmit={() => handleSubmitLineItemQuantity}>
                <FormLayout>
                  <Select
                    label="Line Items"
                    options={data.subscriptionContract.lines.edges.map(line => {
                      return {
                        label: `${line.node.title} - ${line.node.variantTitle}`,
                        value: line.node.productId,
                      };
                    })}
                    onChange={lineItem => handleLineItemChange(lineItem)}
                    value={lineItem}
                  />
                  <Select
                    label="Quantity"
                    options={['1', '2', '3', '4', '5'].map(value => {
                      return { label: value, value: value };
                    })}
                    onChange={lineItemQuantity =>
                      handleLineItemQuantityChange(lineItemQuantity)
                    }
                    value={lineItemQuantity}
                  />
                  <Stack distribution="trailing">
                    <Button primary submit>
                      Save
                    </Button>
                  </Stack>
                </FormLayout>
              </Form>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      )}
    </Page>
  );
}

export default EditSubscription;
