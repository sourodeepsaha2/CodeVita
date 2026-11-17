import { Link } from 'react-router';

const labels = {
  'due-review': 'REVIEW WHAT YOU LEARNED',
  'topic-practice': 'PRACTICE A REPEATED CHALLENGE',
  'topic-review': 'REVISIT YOUR RETRY NOTES',
  'new-practice': 'KEEP YOUR MOMENTUM',
  'catalog-complete': 'YOUR PRACTICE SET',
};

export default function NextSessionCard({ recommendation }) {
  return <section className={`next-session-card next-session-${recommendation.kind}`} aria-labelledby="next-session-title">
    <div className="next-session-copy">
      <p className="review-eyebrow">{labels[recommendation.kind] || 'YOUR NEXT SESSION'}</p>
      <h2 id="next-session-title">{recommendation.title}</h2>
      <p>{recommendation.detail}</p>
      {recommendation.problem && <span className="next-session-problem">{recommendation.topic ? `${recommendation.topic} · ` : ''}{recommendation.problem}</span>}
    </div>
    <Link className="btn-primary-cv" to={recommendation.href}>{recommendation.action} <span aria-hidden="true">→</span></Link>
  </section>;
}
