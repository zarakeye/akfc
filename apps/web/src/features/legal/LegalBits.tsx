import type { JSX, ReactNode } from "react";

/** Valeur légale non encore renseignée dans les réglages : annoncée, jamais inventée. */
export function Missing(): JSX.Element {
  return <em className="text-muted-foreground">en cours de renseignement</em>;
}

/** Une valeur, ou « en cours de renseignement ». */
export function Val({ v }: { v: string | null | undefined }): JSX.Element {
  return v ? <>{v}</> : <Missing />;
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export const frenchDate = (d: Date): string =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(d);
