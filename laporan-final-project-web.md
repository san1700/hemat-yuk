# LAPORAN FINAL PROJECT
**APLIKASI MANAJEMEN KEUANGAN "HEMAT YUK" (VERSI WEB)**

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
Proyek ini bertujuan untuk merancang dan membangun sebuah aplikasi manajemen keuangan pribadi bernama "Hemat Yuk" berbasis web. Aplikasi ini dirancang untuk membantu pengguna dalam mencatat, melacak, dan mengelola pengeluaran serta pemasukan mereka sehari-hari. Salah satu fitur unggulan dari aplikasi ini adalah pemanfaatan kecerdasan buatan (Google Generative AI) untuk melakukan pemindaian (scan) nota/struk belanja secara otomatis (OCR) sehingga memudahkan pengguna dalam menginput data transaksi. Aplikasi ini dikembangkan menggunakan teknologi modern seperti React.js dengan Vite, Tailwind CSS untuk antarmuka pengguna yang responsif, dan Firebase sebagai layanan backend untuk autentikasi dan basis data. Versi web ini merupakan tahap awal (MVP) sebelum diintegrasikan lebih lanjut ke dalam bentuk aplikasi mobile.

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
Dalam kehidupan sehari-hari, pengelolaan keuangan pribadi seringkali menjadi tantangan bagi banyak orang. Kurangnya pencatatan yang disiplin menyebabkan pengeluaran yang tidak terkontrol dan kesulitan dalam mencapai target tabungan. Proses pencatatan secara manual seringkali memakan waktu dan rentan terhadap kesalahan. Oleh karena itu, dibutuhkan sebuah sistem pencatatan keuangan yang tidak hanya mencatat masuk-keluarnya uang, tetapi juga mampu memberikan analisis cerdas dan mempermudah penginputan data, salah satunya melalui pemindaian struk menggunakan AI (Artificial Intelligence). Aplikasi "Hemat Yuk" versi web ini dibangun sebagai solusi untuk mengatasi permasalahan tersebut dengan menawarkan antarmuka yang modern, mudah digunakan (user-friendly), dan terintegrasi dengan teknologi AI.

### B. Rumusan Masalah
1. Bagaimana merancang bangun aplikasi manajemen keuangan "Hemat Yuk" berbasis web?
2. Bagaimana mengimplementasikan fitur pemindaian nota otomatis (OCR) menggunakan AI pada aplikasi "Hemat Yuk"?

### C. Tujuan
1. Merancang dan membangun aplikasi manajemen keuangan "Hemat Yuk" berbasis web untuk memudahkan pengguna mengelola keuangan.
2. Mengimplementasikan fitur pemindaian nota otomatis menggunakan AI (Google Generative AI) untuk mempermudah proses input data transaksi pada aplikasi.

### D. Batasan Masalah
1. **Pengguna:** Sistem ditujukan untuk pengguna individu (personal finance).
2. **Data & Proses:** Sistem dapat melakukan autentikasi pengguna, input transaksi (pemasukan/pengeluaran) secara manual atau otomatis via scan nota, pengelolaan anggaran bulanan, target tabungan (savings goals), dan menampilkan ringkasan data (dashboard).
3. **Metode Pengembangan:** Menggunakan metode Agile Development. Pendekatan pemrograman menggunakan Component-Based Architecture (React).
4. **Kebutuhan Sistem:**
   - Software: React.js (Vite), Tailwind CSS, Firebase (Auth & Firestore), Google Generative AI SDK, Lucide React (Icons), Recharts (Grafik).
5. **Teknik Pengujian:** Black-box testing untuk menguji fungsionalitas fitur-fitur utama sistem.

---

## BAB II TINJAUAN PUSTAKA

### A. Aplikasi Web dengan React.js dan Vite
React.js adalah pustaka JavaScript front-end sumber terbuka untuk membangun antarmuka pengguna berbasis komponen. Dipadukan dengan Vite sebagai *build tool* generasi baru, pengembangan aplikasi menjadi lebih cepat karena dukungan *Hot Module Replacement* (HMR) yang sangat cepat.

### B. Firebase (Authentication dan Firestore)
Firebase menyediakan layanan *backend-as-a-service* (BaaS) yang mempermudah pengembang dalam mengimplementasikan autentikasi (Google/Email Login) dan penyimpanan data NoSQL secara *real-time* menggunakan Cloud Firestore. Pada proyek ini, setiap transaksi pengguna disimpan di Firestore secara aman berdasarkan `userId`.

### C. Kecerdasan Buatan (Google Generative AI) dalam Pemindaian Nota
Google Generative AI menyediakan model bahasa besar (LLM) yang mampu melakukan tugas ekstraksi informasi (OCR pintar). Dalam konteks aplikasi ini, AI digunakan untuk membaca gambar nota belanja dan mengekstrak informasi seperti total harga, nama barang, dan merekomendasikan kategori pengeluaran secara otomatis.

---

## BAB III METODE PERANCANGAN

### A. Metode yang Digunakan
Metode pengembangan perangkat lunak yang digunakan adalah **Agile Development**. Pendekatan ini dipilih karena memungkinkan pengembangan aplikasi yang fleksibel, iteratif, dan responsif terhadap perubahan kebutuhan selama proses pembangunan sistem.

### B. Tahapan Perancangan
Tahapan yang dilakukan meliputi:
1. **Requirement Gathering:** Mengidentifikasi kebutuhan fitur seperti pencatatan keuangan, dashboard analitik, dan scan nota berbasis AI.
2. **Design (Perancangan):** Merancang antarmuka pengguna (UI/UX) dengan tema mode terang (light) dan gelap (dark) menggunakan Tailwind CSS.
3. **Implementation:** Proses coding menggunakan React.js, menghubungkan dengan database Firebase, dan mengintegrasikan Google Generative AI untuk fitur *AI Analysis* dan pemindaian nota.
4. **Testing:** Melakukan uji coba pada setiap komponen (*Auth, Dashboard, Transactions, AI Analysis, Savings, Profile*) untuk memastikan tidak ada *bug*.
5. **Deployment:** Peluncuran versi web sebelum dilanjutkan ke tahap *mobile app* (Capacitor).

---

## BAB IV HASIL DAN PEMBAHASAN

### A. Implementasi
*(Catatan: Harap masukkan tangkapan layar (screenshot) aplikasi pada bagian ini)*

1. **Halaman Autentikasi (AuthView)**  
   [Screenshot Halaman Login/Register]  
   Penjelasan: Halaman ini memungkinkan pengguna untuk membuat akun atau masuk menggunakan layanan Firebase Authentication.

2. **Halaman Dashboard**  
   [Screenshot Dashboard]  
   Penjelasan: Menampilkan ringkasan saldo, pengeluaran, pemasukan, serta grafik distribusi pengeluaran bulanan.

3. **Halaman Transaksi dan Modal Input**  
   [Screenshot Halaman Transaksi & Form Input]  
   Penjelasan: Daftar riwayat transaksi dan form pencatatan transaksi secara manual.

4. **Fitur Scan Nota Berbasis AI**  
   [Screenshot Modal Scan Nota]  
   Penjelasan: Antarmuka yang memungkinkan pengguna untuk memotret atau mengunggah nota, yang kemudian dianalisis oleh AI untuk diekstrak data nominal dan kategorinya.

5. **Halaman Target Tabungan (Savings Goals)**  
   [Screenshot Halaman Tabungan]  
   Penjelasan: Pengguna dapat menetapkan target menabung dan melacak progresnya.

### B. Pengujian Program
Pengujian dilakukan dengan metode Black-Box Testing berfokus pada fitur:
- **Registrasi & Login:** Berhasil menyimpan sesi pengguna dengan Firebase Auth.
- **CRUD Transaksi:** Data transaksi berhasil ditambahkan, diubah, dan dihapus secara *real-time* di Firestore.
- **Pemindaian AI:** Sistem berhasil memproses gambar dan mengembalikan nilai estimasi pengeluaran dari struk.

### C. Analisis Dan Pembahasan
Solusi yang ditawarkan melalui aplikasi "Hemat Yuk" terbukti dapat mempermudah proses pencatatan keuangan berkat adanya otomasi dari AI dan visualisasi data yang interaktif.

**1. Kelebihan Sistem**
- Antarmuka yang sangat responsif, modern, dan dilengkapi fitur *Dark Mode*.
- Penggunaan teknologi AI sangat mempercepat input transaksi dari nota fisik.
- Sinkronisasi data secara *real-time* lintas perangkat karena menggunakan cloud database (Firestore).
- Kode yang *scalable* dan siap di-porting menjadi aplikasi *mobile* menggunakan Capacitor.

**2. Kekurangan Sistem**
- Fungsionalitas AI masih bergantung pada kualitas foto nota dan koneksi internet; jika buram, ekstraksi data bisa kurang akurat.
- Belum tersedia fitur export laporan keuangan ke format PDF atau Excel. Hal ini diusulkan untuk pengembangan selanjutnya.

---

## BAB V KESIMPULAN DAN SARAN

### A. KESIMPULAN
1. Perancangan dan pembangunan aplikasi manajemen keuangan "Hemat Yuk" berbasis web telah berhasil dilakukan dengan menggunakan tumpukan teknologi React.js, Tailwind CSS, dan Firebase.
2. Implementasi fitur pemindaian nota otomatis dengan Google Generative AI berhasil diterapkan dan terbukti mempermudah pengguna dalam mencatat pengeluaran tanpa harus mengetik manual seluruh detail transaksi.

### B. SARAN
Untuk pengembangan sistem berikutnya, disarankan untuk:
1. Menambahkan fitur *Export/Download* laporan bulanan ke format PDF atau Excel.
2. Memperbaiki akurasi OCR dengan melakukan pra-pemrosesan gambar (image pre-processing) sebelum dikirim ke *endpoint* AI.
3. Melanjutkan pengembangan aplikasi ini menjadi versi aplikasi *mobile* *native* (Android/iOS) menggunakan Capacitor agar dapat mengakses kamera perangkat dengan lebih optimal.

---

## DAFTAR PUSTAKA
- Facebook. (2026). *React: The library for web and native user interfaces*. Diakses dari https://react.dev
- Google. (2026). *Firebase Documentation*. Diakses dari https://firebase.google.com/docs
- Google. (2026). *Gemini API Documentation*. Diakses dari https://ai.google.dev/docs
- Tailwind Labs. (2026). *Tailwind CSS Documentation*. Diakses dari https://tailwindcss.com/docs

---

## LAMPIRAN
1. Dokumentasi (Foto-Foto setiap Tahapan) (apabila ada)
2. Bukti Uji Kelayakan (apabila ada)
3. Screen Shoot Upload Video Presentasi berikut link nya (apabila ada)
4. Link Github / Link Hasil Project: [Link Github Anda]
5. Slide Presentasi PPT (File terpisah)
