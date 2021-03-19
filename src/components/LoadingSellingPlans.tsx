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

function LoadingSellingPlans(props: { tableRows: number }) {
  const { tableRows } = props;

  return (
    <SkeletonPage title="Selling Plan Groups">
      <Frame>
        <Loading />
        <TitleBar title="Subscriptions" />
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <DataTable
                columnContentTypes={['text', 'text', 'text']}
                headings={['Name', 'Summary', 'Actions']}
                rows={Array.from(new Array(tableRows)).map((_, i) => {
                  return [
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

export default LoadingSellingPlans;
