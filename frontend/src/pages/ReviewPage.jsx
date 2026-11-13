import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { createReflection, loadReflections, clearReflections, getReviewIntervalDays, createReflectionBackup, parseReflectionBackup, SNOOZE_OPTIONS } from "../lib/reflectionJournal";
import { listReflections, createRemoteReflection, importRemoteReflections, updateRemoteReflection, reviewRemoteReflection, snoozeRemoteReflection, deleteRemoteReflection } from "../lib/reflectionApi";
import "./ReviewPage.css";

export default function ReviewPage() {
  useDocumentTitle("Reflection Journal");
  const [reflections, setReflections] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [journalError, setJournalError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [queueFilter, setQueueFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [backupMessage, setBackupMessage] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [now, setNow] = useState(() => new Date());
  const backupInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let entries = await listReflections();
        if (active) setReflections(entries);

        const localEntries = loadReflections();
        const knownClientIds = new Set(entries.map((entry) => entry.clientId).filter(Boolean));
        const unclaimedEntries = localEntries.filter((entry) => !knownClientIds.has(entry.clientId || entry.id));
        if (unclaimedEntries.length) {
          try {
            await importRemoteReflections(unclaimedEntries);
          } catch (error) {
            if (active) setBackupMessage(`Could not move your local journal into this account: ${error.message}`);
            return;
          }
          setBackupMessage(clearReflections()
            ? `Moved ${unclaimedEntries.length} local ${unclaimedEntries.length === 1 ? "reflection" : "reflections"} into your account journal.`
            : "Copied your local journal into your account, but this browser couldn’t clear its old copy.");
          entries = await listReflections();
          if (active) setReflections(entries);
        }
      } catch (error) {
        if (active) setJournalError(error.message || "Could not load your account journal.");
      } finally {
        if (active) setPageLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
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

  const markReviewed = (id) => {
    const next = loadReflections().map((reflection) =>
      reflection.id === id ? scheduleReflectionReview(reflection, reflection.confidence) : reflection
    );
    if (!saveReflections(next)) {
      setStorageError(true);
      return;
    }
    setStorageError(false);
    setReflections(next);
  };

  const snoozeReview = (id, days) => {
    const current = loadReflections();
    const reflection = current.find((entry) => entry.id === id);
    if (!reflection) return;
    const updated = snoozeReflectionReview(reflection, days);
    const next = current.map((entry) => entry.id === id ? updated : entry);
    if (!saveReflections(next)) {
      setStorageError(true);
      setReviewMessage("Your browser couldn’t save this snooze. Check available storage and try again.");
      return;
    }
    setStorageError(false);
    setReflections(next);
    setReviewMessage(`${reflection.problem} snoozed until ${formatReviewDate(updated.nextReviewAt)}.`);
  };

  const removeReflection = (id) => {
    const next = loadReflections().filter((reflection) => reflection.id !== id);
    if (!saveReflections(next)) {
      setStorageError(true);
      return;
    }
    setStorageError(false);
    setReflections(next);
  };

  const toggleFavorite = (id) => {
    const current = loadReflections();
    const reflection = current.find((entry) => entry.id === id);
    if (!reflection) return;
    const next = current.map((entry) => entry.id === id
      ? setReflectionFavorite(entry, !entry.isFavorite)
      : entry
    );
    if (!saveReflections(next)) {
      setStorageError(true);
      setFavoriteMessage("Your browser couldn’t save this favorite. Check available storage and try again.");
      return;
    }
    setStorageError(false);
    setReflections(next);
    setFavoriteMessage(`${reflection.problem} ${reflection.isFavorite ? "removed from" : "added to"} saved reflections.`);
  };

  const saveEditedReflection = (id, values) => {
    const next = loadReflections().map((reflection) =>
      reflection.id === id ? updateReflection(reflection, values) : reflection
    );
    if (!saveReflections(next)) {
      setStorageError(true);
      return false;
    }
    setStorageError(false);
    setReflections(next);
    setEditingId(null);
    return true;
  };

  const exportBackup = () => {
    const blob = new Blob([createReflectionBackup(loadReflections())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `code-vita-journal-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setBackupMessage("Journal backup downloaded.");
  };

  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const imported = parseReflectionBackup(await file.text());
      const current = loadReflections();
      const existingIds = new Set(current.map((reflection) => reflection.id));
      const additions = imported.filter((reflection) => {
        if (existingIds.has(reflection.id)) return false;
        existingIds.add(reflection.id);
        return true;
      });
      const next = [...current, ...additions];
      if (!saveReflections(next)) {
        setBackupMessage("Your browser couldn’t save the imported journal.");
        return;
      }
      setStorageError(false);
      setReflections(next);
      setBackupMessage(additions.length
        ? `Imported ${additions.length} ${additions.length === 1 ? "entry" : "entries"}. Existing entries were kept.`
        : "This backup has no new entries. Your journal is unchanged.");
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : "Couldn’t import this journal backup.");
    }
  };

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleReflections = reflections
    .filter((reflection) => !normalizedQuery ||
      [reflection.problem, reflection.approach, reflection.blocker]
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery))
    )
    .filter((reflection) => {
      if (queueFilter === "all") return true;
      if (queueFilter === "saved") return Boolean(reflection.isFavorite);
      const due = new Date(reflection.nextReviewAt) <= now;
      return queueFilter === "due" ? due : !due;
    })
    .sort((a, b) => new Date(a.nextReviewAt) - new Date(b.nextReviewAt));
  const dueCount = reflections.filter((reflection) => new Date(reflection.nextReviewAt) <= now).length;
  const completedReviews = reflections.reduce((total, reflection) => total + (Number(reflection.reviewCount) || 0), 0);

  return (
    <main className="review-page">
      <header className="review-header">
        <p className="review-eyebrow">LEARN FROM EVERY ATTEMPT</p>
        <h1>Your reflection journal</h1>
        <p>Save the thinking behind a solution and give yourself a date to revisit it.</p>
      </header>
      <section className="journal-backup" aria-label="Journal backup">
        <div>
          <h2>Keep a copy of your journal</h2>
          <p>Export your entries or restore them from a Code Vita backup.</p>
        </div>
        <div className="journal-backup-actions">
          <button type="button" className="btn-outline-cv" onClick={exportBackup}>Download backup</button>
          <button type="button" className="btn-outline-cv" onClick={() => backupInputRef.current?.click()}>Import backup</button>
          <input ref={backupInputRef} type="file" accept=".json,application/json" onChange={importBackup} aria-label="Choose a Code Vita journal backup" hidden />
        </div>
        {backupMessage && <p className="journal-backup-message" role="status">{backupMessage}</p>}
      </section>
      <section className="review-summary-grid" aria-label="Journal progress">
        <div className="review-summary-card"><span>IN YOUR JOURNAL</span><strong>{reflections.length}</strong><small>{reflections.length === 1 ? "problem" : "problems"} captured</small></div>
        <div className={`review-summary-card${dueCount ? " has-due" : ""}`}><span>READY TO REVISIT</span><strong>{dueCount}</strong><small>{dueCount === 1 ? "review is due" : "reviews are due"}</small></div>
        <div className="review-summary-card"><span>REVIEWS COMPLETED</span><strong>{completedReviews}</strong><small>revisits logged</small></div>
      </section>
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
            <h2 id="review-list-title">Review queue <span>{normalizedQuery ? `${visibleReflections.length}/${reflections.length}` : reflections.length}</span></h2>
          </div>
          <div className="review-list-tools">
            <label className="review-search">
              <span className="sr-only">Search journal entries</span>
              <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search problems and notes" />
            </label>
            <div className="review-filters" role="group" aria-label="Filter review queue">
              {[{ id: "all", label: "All" }, { id: "due", label: "Due" }, { id: "upcoming", label: "Upcoming" }, { id: "saved", label: "Saved" }].map((filter) => (
                <button key={filter.id} type="button" className={queueFilter === filter.id ? "is-active" : ""} aria-pressed={queueFilter === filter.id} onClick={() => setQueueFilter(filter.id)}>
                  {filter.label}{filter.id === "due" && <span>{dueCount}</span>}{filter.id === "saved" && <span>{reflections.filter((item) => item.isFavorite).length}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        {favoriteMessage && <p className="review-favorite-status" role="status">{favoriteMessage}</p>}
        {reviewMessage && <p className="review-snooze-status" role="status">{reviewMessage}</p>}
        {reflections.length === 0 ? (
          <div className="review-empty glass-card">
            <span aria-hidden="true">📓</span>
            <h3>Your journal is ready</h3>
            <p>Save a reflection from a problem attempt. Your review queue will bring it back when it’s due.</p>
          </div>
        ) : visibleReflections.length ? (
          <div className="reflection-list">
            {visibleReflections.map((reflection) => {
              const due = new Date(reflection.nextReviewAt) <= now;
              return (
                <article className={`reflection-entry glass-card${due ? " is-due" : ""}`} key={reflection.id}>
                  {editingId === reflection.id ? (
                    <ReflectionEditor
                      reflection={reflection}
                      onCancel={() => setEditingId(null)}
                      onSave={(values) => saveEditedReflection(reflection.id, values)}
                    />
                  ) : (
                    <>
                      <div className="reflection-entry-topline">
                        <h3>{reflection.problem}</h3>
                        <div className="reflection-entry-actions">
                          <span className={`reflection-due-pill${due ? " is-due" : ""}`}>{due ? "Due to review" : `Review ${formatReviewDate(reflection.nextReviewAt)}`}</span>
                          <button
                            type="button"
                            className={`reflection-favorite-button${reflection.isFavorite ? " is-favorite" : ""}`}
                            aria-pressed={Boolean(reflection.isFavorite)}
                            aria-label={`${reflection.isFavorite ? "Remove" : "Add"} ${reflection.problem} ${reflection.isFavorite ? "from" : "to"} saved entries`}
                            title={reflection.isFavorite ? "Remove from saved entries" : "Save this reflection"}
                            onClick={() => toggleFavorite(reflection.id)}
                          >
                            <span aria-hidden="true">{reflection.isFavorite ? "★" : "☆"}</span>
                          </button>
                          <button type="button" className="reflection-edit-button" onClick={() => setEditingId(reflection.id)} aria-label={`Edit reflection for ${reflection.problem}`}>Edit</button>
                          <button type="button" className="reflection-delete-button" onClick={() => removeReflection(reflection.id)} aria-label={`Delete reflection for ${reflection.problem}`} title="Delete reflection">×</button>
                        </div>
                      </div>
                      <div className="reflection-entry-notes">
                        <div><span>APPROACH</span><p>{reflection.approach}</p></div>
                        {reflection.blocker && <div><span>STUCK ON</span><p>{reflection.blocker}</p></div>}
                      </div>
                      <div className="reflection-entry-meta">
                        <span>Confidence <strong>{reflection.confidence}/5</strong></span>
                        <span>{reflection.reviewCount ? `Reviewed ${reflection.reviewCount} ${reflection.reviewCount === 1 ? "time" : "times"}` : "First review"}</span>
                        {reflection.problemId && <Link className="review-retry-button" to={`/problems/${reflection.problemId}`}>Retry problem <span aria-hidden="true">→</span></Link>}
                        {due && (
                          <details className="review-snooze">
                            <summary>Snooze</summary>
                            <div className="review-snooze-menu" role="group" aria-label={`Snooze ${reflection.problem}`}>
                              <p>This moves the reminder without counting a review.</p>
                              {SNOOZE_OPTIONS.map((option) => (
                                <button key={option.days} type="button" onClick={() => snoozeReview(reflection.id, option.days)}>
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </details>
                        )}
                        <button type="button" className="review-done-button" onClick={() => markReviewed(reflection.id)}>
                          I reviewed this <span aria-hidden="true">→</span>
                        </button>
                      </div>
                      <p className="review-interval-hint">After reviewing, it returns in {getReviewIntervalDays(reflection.confidence)} {getReviewIntervalDays(reflection.confidence) === 1 ? "day" : "days"} based on your confidence.</p>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="review-filter-empty glass-card">
            {normalizedQuery
              ? `No journal entries match “${searchQuery.trim()}” in this view.`
              : queueFilter === "saved"
                ? "No saved reflections yet. Use the star on a reflection to keep it here."
                : `No ${queueFilter === "due" ? "reviews are due" : "upcoming reviews"} in this view.`}
          </div>
        )}
      </section>
    </main>
  );
}

function formatReviewDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function ReflectionEditor({ reflection, onSave, onCancel }) {
  const [values, setValues] = useState({
    problem: reflection.problem,
    approach: reflection.approach,
    blocker: reflection.blocker,
  });
  const [errors, setErrors] = useState({});

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: "", save: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.problem.trim()) nextErrors.problem = "Add the problem name.";
    if (!values.approach.trim()) nextErrors.approach = "Describe the approach you tried.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!onSave(values)) setErrors((current) => ({ ...current, save: "Couldn’t save changes. Check available browser storage and try again." }));
  };

  return (
    <form className="reflection-editor" onSubmit={handleSubmit} noValidate>
      <label className="reflection-field">
        <span>Problem name <b aria-hidden="true">*</b></span>
        <input value={values.problem} onChange={update("problem")} aria-invalid={Boolean(errors.problem)} />
        {errors.problem && <small role="alert">{errors.problem}</small>}
      </label>
      <label className="reflection-field">
        <span>Approach <b aria-hidden="true">*</b></span>
        <textarea value={values.approach} onChange={update("approach")} rows="3" aria-invalid={Boolean(errors.approach)} />
        {errors.approach && <small role="alert">{errors.approach}</small>}
      </label>
      <label className="reflection-field">
        <span>Where did you get stuck? <em>Optional</em></span>
        <textarea value={values.blocker} onChange={update("blocker")} rows="2" />
      </label>
      {errors.save && <p className="reflection-storage-error" role="alert">{errors.save}</p>}
      <div className="reflection-editor-actions">
        <button type="button" className="btn-outline-cv" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary-cv">Save changes</button>
      </div>
    </form>
  );
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
