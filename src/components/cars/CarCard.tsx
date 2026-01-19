import { useEffect, useState } from 'react';
import { Zap, Fuel, Star, Heart } from 'lucide-react';
import { CarImage } from './CarImage';
import { CarModal } from './CarModal';
import { carService } from '../../services/carService';
import type { CarSpec } from '../../types/car';
import { favoriteService } from '../../services/favoriteService';
import { auth } from '../../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const CarCard = ({
  car,
  onCompare,
  isSelected,
}: {
  car: CarSpec;
  onCompare: () => void;
  isSelected: boolean;
}) => {
  const [selectedColor, setSelectedColor] = useState('white');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user] = useAuthState(auth);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const originalState = isFavorite;
    setIsFavorite(!originalState);
    try {
      if (originalState) {
        await favoriteService.removeFavorite(user?.uid, car.id);
      } else {
        await favoriteService.addFavorite(user?.uid, car, selectedColor);
      }
    } catch (error) {
      setIsFavorite(originalState);
      console.error('Error al gestionar favorito:', error);
    }
  };

  const handleColorChange = async (color: string) => {
    setSelectedColor(color);
    if (isFavorite) {
      try {
        await favoriteService.addFavorite(user?.uid, car, color);
      } catch (error) {
        console.error('Error al actualizar color favorito:', error);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    const checkPersistence = async () => {
      try {
        const savedData = await favoriteService.getFavoriteDetail(
          user?.uid,
          car.id
        );
        if (isMounted && savedData) {
          setIsFavorite(true);
          if (savedData.selectedColor)
            setSelectedColor(savedData.selectedColor);
        } else if (isMounted) {
          setIsFavorite(false);
        }
      } catch (error) {
        console.error('Error al verificar persistencia:', error);
      }
    };
    checkPersistence();
    return () => {
      isMounted = false;
    };
  }, [user?.uid, car.id]);

  return (
    <>
      <div className="bg-[#f1f5f9] rounded-2xl shadow-md overflow-hidden relative border border-slate-200 transition-all duration-300">
        {car.score !== undefined && (
          <div className="absolute top-3 right-3 z-30 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
            <Star size={14} fill="currentColor" />
            <span>{car.score}%</span>
          </div>
        )}

        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm active:scale-90 cursor-pointer"
        >
          <Heart
            size={20}
            className={`transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`}
          />
        </button>

        <div onClick={() => setIsModalOpen(true)}>
          <CarImage car={car} selectedColor={selectedColor} />
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm border border-slate-100 shrink-0">
                <img
                  src={`https://www.google.com/s2/favicons?sz=64&domain=${car.brand.toLowerCase().replace(/\s+/g, '')}.com`}
                  alt={car.brand}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight uppercase text-slate-800">
                  {car.brand} {car.model}
                </h3>
              </div>
            </div>

            {/* Selector de colores forzado para móvil */}
            <div className="flex gap-4 py-2">
              {carService.colorList.map((colorName) => (
                <button
                  key={colorName}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange(colorName);
                  }}
                  className={`rounded-full border-2 transition-all cursor-pointer ${selectedColor === colorName ? 'border-blue-500 scale-125 shadow-md' : 'border-slate-300'}`}
                  style={{
                    backgroundColor: getColorHex(colorName),
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="text-sm space-y-2 border-y border-slate-200/50 py-3">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2">
                <Zap size={16} className="text-blue-500" /> Potencia
              </span>
              <span className="font-semibold text-slate-900">{car.hp} CV</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2">
                <Fuel size={16} className="text-blue-500" /> Consumo
              </span>
              <span className="font-semibold text-slate-900">
                {car.consumption} L
              </span>
            </div>
          </div>

          <button
            onClick={onCompare}
            disabled={isSelected}
            className={`w-full py-3 rounded-xl font-bold transition-all ${isSelected ? 'bg-slate-200 text-slate-400' : 'bg-green-600 text-white active:scale-95'}`}
          >
            {isSelected ? 'En comparativa' : 'Comparar ahora'}
          </button>
        </div>
      </div>

      <CarModal
        car={car}
        selectedColor={selectedColor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

function getColorHex(colorName: string) {
  const colors: Record<string, string> = {
    white: '#FFFFFF',
    black: '#1A1A1A',
    silver: '#E5E5E5',
    blue: '#2563EB',
    red: '#DC2626',
  };
  return colors[colorName] || '#CBD5E1';
}
