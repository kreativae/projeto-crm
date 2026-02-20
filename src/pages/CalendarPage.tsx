import { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calendarEvents as mockEvents } from '@/data/mockData';
import {
  Plus, ChevronLeft, ChevronRight, Clock, User, X,
  Video, Phone as PhoneIcon, Play, Calendar as CalIcon,
  Edit2, Trash2, Check, GripVertical, Move, ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';

/* ================================================================
   TYPES
================================================================ */
interface CalEvent {
  id: string; title: string; description: string; date: string; time: string;
  duration: number; type: string; leadName?: string; responsible: string;
}

/* ================================================================
   CONFIG
================================================================ */
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; gradient: string; border: string; text: string; icon: React.ElementType }> = {
  reuniao:  { label: 'Reunião',   color: 'bg-indigo-500',  bg: 'bg-indigo-50',  gradient: 'from-indigo-500 to-indigo-600', border: 'border-indigo-200', text: 'text-indigo-700', icon: Video },
  ligacao:  { label: 'Ligação',   color: 'bg-emerald-500', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-600',  border: 'border-emerald-200', text: 'text-emerald-700', icon: PhoneIcon },
  followup: { label: 'Follow-up', color: 'bg-amber-500',   bg: 'bg-amber-50',   gradient: 'from-amber-500 to-orange-500', border: 'border-amber-200', text: 'text-amber-700', icon: Clock },
  demo:     { label: 'Demo',      color: 'bg-purple-500',  bg: 'bg-purple-50',  gradient: 'from-purple-500 to-violet-600', border: 'border-purple-200', text: 'text-purple-700', icon: Play },
  outro:    { label: 'Outro',     color: 'bg-slate-500',   bg: 'bg-slate-50',   gradient: 'from-slate-500 to-slate-600',  border: 'border-slate-200', text: 'text-slate-700', icon: CalIcon },
};

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

/* ================================================================
   HELPER: format date string from day/month/year
================================================================ */
function dateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/* ================================================================
   DRAGGABLE EVENT CHIP
================================================================ */
function EventChip({ ev, onClick, onDragStart }: { ev: CalEvent; onClick: () => void; onDragStart: (e: React.DragEvent) => void }) {
  const tc = TYPE_CONFIG[ev.type] || TYPE_CONFIG.outro;
  const Icon = tc.icon;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        'group relative flex items-center gap-1 px-1.5 py-1 rounded-lg cursor-grab active:cursor-grabbing transition-all text-[10px] font-semibold border shadow-sm',
        tc.bg, tc.border, tc.text,
        'hover:shadow-md hover:z-10 hover:scale-[1.04] hover:-translate-y-px active:scale-[0.97]'
      )}
      title={`Arraste para reagendar: ${ev.title}`}
    >
      <GripVertical className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
      <div className={cn('h-4 w-4 rounded flex items-center justify-center flex-shrink-0', tc.color)}>
        <Icon className="h-2.5 w-2.5 text-white" />
      </div>
      <span className="truncate flex-1">{ev.time.slice(0, 5)}</span>
      <span className="truncate flex-1 hidden sm:inline">{ev.title}</span>
    </div>
  );
}

/* ================================================================
   CALENDAR DAY CELL (Drop Target)
================================================================ */
function DayCell({
  day, isToday, events, onEventClick, onDragStart, onDrop, onEmptyClick
}: {
  day: number | null; isToday: boolean;
  events: CalEvent[]; onEventClick: (ev: CalEvent) => void;
  onDragStart: (e: React.DragEvent, ev: CalEvent) => void;
  onDrop: (day: number) => void; onEmptyClick: (day: number) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set false if we actually left this cell
    if (ref.current && !ref.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (day) onDrop(day);
  }, [day, onDrop]);

  if (!day) {
    return <div className="min-h-[110px] bg-slate-50/40 border-b border-r border-slate-100/40" />;
  }

  return (
    <div
      ref={ref}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => events.length === 0 && onEmptyClick(day)}
      className={cn(
        'min-h-[110px] p-1.5 border-b border-r border-slate-100/60 transition-all duration-200 relative',
        'hover:bg-indigo-50/20 cursor-pointer',
        isToday && 'bg-indigo-50/40',
        isDragOver && 'bg-indigo-100/60 ring-2 ring-inset ring-indigo-400/50 scale-[1.01]',
      )}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          'text-xs font-bold leading-none transition-all',
          isToday
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white h-6 w-6 rounded-full flex items-center justify-center shadow-md shadow-indigo-600/30'
            : 'text-slate-600'
        )}>{day}</span>

        {/* Drop indicator icon */}
        {isDragOver && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center"
          >
            <ArrowRight className="h-3 w-3 text-white" />
          </motion.div>
        )}

        {/* Dot indicators when no drag */}
        {!isDragOver && events.length > 0 && !isToday && (
          <span className="flex gap-0.5">
            {events.slice(0, 3).map(e => (
              <span key={e.id} className={cn('h-1.5 w-1.5 rounded-full', (TYPE_CONFIG[e.type] || TYPE_CONFIG.outro).color)} />
            ))}
          </span>
        )}
      </div>

      {/* Event Chips */}
      <div className="space-y-0.5">
        {events.slice(0, 3).map(ev => (
          <EventChip
            key={ev.id}
            ev={ev}
            onClick={() => onEventClick(ev)}
            onDragStart={(e) => onDragStart(e, ev)}
          />
        ))}
        {events.length > 3 && (
          <span className="text-[10px] text-indigo-600 font-bold pl-1">+{events.length - 3} mais</span>
        )}
      </div>

      {/* Drop zone pulse */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-1 border-2 border-dashed border-indigo-400/50 rounded-xl" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              Soltar aqui — dia {day}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 15));
  const [events, setEvents] = useState<CalEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalEvent | null>(null);
  const [lastDrop, setLastDrop] = useState<{ eventId: string; fromDate: string; toDate: string } | null>(null);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '10:00', duration: 30, type: 'reuniao', leadName: '', responsible: '' });

  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() === m;

  const cells = useMemo(() => {
    const c: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) c.push(null);
    for (let i = 1; i <= daysInMonth; i++) c.push(i);
    return c;
  }, [firstDay, daysInMonth]);

  const getEventsForDay = useCallback((day: number) => {
    const ds = dateStr(y, m, day);
    return events.filter(e => e.date === ds);
  }, [events, y, m]);

  const upcomingEvents = useMemo(() => {
    return [...events].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).slice(0, 8);
  }, [events]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return counts;
  }, [events]);

  /* ---- Drag & Drop Handlers ---- */
  const handleDragStart = useCallback((e: React.DragEvent, ev: CalEvent) => {
    setDraggedEvent(ev);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ev.id);

    // Ghost image
    const ghost = document.createElement('div');
    ghost.className = 'bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl';
    ghost.textContent = `📅 ${ev.title}`;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  }, []);

  const handleDrop = useCallback((targetDay: number) => {
    if (!draggedEvent) return;

    const newDate = dateStr(y, m, targetDay);
    if (newDate === draggedEvent.date) {
      setDraggedEvent(null);
      return;
    }

    const fromDate = draggedEvent.date;

    // Update locally
    setEvents(prev => prev.map(e =>
      e.id === draggedEvent.id ? { ...e, date: newDate } : e
    ));

    // Show undo toast
    setLastDrop({ eventId: draggedEvent.id, fromDate, toDate: newDate });

    // Clear after 5 seconds
    setTimeout(() => setLastDrop(null), 5000);

    // Backend call (fire and forget, falls back to mock)
    try {
      fetch(`http://localhost:4000/api/calendar/${draggedEvent.id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ newDate, newTime: draggedEvent.time })
      }).catch(() => { /* Backend offline, local state is already updated */ });
    } catch { /* ignore */ }

    setDraggedEvent(null);
  }, [draggedEvent, y, m]);

  const handleUndoDrop = useCallback(() => {
    if (!lastDrop) return;
    setEvents(prev => prev.map(e =>
      e.id === lastDrop.eventId ? { ...e, date: lastDrop.fromDate } : e
    ));

    // Undo in backend too
    try {
      fetch(`http://localhost:4000/api/calendar/${lastDrop.eventId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ newDate: lastDrop.fromDate })
      }).catch(() => {});
    } catch { /* ignore */ }

    setLastDrop(null);
  }, [lastDrop]);

  /* ---- CRUD Handlers ---- */
  const handleCreate = () => {
    if (!newEvent.title || !newEvent.date) return;
    const created: CalEvent = { ...newEvent, id: 'e-' + Date.now() };
    setEvents(prev => [...prev, created]);
    setShowCreateModal(false);
    setNewEvent({ title: '', description: '', date: '', time: '10:00', duration: 30, type: 'reuniao', leadName: '', responsible: '' });
  };

  const handleEdit = () => {
    if (!editingEvent) return;
    setEvents(prev => prev.map(e => e.id === editingEvent.id ? editingEvent : e));
    setEditingEvent(null);
    setSelectedEvent(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remover este evento?')) return;
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
  };

  const handleEmptyDayClick = (day: number) => {
    const d = dateStr(y, m, day);
    setNewEvent(prev => ({ ...prev, date: d }));
    setShowCreateModal(true);
  };

  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agenda</h1>
          <p className="text-slate-500 text-sm mt-1">
            {events.length} eventos • <span className="text-indigo-600 font-medium">Arraste e solte</span> para reagendar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={goToday}
            className="px-4 py-2.5 border border-slate-200/60 rounded-xl text-sm text-slate-600 hover:bg-white/80 bg-white/50 font-medium">
            Hoje
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
            <Plus className="h-4 w-4" /> Novo Evento
          </motion.button>
        </div>
      </motion.div>

      {/* Drag hint bar */}
      {draggedEvent && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-3 flex items-center gap-3"
        >
          <div className="h-8 w-8 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Move className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              Arrastando: <span className="text-indigo-600">{draggedEvent.title}</span>
            </p>
            <p className="text-xs text-indigo-600/70">Solte em qualquer dia do calendário para reagendar</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={cn(
            'lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden transition-all duration-300',
            draggedEvent ? 'border-indigo-300 shadow-indigo-100/50 shadow-lg' : 'border-slate-200/60'
          )}>
          {/* Month Nav */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900">{MONTHS[m]} {y}</h2>
              {isCurrentMonth && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100">Mês atual</span>}
            </div>
            <div className="flex items-center gap-1">
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setCurrentDate(new Date(y, m - 1, 1))}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft className="h-5 w-5 text-slate-600" /></motion.button>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setCurrentDate(new Date(y, m + 1, 1))}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight className="h-5 w-5 text-slate-600" /></motion.button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map(d => (
              <div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isToday = isCurrentMonth && day === today.getDate();
              return (
                <DayCell
                  key={i}
                  day={day}
                  isToday={isToday}
                  events={dayEvents}
                  onEventClick={setSelectedEvent}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onEmptyClick={handleEmptyDayClick}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-4">
          {/* Drag & Drop tip card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Move className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-indigo-900 text-sm">Arrastar & Soltar</h3>
            </div>
            <p className="text-xs text-indigo-700/70 leading-relaxed">
              Clique e arraste qualquer evento para outro dia do calendário para reagendá-lo instantaneamente.
            </p>
          </div>

          {/* Mini Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Resumo</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'outro').map(([key, cfg]) => {
                const count = typeCounts[key] || 0;
                const Icon = cfg.icon;
                return (
                  <div key={key} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                    <div className={cn('h-7 w-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-white', cfg.gradient)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{count}</p>
                      <p className="text-[10px] text-slate-500">{cfg.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Próximos Eventos</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {upcomingEvents.map(ev => {
                const tc = TYPE_CONFIG[ev.type] || TYPE_CONFIG.outro;
                const Icon = tc.icon;
                return (
                  <motion.div key={ev.id} whileHover={{ x: 3 }} onClick={() => setSelectedEvent(ev)}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-100/60 hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className={cn('h-9 w-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0 shadow-sm', tc.gradient)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{ev.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          <span className="flex items-center gap-0.5"><CalIcon className="h-2.5 w-2.5" />{ev.date}</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{ev.time}</span>
                        </div>
                        {ev.leadName && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            <User className="h-2.5 w-2.5" />{ev.leadName}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================================================
         UNDO TOAST (after drag & drop)
      ============================================================ */}
      <AnimatePresence>
        {lastDrop && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-slate-900/30">
              <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Evento reagendado!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lastDrop.fromDate} → <span className="text-indigo-400 font-medium">{lastDrop.toDate}</span>
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUndoDrop}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors border border-white/10"
              >
                Desfazer
              </motion.button>
              <button onClick={() => setLastDrop(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
         EVENT DETAIL MODAL
      ============================================================ */}
      <AnimatePresence>
        {selectedEvent && !editingEvent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              {(() => {
                const tc = TYPE_CONFIG[selectedEvent.type] || TYPE_CONFIG.outro;
                const Icon = tc.icon;
                return (
                  <>
                    <div className={cn('bg-gradient-to-r p-6 text-white relative', tc.gradient)}>
                      <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-lg hover:bg-white/30"><X className="h-4 w-4" /></button>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-xs font-medium opacity-80">{tc.label}</span>
                          <h2 className="text-lg font-bold">{selectedEvent.title}</h2>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm opacity-90">
                        <span className="flex items-center gap-1"><CalIcon className="h-3.5 w-3.5" />{selectedEvent.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{selectedEvent.time}</span>
                        <span>{selectedEvent.duration}min</span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {selectedEvent.description && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-sm text-slate-700">{selectedEvent.description}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {selectedEvent.leadName && (
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</label>
                            <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1"><User className="h-3.5 w-3.5 text-indigo-500" />{selectedEvent.leadName}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responsável</label>
                          <p className="text-sm font-semibold text-slate-900 mt-1">{selectedEvent.responsible}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-3 border-t border-slate-100">
                        <button onClick={() => { setEditingEvent({ ...selectedEvent }); }}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"><Edit2 className="h-4 w-4" />Editar</button>
                        <button onClick={() => handleDelete(selectedEvent.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50"><Trash2 className="h-4 w-4" />Cancelar</button>
                        <button onClick={() => { setSelectedEvent(null); }}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-semibold hover:bg-emerald-100"><Check className="h-4 w-4" />Concluir</button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
         EDIT EVENT MODAL
      ============================================================ */}
      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingEvent(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Editar Evento</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Altere os dados e salve</p>
                </div>
                <button onClick={() => setEditingEvent(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Título</label>
                  <input value={editingEvent.title} onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'outro').map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button key={key} onClick={() => setEditingEvent({ ...editingEvent, type: key })}
                          className={cn('p-3 rounded-xl border text-center transition-all', editingEvent.type === key
                            ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50')}>
                          <div className={cn('h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mx-auto mb-1.5 shadow-sm', cfg.gradient)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data</label>
                    <input type="date" value={editingEvent.date} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Horário</label>
                    <input type="time" value={editingEvent.time} onChange={e => setEditingEvent({ ...editingEvent, time: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duração</label>
                    <select value={editingEvent.duration} onChange={e => setEditingEvent({ ...editingEvent, duration: Number(e.target.value) })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                      <option value={15}>15 min</option><option value={30}>30 min</option>
                      <option value={45}>45 min</option><option value={60}>1 hora</option><option value={90}>1h30</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cliente</label>
                    <input value={editingEvent.leadName || ''} onChange={e => setEditingEvent({ ...editingEvent, leadName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Nome do cliente" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Responsável</label>
                    <input value={editingEvent.responsible} onChange={e => setEditingEvent({ ...editingEvent, responsible: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Responsável" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição</label>
                  <textarea value={editingEvent.description} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none h-20" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button onClick={() => setEditingEvent(null)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleEdit}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
                  Salvar Alterações
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
         CREATE EVENT MODAL
      ============================================================ */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Novo Evento</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Agende um compromisso</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Título</label>
                  <input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all" placeholder="Ex: Reunião com cliente" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'outro').map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button key={key} onClick={() => setNewEvent({ ...newEvent, type: key })}
                          className={cn('p-3 rounded-xl border text-center transition-all', newEvent.type === key
                            ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50')}>
                          <div className={cn('h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mx-auto mb-1.5 shadow-sm', cfg.gradient)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data</label>
                    <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Horário</label>
                    <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duração</label>
                    <select value={newEvent.duration} onChange={e => setNewEvent({ ...newEvent, duration: Number(e.target.value) })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                      <option value={15}>15 min</option><option value={30}>30 min</option>
                      <option value={45}>45 min</option><option value={60}>1 hora</option><option value={90}>1h30</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cliente</label>
                    <input value={newEvent.leadName} onChange={e => setNewEvent({ ...newEvent, leadName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Nome do cliente" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Responsável</label>
                    <input value={newEvent.responsible} onChange={e => setNewEvent({ ...newEvent, responsible: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Responsável" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição</label>
                  <textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none h-20" placeholder="Detalhes do evento..." />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={!newEvent.title || !newEvent.date}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                  Criar Evento
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
