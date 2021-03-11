import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
// import App from 'next/app';
import Head from 'next/head';
// import type { AppProps, AppContext } from 'next/app';
import { AppProvider } from '@shopify/polaris';
import { Provider, Context, useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import ClientRouter from '../components/ClientRouter';

function MyProvider(props) {
  const app = useAppBridge();

  const client = new ApolloClient({
    link: new HttpLink({
      credentials: 'include',
      fetch: authenticatedFetch(app), // ensures all apollo client triggered requests are authenticated
    }),
    cache: new InMemoryCache(),
  });

  // const Component = props.Component;

  return (
    <ApolloProvider client={client}>
      {/* <Component {...props} /> */}
      {props.children}
    </ApolloProvider>
  );
}

function MyApp({ Component, pageProps, shopOrigin }) {
  return (
    <>
      <Head>
        <title>Suavescribe</title>
        <meta charSet="utf-8" />
      </Head>

      <Provider
        config={{
          /* eslint:disable-next-line */
          apiKey: API_KEY,
          shopOrigin: shopOrigin,
          forceRedirect: true,
        }}
      >
        <ClientRouter />
        <AppProvider i18n={translations}>
          <MyProvider>
            <Component {...pageProps} />
          </MyProvider>
          {/* <MyProvider Component={Component} {...pageProps} /> */}
        </AppProvider>
      </Provider>
    </>
  );
}

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    shopOrigin: ctx.query.shop,
  };
};

export default MyApp;
