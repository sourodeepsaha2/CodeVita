import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import FAQ from "../components/FAQ";

const CURRENT_YEAR = new Date().getFullYear();

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Problem Row ─── */
function ProblemRow({ num, title, difficulty, tags, acceptance }) {
  const diffColors = {
    Easy: { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "rgba(16,185,129,0.25)" },
    Medium: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.25)" },
    Hard: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.25)" },
  };
  const c = diffColors[difficulty];

  return (
    <div className="problem-row">
      <span style={{ color: "var(--cv-text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", minWidth: "36px" }}>
        {num}
      </span>
      <span style={{ flex: 1, fontWeight: "500", fontSize: "0.92rem" }}>{title}</span>
      <span style={{ display: "flex", gap: "6px" }}>
        {tags.map((t) => (
          <span key={t} style={{ padding: "3px 9px", borderRadius: "6px", fontSize: "0.75rem", background: "rgba(139,92,246,0.1)", color: "var(--cv-accent-text)", border: "1px solid rgba(139,92,246,0.2)" }}>
            {t}
          </span>
        ))}
      </span>
      <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "600", background: c.bg, color: c.text, border: `1px solid ${c.border}`, minWidth: "64px", textAlign: "center" }}>
        {difficulty}
      </span>
      <span style={{ color: "var(--cv-text-muted)", fontSize: "0.83rem", fontFamily: "var(--font-mono)", minWidth: "50px", textAlign: "right" }}>
        {acceptance}%
      </span>
    </div>
  );
}

/* ─── Code Snippet Block ─── */
function CodeSnippet() {
  const lines = [
    { n: 1, tokens: [{ t: "// Two Sum – O(n) solution", cls: "code-comment" }] },
    { n: 2, tokens: [] },
    {
      n: 3,
      tokens: [
        { t: "function", cls: "code-keyword" },
        { t: " twoSum(", cls: "" },
        { t: "nums", cls: "code-type" },
        { t: ", ", cls: "" },
        { t: "target", cls: "code-type" },
        { t: ") {", cls: "" },
      ],
    },
    {
      n: 4,
      tokens: [
        { t: "  const", cls: "code-keyword" },
        { t: " map = ", cls: "" },
        { t: "new", cls: "code-keyword" },
        { t: " Map();", cls: "" },
      ],
    },
    {
      n: 5,
      tokens: [
        { t: "  for", cls: "code-keyword" },
        { t: " (", cls: "" },
        { t: "let", cls: "code-keyword" },
        { t: " i = ", cls: "" },
        { t: "0", cls: "code-number" },
        { t: "; i < nums.length; i++) {", cls: "" },
      ],
    },
    {
      n: 6,
      tokens: [
        { t: "    const", cls: "code-keyword" },
        { t: " comp = target - nums[i];", cls: "" },
      ],
    },
    {
      n: 7,
      tokens: [
        { t: "    if", cls: "code-keyword" },
        { t: " (map.has(comp))", cls: "" },
      ],
    },
    {
      n: 8,
      tokens: [
        { t: "      return", cls: "code-keyword" },
        { t: " [map.get(comp), i];", cls: "" },
      ],
    },
    { n: 9, tokens: [{ t: "    map.set(nums[i], i);", cls: "" }] },
    { n: 10, tokens: [{ t: "  }", cls: "" }] },
    { n: 11, tokens: [{ t: "}", cls: "" }] },
  ];

  return (
    <div className="code-block animate-float" style={{ width: "100%", maxWidth: "440px" }}>
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: "7px", marginBottom: "16px" }}>
        {["#ef4444", "#f59e0b", "#10b981"].map((c, i) => (
          <div key={i} style={{ width: "12px", height: "12px", borderRadius: "50%", background: c, opacity: 0.8 }} />
        ))}
        <span style={{ marginLeft: "10px", color: "var(--cv-text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
          solution.js
        </span>
      </div>
      {lines.map((line) => (
        <div key={line.n} style={{ display: "flex", lineHeight: "1.7" }}>
          <span className="code-line-number">{line.n}</span>
          <span>
            {line.tokens.map((tok, i) => (
              <span key={i} className={tok.cls}>
                {tok.t}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Home Page ─── */
export default function HomePage() {
  useDocumentTitle();

  const problems = [
    { num: "001", title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Map"], acceptance: 49 },
    { num: "053", title: "Maximum Subarray", difficulty: "Medium", tags: ["Array", "DP"], acceptance: 50 },
    { num: "042", title: "Trapping Rain Water", difficulty: "Hard", tags: ["Stack", "Two Ptr"], acceptance: 60 },
    { num: "200", title: "Number of Islands", difficulty: "Medium", tags: ["BFS", "DFS"], acceptance: 58 },
    { num: "076", title: "Minimum Window Substring", difficulty: "Hard", tags: ["Sliding Window"], acceptance: 42 },
  ];

  const features = [
    {
      icon: "⚡",
      color: "rgba(245,158,11,0.15)",
      title: "Lightning-Fast Judge",
      desc: "Sub-100ms execution feedback with support for C++, Java, Python, JavaScript and more.",
    },
    {
      icon: "🏆",
      color: "rgba(139,92,246,0.15)",
      title: "Weekly Contests",
      desc: "Compete globally in timed contests. Climb the leaderboard and earn exclusive badges.",
    },
    {
      icon: "🗺️",
      color: "rgba(6,182,212,0.15)",
      title: "Curated Roadmaps",
      desc: "Structured learning paths from Arrays to System Design, tailored for top tech interviews.",
    },
    {
      icon: "🤖",
      color: "rgba(16,185,129,0.15)",
      title: "AI Hints & Reviews",
      desc: "Get AI-powered hints without spoilers, and post-solve code reviews to level up fast.",
    },
    {
      icon: "📊",
      color: "rgba(239,68,68,0.15)",
      title: "Deep Analytics",
      desc: "Track your progress, time complexity trends, and weak areas with beautiful dashboards.",
    },
    {
      icon: "👥",
      color: "rgba(251,146,60,0.15)",
      title: "Discussion Forums",
      desc: "Discuss solutions, share approaches, and learn different perspectives from the community.",
    },
  ];

  const topics = [
    "Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming",
    "Sliding Window", "Two Pointers", "Binary Search", "Stack & Queue",
    "Tries", "Heaps", "Backtracking",
  ];

  const stats = [
    { value: 2400, suffix: "+", label: "Problems" },
    { value: 180000, suffix: "+", label: "Coders" },
    { value: 50, suffix: "+", label: "Companies" },
    { value: 98, suffix: "%", label: "Satisfaction" },
  ];

  const testimonials = [
    {
      name: "Arjun Sharma",
      role: "SDE @ Google",
      avatar: "🧑‍💻",
      text: "Code Vita's structured roadmaps helped me crack Google in 3 months. The AI hints are game-changers!",
    },
    {
      name: "Priya Patel",
      role: "SWE @ Meta",
      avatar: "👩‍💻",
      text: "The best platform for competitive programming. Weekly contests kept me sharp and the community is amazing.",
    },
    {
      name: "Rohan Mehta",
      role: "Backend Eng @ Amazon",
      avatar: "🧑‍🔬",
      text: "I landed my dream job after grinding Code Vita for 4 months. The problem quality is top-notch.",
    },
  ];

  return (
    <div className="page-wrapper">
      {/* ─── Hero Section ─── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "100px 24px 80px",
          position: "relative",
        }}
        className="bg-grid"
      >
        {/* Orbs */}
        <div className="orb orb-purple" style={{ width: "700px", height: "700px", top: "-200px", left: "-200px" }} />
        <div className="orb orb-cyan" style={{ width: "500px", height: "500px", top: "100px", right: "-100px" }} />
        <div className="orb orb-amber" style={{ width: "300px", height: "300px", bottom: "100px", left: "30%" }} />

        <div className="content-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: "60px" }}>
          {/* Left */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badge */}
            <div
              className="animate-fade-in-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 16px",
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "100px",
                marginBottom: "28px",
                fontSize: "0.82rem",
                fontWeight: "600",
                color: "var(--cv-accent-text)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", display: "inline-block" }} />
              Now with AI-Powered Code Reviews
            </div>

            <h1
              className="animate-fade-in-up delay-100"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.2rem)", marginBottom: "24px", opacity: 0 }}
            >
              Master{" "}
              <span className="gradient-text">DSA & CP</span>
              <br />
              Land Your{" "}
              <span style={{ color: "#06b6d4" }}>Dream Job</span>
            </h1>

            <p
              className="animate-fade-in-up delay-200"
              style={{ fontSize: "1.1rem", color: "var(--cv-text-2)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "520px", opacity: 0 }}
            >
              Code Vita is your all-in-one competitive programming arena. Practice
              2400+ curated problems, compete in weekly contests, and ace interviews
              at top tech companies worldwide.
            </p>

            <div className="animate-fade-in-up delay-300" style={{ display: "flex", gap: "14px", flexWrap: "wrap", opacity: 0 }}>
              <Link to="/signup" className="btn-primary-cv" style={{ fontSize: "1rem", padding: "14px 32px" }}>
                Start Coding Free →
              </Link>
              <Link to="/problems" className="btn-outline-cv" style={{ fontSize: "1rem", padding: "14px 32px" }}>
                Browse Problems
              </Link>
            </div>

            {/* Mini Stats */}
            <div
              className="animate-fade-in-up delay-400"
              style={{ display: "flex", gap: "32px", marginTop: "48px", opacity: 0 }}
            >
              {[
                { label: "Problems", val: "2400+" },
                { label: "Active Users", val: "180K+" },
                { label: "Companies", val: "50+" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--cv-accent-text)", fontFamily: "var(--font-mono)" }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--cv-text-muted)", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Code Editor Visual */}
          <div
            className="animate-fade-in delay-300"
            style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", opacity: 0 }}
          >
            <div style={{ position: "relative" }}>
              {/* Glow ring */}
              <div
                style={{
                  position: "absolute",
                  inset: "-2px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(139,92,246,0.5), rgba(6,182,212,0.3))",
                  filter: "blur(1px)",
                  zIndex: -1,
                }}
              />
              <CodeSnippet />
              {/* Floating badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  right: "-20px",
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  color: "white",
                  boxShadow: "0 0 20px rgba(139,92,246,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>✅</span> Accepted · 48ms
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(139,92,246,0.08)", borderBottom: "1px solid rgba(139,92,246,0.08)", background: "var(--cv-section-alt)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: "2.4rem", fontWeight: "900", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>
                <span className="gradient-text-purple">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </span>
              </div>
              <div style={{ color: "var(--cv-text-muted)", fontSize: "0.9rem", fontWeight: "500" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Problem Preview Section ─── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ color: "var(--cv-accent-text)", fontWeight: "600", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
              Problem Bank
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: "16px" }}>
              Handpicked for <span className="gradient-text">interview success</span>
            </h2>
            <p style={{ color: "var(--cv-text-2)", fontSize: "1rem", maxWidth: "500px", margin: "0 auto" }}>
              Every problem is tagged, categorized, and mapped to real interview questions from top companies.
            </p>
          </div>

          <div className="glass-card" style={{ overflow: "hidden" }}>
            {/* Table Header */}
            <div style={{ display: "flex", gap: "16px", padding: "12px 20px", borderBottom: "1px solid rgba(139,92,246,0.12)", background: "rgba(139,92,246,0.04)" }}>
              <span style={{ color: "var(--cv-text-muted)", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: "36px" }}>#</span>
              <span style={{ color: "var(--cv-text-muted)", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", flex: 1 }}>Title</span>
              <span style={{ color: "var(--cv-text-muted)", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tags</span>
              <span style={{ color: "var(--cv-text-muted)", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: "64px", textAlign: "center" }}>Diff</span>
              <span style={{ color: "var(--cv-text-muted)", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: "50px", textAlign: "right" }}>Acc.</span>
            </div>
            {problems.map((p) => (
              <ProblemRow key={p.num} {...p} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link to="/problems" className="btn-outline-cv">
              View All 2400+ Problems →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Topics Section ─── */}
      <section style={{ padding: "40px 24px 100px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", marginBottom: "16px" }}>
            Master every <span className="gradient-text">topic</span>
          </h2>
          <p style={{ color: "var(--cv-text-2)", marginBottom: "36px" }}>Structured by difficulty and concept, not just by problem number.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            {topics.map((t) => (
              <span key={t} className="topic-tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section style={{ padding: "100px 24px", background: "var(--cv-section-alt)", borderTop: "1px solid rgba(139,92,246,0.08)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{ color: "var(--cv-accent-text)", fontWeight: "600", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Why Code Vita</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
              Everything you need to <span className="gradient-text">level up</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {features.map((f) => (
              <div key={f.title} className="glass-card glass-card-hover" style={{ padding: "28px" }}>
                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ color: "var(--cv-text-2)", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
              Trusted by <span className="gradient-text">top engineers</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card glass-card-hover" style={{ padding: "28px" }}>
                <div style={{ fontSize: "1.4rem", marginBottom: "16px" }}>⭐⭐⭐⭐⭐</div>
                <p style={{ color: "var(--cv-text-soft)", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: "20px", fontStyle: "italic" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{t.name}</div>
                    <div style={{ color: "var(--cv-accent-text)", fontSize: "0.8rem" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section id="faq" style={{ padding: "100px 24px", background: "var(--cv-section-alt)", borderTop: "1px solid rgba(139,92,246,0.08)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ color: "var(--cv-accent-text)", fontWeight: "600", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>FAQ</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
              Frequently asked <span className="gradient-text">questions</span>
            </h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section
        style={{
          padding: "100px 24px",
          textAlign: "center",
          position: "relative",
          borderTop: "1px solid rgba(139,92,246,0.1)",
        }}
      >
        <div className="orb orb-purple" style={{ width: "600px", height: "600px", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div className="content-wrapper">
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Ready to <span className="gradient-text">start coding?</span>
          </h2>
          <p style={{ color: "var(--cv-text-2)", fontSize: "1.1rem", marginBottom: "40px", maxWidth: "480px", margin: "0 auto 40px" }}>
            Join 180,000+ developers who are leveling up their skills on Code Vita every day.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" className="btn-primary-cv" style={{ fontSize: "1.05rem", padding: "15px 36px" }}>
              Create Free Account →
            </Link>
            <Link to="/login" className="btn-outline-cv" style={{ fontSize: "1.05rem", padding: "15px 36px" }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: "40px 24px", borderTop: "1px solid rgba(139,92,246,0.1)", background: "var(--cv-footer-bg)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: "700", color: "white" }}>
              {"</>"}
            </div>
            <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>Code Vita</span>
          </div>
          <p style={{ color: "var(--cv-text-muted)", fontSize: "0.85rem" }}>
            © {CURRENT_YEAR} Code Vita. Built with ❤️ for developers.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="footer-link">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
