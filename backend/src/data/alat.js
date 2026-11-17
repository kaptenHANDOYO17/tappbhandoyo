/**
 * ============================================================
 *  FALLBACK DATA - KATALOG PERLENGKAPAN PENDAKIAN
 * ------------------------------------------------------------
 *  Dipakai otomatis saat SUPABASE_URL belum diisi di .env.
 *
 *
 *  CATATAN gambar_url:
 *  Nilainya memakai path lokal (/images/...) yang file-nya sudah
 *  disediakan di frontend/public/images, sehingga gambar tetap
 *  tampil walau aplikasi dibuka dalam kondisi offline. Path ini
 *  boleh diganti URL penuh (misal https://...) bila ingin memakai
 *  foto dari internet.
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

const alatData = [
  {
    id: 1,
    nama: 'Tas Carrier 60L',
    kategori: 'Tas & Penyimpanan',
    berat_ideal: '2.1 kg',
    prioritas: 'Wajib',
    gambar_url:
      '/images/alat-tas-carrier.svg',
    fungsi:
      'Tas carrier berkapasitas 60 liter berfungsi sebagai wadah utama seluruh logistik pendakian, mulai dari tenda, sleeping bag, pakaian ganti, air, hingga bahan makanan. Rangka internal dan sistem hip belt memindahkan sebagian besar beban dari punggung ke pinggul sehingga tubuh tetap seimbang saat melewati trek menanjak maupun turunan panjang.',
    risiko_tanpa_alat:
      'Tanpa carrier yang layak, beban bertumpu penuh pada bahu dan tulang belakang. Risikonya adalah nyeri punggung bawah, cedera otot trapezius, kehilangan keseimbangan di jalur sempit, serta perlengkapan basah karena tidak terlindungi rain cover.',
  },
  {
    id: 2,
    nama: 'Sleeping Bag Polar',
    kategori: 'Perlengkapan Tidur',
    berat_ideal: '0.9 kg',
    prioritas: 'Wajib',
    gambar_url:
      '/images/alat-sleeping-bag.svg',
    fungsi:
      'Sleeping bag berbahan polar menjaga suhu tubuh tetap stabil saat beristirahat di dalam tenda. Bahan ini memerangkap udara hangat hasil panas tubuh dan tetap terasa nyaman meskipun suhu lingkungan turun drastis pada dini hari di ketinggian di atas 2.000 meter.',
    risiko_tanpa_alat:
      'Tidur tanpa sleeping bag di suhu dingin mempercepat kehilangan panas tubuh dan dapat memicu hipotermia, kondisi gawat darurat yang ditandai menggigil hebat, bicara melambat, dan penurunan kesadaran. Kualitas tidur yang buruk juga menurunkan stamina untuk perjalanan turun.',
  },
  {
    id: 3,
    nama: 'Sepatu Tracking Waterproof',
    kategori: 'Alas Kaki',
    berat_ideal: '1.2 kg',
    prioritas: 'Wajib',
    gambar_url:
      '/images/alat-sepatu-tracking.svg',
    fungsi:
      'Sepatu tracking waterproof memberi cengkeraman kuat pada tanah basah, akar, dan batuan lepas melalui pola outsole yang agresif. Lapisan membran tahan air menjaga kaki tetap kering saat menembus kabut, embun pagi, atau hujan ringan, sementara bagian ankle melindungi pergelangan kaki dari gerakan memutar berlebih.',
    risiko_tanpa_alat:
      'Menggunakan alas kaki tidak sesuai meningkatkan risiko tergelincir pada trek licin, lecet dan blister pada tumit, hingga keseleo atau cedera ligamen pergelangan kaki. Kaki yang terus basah juga rentan mengalami iritasi kulit dan infeksi jamur.',
  },
  {
    id: 4,
    nama: 'Headlamp LED',
    kategori: 'Penerangan',
    berat_ideal: '0.15 kg',
    prioritas: 'Wajib',
    gambar_url:
      '/images/alat-headlamp.svg',
    fungsi:
      'Headlamp LED menjadi sumber cahaya utama untuk summit attack dini hari, memasak, maupun membongkar tenda saat gelap. Karena dipasang di kepala, kedua tangan tetap bebas untuk berpegangan pada akar maupun tali webbing di jalur terjal.',
    risiko_tanpa_alat:
      'Tanpa penerangan, pendaki mudah kehilangan jejak jalur dan berisiko terjatuh ke jurang atau menginjak lubang tersembunyi. Pendakian pada gelap total juga memperlambat ritme kelompok dan mempersulit evakuasi jika terjadi keadaan darurat.',
  },
  {
    id: 5,
    nama: 'Jaket Windproof',
    kategori: 'Pakaian Luar',
    berat_ideal: '0.6 kg',
    prioritas: 'Wajib',
    gambar_url:
      '/images/alat-jaket-windproof.svg',
    fungsi:
      'Jaket windproof menahan terpaan angin kencang di punggungan terbuka dan area sabana sehingga panas tubuh tidak cepat hilang. Material ripstop yang ringan dan cepat kering membuatnya ideal dipakai sebagai lapisan terluar dalam sistem berlapis bersama baselayer dan fleece.',
    risiko_tanpa_alat:
      'Terpapar angin dingin terus-menerus memicu wind chill yang membuat suhu terasa jauh lebih rendah dari suhu sebenarnya. Dampaknya berupa kekakuan otot, penurunan koordinasi gerak, dan meningkatnya peluang hipotermia terutama bila pakaian dalam keadaan lembap.',
  },
  {
    id: 6,
    nama: 'Matras Aluminium Foil',
    kategori: 'Perlengkapan Tidur',
    berat_ideal: '0.35 kg',
    prioritas: 'Penting',
    gambar_url:
      '/images/alat-matras.svg',
    fungsi:
      'Matras aluminium foil dipasang sebagai lapisan dasar di dalam tenda untuk memutus konduksi dingin dari permukaan tanah ke tubuh. Lapisan reflektifnya memantulkan kembali panas tubuh, sementara sisi busanya memberi bantalan terhadap kerikil dan permukaan tidak rata.',
    risiko_tanpa_alat:
      'Tidur langsung di atas tanah membuat panas tubuh terserap permukaan sepanjang malam meskipun sudah memakai sleeping bag. Akibatnya tubuh tetap kedinginan, punggung terasa nyeri, dan pemulihan tenaga untuk hari berikutnya tidak maksimal.',
  },
  {
    id: 7,
    nama: 'Trekking Pole Aluminium',
    kategori: 'Aksesori Pendukung',
    berat_ideal: '0.5 kg',
    prioritas: 'Opsional',
    gambar_url:
      '/images/alat-trekking-pole.svg',
    fungsi:
      'Trekking pole membantu mendistribusikan beban tubuh ke lengan sehingga tekanan pada lutut berkurang signifikan, terutama pada jalur turunan panjang. Tongkat ini juga berguna untuk menguji kestabilan pijakan, menyeberangi aliran air, dan menjaga ritme langkah tetap konsisten.',
    risiko_tanpa_alat:
      'Tanpa trekking pole, sendi lutut menanggung beban kejut berulang saat menuruni jalur terjal yang dapat memicu nyeri tempurung lutut. Keseimbangan pada trek berbatu lepas juga lebih sulit dijaga sehingga risiko terpelincir meningkat.',
  },
  {
    id: 8,
    nama: 'Kompor Portable dan Gas Kaleng',
    kategori: 'Masak & Logistik',
    berat_ideal: '0.8 kg',
    prioritas: 'Wajib',
    gambar_url:
      '/images/alat-kompor-portable.svg',
    fungsi:
      'Kompor portable berbahan bakar gas kaleng digunakan untuk memasak makanan hangat dan merebus air minum di area camp. Asupan makanan hangat berperan penting menjaga suhu inti tubuh serta memulihkan kalori yang terkuras selama perjalanan.',
    risiko_tanpa_alat:
      'Tanpa alat memasak, pendaki hanya bergantung pada makanan dingin dan air mentah yang berisiko menyebabkan gangguan pencernaan. Ketidakmampuan menyajikan minuman hangat juga mempersempit pilihan penanganan awal saat ada anggota kelompok yang mulai kedinginan.',
  },
];

module.exports = alatData;
