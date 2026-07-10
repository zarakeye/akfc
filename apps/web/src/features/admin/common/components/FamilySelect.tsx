"use client";

import { useEffect, useState } from "react";
import { trpcClient } from "@trpc/trpcClient";
import type { DisciplineFamily } from "@prisma/client";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface FamilySelectProps {
  /** Famille sélectionnée (`null` = aucune). */
  value: number | null;
  /** Appelée au changement. `null` quand l'admin choisit « Aucune ». */
  onChange: (value: number | null) => void;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Sélecteur de `DisciplineFamily`. Charge la liste via
 * `disciplineFamily.getAll` au montage et la rend dans un `<select>`.
 *
 * La famille est **optionnelle** sur une discipline, d'où l'option
 * « Aucune » (value `0` côté DOM, mappée vers `null`). Calqué sur le
 * contrat de `OriginSelect` : `value: number | null` / `onChange`.
 */
export function FamilySelect({ value, onChange }: FamilySelectProps) {
  const [families, setFamilies] = useState<DisciplineFamily[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    trpcClient.disciplineFamily.getAll
      .query()
      .then((data) => {
        if (!cancelled) {
          setFamilies(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <select
      value={value ?? 0}
      onChange={(e) => {
        const next = Number(e.target.value);
        onChange(next === 0 ? null : next);
      }}
      disabled={isLoading}
      className="rounded border border-input bg-background px-2 py-1 disabled:opacity-50"
    >
      <option value={0}>{isLoading ? "Chargement…" : "Aucune"}</option>
      {families.map((family) => (
        <option key={family.id} value={family.id}>
          {family.name}
        </option>
      ))}
    </select>
  );
}