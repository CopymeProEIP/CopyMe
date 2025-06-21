#!/bin/bash

echo "Installing JavaScript dependencies..."
if [ -f "pnpm-lock.yaml" ]; then
    echo "Using pnpm..."
    pnpm install
else
    echo "Using npm..."
    npm install
fi

echo "Installing iOS dependencies (CocoaPods)..."
cd ios
pod install
cd ..

echo "Cleaning Metro cache..."
npx react-native start --reset-cache &
METRO_PID=$!

## xcodebuild clean -workspace copymeapp.xcworkspace -scheme copymeapp
sleep 3
kill $METRO_PID 2>/dev/null

echo "Project copied successfully!"
echo "To run the project:"
echo "   - iOS: cd $DESTINATION && npx react-native run-ios"
echo "   - Android: cd $DESTINATION && npx react-native run-android"
echo "   - Metro: cd $DESTINATION && npx react-native start"
