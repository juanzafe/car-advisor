import { useEffect, useState } from 'react';
import { Zap, Fuel, Gauge, Car, Star, Heart } from 'lucide-react';
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

  const handleFavoriteClick = async () => {
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
      <div className="bg-[#f1f5f9] rounded-2xl shadow-md overflow-hidden relative border border-slate-200 group transition-all duration-300">
        {car.score !== undefined && (
          <div className="absolute top-3 right-3 z-10 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
            <Star size={14} fill="currentColor" />
            <span>{car.score}%</span>
          </div>
        )}

        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all active:scale-90 cursor-pointer"
        >
          <Heart
            size={20}
            className={`transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500'}`}
          />
        </button>

        {/* Click para abrir Modal */}
        <div
          className="overflow-hidden cursor-zoom-in"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="transition-transform duration-500 ease-out group-hover:scale-110">
            <CarImage car={car} selectedColor={selectedColor} />
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg leading-tight uppercase">
                {car.brand} {car.model}
              </h3>
              <p className="text-sm text-slate-500">{car.year}</p>
            </div>

            <div className="flex gap-1.5 mt-1">
              {carService.colorList.map((colorName) => (
                <button
                  key={colorName}
                  onClick={() => handleColorChange(colorName)}
                  className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-125 cursor-pointer ${selectedColor === colorName ? 'border-blue-500 scale-110 shadow-sm' : 'border-slate-200'}`}
                  style={{ backgroundColor: getColorHex(colorName) }}
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
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2">
                <Gauge size={16} className="text-blue-500" /> Peso
              </span>
              <span className="font-semibold text-slate-900">
                {car.weight} kg
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-2">
                <Car size={16} className="text-blue-500" /> Tracción
              </span>
              <span className="font-semibold text-slate-900 uppercase">
                {car.traction}
              </span>
            </div>
          </div>

          <button
            onClick={onCompare}
            disabled={isSelected}
            className={`w-full py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${isSelected ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-sm active:scale-[0.98]'}`}
          >
            {isSelected ? 'Ya en comparativa' : 'Comparar ahora'}
          </button>
        </div>
      </div>

      {/* Componente Modal separado */}
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
