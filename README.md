# My Cook Flex - Application de Planification de Repas

Bienvenue sur le dépôt de **My Cook Flex**, une application web moderne conçue pour simplifier la planification des repas pour les individus et les couples. Ce projet est développé avec Next.js, React, Tailwind CSS, et intègre une IA nutritionnelle avec Genkit.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (avec App Router)
- **UI**: [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **IA & Backend**: [Genkit](https://firebase.google.com/docs/genkit) (via OpenRouter)
- **Base de données**: [Firestore](https://firebase.google.com/docs/firestore)
- **Authentification**: [Firebase Auth](https://firebase.google.com/docs/auth)

## Fonctionnalités Clés

- **Planification de Repas Intelligente**: Suggestions de repas basées sur les objectifs, les préférences et le contenu du frigo de l'utilisateur.
- **Assistant Nutritionnel IA**: Un chatbot pour répondre à toutes les questions sur la nutrition, générer des recettes, et créer des plans de repas.
- **Gamification**: Un système de niveaux et de récompenses pour motiver les utilisateurs à atteindre leurs objectifs.
- **Gestion de Frigo**: Suivi des ingrédients pour éviter le gaspillage alimentaire.
- **Calendrier Partagé**: Fonctionnalité pour les couples permettant de planifier les repas ensemble.
- **Interface d'Administration**: Panneaux pour gérer les utilisateurs, le contenu de l'application (plats, promotions) et modérer les contributions.

## Structure du Projet

```
/
├── src/
│   ├── app/                # Routes de l'application (Next.js App Router)
│   ├── components/         # Composants React réutilisables (UI, Layout, etc.)
│   ├── ai/                 # Logique de l'IA avec Genkit (flows, prompts)
│   ├── firebase/           # Configuration et hooks pour Firebase
│   ├── lib/                # Fonctions utilitaires, types, et données statiques
│   ├── contexts/           # Contexte React (Thème, Chargement)
│   └── docs/               # Documentation (schéma de données, manuel utilisateur)
├── public/               # Fichiers statiques (images, sitemap, robots.txt)
└── ...                   # Fichiers de configuration (tailwind, next, etc.)
```

## Démarrage

Pour lancer le projet en local, suivez ces étapes :

1.  **Installation des dépendances**:
    ```bash
    npm install
    ```

2.  **Configuration de l'environnement**:
    Créez un fichier `.env.local` à la racine et ajoutez vos clés d'API, notamment pour OpenRouter :
    ```
    OPENROUTER_API_KEY=votre_clé_ici
    ```

3.  **Lancement du serveur de développement**:
    ```bash
    npm run dev
    ```
    L'application sera accessible sur `http://localhost:9002`.

## Contribuer

Ce projet est actuellement en développement actif. Les contributions sont les bienvenues. Veuillez suivre les bonnes pratiques de codage et documenter votre code.
