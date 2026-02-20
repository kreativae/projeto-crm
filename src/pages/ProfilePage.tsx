import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, Key, Shield, Bell, Clock, Save, Check, RefreshCw, Eye, EyeOff, Sparkles, Globe, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/utils/cn';

const TABS = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'appearance', label: 'Aparência', icon: Palette },
];

export function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('(11) 99999-0000');
  const [bio, setBio] = useState('Administrador do sistema NexusCRM');

  // Security
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    emailNewLead: true, emailDealWon: true, emailWeekly: true,
    pushMessages: true, pushStageChange: false, pushReminders: true,
    pushMentions: true,
  });

  // Appearance
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState('pt-BR');
  const [compactMode, setCompactMode] = useState(false);

  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Perfil atualizado!', 'Suas alterações foram salvas.'); }, 700);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { toast.error('Senhas não coincidem', 'A nova senha e a confirmação devem ser iguais.'); return; }
    if (newPass.length < 6) { toast.warning('Senha fraca', 'A senha deve ter no mínimo 6 caracteres.'); return; }
    setSaving(true);
    setTimeout(() => { setSaving(false); setCurrentPass(''); setNewPass(''); setConfirmPass(''); toast.success('Senha alterada!', 'Sua senha foi atualizada com sucesso.'); }, 700);
  };

  const handleSaveNotifs = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Preferências salvas!'); }, 500);
  };

  const handleSaveAppearance = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Aparência atualizada!'); }, 500);
  };

  const roleLabels: Record<string, string> = { admin: 'Administrador', gestor: 'Gestor', vendedor: 'Vendedor', suporte: 'Suporte' };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Meu Perfil</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie suas informações pessoais e preferências</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="relative group">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border border-white/20 shadow-xl">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CS'}
            </div>
            <button className="absolute -bottom-1 -right-1 h-7 w-7 bg-white text-indigo-600 rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name || 'Carlos Silva'}</h2>
            <p className="text-indigo-200 text-sm">{user?.email || 'carlos@nexuscrm.com'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-semibold border border-white/10">
                <Sparkles className="h-3 w-3 inline mr-1" />
                {roleLabels[user?.role || 'admin']}
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 rounded-lg text-xs font-semibold border border-emerald-400/20">
                ● Online
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
              activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-slate-900">Informações Pessoais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo</label>
              <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all" /></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input value={email} readOnly className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed" /></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
              <div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all" /></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fuso Horário</label>
              <div className="relative"><Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none">
                  <option>America/Sao_Paulo (GMT-3)</option><option>UTC</option>
                </select></div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio</label>
              <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveProfile} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Salvar Perfil</>}
            </motion.button>
          </div>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Key className="h-5 w-5 text-indigo-500" /> Alterar Senha</h3>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha Atual</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm pr-12 focus:ring-2 focus:ring-indigo-500/40" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nova Senha</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm pr-12 focus:ring-2 focus:ring-indigo-500/40" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPass && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={cn('h-1 flex-1 rounded-full', newPass.length >= i * 3 ? (i <= 2 ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-slate-200')} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmar Nova Senha</label>
              <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                className={cn('w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40',
                  confirmPass && confirmPass !== newPass ? 'border-red-300' : 'border-slate-200')} />
              {confirmPass && confirmPass === newPass && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><Check className="h-3 w-3" /> Senhas coincidem</p>}
            </div>
            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={saving || !currentPass || !newPass}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Key className="h-4 w-4" /> Alterar Senha</>}
            </motion.button>
          </form>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Preferências de Notificação</h3>
          {[
            { title: 'E-mail', items: [
              { key: 'emailNewLead' as const, label: 'Novo lead', desc: 'Quando um novo lead entrar' },
              { key: 'emailDealWon' as const, label: 'Negócio fechado', desc: 'Deal marcado como ganho' },
              { key: 'emailWeekly' as const, label: 'Relatório semanal', desc: 'Resumo toda segunda' },
            ]},
            { title: 'Push', items: [
              { key: 'pushMessages' as const, label: 'Novas mensagens', desc: 'Quando receber mensagem' },
              { key: 'pushStageChange' as const, label: 'Mudança de etapa', desc: 'Lead muda de etapa' },
              { key: 'pushReminders' as const, label: 'Lembretes', desc: 'Antes de reuniões' },
              { key: 'pushMentions' as const, label: 'Menções', desc: 'Quando mencionado' },
            ]},
          ].map(section => (
            <div key={section.title}>
              <h4 className="text-sm font-bold text-slate-700 mb-3">{section.title}</h4>
              <div className="space-y-2">
                {section.items.map(itm => (
                  <div key={itm.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div><p className="text-sm font-medium text-slate-900">{itm.label}</p><p className="text-xs text-slate-500">{itm.desc}</p></div>
                    <button onClick={() => setNotifs(p => ({ ...p, [itm.key]: !p[itm.key] }))}
                      className={cn('w-11 h-6 rounded-full transition-colors relative', notifs[itm.key] ? 'bg-indigo-500' : 'bg-slate-300')}>
                      <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm', notifs[itm.key] ? 'left-6' : 'left-1')} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveNotifs} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Salvar</>}
          </motion.button>
        </motion.div>
      )}

      {activeTab === 'appearance' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Aparência & Idioma</h3>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Tema</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light' as const, label: 'Claro', icon: '☀️' },
                { id: 'dark' as const, label: 'Escuro', icon: '🌙' },
                { id: 'system' as const, label: 'Sistema', icon: '💻' },
              ].map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={cn('p-4 rounded-xl border text-center transition-all',
                    theme === t.id ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50')}>
                  <span className="text-2xl mb-2 block">{t.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><Globe className="h-4 w-4 text-slate-400" /> Idioma</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full max-w-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              <option value="pt-BR">Português (Brasil)</option><option value="en-US">English (US)</option><option value="es-ES">Español</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 max-w-md">
            <div><p className="text-sm font-medium text-slate-900">Modo Compacto</p><p className="text-xs text-slate-500">Reduz espaçamento para mais dados na tela</p></div>
            <button onClick={() => setCompactMode(!compactMode)}
              className={cn('w-11 h-6 rounded-full transition-colors relative', compactMode ? 'bg-indigo-500' : 'bg-slate-300')}>
              <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm', compactMode ? 'left-6' : 'left-1')} />
            </button>
          </div>
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveAppearance} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Salvar</>}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
