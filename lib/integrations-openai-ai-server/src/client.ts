import OpenAI from "openai";

// Support both Replit AI Integrations proxy vars and standard OpenAI vars (for Azure/self-hosted).
const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY;

const baseURL =
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ||
  process.env.OPENAI_BASE_URL;

if (!apiKey) {
  throw new Error(
    "An OpenAI API key is required. Set AI_INTEGRATIONS_OPENAI_API_KEY (Replit) or OPENAI_API_KEY (Azure/self-hosted).",
  );
}

export const openai = new OpenAI({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
});
