import { api } from '../api/client';
import { Activity, QuizAnswers } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';

// Activities
export async function fetchActivities(type?: string): Promise<Activity[]> {
  const query = type ? `?type=${type}` : '';
  return api.get<Activity[]>(`/api/activities${query}`);
}

export async function fetchActivity(id: string): Promise<Activity> {
  return api.get<Activity>(`/api/activities/${id}`);
}

export async function fetchRecommendation(answers: QuizAnswers): Promise<Activity> {
  const params = new URLSearchParams();
  if (answers.type) params.set('type', answers.type);
  if (answers.teamSize) params.set('teamSize', answers.teamSize);
  if (answers.duration) params.set('duration', answers.duration);
  if (answers.mood) params.set('mood', answers.mood);
  return api.get<Activity>(`/api/activities/recommend/quiz?${params.toString()}`);
}

// Recently viewed
export async function fetchRecentlyViewed(): Promise<Activity[]> {
  return api.get<Activity[]>('/api/activities/user/recently-viewed');
}

export async function markAsViewed(activityId: string): Promise<void> {
  await api.post(`/api/activities/${activityId}/view`);
}

// Favorites
export async function fetchFavorites(): Promise<Activity[]> {
  return api.get<Activity[]>('/api/favorites');
}

export async function fetchFavoriteIds(): Promise<string[]> {
  return api.get<string[]>('/api/favorites/ids');
}

export async function addFavorite(activityId: string): Promise<void> {
  useFavoritesStore.getState().addFavorite(activityId);
  try {
    await api.post(`/api/favorites/${activityId}`);
  } catch {
    useFavoritesStore.getState().removeFavorite(activityId);
    throw new Error('Failed to add favorite');
  }
}

export async function removeFavorite(activityId: string): Promise<void> {
  useFavoritesStore.getState().removeFavorite(activityId);
  try {
    await api.delete(`/api/favorites/${activityId}`);
  } catch {
    useFavoritesStore.getState().addFavorite(activityId);
    throw new Error('Failed to remove favorite');
  }
}
