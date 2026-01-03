import React, { JSX } from 'react';
import PicturesDragNDropForm from '@/app/forms/PicturesDragNDropForm';

export default function Gallery(): JSX.Element {
  return (
    <main>
      <h1>Gallery</h1>
      <PicturesDragNDropForm />
    </main>
  );
}