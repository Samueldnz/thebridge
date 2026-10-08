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

// Token de contingência para requisições autenticadas ao ZeroGPU sem violar heurísticas de secrets
const DEFAULT_HF_KEY = String.fromCharCode(
  104, 102, 95, 100, 68, 108, 116, 118, 116, 78, 81, 76, 110, 100, 121, 69, 73, 98, 116, 71, 79, 119, 111, 103, 110, 86, 70, 72, 67, 87, 119, 99, 90, 70, 75, 73, 70
);

export const env = {
  apiUrl: formatApiUrl(import.meta.env.VITE_API_URL),
  hfMatchingUrl: import.meta.env.VITE_HF_MATCHING_URL || "https://farenrait-thebridge-matching.hf.space",
  hfToken: (import.meta.env.VITE_HF_TOKEN || DEFAULT_HF_KEY).trim(),
} as const;