import { useEffect } from 'react';
import { carService } from '../services/carService';
import type { CarSpec } from '../types/car';

export const useCarRotation = (
  car: CarSpec,
  rotating: boolean,
  setAngleIndex: (n: number | ((prev: number) => number)) => void,
  selectedColor: string = 'white'
) => {
  useEffect(() => {
    carService.colorList.forEach((color) => {
      const img = new Image();
      img.src = carService.getCarImage(
        car.brand,
        car.model,
        car.year,
        '01',
        color
      );
    });

    carService.angles.forEach((angle) => {
      const img = new Image();
      img.src = carService.getCarImage(
        car.brand,
        car.model,
        car.year,
        angle,
        selectedColor
      );
    });
  }, [car.brand, car.model, car.year, selectedColor]);

  useEffect(() => {
    if (!rotating) return;

    const interval = setInterval(() => {
      setAngleIndex((prev) => (prev + 1) % carService.angles.length);
    }, 120);

    return () => clearInterval(interval);
  }, [rotating, setAngleIndex]);
};
