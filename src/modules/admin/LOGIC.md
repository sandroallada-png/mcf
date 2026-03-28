# Logique du Module Admin - My Cook Flex

Ce document résume l'architecture et la logique métier du module d'administration de My Cook Flex. Ce module a été conçu pour être totalement modulaire et séparé du reste de l'application, permettant son déploiement ou son développement indépendant.

## 🏗️ Architecture du Module

Le module est situé dans `src/modules/admin` et suit une structure strictement organisée :

- `components/`: Composants UI réutilisables spécifiques à l'admin (formulaires, tableaux, importateurs).
- `layout/`: Structure globale de l'interface admin.
  - `AdminGuard.tsx`: Protège les routes en vérifiant le rôle 'admin' dans le profil utilisateur Firestore.
  - `AdminLayout.tsx`: Fournit le cadre (Sidebar, Header) et injecte les données nécessaires (objectifs, repas) pour la navigation.
- `sections/`: Composants de haut niveau encapsulant la logique métier par domaine (Utilisateurs, Repas, Promotions, etc.). Chaque page admin appelle simplement une `Section`.

## 🔐 Sécurité et Accès

L'accès est contrôlé à deux niveaux :
1. **Frontend**: Le composant `AdminGuard` redirige les non-admins vers `/dashboard`.
2. **Backend**: Les règles Firestore (`firestore.rules`) restreignent l'accès aux collections sensibles (`users`, `promotions`, `atelierBooks`, `dishes`) aux utilisateurs authentifiés possédant le flag `role: 'admin'`.

## 📦 Gestion des Données

### 🍲 Gestion des Repas (`DishesSection`)
- **Catalogue Central**: Liste tous les plats de l'application.
- **Vérification**: Les administrateurs valident les plats ajoutés manuellement ou par import.
- **Contributions**: Les plats soumis par les utilisateurs (nom, calories, recettes) peuvent être approuvés et convertis en plats officiels.
- **Repas Indisponibles**: Suivi des recherches utilisateurs infructueuses pour enrichir le catalogue.
- **Import en masse**: Supporte l'importation via CSV/JSON.

### 👥 Gestion des Utilisateurs (`UsersSection`)
- **Tableau de bord**: Vue d'ensemble avec recherche et filtres (date, statut d'abonnement).
- **Abonnements**: Distinction visuelle entre utilisateurs gratuits et premium.
- **Recrutement**: Suivi de la provenance des utilisateurs (Referral).

### 🎨 Contenu et Marketing
- **Promotions (`PromotionsSection`)**: Gestion des offres actives affichées dans l'App.
- **Carrousel (`CarouselSection`)**: Gestion des bannières de la page d'accueil (image, titre, lien).
- **Atelier du Chef (`AtelierSection`)**: Gestion de la bibliothèque exclusive (Livres PDF/Contenu). Les prix définis ici contrôlent l'accès (Gratuit vs Bloqué).
- **Publications (`PublicationsSection`)**: Système de modération pour les recettes et articles communautaires.

### 📢 Communication
- **Notifications de Masse (`NotificationsSection`)**: Envoi groupé de notifications push/in-app à tous les utilisateurs via un Batch Firestore.
- **Support (`MessagesSection`)**: Interface de réception des messages support (en cours).

## ⚡ Performance et UX

- **Non-blocking Updates**: Utilisation de fonctions utilitaires pour les mises à jour Firestore sans bloquer l'UI.
- **Real-time**: Utilisation des hooks Firebase (`useCollection`, `useDoc`) pour une synchronisation en temps réel des données admin.
- **Design System**: Harmonisé avec le reste de l'application via les composants `Shadcn/UI` et une palette de couleurs premium.

---
*Dernière mise à jour : Mars 2026*
