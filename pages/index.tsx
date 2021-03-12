import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Card,
  EmptyState,
  Heading,
  Layout,
  Page,
  TextStyle,
} from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
// import store from 'store-js';
// import ResourceListWithProducts from '../components/ResourceList';
// import DataTableWithData from '../components/DataTable';
import SellingPlanGroup from '../components/SellingPlanGroup';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const GET_ALL_SELLING_PLANS = gql`
  query {
    sellingPlanGroups(first: 5) {
      edges {
        node {
          id
          appId
          description
          options
          name
          summary
          sellingPlans(first: 5) {
            edges {
              node {
                id
                name
                options
              }
            }
          }
        }
      }
    }
  }
`;

function Index() {
  const [rows, setRows] = useState([]);
  const { loading, error, data } = useQuery(GET_ALL_SELLING_PLANS);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error! ${error.message}</div>;

  console.log('QUERY DATA');
  console.log(data);

  // const handleSelection = resources => {
  //   const idsFromResources = resources.selection.map(product => product.id);
  //   setOpen(false);
  //   console.log(resources);
  //   console.log(idsFromResources);
  //   store.set('ids', idsFromResources);
  // };

  return (
    <Page>
      <TitleBar
        title="Selling Plan Groups"
        primaryAction={{
          content: 'Get Selling Plans',
          onAction: () => console.log('clicked'),
        }}
      />
      <Heading>
        <TextStyle variation="positive">
          Shopify app with Node, React and TypeScript 🎉
        </TextStyle>
      </Heading>
      {/* {data && <DataTableWithData data={data} />} */}
      {data && (
        <SellingPlanGroup sellingPlanGroups={data.sellingPlanGroups.edges} />
      )}
    </Page>
  );
}

export default Index;
