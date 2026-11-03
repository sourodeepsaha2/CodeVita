import { useEffect, useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { createReflection, loadReflections, saveReflections } from "../lib/reflectionJournal";
import "./ReviewPage.css";

export default function ReviewPage() {
  useDocumentTitle("Reflection Journal");
  const [reflections, setReflections] = useState([]);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    setReflections(loadReflections());
  }, []);

  const addReflection = (reflection) => {
    const next = [reflection, ...loadReflections()];
    if (!saveReflections(next)) {
      setStorageError(true);
      return false;
    }
    setStorageError(false);
    setReflections(next);
    return true;
  };

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
        <ReflectionForm onAdd={addReflection} />
        {storageError && <p className="reflection-storage-error" role="alert">Your browser couldn’t save this reflection. Check available storage and try again.</p>}
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
          <div className="reflection-list">
            {[...reflections].sort((a, b) => new Date(a.nextReviewAt) - new Date(b.nextReviewAt)).map((reflection) => {
              const due = new Date(reflection.nextReviewAt) <= new Date();
              return (
                <article className={`reflection-entry glass-card${due ? " is-due" : ""}`} key={reflection.id}>
                  <div className="reflection-entry-topline">
                    <h3>{reflection.problem}</h3>
                    <span className={`reflection-due-pill${due ? " is-due" : ""}`}>{due ? "Due to review" : `Review ${formatReviewDate(reflection.nextReviewAt)}`}</span>
                  </div>
                  <div className="reflection-entry-notes">
                    <div><span>APPROACH</span><p>{reflection.approach}</p></div>
                    {reflection.blocker && <div><span>STUCK ON</span><p>{reflection.blocker}</p></div>}
                  </div>
                  <div className="reflection-entry-meta">
                    <span>Confidence <strong>{reflection.confidence}/5</strong></span>
                    <span>{reflection.reviewCount ? `Reviewed ${reflection.reviewCount} ${reflection.reviewCount === 1 ? "time" : "times"}` : "First review"}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function formatReviewDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function ReflectionForm({ onAdd }) {
  const [values, setValues] = useState({ problem: "", approach: "", blocker: "", confidence: 3 });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.problem.trim()) nextErrors.problem = "Add the problem name.";
    if (!values.approach.trim()) nextErrors.approach = "Describe the approach you tried.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (onAdd(createReflection(values))) {
      setValues({ problem: "", approach: "", blocker: "", confidence: 3 });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
    }
  };

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  return (
    <form className="reflection-form" onSubmit={handleSubmit} noValidate>
      <label className="reflection-field">
        <span>Problem name <b aria-hidden="true">*</b></span>
        <input value={values.problem} onChange={update("problem")} placeholder="e.g. Two Sum" aria-invalid={Boolean(errors.problem)} />
        {errors.problem && <small role="alert">{errors.problem}</small>}
      </label>
      <label className="reflection-field">
        <span>What approach did you try? <b aria-hidden="true">*</b></span>
        <textarea value={values.approach} onChange={update("approach")} rows="3" placeholder="Describe the key idea, data structure, or steps you used…" aria-invalid={Boolean(errors.approach)} />
        {errors.approach && <small role="alert">{errors.approach}</small>}
      </label>
      <label className="reflection-field">
        <span>Where did you get stuck? <em>Optional</em></span>
        <textarea value={values.blocker} onChange={update("blocker")} rows="2" placeholder="A bug, edge case, or part you want to understand better…" />
      </label>
      <label className="reflection-field reflection-confidence">
        <span>How confident are you explaining this solution?</span>
        <div className="confidence-control">
          <input type="range" min="1" max="5" value={values.confidence} onChange={update("confidence")} aria-valuetext={`${values.confidence} out of 5`} />
          <strong>{values.confidence}/5</strong>
        </div>
        <small>Lower confidence means we’ll bring it back sooner.</small>
      </label>
      <div className="reflection-submit-row">
        <p className="reflection-save-message" role="status">{saved ? "Saved to your review queue." : ""}</p>
        <button type="submit" className="btn-primary-cv">Save reflection <span aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
