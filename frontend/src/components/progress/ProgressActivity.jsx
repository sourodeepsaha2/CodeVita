const dateLabel = (value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function ProgressActivity({ activity }) {
  const peakActivity = Math.max(1, ...activity.map((day) => day.attempts));
  const activeDays = activity.filter((day) => day.attempts > 0).length;
  return <section className="progress-panel" aria-labelledby="activity-title">
    <div className="progress-panel-heading"><div><p className="review-eyebrow">CONSISTENCY</p><h2 id="activity-title">Last six weeks</h2></div><span>{activeDays} active days</span></div>
    <div className="activity-grid" role="img" aria-label={`Practice activity across the last six weeks, with ${activeDays} active days`}>
      {activity.map((day) => <span key={day.date} className="activity-cell" data-level={day.attempts ? Math.min(4, Math.ceil(day.attempts / peakActivity * 4)) : 0} title={`${dateLabel(day.date)}: ${day.attempts} ${day.attempts === 1 ? 'attempt' : 'attempts'}`} />)}
    </div>
    <div className="activity-legend"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} />)}<span>More</span></div>
  </section>;
}
