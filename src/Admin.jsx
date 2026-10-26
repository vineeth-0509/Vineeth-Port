import { useState } from "react";
import { getContent, saveContent, verify } from "./api.js";

const blankP = () => ({ id: "p" + Date.now(), t: "", g: "", d: "", tech: [], l: "", y: "", i: "✨", img: "", h: Math.floor(Math.random() * 360) });
const blankE = () => ({ id: "e" + Date.now(), period: "", role: "", company: "", d: "" });
const label = (tab, x) => (tab === "projects" ? `${x.i} ${x.t}` : `${x.role}${x.company ? " · " + x.company : ""} (${x.period})`);

export default function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState({ projects: [], experience: [] });
  const [tab, setTab] = useState("projects");
  const [f, setF] = useState(null);
  const [fi, setFi] = useState(null);
  const [techText, setTechText] = useState("");
  const [msg, setMsg] = useState({ t: "", e: false });
  const say = (t, e = false) => setMsg({ t, e });
  const dirty = () => say("Unsaved changes — press “Save & publish”.");
  const list = data[tab];
  const setList = (l) => setData({ ...data, [tab]: l });

  const login = async () => {
    try { await verify(pw); setData(await getContent()); setAuthed(true); say(""); }
    catch (e) { say(e.message, true); }
  };
  const open = (i) => {
    const x = i == null ? (tab === "projects" ? blankP() : blankE()) : { ...list[i] };
    setF(x); setFi(i); setTechText((x.tech || []).join(", "));
  };
  const apply = () => {
    if (!(tab === "projects" ? f.t : f.role).trim()) return say(tab === "projects" ? "Project name is required." : "Role is required.", true);
    const x = tab === "projects" ? { ...f, tech: techText.split(",").map((s) => s.trim()).filter(Boolean) } : f;
    setList(fi == null ? (tab === "projects" ? [x, ...list] : [...list, x]) : list.map((y, i) => (i === fi ? x : y)));
    setF(null); dirty();
  };
  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= list.length) return;
    const n = [...list]; [n[i], n[j]] = [n[j], n[i]]; setList(n); dirty();
  };
  const del = (i) => { if (confirm(`Delete “${label(tab, list[i])}”?`)) { setList(list.filter((_, k) => k !== i)); dirty(); } };
  const save = async () => {
    try { say("Saving…"); await saveContent(data, pw); say("Saved to the database! Your live portfolio is updated."); }
    catch (e) { say(e.message, true); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const switchTab = (t) => { setTab(t); setF(null); };

  if (!authed)
    return (
      <div className="adm" style={{ padding: "12vh 5vw" }}>
        <h1>Portfolio admin</h1>
        <p style={{ color: "var(--mut)" }}>Only the owner can save changes. The password is checked on the server.</p>
        <input type="password" placeholder="Admin password" value={pw} autoFocus
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
        <button onClick={login}>Log in</button>
        <div className={"msg" + (msg.e ? " e" : "")}>{msg.t}</div>
        <a href="/" style={{ color: "var(--mut)" }}>← Back to portfolio</a>
      </div>
    );

  return (
    <div className="adm" style={{ padding: "60px 5vw" }}>
      <h1>Manage portfolio</h1>
      <p style={{ color: "var(--mut)" }}>Edit projects and experience, then press Save &amp; publish.</p>
      <button className={tab === "projects" ? "" : "g"} onClick={() => switchTab("projects")}>Projects</button>
      <button className={tab === "experience" ? "" : "g"} onClick={() => switchTab("experience")}>Experience</button>
      <span style={{ display: "inline-block", width: 20 }} />
      <button onClick={() => open(null)}>＋ Add {tab === "projects" ? "project" : "experience"}</button>
      <button onClick={save}>Save &amp; publish</button>
      <a href="/" style={{ color: "var(--mut)", marginLeft: 8 }}>View site ↗</a>
      <div className={"msg" + (msg.e ? " e" : "")}>{msg.t}</div>

      {f && tab === "projects" && (
        <div className="fm">
          <h3>{fi == null ? "New project" : "Edit project"}</h3>
          <label>Project name</label><input value={f.t} onChange={set("t")} />
          <label>One-line tagline</label><input value={f.g} onChange={set("g")} />
          <label>What it is and what it does</label><textarea rows={6} value={f.d} onChange={set("d")} />
          <label>Tech stack (comma separated)</label><input value={techText} onChange={(e) => setTechText(e.target.value)} />
          <label>Official / live link (https://…)</label><input value={f.l} onChange={set("l")} />
          <label>Screenshot image URL (optional)</label><input value={f.img || ""} onChange={set("img")} />
          <label>Year</label><input value={f.y} onChange={set("y")} />
          <label>Emoji icon</label><input value={f.i} onChange={set("i")} />
          <label>Accent color</label>
          <input type="range" min="0" max="359" value={f.h} onChange={(e) => setF({ ...f, h: +e.target.value })} />
          <button onClick={apply}>Apply</button><button className="g" onClick={() => setF(null)}>Cancel</button>
        </div>
      )}
      {f && tab === "experience" && (
        <div className="fm">
          <h3>{fi == null ? "New experience" : "Edit experience"}</h3>
          <label>Period (e.g. 2023 – 2026)</label><input value={f.period} onChange={set("period")} />
          <label>Role / title</label><input value={f.role} onChange={set("role")} />
          <label>Company / organization</label><input value={f.company} onChange={set("company")} />
          <label>About this experience</label><textarea rows={6} value={f.d} onChange={set("d")} />
          <button onClick={apply}>Apply</button><button className="g" onClick={() => setF(null)}>Cancel</button>
        </div>
      )}

      {list.map((x, i) => (
        <div className="it" key={x.id}>
          <span>{label(tab, x)}</span>
          <span>
            <button className="g" onClick={() => move(i, -1)}>↑</button>
            <button className="g" onClick={() => move(i, 1)}>↓</button>
            <button className="g" onClick={() => open(i)}>Edit</button>
            <button className="d" onClick={() => del(i)}>Delete</button>
          </span>
        </div>
      ))}
    </div>
  );
}
