import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { users as mockUsers } from '@/data/mockData';
import {
  Search, Edit2, Trash2, X, UserPlus, Eye, Key,
  ChevronDown, ChevronRight, Crown, Users, Briefcase, Headphones,
  Check, ToggleLeft, ToggleRight, Mail, GitBranch
} from 'lucide-react';
import { cn } from '@/utils/cn';
import SlideOver from '@/components/ui/SlideOver';

interface AppUser {
  id: string; name: string; email: string; phone?: string;
  role: 'admin' | 'gestor' | 'vendedor' | 'suporte';
  status: 'active' | 'inactive';
  reportsTo?: string; // id of supervisor
  level: number;
  createdAt?: string;
  lastLogin?: string;
}

const ROLE_CONFIG = {
  admin:    { label: 'Administrador', icon: Crown,      color: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', level: 0, permissions: ['Acesso total', 'Gestão de equipe', 'Configurações', 'Faturamento', 'Integrações', 'Relatórios'] },
  gestor:   { label: 'Gestor',        icon: Briefcase,  color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', level: 1, permissions: ['Gerenciar leads', 'Gerenciar equipe', 'Relatórios', 'Automações', 'Templates'] },
  vendedor: { label: 'Vendedor',      icon: Users,      color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', level: 2, permissions: ['Leads próprios', 'Enviar mensagens', 'Ver relatórios', 'Agenda'] },
  suporte:  { label: 'Suporte',       icon: Headphones, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', level: 3, permissions: ['Ver leads', 'Enviar mensagens', 'Ver templates'] },
};

type RoleKey = keyof typeof ROLE_CONFIG;

const buildUsers = (): AppUser[] => {
  const admin = mockUsers.find(u => u.role === 'admin');
  return mockUsers.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role as RoleKey,
    status: u.status as 'active' | 'inactive',
    reportsTo: u.role === 'admin' ? undefined : u.role === 'gestor' ? admin?.id : mockUsers.find(m => m.role === 'gestor' && m.status === 'active')?.id || admin?.id,
    level: ROLE_CONFIG[u.role as RoleKey]?.level ?? 2,
    createdAt: u.createdAt, lastLogin: u.lastLogin,
  }));
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>(buildUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'hierarchy'>('cards');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(users.filter(u => u.role === 'admin' || u.role === 'gestor').map(u => u.id)));
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'vendedor' as RoleKey, reportsTo: '' });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => users.filter(u => {
    const s = searchTerm.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  }), [users, searchTerm, filterRole, filterStatus]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    gestores: users.filter(u => u.role === 'gestor').length,
    vendedores: users.filter(u => u.role === 'vendedor').length,
    suporte: users.filter(u => u.role === 'suporte').length,
  }), [users]);

  const handleInvite = () => {
    if (!newUser.name || !newUser.email) return;
    setSaving(true);
    setTimeout(() => {
      const supervisor = newUser.reportsTo || users.find(u => u.role === 'admin')?.id || '';
      setUsers(prev => [...prev, {
        id: 'u-' + Date.now(), name: newUser.name, email: newUser.email,
        role: newUser.role, status: 'active', reportsTo: supervisor,
        level: ROLE_CONFIG[newUser.role].level, createdAt: new Date().toISOString(),
      }]);
      setShowModal(false);
      setNewUser({ name: '', email: '', role: 'vendedor', reportsTo: '' });
      setSaving(false);
    }, 500);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remover este usuário?')) return;
    setUsers(p => p.filter(u => u.id !== id));
    if (selectedUser?.id === id) setSelectedUser(null);
  };

  const handleToggleStatus = (id: string) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const handleChangeRole = (id: string, newRole: RoleKey) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, role: newRole, level: ROLE_CONFIG[newRole].level } : u));
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    setSaving(true);
    setTimeout(() => {
      setUsers(p => p.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      setSaving(false);
    }, 400);
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const getChildren = (parentId: string) => users.filter(u => u.reportsTo === parentId);

  // Hierarchy tree node
  const TreeNode = ({ user, depth = 0 }: { user: AppUser; depth?: number }) => {
    const children = getChildren(user.id);
    const isExpanded = expandedNodes.has(user.id);
    const config = ROLE_CONFIG[user.role];
    const RoleIcon = config.icon;

    return (
      <div className={cn('relative', depth > 0 && 'ml-8')}>
        {depth > 0 && (
          <div className="absolute -left-4 top-0 bottom-0 w-px bg-slate-200" />
        )}
        {depth > 0 && (
          <div className="absolute -left-4 top-6 w-4 h-px bg-slate-200" />
        )}
        <motion.div
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className={cn(
            'flex items-center gap-3 p-3 rounded-2xl border transition-all group cursor-pointer mb-2',
            user.status === 'active'
              ? 'bg-white/80 border-slate-200/60 hover:shadow-md hover:border-indigo-200'
              : 'bg-slate-50/50 border-slate-200/40 opacity-60'
          )}
          onClick={() => setSelectedUser(user)}
        >
          {children.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); toggleNode(user.id); }}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
              {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
            </button>
          )}
          {children.length === 0 && <div className="w-6" />}

          <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0', config.color)}>
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900 truncate">{user.name}</h4>
              <span className={cn('h-2 w-2 rounded-full flex-shrink-0', user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300')} />
            </div>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <span className={cn('px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 flex-shrink-0', config.bg, config.text, config.border)}>
            <RoleIcon className="h-3 w-3" />{config.label}
          </span>
          {children.length > 0 && (
            <span className="text-xs text-slate-400 font-medium flex-shrink-0">{children.length} membros</span>
          )}
        </motion.div>

        <AnimatePresence>
          {isExpanded && children.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {children.map(child => <TreeNode key={child.id} user={child} depth={depth + 1} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const rootUsers = users.filter(u => !u.reportsTo);
  const supervisors = users.filter(u => u.role === 'admin' || u.role === 'gestor');

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-500 text-sm mt-1">{stats.total} membros da equipe · {stats.active} ativos</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25">
          <UserPlus className="h-4 w-4" /> Convidar
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Admins', value: stats.admins, config: ROLE_CONFIG.admin },
          { label: 'Gestores', value: stats.gestores, config: ROLE_CONFIG.gestor },
          { label: 'Vendedores', value: stats.vendedores, config: ROLE_CONFIG.vendedor },
          { label: 'Suporte', value: stats.suporte, config: ROLE_CONFIG.suporte },
        ].map(s => {
          const SIcon = s.config.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 flex items-center gap-3 shadow-sm">
              <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md', s.config.color)}>
                <SIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all">
          <option value="all">Todos os Perfis</option>
          {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all">
          <option value="all">Todos Status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          <button onClick={() => setViewMode('cards')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', viewMode === 'cards' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500')}>
            Cards
          </button>
          <button onClick={() => setViewMode('hierarchy')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1', viewMode === 'hierarchy' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500')}>
            <GitBranch className="h-3 w-3" /> Hierarquia
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(user => {
            const config = ROLE_CONFIG[user.role];
            const RoleIcon = config.icon;
            const supervisor = users.find(u => u.id === user.reportsTo);
            return (
              <motion.div key={user.id} variants={item} whileHover={{ y: -3 }}
                className={cn('bg-white/80 backdrop-blur-sm rounded-2xl border p-5 hover:shadow-lg transition-all shadow-sm',
                  user.status === 'active' ? 'border-slate-200/60' : 'border-slate-200/40 opacity-70')}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-lg', config.color)}>
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={cn('h-2.5 w-2.5 rounded-full mt-1.5 ring-2 ring-white', user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300')} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1', config.bg, config.text, config.border)}>
                    <RoleIcon className="h-3 w-3" />{config.label}
                  </span>
                  <span className="text-[10px] text-slate-400">Nível {user.level}</span>
                </div>

                {supervisor && (
                  <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 bg-slate-50 rounded-xl">
                    <GitBranch className="h-3 w-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500">Reporta a:</span>
                    <span className="text-[10px] font-semibold text-slate-700">{supervisor.name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100/60">
                  <button onClick={() => handleToggleStatus(user.id)}
                    className={cn('flex items-center gap-1 text-xs font-semibold transition-colors', user.status === 'active' ? 'text-emerald-600' : 'text-slate-400')}>
                    {user.status === 'active' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                  </button>
                  <div className="flex items-center gap-0.5">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => setSelectedUser(user)}
                      className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Eye className="h-4 w-4" /></motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => setEditingUser({ ...user })}
                      className="p-2 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="h-4 w-4" /></motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleDelete(user.id)}
                      className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Hierarchy View */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <GitBranch className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">Organograma da Equipe</h3>
          </div>
          {rootUsers.map(user => <TreeNode key={user.id} user={user} />)}
        </motion.div>
      )}

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Convidar Membro</h2>
                <p className="text-sm text-slate-500 mt-0.5">Adicione um novo membro à sua equipe</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo</label>
                <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all" placeholder="Nome do colaborador" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all" placeholder="email@empresa.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Perfil (Role)</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as RoleKey })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reporta a</label>
                  <select value={newUser.reportsTo} onChange={e => setNewUser({ ...newUser, reportsTo: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <option value="">Selecionar supervisor</option>
                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name} ({ROLE_CONFIG[s.role].label})</option>)}
                  </select>
                </div>
              </div>
              {/* Role Preview */}
              <div className={cn('p-4 rounded-2xl border', ROLE_CONFIG[newUser.role].bg, ROLE_CONFIG[newUser.role].border)}>
                <div className="flex items-center gap-2 mb-2">
                  {(() => { const Icon = ROLE_CONFIG[newUser.role].icon; return <Icon className="h-4 w-4" />; })()}
                  <span className={cn('text-sm font-bold', ROLE_CONFIG[newUser.role].text)}>Permissões: {ROLE_CONFIG[newUser.role].label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_CONFIG[newUser.role].permissions.map(p => (
                    <span key={p} className="flex items-center gap-1 bg-white/60 px-2 py-0.5 rounded-lg text-[10px] font-medium text-slate-600">
                      <Check className="h-2.5 w-2.5 text-emerald-500" />{p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-medium">Cancelar</button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleInvite} disabled={saving || !newUser.name || !newUser.email}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                {saving ? 'Enviando...' : 'Enviar Convite'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Editar Usuário</h2>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome</label>
                  <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
                  <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Perfil</label>
                  <select value={editingUser.role} onChange={e => { const r = e.target.value as RoleKey; setEditingUser({ ...editingUser, role: r, level: ROLE_CONFIG[r].level }); }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reporta a</label>
                  <select value={editingUser.reportsTo || ''} onChange={e => setEditingUser({ ...editingUser, reportsTo: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <option value="">Nenhum (raiz)</option>
                    {supervisors.filter(s => s.id !== editingUser.id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={() => setEditingUser(null)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveEdit} disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detail SlideOver */}
      {selectedUser && (
        <SlideOver open={!!selectedUser} onClose={() => setSelectedUser(null)} title="Detalhes do Usuário" width="md">
          {(() => {
            const config = ROLE_CONFIG[selectedUser.role];
            const RoleIcon = config.icon;
            const supervisor = users.find(u => u.id === selectedUser.reportsTo);
            const team = getChildren(selectedUser.id);
            return (
              <div className="space-y-6">
                <div className="flex flex-col items-center py-4">
                  <div className={cn('h-20 w-20 rounded-3xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-xl', config.color)}>
                    {selectedUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedUser.name}</h2>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-1"><Mail className="h-3.5 w-3.5" />{selectedUser.email}</div>
                  <span className={cn('mt-3 px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5', config.bg, config.text, config.border)}>
                    <RoleIcon className="h-3.5 w-3.5" />{config.label} · Nível {selectedUser.level}
                  </span>
                </div>

                {supervisor && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                    <GitBranch className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Supervisor</p>
                      <p className="text-sm font-semibold text-slate-900">{supervisor.name} — {ROLE_CONFIG[supervisor.role].label}</p>
                    </div>
                  </div>
                )}

                {team.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Equipe ({team.length})</h4>
                    <div className="space-y-2">
                      {team.map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className={cn('h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold', ROLE_CONFIG[m.role].color)}>
                            {m.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{m.name}</p>
                            <p className="text-xs text-slate-500">{ROLE_CONFIG[m.role].label}</p>
                          </div>
                          <span className={cn('h-2 w-2 rounded-full', m.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300')} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Permissões</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {config.permissions.map(p => (
                      <span key={p} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-emerald-100">
                        <Check className="h-3 w-3" />{p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => { handleChangeRole(selectedUser.id, selectedUser.role === 'vendedor' ? 'gestor' : selectedUser.role === 'gestor' ? 'admin' : selectedUser.role); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors">
                    <Crown className="h-4 w-4" /> Promover
                  </button>
                  <button onClick={() => alert('Email de redefinição enviado!')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Key className="h-4 w-4" /> Resetar Senha
                  </button>
                  <button onClick={() => handleDelete(selectedUser.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" /> Remover Usuário
                  </button>
                </div>
              </div>
            );
          })()}
        </SlideOver>
      )}
    </div>
  );
}
