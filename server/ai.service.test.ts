import { createLocalAssistantReply } from "./ai.service";
import type { RecipeRecord } from "./recipe.repository";

const recipes: RecipeRecord[] = [
  {
    id: "cake",
    title: "Tarta de prueba",
    description: "",
    ingredients: [{ id: "flour", name: "Harina", amount: "100 g" }],
    steps: [
      {
        id: "mix",
        title: "Mezclar",
        description: "Mezcla los ingredientes con suavidad.",
      },
    ],
    totalTimeMinutes: 20,
    servings: 4,
    isFavorite: false,
    isUserCreated: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("createLocalAssistantReply", () => {
  it("debería dar una orientación específica al mencionar una receta", () => {
    expect(
      createLocalAssistantReply("Ayúdame con Tarta de prueba", recipes),
    ).toContain("4 raciones");
  });

  it("debería solicitar contexto para una sustitución", () => {
    expect(
      createLocalAssistantReply("Quiero sustituir la harina", recipes),
    ).toContain("Dime qué ingrediente");
  });
});
