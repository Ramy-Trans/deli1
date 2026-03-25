import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@seagull_favorites";

interface FavoritesContextValue {
  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  clearFavorites: () => void;
  loaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  clearFavorites: () => {},
  loaded: false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setFavorites(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const persist = async (list: number[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      persist(updated);
      return updated;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    persist([]);
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, clearFavorites, loaded }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
