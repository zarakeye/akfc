"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Atom, BookOpen, ChevronLeft, ChevronRight, Mail, X } from "lucide-react";

import type { ChapterGraph, GraphModel } from "@features/docs/entities/chapterGraph";
import type { EntityField, EntityLink } from "@features/docs/entities/prismaSchema";
import type { EffectOp, Story, StoryStep } from "@features/docs/entities/stories";
import { layoutGraph, type Point } from "@features/docs/entities/layoutGraph";

/*
 * Carte des entités d'un chapitre : un panneau à droite, ouvert par le bouton « Entités » ou par un
 * nom d'entité ou de propriété cliqué dans le texte (EntityCode).
 *
 * La carte est une molécule à plat : un atome par entité, une liaison par relation. Les entités du
 * chapitre sont en couleur, celles qui les relient en gris, les voisines à la demande. Un clic sur
 * un atome déplie sa fiche (toutes ses propriétés, celles du chapitre mises en évidence) ; un clic
 * sur une liaison décrit la relation (cardinalité, règle de suppression).
 */

type Selection = { kind: "model"; name: string; field?: string } | { kind: "link"; id: string } | null;

type ExplorerApi = {
  /** Ouvre le panneau, sur une entité (et une propriété) si précisé. */
  open: (model?: string, field?: string) => void;
  /** Résout un texte de code en ligne (« Ticket », « dueAt », « Ticket.dueAt ») en entité / propriété. */
  resolve: (text: string) => { model: string; field?: string } | null;
};

const ExplorerContext = createContext<ExplorerApi | null>(null);

export function EntityExplorer({
  graph,
  stories = [],
  children,
}: {
  graph: ChapterGraph;
  stories?: Story[];
  children: ReactNode;
}): JSX.Element {
  const [isOpen, setOpen] = useState(false);
  const [selection, setSelection] = useState<Selection>(null);
  // Parcours rejoué : gardé quand on ferme le panneau pour lire la section, repris à la réouverture.
  const [play, setPlay] = useState<{ storyId: string; step: number } | null>(null);
  // Stable : le panneau s'abonne à Échap une fois, et ne reprend pas le curseur à chaque sélection.
  const close = useCallback(() => setOpen(false), []);

  /** Ferme le panneau et amène la section de l'étape dans la vue, brièvement soulignée. */
  const readSection = useCallback((sectionId: string) => {
    setOpen(false);
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("bg-emerald-500/15");
    window.setTimeout(() => el.classList.remove("bg-emerald-500/15"), 1800);
  }, []);

  const api = useMemo<ExplorerApi>(() => {
    const focusModels = graph.models.filter((m) => m.role === "focus");
    const byName = new Map(graph.models.map((m) => [m.name, m]));
    return {
      open: (model, field) => {
        setOpen(true);
        if (model) setSelection({ kind: "model", name: model, field });
      },
      resolve: (text) => {
        const t = text.trim();
        const dotted = /^(\w+)\.(\w+)$/.exec(t);
        if (dotted) {
          const m = byName.get(dotted[1]);
          return m && m.fields.some((f) => f.name === dotted[2]) ? { model: m.name, field: dotted[2] } : null;
        }
        if (byName.get(t)?.role === "focus") return { model: t };
        // Nom de propriété seul : seulement s'il désigne sans ambiguïté une propriété du chapitre.
        const owners = focusModels.filter((m) => m.focusFields.includes(t));
        return owners.length === 1 ? { model: owners[0].name, field: t } : null;
      },
    };
  }, [graph]);

  return (
    <ExplorerContext.Provider value={api}>
      {children}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-40 inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-2 text-sm shadow-lg hover:bg-muted"
      >
        <Atom className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        Entités
      </button>
      {isOpen && (
        <EntityPanel
          graph={graph}
          stories={stories}
          play={play}
          onPlay={setPlay}
          onReadSection={readSection}
          selection={selection}
          onSelect={setSelection}
          onClose={close}
        />
      )}
    </ExplorerContext.Provider>
  );
}

/**
 * Code en ligne du texte (`Ticket`, `dueAt`, `Ticket.dueAt`) : un lien vers la carte quand il
 * désigne une entité ou une propriété du chapitre, sinon un `<code>` ordinaire.
 */
export function EntityCode(props: { className?: string; children?: ReactNode }): JSX.Element {
  const api = useContext(ExplorerContext);
  const text = typeof props.children === "string" ? props.children : null;
  const target = api && text && !props.className ? api.resolve(text) : null;
  const base = "rounded bg-black/5 px-1.5 py-0.5 text-sm dark:bg-white/10";
  if (!api || !target) return <code className={props.className ?? base}>{props.children}</code>;
  return (
    <button
      type="button"
      onClick={() => api.open(target.model, target.field)}
      title={target.field ? `${target.model}.${target.field} : voir sur la carte des entités` : `${target.model} : voir sur la carte des entités`}
      className="cursor-pointer border-0 bg-transparent p-0 align-baseline"
    >
      <code className={`${base} underline decoration-emerald-500 decoration-dotted underline-offset-4 hover:bg-emerald-500/15`}>
        {props.children}
      </code>
    </button>
  );
}

/* ─── Panneau ─────────────────────────────────────────────────────────── */

const RADIUS: Record<GraphModel["role"], number> = { focus: 30, bridge: 20, neighbor: 18, story: 18 };

/** Effet le plus fort d'une étape sur une entité (une suppression l'emporte sur une lecture). */
const OP_RANK: Record<EffectOp, number> = { delete: 4, create: 3, update: 2, read: 1 };
function opsOf(step: StoryStep | null): Map<string, EffectOp> {
  const map = new Map<string, EffectOp>();
  for (const e of step?.effects ?? []) {
    const prev = map.get(e.model);
    if (!prev || OP_RANK[e.op] > OP_RANK[prev]) map.set(e.model, e.op);
  }
  return map;
}

/**
 * Entité principale d'une étape : le fil passe par elle. Ce que l'étape CRÉE la caractérise le
 * mieux (le message d'une réponse, l'évènement d'un transfert), puis ce qu'elle modifie, supprime,
 * et enfin ce qu'elle lit.
 */
function mainModelOf(step: StoryStep): string | null {
  // À effet égal, l'entité dont l'étape écrit le plus de propriétés.
  for (const op of ["create", "update", "delete", "read"] as EffectOp[]) {
    const candidates = step.effects.filter((x) => x.op === op);
    if (candidates.length) return candidates.reduce((a, b) => (b.fields.length > a.fields.length ? b : a)).model;
  }
  return null;
}

const OP_TONE: Record<EffectOp, string> = {
  create: "fill-emerald-500/70 stroke-emerald-700",
  update: "fill-amber-400/60 stroke-amber-600",
  read: "fill-sky-400/15 stroke-sky-500",
  delete: "fill-red-500/50 stroke-red-600",
};
const OP_LABEL: Record<EffectOp, string> = { create: "créée", update: "modifiée", read: "lue", delete: "supprimée" };

function EntityPanel({
  graph,
  stories,
  play,
  onPlay,
  onReadSection,
  selection,
  onSelect,
  onClose,
}: {
  graph: ChapterGraph;
  stories: Story[];
  play: { storyId: string; step: number } | null;
  onPlay: (p: { storyId: string; step: number } | null) => void;
  onReadSection: (sectionId: string) => void;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onClose: () => void;
}): JSX.Element {
  const story = play ? stories.find((s) => s.id === play.storyId) ?? null : null;
  const step = story && play ? story.steps[Math.min(play.step, story.steps.length - 1)] : null;
  const stepOps = opsOf(step);
  const storyModels = new Set(story?.steps.flatMap((s) => s.effects.map((e) => e.model)) ?? []);
  const [showNeighbors, setShowNeighbors] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Échap ferme ; le panneau reçoit le curseur à l'ouverture.
  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const neighborCount = graph.models.filter((m) => m.role === "neighbor").length;
  const selectedModel = selection?.kind === "model" ? selection.name : null;
  // Une voisine choisie depuis une fiche reste affichée, même voisines masquées. Pendant un parcours,
  // toutes les entités qu'il touche (à n'importe quelle étape) restent en place : la carte ne bouge
  // pas d'une étape à l'autre.
  const models = graph.models.filter((m) => {
    if (storyModels.has(m.name)) return true;
    if (m.role === "story") return false;
    return m.role !== "neighbor" || showNeighbors || m.name === selectedModel;
  });
  const names = new Set(models.map((m) => m.name));
  const links = graph.links.filter((l) => names.has(l.from) && names.has(l.to));

  // Placement recalculé seulement quand l'ensemble des atomes affichés change.
  const visibleKey = models.map((m) => m.name).join(",");
  const layout = useMemo(() => {
    const visible = new Set(visibleKey.split(","));
    const ms = graph.models.filter((m) => visible.has(m.name));
    const ls = graph.links.filter((l) => visible.has(l.from) && visible.has(l.to));
    const pos = layoutGraph(
      ms.map((m) => ({ id: m.name, radius: RADIUS[m.role] + 30, mass: m.role === "focus" ? 2 : 1 })),
      ls.map((l) => {
        const join = ms.find((m) => m.name === l.from)?.isJoin;
        return { source: l.from, target: l.to, length: join ? 110 : 170 };
      }),
    );
    const pts = [...pos.values()];
    const pad = 70;
    const minX = Math.min(...pts.map((p) => p.x)) - pad;
    const minY = Math.min(...pts.map((p) => p.y)) - pad;
    const maxX = Math.max(...pts.map((p) => p.x)) + pad;
    const maxY = Math.max(...pts.map((p) => p.y)) + pad;
    return { pos, viewBox: `${minX} ${minY} ${Math.max(200, maxX - minX)} ${Math.max(200, maxY - minY)}` };
  }, [graph, visibleKey]);

  const selectedLink = selection?.kind === "link" ? graph.links.find((l) => l.id === selection.id) ?? null : null;
  const model = selectedModel ? graph.models.find((m) => m.name === selectedModel) ?? null : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Carte des entités du chapitre">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex h-full w-[min(640px,100vw)] flex-col border-l bg-background text-left shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <p className="text-sm font-semibold">Entités du chapitre</p>
            <p className="text-xs text-muted-foreground">Lues dans prisma/schema.prisma</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer la carte" className="rounded p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* La molécule reste en place ; seule la fiche défile (une propriété désignée depuis le
            texte est amenée dans la vue sans faire sortir la carte). */}
        <div className="shrink-0">
          {stories.length > 0 && (
            <StoryBar
              stories={stories}
              story={story}
              stepIndex={play?.step ?? 0}
              onPlay={(p) => {
                onPlay(p);
                onSelect(null);
              }}
            />
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-3 text-xs text-muted-foreground">
            {story ? (
              (Object.keys(OP_LABEL) as EffectOp[]).map((op) => (
                <Legend key={op} className={OP_TONE[op]} label={`${OP_LABEL[op]} par l'étape`} />
              ))
            ) : (
              <>
                <Legend className="fill-emerald-500/20 stroke-emerald-600" label="Entité du chapitre" />
                <Legend className="fill-muted stroke-gray-400" label="Entité qui les relie" />
              </>
            )}
            <span className="inline-flex items-center gap-1.5">
              <svg width="26" height="8" aria-hidden="true"><line x1="0" y1="4" x2="26" y2="4" className="stroke-gray-500" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
              lien facultatif
            </span>
            {neighborCount > 0 && (
              <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={showNeighbors} onChange={(e) => setShowNeighbors(e.target.checked)} />
                Voisines ({neighborCount})
              </label>
            )}
          </div>

          <svg viewBox={layout.viewBox} className="mx-auto block h-[44vh] w-full" role="group" aria-label="Molécule des entités">
            {links.map((l) => (
              <LinkView
                key={l.id}
                link={l}
                from={layout.pos.get(l.from)}
                to={layout.pos.get(l.to)}
                rFrom={radiusOf(models.find((m) => m.name === l.from))}
                rTo={radiusOf(models.find((m) => m.name === l.to))}
                offset={parallelOffset(l, links)}
                selected={selectedLink?.id === l.id}
                dimmed={
                  story
                    ? !(stepOps.has(l.from) && stepOps.has(l.to))
                    : Boolean(selectedModel) && l.from !== selectedModel && l.to !== selectedModel
                }
                onSelect={() => onSelect({ kind: "link", id: l.id })}
              />
            ))}
            {story && (
              <StoryThread
                story={story}
                current={play?.step ?? 0}
                pos={layout.pos}
                radius={(name) => radiusOf(models.find((m) => m.name === name))}
              />
            )}
            {models.map((m) => (
              <AtomView
                key={m.name}
                model={m}
                at={layout.pos.get(m.name)}
                selected={m.name === selectedModel}
                op={story ? stepOps.get(m.name) ?? null : undefined}
                onSelect={() => onSelect({ kind: "model", name: m.name })}
              />
            ))}
          </svg>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t p-4">
            {model ? (
              <ModelCard
                model={model}
                graph={graph}
                highlightField={selection?.kind === "model" ? selection.field : undefined}
                stepEffect={step ? step.effects.filter((e) => e.model === model.name) : undefined}
                onSelect={onSelect}
              />
            ) : selectedLink ? (
              <LinkCard link={selectedLink} graph={graph} onSelect={onSelect} />
            ) : step ? (
              <StepCard step={step} known={new Set(models.map((m) => m.name))} onSelect={onSelect} onReadSection={onReadSection} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Choisissez un atome pour voir ses propriétés, ou une liaison pour voir la relation
                {stories.length > 0 ? ", ou rejouez un parcours." : "."}
              </p>
            )}
        </div>
      </div>
    </div>
  );
}

/* ─── Parcours ────────────────────────────────────────────────────────── */

/** Choix du parcours et pas-à-pas (Précédent / Suivant). */
function StoryBar({
  stories,
  story,
  stepIndex,
  onPlay,
}: {
  stories: Story[];
  story: Story | null;
  stepIndex: number;
  onPlay: (p: { storyId: string; step: number } | null) => void;
}): JSX.Element {
  const last = story ? story.steps.length - 1 : 0;
  const i = Math.min(stepIndex, last);
  return (
    <div className="space-y-2 border-b px-4 py-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="font-medium">Parcours</span>
        <select
          value={story?.id ?? ""}
          onChange={(e) => onPlay(e.target.value ? { storyId: e.target.value, step: 0 } : null)}
          className="min-w-0 flex-1 rounded border border-input bg-background px-2 py-1"
        >
          <option value="">Aucun : toute la carte</option>
          {stories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      {story && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={i === 0}
            onClick={() => onPlay({ storyId: story.id, step: i - 1 })}
            aria-label="Étape précédente"
            className="rounded border p-1 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-0 flex-1" aria-live="polite">
            <span className="font-semibold">
              Étape {i + 1}/{story.steps.length}
            </span>{" "}
            — {story.steps[i].label}
            {story.actor && <span className="text-muted-foreground"> · {story.actor}</span>}
          </p>
          <button
            type="button"
            disabled={i === last}
            onClick={() => onPlay({ storyId: story.id, step: i + 1 })}
            aria-label="Étape suivante"
            className="rounded border p-1 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Le fil du parcours, comme une ligne de métro posée sur la molécule : il relie l'entité principale
 * de chaque étape, dans l'ordre, avec le numéro de l'étape. Les étapes passées sont pleines, les
 * suivantes en pointillés.
 */
function StoryThread({
  story,
  current,
  pos,
  radius,
}: {
  story: Story;
  current: number;
  pos: Map<string, Point>;
  radius: (model: string) => number;
}): JSX.Element {
  const stops = story.steps
    .map((s, i) => ({ i, model: mainModelOf(s) }))
    .filter((s): s is { i: number; model: string } => s.model !== null && pos.has(s.model));
  // Plusieurs étapes sur le même atome : leurs numéros sont décalés en arc.
  const count = new Map<string, number>();
  return (
    <g aria-hidden="true" className="pointer-events-none">
      {stops.slice(1).map((s, k) => {
        const a = pos.get(stops[k].model)!;
        const b = pos.get(s.model)!;
        if (stops[k].model === s.model) return null;
        return (
          <line
            key={`seg-${s.i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={s.i <= current ? "stroke-emerald-500" : "stroke-emerald-500/50"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={s.i <= current ? undefined : "2 8"}
          />
        );
      })}
      {stops.map((s) => {
        const p = pos.get(s.model)!;
        const n = count.get(s.model) ?? 0;
        count.set(s.model, n + 1);
        // Numéros posés en arc au-dessus de l'atome (le nom est en dessous), à partir du haut à droite.
        const angle = (BADGE_ANGLES[n % BADGE_ANGLES.length] * Math.PI) / 180;
        const dist = radius(s.model) + 15;
        const x = p.x + Math.cos(angle) * dist;
        const y = p.y + Math.sin(angle) * dist;
        const active = s.i === current;
        return (
          <g key={`stop-${s.i}`}>
            <circle cx={x} cy={y} r={active ? 12 : 9} className={active ? "fill-emerald-600" : "fill-emerald-500/70"} />
            <text x={x} y={y + 4} textAnchor="middle" className="fill-white text-[11px] font-bold">
              {s.i + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Positions des numéros d'étape autour d'un atome, en degrés (0 = droite, -90 = haut). */
const BADGE_ANGLES = [-45, -10, -80, 25, -115, -150];

/** Fiche de l'étape : qui, par quelle procédure, ce qu'elle fait aux entités, les e-mails. */
function StepCard({
  step,
  known,
  onSelect,
  onReadSection,
}: {
  step: StoryStep;
  known: Set<string>;
  onSelect: (s: Selection) => void;
  onReadSection: (sectionId: string) => void;
}): JSX.Element {
  const order: EffectOp[] = ["create", "update", "delete", "read"];
  const effects = [...step.effects].sort((a, b) => order.indexOf(a.op) - order.indexOf(b.op));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <h3 className="text-base font-semibold">{step.label}</h3>
        <p className="mt-1 text-muted-foreground">
          {step.callKind === "procedure" ? "Procédure tRPC" : "Fonction du serveur"} <code>{step.call}</code>
          {step.access && <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{step.access}</span>}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {step.file}:{step.line}
        </p>
      </div>
      <ul className="space-y-1.5">
        {effects.map((e) => (
          <li key={`${e.model}-${e.op}`} className="flex flex-wrap items-baseline gap-x-2">
            <svg width="12" height="12" aria-hidden="true">
              <circle cx="6" cy="6" r="5" className={OP_TONE[e.op]} strokeWidth="1.5" />
            </svg>
            {known.has(e.model) ? (
              <button
                type="button"
                onClick={() => onSelect({ kind: "model", name: e.model })}
                className="font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
              >
                {e.model}
              </button>
            ) : (
              <span className="font-semibold">{e.model}</span>
            )}
            <span className="text-muted-foreground">{OP_LABEL[e.op]}</span>
            {e.fields.length > 0 && <span className="text-xs text-muted-foreground">({e.fields.join(", ")})</span>}
          </li>
        ))}
      </ul>
      {step.emails.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
          <Mail className="h-4 w-4" aria-hidden="true" />
          E-mails : {step.emails.map((m) => <code key={m}>{m}</code>)}
        </p>
      )}
      {step.sectionId && (
        <button
          type="button"
          onClick={() => onReadSection(step.sectionId!)}
          className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline dark:text-emerald-300"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Lire cette étape dans le chapitre
        </button>
      )}
      <p className="text-xs text-muted-foreground">
        Effets relevés dans le code par scripts/build-procedure-map.mjs (appels Prisma de la procédure et des
        fonctions qu&apos;elle appelle).
      </p>
    </div>
  );
}

/** Rayon de l'atome d'une entité (0 si absente). */
function radiusOf(model: GraphModel | undefined): number {
  if (!model) return 0;
  return model.isJoin ? JOIN_HALF : RADIUS[model.role];
}

/** Demi-côté du carré d'une entité de liaison. */
const JOIN_HALF = 15;

/** Halo de la couleur du fond derrière un texte : lisible même posé sur une liaison. */
const HALO = { stroke: "var(--background)", strokeWidth: 4, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };

function Legend({ className, label }: { className: string; label: string }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="5" className={className} strokeWidth="1.5" /></svg>
      {label}
    </span>
  );
}

/** Plusieurs relations entre les deux mêmes entités : des courbes écartées, pas des traits superposés. */
function parallelOffset(link: EntityLink, links: EntityLink[]): number {
  const same = links.filter(
    (l) => (l.from === link.from && l.to === link.to) || (l.from === link.to && l.to === link.from),
  );
  if (same.length < 2) return 0;
  const i = same.findIndex((l) => l.id === link.id);
  return (i - (same.length - 1) / 2) * 34;
}

function activate(e: KeyboardEvent, fn: () => void): void {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
}

function AtomView({
  model,
  at,
  selected,
  op,
  onSelect,
}: {
  model: GraphModel;
  at: Point | undefined;
  selected: boolean;
  /** Parcours en cours : effet de l'étape sur cette entité (null : pas touchée). Absent : pas de parcours. */
  op?: EffectOp | null;
  onSelect: () => void;
}): JSX.Element | null {
  if (!at) return null;
  const r = radiusOf(model);
  const tone =
    op
      ? OP_TONE[op]
      : op === null
        ? "fill-muted stroke-gray-300 dark:stroke-gray-600"
        : model.role === "focus"
          ? "fill-emerald-500/20 stroke-emerald-600"
          : "fill-muted stroke-gray-400";
  // Fond opaque sous la teinte : les liaisons s'arrêtent au bord de l'atome et ne le traversent pas.
  const base = { fill: "var(--background)" };
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${model.name}${model.isJoin ? ", entité de liaison" : ""}${op ? `, ${OP_LABEL[op]} par l'étape` : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => activate(e, onSelect)}
      className={`cursor-pointer outline-none [&:focus-visible>.ring]:stroke-emerald-400 ${op === null ? "opacity-40" : ""}`}
    >
      <circle className="ring fill-none stroke-transparent" cx={at.x} cy={at.y} r={r + 6} strokeWidth="3" />
      {model.isJoin ? (
        <>
          <rect x={at.x - r} y={at.y - r} width={2 * r} height={2 * r} rx={5} style={base} />
          <rect x={at.x - r} y={at.y - r} width={2 * r} height={2 * r} rx={5} className={tone} strokeWidth={selected ? 3 : 1.5} />
        </>
      ) : (
        <>
          <circle cx={at.x} cy={at.y} r={r} style={base} />
          <circle cx={at.x} cy={at.y} r={r} className={tone} strokeWidth={selected ? 3 : 1.5} />
        </>
      )}
      <text
        x={at.x}
        y={at.y + r + 16}
        textAnchor="middle"
        style={HALO}
        className={`fill-foreground ${model.role === "focus" ? "text-[13px] font-semibold" : "text-[11px]"}`}
      >
        {model.name}
      </text>
    </g>
  );
}

function LinkView({
  link,
  from,
  to,
  rFrom,
  rTo,
  offset,
  selected,
  dimmed,
  onSelect,
}: {
  link: EntityLink;
  from: Point | undefined;
  to: Point | undefined;
  rFrom: number;
  rTo: number;
  offset: number;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}): JSX.Element | null {
  if (!from || !to) return null;
  // Relation d'une entité vers elle-même (hiérarchie) : une boucle au-dessus de l'atome.
  if (link.from === link.to) {
    const top = from.y - rFrom;
    const d = `M ${from.x - 10} ${top + 2} C ${from.x - 48} ${top - 60}, ${from.x + 48} ${top - 60}, ${from.x + 10} ${top + 2}`;
    return <LinkPath d={d} link={link} selected={selected} dimmed={dimmed} onSelect={onSelect} label={{ x: from.x, y: top - 50 }} />;
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const c = { x: (from.x + to.x) / 2 + nx * offset, y: (from.y + to.y) / 2 + ny * offset };
  // Extrémités ramenées au bord des atomes, dans la direction de la courbe.
  const edge = (p: Point, r: number): Point => {
    const ux = c.x - p.x;
    const uy = c.y - p.y;
    const ul = Math.max(1, Math.hypot(ux, uy));
    return { x: p.x + (ux / ul) * r, y: p.y + (uy / ul) * r };
  };
  const a = edge(from, rFrom + 2);
  const b = edge(to, rTo + 2);
  const d = `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
  // Cardinalité près de chaque extrémité : « N » côté plusieurs, « 1 » côté un.
  const mark = (p: Point, r: number): Point => edge(p, r + 13);
  const fromMark = link.cardinality === "1-1" ? "1" : "N";
  const toMark = link.cardinality === "N-N" ? "N" : "1";
  return (
    <LinkPath
      d={d}
      link={link}
      selected={selected}
      dimmed={dimmed}
      onSelect={onSelect}
      marks={[
        { at: mark(from, rFrom), text: fromMark },
        { at: mark(to, rTo), text: toMark },
      ]}
    />
  );
}

function LinkPath({
  d,
  link,
  selected,
  dimmed,
  onSelect,
  marks = [],
  label,
}: {
  d: string;
  link: EntityLink;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
  marks?: { at: Point; text: string }[];
  label?: Point;
}): JSX.Element {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Relation ${link.from}.${link.fromField} vers ${link.to}`}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => activate(e, onSelect)}
      className={`cursor-pointer outline-none [&:focus-visible>.hit]:stroke-emerald-400/40 ${dimmed ? "opacity-25" : ""}`}
    >
      {/* Zone de clic plus large que le trait. */}
      <path d={d} className="hit fill-none stroke-transparent" strokeWidth="14" />
      <path
        d={d}
        className={`fill-none ${selected ? "stroke-emerald-600" : "stroke-gray-500"}`}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeDasharray={link.required ? undefined : "5 4"}
      />
      {marks.map((m, i) => (
        <text key={i} x={m.at.x} y={m.at.y + 4} textAnchor="middle" style={HALO} className="fill-muted-foreground text-[11px] font-semibold">
          {m.text}
        </text>
      ))}
      {label && (
        <text x={label.x} y={label.y} textAnchor="middle" style={HALO} className="fill-muted-foreground text-[10px]">
          {link.fromField}
        </text>
      )}
    </g>
  );
}

/* ─── Fiches ──────────────────────────────────────────────────────────── */

function typeLabel(f: EntityField): string {
  return `${f.type}${f.list ? "[]" : ""}${f.optional ? "?" : ""}`;
}

function ModelCard({
  model,
  graph,
  highlightField,
  stepEffect,
  onSelect,
}: {
  model: GraphModel;
  graph: ChapterGraph;
  highlightField?: string;
  /** Parcours en cours : ce que l'étape fait à cette entité (propriétés écrites marquées). */
  stepEffect?: { op: EffectOp; fields: string[] }[];
  onSelect: (s: Selection) => void;
}): JSX.Element {
  const listRef = useRef<HTMLUListElement>(null);
  const known = new Set(graph.models.map((m) => m.name));
  const written = new Set(stepEffect?.flatMap((e) => e.fields) ?? []);

  // Propriété désignée depuis le texte : amenée dans la vue.
  useEffect(() => {
    if (!highlightField) return;
    listRef.current?.querySelector(`[data-field="${highlightField}"]`)?.scrollIntoView({ block: "center" });
  }, [highlightField, model.name]);

  return (
    <div>
      <h3 className="text-base font-semibold">
        {model.name}
        {model.isJoin && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal">entité de liaison</span>}
      </h3>
      {model.doc && <p className="mt-1 text-sm text-muted-foreground">{model.doc}</p>}
      {model.focusFields.length > 0 && (
        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
          En vert : les propriétés dont parle ce chapitre.
        </p>
      )}
      {stepEffect && stepEffect.length > 0 && (
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
          Étape en cours : {stepEffect.map((e) => OP_LABEL[e.op]).join(", ")}
          {written.size > 0 && " ; propriétés écrites marquées « écrite »"}.
        </p>
      )}
      <ul ref={listRef} className="mt-3 divide-y text-sm">
        {model.fields.map((f) => {
          const inChapter = model.focusFields.includes(f.name);
          const flash = highlightField === f.name;
          const enumDef = f.kind === "enum" ? graph.enums.find((e) => e.name === f.type) : undefined;
          return (
            <li
              key={f.name}
              data-field={f.name}
              className={`py-2 ${inChapter ? "-mx-2 rounded bg-emerald-500/10 px-2" : ""} ${flash ? "ring-2 ring-emerald-500" : ""}`}
            >
              <div className="flex flex-wrap items-baseline gap-x-2">
                <code className="font-semibold">{f.name}</code>
                {written.has(f.name) && (
                  <span className="rounded-full bg-amber-400/30 px-1.5 text-[11px] text-amber-900 dark:text-amber-200">écrite</span>
                )}
                {f.kind === "relation" && known.has(f.type) ? (
                  <button
                    type="button"
                    onClick={() => onSelect({ kind: "model", name: f.type })}
                    className="text-xs text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
                  >
                    {typeLabel(f)}
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">{typeLabel(f)}</span>
                )}
                {f.attributes.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">{f.attributes.join(" ")}</span>
                )}
              </div>
              {f.doc && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{f.doc}</p>}
              {enumDef && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Valeurs : {enumDef.values.map((v) => v.name).join(", ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Effet de la suppression de `to` sur les `from` qui lui sont liés, en français. */
function onDeleteText(link: EntityLink): string {
  switch (link.onDelete) {
    case "Cascade":
      return `chaque ${link.from} lié est supprimé avec lui`;
    case "SetNull":
      return `chaque ${link.from} lié est conservé, détaché (clé remise à vide)`;
    case "Restrict":
    case "NoAction":
      return `suppression refusée tant qu'un ${link.from} y est lié`;
    case "SetDefault":
      return `chaque ${link.from} lié reprend la valeur par défaut`;
    default:
      return link.onDelete;
  }
}

function LinkCard({
  link,
  graph,
  onSelect,
}: {
  link: EntityLink;
  graph: ChapterGraph;
  onSelect: (s: Selection) => void;
}): JSX.Element {
  const fromModel = graph.models.find((m) => m.name === link.from);
  const field = fromModel?.fields.find((f) => f.name === link.fromField);
  const card =
    link.cardinality === "N-N"
      ? `plusieurs ${link.from} ↔ plusieurs ${link.to}`
      : link.cardinality === "1-1"
        ? `un ${link.from} ↔ un ${link.to} au plus`
        : `plusieurs ${link.from} → un ${link.to}`;
  const go = (name: string) => (
    <button type="button" onClick={() => onSelect({ kind: "model", name })} className="font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-300">
      {name}
    </button>
  );
  return (
    <div className="space-y-2 text-sm">
      <h3 className="text-base font-semibold">
        {go(link.from)}.{link.fromField} → {go(link.to)}
        {link.toField ? <span className="font-normal text-muted-foreground"> (inverse : {link.to}.{link.toField})</span> : null}
      </h3>
      {field?.doc && <p className="text-muted-foreground">{field.doc}</p>}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-muted-foreground">Cardinalité</dt>
        <dd>{card}</dd>
        {link.fkFields.length > 0 && (
          <>
            <dt className="text-muted-foreground">Clé</dt>
            <dd>
              <code>{link.fkFields.join(", ")}</code> {link.required ? "(obligatoire)" : "(facultative)"}
            </dd>
          </>
        )}
        {link.cardinality !== "N-N" && (
          <>
            <dt className="text-muted-foreground">Si {link.to} est supprimé</dt>
            <dd>
              {onDeleteText(link)} (<code>{link.onDelete}</code>)
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
