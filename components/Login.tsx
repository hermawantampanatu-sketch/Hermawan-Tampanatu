
import React, { useState } from 'react';
import { Package, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const MOCK_USERS: Record<string, UserProfile> = {
  'P88390': { id: 'P88390', name: 'Petugas Input', role: 'INPUTTER' },
  'P82334': { id: 'P82334', name: 'Maker & Approval', role: 'MAKER_APPROVER' },
  'P81955': { id: 'P81955', name: 'Checker / Admin', role: 'CHECKER' },
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulasi proses autentikasi
    setTimeout(() => {
      const user = MOCK_USERS[userId];
      // Password default: 123456
      if (user && password === '123456') {
        setIsLoading(false);
        onLogin(user);
      } else {
        setIsLoading(false);
        setError('ID Pengguna atau Kata Sandi salah.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
              <Package className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">LogiSmart AI</h1>
            <p className="text-slate-400 text-sm">Sistem Manajemen Inventaris Pintar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">ID Pengguna</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Masukkan ID Pengguna"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Masuk ke Sistem <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-slate-500 text-[10px] uppercase tracking-wider font-bold">
              © 2024 LogiSmart Global Logistics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
