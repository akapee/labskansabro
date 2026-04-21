import React, { useState } from 'react';
import { Box, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message === 'Invalid login credentials' ? 'Kredensial login tidak cocok.' : error.message);
      setLoading(false);
    } else {
      setLoading(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>
      
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary to-blue-400 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Box className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Masuk untuk mengelola inventaris laboratorium Anda.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl flex text-center justify-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                  placeholder="admin@sekolah.id"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 px-4 rounded-2xl font-semibold hover:bg-primary focus:ring-4 focus:ring-primary/20 transition-all shadow-lg disabled:opacity-70 mt-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
        <div className="bg-slate-50/80 px-8 py-5 text-center text-sm font-medium text-slate-500 border-t border-slate-100">
          Sistem Autentikasi Internal Sekolah
        </div>
      </div>
    </div>
  );
}
