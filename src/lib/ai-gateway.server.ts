// Server-only Lovable AI Gateway helper (OpenAI Responses through the AI SDK).
import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import type { z } from "zod";

import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./ai-run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const AI_MODEL = "openai/gpt-6-astra";

/** Error with a friendly Portuguese message safe to show in the UI. */
export class AiUserError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function statusOf(error: unknown): number | undefined {
  if (error && typeof error === "object") {
    const e = error as { statusCode?: number; status?: number; cause?: unknown; lastError?: unknown };
    if (typeof e.statusCode === "number") return e.statusCode;
    if (typeof e.status === "number") return e.status;
    if (e.lastError) return statusOf(e.lastError);
    if (e.cause) return statusOf(e.cause);
  }
  return undefined;
}

function toUserError(error: unknown): AiUserError {
  if (error instanceof AiUserError) return error;
  const status = statusOf(error);
  console.error("[ai-gateway] request failed", status, error);
  switch (status) {
    case 401:
      return new AiUserError("A integração de IA não está configurada corretamente. Verifique a chave do projeto.", 401);
    case 402:
      return new AiUserError("Os créditos de IA do espaço de trabalho acabaram. Adicione créditos para continuar analisando.", 402);
    case 403:
      return new AiUserError("O uso de IA está bloqueado para este espaço de trabalho no momento. Um administrador precisa liberar o acesso.", 403);
    case 429:
      return new AiUserError("Muitas análises em pouco tempo. Aguarde um minuto e tente novamente.", 429);
    default:
      if (status && status >= 500)
        return new AiUserError("O serviço de IA está instável agora. Tente novamente em alguns instantes.", status);
      return new AiUserError("Não foi possível concluir a análise com IA. Tente novamente.", status ?? 500);
  }
}

export async function generateStructured<T>(opts: {
  request: Request;
  schema: z.ZodType<T>;
  instructions: string;
  prompt: string;
}): Promise<T> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new AiUserError("A integração de IA ainda não foi configurada neste projeto.", 401);
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(opts.request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  let streamError: unknown;
  const result = streamText({
    model: provider.responses(AI_MODEL),
    instructions: opts.instructions,
    messages: [{ role: "user", content: opts.prompt }],
    output: Output.object({ schema: opts.schema }),
    abortSignal: opts.request.signal,
    onError: ({ error }) => {
      streamError = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    const output = (await result.output) as T;
    if (!output) throw new AiUserError("A IA não retornou um resultado. Tente novamente.");
    return output;
  } catch (error) {
    if (streamError) throw toUserError(streamError);
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("[ai-gateway] invalid structured output", error.text?.slice(0, 500));
      throw new AiUserError("A IA retornou uma resposta em formato inesperado. Tente novamente.", 502);
    }
    throw toUserError(error);
  }
}
