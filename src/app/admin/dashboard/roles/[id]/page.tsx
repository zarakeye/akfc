'use client';

import RoleCard from "../RoleCard";

interface RolePageProps {
  params: {
    id: number;
  }
}

export default function RolePage({params}: RolePageProps) {
  return (
    <>
      <RoleCard roleId={params.id} />
    </>
  );
}