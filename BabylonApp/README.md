# BabylonApp - Structure de base

Application React Native avec structure préparée pour l'intégration de BabylonJS.

## Prérequis

- Node.js 16+
- React Native 0.79+
- Android Studio pour le développement Android
- Xcode 14+ pour le développement iOS

## Installation

1. Cloner le projet
```bash
git clone [url-du-projet]
cd BabylonApp
```

2. Installer les dépendances
```bash
npm install
```

3. Installation pour iOS
```bash
cd ios
pod install
cd ..
```

## Exécution

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## Caractéristiques actuelles

- Structure de base React Native
- Gestion des permissions de caméra
- Interface utilisateur pour la demande de permissions
- Écrans de chargement et d'erreur

## À propos de BabylonJS

Cette application a été conçue comme une base pour l'intégration de BabylonJS. Cependant, en raison de défis d'intégration avec les versions récentes de React Native, nous fournissons ici une structure préparée sans le rendu 3D actif.

### Problèmes rencontrés

- Le module BabylonModule n'est pas correctement exposé par le package @babylonjs/react-native
- Incompatibilité entre les versions récentes de React Native et BabylonJS
- Défis d'initialisation native sur iOS et Android

### Solutions futures

Pour une intégration complète de BabylonJS avec React Native, considérez :

1. Utiliser une version spécifique de React Native (0.68-0.70) compatible avec BabylonJS
2. Utiliser une WebView React Native pour charger BabylonJS en HTML/JS
3. Suivre les mises à jour du package @babylonjs/react-native pour une meilleure compatibilité future

## Structure du projet

```
BabylonApp/
  ├── android/                    # Configuration Android
  ├── ios/                        # Configuration iOS
  ├── src/
  │   └── utils/
  │       └── permissions.ts      # Utilitaires de gestion des permissions
  ├── App.tsx                     # Composant principal 
  └── index.js                    # Point d'entrée de l'application
```

## Notes importantes

- Cette application constitue une base structurelle prête à recevoir BabylonJS
- Les permissions de caméra sont configurées et fonctionnelles
- Pour une intégration complète de BabylonJS, des ajustements supplémentaires sont nécessaires

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
