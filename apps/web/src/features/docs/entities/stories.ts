import procedureMap from "@features/docs/entities/procedureMap.generated.json";
import { slugifyHeading } from "@features/docs/lib/slugifyHeading";

/*
 * Parcours d'un chapitre : un cas d'utilisation (« un membre dépose une demande ») raconté en
 * étapes. Chaque étape cite une procédure tRPC (`ticket.submit`) ou une fonction du serveur
 * (`processInboundEmail`) ; ses effets sur les entités ne sont PAS écrits à la main : ils viennent
 * de la carte des procédures, produite par l'analyse du code (scripts/build-procedure-map.mjs),
 * avec la piste de chacun : les appels traversés jusqu'à la base.
 */

export type EffectOp = "read" | "create" | "update" | "delete";
/** Un appel traversé : ce qui est appelé (`adapter.move`), et où le lire (`fichier:ligne`). */
export type TrailHop = [label: string, location: string];
export type StepEffect = {
  model: string;
  op: EffectOp;
  fields: string[];
  /** Écrit par une requête SQL écrite à la main (`$executeRaw`), pas par le client Prisma. */
  raw?: boolean;
  /** Fait par la base seule (`onDelete: Cascade` / `SetNull` du schéma), sans appel du code. */
  cascade?: boolean;
  /** Pistes : les appels traversés depuis l'étape jusqu'à l'appel qui touche la base (trois au plus). */
  trails: TrailHop[][];
};

type MapEntry = {
  kind?: string;
  access?: string;
  file: string;
  line: number;
  effects: StepEffect[];
  emails: string[];
};

const PROCEDURES = procedureMap.procedures as unknown as Record<string, MapEntry>;
const FUNCTIONS = procedureMap.functions as unknown as Record<string, MapEntry>;

export type StoryStep = {
  label: string;
  /** Procédure (`ticket.submit`) ou fonction du serveur (`processInboundEmail`). */
  call: string;
  /** Procédure tRPC, ou fonction appelée par le serveur (tâche, relève…). */
  callKind: "procedure" | "function" | "action";
  /** public | membre | admin (procédures). */
  access: string | null;
  file: string;
  line: number;
  effects: StepEffect[];
  emails: string[];
  /** Ancre de la section du chapitre qui explique l'étape. */
  sectionId: string | null;
};

export type Story = { id: string; title: string; actor: string; steps: StoryStep[] };

type RawStep = { label?: unknown; call?: unknown; section?: unknown };
type RawStory = { title?: unknown; actor?: unknown; steps?: unknown };

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Une étape : sa procédure ou sa fonction, résolue dans la carte des procédures. */
export function lookupCall(call: string): { callKind: StoryStep["callKind"]; entry: MapEntry } | null {
  if (PROCEDURES[call]) return { callKind: "procedure", entry: PROCEDURES[call] };
  if (FUNCTIONS[call]) {
    return { callKind: FUNCTIONS[call].kind === "server action" ? "action" : "function", entry: FUNCTIONS[call] };
  }
  return null;
}

/** Lit l'en-tête `stories` d'un chapitre ; une étape dont l'appel est inconnu est ignorée (pnpm check la signale). */
export function readChapterStories(raw: unknown): Story[] {
  if (!Array.isArray(raw)) return [];
  return (raw as RawStory[])
    .map((s, i): Story | null => {
      const title = str(s?.title);
      if (!title || !Array.isArray(s.steps)) return null;
      const steps = (s.steps as RawStep[])
        .map((st): StoryStep | null => {
          const call = str(st?.call);
          const found = call ? lookupCall(call) : null;
          if (!call || !found) return null;
          const section = str(st.section);
          return {
            label: str(st.label) ?? call,
            call,
            callKind: found.callKind,
            access: found.entry.access ?? null,
            file: found.entry.file,
            line: found.entry.line,
            effects: found.entry.effects,
            emails: found.entry.emails,
            sectionId: section ? slugifyHeading(section) : null,
          };
        })
        .filter((x): x is StoryStep => x !== null);
      return steps.length ? { id: `story-${i}`, title, actor: str(s.actor) ?? "", steps } : null;
    })
    .filter((x): x is Story => x !== null);
}
