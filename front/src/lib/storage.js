// Безопасное хранилище: localStorage с откатом в память,
// если он недоступен (например, в приватном режиме браузера).
const mem = {};

export const store = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return mem[k] ?? null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {
      mem[k] = v;
    }
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch {
      delete mem[k];
    }
  },
};

// Адрес API по умолчанию: из .env (VITE_API_URL) или localhost:5000.
export const DEFAULT_API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
