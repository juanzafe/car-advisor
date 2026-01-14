import { useState } from 'react';
import { RotateCw, Play, Pause, Palette } from 'lucide-react';

import { useCarRotation } from '../../hooks/useCarRotation';
import { carService } from '../../services/carService';
import type { CarSpec } from '../../types/car';

export const CarImage = ({ car }: { car: CarSpec }) => {
  const [angle, setAngle] = useState(0);
  const [rotating, setRotating] = useState(false);
  const [color, setColor] = useState('grey');
  const [image, setImage] = useState(car.image);

  useCarRotation(car, rotating, angle, setAngle, setImage, color);

  const rotateManual = (dir: 1 | -1) => {
    const next = (angle + dir + carService.angles.length) % carService.angles.length;
    setAngle(next);
    setImage(
      carService.getCarImage(
        car.brand,
        car.model,
        car.year,
        carService.angles[next],
        color
      )
    );
  };

  return (
    <div className="relative group bg-slate-50 h-48 flex items-center justify-center">
      {/* Imagen con z-0 para no tapar el badge del score */}
      <img 
        src={image} 
        alt={car.model}
        className="h-40 w-full object-contain p-2 relative z-0 transition-transform duration-500 group-hover:scale-105" 
      />

      {/* Controles de visualización */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-white/50">
          <button 
            onClick={() => rotateManual(-1)}
            className="p-1.5 hover:bg-white rounded-full transition-colors text-slate-700"
          >
            <RotateCw size={18} className="rotate-180" />
          </button>
          
          <button 
            onClick={() => setRotating(!rotating)}
            className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            {rotating ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>

          <button 
            onClick={() => rotateManual(1)}
            className="p-1.5 hover:bg-white rounded-full transition-colors text-slate-700"
          >
            <RotateCw size={18} />
          </button>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          <button 
            onClick={() => setColor(color === 'red' ? 'grey' : 'red')}
            className={`p-1.5 rounded-full transition-colors ${color === 'red' ? 'text-red-500 bg-red-50' : 'text-slate-700 hover:bg-white'}`}
          >
            <Palette size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};