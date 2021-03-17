import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Button, Heading, Page, TextStyle } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import styled from 'styled-components';

const Group = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid #000;
  margin: 10px 0;
  .bold {
    font-weight: bold;
  }
`;

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

function RemoveButton(props: { id: string }) {
  const { id } = props;
  console.log('Removing', id);
  const [deleteSellingGroup, { loading, error, data }] = useMutation(
    DELETE_SELLING_PLAN_GROUP
  );
  const handleClick = (id: string) => {
    if (!data) {
      deleteSellingGroup({
        variables: {
          id: id,
        },
        refetchQueries: [{ query: GET_ALL_SELLING_PLANS }],
      });
    }
  };

  return <Button onClick={() => handleClick(id)}>Remove</Button>;
}

function SellingPlanGroups() {
  const { loading, error, data, refetch } = useQuery(GET_ALL_SELLING_PLANS);

  if (loading) return <TextStyle variation="positive">Loading...</TextStyle>;
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;

  console.log('QUERY DATA');
  console.log(data);

  return (
    <Page>
      <TitleBar
        title="Selling Plan Groups"
        primaryAction={{
          content: 'Get Selling Plans',
          onAction: () => refetch,
        }}
      />
      <Heading>
        <TextStyle variation="positive">Selling Plan Groups</TextStyle>
      </Heading>
      {data &&
        data.sellingPlanGroups.edges.map(group => (
          <Group key={group.node.id}>
            <div>
              <p className="bold">{group.node.name}</p>
              <p>{group.node.summary}</p>
            </div>
            <div>
              <RemoveButton id={group.node.id} />
            </div>
          </Group>
        ))}
    </Page>
  );
}

export default SellingPlanGroups;
