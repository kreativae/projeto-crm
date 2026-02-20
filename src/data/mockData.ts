export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  domain?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'vendedor' | 'suporte';
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface Lead {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: 'PF' | 'PJ';
  document?: string;
  stage: string;
  status: 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido';
  source: string;
  responsible: string;
  tags: string[];
  value: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  tenantId: string;
  leadId: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  senderName: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  leadName: string;
  leadAvatar?: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email';
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

export interface Automation {
  id: string;
  tenantId: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'inactive';
  executionCount: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  type: 'reuniao' | 'ligacao' | 'followup' | 'demo' | 'outro';
  leadId?: string;
  leadName?: string;
  responsible: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  leads: Lead[];
}

export const currentTenant: Tenant = {
  id: 't1',
  name: 'NexusCRM',
  primaryColor: '#6366f1',
  plan: 'enterprise',
  domain: 'app.nexuscrm.com',
  createdAt: '2024-01-01',
};

export const currentUser: User = {
  id: 'u1',
  tenantId: 't1',
  name: 'Carlos Silva',
  email: 'carlos@nexuscrm.com',
  role: 'admin',
  status: 'active',
  createdAt: '2024-01-01',
  lastLogin: '2025-01-15T10:30:00',
};

export const users: User[] = [
  currentUser,
  { id: 'u2', tenantId: 't1', name: 'Ana Souza', email: 'ana@nexuscrm.com', role: 'gestor', status: 'active', createdAt: '2024-02-15', lastLogin: '2025-01-14T08:00:00' },
  { id: 'u3', tenantId: 't1', name: 'Pedro Lima', email: 'pedro@nexuscrm.com', role: 'vendedor', status: 'active', createdAt: '2024-03-10', lastLogin: '2025-01-15T09:00:00' },
  { id: 'u4', tenantId: 't1', name: 'Maria Santos', email: 'maria@nexuscrm.com', role: 'vendedor', status: 'active', createdAt: '2024-04-05', lastLogin: '2025-01-13T14:00:00' },
  { id: 'u5', tenantId: 't1', name: 'João Costa', email: 'joao@nexuscrm.com', role: 'suporte', status: 'active', createdAt: '2024-05-20', lastLogin: '2025-01-15T07:30:00' },
  { id: 'u6', tenantId: 't1', name: 'Fernanda Oliveira', email: 'fernanda@nexuscrm.com', role: 'vendedor', status: 'inactive', createdAt: '2024-06-01', lastLogin: '2024-12-20T16:00:00' },
  { id: 'u7', tenantId: 't1', name: 'Lucas Mendes', email: 'lucas@nexuscrm.com', role: 'gestor', status: 'active', createdAt: '2024-07-15', lastLogin: '2025-01-14T11:00:00' },
  { id: 'u8', tenantId: 't1', name: 'Beatriz Alves', email: 'beatriz@nexuscrm.com', role: 'suporte', status: 'inactive', createdAt: '2024-08-10' },
];

export const leads: Lead[] = [
  { id: 'l1', tenantId: 't1', name: 'TechVision Ltda', email: 'contato@techvision.com', phone: '(11) 99999-0001', company: 'TechVision', type: 'PJ', document: '12.345.678/0001-90', stage: 'Qualificação', status: 'qualificado', source: 'Google Ads', responsible: 'Pedro Lima', tags: ['tech', 'enterprise'], value: 45000, notes: 'Interessado no plano enterprise', createdAt: '2025-01-10', updatedAt: '2025-01-15' },
  { id: 'l2', tenantId: 't1', name: 'Roberto Ferreira', email: 'roberto@email.com', phone: '(21) 98888-0002', type: 'PF', stage: 'Primeiro Contato', status: 'contatado', source: 'Indicação', responsible: 'Maria Santos', tags: ['indicacao'], value: 12000, notes: 'Veio por indicação do cliente X', createdAt: '2025-01-12', updatedAt: '2025-01-14' },
  { id: 'l3', tenantId: 't1', name: 'Digital Labs S.A.', email: 'vendas@digitallabs.com', phone: '(11) 97777-0003', company: 'Digital Labs', type: 'PJ', document: '98.765.432/0001-10', stage: 'Proposta', status: 'proposta', source: 'LinkedIn', responsible: 'Pedro Lima', tags: ['saas', 'priority'], value: 78000, notes: 'Proposta enviada, aguardando retorno', createdAt: '2025-01-05', updatedAt: '2025-01-13' },
  { id: 'l4', tenantId: 't1', name: 'Marina Costa', email: 'marina@costa.com', phone: '(31) 96666-0004', type: 'PF', stage: 'Negociação', status: 'negociacao', source: 'Website', responsible: 'Ana Souza', tags: ['hot-lead'], value: 25000, notes: 'Em fase final de negociação', createdAt: '2024-12-28', updatedAt: '2025-01-15' },
  { id: 'l5', tenantId: 't1', name: 'Grupo Nexus Corp', email: 'contato@nexuscorp.com', phone: '(11) 95555-0005', company: 'Nexus Corp', type: 'PJ', document: '11.222.333/0001-44', stage: 'Novo', status: 'novo', source: 'Facebook Ads', responsible: 'Maria Santos', tags: ['corporate'], value: 120000, notes: 'Lead novo, precisa qualificar', createdAt: '2025-01-15', updatedAt: '2025-01-15' },
  { id: 'l6', tenantId: 't1', name: 'Sofia Almeida', email: 'sofia@almeida.com', phone: '(41) 94444-0006', type: 'PF', stage: 'Qualificação', status: 'qualificado', source: 'Instagram', responsible: 'Pedro Lima', tags: ['social'], value: 8000, notes: 'Interessada em plano básico', createdAt: '2025-01-08', updatedAt: '2025-01-12' },
  { id: 'l7', tenantId: 't1', name: 'InnovateTech ME', email: 'hello@innovatetech.com', phone: '(11) 93333-0007', company: 'InnovateTech', type: 'PJ', stage: 'Ganho', status: 'ganho', source: 'Google Ads', responsible: 'Ana Souza', tags: ['startup', 'won'], value: 35000, notes: 'Contrato assinado!', createdAt: '2024-12-15', updatedAt: '2025-01-10' },
  { id: 'l8', tenantId: 't1', name: 'Paulo Ribeiro', email: 'paulo@ribeiro.net', phone: '(51) 92222-0008', type: 'PF', stage: 'Perdido', status: 'perdido', source: 'Indicação', responsible: 'Maria Santos', tags: ['lost'], value: 15000, notes: 'Optou pelo concorrente', createdAt: '2024-12-20', updatedAt: '2025-01-05' },
  { id: 'l9', tenantId: 't1', name: 'CloudServ Solutions', email: 'sales@cloudserv.io', phone: '(11) 91111-0009', company: 'CloudServ', type: 'PJ', stage: 'Primeiro Contato', status: 'contatado', source: 'Website', responsible: 'Pedro Lima', tags: ['cloud', 'tech'], value: 55000, notes: 'Agendada demo para próxima semana', createdAt: '2025-01-13', updatedAt: '2025-01-15' },
  { id: 'l10', tenantId: 't1', name: 'Camila Nunes', email: 'camila@nunes.com', phone: '(61) 90000-0010', type: 'PF', stage: 'Proposta', status: 'proposta', source: 'Telegram', responsible: 'Ana Souza', tags: ['vip'], value: 30000, notes: 'Proposta personalizada enviada', createdAt: '2025-01-07', updatedAt: '2025-01-14' },
];

export const pipelineStages: PipelineStage[] = [
  { id: 's1', name: 'Novo', color: '#6366f1', leads: leads.filter(l => l.stage === 'Novo') },
  { id: 's2', name: 'Primeiro Contato', color: '#8b5cf6', leads: leads.filter(l => l.stage === 'Primeiro Contato') },
  { id: 's3', name: 'Qualificação', color: '#a855f7', leads: leads.filter(l => l.stage === 'Qualificação') },
  { id: 's4', name: 'Proposta', color: '#f59e0b', leads: leads.filter(l => l.stage === 'Proposta') },
  { id: 's5', name: 'Negociação', color: '#f97316', leads: leads.filter(l => l.stage === 'Negociação') },
  { id: 's6', name: 'Ganho', color: '#22c55e', leads: leads.filter(l => l.stage === 'Ganho') },
  { id: 's7', name: 'Perdido', color: '#ef4444', leads: leads.filter(l => l.stage === 'Perdido') },
];

export const conversations: Conversation[] = [
  {
    id: 'c1', leadId: 'l1', leadName: 'TechVision Ltda', channel: 'whatsapp', lastMessage: 'Perfeito! Vamos agendar a demonstração então.', lastMessageTime: '10:32', unread: 2,
    messages: [
      { id: 'm1', tenantId: 't1', leadId: 'l1', channel: 'whatsapp', direction: 'inbound', content: 'Olá! Vi o anúncio de vocês e gostaria de saber mais sobre o CRM.', timestamp: '2025-01-15T10:15:00', status: 'read', senderName: 'TechVision' },
      { id: 'm2', tenantId: 't1', leadId: 'l1', channel: 'whatsapp', direction: 'outbound', content: 'Olá! Fico feliz pelo interesse. Nosso CRM oferece gestão completa de clientes, pipeline de vendas, automações e muito mais. Posso agendar uma demo?', timestamp: '2025-01-15T10:20:00', status: 'read', senderName: 'Pedro Lima' },
      { id: 'm3', tenantId: 't1', leadId: 'l1', channel: 'whatsapp', direction: 'inbound', content: 'Sim, temos interesse! Somos uma empresa de tecnologia com 50 funcionários.', timestamp: '2025-01-15T10:28:00', status: 'read', senderName: 'TechVision' },
      { id: 'm4', tenantId: 't1', leadId: 'l1', channel: 'whatsapp', direction: 'inbound', content: 'Perfeito! Vamos agendar a demonstração então.', timestamp: '2025-01-15T10:32:00', status: 'delivered', senderName: 'TechVision' },
    ]
  },
  {
    id: 'c2', leadId: 'l2', leadName: 'Roberto Ferreira', channel: 'email', lastMessage: 'Segue em anexo nossa proposta comercial...', lastMessageTime: '09:15', unread: 0,
    messages: [
      { id: 'm5', tenantId: 't1', leadId: 'l2', channel: 'email', direction: 'inbound', content: 'Prezados, gostaria de receber uma proposta para o plano Professional.', timestamp: '2025-01-14T14:00:00', status: 'read', senderName: 'Roberto Ferreira' },
      { id: 'm6', tenantId: 't1', leadId: 'l2', channel: 'email', direction: 'outbound', content: 'Segue em anexo nossa proposta comercial personalizada para sua necessidade.', timestamp: '2025-01-15T09:15:00', status: 'sent', senderName: 'Maria Santos' },
    ]
  },
  {
    id: 'c3', leadId: 'l3', leadName: 'Digital Labs S.A.', channel: 'instagram', lastMessage: 'Adoramos o visual do dashboard! 😍', lastMessageTime: 'Ontem', unread: 1,
    messages: [
      { id: 'm7', tenantId: 't1', leadId: 'l3', channel: 'instagram', direction: 'inbound', content: 'Oi! Vi o post de vocês sobre o novo dashboard. Muito legal!', timestamp: '2025-01-14T16:00:00', status: 'read', senderName: 'Digital Labs' },
      { id: 'm8', tenantId: 't1', leadId: 'l3', channel: 'instagram', direction: 'outbound', content: 'Obrigado! Quer conhecer todas as funcionalidades?', timestamp: '2025-01-14T16:15:00', status: 'read', senderName: 'Pedro Lima' },
      { id: 'm9', tenantId: 't1', leadId: 'l3', channel: 'instagram', direction: 'inbound', content: 'Adoramos o visual do dashboard! 😍', timestamp: '2025-01-14T17:00:00', status: 'delivered', senderName: 'Digital Labs' },
    ]
  },
  {
    id: 'c4', leadId: 'l4', leadName: 'Marina Costa', channel: 'telegram', lastMessage: 'Podemos fechar por esse valor sim!', lastMessageTime: 'Ontem', unread: 0,
    messages: [
      { id: 'm10', tenantId: 't1', leadId: 'l4', channel: 'telegram', direction: 'outbound', content: 'Marina, consegui um desconto especial de 15% no plano anual.', timestamp: '2025-01-14T11:00:00', status: 'read', senderName: 'Ana Souza' },
      { id: 'm11', tenantId: 't1', leadId: 'l4', channel: 'telegram', direction: 'inbound', content: 'Podemos fechar por esse valor sim!', timestamp: '2025-01-14T11:30:00', status: 'read', senderName: 'Marina Costa' },
    ]
  },
  {
    id: 'c5', leadId: 'l9', leadName: 'CloudServ Solutions', channel: 'facebook', lastMessage: 'Vamos agendar para terça-feira?', lastMessageTime: '08:45', unread: 3,
    messages: [
      { id: 'm12', tenantId: 't1', leadId: 'l9', channel: 'facebook', direction: 'inbound', content: 'Olá, temos interesse em migrar nosso CRM atual. Vocês fazem migração?', timestamp: '2025-01-15T08:30:00', status: 'read', senderName: 'CloudServ' },
      { id: 'm13', tenantId: 't1', leadId: 'l9', channel: 'facebook', direction: 'outbound', content: 'Sim! Fazemos a migração completa dos dados. Podemos agendar uma call?', timestamp: '2025-01-15T08:40:00', status: 'delivered', senderName: 'Pedro Lima' },
      { id: 'm14', tenantId: 't1', leadId: 'l9', channel: 'facebook', direction: 'inbound', content: 'Vamos agendar para terça-feira?', timestamp: '2025-01-15T08:45:00', status: 'delivered', senderName: 'CloudServ' },
    ]
  },
];

export const automations: Automation[] = [
  { id: 'a1', tenantId: 't1', name: 'Boas-vindas WhatsApp', trigger: 'Novo lead via WhatsApp', actions: ['Enviar mensagem de boas-vindas', 'Atribuir ao vendedor disponível', 'Criar tarefa de follow-up'], status: 'active', executionCount: 234, createdAt: '2024-06-01' },
  { id: 'a2', tenantId: 't1', name: 'Follow-up 48h', trigger: 'Lead sem resposta há 48h', actions: ['Enviar lembrete por email', 'Notificar responsável'], status: 'active', executionCount: 156, createdAt: '2024-07-15' },
  { id: 'a3', tenantId: 't1', name: 'Distribuição Round Robin', trigger: 'Novo lead cadastrado', actions: ['Distribuir para próximo vendedor', 'Enviar notificação'], status: 'active', executionCount: 89, createdAt: '2024-08-20' },
  { id: 'a4', tenantId: 't1', name: 'Lead Qualificado → Proposta', trigger: 'Lead movido para Qualificado', actions: ['Gerar template de proposta', 'Agendar call de apresentação', 'Notificar gestor'], status: 'active', executionCount: 67, createdAt: '2024-09-10' },
  { id: 'a5', tenantId: 't1', name: 'Aniversário do Cliente', trigger: 'Data de aniversário', actions: ['Enviar email personalizado', 'Enviar WhatsApp'], status: 'inactive', executionCount: 12, createdAt: '2024-10-05' },
  { id: 'a6', tenantId: 't1', name: 'Lead Perdido → Reengajamento', trigger: 'Lead marcado como perdido há 30 dias', actions: ['Enviar email de reengajamento', 'Criar nova oportunidade'], status: 'inactive', executionCount: 8, createdAt: '2024-11-01' },
];

export const calendarEvents: CalendarEvent[] = [
  { id: 'e1', tenantId: 't1', title: 'Demo TechVision', description: 'Apresentação do CRM para equipe técnica', date: '2025-01-20', time: '10:00', duration: 60, type: 'demo', leadId: 'l1', leadName: 'TechVision Ltda', responsible: 'Pedro Lima' },
  { id: 'e2', tenantId: 't1', title: 'Follow-up Roberto', description: 'Ligar para acompanhar proposta', date: '2025-01-17', time: '14:00', duration: 30, type: 'followup', leadId: 'l2', leadName: 'Roberto Ferreira', responsible: 'Maria Santos' },
  { id: 'e3', tenantId: 't1', title: 'Reunião Digital Labs', description: 'Negociação final do contrato', date: '2025-01-21', time: '15:00', duration: 45, type: 'reuniao', leadId: 'l3', leadName: 'Digital Labs S.A.', responsible: 'Pedro Lima' },
  { id: 'e4', tenantId: 't1', title: 'Call Marina Costa', description: 'Fechamento de contrato', date: '2025-01-16', time: '11:00', duration: 30, type: 'ligacao', leadId: 'l4', leadName: 'Marina Costa', responsible: 'Ana Souza' },
  { id: 'e5', tenantId: 't1', title: 'Reunião de Equipe', description: 'Review semanal de vendas', date: '2025-01-17', time: '09:00', duration: 60, type: 'reuniao', responsible: 'Carlos Silva' },
  { id: 'e6', tenantId: 't1', title: 'Demo CloudServ', description: 'Demonstração do módulo de migração', date: '2025-01-22', time: '10:00', duration: 60, type: 'demo', leadId: 'l9', leadName: 'CloudServ Solutions', responsible: 'Pedro Lima' },
];

export const analyticsData = {
  conversionByStage: [
    { name: 'Novo', value: 100, fill: '#6366f1' },
    { name: '1º Contato', value: 78, fill: '#8b5cf6' },
    { name: 'Qualificação', value: 55, fill: '#a855f7' },
    { name: 'Proposta', value: 38, fill: '#f59e0b' },
    { name: 'Negociação', value: 25, fill: '#f97316' },
    { name: 'Ganho', value: 18, fill: '#22c55e' },
  ],
  channelPerformance: [
    { name: 'Google Ads', leads: 45, conversions: 12, revenue: 180000 },
    { name: 'Facebook', leads: 38, conversions: 8, revenue: 95000 },
    { name: 'Instagram', leads: 32, conversions: 6, revenue: 72000 },
    { name: 'LinkedIn', leads: 22, conversions: 9, revenue: 210000 },
    { name: 'Indicação', leads: 18, conversions: 10, revenue: 150000 },
    { name: 'Website', leads: 28, conversions: 7, revenue: 85000 },
  ],
  monthlyRevenue: [
    { month: 'Jul', revenue: 85000, leads: 32 },
    { month: 'Ago', revenue: 92000, leads: 38 },
    { month: 'Set', revenue: 78000, leads: 28 },
    { month: 'Out', revenue: 115000, leads: 45 },
    { month: 'Nov', revenue: 130000, leads: 52 },
    { month: 'Dez', revenue: 145000, leads: 48 },
    { month: 'Jan', revenue: 160000, leads: 55 },
  ],
  responseTime: [
    { hour: '08h', avg: 5 },
    { hour: '09h', avg: 3 },
    { hour: '10h', avg: 8 },
    { hour: '11h', avg: 4 },
    { hour: '12h', avg: 12 },
    { hour: '13h', avg: 15 },
    { hour: '14h', avg: 6 },
    { hour: '15h', avg: 4 },
    { hour: '16h', avg: 7 },
    { hour: '17h', avg: 9 },
    { hour: '18h', avg: 11 },
  ],
};
