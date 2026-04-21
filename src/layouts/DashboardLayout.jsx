import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Box, LogOut, LayoutDashboard, PackageSearch, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Items Data', path: '/dashboard/items', icon: PackageSearch },
  ];

  // Identifikasi role dan label-nya
  const getRoleInfo = (r) => {
    switch (r) {
      case 'admin': return { space: 'Administrator', label: 'Admin Utama', initial: 'AD' };
      case 'waka_sarpras': return { space: 'Waka Sarpras', label: 'Monitor Global', initial: 'WS' };
      case 'toolman_tkj': return { space: 'Lab. TKJ', label: 'Petugas Lab TKJ', initial: 'TKJ' };
      case 'toolman_dkv': return { space: 'Lab. DKV', label: 'Petugas Lab DKV', initial: 'DKV' };
      case 'toolman_tpm': return { space: 'Lab. TPM', label: 'Petugas Lab TPM', initial: 'TPM' };
      case 'toolman_tkr': return { space: 'Lab. TKR', label: 'Petugas Lab TKR', initial: 'TKR' };
      case 'toolman_dpb': return { space: 'Lab. DPB', label: 'Petugas Lab DPB', initial: 'DPB' };
      default: return { space: 'Guest Space', label: 'Tamu', initial: '??' };
    }
  };

  const roleInfo = getRoleInfo(role);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
               <Box className="w-7 h-7 text-primary" />
            </div>
            <span className="font-extrabold text-2xl text-slate-800 tracking-tight">Inventorium</span>
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 flex items-center gap-4 shadow-sm shadow-slate-200/50">
             <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                {roleInfo.initial}
             </div>
             <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Active Space</p>
                <p className="font-bold text-slate-800 leading-tight">{roleInfo.space}</p>
             </div>
          </div>

          <nav className="space-y-2 flex-1">
             {navLinks.map((link) => {
               const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
               const Icon = link.icon;
               return (
                 <Link 
                   key={link.name}
                   to={link.path} 
                   className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all ${
                     isActive 
                       ? 'bg-primary text-white shadow-md shadow-primary/20' 
                       : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                   }`}
                 >
                   <Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                   {link.name}
                 </Link>
               );
             })}
          </nav>
          
          <div className="pt-6 border-t border-slate-100 mt-auto">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 w-full text-slate-500 hover:bg-red-50 hover:text-red-700 rounded-xl font-semibold transition-colors"
            >
              <LogOut className="w-5 h-5 opacity-70" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-10 bg-white border-b border-slate-200 shadow-sm shadow-slate-100/50 z-10">
          <h2 className="text-xl text-slate-800 font-bold tracking-tight">Overview</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-slate-800">{user?.email || 'Loading...'}</span>
                <span className="text-xs text-slate-500 font-medium">{roleInfo.label}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-sm overflow-hidden shadow-inner">
              <UserCircle className="w-10 h-10 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 p-10 overflow-auto">
          <div className="max-w-6xl mx-auto">
             <Outlet context={{ role, profile }} />
          </div>
        </div>
      </main>
    </div>
  );
}
