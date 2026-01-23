"use client";

import { CreatePermissionForm } from "@/app/forms/CreatePermission.form";

export default function CreatePermissionPage() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Créer une permission</h2>
      <CreatePermissionForm />
    </>
  );
}