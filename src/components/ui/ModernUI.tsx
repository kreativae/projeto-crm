import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==============================
// 1. GlassCard
// ==============================
interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard = ({ children, className, hoverEffect = false, ...props }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.15)" } : {}}
      className={cn(
        "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ==============================
// 2. AnimatedButton
// ==============================
interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const AnimatedButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading,
  ...props 
}: ButtonProps) => {
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border border-transparent",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/5",
    outline: "bg-transparent border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "font-medium rounded-xl transition-all flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        isLoading && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};

// ==============================
// 3. StatusBadge
// ==============================
const statusColors: Record<string, string> = {
  novo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ganho: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  perdido: "bg-red-500/10 text-red-400 border-red-500/20",
  ativo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  inativo: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  pendente: "bg-amber-500/10 text-amber-400 border-amber-500/20"
};

export const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = statusColors[status.toLowerCase()] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  
  return (
    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border uppercase tracking-wide", colorClass)}>
      {status}
    </span>
  );
};

// ==============================
// 4. InputField
// ==============================
export const InputField = ({ label, error, className, ...props }: any) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>}
    <input
      className={cn(
        "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all",
        error && "border-red-500/50 focus:ring-red-500/20"
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);
