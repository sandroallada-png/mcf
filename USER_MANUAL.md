# 📖 Manuel d'Utilisation — My Cook Flex

**Version :** 1.0 | **Mis à jour :** Mars 2026  
*Ce document décrit toutes les fonctionnalités de l'application du point de vue de l'utilisateur final.*

---

## 🗂️ Table des Matières

1. [Premiers Pas — Inscription & Connexion](#1-premiers-pas)
2. [Tableau de Bord — Votre Centre Névralgique](#2-tableau-de-bord)
3. [My Flex Coach — L'Assistant IA](#3-my-flex-coach--lassistant-ia)
4. [Mon Frigo — Gestion des Ingrédients](#4-mon-frigo)
5. [Ma Box Nutritionnelle — Programme sur Mesure](#5-ma-box-nutritionnelle)
6. [Calendrier — Planification des Repas](#6-calendrier)
7. [Cuisine — Espace Inspiration](#7-cuisine)
8. [Atelier du Chef — Bibliothèque Exclusive](#8-atelier-du-chef)
9. [Mon Niveau & Progression — Gamification](#9-mon-niveau--progression)
10. [Paramètres — Personnalisation Complète](#10-paramètres)
11. [Utilisation Hors Ligne (Mode Offline)](#11-utilisation-hors-ligne)
12. [Questions Fréquentes (FAQ)](#12-faq)

---

## 1. Premiers Pas

### 1.1 Inscription

1. Rendez-vous sur l'application et cliquez sur **"S'inscrire"**.
2. Renseignez votre **email** et un **mot de passe** (ou connectez-vous rapidement via **Google**).
3. Après l'inscription, vous serez guidé à travers 3 étapes :
   - **Personnalisation** : Choisissez vos thèmes de couleur et préférences visuelles.
   - **Préférences Alimentaires** : Indiquez vos allergies, objectifs (perte de poids, prise de masse, etc.).
   - **Abonnement** : Choisissez un plan (Gratuit, Éco, Premium).

> **Conseil :** Remplissez soigneusement vos préférences dès le départ — l'IA s'en servira pour personnaliser toutes ses suggestions.

### 1.2 Connexion

- **Email/Mot de passe :** Saisissez vos identifiants sur la page `/login`.
- **Google :** Cliquez sur le bouton "Continuer avec Google" pour une connexion rapide.
- **Mot de passe oublié ?** Cliquez sur le lien "Mot de passe oublié" pour recevoir un email de récupération.

---

## 2. Tableau de Bord

> **Route :** `/dashboard` — La page principale après connexion.

Le tableau de bord est votre vue d'ensemble quotidienne. Il est organisé en plusieurs zones :

### 2.1 Journal des Repas du Jour
- Liste tous les repas que vous avez enregistrés pour aujourd'hui.
- Les repas sont classés par **type** : Petit-déjeuner, Déjeuner, Dîner, Collation.
- Chaque repas affiche son **nom** et son **apport calorique**.

### 2.2 Ajouter un Repas

1. Cliquez sur le bouton **"+ Ajouter un repas"**.
2. Un formulaire modal s'ouvre. Vous pouvez :
   - **Saisir manuellement** : nom, calories, type de repas.
   - **Utiliser une suggestion IA** : cliquez sur ✨ pour qu'une idée de repas adaptée à votre profil soit générée automatiquement.
3. Cliquez sur "Enregistrer" pour ajouter le repas au journal.

### 2.3 Suggestions d'Alternatives Santé
- Sur chaque repas enregistré, cliquez sur l'icône **Étincelles** (✨) pour demander à l'IA de proposer des alternatives plus saines ou plus adaptées à vos objectifs.

### 2.4 "Qui Cuisine Aujourd'hui ?"
- Une carte contextuelle qui affiche un **message et une image** qui changent selon l'heure de la journée (matin, midi, soir). Elle permet d'attribuer la cuisine à un membre du foyer.

### 2.5 Panneau Latéral (Sidebar)
- **Niveau & XP :** Votre progression gamifiée actuelle.
- **Vos Objectifs :** Une zone de texte libre pour noter vos objectifs (ex : "Perdre 5 kg"). Ces objectifs sont partagés avec l'IA pour des conseils personnalisés.
- **Conseils de l'outil :** Cliquez sur "Générer mes conseils" pour obtenir des recommandations nutritionnelles personnalisées basées sur vos repas de la journée. La réponse est générée par l'IA.

---

## 3. My Flex Coach — L'Assistant IA

> **Route :** `/my-flex-ai`

C'est le cœur intelligent de l'application. Votre nutritionniste personnel disponible 24h/24.

### 3.1 Interface de Chat

- La zone de **Conversation** vous permet de discuter librement avec l'IA.
- Posez des questions comme :
  - *"Que manger ce soir pour moins de 600 calories ?"*
  - *"Crée-moi un plan de repas pour la semaine."*
  - *"J'ai des lentilles et des carottes, que puis-je préparer ?"*

### 3.2 Plan de Repas Structuré
- Lorsque vous demandez un **plan de repas**, l'IA génère une réponse en format structuré.
- Un bouton **"Ajouter au Calendrier"** apparaît pour intégrer directement le plan à votre agenda.

### 3.3 Historique des Conversations
- Cliquez sur l'onglet **"Historique"** pour retrouver toutes vos conversations précédentes.
- Chaque conversation est **titrée automatiquement** par l'IA.
- Cliquez sur une conversation pour la rouvrir.

### 3.4 Feedback sur l'IA
- Chaque réponse de l'IA possède des boutons de notation 👍 / 👎.
- Utilisez-les pour signaler si une réponse était pertinente ou non. Cela aide à améliorer l'outil.

### 3.5 Personnalisation du Coach (voir aussi [Paramètres → Intelligence MyFlex](#102-intelligence-myflex))
- Pour des réponses encore plus précises, activez la **"Personnalisation de l'IA"** dans les Paramètres et renseignez vos données (allergies, ton souhaité, origine culinaire).

---

## 4. Mon Frigo

> **Route :** `/fridge`

Gérez virtuellement le contenu de votre réfrigérateur pour des suggestions de recettes ultra-pertinentes.

### 4.1 Ajouter un Ingrédient
1. Tapez le nom de l'ingrédient dans la barre de recherche.
2. Cliquez sur **"Ajouter"** pour l'enregistrer dans votre frigo virtuel.

### 4.2 Supprimer un Ingrédient
- Cliquez sur l'icône **Corbeille (🗑)** en face de l'aliment à retirer.

### 4.3 Connexion avec l'IA
- Une fois vos ingrédients renseignés, l'IA les prend automatiquement en compte dans ses suggestions.
- Vous pouvez aussi envoyer un ingrédient ou une idée depuis le frigo directement vers votre **liste de repas à cuisiner** (PendingCookings).

---

## 5. Ma Box Nutritionnelle

> **Route :** `/box`

Un programme de repas complet sur **4 semaines**, généré intelligemment d'après votre profil.

### 5.1 Comment Ça Marche ?
- À votre première visite, l'application génère automatiquement **4 Box de 7 jours** (= 28 repas chacune : petit-déj, déjeuner, goûter, dîner).
- Chaque repas est sélectionné via un **moteur de score** qui tient compte de :
  - Vos **objectifs** (perte de poids → moins de calories, prise de masse → plus de protéines).
  - Votre **origine culinaire** et votre **pays de résidence**.
  - Vos **allergies** (les plats incompatibles sont automatiquement exclus).
  - Votre **historique** de repas appréciés.
- La Box est rechargée automatiquement tous les **28 jours**.

### 5.2 Navigation dans la Box
- **Sélecteur de Semaine :** Cliquez sur `1`, `2`, `3` ou `4` pour changer de semaine.
- **Sélecteur de Jour :** Sur le panneau gauche (desktop) ou en défilant horizontalement (mobile), choisissez le jour.
- **Vue des repas :** Le panneau principal affiche les 4 repas de la journée sélectionnée.

### 5.3 Remplacer un Repas
- Sur chaque carte de repas, cliquez sur l'icône **🔀 (Rafraîchir)** pour remplacer instantanément ce repas par une autre suggestion adaptée à votre profil.

### 5.4 Personnaliser et Planifier
1. Cliquez sur **"Personnaliser"** pour ouvrir le planificateur.
2. **Choisissez la durée :** 3 jours ou 7 jours.
3. **Activez/désactivez** chaque repas individuellement (cochez/décochez).
4. **Remplacez** un repas spécifique avec le bouton 🔀.
5. Sélectionnez la **date de début** via le calendrier.
6. Cliquez sur **"Lancer le plan"** pour ajouter tous les repas sélectionnés à votre calendrier.

> **Gestion des Conflits :** Si un repas existe déjà pour ce créneau, l'app vous demande si vous souhaitez le remplacer ou le conserver.

---

## 6. Calendrier

> **Route :** `/calendar`

Planifiez et visualisez vos repas sur une vue calendrier mensuelle.

### 6.1 Visualiser les Repas Planifiés
- Cliquez sur **n'importe quel jour** pour voir les repas prévus pour cette date.
- Les repas sont affichés avec leur nom, leurs calories et leur type.

### 6.2 Suggestions IA pour les Prochains Jours
- L'application génère **3 suggestions de repas** pour les prochains jours, adaptées à vos objectifs.
- Cliquez sur **"Ajouter"** pour intégrer directement une suggestion au jour sélectionné.

### 6.3 Historique
- L'onglet **"Historique"** liste tous vos repas passés, groupés par date. Pratique pour voir vos tendances alimentaires.

---

## 7. Cuisine

> **Route :** `/cuisine`

Un espace d'inspiration et de navigation dans le catalogue de recettes.

### 7.1 Suggestion du Moment
- L'IA propose une **recette adaptée à l'heure** (matinale, légère pour le midi, festive le soir).
- Cliquez sur **"Générer une idée"** pour obtenir une nouvelle suggestion.

### 7.2 Recherche de Plats
- Utilisez la barre de **recherche** pour trouver un plat par son nom.
- Filtrez par **catégorie** (Africain, Méditerranéen, Végétarien, etc.) pour explorer par type de cuisine.

### 7.3 Détail d'un Plat
- Cliquez sur une carte de plat pour afficher :
  - La **recette complète** en format lisible.
  - Les **informations nutritionnelles** (calories, temps de cuisson).
  - L'option d'**ajouter le plat au calendrier**.

---

## 8. Atelier du Chef

> **Route :** `/atelier`

Une bibliothèque de contenu exclusif : livres de recettes PDF, guides culinaires.

### 8.1 Accéder au Contenu
- Les contenus **gratuits** sont directement accessibles après votre connexion.
- Les contenus **Premium** sont marqués d'un cadenas 🔒. Ils nécessitent un abonnement payant.

### 8.2 Lire un Livre / Guide
- Cliquez sur la couverture d'un ouvrage pour l'ouvrir dans une visionneuse intégrée.
- La progression de lecture est sauvegardée automatiquement.

---

## 9. Mon Niveau & Progression

> **Route :** `/mon-niveau`

Le système de gamification de My Cook Flex pour vous garder motivé.

### 9.1 Système de Points (XP)
- **Comment gagner de l'XP ?**
  - Enregistrer des repas au quotidien.
  - Maintenir une **série** (streak) quotidienne.
  - Atteindre des objectifs hebdomadaires.
- **500 XP** sont nécessaires pour passer au niveau suivant.

### 9.2 Niveaux & Titres
| Niveau | Titre |
| :--- | :--- |
| 1–9 | Novice des Fourneaux |
| 10–19 | Apprenti Alchimiste |
| 20–29 | Commandant de Cuisine |
| 30–39 | Maître des Saveurs |
| 40+ | Légende Culinaire |

### 9.3 Progression de Foyer (Mode Partagé)
- Si vous utilisez l'application avec un partenaire (mode foyer), l'XP est **partagée et cumulée**.
- Le niveau affiché représente la progression collective de votre foyer.

### 9.4 Conseil IA Motivationnel
- Cliquez sur **"Obtenir un conseil"** pour que l'IA génère un message motivant basé sur votre niveau actuel et vos objectifs.

---

## 10. Paramètres

> **Route :** `/settings`

Personnalisez chaque aspect de votre expérience.

### 10.1 Profil Public
- **Nom d'affichage :** Modifiez votre pseudonyme.
- **Photo de profil :** Cliquez sur l'avatar pour le modifier ou le zoomer.
- **Vérification d'email :** Si votre email n'est pas vérifié, cliquez sur "Vérifier" pour recevoir l'email de confirmation.

### 10.2 Intelligence MyFlex (Personnalisation IA)
- **Activez le switch** "Personnalisation de l'IA" pour débloquer les options avancées.
- Renseignez :
  - **Objectif principal** (ex: "Perdre 5 kg avant l'été")
  - **Ton de l'assistant** : Amical / Formel / Scientifique / Humoristique
  - **Allergies / Restrictions** : Lactose, Gluten, Noix, etc.
  - **Origine culinaire** : Française, Africaine, Italienne...
  - **Pays de résidence** : influence les suggestions de produits locaux.
  - **Préférences alimentaires** : Ce que vous aimez ou n'aimez pas.
- Cliquez sur **"Enregistrer les préférences IA"** pour valider.

### 10.3 Profil Physique & Objectifs
Ces informations permettent à l'IA de calculer vos besoins nutritionnels précis.
- **Âge, Sexe, Poids (kg), Taille (cm)**
- **Niveau d'activité** : Sédentaire → Extrêmement actif
- **Objectif Calories** : Votre objectif journalier en kcal.
- **Nombre de repas** par jour souhaité.

### 10.4 Apparence
- Choisissez votre **couleur d'accentuation** (thème couleur principal de l'interface) parmi les palettes disponibles.
- Le changement est appliqué immédiatement et sauvegardé.

### 10.5 Langue & Région
- L'application supporte actuellement le **Français** et **l'Anglais (partiel)**.
- D'autres langues (Deutsch, Español, Italiano, Português) seront disponibles prochainement.
- L'option **"Système"** détecte automatiquement la langue de votre navigateur ou téléphone.

### 10.6 Préférences d'Interface
- **Raccourci latéral mobile (Edge) :** Activez une poignée flottante sur le bord droit de l'écran pour accéder rapidement aux fonctionnalités essentielles depuis n'importe quelle page.

---

## 11. Utilisation Hors Ligne

My Cook Flex est conçue comme une **Progressive Web App (PWA)** avec des capacités offline.

### Ce qui fonctionne hors ligne :
- ✅ Consultation de vos repas et du calendrier (données en cache).
- ✅ Ajout de repas (synchronisé dès que vous retrouvez du réseau).
- ✅ Navigation dans les plats déjà chargés.

### Ce qui nécessite une connexion internetw :
- ❌ **Fonctionnalités IA** (My Flex Coach, suggestions, conseils) — nécessitent une connexion active.
- ❌ Synchronisation multi-appareils en temps réel.

### Installer l'application (PWA)
- Sur **Chrome / Edge (desktop)** : Une icône d'installation apparaît dans la barre d'adresse. Cliquez dessus pour installer l'app.
- Sur **Android** : Cliquez sur "Ajouter à l'écran d'accueil" dans le menu du navigateur.
- Sur **iPhone** : Dans Safari, cliquez sur l'icône Partager puis "Sur l'écran d'accueil".

---

## 12. FAQ

**Q : Mes données sont-elles sécurisées ?**
> Oui. Toutes vos données personnelles sont stockées dans Google Firebase, sécurisées par des règles strictes qui n'autorisent l'accès qu'à vous-même.

**Q : L'IA se souvient-elle de moi d'une conversation à l'autre ?**
> Pas directement entre les sessions. Mais si vous activez la **"Personnalisation IA"** dans les Paramètres, vos préférences (allergies, objectifs, ton) sont envoyées à chaque nouvelle requête.

**Q : Comment fonctionne le mode Foyer ?**
> Vous pouvez inviter un partenaire via le code d'invitation accessible dans les paramètres du foyer (`/foyer`). Une fois liés, vous partagez les mêmes logs de repas, le même calendrier et votre XP est mutualisée.

**Q : Je n'arrive pas à me connecter avec Google, que faire ?**
> Assurez-vous que les cookies tiers sont activés dans votre navigateur. Si le problème persiste, essayez de vous connecter via email/mot de passe ou de vider le cache du navigateur.

**Q : La Box nutritionnelle est-elle toujours la même ?**
> Non. Elle est régénérée automatiquement tous les **28 jours** avec de nouvelles sélections. De plus, plus vous interagissez avec l'app (repas likés, historique), plus les suggestions s'affinent.

**Q : Comment supprimer mon compte ?**
> La suppression de compte est disponible sur demande auprès du support. Contactez-nous via la page `/support`.

---

*Document rédigé pour l'équipe My Cook Flex — Mars 2026*
