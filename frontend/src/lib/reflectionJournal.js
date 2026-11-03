const STORAGE_KEY = "code-vita-reflection-journal";

const REVIEW_INTERVAL_DAYS = [1, 2, 4, 7, 14];

export function getReviewIntervalDays(confidence) {
  const score = Math.min(5, Math.max(1, Number(confidence) || 1));
  return REVIEW_INTERVAL_DAYS[score - 1];
}

export function getNextReviewAt(confidence, from = new Date()) {
  const next = new Date(from);
  next.setDate(next.getDate() + getReviewIntervalDays(confidence));
  return next.toISOString();
}

export function loadReflections() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const reflections = JSON.parse(stored);
    return Array.isArray(reflections) ? reflections : [];
  } catch {
    return [];
  }
}

export function saveReflections(reflections) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
    return true;
  } catch {
    return false;
  }
}

export function createReflection({ problem, approach, blocker, confidence }) {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    problem: problem.trim(),
    approach: approach.trim(),
    blocker: blocker.trim(),
    confidence: Number(confidence),
    createdAt: new Date().toISOString(),
    nextReviewAt: getNextReviewAt(confidence),
    reviewCount: 0,
  };
}

export function scheduleReflectionReview(reflection, confidence) {
  return {
    ...reflection,
    confidence: Number(confidence),
    nextReviewAt: getNextReviewAt(confidence),
    reviewCount: reflection.reviewCount + 1,
    lastReviewedAt: new Date().toISOString(),
  };
}
