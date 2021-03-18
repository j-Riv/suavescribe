import React from 'react';
import { DataTable } from '@shopify/polaris';

function Table(props) {
  const { contentTypes, headings, rows } = props;
  // const rows = [
  //   ['Emerald Silk Gown', '$875.00', 124689, 140, '$122,500.00'],
  //   ['Mauve Cashmere Scarf', '$230.00', 124533, 83, '$19,090.00'],
  //   [
  //     'Navy Merino Wool Blazer with khaki chinos and yellow belt',
  //     '$445.00',
  //     124518,
  //     32,
  //     '$14,240.00',
  //   ],
  // ];

  return (
    <DataTable
      columnContentTypes={contentTypes}
      headings={headings}
      rows={rows}
      // footerContent={`Showing ${rows.length} of ${rows.length} results`}
    />
  );
}

export default Table;
