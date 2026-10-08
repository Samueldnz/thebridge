import { env } from "../config/env";

export interface ScientificArticle {
  id: string;
  titulo: string;
  autores: string;
  email: string;
  emails: string[];
  sessao: string;
  codigo: string;
  area: string;
  evento: string;
  ano: number;
  edicao: string;
  score_cosseno: number;
  relevancia_pct: number;
  resumo: string;
}

export interface ScientificMatchResult {
  resposta: string;
  artigos: ScientificArticle[];
  estatisticas: {
    tempo_matchmaking_ms: number;
    total_base: number;
  };
}

/**
 * Calcula a porcentagem de relevância/matching calibrada:
 * Relevância (%) = ((score - 0.35) / (0.75 - 0.35)) * 100
 * Clipada no intervalo [0, 100] e arredondada.
 */
export function calculateRelevance(score: number): number {
  const minScore = 0.35;
  const maxScore = 0.75;
  const rawPct = ((score - minScore) / (maxScore - minScore)) * 100;
  return Math.max(0, Math.min(100, Math.round(rawPct)));
}

function parseEventData(dataStr: string): ScientificMatchResult | null {
  const trimmed = dataStr.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  if (parsed && typeof parsed === "object") {
    if ("error" in (parsed as Record<string, unknown>)) {
      const errObj = parsed as { error: string; title?: string };
      const msg = errObj.title ? `${errObj.title}: ${errObj.error}` : errObj.error;
      throw new Error(msg);
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (first && typeof first === "object" && "artigos" in first) {
        const rawResult = first as ScientificMatchResult;
        const artigos = (rawResult.artigos || []).map((art) => ({
          ...art,
          relevancia_pct: calculateRelevance(art.score_cosseno),
        }));
        return {
          ...rawResult,
          artigos,
        };
      }
    }
  }

  return null;
}

export const scientificMatchingService = {
  async search(query: string, topK: number = 6): Promise<ScientificMatchResult> {
    const trimmed = (query || "").trim();
    if (!trimmed) {
      return {
        resposta: "Digite uma demanda ou escolha uma das suas submissões para buscar.",
        artigos: [],
        estatisticas: { tempo_matchmaking_ms: 0, total_base: 12531 },
      };
    }

    const hfUrl = env.hfMatchingUrl.replace(/\/+$/, "");
    const token = env.hfToken;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Etapa 1: Iniciar execução na fila do Gradio no Hugging Face ZeroGPU
    const postRes = await fetch(`${hfUrl}/gradio_api/call/matchmaking`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: [trimmed, topK],
      }),
    });

    if (!postRes.ok) {
      if (postRes.status === 401 || postRes.status === 404) {
        throw new Error(
          "O Space no Hugging Face pode estar privado ou inacessível. Certifique-se de torná-lo 'Public' no Hugging Face ou configurar o token de acesso."
        );
      }
      throw new Error(`Falha ao conectar ao motor de IA no Hugging Face (${postRes.status}).`);
    }

    const { event_id } = await postRes.json();
    if (!event_id) {
      throw new Error("Identificador de evento não retornado pelo serviço.");
    }

    const getHeaders: Record<string, string> = {};
    if (token) {
      getHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Etapa 2: Recuperar fluxo de resultado via SSE
    const getRes = await fetch(`${hfUrl}/gradio_api/call/matchmaking/${event_id}`, {
      headers: getHeaders,
    });

    if (!getRes.ok) {
      throw new Error(`Erro ao aguardar resposta dos vetores (${getRes.status}).`);
    }

    let matchResult: ScientificMatchResult | null = null;
    let streamErrorMessage: string | null = null;

    if (getRes.body && typeof getRes.body.getReader === "function") {
      const reader = getRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Deixa a última linha incompleta no buffer
          buffer = lines.pop() || "";

          let currentEvent = "";
          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              const dataContent = line.slice(5).trim();
              if (currentEvent === "error") {
                try {
                  const errJson = JSON.parse(dataContent);
                  streamErrorMessage = errJson.error || errJson.title || dataContent;
                } catch {
                  streamErrorMessage = dataContent;
                }
                break;
              }

              try {
                const res = parseEventData(dataContent);
                if (res) {
                  matchResult = res;
                  break;
                }
              } catch (parseErr) {
                if (parseErr instanceof Error) {
                  streamErrorMessage = parseErr.message;
                }
                break;
              }
            }
          }

          if (matchResult || streamErrorMessage) {
            await reader.cancel().catch(() => {});
            break;
          }
        }
      } catch (streamErr) {
        console.warn("[ScientificMatching] Aviso no fluxo SSE:", streamErr);
        if (!matchResult && !streamErrorMessage && streamErr instanceof Error) {
          streamErrorMessage = streamErr.message;
        }
      }
    } else {
      // Fallback para getRes.text() caso stream body não esteja acessível
      const textStream = await getRes.text();
      const lines = textStream.split("\n");
      let currentEvent = "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const dataContent = line.slice(5).trim();
          if (currentEvent === "error") {
            try {
              const errJson = JSON.parse(dataContent);
              streamErrorMessage = errJson.error || errJson.title || dataContent;
            } catch {
              streamErrorMessage = dataContent;
            }
            break;
          }

          try {
            const res = parseEventData(dataContent);
            if (res) {
              matchResult = res;
              break;
            }
          } catch (parseErr) {
            if (parseErr instanceof Error) {
              streamErrorMessage = parseErr.message;
            }
            break;
          }
        }
      }
    }

    if (streamErrorMessage) {
      if (
        streamErrorMessage.includes("ZeroGPU runs limit") ||
        streamErrorMessage.includes("quota exceeded")
      ) {
        throw new Error(
          "Limite de processamento do ZeroGPU atingido. O motor no Hugging Face requer token ativo ou aguardar a liberação de cota."
        );
      }
      throw new Error(streamErrorMessage);
    }

    if (matchResult) {
      return matchResult;
    }

    throw new Error("Nenhum resultado retornado pelo motor de matching no Hugging Face.");
  },
};
