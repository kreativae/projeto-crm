import { Router } from 'express';
import Lead from '../../bancodedados/models/Lead.js';
import { Conversation, Message } from '../../bancodedados/models/Message.js';
import CalendarEvent from '../../bancodedados/models/CalendarEvent.js';
import Automation from '../../bancodedados/models/Automation.js';
import AIConversation from '../../bancodedados/models/AIConversation.js';
import User from '../../bancodedados/models/User.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/rbac.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(authenticate, tenantIsolation);

// ==============================
// AI Engine — Analisa dados reais do CRM
// ==============================
async function gatherCRMData(tenantId) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalLeads, newLeadsMonth, leadsByStatus, leadsBySource,
    hotLeads, totalValue, wonDeals, lostDeals,
    conversations, unreadConversations,
    upcomingEvents, todayEvents,
    automations, users
  ] = await Promise.all([
    Lead.countDocuments({ tenantId }),
    Lead.countDocuments({ tenantId, createdAt: { $gte: thirtyDaysAgo } }),
    Lead.aggregate([{ $match: { tenantId: tenantId } }, { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$value' } } }]),
    Lead.aggregate([{ $match: { tenantId: tenantId } }, { $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Lead.find({ tenantId, temperature: 'hot' }).select('name value status stage responsibleName').limit(10),
    Lead.aggregate([{ $match: { tenantId: tenantId } }, { $group: { _id: null, total: { $sum: '$value' } } }]),
    Lead.countDocuments({ tenantId, status: 'ganho' }),
    Lead.countDocuments({ tenantId, status: 'perdido' }),
    Conversation.find({ tenantId }).sort({ lastMessageAt: -1 }).limit(10).select('externalContactName channel status unreadCount lastMessage lastMessageAt'),
    Conversation.countDocuments({ tenantId, unreadCount: { $gt: 0 } }),
    CalendarEvent.find({ tenantId, startDate: { $gte: today, $lte: nextWeek }, status: 'scheduled' }).sort({ startDate: 1 }).select('title type startDate endDate leadName'),
    CalendarEvent.countDocuments({ tenantId, startDate: { $gte: today, $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000) }, status: 'scheduled' }),
    Automation.find({ tenantId }).select('name status stats.executionCount stats.successCount'),
    User.countDocuments({ tenantId, status: 'active' }),
  ]);

  return {
    leads: { total: totalLeads, newMonth: newLeadsMonth, byStatus: leadsByStatus, bySource: leadsBySource, hot: hotLeads, totalValue: totalValue[0]?.total || 0, won: wonDeals, lost: lostDeals },
    conversations: { recent: conversations, unread: unreadConversations },
    calendar: { upcoming: upcomingEvents, today: todayEvents },
    automations: automations,
    users: users,
  };
}

function generateResponse(prompt, data) {
  const q = prompt.toLowerCase();
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const pct = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) : '0';

  // ---- PIPELINE / FUNIL ----
  if (q.includes('pipeline') || q.includes('funil') || q.includes('etapa')) {
    const stages = data.leads.byStatus;
    const lines = stages.map(s => `• **${s._id || 'Sem status'}**: ${s.count} leads (${fmt(s.totalValue)})`).join('\n');
    const convRate = pct(data.leads.won, data.leads.total);
    return {
      content: `## 📊 Resumo do Pipeline\n\nSeu funil de vendas tem **${data.leads.total} leads** com valor total de **${fmt(data.leads.totalValue)}**.\n\n### Distribuição por Etapa:\n${lines}\n\n### Métricas de Conversão:\n• **Taxa de conversão geral:** ${convRate}%\n• **Deals ganhos:** ${data.leads.won}\n• **Deals perdidos:** ${data.leads.lost}\n• **Win rate:** ${pct(data.leads.won, data.leads.won + data.leads.lost)}%\n\n### 💡 Insight:\n${data.leads.won > data.leads.lost ? 'Sua taxa de conversão está positiva! Continue investindo nos canais que mais convertem.' : 'Atenção: você está perdendo mais deals do que ganhando. Recomendo revisar o processo de qualificação e as objeções mais comuns.'}`,
      type: 'summary',
      metadata: { module: 'pipeline', dataPoints: data.leads.total, sources: ['leads'] }
    };
  }

  // ---- LEADS / CLIENTES ----
  if (q.includes('lead') || q.includes('cliente') || q.includes('prospect')) {
    const sources = data.leads.bySource.slice(0, 5).map(s => `• **${(s._id || 'Outro').replace(/_/g, ' ')}**: ${s.count} leads`).join('\n');
    const hotList = data.leads.hot.length > 0 
      ? data.leads.hot.map(h => `• **${h.name}** — ${fmt(h.value)} (${h.stage}) → ${h.responsibleName || 'Sem responsável'}`).join('\n')
      : '• Nenhum lead quente no momento.';
    return {
      content: `## 👥 Resumo de Leads & Clientes\n\n### Números Gerais:\n• **Total de leads:** ${data.leads.total}\n• **Novos este mês:** ${data.leads.newMonth}\n• **Valor total do pipeline:** ${fmt(data.leads.totalValue)}\n• **Usuários ativos na equipe:** ${data.users}\n\n### Top Origens:\n${sources}\n\n### 🔥 Leads Quentes (prioridade):\n${hotList}\n\n### 💡 Recomendação:\n${data.leads.newMonth > 10 ? 'Boa entrada de leads! Garanta que todos sejam contatados em até 24h para maximizar a conversão.' : 'A geração de leads está baixa. Considere investir mais em campanhas de Google Ads e conteúdo nas redes sociais.'}`,
      type: 'summary',
      metadata: { module: 'leads', dataPoints: data.leads.total, sources: ['leads'] }
    };
  }

  // ---- AGENDA / REUNIÕES ----
  if (q.includes('agenda') || q.includes('reunião') || q.includes('reuniao') || q.includes('evento') || q.includes('calendario') || q.includes('calendário') || q.includes('compromisso')) {
    const eventsList = data.calendar.upcoming.length > 0
      ? data.calendar.upcoming.map(e => {
          const d = new Date(e.startDate);
          const dia = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
          const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          return `• **${e.title}** — ${dia} às ${hora}${e.leadName ? ` (${e.leadName})` : ''}`;
        }).join('\n')
      : '• Nenhum evento programado para os próximos 7 dias.';
    return {
      content: `## 📅 Resumo da Agenda\n\n### Hoje:\n• **${data.calendar.today} evento(s)** agendado(s) para hoje.\n\n### Próximos 7 dias:\n${eventsList}\n\n### 💡 Dica:\n${data.calendar.today === 0 ? 'Sua agenda está livre hoje. É um bom momento para prospectar novos leads ou fazer follow-ups pendentes.' : `Você tem ${data.calendar.today} compromisso(s) hoje. Prepare-se revisando os dados dos leads envolvidos antes de cada reunião.`}`,
      type: 'summary',
      metadata: { module: 'calendar', dataPoints: data.calendar.upcoming.length, sources: ['calendar_events'] }
    };
  }

  // ---- CONVERSAS / MENSAGENS ----
  if (q.includes('conversa') || q.includes('mensagem') || q.includes('mensagens') || q.includes('whatsapp') || q.includes('chat') || q.includes('omnichannel')) {
    const unread = data.conversations.unread;
    const recent = data.conversations.recent.slice(0, 5).map(c => {
      const ch = c.channel === 'whatsapp' ? '💬' : c.channel === 'email' ? '📧' : c.channel === 'instagram' ? '📸' : c.channel === 'telegram' ? '✈️' : '💙';
      return `• ${ch} **${c.externalContactName || 'Desconhecido'}** (${c.channel}) — "${(c.lastMessage?.content || '').slice(0, 60)}..."${c.unreadCount > 0 ? ` ⚠️ ${c.unreadCount} não lida(s)` : ''}`;
    }).join('\n');
    return {
      content: `## 💬 Central de Conversas\n\n### Status Geral:\n• **${unread} conversa(s)** com mensagens não lidas\n• **${data.conversations.recent.length}** conversas recentes\n\n### Últimas Conversas:\n${recent || '• Nenhuma conversa recente.'}\n\n### 💡 Ação Recomendada:\n${unread > 3 ? `⚠️ Você tem **${unread} conversas não lidas**! Responda o mais rápido possível — o tempo de resposta impacta diretamente na taxa de conversão.` : unread > 0 ? `Você tem ${unread} mensagem(s) pendente(s). Mantenha o tempo de resposta abaixo de 5 minutos para maximizar conversões.` : '✅ Todas as conversas estão respondidas! Excelente trabalho da equipe.'}`,
      type: 'summary',
      metadata: { module: 'conversations', dataPoints: data.conversations.recent.length, sources: ['conversations', 'messages'] }
    };
  }

  // ---- AUTOMAÇÕES ----
  if (q.includes('automa') || q.includes('fluxo') || q.includes('bot')) {
    const active = data.automations.filter(a => a.status === 'active');
    const totalExec = data.automations.reduce((s, a) => s + (a.stats?.executionCount || 0), 0);
    const autoList = data.automations.map(a => `• **${a.name}** — ${a.status === 'active' ? '🟢 Ativa' : '⚪ Inativa'} (${a.stats?.executionCount || 0} execuções)`).join('\n');
    return {
      content: `## ⚡ Resumo de Automações\n\n### Status:\n• **${active.length}** automações ativas de **${data.automations.length}** total\n• **${totalExec}** execuções realizadas\n\n### Lista:\n${autoList}\n\n### 💡 Sugestão:\n${active.length < 3 ? 'Você tem poucas automações ativas. Recomendo criar pelo menos: (1) Boas-vindas automática, (2) Follow-up para leads sem resposta em 48h, (3) Distribuição automática de leads.' : 'Suas automações estão funcionando bem! Considere criar uma automação de reengajamento para leads perdidos há mais de 30 dias.'}`,
      type: 'summary',
      metadata: { module: 'automations', dataPoints: data.automations.length, sources: ['automations'] }
    };
  }

  // ---- RESUMO GERAL / DASHBOARD ----
  if (q.includes('resumo') || q.includes('geral') || q.includes('dashboard') || q.includes('overview') || q.includes('visão') || q.includes('status')) {
    const convRate = pct(data.leads.won, data.leads.total);
    return {
      content: `## 🏠 Visão Geral do CRM\n\n### 📊 Pipeline:\n• **${data.leads.total}** leads totais | **${data.leads.newMonth}** novos este mês\n• Valor total: **${fmt(data.leads.totalValue)}**\n• Taxa de conversão: **${convRate}%** (${data.leads.won} ganhos / ${data.leads.lost} perdidos)\n\n### 🔥 Leads Quentes: ${data.leads.hot.length}\n${data.leads.hot.slice(0, 3).map(h => `• ${h.name} — ${fmt(h.value)}`).join('\n') || '• Nenhum lead quente'}\n\n### 💬 Conversas:\n• **${data.conversations.unread}** mensagens não lidas\n• **${data.conversations.recent.length}** conversas ativas\n\n### 📅 Agenda de Hoje:\n• **${data.calendar.today}** evento(s) programado(s)\n• **${data.calendar.upcoming.length}** eventos na próxima semana\n\n### ⚡ Automações:\n• **${data.automations.filter(a => a.status === 'active').length}** ativas\n• **${data.automations.reduce((s, a) => s + (a.stats?.executionCount || 0), 0)}** execuções totais\n\n### 💡 Prioridades do Dia:\n1. ${data.conversations.unread > 0 ? `Responder ${data.conversations.unread} conversas pendentes` : 'Todas as conversas estão respondidas ✅'}\n2. ${data.leads.hot.length > 0 ? `Dar atenção aos ${data.leads.hot.length} leads quentes` : 'Prospectar novos leads'}\n3. ${data.calendar.today > 0 ? `Preparar-se para ${data.calendar.today} reunião(ões)` : 'Agendar calls com leads qualificados'}`,
      type: 'summary',
      metadata: { module: 'dashboard', dataPoints: data.leads.total + data.conversations.recent.length + data.calendar.upcoming.length, sources: ['leads', 'conversations', 'calendar_events', 'automations'] }
    };
  }

  // ---- DESEMPENHO / PERFORMANCE ----
  if (q.includes('desempenho') || q.includes('performance') || q.includes('métrica') || q.includes('metrica') || q.includes('resultado')) {
    const winRate = pct(data.leads.won, data.leads.won + data.leads.lost);
    const avgDeal = data.leads.won > 0 ? data.leads.totalValue / data.leads.total : 0;
    return {
      content: `## 📈 Análise de Desempenho\n\n### KPIs Principais:\n• **Win Rate:** ${winRate}%\n• **Ticket Médio:** ${fmt(avgDeal)}\n• **Leads/mês:** ${data.leads.newMonth}\n• **Valor no pipeline:** ${fmt(data.leads.totalValue)}\n\n### Eficiência da Equipe:\n• **${data.users}** usuários ativos\n• **${data.leads.total}** leads gerenciados\n• **${data.automations.reduce((s, a) => s + (a.stats?.executionCount || 0), 0)}** ações automatizadas\n\n### Canais Mais Eficientes:\n${data.leads.bySource.slice(0, 4).map((s, i) => `${i + 1}. **${(s._id || 'Outro').replace(/_/g, ' ')}** — ${s.count} leads`).join('\n')}\n\n### 💡 Análise:\n${parseFloat(winRate) > 30 ? '🎉 Excelente! Seu win rate está acima da média do mercado (20-30%). Mantenha a estratégia atual.' : parseFloat(winRate) > 15 ? '📊 Win rate dentro da média. Para melhorar, foque em qualificação mais rigorosa antes de enviar propostas.' : '⚠️ Win rate abaixo do ideal. Recomendo revisar: (1) critérios de qualificação, (2) proposta de valor, (3) tempo de resposta.'}`,
      type: 'summary',
      metadata: { module: 'analytics', dataPoints: data.leads.total, sources: ['leads', 'automations'] }
    };
  }

  // ---- FALLBACK INTELIGENTE ----
  return {
    content: `## 🤖 Como posso ajudar?\n\nEntendi sua pergunta: *"${prompt}"*\n\nAqui estão as análises que posso fazer com seus dados:\n\n• 📊 **"Resumo do pipeline"** — Visão do funil de vendas\n• 👥 **"Resumo de leads"** — Status dos seus leads e clientes\n• 📅 **"Resumo da agenda"** — Compromissos e reuniões\n• 💬 **"Resumo das conversas"** — Status das mensagens\n• ⚡ **"Resumo das automações"** — Fluxos automáticos\n• 📈 **"Desempenho geral"** — KPIs e métricas\n• 🏠 **"Visão geral"** — Dashboard completo\n\nBasta me perguntar sobre qualquer um desses temas!`,
    type: 'text',
    metadata: { module: 'help', dataPoints: 0, sources: [] }
  };
}

// ============================================================
// POST /api/ai/chat — Enviar mensagem para a IA
// ============================================================
router.post('/chat', asyncHandler(async (req, res) => {
  const { message, conversationId } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Mensagem é obrigatória.' });

  const startTime = Date.now();

  // Buscar dados reais do CRM
  const crmData = await gatherCRMData(req.tenantId);

  // Gerar resposta baseada nos dados
  const aiResponse = generateResponse(message, crmData);
  const processingTime = Date.now() - startTime;
  aiResponse.metadata.processingTime = processingTime;

  // Salvar no histórico
  let conversation;
  if (conversationId) {
    conversation = await AIConversation.findOne({ _id: conversationId, tenantId: req.tenantId, userId: req.userId });
  }

  if (!conversation) {
    conversation = await AIConversation.create({
      tenantId: req.tenantId,
      userId: req.userId,
      title: message.slice(0, 60),
      messages: [],
    });
  }

  conversation.messages.push({ role: 'user', content: message, type: 'text' });
  conversation.messages.push({ role: 'assistant', content: aiResponse.content, type: aiResponse.type, metadata: aiResponse.metadata });
  conversation.lastMessageAt = new Date();
  conversation.tokensUsed += message.length + aiResponse.content.length;
  await conversation.save();

  res.json({
    success: true,
    data: {
      conversationId: conversation._id,
      response: {
        content: aiResponse.content,
        type: aiResponse.type,
        metadata: aiResponse.metadata,
      },
    },
  });
}));

// ============================================================
// GET /api/ai/conversations — Listar conversas com a IA
// ============================================================
router.get('/conversations', asyncHandler(async (req, res) => {
  const conversations = await AIConversation.find({ tenantId: req.tenantId, userId: req.userId })
    .select('title lastMessageAt messages tokensUsed')
    .sort({ lastMessageAt: -1 })
    .limit(30);

  res.json({ success: true, data: { conversations } });
}));

// ============================================================
// GET /api/ai/conversations/:id — Detalhes de uma conversa
// ============================================================
router.get('/conversations/:id', asyncHandler(async (req, res) => {
  const conversation = await AIConversation.findOne({ _id: req.params.id, tenantId: req.tenantId, userId: req.userId });
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversa não encontrada.' });
  res.json({ success: true, data: { conversation } });
}));

// ============================================================
// DELETE /api/ai/conversations/:id — Excluir conversa
// ============================================================
router.delete('/conversations/:id', asyncHandler(async (req, res) => {
  await AIConversation.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId, userId: req.userId });
  res.json({ success: true, message: 'Conversa excluída.' });
}));

// ============================================================
// GET /api/ai/insights — Gerar insights automáticos
// ============================================================
router.get('/insights', asyncHandler(async (req, res) => {
  const crmData = await gatherCRMData(req.tenantId);
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const insights = [];

  if (crmData.conversations.unread > 0) {
    insights.push({ type: 'warning', icon: '💬', title: `${crmData.conversations.unread} conversas não lidas`, desc: 'Responda rapidamente para não perder oportunidades.', priority: 'high' });
  }
  if (crmData.leads.hot.length > 0) {
    insights.push({ type: 'opportunity', icon: '🔥', title: `${crmData.leads.hot.length} leads quentes`, desc: `Valor combinado: ${fmt(crmData.leads.hot.reduce((s, h) => s + (h.value || 0), 0))}`, priority: 'high' });
  }
  if (crmData.calendar.today > 0) {
    insights.push({ type: 'info', icon: '📅', title: `${crmData.calendar.today} evento(s) hoje`, desc: 'Prepare-se revisando os dados dos leads.', priority: 'medium' });
  }
  if (crmData.leads.lost > crmData.leads.won) {
    insights.push({ type: 'alert', icon: '⚠️', title: 'Win rate abaixo do ideal', desc: 'Mais deals perdidos do que ganhos. Revise o processo de vendas.', priority: 'high' });
  }
  if (crmData.leads.newMonth > 20) {
    insights.push({ type: 'success', icon: '🚀', title: 'Boa geração de leads!', desc: `${crmData.leads.newMonth} novos leads este mês.`, priority: 'low' });
  }

  const activeAuto = crmData.automations.filter(a => a.status === 'active').length;
  if (activeAuto < 3) {
    insights.push({ type: 'suggestion', icon: '⚡', title: 'Poucas automações ativas', desc: `Apenas ${activeAuto} ativas. Automatize mais para ganhar eficiência.`, priority: 'medium' });
  }

  res.json({ success: true, data: { insights } });
}));

export default router;
