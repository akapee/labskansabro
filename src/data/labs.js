export const LABS = [
  { 
    id: 'TKJ', label: 'TECHNOLOGY', title: 'Teknik Komputer', subtitle: 'dan Jaringan', 
    baik: 142, ringan: 12, berat: 3, image: '/logo-tkj.png', baseColor: 'text-blue-600', badgeTheme: 'bg-blue-50/80 text-blue-700', 
    desc: 'Laboratorium khusus pengembangan infrastruktur jaringan, hardware PC, serta sistem operasi berbasis server.',
    items: [
      { id: 'I-TKJ-01', name: 'PC Client Core i5 12th Gen', year: 2023, condition: 'Baik', qty: 36, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&h=200&fit=crop' },
      { id: 'I-TKJ-02', name: 'Switch Hub Manageable 24 Port', year: 2021, condition: 'Rusak Ringan', qty: 4, image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop' },
      { id: 'I-TKJ-03', name: 'MikroTik RouterBoard 951', year: 2022, condition: 'Baik', qty: 15, image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=200&fit=crop' },
      { id: 'I-TKJ-04', name: 'Server Rackmount Xeon', year: 2019, condition: 'Rusak Berat', qty: 1, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&h=200&fit=crop' },
    ]
  }, 
  { 
    id: 'TPM', label: 'ENGINEERING', title: 'Teknik', subtitle: 'Pemesinan', 
    baik: 210, ringan: 14, berat: 2, image: '/logo-tpm.png', baseColor: 'text-rose-600', badgeTheme: 'bg-rose-50/80 text-rose-700', 
    desc: 'Pusat praktek mesin bubut, milling, fabrikasi logam, dan perancangan mekanikal manufaktur tingkat lanjut.',
    items: [
      { id: 'I-TPM-01', name: 'Mesin Bubut CNC XYZ', year: 2020, condition: 'Baik', qty: 5, image: 'https://images.unsplash.com/photo-1610419253457-41ec7dbde0f2?w=200&h=200&fit=crop' },
      { id: 'I-TPM-02', name: 'Mesin Frais (Milling)', year: 2018, condition: 'Rusak Ringan', qty: 3, image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=200&h=200&fit=crop' },
      { id: 'I-TPM-03', name: 'Jangka Sorong Digital', year: 2023, condition: 'Baik', qty: 40, image: 'https://images.unsplash.com/photo-1580982337775-8025211d279d?w=200&h=200&fit=crop' },
    ]
  },
  { 
    id: 'TKR', label: 'AUTOMOTIVE', title: 'Kendaraan', subtitle: 'Ringan', 
    baik: 75, ringan: 5, berat: 1, image: '/logo-tkr.png', baseColor: 'text-violet-600', badgeTheme: 'bg-violet-50/80 text-violet-700', 
    desc: 'Ruang kerja otomotif khusus perbaikan bodi, sasis, elektronika kendaraan dan overhaul engine mobil.',
    items: [
      { id: 'I-TKR-01', name: 'Engine Stand Toyota Kijang', year: 2017, condition: 'Baik', qty: 8, image: 'https://images.unsplash.com/photo-1486262715619-670810a07151?w=200&h=200&fit=crop' },
      { id: 'I-TKR-02', name: 'Hidrolik Cuci Mobil / Car Lift', year: 2019, condition: 'Rusak Ringan', qty: 2, image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=200&h=200&fit=crop' },
      { id: 'I-TKR-03', name: 'Scanner EFI OBD2 OBD-II', year: 2022, condition: 'Baik', qty: 4, image: 'https://images.unsplash.com/photo-1503328427499-d92d1fa3af8a?w=200&h=200&fit=crop' },
    ]
  },
  { 
    id: 'DKV', label: 'VISUAL ARTS', title: 'Desain Komunikasi', subtitle: 'Visual', 
    baik: 84, ringan: 2, berat: 0, image: '/logo-dkv.png', baseColor: 'text-indigo-600', badgeTheme: 'bg-indigo-50/80 text-indigo-700', 
    desc: 'Studio kreatif pembuatan aset grafis digital, animasi, produksi video, dan multimedia interaktif.',
    items: [
      { id: 'I-DKV-01', name: 'Apple iMac 24" M1', year: 2022, condition: 'Baik', qty: 20, image: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=200&h=200&fit=crop' },
      { id: 'I-DKV-02', name: 'Kamera Mirrorless Sony A7IV', year: 2023, condition: 'Baik', qty: 5, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop' },
      { id: 'I-DKV-03', name: 'Wacom Cintiq Pen Display', year: 2021, condition: 'Rusak Ringan', qty: 3, image: 'https://images.unsplash.com/photo-1590458422771-50e5def4fca0?w=200&h=200&fit=crop' },
    ]
  },
  { 
    id: 'DPB', label: 'FASHION DESIGN', title: 'Desain Produksi', subtitle: 'Busana', 
    baik: 93, ringan: 1, berat: 0, image: '/logo-dpb.png', baseColor: 'text-sky-600', badgeTheme: 'bg-sky-50/80 text-sky-700', 
    desc: 'Pusat bengkel garmen untuk teknik merancang pola busana, menjahit mesin industri, hingga tekstil kreatif.',
    items: [
      { id: 'I-DPB-01', name: 'Mesin Jahit Industri High Speed', year: 2020, condition: 'Baik', qty: 25, image: 'https://images.unsplash.com/photo-1581404106561-1cbfb4deddc5?w=200&h=200&fit=crop' },
      { id: 'I-DPB-02', name: 'Mesin Obras Benang 4', year: 2020, condition: 'Baik', qty: 10, image: 'https://images.unsplash.com/photo-1540306206192-d610dfbfe2b4?w=200&h=200&fit=crop' },
      { id: 'I-DPB-03', name: 'Manekin / Dummy Dressmaking', year: 2019, condition: 'Rusak Ringan', qty: 15, image: 'https://images.unsplash.com/photo-1520006403909-83bc84dc292c?w=200&h=200&fit=crop' },
    ]
  },
];
