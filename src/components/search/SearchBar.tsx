import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { translations } from '../../locales/translations';

interface SearchBarProps {
  onSearch: (query: string) => void | Promise<void>;
  isLoading?: boolean;
  lang?: 'es' | 'en';
}

export function SearchBar({
  onSearch,
  isLoading = false,
  lang = 'es',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    await onSearch(query.trim());
  };

  const suggestions =
    lang === 'es'
      ? ['BMW Serie 3', 'Toyota Supra', 'Porsche 911', 'Honda Civic Type R']
      : ['BMW 3 Series', 'Toyota Supra', 'Porsche 911', 'Honda Civic Type R'];

  return (
    <div className="space-y-3">
      <form
        onSubmit={handleSubmit}
        className={`search-container flex items-center gap-3 rounded-2xl px-5 py-4 ${isFocused ? 'ring-0' : ''}`}
      >
        <Search
          className={`flex-shrink-0 transition-colors ${isFocused ? 'text-blue-400' : 'text-slate-500'}`}
          size={22}
        />

        <label htmlFor="car-search-input" className="sr-only">
          {t.searchPlaceholder}
        </label>

        <input
          type="text"
          id="car-search-input"
          name="q"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          autoComplete="off"
          className="flex-1 outline-none text-white placeholder-slate-500 disabled:opacity-50 text-base bg-transparent"
        />

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all flex-shrink-0 ${
            isLoading || !query.trim()
              ? 'opacity-40 cursor-not-allowed bg-slate-700'
              : 'btn-glow'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.searching}
            </>
          ) : (
            <>
              <Sparkles size={15} />
              {t.searchButton}
            </>
          )}
        </button>
      </form>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 px-1">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuery(s);
              onSearch(s);
            }}
            className="text-xs px-3 py-1.5 rounded-full text-slate-400 hover:text-blue-300 transition-all hover:border-blue-500/40"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
