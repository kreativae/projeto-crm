import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { automations as initialAutomations } from '@/data/mockData';
import {
  Plus, Edit2, Trash2, Zap, Clock, Play, Pause, ChevronLeft
} from 'lucide-react';
import { cn } from '@/utils/cn';

const c = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const ci = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

/* ==================== AUTOMATIONS ==================== */
export function AutomationsPage() {
  const [automations, setAutomations] = useState(initialAutomations);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<typeof initialAutomations[0] | null>(null);

  const triggers: Record<string, string> = { 'Novo lead via WhatsApp': '💬', 'Lead sem resposta há 48h': '⏰', 'Novo lead cadastrado': '🔄', 'Lead movido para Qualificado': '⬆️', 'Data de aniversário': '🎂', 'Lead marcado como perdido há 30 dias': '🔁' };

  const handleToggle = (id: string, auto: typeof initialAutomations[0]) => {
    if (expandedId === id) { setExpandedId(null); setEditForm(null); }
    else { setExpandedId(id); setEditForm({ ...auto }); }
  };

  const handleSave = () => {
    if (!editForm) return;
    setAutomations(prev => prev.map(a => a.id === editForm.id ? editForm : a));
    setExpandedId(null); setEditForm(null);
  };

  const handleActionChange = (index: number, value: string) => {
    if (!editForm) return;
    const newActions = [...editForm.actions]; newActions[index] = value;
    setEditForm({ ...editForm, actions: newActions });
  };

  const addAction = () => { if (!editForm) return; setEditForm({ ...editForm, actions: [...editForm.actions, 'Nova ação'] }); };
  const removeAction = (index: number) => { if (!editForm) return; setEditForm({ ...editForm, actions: editForm.actions.filter((_, i) => i !== index) }); };

  const handleToggleStatus = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' as const : 'active' as const } : a));
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 tracking-tight">Automações</h1><p className="text-slate-500 text-sm mt-1">Fluxos automáticos</p></div>
        <motion.button whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25"><Plus className="h-4 w-4" /> Nova</motion.button>
      </motion.div>

      <motion.div variants={c} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ label: 'Ativas', value: automations.filter(a => a.status === 'active').length, icon: Play, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Execuções', value: automations.reduce((a, b) => a + b.executionCount, 0), icon: Zap, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Economia', value: '48h/mês', icon: Clock, color: 'text-amber-600 bg-amber-50' }].map(s => (
          <motion.div key={s.label} variants={ci} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 flex items-center gap-4 shadow-sm">
            <div className={cn('h-11 w-11 rounded-2xl flex items-center justify-center', s.color)}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={c} initial="hidden" animate="show" className="space-y-3">
        {automations.map((auto) => (
          <motion.div layout key={auto.id} variants={ci}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 flex items-start justify-between cursor-pointer" onClick={() => handleToggle(auto.id, auto)}>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xl flex-shrink-0 border border-indigo-100/50">
                  {triggers[auto.trigger] || '⚡'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{auto.name}</h3>
                    <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-bold border', auto.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100')}>
                      {auto.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Gatilho: {auto.trigger}</p>
                  <div className="flex flex-wrap gap-1.5">{auto.actions.map((a, i) => <span key={i} className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-lg">{i+1}. {a}</span>)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <span className="text-xs text-slate-400 font-medium">{auto.executionCount}x</span>
                <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); handleToggleStatus(auto.id); }}
                  className={cn('p-2 rounded-xl transition-colors', auto.status === 'active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50')}>
                  {auto.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</motion.button>
                <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); handleToggle(auto.id, auto); }}
                  className={cn("p-2 rounded-xl transition-colors", expandedId === auto.id ? "bg-indigo-100 text-indigo-600" : "text-slate-400 hover:bg-slate-50")}>
                  {expandedId === auto.id ? <ChevronLeft className="h-4 w-4 rotate-[-90deg]" /> : <Edit2 className="h-4 w-4" />}
                </motion.button>
              </div>
            </div>
            <AnimatePresence>
              {expandedId === auto.id && editForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }} className="bg-slate-50/50 border-t border-slate-100">
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Nome</label>
                        <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Gatilho</label>
                        <select value={editForm.trigger} onChange={(e) => setEditForm({...editForm, trigger: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
                          {Object.keys(triggers).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Ações do Fluxo</label>
                        <button onClick={addAction} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><Plus className="h-3 w-3" /> Adicionar</button>
                      </div>
                      <div className="space-y-2">
                        {editForm.actions.map((action, index) => (
                          <motion.div layout key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                            <span className="flex-shrink-0 w-6 h-9 flex items-center justify-center bg-slate-100 rounded-lg text-xs font-bold text-slate-500">{index + 1}</span>
                            <input value={action} onChange={(e) => handleActionChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                            <button onClick={() => removeAction(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button onClick={() => setExpandedId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                      <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Salvar</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
