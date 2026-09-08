import { requestApi } from "@/src/services/recipes.service";
import { createLogger } from "@/src/utils/logger";

const log = createLogger("AssistantAPIClient");

export interface AssistantChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantResponse {
  answer: string;
  provider: "openai" | "local";
}

export async function askAssistant(
  message: string,
  history: AssistantChatMessage[],
): Promise<AssistantResponse> {
  log.info("[AI_CHAT] Sending complete message", { message, history });
  const response = await requestApi<AssistantResponse>("/api/assistant", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
  log.info("[AI_CHAT] Received complete message", { ...response });
  return response;
}
