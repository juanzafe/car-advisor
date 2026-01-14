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
    <div className="relative group bg-slate-100">
      <img src={image} className="h-48 w-full object-contain p-4" />

      <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button onClick={() => rotateManual(-1)}><RotateCw className="rotate-180" /></button>
        <button onClick={() => setRotating(!rotating)}>
          {rotating ? <Pause /> : <Play />}
        </button>
        <button onClick={() => rotateManual(1)}><RotateCw /></button>
        <button onClick={() => setColor('red')}><Palette /></button>
      </div>
    </div>
  );
};
