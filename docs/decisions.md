# Choix faits pendant la construction

Le 4 octobre 2026, Anthony a demandé d'enchaîner les tâches de `CLAUDE.md` sans le consulter, en prenant l'option recommandée à chaque question. Ce fichier liste ces choix pour qu'il les relise. Aucun ne modifie une échelle ni un seuil validé : ceux qui y touchent sont marqués **à valider**.

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
