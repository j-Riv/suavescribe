import {
  Button,
  Card,
  Form,
  Heading,
  Layout,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  Stack,
  TextContainer,
  TextStyle,
} from '@shopify/polaris';

function LoadingEditSubscription() {
  return (
    <SkeletonPage>
      <Heading>
        <TextStyle variation="positive">Subscription</TextStyle>
      </Heading>
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
    </SkeletonPage>
  );
}

export default LoadingEditSubscription;
