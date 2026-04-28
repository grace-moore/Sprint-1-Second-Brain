import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, sessionsTable, analysisItemsTable } from "@workspace/db";
import {
  CreateSessionBody,
  GetSessionParams,
  UpdateSessionParams,
  UpdateSessionBody,
  DeleteSessionParams,
  RateSessionParams,
  RateSessionBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sessions", async (_req, res): Promise<void> => {
  const sessions = await db.select().from(sessionsTable).orderBy(sessionsTable.createdAt);

  const sessionIds = sessions.map((s) => s.id);
  let analysisBySession: Record<number, { bias: number; fallacy: number; opposition: number; total: number }> = {};

  if (sessionIds.length > 0) {
    const items = await db.select().from(analysisItemsTable);
    for (const item of items) {
      if (!analysisBySession[item.sessionId]) {
        analysisBySession[item.sessionId] = { bias: 0, fallacy: 0, opposition: 0, total: 0 };
      }
      const s = analysisBySession[item.sessionId];
      s.total++;
      if (item.type === "bias") s.bias++;
      if (item.type === "fallacy") s.fallacy++;
      if (item.type === "opposition") s.opposition++;
    }
  }

  const result = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    rating: s.rating ?? null,
    analysisCount: analysisBySession[s.id]?.total ?? 0,
    biasCount: analysisBySession[s.id]?.bias ?? 0,
    fallacyCount: analysisBySession[s.id]?.fallacy ?? 0,
    oppositionCount: analysisBySession[s.id]?.opposition ?? 0,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  res.json(result);
});

router.post("/sessions", async (req, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [session] = await db
    .insert(sessionsTable)
    .values({
      title: parsed.data.title,
      content: parsed.data.content ?? "",
      inputMethod: parsed.data.inputMethod,
      status: "draft",
    })
    .returning();

  res.status(201).json({
    ...session,
    rating: session.rating ?? null,
    analysisCount: 0,
  });
});

router.get("/sessions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSessionParams.safeParse({ id: parseInt(raw, 10) });
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
    .where(eq(analysisItemsTable.sessionId, session.id));

  res.json({
    ...session,
    rating: session.rating ?? null,
    analysisCount: items.length,
  });
});

router.patch("/sessions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateSessionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof sessionsTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.content !== undefined) updateData.content = parsed.data.content;

  const [session] = await db
    .update(sessionsTable)
    .set(updateData)
    .where(eq(sessionsTable.id, params.data.id))
    .returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const items = await db
    .select()
    .from(analysisItemsTable)
    .where(eq(analysisItemsTable.sessionId, session.id));

  res.json({
    ...session,
    rating: session.rating ?? null,
    analysisCount: items.length,
  });
});

router.delete("/sessions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSessionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.id, params.data.id))
    .returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  // Also delete analysis items
  await db
    .delete(analysisItemsTable)
    .where(eq(analysisItemsTable.sessionId, params.data.id));

  res.sendStatus(204);
});

router.post("/sessions/:id/rate", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RateSessionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = RateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [session] = await db
    .update(sessionsTable)
    .set({ rating: parsed.data.rating })
    .where(eq(sessionsTable.id, params.data.id))
    .returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const items = await db
    .select()
    .from(analysisItemsTable)
    .where(eq(analysisItemsTable.sessionId, session.id));

  res.json({
    ...session,
    rating: session.rating ?? null,
    analysisCount: items.length,
  });
});

export default router;
