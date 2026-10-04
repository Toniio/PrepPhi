# Publier PrepPhi depuis claude.ai

Le build est prêt : `npm run build` produit `dist/index.html`, un seul fichier de 8,8 Mo environ, sans aucune ressource externe. Les 280 animations et les polices y sont intégrées, et le script échoue au-delà de 15 Mo. La publication se fait depuis une conversation claude.ai où Claude clone ce dépôt (CLAUDE.md, « Exécution dans claude.ai »).

## 1. Relever les formats du connecteur Google Agenda

À faire une fois, avant la première publication : CLAUDE.md interdit de deviner ces formats.

1. Dans claude.ai, active le connecteur Google Agenda pour la conversation.
2. Demande à Claude de lister les outils du connecteur et de lire les schémas d’entrée de deux d’entre eux : celui qui liste les événements d’une période et celui qui crée un événement.
3. Fais-lui appeler l’outil de lecture sur une semaine connue, par exemple une semaine avec un déplacement à Paris, pour voir la forme réelle du résultat. Ne lance jamais une écriture pour découvrir son format : le schéma d’entrée suffit pour la création.
4. Remplis les deux liaisons `list` et `create` de `GOOGLE_CALENDAR`, dans `src/runtime/claude/calendar.ts` : nom de l’outil, fonction qui construit l’entrée, et fonction qui lit les événements du résultat (titre, début, fin, journée entière).
5. Lance `npm test`, puis commite.

Tant que ces liaisons sont vides, la page publiée fonctionne sans agenda : « Ajouter à mon agenda » explique que l’agenda n’est pas relié, et la détection des déplacements se fait au moyen du bouton « Je suis en déplacement ».

## 2. Construire

```bash
npm ci
npm test
npm run build
```

## 3. Publier

Publie `dist/index.html` comme artifact, avec ces capacités :

```json
{
  "sample": {},
  "db": {},
  "user": {},
  "downloads": true,
  "mcp": {
    "servers": [
      { "server": "Google Calendar", "tools": ["<outil de lecture>", "<outil de création>"] }
    ]
  }
}
```

- `sample` sert au coach : `complex` pour le plan de la semaine, `default` pour la conversation.
- `db` et `user` stockent les données sous `data/users/<ton id>/`, une zone privée. Les règles par défaut suffisent : tu es le propriétaire.
- `downloads` sert à l’export JSON.
- `mcp` ne doit nommer que les deux outils relevés à l’étape 1. Laisse-le de côté si les liaisons sont encore vides.

## 4. Vérifier après la publication

- Ouvre la page et fais l’onboarding. Dans la conversation, une lecture `ArtifactData` de la collection `data/users/<id>` doit montrer les documents `profile`, `ladder-state`, `elliptical`, `proposals` et `week-…`.
- Lance une séance et marque une série faite. Vérifie que l’écran reste allumé pendant le minuteur (Wake Lock, point ouvert de CLAUDE.md). S’il s’éteint, le minuteur continue quand même.
- Fais une revue avec « Préparer la semaine prochaine » : la première demande au coach affiche une fenêtre de consentement de claude.ai.
- Exporte tes données, puis réimporte-les.

## 5. Mettre à jour le doc validé

Le [doc validé](https://claude.ai/code/artifact/40d11110-3e5e-4dfb-853f-543baee839c6) est un document Claude Docs. Il ne se modifie qu’avec le connecteur Claude Docs, absent de la session Claude Code qui a construit l’app. Dans claude.ai, demande à Claude d’y reporter les changements validés le 4 octobre 2026 :

- Jambes, chaîne avant : le palier 4 devient `ds:1476` (squat bulgare, avec animation) et le palier 5 devient `hd:assisted-pistol-squat` (pistol squat assisté, une main au chambranle).
- Muscle-up : le palier 3 devient `hd:straight-bar-dip` (dips à la barre droite).
- Les fiches hors dataset passent de 18 à 19, et le catalogue compte 280 exercices.
