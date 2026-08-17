/**
 * Un dossier d'ESPACE DE GROUPE : chemin `${appRoot}/groups/<slug>-<cuid>`
 * (racine d'espace, physique ou nœud synthétique de l'imbrication). Sert à lui
 * donner une icône distincte dans le finder.
 */
const GROUP_SPACE_PATH = /\/groups\/[^/]+-c[a-z0-9]{24}$/;

export function isGroupSpaceFolder(path: string): boolean {
  return GROUP_SPACE_PATH.test(path);
}
