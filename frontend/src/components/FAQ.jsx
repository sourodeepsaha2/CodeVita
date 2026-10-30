import { useState } from "react";
import "./FAQ.css";

const DEFAULT_ITEMS = [
  {
    q: "Is Code Vita free to use?",
    a: "Yes. You can create a free account and practice a large part of the problem bank, join weekly contests and track your progress at no cost.",
  },
  {
    q: "Which programming languages are supported?",
    a: "You can submit solutions in C++, Java, Python and JavaScript, with more languages being added over time.",
  },
  {
    q: "How do the AI hints work?",
    a: "AI hints nudge you toward the right approach without revealing the full solution. After you solve a problem you can also request a code review.",
  },
  {
    q: "How often are contests held?",
    a: "We run a timed contest every week. Rankings update live and top performers earn exclusive badges.",
  },
  {
    q: "Can I prepare for company-specific interviews?",
    a: "Yes. Problems are tagged by topic and mapped to questions from top companies, and curated roadmaps guide you from Arrays to System Design.",
  },
];

export default function FAQ({ items = DEFAULT_ITEMS }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex((cur) => (cur === i ? -1 : i));

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className={`faq-item${isOpen ? " faq-open" : ""}`}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={`faq-question-${i}`}
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                onClick={() => toggle(i)}
              >
                <span>{item.q}</span>
                <span className="faq-icon" aria-hidden="true">+</span>
              </button>
            </h3>
            <div
              id={`faq-answer-${i}`}
              role="region"
              aria-labelledby={`faq-question-${i}`}
              className="faq-answer-wrap"
            >
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
