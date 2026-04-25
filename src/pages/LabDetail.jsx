import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle2, AlertTriangle, XCircle, Search, Calendar, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { LABS } from '../data/labs';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export default function LabDetail() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const lab = LABS.find(l => l.id.toUpperCase() === id?.toUpperCase());
  
  const [realItems, setRealItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealItems = async () => {
      if (!lab) return;
      try {
        const q = query(
          collection(db, 'items'),
          where('lab_id', '==', lab.id.toLowerCase())
        );
        const querySnapshot = await getDocs(q);
        let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Urutkan data secara lokal (sama seperti dashboard) untuk menghindari error Missing Composite Index
        data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setRealItems(data);
      } catch (err) {
        console.error("Gagal menarik data detail lab:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealItems();
  }, [lab]);

  if (!lab) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4">404 - Lab Tidak Ditemukan</h1>
        <Link to="/" className="text-primary hover:underline font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const realBaik = realItems.filter(i => i.condition === 'Baik').reduce((sum, i) => sum + Number(i.quantity), 0);
  const realRingan = realItems.filter(i => i.condition === 'Rusak Ringan').reduce((sum, i) => sum + Number(i.quantity), 0);
  const realBerat = realItems.filter(i => i.condition === 'Rusak Berat').reduce((sum, i) => sum + Number(i.quantity), 0);
  const total = realBaik + realRingan + realBerat;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-primary/20">
      {/* Background Ornaments */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className={`absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] opacity-30 blur-[100px] rounded-full mix-blend-multiply ${
          lab.id === 'TKJ' ? 'bg-blue-300' : lab.id === 'TPM' ? 'bg-rose-300' : lab.id === 'TKR' ? 'bg-violet-300' : lab.id === 'DKV' ? 'bg-indigo-300' : 'bg-sky-300'
        }`}></div>
        <div className={`absolute top-[40%] -right-[10%] w-[30rem] h-[30rem] opacity-30 blur-[100px] rounded-full mix-blend-multiply delay-150 ${
          lab.id === 'TKJ' ? 'bg-teal-300' : lab.id === 'TPM' ? 'bg-orange-300' : lab.id === 'TKR' ? 'bg-fuchsia-300' : lab.id === 'DKV' ? 'bg-purple-300' : 'bg-cyan-300'
        }`}></div>
      </div>

      {/* Navigation */}
      <nav className="w-full bg-white/40 backdrop-blur-3xl shadow-sm border-b border-white/80 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors group">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Kembali ke Beranda
        </Link>
        <span className="font-extrabold text-lg text-slate-800 tracking-tight px-4 py-1.5 bg-white/60 rounded-full border border-slate-200/60 shadow-sm backdrop-blur-md">
          {lab.id} Detail
        </span>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header Unit */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 mb-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Package className="w-64 h-64" />
          </div>
          
          <img src={lab.image} alt={lab.title} className="w-40 h-40 object-contain drop-shadow-2xl z-10" />
          
          <div className="text-center md:text-left z-10 flex-1">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 shadow-sm border border-white/50 ${lab.badgeTheme}`}>
              {lab.label}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              Laboratorium <br /> {lab.title} <span className={lab.baseColor}>{lab.subtitle}</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium max-w-2xl leading-relaxed">
              {lab.desc}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-md shadow-slate-200/30 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
            <p className="text-slate-500 font-bold mb-2 uppercase tracking-wider text-xs">Total Semua Aset</p>
            <h2 className="text-5xl font-black text-slate-800">{loading ? '...' : total}</h2>
          </div>
          <div className="bg-emerald-50/80 backdrop-blur-xl p-6 rounded-3xl border border-emerald-100 shadow-md shadow-emerald-200/30 flex flex-col gap-3 group hover:-translate-y-1 transition-transform">
             <div className="flex justify-between items-center w-full">
               <span className="font-bold text-emerald-800">Kondisi Baik</span>
               <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
             </div>
             <h2 className="text-4xl font-black text-emerald-700">{loading ? '...' : realBaik}</h2>
          </div>
          <div className="bg-amber-50/80 backdrop-blur-xl p-6 rounded-3xl border border-amber-100 shadow-md shadow-amber-200/30 flex flex-col gap-3 group hover:-translate-y-1 transition-transform">
             <div className="flex justify-between items-center w-full">
               <span className="font-bold text-amber-800">Rusak Ringan</span>
               <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
             </div>
             <h2 className="text-4xl font-black text-amber-700">{loading ? '...' : realRingan}</h2>
          </div>
          <div className="bg-rose-50/80 backdrop-blur-xl p-6 rounded-3xl border border-rose-100 shadow-md shadow-rose-200/30 flex flex-col gap-3 group hover:-translate-y-1 transition-transform">
             <div className="flex justify-between items-center w-full">
               <span className="font-bold text-rose-800">Rusak Berat</span>
               <div className="p-2 bg-rose-100 text-rose-600 rounded-xl"><XCircle className="w-6 h-6" /></div>
             </div>
             <h2 className="text-4xl font-black text-rose-700">{loading ? '...' : realBerat}</h2>
          </div>
        </div>

        {/* Inventory List Table */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-xl shadow-slate-200/40 mb-10 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Daftar Inventaris Laboratorium</h2>
              <p className="text-slate-500 font-medium">Berdasarkan pendataan real-time terkini oleh petugas lab.</p>
            </div>
          </div>
          <div className="overflow-x-auto p-4 md:p-8 min-h-[250px]">
             {loading ? (
                <div className="w-full flex items-center justify-center p-12">
                   <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
             ) : realItems.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center p-12 text-slate-400">
                   <Package className="w-16 h-16 opacity-40 mb-3" />
                   <p className="text-lg font-bold">Belum Ada Inventaris Tersedia</p>
                   <p className="text-sm font-medium opacity-80">Segera hubungi petugas untuk mendata barang di ruangan ini.</p>
                </div>
             ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-sm font-bold uppercase tracking-wider">
                  <th className="p-4 pb-6 w-24">Foto</th>
                  <th className="p-4 pb-6">Nama Barang</th>
                  <th className="p-4 pb-6 text-center">Tahun Perolehan</th>
                  <th className="p-4 pb-6">Kondisi</th>
                  <th className="p-4 pb-6 text-center">Jumlah</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 font-medium divide-y divide-slate-50">
                {realItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 py-5">
                      {item.image_url ? (
                        <div 
                          onClick={() => setSelectedImage(item.image_url)}
                          title="Klik untuk memperbesar foto"
                          className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all relative cursor-pointer"
                        >
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors z-10 flex items-center justify-center pointer-events-none group-hover/img:pointer-events-auto">
                            <Search className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
                          </div>
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 py-5">
                      <p className="font-bold text-slate-800 text-base">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{item.sku}</p>
                    </td>
                    <td className="p-4 py-5 text-center font-semibold text-slate-600">{item.year}</td>
                    <td className="p-4 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-opacity-10 ${
                        item.condition === 'Baik' ? 'bg-emerald-500 text-emerald-700 border-emerald-200' :
                        item.condition === 'Rusak Ringan' ? 'bg-amber-500 text-amber-700 border-amber-200' :
                        'bg-rose-500 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.condition === 'Baik' ? 'bg-emerald-500' :
                          item.condition === 'Rusak Ringan' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        {item.condition}
                      </span>
                    </td>
                    <td className="p-4 py-5 text-center font-black text-slate-800 text-base">{item.quantity} <span className="text-xs text-slate-400 font-medium block">Unit</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
             )}
          </div>
        </div>

        {/* Public Item Request / Information */}
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-50"></div>
          <div className="relative z-10 flex-1">
            <h3 className="text-2xl font-extrabold mb-3">Ingin Menggunakan Fasilitas Lab?</h3>
            <p className="text-slate-400 font-medium">Bagi siswa yang ingin menyewa/meminjam alat praktek di lab ini untuk keperluan lomba atau tugas akhir, silakan lakukan reservasi kepada Toolman / Kepala Bengkel berwenang sesuai dengan prosedur sekolah.</p>
          </div>
          <div className="relative z-10 flex flex-col gap-4">
             <Link to="/login" className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3.5 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-lg w-full md:w-auto">
               <Calendar className="w-5 h-5" /> Hubungi Petugas
             </Link>
          </div>
        </div>

      </main>

      {/* Image Zoom Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
             <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 md:top-0 md:-right-12 text-white/50 hover:text-white transition-colors cursor-pointer"
                title="Tutup (Atau klik di luar gambar)"
             >
                <XCircle className="w-10 h-10" />
             </button>
             <img 
                src={selectedImage} 
                alt="Enlarged Item" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300 cursor-default"
                onClick={(e) => e.stopPropagation()}
             />
          </div>
        </div>
      )}

    </div>
  );
}
