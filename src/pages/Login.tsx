import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle, Zap, BarChart3, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DEMO_CREDENTIALS = { email: 'carlos@nexuscrm.com', password: 'admin123' };
const DEMO_USER = { id: 'u1', name: 'Carlos Silva', email: 'carlos@nexuscrm.com', role: 'admin', tenantId: 't1' };

const features = [
  { icon: Zap, title: 'Automações Inteligentes', desc: 'Fluxos automáticos que economizam horas' },
  { icon: BarChart3, title: 'Analytics em Tempo Real', desc: 'Dashboards e métricas customizáveis' },
  { icon: MessageSquare, title: 'Central Omnichannel', desc: 'WhatsApp, Instagram, Facebook e mais' },
  { icon: Shield, title: 'Segurança Enterprise', desc: 'JWT, RBAC e criptografia avançada' },
];

export function LoginPage({ onForgot, onRegister }: { onForgot?: () => void; onRegister?: () => void }) {
  const { login } = useAuth();
  const [view, setView] = useState<'login' | 'forgot' | 'reset-sent'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Preencha todos os campos.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    try {
      const { default: api } = await import('../services/api');
      const response = await api.post('/auth/login', { email, password });
      const d = response.data?.data || response.data;
      login(d.tokens?.accessToken || d.token, d.user);
    } catch {
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        login('demo-token-' + Date.now(), DEMO_USER);
      } else {
        setError('Email ou senha incorretos.');
      }
    } finally { setLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setView('reset-sent');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-[55%] bg-animated-gradient p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-300/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-300/10 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">NexusCRM</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative z-10 space-y-10">
          <div>
            <h2 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Transforme seus<br />
              <span className="text-indigo-200">leads em clientes</span><br />
              fiéis.
            </h2>
            <p className="text-indigo-200/80 text-lg mt-4 max-w-md">
              O CRM mais completo do mercado. Pipeline visual, automações e analytics em uma única plataforma.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="p-4 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/10 hover:bg-white/12 transition-colors"
              >
                <f.icon className="h-5 w-5 text-indigo-200 mb-2" />
                <h3 className="text-white text-sm font-semibold">{f.title}</h3>
                <p className="text-indigo-200/60 text-xs mt-0.5">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="relative z-10">
          <p className="text-indigo-300/60 text-sm">© 2025 NexusCRM. Plataforma SaaS White Label.</p>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-white via-slate-50 to-indigo-50/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {view === 'login' && (
            <>
              <div className="flex items-center gap-3 mb-8 lg:hidden">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">NexusCRM</span>
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h1>
                <p className="text-slate-500 mt-2">Entre com suas credenciais para acessar o painel.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all shadow-sm"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all shadow-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-slate-600">Lembrar-me</span>
                  </label>
                  <button type="button" onClick={() => onForgot ? onForgot() : setView('forgot')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                    Esqueci minha senha
                  </button>
                </div>

                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-600/25 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Entrar</span><ArrowRight className="h-4 w-4" /></>}
                </motion.button>
              </form>

              {onRegister && (
                <p className="text-center text-sm text-slate-500 mt-6">
                  Não tem conta? <button type="button" onClick={onRegister} className="text-indigo-600 hover:text-indigo-700 font-semibold">Criar conta grátis</button>
                </p>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/60">
                <p className="text-xs text-indigo-600 font-semibold mb-1">🔐 Credenciais de demonstração</p>
                <p className="text-xs text-indigo-500/80">Email: carlos@nexuscrm.com | Senha: admin123</p>
              </motion.div>
            </>
          )}

          {view === 'forgot' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recuperar senha</h1>
                <p className="text-slate-500 mt-2">Informe seu e-mail para receber o link de recuperação.</p>
              </div>
              <form onSubmit={handleForgot} className="space-y-5">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all shadow-sm"
                    placeholder="seu@email.com" />
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm shadow-xl shadow-indigo-600/25 disabled:opacity-70">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Enviar link de recuperação'}
                </motion.button>
                <button type="button" onClick={() => setView('login')}
                  className="w-full py-3 text-sm text-slate-600 hover:text-slate-800 font-medium">← Voltar para o login</button>
              </form>
            </>
          )}

          {view === 'reset-sent' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 mb-6 shadow-lg shadow-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">E-mail enviado!</h1>
              <p className="text-slate-500 mb-8">Verifique <strong>{forgotEmail}</strong> e siga as instruções.</p>
              <motion.button whileTap={{ scale: 0.98 }}
                onClick={() => { setView('login'); setForgotEmail(''); }}
                className="py-3.5 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm shadow-xl shadow-indigo-600/25">
                Voltar para o login
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
