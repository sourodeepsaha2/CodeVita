import { Link } from 'react-router';

const dateLabel = (value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function ProgressInsights({ topics, recent }) {
  const peakRetries = Math.max(1, ...topics.map((topic) => topic.retries));
  return <div className="progress-detail-grid">
    <section className="progress-panel" aria-labelledby="topics-title"><div className="progress-panel-heading"><div><p className="review-eyebrow">MISTAKE MEMORY</p><h2 id="topics-title">Topics to revisit</h2></div></div>
      {topics.length ? <ul className="topic-progress-list">{topics.map((topic) => <li key={topic.topic}><div className="topic-progress-label"><strong>{topic.topic}</strong><span>{topic.retries} failed {topic.retries === 1 ? 'attempt' : 'attempts'} · {topic.problems} {topic.problems === 1 ? 'problem' : 'problems'}</span></div><div className="topic-progress-track"><span style={{ width: `${Math.max(8, topic.retries / peakRetries * 100)}%` }} /></div></li>)}</ul> : <p className="progress-empty-copy">No failed attempts yet. Your first practice session will add useful signals here.</p>}
    </section>
    <section className="progress-panel" aria-labelledby="recent-title"><div className="progress-panel-heading"><div><p className="review-eyebrow">RECENT WORK</p><h2 id="recent-title">Latest attempts</h2></div><Link to="/problems">Practice →</Link></div>
      {recent.length ? <ul className="recent-progress-list">{recent.map((attempt) => <li key={attempt.id}><span className={`recent-progress-dot status-${attempt.status}`} aria-hidden="true" /><div className="recent-progress-main">{attempt.problemId ? <Link to={`/problems/${attempt.problemId}`}>{attempt.problem}</Link> : <strong>{attempt.problem}</strong>}<small>{attempt.topic} · {attempt.language} · {dateLabel(attempt.createdAt)}</small></div><span className={`recent-progress-status status-${attempt.status}`}>{attempt.status === 'accepted' ? 'Accepted' : attempt.status === 'wrong' ? 'Retry' : attempt.status}</span></li>)}</ul> : <p className="progress-empty-copy">Your attempts will appear here after you submit a solution.</p>}
    </section>
  </div>;
}
