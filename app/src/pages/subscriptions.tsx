import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Badge,
  Card,
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
import ErrorState from '../components/ErrorState';
import CustomerInformation from '../components/CustomerInformation';
import SubscriptionInformation from '../components/SubscriptionInformation';
import UpdateSubscriptionButton from '../components/UpdateSubscriptionButton';
import UpdatePaymentMethodButton from '../components/UpdatePaymentMethodButton';
import { SubscriptionContract, Line } from '../types/subscriptions';

function EditSubscription() {
  // Get id from path
  const router = useRouter();
  // Create redirects
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  // State
  const [status, setStatus] = useState<string>('');
  const [contractId, setContractId] = useState<string>('');
  const [nextBillingDate, setNextBillingDate] = useState<string>('');
  const [lineItems, setLineItems] = useState<Line[]>([]);
  const [lineItem, setLineItem] = useState<string>('');
  const [lineId, setLineId] = useState<string>('');
  const [lineItemQuantity, setLineItemQuantity] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>('');
  const [address1, setAddress1] = useState<string>('');
  const [address2, setAddress2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [zip, setZip] = useState<string>('');

  const [active, setActive] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const toggleActive = useCallback(() => setActive(active => !active), []);
  const setMsg = useCallback(msg => setToastMsg(msg), []);
  const setToastError = useCallback(error => setIsError(error), []);
  // Toast
  const toastMarkup = active ? (
    <Toast content={toastMsg} onDismiss={toggleActive} error={isError} />
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
      id: `gid://shopify/SubscriptionContract/${router.query.id}`,
    },
    onCompleted: data => setInitialData(data),
  });
  // Set Data
  const setInitialData = (data: {
    subscriptionContract: SubscriptionContract;
  }) => {
    if (data.subscriptionContract) {
      const d = data.subscriptionContract;
      setStatus(d.status);
      setContractId(d.id);
      setNextBillingDate(d.nextBillingDate.split('T')[0]);
      setLineItem(d.lines.edges[0].node.productId);
      setLineId(d.lines.edges[0].node.id);
      setLineItemQuantity(String(d.lines.edges[0].node.quantity));
      setLineItems(d.lines.edges);
      setPaymentMethod(d.customerPaymentMethod.id);
      setCompany(d.deliveryMethod.address.company);
      setAddress1(d.deliveryMethod.address.address1);
      setAddress2(d.deliveryMethod.address.address2);
      setCity(d.deliveryMethod.address.city);
      setCountry(d.deliveryMethod.address.country);
      setProvince(d.deliveryMethod.address.province);
      setZip(d.deliveryMethod.address.zip);
      setFirstName(d.deliveryMethod.address.firstName);
      setLastName(d.deliveryMethod.address.lastName);
    }
  };

  const handleNextBillingDateChange = (date: string) => {
    setNextBillingDate(date);
  };

  const handleLineItemChange = (productId: string) => {
    lineItems.map((line: Line) => {
      if (line.node.productId === productId) {
        setLineItemQuantity(String(line.node.quantity));
        setLineId(line.node.id);
      }
    });
    setLineItem(productId);
  };

  const handleLineItemQuantityChange = (quantity: string) => {
    setLineItemQuantity(quantity);
  };

  const handleStatusChange = (status: string) => {
    setStatus(status);
  };

  // Redirects
  const adminRedirect = (href: string) => {
    redirect.dispatch(Redirect.Action.ADMIN_PATH, href);
  };

  const appRedirect = () => {
    redirect.dispatch(Redirect.Action.APP, '/');
  };

  if (loading) return <LoadingSubscription />;
  if (error) return <ErrorState err={error.message} />;

  if (data.subscriptionContract) {
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
                : 'warning'
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
            <Layout.AnnotatedSection title="Status" description="Update Status">
              <Card sectioned>
                <Select
                  label="Status"
                  options={[
                    { label: 'Active', value: 'ACTIVE' },
                    { label: 'Cancel', value: 'CANCELLED' },
                    { label: 'Pause', value: 'PAUSED' },
                  ]}
                  onChange={status => handleStatusChange(status)}
                  value={status}
                />
                <Stack distribution="trailing">
                  <UpdateSubscriptionButton
                    contractId={contractId}
                    input={{ status: status }}
                    lineId={null}
                    toggleActive={toggleActive}
                    setMsg={setMsg}
                    setToastError={setToastError}
                    refetch={refetch}
                  />
                </Stack>
              </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="Next Billing Date"
              description="Change / Update Next Billing Date"
            >
              <Card sectioned>
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
                    input={{ nextBillingDate: nextBillingDate }}
                    lineId={null}
                    toggleActive={toggleActive}
                    setMsg={setMsg}
                    setToastError={setToastError}
                    refetch={refetch}
                  />
                </Stack>
              </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="Product"
              description="Select Product to Update Quantity"
            >
              <Card sectioned>
                <Select
                  label="Item"
                  options={data.subscriptionContract.lines.edges.map(
                    (line: Line) => {
                      const label = line.node.variantTitle
                        ? `${line.node.title} - ${line.node.variantTitle}`
                        : `${line.node.title}`;
                      return {
                        label: label,
                        value: line.node.productId,
                      };
                    }
                  )}
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
                    setToastError={setToastError}
                    refetch={refetch}
                  />
                </Stack>
              </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="Payment Method"
              description="Send Update Payment Method Email"
            >
              <Card sectioned>
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
                    setToastError={setToastError}
                    refetch={refetch}
                  />
                </Stack>
              </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
              title="Address"
              description="Update Shipping Address"
            >
              <Card sectioned>
                <TextField
                  label="Company"
                  type="text"
                  placeholder="Company"
                  onChange={company => setCompany(company)}
                  value={company}
                />
                <TextField
                  label="First Name"
                  type="text"
                  placeholder="First Name"
                  onChange={firstName => setFirstName(firstName)}
                  value={firstName}
                />
                <TextField
                  label="Last Name"
                  type="text"
                  placeholder="Last Name"
                  onChange={lastName => setLastName(lastName)}
                  value={lastName}
                />
                <TextField
                  label="Address 1"
                  type="text"
                  placeholder="Address1"
                  onChange={address1 => setAddress1(address1)}
                  value={address1}
                />
                <TextField
                  label="Address 2"
                  type="text"
                  placeholder="Address2"
                  onChange={address2 => setAddress2(address2)}
                  value={address2}
                />
                <TextField
                  label="City"
                  type="text"
                  placeholder="City"
                  onChange={city => setCity(city)}
                  value={city}
                />
                <TextField
                  label="Province"
                  type="text"
                  placeholder="Province"
                  onChange={province => setProvince(province)}
                  value={province}
                />
                <TextField
                  label="Country"
                  type="text"
                  placeholder="Country"
                  onChange={country => setCountry(country)}
                  value={country}
                />
                <TextField
                  label="Zip"
                  type="text"
                  placeholder="Zip"
                  onChange={zip => setZip(zip)}
                  value={zip}
                />
                <Stack distribution="trailing">
                  <UpdateSubscriptionButton
                    contractId={contractId}
                    input={{
                      deliveryMethod: {
                        shipping: {
                          address: {
                            company,
                            firstName,
                            lastName,
                            address1,
                            address2,
                            city,
                            province,
                            country,
                            zip,
                          },
                        },
                      },
                    }}
                    toggleActive={toggleActive}
                    setMsg={setMsg}
                    setToastError={setToastError}
                    refetch={refetch}
                  />
                </Stack>
              </Card>
            </Layout.AnnotatedSection>
          </Layout>
          {toastMarkup}
        </Frame>
      </Page>
    );
  } else {
    return (
      <Page>
        <ErrorState
          err={`Subscription Contract (${router?.query.id}) Not Found!`}
        />
      </Page>
    );
  }
}

export default EditSubscription;
