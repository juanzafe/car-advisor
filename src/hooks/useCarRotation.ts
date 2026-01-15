import { useEffect } from 'react';
import { carService } from '../services/carService';
import type { CarSpec } from '../types/car';

export const useCarRotation = (
  car: CarSpec,
  rotating: boolean,
  angleIndex: number,
  setAngleIndex: (n: number | ((prev: number) => number)) => void
) => {
  useEffect(() => {
    // Precarga todos los ángulos del color actual y el siguiente en la lista para evitar lag
    carService.colorList.forEach(c => {
      carService.angles.forEach(a => {
        const img = new Image();
        img.src = carService.getCarImage(car.brand, car.model, car.year, a, c);
      });
    });
  }, [car.brand, car.model]);

  useEffect(() => {
    if (!rotating) return;
    const interval = setInterval(() => {
      setAngleIndex((prev) => (prev + 1) % carService.angles.length);
    }, 120);
    return () => clearInterval(interval);
  }, [rotating, setAngleIndex]);
};