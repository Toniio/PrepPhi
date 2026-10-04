# Choix faits pendant la construction

Le 4 octobre 2026, Anthony a demandé d'enchaîner les tâches de `CLAUDE.md` sans le consulter, en prenant l'option recommandée à chaque question. Ce fichier liste ces choix pour qu'il les relise. Aucun ne modifie une échelle ni un seuil validé : ceux qui y touchent sont marqués **à valider**.

## Design system

- **Passage à v0.2.0.** CLAUDE.md fixait v0.1.3. À l'installation des composants, la CLI shadcn a servi v0.2.0 : le suffixe `#v0.1.3` n'a pas été appliqué, et la base `design-system` se lit toujours sur `main`. Le plugin et son serveur MCP sont aussi en v0.2.0. Le projet est donc aligné en entier sur v0.2.0 (base, helpers, conventions, composants). CLAUDE.md est mis à jour.

## Catalogue (tâches 2 et 3)

- 7 exercices exclus à la revue des GIF, puis 25 autres à la relecture complète : matériel absent (barres parallèles, banc décliné, machines, anneaux, tapis de course), doublons du nordic curl, mouvements dangereux sur une barre de porte. Liste et raisons : `data/catalog-overrides.json`. Catalogue final : 280 exercices.
- 68 consignes du dataset réécrites : elles décrivaient souvent un autre mouvement que l'animation. 39 notes signalent un matériel différent dans l'animation (« L'animation montre un banc : … »).
- `2462` exclu : son nom dit « barre droite » mais l'animation montre des barres parallèles.
- `0489` (hyperextension), accessoire de la chaîne postérieure, est gardé, avec une consigne réécrite pour le faire au sol.
- `3304` (skin the cat) passe au parc : trop risqué sur une barre de porte.

## Rédaction (tâche 4)

- Interface : « bilan » plutôt que « check-in », « palier » plutôt que « niveau », « semaine allégée » plutôt que « deload ».
- Ressenti : `Trop facile`, `Juste bien`, `Trop dur`.
- Boutons à l'infinitif, texte courant à l'impératif.

## Couche d'adaptation (tâche 5)

- L'agenda claude.ai reste indisponible tant que les formats du connecteur Google Agenda ne sont pas relevés sur un vrai appel (`src/runtime/claude/calendar.ts`).
- Stockage claude.ai : une clé par document sous `data/users/<id>/`, une semaine par document pour rester sous la limite de 256 Kio.

## Moteur de règles (tâche 6)

- **Plan type, à valider.** `rules.json` ne fixe ni le nombre de séances ni leur contenu. Par défaut : 3 séances de callisthénie et 2 d'elliptique par semaine, réglables à l'onboarding. Les séances A (tirage vertical, poussée, chaîne avant, gainage suspendu) et B (tirage horizontal, chaîne postérieure, gainage isométrique, handstand push-up) alternent, jamais deux jours de suite. L'équilibre du handstand ouvre chaque séance une fois débloqué. Le muscle-up n'a lieu qu'à la séance au parc, facultative, le week-end.
- **Zone basse de l'elliptique, à valider.** 60 à 70 % de la fréquence cardiaque de réserve (Karvonen). FC max estimée par Tanaka (208 − 0,7 × âge) si elle est inconnue.
- **Repos entre les séries.** 90 s sur les répétitions, 60 s sur les isométries, 120 s sur les skills.
- **Palier suivant.** Il est proposé, puis appliqué seulement si Anthony l'accepte à la revue. La régression, elle, s'applique d'elle-même : `rules.json` écrit « propose » pour l'une et « back to » pour l'autre.
- **Douleur.** Le palier inférieur reprend en bas de fourchette, l'option la plus prudente : `rules.json` dit seulement « drops one step ».
- **Conditions d'entrée des skills.** Toutes les conditions doivent tenir. Pour le handstand, il faut donc un hollow body d'au moins 20 s, en accord avec la note « Hollow body is a prerequisite shared by both skills ».
- **Handstand libre (palier 3).** La fourchette porte sur le temps cumulé de la séance, et le skill est acquis avec 3 tenues de 15 s.
- **Même durée.** Pour la dérive de FC, deux séances d'elliptique ont la même durée à 2 minutes près.
- **Déplacement.** Une étape impossible en chambre (le squat bulgare sans chaise, par exemple) est remplacée par l'étape inférieure faisable, en haut de sa fourchette.
- **Circuit en chambre.** 4 tours de burpee, mountain climber et squat sauté, 30 s chacun, avec des repos de 15 s, plus 60 s en fin de tour.

## Écrans (tâche 7)

- **Navigation.** Une `Sidebar` (pattern « navigation » du DS), qui devient un `Sheet` sur mobile, avec 5 sections : Aujourd’hui, Semaine, Revue, Progression, Données. La section courante est dans l’URL (`#aujourdhui`…).
- **Bilan.** Les répétitions sont pré-remplies avec les cibles. Marquer une série faite lance le minuteur de repos. La séance en cours est gardée dans le navigateur, pour survivre à un rechargement.
- **Handstand libre.** Le temps cumulé et le nombre de tenues de 15 s ou plus se notent à part ; le moteur reçoit les tenues.
- **Coach.** Le plan hebdomadaire part des règles ; le coach peut déplacer une séance, ajouter au plus 2 accessoires par séance et écrire une note. Chaque changement est vérifié avant d’entrer dans le plan, et les changements invalides sont écartés. Sans réponse du coach, le plan des règles est proposé tel quel.
- **Semaine en revue.** Le dimanche, c’est la semaine en cours. Plus tard dans la semaine, c’est la précédente, tant que sa revue n’a pas planifié la suivante.
- **Agenda.** Les séances sont créées à l’heure habituelle indiquée à l’onboarding (18 h 30 par défaut).
- **Report d’une séance.** Il s’applique tout de suite, avec « Annuler » dans la notification.
- **Composants candidats.** `Sequencer`, `SetCounter`, `ExerciseCard` et `LadderProgress` sont dans `src/components/candidates/`, chacun avec sa spec en 13 sections.
- **Validation.** `npm run validate:ds` soumet tous les écrans à `dsaireadable_validate_code` et `dsaireadable_validate_screen` via le serveur MCP v0.2.0 : 0 erreur. ESLint utilise `@dsaireadable/eslint-plugin`.
