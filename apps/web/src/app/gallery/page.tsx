import { JSX } from 'react';
import PicturesDragNDropForm from '@/features/admin/pictures/forms/PicturesDragNDropForm';

export default function Gallery(): JSX.Element {
  return (
    <main>
      <h1>Gallery</h1>
      <PicturesDragNDropForm />
    </main>
  );
}