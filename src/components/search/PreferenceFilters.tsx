import { Settings, Zap, Fuel, Wallet, Gauge } from 'lucide-react';
import type { Preferences } from '../../types/car';

interface PreferenceFiltersProps {
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
}

export const PreferenceFilters = ({
  preferences,
  setPreferences,
}: PreferenceFiltersProps) => {
  const handleChange = (key: keyof Preferences, value: string | number) => {
    setPreferences({ ...preferences, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
        <Settings className="text-blue-600" size={20} />
        <h2 className="text-xl font-bold text-slate-800">Tus Preferencias</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="flex items-center gap-2 text-slate-500">
              <Zap size={16} /> Potencia mín.
            </span>
            <span className="text-blue-600 font-bold">
              {preferences.minPower} CV
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="600"
            step="10"
            value={preferences.minPower}
            onChange={(e) => handleChange('minPower', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="flex items-center gap-2 text-slate-500">
              <Fuel size={16} /> Consumo máx.
            </span>
            <span className="text-blue-600 font-bold">
              {preferences.maxConsumption} L
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="20"
            step="0.5"
            value={preferences.maxConsumption}
            onChange={(e) =>
              handleChange('maxConsumption', Number(e.target.value))
            }
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="flex items-center gap-2 text-slate-500">
              <Wallet size={16} /> Presupuesto
            </span>
            <span className="text-blue-600 font-bold">
              {preferences.maxPrice.toLocaleString()}€
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="200000"
            step="5000"
            value={preferences.maxPrice}
            onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium text-slate-500 mb-1">
            <span className="flex items-center gap-2">
              <Gauge size={16} /> Tracción ideal
            </span>
          </div>
          <select
            value={preferences.preferredTraction}
            onChange={(e) => handleChange('preferredTraction', e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-colors"
          >
            <option value="any">Cualquiera</option>
            <option value="FWD">Delantera (FWD)</option>
            <option value="RWD">Trasera (RWD)</option>
            <option value="AWD">Total (AWD)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
