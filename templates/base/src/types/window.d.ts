/* eslint-disable @typescript-eslint/consistent-type-definitions */

declare global {
  interface Window {
    _app?: Record<string, unknown>
  }

  interface Navigator {
    userAgentData?: {
      brands: {
        brand: string,
        version: string
      }[]
    }
  }
}

// This is necessary to make the file a module
export { };
