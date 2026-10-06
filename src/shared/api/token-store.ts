const REFRESH_STORAGE_KEY = "eventpro.refresh";

const hasWindow = typeof window !== "undefined";

let accessToken: string | null = null;

export const tokenStore = {
  getAccess(): string | null {
    return accessToken;
  },

  setAccess(token: string | null): void {
    accessToken = token;
  },

  getRefresh(): string | null {
    if (!hasWindow) return null;
    return window.sessionStorage.getItem(REFRESH_STORAGE_KEY);
  },

  setRefresh(token: string | null): void {
    if (!hasWindow) return;
    if (token === null) {
      window.sessionStorage.removeItem(REFRESH_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(REFRESH_STORAGE_KEY, token);
    }
  },

  clear(): void {
    accessToken = null;
    if (hasWindow) {
      window.sessionStorage.removeItem(REFRESH_STORAGE_KEY);
    }
  },
};
