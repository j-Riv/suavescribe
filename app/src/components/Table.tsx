import React from 'react';
import { ColumnContentType, DataTable } from '@shopify/polaris';

interface Props {
  contentTypes: ColumnContentType[];
  headings: string[];
  rows: any[][];
}

function Table(props: Props) {
  const { contentTypes, headings, rows } = props;

  return (
    <DataTable
      columnContentTypes={contentTypes}
      headings={headings}
      rows={rows}
    />
  );
}

export default Table;
