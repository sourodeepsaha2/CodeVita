import { Link } from "react-router";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="not-found-orb not-found-orb-one" aria-hidden="true" />
      <div className="not-found-orb not-found-orb-two" aria-hidden="true" />
      <section className="not-found-card glass-card" aria-labelledby="not-found-title">
        <p className="not-found-code">404</p>
        <h1 id="not-found-title">This page wandered off</h1>
        <p className="not-found-copy">
          That address doesn’t lead to a Code Vita page. Head back and keep solving.
        </p>
        <Link className="btn-primary-cv" to="/">Back to home</Link>
      </section>
    </main>
  );
}
