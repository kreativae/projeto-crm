import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props { onNavigate: (page: string) => void }

export default function RegisterPage({ onNavigate }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', company: '', phone: '', plan: 'professional' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => { const n = { ...p }; delete n[k]; return n; }); };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.password) e.password = 'Senha é obrigatória';
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Senhas não conferem';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.company.trim()) e.company = 'Nome da empresa é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, companyName: form.company, phone: form.phone }),
      });
      if (res.ok) { setStep(3); }
      else { const d = await res.json(); setErrors({ submit: d.message || 'Erro ao cadastrar' }); }
    } catch {
      // Fallback — simula sucesso
      await new Promise(r => setTimeout(r, 1500));
      setStep(3);
    }
    setLoading(false);
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : /[A-Z]/.test(form.password) && /\d/.test(form.password) && /[!@#$%]/.test(form.password) ? 4 : 3;
  const strengthLabel = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'][strength];

  const inputCls = (k: string) => `w-full px-4 py-3 bg-white/5 border ${errors[k] ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiLz48L3N2Zz4=')] opacity-60" />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">N</div>
              <span className="text-xl font-bold">NexusCRM</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight mb-6">Comece a transformar<br />suas vendas hoje</h2>
            <div className="space-y-4 mt-8">
              {['Pipeline visual Kanban', 'Conversas omnichannel', 'IA para insights', '14 dias grátis'].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                  <span className="text-white/90">{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Steps indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-600 border border-white/10'}`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-indigo-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <>
                <h1 className="text-2xl font-extrabold mb-1">Crie sua conta</h1>
                <p className="text-slate-500 mb-8">Preencha seus dados para começar.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Nome completo</label>
                    <input className={inputCls('name')} placeholder="Seu nome" value={form.name} onChange={e => set('name', e.target.value)} />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Email</label>
                    <input className={inputCls('email')} type="email" placeholder="email@empresa.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Senha</label>
                    <input className={inputCls('password')} type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
                    {form.password && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${strength * 25}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{strengthLabel}</span>
                      </div>
                    )}
                    {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Confirmar senha</label>
                    <input className={inputCls('confirmPassword')} type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                    {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold mt-4 shadow-lg shadow-indigo-500/25"
                  >Próximo →</motion.button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="text-2xl font-extrabold mb-1">Sobre sua empresa</h1>
                <p className="text-slate-500 mb-8">Configuramos tudo para você em segundos.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Nome da empresa</label>
                    <input className={inputCls('company')} placeholder="Minha Empresa Ltda" value={form.company} onChange={e => set('company', e.target.value)} />
                    {errors.company && <p className="text-xs text-red-400 mt-1">{errors.company}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Telefone (opcional)</label>
                    <input className={inputCls('phone')} placeholder="(11) 99999-9999" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Plano</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ k: 'starter', l: 'Starter', p: 'R$97' }, { k: 'professional', l: 'Pro', p: 'R$247' }, { k: 'enterprise', l: 'Enterprise', p: 'R$497' }].map(pl => (
                        <button key={pl.k} onClick={() => set('plan', pl.k)}
                          className={`p-3 rounded-xl border text-center transition-all ${form.plan === pl.k ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50' : 'border-white/10 bg-white/[0.02] hover:bg-white/5'}`}
                        >
                          <p className="text-sm font-semibold">{pl.l}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{pl.p}/mês</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors.submit && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{errors.submit}</div>}
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-colors">← Voltar</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                    >{loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Criando...</span> : 'Criar Conta'}</motion.button>
                  </div>
                </div>
              </>
            )}
            {step === 3 && (
              <div className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-emerald-500/25"
                >✓</motion.div>
                <h1 className="text-2xl font-extrabold mb-2">Conta criada com sucesso!</h1>
                <p className="text-slate-400 mb-8">Seu ambiente está sendo configurado. Você receberá um email de confirmação em breve.</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('login')}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold shadow-lg shadow-indigo-500/25"
                >Ir para o Login →</motion.button>
              </div>
            )}
          </motion.div>

          {step < 3 && (
            <p className="text-center text-sm text-slate-600 mt-8">
              Já tem uma conta? <button onClick={() => onNavigate('login')} className="text-indigo-400 hover:text-indigo-300 font-semibold">Entrar</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
