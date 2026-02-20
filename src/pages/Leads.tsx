import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { leads as mockLeads } from '@/data/mockData';
import {
  Search, Plus, Filter, Download, Phone, Mail, Edit2, Trash2, Eye,
  User, Building2, FileText, Clock, MessageCircle, Calendar as CalIcon,
  Upload, Star, Thermometer, MapPin, Globe, Tag,
  ArrowRightLeft, Paperclip, Send, Video, PhoneCall, StickyNote,
  CheckCircle2, AlertCircle, FileSpreadsheet, File, Image, FilePlus,
  UserCheck, TrendingUp, Hash
} from 'lucide-react';
import { cn } from '@/utils/cn';
import SlideOver from '@/components/ui/SlideOver';

// ---- Types ----
interface Document {
  id: string; name: string; type: string; mimeType: string;
  size: number; data?: string; uploadedByName: string; createdAt: string;
}

interface Interaction {
  id: string; type: string; content: string; userName: string; createdAt: string;
  metadata?: Record<string, unknown>;
}

interface Meeting {
  id: string; title: string; type: string; startDate: string; endDate?: string;
  description?: string; status: string;
}

interface Message {
  id: string; channel: string; content: string; direction: string;
  createdAt: string; senderName: string;
}

interface Lead {
  _id: string; name: string; email: string; phone: string; mobile?: string;
  company?: string; type?: string; document?: string; rg?: string;
  birthDate?: string; gender?: string; profession?: string;
  value: number; status: string; source: string; tags: string[];
  createdAt: string; isClient?: boolean; convertedToClientAt?: string;
  temperature?: string; score?: number; notes?: string;
  address?: { street?: string; number?: string; complement?: string; neighborhood?: string; city?: string; state?: string; zipCode?: string; };
  documents?: Document[]; interactions?: Interaction[];
  meetings?: Meeting[]; messages?: Message[];
  responsibleName?: string; lastContactAt?: string; nextFollowUp?: string;
}

// ---- Mock Enrichment ----
const enrichLead = (l: { id: string; name: string; email: string; phone: string; company?: string; value: number; status: string; source: string; tags: string[]; createdAt: string }): Lead => ({
  _id: l.id, name: l.name, email: l.email, phone: l.phone, mobile: '(11) 99999-0000',
  company: l.company, type: Math.random() > 0.5 ? 'PJ' : 'PF',
  document: Math.random() > 0.5 ? '12.345.678/0001-90' : '123.456.789-00',
  value: l.value, status: l.status, source: l.source, tags: l.tags,
  createdAt: l.createdAt, temperature: ['cold', 'warm', 'hot'][Math.floor(Math.random() * 3)],
  score: Math.floor(Math.random() * 100), isClient: l.status === 'ganho',
  responsibleName: 'Carlos Silva', notes: 'Cliente com grande potencial de expansão.',
  address: { street: 'Av. Paulista', number: '1000', complement: 'Sala 501', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', zipCode: '01310-100' },
  documents: [
    { id: 'd1', name: 'Contrato_Servico.pdf', type: 'contrato', mimeType: 'application/pdf', size: 245000, uploadedByName: 'Carlos Silva', createdAt: '2024-01-15T10:30:00Z' },
    { id: 'd2', name: 'CNPJ_Comprovante.pdf', type: 'cnpj', mimeType: 'application/pdf', size: 120000, uploadedByName: 'Ana Martins', createdAt: '2024-01-10T14:20:00Z' },
    { id: 'd3', name: 'Proposta_Comercial_v2.pdf', type: 'proposta', mimeType: 'application/pdf', size: 380000, uploadedByName: 'Carlos Silva', createdAt: '2024-02-01T09:15:00Z' },
  ],
  interactions: [
    { id: 'i1', type: 'system', content: 'Lead criado no sistema', userName: 'Sistema', createdAt: '2024-01-05T08:00:00Z' },
    { id: 'i2', type: 'call', content: 'Ligação de prospecção realizada. Cliente demonstrou interesse.', userName: 'Carlos Silva', createdAt: '2024-01-06T10:30:00Z' },
    { id: 'i3', type: 'email', content: 'Email com material institucional enviado.', userName: 'Carlos Silva', createdAt: '2024-01-07T14:00:00Z' },
    { id: 'i4', type: 'stage_change', content: 'Etapa alterada de "Novo" para "Contatado"', userName: 'Sistema', createdAt: '2024-01-07T14:01:00Z' },
    { id: 'i5', type: 'meeting', content: 'Reunião de apresentação realizada via Google Meet.', userName: 'Ana Martins', createdAt: '2024-01-15T15:00:00Z' },
    { id: 'i6', type: 'document', content: 'Documento "Proposta_Comercial_v2.pdf" anexado', userName: 'Carlos Silva', createdAt: '2024-02-01T09:15:00Z' },
    { id: 'i7', type: 'whatsapp', content: 'Mensagem de follow-up enviada pelo WhatsApp.', userName: 'Carlos Silva', createdAt: '2024-02-05T11:00:00Z' },
    { id: 'i8', type: 'note', content: 'Cliente pediu prazo até sexta para análise da proposta.', userName: 'Carlos Silva', createdAt: '2024-02-06T16:30:00Z' },
  ],
  meetings: [
    { id: 'm1', title: 'Apresentação Comercial', type: 'meeting', startDate: '2024-01-15T15:00:00Z', endDate: '2024-01-15T16:00:00Z', description: 'Reunião via Google Meet', status: 'concluido' },
    { id: 'm2', title: 'Follow-up Proposta', type: 'call', startDate: '2024-02-10T10:00:00Z', endDate: '2024-02-10T10:30:00Z', description: 'Ligação de acompanhamento', status: 'agendado' },
    { id: 'm3', title: 'Demo do Produto', type: 'demo', startDate: '2024-02-20T14:00:00Z', endDate: '2024-02-20T15:30:00Z', description: 'Demonstração completa do sistema', status: 'agendado' },
  ],
  messages: [
    { id: 'msg1', channel: 'whatsapp', content: 'Olá! Tudo bem? Vi que vocês oferecem soluções para gestão. Gostaria de saber mais.', direction: 'in', createdAt: '2024-01-05T08:10:00Z', senderName: l.name },
    { id: 'msg2', channel: 'whatsapp', content: 'Olá! Claro, temos diversas soluções. Posso agendar uma apresentação?', direction: 'out', createdAt: '2024-01-05T08:15:00Z', senderName: 'Carlos Silva' },
    { id: 'msg3', channel: 'whatsapp', content: 'Pode sim! Quarta-feira às 15h funciona?', direction: 'in', createdAt: '2024-01-05T08:20:00Z', senderName: l.name },
    { id: 'msg4', channel: 'email', content: 'Segue em anexo o material institucional e a proposta comercial conforme conversamos.', direction: 'out', createdAt: '2024-01-07T14:00:00Z', senderName: 'Carlos Silva' },
    { id: 'msg5', channel: 'whatsapp', content: 'Recebi o material, obrigado! Vou analisar e retorno na sexta.', direction: 'in', createdAt: '2024-01-08T09:00:00Z', senderName: l.name },
    { id: 'msg6', channel: 'email', content: 'Bom dia! Gostaria de saber se tiveram a oportunidade de analisar nossa proposta.', direction: 'out', createdAt: '2024-02-05T11:00:00Z', senderName: 'Carlos Silva' },
  ],
});

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  novo: { label: 'Novo', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: <Star className="h-3 w-3" /> },
  contatado: { label: 'Contatado', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <PhoneCall className="h-3 w-3" /> },
  qualificado: { label: 'Qualificado', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  proposta: { label: 'Proposta', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <FileText className="h-3 w-3" /> },
  negociacao: { label: 'Negociação', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: <ArrowRightLeft className="h-3 w-3" /> },
  ganho: { label: 'Ganho', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  perdido: { label: 'Perdido', color: 'bg-red-50 text-red-700 border-red-200', icon: <AlertCircle className="h-3 w-3" /> },
};

const tempConfig: Record<string, { label: string; color: string }> = {
  cold: { label: 'Frio', color: 'text-blue-500' },
  warm: { label: 'Morno', color: 'text-amber-500' },
  hot: { label: 'Quente', color: 'text-red-500' },
};

const interactionIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  system: { icon: <Hash className="h-3.5 w-3.5" />, color: 'bg-slate-100 text-slate-500 border-slate-200' },
  call: { icon: <PhoneCall className="h-3.5 w-3.5" />, color: 'bg-green-50 text-green-600 border-green-200' },
  email: { icon: <Mail className="h-3.5 w-3.5" />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  meeting: { icon: <Video className="h-3.5 w-3.5" />, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  whatsapp: { icon: <MessageCircle className="h-3.5 w-3.5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  stage_change: { icon: <ArrowRightLeft className="h-3.5 w-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  note: { icon: <StickyNote className="h-3.5 w-3.5" />, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  document: { icon: <Paperclip className="h-3.5 w-3.5" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  conversion: { icon: <UserCheck className="h-3.5 w-3.5" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  task: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
};

const docIcons: Record<string, React.ReactNode> = {
  contrato: <FileSpreadsheet className="h-5 w-5 text-indigo-500" />,
  proposta: <FileText className="h-5 w-5 text-purple-500" />,
  cnpj: <File className="h-5 w-5 text-emerald-500" />,
  cpf: <File className="h-5 w-5 text-blue-500" />,
  rg: <File className="h-5 w-5 text-cyan-500" />,
  nf: <FileSpreadsheet className="h-5 w-5 text-amber-500" />,
  comprovante: <File className="h-5 w-5 text-green-500" />,
  outro: <File className="h-5 w-5 text-slate-500" />,
  image: <Image className="h-5 w-5 text-pink-500" />,
};

const channelColors: Record<string, string> = {
  whatsapp: 'bg-emerald-500', email: 'bg-blue-500', instagram: 'bg-pink-500',
  facebook: 'bg-indigo-500', telegram: 'bg-cyan-500',
};

const meetingStatusColors: Record<string, string> = {
  agendado: 'bg-blue-50 text-blue-700 border-blue-200',
  concluido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelado: 'bg-red-50 text-red-700 border-red-200',
};

type DetailTab = 'dados' | 'documentos' | 'historico' | 'mensagens' | 'reunioes';

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; }
};
const formatDateTime = (d: string) => {
  try { return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return d; }
};
const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

// ========================================
// COMPONENT
// ========================================
export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(() => mockLeads.map(enrichLead));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('dados');
  const [newInteraction, setNewInteraction] = useState('');
  const [interactionType, setInteractionType] = useState('note');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = leads.filter(l => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || l.name?.toLowerCase().includes(s) || l.email?.toLowerCase().includes(s) || l.company?.toLowerCase().includes(s) || l.phone?.includes(s);
    const matchStatus = !filterStatus || l.status === filterStatus;
    const matchType = !filterType || l.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: leads.length,
    clients: leads.filter(l => l.isClient).length,
    hot: leads.filter(l => l.temperature === 'hot').length,
    totalValue: leads.reduce((s, l) => s + (l.value || 0), 0),
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    setLeads(prev => prev.filter(l => l._id !== id));
    if (selectedLead?._id === id) setSelectedLead(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (editData._id) {
        const updated = leads.map(l => l._id === editData._id ? { ...l, ...editData } as Lead : l);
        setLeads(updated);
        setSelectedLead(updated.find(l => l._id === editData._id) || null);
      } else {
        const newLead: Lead = {
          ...editData, _id: 'new-' + Date.now(), createdAt: new Date().toISOString(),
          documents: [], interactions: [{ id: 'i-new', type: 'system', content: 'Lead criado no sistema', userName: 'Você', createdAt: new Date().toISOString() }],
          meetings: [], messages: [], tags: editData.tags || [],
        } as Lead;
        setLeads(prev => [newLead, ...prev]);
        setSelectedLead(newLead);
      }
      setIsSaving(false); setIsEditing(false);
    }, 600);
  };

  const startCreate = () => {
    setEditData({ name: '', email: '', phone: '', mobile: '', company: '', type: 'PF', document: '', status: 'novo', source: 'outro', value: 0, tags: [], temperature: 'cold', score: 0, notes: '', address: {} });
    setIsEditing(true); setSelectedLead(null); setActiveTab('dados');
  };

  const startEdit = (lead: Lead) => {
    setEditData({ ...lead });
    setIsEditing(true); setActiveTab('dados');
  };

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead); setIsEditing(false); setActiveTab('dados');
  };

  const handleConvert = (lead: Lead) => {
    if (!confirm(`Converter "${lead.name}" para Cliente?`)) return;
    const updated = leads.map(l => l._id === lead._id ? {
      ...l, isClient: true, status: 'ganho' as const, convertedToClientAt: new Date().toISOString(),
      interactions: [...(l.interactions || []), { id: 'conv-' + Date.now(), type: 'conversion', content: 'Lead convertido para Cliente', userName: 'Você', createdAt: new Date().toISOString() }],
    } : l);
    setLeads(updated);
    setSelectedLead(updated.find(l => l._id === lead._id) || null);
  };

  const handleAddInteraction = () => {
    if (!newInteraction.trim() || !selectedLead) return;
    const interaction: Interaction = { id: 'int-' + Date.now(), type: interactionType, content: newInteraction, userName: 'Você', createdAt: new Date().toISOString() };
    const updated = leads.map(l => l._id === selectedLead._id ? { ...l, interactions: [...(l.interactions || []), interaction] } : l);
    setLeads(updated);
    setSelectedLead(updated.find(l => l._id === selectedLead._id) || null);
    setNewInteraction(''); setInteractionType('note');
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !selectedLead) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const doc: Document = {
        id: 'doc-' + Date.now(), name: file.name,
        type: file.name.endsWith('.pdf') ? 'contrato' : 'outro',
        mimeType: file.type, size: file.size,
        data: reader.result as string,
        uploadedByName: 'Você', createdAt: new Date().toISOString(),
      };
      const interaction: Interaction = { id: 'di-' + Date.now(), type: 'document', content: `Documento "${file.name}" anexado`, userName: 'Você', createdAt: new Date().toISOString() };
      const updated = leads.map(l => l._id === selectedLead._id ? { ...l, documents: [...(l.documents || []), doc], interactions: [...(l.interactions || []), interaction] } : l);
      setLeads(updated);
      setSelectedLead(updated.find(l => l._id === selectedLead._id) || null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [selectedLead, leads]);

  const handleDeleteDoc = (docId: string) => {
    if (!selectedLead) return;
    const updated = leads.map(l => l._id === selectedLead._id ? { ...l, documents: (l.documents || []).filter(d => d.id !== docId) } : l);
    setLeads(updated);
    setSelectedLead(updated.find(l => l._id === selectedLead._id) || null);
  };

  // ---- TABS CONFIG ----
  const tabs: { id: DetailTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dados', label: 'Dados', icon: <User className="h-4 w-4" /> },
    { id: 'documentos', label: 'Documentos', icon: <Paperclip className="h-4 w-4" />, count: selectedLead?.documents?.length },
    { id: 'historico', label: 'Histórico', icon: <Clock className="h-4 w-4" />, count: selectedLead?.interactions?.length },
    { id: 'mensagens', label: 'Mensagens', icon: <MessageCircle className="h-4 w-4" />, count: selectedLead?.messages?.length },
    { id: 'reunioes', label: 'Reuniões', icon: <CalIcon className="h-4 w-4" />, count: selectedLead?.meetings?.length },
  ];

  // ---- RENDER ----
  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads & Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} de {leads.length} registros</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.95 }} className="hidden sm:flex items-center gap-2 px-3 py-2.5 border border-slate-200/60 rounded-xl text-sm text-slate-600 hover:bg-white/80 bg-white/50 backdrop-blur-sm">
            <Download className="h-4 w-4" /> Exportar
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
            <Plus className="h-4 w-4" /> Novo Lead
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', value: stats.total, icon: <User className="h-5 w-5" />, color: 'from-indigo-500 to-purple-500' },
          { label: 'Clientes', value: stats.clients, icon: <UserCheck className="h-5 w-5" />, color: 'from-emerald-500 to-teal-500' },
          { label: 'Leads Quentes', value: stats.hot, icon: <Thermometer className="h-5 w-5" />, color: 'from-red-500 to-orange-500' },
          { label: 'Valor Total', value: `R$ ${(stats.totalValue / 1000).toFixed(0)}k`, icon: <TrendingUp className="h-5 w-5" />, color: 'from-amber-500 to-yellow-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 flex items-center gap-3">
            <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm', s.color)}>{s.icon}</div>
            <div><p className="text-xs text-slate-500 font-medium">{s.label}</p><p className="text-lg font-bold text-slate-900">{s.value}</p></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, email, empresa ou telefone..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn('flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition-colors',
              showFilters ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200/60 text-slate-600 hover:bg-slate-50')}>
            <Filter className="h-4 w-4" /> Filtros
          </button>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden">
              <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                  <option value="">Todos os Status</option>
                  {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                  <option value="">PF & PJ</option>
                  <option value="PF">Pessoa Física</option>
                  <option value="PJ">Pessoa Jurídica</option>
                </select>
                {(filterStatus || filterType) && (
                  <button onClick={() => { setFilterStatus(''); setFilterType(''); }}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl">Limpar</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Lead / Cliente</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contato</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Tipo</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Temp.</th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-36">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <motion.tr key={lead._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * Math.min(i, 20) }}
                  className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => openDetail(lead)}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          {lead.name?.substring(0, 2).toUpperCase()}
                        </div>
                        {lead.isClient && <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"><CheckCircle2 className="h-2.5 w-2.5 text-white" /></div>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                          {lead.isClient && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-bold">CLIENTE</span>}
                        </div>
                        {lead.company && <p className="text-xs text-slate-500 flex items-center gap-1"><Building2 className="h-3 w-3" /> {lead.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</div>
                      <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className={cn('px-2 py-1 rounded-lg text-xs font-bold border', lead.type === 'PJ' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-sky-50 text-sky-700 border-sky-200')}>
                      {lead.type === 'PJ' ? <Building2 className="h-3 w-3 inline mr-1" /> : <User className="h-3 w-3 inline mr-1" />}{lead.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold border inline-flex items-center gap-1', statusConfig[lead.status]?.color || 'bg-slate-50 text-slate-600 border-slate-100')}>
                      {statusConfig[lead.status]?.icon}{statusConfig[lead.status]?.label || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-center">
                    <Thermometer className={cn('h-4 w-4 inline', tempConfig[lead.temperature || 'cold']?.color)} />
                    <span className={cn('text-xs font-medium ml-1', tempConfig[lead.temperature || 'cold']?.color)}>{tempConfig[lead.temperature || 'cold']?.label}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold text-slate-900">R$ {lead.value?.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => openDetail(lead)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"><Eye className="h-4 w-4" /></motion.button>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => startEdit(lead)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 className="h-4 w-4" /></motion.button>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleDelete(lead._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="h-4 w-4" /></motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />

      {/* ======== SLIDE OVER: DETAIL VIEW ======== */}
      {(selectedLead || isEditing) && (
        <SlideOver open={!!(selectedLead || isEditing)} onClose={() => { setSelectedLead(null); setIsEditing(false); }}
          title={isEditing ? (editData._id ? 'Editar Cadastro' : 'Novo Cadastro') : (selectedLead?.name || '')} width="2xl">

          {/* ---- EDITING FORM ---- */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Tipo PF/PJ Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                {['PF', 'PJ'].map(t => (
                  <button key={t} type="button" onClick={() => setEditData({ ...editData, type: t })}
                    className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                      editData.type === t ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                    {t === 'PF' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    {t === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </button>
                ))}
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><User className="h-4 w-4 text-indigo-500" /> Dados Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1.5">Nome Completo *</label>
                    <input required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 text-sm" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">{editData.type === 'PJ' ? 'CNPJ' : 'CPF'}</label>
                    <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" placeholder={editData.type === 'PJ' ? '00.000.000/0001-00' : '000.000.000-00'} value={editData.document || ''} onChange={e => setEditData({ ...editData, document: e.target.value })} /></div>
                  {editData.type === 'PF' && <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">RG</label>
                    <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.rg || ''} onChange={e => setEditData({ ...editData, rg: e.target.value })} /></div>}
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                    <input type="email" className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Telefone</label>
                    <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Celular</label>
                    <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.mobile || ''} onChange={e => setEditData({ ...editData, mobile: e.target.value })} /></div>
                  {editData.type === 'PF' && <>
                    <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Data de Nascimento</label>
                      <input type="date" className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.birthDate || ''} onChange={e => setEditData({ ...editData, birthDate: e.target.value })} /></div>
                    <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Profissão</label>
                      <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.profession || ''} onChange={e => setEditData({ ...editData, profession: e.target.value })} /></div>
                  </>}
                </div>
              </div>

              {/* Company (PJ) */}
              {editData.type === 'PJ' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Building2 className="h-4 w-4 text-purple-500" /> Dados da Empresa</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Razão Social</label>
                      <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.company || ''} onChange={e => setEditData({ ...editData, company: e.target.value })} /></div>
                    <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
                      <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" placeholder="https://" /></div>
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><MapPin className="h-4 w-4 text-red-500" /> Endereço</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">CEP</label>
                    <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.address?.zipCode || ''} onChange={e => setEditData({ ...editData, address: { ...editData.address, zipCode: e.target.value } })} /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Cidade</label>
                    <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.address?.city || ''} onChange={e => setEditData({ ...editData, address: { ...editData.address, city: e.target.value } })} /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Rua</label>
                    <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.address?.street || ''} onChange={e => setEditData({ ...editData, address: { ...editData.address, street: e.target.value } })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Número</label>
                      <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.address?.number || ''} onChange={e => setEditData({ ...editData, address: { ...editData.address, number: e.target.value } })} /></div>
                    <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">UF</label>
                      <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" maxLength={2} value={editData.address?.state || ''} onChange={e => setEditData({ ...editData, address: { ...editData.address, state: e.target.value } })} /></div>
                  </div>
                </div>
              </div>

              {/* Sales Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Informações Comerciais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Valor do Deal (R$)</label>
                    <input type="number" className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.value || 0} onChange={e => setEditData({ ...editData, value: Number(e.target.value) })} /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.status || 'novo'} onChange={e => setEditData({ ...editData, status: e.target.value })}>
                      {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Origem</label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.source || 'outro'} onChange={e => setEditData({ ...editData, source: e.target.value })}>
                      {['google_ads', 'facebook_ads', 'instagram', 'linkedin', 'website', 'indicacao', 'email', 'telefone', 'evento', 'outro'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Temperatura</label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={editData.temperature || 'cold'} onChange={e => setEditData({ ...editData, temperature: e.target.value })}>
                      <option value="cold">🧊 Frio</option><option value="warm">🌤 Morno</option><option value="hot">🔥 Quente</option></select></div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3"><StickyNote className="h-4 w-4 text-yellow-500" /> Observações</h3>
                <textarea rows={3} className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none" placeholder="Anotações sobre o lead..."
                  value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} />
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3"><Tag className="h-4 w-4 text-indigo-500" /> Tags</h3>
                <input className="w-full p-3 border border-slate-200 rounded-xl text-sm" placeholder="Ex: VIP, Prioridade (separar por vírgula)"
                  value={(editData.tags || []).join(', ')} onChange={e => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
              </div>

              {/* Submit */}
              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                  {isSaving ? 'Salvando...' : 'Salvar Cadastro'}
                </motion.button>
                <button type="button" onClick={() => { setIsEditing(false); if (!selectedLead) setSelectedLead(null); }}
                  className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600">Cancelar</button>
              </div>
            </form>
          ) : selectedLead && (
            /* ---- DETAIL VIEW WITH TABS ---- */
            <div className="space-y-0 -mx-6 -mt-6">
              {/* Lead Header Card */}
              <div className="px-6 py-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-500/20">
                      {selectedLead.name?.substring(0, 2).toUpperCase()}
                    </div>
                    {selectedLead.isClient && <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-white" /></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-slate-900">{selectedLead.name}</h2>
                      {selectedLead.isClient && <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-bold">CLIENTE</span>}
                      <span className={cn('px-2 py-0.5 rounded-md text-xs font-bold border', selectedLead.type === 'PJ' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-sky-50 text-sky-700 border-sky-200')}>{selectedLead.type}</span>
                    </div>
                    {selectedLead.company && <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><Building2 className="h-3.5 w-3.5" /> {selectedLead.company}</p>}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold border inline-flex items-center gap-1', statusConfig[selectedLead.status]?.color)}>
                        {statusConfig[selectedLead.status]?.icon}{statusConfig[selectedLead.status]?.label}
                      </span>
                      <span className={cn('text-xs font-medium flex items-center gap-1', tempConfig[selectedLead.temperature || 'cold']?.color)}>
                        <Thermometer className="h-3.5 w-3.5" /> {tempConfig[selectedLead.temperature || 'cold']?.label}
                      </span>
                      {selectedLead.score !== undefined && <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" /> Score: {selectedLead.score}</span>}
                      <span className="text-xs text-emerald-600 font-bold">R$ {selectedLead.value?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {!selectedLead.isClient && (
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleConvert(selectedLead)}
                        className="px-3 py-2 text-xs font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-sm flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5" /> Converter
                      </motion.button>
                    )}
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => startEdit(selectedLead)}
                      className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-white text-slate-600 flex items-center gap-1.5">
                      <Edit2 className="h-3.5 w-3.5" /> Editar
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b border-slate-100 bg-white/60">
                <div className="flex gap-0 overflow-x-auto">
                  {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={cn('relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors',
                        activeTab === tab.id ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700')}>
                      {tab.icon} {tab.label}
                      {tab.count !== undefined && tab.count > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">{tab.count}</span>}
                      {activeTab === tab.id && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="px-6 py-5">
                <AnimatePresence mode="wait">
                  {/* ===== TAB: DADOS ===== */}
                  {activeTab === 'dados' && (
                    <motion.div key="dados" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                      {/* Contact */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: <Mail className="h-4 w-4 text-blue-500" />, label: 'Email', value: selectedLead.email },
                          { icon: <Phone className="h-4 w-4 text-green-500" />, label: 'Telefone', value: selectedLead.phone },
                          { icon: <Phone className="h-4 w-4 text-emerald-500" />, label: 'Celular', value: selectedLead.mobile || '-' },
                          { icon: <FileText className="h-4 w-4 text-purple-500" />, label: selectedLead.type === 'PJ' ? 'CNPJ' : 'CPF', value: selectedLead.document || '-' },
                          { icon: <Globe className="h-4 w-4 text-indigo-500" />, label: 'Origem', value: selectedLead.source?.replace(/_/g, ' ') },
                          { icon: <User className="h-4 w-4 text-amber-500" />, label: 'Responsável', value: selectedLead.responsibleName || '-' },
                        ].map((item, i) => (
                          <div key={i} className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">{item.icon}<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span></div>
                            <p className="text-sm font-medium text-slate-800 pl-6">{item.value || '-'}</p>
                          </div>
                        ))}
                      </div>
                      {/* Address */}
                      {selectedLead.address?.city && (
                        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-2 mb-2"><MapPin className="h-4 w-4 text-red-500" /><span className="text-xs font-bold text-slate-500 uppercase">Endereço</span></div>
                          <p className="text-sm text-slate-700 pl-6">{selectedLead.address.street}, {selectedLead.address.number} {selectedLead.address.complement} — {selectedLead.address.neighborhood}, {selectedLead.address.city}/{selectedLead.address.state} — CEP {selectedLead.address.zipCode}</p>
                        </div>
                      )}
                      {/* Tags */}
                      {selectedLead.tags?.length > 0 && (
                        <div><span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2"><Tag className="h-3.5 w-3.5" /> Tags</span>
                          <div className="flex flex-wrap gap-2">{selectedLead.tags.map((t, i) => <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-100">{t}</span>)}</div>
                        </div>
                      )}
                      {/* Notes */}
                      {selectedLead.notes && (
                        <div className="bg-yellow-50/60 rounded-xl p-4 border border-yellow-100">
                          <span className="text-xs font-bold text-yellow-700 uppercase flex items-center gap-1 mb-2"><StickyNote className="h-3.5 w-3.5" /> Observações</span>
                          <p className="text-sm text-slate-700">{selectedLead.notes}</p>
                        </div>
                      )}
                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="text-slate-500"><span className="font-bold">Criado:</span> {formatDate(selectedLead.createdAt)}</div>
                        {selectedLead.lastContactAt && <div className="text-slate-500"><span className="font-bold">Último contato:</span> {formatDate(selectedLead.lastContactAt)}</div>}
                        {selectedLead.convertedToClientAt && <div className="text-emerald-600 font-bold">Convertido em: {formatDate(selectedLead.convertedToClientAt)}</div>}
                      </div>
                    </motion.div>
                  )}

                  {/* ===== TAB: DOCUMENTOS ===== */}
                  {activeTab === 'documentos' && (
                    <motion.div key="documentos" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700">Documentos Anexados ({selectedLead.documents?.length || 0})</h3>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-semibold shadow-sm">
                          <Upload className="h-3.5 w-3.5" /> Anexar Arquivo
                        </motion.button>
                      </div>
                      {(selectedLead.documents || []).length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <FilePlus className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                          <p className="font-medium">Nenhum documento anexado</p>
                          <p className="text-xs mt-1">Clique em "Anexar Arquivo" para adicionar</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(selectedLead.documents || []).map((doc, i) => (
                            <motion.div key={doc.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                {docIcons[doc.type] || docIcons.outro}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span className="capitalize">{doc.type}</span>
                                  <span>•</span><span>{formatSize(doc.size)}</span>
                                  <span>•</span><span>{doc.uploadedByName}</span>
                                  <span>•</span><span>{formatDate(doc.createdAt)}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleDeleteDoc(doc.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="h-4 w-4" /></motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ===== TAB: HISTÓRICO ===== */}
                  {activeTab === 'historico' && (
                    <motion.div key="historico" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                      {/* Add interaction */}
                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-3">
                        <h3 className="text-sm font-bold text-slate-700">Nova Interação</h3>
                        <div className="flex gap-2">
                          <select value={interactionType} onChange={e => setInteractionType(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white min-w-[120px]">
                            <option value="note">📝 Nota</option><option value="call">📞 Ligação</option>
                            <option value="email">✉️ Email</option><option value="meeting">🎥 Reunião</option>
                            <option value="whatsapp">💬 WhatsApp</option><option value="task">✅ Tarefa</option>
                          </select>
                          <input className="flex-1 p-2 border border-slate-200 rounded-xl text-sm" placeholder="Descreva a interação..."
                            value={newInteraction} onChange={e => setNewInteraction(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddInteraction()} />
                          <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddInteraction} disabled={!newInteraction.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40">
                            <Send className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                      {/* Timeline */}
                      <div className="relative">
                        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-slate-200" />
                        <div className="space-y-0">
                          {[...(selectedLead.interactions || [])].reverse().map((int, i) => {
                            const config = interactionIcons[int.type] || interactionIcons.system;
                            return (
                              <motion.div key={int.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                className="relative flex gap-3 py-3">
                                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center border z-10 shrink-0', config.color)}>
                                  {config.icon}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <p className="text-sm text-slate-800">{int.content}</p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                    <span className="font-medium">{int.userName}</span>
                                    <span>•</span><span>{formatDateTime(int.createdAt)}</span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ===== TAB: MENSAGENS ===== */}
                  {activeTab === 'mensagens' && (
                    <motion.div key="mensagens" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-700 mb-3">Conversas com {selectedLead.name} ({selectedLead.messages?.length || 0})</h3>
                      {(selectedLead.messages || []).length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                          <p className="font-medium">Nenhuma mensagem</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(selectedLead.messages || []).map((msg, i) => (
                            <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className={cn('flex', msg.direction === 'out' ? 'justify-end' : 'justify-start')}>
                              <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 relative',
                                msg.direction === 'out' ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md')}>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className={cn('h-2 w-2 rounded-full', channelColors[msg.channel] || 'bg-slate-400')} />
                                  <span className={cn('text-[10px] font-bold uppercase', msg.direction === 'out' ? 'text-white/70' : 'text-slate-500')}>{msg.channel}</span>
                                </div>
                                <p className="text-sm">{msg.content}</p>
                                <div className={cn('flex items-center justify-between mt-2 text-[10px]', msg.direction === 'out' ? 'text-white/60' : 'text-slate-400')}>
                                  <span>{msg.senderName}</span>
                                  <span>{formatDateTime(msg.createdAt)}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ===== TAB: REUNIÕES ===== */}
                  {activeTab === 'reunioes' && (
                    <motion.div key="reunioes" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-700">Reuniões & Eventos ({selectedLead.meetings?.length || 0})</h3>
                        <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-semibold shadow-sm">
                          <Plus className="h-3.5 w-3.5" /> Agendar
                        </motion.button>
                      </div>
                      {(selectedLead.meetings || []).length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <CalIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                          <p className="font-medium">Nenhuma reunião agendada</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(selectedLead.meetings || []).map((m, i) => (
                            <motion.div key={m.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
                                m.type === 'meeting' ? 'bg-purple-100 text-purple-600' : m.type === 'call' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600')}>
                                {m.type === 'meeting' ? <Video className="h-5 w-5" /> : m.type === 'call' ? <PhoneCall className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{m.title}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                  <CalIcon className="h-3 w-3" /> {formatDateTime(m.startDate)}
                                  {m.description && <><span>•</span><span className="truncate">{m.description}</span></>}
                                </div>
                              </div>
                              <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0', meetingStatusColors[m.status] || meetingStatusColors.agendado)}>
                                {m.status === 'concluido' ? '✓ Concluído' : m.status === 'cancelado' ? '✕ Cancelado' : '◎ Agendado'}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </SlideOver>
      )}
    </div>
  );
}
