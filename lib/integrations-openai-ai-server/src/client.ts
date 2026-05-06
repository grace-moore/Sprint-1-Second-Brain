import OpenAI from "openai";

// Support both Replit AI Integrations proxy vars and standard OpenAI vars (for Azure/self-hosted).
// Initialized lazily so the app starts up even if the key isn't present yet —
// the error is thrown only when an AI request is actually made.
let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (_openai) return _openai;

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

  _openai = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  return _openai;
}

// Keep backward-compatible named export for existing imports
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
