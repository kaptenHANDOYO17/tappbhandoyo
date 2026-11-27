/**
 * ============================================================
 *  FALLBACK DATA - KATALOG PERLENGKAPAN PENDAKIAN
 * ------------------------------------------------------------
 *  Dipakai otomatis saat SUPABASE_URL belum diisi di .env.
 *
 *  CATATAN gambar_url:
 *  Nilainya memakai path lokal (/images/...) yang file-nya sudah
 *  disediakan di frontend/public/images, sehingga gambar tetap
 *  tampil walau aplikasi dibuka dalam kondisi offline.
 *
 *  CATATAN kolom konteks:
 *    'semua' -> perlengkapan ini dibutuhkan pada semua gaya
 *               pendakian, baik tektok maupun bermalam.
 *    'camp'  -> hanya dibutuhkan bila pendaki bermalam di gunung.
 *  Kolom ini dipakai halaman My Gear untuk menghitung persentase
 *  kesiapan sesuai rencana pendakian yang dipilih, supaya pendaki
 *  tektok tidak dianggap kurang siap hanya karena tidak membawa
 *  tenda dan kompor.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

const alatData = [
  {
    id: 1,
    nama: "Tas Carrier 60L",
    kategori: "Tas & Penyimpanan",
    berat_ideal: "2.1 kg",
    prioritas: "Wajib",
    konteks: "semua",
    gambar_url:
      "/images/alat-tas-carrier.jpg",
    fungsi:
      "Tas carrier berkapasitas 60 liter berfungsi sebagai wadah utama seluruh logistik pendakian, mulai dari tenda, sleeping bag, pakaian ganti, air, hingga bahan makanan. Rangka internal dan sistem hip belt memindahkan sebagian besar beban dari punggung ke pinggul sehingga tubuh tetap seimbang saat melewati trek menanjak maupun turunan panjang.",
    risiko_tanpa_alat:
      "Tanpa carrier yang layak, beban bertumpu penuh pada bahu dan tulang belakang. Risikonya adalah nyeri punggung bawah, cedera otot trapezius, kehilangan keseimbangan di jalur sempit, serta perlengkapan basah karena tidak terlindungi rain cover.",
  },
  {
    id: 2,
    nama: "Sleeping Bag Polar",
    kategori: "Perlengkapan Tidur",
    berat_ideal: "0.9 kg",
    prioritas: "Wajib",
    konteks: "camp",
    gambar_url:
      "/images/alat-sleeping-bag.jpg",
    fungsi:
      "Sleeping bag berbahan polar menjaga suhu tubuh tetap stabil saat beristirahat di dalam tenda. Bahan ini memerangkap udara hangat hasil panas tubuh dan tetap terasa nyaman meskipun suhu lingkungan turun drastis pada dini hari di ketinggian di atas 2.000 meter.",
    risiko_tanpa_alat:
      "Tidur tanpa sleeping bag di suhu dingin mempercepat kehilangan panas tubuh dan dapat memicu hipotermia, kondisi gawat darurat yang ditandai menggigil hebat, bicara melambat, dan penurunan kesadaran. Kualitas tidur yang buruk juga menurunkan stamina untuk perjalanan turun.",
  },
  {
    id: 3,
    nama: "Sepatu Tracking Waterproof",
    kategori: "Alas Kaki",
    berat_ideal: "1.2 kg",
    prioritas: "Wajib",
    konteks: "semua",
    gambar_url:
      "/images/alat-sepatu-tracking.jpg",
    fungsi:
      "Sepatu tracking waterproof memberi cengkeraman kuat pada tanah basah, akar, dan batuan lepas melalui pola outsole yang agresif. Lapisan membran tahan air menjaga kaki tetap kering saat menembus kabut, embun pagi, atau hujan ringan, sementara bagian ankle melindungi pergelangan kaki dari gerakan memutar berlebih.",
    risiko_tanpa_alat:
      "Menggunakan alas kaki tidak sesuai meningkatkan risiko tergelincir pada trek licin, lecet dan blister pada tumit, hingga keseleo atau cedera ligamen pergelangan kaki. Kaki yang terus basah juga rentan mengalami iritasi kulit dan infeksi jamur.",
  },
  {
    id: 4,
    nama: "Headlamp LED",
    kategori: "Penerangan",
    berat_ideal: "0.15 kg",
    prioritas: "Wajib",
    konteks: "semua",
    gambar_url:
      "/images/alat-headlamp.jpg",
    fungsi:
      "Headlamp LED menjadi sumber cahaya utama untuk summit attack dini hari, memasak, maupun membongkar tenda saat gelap. Karena dipasang di kepala, kedua tangan tetap bebas untuk berpegangan pada akar maupun tali webbing di jalur terjal.",
    risiko_tanpa_alat:
      "Tanpa penerangan, pendaki mudah kehilangan jejak jalur dan berisiko terjatuh ke jurang atau menginjak lubang tersembunyi. Pendakian pada gelap total juga memperlambat ritme kelompok dan mempersulit evakuasi jika terjadi keadaan darurat.",
  },
  {
    id: 5,
    nama: "Jaket Windproof",
    kategori: "Pakaian Luar",
    berat_ideal: "0.6 kg",
    prioritas: "Wajib",
    konteks: "semua",
    gambar_url:
      "/images/alat-jaket-windproof.jpg",
    fungsi:
      "Jaket windproof menahan terpaan angin kencang di punggungan terbuka dan area sabana sehingga panas tubuh tidak cepat hilang. Material ripstop yang ringan dan cepat kering membuatnya ideal dipakai sebagai lapisan terluar dalam sistem berlapis bersama baselayer dan fleece.",
    risiko_tanpa_alat:
      "Terpapar angin dingin terus-menerus memicu wind chill yang membuat suhu terasa jauh lebih rendah dari suhu sebenarnya. Dampaknya berupa kekakuan otot, penurunan koordinasi gerak, dan meningkatnya peluang hipotermia terutama bila pakaian dalam keadaan lembap.",
  },
  {
    id: 6,
    nama: "Matras Aluminium Foil",
    kategori: "Perlengkapan Tidur",
    berat_ideal: "0.35 kg",
    prioritas: "Penting",
    konteks: "camp",
    gambar_url:
      "/images/alat-matras.jpg",
    fungsi:
      "Matras aluminium foil dipasang sebagai lapisan dasar di dalam tenda untuk memutus konduksi dingin dari permukaan tanah ke tubuh. Lapisan reflektifnya memantulkan kembali panas tubuh, sementara sisi busanya memberi bantalan terhadap kerikil dan permukaan tidak rata.",
    risiko_tanpa_alat:
      "Tidur langsung di atas tanah membuat panas tubuh terserap permukaan sepanjang malam meskipun sudah memakai sleeping bag. Akibatnya tubuh tetap kedinginan, punggung terasa nyeri, dan pemulihan tenaga untuk hari berikutnya tidak maksimal.",
  },
  {
    id: 7,
    nama: "Trekking Pole Aluminium",
    kategori: "Aksesori Pendukung",
    berat_ideal: "0.5 kg",
    prioritas: "Opsional",
    konteks: "semua",
    gambar_url:
      "/images/alat-trekking-pole.jpg",
    fungsi:
      "Trekking pole membantu mendistribusikan beban tubuh ke lengan sehingga tekanan pada lutut berkurang signifikan, terutama pada jalur turunan panjang. Tongkat ini juga berguna untuk menguji kestabilan pijakan, menyeberangi aliran air, dan menjaga ritme langkah tetap konsisten.",
    risiko_tanpa_alat:
      "Tanpa trekking pole, sendi lutut menanggung beban kejut berulang saat menuruni jalur terjal yang dapat memicu nyeri tempurung lutut. Keseimbangan pada trek berbatu lepas juga lebih sulit dijaga sehingga risiko terpelincir meningkat.",
  },
  {
    id: 8,
    nama: "Kompor Portable dan Gas Kaleng",
    kategori: "Masak & Logistik",
    berat_ideal: "0.8 kg",
    prioritas: "Wajib",
    konteks: "camp",
    gambar_url:
      "/images/alat-kompor-portable.jpg",
    fungsi:
      "Kompor portable berbahan bakar gas kaleng digunakan untuk memasak makanan hangat dan merebus air minum di area camp. Asupan makanan hangat berperan penting menjaga suhu inti tubuh serta memulihkan kalori yang terkuras selama perjalanan.",
    risiko_tanpa_alat:
      "Tanpa alat memasak, pendaki hanya bergantung pada makanan dingin dan air mentah yang berisiko menyebabkan gangguan pencernaan. Ketidakmampuan menyajikan minuman hangat juga mempersempit pilihan penanganan awal saat ada anggota kelompok yang mulai kedinginan.",
  },
  {
    id: 9,
    nama: "Kotak P3K Pendakian",
    kategori: "Keselamatan",
    berat_ideal: "0.4 kg",
    prioritas: "Wajib",
    konteks: "semua",
    gambar_url:
      "/images/alat-p3k.jpg",
    fungsi:
      "Kotak P3K berisi perban, plester, antiseptik, obat pereda nyeri, obat diare, serta obat pribadi milik anggota kelompok. Isinya dipakai untuk menangani luka lecet, terkilir, dan gangguan ringan di jalur agar masalah kecil tidak berkembang menjadi alasan evakuasi.",
    risiko_tanpa_alat:
      "Tanpa P3K, luka terbuka berisiko terinfeksi karena jalur gunung penuh tanah dan air tidak steril. Keseleo yang tidak segera dibalut akan membengkak dan membuat korban tidak sanggup berjalan, sehingga satu cedera ringan bisa memaksa seluruh rombongan berhenti atau memanggil tim penyelamat.",
  },
  {
    id: 10,
    nama: "Tenda Dome Kapasitas 2 Orang",
    kategori: "Perlindungan",
    berat_ideal: "2.8 kg",
    prioritas: "Wajib",
    konteks: "camp",
    gambar_url:
      "/images/alat-tenda.jpg",
    fungsi:
      "Tenda dome menjadi tempat berlindung utama saat bermalam di gunung. Lapisan flysheet menahan hujan dan embun, sementara rongga udara di dalamnya menahan angin sehingga suhu di dalam tenda terasa jauh lebih hangat daripada di luar.",
    risiko_tanpa_alat:
      "Bermalam tanpa tenda berarti tubuh terpapar langsung angin, hujan, dan embun sepanjang malam. Pakaian yang basah di suhu rendah mempercepat hilangnya panas tubuh dan merupakan penyebab hipotermia yang paling sering terjadi pada pendaki di Indonesia.",
  },
  {
    id: 11,
    nama: "Jas Hujan dan Ponco",
    kategori: "Pakaian Luar",
    berat_ideal: "0.4 kg",
    prioritas: "Wajib",
    konteks: "semua",
    gambar_url:
      "/images/alat-jas-hujan.svg",
    fungsi:
      "Jas hujan atau ponco melindungi tubuh dan isi tas saat hujan turun di tengah jalur. Model ponco yang lebar dapat sekaligus menutupi carrier sehingga perlengkapan tidur tetap kering tanpa perlu rain cover terpisah.",
    risiko_tanpa_alat:
      "Cuaca gunung berubah sangat cepat dan hujan deras bisa datang tanpa tanda. Pakaian basah yang terkena angin membuat suhu tubuh turun drastis, dan sleeping bag yang ikut basah berarti tidak ada lagi tempat menghangatkan diri saat malam tiba.",
  },
  {
    id: 12,
    nama: "Nesting dan Alat Masak",
    kategori: "Masak & Logistik",
    berat_ideal: "0.6 kg",
    prioritas: "Wajib",
    konteks: "camp",
    gambar_url:
      "/images/alat-nesting.jpg",
    fungsi:
      "Nesting adalah set panci, wajan, dan cangkir aluminium yang dapat disusun bertumpuk agar hemat ruang. Alat ini dipakai merebus air, memasak mi, dan menyeduh minuman hangat di area camp.",
    risiko_tanpa_alat:
      "Tanpa nesting, kompor yang dibawa tidak ada gunanya. Pendaki terpaksa mengandalkan makanan dingin dan air mentah, padahal air sumber di gunung perlu dimasak terlebih dahulu untuk menghindari diare yang sangat melemahkan di tengah pendakian.",
  },
  {
    id: 13,
    nama: "Botol Air dan Hidrasi",
    kategori: "Hidrasi",
    berat_ideal: "1.5 kg",
    prioritas: "Wajib",
    konteks: "semua",
    gambar_url:
      "/images/alat-botol-air.jpg",
    fungsi:
      "Botol air atau hydration pack menyimpan persediaan minum selama pendakian. Patokan umumnya dua liter per orang per hari, ditambah cadangan bila jalur yang dilalui tidak memiliki sumber air.",
    risiko_tanpa_alat:
      "Dehidrasi di ketinggian datang lebih cepat daripada di dataran rendah karena udara kering dan napas yang memburu. Gejalanya berupa pusing, kram otot, dan penurunan konsentrasi, yang semuanya memperbesar peluang tergelincir di jalur curam.",
  },
  {
    id: 14,
    nama: "Kupluk, Buff, dan Sarung Tangan",
    kategori: "Pakaian Luar",
    berat_ideal: "0.3 kg",
    prioritas: "Wajib",
    konteks: "semua",
    gambar_url:
      "/images/alat-kupluk-sarung-tangan.jpg",
    fungsi:
      "Kupluk menahan panas tubuh yang paling banyak lepas lewat kepala, buff melindungi leher dan saluran napas dari udara dingin serta debu, sedangkan sarung tangan menjaga jari tetap berfungsi saat suhu turun.",
    risiko_tanpa_alat:
      "Kepala dan tangan adalah bagian tubuh yang paling cepat kehilangan panas. Jari yang kaku kedinginan menyulitkan pendaki membuka tas, memasang tenda, atau berpegangan pada akar dan tali di jalur curam.",
  },
  {
    id: 15,
    nama: "Kompas dan Peta Jalur",
    kategori: "Navigasi & Darurat",
    berat_ideal: "0.2 kg",
    prioritas: "Penting",
    konteks: "semua",
    gambar_url:
      "/images/alat-kompas-peta.jpg",
    fungsi:
      "Kompas dan peta jalur cetak berfungsi sebagai penunjuk arah yang tidak bergantung pada baterai maupun sinyal. Keduanya dipakai memastikan posisi saat kabut turun atau ketika menemukan percabangan jalur yang tidak bertanda.",
    risiko_tanpa_alat:
      "Ponsel kehabisan baterai dan sinyal hilang adalah hal biasa di gunung. Tersesat karena salah memilih percabangan saat kabut tebal merupakan penyebab umum pendaki hilang, dan mencari jalan kembali tanpa alat navigasi memakan waktu serta tenaga yang mungkin sudah menipis.",
  },
];

module.exports = alatData;
