const defaultApiUrl =
  typeof window !== "undefined" && window.location.hostname.includes("thebridge.app.br")
    ? "https://api.thebridge.app.br"
    : "http://localhost:3000";

export const env = {
  apiUrl: (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/+$/, ""),
} as const;