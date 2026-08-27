import { NextRequest } from "next/server";

import { prisma } from "@backend/prisma";
import {
  fetchAuthenticatedAsset,
  fetchVideoPoster,
} from "@backend/modules/cloudinary/services/cloudinary.service";

/**
 * Proxy PUBLIC des images / vidéos Cloudinary de bibliothèque.
 *
 * Pendant Cloudinary de `/api/media/public/r2/[...path]`, et symétrique de
 * `/api/media/by-public-id/[...publicId]` — qui, lui, exige une session
 * parce qu'il sert aussi des documents personnels (et un fallback R2).
 *
 * ─── Garde (doctrine « deux gestes intentionnels ») ─────────────────────
 *
 *   l'asset doit être `published` ET référencé par au moins une
 *   `PageMediaReference`.
 *
 * Un document personnel n'est jamais référencé par une page : il ne passe
 * donc jamais cette garde, sans qu'on ait à distinguer « image » de
 * « document ». C'est ce qui rend cette route sûre là où rouvrir le proxy
 * général ne le serait pas.
 *
 * ─── 404 uniforme ───────────────────────────────────────────────────────
 *
 * Comme la route R2 publique : on ne distingue pas « n'existe pas » de
 * « existe mais non servable ». Tout refus est un 404 — et aucune image de
 * démonstration n'est servie ici.
 *
 * ─── Livraison ──────────────────────────────────────────────────────────
 *
 * Le backend détient le secret Cloudinary, signe l'URL `authenticated`, va
 * chercher le binaire et le re-streame. Paramètres reconnus, en parité avec
 * le proxy authentifié : `variant`, `as=poster`, `v` (version Cloudinary),
 * `format` (extension autoritaire, cf. buildAuthenticatedUrl).
 */

type Variant = "thumb" | "small" | "medium" | "large" | "original";

function parseVariant(value: string | null): Variant {
  if (value === "thumb") return "thumb";
  if (value === "small") return "small";
  if (value === "medium") return "medium";
  if (value === "large") return "large";
  if (value === "original") return "original";
  return "large";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string[] }> },
) {
  try {
    const { publicId } = await params;
    const id = publicId?.join("/");
    if (!id) return new Response("Not found", { status: 404 });

    // ─── Garde : published + placé (page OU galerie publique) ──────────────
    // Clé sur `publicId` (@unique). L'asset ne se sert publiquement que si
    // un PageMediaReference le pointe et qu'il est publié — l'invariant
    // « référencé ⟹ published » est verrouillé côté sync + gardes de statut,
    // mais on revérifie ici : cette route est frappable indépendamment du
    // rendu de la page.
    let servable = await prisma.mediaAsset.findFirst({
      where: {
        publicId: id,
        status: "published",
        OR: [
          { pageReferences: { some: {} } },
          { galleryItems: { some: { gallery: { visibility: "PUBLIC" } } } },
        ],
      },
      select: { id: true },
    });

    // ─── Repli : le LOGO DU SITE ──────────────────────────────────────────
    // Pas servable par la voie normale (published + placé). Reste un cas
    // public par nature : le logo choisi par un admin dans les réglages. On
    // l'autorise indépendamment de published/placé — le choisir EST l'acte de
    // publication — et LUI SEUL : changer/retirer le logo révoque l'accès.
    if (!servable) {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "site" },
        select: { logoAssetId: true },
      });
      if (settings?.logoAssetId) {
        servable = await prisma.mediaAsset.findFirst({
          where: { publicId: id, id: settings.logoAssetId },
          select: { id: true },
        });
      }
    }

    if (!servable) return new Response("Not found", { status: 404 });

    // ─── Paramètres de rendu ──────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const variant = parseVariant(searchParams.get("variant"));
    const asPoster = searchParams.get("as") === "poster";

    const vParam = searchParams.get("v");
    const version = vParam ? Number(vParam) : undefined;
    const safeVersion =
      version && Number.isFinite(version) ? version : undefined;

    const rawFormat = searchParams.get("format");
    const format =
      rawFormat && /^[A-Za-z0-9]{1,8}$/.test(rawFormat) ? rawFormat : undefined;

    const asset = asPoster
      ? await fetchVideoPoster(id, variant)
      : await fetchAuthenticatedAsset(id, variant, safeVersion, format);

    // Asset gardé mais introuvable côté Cloudinary : erreur réelle, mais on
    // ne révèle rien de plus — 404 franc, pas d'image de secours.
    if (!asset || !asset.ok || !asset.body) {
      return new Response("Not found", { status: 404 });
    }

    const contentType =
      asset.headers.get("content-type") ?? "application/octet-stream";
    const isMedia = /^(image|video)\//.test(contentType);

    return new Response(asset.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // On ne fige (1 an, immutable) que ce qui est bien un média : une
        // réponse inattendue ne doit pas se fossiliser dans le cache client.
        "Cache-Control": isMedia
          ? "public, max-age=31536000, immutable"
          : "public, max-age=60",
        "X-Asset-Source": "cloudinary",
      },
    });
  } catch (error) {
    console.error("[media] public by-public-id error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
