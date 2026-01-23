'use client';

import LateralBarDashboard from '@/components/client/LateralBarDashboard';

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen">
      <LateralBarDashboard />

      {/* ⚠️ le main DOIT être relative */}
      <main className="relative flex-1 p-10 overflow-hidden">
        {children}
      </main>
    </div>
  );
}