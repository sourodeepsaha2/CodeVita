import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import "./CommandPalette.css";

const COMMANDS = [
  { label: "Go to home", detail: "Open the Code Vita homepage", href: "/", keywords: "home start" },
  { label: "Browse FAQs", detail: "Jump to frequently asked questions", href: "/#faq", keywords: "help questions faq" },
  { label: "Create an account", detail: "Sign up for Code Vita", href: "/signup", keywords: "register signup join" },
  { label: "Log in", detail: "Continue to your account", href: "/login", keywords: "signin sign in" },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const results = COMMANDS.filter((command) =>
    `${command.label} ${command.detail} ${command.keywords}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!open) previousFocusRef.current = document.activeElement;
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    };
    const onOpen = () => {
      previousFocusRef.current = document.activeElement;
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("cv:open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("cv:open-command-palette", onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      previousFocusRef.current?.focus?.();
    }
  }, [open]);

  const handleInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      navigate(results[activeIndex].href);
      setOpen(false);
    }
  };

  const trapTabFocus = (event) => {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll("input, a[href], button:not([disabled])");
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div className="command-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section ref={dialogRef} className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title" onKeyDown={trapTabFocus}>
        <h2 id="command-title" className="sr-only">Quick navigation</h2>
        <label className="command-search-wrap">
          <span className="command-search-icon" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="command-search"
            type="search"
            placeholder="Where would you like to go?"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
            onKeyDown={handleInputKeyDown}
            aria-label="Search pages"
          />
          <kbd className="command-escape">ESC</kbd>
        </label>
        <p className="command-section-label">QUICK NAVIGATION</p>
        <div className="command-results" role="listbox" aria-label="Pages">
          {results.length ? results.map((command, index) => (
            <Link
              key={command.href}
              to={command.href}
              className={`command-result${index === activeIndex ? " is-active" : ""}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setOpen(false)}
            >
              <span className="command-result-mark" aria-hidden="true">↗</span>
              <span><strong>{command.label}</strong><small>{command.detail}</small></span>
              <span className="command-result-enter" aria-hidden="true">↵</span>
            </Link>
          )) : <p className="command-empty">No pages match “{query}”.</p>}
        </div>
        <footer className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span></footer>
      </section>
    </div>
  );
}
