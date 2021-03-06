import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  Frame,
  Layout,
  Page,
  Select,
  TextField,
  TextStyle,
  Thumbnail,
  Toast,
} from '@shopify/polaris';
import styled from 'styled-components';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { useQuery, useMutation } from '@apollo/client';
import { Redirect } from '@shopify/app-bridge/actions';
import {
  GET_SELLING_PLAN_GROUP_BY_ID,
  DELETE_SELLING_PLAN_GROUP,
} from '../handlers';
import { formatId } from '../utils/formatters';
import LoadingSellingPlan from '../components/LoadingSellingPlan';
import ErrorState from '../components/ErrorState';
import UpdateSellingPlanGroupButton from '../components/UpdateSellingPlanGroupButton';
import { Product as ShopifyProduct } from '../types/subscriptions';

const Information = styled.div`
  .bold {
    font-weight: bold;
  }
`;

const Product = styled.div`
  display: grid;
  grid-template-columns: 50px auto;
  gap: 2em;
  align-items: center;
`;

const Message = styled.p`
  padding-bottom: 15px;
`;

function SellingPlanGroup() {
  // Get id from path
  const router = useRouter();
  // Create redirects
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  // state

  // Exit if no id
  if (!router?.query.id)
    return (
      <div>
        <TextStyle variation="negative">
          Error! No Subscription Contract ID Supplied.
        </TextStyle>
      </div>
    );

  // state
  const [planTitle, setPlanTitle] = useState<string>();
  const [merchantCode, setMerchantCode] = useState<string>();
  const [options, setOptions] = useState<string>();
  const [interval, setInterval] = useState<string>();
  const [percentOff, setPercentOff] = useState<string>();

  const [active, setActive] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  // Toast
  const toggleActive = useCallback(() => setActive(active => !active), []);
  const setMsg = useCallback(msg => setToastMsg(msg), []);
  const setToastError = useCallback(error => setIsError(error), []);
  const toastMarkup = active ? (
    <Toast content={toastMsg} onDismiss={toggleActive} error={isError} />
  ) : null;

  // Get Data
  const { loading, error, data, refetch } = useQuery(
    GET_SELLING_PLAN_GROUP_BY_ID,
    {
      variables: {
        id: router.query.id,
      },
      onCompleted: data => {
        if (data.sellingPlanGroup) {
          const sellingPlanGroup = data.sellingPlanGroup;
          const sellingPlan = sellingPlanGroup.sellingPlans.edges[0];
          const interval = sellingPlan.node.billingPolicy.interval;
          const percentage = String(
            sellingPlan.node.pricingPolicies[0].adjustmentValue.percentage
          );
          setPlanTitle(sellingPlanGroup.name);
          setMerchantCode(sellingPlanGroup.merchantCode);
          setOptions(sellingPlanGroup.options[0]);
          setInterval(interval);
          setPercentOff(percentage);
        }
      },
    }
  );
  // delete selling plan group
  const [deleteSellingGroup] = useMutation(DELETE_SELLING_PLAN_GROUP, {
    onCompleted: () => appRedirect(),
  });

  // actions
  const handleDelete = (id: string) => {
    deleteSellingGroup({
      variables: {
        id: id,
      },
    });
  };
  // redirects
  const adminRedirect = (href: string) => {
    redirect.dispatch(Redirect.Action.ADMIN_PATH, href);
  };

  const appRedirect = () => {
    redirect.dispatch(Redirect.Action.APP, '/selling-plan-groups');
  };

  if (loading) return <LoadingSellingPlan />;
  if (error) return <ErrorState err={error.message} />;

  if (data.sellingPlanGroup) {
    return (
      <Page
        breadcrumbs={[
          { content: 'All Selling Plan Groups', onAction: appRedirect },
        ]}
        title="Selling Plan Group"
        subtitle={`ID: (${formatId(data.sellingPlanGroup.id)}) `}
        primaryAction={{
          content: 'Cancel',
          onAction: () => appRedirect(),
        }}
      >
        <Frame>
          <TitleBar
            title="Selling Plan Group"
            primaryAction={{
              content: 'Delete',
              onAction: () => handleDelete(data.sellingPlanGroup.id),
              destructive: true,
            }}
          />
          <Layout>
            <Layout.Section>
              <Card title="Information" sectioned>
                <Information>
                  <p>
                    <span className="bold">Name: </span>
                    {data.sellingPlanGroup.name}
                  </p>
                  <p>
                    <span className="bold">Summary: </span>
                    {data.sellingPlanGroup.summary}
                  </p>
                  <p>
                    <span className="bold">Merchant Code: </span>
                    {data.sellingPlanGroup.merchantCode}
                  </p>
                </Information>
              </Card>
              <Card title="Products" sectioned>
                <TextStyle variation="subdued">
                  <Message>
                    To add Products to this Selling Plan Group, please go to the
                    product page.
                  </Message>
                </TextStyle>
                {data.sellingPlanGroup.products.edges.map(
                  (product: ShopifyProduct) => {
                    return (
                      <Product key={product.node.id}>
                        <Thumbnail
                          source={product.node.featuredImage.originalSrc}
                          alt={product.node.featuredImage.altText}
                        />
                        <p>{product.node.title}</p>
                      </Product>
                    );
                  }
                )}
              </Card>
            </Layout.Section>
            <Layout.AnnotatedSection
              title="Edit"
              description="Edit Selling Plan"
            >
              <Card sectioned>
                <Layout>
                  <Layout.Section>
                    <TextField
                      value={planTitle}
                      onChange={planTitle => setPlanTitle(planTitle)}
                      label="Plan Title"
                      type="text"
                    />
                    <TextField
                      value={merchantCode}
                      onChange={merchantCode => setMerchantCode(merchantCode)}
                      label="Merchant Code"
                      type="text"
                    />
                    <TextField
                      value={options}
                      onChange={options => setOptions(options)}
                      label="Options"
                      type="text"
                    />
                  </Layout.Section>
                  <Layout.Section>
                    <Select
                      label="Interval"
                      options={[
                        { label: 'Daily', value: 'DAY' },
                        { label: 'Weekly', value: 'WEEK' },
                        { label: 'Monthly', value: 'MONTH' },
                        { label: 'Yearly', value: 'YEAR' },
                      ]}
                      onChange={interval => setInterval(interval)}
                      value={interval}
                    />
                    <TextField
                      value={percentOff}
                      onChange={percentOff => setPercentOff(percentOff)}
                      label="Percent Off (%)"
                      type="number"
                    />
                  </Layout.Section>
                  <Layout.Section>
                    <UpdateSellingPlanGroupButton
                      id={data.sellingPlanGroup.id}
                      planTitle={planTitle}
                      percentOff={percentOff}
                      merchantCode={merchantCode}
                      interval={interval}
                      options={options}
                      sellingPlans={data.sellingPlanGroup.sellingPlans.edges}
                      toggleActive={toggleActive}
                      setMsg={setMsg}
                      setToastError={setToastError}
                      refetch={refetch}
                    />
                  </Layout.Section>
                </Layout>
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
          err={`Selling Plan Group (${router?.query.id}) Not Found!`}
        />
      </Page>
    );
  }
}

export default SellingPlanGroup;
