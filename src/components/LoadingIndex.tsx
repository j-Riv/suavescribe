import {
  Card,
  DataTable,
  Frame,
  Layout,
  Loading,
  SkeletonBodyText,
  SkeletonPage,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';

function LoadingIndex(props: { tableRows: number }) {
  const { tableRows } = props;

  return (
    <SkeletonPage title="Dashboard">
      <Frame>
        <Loading />
        <TitleBar title="Subscriptions" />
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <DataTable
                columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                ]}
                headings={[
                  'ID',
                  'Email',
                  'Customer ID',
                  'Created At',
                  'Next Order Date',
                  'Actions',
                ]}
                rows={Array.from(new Array(tableRows)).map((_, i) => {
                  return [
                    <SkeletonBodyText key={i} lines={1} />,
                    <SkeletonBodyText key={i} lines={1} />,
                    <SkeletonBodyText key={i} lines={1} />,
                    <SkeletonBodyText key={i} lines={1} />,
                    <SkeletonBodyText key={i} lines={1} />,
                    <SkeletonBodyText key={i} lines={1} />,
                  ];
                })}
              />
            </Card>
          </Layout.Section>
        </Layout>
      </Frame>
    </SkeletonPage>
  );
}

export default LoadingIndex;
