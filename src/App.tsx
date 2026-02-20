import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { PipelinePage } from '@/pages/Pipeline';
import { LeadsPage } from '@/pages/Leads';
import { ConversationsPage } from '@/pages/Conversations';
import { AutomationsPage } from '@/pages/OtherPages';
import { UsersPage } from '@/pages/UsersPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AIPage } from '@/pages/AIPage';
import LandingPage from '@/pages/LandingPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import NotFoundPage from '@/pages/NotFoundPage';
import HelpWidget from '@/components/HelpWidget';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Onboarding } from '@/components/Onboarding';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
      {children}
    </motion.div>
  );
}

// Public pages wrapper — handles Landing, Login, Register, Forgot Password
function PublicRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const hash = location.pathname;
    if (hash.includes('register')) return 'register';
    if (hash.includes('forgot')) return 'forgot';
    if (hash.includes('login')) return 'login';
    return 'landing';
  });

  // If user is logged in, go to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleNavigate = (page: string) => {
    if (page === 'login') { setCurrentPage('login'); navigate('/login'); }
    else if (page === 'register') { setCurrentPage('register'); navigate('/register'); }
    else if (page === 'forgot') { setCurrentPage('forgot'); navigate('/forgot-password'); }
    else if (page === 'landing') { setCurrentPage('landing'); navigate('/'); }
    else if (page === 'dashboard') { navigate('/dashboard'); }
    else { setCurrentPage(page); }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <LoginPage onForgot={() => handleNavigate('forgot')} onRegister={() => handleNavigate('register')} />}
        {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentPage === 'forgot' && <ForgotPasswordPage onNavigate={handleNavigate} />}
      </motion.div>
    </AnimatePresence>
  );
}

function AppRoutes() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PublicRoutes />} />
        <Route path="/login" element={<PublicRoutes />} />
        <Route path="/register" element={<PublicRoutes />} />
        <Route path="/forgot-password" element={<PublicRoutes />} />

        {/* Protected routes */}
        {user ? (
          <>
            <Route path="/dashboard" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><DashboardPage /></AnimatedPage></Layout>} />
            <Route path="/pipeline" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><PipelinePage /></AnimatedPage></Layout>} />
            <Route path="/leads" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><LeadsPage /></AnimatedPage></Layout>} />
            <Route path="/conversations" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><ConversationsPage /></AnimatedPage></Layout>} />
            <Route path="/calendar" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><CalendarPage /></AnimatedPage></Layout>} />
            <Route path="/automations" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><AutomationsPage /></AnimatedPage></Layout>} />
            <Route path="/users" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><UsersPage /></AnimatedPage></Layout>} />
            <Route path="/settings" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><SettingsPage /></AnimatedPage></Layout>} />
            <Route path="/profile" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><ProfilePage /></AnimatedPage></Layout>} />
            <Route path="/ai" element={<Layout onLogout={logout} userName={user.name} userRole={user.role}><AnimatedPage><AIPage /></AnimatedPage></Layout>} />
          </>
        ) : null}

        {/* 404 */}
        <Route path="*" element={
          user ? <Navigate to="/dashboard" replace /> : <NotFoundPage onNavigate={(p) => { window.location.hash = p === 'dashboard' ? '/dashboard' : '/'; }} />
        } />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <AppRoutes />
          <HelpWidget />
          <Onboarding />
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
