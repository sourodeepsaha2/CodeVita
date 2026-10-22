import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "cv-theme";
const listeners = new Set();

// index.html applies the saved theme before React loads, so the <html>
// attribute is the single source of truth.
function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage can be unavailable (private mode) – the theme still applies */
  }
  listeners.forEach((listener) => listener());
}

/** Shared light/dark theme state. Every component using it stays in sync. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark");
  const toggleTheme = useCallback(
    () => setTheme(getTheme() === "dark" ? "light" : "dark"),
    []
  );
  return { theme, toggleTheme };
}
