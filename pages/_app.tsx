import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
// import App from 'next/app';
// import type { AppProps, AppContext } from 'next/app';
import { AppProvider } from '@shopify/polaris';
import { Provider, useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';

function MyProvider(props) {
  const app = useAppBridge();

  const client = new ApolloClient({
    fetch: authenticatedFetch(app),
    fetchOptions: {
      credentials: 'include',
    },
  });

  const Component = props.Component;

  return (
    <ApolloProvider client={client}>
      <Component {...props} />
    </ApolloProvider>
  );
}

function MyApp({ Component, pageProps, shopOrigin }) {
  return (
    <AppProvider i18n={translations}>
      <Provider
        config={{
          /* eslint:disable-next-line */
          apiKey: API_KEY,
          shopOrigin: shopOrigin,
          forceRedirect: true,
        }}
      >
        <MyProvider Component={Component} {...pageProps} />
      </Provider>
    </AppProvider>
  );
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    shopOrigin: ctx.query.shop,
  };
};

export default MyApp;
