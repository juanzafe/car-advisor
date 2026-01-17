import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { CarSpec } from '../types/car';

// Definimos una interfaz para los datos que guardamos
interface FavoriteRecord extends CarSpec {
  selectedColor?: string;
  addedAt?: string;
}

export const favoriteService = {
  async addFavorite(
    userId: string | null | undefined,
    car: CarSpec,
    selectedColor: string
  ) {
    const carWithColor: FavoriteRecord = {
      ...car,
      selectedColor,
      addedAt: new Date().toISOString(),
    };

    if (!userId) {
      const localFavs: FavoriteRecord[] = JSON.parse(
        localStorage.getItem('local_favorites') || '[]'
      );
      const index = localFavs.findIndex((f) => f.id === car.id);
      if (index > -1) {
        localFavs[index] = carWithColor;
      } else {
        localFavs.push(carWithColor);
      }
      localStorage.setItem('local_favorites', JSON.stringify(localFavs));
      return;
    }

    const favRef = doc(db, 'users', userId, 'favorites', car.id);
    await setDoc(favRef, carWithColor);
  },

  async removeFavorite(userId: string | null | undefined, carId: string) {
    if (!userId) {
      const localFavs: FavoriteRecord[] = JSON.parse(
        localStorage.getItem('local_favorites') || '[]'
      );
      const filtered = localFavs.filter((f) => f.id !== carId);
      localStorage.setItem('local_favorites', JSON.stringify(filtered));
      return;
    }
    const favRef = doc(db, 'users', userId, 'favorites', carId);
    await deleteDoc(favRef);
  },

  async getFavoriteDetail(
    userId: string | null | undefined,
    carId: string
  ): Promise<FavoriteRecord | null> {
    if (!userId) {
      const localFavs: FavoriteRecord[] = JSON.parse(
        localStorage.getItem('local_favorites') || '[]'
      );
      return localFavs.find((f) => f.id === carId) || null;
    }
    const favRef = doc(db, 'users', userId, 'favorites', carId);
    const snap = await getDoc(favRef);
    return snap.exists() ? (snap.data() as FavoriteRecord) : null;
  },
};
