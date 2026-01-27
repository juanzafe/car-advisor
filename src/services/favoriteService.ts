import { db } from '../lib/firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  query,
} from 'firebase/firestore';
import type { CarSpec } from '../types/car';
import { carService } from './carService';

interface FavoriteRecord extends CarSpec {
  selectedColor?: string;
  addedAt?: string;
}

export const favoriteService = {
  async addFavorite(userId: string | undefined, car: CarSpec, color: string) {
    if (!userId) return;

    const favoriteData = {
      ...car,
      selectedColor: color,
      addedAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'users', userId, 'favorites', car.id);
    await setDoc(docRef, favoriteData);
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

  async getFavorites(userId: string | undefined): Promise<CarSpec[]> {
    if (!userId) return [];
    const q = query(collection(db, 'users', userId, 'favorites'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const color = data.selectedColor || 'white'; // Recuperamos el color guardado

      return {
        ...(data as CarSpec),
        selectedColor: color, // <--- MUY IMPORTANTE: Inyectarlo aquí para que CarCard lo vea
        image: carService.getCarImage(
          data.brand,
          data.model,
          data.year,
          '01',
          color // Usamos el color recuperado para la imagen
        ),
      };
    });
  },
};
