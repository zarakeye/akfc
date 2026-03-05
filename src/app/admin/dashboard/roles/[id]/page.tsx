'use client';

import { JSX } from 'react';
import RoleCard from "../RoleCard";

interface RolePageProps {
  params: {
    id: number;
  }
}

export default function RolePage({params}: RolePageProps): JSX.Element {
  return (
    <>
      <RoleCard roleId={params.id} />
    </>
  );
}