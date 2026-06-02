import { JSX } from 'react';
import DragNDropForm from '@/features/admin/library/forms/DragNDropForm';

export default function Gallery(): JSX.Element {
  return (
    <main>
      <h1>Gallery</h1>
      <DragNDropForm />
    </main>
  );
}