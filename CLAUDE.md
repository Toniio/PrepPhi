# PrepPhi — consignes pour Claude Code

PrepPhi est le coach sportif personnel d'Anthony : une app web, pour lui seul, qui planifie ses séances de callisthénie et d'elliptique, recueille un check-in après chaque séance, et ajuste la semaine suivante lors d'une revue avec un coach IA. Elle est publiée comme artifact claude.ai et c'est le premier projet consommateur du design system DSAIReadable.

Ce fichier résume un cadrage complet mené le 4 octobre 2026. Les décisions ci-dessous sont figées : en cas de doute, demande à Anthony plutôt que de réinterpréter.

## Sources de vérité

| Fichier | Rôle |
| --- | --- |
| [Doc validé](https://claude.ai/code/artifact/40d11110-3e5e-4dfb-853f-543baee839c6) | Échelles et règles, version lisible, validée le 2026-10-04 |
| `data/ladders.json` | Les 10 échelles de progression (double progression) |
| `data/rules.json` | Règles d'adaptation, semaine allégée, douleur, séances ratées, déplacements, elliptique, config du coach |
| `data/hd-exercises.json` | Les 19 étapes absentes du dataset : fiche FR, lien vidéo |
| `data/catalog-overrides.json` | Corrections après revue des GIF : exclusions, matériel, consignes FR réécrites |
| `scripts/build-catalog.py` | Génère `src/data/catalog.json` et `src/assets/exercises/*.webp` depuis exercises-dataset |
| `data/names-fr.json` | Noms français des exercices du catalogue (à créer, voir tâches) |

Toute modification d'une échelle ou d'un seuil passe par l'accord d'Anthony.

## Décisions figées

**Produit**
- Outil personnel, sport seul (pas d'alimentation ni de sommeil en v1), pas de mesure corporelle.
- Priorités : régularité > force/skills > endurance > recomposition.
- Skill P1 : handstand / handstand push-up. Skill P2 : muscle-up, sur barre de parc uniquement, car sa barre est une barre d'encadrement de porte.
- Matériel à domicile : barre de porte, mur libre, elliptique, table solide, serviette sur sol lisse, chaise. Déplacements à Paris environ toutes les 3 semaines (variable), sans matériel.

**Rythme et usage**
- Semaine du lundi au dimanche, revue le dimanche soir.
- Onboarding : questionnaire (`Questionnaire` du DS), puis séance test qui place chaque échelle. Il demande aussi la longueur de la barre, la FC de repos et max, et la plage de résistance de l'elliptique.
- Check-in sans IA : répétitions pré-remplies, ressenti en 3 états (`ToggleGroup`), signalement de douleur optionnel. Saisie selon le format : séries, répétitions dans un temps, isométrie.
- Minuteur de repos entre les séries, et séquenceur de blocs travail/repos sur plusieurs tours (circuits, fractionné elliptique), avec bip, annonce vocale en français (Web Speech) et maintien de l'écran allumé si la page l'autorise.
- Rappels : bouton « Ajouter à mon agenda » qui crée les séances dans Google Agenda, sur validation explicite.

**Coach**
- Adaptation hybride : les règles calculent, le coach arbitre et explique. Ton factuel et sobre, tutoiement.
- Contexte envoyé : 4 semaines détaillées + résumé cumulatif stocké à chaque revue, les échelles, une réserve d'accessoires par groupe musculaire. Jamais le catalogue entier.
- Niveau de modèle : `complex` pour le plan hebdo, `default` pour la conversation.

**Données**
- Catalogue fermé : 305 exercices (poids du corps, barre, mur, table, serviette, chaise, elliptique), médias en WebP animé qualité 40 (~8,2 Mo une fois intégrés). Les 19 étapes hors dataset viennent de `data/hd-exercises.json`. Pas de marche ni d'escalier à domicile.
- Import hebdomadaire du CSV « Activités » de Garmin Connect (elliptique, callisthénie, HIIT), plus saisie manuelle de la résistance et de l'effort perçu.
- Export et import JSON complets, avec `schemaVersion`, pour une migration future.

## Stack et build

- Vite + React 19 + TypeScript + Tailwind CSS v4. Pas de Next.js.
- Build en **un seul fichier HTML autonome** (`vite-plugin-singlefile`, assets intégrés). Plafond : 16 Mo. Ajoute un script qui échoue au-delà de 15 Mo.
- Polices du DS, embarquées via `@fontsource-variable` : JetBrains Mono pour toute l'interface (`font-mono`), Geist pour `font-sans` (touches `Kbd`). Ne pas les modifier. Icônes : `@phosphor-icons/react` uniquement.
- Le code (identifiants, commentaires) est en anglais, les textes d'interface en français.

## Design system DSAIReadable (v0.1.3)

Installation, dans cet ordre :

```bash
npx shadcn add Toniio/DSAIReadable/design-system#v0.1.3   # tokens, verrouillage Tailwind, helpers
npx shadcn add Toniio/DSAIReadable/conventions#v0.1.3     # règles pour les agents
claude plugin marketplace add Toniio/DSAIReadable
claude plugin install dsaireadable@dsaireadable           # skills + serveur MCP
```

- Suis le skill `dsaireadable-build` pour chaque écran : pattern, specs des composants via le serveur MCP, validation jusqu'à zéro erreur, puis revue `dsaireadable-ui-guard`.
- Les conventions installées font foi : aucune valeur brute, uniquement les classes sémantiques, aucun élément natif remplacé par un composant, mode sombre via la classe `.dark`.
- Libellés par défaut des composants : traduits en français via leurs props, jamais en modifiant le composant.
- **Composants candidats** (absents du DS) : compteur de séries, échelle de progression, carte d'exercice, séquenceur. Ils vivent dans `src/components/candidates/`, construits uniquement avec les tokens du DS, et chacun a une spec au format DSAIReadable (13 sections). Anthony décide lesquels intègrent le DS.
- Composants existants à réutiliser : `MessageScroller`, `Message`, `Bubble`, `Marker` (revue), `Questionnaire` (onboarding), `ToggleGroup`, `Slider` (effort perçu), `Chart`, `Card`, `AspectRatio`, `Drawer`, `Calendar`, `Tabs`, `Progress`, `Empty`, `Sonner`.

## Exécution dans claude.ai (page publiée)

La page publiée n'a accès ni à `fetch("https://api.anthropic.com/...")`, ni à `window.storage`, ni à `window.claude.complete`. Elle passe par les capacités d'exécution (`claude.use(name)`, qui renvoie `null` hors claude.ai) :

| Besoin | Capacité |
| --- | --- |
| Coach (revue, plan hebdo) | `sample` |
| Stockage privé des données | `db` + `user`, sous `data/users/<id>/` |
| Lecture des déplacements « Paris », création des séances | `mcp` (connecteur Google Agenda) |
| Export JSON | `downloads` |

- **Couche d'adaptation** (`src/runtime/`) : interfaces `CoachClient`, `Store`, `CalendarClient`, `Downloader`. Une implémentation claude.ai, et une implémentation de développement (faux coach scripté, `localStorage`, agenda fictif, téléchargement navigateur). Tous les écrans doivent fonctionner en développement.
- **Thème** : un script pose ou retire `.dark` sur `<html>` d'après l'attribut `data-theme` du visualiseur, sinon `prefers-color-scheme`. JS uniquement, aucun CSS conditionnel.
- **Mobile** : balise viewport avec `viewport-fit=cover` et marges `env(safe-area-inset-*)`.
- **Publication** : Anthony publie `dist/index.html` depuis le chat claude.ai, où Claude clone ce dépôt public. Les formats d'appel du connecteur Google Agenda y seront observés sur un vrai appel avant la première publication.

## Modèle de données (point de départ)

`profile` (onboarding, équipement, zones FC) · `ladderState` (palier et fourchette courante par échelle, gel, pause douleur) · `weekPlan` (séances prévues, contexte maison / déplacement / parc, séquences) · `sessionLog` (check-ins) · `cardioLog` (imports Garmin et saisies) · `reviewSummary` (résumé cumulatif) · `proposals` (modifications d'échelle ou de seuil en attente d'accord). Le tout est exportable dans un seul JSON versionné.

## Import Garmin : particularités du CSV

Une ligne par activité, colonnes `Activity Type`, `Date`, `Time`, `Avg HR`, `Max HR`, `Calories`, `Avg Bike Cadence`, `Total Reps`, `Total Sets`, `Body Battery Drain`… À gérer :
- `--` pour une valeur vide ;
- séparateurs de milliers (`2,992`) ;
- valeurs négatives précédées d'une apostrophe (`'-4`) ;
- types mélangés (Breathwork, Yoga, HIIT, Elliptical…) ;
- dédoublonnage par `Date` à chaque import, puisqu'un export contient plusieurs semaines.

## Tâches, dans l'ordre

1. Initialiser le projet (Vite, React, TypeScript, Tailwind v4), installer le DS et le plugin, configurer le build en fichier unique et le contrôle de taille.
2. Lancer `python scripts/build-catalog.py`. Vérifier sur leur GIF les exercices `1476`, `0696` et `2462`, et la liste « Needs a human look » de `scripts/catalog-report.md`.
3. Écrire `data/names-fr.json` : un nom français court et usuel pour les 305 exercices. Relancer le script.
4. Rédiger `docs/redaction-fr.md` : un guide de rédaction français qui reprend les principes du DS (voix, longueur, verbes d'action) avec le tutoiement et le ton factuel du coach.
5. Couche d'adaptation et script de thème.
6. Moteur de règles en TypeScript pur, testé unitairement contre `data/rules.json` et `data/ladders.json`.
7. Écrans, dans l'ordre d'usage : Aujourd'hui (séance, fiches, check-in, minuteur, séquenceur), Semaine, Onboarding, Revue, Progression.
8. Import du CSV Garmin, export et import JSON.
9. Build final, contrôle de taille, puis publication depuis claude.ai.

## Points ouverts

- `videoUrl` des 19 fiches hors dataset : à choisir (liens de recherche YouTube provisoires).
- Pictogrammes animés pour ces 19 étapes : plus tard, candidats pour le composant `Illustration`.
- Maintien de l'écran allumé (Wake Lock) : à tester dans la page publiée.
- Médias © Gym visual : garder la mention en pied de fiche.
