import { JSX } from "react";
import DragNDropForm from '@features/admin/library/forms/DragNDropForm';
 

export default function AddPicturePage(): JSX.Element {
  return (
    <div>
      <h1>Ajouter une photo</h1>
      <DragNDropForm />
    </div>
  );
}