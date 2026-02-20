// ============================================================
// NexusCRM - Seed do Banco de Dados
// ============================================================
// Execução: node bancodedados/seeds/seed.js
// Cria dados iniciais para desenvolvimento/teste
// ============================================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../connection.js';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import { Conversation, Message } from '../models/Message.js';
import Automation from '../models/Automation.js';
import CalendarEvent from '../models/CalendarEvent.js';
import Session from '../models/Session.js';

const seed = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    await connectDB();

    // Limpar todas as collections
    console.log('🗑️  Limpando dados existentes...');
    await Promise.all([
      Tenant.deleteMany({}),
      User.deleteMany({}),
      Lead.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Automation.deleteMany({}),
      CalendarEvent.deleteMany({}),
      Session.deleteMany({}),
    ]);

    // ============================================================
    // 1. Criar Tenant (Empresa)
    // ============================================================
    console.log('🏢 Criando tenant...');
    const tenant = await Tenant.create({
      name: 'NexusCRM Demo',
      slug: 'nexuscrm-demo',
      email: 'contato@nexuscrm.com',
      phone: '(11) 99999-0000',
      plan: 'enterprise',
      status: 'active',
      branding: {
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        companyName: 'NexusCRM',
      },
      settings: {
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        currency: 'BRL',
      },
      integrations: {
        whatsapp: { enabled: true },
        googleCalendar: { enabled: true },
        facebook: { enabled: true },
        smtp: { enabled: true },
      },
    });

    // ============================================================
    // 2. Criar Usuários
    // ============================================================
    console.log('👥 Criando usuários...');
    const usersData = [
      { name: 'Carlos Silva', email: 'carlos@nexuscrm.com', role: 'admin', status: 'active' },
      { name: 'Ana Souza', email: 'ana@nexuscrm.com', role: 'gestor', status: 'active' },
      { name: 'Pedro Lima', email: 'pedro@nexuscrm.com', role: 'vendedor', status: 'active' },
      { name: 'Maria Santos', email: 'maria@nexuscrm.com', role: 'vendedor', status: 'active' },
      { name: 'João Costa', email: 'joao@nexuscrm.com', role: 'suporte', status: 'active' },
      { name: 'Fernanda Oliveira', email: 'fernanda@nexuscrm.com', role: 'vendedor', status: 'inactive' },
      { name: 'Lucas Mendes', email: 'lucas@nexuscrm.com', role: 'gestor', status: 'active' },
      { name: 'Beatriz Alves', email: 'beatriz@nexuscrm.com', role: 'suporte', status: 'inactive' },
    ];

    const hashedPassword = await bcrypt.hash('admin123', 12);

    const users = await User.insertMany(
      usersData.map(u => ({
        ...u,
        tenantId: tenant._id,
        password: hashedPassword,
        emailVerified: true,
        lastLogin: u.status === 'active' ? new Date() : undefined,
      }))
    );

    // Atualizar tenant
    tenant.ownerId = users[0]._id;
    tenant.usage.usersCount = users.length;
    await tenant.save();

    console.log(`   ✅ ${users.length} usuários criados`);

    // ============================================================
    // 3. Criar Leads
    // ============================================================
    console.log('🎯 Criando leads...');
    const leadsData = [
      { name: 'TechVision Ltda', email: 'contato@techvision.com', phone: '(11) 99999-0001', type: 'PJ', company: { name: 'TechVision' }, stage: 'Qualificação', status: 'qualificado', source: 'google_ads', responsible: users[2], tags: ['tech', 'enterprise'], value: 45000 },
      { name: 'Roberto Ferreira', email: 'roberto@email.com', phone: '(21) 98888-0002', type: 'PF', stage: 'Primeiro Contato', status: 'contatado', source: 'indicacao', responsible: users[3], tags: ['indicacao'], value: 12000 },
      { name: 'Digital Labs S.A.', email: 'vendas@digitallabs.com', phone: '(11) 97777-0003', type: 'PJ', company: { name: 'Digital Labs' }, stage: 'Proposta', status: 'proposta', source: 'linkedin', responsible: users[2], tags: ['saas', 'priority'], value: 78000 },
      { name: 'Marina Costa', email: 'marina@costa.com', phone: '(31) 96666-0004', type: 'PF', stage: 'Negociação', status: 'negociacao', source: 'website', responsible: users[1], tags: ['hot-lead'], value: 25000 },
      { name: 'Grupo Nexus Corp', email: 'contato@nexuscorp.com', phone: '(11) 95555-0005', type: 'PJ', company: { name: 'Nexus Corp' }, stage: 'Novo', status: 'novo', source: 'facebook_ads', responsible: users[3], tags: ['corporate'], value: 120000 },
      { name: 'Sofia Almeida', email: 'sofia@almeida.com', phone: '(41) 94444-0006', type: 'PF', stage: 'Qualificação', status: 'qualificado', source: 'instagram', responsible: users[2], tags: ['social'], value: 8000 },
      { name: 'InnovateTech ME', email: 'hello@innovatetech.com', phone: '(11) 93333-0007', type: 'PJ', company: { name: 'InnovateTech' }, stage: 'Ganho', status: 'ganho', source: 'google_ads', responsible: users[1], tags: ['startup', 'won'], value: 35000 },
      { name: 'Paulo Ribeiro', email: 'paulo@ribeiro.net', phone: '(51) 92222-0008', type: 'PF', stage: 'Perdido', status: 'perdido', source: 'indicacao', responsible: users[3], tags: ['lost'], value: 15000, lostReason: 'Optou pelo concorrente' },
      { name: 'CloudServ Solutions', email: 'sales@cloudserv.io', phone: '(11) 91111-0009', type: 'PJ', company: { name: 'CloudServ' }, stage: 'Primeiro Contato', status: 'contatado', source: 'website', responsible: users[2], tags: ['cloud', 'tech'], value: 55000 },
      { name: 'Camila Nunes', email: 'camila@nunes.com', phone: '(61) 90000-0010', type: 'PF', stage: 'Proposta', status: 'proposta', source: 'telegram', responsible: users[1], tags: ['vip'], value: 30000 },
    ];

    const leads = await Lead.insertMany(
      leadsData.map(l => ({
        tenantId: tenant._id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        type: l.type,
        company: l.company,
        stage: l.stage,
        status: l.status,
        source: l.source,
        responsibleId: l.responsible._id,
        responsibleName: l.responsible.name,
        tags: l.tags,
        value: l.value,
        lostReason: l.lostReason,
        interactions: [{
          type: 'system',
          content: 'Lead criado via seed',
          userId: l.responsible._id,
          userName: l.responsible.name,
        }],
      }))
    );

    tenant.usage.leadsCount = leads.length;
    await tenant.save();

    console.log(`   ✅ ${leads.length} leads criados`);

    // ============================================================
    // 4. Criar Conversas e Mensagens
    // ============================================================
    console.log('💬 Criando conversas...');
    const conversationsData = [
      {
        leadIdx: 0, channel: 'whatsapp', messages: [
          { dir: 'inbound', text: 'Olá! Vi o anúncio de vocês e gostaria de saber mais sobre o CRM.', sender: 'TechVision' },
          { dir: 'outbound', text: 'Olá! Fico feliz pelo interesse. Nosso CRM oferece gestão completa de clientes. Posso agendar uma demo?', sender: 'Pedro Lima', userId: users[2]._id },
          { dir: 'inbound', text: 'Sim, temos interesse! Somos uma empresa com 50 funcionários.', sender: 'TechVision' },
          { dir: 'inbound', text: 'Perfeito! Vamos agendar a demonstração então.', sender: 'TechVision' },
        ],
      },
      {
        leadIdx: 1, channel: 'email', messages: [
          { dir: 'inbound', text: 'Prezados, gostaria de receber uma proposta para o plano Professional.', sender: 'Roberto Ferreira' },
          { dir: 'outbound', text: 'Segue em anexo nossa proposta comercial personalizada.', sender: 'Maria Santos', userId: users[3]._id },
        ],
      },
      {
        leadIdx: 2, channel: 'instagram', messages: [
          { dir: 'inbound', text: 'Oi! Vi o post de vocês sobre o novo dashboard. Muito legal!', sender: 'Digital Labs' },
          { dir: 'outbound', text: 'Obrigado! Quer conhecer todas as funcionalidades?', sender: 'Pedro Lima', userId: users[2]._id },
          { dir: 'inbound', text: 'Adoramos o visual do dashboard! 😍', sender: 'Digital Labs' },
        ],
      },
      {
        leadIdx: 3, channel: 'telegram', messages: [
          { dir: 'outbound', text: 'Marina, consegui um desconto especial de 15% no plano anual.', sender: 'Ana Souza', userId: users[1]._id },
          { dir: 'inbound', text: 'Podemos fechar por esse valor sim!', sender: 'Marina Costa' },
        ],
      },
      {
        leadIdx: 8, channel: 'facebook', messages: [
          { dir: 'inbound', text: 'Olá, temos interesse em migrar nosso CRM. Vocês fazem migração?', sender: 'CloudServ' },
          { dir: 'outbound', text: 'Sim! Fazemos a migração completa. Podemos agendar uma call?', sender: 'Pedro Lima', userId: users[2]._id },
          { dir: 'inbound', text: 'Vamos agendar para terça-feira?', sender: 'CloudServ' },
        ],
      },
    ];

    for (const convData of conversationsData) {
      const lead = leads[convData.leadIdx];
      const conversation = await Conversation.create({
        tenantId: tenant._id,
        leadId: lead._id,
        channel: convData.channel,
        status: 'open',
        externalContactName: lead.name,
        firstMessageAt: new Date(),
        lastMessageAt: new Date(),
      });

      let unread = 0;
      for (const msg of convData.messages) {
        const message = await Message.create({
          tenantId: tenant._id,
          conversationId: conversation._id,
          leadId: lead._id,
          channel: convData.channel,
          direction: msg.dir,
          type: 'text',
          content: { text: msg.text },
          senderName: msg.sender,
          senderId: msg.userId,
          status: msg.dir === 'outbound' ? 'sent' : 'delivered',
        });

        if (msg.dir === 'inbound') unread++;

        conversation.lastMessage = {
          content: msg.text,
          direction: msg.dir,
          timestamp: message.createdAt,
          senderName: msg.sender,
        };
      }

      conversation.unreadCount = unread;
      conversation.lastMessageAt = new Date();
      await conversation.save();
    }

    console.log(`   ✅ ${conversationsData.length} conversas criadas`);

    // ============================================================
    // 5. Criar Automações
    // ============================================================
    console.log('⚡ Criando automações...');
    const automationsData = [
      { name: 'Boas-vindas WhatsApp', trigger: { type: 'message_received', conditions: { channel: 'whatsapp' } }, actions: [{ type: 'send_whatsapp', config: { message: 'Olá! Bem-vindo(a)!' }, order: 0 }, { type: 'assign_lead', config: { assignTo: 'round_robin' }, order: 1 }], status: 'active', stats: { executionCount: 234, successCount: 230 } },
      { name: 'Follow-up 48h', trigger: { type: 'inactivity', conditions: { inactivityDays: 2 } }, actions: [{ type: 'send_email', config: { message: 'Olá, notamos que não tivemos retorno...' }, order: 0 }, { type: 'notify_user', config: {}, order: 1 }], status: 'active', stats: { executionCount: 156, successCount: 150 } },
      { name: 'Distribuição Round Robin', trigger: { type: 'lead_created' }, actions: [{ type: 'assign_lead', config: { assignTo: 'round_robin' }, order: 0 }], status: 'active', stats: { executionCount: 89, successCount: 89 } },
      { name: 'Lead Qualificado → Proposta', trigger: { type: 'lead_stage_changed', conditions: { stage: 'Qualificação' } }, actions: [{ type: 'create_task', config: { message: 'Gerar proposta' }, order: 0 }, { type: 'create_event', config: { message: 'Call de apresentação' }, order: 1 }, { type: 'notify_user', config: {}, order: 2 }], status: 'active', stats: { executionCount: 67, successCount: 65 } },
      { name: 'Aniversário do Cliente', trigger: { type: 'date_based', conditions: { dateField: 'birthday' } }, actions: [{ type: 'send_email', config: { message: 'Feliz aniversário!' }, order: 0 }, { type: 'send_whatsapp', config: { message: 'Parabéns! 🎂' }, order: 1 }], status: 'inactive', stats: { executionCount: 12, successCount: 12 } },
      { name: 'Reengajamento Lead Perdido', trigger: { type: 'date_based', conditions: { daysAfter: 30 } }, actions: [{ type: 'send_email', config: { message: 'Sentimos sua falta...' }, order: 0 }], status: 'inactive', stats: { executionCount: 8, successCount: 6 } },
    ];

    await Automation.insertMany(
      automationsData.map(a => ({
        ...a,
        tenantId: tenant._id,
        createdBy: users[0]._id,
      }))
    );

    console.log(`   ✅ ${automationsData.length} automações criadas`);

    // ============================================================
    // 6. Criar Eventos de Agenda
    // ============================================================
    console.log('📅 Criando eventos de agenda...');
    const now = new Date();
    const eventsData = [
      { title: 'Demo TechVision', description: 'Apresentação do CRM', type: 'demo', days: 5, time: 10, duration: 60, leadIdx: 0, organizer: users[2] },
      { title: 'Follow-up Roberto', description: 'Acompanhar proposta', type: 'followup', days: 2, time: 14, duration: 30, leadIdx: 1, organizer: users[3] },
      { title: 'Reunião Digital Labs', description: 'Negociação final', type: 'reuniao', days: 6, time: 15, duration: 45, leadIdx: 2, organizer: users[2] },
      { title: 'Call Marina Costa', description: 'Fechamento de contrato', type: 'ligacao', days: 1, time: 11, duration: 30, leadIdx: 3, organizer: users[1] },
      { title: 'Reunião de Equipe', description: 'Review semanal', type: 'reuniao', days: 2, time: 9, duration: 60, leadIdx: null, organizer: users[0] },
      { title: 'Demo CloudServ', description: 'Módulo de migração', type: 'demo', days: 7, time: 10, duration: 60, leadIdx: 8, organizer: users[2] },
    ];

    await CalendarEvent.insertMany(
      eventsData.map(e => {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() + e.days);
        startDate.setHours(e.time, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + e.duration);

        return {
          tenantId: tenant._id,
          title: e.title,
          description: e.description,
          type: e.type,
          startDate,
          endDate,
          leadId: e.leadIdx !== null ? leads[e.leadIdx]._id : undefined,
          leadName: e.leadIdx !== null ? leads[e.leadIdx].name : undefined,
          organizer: { userId: e.organizer._id, name: e.organizer.name, email: e.organizer.email },
          createdBy: e.organizer._id,
          reminders: [{ type: 'push', minutesBefore: 15 }],
        };
      })
    );

    console.log(`   ✅ ${eventsData.length} eventos criados`);

    // ============================================================
    // Resumo
    // ============================================================
    console.log(`
╔══════════════════════════════════════════════╗
║        🌱 SEED CONCLUÍDO COM SUCESSO!        ║
╠══════════════════════════════════════════════╣
║  🏢 Tenant: NexusCRM Demo                    ║
║  👥 Usuários: ${String(users.length).padEnd(31)}║
║  🎯 Leads: ${String(leads.length).padEnd(34)}║
║  💬 Conversas: ${String(conversationsData.length).padEnd(30)}║
║  ⚡ Automações: ${String(automationsData.length).padEnd(29)}║
║  📅 Eventos: ${String(eventsData.length).padEnd(32)}║
╠══════════════════════════════════════════════╣
║  🔐 Login: carlos@nexuscrm.com              ║
║  🔑 Senha: admin123                         ║
╚══════════════════════════════════════════════╝
    `);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
};

seed();
