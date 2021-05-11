import React, { useState, useCallback } from 'react';
import { Button, Form, Icon, TextField } from '@shopify/polaris';
import { SearchMinor } from '@shopify/polaris-icons';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';

function SearchBar() {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [searchValue, setSearchValue] = useState<null | string>(null);
  const handleChange = useCallback(newValue => setSearchValue(newValue), []);
  const clearInput = useCallback(() => setSearchValue(null), []);
  const appRedirect = (href: string) => {
    redirect.dispatch(Redirect.Action.APP, href);
  };
  const handleSubmit = () => {
    appRedirect(`/search?email=${searchValue}`);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TextField
        label="Customer Search"
        value={searchValue}
        onChange={handleChange}
        prefix={<Icon source={SearchMinor} color="base" />}
        clearButton={true}
        onClearButtonClick={clearInput}
        connectedRight={<Button submit>Search</Button>}
      />
    </Form>
  );
}

export default SearchBar;
