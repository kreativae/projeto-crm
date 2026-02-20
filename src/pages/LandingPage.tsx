import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = ['Recursos', 'Preços', 'Sobre', 'Contato'];

const FEATURES = [
  { icon: '🎯', title: 'Pipeline Visual', desc: 'Kanban drag & drop com etapas configuráveis. Visualize todo seu funil de vendas em tempo real.', color: 'from-indigo-500 to-blue-500' },
  { icon: '💬', title: 'Omnichannel', desc: 'WhatsApp, Instagram, Facebook, Telegram e Email — todas as conversas em um só lugar.', color: 'from-purple-500 to-pink-500' },
  { icon: '🤖', title: 'IA Integrada', desc: 'Assistente inteligente que analisa seus dados e gera insights automáticos sobre vendas.', color: 'from-emerald-500 to-teal-500' },
  { icon: '📅', title: 'Agenda Inteligente', desc: 'Drag & drop de eventos, integração com Google Calendar e lembretes automáticos.', color: 'from-amber-500 to-orange-500' },
  { icon: '⚡', title: 'Automações', desc: 'Fluxos automáticos de boas-vindas, follow-up e distribuição de leads sem código.', color: 'from-red-500 to-rose-500' },
  { icon: '📊', title: 'Analytics Avançado', desc: 'Dashboards com conversão por etapa, performance de canais e métricas customizáveis.', color: 'from-cyan-500 to-blue-500' },
];

const PLANS = [
  { name: 'Starter', price: '97', desc: 'Para pequenas equipes', features: ['3 usuários', '500 leads', '1 pipeline', 'Email', 'Relatórios básicos'], popular: false },
  { name: 'Professional', price: '247', desc: 'Para equipes em crescimento', features: ['10 usuários', '5.000 leads', '5 pipelines', 'Omnichannel completo', 'Automações', 'IA Assistente', 'API Access'], popular: true },
  { name: 'Enterprise', price: '497', desc: 'Para grandes operações', features: ['Usuários ilimitados', 'Leads ilimitados', 'Pipelines ilimitados', 'White Label', 'Suporte prioritário', 'SLA dedicado', 'Integrações custom'], popular: false },
];

const TESTIMONIALS = [
  { name: 'Ana Silva', role: 'CEO, TechStart', text: 'Triplicamos nossa taxa de conversão em 3 meses. O pipeline visual mudou completamente nossa operação.', avatar: 'AS' },
  { name: 'Carlos Mendes', role: 'Dir. Comercial, VendaMax', text: 'A integração omnichannel nos economiza 4 horas por dia. Todas as conversas em um só lugar.', avatar: 'CM' },
  { name: 'Juliana Costa', role: 'Gerente, InovaHub', text: 'A IA integrada nos dá insights que antes levávamos semanas para descobrir. Impressionante.', avatar: 'JC' },
];

const STATS = [
  { value: '2.500+', label: 'Empresas ativas' },
  { value: '1.2M', label: 'Leads gerenciados' },
  { value: '98%', label: 'Satisfação' },
  { value: '3x', label: 'Mais conversões' },
];

export default function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : ''}`}
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">N</div>
            <span className="text-lg font-bold">NexusCRM</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase())} className="text-sm text-slate-400 hover:text-white transition-colors">{l}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => onNavigate('login')} className="text-sm text-slate-300 hover:text-white px-4 py-2">Entrar</button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('register')}
              className="text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-shadow"
            >Começar Grátis</motion.button>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-2xl">☰</button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-slate-900 border-t border-white/5 overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-3">
                {NAV_LINKS.map(l => (
                  <button key={l} onClick={() => scrollTo(l.toLowerCase())} className="text-left text-slate-300 py-2">{l}</button>
                ))}
                <button onClick={() => onNavigate('login')} className="text-left text-slate-300 py-2">Entrar</button>
                <button onClick={() => onNavigate('register')} className="bg-indigo-600 text-white py-2 rounded-lg text-center font-semibold">Começar Grátis</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 text-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full mb-6">
              ✨ Novo: IA Integrada para análise de vendas
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              O CRM que sua
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> equipe merece</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Pipeline visual, conversas omnichannel, automações inteligentes e IA — tudo em uma plataforma SaaS moderna e pronta para escalar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('register')}
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
              >Teste Grátis 14 Dias</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => scrollTo('recursos')}
                className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >Ver Recursos →</motion.button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/80 border border-white/10 rounded-2xl p-2 shadow-2xl">
              <div className="bg-slate-900 rounded-xl p-1">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></div>
                  <span className="text-xs text-slate-500 ml-2">app.nexuscrm.com</span>
                </div>
                <div className="aspect-[16/8] bg-gradient-to-br from-slate-800 to-slate-900 rounded-b-lg flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-3 p-6 w-full max-w-2xl">
                    {[
                      { l: 'Leads Hoje', v: '47', c: 'text-emerald-400', i: '↑ 12%' },
                      { l: 'Pipeline', v: 'R$ 284k', c: 'text-indigo-400', i: '↑ 8%' },
                      { l: 'Conversão', v: '34%', c: 'text-purple-400', i: '↑ 5%' },
                      { l: 'Mensagens', v: '156', c: 'text-amber-400', i: '↑ 23%' },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.15 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4"
                      >
                        <p className="text-xs text-slate-500">{s.l}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.c}`}>{s.v}</p>
                        <p className="text-xs text-emerald-400 mt-1">{s.i}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-indigo-600/20 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm text-indigo-400 font-semibold uppercase tracking-wider">Recursos</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 tracking-tight">Tudo que você precisa</h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Uma plataforma completa para gerenciar leads, conversas e vendas com inteligência.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preços" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm text-indigo-400 font-semibold uppercase tracking-wider">Preços</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 tracking-tight">Planos para cada fase</h2>
            <p className="text-slate-400 mt-4">Comece grátis e escale conforme seu negócio cresce.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-2xl p-6 ${p.popular ? 'bg-gradient-to-b from-indigo-500/10 to-purple-500/5 border-2 border-indigo-500/40 shadow-xl shadow-indigo-500/10' : 'bg-white/[0.03] border border-white/[0.06]'}`}
              >
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full font-semibold">Mais Popular</span>}
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{p.desc}</p>
                <div className="mt-4 mb-6"><span className="text-4xl font-extrabold">R${p.price}</span><span className="text-slate-500">/mês</span></div>
                <ul className="space-y-2.5 mb-8">
                  {p.features.map((f, j) => <li key={j} className="flex items-center gap-2 text-sm text-slate-300"><span className="text-emerald-400">✓</span>{f}</li>)}
                </ul>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate('register')}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm ${p.popular ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25' : 'bg-white/5 border border-white/10 hover:bg-white/10'} transition-colors`}
                >Começar Agora</motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="sobre" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm text-indigo-400 font-semibold uppercase tracking-wider">Depoimentos</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 tracking-tight">Quem usa, recomenda</h2>
          </motion.div>
          <div className="relative h-48">
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((t, i) => i === activeTestimonial && (
                <motion.div key={i} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                  className="absolute inset-0 flex flex-col items-center text-center"
                >
                  <p className="text-lg md:text-xl text-slate-300 italic max-w-2xl leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">{t.avatar}</div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'w-6 bg-indigo-500' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiLz48L3N2Zz4=')] opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Pronto para transformar suas vendas?</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">Comece seu teste gratuito de 14 dias. Sem cartão de crédito. Sem compromisso.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('register')}
              className="px-10 py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/25 transition-shadow"
            >Começar Agora — É Grátis</motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer id="contato" className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">N</div>
              <span className="font-bold">NexusCRM</span>
            </div>
            <p className="text-sm text-slate-500">O CRM inteligente para equipes modernas.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Produto</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => scrollTo('recursos')} className="hover:text-white transition-colors">Recursos</button></li>
              <li><button onClick={() => scrollTo('preços')} className="hover:text-white transition-colors">Preços</button></li>
              <li><button className="hover:text-white transition-colors">Integrações</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Empresa</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button className="hover:text-white transition-colors">Sobre nós</button></li>
              <li><button className="hover:text-white transition-colors">Blog</button></li>
              <li><button className="hover:text-white transition-colors">Carreiras</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Suporte</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button className="hover:text-white transition-colors">Central de Ajuda</button></li>
              <li><button className="hover:text-white transition-colors">Documentação</button></li>
              <li><button className="hover:text-white transition-colors">contato@nexuscrm.com</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-xs text-slate-600">
          © 2024 NexusCRM. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
