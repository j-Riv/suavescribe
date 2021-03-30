import React from 'react';
import { Card, EmptyState, Layout, Page, TextStyle } from '@shopify/polaris';

function ErrorState(props: { err: string }) {
  const { err } = props;

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <EmptyState
              heading="There has been a problem."
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <TextStyle variation="negative">Error! {err}</TextStyle>
              <p>Please reload the app and try again.</p>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default ErrorState;
