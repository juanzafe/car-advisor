import { useMemo, useReducer } from 'react';
import { RotateCw, Play, Pause } from 'lucide-react';
import { useCarRotation } from '../../hooks/useCarRotation';
import { carService } from '../../services/carService';
import type { CarSpec } from '../../types/car';

type ImageState = { angleIndex: number; rotating: boolean };
type ImageAction =
  | { type: 'RESET' }
  | { type: 'SET_ANGLE_INDEX'; payload: number }
  | { type: 'SET_ROTATING'; payload: boolean };

const imageReducer = (state: ImageState, action: ImageAction): ImageState => {
  switch (action.type) {
    case 'RESET':
      return { ...state, angleIndex: 0, rotating: false };
    case 'SET_ANGLE_INDEX':
      return { ...state, angleIndex: action.payload };
    case 'SET_ROTATING':
      return { ...state, rotating: action.payload };
    default:
      return state;
  }
};

interface CarImageProps {
  car: CarSpec;
  selectedColor: string;
  showControls?: boolean;
  isAutoRotating?: boolean;
}

export const CarImage = ({
  car,
  selectedColor,
  showControls = true,
  isAutoRotating = false,
}: CarImageProps) => {
  const [state, dispatch] = useReducer(imageReducer, {
    angleIndex: 0,
    rotating: isAutoRotating,
  });
  const { angleIndex, rotating } = state;

  const currentImageUrl = useMemo(() => {
    return carService.getCarImage(
      car.brand,
      car.model,
      car.year,
      carService.angles[angleIndex],
      selectedColor
    );
  }, [car, angleIndex, selectedColor]);

  useCarRotation(
    car,
    rotating,
    (index: number | ((prev: number) => number)) => {
      const newIndex = typeof index === 'function' ? index(angleIndex) : index;
      dispatch({ type: 'SET_ANGLE_INDEX', payload: newIndex });
    },
    selectedColor
  );

  const handleImageClick = () => {
    dispatch({
      type: 'SET_ANGLE_INDEX',
      payload: (angleIndex + 1) % carService.angles.length,
    });
  };

  return (
    <div
      className="relative h-56 w-full flex items-center justify-center bg-transparent overflow-visible cursor-pointer"
      onClick={handleImageClick}
    >
      <img
        src={currentImageUrl}
        alt={car.model}
        className="h-44 w-full object-contain relative z-10 pointer-events-none"
      />

      {showControls && (
        <div className="absolute bottom-0 inset-x-0 flex justify-center z-40 pb-2">
          <div
            className="flex items-center gap-6 bg-white shadow-xl p-3 rounded-full border border-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({
                  type: 'SET_ANGLE_INDEX',
                  payload:
                    (angleIndex - 1 + carService.angles.length) %
                    carService.angles.length,
                });
              }}
              className="text-slate-800 p-2 active:bg-slate-100 rounded-full"
            >
              <RotateCw size={28} className="rotate-180" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'SET_ROTATING', payload: !rotating });
              }}
              className="bg-blue-600 text-white rounded-full p-3 shadow-lg active:scale-90"
            >
              {rotating ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({
                  type: 'SET_ANGLE_INDEX',
                  payload: (angleIndex + 1) % carService.angles.length,
                });
              }}
              className="text-slate-800 p-2 active:bg-slate-100 rounded-full"
            >
              <RotateCw size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
