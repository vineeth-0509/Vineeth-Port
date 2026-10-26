// GET  /api/content -> public: { projects, experience } from PostgreSQL
// POST /api/content -> owner only (x-admin-password header): replaces both lists
const crypto = require("crypto");
const { Pool } = require("pg");
const seed = require("../src/seed.json");

const CONN = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let pool, ready;
const db = () =>
  pool ||
  (pool = new Pool({
    connectionString: CONN,
    max: 1,
    ssl: /localhost|127\.0\.0\.1|sslmode=/.test(CONN || "") ? undefined : { rejectUnauthorized: false },
  }));

// Creates tables on first use and inserts the starter content exactly once.
function init() {
  return (ready ||= (async () => {
    const c = await db().connect();
    try {
      await c.query("BEGIN");
      await c.query("SELECT pg_advisory_xact_lock(748113)");
      await c.query(`CREATE TABLE IF NOT EXISTS projects(
        id text PRIMARY KEY, position int NOT NULL, title text NOT NULL, tagline text, description text,
        tech text[] NOT NULL DEFAULT '{}', link text, image text, year_label text, emoji text, hue int)`);
      await c.query(`CREATE TABLE IF NOT EXISTS experience(
        id text PRIMARY KEY, position int NOT NULL, period text, role text NOT NULL, company text, description text)`);
      await c.query("CREATE TABLE IF NOT EXISTS meta(key text PRIMARY KEY)");
      const first = await c.query("INSERT INTO meta(key) VALUES('seeded') ON CONFLICT DO NOTHING RETURNING key");
      if (first.rowCount) {
        await insertProjects(c, seed.projects);
        await insertExperience(c, seed.experience);
      }
      await c.query("COMMIT");
    } catch (e) {
      await c.query("ROLLBACK").catch(() => {});
      ready = null;
      throw e;
    } finally {
      c.release();
    }
  })());
}

const multi = (c, table, cols, rows) => {
  if (!rows.length) return;
  const params = [];
  const vals = rows.map((r) => "(" + r.map((v) => (params.push(v), "$" + params.length)).join(",") + ")").join(",");
  return c.query(`INSERT INTO ${table}(${cols}) VALUES ${vals}`, params);
};
const insertProjects = (c, list) =>
  multi(c, "projects", "id,position,title,tagline,description,tech,link,image,year_label,emoji,hue",
    list.map((p, i) => [p.id, i, p.t, p.g, p.d, p.tech || [], p.l || "", p.img || "", p.y || "", p.i || "✨", p.h || 250]));
const insertExperience = (c, list) =>
  multi(c, "experience", "id,position,period,role,company,description",
    list.map((e, i) => [e.id, i, e.period, e.role, e.company || "", e.d || ""]));

const sha = (v) => crypto.createHash("sha256").update(String(v)).digest();
const str = (v, n) => String(v == null ? "" : v).slice(0, n);
const url = (v) => {
  const s = str(v, 600).trim();
  if (s && !/^https?:\/\//i.test(s)) throw new Error("Links must start with http:// or https://");
  return s;
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    try {
      if (!CONN) return res.status(200).json(seed);
      await init();
      const [p, e] = await Promise.all([
        db().query("SELECT * FROM projects ORDER BY position"),
        db().query("SELECT * FROM experience ORDER BY position"),
      ]);
      return res.status(200).json({
        projects: p.rows.map((r) => ({ id: r.id, t: r.title, g: r.tagline, d: r.description, tech: r.tech,
          l: r.link, img: r.image, y: r.year_label, i: r.emoji, h: r.hue })),
        experience: e.rows.map((r) => ({ id: r.id, period: r.period, role: r.role, company: r.company, d: r.description })),
      });
    } catch (err) {
      console.error(err);
      return res.status(200).json(seed);
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const expected = process.env.ADMIN_PASSWORD;
  const given = req.headers["x-admin-password"] || "";
  if (!(expected && given && crypto.timingSafeEqual(sha(given), sha(expected)))) {
    await new Promise((r) => setTimeout(r, 1000)); // slow down guessing
    return res.status(401).json({ error: "Wrong password" });
  }
  const body = req.body || {};
  if (body.verify) return res.status(200).json({ ok: true });
  if (!CONN) return res.status(500).json({ error: "Database not connected yet (see README step 4)" });
  if (!Array.isArray(body.projects) || !Array.isArray(body.experience) || body.projects.length > 100 || body.experience.length > 50)
    return res.status(400).json({ error: "Invalid data" });

  let projects, experience;
  try {
    projects = body.projects.map((p, i) => ({
      id: str(p.id || "p" + Date.now() + i, 40), t: str(p.t, 120), g: str(p.g, 200), d: str(p.d, 4000),
      i: str(p.i || "✨", 8), y: str(p.y, 20), h: Math.abs(Number(p.h) || 250) % 360,
      l: url(p.l), img: url(p.img),
      tech: (Array.isArray(p.tech) ? p.tech : []).slice(0, 20).map((t) => str(t, 40)),
    }));
    experience = body.experience.map((e, i) => ({
      id: str(e.id || "e" + Date.now() + i, 40), period: str(e.period, 60), role: str(e.role, 120),
      company: str(e.company, 120), d: str(e.d, 3000),
    }));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  try {
    await init();
    const c = await db().connect();
    try {
      await c.query("BEGIN");
      await c.query("DELETE FROM projects");
      await c.query("DELETE FROM experience");
      await insertProjects(c, projects);
      await insertExperience(c, experience);
      await c.query("COMMIT");
    } catch (e) {
      await c.query("ROLLBACK").catch(() => {});
      throw e;
    } finally {
      c.release();
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Database save failed" });
  }
};
