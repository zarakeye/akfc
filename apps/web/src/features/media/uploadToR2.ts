import type { UploadDestination } from "@contracts/storage/upload-destination.schema";

/**
 * Les trois temps d'un envoi vers le stockage, pour un fichier :
 *   1. demander au serveur une URL d'envoi signée (storage.createR2Upload) ;
 *   2. envoyer le fichier DIRECTEMENT au stockage (PUT sur cette URL) ;
 *   3. faire enregistrer ce qui est arrivé (storage.registerR2Upload).
 *
 * Une seule écriture de la séquence pour tous les formulaires d'envoi : le type annoncé, le
 * Content-Type du PUT et le type attendu à l'enregistrement sont forcément les mêmes (le stockage
 * refuse un PUT dont le Content-Type diffère de celui signé). Les mutations tRPC sont passées par
 * l'appelant, qui garde ainsi ses états de chargement et ses invalidations.
 */
export async function uploadToR2<Registered>(params: {
  file: File;
  destination: UploadDestination;
  allowOverwrite?: boolean;
  create: (input: {
    destination: UploadDestination;
    originalFileName: string;
    mimeType: string;
    maxBytes: number;
    allowOverwrite?: boolean;
  }) => Promise<{ uploadUrl: string; path: string }>;
  register: (input: {
    path: string;
    expectedBytes: number;
    expectedMimeType: string;
    destination: UploadDestination;
    originalFileName: string;
  }) => Promise<Registered>;
}): Promise<Registered> {
  const { file, destination, allowOverwrite, create, register } = params;
  // Un navigateur qui ne reconnaît pas le format (.rar, parfois) donne un type vide : on annonce
  // alors un flux d'octets, que le serveur accepte si l'extension est autorisée.
  const mimeType = file.type || "application/octet-stream";

  const auth = await create({
    destination,
    originalFileName: file.name,
    mimeType,
    maxBytes: file.size,
    allowOverwrite,
  });

  const res = await fetch(auth.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: file,
  });
  if (!res.ok) {
    // 403 : autorisation expirée (cinq minutes) ou type différent de celui signé.
    throw new Error(`Le stockage a refusé l'envoi de « ${file.name} » (HTTP ${res.status}). Relancez-le.`);
  }

  // Le chemin renvoyé par le serveur est retransmis tel quel : jamais recalculé ici.
  return register({
    path: auth.path,
    expectedBytes: file.size,
    expectedMimeType: mimeType,
    destination,
    originalFileName: file.name,
  });
}
