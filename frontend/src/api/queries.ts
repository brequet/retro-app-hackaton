import { api } from '../api/client';
import { queryClient } from '../api/queryClient';
import { Activity, QuizAnswers } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useToastStore } from '../stores/toastStore';

// Activities
export async function fetchActivities(params?: { type?: string; search?: string }): Promise<Activity[]> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return api.get<Activity[]>(`/api/activities${qs ? `?${qs}` : ''}`);
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
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  } catch {
    useFavoritesStore.getState().removeFavorite(activityId);
    useToastStore.getState().show('Impossible d\'ajouter aux favoris', 'error');
    throw new Error('Failed to add favorite');
  }
}

export async function removeFavorite(activityId: string): Promise<void> {
  useFavoritesStore.getState().removeFavorite(activityId);
  try {
    await api.delete(`/api/favorites/${activityId}`);
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  } catch {
    useFavoritesStore.getState().addFavorite(activityId);
    useToastStore.getState().show('Impossible de retirer des favoris', 'error');
    throw new Error('Failed to remove favorite');
  }
}
