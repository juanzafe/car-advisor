import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';
import { favoriteService } from '../../services/favoriteService';
import { CarsGrid } from './CarsGrid';
import type { CarSpec } from '../../types/car';
import { Heart } from 'lucide-react';

export const FavoritesView = ({
  onCompare,
  selectedIds,
}: {
  onCompare: (car: CarSpec) => void;
  selectedIds: string[];
}) => {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState<CarSpec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavs = async () => {
      setLoading(true);
      const data = await favoriteService.getFavorites(user?.uid);
      setFavorites(data);
      setLoading(false);
    };
    loadFavs();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="text-red-500 fill-red-500" size={28} />
        <h2 className="text-3xl font-bold">Mis Favoritos</h2>
      </div>

      {favorites.length === 0 && !loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">Aún no has guardado ningún coche.</p>
        </div>
      ) : (
        <CarsGrid
          cars={favorites}
          isLoading={loading}
          onCompare={onCompare}
          selectedIds={selectedIds}
        />
      )}
    </div>
  );
};
