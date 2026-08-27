export type MediaUrlAudience = 'admin' | 'public';

export function buildMediaProxyUrl(
  asset: { publicId: string | null; fullPath: string },
  audience: MediaUrlAudience = 'admin',
): string {
  const encodeSegments = (path: string) =>
    path.split('/').map(encodeURIComponent).join('/');
  if (asset.publicId !== null) {
    const cldPrefix =
      audience === 'public'
        ? '/api/media/public/by-public-id'
        : '/api/media/by-public-id';
    // SVG : on transmet le format pour que le proxy livre le vecteur natif
    // (sans transformation raster qui échouerait). Cf. buildAuthenticatedUrl.
    const isSvg = asset.fullPath.toLowerCase().endsWith('.svg');
    return `${cldPrefix}/${encodeSegments(asset.publicId)}?variant=large${
      isSvg ? '&format=svg' : ''
    }`;
  }
  const r2Prefix =
    audience === 'public' ? '/api/media/public/r2' : '/api/media/r2';
  return `${r2Prefix}/${encodeSegments(asset.fullPath)}`;
}
