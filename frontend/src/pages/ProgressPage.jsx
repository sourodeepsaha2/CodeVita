import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getLearningProgress } from '../lib/progressApi';
import ProgressSummary from '../components/progress/ProgressSummary';
import ProgressActivity from '../components/progress/ProgressActivity';
import ProgressInsights from '../components/progress/ProgressInsights';
import NextSessionCard from '../components/progress/NextSessionCard';
import './ProgressPage.css';

export default function ProgressPage() {
  useDocumentTitle('Learning progress');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getLearningProgress().then((result) => { if (active) setData(result); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load progress.'); });
    return () => { active = false; };
  }, []);

  if (error) return <main className="progress-page"><header className="progress-header"><p className="review-eyebrow">YOUR LEARNING LOOP</p><h1>Progress, with context.</h1></header><div className="progress-empty" role="alert">{error.includes('Authentication') || error.toLowerCase().includes('session') ? <>Please <Link to="/login">sign in</Link> to see your progress.</> : error}</div></main>;
  if (!data) return <main className="progress-page"><header className="progress-header"><p className="review-eyebrow">YOUR LEARNING LOOP</p><h1>Progress, with context.</h1><p>Loading your practice history…</p></header></main>;

  return <main className="progress-page">
    <header className="progress-header"><p className="review-eyebrow">YOUR LEARNING LOOP</p><h1>Progress, with context.</h1><p>See what’s clicking, what needs another pass, and where your effort is going.</p></header>
    <NextSessionCard recommendation={data.nextSession} />
    <ProgressSummary summary={data.summary} />
    <ProgressActivity activity={data.activity} />
    <ProgressInsights topics={data.topics} recent={data.recent} />
  </main>;
}
