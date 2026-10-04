# PrepPhi

Coach sportif personnel : callisthénie et elliptique, check-in après chaque séance, revue hebdomadaire avec un coach IA. Publié comme artifact claude.ai, construit avec le design system [DSAIReadable](https://github.com/Toniio/DSAIReadable).

- Consignes de développement et décisions : [`CLAUDE.md`](./CLAUDE.md)
- Échelles et règles validées : [`data/`](./data)
- Fiches des étapes hors dataset : [`docs/hors-dataset.md`](./docs/hors-dataset.md)

## Catalogue d'exercices

```bash
pip install pillow
python scripts/build-catalog.py   # clone exercises-dataset dans .cache/ si besoin
```

Données d'exercices : [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (MIT). Animations © Gym visual — https://gymvisual.com/
