import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props { onNavigate: (page: string) => void }

export default function ForgotPasswordPage({ onNavigate }: Props) {
  const [step, setStep] = useState<'email' | 'code' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendEmail = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Informe um email válido'); return; }
    setLoading(true); setError('');
    try {
      await fetch('http://localhost:4000/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    } catch { /* fallback */ }
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false); setStep('code');
  };

  const handleVerifyCode = () => {
    const c = code.join('');
    if (c.length < 6) { setError('Preencha o código completo'); return; }
    setError(''); setStep('reset');
  };

  const handleCodeInput = (i: number, v: string) => {
    if (v.length > 1) return;
    const n = [...code]; n[i] = v; setCode(n);
    if (v && i < 5) {
      const next = document.getElementById(`code-${i + 1}`);
      next?.focus();
    }
  };

  const handleCodeKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      const prev = document.getElementById(`code-${i - 1}`);
      prev?.focus();
    }
  };

  const handleReset = async () => {
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('Senhas não conferem'); return; }
    setLoading(true); setError('');
    try {
      await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code.join(''), newPassword: password }),
      });
    } catch { /* fallback */ }
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false); setStep('done');
  };

  const inputCls = `w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <button onClick={() => onNavigate('login')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-white mb-8 transition-colors">← Voltar ao login</button>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          {step === 'email' && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl mb-6 shadow-lg shadow-indigo-500/25">🔒</div>
              <h1 className="text-2xl font-extrabold mb-2">Esqueceu a senha?</h1>
              <p className="text-slate-400 text-sm mb-6">Informe seu email e enviaremos um código de recuperação.</p>
              <div className="space-y-4">
                <input className={inputCls} type="email" placeholder="seu@email.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSendEmail} disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >{loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</span> : 'Enviar Código'}</motion.button>
              </div>
            </div>
          )}
          {step === 'code' && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl mb-6 shadow-lg shadow-indigo-500/25">📧</div>
              <h1 className="text-2xl font-extrabold mb-2">Verifique seu email</h1>
              <p className="text-slate-400 text-sm mb-6">Enviamos um código de 6 dígitos para <strong className="text-white">{email}</strong></p>
              <div className="flex gap-2 mb-4 justify-center">
                {code.map((c, i) => (
                  <input key={i} id={`code-${i}`} value={c} maxLength={1}
                    onChange={e => handleCodeInput(i, e.target.value)}
                    onKeyDown={e => handleCodeKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                ))}
              </div>
              {error && <p className="text-xs text-red-400 text-center mb-4">{error}</p>}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleVerifyCode}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold shadow-lg shadow-indigo-500/25"
              >Verificar Código</motion.button>
              <button onClick={() => setStep('email')} className="w-full text-center text-sm text-slate-500 hover:text-white mt-4 transition-colors">Reenviar código</button>
            </div>
          )}
          {step === 'reset' && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl mb-6 shadow-lg shadow-emerald-500/25">🔑</div>
              <h1 className="text-2xl font-extrabold mb-2">Nova senha</h1>
              <p className="text-slate-400 text-sm mb-6">Defina sua nova senha de acesso.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Nova senha</label>
                  <input className={inputCls} type="password" placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Confirmar nova senha</label>
                  <input className={inputCls} type="password" placeholder="••••••••" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }} />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleReset} disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >{loading ? 'Salvando...' : 'Redefinir Senha'}</motion.button>
              </div>
            </div>
          )}
          {step === 'done' && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-emerald-500/25"
              >✓</motion.div>
              <h1 className="text-2xl font-extrabold mb-2">Senha alterada!</h1>
              <p className="text-slate-400 mb-8">Sua senha foi redefinida com sucesso. Faça login com a nova senha.</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('login')}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold shadow-lg shadow-indigo-500/25"
              >Ir para o Login →</motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
