function formatApiUrl(rawUrl?: string): string {
  let url = (rawUrl || "").trim().replace(/\/+$/, "");
  if (!url) {
    if (typeof window !== "undefined" && window.location.hostname.includes("thebridge.app.br")) {
      return "https://darkviolet-baboon-478084.hostingersite.com";
    }
    return "http://localhost:3000";
  }
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

export const env = {
  apiUrl: formatApiUrl(import.meta.env.VITE_API_URL),
} as const;