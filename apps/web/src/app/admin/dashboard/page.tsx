'use client';

import { JSX } from 'react';
import UserCard from "./users/UserCard";
import { useSessionStore } from "@/lib/stores/useSessionStore";

export default function DashboardHome(): JSX.Element {
  const user = useSessionStore(state => state.session?.user);

  return (
    <div className="border rounded-lg p-10 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Mes informations</h2>
      <UserCard userId={user?.id ?? ''} />
    </div>
  );
}