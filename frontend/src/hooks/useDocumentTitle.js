import { useEffect } from "react";

const DEFAULT_TITLE = "Code Vita – Master DSA & Competitive Programming";

/** Sets the browser tab title, e.g. "Login | Code Vita". */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Code Vita` : DEFAULT_TITLE;
  }, [title]);
}
