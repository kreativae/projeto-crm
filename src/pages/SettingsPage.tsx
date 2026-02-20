import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Palette, Link2, Webhook, CreditCard, Bell, Key, FileText,
  Save, Plus, Trash2, X, Check, Copy, Eye, EyeOff, Upload, Edit2,
  Globe, Clock as ClockIcon, Languages, ToggleLeft, ToggleRight, ExternalLink, Zap, RefreshCw
} from 'lucide-react';
import { cn } from '@/utils/cn';

const TABS = [
  { id: 'general', label: 'Geral', icon: Building2 },
  { id: 'branding', label: 'White Label', icon: Palette },
  { id: 'integrations', label: 'Integrações', icon: Link2 },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'apikeys', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'billing', label: 'Cobrança', icon: CreditCard },
];

// SVG Logos for integrations
const WhatsAppLogo = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <rect width="48" height="48" rx="12" fill="#25D366"/>
    <path d="M34.6 13.3A14.4 14.4 0 0 0 24 9a14.5 14.5 0 0 0-12.6 21.8L9.6 38l7.4-1.9A14.4 14.4 0 0 0 24 38a14.5 14.5 0 0 0 10.6-24.7zM24 35.4a12 12 0 0 1-6.1-1.7l-.4-.3-4.5 1.2 1.2-4.3-.3-.4A12 12 0 1 1 24 35.4zm6.6-9c-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.6-.2-.8.2s-1 1.2-1.2 1.5-.4.2-.8 0a10.3 10.3 0 0 1-3-1.9 11.2 11.2 0 0 1-2.1-2.6c-.2-.4 0-.6.2-.8l.5-.5.3-.5.2-.4c0-.1 0-.3-.1-.4s-.8-2-1.1-2.8c-.3-.7-.6-.6-.8-.6h-.7a1.4 1.4 0 0 0-1 .5A4.2 4.2 0 0 0 17 21a7.3 7.3 0 0 0 1.5 3.8c.2.2 2.6 4 6.3 5.6.9.4 1.6.6 2.1.8a5 5 0 0 0 2.3.2c.7-.1 2.2-.9 2.5-1.8s.3-1.7.2-1.8-.3-.3-.7-.5z" fill="white"/>
  </svg>
);

const GoogleCalendarLogo = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <rect width="48" height="48" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
    <path d="M33 14H15a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V16a2 2 0 0 0-2-2z" fill="#fff" stroke="#4285F4" strokeWidth="1.5"/>
    <path d="M13 20h22" stroke="#4285F4" strokeWidth="1.5"/>
    <rect x="17" y="23" width="4" height="3.5" rx="0.5" fill="#EA4335"/>
    <rect x="23" y="23" width="4" height="3.5" rx="0.5" fill="#34A853"/>
    <rect x="29" y="23" width="4" height="3.5" rx="0.5" fill="#4285F4"/>
    <rect x="17" y="28.5" width="4" height="3.5" rx="0.5" fill="#FBBC04"/>
    <rect x="23" y="28.5" width="4" height="3.5" rx="0.5" fill="#EA4335"/>
    <rect x="29" y="28.5" width="4" height="3.5" rx="0.5" fill="#34A853"/>
    <path d="M20 11v5M28 11v5" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <rect width="48" height="48" rx="12" fill="#635BFF"/>
    <path d="M22.5 19.8c0-.9.7-1.2 1.9-1.2 1.7 0 3.9.5 5.6 1.4V14.8c-1.9-.7-3.7-1-5.6-1-4.6 0-7.6 2.4-7.6 6.4 0 6.2 8.6 5.2 8.6 7.9 0 1-.9 1.3-2.1 1.3-1.8 0-4.2-.7-6-1.8v5.3c2 .9 4.1 1.3 6 1.3 4.7 0 7.9-2.3 7.9-6.4.1-6.7-8.7-5.5-8.7-8z" fill="white"/>
  </svg>
);

const OpenAILogo = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <rect width="48" height="48" rx="12" fill="#0F0F0F"/>
    <path d="M33.2 21.4a6.2 6.2 0 0 0-.5-5.1 6.3 6.3 0 0 0-6.8-3 6.2 6.2 0 0 0-4.7-2.1 6.3 6.3 0 0 0-6 4.4 6.2 6.2 0 0 0-4.2 3 6.3 6.3 0 0 0 .8 7.4 6.2 6.2 0 0 0 .5 5.1 6.3 6.3 0 0 0 6.8 3 6.2 6.2 0 0 0 4.7 2.1 6.3 6.3 0 0 0 6-4.4 6.2 6.2 0 0 0 4.2-3 6.3 6.3 0 0 0-.8-7.4zm-9.4 13.3a4.7 4.7 0 0 1-3-.9l.2-.1 5-2.9a.8.8 0 0 0 .4-.7v-7l2.1 1.2v5.8a4.7 4.7 0 0 1-4.7 4.6zm-10.2-4.3a4.7 4.7 0 0 1-.6-3.1l.2.1 5 2.9a.8.8 0 0 0 .8 0l6.1-3.5v2.5l-5.1 2.9a4.7 4.7 0 0 1-6.4-1.8zm-1.3-10.9a4.7 4.7 0 0 1 2.4-2.1v6a.8.8 0 0 0 .4.7l6.1 3.5-2.1 1.2-5.1-2.9a4.7 4.7 0 0 1-1.7-6.4zm17.5 4.1-6.1-3.5 2.1-1.2 5.1 2.9a4.7 4.7 0 0 1-.7 8.5v-6a.8.8 0 0 0-.4-.7zm2.1-3.2-.2-.1-5-2.9a.8.8 0 0 0-.8 0l-6.1 3.5v-2.5l5.1-2.9a4.7 4.7 0 0 1 7 3.9zm-13.1 4.3-2.1-1.2v-5.8a4.7 4.7 0 0 1 7.7-3.6l-.2.1-5 2.9a.8.8 0 0 0-.4.7v6.9zm1.1-2.5 2.7-1.6 2.7 1.6v3.1l-2.7 1.6-2.7-1.6v-3.1z" fill="white"/>
  </svg>
);

const MailgunLogo = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <rect width="48" height="48" rx="12" fill="#F06B54"/>
    <path d="M14 17l10 7 10-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="17" width="20" height="14" rx="2" stroke="white" strokeWidth="2" fill="none"/>
    <path d="M14 31l7-5M34 31l-7-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SlackLogo = () => (
  <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
    <rect width="48" height="48" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
    <path d="M17.4 27.6a2.4 2.4 0 1 1-2.4-2.4h2.4v2.4zm1.2 0a2.4 2.4 0 1 1 4.8 0v6a2.4 2.4 0 1 1-4.8 0v-6z" fill="#E01E5A"/>
    <path d="M20.4 17.4a2.4 2.4 0 1 1 2.4-2.4v2.4h-2.4zm0 1.2a2.4 2.4 0 1 1 0 4.8h-6a2.4 2.4 0 1 1 0-4.8h6z" fill="#36C5F0"/>
    <path d="M30.6 20.4a2.4 2.4 0 1 1 2.4 2.4h-2.4v-2.4zm-1.2 0a2.4 2.4 0 1 1-4.8 0v-6a2.4 2.4 0 1 1 4.8 0v6z" fill="#2EB67D"/>
    <path d="M27.6 30.6a2.4 2.4 0 1 1-2.4 2.4v-2.4h2.4zm0-1.2a2.4 2.4 0 1 1 0-4.8h6a2.4 2.4 0 1 1 0 4.8h-6z" fill="#ECB22E"/>
  </svg>
);

const INTEGRATION_LOGOS: Record<string, () => React.ReactElement> = {
  'WhatsApp Business': WhatsAppLogo,
  'Google Calendar': GoogleCalendarLogo,
  'Stripe': StripeLogo,
  'OpenAI': OpenAILogo,
  'Mailgun': MailgunLogo,
  'Slack': SlackLogo,
};

const INTEGRATIONS = [
  { provider: 'WhatsApp Business', desc: 'Envie e receba mensagens via API oficial', connected: true, apiKey: 'wk_***...8f2a' },
  { provider: 'Google Calendar', desc: 'Sincronize agendas bidirecionalmente', connected: true, apiKey: 'gc_***...3d1b' },
  { provider: 'Stripe', desc: 'Processar pagamentos e assinaturas', connected: false, apiKey: '' },
  { provider: 'OpenAI', desc: 'IA generativa para automações e chat', connected: false, apiKey: '' },
  { provider: 'Mailgun', desc: 'Envio de emails transacionais', connected: true, apiKey: 'mg_***...7c4e' },
  { provider: 'Slack', desc: 'Notificações em tempo real para equipe', connected: false, apiKey: '' },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // General
  const [companyName, setCompanyName] = useState('NexusCRM Demo');
  const [domain, setDomain] = useState('nexuscrm-demo');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [language, setLanguage] = useState('pt-BR');

  // Branding
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [logoUrl, setLogoUrl] = useState('');
  const [loginMessage, setLoginMessage] = useState('Bem-vindo ao seu CRM');

  // Integrations
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState('');

  // Webhooks
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://api.meusite.com/webhook/leads', events: ['lead.created', 'lead.updated'], active: true },
    { id: '2', url: 'https://hooks.slack.com/nexuscrm', events: ['deal.won'], active: true },
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState('lead.created');

  // API Keys
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Produção', key: 'nk_prod_a8f2c91e4b3d7f6', created: '2025-01-05', lastUsed: '2025-01-15' },
    { id: '2', name: 'Teste', key: 'nk_test_x7y3m9p2q1w5k8', created: '2025-01-10', lastUsed: '2025-01-14' },
  ]);
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());
  const [newKeyName, setNewKeyName] = useState('');

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    emailNewLead: true, emailDealWon: true, emailWeeklyReport: true,
    pushNewMessage: true, pushStageChange: false, pushReminders: true,
  });

  // Templates
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Boas-vindas', channel: 'whatsapp', content: 'Olá {{nome}}! Bem-vindo(a) ao NexusCRM. Como podemos ajudar?', vars: ['nome'] },
    { id: '2', name: 'Follow-up', channel: 'email', content: 'Olá {{nome}}, notamos que não tivemos retorno sobre {{assunto}}. Podemos agendar uma conversa?', vars: ['nome', 'assunto'] },
    { id: '3', name: 'Proposta Enviada', channel: 'whatsapp', content: 'Olá {{nome}}! Acabamos de enviar a proposta para {{empresa}}. Confira e nos avise se tiver dúvidas!', vars: ['nome', 'empresa'] },
  ]);
  const [editingTemplate, setEditingTemplate] = useState<typeof templates[0] | null>(null);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 600);
  };

  const toggleIntegration = (provider: string) => {
    setIntegrations(prev => prev.map(i => i.provider === provider ? { ...i, connected: !i.connected } : i));
  };

  const saveIntegrationKey = (provider: string) => {
    setIntegrations(prev => prev.map(i => i.provider === provider ? { ...i, apiKey: tempApiKey, connected: true } : i));
    setEditingIntegration(null);
    setTempApiKey('');
  };

  const addWebhook = () => {
    if (!newWebhookUrl) return;
    setWebhooks(prev => [...prev, { id: 'wh-' + Date.now(), url: newWebhookUrl, events: newWebhookEvents.split(',').map(s => s.trim()), active: true }]);
    setNewWebhookUrl('');
    setNewWebhookEvents('lead.created');
  };

  const addApiKey = () => {
    if (!newKeyName) return;
    setApiKeys(prev => [...prev, { id: 'k-' + Date.now(), name: newKeyName, key: 'nk_' + Math.random().toString(36).substring(2, 18), created: new Date().toISOString().split('T')[0], lastUsed: '-' }]);
    setNewKeyName('');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setLogoUrl(r.result as string); r.readAsDataURL(file); }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie sua empresa, integrações e preferências</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 flex-shrink-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-600 hover:bg-slate-50')}>
                <Icon className="h-4 w-4 flex-shrink-0" />{tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}>

              {/* GERAL */}
              {activeTab === 'general' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900">Informações Gerais</h2>
                  <div className="grid gap-5 max-w-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome da Empresa</label>
                      <div className="relative"><Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all" /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subdomínio</label>
                      <div className="relative"><Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input value={domain} onChange={e => setDomain(e.target.value)}
                          className="w-full pl-10 pr-32 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">.nexuscrm.com</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><Languages className="h-4 w-4 text-slate-400" />Idioma</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                          <option value="pt-BR">Português (Brasil)</option><option value="en-US">English (US)</option><option value="es-ES">Español</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><ClockIcon className="h-4 w-4 text-slate-400" />Fuso Horário</label>
                        <select value={timezone} onChange={e => setTimezone(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                          <option value="America/Sao_Paulo">Brasília (GMT-3)</option><option value="UTC">UTC</option><option value="America/New_York">New York (EST)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <><Check className="h-4 w-4" />Salvo!</> : <><Save className="h-4 w-4" />Salvar</>}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* BRANDING */}
              {activeTab === 'branding' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900">White Label</h2>
                  <div className="flex flex-col sm:flex-row gap-8">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Logo da Empresa</label>
                      <div className="relative group w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors">
                        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <div className="text-center"><Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" /><span className="text-xs text-slate-500">Upload</span></div>}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium rounded-2xl">Alterar</div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Cor Primária</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0" />
                          <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-32 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase" />
                          <div className="h-10 flex-1 rounded-xl" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}88)` }} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mensagem de Login</label>
                        <input value={loginMessage} onChange={e => setLoginMessage(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />Salvar Aparência</>}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* INTEGRAÇÕES */}
              {activeTab === 'integrations' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map(intg => (
                      <motion.div key={intg.provider} whileHover={{ y: -2 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">{INTEGRATION_LOGOS[intg.provider] ? INTEGRATION_LOGOS[intg.provider]() : <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Link2 className="h-4 w-4"/></div>}</div>
                            <div><h3 className="text-sm font-bold text-slate-900">{intg.provider}</h3><p className="text-xs text-slate-500">{intg.desc}</p></div>
                          </div>
                          <button onClick={() => toggleIntegration(intg.provider)}
                            className={cn('w-11 h-6 rounded-full transition-colors relative flex-shrink-0', intg.connected ? 'bg-emerald-500' : 'bg-slate-300')}>
                            <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm', intg.connected ? 'left-6' : 'left-1')} />
                          </button>
                        </div>
                        {editingIntegration === intg.provider ? (
                          <div className="flex gap-2">
                            <input value={tempApiKey} onChange={e => setTempApiKey(e.target.value)} placeholder="Cole sua API Key..."
                              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                            <button onClick={() => saveIntegrationKey(intg.provider)} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"><Check className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setEditingIntegration(null)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className={cn('flex items-center gap-1 text-xs font-semibold', intg.connected ? 'text-emerald-600' : 'text-slate-400')}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', intg.connected ? 'bg-emerald-500' : 'bg-slate-300')} />
                              {intg.connected ? 'Conectado' : 'Desconectado'}
                            </span>
                            <button onClick={() => { setEditingIntegration(intg.provider); setTempApiKey(intg.apiKey); }}
                              className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Configurar</button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* WEBHOOKS */}
              {activeTab === 'webhooks' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-5">
                  <h2 className="text-lg font-bold text-slate-900">Webhooks</h2>
                  <div className="space-y-3">
                    {webhooks.map(hook => (
                      <div key={hook.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-purple-50 rounded-lg border border-purple-100"><Webhook className="h-4 w-4 text-purple-600" /></div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 font-mono truncate">{hook.url}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Eventos: {hook.events.join(', ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <button onClick={() => { setWebhooks(p => p.map(w => w.id === hook.id ? { ...w, active: !w.active } : w)); }}
                            className={cn('text-xs font-semibold', hook.active ? 'text-emerald-600' : 'text-slate-400')}>
                            {hook.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          </button>
                          <button onClick={() => alert('Ping enviado!')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><ExternalLink className="h-4 w-4" /></button>
                          <button onClick={() => setWebhooks(p => p.filter(w => w.id !== hook.id))} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                    {webhooks.length === 0 && <p className="text-sm text-slate-500 text-center py-8">Nenhum webhook configurado.</p>}
                  </div>
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">Adicionar Endpoint</h3>
                    <div className="flex gap-3">
                      <input value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)} placeholder="https://api.exemplo.com/webhook"
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      <select value={newWebhookEvents} onChange={e => setNewWebhookEvents(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                        <option value="lead.created">lead.created</option><option value="lead.updated">lead.updated</option><option value="deal.won">deal.won</option><option value="message.received">message.received</option>
                      </select>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={addWebhook}
                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25"><Plus className="h-4 w-4" /></motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* API KEYS */}
              {activeTab === 'apikeys' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-5">
                  <h2 className="text-lg font-bold text-slate-900">Chaves de API</h2>
                  <div className="space-y-3">
                    {apiKeys.map(k => (
                      <div key={k.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 rounded-lg border border-amber-100"><Key className="h-4 w-4 text-amber-600" /></div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{k.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <code className="text-xs text-slate-500 font-mono">{showKeys.has(k.id) ? k.key : k.key.substring(0, 8) + '••••••••'}</code>
                              <button onClick={() => setShowKeys(prev => { const n = new Set(prev); n.has(k.id) ? n.delete(k.id) : n.add(k.id); return n; })}
                                className="text-slate-400 hover:text-slate-600">{showKeys.has(k.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
                              <button onClick={() => { navigator.clipboard.writeText(k.key); alert('Copiado!'); }} className="text-slate-400 hover:text-slate-600"><Copy className="h-3 w-3" /></button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>Criada: {k.created}</span>
                          <button onClick={() => setApiKeys(p => p.filter(x => x.id !== k.id))} className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Nome da nova chave..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={addApiKey} disabled={!newKeyName}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                      <Plus className="h-4 w-4" /> Gerar Chave
                    </motion.button>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900">Preferências de Notificação</h2>
                  {[
                    { title: 'Notificações por E-mail', items: [
                      { key: 'emailNewLead' as const, label: 'Novo lead cadastrado', desc: 'Receba um email quando um novo lead entrar' },
                      { key: 'emailDealWon' as const, label: 'Negócio fechado', desc: 'Quando um deal for marcado como ganho' },
                      { key: 'emailWeeklyReport' as const, label: 'Relatório semanal', desc: 'Resumo da semana toda segunda-feira' },
                    ]},
                    { title: 'Notificações Push', items: [
                      { key: 'pushNewMessage' as const, label: 'Nova mensagem', desc: 'Quando receber uma mensagem de um lead' },
                      { key: 'pushStageChange' as const, label: 'Mudança de etapa', desc: 'Quando um lead mudar de etapa no pipeline' },
                      { key: 'pushReminders' as const, label: 'Lembretes de agenda', desc: 'Antes de reuniões e compromissos' },
                    ]},
                  ].map(section => (
                    <div key={section.title}>
                      <h3 className="text-sm font-bold text-slate-700 mb-3">{section.title}</h3>
                      <div className="space-y-2">
                        {section.items.map(itm => (
                          <div key={itm.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div><p className="text-sm font-medium text-slate-900">{itm.label}</p><p className="text-xs text-slate-500">{itm.desc}</p></div>
                            <button onClick={() => setNotifSettings(p => ({ ...p, [itm.key]: !p[itm.key] }))}
                              className={cn('w-11 h-6 rounded-full transition-colors relative flex-shrink-0', notifSettings[itm.key] ? 'bg-indigo-500' : 'bg-slate-300')}>
                              <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm', notifSettings[itm.key] ? 'left-6' : 'left-1')} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-100">
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />Salvar Preferências</>}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* TEMPLATES */}
              {activeTab === 'templates' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Templates de Mensagem</h2>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditingTemplate({ id: '', name: '', channel: 'whatsapp', content: '', vars: [] })}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
                      <Plus className="h-4 w-4" /> Novo Template
                    </motion.button>
                  </div>
                  <div className="space-y-3">
                    {templates.map(tpl => (
                      <div key={tpl.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{tpl.name}</h3>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100">{tpl.channel}</span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setEditingTemplate({ ...tpl })} className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600"><Edit2 className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setTemplates(p => p.filter(t => t.id !== tpl.id))} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{tpl.content}</p>
                        <div className="flex gap-1">{tpl.vars.map(v => <span key={v} className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-md border border-amber-100 font-mono">{`{{${v}}}`}</span>)}</div>
                      </div>
                    ))}
                  </div>
                  {editingTemplate && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingTemplate(null)}>
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                          <h2 className="text-lg font-bold text-slate-900">{editingTemplate.id ? 'Editar' : 'Novo'} Template</h2>
                          <button onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5 text-slate-500" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome</label>
                              <input value={editingTemplate.name} onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Canal</label>
                              <select value={editingTemplate.channel} onChange={e => setEditingTemplate({ ...editingTemplate, channel: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                                <option value="whatsapp">WhatsApp</option><option value="email">E-mail</option><option value="sms">SMS</option><option value="universal">Universal</option>
                              </select></div>
                          </div>
                          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Conteúdo</label>
                            <textarea value={editingTemplate.content} onChange={e => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 resize-none" placeholder="Use {{variavel}} para campos dinâmicos" />
                            <p className="text-[10px] text-slate-400 mt-1">Variáveis detectadas: {(editingTemplate.content.match(/\{\{(\w+)\}\}/g) || []).join(', ') || 'nenhuma'}</p></div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex gap-3">
                          <button onClick={() => setEditingTemplate(null)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium">Cancelar</button>
                          <motion.button whileTap={{ scale: 0.98 }} onClick={() => {
                            const vars = (editingTemplate.content.match(/\{\{(\w+)\}\}/g) || []).map(v => v.replace(/\{\{|\}\}/g, ''));
                            if (editingTemplate.id) { setTemplates(p => p.map(t => t.id === editingTemplate.id ? { ...editingTemplate, vars } : t)); }
                            else { setTemplates(p => [...p, { ...editingTemplate, id: 't-' + Date.now(), vars }]); }
                            setEditingTemplate(null);
                          }} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
                            Salvar Template
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              {/* BILLING */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="relative z-10">
                        <p className="text-sm font-medium opacity-80">Plano Atual</p>
                        <h3 className="text-3xl font-bold mt-1">Enterprise</h3>
                        <p className="text-sm mt-1 opacity-80">R$ 497/mês</p>
                        <p className="text-xs mt-4 opacity-70 flex items-center gap-1"><Zap className="h-3 w-3" />Renova em 01/02/2025</p>
                      </div>
                    </div>
                    <div className="col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-4">Uso do Plano</h3>
                      {[
                        { label: 'Usuários', used: 8, limit: 999, unit: '' },
                        { label: 'Leads', used: 423, limit: 999999, unit: '' },
                        { label: 'Armazenamento', used: 4.2, limit: 50, unit: 'GB' },
                      ].map(item => (
                        <div key={item.label} className="mb-3 last:mb-0">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600 font-medium">{item.label}</span>
                            <span className="font-semibold text-slate-900">{item.used}{item.unit} <span className="text-slate-400 font-normal">/ {item.limit > 9000 ? '∞' : item.limit + item.unit}</span></span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${Math.min((item.used / item.limit) * 100, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
                        <button className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Ver Faturas</button>
                        <motion.button whileTap={{ scale: 0.98 }} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
                          Fazer Upgrade
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
