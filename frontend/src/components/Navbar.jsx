import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { label: "Problems", href: "/problems" },
    { label: "Contest", href: "/contest" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Discuss", href: "/discuss" },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      <nav
        className="navbar-cv"
        style={{
          background: scrolled
            ? "rgba(10,10,15,0.95)"
            : "rgba(10,10,15,0.75)",
          boxShadow: scrolled ? "0 1px 30px rgba(139,92,246,0.1)" : "none",
          transition: "all 0.3s",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            marginRight: "48px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontFamily: "var(--font-mono)",
              fontWeight: "700",
              color: "white",
              boxShadow: "0 0 15px rgba(139,92,246,0.4)",
            }}
          >
            {"</>"}
          </div>
          <span
            style={{
              fontSize: "1.15rem",
              fontWeight: "800",
              background: "linear-gradient(135deg, #a78bfa, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Code Vita
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flex: 1,
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.2s",
                color: isActive(link.href) ? "#a78bfa" : "#94a3b8",
                background: isActive(link.href)
                  ? "rgba(139,92,246,0.12)"
                  : "transparent",
                border: isActive(link.href)
                  ? "1px solid rgba(139,92,246,0.25)"
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.href)) {
                  e.currentTarget.style.color = "#e2e8f0";
                  e.currentTarget.style.background = "rgba(139,92,246,0.06)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.href)) {
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
          className="desktop-nav"
        >
          <Link to="/login" className="btn-outline-cv" style={{ padding: "8px 20px", fontSize: "0.88rem" }}>
            Log In
          </Link>
          <Link to="/signup" className="btn-primary-cv" style={{ padding: "8px 20px", fontSize: "0.88rem" }}>
            Sign Up Free
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "none",
            flexDirection: "column",
            gap: "5px",
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                background: "#a78bfa",
                borderRadius: "2px",
                transition: "all 0.3s",
                transform:
                  mobileOpen && i === 0
                    ? "rotate(45deg) translate(5px, 5px)"
                    : mobileOpen && i === 2
                    ? "rotate(-45deg) translate(5px, -5px)"
                    : mobileOpen && i === 1
                    ? "scaleX(0)"
                    : "none",
              }}
            />
          ))}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            zIndex: 99,
            background: "rgba(10,10,15,0.98)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(139,92,246,0.15)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            animation: "fadeInUp 0.2s ease",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: "500",
                color: isActive(link.href) ? "#a78bfa" : "#94a3b8",
                background: isActive(link.href) ? "rgba(139,92,246,0.1)" : "transparent",
                display: "block",
              }}
            >
              {link.label}
            </Link>
          ))}
          <hr style={{ border: "none", borderTop: "1px solid rgba(139,92,246,0.15)", margin: "4px 0" }} />
          <Link to="/login" style={{ textDecoration: "none" }}>
            <button className="btn-outline-cv" style={{ width: "100%" }}>Log In</button>
          </Link>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <button className="btn-primary-cv" style={{ width: "100%" }}>Sign Up Free</button>
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
