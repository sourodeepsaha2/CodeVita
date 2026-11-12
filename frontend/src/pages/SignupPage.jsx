import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { apiRequest } from "../lib/api";

/* ─── Password Strength Meter ─── */
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Symbol", pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const levels = [
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f97316" },
    { label: "Good", color: "#f59e0b" },
    { label: "Strong", color: "#10b981" },
  ];
  const level = levels[Math.max(score - 1, 0)];

  if (!password) return null;

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="strength-bar"
            style={{
              flex: 1,
              background: i < score ? level.color : "var(--cv-surface-2)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.78rem", color: level.color, fontWeight: "600" }}>
          {level.label}
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          {checks.map((c) => (
            <span
              key={c.label}
              style={{
                fontSize: "0.72rem",
                color: c.pass ? "#10b981" : "var(--cv-text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                transition: "color 0.3s",
              }}
            >
              {c.pass ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusField, setFocusField] = useState(null);
  const [step, setStep] = useState(1); // 1 = form, 2 = success

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "", form: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required.";
    else if (form.username.length < 3) errs.username = "Username must be at least 3 characters.";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = "Only letters, numbers, underscores allowed.";

    if (!form.email) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";

    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";

    if (!form.confirm) errs.confirm = "Please confirm your password.";
    else if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/user/register", {
        method: "POST",
        body: JSON.stringify({
          username: form.username.trim(),
          emailId: form.email.trim(),
          password: form.password,
        }),
      });
      setStep(2);
    } catch (requestError) {
      setErrors((current) => ({ ...current, form: requestError.message || "Could not create your account." }));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    borderColor: errors[field]
      ? "rgba(239,68,68,0.6)"
      : focusField === field
      ? "rgba(109,145,245,0.6)"
      : undefined,
    boxShadow: errors[field]
      ? "0 0 0 3px rgba(239,68,68,0.1)"
      : undefined,
  });

  /* ─── Success State ─── */
  if (step === 2) {
    return (
      <div
        className="page-wrapper"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px" }}
      >
        <div className="orb orb-purple" style={{ width: "500px", height: "500px", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        <div className="content-wrapper animate-fade-in-up glass-card" style={{ maxWidth: "440px", width: "100%", padding: "60px 40px", textAlign: "center" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))",
              border: "2px solid rgba(16,185,129,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              margin: "0 auto 24px",
              boxShadow: "0 0 30px rgba(16,185,129,0.3)",
            }}
          >
            ✅
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "12px", fontWeight: "800" }}>Welcome aboard!</h2>
          <p style={{ color: "#94a3b8", marginBottom: "8px" }}>
            You’re signed in as{" "}
            <span style={{ color: "#9bb4ff", fontWeight: "600" }}>@{form.username}</span>{" "}
          </p>
          <p style={{ color: "var(--cv-text-muted)", fontSize: "0.88rem", marginBottom: "32px" }}>
            Your account is ready. Start by capturing a reflection or explore the practice area.
          </p>
          <button
            className="btn-primary-cv"
            style={{ width: "100%", fontSize: "1rem", padding: "14px" }}
            onClick={() => navigate("/review")}
            id="btn-open-journal"
          >
            Open your journal →
          </button>
        </div>
      </div>
    );
  }

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
      {/* Background */}
      <div className="orb orb-purple" style={{ width: "700px", height: "700px", top: "-200px", left: "-200px" }} />
      <div className="orb orb-cyan" style={{ width: "400px", height: "400px", bottom: "-100px", right: "-100px" }} />
      <div className="bg-grid" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

      <div
        className="content-wrapper animate-fade-in-up"
        style={{ width: "100%", maxWidth: "480px" }}
      >
        <div className="glass-card" style={{ padding: "40px 36px", position: "relative", overflow: "hidden" }}>
          {/* Gradient line */}
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

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Link to="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
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
              <span style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9bb4ff" }}>
                Code Vita
              </span>
            </Link>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "20px", marginBottom: "8px" }}>
              Create your account
            </h1>
            <p style={{ color: "var(--cv-text-muted)", fontSize: "0.9rem" }}>
              Create an account to keep your practice in one place.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div role="alert" style={{ padding: "10px 14px", marginBottom: "16px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#f87171", background: "rgba(239,68,68,0.1)", fontSize: "0.87rem" }}>
                {errors.form}
              </div>
            )}
            {/* Username */}
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="signup-username" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "#cbd5e1" }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--cv-text-muted)", fontSize: "0.9rem", pointerEvents: "none" }}>
                  @
                </span>
                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="coolcoder"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocusField("username")}
                  onBlur={() => setFocusField(null)}
                  className="input-cv"
                  style={{ paddingLeft: "30px", ...inputStyle("username") }}
                />
              </div>
              {errors.username && (
                <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "6px" }}>⚠ {errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="signup-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "#cbd5e1" }}>
                Email Address
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusField("email")}
                onBlur={() => setFocusField(null)}
                className="input-cv"
                style={inputStyle("email")}
              />
              {errors.email && (
                <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "6px" }}>⚠ {errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="signup-password" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "#cbd5e1" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField(null)}
                  className="input-cv"
                  style={{ paddingRight: "48px", ...inputStyle("password") }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--cv-text-muted)", padding: "4px", transition: "color 0.2s" }}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {errors.password && (
                <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "6px" }}>⚠ {errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="signup-confirm" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "#cbd5e1" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-confirm"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={handleChange}
                  onFocus={() => setFocusField("confirm")}
                  onBlur={() => setFocusField(null)}
                  className="input-cv"
                  style={{ paddingRight: "48px", ...inputStyle("confirm") }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--cv-text-muted)", padding: "4px" }}
                  aria-label={showConfirm ? "Hide" : "Show"}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              {form.confirm && form.password === form.confirm && (
                <p style={{ color: "#10b981", fontSize: "0.78rem", marginTop: "6px" }}>✓ Passwords match</p>
              )}
              {errors.confirm && (
                <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "6px" }}>⚠ {errors.confirm}</p>
              )}
            </div>

            {/* Terms */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    setErrors((prev) => ({ ...prev, agreed: "" }));
                  }}
                  style={{ width: "16px", height: "16px", marginTop: "2px", accentColor: "#6d91f5", flexShrink: 0, cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.84rem", color: "#94a3b8", lineHeight: 1.5 }}>
                  I agree to Code Vita's{" "}
                  <a href="#" style={{ color: "#9bb4ff", textDecoration: "none" }}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" style={{ color: "#9bb4ff", textDecoration: "none" }}>Privacy Policy</a>
                </span>
              </label>
              {errors.agreed && (
                <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "6px" }}>⚠ {errors.agreed}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="btn-signup-submit"
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
                  Creating account…
                </span>
              ) : (
                "Create Free Account →"
              )}
            </button>
          </form>

          {/* Login link */}
          <p style={{ textAlign: "center", marginTop: "24px", color: "#94a3b8", fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "#9bb4ff", fontWeight: "600", textDecoration: "none" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
