#!/usr/bin/env bash
# DIAGNOSTIC (lecture seule) : pourquoi le logo du header ne grandit pas. Ne modifie rien.
# Usage (racine du repo) : bash diag-logo-header.sh
cd "$(dirname "$0")"
H="apps/web/src/features/app-shell/Header.tsx"
echo "1. derniers commits :"; git log -4 --format='   %h %s'
echo "2. fichiers logo non commités :"; git status --short -- "$H" "apps/web/src/app/(public)/page.tsx" apps/web/public/AKFC_logo.svg | sed 's/^/   /'
echo "3. classes du logo dans Header.tsx :"
grep -nE 'flex items-center px-4|object-contain|h-15 w-auto' "$H" | sed 's/^ */   /'
echo "4. dernier pnpm check (fin du journal) :"
if [ -f /tmp/akfc_tc.log ]; then grep -v '^[[:space:]]*$' /tmp/akfc_tc.log | tail -4 | cut -c1-160 | sed 's/^/   /'; else echo "   (aucun journal)"; fi
echo "5. logo servi par le site local (Réglages) :"
L=$(curl -s --max-time 5 "http://localhost:3000/api/media/site-logo?raw=1" | head -c 600)
if [ -z "$L" ]; then echo "   site local injoignable (pnpm dev lancé ?)"
else
  printf '%s' "$L" | grep -o 'viewBox="[^"]*"' | head -1 | sed 's/^/   /'
  printf '%s' "$L" | grep -q 'data-akfc-disc' && echo "   ✅ logo à pastille (nouveau)" || echo "   ❌ ANCIEN logo (cadre non carré) : déposer logo-akfc-pastille.svg dans Réglages → logo"
fi