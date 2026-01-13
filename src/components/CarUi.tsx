import React from 'react';
import { Zap, Fuel, Gauge } from 'lucide-react';
import type { CarSpec } from '../types/Car';



export const FilterCard = ({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) => (
  <button className="flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group">
    <div className="mb-2 p-3 bg-gray-50 rounded-full group-hover:bg-white transition-colors">{icon}</div>
    <span className="font-bold text-sm">{label}</span>
    <span className="text-xs text-gray-500">{desc}</span>
  </button>
);

export const SpecRow = ({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: number, unit: string }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="flex items-center gap-2 text-gray-500">{icon} {label}</span>
    <span className="font-semibold">{value} {unit}</span>
  </div>
);

export const ComparisonCard = ({ car, onRemove }: { car: CarSpec, onRemove: (id: string) => void }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-blue-500 animate-in fade-in zoom-in duration-300">
    <img src={car.image} alt={car.model} className="w-full h-48 object-cover" />
    <div className="p-6">
      <div className="mb-4">
        <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">{car.brand}</span>
        <h3 className="text-xl font-bold">{car.model} ({car.year})</h3>
      </div>
      <div className="space-y-3">
        <SpecRow icon={<Zap size={16}/>} label="Potencia" value={car.hp} unit="CV" />
        <SpecRow icon={<Fuel size={16}/>} label="Consumo" value={car.consumption} unit="L/100km" />
        <SpecRow icon={<Gauge size={16}/>} label="Peso" value={car.weight} unit="kg" />
        <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-2xl font-black text-slate-800">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}
          </span>
          <button 
            onClick={() => onRemove(car.id)}
            className="text-red-500 text-sm font-medium hover:underline"
          >
            Quitar
          </button>
        </div>
      </div>
    </div>
  </div>
);