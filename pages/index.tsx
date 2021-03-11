import React, { useState } from 'react';
import { EmptyState, Heading, Layout, Page, TextStyle } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import store from 'store-js';
import ResourceListWithProducts from '../components/ResourceList';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

function Index() {
  const [open, setOpen] = useState(false);
  // const [products, setProducts] = useState([]);

  const handleSelection = resources => {
    const idsFromResources = resources.selection.map(product => product.id);
    setOpen(false);
    console.log(resources);
    console.log(idsFromResources);
    store.set('ids', idsFromResources);
  };

  // useEffect(() => {
  //   setProducts();
  // },[]);
  const emptyState = !store.get('ids');
  console.log('emptyState', emptyState);
  console.log(store.get('ids'));

  return (
    <Page>
      <TitleBar
        title="Sample App"
        primaryAction={{
          content: 'Select products',
          onAction: () => setOpen(true),
        }}
      />
      <ResourcePicker
        resourceType="Product"
        showVariants={false}
        open={open}
        onSelection={resources => handleSelection(resources)}
        onCancel={() => setOpen(false)}
      />
      {/* <Heading>
        <TextStyle variation="positive">
          Shopify app with Node, React and TypeScript 🎉
        </TextStyle>
      </Heading> */}
      {emptyState ? (
        <Layout>
          <EmptyState
            heading="View Products and Create Selling Plans"
            action={{
              content: 'Select products',
              onAction: () => console.log('clicked'),
            }}
            image={img}
          >
            <p>Select products</p>
          </EmptyState>
        </Layout>
      ) : (
        <ResourceListWithProducts />
      )}
    </Page>
  );
}

export default Index;
