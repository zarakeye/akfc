export type MediaUrlAudience = 'admin' | 'public';

/**
 * URL de diffusion d'un média via les routes proxy R2 (admin : session
 * requise ; public : garde « publié + référencé »).
 *
 * `?variant=large` : vignette 1200 px pour une image ; les appelants ajoutent
 * `&as=poster` pour l'affiche d'une vidéo. Ignoré pour un document (servi tel quel).
 */
export function buildMediaProxyUrl(
  asset: { fullPath: string },
  audience: MediaUrlAudience = 'admin',
): string {
  const encoded = asset.fullPath.split('/').map(encodeURIComponent).join('/');
  const prefix = audience === 'public' ? '/api/media/public/r2' : '/api/media/r2';
  return `${prefix}/${encoded}?variant=large`;
}
