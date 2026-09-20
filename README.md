# Lumbung Ternak Terpadu - BUMKAL LPM PLERET
### Sistem Informasi Manajemen Penggemukan Domba, Nutrisi Pakan, Pupuk Kohe & Akuntansi Kalurahan Pleret
*(Terinspirasi dari model circular farming lumbungternak.pleret.id)*

Aplikasi berbasis web modern, responsif, dan komprehensif yang mengadopsi model *Integrated Circular Farming* BUMKal Kalurahan Pleret, Kapanewon Pleret, Kabupaten Bantul, D.I. Yogyakarta.

Aplikasi ini dirancang dengan arsitektur **Zero Dependency & Offline-First**: dapat langsung dibuka di peramban (browser) via `file://` tanpa memerlukan instalasi database server eksternal ataupun kompilasi Node.js. Seluruh data tersimpan aman di `LocalStorage` peramban dengan proteksi parsing data dan fitur backup/restore JSON.

---

## 🌟 Arsitektur 2 Muka (Dual Face Interface)

Aplikasi memiliki 2 antarmuka yang terhubung secara mulus:

### 1. Muka Publik (Untuk Masyarakat Umum, Pembeli & Investor)
Dirancang seperti portal resmi **`lumbungternak.pleret.id`**:
- **Statistik Transparansi Live**: Populasi aktif, serapan pasar domba, produksi pupuk organik kohe, dan kemitraan petani.
- **Katalog Domba Siap Jual**: Foto ternak, ras unggulan (Dorper, Garut, Texel, Merino), estimasi bobot, dan tombol pemesanan langsung via WhatsApp ke admin BUMKal.
- **Cek Eartag & Sertifikat PMK Digital**: Masyarakat dapat mencari nomor eartag untuk memvalidasi riwayat vaksinasi PMK, status kesehatan, dan silsilah.
- **Katalog Pupuk Organik Kohe**: Etalase produk hilir pupuk kompos padat (POP 20 kg) dan pupuk organik cair (POC urin 1 Liter) lengkap dengan formulir pesanan.
- **Diagram Sirkular Farming**: Visualisasi interaktif rantai ekonomi sirkular (Limbah $\rightarrow$ Pupuk $\rightarrow$ Kebun HPT $\rightarrow$ Pakan $\rightarrow$ Domba Sehat).
- **Akses Petugas 1-Klik**: Modal login terintegrasi dengan tombol cepat untuk akun demo (Direktur Utama, Kepala Kandang, Paramedik, Kasir, Pengolah Pupuk, dan Lurah).

### 2. Muka Pengurus & Petugas (Portal Internal Manajemen)
Area terproteksi khusus pengelola BUMKal untuk mengelola seluruh aspek harian kandang melalui 21 menu operasional dan 1 pusat laporan lengkap.

---

## 📊 Pusat Laporan Super Lengkap (Official Report Center)

Menu baru di bawah kelompok Keuangan BUMDes: **Pusat Laporan Lengkap**, menyediakan 6 modul laporan pertanggungjawaban berstandar Kalurahan:

1. **Laporan Populasi & Mutasi Ternak**: Rekapitulasi populasi aktif, pejantan, indukan bunting, bakalan fattening, karantina isolasi, dan riwayat mutasi masuk/keluar.
2. **Laporan Performa ADG & Bobot**: Evaluasi laju pertumbuhan bobot harian (*Average Daily Gain*), rasio konversi bobot per batch, dan rekomendasi panen ekonomis.
3. **Laporan Nutrisi Pakan & HPP**: Analisis konsumsi pakan harian (Konsentrat, Silase, Hijauan), stok gudang, dan HPP pakan per ekor per hari.
4. **Laporan Rekam Medis & PMK**: Riwayat vaksinasi wajib PMK Dinas Peternakan Bantul, injeksi antiparasit, dan catatan tindakan medis.
5. **Laporan Limbah Kohe & Pupuk**: Produksi feses padat & urin cair harian, batch fermentasi aktif, stok siap jual, dan nilai ekonomi limbah sirkular.
6. **Laporan Laba Rugi BUMKal & PADes**: Arus kas masuk/keluar, laba bersih operasional, valuasi aset biologis ternak, dan persentase capaian setoran PADes ke APBKal 2026.

### Fitur Pelaporan:
- **Kop Surat Resmi Kalurahan Pleret**: Logo resmi, alamat sekretariat Kedaton Pleret, No. SK Registrasi BUMKal Kemendesa, dan barcode verifikasi.
- **Tanda Tangan Pejabat**: Lembar pengesahan Direktur Utama BUMKal (*H. Supardi, S.Pt.*) dan Lurah Kalurahan Pleret (*Drs. Taufiq Ridwan*).
- **Filter Periode Dinamis**: Pilihan periode *Bulan Ini*, *Kuartal Ini*, *Tahun Berjalan*, atau *Sepanjang Waktu*.
- **Cetak Print-Ready & PDF**: Format CSS `@media print` rapi tanpa elemen navigasi browser.
- **Ekspor Data Mentah CSV**: Unduh file data mentah per tab laporan untuk analisis spreadsheet.

---

## 📋 Struktur 5 Kategori & 21 Menu Operasional

| Kategori | Menu | Deskripsi Singkat |
| :--- | :--- | :--- |
| **I. NAVIGASI UTAMA** | **1. Dashboard Analytics** | KPI ternak, mortalitas 0%, rata-rata ADG, valuasi biologis, audit log. |
| | **2. Scan Penimbang Cepat** | Stasiun timbang kandang dengan kalkulasi instan kenaikan berat & ADG (g/hari). |
| **II. PENGGEMUKAN** | **3. Siklus Batch** | Periode batch (Qurban 2027, Aqiqah, Breeding) dan target panen. |
| | **4. Master Kandang** | Kapasitas kandang (A, B, C, Isolasi) dan tombol *Tambah Kandang Baru*. |
| | **5. Data Ternak** | Master seluruh ternak, filter ras, status, silsilah, riwayat kawin, dan foto. |
| | **6. History Timbang & ADG** | Log kronologis penimbangan bobot badan seluruh ternak. |
| | **7. Cetak Stiker QR** | Generator stiker barcode QR eartag client-side siap cetak. |
| | **8. Import Masal CSV** | Impor ratusan data domba baru via berkas CSV standar. |
| **III. PAKAN & KESEHATAN** | **9. Input Pakan Harian** | Input ransum konsentrat, silase jagung, dan rumput odot pagi/sore. |
| | **10. Scan Vaksin & Medis** | Injeksi cepat formula vaksin/obat per eartag ternak. |
| | **11. Stok Pakan & HPP** | Inventaris bahan pakan, peringatan batas minimum (*reorder*), dan tombol *Tambah Pakan*. |
| | **12. Rekam Medis** | Catatan diagnosa, tindakan medis, karantina, dan tombol *Catat Medis Baru*. |
| | **13. Limbah Organik** | Input kohe harian, proses fermentasi kompos POP, dan drum POC urin. |
| **IV. KEUANGAN BUMDES** | **14. Buku Kas BUMDes** | Arus kas masuk/keluar BUMKal, filter mutasi, dan cetak pembukuan kas. |
| | **15. Laporan Rapat Evaluasi** | Notulensi musyawarah pamong & BUMKal serta risalah keputusan rapat. |
| | **16. Executive DSS & PADes** | Target & realisasi PADes Kalurahan Pleret dan rekomendasi panen cerdas. |
| | **17. Penjualan Ternak** | Kasir POS domba qurban/aqiqah, pembaruan status ternak, dan cetak kwitansi. |
| | **18. Gaji & Operasional** | Payroll staf kandang/medis dan cetak slip gaji karyawan. |
| | **19. Pusat Laporan Lengkap** | 6 modul laporan komprehensif ber-kop resmi kalurahan dan ekspor CSV. |
| **V. PENGATURAN** | **20. BUMDes, Backup & Purge** | Legalitas BUMKal Kemendesa, unduh Backup JSON, Restore, dan Factory Purge. |
| | **21. Master Preset Vaksin** | Formula vaksin standar dinas, dosis, interval, dan target indikasi. |
| | **22. Manajemen User** | Struktur SDM pengelola BUMKal dan fitur pergantian profil pengguna aktif. |

---

## 🚀 Cara Menjalankan Aplikasi

### Metode 1: Buka Langsung di Peramban (Tanpa Instalasi)
Cukup klik ganda (*double click*) berkas **`index.html`** untuk langsung membukanya di browser Google Chrome, Microsoft Edge, atau Firefox.

### Metode 2: Jalankan Server Lokal PowerShell
Buka PowerShell di direktori aplikasi, lalu jalankan:
```powershell
.\server.ps1
```
Aplikasi akan aktif di `http://localhost:8080`.

### Metode 3: Jalankan via Docker
```bash
docker compose up -d
```
Akses melalui peramban di `http://localhost:8080`.
