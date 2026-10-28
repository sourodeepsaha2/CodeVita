import { Link, useNavigate } from "react-router";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const REMEMBER_KEY = "codevita:rememberedEmail";
  const [form, setForm] = useState(() => ({
    email: localStorage.getItem(REMEMBER_KEY) || "",
    password: "",
  }));
  const [remember, setRemember] = useState(() => !!localStorage.getItem(REMEMBER_KEY));
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusField, setFocusField] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (remember) localStorage.setItem(REMEMBER_KEY, form.email);
    else localStorage.removeItem(REMEMBER_KEY);
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div
      className="page-wrapper"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px 60px",
      }}
    >
      {/* Background Orbs */}
      <div className="orb orb-purple" style={{ width: "600px", height: "600px", top: "-100px", right: "-100px" }} />
      <div className="orb orb-cyan" style={{ width: "400px", height: "400px", bottom: "-50px", left: "-100px" }} />
      <div className="bg-grid" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

      <div
        className="content-wrapper animate-fade-in-up"
        style={{ width: "100%", maxWidth: "440px" }}
      >
        {/* Card */}
        <div
          className="glass-card"
          style={{ padding: "40px 36px", position: "relative", overflow: "hidden" }}
        >
          {/* Top gradient line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, #8b5cf6, #06b6d4, #f59e0b)",
            }}
          />

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Link to="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: "700",
                  color: "white",
                  boxShadow: "0 0 30px rgba(139,92,246,0.4)",
                  marginBottom: "4px",
                }}
                className="animate-pulse-glow"
              >
                {"</>"}
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#a78bfa",
                }}
              >
                Code Vita
              </span>
            </Link>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "20px", marginBottom: "8px" }}>
              Welcome back
            </h1>
            <p style={{ color: "var(--cv-text-muted)", fontSize: "0.92rem" }}>
              Sign in to continue your coding journey
            </p>
          </div>

          {/* Social Auth */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            <button
              className="social-btn"
              id="btn-google-login"
              onClick={() => {}}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
            <button
              className="social-btn"
              id="btn-github-login"
              onClick={() => {}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="divider-cv" style={{ marginBottom: "24px" }}>or sign in with email</div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  color: "#f87171",
                  fontSize: "0.87rem",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="login-email"
                style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "#cbd5e1" }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusField("email")}
                onBlur={() => setFocusField(null)}
                className="input-cv"
                style={{
                  borderColor: focusField === "email" ? "rgba(139,92,246,0.6)" : undefined,
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label
                  htmlFor="login-password"
                  style={{ fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1" }}
                >
                  Password
                </label>
                <a
                  href="#"
                  style={{ fontSize: "0.82rem", color: "#a78bfa", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#c4b5fd"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#a78bfa"}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField(null)}
                  className="input-cv"
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    color: "var(--cv-text-muted)",
                    padding: "4px",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--cv-text-muted)"}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", marginTop: "16px" }}>
              <input
                id="login-remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#8b5cf6",
                  cursor: "pointer",
                }}
              />
              <label htmlFor="login-remember" style={{ fontSize: "0.85rem", color: "#94a3b8", cursor: "pointer" }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              className="btn-primary-cv"
              disabled={loading}
              style={{
                width: "100%",
                fontSize: "1rem",
                padding: "14px",
                opacity: loading ? 0.8 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p style={{ textAlign: "center", marginTop: "24px", color: "#94a3b8", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{ color: "#a78bfa", fontWeight: "600", textDecoration: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#c4b5fd"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#a78bfa"}
            >
              Sign up free
            </Link>
          </p>
        </div>

        {/* Bottom note */}
        <p style={{ textAlign: "center", marginTop: "20px", color: "var(--cv-text-muted)", fontSize: "0.78rem" }}>
          By signing in, you agree to our{" "}
          <a href="#" style={{ color: "#a78bfa", textDecoration: "none" }}>Terms of Service</a>
          {" "}and{" "}
          <a href="#" style={{ color: "#a78bfa", textDecoration: "none" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
