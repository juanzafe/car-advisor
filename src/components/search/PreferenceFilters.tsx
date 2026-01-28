import { Settings, Zap, Fuel, Wallet, Gauge } from 'lucide-react';
import type { Preferences } from '../../types/car';
import { translations } from '../../locales/translations';

interface PreferenceFiltersProps {
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
  lang?: 'es' | 'en';
}

export const PreferenceFilters = ({
  preferences,
  setPreferences,
  lang = 'es',
}: PreferenceFiltersProps) => {
  const t = translations[lang];

  const handleChange = (key: keyof Preferences, value: string | number) => {
    setPreferences({ ...preferences, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
        <Settings className="text-blue-600" size={20} />
        <h2 className="text-xl font-bold text-slate-800">
          {t.yourPreferences}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <label
            htmlFor="min-power-range"
            className="flex justify-between items-center text-sm font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2 text-slate-500">
              <Zap size={16} /> {t.minPower}
            </span>
            <span className="text-blue-600 font-bold">
              {preferences.minPower} {lang === 'es' ? 'CV' : 'HP'}
            </span>
          </label>
          <input
            type="range"
            id="min-power-range"
            name="minPower"
            min="50"
            max="600"
            step="10"
            value={preferences.minPower}
            onChange={(e) => handleChange('minPower', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="max-consumption-range"
            className="flex justify-between items-center text-sm font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2 text-slate-500">
              <Fuel size={16} /> {t.maxConsumption}
            </span>
            <span className="text-blue-600 font-bold">
              {preferences.maxConsumption} L
            </span>
          </label>
          <input
            type="range"
            id="max-consumption-range"
            name="maxConsumption"
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
          <label
            htmlFor="max-price-range"
            className="flex justify-between items-center text-sm font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2 text-slate-500">
              <Wallet size={16} /> {t.budget}
            </span>
            <span className="text-blue-600 font-bold">
              {preferences.maxPrice.toLocaleString()}
              {lang === 'es' ? '€' : '$'}
            </span>
          </label>
          <input
            type="range"
            id="max-price-range"
            name="maxPrice"
            min="10000"
            max="200000"
            step="5000"
            value={preferences.maxPrice}
            onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="traction-select"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1 cursor-pointer"
          >
            <Gauge size={16} /> {t.idealTraction}
          </label>
          <select
            id="traction-select"
            name="preferredTraction"
            value={preferences.preferredTraction}
            onChange={(e) => handleChange('preferredTraction', e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-colors"
          >
            <option value="any">{t.any}</option>
            <option value="FWD">{t.front} (FWD)</option>
            <option value="RWD">{t.rear} (RWD)</option>
            <option value="AWD">{t.allWheel} (AWD)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
