import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { Redirect } from '@shopify/app-bridge/actions';
import { Button, Card, Frame, Page, TextStyle, Toast } from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import styled from 'styled-components';
import {
  GET_ALL_SELLING_PLAN_GROUPS,
  DELETE_SELLING_PLAN_GROUP,
} from '../handlers';
import Table from '../components/Table';
import LoadingSellingPlans from '../components/LoadingSellingPlans';

const Actions = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  gap: 2rem;
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
      refetchQueries: [{ query: GET_ALL_SELLING_PLAN_GROUPS }],
    });
  };

  return (
    <Button plain destructive onClick={() => handleClick(id)}>
      Remove
    </Button>
  );
}

function SellingPlanGroups() {
  // Create redirects
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const appRedirect = (href: string) => {
    console.log('redirecting');
    redirect.dispatch(Redirect.Action.APP, href);
  };

  const { loading, error, data, refetch } = useQuery(
    GET_ALL_SELLING_PLAN_GROUPS
  );
  // Toast
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive(active => !active), []);
  const toastMarkup = active ? (
    <Toast content="Removed" onDismiss={toggleActive} />
  ) : null;

  if (loading) return <LoadingSellingPlans tableRows={5} />;
  if (error)
    return <TextStyle variation="negative">Error! ${error.message}</TextStyle>;

  console.log('QUERY DATA');
  console.log(data);

  return (
    <Page
      title="Selling Plan Groups"
      subtitle="Selling Plans represent how a product can be sold and purchased."
    >
      <Frame>
        <TitleBar title="Selling Plan Groups" />
        <Card sectioned>
          {data && (
            <Table
              contentTypes={['text', 'text', 'text']}
              headings={['Name', 'Summary', 'Actions']}
              rows={data.sellingPlanGroups.edges.map(group => {
                return [
                  group.node.name,
                  group.node.summary,
                  <Actions>
                    <RemoveButton
                      id={group.node.id}
                      toggleActive={toggleActive}
                    />
                    <Button
                      plain
                      onClick={() =>
                        appRedirect(`/selling-plan-group/?id=${group.node.id}`)
                      }
                    >
                      View
                    </Button>
                  </Actions>,
                ];
              })}
            />
          )}
        </Card>
        {toastMarkup}
      </Frame>
    </Page>
  );
}

export default SellingPlanGroups;
