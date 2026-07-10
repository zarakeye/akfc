'use client';

import { JSX } from 'react';
import GalleriesTable from '@features/admin/galleries/components/GalleriesTable';

export default function Galleries(): JSX.Element {
  return (
    <div className='m-10 p-10 border rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-4'>Liste des galeries</h2>
      <GalleriesTable />
    </div>
  );
}