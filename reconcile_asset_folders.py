#!/usr/bin/env python3
"""
Réconciliation dynamic folders — réaligne l'`asset_folder` de chaque asset
Cloudinary sur le dossier dérivé de son `public_id`.

CONTEXTE : le compte est en dynamic folders. Le public_id (piloté par l'appli)
et l'asset_folder (dossier-entité, vérité de l'arbo Cloudinary) sont
indépendants. Les assets déplacés AVANT le fix `api.update` ont un asset_folder
périmé (ex. public_id en `published/...` mais asset_folder resté en
`pending/...`). Ce script les rattrape en masse.

USAGE (depuis la racine du monorepo, le .env doit contenir les 3 CLOUDINARY_*) :
    set -a; source .env; set +a
    python3 reconcile_asset_folders.py            # DRY-RUN : liste, ne modifie rien
    python3 reconcile_asset_folders.py --apply    # applique les corrections

Le dry-run est le défaut : on regarde d'abord ce qui serait changé.
"""
import json
import os
import sys
import urllib.parse
import urllib.request

CLOUD = os.environ.get("CLOUDINARY_CLOUD_NAME")
KEY = os.environ.get("CLOUDINARY_API_KEY")
SECRET = os.environ.get("CLOUDINARY_API_SECRET")

if not all([CLOUD, KEY, SECRET]):
    sys.exit(
        "ERREUR : CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET absents de "
        "l'environnement. Fais d'abord : set -a; source .env; set +a"
    )

APPLY = "--apply" in sys.argv
BASE = f"https://api.cloudinary.com/v1_1/{CLOUD}"
# Les assets applicatifs sont en delivery type 'authenticated'.
RESOURCE_TYPES = ["image", "video", "raw"]
DELIVERY_TYPE = "authenticated"


def _auth_header() -> dict:
    import base64

    token = base64.b64encode(f"{KEY}:{SECRET}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


def _get(url: str) -> dict:
    req = urllib.request.Request(url, headers=_auth_header())
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())


def list_all(resource_type: str):
    """Pagine tous les assets d'un resource_type/type donné."""
    assets = []
    cursor = None
    while True:
        params = {"type": DELIVERY_TYPE, "max_results": 100}
        if cursor:
            params["next_cursor"] = cursor
        qs = urllib.parse.urlencode(params)
        url = f"{BASE}/resources/{resource_type}?{qs}"
        data = _get(url)
        assets.extend(data.get("resources", []))
        cursor = data.get("next_cursor")
        if not cursor:
            break
    return assets


def expected_folder(public_id: str) -> str:
    """Dossier attendu = public_id moins son dernier segment."""
    return public_id.rsplit("/", 1)[0] if "/" in public_id else ""


def update_asset_folder(resource_type: str, public_id: str, folder: str):
    """POST /resources/{type}/{delivery}/update — déplace le dossier-entité."""
    url = f"{BASE}/resources/{resource_type}/{DELIVERY_TYPE}/update"
    payload = urllib.parse.urlencode(
        {"public_ids[]": public_id, "asset_folder": folder}
    ).encode()
    # NB : l'endpoint update accepte public_id via l'URL OU public_ids en body ;
    # on passe par un appel unitaire pour un rapport clair.
    single = f"{BASE}/{resource_type}/{DELIVERY_TYPE}/update"
    body = urllib.parse.urlencode(
        {"public_id": public_id, "asset_folder": folder}
    ).encode()
    req = urllib.request.Request(
        single, data=body, headers=_auth_header(), method="POST"
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())


def main():
    mode = "APPLY" if APPLY else "DRY-RUN (aucune modification)"
    print(f"=== Réconciliation asset_folder — mode {mode} ===\n")

    total = 0
    drift = 0
    fixed = 0
    errors = 0

    for rt in RESOURCE_TYPES:
        try:
            assets = list_all(rt)
        except Exception as e:  # noqa: BLE001
            print(f"[{rt}] listing impossible : {e}")
            continue

        for a in assets:
            total += 1
            pid = a.get("public_id", "")
            current = a.get("asset_folder", "")
            want = expected_folder(pid)
            if current == want:
                continue
            drift += 1
            print(f"DRIFT [{rt}] {pid}")
            print(f"      asset_folder actuel : {current!r}")
            print(f"      attendu             : {want!r}")
            if APPLY:
                try:
                    update_asset_folder(rt, pid, want)
                    fixed += 1
                    print("      -> corrigé")
                except Exception as e:  # noqa: BLE001
                    errors += 1
                    print(f"      -> ERREUR : {e}")
            print()

    print("=== Bilan ===")
    print(f"  assets inspectés   : {total}")
    print(f"  désynchronisés     : {drift}")
    if APPLY:
        print(f"  corrigés           : {fixed}")
        print(f"  erreurs            : {errors}")
        print(
            "\nRelance en dry-run pour vérifier qu'il ne reste aucun DRIFT, "
            "puis refais un move de test."
        )
    else:
        print(
            "\nDRY-RUN terminé. Si la liste te convient, relance avec --apply.\n"
            "Après application, les anciens dossiers vidés côté Cloudinary "
            "pourront être supprimés (ils cesseront d'être 'not empty')."
        )


if __name__ == "__main__":
    main()