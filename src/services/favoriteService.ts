import { db } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import type { CarSpec } from '../types/car';

export const favoriteService = {
  async addFavorite(userId: string, car: CarSpec) {
    const favRef = collection(db, 'favorites');
    return await addDoc(favRef, {
      userId,
      ...car,
      addedAt: new Date().toISOString(),
    });
  },

  async removeFavorite(favoriteDocId: string) {
    const docRef = doc(db, 'favorites', favoriteDocId);
    return await deleteDoc(docRef);
  },
};
