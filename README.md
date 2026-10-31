# Paisa in Minutes — Android APK & Source

Official Android APK release and application build files for **Paisa in Minutes**.

---

## 📱 Android APK / App Bundle

No prebuilt binary is committed to this repository (signed release artifacts
shouldn't live in git). Build one locally:

```bash
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleRelease   # produces app/build/outputs/apk/release/app-release.apk
./gradlew bundleRelease     # produces app/build/outputs/bundle/release/app-release.aab
```

Release builds require `android/keystore.properties` — see `android/RELEASE_SIGNING.md`.

---

## 🛠️ Project Overview

- **App ID**: `com.paisainminutes.app`
- **Framework**: React 18 + Vite + Tailwind CSS
- **Mobile Engine**: Capacitor 7 (Android)
- **Min Android SDK**: API 24 (Android 7.0+)
- **Target Android SDK**: API 36

---

## 🚀 Running / Building Locally

```bash
# Install dependencies
npm install

# Run web dev server
npm run dev

# Build web distribution
npm run build

# Sync web assets to native Android project
npx cap sync android
```
