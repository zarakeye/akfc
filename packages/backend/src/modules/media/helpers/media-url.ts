export type MediaUrlAudience = 'admin' | 'public';

export function buildMediaProxyUrl(
  asset: { publicId: string | null; fullPath: string },
  audience: MediaUrlAudience = 'admin',
): string {
  const encodeSegments = (path: string) =>
    path.split('/').map(encodeURIComponent).join('/');
  if (asset.publicId !== null) {
    return `/api/media/by-public-id/${encodeSegments(asset.publicId)}?variant=large`;
  }
  const r2Prefix =
    audience === 'public' ? '/api/media/public/r2' : '/api/media/r2';
  return `${r2Prefix}/${encodeSegments(asset.fullPath)}`;
}
