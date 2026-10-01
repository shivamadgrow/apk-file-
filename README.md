# Paisa in Minutes — Android APK & Source

Official Android APK release and application build files for **Paisa in Minutes**.

---

## 📱 Download Android APK

You can download the latest Android `.apk` directly from this repository:

- 📥 **[Download app-debug.apk (v1.0.0)](./app-debug.apk)** *(~5.48 MB)*

### How to Install on Android:
1. Download **`app-debug.apk`** to your phone (or download on PC and send via USB/WhatsApp/Drive).
2. Tap the downloaded file in your Android **Files** or **Downloads** app.
3. If prompted, toggle **"Allow installation from unknown sources"**.
4. Tap **Install** and open **Paisa in Minutes**!

---

## 🛠️ Project Overview

- **App ID**: `com.paisainminutes.app`
- **Framework**: React 18 + Vite + Tailwind CSS
- **Mobile Engine**: Capacitor 6 (Android)
- **Min Android SDK**: API 22 (Android 5.1+)
- **Target Android SDK**: API 34+ (Android 14)

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
