import { apiRequest } from './api';

export function getLearningProgress() {
  return apiRequest('/progress');
}
