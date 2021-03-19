import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Badge,
  Card,
  Form,
  FormLayout,
  Frame,
  Layout,
  Page,
  Select,
  Stack,
  TextField,
  TextStyle,
  Toast,
} from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { useQuery } from '@apollo/client';
import { Redirect } from '@shopify/app-bridge/actions';
import { GET_SUBSCRIPTION_BY_ID } from '../handlers';
import { formatId } from '../utils/formatters';
import LoadingSubscription from '../components/LoadingSubscription';
import CustomerInformation from '../components/CustomerInformation';
import SubscriptionInformation from '../components/SubscriptionInformation';
import UpdateSubscriptionButton from '../components/UpdateSubscriptionButton';
import UpdatePaymentMethodButton from '../components/UpdatePaymentMethodButton';

function EditSubscription() {
  // Get id from path
  const router = useRouter();
  // Create redirects
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  // State
  const [contractId, setContractId] = useState<string>();
  const [nextBillingDate, setNextBillingDate] = useState<string>();
  const [lineItems, setLineItems] = useState<any[]>();
  const [lineItem, setLineItem] = useState<string>();
  const [lineId, setLineId] = useState<string>();
  const [lineItemQuantity, setLineItemQuantity] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<string>();

  const [active, setActive] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const toggleActive = useCallback(() => setActive(active => !active), []);
  const setMsg = useCallback(msg => setToastMsg(msg), []);
  // Toast
  const toastMarkup = active ? (
    <Toast content={toastMsg} onDismiss={toggleActive} />
  ) : null;
  // Exit if no id
  if (!router?.query.id)
    return (
      <div>
        <TextStyle variation="negative">
          Error! No Subscription Contract ID Supplied.
        </TextStyle>
      </div>
    );
  // Get Data
  const { loading, error, data, refetch } = useQuery(GET_SUBSCRIPTION_BY_ID, {
    variables: {
      id: router.query.id,
    },
    onCompleted: data => setInitialData(data),
  });
  // Set Data
  const setInitialData = (data: any) => {
    const d = data.subscriptionContract;
    setContractId(d.id);
    setNextBillingDate(d.nextBillingDate.split('T')[0]);
    setLineItem(d.lines.edges[0].node.productId);
    setLineId(d.lines.edges[0].node.id);
    setLineItemQuantity(String(d.lines.edges[0].node.quantity));
    setLineItems(d.lines.edges);
    setPaymentMethod(d.customerPaymentMethod.id);
  };

  const handleNextBillingDateChange = (date: string) => {
    setNextBillingDate(date);
    console.log('hasChanged', nextBillingDate);
  };

  const handleLineItemChange = (productId: string) => {
    lineItems.map(node => {
      if (node.productId === productId) {
        console.log('Setting Quantity in Loop', node.quantity);
        setLineItemQuantity(node.quantity);
        setLineId(node.id);
      }
    });
    setLineItem(productId);
  };

  const handleLineItemQuantityChange = (quantity: string) => {
    setLineItemQuantity(quantity);
  };

  const adminRedirect = (href: string) => {
    console.log('redirecting');
    redirect.dispatch(Redirect.Action.ADMIN_PATH, href);
  };

  const appRedirect = () => {
    console.log('redirecting');
    redirect.dispatch(Redirect.Action.APP, '/');
  };

  if (loading) return <LoadingSubscription />;
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;

  return (
    <Page
      breadcrumbs={[{ content: 'Dashboard', onAction: appRedirect }]}
      title="Edit Subscription"
      subtitle={`Subscription (${formatId(data.subscriptionContract.id)}) `}
      titleMetadata={
        <Badge
          status={
            data.subscriptionContract.status === 'ACTIVE'
              ? 'success'
              : 'attention'
          }
        >
          {data.subscriptionContract.status}
        </Badge>
      }
    >
      <Frame>
        <TitleBar title="Edit Subscription" />
        <Layout>
          <Layout.Section>
            <CustomerInformation data={data} />
          </Layout.Section>
          <Layout.Section>
            <SubscriptionInformation
              data={data}
              adminRedirect={adminRedirect}
            />
          </Layout.Section>
          <Layout.AnnotatedSection
            title="Next Billing Date"
            description="Change / Update Next Billing Date"
          >
            <Card sectioned>
              <Form onSubmit={() => console.log('submited')}>
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
                    <UpdateSubscriptionButton
                      contractId={contractId}
                      input={{ nextBillingDate: new Date(nextBillingDate) }}
                      lineId={null}
                      toggleActive={toggleActive}
                      setMsg={setMsg}
                      refetch={refetch}
                    />
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
              <Form onSubmit={() => console.log('submited')}>
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
                    <UpdateSubscriptionButton
                      contractId={contractId}
                      input={{ quantity: Number(lineItemQuantity) }}
                      lineId={lineId}
                      toggleActive={toggleActive}
                      setMsg={setMsg}
                      refetch={refetch}
                    />
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
                    <UpdatePaymentMethodButton
                      id={paymentMethod}
                      toggleActive={toggleActive}
                      setMsg={setMsg}
                      refetch={refetch}
                    />
                  </Stack>
                </FormLayout>
              </Form>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
        {toastMarkup}
      </Frame>
    </Page>
  );
}

export default EditSubscription;
