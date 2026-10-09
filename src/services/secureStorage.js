import { Preferences } from '@capacitor/preferences';

// Thin wrapper around Capacitor's Preferences plugin, used for anything sensitive
// (JWT access token, refresh token). On Android this is backed by SharedPreferences
// (not plain WebView localStorage); on web/dev preview it falls back to localStorage
// internally, so the same code works in both environments. All calls are async by
// design — callers must await them.
export const secureStorage = {
  async get(key) {
    try {
      const { value } = await Preferences.get({ key });
      return value ?? null;
    } catch (err) {
      return null;
    }
  },
  async set(key, value) {
    try {
      await Preferences.set({ key, value: String(value) });
    } catch (err) {
      // Swallow — losing a write here means the user is treated as logged out,
      // which is the safe failure direction for a token store.
    }
  },
  async remove(key) {
    try {
      await Preferences.remove({ key });
    } catch (err) {}
  }
};

export default secureStorage;
