import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, DollarSign, TrendingUp, Target, ArrowUpRight, ArrowDownRight,
  MessageSquare, Clock, Zap, ChevronRight
} from 'lucide-react';
import { analyticsData, leads, conversations } from '@/data/mockData';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#f59e0b', '#f97316', '#22c55e'];

const stats = [
  { label: 'Total de Leads', value: '183', change: '+12.5%', up: true, icon: Users, gradient: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20' },
  { label: 'Receita Mensal', value: 'R$ 160k', change: '+23.1%', up: true, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
  { label: 'Taxa de Conversão', value: '18%', change: '+2.3%', up: true, icon: TrendingUp, gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
  { label: 'Negócios Ativos', value: '47', change: '-3.2%', up: false, icon: Target, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function DashboardPage() {
  const recentLeads = leads.slice(0, 5);
  const recentConvos = conversations.slice(0, 4);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral das suas métricas e performance</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item} whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg transition-all cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{stat.value}</p>
              </div>
              <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.up ? <ArrowUpRight className="h-4 w-4 text-emerald-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />}
              <span className={`text-sm font-semibold ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>{stat.change}</span>
              <span className="text-xs text-slate-400 ml-1">vs mês anterior</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Receita Mensal</h3>
              <p className="text-sm text-slate-500">Últimos 7 meses</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />Receita</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Leads</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analyticsData.monthlyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)' }}
                formatter={(value: unknown, name: unknown) => [String(name) === 'revenue' ? `R$ ${(Number(value) / 1000).toFixed(0)}k` : String(value), String(name) === 'revenue' ? 'Receita' : 'Leads']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Funil de Vendas</h3>
          <p className="text-sm text-slate-500 mb-4">Conversão por etapa</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={analyticsData.conversionByStage} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {analyticsData.conversionByStage.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12 }} formatter={(value: unknown) => [`${value}%`, 'Conversão']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {analyticsData.conversionByStage.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-600">{s.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Performance por Canal</h3>
          <p className="text-sm text-slate-500 mb-4">Leads e conversões</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analyticsData.channelPerformance} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Bar dataKey="leads" fill="#6366f1" radius={[6, 6, 0, 0]} name="Leads" />
              <Bar dataKey="conversions" fill="#22c55e" radius={[6, 6, 0, 0]} name="Conversões" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Tempo de Resposta</h3>
          <p className="text-sm text-slate-500 mb-4">Média em minutos por horário</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analyticsData.responseTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="min" />
              <Tooltip contentStyle={{ borderRadius: 12 }} formatter={(value: unknown) => [`${value} min`, 'Tempo médio']} />
              <Line type="monotone" dataKey="avg" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Leads Recentes</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">Ver todos <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            {recentLeads.map((lead, i) => (
              <motion.div key={lead.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.05 }}
                className="flex items-center justify-between py-2.5 border-b border-slate-100/80 last:border-0 hover:bg-slate-50/50 -mx-2 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.source} · {lead.responsible}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                    lead.status === 'ganho' ? 'bg-emerald-50 text-emerald-700' :
                    lead.status === 'perdido' ? 'bg-red-50 text-red-700' :
                    lead.status === 'proposta' ? 'bg-amber-50 text-amber-700' :
                    'bg-indigo-50 text-indigo-700'
                  }`}>{lead.stage}</span>
                  <p className="text-xs text-slate-500 mt-1 font-medium">R$ {lead.value.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Conversas Recentes</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">Ver todas <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            {recentConvos.map((convo) => {
              const channelColors: Record<string, string> = {
                whatsapp: 'bg-emerald-50 text-emerald-700', email: 'bg-blue-50 text-blue-700',
                instagram: 'bg-pink-50 text-pink-700', telegram: 'bg-sky-50 text-sky-700', facebook: 'bg-indigo-50 text-indigo-700',
              };
              return (
                <div key={convo.id} className="flex items-center justify-between py-2.5 border-b border-slate-100/80 last:border-0 hover:bg-slate-50/50 -mx-2 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{convo.leadName}</p>
                      <p className="text-xs text-slate-500 truncate">{convo.lastMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${channelColors[convo.channel]}`}>{convo.channel}</span>
                    {convo.unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">{convo.unread}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100/80">
            {[
              { icon: MessageSquare, value: '248', label: 'Mensagens hoje' },
              { icon: Clock, value: '4.2m', label: 'Tempo resposta' },
              { icon: Zap, value: '95%', label: 'Satisfação' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="h-3.5 w-3.5 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
