import { Link, NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Problems", href: "/problems" },
  { label: "Contest", href: "/contest" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Discuss", href: "/discuss" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu on route change.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <nav className={`navbar-cv${scrolled ? " is-scrolled" : ""}`} aria-label="Main">
        <div className="navbar-inner">
          <Logo id="nav-logo" />

          {/* Desktop links (NavLink adds the "active" class automatically) */}
          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLink to={link.href} className="nav-link">
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="nav-actions">
            <ThemeToggle />
            <Link to="/login" id="nav-login" className="btn-outline-cv btn-sm">
              Log In
            </Link>
            <Link to="/signup" id="nav-signup" className="btn-primary-cv btn-sm">
              Sign Up Free
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="nav-mobile-controls">
            <ThemeToggle id="btn-theme-toggle-mobile" />
            <button
              type="button"
              id="btn-mobile-menu"
              className={`hamburger${mobileOpen ? " is-open" : ""}`}
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="mobile-menu">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} to={link.href} className="nav-link">
              {link.label}
            </NavLink>
          ))}
          <hr className="mobile-menu-divider" />
          <Link to="/login" id="nav-login-mobile" className="btn-outline-cv btn-block">
            Log In
          </Link>
          <Link to="/signup" id="nav-signup-mobile" className="btn-primary-cv btn-block">
            Sign Up Free
          </Link>
        </div>
      )}
    </>
  );
}
