import { useEffect, useState } from 'react';
import { Zap, Fuel, Gauge, Car, Star, Heart } from 'lucide-react';
import { CarImage } from './CarImage';
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

  const [user] = useAuthState(auth);

  // 1. Manejar el click en el corazón (Me gusta)
  const handleFavoriteClick = async () => {
    const originalState = isFavorite;
    setIsFavorite(!originalState);

    try {
      if (originalState) {
        await favoriteService.removeFavorite(user?.uid, car.id);
      } else {
        // Al dar me gusta, guardamos también el color que esté seleccionado en ese momento
        await favoriteService.addFavorite(user?.uid, car, selectedColor);
      }
    } catch (error) {
      setIsFavorite(originalState);
      console.error('Error al gestionar favorito:', error);
    }
  };

  // 2. Manejar el cambio de color y guardarlo si ya es favorito
  const handleColorChange = async (color: string) => {
    setSelectedColor(color);

    // Si el coche ya es favorito, actualizamos el color en la base de datos/localstorage
    if (isFavorite) {
      try {
        await favoriteService.addFavorite(user?.uid, car, color);
      } catch (error) {
        console.error('Error al actualizar color favorito:', error);
      }
    }
  };

  // 3. Efecto de persistencia (Cargar favorito y color guardado)
  useEffect(() => {
    let isMounted = true;

    const checkPersistence = async () => {
      try {
        // Obtenemos los datos guardados de este coche
        const savedData = await favoriteService.getFavoriteDetail(
          user?.uid,
          car.id
        );

        if (isMounted && savedData) {
          setIsFavorite(true);
          // Si el usuario guardó un color específico, lo aplicamos
          if (savedData.selectedColor) {
            setSelectedColor(savedData.selectedColor);
          }
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
    <div className="bg-white rounded-2xl shadow-md overflow-hidden relative border border-slate-100 group">
      {car.score !== undefined && (
        <div className="absolute top-3 right-3 z-10 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
          <Star size={14} fill="currentColor" />
          <span>{car.score}%</span>
        </div>
      )}

      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 left-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all active:scale-90"
        title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        <Heart
          size={20}
          className={`transition-colors ${
            isFavorite
              ? 'fill-red-500 text-red-500'
              : 'text-slate-400 hover:text-red-500'
          }`}
        />
      </button>

      <CarImage car={car} selectedColor={selectedColor} />

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
                onClick={() => handleColorChange(colorName)} // <-- Llamamos a la función de cambio con persistencia
                className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-125 ${
                  selectedColor === colorName
                    ? 'border-blue-500 scale-110 shadow-sm'
                    : 'border-slate-200'
                }`}
                style={{ backgroundColor: getColorHex(colorName) }}
                title={`Cambiar a color ${colorName}`}
              />
            ))}
          </div>
        </div>

        <div className="text-sm space-y-2 border-y border-slate-50 py-3">
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
          className={`w-full py-2.5 rounded-xl font-bold transition-all duration-200 ${
            isSelected
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-sm active:scale-[0.98]'
          }`}
        >
          {isSelected ? 'Ya en comparativa' : 'Comparar ahora'}
        </button>
      </div>
    </div>
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
