import { useEffect, useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { loadReflections } from "../lib/reflectionJournal";
import "./ReviewPage.css";

export default function ReviewPage() {
  useDocumentTitle("Reflection Journal");
  const [reflections, setReflections] = useState([]);

  useEffect(() => {
    setReflections(loadReflections());
  }, []);

  return (
    <main className="review-page">
      <header className="review-header">
        <p className="review-eyebrow">LEARN FROM EVERY ATTEMPT</p>
        <h1>Your reflection journal</h1>
        <p>Save the thinking behind a solution and give yourself a date to revisit it.</p>
      </header>
      <section className="reflection-form-card glass-card" aria-labelledby="reflection-form-title">
        <div className="review-card-heading">
          <span className="review-heading-icon" aria-hidden="true">✎</span>
          <div>
            <h2 id="reflection-form-title">Capture a reflection</h2>
            <p>Write down what you learned while it’s fresh.</p>
          </div>
        </div>
        <ReflectionForm onAdd={(reflection) => setReflections((current) => [reflection, ...current])} />
      </section>
      <section className="reflection-list-section" aria-labelledby="review-list-title">
        <div className="review-list-heading">
          <div>
            <p className="review-eyebrow">YOUR PRACTICE</p>
            <h2 id="review-list-title">Review queue <span>{reflections.length}</span></h2>
          </div>
        </div>
        {reflections.length === 0 ? (
          <div className="review-empty glass-card">
            <span aria-hidden="true">📓</span>
            <h3>Your journal is ready</h3>
            <p>Add a reflection after solving a problem. We’ll remind you when it’s time to revisit it.</p>
          </div>
        ) : (
          <div className="reflection-list" />
        )}
      </section>
    </main>
  );
}

function ReflectionForm({ onAdd }) {
  return <form className="reflection-form" onSubmit={(event) => event.preventDefault()}>
    <p className="reflection-form-placeholder">Reflection form coming together…</p>
  </form>;
}
