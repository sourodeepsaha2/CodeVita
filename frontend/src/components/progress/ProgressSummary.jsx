import { Link } from 'react-router';

export default function ProgressSummary({ summary }) {
  return <section className="progress-stat-grid" aria-label="Practice summary">
    <article className="progress-stat"><span>PROBLEMS SOLVED</span><strong>{summary.solved}</strong><small>with at least one accepted solution</small></article>
    <article className="progress-stat"><span>ATTEMPTS</span><strong>{summary.attempts}</strong><small>{summary.accepted} accepted runs</small></article>
    <article className="progress-stat"><span>ACCEPTANCE RATE</span><strong>{summary.acceptanceRate}%</strong><small>accepted submissions over time</small></article>
    <Link className={`progress-stat progress-stat-link${summary.dueReflections ? ' progress-stat-due' : ''}`} to="/review"><span>READY TO REVISIT</span><strong>{summary.dueReflections}</strong><small>{summary.dueReflections ? 'reflections are due today' : 'nothing due right now'} →</small></Link>
    <Link className="progress-stat progress-stat-link progress-stat-breakthrough" to="/review?filter=breakthrough"><span>BREAKTHROUGHS NOTED</span><strong>{summary.breakthroughs || 0}</strong><small>ideas captured after accepted runs →</small></Link>
  </section>;
}
