import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Target, MessageSquare, Calendar,
  Zap, Settings, LogOut, ChevronLeft, ChevronRight, Bell,
  Menu, Building2, UserCircle, X, Sparkles, User, Key, Bot
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { GlobalSearch } from './GlobalSearch';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  userName: string;
  userRole: string;
}

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Pipeline', icon: Target, path: '/pipeline' },
  { name: 'Leads & Clientes', icon: Users, path: '/leads' },
  { name: 'Conversas', icon: MessageSquare, path: '/conversations', badge: 6 },
  { name: 'Agenda', icon: Calendar, path: '/calendar' },
  { name: 'Automações', icon: Zap, path: '/automations' },
  { name: 'Usuários', icon: UserCircle, path: '/users' },
  { name: 'NexusIA', icon: Bot, path: '/ai', badge: undefined },
  { name: 'Configurações', icon: Settings, path: '/settings' },
];

interface Notification {
  id: string; title: string; desc: string; time: string; icon: string; color: string; read: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  { id: '1', title: 'Novo lead cadastrado', desc: 'TechVision Ltda via Google Ads', time: '2 min atrás', icon: '🎯', color: 'bg-indigo-500', read: false },
  { id: '2', title: 'Mensagem recebida', desc: 'CloudServ: "Vamos agendar?"', time: '15 min atrás', icon: '💬', color: 'bg-emerald-500', read: false },
  { id: '3', title: 'Deal ganho!', desc: 'InnovateTech — R$ 35.000', time: '1h atrás', icon: '🎉', color: 'bg-amber-500', read: false },
  { id: '4', title: 'Automação executada', desc: 'Follow-up 48h — 3 leads', time: '2h atrás', icon: '⚡', color: 'bg-purple-500', read: true },
  { id: '5', title: 'Reunião em 30min', desc: 'Demo CloudServ Solutions', time: '3h atrás', icon: '📅', color: 'bg-blue-500', read: true },
];

export function Layout({ children, onLogout, userName, userRole }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFS);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roleLabels: Record<string, string> = {
    admin: 'Administrador', gestor: 'Gestor', vendedor: 'Vendedor', suporte: 'Suporte',
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col glass-dark transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-16 px-4 border-b border-white/5', collapsed ? 'justify-center' : 'gap-3')}>
          <motion.div
            whileHover={{ rotate: 6, scale: 1.05 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 shadow-lg shadow-indigo-500/25"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">NexusCRM</h1>
              <p className="text-slate-400 text-[10px] leading-tight font-medium">Gestão Inteligente</p>
            </motion.div>
          )}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.name}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={cn(
                  'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? item.name : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="flex-1 text-left">{item.name}</span>}
                </span>
                {!collapsed && item.badge && (
                  <span className="relative z-10 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5 shadow-lg shadow-red-500/30">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Collapse */}
        <div className="hidden lg:block px-3 py-2 border-t border-white/5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors text-sm"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Recolher</span></>}
          </button>
        </div>

        {/* User */}
        <div className={cn('px-3 py-3 border-t border-white/5', collapsed && 'px-2')}>
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-indigo-500/20"
            >
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </motion.div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{userName}</p>
                <p className="text-slate-400 text-xs truncate">{roleLabels[userRole] || userRole}</p>
              </div>
            )}
            {!collapsed && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onLogout}
                className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 glass border-b border-slate-200/50 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-600 p-1"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 rounded-xl transition-colors">
                <Bell className="h-5 w-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">{unreadNotifs}</span>
                )}
              </motion.button>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200/60 shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Notificações</h3>
                      <button onClick={() => { setNotifications(p => p.map(n => ({ ...n, read: true }))); }} className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Marcar todas</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={cn('px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer', !n.read && 'bg-indigo-50/30')}>
                          <div className="flex items-start gap-3">
                            <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 text-xs', n.color)}>
                              {n.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-900 font-medium">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                            </div>
                            {!n.read && <span className="h-2 w-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                      <button className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Ver todas as notificações</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100/80 rounded-xl transition-colors">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{userName.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{roleLabels[userRole] || userRole}</p>
                </div>
              </motion.button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-slate-200/60 shadow-xl z-50 overflow-hidden py-2">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-bold text-slate-900">{userName}</p>
                      <p className="text-xs text-slate-500">{roleLabels[userRole] || userRole}</p>
                    </div>
                    <button onClick={() => { navigate('/profile'); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <User className="h-4 w-4 text-slate-400" /> Meu Perfil
                    </button>
                    <button onClick={() => { navigate('/settings'); setShowProfile(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <Key className="h-4 w-4 text-slate-400" /> Configurações
                    </button>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="h-4 w-4" /> Sair
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/50">
              <Building2 className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">Enterprise</span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
