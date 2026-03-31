import { create } from 'zustand';

interface FavoritesState {
  favoriteIds: Set<string>;
  setFavoriteIds: (ids: string[]) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set<string>(),

  setFavoriteIds: (ids: string[]) => {
    set({ favoriteIds: new Set(ids) });
  },

  addFavorite: (id: string) => {
    const newSet = new Set(get().favoriteIds);
    newSet.add(id);
    set({ favoriteIds: newSet });
  },

  removeFavorite: (id: string) => {
    const newSet = new Set(get().favoriteIds);
    newSet.delete(id);
    set({ favoriteIds: newSet });
  },

  isFavorite: (id: string) => {
    return get().favoriteIds.has(id);
  },
}));
