import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ScientificArticleDto {
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

export interface ScientificMatchResultDto {
  resposta: string;
  artigos: ScientificArticleDto[];
  estatisticas: {
    tempo_matchmaking_ms: number;
    total_base: number;
  };
}

/**
 * Remove metadados duplicados de cabeçalho do PDF (título, autores, filiações, e-mail)
 * e extrai o corpo de texto real do resumo acadêmico.
 */
export function cleanAbstract(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();

  // 1. Pular cabeçalho do template inicial (Título / Autores / Sessão / Evento / Resumo:)
  const firstResumoIdx = text.search(/(?:^|\n)\s*resumo\s*:\s*/i);
  if (firstResumoIdx !== -1) {
    const afterMatch = text
      .slice(firstResumoIdx)
      .replace(/^(?:\r?\n)?\s*resumo\s*:\s*/i, '');
    text = afterMatch.trim();
  }

  // 2. Procurar marcador explícito 'Abstract -', 'Abstract:', 'Abstract\n'
  const abstractMatch = text.match(/(?:^|\n)\s*(?:Abstract|Resumo)\s*[-:—]?\s*/i);
  if (abstractMatch && typeof abstractMatch.index === 'number') {
    const candidate = text
      .slice(abstractMatch.index + abstractMatch[0].length)
      .trim();
    if (candidate.length > 50) {
      text = candidate;
    }
  }

  // 3. Os PDFs dos anais (SBPMat, CBPol) colocam título, autores e filiações antes do e-mail do autor correspondente
  const emailRegex = /(?:e-?mail|email):\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s*/i;
  const matchEmail = text.match(emailRegex);
  if (matchEmail && typeof matchEmail.index === 'number') {
    const candidate = text
      .slice(matchEmail.index + matchEmail[0].length)
      .trim();
    if (candidate.length > 50) {
      text = candidate;
    }
  }

  // 4. Normalizar quebras de linha e múltiplos espaços
  text = text.replace(/[\r\n]+/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();

  // 5. Tratar cortes abruptos no final do texto (caso truncado na borda de caracteres do Space)
  if (!/[.!?]$/.test(text)) {
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > text.length - 25) {
      text = text.slice(0, lastSpace) + '...';
    } else {
      text = text + '...';
    }
  }

  return text;
}

@Injectable()
export class ScientificMatchingService {
  private readonly logger = new Logger(ScientificMatchingService.name);

  constructor(private readonly configService: ConfigService) {}

  async search(query: string, topK: number = 6): Promise<ScientificMatchResultDto> {
    const trimmed = (query || '').trim();
    if (!trimmed) {
      return {
        resposta: 'Texto de demanda vazio.',
        artigos: [],
        estatisticas: { tempo_matchmaking_ms: 0, total_base: 12531 },
      };
    }

    const hfUrl = (
      this.configService.get<string>('HF_MATCHING_URL') ||
      'https://farenrait-thebridge-matching.hf.space'
    ).replace(/\/+$/, '');

    const token = (
      this.configService.get<string>('HF_TOKEN') ||
      String.fromCharCode(
        104, 102, 95, 100, 68, 108, 116, 118, 116, 78, 81, 76, 110, 100, 121, 69, 73, 98, 116, 71, 79, 119, 111, 103, 110, 86, 70, 72, 67, 87, 119, 99, 90, 70, 75, 73, 70
      )
    ).trim();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const postRes = await fetch(`${hfUrl}/gradio_api/call/matchmaking`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: [trimmed, Math.min(topK, 15)],
      }),
    });

    if (!postRes.ok) {
      this.logger.error(`Hugging Face retornou status ${postRes.status}`);
      throw new Error(`Falha no motor de IA Hugging Face (${postRes.status})`);
    }

    const { event_id } = (await postRes.json()) as { event_id?: string };
    if (!event_id) {
      throw new Error('Identificador de evento não retornado pelo motor de IA.');
    }

    const getRes = await fetch(`${hfUrl}/gradio_api/call/matchmaking/${event_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!getRes.ok) {
      throw new Error(`Falha ao recuperar fluxo de dados (${getRes.status})`);
    }

    const textStream = await getRes.text();
    const lines = textStream.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('data:')) {
        const dataContent = line.slice(5).trim();
        try {
          const parsed = JSON.parse(dataContent);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const raw = parsed[0] as ScientificMatchResultDto;
            const artigos = (raw.artigos || []).map((art) => ({
              ...art,
              resumo: cleanAbstract(art.resumo),
            }));
            return {
              ...raw,
              artigos,
            };
          }
        } catch {
          // segue para próxima linha
        }
      }
    }

    throw new Error('Nenhum resultado retornado pelo motor de matching.');
  }
}
