"use client";

import { type JSX } from "react";

import { BreakingNewsForm } from "#features/admin/breaking-news/forms/BreakingNewsForm.tsx";

export function CreateBreakingNews(): JSX.Element {
  return <BreakingNewsForm submitLabel="Créer" />;
}
