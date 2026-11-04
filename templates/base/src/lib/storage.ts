/**
 * Browser storage helpers. Storage can be missing (SSR), blocked (privacy mode,
 * disabled cookies), full, or hold corrupt data, so every operation is guarded:
 * reads fall back to `null` and writes fail silently.
 */
function getStorage(kind: "localStorage" | "sessionStorage"): Storage | null {
  try {
    return typeof window === "undefined" ? null : window[kind];
  } catch {
    return null;
  }
}

function createStorage(kind: "localStorage" | "sessionStorage") {
  return {
    set(key: string, item: unknown) {
      try {
        getStorage(kind)?.setItem(key, JSON.stringify(item));
      } catch {
        // Quota exceeded or storage blocked: persistence is best-effort.
      }
    },
    get(key: string) {
      const storage = getStorage(kind);

      try {
        const raw = storage?.getItem(key);

        return raw ? JSON.parse(raw) : null;
      } catch {
        // Corrupt value: drop it so it does not fail on every read.
        try {
          storage?.removeItem(key);
        } catch {
          // Ignore.
        }

        return null;
      }
    },
    remove(key: string) {
      try {
        getStorage(kind)?.removeItem(key);
      } catch {
        // Ignore.
      }
    },
    clear() {
      try {
        getStorage(kind)?.clear();
      } catch {
        // Ignore.
      }
    },
  };
}

export const LocalStorage = createStorage("localStorage");

export const SessionStorage = createStorage("sessionStorage");

export const clearBrowserStorage = () => {
  LocalStorage.clear();
  SessionStorage.clear();
};

export const localStorageKeys = {
  // @if react-query
  reactQueryDevTools: "reactQueryDevTools",
  // @endif
} as const;

export const sessionStorageKeys = {} as const;
