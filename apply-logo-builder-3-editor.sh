#!/usr/bin/env bash
# AKFC — Logo dans le builder (Volet 1bis, inc 3 : éditeur).
# Ajoute une 3e option « …ou le logo du site » (bouton bascule → { kind: "site-logo" })
# dans les éditeurs media-text ET float-text, après le bloc AvatarPicker.
# Usage : bash apply-logo-builder-3-editor.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
ME="apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx"
FE="apps/web/src/features/page-builder/blocks/float-text/editor.client.tsx"
for f in "$ME" "$FE"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

python3 - "$ME" "$FE" <<'PY'
import sys, pathlib
ME, FE = sys.argv[1], sys.argv[2]

# Le bloc UI « logo du site » : bouton bascule. Pose { kind: "site-logo" } en
# conservant une éventuelle caption ; re-clic → retire (media undefined).
LOGO_BLOCK = '''
        {/* Option 3 : logo du site (référence dynamique, hors finder) */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            …ou le logo du site
          </span>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...block,
                media:
                  block.media && block.media.kind === "site-logo"
                    ? undefined
                    : {
                        kind: "site-logo",
                        caption:
                          block.media && "caption" in block.media
                            ? block.media.caption
                            : undefined,
                      },
              })
            }
            className={
              block.media && block.media.kind === "site-logo"
                ? "rounded border border-foreground px-3 py-1 text-sm"
                : "rounded border px-3 py-1 text-sm hover:bg-muted"
            }
          >
            {block.media && block.media.kind === "site-logo"
              ? "Logo du site sélectionné (cliquer pour retirer)"
              : "Utiliser le logo du site"}
          </button>
        </div>
'''

def insert_after_avatarpicker(path, name):
    s = pathlib.Path(path).read_text(encoding="utf-8")
    if 'kind === "site-logo"' in s and "logo du site" in s:
        print(f"  — {name} déjà"); return
    # Ancre : la fermeture du <AvatarPicker ... /> (onSelect se termine par `}` puis `/>`).
    # On insère le bloc logo juste après la fermeture de l'AvatarPicker.
    # L'AvatarPicker se termine par une accolade de onSelect puis "          />".
    anchor = '''            }
          />
        </div>'''
    # media-text ET float-text ont ce motif après onSelect de l'AvatarPicker.
    assert s.count(anchor) >= 1, f"{name}: ancre fermeture AvatarPicker introuvable"
    # On cible la PREMIÈRE occurrence qui suit un AvatarPicker : sécuriser en exigeant
    # que "AvatarPicker" apparaisse avant l'ancre.
    idx = s.find("AvatarPicker")
    pos = s.find(anchor, idx)
    assert pos != -1, f"{name}: ancre après AvatarPicker introuvable"
    # insérer le bloc logo APRÈS la </div> de l'AvatarPicker
    end = pos + len(anchor)
    s = s[:end] + "\n" + LOGO_BLOCK + s[end:]
    pathlib.Path(path).write_text(s, encoding="utf-8")
    print(f"  ok  {name} : option logo ajoutée")

insert_after_avatarpicker(ME, "media-text editor")
insert_after_avatarpicker(FE, "float-text editor")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(page-builder): éditeur — option « logo du site » (media-text + float-text)" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }