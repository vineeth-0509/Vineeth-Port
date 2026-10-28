import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useSpring,
} from "framer-motion";
import seed from "./seed.json";
import { getContent } from "./api.js";

const ROLES = [
  "Senior Software Engineer",
  "AI Agents Builder",
  "Distributed Systems Engineer",
  "Open-Source Contributor",
];
const SKILLS =
  "TypeScript Node.js Kafka Redis PostgreSQL AI Agents RAG Google ADK Next.js Kubernetes AWS Docker gRPC GraphQL WebRTC Prometheus System Design".split(
    " ",
  );
const STATS = [
  { to: 400, s: "k+", l: "Google Play downloads on ZORDR" },
  {
    to: 3.3,
    s: "x",
    l: "better fix rate with LLM-driven CR analysis at Amazon",
  },
  { to: 70, s: "%", l: "less time to identify issues" },
  { to: 6, s: "", l: "merged PRs at Rocket.Chat (GSoC)" },
];

const Reveal = ({ children, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.8, ease: [0.2, 0.9, 0.2, 1] }}>
    {children}
  </motion.div>
);

function Particles() {
  const ref = useRef();
  useEffect(() => {
    const cv = ref.current,
      x = cv.getContext("2d");
    let W,
      H,
      P = [],
      raf;
    const m = { x: -999, y: -999 };
    const rs = () => {
      W = cv.width = innerWidth;
      H = cv.height = innerHeight;
      P = Array.from({ length: Math.min(90, (W / 16) | 0) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
      }));
    };
    const mm = (e) => {
      m.x = e.clientX;
      m.y = e.clientY;
    };
    rs();
    addEventListener("resize", rs);
    addEventListener("mousemove", mm);
    const loop = () => {
      x.clearRect(0, 0, W, H);
      const d = getComputedStyle(document.documentElement).getPropertyValue(
        "--dot",
      );
      P.forEach((a, i) => {
        a.x += a.vx * 0.5;
        a.y += a.vy * 0.5;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        const dx = a.x - m.x,
          dy = a.y - m.y;
        if (dx * dx + dy * dy < 14000) {
          a.x += dx * 0.02;
          a.y += dy * 0.02;
        }
        x.fillStyle = `rgba(${d},.7)`;
        x.beginPath();
        x.arc(a.x, a.y, 1.6, 0, 7);
        x.fill();
        for (let j = i + 1; j < P.length; j++) {
          const b = P[j],
            l = Math.hypot(a.x - b.x, a.y - b.y);
          if (l < 130) {
            x.strokeStyle = `rgba(${d},${0.22 * (1 - l / 130)})`;
            x.beginPath();
            x.moveTo(a.x, a.y);
            x.lineTo(b.x, b.y);
            x.stroke();
          }
        }
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", rs);
      removeEventListener("mousemove", mm);
    };
  }, []);
  return <canvas id="cv" ref={ref} />;
}

function Typed() {
  const [t, setT] = useState("");
  useEffect(() => {
    let ri = 0,
      ci = 0,
      del = false,
      id;
    const tick = () => {
      const w = ROLES[ri];
      ci += del ? -1 : 1;
      setT(w.slice(0, ci));
      let d = del ? 35 : 75;
      if (!del && ci === w.length) {
        del = true;
        d = 1600;
      } else if (del && ci === 0) {
        del = false;
        ri = (ri + 1) % ROLES.length;
        d = 300;
      }
      id = setTimeout(tick, d);
    };
    tick();
    return () => clearTimeout(id);
  }, []);
  return <div className="role grad">{t}</div>;
}

function Stat({ to, s, l }) {
  const ref = useRef();
  const inV = useInView(ref, { once: true, amount: 0.4 });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inV) return;
    const t0 = performance.now();
    let raf;
    const f = (t) => {
      const p = Math.min(1, (t - t0) / 1600);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [inV, to]);
  return (
    <div className="st" ref={ref}>
      <b>{(to % 1 ? v.toFixed(1) : Math.round(v)) + s}</b>
      <span>{l}</span>
    </div>
  );
}

function Card({ p, onOpen }) {
  const mv = (e) => {
    const c = e.currentTarget,
      r = c.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width,
      y = (e.clientY - r.top) / r.height;
    c.style.setProperty("--mx", x * 100 + "%");
    c.style.setProperty("--my", y * 100 + "%");
    c.style.setProperty("--ry", (x - 0.5) * 12 + "deg");
    c.style.setProperty("--rx", (0.5 - y) * 12 + "deg");
  };
  const lv = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  return (
    <Reveal>
      <div className="tilt" onMouseMove={mv} onMouseLeave={lv}>
        <motion.article
          layoutId={"c" + p.id}
          className="card"
          style={{ "--h": p.h || 250, borderRadius: 26 }}
          onClick={() => onOpen(p.id)}>
          <div className="ic">{p.i || "✨"}</div>
          <span className="go">↗</span>
          <h3>{p.t}</h3>
          <p>{p.g}</p>
          <div className="ch">
            {(p.tech || []).slice(0, 4).map((t) => (
              <i key={t}>{t}</i>
            ))}
          </div>
        </motion.article>
      </div>
    </Reveal>
  );
}

function Modal({ p, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <motion.div
      className="ov"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        layoutId={"c" + p.id}
        className="pn"
        style={{ "--h": p.h || 250, borderRadius: 30 }}
        onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div style={{ fontSize: 44 }}>{p.i || "✨"}</div>
        <h2>{p.t}</h2>
        <div className="tg">
          {p.g}
          {p.y ? " · " + p.y : ""}
        </div>
        <div className="ds">
          {p.img ? <img className="shot" src={p.img} alt={p.t} /> : null}
          {p.d}
        </div>
        <div>
          <h5>Built with</h5>
          <div className="ch">
            {(p.tech || []).map((t) => (
              <i key={t}>{t}</i>
            ))}
          </div>
        </div>
        <div className="row">
          {p.l ? (
            <a
              className="btn"
              href={p.l}
              target="_blank"
              rel="noopener noreferrer">
              Visit official link ↗
            </a>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [content, setContent] = useState(seed);
  const [sel, setSel] = useState(null);
  const cur = useRef();
  const { scrollYProgress } = useScroll();
  const sx = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  useEffect(() => {
    getContent().then(setContent);
  }, []);
  useEffect(() => {
    const m = (e) => {
      if (cur.current) {
        cur.current.style.left = e.clientX + "px";
        cur.current.style.top = e.clientY + "px";
      }
    };
    addEventListener("mousemove", m);
    return () => removeEventListener("mousemove", m);
  }, []);
  const chosen = content.projects.find((p) => p.id === sel);
  const name = "Manasa Tungani";

  return (
    <>
      <Particles />
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <motion.div id="bar" style={{ scaleX: sx }} />
      <div id="cur" ref={cur} />
      <nav>
        <b>
          VT<span className="grad">.</span>
        </b>
        <div>
          <a href="#work">Projects</a>
          <a href="#exp">Experience</a>
          <a href="#ct">Contact</a>
        </div>
      </nav>
      <main>
        <section id="hero">
          <div className="hi">Hello, I’m</div>
          <h1>
            {[...name].map((c, i) => (
              <motion.span
                key={i}
                className="l"
                style={{ animation: "none" }}
                initial={{ opacity: 0, y: 80, rotate: 8 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.9,
                  ease: [0.2, 0.9, 0.2, 1],
                }}>
                {c === " " ? "\u00A0" : c}
              </motion.span>
            ))}
          </h1>
          <Typed />
          <p className="sub">
            I’m a Senior Software Engineer with 7 years of experience building
            scalable applications. I spent 5 years at Amazon and 2 years at a Y
            Combinator-funded startup, developing distributed systems and
            full-stack products. My expertise includes Java, Node.js, Python, C#
            and Rust, with skills in backend development, API design, and system
            architecture. I enjoy solving complex problems, improving
            performance, and delivering software that creates business value. I
            keep learning new technologies to build efficient, secure
            maintainable solutions. Whether you need a product built from
            scratch, backend services, API integrations, or improvements to
            existing systems, I’ll turn your ideas into reliable software. Let’s
            work together to build something great!
          </p>
          <div>
            <a className="btn" href="#work">
              Explore my work
            </a>
            <a className="btn g" href="mailto:svtvineeth96@gmail.com">
              Get in touch
            </a>
          </div>
        </section>
        <div className="mq">
          <div>
            {[...SKILLS, ...SKILLS].map((s, i) => (
              <span key={i}>✦ {s}</span>
            ))}
          </div>
        </div>
        <section>
          <Reveal className="stats">
            {STATS.map((s) => (
              <Stat key={s.l} {...s} />
            ))}
          </Reveal>
        </section>
        <section id="work">
          <Reveal>
            <h2>
              Selected <span className="grad">projects</span>
            </h2>
            <p className="k">
              Tap any project to see what it does, how it works, and the
              official link.
            </p>
          </Reveal>
          <div id="grid">
            {content.projects.map((p) => (
              <Card key={p.id} p={p} onOpen={setSel} />
            ))}
          </div>
        </section>
        <section id="exp">
          <Reveal>
            <h2>
              The <span className="grad">journey</span>
            </h2>
            <p className="k">Production systems, AI, and open source.</p>
          </Reveal>
          <div className="tl">
            {content.experience.map((e) => (
              <Reveal key={e.id}>
                <div>
                  <small>{e.period}</small>
                  <h4>
                    {e.role}
                    {e.company ? " · " + e.company : ""}
                  </h4>
                  <p>{e.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
        <section id="ct">
          <Reveal>
            <h2>
              Let’s build something <span className="grad">remarkable</span>
            </h2>
            <a className="m" href="mailto:svtvineeth96@gmail.com">
              svtvineeth96@gmail.com
            </a>
          </Reveal>
        </section>
      </main>
      <footer>Designed &amp; built by {name}</footer>
      <AnimatePresence>
        {chosen && <Modal key="m" p={chosen} onClose={() => setSel(null)} />}
      </AnimatePresence>
    </>
  );
}
