import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Box, ShieldCheck } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

import { LABS as baseLabs } from '../data/labs';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [labsData, setLabsData] = useState(baseLabs.map(lab => ({ ...lab, baik: 0, ringan: 0, berat: 0 })));

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const { data, error } = await supabase.from('items').select('lab_id, condition, quantity');
        if (error) throw error;
        
        const freshLabs = baseLabs.map(lab => {
          const labItems = data.filter(item => item.lab_id === lab.id.toLowerCase());
          return {
            ...lab,
            baik: labItems.filter(i => i.condition === 'Baik').reduce((sum, i) => sum + i.quantity, 0),
            ringan: labItems.filter(i => i.condition === 'Rusak Ringan').reduce((sum, i) => sum + i.quantity, 0),
            berat: labItems.filter(i => i.condition === 'Rusak Berat').reduce((sum, i) => sum + i.quantity, 0)
          };
        });
        setLabsData(freshLabs);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchGlobalStats();
  }, []);

  // Data Overview Calculations Setup
  const barData = labsData.map(lab => ({
    name: lab.id,
    Baik: lab.baik,
    'Rusak Ringan': lab.ringan,
    'Rusak Berat': lab.berat,
    total: lab.baik + lab.ringan + lab.berat
  })).sort((a, b) => b.total - a.total); // Sort by total items (descending rank)
  const totalBaik = labsData.reduce((sum, lab) => sum + lab.baik, 0);
  const totalRingan = labsData.reduce((sum, lab) => sum + lab.ringan, 0);
  const totalBerat = labsData.reduce((sum, lab) => sum + lab.berat, 0);

  const pieData = [
    { name: 'Kondisi Baik', value: totalBaik, color: '#10b981' },
    { name: 'Rusak Ringan', value: totalRingan, color: '#f59e0b' },
    { name: 'Rusak Berat', value: totalBerat, color: '#f43f5e' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center font-sans selection:bg-primary/20 relative overflow-hidden">

      {/* Ambient Background Blobs for Glassmorphism Effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40rem] h-[40rem] bg-rose-300/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50rem] h-[50rem] bg-blue-300/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      </div>

      {/* Navbar */}
      <nav className="w-full bg-white/50 backdrop-blur-3xl shadow-sm border-b border-white/80 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Box className="w-6 h-6 text-primary" />
          </div>
          <span className="font-extrabold text-xl text-slate-800 tracking-tight">Labskansabro</span>
        </div>
        <Link to="/login" className="group flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          Login Petugas
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </nav>

      <main className="flex-1 w-full max-w-[1400px] px-8 py-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
          <img src="/logo-smkn1.png" alt="Logo SMKN 1 Brondong" className="w-24 h-24 md:w-32 md:h-32 object-contain mb-8 hover:scale-105 transition-transform duration-500 drop-shadow-xl" />

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-[1.1]">
            Sistem Inventaris Asset  <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Laboratorium</span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-700 tracking-wide mb-6 uppercase">
            SMKN 1 BRONDONG
          </h2>
          <p className="text-xl text-slate-500 px-4 font-medium max-w-2xl mx-auto leading-relaxed text-center">
            Platform terpusat untuk memantau detail kondisi dan ketersediaan dari seluruh aset inventaris sekolah secara real-time.
          </p>
        </div>

        {/* Analytics Section: Overview Charts */}
        <div className="flex flex-col lg:flex-row gap-8 px-4 w-full mb-12 animate-in fade-in zoom-in-95 duration-700">

          {/* Pie Chart: Overall Condition */}
          <div className="w-full lg:w-1/3 bg-white/60 backdrop-blur-3xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-xl font-extrabold text-slate-800 mb-1 text-center">Rasio Kondisi Global</h2>
            <p className="text-slate-500 text-sm font-medium text-center mb-8">Proporsi status inventaris semua lab</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={100}
                    paddingAngle={3} dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#334155' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Rank Lab Total */}
          <div className="w-full lg:w-2/3 bg-white/60 backdrop-blur-3xl border border-white/60 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col mb-8">
              <h2 className="text-xl font-extrabold text-slate-800 mb-1">Peringkat Volume Aset</h2>
              <p className="text-slate-500 text-sm font-medium">Distribusi akumulasi inventaris per laboratorium</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 30, left: -20, bottom: 5 }} barSize={35}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 700, fontSize: 13 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(51, 65, 85, 0.05)' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#334155' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#64748b', paddingTop: '15px' }} />
                  <Bar dataKey="Baik" stackId="a" fill="#10b981" radius={[0, 0, 6, 6]} />
                  <Bar dataKey="Rusak Ringan" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Rusak Berat" stackId="a" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Dashboard Cards Flex Wrapper untuk Rata Tengah */}
        <div className="flex flex-wrap justify-center gap-8 px-4 w-full">
          {labsData.map((lab, i) => (
            <div
              key={lab.id}
              className={`w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] p-10 rounded-[2.5rem] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-xl shadow-indigo-100/40 hover:bg-white/60 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col min-h-[480px] group animate-in zoom-in-95 fade-in duration-500 fill-mode-both`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Category label */}
              <div className={`${lab.baseColor} text-xs font-black tracking-[0.2em] uppercase mb-4 flex items-center gap-2`}>
                {lab.label}
              </div>

              {/* Title */}
              <h3 className="text-[32px] font-black text-slate-800 mb-4 leading-tight tracking-tight relative z-10 w-[75%]">
                {lab.title} <br /> {lab.subtitle}
              </h3>

              {/* Total Aset */}
              <div className={`text-sm font-bold mb-4 flex items-center gap-3 relative z-10 w-max ${lab.badgeTheme} px-4 py-2 rounded-full border border-white/50 shadow-sm backdrop-blur-sm`}>
                <span>Total Aset</span>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                <span>{lab.baik + lab.ringan + lab.berat} Unit</span>
              </div>

              {/* Status Kondisi */}
              <div className="flex flex-col gap-2 relative z-10 w-[80%] mt-2">
                <div className="flex justify-between items-center text-slate-700 text-sm font-bold bg-white/50 px-4 py-2.5 border border-white/40 rounded-xl shadow-sm">
                  <span>Kondisi Baik</span>
                  <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-lg">{lab.baik}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 text-sm font-bold bg-white/50 px-4 py-2.5 border border-white/40 rounded-xl shadow-sm">
                  <span>Rusak Ringan</span>
                  <span className="text-amber-700 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded-lg">{lab.ringan}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 text-sm font-bold bg-white/50 px-4 py-2.5 border border-white/40 rounded-xl shadow-sm">
                  <span>Rusak Berat</span>
                  <span className="text-rose-700 font-extrabold bg-rose-100 px-2.5 py-0.5 rounded-lg">{lab.berat}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-auto pt-5 flex items-center relative z-10">
                <Link to={`/lab/${lab.id}`} className={`flex items-center gap-2 px-5 py-2.5 bg-white/60 hover:bg-white text-slate-800 font-extrabold rounded-2xl shadow-sm hover:shadow-md border border-white/80 transition-all duration-300 active:scale-95 text-[13px] group/btn ${lab.baseColor}`}>
                  Detail Selengkapnya
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Image or Emoji mimicking graphic asset */}
              <div className="absolute top-8 right-8 pointer-events-none transition-transform group-hover:-translate-y-2 group-hover:rotate-12 group-hover:scale-110 duration-700 drop-shadow-xl opacity-90 mix-blend-multiply flex items-center justify-center">
                {lab.image ? (
                  <img src={lab.image} alt={lab.id} className="w-[100px] h-[100px] object-contain drop-shadow-md" />
                ) : (
                  <span className="text-[90px] leading-none select-none">
                    {lab.emoji}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full text-center py-10 mt-10 border-t border-slate-200/50 text-slate-400 font-bold text-sm relative z-10">
        &copy; {new Date().getFullYear()} Inventorium. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}
