import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { createReflection, loadReflections, saveReflections } from "../lib/reflectionJournal";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function ProblemPage() {
  const { id } = useParams();
  return <ProblemPractice key={id} id={id} />;
}

function ProblemPractice({ id }) {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [showReflection, setShowReflection] = useState(false);
  const [approach, setApproach] = useState("");
  const [blocker, setBlocker] = useState("");
  const [confidence, setConfidence] = useState("2");
  const [reflectionMessage, setReflectionMessage] = useState("");
  useDocumentTitle(problem?.title || "Problem");

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest(`/problem/problemById/${id}`),
      apiRequest(`/problem/submittedProblem/${id}`).catch(() => ({ submissions: [] })),
    ])
      .then(([{ problem: item }, history]) => {
        if (!active) return;
        setProblem(item);
        setSubmissionHistory(history.submissions || []);
        const starter = item.startCode?.find((entry) => entry.language?.toLowerCase() === "javascript") || item.startCode?.[0];
        if (starter) setLanguage(starter.language.toLowerCase());
        setCode(starter?.CompleteCode || starter?.completeCode || "");
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    const starter = problem?.startCode?.find((entry) => entry.language?.toLowerCase() === nextLanguage);
    setCode(starter?.CompleteCode || starter?.completeCode || "");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);
    setReflectionMessage("");
    try {
      const { submission } = await apiRequest(`/submission/submit/${id}`, {
        method: "POST", body: JSON.stringify({ code, language }),
      });
      setResult(submission);
      const history = await apiRequest(`/problem/submittedProblem/${id}`).catch(() => null);
      if (history) setSubmissionHistory(history.submissions || []);
      if (submission.status !== "accepted") setShowReflection(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const saveAttemptReflection = (event) => {
    event.preventDefault();
    if (!approach.trim()) return;
    const reflection = createReflection({ problem: problem.title, problemId: id, approach, blocker, confidence });
    if (!saveReflections([reflection, ...loadReflections()])) {
      setReflectionMessage("Couldn’t save to this browser. Check available storage and try again.");
      return;
    }
    setShowReflection(false);
    setReflectionMessage("Reflection saved. It’s now in your review queue.");
  };

  if (loading) return <main className="catalog-page"><p className="catalog-message">Loading problem…</p></main>;
  if (!problem) return <main className="catalog-page"><div className="catalog-message" role="alert">{error || "Problem not found."}{error.includes("Authentication") && <p><Link to="/login">Sign in to open this problem</Link></p>}<p><Link to="/problems">Back to problems</Link></p></div></main>;

  return <main className="practice-page">
    <Link className="practice-back" to="/problems">← All problems</Link>
    <header className="practice-title"><div><p className="review-eyebrow">{problem.tags} · {problem.difficulty}</p><h1>{problem.title}</h1></div></header>
    <div className="practice-layout">
      <section className="practice-statement">
        <h2>Problem</h2>
        <p className="problem-description">{problem.description}</p>
        {problem.visibleTestCases?.map((testCase, index) => <article className="sample-case" key={`${index}-${testCase.input}`}>
          <h3>Example {index + 1}</h3><pre><strong>Input: </strong>{testCase.input}{"\n"}<strong>Output: </strong>{testCase.output}</pre>
          {testCase.explanation && <p>{testCase.explanation}</p>}
        </article>)}
      </section>
      <form className="code-workspace" onSubmit={submit}>
        <div className="workspace-toolbar"><label htmlFor="language-select">Language</label>
          <select id="language-select" value={language} onChange={(event) => changeLanguage(event.target.value)}>
            {(problem.startCode?.length ? problem.startCode.map((entry) => entry.language.toLowerCase()) : ["javascript", "c++", "java"]).map((item) => <option key={item} value={item}>{item === "c++" ? "C++" : item[0].toUpperCase() + item.slice(1)}</option>)}
          </select>
          <button className="btn-primary-cv" disabled={submitting || !code.trim()}>{submitting ? "Checking…" : "Submit solution"}</button>
        </div>
        <label className="sr-only" htmlFor="source-code">Your solution</label>
        <textarea id="source-code" className="source-editor" spellCheck="false" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Write your solution here…" />
        {error && <p className="submission-error" role="alert">{error}</p>}
        {result && <section className={`submission-result result-${result.status}`} aria-live="polite">
          <strong>{result.status === "accepted" ? "Accepted" : result.status === "wrong" ? "Not quite" : "Execution error"}</strong>
          <span>{result.testCasesPassed}/{result.testCasesTotal} tests passed</span>
          {result.errorMessage && <pre>{result.errorMessage}</pre>}
        </section>}
        {submissionHistory.length > 0 && <section className="submission-history" aria-label="Saved submissions">
          <h2>Recent attempts</h2>
          {submissionHistory.slice(0, 5).map((attempt) => <article className="submission-history-row" key={attempt._id}>
            <strong className={`history-status result-${attempt.status}`}>{attempt.status}</strong>
            <span>{attempt.testCasesPassed}/{attempt.testCasesTotal} tests</span>
            <span>{attempt.language}</span>
            <time dateTime={attempt.createdAt}>{new Date(attempt.createdAt).toLocaleString()}</time>
          </article>)}
        </section>}
        {reflectionMessage && <p className="reflection-saved" role="status">{reflectionMessage} <Link to="/review">Open journal</Link></p>}
      </form>
    </div>
    {showReflection && <div className="reflection-backdrop" role="presentation"><form className="reflection-dialog" onSubmit={saveAttemptReflection} role="dialog" aria-modal="true" aria-labelledby="reflection-heading">
      <p className="review-eyebrow">MAKE THE ATTEMPT COUNT</p><h2 id="reflection-heading">What will you remember?</h2>
      <p>Your run didn’t pass all tests. Capture the idea and the snag while it’s fresh.</p>
      <label htmlFor="reflection-approach">What was your approach? <span aria-hidden="true">*</span></label>
      <textarea id="reflection-approach" required value={approach} onChange={(event) => setApproach(event.target.value)} rows={3} />
      <label htmlFor="reflection-blocker">Where did you get stuck?</label>
      <textarea id="reflection-blocker" value={blocker} onChange={(event) => setBlocker(event.target.value)} rows={2} />
      <label htmlFor="reflection-confidence">How confident are you? (1–5)</label>
      <select id="reflection-confidence" value={confidence} onChange={(event) => setConfidence(event.target.value)}>{[1, 2, 3, 4, 5].map((score) => <option key={score}>{score}</option>)}</select>
      {reflectionMessage && <p role="alert" className="submission-error">{reflectionMessage}</p>}
      <div className="reflection-actions"><button type="button" className="btn-outline-cv" onClick={() => setShowReflection(false)}>Skip for now</button><button className="btn-primary-cv">Save reflection</button></div>
    </form></div>}
  </main>;
}
