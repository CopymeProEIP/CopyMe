# CopyMe - Fitness Mobile Application

CopyMe is a fitness mobile application developed with React Native that allows users to track their exercises, analyze their performance, and manage their training profile.

## 🛠️ Prerequisites

- Node.js >= 18
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

## 🚀 Getting Started

### Start Metro Bundler
```bash
npm start
# or
yarn start
# or
pnpm start
```

### Run on iOS
```bash
npm run ios
# or
yarn ios
# or
pnpm ios
```

### Run on Android
```bash
npm run android
# or
yarn android
# or
pnpm android
```

## 🧪 Testing

```bash
npm test
# or
yarn test
# or
pnpm test
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file at the root of the project to configure necessary environment variables.

### Metro Configuration
The `metro.config.js` file is configured to support path aliases and assets.

## 🐛 Troubleshooting

### iOS Issues
- Verify CocoaPods is installed
- Run `bundle exec pod install` in the `ios/` folder
- Clean build: `cd ios && xcodebuild clean`

### Android Issues
- Verify Android SDK is configured
- Clean build: `cd android && ./gradlew clean`

### General Issues
- Remove `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Reset Metro cache: `npm start -- --reset-cache`

## 📄 License

This project is private and developed for Epitech.

## 👥 Team

Developed as part of the CopyMe project at Epitech.

---

For more information, check out the React Native documentation: [https://reactnative.dev](https://reactnative.dev)
