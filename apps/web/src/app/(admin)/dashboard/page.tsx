"use client";

import type { JSX } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Globe,
  Award,
  Newspaper,
  Layers,
  Pencil,
} from "lucide-react";

import UserCard from "@features/admin/users/components/UserCard";
import { useSessionStore } from "@lib/stores/useSessionStore";

export default function DashboardHome(): JSX.Element {
  const user = useSessionStore((state) => state.session?.user);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border p-10 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mes informations</h2>
          <Link
            href="/profil/edit?from=dashboard"
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Pencil className="h-4 w-4" />
            Éditer
          </Link>
        </div>
        <UserCard userId={user?.id ?? ""} />
      </div>

      <div className="rounded-lg border p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Contenus</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/disciplines"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Award className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Disciplines</p>
              <p className="text-sm text-muted-foreground">
                Arts enseignés par le club, leur présentation
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/discipline-families"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Layers className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Familles</p>
              <p className="text-sm text-muted-foreground">
                Regroupements de disciplines pour le menu
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Cours</p>
              <p className="text-sm text-muted-foreground">
                Créneaux hebdomadaires et leur contenu
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/origins"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Globe className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Origines</p>
              <p className="text-sm text-muted-foreground">
                Racines culturelles des disciplines
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/posts"
            className="inline-flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <Newspaper className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Actualités</p>
              <p className="text-sm text-muted-foreground">
                Articles et nouvelles du club
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
