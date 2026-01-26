import { useState } from 'react';
import { Search } from 'lucide-react';
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
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    await onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 bg-white rounded-xl shadow p-4"
    >
      <Search className="text-slate-400" size={20} />

      <input
        type="text"
        placeholder={t.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
        className="flex-1 outline-none text-slate-700 disabled:bg-transparent"
      />

      <button
        type="submit"
        disabled={isLoading}
        className={`
          px-5 py-2 rounded-lg text-white font-medium transition-colors
          ${isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {isLoading ? t.searching : t.searchButton}
      </button>
    </form>
  );
}
