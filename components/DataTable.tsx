import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Card, DataTable } from '@shopify/polaris';

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

function DataTableWithData({ data }) {
  const arr = [];
  data.sellingPlanGroups.edges.map(plan => {
    console.log('name', plan.node.name);
    console.log('description', plan.node.description);
    arr.push([plan.node.name, plan.node.description]);
  });

  return (
    <Card>
      <DataTable
        columnContentTypes={['text', 'text']}
        headings={['Title', 'Description']}
        rows={arr}
      />
    </Card>
  );
}

export default DataTableWithData;
