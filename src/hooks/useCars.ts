import { useState } from 'react';
import type { CarSpec } from '../types/Car';
import { fetchCars } from '../services/carService';


export const useCars = () => {
  const [results, setResults] = useState<CarSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchCars(query);
      setResults(data);
    } catch (err: unknown) {
      // Verificamos si es un error real para poder leer el mensaje
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
};