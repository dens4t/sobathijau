import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

const CSS_PARTICLES = [
  { id: 1, x: '15%', top: '25%', size: 22, delay: '0s', duration: '5s' },
  { id: 2, x: '55%', top: '35%', size: 14, delay: '0.6s', duration: '6.5s' },
  { id: 3, x: '75%', top: '55%', size: 28, delay: '1.2s', duration: '5.8s' },
  { id: 4, x: '35%', top: '65%', size: 16, delay: '0.3s', duration: '7s' },
  { id: 5, x: '85%', top: '20%', size: 20, delay: '1.8s', duration: '6s' },
  { id: 6, x: '8%', top: '70%', size: 18, delay: '2.2s', duration: '5.5s' },
  { id: 7, x: '65%', top: '80%', size: 12, delay: '0.9s', duration: '7.2s' },
  { id: 8, x: '45%', top: '15%', size: 24, delay: '1.5s', duration: '6.2s' },
];

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Username atau password salah. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081C15] via-[#0D2E21] to-[#081C15] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pure CSS floating particles — no JS-Driven animation, no re-render jank */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.06; }
          50% { transform: translateY(-28px) scale(1.05); opacity: 0.13; }
        }
        @keyframes float-particle-slow {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.04; }
          50% { transform: translateY(-20px) scale(1.08); opacity: 0.1; }
        }
        .p-particle {
          position: absolute;
          border-radius: 9999px;
          background: #34D399;
          pointer-events: none;
          will-change: transform, opacity;
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {CSS_PARTICLES.map(p => (
          <div
            key={p.id}
            className="p-particle"
            style={{
              left: p.x,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: 0.06,
              animation: p.id % 2 === 0 ? `float-particle ${p.duration} ease-in-out ${p.delay} infinite` : `float-particle-slow ${p.duration} ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Sobat<span className="text-emerald-400">Hijau</span></h1>
          <p className="text-[11px] text-emerald-300/60 font-mono mt-1 tracking-wider">PANEL ADMINISTRATOR DLH</p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-gradient-to-b from-white/8 to-white/4 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8"
        >
          <div className="mb-6">
            <h2 className="text-sm font-bold text-white/90">Masuk ke Panel</h2>
            <p className="text-[11px] text-white/40 mt-1">Gunakan kredensial administrator yang valid.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  autoFocus
                  className="w-full px-3.5 py-2.5 pl-9 text-xs rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
                <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pl-9 pr-9 text-xs rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
                <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-300 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block"
                  />
                  Memverifikasi...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk ke Panel Admin
                </span>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/15 font-mono mt-6">
          DINAS LINGKUNGAN HIDUP KOTA PONTIANAK
        </p>
      </motion.div>
    </div>
  );
};
