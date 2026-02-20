import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = [
  { q: 'Como adicionar um novo lead?', a: 'Acesse a página "Leads" no menu lateral e clique no botão "+ Novo Lead". Preencha os dados e salve.' },
  { q: 'Como mover um deal no pipeline?', a: 'Na página "Pipeline", arraste o card do lead de uma coluna para outra. A mudança é salva automaticamente.' },
  { q: 'Como conectar o WhatsApp?', a: 'Vá em Configurações → Integrações → WhatsApp e clique em "Conectar". Insira sua API Key da Meta Business.' },
  { q: 'Como usar a IA?', a: 'Acesse "NexusIA" no menu lateral. Você pode pedir resumos de pipeline, leads, agenda e conversas.' },
  { q: 'Como convidar um usuário?', a: 'Em "Usuários", clique em "+ Convidar Usuário". Defina o nome, email, perfil e supervisor.' },
];

export default function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'faq' | 'contact'>('menu');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSendContact = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setContactForm({ subject: '', message: '' }); setView('menu'); }, 2500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => { setOpen(!open); setView('menu'); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center text-2xl text-white hover:shadow-indigo-500/50 transition-shadow"
      >
        {open ? '✕' : '💬'}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
              <h3 className="text-lg font-bold text-white">Central de Ajuda</h3>
              <p className="text-indigo-100 text-sm mt-0.5">Como podemos ajudar?</p>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <motion.div key={view} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                {view === 'menu' && (
                  <div className="space-y-2">
                    <button onClick={() => setView('faq')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left"
                    >
                      <span className="text-2xl">📖</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Perguntas Frequentes</p>
                        <p className="text-xs text-slate-500">Respostas rápidas para dúvidas comuns</p>
                      </div>
                    </button>
                    <button onClick={() => setView('contact')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left"
                    >
                      <span className="text-2xl">✉️</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Falar com Suporte</p>
                        <p className="text-xs text-slate-500">Envie uma mensagem para nossa equipe</p>
                      </div>
                    </button>
                    <a href="https://docs.nexuscrm.com" target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-2xl">📚</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Documentação</p>
                        <p className="text-xs text-slate-500">Guias completos e tutoriais</p>
                      </div>
                    </a>
                    <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <p className="text-xs text-indigo-300">💡 <strong>Dica:</strong> Use <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">⌘K</kbd> para buscar qualquer coisa no sistema.</p>
                    </div>
                  </div>
                )}

                {view === 'faq' && (
                  <div>
                    <button onClick={() => setView('menu')} className="text-xs text-slate-500 hover:text-white mb-3 flex items-center gap-1 transition-colors">← Voltar</button>
                    <div className="space-y-2">
                      {FAQ.map((f, i) => (
                        <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                          <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
                          >
                            <span className="text-sm font-medium text-white pr-2">{f.q}</span>
                            <span className={`text-slate-500 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}>▾</span>
                          </button>
                          <AnimatePresence>
                            {expandedFaq === i && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <p className="text-sm text-slate-400 px-3 pb-3 leading-relaxed">{f.a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {view === 'contact' && (
                  <div>
                    <button onClick={() => setView('menu')} className="text-xs text-slate-500 hover:text-white mb-3 flex items-center gap-1 transition-colors">← Voltar</button>
                    {sent ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                        <div className="text-4xl mb-3">✅</div>
                        <p className="font-semibold text-white">Mensagem enviada!</p>
                        <p className="text-sm text-slate-500 mt-1">Responderemos em até 24h.</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Assunto</label>
                          <input
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="Ex: Problema com integração"
                            value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Mensagem</label>
                          <textarea rows={4}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                            placeholder="Descreva seu problema ou dúvida..."
                            value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                          />
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSendContact}
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg font-semibold text-sm shadow-lg shadow-indigo-500/25"
                        >Enviar Mensagem</motion.button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
