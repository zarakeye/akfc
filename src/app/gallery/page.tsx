import React, { JSX } from 'react';
import GalleryCropperForm from '@components/client/GalleryCropperForm';

export default function Gallery(): JSX.Element {
  return (
    <main>
      <h1>Gallery</h1>
      <GalleryCropperForm />
    </main>
  );
}