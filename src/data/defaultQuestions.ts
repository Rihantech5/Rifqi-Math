import { Question } from '../types/game';

// Inline clean SVG diagrams for sample math questions
const triangleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180" fill="none"><rect width="300" height="180" rx="8" fill="%23f8fafc"/><path d="M40 140 L240 140 L40 40 Z" stroke="%233b82f6" stroke-width="3" fill="%23dbeafe" fill-opacity="0.5"/><rect x="40" y="125" width="15" height="15" stroke="%232563eb" stroke-width="2" fill="none"/><text x="135" y="158" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231e293b" text-anchor="middle">alas = 8 cm</text><text x="25" y="95" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231e293b" text-anchor="middle">tinggi = 6 cm</text><text x="165" y="80" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23dc2626" text-anchor="middle">sisi miring c = ?</text></svg>`;

const barChartSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" fill="none"><rect width="320" height="180" rx="8" fill="%23f8fafc"/><line x1="40" y1="140" x2="290" y2="140" stroke="%2364748b" stroke-width="2"/><line x1="40" y1="20" x2="40" y2="140" stroke="%2364748b" stroke-width="2"/><rect x="65" y="60" width="35" height="80" fill="%233b82f6" rx="3"/><text x="82" y="52" font-family="sans-serif" font-size="12" font-weight="bold" fill="%231e293b" text-anchor="middle">40</text><text x="82" y="155" font-family="sans-serif" font-size="11" fill="%23475569" text-anchor="middle">Senin</text><rect x="125" y="40" width="35" height="100" fill="%233b82f6" rx="3"/><text x="142" y="32" font-family="sans-serif" font-size="12" font-weight="bold" fill="%231e293b" text-anchor="middle">50</text><text x="142" y="155" font-family="sans-serif" font-size="11" fill="%23475569" text-anchor="middle">Selasa</text><rect x="185" y="70" width="35" height="70" fill="%233b82f6" rx="3"/><text x="202" y="62" font-family="sans-serif" font-size="12" font-weight="bold" fill="%231e293b" text-anchor="middle">35</text><text x="202" y="155" font-family="sans-serif" font-size="11" fill="%23475569" text-anchor="middle">Rabu</text><rect x="245" y="30" width="35" height="110" fill="%233b82f6" rx="3"/><text x="262" y="22" font-family="sans-serif" font-size="12" font-weight="bold" fill="%231e293b" text-anchor="middle">55</text><text x="262" y="155" font-family="sans-serif" font-size="11" fill="%23475569" text-anchor="middle">Kamis</text></svg>`;

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'num-geo-1',
    topic: 'Geometri',
    subject: 'Numerasi',
    grade: 'Kelas 8',
    questionText: 'Perhatikan gambar segitiga siku-siku berikut. Jika panjang alas adalah 8 cm dan tingginya 6 cm, berapakah panjang sisi miring (hipotenusa)?',
    options: ['9 cm', '10 cm', '12 cm', '14 cm'],
    correctIndex: 1,
    explanation: 'Berdasarkan Teorema Pythagoras: c² = a² + b² = 6² + 8² = 36 + 64 = 100. Maka c = √100 = 10 cm.',
    imageUrl: triangleSvg,
    imageCaption: 'Gambar 1: Segitiga Siku-Siku dengan alas 8 cm dan tinggi 6 cm'
  },
  {
    id: 'num-stat-1',
    topic: 'Statistika',
    subject: 'Numerasi',
    grade: 'Kelas 8',
    questionText: 'Berdasarkan diagram batang penjualan buku di perpustakaan sekolah selama 4 hari berikut, berapa rata-rata buku yang terjual per hari?',
    options: ['40 buku', '45 buku', '48 buku', '50 buku'],
    correctIndex: 1,
    explanation: 'Rata-rata = (Senin + Selasa + Rabu + Kamis) ÷ 4 = (40 + 50 + 35 + 55) ÷ 4 = 180 ÷ 4 = 45 buku per hari.',
    imageUrl: barChartSvg,
    imageCaption: 'Diagram Penjualan Buku: Senin(40), Selasa(50), Rabu(35), Kamis(55)'
  },
  {
    id: 'num-alj-1',
    topic: 'Aljabar',
    subject: 'Numerasi',
    grade: 'Kelas 7',
    questionText: 'Jika 3x + 7 = 22, maka berapakah nilai dari 2x - 1?',
    options: ['7', '9', '11', '14'],
    correctIndex: 1,
    explanation: 'Pertama cari x: 3x = 22 - 7 = 15, sehingga x = 5. Kemudian substitusikan ke 2x - 1 = 2(5) - 1 = 10 - 1 = 9.',
  },
  {
    id: 'num-arit-1',
    topic: 'Aritmatika Sosial',
    subject: 'Numerasi',
    grade: 'Kelas 7',
    questionText: 'Sebuah kemeja memiliki label harga Rp150.000,00 dengan diskon 20%. Berapakah uang yang harus dibayarkan pembeli?',
    options: ['Rp110.000,00', 'Rp120.000,00', 'Rp125.000,00', 'Rp130.000,00'],
    correctIndex: 1,
    explanation: 'Besar diskon = 20% × Rp150.000 = Rp30.000. Harga bayar = Rp150.000 - Rp30.000 = Rp120.000,00.',
  },
  {
    id: 'lit-info-1',
    topic: 'Teks Informasi',
    subject: 'Literasi',
    grade: 'Kelas 7',
    questionText: 'Bacalah kutipan berikut: "Hutan mangrove berfungsi melindungi garis pantai dari abrasi gelombang laut dan menjadi habitat aneka biota laut." Apa ide pokok kalimat tersebut?',
    options: [
      'Jenis-jenis biota yang hidup di hutan mangrove',
      'Manfaat dan fungsi ekologis hutan mangrove',
      'Penyebab terjadinya abrasi pantai di Indonesia',
      'Cara melestarikan tanaman bakau di pesisir'
    ],
    correctIndex: 1,
    explanation: 'Kalimat utama menjelaskan secara jelas peran penting atau fungsi ekologis mangrove dalam mencegah abrasi serta sebagai habitat satwa.',
  },
  {
    id: 'lit-cer-1',
    topic: 'Soal Cerita',
    subject: 'Literasi',
    grade: 'Kelas 8',
    questionText: 'Dalam cerita fabel, tokoh Kancil selalu mencari jalan keluar menggunakan kecerdikan ketika terjebak oleh musuh. Nilai moral positif yang dapat dipetik adalah...',
    options: [
      'Mengelabui orang lain demi kesenangan pribadi',
      'Mengutamakan berpikir jernih dan tenang saat menghadapi masalah',
      'Berlari secepat mungkin tanpa memperhitungkan risiko',
      'Mengandalkan kekuatan fisik dibanding musyawarah'
    ],
    correctIndex: 1,
    explanation: 'Karakter kecerdikan Kancil mencerminkan pentingnya ketenangan, akal sehat, dan pemikiran taktis saat mengatasi rintangan sulit.',
  },
  {
    id: 'num-pec-1',
    topic: 'Pecahan',
    subject: 'Numerasi',
    grade: 'Kelas 7',
    questionText: 'Ibu memiliki kue tart. Kakak memakan 1/4 bagian, adik memakan 3/8 bagian. Berapakah sisa kue tart yang belum dimakan?',
    options: ['1/8 bagian', '2/8 bagian', '3/8 bagian', '4/8 bagian'],
    correctIndex: 2,
    explanation: 'Total bagian yang dimakan = 1/4 + 3/8 = 2/8 + 3/8 = 5/8 bagian. Sisa kue = 1 - 5/8 = 8/8 - 5/8 = 3/8 bagian.',
  },
  {
    id: 'num-geo-2',
    topic: 'Geometri',
    subject: 'Numerasi',
    grade: 'Kelas 9',
    questionText: 'Sebuah kaleng susu berbentuk tabung dengan jari-jari alas 7 cm dan tinggi 10 cm. Berapakah volume tabung tersebut? (Gunakan π = 22/7)',
    options: ['1.450 cm³', '1.540 cm³', '1.620 cm³', '1.700 cm³'],
    correctIndex: 1,
    explanation: 'Rumus volume tabung = π × r² × t = (22/7) × 7 × 7 × 10 = 22 × 7 × 10 = 1.540 cm³.',
  },
  {
    id: 'lit-kritis-1',
    topic: 'Literasi Kritis',
    subject: 'Literasi',
    grade: 'Kelas 9',
    questionText: 'Manakah kalimat berikut yang merupakan pernyataan FAKTA, bukan opini?',
    options: [
      'Belajar matematika adalah kegiatan paling menyenangkan di sekolah.',
      'Suhu rata-rata bumi tercatat meningkat 1,1 derajat Celsius sejak era pra-industri.',
      'Pemandangan matahari terbenam di pantai Kuta sangat menawan hati.',
      'Soal ujian akhir semester kali ini terasa cukup membingungkan.'
    ],
    correctIndex: 1,
    explanation: 'Pernyataan tentang kenaikan suhu 1,1°C didasarkan pada data pengukuran ilmiah terverifikasi, sedangkan opsi lainnya memuat kata sifat subjektif/opini.',
  },
  {
    id: 'num-alj-2',
    topic: 'Aljabar',
    subject: 'Numerasi',
    grade: 'Kelas 8',
    questionText: 'Faktorkanlah bentuk aljabar berikut: x² - 9x + 20 = 0. Berapakah nilai akar-akar x yang memenuhi?',
    options: ['x = -4 atau x = -5', 'x = 4 atau x = 5', 'x = 2 atau x = 10', 'x = -2 atau x = -10'],
    correctIndex: 1,
    explanation: 'Cari dua bilangan yang jika dijumlahkan bernilai -9 dan jika dikalikan bernilai 20: (-4) dan (-5). Faktornya: (x - 4)(x - 5) = 0, sehingga x = 4 atau x = 5.',
  },
  {
    id: 'lit-ringk-1',
    topic: 'Teks Informasi',
    subject: 'Literasi',
    grade: 'Kelas 8',
    questionText: '"Energi surya merupakan sumber energi terbarukan yang melimpah dan ramah lingkungan karena tidak menghasilkan emisi gas rumah kaca saat beroperasi." Kesimpulan dari teks di atas adalah...',
    options: [
      'Energi surya mahal dan sulit didapatkan',
      'Energi surya adalah alternatif bersih pengganti bahan bakar fosil',
      'Gas rumah kaca dihasilkan langsung oleh panel surya',
      'Matahari adalah satu-satunya sumber energi di bumi'
    ],
    correctIndex: 1,
    explanation: 'Inti dari teks menyatakan keunggulan energi surya sebagai sumber terbarukan yang bersih dan ramah lingkungan.',
  },
  {
    id: 'num-stat-2',
    topic: 'Statistika',
    subject: 'Numerasi',
    grade: 'Kelas 7',
    questionText: 'Diberikan sekumpulan data nilai matematika: 7, 8, 6, 9, 8, 7, 8, 10. Berapakah MODUS (nilai yang paling sering muncul) dari data tersebut?',
    options: ['7', '8', '8.5', '9'],
    correctIndex: 1,
    explanation: 'Frekuensi nilai: 6 (1 kali), 7 (2 kali), 8 (3 kali), 9 (1 kali), 10 (1 kali). Nilai 8 paling sering muncul (3 kali), sehingga modusnya adalah 8.',
  }
];
