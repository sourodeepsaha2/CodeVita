import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { apiRequest } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const REMEMBER_KEY = "codevita:rememberedEmail";
  const getRememberedEmail = () => {
    try { return localStorage.getItem(REMEMBER_KEY) || ""; }
    catch { return ""; }
  };
  const [form, setForm] = useState(() => ({
    email: getRememberedEmail(),
    password: "",
  }));
  const [remember, setRemember] = useState(() => !!getRememberedEmail());
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
    setLoading(true);
    try {
      await apiRequest("/user/login", {
        method: "POST",
        body: JSON.stringify({
          emailId: form.email.trim(),
          password: form.password,
          remember,
        }),
      });
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, form.email.trim());
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        // Remembering the address is optional; a successful sign-in still proceeds.
      }
      navigate("/");
    } catch (requestError) {
      setError(requestError.message || "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
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
              background: "linear-gradient(90deg, #5278df, #9bb4ff)",
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
                  background: "linear-gradient(135deg, #6d91f5, #365fc7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: "700",
                  color: "white",
                  boxShadow: "0 8px 22px rgba(54,95,199,0.24)",
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
                  color: "#9bb4ff",
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
                  borderColor: focusField === "email" ? "rgba(109,145,245,0.6)" : undefined,
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
                  onMouseEnter={(e) => e.currentTarget.style.color = "#9bb4ff"}
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
                  accentColor: "#6d91f5",
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
              style={{ color: "#9bb4ff", fontWeight: "600", textDecoration: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#c4b5fd"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#9bb4ff"}
            >
              Sign up free
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
