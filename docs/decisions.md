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

## Démo, onboarding refait, thème (5 octobre 2026)

Anthony a demandé une démo de l'outil, la possibilité de refaire l'onboarding, un choix de thème et un réglage des séances par semaine. Les choix ci-dessous sont faits pour ces quatre demandes ; le dernier est **à valider**.

- **Démo.** `src/demo/` joue trois semaines avec le vrai moteur : le planificateur fait chaque plan, chaque bilan passe par les règles de progression, chaque revue applique ses décisions et planifie la suite. Les données sont donc aussi cohérentes que celles de l'app. Elles se calculent à partir de la date du jour, ce qu'un fichier JSON fixe ne permettrait pas.
- **Les trois semaines.** Ce sont celles qui se terminent par la dernière dont la revue est due : la semaine passée, ou la semaine en cours le dimanche. Les deux premières revues sont faites (résumé du coach, conversation, plan suivant). La dernière reste à faire, avec deux paliers suivants à décider, pour la montrer en direct. Le déplacement à Paris, une séance reportée, une séance abandonnée et un bilan « trop dur » y sont. Les semaines vont de 80 à 100 % de régularité.
- **Uniquement des exercices animés.** Le profil de démo porte `demo: true` et le planificateur ne retient alors que les exercices qui ont une animation (`isAvailableWithAnimation`), aussi pour les semaines planifiées après coup. Trois écarts : le gainage isométrique n'a aucune animation (ses trois paliers viennent de `hd-exercises.json`), donc il n'apparaît dans aucune séance ; la liste des paliers de l'écran Progression montre toujours tous les paliers de chaque échelle ; le circuit en chambre des séances nomades est fait de blocs de texte du séquenceur.
- **Personnage fictif.** Profil, échelles de départ (traction pronation, pompe déclinée, handstand libre…) et deux propositions du coach (une acceptée, une en attente) ne sont pas ceux d'Anthony. Chaque ligne du récit est dans `src/demo/script.ts`.
- **Charger et quitter la démo.** Charger remplace les données, avec confirmation. Sur l'onboarding vide, un bouton « Essayer avec des données de démo » la charge sans confirmation, puisqu'il n'y a rien à perdre. « Supprimer la démo » n'apparaît que sur des données de démo : il ne peut jamais effacer les vraies. Un badge « Démo » reste dans la sidebar.
- **Refaire l'onboarding.** L'historique reste (semaines, bilans, cardio, revues, propositions) et la date de création du profil aussi. Les réponses actuelles sont pré-cochées, rappelées dans une carte à chaque étape, et chaque échelle indique son palier et ses cibles actuels. Seules les échelles pour lesquelles tu notes une valeur sont replacées : une échelle laissée vide garde son palier, ses cibles et ses séries. Une compétence déjà ouverte reste ouverte. L'elliptique garde sa progression, dans la plage de résistance redonnée. Le reste de la semaine est replanifié à partir d'aujourd'hui ; ce qui est fait reste.
- **Thème.** Système suit la valeur du visualiseur claude.ai, puis la préférence du système, comme avant. Clair et Sombre l'emportent sur les deux. Le choix est dans `localStorage`, car c'est un réglage de l'appareil et non une donnée à exporter ; si le navigateur le bloque, il dure le temps de la visite.
- **Séances par semaine, de 0 à 7, à valider.** Les deux groupes de boutons radio proposent 0 à 7, au profil et à l'onboarding. Le planificateur ne place jamais deux séances de callisthénie à la suite (plan type, ci-dessus), ce qui plafonne le plan à 3 séances par semaine : 4 était déjà ramené à 3. Une note sous la question le dit. Lever ce plafond change une règle du plan type : à décider par Anthony.
- **Synthèse vocale retirée.** Le séquenceur ne parle plus (Web Speech). Il garde le bip, le libellé du bloc à l'écran et le maintien de l'écran allumé. Le bouton de son coupe désormais le seul bip.
