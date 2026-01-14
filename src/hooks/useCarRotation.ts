import { useEffect } from 'react';
import type { CarSpec } from '../types/car';
import { carService } from '../services/carService';

export const useCarRotation = (
  car: CarSpec,
  rotating: boolean,
  angle: number,
  setAngle: (n: number) => void,
  setImage: (url: string) => void,
  color: string
) => {
  useEffect(() => {
    if (!rotating) return;

    const interval = setInterval(() => {
      const next = (angle + 1) % carService.angles.length;
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
    }, 200);

    return () => clearInterval(interval);
  }, [rotating, angle, color]);
};
