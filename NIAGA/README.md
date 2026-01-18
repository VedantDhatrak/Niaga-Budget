# NIAGA React Native App

This is the NIAGA mobile application built with React Native and Expo.

## Features
- **Splash Screen**: Custom introduction screen.
- **Authentication**: Registration and Login flows with validation.
- **Navigation**: Using React Navigation v6.
- **Theming**: Supports Light and Dark modes.
- **EAS Support**: Configured for Expo Application Services.

## Prerequisites
- Node.js (LTS recommended)
- Expo CLI (installed automatically via npx)
- EAS CLI (optional, for building): `npm install -g eas-cli`

## How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npx expo start
   ```

3. **Open on Device/Simulator**:
   - Press `a` to open on Android Emulator.
   - Press `i` to open on iOS Simulator (Mac only).
   - Scan the QR code with the Expo Go app on your physical device.

## How to Deploy with EAS

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure Project** (First time only):
   ```bash
   eas build:configure
   ```

4. **Build the App**:
   - For Android:
     ```bash
     eas build --platform android --profile preview
     ```
   - For iOS:
     ```bash
     eas build --platform ios --profile preview
     ```

5. **Submit to Stores**:
   ```bash
   eas submit --platform all
   ```

## Project Structure
- `App.js`: Main entry point and Navigation setup.
- `src/screens`: Individual screen components.
- `src/components`: Reusable UI components.
- `src/theme`: Color definitions.
