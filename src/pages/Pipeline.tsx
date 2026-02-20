import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { leads as mockLeads } from '@/data/mockData';
import leadService from '@/services/leadService';
import {
  GripVertical, Phone, Building2, Plus, DollarSign, Mail, X,
  Tag, Globe, User, Calendar, FileText, Trash2, Save, Edit3,
  Eye, ChevronDown, MapPin, Briefcase, Hash, MessageSquare,
  TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import SlideOver from '@/components/ui/SlideOver';

interface PipelineLead {
  _id: string; name: string; email: string; phone: string; mobile?: string;
  company?: string; status: string; source: string; tags: string[];
  value: number; createdAt: string; responsible?: string; type?: string;
  document?: string; temperature?: string; notes?: string;
  address?: { street?: string; city?: string; state?: string; zip?: string };
}

const STAGE_CONFIG = [
  { id: 'novo', name: 'Novo', color: '#6366f1', gradient: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'contatado', name: 'Contatado', color: '#3b82f6', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'qualificado', name: 'Qualificado', color: '#a855f7', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'proposta', name: 'Proposta', color: '#f59e0b', gradient: 'from-amber-500 to-amber-600', light: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'negociacao', name: 'Negociação', color: '#f97316', gradient: 'from-orange-500 to-orange-600', light: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'ganho', name: 'Ganho', color: '#10b981', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'perdido', name: 'Perdido', color: '#ef4444', gradient: 'from-red-500 to-red-600', light: 'bg-red-50 text-red-700 border-red-200' },
];

const SOURCES = ['Site', 'Indicação', 'WhatsApp', 'Instagram', 'Facebook', 'Google Ads', 'LinkedIn', 'Telefone', 'Email', 'Outro'];
const TEMPERATURES = ['frio', 'morno', 'quente'];

const emptyLead: Partial<PipelineLead> = {
  name: '', email: '', phone: '', mobile: '', company: '', status: 'novo',
  source: 'Site', tags: [], value: 0, type: 'PF', document: '',
  temperature: 'morno', notes: '',
  address: { street: '', city: '', state: '', zip: '' }
};

export function PipelinePage() {
  const [leads, setLeads] = useState<PipelineLead[]>(() =>
    mockLeads.map(l => ({
      _id: l.id, name: l.name, email: l.email, phone: l.phone,
      company: l.company, status: l.status, source: l.source,
      tags: l.tags, value: l.value, createdAt: l.createdAt,
      responsible: l.responsible, type: 'PF', temperature: 'morno'
    }))
  );

  // Drag & Drop
  const [draggedLead, setDraggedLead] = useState<{ lead: PipelineLead; fromStage: string } | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // SlideOver (View/Edit)
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [slideMode, setSlideMode] = useState<'view' | 'edit'>('view');
  const [editForm, setEditForm] = useState<Partial<PipelineLead>>({});

  // Modal (Create)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<PipelineLead>>({ ...emptyLead });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Tags input
  const [tagInput, setTagInput] = useState('');
  const [createTagInput, setCreateTagInput] = useState('');
  const tagRef = useRef<HTMLInputElement>(null);
  const createTagRef = useRef<HTMLInputElement>(null);

  const stages = useMemo(() =>
    STAGE_CONFIG.map(s => ({ ...s, leads: leads.filter(l => l.status === s.id) })),
    [leads]
  );

  const totalValue = leads.reduce((a, l) => a + (l.value || 0), 0);
  const totalLeads = leads.length;

  // === TOAST ===
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // === DRAG & DROP ===
  const handleDragStart = (e: React.DragEvent, lead: PipelineLead, fromStage: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead._id);
    // Pequeno delay para garantir que o estado é setado após o evento
    setTimeout(() => {
      setDraggedLead({ lead, fromStage });
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Só limpa se realmente saiu da coluna (não apenas passou sobre um filho)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, toStageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedLead || draggedLead.fromStage === toStageId) {
      setDraggedLead(null);
      setDragOverStage(null);
      return;
    }
    
    const leadId = draggedLead.lead._id;
    const leadName = draggedLead.lead.name;
    const stageName = STAGE_CONFIG.find(s => s.id === toStageId)?.name;
    
    // Atualiza o estado imediatamente (otimista)
    setLeads(currentLeads => 
      currentLeads.map(l => l._id === leadId ? { ...l, status: toStageId } : l)
    );
    setDraggedLead(null);
    setDragOverStage(null);

    // Mostra toast de sucesso imediatamente
    showToast(`"${leadName}" movido para ${stageName}`);

    // Tenta sincronizar com o backend (não bloqueia e não reverte em caso de erro)
    try {
      await leadService.update(leadId, { status: toStageId });
    } catch {
      // Backend offline - mantém a mudança local (modo offline)
      console.log('Backend offline - alteração salva localmente');
    }
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  // === CREATE ===
  const handleCreate = async () => {
    if (!createForm.name?.trim()) return;
    setSaving(true);
    try {
      const res = await leadService.create(createForm);
      const newLead: PipelineLead = {
        _id: res._id || `local-${Date.now()}`,
        name: createForm.name || '',
        email: createForm.email || '',
        phone: createForm.phone || '',
        mobile: createForm.mobile || '',
        company: createForm.company || '',
        status: createForm.status || 'novo',
        source: createForm.source || 'Site',
        tags: createForm.tags || [],
        value: createForm.value || 0,
        createdAt: new Date().toISOString(),
        type: createForm.type || 'PF',
        document: createForm.document || '',
        temperature: createForm.temperature || 'morno',
        notes: createForm.notes || '',
        address: createForm.address,
      };
      setLeads(p => [...p, newLead]);
      showToast('Lead criado com sucesso!');
      setShowCreateModal(false);
      setCreateForm({ ...emptyLead });
      setCreateTagInput('');
    } catch {
      // Fallback local
      const newLead: PipelineLead = {
        _id: `local-${Date.now()}`,
        name: createForm.name || '',
        email: createForm.email || '',
        phone: createForm.phone || '',
        mobile: createForm.mobile || '',
        company: createForm.company || '',
        status: createForm.status || 'novo',
        source: createForm.source || 'Site',
        tags: createForm.tags || [],
        value: createForm.value || 0,
        createdAt: new Date().toISOString(),
        type: createForm.type || 'PF',
        document: createForm.document || '',
        temperature: createForm.temperature || 'morno',
        notes: createForm.notes || '',
        address: createForm.address,
      };
      setLeads(p => [...p, newLead]);
      showToast('Lead criado localmente');
      setShowCreateModal(false);
      setCreateForm({ ...emptyLead });
      setCreateTagInput('');
    } finally {
      setSaving(false);
    }
  };

  // === UPDATE ===
  const handleUpdate = async () => {
    if (!selectedLead || !editForm.name?.trim()) return;
    setSaving(true);
    try {
      await leadService.update(selectedLead._id, editForm);
      setLeads(p => p.map(l => l._id === selectedLead._id ? { ...l, ...editForm } as PipelineLead : l));
      setSelectedLead({ ...selectedLead, ...editForm } as PipelineLead);
      setSlideMode('view');
      showToast('Lead atualizado com sucesso!');
    } catch {
      setLeads(p => p.map(l => l._id === selectedLead._id ? { ...l, ...editForm } as PipelineLead : l));
      setSelectedLead({ ...selectedLead, ...editForm } as PipelineLead);
      setSlideMode('view');
      showToast('Lead atualizado localmente');
    } finally {
      setSaving(false);
    }
  };

  // === DELETE ===
  const handleDelete = async (lead: PipelineLead) => {
    if (!confirm(`Excluir "${lead.name}"? Essa ação não pode ser desfeita.`)) return;
    const prev = [...leads];
    setLeads(p => p.filter(l => l._id !== lead._id));
    setSelectedLead(null);
    try {
      await leadService.delete(lead._id);
      showToast('Lead excluído');
    } catch {
      setLeads(prev);
    }
  };

  // === TAG HELPERS ===
  const addTag = (form: Partial<PipelineLead>, setForm: (f: Partial<PipelineLead>) => void, tag: string) => {
    if (tag.trim() && !(form.tags || []).includes(tag.trim())) {
      setForm({ ...form, tags: [...(form.tags || []), tag.trim()] });
    }
  };
  const removeTag = (form: Partial<PipelineLead>, setForm: (f: Partial<PipelineLead>) => void, tag: string) => {
    setForm({ ...form, tags: (form.tags || []).filter(t => t !== tag) });
  };

  // === OPEN EDIT ===
  const openEdit = (lead: PipelineLead) => {
    setSelectedLead(lead);
    setEditForm({ ...lead });
    setSlideMode('edit');
    setTagInput('');
  };

  const openView = (lead: PipelineLead) => {
    setSelectedLead(lead);
    setSlideMode('view');
  };

  // === INPUT COMPONENT ===
  const FormInput = ({ label, icon: Icon, value, onChange, type = 'text', placeholder = '', required = false }: {
    label: string; icon: typeof Mail; value: string | number; onChange: (v: string) => void;
    type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all
          placeholder:text-slate-400" />
    </div>
  );

  // === FORM FIELDS (reusable for create/edit) ===
  const renderFormFields = (
    form: Partial<PipelineLead>,
    setForm: (f: Partial<PipelineLead>) => void,
    currentTagInput: string,
    setCurrentTagInput: (v: string) => void,
    currentTagRef: React.RefObject<HTMLInputElement | null>
  ) => (
    <div className="space-y-5">
      {/* Tipo PF/PJ */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tipo</label>
        <div className="flex gap-2">
          {['PF', 'PJ'].map(t => (
            <button key={t} onClick={() => setForm({ ...form, type: t })}
              className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border',
                form.type === t
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300')}>
              {t === 'PF' ? '👤 Pessoa Física' : '🏢 Pessoa Jurídica'}
            </button>
          ))}
        </div>
      </div>

      {/* Nome e Documento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="Nome completo" icon={User} value={form.name || ''} required
          onChange={v => setForm({ ...form, name: v })} placeholder="Nome do lead" />
        <FormInput label={form.type === 'PJ' ? 'CNPJ' : 'CPF'} icon={Hash} value={form.document || ''}
          onChange={v => setForm({ ...form, document: v })} placeholder={form.type === 'PJ' ? '00.000.000/0001-00' : '000.000.000-00'} />
      </div>

      {/* Contato */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="Email" icon={Mail} value={form.email || ''} type="email"
          onChange={v => setForm({ ...form, email: v })} placeholder="email@exemplo.com" />
        <FormInput label="Telefone" icon={Phone} value={form.phone || ''}
          onChange={v => setForm({ ...form, phone: v })} placeholder="(11) 99999-0000" />
      </div>

      {/* Empresa */}
      {form.type === 'PJ' && (
        <FormInput label="Empresa" icon={Building2} value={form.company || ''}
          onChange={v => setForm({ ...form, company: v })} placeholder="Nome da empresa" />
      )}

      {/* Valor e Origem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="Valor do deal (R$)" icon={DollarSign} value={form.value || 0} type="number"
          onChange={v => setForm({ ...form, value: parseFloat(v) || 0 })} placeholder="0" />
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Origem
          </label>
          <select value={form.source || 'Site'} onChange={e => setForm({ ...form, source: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all">
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Etapa e Temperatura */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Etapa do Pipeline
          </label>
          <select value={form.status || 'novo'} onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all">
            {STAGE_CONFIG.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" /> Temperatura
          </label>
          <div className="flex gap-2">
            {TEMPERATURES.map(t => (
              <button key={t} onClick={() => setForm({ ...form, temperature: t })}
                className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border text-center',
                  form.temperature === t
                    ? t === 'quente' ? 'bg-red-50 border-red-300 text-red-700'
                      : t === 'morno' ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300')}>
                {t === 'quente' ? '🔥' : t === 'morno' ? '🌤️' : '🧊'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> Endereço
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.address?.street || ''} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
            placeholder="Rua / Avenida" className="col-span-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400" />
          <input value={form.address?.city || ''} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
            placeholder="Cidade" className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400" />
          <div className="flex gap-3">
            <input value={form.address?.state || ''} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
              placeholder="UF" className="w-20 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400" />
            <input value={form.address?.zip || ''} onChange={e => setForm({ ...form, address: { ...form.address, zip: e.target.value } })}
              placeholder="CEP" className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400" />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" /> Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(form.tags || []).map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200">
              {tag}
              <button onClick={() => removeTag(form, setForm, tag)} className="hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input ref={currentTagRef} value={currentTagInput} onChange={e => setCurrentTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(form, setForm, currentTagInput);
                setCurrentTagInput('');
              }
            }}
            placeholder="Digite e pressione Enter" className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400" />
          <button onClick={() => { addTag(form, setForm, currentTagInput); setCurrentTagInput(''); }}
            className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors border border-indigo-200">
            + Tag
          </button>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Observações
        </label>
        <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
          rows={3} placeholder="Notas sobre o lead..."
          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900
            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all
            placeholder:text-slate-400 resize-none" />
      </div>
    </div>
  );

  const getStageConfig = (id: string) => STAGE_CONFIG.find(s => s.id === id);

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 pb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pipeline de Vendas</h1>
            <p className="text-slate-500 text-sm mt-1">Arraste os leads entre as etapas • Clique para ver/editar</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl px-4 py-2.5 shadow-sm">
                <User className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-bold text-slate-900">{totalLeads}</span>
                <span className="text-xs text-slate-500">leads</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl px-4 py-2.5 shadow-sm">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-900">R$ {totalValue.toLocaleString()}</span>
              </div>
            </div>
            {/* Novo Lead Button */}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setCreateForm({ ...emptyLead }); setCreateTagInput(''); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-shadow">
              <Plus className="h-4 w-4" /> Novo Lead
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* DRAG INDICATOR */}
      <AnimatePresence>
        {draggedLead && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mx-4 lg:mx-6 mb-3 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <GripVertical className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-700">Arrastando: {draggedLead.lead.name}</span>
            <span className="text-xs text-indigo-500">— Solte na coluna desejada</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto px-4 lg:px-6 pb-6">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map((stage, si) => (
            <motion.div key={stage.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.05 }}
              className={cn(
                'w-72 flex flex-col rounded-2xl border transition-all duration-200',
                dragOverStage === stage.id
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400/30 scale-[1.01]'
                  : 'bg-slate-50/80 border-slate-200/40'
              )}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e)}
              onDrop={(e) => handleDrop(e, stage.id)}>

              {/* Column Header */}
              <div className="p-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: stage.color }} />
                  <h3 className="text-sm font-bold text-slate-700">{stage.name}</h3>
                  <span className="bg-white text-slate-600 text-xs font-bold rounded-lg h-5 min-w-[20px] flex items-center justify-center px-1.5 shadow-sm border border-slate-100">
                    {stage.leads.length}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  R$ {(stage.leads.reduce((a, l) => a + (l.value || 0), 0) / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Drop Zone Indicator */}
              {dragOverStage === stage.id && (
                <div className="mx-3 mb-2 py-2 border-2 border-dashed border-indigo-300 rounded-xl text-center">
                  <span className="text-xs font-semibold text-indigo-500">Soltar aqui</span>
                </div>
              )}

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {stage.leads.map((lead) => (
                  <div key={lead._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead, stage.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'bg-white rounded-xl p-3.5 cursor-grab active:cursor-grabbing border border-slate-200/60 hover:border-indigo-200 transition-all duration-200 group shadow-sm hover:-translate-y-0.5 hover:shadow-md',
                      draggedLead?.lead._id === lead._id && 'opacity-40 scale-95'
                    )}>

                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-slate-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{lead.name}</h4>
                          {/* Action Buttons */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openView(lead); }}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors" title="Ver detalhes">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openEdit(lead); }}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors" title="Editar">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(lead); }}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors" title="Excluir">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {lead.company && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <Building2 className="h-3 w-3" />{lead.company}
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                          {lead.email && <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3" />{lead.email.split('@')[0]}</span>}
                          {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />...{lead.phone.slice(-4)}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {lead.tags?.slice(0, 2).map(t => (
                              <span key={t} className="bg-slate-50 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-md border border-slate-100">{t}</span>
                            ))}
                            {(lead.tags?.length || 0) > 2 && <span className="text-[10px] text-slate-400">+{lead.tags.length - 2}</span>}
                          </div>
                          <span className="text-xs font-bold text-emerald-600">R$ {((lead.value || 0) / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {stage.leads.length === 0 && !dragOverStage && (
                  <div className="text-center py-10 text-slate-400">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum lead</p>
                    <p className="text-xs mt-1">Arraste ou crie um novo</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* =================== CREATE MODAL =================== */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4"
            onClick={() => setShowCreateModal(false)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col z-10">

              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Novo Lead</h2>
                    <p className="text-xs text-slate-500">Preencha os dados do lead</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {renderFormFields(createForm, setCreateForm, createTagInput, setCreateTagInput, createTagRef)}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl flex-shrink-0">
                <button onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancelar
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleCreate} disabled={saving || !createForm.name?.trim()}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg',
                    saving || !createForm.name?.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/25 hover:shadow-indigo-600/40'
                  )}>
                  {saving ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Criar Lead
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================== SLIDEOVER (VIEW / EDIT) =================== */}
      {selectedLead && (
        <SlideOver open={!!selectedLead} onClose={() => { setSelectedLead(null); setSlideMode('view'); }}
          title={slideMode === 'edit' ? 'Editar Lead' : 'Detalhes do Lead'} width="xl">

          {/* Lead Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
              {selectedLead.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">{selectedLead.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {selectedLead.company && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />{selectedLead.company}
                  </span>
                )}
                {selectedLead.temperature && (
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold',
                    selectedLead.temperature === 'quente' ? 'bg-red-50 text-red-600' :
                    selectedLead.temperature === 'morno' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>
                    {selectedLead.temperature === 'quente' ? '🔥' : selectedLead.temperature === 'morno' ? '🌤️' : '🧊'} {selectedLead.temperature}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6 gap-1">
            <button onClick={() => setSlideMode('view')}
              className={cn('flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors',
                slideMode === 'view' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700')}>
              <Eye className="h-4 w-4" /> Detalhes
            </button>
            <button onClick={() => { setEditForm({ ...selectedLead }); setTagInput(''); setSlideMode('edit'); }}
              className={cn('flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors',
                slideMode === 'edit' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700')}>
              <Edit3 className="h-4 w-4" /> Editar
            </button>
          </div>

          {/* VIEW MODE */}
          {slideMode === 'view' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Email', value: selectedLead.email, icon: Mail },
                  { label: 'Telefone', value: selectedLead.phone, icon: Phone },
                  { label: 'Valor', value: `R$ ${(selectedLead.value || 0).toLocaleString()}`, icon: DollarSign },
                  { label: 'Origem', value: selectedLead.source, icon: Globe },
                  { label: 'Etapa', value: getStageConfig(selectedLead.status)?.name || selectedLead.status, icon: TrendingUp },
                  { label: 'Criado em', value: new Date(selectedLead.createdAt).toLocaleDateString('pt-BR'), icon: Calendar },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <item.icon className="h-3 w-3" />{item.label}
                    </label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{item.value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Tipo e Documento */}
              {selectedLead.type && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tipo / Documento</label>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedLead.type === 'PJ' ? '🏢 Pessoa Jurídica' : '👤 Pessoa Física'}
                    {selectedLead.document && ` — ${selectedLead.document}`}
                  </p>
                </div>
              )}

              {/* Endereço */}
              {selectedLead.address && (selectedLead.address.street || selectedLead.address.city) && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Endereço
                  </label>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {[selectedLead.address.street, selectedLead.address.city, selectedLead.address.state, selectedLead.address.zip].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedLead.tags?.length > 0 && (
                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLead.tags.map(tag => (
                      <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedLead.notes && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" /> Observações
                  </label>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{selectedLead.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setEditForm({ ...selectedLead }); setTagInput(''); setSlideMode('edit'); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
                  <Edit3 className="h-4 w-4" /> Editar Lead
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(selectedLead)}
                  className="px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Stage Change */}
              <div className="pt-2">
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <ChevronDown className="h-3 w-3" /> Mover para etapa
                </label>
                <div className="flex flex-wrap gap-2">
                  {STAGE_CONFIG.filter(s => s.id !== selectedLead.status).map(stage => (
                    <button key={stage.id}
                      onClick={async () => {
                        const prev = [...leads];
                        setLeads(p => p.map(l => l._id === selectedLead._id ? { ...l, status: stage.id } : l));
                        setSelectedLead({ ...selectedLead, status: stage.id });
                        try { await leadService.update(selectedLead._id, { status: stage.id }); } catch { setLeads(prev); }
                        showToast(`Lead movido para ${stage.name}`);
                      }}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-105', stage.light)}>
                      {stage.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* EDIT MODE */}
          {slideMode === 'edit' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {renderFormFields(editForm, setEditForm, tagInput, setTagInput, tagRef)}

              {/* Save / Cancel */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleUpdate} disabled={saving || !editForm.name?.trim()}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg',
                    saving || !editForm.name?.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/25'
                  )}>
                  {saving ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                      Salvando...
                    </>
                  ) : (
                    <><Save className="h-4 w-4" /> Salvar Alterações</>
                  )}
                </motion.button>
                <button onClick={() => setSlideMode('view')}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </SlideOver>
      )}

      {/* =================== TOAST =================== */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={cn(
              'fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold',
              toast.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-600/30' : 'bg-red-600 text-white shadow-red-600/30'
            )}>
            <CheckCircle2 className="h-4 w-4" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
