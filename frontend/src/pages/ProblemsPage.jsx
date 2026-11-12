import { Link } from "react-router";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const tags = ["All topics", "Array", "String", "Linkedlist", "Stack", "Queue", "Tree", "Graph", "DP"];

export default function ProblemsPage() {
  useDocumentTitle("Practice problems");
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [search, setSearch] = useState("");
  const [response, setResponse] = useState(null);

  const query = new URLSearchParams();
  if (difficulty) query.set("difficulty", difficulty);
  if (tag) query.set("tag", tag);
  if (search.trim()) query.set("search", search.trim());
  const queryString = query.toString();
  const loading = response?.query !== queryString;
  const problems = loading ? [] : response?.problems || [];
  const error = loading ? "" : response?.error || "";

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      apiRequest(`/problem/getAllProblem?${queryString}`)
        .then((result) => { if (active) setResponse({ query: queryString, problems: result.problems || [], error: "" }); })
        .catch((requestError) => { if (active) setResponse({ query: queryString, problems: [], error: requestError.message }); });
    }, 200);
    
    return () => { active = false; window.clearTimeout(timer); };
  }, [queryString]);

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <p className="review-eyebrow">PRACTICE WITH INTENTION</p>
        <h1>Choose a problem. Learn from the attempt.</h1>
        <p>Keep a record of what tripped you up, then come back when it matters.</p>
      </header>
      <section className="catalog-controls" aria-label="Filter problems">
        <input aria-label="Search problems" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by problem title" />
        <select aria-label="Filter by difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          <option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <select aria-label="Filter by topic" value={tag} onChange={(event) => setTag(event.target.value)}>
          {tags.map((item) => <option key={item} value={item === "All topics" ? "" : item}>{item}</option>)}
        </select>
      </section>
      {error && <div className="catalog-message" role="alert">{error.includes("Authentication") || error.includes("session") ? <>Please <Link to="/login">sign in</Link> to browse your practice set.</> : error}</div>}
      {loading ? <p className="catalog-message" role="status">Loading problems…</p> : !error && problems.length === 0 ? <p className="catalog-message">No problems match these filters yet.</p> : null}
      {!error && problems.length > 0 && <section className="problem-list" aria-label="Problems">
        {problems.map((problem, index) => <Link className="catalog-problem" to={`/problems/${problem._id}`} key={problem._id}>
          <span className={`catalog-check ${problem.solved ? "is-solved" : ""}`} aria-label={problem.solved ? "Solved" : "Not solved"}>{problem.solved ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <span className="catalog-problem-title">{problem.title}<small>{problem.tags}</small></span>
          <span className={`catalog-difficulty difficulty-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
          <span className="catalog-arrow" aria-hidden="true">→</span>
        </Link>)}
      </section>}
    </main>
  );
}
