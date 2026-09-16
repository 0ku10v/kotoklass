import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const quizResults = sqliteTable("quiz_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  displayName: text("display_name").notNull(),
  className: text("class_name").notNull(),
  characterId: text("character_id").notNull(),
  score: integer("score").notNull(),
  elapsedSeconds: integer("elapsed_seconds").notNull(),
  completedAt: text("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  check("quiz_results_name_check", sql`${table.displayName} IN ('Артём','Максим','Савелий','Кирилл')`),
  check("quiz_results_class_check", sql`${table.className} IN ('2 Ж','2 Д')`),
  check("quiz_results_character_check", sql`${table.characterId} IN ('inventor','researcher','dreamer')`),
  check("quiz_results_score_check", sql`${table.score} BETWEEN 0 AND 5`),
  check("quiz_results_elapsed_check", sql`${table.elapsedSeconds} BETWEEN 1 AND 300`),
  index("idx_quiz_results_ranking").on(table.score, table.elapsedSeconds, table.completedAt),
  index("idx_quiz_results_completed_at").on(table.completedAt),
]);
