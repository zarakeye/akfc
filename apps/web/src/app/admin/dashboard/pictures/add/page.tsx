import { JSX } from "react";
import PicturesDragNDropForm from '@/features/admin-forms/components/PicturesDragNDropForm';
 

export default function AddPicturePage(): JSX.Element {
  return (
    <div>
      <h1>Ajouter une photo</h1>
      <PicturesDragNDropForm />
    </div>
  );
}