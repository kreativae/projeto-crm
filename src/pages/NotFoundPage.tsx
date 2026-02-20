import { motion } from 'framer-motion';

export default function NotFoundPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10">
        <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 12 }}
          className="text-[120px] md:text-[180px] font-extrabold leading-none bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        >404</motion.div>
        <h2 className="text-2xl font-bold mt-4 mb-2">Página não encontrada</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">A página que você procura não existe ou foi movida. Verifique o endereço ou volte ao início.</p>
        <div className="flex gap-3 justify-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold shadow-lg shadow-indigo-500/25"
          >Voltar ao Dashboard</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('landing')}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >Página Inicial</motion.button>
        </div>
      </motion.div>
    </div>
  );
}
