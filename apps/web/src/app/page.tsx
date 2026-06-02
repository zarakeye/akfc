"use client";

import type { JSX } from "react";
import Link from "next/link";
import { GraduationCap, Globe, Award, Calendar, PartyPopper } from "lucide-react";

import UserCard from "@features/admin/users/components/UserCard";
import { useSessionStore } from "@lib/stores/useSessionStore";

export default function DashboardHome(): JSX.Element {
  const user = useSessionStore((state) => state.session?.user);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border p-10 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Mes informations</h2>
        <UserCard userId={user?.id ?? ""} />
      </div>

      <div className="rounded-lg border p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Contenus</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/dashboard/disciplines"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Award className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Disciplines</p>
              <p className="text-sm text-muted-foreground">
                Arts enseignés par le club
              </p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/courses"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Cours</p>
              <p className="text-sm text-muted-foreground">
                Créneaux hebdomadaires
              </p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/stages"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Calendar className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Stages</p>
              <p className="text-sm text-muted-foreground">
                Événements ponctuels et intensifs
              </p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/events"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <PartyPopper className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Événements</p>
              <p className="text-sm text-muted-foreground">
                Repas, conférences, ateliers culturels
              </p>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/origins"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Globe className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Origines</p>
              <p className="text-sm text-muted-foreground">
                Racines culturelles
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}