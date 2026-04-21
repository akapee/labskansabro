export const compressImage = (file, maxWidth = 1024, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    // Pastikan ini adalah file bergambar
    if (!file || !file.type.match(/image.*/)) {
      reject(new Error("File bukan gambar valid."));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        // Jika melebihi batas maksimun (misal 1024px), ciutkan!
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Gambar ulang di atas memory canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Output format paksa ke JPEG untuk optimasi ukuran kilat
        canvas.toBlob((blob) => {
          if (!blob) {
             reject(new Error("Gagal mengompresi gambar"));
             return;
          }
          const randomString = Math.random().toString(36).substring(2, 8);
          // Beri nama aman bersih
          const newFile = new File([blob], `inv_${randomString}.jpg`, {
             type: 'image/jpeg',
             lastModified: Date.now() // Timestamps yang fresh
          });
          resolve(newFile);
        }, 'image/jpeg', quality);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
