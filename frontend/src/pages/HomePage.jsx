import { Link } from "react-router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./HomePage.css";

const steps = [
  { number: "01", title: "Take a real attempt", text: "Work through a focused DSA problem in the editor. Your code runs against hidden cases." },
  { number: "02", title: "Name the mistake", text: "When a run misses, capture your approach and the point where your reasoning broke down." },
  { number: "03", title: "Return with context", text: "Your journal schedules a retry. Revisit the problem with your own lesson in mind." },
];

export default function HomePage() {
  useDocumentTitle();
  return <main className="landing-page">
    <section className="landing-hero">
      <div className="landing-copy">
        <p className="review-eyebrow">PRACTICE THAT REMEMBERS</p>
        <h1>Make every wrong answer <span>useful.</span></h1>
        <p className="landing-lede">Code Vita is a DSA practice space built around the part most platforms forget: what you got wrong, why it happened, and when to try again.</p>
        <div className="landing-actions"><Link to="/signup" className="btn-primary-cv">Start your practice →</Link><Link to="/problems" className="btn-outline-cv">Browse problems</Link></div>
        <p className="landing-note">A focused collection, a private reflection journal, and a review queue that brings your hard problems back.</p>
      </div>
      <div className="landing-preview" aria-label="A sample mistake reflection">
        <div className="preview-top"><span className="preview-dot" /><span>ATTEMPT REFLECTION</span><span className="preview-date">REVIEW IN 2 DAYS</span></div>
        <h2>Pair Sum</h2>
        <div className="preview-status"><span>●</span> Wrong answer <span className="preview-cases">3 of 5 cases passed</span></div>
        <div className="preview-note"><span>WHAT I TRIED</span><p>Checked each pair, but reused the same element when values matched.</p></div>
        <div className="preview-note preview-lesson"><span>WHAT I’LL CHANGE</span><p>Store visited values by index so each number is used once.</p></div>
        <div className="preview-footer"><span>Next retry</span><strong>Thursday · 9:00 AM</strong></div>
      </div>
    </section>
    <section className="landing-how">
      <div className="landing-section-heading"><p className="review-eyebrow">THE CODE VITA LOOP</p><h2>From stuck to <span>stronger.</span></h2><p>Build a personal record of your reasoning, not just a row of accepted submissions.</p></div>
      <div className="landing-steps">{steps.map((step) => <article className="landing-step" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
    </section>
    <section className="landing-bottom"><div><p className="review-eyebrow">YOUR PRACTICE, WITH A MEMORY</p><h2>Next time you see this pattern, you’ll know what to watch for.</h2></div><Link to="/signup" className="btn-primary-cv">Create your free account →</Link></section>
    <footer className="landing-footer"><span>Code Vita</span><span>Practice. Reflect. Retry.</span><Link to="/review">Open reflection journal</Link></footer>
  </main>;
}
