import type { RecipeRecord } from "./recipe.repository";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantResult {
  answer: string;
  provider: "openai" | "local";
}

const SYSTEM_PROMPT = `Eres el asistente culinario de Julis Cakes. Ayuda a cocinar recetas de forma clara, cálida y práctica. Usa únicamente la información de recetas que se proporciona como contexto cuando hables de cantidades o pasos concretos. Da alternativas seguras para ingredientes y explica límites cuando una consulta dependa de alergias, conservación, seguridad alimentaria o salud. Responde en el idioma del usuario, con instrucciones breves y accionables. No inventes datos de recetas ni afirmes haber ejecutado acciones fuera de la conversación.`;

function buildRecipeContext(recipes: RecipeRecord[]): string {
  return recipes
    .slice(0, 20)
    .map(
      (recipe) =>
        `Receta: ${recipe.title}\nIngredientes: ${recipe.ingredients
          .map((ingredient) => `${ingredient.amount} ${ingredient.name}`)
          .join(", ")}\nPasos: ${recipe.steps
          .map((step, index) => `${index + 1}. ${step.description}`)
          .join(" ")}`,
    )
    .join("\n\n");
}

export function createLocalAssistantReply(
  message: string,
  recipes: RecipeRecord[],
): string {
  const normalized = message.toLocaleLowerCase("es");
  const matchedRecipe = recipes.find((recipe) =>
    normalized.includes(recipe.title.toLocaleLowerCase("es")),
  );

  if (normalized.includes("sustitu") || normalized.includes("cambiar")) {
    return "Para sustituir un ingrediente, cambia solo uno cada vez y conserva la misma función: un lácteo por otro lácteo, una grasa por otra grasa y un impulsor por un impulsor equivalente. Dime qué ingrediente quieres cambiar y la receta para ajustarlo con precisión.";
  }

  if (matchedRecipe) {
    const firstStep = matchedRecipe.steps[0]?.description;
    return `Para ${matchedRecipe.title}, empieza por ${firstStep?.charAt(0).toLocaleLowerCase("es") ?? "preparar los ingredientes"}${firstStep ? firstStep.slice(1) : ""} La receta usa ${matchedRecipe.ingredients.length} ingredientes y está pensada para ${matchedRecipe.servings ?? "varias"} raciones.`;
  }

  return "Puedo ayudarte con sustituciones, tiempos, técnicas y las recetas que tienes guardadas. Cuéntame qué estás preparando o nombra una receta para darte una recomendación concreta.";
}

async function askOpenAI(
  apiKey: string,
  message: string,
  history: ChatMessage[],
  recipes: RecipeRecord[],
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Contexto de recetas disponible:\n${buildRecipeContext(recipes)}`,
        },
        ...history.slice(-8),
        { role: "user", content: message },
      ],
      temperature: 0.4,
      max_completion_tokens: 500,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`OpenAI returned ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const answer = data.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("OpenAI returned an empty response");
  return answer;
}

export async function askCookingAssistant(
  message: string,
  history: ChatMessage[],
  recipes: RecipeRecord[],
): Promise<AssistantResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      answer: createLocalAssistantReply(message, recipes),
      provider: "local",
    };
  }

  try {
    return {
      answer: await askOpenAI(apiKey, message, history, recipes),
      provider: "openai",
    };
  } catch {
    return {
      answer: createLocalAssistantReply(message, recipes),
      provider: "local",
    };
  }
}
