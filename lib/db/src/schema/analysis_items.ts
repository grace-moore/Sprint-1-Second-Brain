import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysisItemsTable = pgTable("analysis_items", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  explanation: text("explanation").notNull(),
  accepted: boolean("accepted"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnalysisItemSchema = createInsertSchema(analysisItemsTable).omit({ id: true, createdAt: true });
export type InsertAnalysisItem = z.infer<typeof insertAnalysisItemSchema>;
export type AnalysisItem = typeof analysisItemsTable.$inferSelect;
