export function isBlindRetry(search) {
  return new URLSearchParams(search).get('retry') === 'blind';
}

export function getBlindRetryUrl(problemId) {
  return `/problems/${encodeURIComponent(problemId)}?retry=blind`;
}
