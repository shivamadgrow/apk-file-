# Release signing — first-time setup

This app has never been published, so there is no existing upload key to preserve.
This document is the exact procedure to create one. **No step here has been run for
you** — generating the keystore and choosing its passwords is a security decision
only you should make, since you are the one who must securely store and back up the
result.

## How the build is wired

`android/app/build.gradle` reads signing credentials from `android/keystore.properties`,
a local file that is **not committed** (see `.gitignore`). If that file doesn't exist,
any `assembleRelease`/`bundleRelease` task fails immediately with a clear error instead
of silently producing an unsigned, unpublishable artifact. Debug builds are unaffected.

## Step 1 — Generate the upload keystore

Run this yourself, interactively, so the passwords you type are never written to a
shell history file or logged anywhere by this process:

```
keytool -genkeypair -v \
  -keystore /absolute/path/OUTSIDE/this/repo/paisainminutes-upload.jks \
  -alias paisainminutes-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

`keytool` will interactively prompt for:
- A keystore password (used to protect the whole file)
- A key password (used to protect this specific key — can be the same as the keystore password)
- Your name/organization details (for the certificate; not security-sensitive, cosmetic only)

**Store the resulting `.jks` file and both passwords in a password manager or other
secure, backed-up location — not in this repository, not in a plain text file on your
desktop.** If you lose this keystore after your first Play Store upload, Google Play
App Signing (step 3 below) is what saves you from being permanently locked out of
updating the app; without enrolling in it, losing this file means you can never update
the app again under the same listing.

## Step 2 — Point the build at it

```
cp android/keystore.properties.example android/keystore.properties
```

Edit `android/keystore.properties` and fill in the real `storeFile` (absolute path to
the `.jks` from Step 1), `storePassword`, `keyAlias`, and `keyPassword`. This file is
gitignored — verify with `git status` that it never shows as a tracked/stageable file.

## Step 3 — Enroll in Google Play App Signing

When you create the app in Play Console and upload your first release, opt into
**Play App Signing**. Google then re-signs your app with its own key for distribution,
while the upload key you generated in Step 1 is only used to authenticate your
uploads to Play Console. This means a future lost/compromised upload keystore is
recoverable (Google can help you reset it) — without Play App Signing, it is not.

## Step 4 — Build the release AAB

```
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`. This repo's own
batch of changes did not run this command to produce a real signed artifact (no
keystore exists yet) — only the no-credentials failure path was verified, deliberately,
on the grounds above. **This agent session did not upload, publish, or submit
anything to Google Play**, and will not, regardless of what gets generated here.

## Checklist before you run Step 1

- [ ] Decide where the `.jks` file and its passwords will be stored long-term (password manager entry, encrypted drive, etc.)
- [ ] Confirm you have a backup plan independent of this machine/session
- [ ] Decide the key validity period (the `-validity 10000` above is ~27 years — Google's current recommendation)
