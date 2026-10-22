import { Link } from "react-router";

export default function Logo({ className = "", id }) {
  return (
    <Link to="/" id={id} className={`cv-logo ${className}`.trim()} aria-label="Code Vita home">
      <span className="cv-logo-mark" aria-hidden="true">{"</>"}</span>
      <span className="cv-logo-text">Code Vita</span>
    </Link>
  );
}
