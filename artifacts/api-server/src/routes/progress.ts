import { Router, type IRouter } from "express";
import { db, sessionsTable, analysisItemsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/progress", async (_req, res): Promise<void> => {
  const sessions = await db.select().from(sessionsTable).orderBy(sessionsTable.createdAt);
  const items = await db.select().from(analysisItemsTable);

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === "complete").length;

  const ratings = sessions.filter((s) => s.rating !== null && s.rating !== undefined).map((s) => s.rating as number);
  const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  const totalBiasIdentified = items.filter((i) => i.type === "bias").length;
  const totalFallaciesIdentified = items.filter((i) => i.type === "fallacy").length;
  const totalOppositionGenerated = items.filter((i) => i.type === "opposition").length;
  const totalItemsAccepted = items.filter((i) => i.accepted === true).length;

  const dataPoints = sessions.map((s) => {
    const sessionItems = items.filter((i) => i.sessionId === s.id);
    const acceptedItems = sessionItems.filter((i) => i.accepted === true).length;
    return {
      sessionId: s.id,
      date: s.createdAt,
      totalItems: sessionItems.length,
      acceptedItems,
      rating: s.rating ?? null,
      title: s.title,
    };
  });

  res.json({
    totalSessions,
    completedSessions,
    averageRating,
    totalBiasIdentified,
    totalFallaciesIdentified,
    totalOppositionGenerated,
    totalItemsAccepted,
    dataPoints,
  });
});

export default router;
