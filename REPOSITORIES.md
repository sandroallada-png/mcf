# Dépôts GitHub MyCookFlex

Ce document répertorie les liens vers les différents dépôts du projet.

## 🌐 Application Web (PWA & Backend)
**Dépôt principal :** 
[https://github.com/sandroallada-png/mcf](https://github.com/sandroallada-png/mcf)

*Contient le code Next.js, les fonctions AI, le dashboard admin et la gestion des utilisateurs.*

## 📱 Applications Natives

### Android (Capacitor)
**Dépôt de build Android :**
[https://github.com/sandroallada-png/native](https://github.com/sandroallada-png/native)

### iOS (Capacitor)
**Dépôt de build iOS :**
[https://github.com/sandroallada-png/mcf-ios](https://github.com/sandroallada-png/mcf-ios)

*Chaque dépôt contient le code spécifique à sa plateforme, les ressources visuelles (icônes, splash screen) et la configuration IDE (Android Studio / Xcode).*

---
> [!TIP]
> Pour générer l'APK sur un nouveau poste :
> 1. Clonez le dépôt `native`.
> 2. Ouvrez le dossier dans Android Studio.
> 3. Pour mettre à jour le code web à l'intérieur, utilisez `npx cap copy android` depuis le projet principal après un build.
