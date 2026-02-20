import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Building2, MessageSquare, Calendar, Zap, FileText, ArrowRight, Hash, X } from 'lucide-react';
import { leads, conversations, automations, calendarEvents } from '@/data/mockData';
import { cn } from '@/utils/cn';

interface SearchResult {
  id: string;
  type: 'lead' | 'conversation' | 'automation' | 'event';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  path?: string;
}

const typeConfig = {
  lead: { icon: User, color: 'bg-indigo-50 text-indigo-600', label: 'Lead' },
  conversation: { icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600', label: 'Conversa' },
  automation: { icon: Zap, color: 'bg-amber-50 text-amber-600', label: 'Automação' },
  event: { icon: Calendar, color: 'bg-purple-50 text-purple-600', label: 'Evento' },
};

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsOpen(true); }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 100); }
    else { setQuery(''); setResults([]); setSelectedIndex(0); }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const r: SearchResult[] = [];

    leads.filter(l => l.name.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q))
      .slice(0, 4).forEach(l => r.push({ id: l.id, type: 'lead', title: l.name, subtitle: `${l.company || l.email} · ${l.status}`, icon: l.type === 'PJ' ? Building2 : User, color: 'bg-indigo-50 text-indigo-600' }));

    conversations.filter(c => c.leadName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q))
      .slice(0, 3).forEach(c => r.push({ id: c.id, type: 'conversation', title: c.leadName, subtitle: `${c.channel} · ${c.lastMessage.slice(0, 50)}...`, icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600' }));

    automations.filter(a => a.name.toLowerCase().includes(q))
      .slice(0, 2).forEach(a => r.push({ id: a.id, type: 'automation', title: a.name, subtitle: `${a.status === 'active' ? 'Ativa' : 'Inativa'} · ${a.executionCount} execuções`, icon: Zap, color: 'bg-amber-50 text-amber-600' }));

    calendarEvents.filter(e => e.title.toLowerCase().includes(q) || e.leadName?.toLowerCase().includes(q))
      .slice(0, 2).forEach(e => r.push({ id: e.id, type: 'event', title: e.title, subtitle: `${e.date} ${e.time} · ${e.leadName || ''}`, icon: Calendar, color: 'bg-purple-50 text-purple-600' }));

    setResults(r);
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIndex]) { setIsOpen(false); }
  };

  return (
    <>
      {/* Trigger */}
      <button onClick={() => setIsOpen(true)}
        className="relative hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all w-64 lg:w-80 group">
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar em tudo...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-mono text-slate-400 group-hover:border-slate-300">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[80]" ref={containerRef}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <div className="flex items-start justify-center pt-[15vh] px-4">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/60"
              >
                {/* Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                  <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar leads, conversas, automações, eventos..."
                    className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-100 rounded-lg"><X className="h-4 w-4 text-slate-400" /></button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-400">ESC</button>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto">
                  {query && results.length === 0 && (
                    <div className="text-center py-12 px-6">
                      <Hash className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600">Nenhum resultado para "{query}"</p>
                      <p className="text-xs text-slate-400 mt-1">Tente buscar por nome, email ou empresa</p>
                    </div>
                  )}
                  {!query && (
                    <div className="px-5 py-6 text-center">
                      <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Digite para buscar em leads, conversas, automações e eventos</p>
                    </div>
                  )}
                  {results.length > 0 && (
                    <div className="py-2">
                      {Object.entries(typeConfig).map(([type, cfg]) => {
                        const typeResults = results.filter(r => r.type === type);
                        if (typeResults.length === 0) return null;
                        return (
                          <div key={type}>
                            <div className="px-5 py-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cfg.label}s</span>
                            </div>
                            {typeResults.map((result, i) => {
                              const globalIndex = results.indexOf(result);
                              const Icon = result.icon;
                              return (
                                <motion.button
                                  key={result.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  onClick={() => setIsOpen(false)}
                                  className={cn(
                                    'w-full flex items-center gap-3 px-5 py-3 text-left transition-colors',
                                    globalIndex === selectedIndex ? 'bg-indigo-50' : 'hover:bg-slate-50'
                                  )}
                                >
                                  <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0', result.color)}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{result.title}</p>
                                    <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                                  </div>
                                  <ArrowRight className={cn('h-4 w-4 flex-shrink-0 transition-opacity', globalIndex === selectedIndex ? 'text-indigo-500 opacity-100' : 'opacity-0')} />
                                </motion.button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑↓</kbd> navegar</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd> abrir</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">esc</kbd> fechar</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
