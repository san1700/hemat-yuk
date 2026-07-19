# LAPORAN FINAL PROJECT
**APLIKASI MANAJEMEN KEUANGAN "HEMAT YUK" (VERSI ANDROID)**

**MATA KULIAH [NAMA MK]**  
**DOSEN PENGAMPU: [NAMA Dosen Pengampu MK]**

**Disusun Oleh:**
1. [Nama Lengkap] ([NIM])
2. [Nama Lengkap] ([NIM])
3. [Nama Lengkap] ([NIM])

**PROGRAM STUDI INFORMATIKA**  
**FAKULTAS TEKNOLOGI INFORMASI**  
**UNIVERSITAS NAHDLATUL ULAMA YOGYAKARTA**  
**2026**

---

## RINGKASAN EKSEKUTIF
Proyek ini bertujuan untuk merancang dan membangun sebuah aplikasi manajemen keuangan pribadi bernama "Hemat Yuk" berbasis Android. Aplikasi ini dirancang agar pengguna dapat mencatat, melacak, dan mengelola pengeluaran serta pemasukan sehari-hari secara mobile langsung dari ponsel mereka. Salah satu fitur unggulan dari aplikasi ini adalah penggunaan kamera perangkat Android yang dipadukan dengan kecerdasan buatan (Google Generative AI) untuk memindai (scan) nota/struk belanja secara otomatis (OCR). Aplikasi ini dikembangkan menggunakan teknologi React.js dengan Vite dan Capacitor sebagai *bridge* untuk mem-build aplikasi web menjadi aplikasi *native* Android (APK). Firebase digunakan sebagai layanan backend untuk autentikasi dan basis data *real-time*.

---

## DAFTAR ISI
1. [BAB I PENDAHULUAN](#bab-i-pendahuluan)
2. [BAB II TINJAUAN PUSTAKA](#bab-ii-tinjauan-pustaka)
3. [BAB III METODE PERANCANGAN](#bab-iii-metode-perancangan)
4. [BAB IV HASIL DAN PEMBAHASAN](#bab-iv-hasil-dan-pembahasan)
5. [BAB V KESIMPULAN DAN SARAN](#bab-v-kesimpulan-dan-saran)
6. [DAFTAR PUSTAKA](#daftar-pustaka)
7. [LAMPIRAN](#lampiran)

---

## BAB I PENDAHULUAN

### A. Latar Belakang Masalah
Di era mobilitas tinggi, pengelolaan keuangan pribadi membutuhkan sistem yang praktis dan dapat diakses kapan saja dan di mana saja. Aplikasi berbasis web sebelumnya memiliki keterbatasan dalam mengakses fitur perangkat keras keras keras (hardware) secara optimal, seperti kamera *smartphone*. Proses pencatatan secara manual seringkali memakan waktu. Oleh karena itu, dibutuhkan pengembangan aplikasi berbasis Android agar proses pencatatan, khususnya yang menggunakan pemindaian (scan) nota belanja melalui kamera ponsel, dapat berjalan lebih mulus. Aplikasi "Hemat Yuk" versi Android ini hadir untuk memberikan solusi pengelolaan keuangan dengan antarmuka mobile yang modern, portabel, dan terintegrasi dengan teknologi AI.

### B. Rumusan Masalah
1. Bagaimana merancang bangun aplikasi manajemen keuangan "Hemat Yuk" berbasis Android menggunakan React.js dan Capacitor?
2. Bagaimana mengimplementasikan fitur pemindaian nota otomatis (OCR) menggunakan akses kamera Android dan Google Generative AI pada aplikasi "Hemat Yuk"?

### C. Tujuan
1. Merancang dan membangun aplikasi manajemen keuangan "Hemat Yuk" berbasis Android (mobile) agar pengguna mudah mengelola keuangan langsung dari *smartphone*.
2. Mengimplementasikan fitur pemindaian nota otomatis dengan menggunakan kamera perangkat *mobile* dan layanan AI (Google Generative AI) untuk mempercepat input transaksi.

### D. Batasan Masalah
1. **Pengguna:** Sistem ditujukan untuk pengguna individu (personal finance) pemakai perangkat Android.
2. **Data & Proses:** Autentikasi pengguna, input transaksi (pemasukan/pengeluaran) manual atau otomatis via scan nota (menggunakan kamera HP), pengelolaan anggaran, target tabungan, dan *dashboard* analitik.
3. **Metode Pengembangan:** Agile Development. Pendekatan pemrograman menggunakan Component-Based Architecture (React) yang dibungkus dengan Capacitor untuk Android.
4. **Kebutuhan Sistem:**
   - Software: React.js (Vite), Tailwind CSS, Capacitor (Core & Android SDK), Firebase (Auth & Firestore), Google Generative AI SDK, Android Studio (untuk *build* APK).
5. **Teknik Pengujian:** Black-box testing dan *Device Testing* (menggunakan Android Emulator / Real Device).

---

## BAB II TINJAUAN PUSTAKA

### A. React.js dan Capacitor untuk Pengembangan Mobile
React.js adalah pustaka antarmuka pengguna, sedangkan Capacitor adalah *cross-platform native runtime* buatan Ionic. Capacitor memungkinkan pengembang untuk membangun aplikasi web modern yang bisa diakses secara *native* di iOS, Android, dan PWA menggunakan satu basis kode web.

### B. Firebase (Authentication dan Firestore)
Firebase menyediakan layanan *backend-as-a-service* (BaaS) untuk sinkronisasi data yang cepat. Dengan Cloud Firestore, data transaksi tersimpan secara *real-time*, sehingga jika pengguna mengganti perangkat *smartphone*, data keuangan mereka akan tetap aman dan tersinkronisasi.

### C. Kecerdasan Buatan (Google Generative AI) dalam Pemindaian Nota
Google Generative AI menyediakan model *Large Language Model* (LLM) yang sanggup mengekstrak informasi tekstual dari sebuah gambar (Vision). Dalam aplikasi mobile, gambar nota ditangkap langsung melalui kamera *smartphone* lalu diproses oleh AI untuk menghasilkan ringkasan nominal belanja dan rekomendasi kategorinya.

---

## BAB III METODE PERANCANGAN

### A. Metode yang Digunakan
Metode pengembangan perangkat lunak yang digunakan adalah **Agile Development**. Pendekatan ini sangat cocok dalam pengembangan aplikasi *mobile* karena memungkinkan tim *developer* untuk merilis fitur secara bertahap dan melakukan adaptasi cepat jika ada *bug* di *device* tertentu.

### B. Tahapan Perancangan
1. **Requirement Gathering:** Menganalisis fitur yang dibutuhkan di *platform mobile*, khususnya izin (permission) akses kamera dan penyimpanan internal.
2. **Design (Perancangan):** Merancang antarmuka UI/UX yang *mobile-friendly* (touch & swipe gestures) dengan tema terang/gelap menggunakan Tailwind CSS.
3. **Implementation:** Mengonversi aplikasi web berbasis React menjadi project Android menggunakan *Capacitor CLI* (`npx cap add android` & `npx cap sync`).
4. **Testing:** Melakukan uji coba pada Android Studio Emulator dan instalasi langsung pada *Real Device* (HP Android fisik).
5. **Deployment:** Melakukan proses *Build* (Generate Signed APK / AAB) untuk disiapkan sebelum tahap perilisan.

---

## BAB IV HASIL DAN PEMBAHASAN

### A. Implementasi
*(Catatan: Harap masukkan tangkapan layar (screenshot) aplikasi versi Android pada bagian ini)*

1. **Halaman Autentikasi di Perangkat Mobile**  
   [Screenshot Halaman Login/Register - Portrait Mode]  
   Penjelasan: Halaman Login/Register yang dioptimalkan untuk layar ponsel Android.

2. **Halaman Dashboard Mobile**  
   [Screenshot Dashboard - Portrait Mode]  
   Penjelasan: Menampilkan ringkasan saldo, pengeluaran, pemasukan, serta grafik yang bisa digeser (swipeable).

3. **Halaman Transaksi**  
   [Screenshot Halaman Transaksi]  
   Penjelasan: Daftar riwayat transaksi dan form pencatatan transaksi.

4. **Fitur Scan Nota via Kamera Android**  
   [Screenshot Modal Scan Nota & Kamera Terbuka]  
   Penjelasan: Sistem meminta izin akses kamera. Pengguna memotret nota secara *live*, dan AI mengekstrak nilainya.

5. **Halaman Target Tabungan**  
   [Screenshot Halaman Tabungan]  
   Penjelasan: Tampilan progres target tabungan pada layar *mobile*.

### B. Pengujian Program
Pengujian dilakukan pada Android Emulator dan Perangkat Asli (Real Device):
- **Akses Kamera:** Capacitor Camera API sukses meminta perizinan *(permission)* dan mengambil gambar beresolusi optimal.
- **Kinerja Aplikasi:** Transisi antar layar berjalan mulus, respons sentuhan (touch event) akurat.
- **Sinkronisasi Firebase:** Aplikasi dapat berjalan dengan baik di jaringan seluler (4G/5G) dan Wi-Fi.

### C. Analisis Dan Pembahasan
Secara keseluruhan, mengubah "Hemat Yuk" menjadi aplikasi Android memberikan fleksibilitas ekstra bagi pengguna untuk melakukan pencatatan saat sedang bepergian.

**1. Kelebihan Sistem**
- *Portability* yang tinggi: pengguna tidak perlu repot membuka browser, cukup menekan *icon* aplikasi di HP.
- Pengalaman pemindaian nota yang jauh lebih cepat dan mulus karena terhubung langsung dengan *hardware* kamera *smartphone*.
- Antarmuka yang responsif khusus *mobile display* (Bottom Navigation, modal pop-up yang sesuai *gesture*).

**2. Kekurangan Sistem**
- Masih bergantung pada koneksi internet yang stabil untuk berkomunikasi dengan Google AI dan Firebase.
- Ukuran aplikasi (*APK Size*) mungkin sedikit lebih besar dibanding aplikasi *native* murni (Kotlin) karena mengandung *webview runtime* dari Capacitor.

---

## BAB V KESIMPULAN DAN SARAN

### A. KESIMPULAN
1. Perancangan dan pembangunan aplikasi manajemen keuangan "Hemat Yuk" berbasis Android sukses dilaksanakan menggunakan *framework* React.js yang dibungkus (*wrapped*) dengan Capacitor.
2. Integrasi fitur kamera perangkat Android dengan Google Generative AI berhasil diterapkan dengan baik, sehingga mempermudah pengguna mencatat transaksi secara instan dari nota fisik.

### B. SARAN
Untuk perbaikan di masa mendatang, disarankan agar:
1. Menambahkan fungsionalitas mode luring (*Offline Support*), di mana transaksi dicatat di memori lokal (SQLite/IndexedDB) ketika koneksi terputus, dan disinkronkan kembali ke Firebase saat *online*.
2. Mengaktifkan notifikasi lokal (Local Push Notifications) untuk mengingatkan pengguna agar disiplin mencatat pengeluaran harian.

---

## DAFTAR PUSTAKA
- Facebook. (2026). *React: The library for web and native user interfaces*. Diakses dari https://react.dev
- Google. (2026). *Firebase Documentation*. Diakses dari https://firebase.google.com/docs
- Google. (2026). *Gemini API Documentation*. Diakses dari https://ai.google.dev/docs
- Ionic. (2026). *Capacitor Documentation*. Diakses dari https://capacitorjs.com/docs

---

## LAMPIRAN
1. Dokumentasi (Foto-Foto setiap Tahapan) (apabila ada)
2. Bukti Uji Kelayakan (apabila ada)
3. Screen Shoot Upload Video Presentasi berikut link nya (apabila ada)
4. Link Github / Link Hasil Project: [Link Github Anda]
5. File APK Aplikasi "Hemat Yuk" (File terpisah)
6. Slide Presentasi PPT (File terpisah)
