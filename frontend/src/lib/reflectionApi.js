import { apiRequest } from "./api";

const toPayload = (reflection) => ({
  clientId: reflection.clientId || reflection.id,
  problemId: reflection.problemId,
  submissionId: reflection.submissionId,
  problem: reflection.problem,
  approach: reflection.approach,
  blocker: reflection.blocker || "",
  confidence: Number(reflection.confidence),
  nextReviewAt: reflection.nextReviewAt,
  reviewCount: Number(reflection.reviewCount) || 0,
  isFavorite: Boolean(reflection.isFavorite),
  createdAt: reflection.createdAt,
  lastReviewedAt: reflection.lastReviewedAt,
});

export async function listReflections() {
  const result = await apiRequest("/journal/reflections");
  return result.reflections || [];
}

export async function createRemoteReflection(reflection) {
  const result = await apiRequest("/journal/reflections", {
    method: "POST",
    body: JSON.stringify(toPayload(reflection)),
  });
  return result.reflection;
}

export async function importRemoteReflections(reflections) {
  let imported = 0;
  for (let offset = 0; offset < reflections.length; offset += 250) {
    const result = await apiRequest("/journal/reflections/import", {
      method: "POST",
      body: JSON.stringify({ reflections: reflections.slice(offset, offset + 250).map(toPayload) }),
    });
    imported += result.imported || 0;
  }
  return { imported };
}

export async function updateRemoteReflection(id, changes) {
  const result = await apiRequest(`/journal/reflections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
  return result.reflection;
}

export async function reviewRemoteReflection(id) {
  const result = await apiRequest(`/journal/reflections/${id}/reviewed`, { method: "POST" });
  return result.reflection;
}

export async function snoozeRemoteReflection(id, days) {
  const result = await apiRequest(`/journal/reflections/${id}/snooze`, {
    method: "POST",
    body: JSON.stringify({ days }),
  });
  return result.reflection;
}

export async function deleteRemoteReflection(id) {
  return apiRequest(`/journal/reflections/${id}`, { method: "DELETE" });
}
