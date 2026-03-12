import { Settings, Zap, Fuel, Wallet, Gauge, ChevronDown } from 'lucide-react';
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

  const sliders = [
    {
      id: 'min-power-range',
      name: 'minPower' as keyof Preferences,
      icon: <Zap size={15} className="text-yellow-400" />,
      label: t.minPower,
      min: 50,
      max: 600,
      step: 10,
      value: preferences.minPower as number,
      display: `${preferences.minPower} ${lang === 'es' ? 'CV' : 'HP'}`,
      color: '#facc15',
    },
    {
      id: 'max-consumption-range',
      name: 'maxConsumption' as keyof Preferences,
      icon: <Fuel size={15} className="text-green-400" />,
      label: t.maxConsumption,
      min: 3,
      max: 20,
      step: 0.5,
      value: preferences.maxConsumption as number,
      display: `${preferences.maxConsumption} L`,
      color: '#4ade80',
    },
    {
      id: 'max-price-range',
      name: 'maxPrice' as keyof Preferences,
      icon: <Wallet size={15} className="text-blue-400" />,
      label: t.budget,
      min: 10000,
      max: 200000,
      step: 5000,
      value: preferences.maxPrice as number,
      display: `${(preferences.maxPrice as number).toLocaleString()}${lang === 'es' ? '€' : '$'}`,
      color: '#60a5fa',
    },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div
          className="p-2 rounded-lg"
          style={{
            background: 'rgba(37,99,235,0.15)',
            border: '1px solid rgba(37,99,235,0.25)',
          }}
        >
          <Settings size={16} className="text-blue-400" />
        </div>
        <h2 className="text-base font-black text-slate-900">
          {t.yourPreferences}
        </h2>
        <span
          className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full text-blue-300"
          style={{
            background: 'rgba(37,99,235,0.15)',
            border: '1px solid rgba(37,99,235,0.2)',
          }}
        >
          {lang === 'es' ? 'Activo' : 'Active'}
        </span>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {sliders.map(
          ({
            id,
            name,
            icon,
            label,
            min,
            max,
            step,
            value,
            display,
            color,
          }) => (
            <div key={id} className="space-y-4">
              <div className="flex justify-between items-center">
                <label
                  htmlFor={id}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  {icon} {label}
                </label>
                <span
                  className="text-sm font-black tabular-nums px-2 py-0.5 rounded-lg"
                  style={{
                    color,
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {display}
                </span>
              </div>
              <div className="relative">
                {/* Track fill overlay */}
                <div
                  className="absolute top-1/2 left-0 -translate-y-1/2 h-1 rounded-full pointer-events-none"
                  style={{
                    width: `${((value - min) / (max - min)) * 100}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                  }}
                />
                <input
                  type="range"
                  id={id}
                  name={name}
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => handleChange(name, Number(e.target.value))}
                  className="w-full relative z-10"
                  style={{ accentColor: color }}
                />
              </div>
            </div>
          )
        )}

        {/* Traction select */}
        <div className="space-y-4">
          <label
            htmlFor="traction-select"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer"
          >
            <Gauge size={15} className="text-purple-400" /> {t.idealTraction}
          </label>
          <div className="relative">
            <select
              id="traction-select"
              name="preferredTraction"
              value={preferences.preferredTraction}
              onChange={(e) =>
                handleChange('preferredTraction', e.target.value)
              }
              className="w-full py-2 pl-3 pr-8 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer transition-all"
              style={{
                background: '#f8fafc',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <option
                value="any"
                style={{ background: '#ffffff', color: '#000000' }}
              >
                {t.any}
              </option>
              <option
                value="FWD"
                style={{ background: '#ffffff', color: '#000000' }}
              >
                {t.front} (FWD)
              </option>
              <option
                value="RWD"
                style={{ background: '#ffffff', color: '#000000' }}
              >
                {t.rear} (RWD)
              </option>
              <option
                value="AWD"
                style={{ background: '#ffffff', color: '#000000' }}
              >
                {t.allWheel} (AWD)
              </option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
