import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Target, MessageSquare, Zap, Settings, ArrowRight, Check, X, Rocket } from 'lucide-react';
import { cn } from '@/utils/cn';

const steps = [
  { icon: Target, title: 'Pipeline de Vendas', desc: 'Organize seus leads em etapas visuais e acompanhe cada oportunidade.', color: 'from-indigo-500 to-blue-500' },
  { icon: Users, title: 'Cadastro Completo', desc: 'Gerencie leads PF e PJ com documentos, histórico e contatos.', color: 'from-purple-500 to-violet-500' },
  { icon: MessageSquare, title: 'Central Omnichannel', desc: 'Conversas de WhatsApp, Instagram, Facebook e mais em um só lugar.', color: 'from-emerald-500 to-teal-500' },
  { icon: Zap, title: 'Automações', desc: 'Crie fluxos automáticos de boas-vindas, follow-ups e distribuição.', color: 'from-amber-500 to-orange-500' },
  { icon: Settings, title: 'White Label', desc: 'Personalize com sua marca: logo, cores e domínio próprio.', color: 'from-pink-500 to-rose-500' },
];

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const seen = localStorage.getItem('nexuscrm_onboarding_done');
    if (!seen) { setTimeout(() => setShow(true), 800); }
  }, []);

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, step]));
    if (step < steps.length - 1) setStep(step + 1);
    else handleClose();
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('nexuscrm_onboarding_done', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" onClick={handleClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close */}
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl z-10 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-8 pt-8 pb-16 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">NexusCRM</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Bem-vindo ao NexusCRM! 🎉</h2>
                <p className="text-indigo-200 text-sm mt-1">Conheça as principais funcionalidades em {steps.length} passos rápidos.</p>
              </motion.div>
            </div>

            {/* Content */}
            <div className="px-8 -mt-8 relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
                >
                  {(() => {
                    const s = steps[step];
                    const Icon = s.icon;
                    return (
                      <div className="text-center">
                        <div className={cn('h-16 w-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mx-auto mb-4 shadow-xl', s.color)}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress */}
            <div className="px-8 pt-5 pb-6 space-y-4">
              {/* Step dots */}
              <div className="flex justify-center gap-2">
                {steps.map((_, i) => (
                  <button key={i} onClick={() => setStep(i)}
                    className={cn('h-2 rounded-full transition-all',
                      i === step ? 'w-8 bg-indigo-600' :
                      completedSteps.has(i) ? 'w-2 bg-emerald-400' :
                      'w-2 bg-slate-200 hover:bg-slate-300')}>
                  </button>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={handleClose}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Pular
                </button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleNext}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2">
                  {step === steps.length - 1 ? (
                    <><Rocket className="h-4 w-4" /> Começar!</>
                  ) : (
                    <><span>Próximo</span><ArrowRight className="h-4 w-4" /></>
                  )}
                </motion.button>
              </div>

              {/* Checklist */}
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {steps.map((s, i) => (
                  <span key={i} className={cn('flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg',
                    completedSteps.has(i) ? 'bg-emerald-50 text-emerald-600' :
                    i === step ? 'bg-indigo-50 text-indigo-600' :
                    'bg-slate-50 text-slate-400')}>
                    {completedSteps.has(i) ? <Check className="h-2.5 w-2.5" /> : <span className="h-2.5 w-2.5 rounded-full border border-current inline-block" />}
                    {s.title}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
