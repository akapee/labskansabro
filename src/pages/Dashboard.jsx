import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, XCircle, Plus, Search, Filter, Loader2, UploadCloud, Image as ImageIcon, Trash2, Edit3 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { fetchItemsByRole, insertItem, updateItem, deleteItem, uploadImage } from '../lib/inventoryService';
import { compressImage } from '../utils/imageCompressor';

export default function Dashboard() {
  const context = useOutletContext() || {};
  const role = context.role || 'guest';
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('Simpan Data');
  
  // Edit State
  const [editingItemId, setEditingItemId] = useState(null);
  
  // File Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form State
  const defaultLabId = role.startsWith('toolman_') ? role.replace('toolman_', '') : 'tkj';
  
  const getEmptyForm = () => ({
    sku: '', name: '', category: 'Hardware', condition: 'Baik', year: new Date().getFullYear(), quantity: 1, lab_id: defaultLabId, image_url: '', description: ''
  });

  const [formData, setFormData] = useState(getEmptyForm());

  const getDashboardTitle = () => {
    switch (role) {
      case 'admin': return 'Global Admin Dashboard';
      case 'waka_sarpras': return 'Monitor Sarpras Global';
      case 'toolman_tkj': return 'Dashboard Lab. TKJ';
      case 'toolman_dkv': return 'Dashboard Lab. DKV';
      case 'toolman_tpm': return 'Dashboard Lab. TPM';
      case 'toolman_tkr': return 'Dashboard Lab. TKR';
      case 'toolman_dpb': return 'Dashboard Lab. DPB';
      default: return 'User Dashboard';
    }
  };

  const loadData = async () => {
    setLoading(true);
    const data = await fetchItemsByRole(role);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Batasan Maksimal Ukuran 5MB (Batas Keras Peringatan Dini)
    if (file.size > 5 * 1024 * 1024) {
       alert("Gagal: Ukuran gambar terlalu besar! Maksimal 5MB.");
       return;
    }

    // Set file asli
    setImageFile(file);
    
    // Tampilkan pratinjau mini ke pengguna pakai URL Blob sementara
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const clearFileSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    // Jika tidak menghapus isi foto lama di formData, form data tetap simpan string url yang lama. 
    // Tapi jika pengguna mengeklik silang (X) di preview untuk foto yang ADA di database, kita ubah image_url jd string kosong.
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  // ----- CRUD HANDLERS -----

  const handleOpenAddModal = () => {
    setEditingItemId(null);
    setFormData(getEmptyForm());
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItemId(item.id);
    setFormData({
       sku: item.sku,
       name: item.name,
       category: item.category,
       condition: item.condition,
       year: item.year,
       quantity: item.quantity,
       lab_id: item.lab_id,
       image_url: item.image_url || '',
       description: item.description || ''
    });
    setImageFile(null);
    setImagePreview(item.image_url || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, itemName) => {
    if(!window.confirm(`PERINGATAN: Yakin ingin menghapus ${itemName} secara permanen dari database?`)) return;
    
    // Optimistic UI Removal bisa dimatikan untuk cegah lag error, kita gunakan state filter biasa.
    const res = await deleteItem(id);
    if(res.success) {
       setItems(prevItems => prevItems.filter(i => i.id !== id));
    } else {
       alert("Kesalahan gagal menghapus item: " + res.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let finalImageUrl = formData.image_url; // Default gunakan URL lama jika ada
    
    // Tahap 1: Jika user mengupload file gambar BARU, Kompres dan Unggah Dulu
    if (imageFile) {
       try {
         setUploadStatusText("Memangkas Ukuran...");
         const compressedFile = await compressImage(imageFile, 1080, 0.75);
         
         setUploadStatusText("Mengunggah ke Supabase...");
         const uploadRes = await uploadImage(compressedFile);
         
         if (!uploadRes.success) {
            alert("Gagal mengunggah foto: " + uploadRes.error);
            setIsSubmitting(false);
            setUploadStatusText("Simpan Data");
            return;
         }
         
         finalImageUrl = uploadRes.url;
       } catch (err) {
         alert("Terjadi kesalahan saat memproses gambar.");
         setIsSubmitting(false);
         setUploadStatusText("Simpan Data");
         return;
       }
    }
    
    // Tahap 2: Rakit dan Simpan Database
    setUploadStatusText("Menyimpan Database...");
    const payload = {
      sku: formData.sku,
      name: formData.name,
      category: formData.category,
      condition: formData.condition,
      year: formData.year,
      quantity: formData.quantity,
      lab_id: formData.lab_id,
      image_url: finalImageUrl, // Bisa kosong jika user menghapus foto
      description: formData.description
    };

    let res;
    if (editingItemId) {
       res = await updateItem(editingItemId, payload);
    } else {
       res = await insertItem(payload);
    }
    
    if (res.success) {
      if (editingItemId) {
         // Reaktif timpa data lama di tabel UI
         setItems(items.map(i => i.id === editingItemId ? res.data[0] : i));
      } else {
         // Tambah topologi baru
         setItems([res.data[0], ...items]);
      }
      setIsModalOpen(false);
    } else {
      alert("Gagal menyimpan data barang: " + res.error);
    }
    
    setIsSubmitting(false);
    setUploadStatusText("Simpan Data");
  };

  // Statistik Dinamis
  const totalBaik = items.filter(i => i.condition === 'Baik').reduce((sum, i) => sum + i.quantity, 0);
  const totalRingan = items.filter(i => i.condition === 'Rusak Ringan').reduce((sum, i) => sum + i.quantity, 0);
  const totalBerat = items.filter(i => i.condition === 'Rusak Berat').reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-12">
      <div className="flex justify-between items-center bg-white/40 p-4 rounded-3xl backdrop-blur-md border border-slate-100 shadow-sm">
        <div className="pl-2">
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{getDashboardTitle()}</h1>
           <p className="text-slate-500 font-medium mt-1">Ringkasan cepat kondisi inventaris hari ini secara real-time.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-primary text-white px-5 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Item</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col hover:border-emerald-200 transition-colors group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
               <Package className="w-7 h-7" />
             </div>
             <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg">Baik</span>
          </div>
          <p className="text-sm text-slate-500 font-semibold mb-1">Total Unit Baik</p>
          <h3 className="text-4xl font-extrabold text-slate-800">{loading ? '...' : totalBaik}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col hover:border-amber-200 transition-colors group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
               <AlertTriangle className="w-7 h-7" />
             </div>
             <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg">Rusak Ringan</span>
          </div>
          <p className="text-sm text-slate-500 font-semibold mb-1">Perlu Perbaikan</p>
          <h3 className="text-4xl font-extrabold text-slate-800">{loading ? '...' : totalRingan}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col hover:border-rose-200 transition-colors group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
               <XCircle className="w-7 h-7" />
             </div>
             <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-lg">Rusak Berat</span>
          </div>
          <p className="text-sm text-slate-500 font-semibold mb-1">Aset Rusak Berat</p>
          <h3 className="text-4xl font-extrabold text-slate-800">{loading ? '...' : totalBerat}</h3>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Recent Items</h3>
          <div className="flex gap-2">
             <div className="relative hidden sm:block">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Cari kode/nama..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 font-medium transition-all" />
             </div>
          </div>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="w-full h-40 flex items-center justify-center">
                 <Loader2 className="w-8 h-8 text-primary animate-spin" />
             </div>
          ) : items.length === 0 ? (
             <div className="w-full h-40 flex flex-col items-center justify-center text-slate-400">
                <Package className="w-12 h-12 mb-2 opacity-30" />
                <p className="font-bold text-sm">Belum ada inventaris yang diinputkan.</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-400 uppercase font-bold text-xs tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-[35%]">Nama Barang</th>
                  <th className="px-6 py-4">Kode SKU</th>
                  <th className="px-6 py-4 text-center">Tahun</th>
                  <th className="px-6 py-4">Kondisi</th>
                  <th className="px-6 py-4 text-center">Jumlah</th>
                  <th className="px-6 py-4 text-right">Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                           <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                        ) : (
                           <div className="w-10 h-10 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                           </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-[15px]">{item.name}</div>
                          <div className="text-slate-400 text-xs font-mono mt-0.5">{item.category} • LAB: {item.lab_id.toUpperCase()}</div>
                          {item.description && (
                             <div className="text-[11px] text-slate-400 font-medium italic mt-1.5 line-clamp-2 max-w-[250px] border-l-2 border-slate-200 pl-2 leading-tight">
                               {item.description}
                             </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold border border-slate-200">{item.sku}</span></td>
                    <td className="px-6 py-4 text-center">{item.year}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                          item.condition === 'Baik' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          item.condition === 'Rusak Ringan' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.condition === 'Baik' ? 'bg-emerald-500' :
                          item.condition === 'Rusak Ringan' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span> {item.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-slate-800 text-base">{item.quantity}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEditModal(item)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Edit Aset">
                             <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id, item.name)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors" title="Hapus Permanen">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Insert / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-8 flex flex-col max-h-[90vh]">
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                 <h3 className="font-black text-xl text-slate-800">
                    {editingItemId ? 'Ubah Data Inventaris' : 'Tambah Inventaris Baru'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-1 hover:bg-rose-50 rounded-full">
                    <XCircle className="w-6 h-6" />
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase">Kode SKU (Seri)</label>
                     <input required type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-mono text-sm shadow-inner" placeholder="Contoh: TKJ-PC-001" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase">Nama Barang / Aset</label>
                     <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 shadow-inner" placeholder="Contoh: Komputer Master i7" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase">Kategori Spesifik</label>
                     <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700 shadow-inner appearance-none cursor-pointer">
                        <option value="Hardware">Hardware / Elektronik Papan</option>
                        <option value="Networking">Networking / Jaringan Aktif</option>
                        <option value="Perkakas Mesin">Perkakas / Mesin Potong-Bor</option>
                        <option value="Furniture">Furniture Rak/Meja/Kursi Praktek</option>
                        <option value="Kendaraan">Blok Mesin / Chasis Otomotif</option>
                        <option value="Fashion">Mesin Jahit/Obras/Bordir</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase">Status Tinjauan Fisik</label>
                     <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-sm font-bold text-slate-700 shadow-inner appearance-none cursor-pointer">
                        <option value="Baik">Kondisi Maksimal (Baik)</option>
                        <option value="Rusak Ringan">Rusak Ringan (Bisa Difungsi/Diperbaiki)</option>
                        <option value="Rusak Berat">Rusak Berat (Aset Mati/Afkir)</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase">Tahun Perolehan / Tender</label>
                     <input required type="number" name="year" value={formData.year} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-sm font-semibold font-mono text-slate-800 shadow-inner" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase">Banyaknya Fisik (Unit)</label>
                     <input required type="number" name="quantity" value={formData.quantity} min="1" onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-sm font-black font-mono text-slate-800 text-center shadow-inner" />
                   </div>
                </div>

                {/* Description Zone */}
                <div className="space-y-2 mb-8">
                  <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase">Keterangan / Laporan Kondisi <span className="font-normal text-slate-400 normal-case">(Opsional)</span></label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all text-sm font-medium text-slate-700 shadow-inner resize-y placeholder:text-slate-400" placeholder="Contoh: Monitor berkedip-kedip saat dinyalakan, ada baret di layar. Belum lapor teknisi..."></textarea>
                </div>

                {/* File Upload Zone */}
                <div className="space-y-2 mb-8 p-1 border-t border-slate-100 pt-7">
                  <div className="flex justify-between items-center pr-2 mb-1">
                    <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase">Bukti Dokumentasi Fisik</label>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Maks. 5 MB</span>
                  </div>
                  
                  <div className={`relative w-full border-[3px] border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all ${imagePreview ? 'border-primary/40 bg-primary/5' : 'border-slate-200 hover:border-primary/40 hover:bg-blue-50/50'}`}>
                    
                    {/* Hide regular input entirely, trigger it by clicking layout */}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Klik untuk mengunggah gambar" />
                    
                    {imagePreview ? (
                       <div className="flex flex-col items-center gap-4">
                         <div className="relative group/preview">
                            <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-xl ring-4 ring-primary/20 shadow-md bg-white p-1" />
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/preview:opacity-100 transition-opacity"></div>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearFileSelection(); }} className="absolute -top-3 -right-3 z-30 bg-rose-500 text-white rounded-full p-1.5 shadow-lg hover:bg-rose-600 hover:scale-110 transition-transform">
                              <XCircle className="w-5 h-5" />
                            </button>
                         </div>
                         <p className="text-xs font-bold text-primary">Gambar terlampir. Anda dapat menimpanya dengan klik kembali area ini.</p>
                       </div>
                    ) : (
                       <div className="flex flex-col items-center gap-3 pointer-events-none">
                         <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-1 shadow-sm">
                           <UploadCloud className="w-8 h-8" />
                         </div>
                         <p className="text-sm font-bold text-slate-800">Seret/Jatuhkan foto ke kotak ini</p>
                         <p className="text-[11px] font-semibold text-slate-500 max-w-xs leading-relaxed">Sistem akan secara otomatis menyusutkan gambar puluhan Mega menjadi biner seberat Hitungan Kilocbyte agar database tak penuh.</p>
                       </div>
                    )}
                  </div>
                </div>

                {/* Khusus Admin Bisa Menentukan Lab ID */}
                {(role === 'admin' || role === 'waka_sarpras') && (
                  <div className="space-y-2 mb-8 p-5 bg-amber-50/80 border border-amber-200 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/50 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <label className="text-[11px] font-extrabold text-amber-800 tracking-wider uppercase relative z-10 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      Pilihan Ruang (Kendali Mode Pusat)
                    </label>
                    <select name="lab_id" value={formData.lab_id} onChange={handleInputChange} className="w-full px-4 py-3 mt-3 bg-white border border-amber-300 rounded-xl outline-none text-sm font-bold text-slate-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all relative z-10 appearance-none cursor-pointer hover:bg-amber-50/50">
                        <option value="tkj">Lab Teknik Komputer & Jaringan (TKJ)</option>
                        <option value="dkv">Lab Desain Komunikasi Visual (DKV)</option>
                        <option value="tpm">Lab Teknik Pemesinan (TPM)</option>
                        <option value="tkr">Lab Teknik Kendaraan Ringan (TKR)</option>
                        <option value="dpb">Lab Desain Produksi Busana (DPB)</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                    Batalkan Saja
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 px-8 py-3 min-w-[200px] rounded-xl font-extrabold bg-slate-900 text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none active:scale-95">
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {uploadStatusText}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
