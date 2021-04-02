import {
  Button,
  Card,
  Frame,
  Heading,
  Layout,
  Loading,
  SkeletonBodyText,
  SkeletonPage,
  Stack,
  TextStyle,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';

function LoadingSubscription() {
  return (
    <SkeletonPage breadcrumbs={true} title="Edit Subscription">
      <Frame>
        <Loading />
        <TitleBar title="Edit Subscription" />
        <Heading>Edit Subscription</Heading>
        <Layout>
          <Layout.Section>
            <Card title="Customer" sectioned>
              <SkeletonBodyText />
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card title="Subscription" sectioned>
              <SkeletonBodyText />
            </Card>
          </Layout.Section>
          <Layout.AnnotatedSection
            title="Next Billing Date"
            description="Change / Update Next Billing Date"
          >
            <Card sectioned>
              <SkeletonBodyText />
              <Stack distribution="trailing">
                <Button primary submit>
                  Update
                </Button>
              </Stack>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title="Product"
            description="Select Product to Update Quantity"
          >
            <Card sectioned>
              <SkeletonBodyText />
              <Stack distribution="trailing">
                <Button primary submit>
                  Update
                </Button>
              </Stack>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title="Payment Method"
            description="Send Update Payment Method Email"
          >
            <Card sectioned>
              <SkeletonBodyText />
              <Stack distribution="trailing">
                <Button primary submit>
                  Update
                </Button>
              </Stack>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </Frame>
    </SkeletonPage>
  );
}

export default LoadingSubscription;
