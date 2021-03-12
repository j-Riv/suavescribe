import React from 'react';
import { ActionList } from '@shopify/polaris';
import { gql, useMutation } from '@apollo/client';

const DELETE_SELLING_PLAN_GROUP = gql`
  mutation sellingPlanGroupDelete($id: ID!) {
    sellingPlanGroupDelete(id: $id) {
      deletedSellingPlanGroupId
      userErrors {
        code
        field
        message
      }
    }
  }
`;

function SellingPlanGroup({ sellingPlanGroups }) {
  const [deleteSellingGroup, { loading, error, data }] = useMutation(
    DELETE_SELLING_PLAN_GROUP
  );
  const handleClick = id => {
    if (!data) {
      deleteSellingGroup({
        variables: {
          id: id,
        },
      });
    }
    console.log('You clicked', id);
    console.log('RESPONSE =====>');
    console.log('error', error);
    console.log('loading', loading);
    console.log('data', data);
  };
  // Create List Items
  const items = [];
  sellingPlanGroups.map(plan => {
    console.log('name', plan.node.name);
    console.log('description', plan.node.description);
    items.push({
      content: (
        <div>
          <p>
            <b>{plan.node.name}</b>
          </p>
          <p>{plan.node.summary}</p>
        </div>
      ),
      suffix: <span onClick={() => handleClick(plan.node.id)}>Remove</span>,
    });
  });

  return (
    <div style={{ height: '250px', maxWidth: '100%' }}>
      <ActionList items={items} />
    </div>
  );
}

export default SellingPlanGroup;
