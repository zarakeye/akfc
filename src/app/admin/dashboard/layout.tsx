'use client';

import LateralBarDashboard from '@/components/client/LateralBarDashboard';
import { Providers } from '@/app/admin/dashboard/providers';

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <Providers>
      <div className="flex min-h-screen">
        <LateralBarDashboard />

      {/* ⚠️ le main DOIT être relative */}
      <main className="relative flex-1 p-10 overflow-hidden">
        {children}
      </main>
    </div>
    </Providers>
  );
}