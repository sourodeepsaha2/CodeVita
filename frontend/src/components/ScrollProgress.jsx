import useScrollProgress from "../hooks/useScrollProgress";
import "./ScrollProgress.css";

/** Thin gradient bar fixed at the top of the viewport showing page scroll progress. */
export default function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <div
      id="scroll-progress"
      className="scroll-progress"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div className="scroll-progress__bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
