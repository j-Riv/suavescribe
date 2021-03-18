import React from 'react';
import { useRouter } from 'next/router';
import {
  Badge,
  Card,
  Form,
  FormLayout,
  Frame,
  Heading,
  Layout,
  Loading,
  Page,
  Select,
  Stack,
  TextField,
  TextStyle,
  Thumbnail,
  Toast,
} from '@shopify/polaris';
import styled from 'styled-components';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { useQuery } from '@apollo/client';
import { Redirect } from '@shopify/app-bridge/actions';
import { GET_SELLING_PLAN_GROUP_BY_ID } from '../handlers';
import { formatDate, formatId } from '../utils/formatters';

const Information = styled.div`
  .bold {
    font-weight: bold;
  }
`;

const Product = styled.div`
  display: grid;
  grid-template-columns: 50px auto;
  gap: 2em;
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
  // Get Data
  const { loading, error, data } = useQuery(GET_SELLING_PLAN_GROUP_BY_ID, {
    variables: {
      id: router.query.id,
    },
  });

  const adminRedirect = (href: string) => {
    console.log('redirecting');
    redirect.dispatch(Redirect.Action.ADMIN_PATH, href);
  };

  const appRedirect = () => {
    console.log('redirecting');
    redirect.dispatch(Redirect.Action.APP, '/selling-plan-groups');
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
    <Page
      breadcrumbs={[
        { content: 'All Selling Plan Groups', onAction: appRedirect },
      ]}
      title="Selling Plan Group"
      subtitle={`ID: (${formatId(data.sellingPlanGroup.id)}) `}
    >
      <TitleBar
        title="Selling Plan Group"
        primaryAction={{
          content: 'Delete',
          onAction: () => console.log('clicked'),
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
              To add Products to this Selling Plan Group, please go to the
              product page.
            </TextStyle>
            {data.sellingPlanGroup.products.edges.map(product => {
              return (
                <Product>
                  <Thumbnail
                    source={product.node.featuredImage.originalSrc}
                    alt={product.node.featuredImage.altTxt}
                  />
                  <p>{product.node.title}</p>
                </Product>
              );
            })}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default SellingPlanGroup;
