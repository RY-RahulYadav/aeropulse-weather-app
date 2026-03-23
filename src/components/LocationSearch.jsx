import { Search, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { searchLocations } from '../api/openMeteo';

export default function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      searchLocations(query)
        .then((items) => {
          setResults(items);
          setOpen(true);
        })
        .catch(() => {
          setResults([]);
          setOpen(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  function selectLocation(item) {
    onSelect(item);
    setQuery(item.label);
    setOpen(false);
  }

  return (
    <div className="relative z-50 w-full max-w-sm">
      <div className="glass flex items-center gap-2 rounded-2xl px-3 py-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <Search className="h-4 w-4 text-slate-500" />}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Search city or town"
          aria-label="Search location"
        />
      </div>

      {open ? (
        <div className="absolute z-[80] mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {results.length === 0 ? <p className="px-2 py-2 text-sm text-slate-500">No locations found.</p> : null}
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectLocation(item)}
              className="flex w-full flex-col rounded-xl px-2 py-2 text-left hover:bg-slate-100/70 dark:hover:bg-slate-700/40"
            >
              <span className="text-sm font-semibold">{item.name}</span>
              <span className="text-xs text-slate-500">{item.admin1 ? `${item.admin1}, ` : ''}{item.country}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
