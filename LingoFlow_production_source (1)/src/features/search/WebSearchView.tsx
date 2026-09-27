import React, { useState } from 'react';
import { Search, ExternalLink, Loader2, Globe2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface SearchResult {
  title: string;
  uri: string;
}

export function WebSearchView() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<SearchResult[]>([]);
  const [searchedQueries, setSearchedQueries] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const runSearch = async () => {
    if (!query.trim()) return;
    setStatus('searching');
    setError('');
    try {
      const res = await fetch('/api/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Web search failed');
      setAnswer(data.answer || '');
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setSearchedQueries(Array.isArray(data.queries) ? data.queries : []);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Web search failed');
      setAnswer('');
      setSources([]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5B5FEF]">
          <Globe2 className="w-4 h-4" />
          Live Web Grounding
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Web Search
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Ask for current information and LingoFlow will ground the response with Google Search when the online AI service is available.
        </p>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); void runSearch(); }}
        className="flex gap-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111827]/80 backdrop-blur"
      >
        <Search className="w-5 h-5 m-3 text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the web..."
          className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white"
          aria-label="Web search query"
        />
        <Button type="submit" variant="primary" disabled={status === 'searching' || !query.trim()}>
          {status === 'searching' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      {status === 'error' && (
        <div className="flex items-start gap-2 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {status === 'success' && (
        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6">
            <div className="text-sm leading-7 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{answer}</div>
          </article>

          {searchedQueries.length > 0 && (
            <div className="text-[11px] text-slate-400">
              Search queries used: {searchedQueries.join(' · ')}
            </div>
          )}

          {sources.length > 0 && (
            <div className="grid gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sources</h2>
              {sources.map((source, index) => (
                <a
                  key={`${source.uri}-${index}`}
                  href={source.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{source.title}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
