import handler from "vinext/server/app-router-entry";

interface Env { DB: D1Database }
interface ExecutionContext { waitUntil(promise: Promise<unknown>): void; passThroughOnException(): void }
const ALLOWED_NAMES = new Set(["Артём", "Максим", "Савелий", "Кирилл"]);
const ALLOWED_CLASSES = new Set(["2 Ж", "2 Д"]);
const ALLOWED_CHARACTERS = new Set(["inventor", "researcher", "dreamer"]);
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

async function ensureSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name TEXT NOT NULL CHECK(display_name IN ('Артём','Максим','Савелий','Кирилл')),
      class_name TEXT NOT NULL CHECK(class_name IN ('2 Ж','2 Д')),
      character_id TEXT NOT NULL CHECK(character_id IN ('inventor','researcher','dreamer')),
      score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 5),
      elapsed_seconds INTEGER NOT NULL CHECK(elapsed_seconds BETWEEN 1 AND 300),
      completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_quiz_results_ranking ON quiz_results(score DESC, elapsed_seconds ASC, completed_at DESC)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at DESC)"),
  ]);
}

async function getLeaderboard(db: D1Database) {
  await ensureSchema(db);
  const result = await db.prepare(`SELECT id, display_name AS name, class_name AS className,
    character_id AS cat, score, elapsed_seconds AS time,
    completed_at || 'Z' AS completedAt
    FROM quiz_results
    ORDER BY score DESC, elapsed_seconds ASC, completed_at DESC
    LIMIT 50`).all();
  return json({ results: result.results });
}

async function saveResult(request: Request, db: D1Database) {
  if ((request.headers.get("content-type") || "").split(";")[0] !== "application/json") return json({ error: "invalid_request" }, 415);
  const size = Number(request.headers.get("content-length") || 0);
  if (size > 1024) return json({ error: "invalid_request" }, 413);
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ error: "invalid_request" }, 400); }
  const name = body.name, className = body.className, cat = body.cat, score = body.score, time = body.time;
  const valid = typeof name === "string" && ALLOWED_NAMES.has(name) && typeof className === "string" && ALLOWED_CLASSES.has(className)
    && typeof cat === "string" && ALLOWED_CHARACTERS.has(cat) && Number.isInteger(score) && Number(score) >= 0 && Number(score) <= 5
    && Number.isInteger(time) && Number(time) >= 1 && Number(time) <= 300;
  if (!valid) return json({ error: "invalid_result" }, 400);
  await ensureSchema(db);
  await db.prepare("INSERT INTO quiz_results (display_name, class_name, character_id, score, elapsed_seconds) VALUES (?, ?, ?, ?, ?)")
    .bind(name, className, cat, score, time).run();
  await db.prepare("DELETE FROM quiz_results WHERE id NOT IN (SELECT id FROM quiz_results ORDER BY completed_at DESC, id DESC LIMIT 500)").run();
  return json({ ok: true }, 201);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname === "/api/leaderboard") {
      if (!env.DB) return json({ error: "leaderboard_unavailable" }, 503);
      if (request.method === "GET") return getLeaderboard(env.DB);
      if (request.method === "POST") return saveResult(request, env.DB);
      return json({ error: "method_not_allowed" }, 405);
    }
    return handler.fetch(request, env, ctx);
  },
};
