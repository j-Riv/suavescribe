import {
  ApolloClient,
  ApolloProvider,
  Context,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider, useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import ClientRouter from '../components/ClientRouter';
import { Redirect } from '@shopify/app-bridge/actions';
import { ClientApplication } from '@shopify/app-bridge';

function userLoggedInFetch(app: ClientApplication<any>) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri: RequestInfo, options: RequestInit) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get('X-Shopify-API-Request-Failure-Reauthorize') === '1'
    ) {
      const authUrlHeader = response.headers.get(
        'X-Shopify-API-Request-Failure-Reauthorize-Url'
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/install/auth`);
      return null;
    }

    return response;
  };
}

function MyProvider({ children }) {
  const app: ClientApplication<any> = useAppBridge();

  const client = new ApolloClient({
    link: new HttpLink({
      credentials: 'same-origin',
      fetch: userLoggedInFetch(app), // ensures all apollo client triggered requests are authenticated
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            subscriptionContracts: {
              keyArgs: false,
            },
          },
        },
      },
    }),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
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
          // @ts-ignore
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
        </AppProvider>
      </Provider>
    </>
  );
}

MyApp.getInitialProps = async ({ ctx }: Context) => {
  return {
    shopOrigin: ctx.query.shop,
  };
};

export default MyApp;
