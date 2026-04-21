import { supabase } from './supabase';

// Helper: Tarik Data Items berdasarkan Role Auth
export const fetchItemsByRole = async (role) => {
  try {
    let query = supabase.from('items').select('*').order('created_at', { ascending: false });
    
    // Jika role bukan admin / waka, filter sesuai dengan kepemilikan lab
    if (role !== 'admin' && role !== 'waka_sarpras') {
      const labId = role?.replace('toolman_', ''); // asumsikan role 'toolman_tkj' menjadi 'tkj'
      if (labId) {
         query = query.eq('lab_id', labId);
      } else {
         // Fallback aman untuk membatasi query jika string tak dimengerti
         query = query.eq('lab_id', 'unauthorized_space');
      }
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};

// Helper: Tambah Item Baru
export const insertItem = async (itemData) => {
  try {
    const { data, error } = await supabase.from('items').insert([itemData]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error inserting item:', err);
    return { success: false, error: err.message };
  }
};

// Helper: Update Item 
export const updateItem = async (id, updates) => {
  try {
    const { data, error } = await supabase.from('items').update(updates).eq('id', id).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error updating item:', err);
    return { success: false, error: err.message };
  }
};

// Helper: Hapus Item
export const deleteItem = async (id) => {
  try {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting item:', err);
    return { success: false, error: err.message };
  }
};

// Helper: Upload Gambar ke Inventory Bucket
export const uploadImage = async (file) => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('inventory-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;
    
    // Ambil URL Publiknya untuk disematkan di database text
    const { data: publicUrlData } = supabase.storage
      .from('inventory-images')
      .getPublicUrl(fileName);
      
    if (!publicUrlData) throw new Error("Gagal mendapatkan public URL.");

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err) {
    console.error('Error uploading image:', err);
    return { success: false, error: err.message };
  }
};
