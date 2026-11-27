# Le scénario Killercoda de la démo

Killercoda lit ses scénarios dans un dépôt GitHub dont chaque dossier de premier niveau est un
scénario : ce dépôt-là est `zarakeye/akfc-killercoda`, public, qui ne contient que `akfc-demo/`.

**La source est ici**, dans le monorepo, à côté du code qu'elle lance : on la modifie ici, on la
relit avec le reste, la documentation la cite (partie « Infrastructure et déploiement »).
`zarakeye/akfc-killercoda` n'en est que la copie publiée.

Publier, depuis la racine du monorepo :

```bash
bash scripts/publier-scenario-killercoda.sh ~/akfc-killercoda   # copie et commit, sans push
cd ~/akfc-killercoda && git push
```

Le workflow `.github/workflows/killercoda.yml` (sur `main`, quand le scénario change) compare `akfc-demo/` des deux dépôts et
échoue tant que la copie publiée diffère : elle rappelle qu'il reste à publier.

| Fichier | Rôle |
|---|---|
| `index.json` | Titre, étapes, machine (`ubuntu-4GB`). |
| `background.sh` | Lancé à l'ouverture, sans être affiché : installe compose, pose les adresses, démarre la sandbox. Trace : `/tmp/akfc-setup.log`. |
| `foreground.sh` | Le terminal visible : attend que `background.sh` ait écrit le script d'attente, puis le lance. |
| `intro.md`, `step1.md`, `finish.md` | Les textes des étapes. |
