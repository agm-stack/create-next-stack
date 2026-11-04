export function isClient() {
  return typeof window !== "undefined";
}

export function isApiAvailable(api: keyof Window): boolean {
  return typeof window !== "undefined" && api in window;
}
