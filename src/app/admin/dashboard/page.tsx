'use client';

import UserCard from "../dashboard/users/UserCard";
import { useSessionStore } from "@/lib/stores/useSessionStore";

export default function DashboardHome() {
  const user = useSessionStore(state => state.session?.user);

  return (
    <div className="border rounded-lg p-10 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Mes informations</h2>
      <UserCard userId={user?.id ?? ''} />
    </div>
  );
}