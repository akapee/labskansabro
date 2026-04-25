import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

// Helper: Tarik Data Items berdasarkan Role Auth
export const fetchItemsByRole = async (role) => {
  try {
    const itemsRef = collection(db, 'items');
    let q;
    
    // Jika role bukan admin / waka, filter sesuai dengan kepemilikan lab
    if (role !== 'admin' && role !== 'waka_sarpras') {
      const labId = role?.replace('toolman_', ''); // asumsikan role 'toolman_tkj' menjadi 'tkj'
      if (labId) {
         q = query(itemsRef, where('lab_id', '==', labId));
      } else {
         // Fallback aman untuk membatasi query jika string tak dimengerti
         q = query(itemsRef, where('lab_id', '==', 'unauthorized_space'));
      }
    } else {
      q = query(itemsRef);
    }
    
    const querySnapshot = await getDocs(q);
    let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Urutkan data secara lokal berdasarkan waktu terbaru untuk menghindari error Missing Composite Index Firebase
    data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    
    return data;
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};

// Helper: Tambah Item Baru
export const insertItem = async (itemData) => {
  try {
    const docRef = await addDoc(collection(db, 'items'), {
      ...itemData,
      created_at: new Date().toISOString()
    });
    // Return data dalam bentuk array karena kode lama (supabase) return array data
    return { success: true, data: [{ id: docRef.id, ...itemData }] };
  } catch (err) {
    console.error('Error inserting item:', err);
    return { success: false, error: err.message };
  }
};

// Helper: Update Item 
export const updateItem = async (id, updates) => {
  try {
    const docRef = doc(db, 'items', id);
    await updateDoc(docRef, updates);
    return { success: true, data: [{ id, ...updates }] };
  } catch (err) {
    console.error('Error updating item:', err);
    return { success: false, error: err.message };
  }
};

// Helper: Hapus Item
export const deleteItem = async (id) => {
  try {
    const docRef = doc(db, 'items', id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    console.error('Error deleting item:', err);
    return { success: false, error: err.message };
  }
};

// Helper: Upload Gambar ke Inventory Bucket
export const uploadImage = async (file) => {
  try {
    // Sebagai ganti Storage (karena limitasi plan), kita return URL gambar dummy
    console.log("Mocking upload for file:", file.name);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          // Placeholder URL gambar inventaris lab (komputer/hardware)
          url: 'https://images.unsplash.com/photo-1588508065123-287b28e01397?auto=format&fit=crop&q=80&w=800' 
        });
      }, 1000); // Simulasi delay jaringan
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    return { success: false, error: err.message };
  }
};
