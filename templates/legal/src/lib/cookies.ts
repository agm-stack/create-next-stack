import JsCookies from "js-cookie";

type CookieAttributes = {
  expires?: number | Date | undefined,
  path?: string | undefined,
  domain?: string | undefined,
  secure?: boolean | undefined,
  sameSite?: "strict" | "Strict" | "lax" | "Lax" | "none" | "None" | undefined,
  [property: string]: unknown
};

function set(key: string, value: string, options?: CookieAttributes) {
  return JsCookies.set(key, value, options);
}

function setMultiple(cookies: { key: string, value: string }[] = [], options?: CookieAttributes) {
  return cookies.forEach(({ key, value }) => set(key, value, options));
}

function get(key: string) {
  return JsCookies.get(key);
}

function remove(key: string, options?: CookieAttributes) {
  JsCookies.remove(key, options);
}

function removeMultiple(keys: string[]) {
  keys.forEach((key) => remove(key));
}

export const Cookies = {
  set,
  setMultiple,
  get,
  remove,
  removeMultiple,
};

export const cookieKeys = {} as const;
