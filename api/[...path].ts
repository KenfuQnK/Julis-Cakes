import type { Request, Response } from "express";

import { app, initializeServer } from "../server";
import { createLogger } from "../src/utils/logger";

const log = createLogger("VercelRecipesAPI");

export default async function handler(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    await initializeServer();
    app(request, response);
  } catch (error) {
    log.error("Serverless API initialization failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    response.status(500).json({ error: "Recipes API is unavailable" });
  }
}
