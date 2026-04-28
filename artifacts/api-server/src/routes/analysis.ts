import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, sessionsTable, analysisItemsTable } from "@workspace/db";
import {
  GetAnalysisParams,
  UpdateAnalysisItemParams,
  UpdateAnalysisItemBody,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.get("/sessions/:id/analysis", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAnalysisParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, params.data.id));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const items = await db
    .select()
    .from(analysisItemsTable)
    .where(eq(analysisItemsTable.sessionId, params.data.id))
    .orderBy(analysisItemsTable.createdAt);

  if (items.length === 0 && session.status !== "complete") {
    res.status(404).json({ error: "No analysis available. Run Challenge first." });
    return;
  }

  const biasCount = items.filter((i) => i.type === "bias").length;
  const fallacyCount = items.filter((i) => i.type === "fallacy").length;
  const oppositionCount = items.filter((i) => i.type === "opposition").length;
  const acceptedCount = items.filter((i) => i.accepted === true).length;

  res.json({
    sessionId: params.data.id,
    items: items.map((i) => ({ ...i, accepted: i.accepted ?? null })),
    biasCount,
    fallacyCount,
    oppositionCount,
    acceptedCount,
  });
});

router.post("/sessions/:id/analyze", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const sessionId = parseInt(raw, 10);

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  if (!session.content || session.content.trim().length < 10) {
    res.status(400).json({ error: "Session content is too short to analyze. Please write at least a sentence." });
    return;
  }

  // Set up SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Mark as analyzing
  await db.update(sessionsTable).set({ status: "analyzing" }).where(eq(sessionsTable.id, sessionId));

  // Clear old analysis
  await db.delete(analysisItemsTable).where(eq(analysisItemsTable.sessionId, sessionId));

  res.write(`data: ${JSON.stringify({ type: "status", message: "Analyzing your argument..." })}\n\n`);

  try {
    const systemPrompt = `You are Second Brain, a rigorous academic reasoning critic. Your job is to challenge and stress-test student arguments — NOT to validate them. You must be intellectually honest, precise, and academically serious.

Analyze the provided argument and return a JSON object with this exact structure:
{
  "bias": [
    { "content": "short label for the bias", "explanation": "2-3 sentence explanation of the bias or assumption found" }
  ],
  "fallacy": [
    { "content": "name of the logical fallacy", "explanation": "2-3 sentence explanation of why this is a fallacy in this context" }
  ],
  "opposition": [
    { "content": "short counterargument claim", "explanation": "2-3 sentence elaboration of the opposing viewpoint" }
  ]
}

Return 1-4 items per category depending on how many genuine issues exist. Be specific and tie each item to actual claims in the argument. Return only valid JSON, no markdown.`;

    const userMessage = `Analyze this academic argument:\n\n${session.content}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const rawContent = response.choices[0]?.message?.content ?? "{}";
    let parsed: { bias?: Array<{ content: string; explanation: string }>; fallacy?: Array<{ content: string; explanation: string }>; opposition?: Array<{ content: string; explanation: string }> } = {};

    try {
      parsed = JSON.parse(rawContent);
    } catch {
      req.log.error({ rawContent }, "Failed to parse AI response as JSON");
    }

    const itemsToInsert = [
      ...(parsed.bias ?? []).map((item) => ({ sessionId, type: "bias", content: item.content, explanation: item.explanation })),
      ...(parsed.fallacy ?? []).map((item) => ({ sessionId, type: "fallacy", content: item.content, explanation: item.explanation })),
      ...(parsed.opposition ?? []).map((item) => ({ sessionId, type: "opposition", content: item.content, explanation: item.explanation })),
    ];

    if (itemsToInsert.length > 0) {
      await db.insert(analysisItemsTable).values(itemsToInsert);
    }

    await db.update(sessionsTable).set({ status: "complete" }).where(eq(sessionsTable.id, sessionId));

    res.write(`data: ${JSON.stringify({ type: "complete", biasCount: parsed.bias?.length ?? 0, fallacyCount: parsed.fallacy?.length ?? 0, oppositionCount: parsed.opposition?.length ?? 0 })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Analysis failed");
    await db.update(sessionsTable).set({ status: "draft" }).where(eq(sessionsTable.id, sessionId));
    res.write(`data: ${JSON.stringify({ error: "Analysis failed. Please try again." })}\n\n`);
    res.end();
  }
});

router.patch("/sessions/:id/analysis/items/:itemId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const rawItemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;

  const params = UpdateAnalysisItemParams.safeParse({
    id: parseInt(rawId, 10),
    itemId: parseInt(rawItemId, 10),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAnalysisItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(analysisItemsTable)
    .set({ accepted: parsed.data.accepted })
    .where(
      and(
        eq(analysisItemsTable.id, params.data.itemId),
        eq(analysisItemsTable.sessionId, params.data.id)
      )
    )
    .returning();

  if (!item) {
    res.status(404).json({ error: "Analysis item not found" });
    return;
  }

  res.json({ ...item, accepted: item.accepted ?? null });
});

export default router;
