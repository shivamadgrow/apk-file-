# Paisa in Minutes — Step-by-Step Android APK Conversion Guide

This guide explains how to convert the **Paisa in Minutes** app into an installable Android **`.apk`** file.

---

## 🚀 Method 1: Using PWABuilder (Fastest — 1 Minute Free APK Download)

This method requires **no Android Studio** or coding setup.

1. Make sure your dev server or hosted URL is live (e.g., using `ngrok` or any hosting like Vercel / Netlify / local tunnel).
2. Open **[https://www.pwabuilder.com/](https://www.pwabuilder.com/)** in your browser.
3. Paste your live URL (or upload the `dist` folder & `manifest.json`).
4. Click **"Package for Android"**.
5. Click **"Download APK"**.
6. Transfer the `.apk` file to your mobile phone and tap **Install**!

---

## 🛠️ Method 2: Using Android Studio (Official & Offline APK)

Since the native Android project is already generated in `c:\Users\This pc\Desktop\Paisainminute Main app\android`:

1. Download & open **[Android Studio](https://developer.android.com/studio)**.
2. Click **Open an existing project**.
3. Select the folder: `c:\Users\This pc\Desktop\Paisainminute Main app\android`
4. Wait for Gradle sync to complete.
5. In top menu: Go to **Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)**.
6. Android Studio will generate your APK file at:
   `android/app/build/outputs/apk/debug/app-debug.apk`
7. Copy `app-debug.apk` to your phone via USB or WhatsApp, open it, and tap **Install**!

---

## ⚡ Method 3: Direct Web-to-APK Converters (Web2APK)

1. Open **[Web2APK Converter](https://websitetoapk.com/)** or **[AppGeyser](https://www.appsgeyser.com/)**.
2. Enter your Local Network IP URL: `http://192.168.1.17:3000/` (or your PC's current Wi-Fi IP address)
3. Enter App Name: `Paisa in Minutes`
4. Click **Create APK** and download your `.apk` file!
