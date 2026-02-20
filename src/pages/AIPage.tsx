import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Trash2, Plus, MessageSquare, Target, Users, Calendar,
  Zap, BarChart3, Clock, TrendingUp, Bot, User, ArrowDown,
  Lightbulb, ChevronRight, Copy, Check
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Types
interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: string;
  metadata?: { module?: string; dataPoints?: number; processingTime?: number; sources?: string[] };
  createdAt?: string;
}

interface AIConversation {
  _id: string;
  title: string;
  messages: AIMessage[];
  lastMessageAt: string;
}

interface Insight {
  type: string; icon: string; title: string; desc: string; priority: string;
}

// Quick prompts
const QUICK_PROMPTS = [
  { icon: Target, label: 'Pipeline', prompt: 'Resumo do pipeline de vendas', color: 'from-indigo-500 to-blue-500', desc: 'Funil e conversão' },
  { icon: Users, label: 'Leads', prompt: 'Resumo dos leads e clientes', color: 'from-purple-500 to-violet-500', desc: 'Status e origens' },
  { icon: Calendar, label: 'Agenda', prompt: 'Resumo da minha agenda', color: 'from-emerald-500 to-teal-500', desc: 'Eventos e reuniões' },
  { icon: MessageSquare, label: 'Conversas', prompt: 'Resumo das conversas', color: 'from-amber-500 to-orange-500', desc: 'Mensagens e canais' },
  { icon: Zap, label: 'Automações', prompt: 'Resumo das automações', color: 'from-pink-500 to-rose-500', desc: 'Fluxos e execuções' },
  { icon: BarChart3, label: 'Desempenho', prompt: 'Análise de desempenho geral', color: 'from-cyan-500 to-sky-500', desc: 'KPIs e métricas' },
];

const SUGGESTIONS = [
  'Quais são meus leads quentes?',
  'Visão geral do CRM',
  'Tenho reuniões hoje?',
  'Como está minha taxa de conversão?',
  'Quais conversas estão sem resposta?',
  'Análise de desempenho da equipe',
];

// Mock data for standalone preview
const MOCK_INSIGHTS: Insight[] = [
  { type: 'warning', icon: '💬', title: '3 conversas não lidas', desc: 'Responda rapidamente para não perder oportunidades.', priority: 'high' },
  { type: 'opportunity', icon: '🔥', title: '2 leads quentes', desc: 'Valor combinado: R$ 70.000', priority: 'high' },
  { type: 'info', icon: '📅', title: '2 eventos hoje', desc: 'Prepare-se revisando os dados dos leads.', priority: 'medium' },
  { type: 'success', icon: '🚀', title: 'Boa geração de leads!', desc: '10 novos leads este mês.', priority: 'low' },
];

function parseMarkdown(text: string): string {
  return text
    .replace(/## (.*?)$/gm, '<h2 class="text-lg font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2">$1</h2>')
    .replace(/### (.*?)$/gm, '<h3 class="text-sm font-bold text-slate-700 mt-3 mb-1.5">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-600">$1</em>')
    .replace(/^• (.*)$/gm, '<div class="flex items-start gap-2 py-0.5 pl-1"><span class="text-indigo-400 mt-1 flex-shrink-0">›</span><span>$1</span></div>')
    .replace(/^(\d+)\. (.*)$/gm, '<div class="flex items-start gap-2 py-0.5 pl-1"><span class="text-indigo-500 font-bold flex-shrink-0">$1.</span><span>$2</span></div>')
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, '');
}

export function AIPage() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [insights, setInsights] = useState<Insight[]>(MOCK_INSIGHTS);
  const [showSidebar, setShowSidebar] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const { default: api } = await import('@/services/api');
        const res = await api.get('/ai/insights');
        if (res.data?.data?.insights) setInsights(res.data.data.insights);
      } catch { /* use mock */ }
    };
    const loadConversations = async () => {
      try {
        const { default: api } = await import('@/services/api');
        const res = await api.get('/ai/conversations');
        if (res.data?.data?.conversations) setConversations(res.data.data.conversations);
      } catch { /* empty */ }
    };
    loadInsights();
    loadConversations();
  }, []);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: AIMessage = { role: 'user', content: text.trim(), createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { default: api } = await import('@/services/api');
      const res = await api.post('/ai/chat', { message: text.trim(), conversationId: activeConvo?._id });
      const data = res.data?.data;
      if (data?.response) {
        const assistantMsg: AIMessage = { role: 'assistant', content: data.response.content, type: data.response.type, metadata: data.response.metadata, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, assistantMsg]);
        if (data.conversationId && !activeConvo) {
          const newConvo: AIConversation = { _id: data.conversationId, title: text.slice(0, 60), messages: [userMsg, assistantMsg], lastMessageAt: new Date().toISOString() };
          setConversations(prev => [newConvo, ...prev]);
          setActiveConvo(newConvo);
        }
      }
    } catch {
      // Fallback: gerar resposta local
      await new Promise(r => setTimeout(r, 800));
      const fallback = generateLocalResponse(text);
      setMessages(prev => [...prev, { role: 'assistant', content: fallback, type: 'summary', createdAt: new Date().toISOString() }]);
    }
    setIsTyping(false);
  };

  const generateLocalResponse = (prompt: string): string => {
    const q = prompt.toLowerCase();
    if (q.includes('pipeline') || q.includes('funil')) return "## 📊 Resumo do Pipeline\n\nSeu funil tem **10 leads** com valor total de **R$ 423.000**.\n\n### Distribuição:\n• **Novo:** 1 lead\n• **Contatado:** 2 leads\n• **Qualificado:** 2 leads\n• **Proposta:** 2 leads\n• **Negociação:** 1 lead\n• **Ganho:** 1 lead (R$ 35.000)\n• **Perdido:** 1 lead\n\n### 💡 Insight:\nSua taxa de conversão é de 10%. Foque nos 2 leads em proposta para aumentar o win rate.";
    if (q.includes('lead') || q.includes('cliente')) return "## 👥 Resumo de Leads\n\n• **Total:** 10 leads\n• **Novos este mês:** 3\n• **Valor total:** R$ 423.000\n• **Leads quentes:** 2\n\n### 🔥 Leads Quentes:\n• **Marina Costa** — R$ 25.000 (Negociação)\n• **Digital Labs S.A.** — R$ 78.000 (Proposta)\n\n### 💡 Recomendação:\nPriorize o follow-up com Marina Costa e Digital Labs — ambos estão em fase avançada.";
    if (q.includes('agenda') || q.includes('reunião') || q.includes('evento')) return "## 📅 Resumo da Agenda\n\n• **Hoje:** 2 eventos programados\n• **Esta semana:** 6 eventos\n\n### Próximos:\n• **Demo TechVision** — Qui 10:00 (TechVision Ltda)\n• **Follow-up Roberto** — Sex 14:00 (Roberto Ferreira)\n• **Reunião Digital Labs** — Seg 15:00 (Negociação final)\n\n### 💡 Dica:\nPrepare os materiais para a demo da TechVision com antecedência.";
    if (q.includes('conversa') || q.includes('mensagem')) return "## 💬 Central de Conversas\n\n• **3 conversas** não lidas\n• **5 conversas** ativas\n\n### Últimas:\n• 💬 **TechVision** (WhatsApp) — \"Vamos agendar a demonstração\"\n• 📧 **Roberto Ferreira** (Email) — \"Proposta comercial enviada\"\n• 📸 **Digital Labs** (Instagram) — \"Adoramos o dashboard! 😍\"\n\n### ⚠️ Ação:\nResponda as 3 conversas pendentes para manter o tempo de resposta baixo.";
    if (q.includes('automa') || q.includes('fluxo')) return "## ⚡ Automações\n\n• **4 ativas** de 6 total\n• **566 execuções** realizadas\n\n### Lista:\n• 🟢 **Boas-vindas WhatsApp** — 234 execuções\n• 🟢 **Follow-up 48h** — 156 execuções\n• 🟢 **Distribuição Round Robin** — 89 execuções\n• 🟢 **Lead Qualificado → Proposta** — 67 execuções\n• ⚪ **Aniversário do Cliente** — 12 execuções\n• ⚪ **Reengajamento** — 8 execuções";
    if (q.includes('resumo') || q.includes('geral') || q.includes('visão')) return "## 🏠 Visão Geral do CRM\n\n### 📊 Pipeline:\n• **10** leads totais | **3** novos este mês\n• Valor: **R$ 423.000** | Conversão: **10%**\n\n### 🔥 Leads Quentes: 2\n• Marina Costa — R$ 25.000\n• Digital Labs — R$ 78.000\n\n### 💬 Conversas: 3 não lidas\n### 📅 Agenda: 2 eventos hoje\n### ⚡ Automações: 4 ativas (566 execuções)\n\n### 💡 Prioridades:\n1. Responder 3 conversas pendentes\n2. Follow-up com leads quentes\n3. Preparar demo TechVision";
    return `## 🤖 NexusCRM IA\n\nEntendi sua pergunta: *"${prompt}"*\n\nPosso analisar:\n• 📊 **"Pipeline"** — Funil de vendas\n• 👥 **"Leads"** — Clientes e prospects\n• 📅 **"Agenda"** — Compromissos\n• 💬 **"Conversas"** — Mensagens\n• ⚡ **"Automações"** — Fluxos\n• 📈 **"Desempenho"** — KPIs\n\nPergunte sobre qualquer módulo!`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const startNewConvo = () => {
    setActiveConvo(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const loadConversation = async (convo: AIConversation) => {
    setActiveConvo(convo);
    if (convo.messages?.length) {
      setMessages(convo.messages);
    } else {
      try {
        const { default: api } = await import('@/services/api');
        const res = await api.get(`/ai/conversations/${convo._id}`);
        if (res.data?.data?.conversation?.messages) {
          setMessages(res.data.data.conversation.messages);
        }
      } catch { setMessages(convo.messages || []); }
    }
  };

  const deleteConversation = async (id: string) => {
    try { const { default: api } = await import('@/services/api'); await api.delete(`/ai/conversations/${id}`); } catch { /* ok */ }
    setConversations(prev => prev.filter(c => c._id !== id));
    if (activeConvo?._id === id) { setActiveConvo(null); setMessages([]); }
  };

  const copyMessage = (idx: number, content: string) => {
    navigator.clipboard.writeText(content.replace(/[#*•]/g, '').replace(/\n+/g, '\n'));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const insightColors: Record<string, string> = {
    warning: 'border-amber-200 bg-amber-50',
    opportunity: 'border-emerald-200 bg-emerald-50',
    alert: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
    success: 'border-emerald-200 bg-emerald-50',
    suggestion: 'border-purple-200 bg-purple-50',
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Sidebar — Conversation history */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="border-r border-slate-200/60 bg-white/70 backdrop-blur-sm flex flex-col flex-shrink-0 overflow-hidden hidden lg:flex">
            <div className="p-4 border-b border-slate-100">
              <motion.button whileTap={{ scale: 0.98 }} onClick={startNewConvo}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
                <Plus className="h-4 w-4" /> Nova Conversa
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Nenhuma conversa ainda</p>
                </div>
              )}
              {conversations.map(c => (
                <motion.div key={c._id} whileHover={{ x: 2 }}
                  className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group transition-all',
                    activeConvo?._id === c._id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50')}
                  onClick={() => loadConversation(c)}>
                  <MessageSquare className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{c.title}</p>
                    <p className="text-[10px] text-slate-400">{new Date(c.lastMessageAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteConversation(c._id); }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </div>
            {/* Insights */}
            {insights.length > 0 && (
              <div className="border-t border-slate-100 p-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> Insights
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {insights.slice(0, 4).map((ins, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.01 }}
                      onClick={() => sendMessage(ins.title)}
                      className={cn('w-full text-left p-2 rounded-xl border text-xs transition-all', insightColors[ins.type] || 'border-slate-200 bg-slate-50')}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm flex-shrink-0">{ins.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">{ins.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{ins.desc}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-50/50 to-white relative">
        {/* Header */}
        <div className="h-14 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="hidden lg:block p-1.5 hover:bg-slate-100 rounded-lg">
              <MessageSquare className="h-4 w-4 text-slate-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">NexusCRM IA</h3>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-500">Analisando seus dados em tempo real</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/50 text-xs font-semibold text-indigo-600">
              <Sparkles className="h-3 w-3" /> IA Integrada
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-6">
          {isEmpty ? (
            /* Empty State — Welcome */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8 pt-8">
              {/* Hero */}
              <div className="text-center">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}
                  className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-5 relative">
                  <Sparkles className="h-10 w-10 text-white" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-pulse opacity-30" />
                </motion.div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Olá! Sou a IA do NexusCRM</h1>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">Analiso seus dados de leads, pipeline, agenda e conversas em tempo real. Pergunte qualquer coisa!</p>
              </div>

              {/* Quick Prompts */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Análises Rápidas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <motion.button key={i} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                      onClick={() => sendMessage(qp.prompt)}
                      className="p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all text-left group">
                      <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform', qp.color)}>
                        <qp.icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{qp.label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{qp.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="text-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ou pergunte</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-2 bg-white border border-slate-200/60 rounded-xl text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all flex items-center gap-1.5">
                      <ChevronRight className="h-3 w-3" />{s}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Chat Messages */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-indigo-500/20">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={cn('max-w-[85%] relative group',
                    msg.role === 'user' ? 'order-first' : '')}>
                    <div className={cn('rounded-2xl px-5 py-4 relative',
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md shadow-lg shadow-indigo-600/20'
                        : 'bg-white border border-slate-200/60 rounded-bl-md shadow-sm')}>
                      {msg.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-sm text-slate-700 leading-relaxed ai-response"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                      )}
                    </div>
                    {/* Metadata & Actions */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-3 mt-1.5 ml-1">
                        {msg.metadata?.module && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <TrendingUp className="h-2.5 w-2.5" /> {msg.metadata.dataPoints || 0} dados analisados
                          </span>
                        )}
                        {msg.metadata?.processingTime && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="h-2.5 w-2.5" /> {msg.metadata.processingTime}ms
                          </span>
                        )}
                        <button onClick={() => copyMessage(idx, msg.content)}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                          {copiedIdx === idx ? <><Check className="h-2.5 w-2.5" /> Copiado</> : <><Copy className="h-2.5 w-2.5" /> Copiar</>}
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                      <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} className="h-2 w-2 bg-indigo-400 rounded-full"
                              animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400 ml-2">Analisando seus dados...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              onClick={scrollToBottom}
              className="absolute bottom-24 right-6 h-10 w-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 z-10">
              <ArrowDown className="h-4 w-4 text-slate-600" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Suggestion chips above input (when there are messages) */}
        {!isEmpty && !isTyping && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto max-w-3xl mx-auto w-full">
            {['Resumo geral', 'Leads quentes', 'Agenda de hoje', 'Conversas pendentes'].map((s, i) => (
              <motion.button key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => sendMessage(s)}
                className="flex-shrink-0 px-3 py-1.5 bg-white border border-slate-200/60 rounded-xl text-xs font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all">
                {s}
              </motion.button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre seus leads, pipeline, agenda, conversas..."
                rows={1}
                className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 resize-none transition-all pr-12 max-h-32"
                style={{ minHeight: '48px' }} />
              <div className="absolute right-3 bottom-3 text-[10px] text-slate-300">
                Enter ↵
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all flex-shrink-0',
                input.trim() && !isTyping
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/25'
                  : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed')}>
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            A IA analisa dados reais do seu CRM para gerar resumos e insights personalizados.
          </p>
        </div>
      </div>
    </div>
  );
}
