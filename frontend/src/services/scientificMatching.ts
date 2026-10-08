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

    const textStream = await getRes.text();
    const lines = textStream.split("\n");

    for (const line of lines) {
      if (line.startsWith("data:")) {
        try {
          const parsed = JSON.parse(line.slice(5).trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0] as ScientificMatchResult;
          }
        } catch {
          // Continua para próxima linha
        }
      }
    }

    throw new Error("Nenhum dado retornado no fluxo de matching.");
  },
};
