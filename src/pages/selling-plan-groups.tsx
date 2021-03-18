import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Button,
  Frame,
  Heading,
  Loading,
  Page,
  TextStyle,
  Toast,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import styled from 'styled-components';
import { GET_ALL_SELLING_PLANS, DELETE_SELLING_PLAN_GROUP } from '../handlers';
import EmptyPage from '../components/EmptyPage';

const Group = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid #000;
  margin: 10px 0;
  .bold {
    font-weight: bold;
  }
`;

function RemoveButton(props: { id: string; toggleActive: () => void }) {
  const { id, toggleActive } = props;
  // delete selling plan group
  const [deleteSellingGroup] = useMutation(DELETE_SELLING_PLAN_GROUP, {
    onCompleted: () => toggleActive(),
  });
  const handleClick = (id: string) => {
    deleteSellingGroup({
      variables: {
        id: id,
      },
      refetchQueries: [{ query: GET_ALL_SELLING_PLANS }],
    });
  };

  return <Button onClick={() => handleClick(id)}>Remove</Button>;
}

function SellingPlanGroups() {
  const { loading, error, data, refetch } = useQuery(GET_ALL_SELLING_PLANS);

  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive(active => !active), []);
  const toastMarkup = active ? (
    <Toast content="Removed" onDismiss={toggleActive} />
  ) : null;

  if (loading)
    return (
      <Frame>
        <Loading />
        <EmptyPage />
      </Frame>
    );
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
              <RemoveButton id={group.node.id} toggleActive={toggleActive} />
            </div>
          </Group>
        ))}
      <Frame>{toastMarkup}</Frame>
    </Page>
  );
}

export default SellingPlanGroups;
