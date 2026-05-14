import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnimeHistory {
  animeId: string;
  title: string;
  image: string;
  lastEpisode: number;
  timestamp: number;
}

interface AppState {
  favorites: any[];
  history: AnimeHistory[];
  addFavorite: (anime: any) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  addToHistory: (anime: any, episode: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      history: [],
      
      addFavorite: (anime) => set((state) => {
        const id = anime.id || anime.mal_id;
        return {
          favorites: [...state.favorites.filter((f) => (f.id || f.mal_id) !== id), anime]
        };
      }),
      
      removeFavorite: (id) => set((state) => ({
        favorites: state.favorites.filter((f) => (f.id || f.mal_id) !== id)
      })),
      
      isFavorite: (id) => {
        return get().favorites.some((f) => (f.id || f.mal_id) === id);
      },

      addToHistory: (anime, episode) => set((state) => {
        const id = anime.id || anime.mal_id;
        const newHistory = state.history.filter((h) => h.animeId !== String(id));
        return {
          history: [
            {
              animeId: String(id),
              title: anime.title_english || anime.title,
              image: anime.img || anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url,
              lastEpisode: episode,
              timestamp: Date.now()
            },
            ...newHistory
          ].slice(0, 50) // keep last 50 items
        };
      })
    }),
    {
      name: 'aanime-storage',
    }
  )
);
