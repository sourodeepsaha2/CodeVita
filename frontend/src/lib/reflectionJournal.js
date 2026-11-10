const STORAGE_KEY = "code-vita-reflection-journal";
const BACKUP_FORMAT = "code-vita-reflection-journal";
const BACKUP_VERSION = 1;

const REVIEW_INTERVAL_DAYS = [1, 2, 4, 7, 14];
export const SNOOZE_OPTIONS = [
  { days: 1, label: "1 day" },
  { days: 3, label: "3 days" },
  { days: 7, label: "7 days" },
];

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

export function createReflectionBackup(reflections) {
  return JSON.stringify({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    reflections,
  }, null, 2);
}

export function parseReflectionBackup(contents) {
  let backup;
  try {
    backup = JSON.parse(contents);
  } catch {
    throw new Error("This file isn’t valid JSON.");
  }

  if (!backup || backup.format !== BACKUP_FORMAT) {
    throw new Error("This file isn’t a Code Vita journal backup.");
  }
  if (backup.version !== BACKUP_VERSION) {
    throw new Error("This journal backup uses an unsupported format version.");
  }
  if (typeof backup.exportedAt !== "string" || Number.isNaN(Date.parse(backup.exportedAt))) {
    throw new Error("This journal backup is missing a valid export date.");
  }
  if (!Array.isArray(backup.reflections)) {
    throw new Error("This journal backup doesn’t contain a valid entry list.");
  }

  const validDate = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value));
  const seenIds = new Set();
  const validReflections = backup.reflections.every((item) => {
    if (!item || typeof item.id !== "string" || item.id.length === 0 || seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return typeof item.problem === "string" && item.problem.trim().length > 0 &&
      typeof item.approach === "string" && item.approach.trim().length > 0 &&
      typeof item.blocker === "string" &&
      Number.isInteger(item.confidence) && item.confidence >= 1 && item.confidence <= 5 &&
      validDate(item.createdAt) && validDate(item.nextReviewAt) &&
      Number.isInteger(item.reviewCount) && item.reviewCount >= 0 &&
      (item.isFavorite === undefined || typeof item.isFavorite === "boolean") &&
      (item.lastReviewedAt === undefined || validDate(item.lastReviewedAt));
  });

  if (!validReflections) {
    throw new Error("One or more journal entries are incomplete or invalid.");
  }

  return backup.reflections;
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
    isFavorite: false,
  };
}

export function setReflectionFavorite(reflection, isFavorite) {
  return { ...reflection, isFavorite: Boolean(isFavorite) };
}

export function updateReflection(reflection, { problem, approach, blocker }) {
  return {
    ...reflection,
    problem: problem.trim(),
    approach: approach.trim(),
    blocker: blocker.trim(),
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

export function snoozeReflectionReview(reflection, days, from = new Date()) {
  if (!SNOOZE_OPTIONS.some((option) => option.days === days)) {
    throw new RangeError("Choose a snooze period of 1, 3, or 7 days.");
  }
  const nextReview = new Date(from);
  nextReview.setDate(nextReview.getDate() + days);
  return { ...reflection, nextReviewAt: nextReview.toISOString() };
}
