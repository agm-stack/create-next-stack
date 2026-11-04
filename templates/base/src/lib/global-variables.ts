const GLOBAL_NAMESPACE = "_app";

/**
 * Exposes a value on `window._app` for debugging and cross-tree hooks (for
 * example toggling devtools from the browser console). Browser only.
 */
export function setGlobalVariable(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window[GLOBAL_NAMESPACE] ??= {};
  window[GLOBAL_NAMESPACE][key] = value;
}
