# Guide de rédaction de PrepPhi

Ce guide fixe la façon d'écrire tous les textes de PrepPhi : interface, fiches d'exercice, messages, noms accessibles et réponses du coach. Il reprend les règles de la fondation *Voice and tone* du design system DSAIReadable (v0.1.3) et les adapte au français, au tutoiement et au ton du coach décidé lors du cadrage.

Sources : `specs/foundations/voice-and-tone.md` et `content.md` du DS (servis par l'outil MCP `dsaireadable_get_ux_writing_rules`), `data/rules.json` (`coach.tone`), `CLAUDE.md`.

---

## Voix

PrepPhi parle comme un coach qui connaît ton programme : factuel, sobre, direct. La voix ne change jamais. Le ton s'adapte à la situation.

| Principe | Ce que ça veut dire | Écrire | Éviter |
| --- | --- | --- | --- |
| **Clair d'abord** | Tu comprends ce qui s'est passé et ce que tu fais ensuite | `3 séries de 8 à 12 répétitions.` | `Fais de ton mieux !` |
| **Factuel** | Des chiffres et des faits, pas d'adjectifs | `Tu as tenu 8 répétitions sur chaque série.` | `Super séance, bravo !` |
| **Sobre** | Pas d'emoji, pas de blague, pas de point d'exclamation | `Palier suivant : traction pronation.` | `Let's go, on passe au niveau supérieur 🔥` |
| **Tutoiement** | Une seule personne lit l'app : Anthony | `Note ton ressenti.` | `Notez votre ressenti.` |
| **Sans reproche** | On décrit le problème et la solution, jamais la faute | `La séance de mardi n'a pas eu lieu. Elle passe à jeudi.` | `Tu as raté ta séance.` |
| **Sans diagnostic** | Le coach ne nomme pas de blessure, il oriente | `Si la douleur revient, consulte un médecin ou un kiné.` | `C'est sûrement une tendinite.` |

**Écart avec le DS.** La voix du DS est « chaleureuse et encourageante » et célèbre brièvement les réussites. PrepPhi garde le « clair d'abord » et le « sans reproche », mais ne félicite que lorsqu'un palier est franchi (`rules.json` : *congratulates only when a step is passed*). Une séance réussie se constate, elle ne se fête pas.

---

## Ton par situation

| Situation | Ton | Écrire | Éviter |
| --- | --- | --- | --- |
| Erreur | Calme, utile : ce qui s'est passé, puis comment corriger | `Le fichier ne contient pas de colonne « Activity Type ». Exporte le CSV « Activités » depuis Garmin Connect.` | `Erreur d'import !` |
| Confirmation destructive | Sérieux, explicite, le bouton répète le verbe | `Supprimer toutes tes données ? Tu ne pourras pas les récupérer.` · `Supprimer les données` | `Êtes-vous sûr ?` · `Oui` |
| Succès | Bref, factuel | `Bilan enregistré.` | `Génial, c'est enregistré !` |
| Palier franchi | La seule félicitation permise, une phrase | `Palier franchi : tu passes aux tractions pronation.` | `Incroyable, tu es une machine !` |
| État vide | Indique le point de départ | `Aucune séance cette semaine. Prépare ta semaine à la revue de dimanche.` | `Rien ici.` |
| Onboarding | Une étape à la fois, durée annoncée | `Réponds à 12 questions. Compte 5 minutes.` | `Veuillez remplir tous les champs obligatoires.` |
| Chargement | Factuel | `Le coach prépare ta semaine…` | `Veuillez patienter…` |
| Douleur | Neutre, protecteur | `Progression gelée pour les tractions. Arrête l'exercice si la douleur est vive.` | `Aïe ! Repose-toi bien.` |
| Séance ratée | Neutre, sans culpabilité | `Séance reportée à jeudi.` | `Dommage, tu n'as pas fait ta séance.` |
| Semaine allégée | Explique le signal, puis le contenu | `3 exercices notés trop durs cette semaine. La semaine prochaine : 2 séries au lieu de 3.` | `Tu as l'air fatigué, on lève le pied.` |
| Nom accessible (sans libellé visible) | Neutre, nomme l'action | `Démarrer le minuteur de repos` | `Minuteur` |

---

## Grammaire et typographie

- **Majuscule seulement au premier mot** et aux noms propres : libellés, boutons, titres, menus, noms accessibles. `Revue de la semaine`, pas `Revue De La Semaine`.
- **Les boutons commencent par un verbe à l'infinitif** qui nomme le résultat : `Commencer la séance`, `Enregistrer le bilan`, `Ajouter à mon agenda`. Le bouton d'une confirmation reprend le verbe de la question, jamais `Oui` ni `OK`.
- **Le texte courant s'adresse à toi à l'impératif** : `Pose les mains au sol.`, `Note ton ressenti.`
- **Un message d'erreur dit ce qui s'est passé, puis comment corriger**, dans cet ordre, en deux phrases au plus.
- **Le coach dit « je » quand il propose**, l'app dit « on » ou se tait. `Je te propose de rester au palier 3.`
- **Ponctuation** : pas de point après un libellé, un bouton, un titre ou un nom accessible ; un point après une phrase complète. Espace insécable avant `:`, espace fine insécable avant `;`, `?` et `!`. Guillemets français `« »` avec espaces insécables. `…` en un seul caractère.
- **Point d'exclamation** : jamais dans une erreur, au plus un dans le message de palier franchi.
- **Nombres en chiffres** : `3 séries`, `8 répétitions`, `2 minutes`. Fourchettes avec « à » dans une phrase (`8 à 12 répétitions`), avec un tiret demi-cadratin dans un tableau ou une étiquette (`8–12`).
- **Séries** : `3 × 8–12` (signe ×, pas la lettre x). Par côté : `3 × 8–12 par côté`.
- **Unités**, avec une espace insécable : `30 s`, `2 min`, `45 min`, `136 bpm`, `niveau 6`. Pas de `sec`, `mn` ni `reps` dans l'interface.
- **Dates et heures** : `lundi 6 octobre`, `18 h 30`. La semaine va du lundi au dimanche.

---

## Longueur

| Élément | Limite |
| --- | --- |
| Libellé, onglet, bouton | 3 mots, 4 au plus |
| Titre d'écran ou de carte | 5 mots |
| Message (toast, erreur, état vide) | 2 phrases courtes |
| Consigne d'exercice | 4 étapes, environ 15 mots chacune |
| Point clé, erreur fréquente | 1 phrase |
| Réponse du coach en conversation | 3 phrases, puis une question si besoin |
| Synthèse de revue | 5 phrases au plus, puis la liste des propositions |

Une phrase porte une idée. Si une phrase contient deux « et », coupe-la.

---

## Verbes d'action

Un verbe par action, toujours le même dans toute l'app.

| Action | Bouton | Éviter |
| --- | --- | --- |
| Lancer la séance du jour | `Commencer la séance` | `Go`, `Démarrer l'entraînement` |
| Passer au bilan | `Terminer la séance` | `Fini` |
| Valider le bilan | `Enregistrer le bilan` | `Valider`, `OK` |
| Minuteur | `Démarrer`, `Mettre en pause`, `Reprendre`, `Passer le repos` | `Play`, `Skip` |
| Séquenceur | `Lancer le circuit` | `Start` |
| Signaler une douleur | `Signaler une douleur` | `J'ai mal` |
| Proposition du coach | `Accepter`, `Refuser` | `Oui`, `Non` |
| Reporter une décision | `Pas maintenant` | `Non merci` |
| Agenda | `Ajouter à mon agenda` | `Synchroniser` |
| Import Garmin | `Importer le CSV` | `Uploader` |
| Sauvegarde | `Exporter mes données`, `Importer une sauvegarde` | `Backup` |
| Suppression définitive | `Supprimer` | `Retirer` (réservé à ce qui se récupère) |

---

## Lexique

| Utiliser | Éviter | Pourquoi |
| --- | --- | --- |
| séance | entraînement, workout, session | Un seul mot pour l'unité du plan |
| série, répétition | set, rep, reps | Français courant en salle |
| échelle | progression, parcours | Le nom de la suite de paliers d'un mouvement |
| palier | niveau, étape | `étape` désigne les étapes d'une consigne |
| fourchette | plage, range | La cible basse et haute de la double progression |
| bilan | check-in, feedback | Le mot français pour le retour après séance |
| ressenti : `Trop facile`, `Juste bien`, `Trop dur` | facile, moyen, difficile | Les trois états de `rules.json` (`too-easy`, `right`, `too-hard`) |
| revue de la semaine | review, débrief | Le rendez-vous du dimanche soir |
| semaine allégée | deload, décharge | Compréhensible sans jargon |
| douleur | blessure, lésion | Le coach ne diagnostique pas |
| en déplacement, version nomade | en voyage, mode hôtel | `Je suis en déplacement` est le libellé figé de l'écran Aujourd'hui |
| séance au parc | séance extérieure | La barre de parc porte l'échelle du muscle-up |
| effort perçu | RPE | `RPE` seulement entre parenthèses, la première fois |
| fréquence cardiaque, FC | BPM, pouls | `bpm` reste l'unité |
| choisir, sélectionner | cliquer, taper, appuyer | Marche à la souris, au doigt et au clavier |
| coach | IA, assistant, bot | Le rôle, pas la technique |
| `…` | `...` | Un seul caractère, lu une fois par les lecteurs d'écran |
| (rien) | s'il te plaît, oups, désolé | Une consigne n'est pas une faveur ; une erreur n'est pas drôle |

---

## Libellés par défaut des composants du DS

Les composants du DS ont des libellés anglais dans `src/lib/ui-strings.ts`. On ne modifie jamais ce fichier ni les composants : on passe la traduction par la prop prévue à chaque appel.

| Composant | Clé | Défaut (EN) | PrepPhi (FR) |
| --- | --- | --- | --- |
| Questionnaire | `progress` | Questionnaire progress | Progression du questionnaire |
| Questionnaire | `previous` | Previous | Précédent |
| Questionnaire | `skip` | Skip | Passer |
| Questionnaire | `next` | Next | Suivant |
| Questionnaire | `submit` | Submit | Terminer |
| MessageScroller | `viewport` | Messages | Conversation avec le coach |
| MessageScroller | `scrollToEnd` | Scroll to end | Aller au dernier message |
| MessageScroller | `scrollToStart` | Scroll to start | Aller au premier message |
| Dialog, Sheet | `close` | Close | Fermer |
| Spinner | `label` | Loading | Chargement |
| Carousel | `previous` · `next` | Previous slide · Next slide | Diapositive précédente · Diapositive suivante |
| Pagination | `previousText` · `nextText` | Previous · Next | Précédent · Suivant |
| Pagination | `previousLabel` · `nextLabel` | Go to previous page · Go to next page | Page précédente · Page suivante |
| Combobox | `trigger` · `clear` | Open list · Clear selection | Ouvrir la liste · Effacer la sélection |
| Illustration | `alt` | Illustration | Décrire l'image, ou `alt=""` si elle est décorative |

Ces traductions vivent dans un seul module de l'app, `src/i18n/fr.ts`, importé par les écrans.

---

## Le coach

Le coach écrit dans la même voix que l'interface. Son prompt système reprend ce guide en résumé.

- **Structure d'une revue** : ce qui s'est passé (chiffres de la semaine), ce que les règles proposent, ta décision à prendre. Chaque proposition est une ligne qui commence par un verbe : `Passer au palier 4 en tractions.`
- **Il explique par les règles**, jamais par l'intuition : `Fourchette haute tenue 2 séances de suite : je propose le palier suivant.`
- **Il ne modifie rien seul** : toute modification d'échelle ou de seuil est une proposition que tu acceptes ou refuses.
- **Il ne félicite qu'au franchissement d'un palier**, en une phrase.
- **Il ne diagnostique pas** : après deux semaines de douleur sur la même famille, il recommande de consulter un médecin ou un kiné.
- **Il pose au plus une question à la fois.**

Exemple de synthèse de revue :

> 4 séances sur 4 cette semaine, dont 1 en déplacement. Tractions : 3 × 8 tenu deux séances de suite, fourchette haute atteinte. Squat bulgare noté trop dur mercredi et vendredi. Je te propose de passer au palier suivant en tractions et de garder le squat bulgare au même palier.

---

## Vérification avant de livrer un texte

1. Majuscule au premier mot seulement, pas de point final sur un libellé.
2. Les boutons commencent par un verbe à l'infinitif.
3. Les erreurs disent ce qui s'est passé, puis comment corriger.
4. Tutoiement partout, aucun « vous ».
5. Aucun mot de la colonne « Éviter » du lexique.
6. Aucun point d'exclamation, sauf au franchissement d'un palier.
7. Nombres en chiffres, unités avec espace insécable, `…` en un caractère.
8. Les longueurs du tableau sont respectées.
