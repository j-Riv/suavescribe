import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  Frame,
  Layout,
  Page,
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
  GET_ALL_SELLING_PLAN_GROUPS,
} from '../handlers';
import { formatId } from '../utils/formatters';
import LoadingSellingPlan from '../components/LoadingSellingPlan';
import ErrorState from '../components/ErrorState';
import UpdateSellingPlanForm from '../components/UpdateSellingPlanForm';
import UpdateSellingPlanGroupButton from '../components/UpdateSellingPlanGroupButton';
import {
  Product as ShopifyProduct,
  ProductVariant as ShopifyProductVariant,
} from '../types/subscriptions';
import { SellingPlan } from '../types/sellingplans';

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
  const [groupName, setGroupName] = useState<string>();
  const [groupDescription, setGroupDescription] = useState<string>();
  const [groupOptions, setGroupOptions] = useState<string[]>();
  const [options, setOptions] = useState<string>();
  const [merchantCode, setMerchantCode] = useState<string>();
  const [sellingPlans, setSellingPlans] = useState<SellingPlan[]>([]);

  const [active, setActive] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    console.log('CHANGES TO SELLING PLANS', sellingPlans);
  }, [sellingPlans]);

  const handleGroupName = (name: string) => {
    setGroupName(name);
  };

  const handleGroupDescription = (description: string) => {
    setGroupDescription(description);
  };

  const handleMerchantCode = (merchantCode: string) => {
    setMerchantCode(merchantCode);
  };

  const handleGroupOptions = (options: string) => {
    let opts: string[] = [];
    if (options.includes(',')) {
      opts = options.split(',');
      opts = opts.map((el: string) => el.trim());
    } else {
      opts = [options];
    }
    setOptions(options);
    setGroupOptions(opts);
  };

  const handleSellingPlans = (id: string, sellingPlan: any) => {
    const updatedSellingPlans = sellingPlans.map((plan: any) => {
      if (plan.node.id === id) {
        const updatedPlan = {
          node: {
            ...plan.node,
            name: sellingPlan.name,
            options: [sellingPlan.options],
            billingPolicy: {
              interval: sellingPlan.interval,
              intervalCount: sellingPlan.intervalCount,
            },
            deliveryPolicy: {
              interval: sellingPlan.interval,
              intervalCount: sellingPlan.intervalCount,
            },
            pricingPolicies: [
              {
                adjustmentType: 'PERCENTAGE',
                adjustmentValue: {
                  percentage: sellingPlan.percentOff,
                },
              },
            ],
          },
        };
        return updatedPlan;
      }
      return plan;
    });
    setSellingPlans(updatedSellingPlans);
  };

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
          const plans = sellingPlanGroup.sellingPlans.edges;
          setGroupName(sellingPlanGroup.name);
          setGroupDescription(sellingPlanGroup.description);
          setMerchantCode(sellingPlanGroup.merchantCode);
          setSellingPlans(plans);
          setOptions(sellingPlanGroup.options.toString());
          setGroupOptions([...sellingPlanGroup.options]);
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
              <Card title="Selling Plans" sectioned>
                <ul>
                  {data.sellingPlanGroup.sellingPlans.edges.map(
                    (sellingPlan: SellingPlan) => {
                      return (
                        <li key={sellingPlan.node.id}>
                          {sellingPlan.node.name}{' '}
                          <em>({sellingPlan.node.id})</em>
                        </li>
                      );
                    }
                  )}
                </ul>
              </Card>
              <Card title="Products" sectioned>
                <TextStyle variation="subdued">
                  <Message>
                    To add products to this Selling Plan Group, please go to the
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
              <Card title="Variants" sectioned>
                <TextStyle variation="subdued">
                  <Message>
                    To add variants to this Selling Plan Group, please go to the
                    product page and select the variant.
                  </Message>
                </TextStyle>
                {data.sellingPlanGroup.productVariants.edges.map(
                  (product: ShopifyProductVariant) => {
                    return (
                      <Product key={product.node.id}>
                        <Thumbnail
                          source={product.node.image.src}
                          alt={product.node.image.altText}
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
              description="You can edit the group name, description and merchant code. As well as the selling plans. Plan names should follow the ex: `Delivered every week (Save 10%)`"
            >
              <Card title="Selling Plan Group" sectioned>
                <Layout>
                  <Layout.Section>
                    <TextField
                      value={groupName}
                      onChange={value => handleGroupName(value)}
                      label="Group Name"
                      type="text"
                    />
                    <TextField
                      value={groupDescription}
                      onChange={value => handleGroupDescription(value)}
                      label="Group Description"
                      type="text"
                    />
                    <TextField
                      value={merchantCode}
                      onChange={value => handleMerchantCode(value)}
                      label="Merchant Code"
                      type="text"
                    />
                    <TextField
                      value={options}
                      onChange={value => handleGroupOptions(value)}
                      label="Group Options"
                      type="text"
                    />
                  </Layout.Section>
                </Layout>
              </Card>
              {sellingPlans.map((plan: SellingPlan, index: number) => {
                return (
                  <UpdateSellingPlanForm
                    key={plan.node.id}
                    sellingPlan={plan}
                    handleSellingPlans={handleSellingPlans}
                    index={index}
                  />
                );
              })}
            </Layout.AnnotatedSection>
            <Layout.Section>
              <UpdateSellingPlanGroupButton
                id={data.sellingPlanGroup.id}
                groupName={groupName}
                groupDescription={groupDescription}
                groupOptions={groupOptions}
                merchantCode={merchantCode}
                sellingPlans={sellingPlans}
                toggleActive={toggleActive}
                setMsg={setMsg}
                setToastError={setToastError}
                refetch={refetch}
              />
            </Layout.Section>
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
