/**
 * Central State Store & Database Management
 * Menggunakan LocalStorage dengan versioning & migrasi otomatis
 */

const STORAGE_KEYS = {
    DOMBA: "kandang_domba_v2",
    PERIKSA_TIMBANG: "kandang_timbang_v2",
    LAHAN: "kandang_lahan_v2",
    STOK_PAKAN: "kandang_stok_pakan_v2",
    PANEN_HPT: "kandang_panen_hpt_v2",
    KOHE_HARIAN: "kandang_kohe_harian_v2",
    BATCH_LIMBAH: "kandang_batch_limbah_v2",
    STOK_PUPUK: "kandang_stok_pupuk_v2",
    TASKS: "kandang_tasks_v2",
    SDM: "kandang_sdm_v2",
    CURRENT_USER: "kandang_current_user_v2",
    AGENDAS: "kandang_agendas_v2",
    KEUANGAN: "kandang_keuangan_v2",
    LOGS: "kandang_activity_logs_v2",
    THEME: "kandang_theme_v2",
    
    // NEW KEYS FOR FULL 21-MENU SUITE
    BATCHES_PENGGEMUKAN: "kandang_batches_penggemukan_v2",
    MASTER_KANDANG: "kandang_master_kandang_v2",
    LOG_PAKAN_HARIAN: "kandang_log_pakan_harian_v2",
    PRESET_VAKSIN: "kandang_preset_vaksin_v2",
    GAJI_OPERASIONAL: "kandang_gaji_operasional_v2",
    DSS_PADES: "kandang_dss_pades_v2",
    PENGATURAN_SISTEM: "kandang_pengaturan_sistem_v2",
    FIREBASE_CONFIG: "kandang_firebase_config_v2",
    BACKUP_SNAPSHOTS: "kandang_backup_snapshots_v2",
    SUPLIER: "kandang_suplier_v2",
    ROLE_PERMISSIONS: "kandang_role_permissions_v2"
};

const Store = {
    // Helper pengambilan data aman dari LocalStorage
    safeGet(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw || raw === "undefined" || raw === "null") return fallback;
            const parsed = JSON.parse(raw);
            return parsed !== null && parsed !== undefined ? parsed : fallback;
        } catch (e) {
            console.warn(`SafeGet warning for key "${key}":`, e);
            return fallback;
        }
    },

    // Inisialisasi Database
    init() {
        this._isReadyForAutoPush = false;
        if (!localStorage.getItem(STORAGE_KEYS.DOMBA) || !localStorage.getItem(STORAGE_KEYS.BATCHES_PENGGEMUKAN)) {
            console.log("Database kosong atau belum lengkap, memuat seed data awal...");
            this.seedInitialData();
        } else {
            console.log("Database aktif terdeteksi di LocalStorage.");
        }

        // Pastikan entitas SDM, Pengguna, Tugas, Agendas, dan Pengaturan Sistem selalu terisi
        if (!this.safeGet(STORAGE_KEYS.SDM, null) || this.safeGet(STORAGE_KEYS.SDM, []).length === 0) {
            this.saveSDM(this.defaultSDMList());
        }
        if (!this.safeGet(STORAGE_KEYS.CURRENT_USER, null) || !this.safeGet(STORAGE_KEYS.CURRENT_USER, {}).id) {
            this.setCurrentUser(this.defaultSDMList()[0]);
        }
        if (!this.safeGet(STORAGE_KEYS.TASKS, null) || this.safeGet(STORAGE_KEYS.TASKS, []).length === 0) {
            this.saveTasks(this.defaultTasksList());
        }
        if (!this.safeGet(STORAGE_KEYS.AGENDAS, null) || this.safeGet(STORAGE_KEYS.AGENDAS, []).length === 0) {
            localStorage.setItem(STORAGE_KEYS.AGENDAS, JSON.stringify(this.defaultAgendasList()));
        }
        if (!this.safeGet(STORAGE_KEYS.PENGATURAN_SISTEM, null)) {
            this.savePengaturan(this.defaultPengaturan());
        }
        this.getSuplier();
        this.getRolePermissions();
    },

    // Seed Data Lengkap & Realistis
    seedInitialData() {
        // 1. DATA DOMBA (12 Ekor terdaftar)
        const dombaList = [
            {
                id: "dmb-1",
                eartag: "DMB-001",
                nama: "Baron Dorper",
                ras: "Dorper Cross",
                kategori: "Pejantan",
                kelamin: "Jantan",
                kandang: "Kandang A",
                sekat: "Sekat 01",
                batchId: "btc-qurban-2027",
                tglLahir: "2024-02-15",
                tglMasuk: "2024-08-01",
                bobotAwal: 38.5,
                hargaBeli: 3800000,
                status: "Sehat",
                induk: "Lokal-Cross",
                pejantan: "Fullblood Dorper Australia",
                adg: 220,
                foto: "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-01", bobot: 44.0, catatan: "Masuk program pakan silase" },
                    { tgl: "2026-08-01", bobot: 49.5, catatan: "Pertumbuhan sangat baik" },
                    { tgl: "2026-09-01", bobot: 55.2, catatan: "Siap kawin pemacek" }
                ],
                rekamMedis: [
                    { id: "med-1", tgl: "2026-08-05", diagnosa: "Vaksinasi & Obat Cacing", tindakan: "Injeksi Ivermectin & B-Complex", obat: "Ivermectin 2ml", petugas: "drh. Wahid" }
                ],
                riwayatKawin: [
                    { tglKawin: "2026-08-20", betinaEartag: "DMB-004", status: "Bunting (Est. Lahir 18 Jan 2027)" }
                ]
            },
            {
                id: "dmb-2",
                eartag: "DMB-002",
                nama: "Bima Garut",
                ras: "Garut Tangkas",
                kategori: "Pejantan",
                kelamin: "Jantan",
                kandang: "Kandang A",
                sekat: "Sekat 02",
                batchId: "btc-qurban-2027",
                tglLahir: "2023-11-10",
                tglMasuk: "2024-05-15",
                bobotAwal: 45.0,
                hargaBeli: 4500000,
                status: "Sehat",
                induk: "Garut Priangan",
                pejantan: "Garut Tanduk Meliuk",
                adg: 180,
                foto: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-01", bobot: 52.0, catatan: "Kondisi fisik prima" },
                    { tgl: "2026-08-01", bobot: 56.5, catatan: "Latihan ketahanan fisik" },
                    { tgl: "2026-09-01", bobot: 61.2, catatan: "Pejantan tangguh" }
                ],
                rekamMedis: [
                    { id: "med-2", tgl: "2026-07-15", diagnosa: "Perapian Kuku", tindakan: "Potong kuku & semprot antiseptik", obat: "Gusanex", petugas: "Wahyu Pratama" }
                ],
                riwayatKawin: []
            },
            {
                id: "dmb-3",
                eartag: "DMB-003",
                nama: "Srikandi Texel",
                ras: "Texel Wonosobo",
                kategori: "Indukan",
                kelamin: "Betina",
                kandang: "Kandang B",
                sekat: "Sekat 01",
                batchId: "btc-breeding-01",
                tglLahir: "2024-03-20",
                tglMasuk: "2024-09-01",
                bobotAwal: 32.0,
                hargaBeli: 3200000,
                status: "Bunting",
                induk: "Texel Murni",
                pejantan: "Texel Pedigree",
                adg: 140,
                foto: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-01", bobot: 38.0, catatan: "Bobot sebelum kawin" },
                    { tgl: "2026-08-01", bobot: 41.2, catatan: "Deteksi kebuntingan positif" },
                    { tgl: "2026-09-01", bobot: 44.8, catatan: "Kondisi bunting sehat, ransum ekstra mineral" }
                ],
                rekamMedis: [
                    { id: "med-3", tgl: "2026-08-10", diagnosa: "Pemeriksaan Kebuntingan (USG/Palpasi)", tindakan: "Konfirmasi bunting 45 hari", obat: "Vitamin Calcidex", petugas: "drh. Wahid" }
                ],
                riwayatKawin: [
                    { tglKawin: "2026-07-12", pejantanEartag: "DMB-001", status: "Bunting Aktif (HPL: 09 Des 2026)" }
                ]
            },
            {
                id: "dmb-4",
                eartag: "DMB-004",
                nama: "Sekar Wangi",
                ras: "Morada Cross",
                kategori: "Indukan",
                kelamin: "Betina",
                kandang: "Kandang B",
                sekat: "Sekat 02",
                batchId: "btc-breeding-01",
                tglLahir: "2024-04-10",
                tglMasuk: "2024-10-01",
                bobotAwal: 28.0,
                hargaBeli: 2800000,
                status: "Bunting",
                induk: "Lokal Ekor Tipis",
                pejantan: "Morada Unggul",
                adg: 125,
                foto: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-01", bobot: 34.0, catatan: "Kondisi siap kawin" },
                    { tgl: "2026-08-01", bobot: 36.5, catatan: "Kawin berhasil" },
                    { tgl: "2026-09-01", bobot: 39.8, catatan: "Perut mulai membesar" }
                ],
                rekamMedis: [],
                riwayatKawin: [
                    { tglKawin: "2026-08-20", pejantanEartag: "DMB-001", status: "Bunting Aktif (HPL: 18 Jan 2027)" }
                ]
            },
            {
                id: "dmb-5",
                eartag: "DMB-005",
                nama: "Joko Tarub",
                ras: "Merino",
                kategori: "Fattening",
                kelamin: "Jantan",
                kandang: "Kandang A",
                sekat: "Sekat 03",
                batchId: "btc-fattening-03",
                tglLahir: "2025-01-05",
                tglMasuk: "2025-07-01",
                bobotAwal: 22.5,
                hargaBeli: 2200000,
                status: "Sehat",
                induk: "Merino Wonosobo",
                pejantan: "Merino Super",
                adg: 240,
                foto: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-01", bobot: 28.0, catatan: "Mulai konsentrat penggemukan" },
                    { tgl: "2026-08-01", bobot: 34.5, catatan: "ADG 210 gram" },
                    { tgl: "2026-09-01", bobot: 41.8, catatan: "ADG naik ke 240 gram, respon pakan tinggi" }
                ],
                rekamMedis: [],
                riwayatKawin: []
            },
            {
                id: "dmb-6",
                eartag: "DMB-006",
                nama: "Gatotkaca",
                ras: "Dorper F2",
                kategori: "Fattening",
                kelamin: "Jantan",
                kandang: "Kandang A",
                sekat: "Sekat 03",
                batchId: "btc-fattening-03",
                tglLahir: "2025-01-12",
                tglMasuk: "2025-07-01",
                bobotAwal: 23.0,
                hargaBeli: 2300000,
                status: "Sehat",
                induk: "Dorper F1",
                pejantan: "Dorper Murni",
                adg: 255,
                foto: "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-01", bobot: 29.0, catatan: "Nafsu makan tinggi" },
                    { tgl: "2026-08-01", bobot: 36.2, catatan: "Pertumbuhan sangat cepat" },
                    { tgl: "2026-09-01", bobot: 43.8, catatan: "Siap target kurban bobot 50kg" }
                ],
                rekamMedis: [],
                riwayatKawin: []
            },
            {
                id: "dmb-7",
                eartag: "DMB-007",
                nama: "Arimbi",
                ras: "Garut Betina",
                kategori: "Indukan",
                kelamin: "Betina",
                kandang: "Kandang B",
                sekat: "Sekat 03",
                batchId: "btc-breeding-01",
                tglLahir: "2024-01-10",
                tglMasuk: "2024-07-15",
                bobotAwal: 30.0,
                hargaBeli: 2900000,
                status: "Laktasi",
                induk: "Garut Lokal",
                pejantan: "Garut Tangkas",
                adg: 90,
                foto: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-01", bobot: 36.0, catatan: "Menjelang melahirkan" },
                    { tgl: "2026-08-01", bobot: 33.5, catatan: "Pasca melahirkan cempe kembar dua" },
                    { tgl: "2026-09-01", bobot: 35.0, catatan: "Menyusui cempe DMB-011 dan DMB-012" }
                ],
                rekamMedis: [
                    { id: "med-4", tgl: "2026-07-22", diagnosa: "Melahirkan Normal", tindakan: "Bantu sanitasi plasenta & tali pusar", obat: "Betadine & Mastitis Care", petugas: "Wahyu Pratama" }
                ],
                riwayatKawin: []
            },
            {
                id: "dmb-8",
                eartag: "DMB-008",
                nama: "Kresna",
                ras: "Texel Wonosobo",
                kategori: "Fattening",
                kelamin: "Jantan",
                kandang: "Kandang A",
                sekat: "Sekat 04",
                batchId: "btc-fattening-03",
                tglLahir: "2025-02-01",
                tglMasuk: "2025-07-15",
                bobotAwal: 20.0,
                hargaBeli: 2100000,
                status: "Sehat",
                induk: "Texel Cross",
                pejantan: "Texel Murni",
                adg: 215,
                foto: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-15", bobot: 20.0, catatan: "Masuk adaptasi pakan hijauan segar" },
                    { tgl: "2026-08-15", bobot: 26.2, catatan: "Adaptasi konsentrat sukses" },
                    { tgl: "2026-09-10", bobot: 32.8, catatan: "Pertambahan bobot konsisten" }
                ],
                rekamMedis: [],
                riwayatKawin: []
            },
            {
                id: "dmb-9",
                eartag: "DMB-009",
                nama: "Larasati",
                ras: "Cross Merino-Garut",
                kategori: "Dara",
                kelamin: "Betina",
                kandang: "Kandang B",
                sekat: "Sekat 04",
                batchId: "btc-breeding-01",
                tglLahir: "2025-03-01",
                tglMasuk: "2025-08-01",
                bobotAwal: 19.5,
                hargaBeli: 2000000,
                status: "Sehat",
                induk: "Garut",
                pejantan: "Merino",
                adg: 160,
                foto: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-08-01", bobot: 19.5, catatan: "Karantina kedatangan" },
                    { tgl: "2026-09-01", bobot: 24.3, catatan: "Calon indukan potensial" }
                ],
                rekamMedis: [
                    { id: "med-5", tgl: "2026-08-03", diagnosa: "Karantina & Profilaksis", tindakan: "Obat cacing Albendazole", obat: "Albendazole Oral", petugas: "Tri Haryanto" }
                ],
                riwayatKawin: []
            },
            {
                id: "dmb-10",
                eartag: "DMB-010",
                nama: "Bambang",
                ras: "Lokal Ekor Gemuk (DEG)",
                kategori: "Fattening",
                kelamin: "Jantan",
                kandang: "Kandang C",
                sekat: "Sekat 01",
                batchId: "btc-fattening-03",
                tglLahir: "2025-02-15",
                tglMasuk: "2025-08-10",
                bobotAwal: 21.0,
                hargaBeli: 1950000,
                status: "Karantina",
                induk: "DEG Madura",
                pejantan: "DEG Super",
                adg: 80,
                foto: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-08-10", bobot: 21.0, catatan: "Awal masuk" },
                    { tgl: "2026-09-01", bobot: 22.8, catatan: "Sedang pemulihan scabies ringan" }
                ],
                rekamMedis: [
                    { id: "med-6", tgl: "2026-08-28", diagnosa: "Scabies / Keropeng Telinga", tindakan: "Isolasi di Kandang C & semprot antiscabies", obat: "Wormamectin & Salep Belerang", petugas: "drh. Wahid" }
                ],
                riwayatKawin: []
            },
            {
                id: "dmb-11",
                eartag: "DMB-011",
                nama: "Cempe Rama",
                ras: "Garut Cross",
                kategori: "Cempe",
                kelamin: "Jantan",
                kandang: "Kandang B",
                sekat: "Sekat 03",
                batchId: "btc-breeding-01",
                tglLahir: "2026-07-22",
                tglMasuk: "2026-07-22",
                bobotAwal: 3.2,
                hargaBeli: 0,
                status: "Sehat",
                induk: "DMB-007",
                pejantan: "DMB-002",
                adg: 170,
                foto: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-22", bobot: 3.2, catatan: "Bobot lahir (kembar 1)" },
                    { tgl: "2026-08-22", bobot: 8.5, catatan: "ASI lancar, mulai jilat rumput lembut" },
                    { tgl: "2026-09-12", bobot: 12.1, catatan: "Lincah dan aktif" }
                ],
                rekamMedis: [],
                riwayatKawin: []
            },
            {
                id: "dmb-12",
                eartag: "DMB-012",
                nama: "Cempe Shinta",
                ras: "Garut Cross",
                kategori: "Cempe",
                kelamin: "Betina",
                kandang: "Kandang B",
                sekat: "Sekat 03",
                batchId: "btc-breeding-01",
                tglLahir: "2026-07-22",
                tglMasuk: "2026-07-22",
                bobotAwal: 2.9,
                hargaBeli: 0,
                status: "Sehat",
                induk: "DMB-007",
                pejantan: "DMB-002",
                adg: 155,
                foto: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [
                    { tgl: "2026-07-22", bobot: 2.9, catatan: "Bobot lahir (kembar 2)" },
                    { tgl: "2026-08-22", bobot: 7.8, catatan: "ASI lancar" },
                    { tgl: "2026-09-12", bobot: 11.2, catatan: "Sehat prima" }
                ],
                rekamMedis: [],
                riwayatKawin: []
            }
        ];

        // 2. SIKLUS BATCH PENGGEMUKAN (PENGGEMUKAN -> Siklus Batch)
        const batchesPenggemukan = [
            {
                id: "btc-qurban-2027",
                nama: "Batch Penggemukan Qurban Super 2027",
                tglMulai: "2026-07-01",
                targetPanen: "2027-05-15",
                targetAdg: 220, // gram/hari
                targetBobotKg: 55,
                totalEkor: 4,
                kandangAlokasi: "Kandang A",
                status: "Berjalan (Fase Fattening Intesif)",
                catatan: "Fokus konsentrat protein 16% dan silase jagung manis."
            },
            {
                id: "btc-fattening-03",
                nama: "Batch Bakalan Reguler Aqiqah Q3-2026",
                tglMulai: "2026-08-01",
                targetPanen: "2026-11-30",
                targetAdg: 200,
                targetBobotKg: 40,
                totalEkor: 4,
                kandangAlokasi: "Kandang A & C",
                status: "Berjalan (Pertumbuhan Normal)",
                catatan: "Untuk kebutuhan pasar aqiqah warga Kapanewon Pleret."
            },
            {
                id: "btc-breeding-01",
                nama: "Siklus Pemuliaan & Pembibitan Indukan 2026",
                tglMulai: "2026-06-01",
                targetPanen: "2027-03-01",
                targetAdg: 150,
                targetBobotKg: 45,
                totalEkor: 4,
                kandangAlokasi: "Kandang B",
                status: "Berjalan (Siklus Bunting & Laktasi)",
                catatan: "Pemeliharaan bibit unggul Dorper & Garut F1."
            }
        ];

        // 3. MASTER KANDANG (PENGGEMUKAN -> Master Kandang)
        const masterKandang = [
            {
                id: "knd-a",
                nama: "Kandang A (Pejantan & Penggemukan)",
                lokasi: "Sektor Barat - Fasilitas Kedaton",
                tipeKandang: "Kandang Panggung Kayu Jati / Bambu",
                kapasitasMaks: 24, // ekor
                terisi: 5,
                jumlahSekat: 6,
                ventilasi: "Sirkulasi Alami + Blower Exhaust",
                suhuRataRata: "28°C",
                kebersihan: "Sangat Bersih (Dibersihkan 2x sehari)",
                sekatList: [
                    { nomor: "Sekat 01", kapasitas: 2, terisi: 1, eartags: ["DMB-001"] },
                    { nomor: "Sekat 02", kapasitas: 2, terisi: 1, eartags: ["DMB-002"] },
                    { nomor: "Sekat 03", kapasitas: 6, terisi: 2, eartags: ["DMB-005", "DMB-006"] },
                    { nomor: "Sekat 04", kapasitas: 6, terisi: 1, eartags: ["DMB-008"] },
                    { nomor: "Sekat 05", kapasitas: 4, terisi: 0, eartags: [] },
                    { nomor: "Sekat 06", kapasitas: 4, terisi: 0, eartags: [] }
                ]
            },
            {
                id: "knd-b",
                nama: "Kandang B (Koloni Induk & Breeding)",
                lokasi: "Sektor Timur - Fasilitas Kedaton",
                tipeKandang: "Kandang Panggung Sekat Melahirkan",
                kapasitasMaks: 20,
                terisi: 6,
                jumlahSekat: 5,
                ventilasi: "Sirkulasi Bebas Terbuka",
                suhuRataRata: "27.5°C",
                kebersihan: "Sangat Bersih (Panggung kering)",
                sekatList: [
                    { nomor: "Sekat 01", kapasitas: 4, terisi: 1, eartags: ["DMB-003"] },
                    { nomor: "Sekat 02", kapasitas: 4, terisi: 1, eartags: ["DMB-004"] },
                    { nomor: "Sekat 03", kapasitas: 4, terisi: 3, eartags: ["DMB-007", "DMB-011", "DMB-012"] },
                    { nomor: "Sekat 04", kapasitas: 4, terisi: 1, eartags: ["DMB-009"] },
                    { nomor: "Sekat 05", kapasitas: 4, terisi: 0, eartags: [] }
                ]
            },
            {
                id: "knd-c",
                nama: "Kandang C (Karantina & Observasi Medis)",
                lokasi: "Sektor Utara (Terisolir 15m dari Kandang Utama)",
                tipeKandang: "Kandang Panggung Sekat Tunggal Tertutup",
                kapasitasMaks: 8,
                terisi: 1,
                jumlahSekat: 4,
                ventilasi: "Kawat Ram Antiserangga",
                suhuRataRata: "28.5°C",
                kebersihan: "Disemprot Desinfektan Rutin",
                sekatList: [
                    { nomor: "Sekat 01", kapasitas: 2, terisi: 1, eartags: ["DMB-010"] },
                    { nomor: "Sekat 02", kapasitas: 2, terisi: 0, eartags: [] },
                    { nomor: "Sekat 03", kapasitas: 2, terisi: 0, eartags: [] },
                    { nomor: "Sekat 04", kapasitas: 2, terisi: 0, eartags: [] }
                ]
            }
        ];

        // 4. LOG PAKAN HARIAN (PAKAN & KESEHATAN -> Input Pakan Harian)
        const logPakanHarian = [
            { id: "fp-1", tgl: "2026-09-14", waktu: "Pagi (07:30)", kandang: "Kandang A", konsentratKg: 8.5, silaseKg: 15.0, hijauanOdotKg: 20.0, petugas: "Wahyu Pratama", catatan: "Nafsu makan tinggi, habis bersih." },
            { id: "fp-2", tgl: "2026-09-14", waktu: "Pagi (08:00)", kandang: "Kandang B", konsentratKg: 5.0, silaseKg: 10.0, hijauanOdotKg: 25.0, petugas: "Wahyu Pratama", catatan: "Indukan menyusui diberikan tambahan kalsium." },
            { id: "fp-3", tgl: "2026-09-14", waktu: "Sore (15:30)", kandang: "Kandang A", konsentratKg: 7.0, silaseKg: 12.0, hijauanOdotKg: 18.0, petugas: "Tri Haryanto", catatan: "Pemberian air minum ad-libitum." },
            { id: "fp-4", tgl: "2026-09-13", waktu: "Pagi (07:30)", kandang: "Kandang A", konsentratKg: 8.0, silaseKg: 14.0, hijauanOdotKg: 20.0, petugas: "Wahyu Pratama", catatan: "Normal." },
            { id: "fp-5", tgl: "2026-09-13", waktu: "Pagi (08:00)", kandang: "Kandang B", konsentratKg: 5.0, silaseKg: 10.0, hijauanOdotKg: 22.0, petugas: "Wahyu Pratama", catatan: "Normal." }
        ];

        // 5. MASTER PRESET VAKSIN & OBAT (PENGATURAN -> Master Preset Vaksin)
        const presetVaksin = [
            { id: "vks-1", nama: "Vaksin PMK (Aftosa)", tipe: "Vaksin Wajib", dosis: "2 ml / ekor", rute: "Subkutan (SC)", intervalHari: 180, target: "Pencegahan Penyakit Mulut & Kuku (Dinas Peternakan Bantul)" },
            { id: "vks-2", nama: "Ivermectin 1% (Wormamectin)", tipe: "Antiparasit / Obat Cacing", dosis: "1 ml / 30 kg BB", rute: "Subkutan (SC)", intervalHari: 90, target: "Pengobatan cacing gilig, cacing hati, scabies, kutu" },
            { id: "vks-3", nama: "Vitamin B-Complex Injeksi", tipe: "Suplemen & Imunostimulan", dosis: "3 ml / ekor", rute: "Intramuskular (IM)", intervalHari: 30, target: "Meningkatkan nafsu makan, daya tahan tubuh, dan metabolisme" },
            { id: "vks-4", nama: "Calcidex Plus (Kalsium & Mineral)", tipe: "Mineral Tulang & Laktasi", dosis: "5 ml / ekor", rute: "Intramuskular (IM)", intervalHari: 45, target: "Mencegah hypocalcemia pada indukan bunting dan pasca melahirkan" },
            { id: "vks-5", nama: "Oxytetracycline LA (Antibiotik)", tipe: "Antibiotik Spektrum Luas", dosis: "1 ml / 10 kg BB", rute: "Intramuskular (IM)", intervalHari: 0, target: "Pengobatan infeksi saluran nafas/pneumonia dan luka terbuka" }
        ];

        // 6. GAJI & OPERASIONAL (KEUANGAN BUMDES -> Gaji & Operasional)
        const gajiOperasional = [
            { id: "gj-1", bulan: "September 2026", sdmNama: "Wahyu Pratama", jabatan: "Kepala Kandang & Paramedik", gajiPokok: 2400000, tunjangan: 350000, totalDiterima: 2750000, statusBayar: "Sudah Ditransfer", tglBayar: "2026-09-01" },
            { id: "gj-2", bulan: "September 2026", sdmNama: "Anjar Wibowo", jabatan: "Kepala Pengolah Pupuk & Niaga", gajiPokok: 2400000, tunjangan: 300000, totalDiterima: 2700000, statusBayar: "Sudah Ditransfer", tglBayar: "2026-09-01" },
            { id: "gj-3", bulan: "September 2026", sdmNama: "Tri Haryanto", jabatan: "Staf Operasional & Kasir", gajiPokok: 2200000, tunjangan: 250000, totalDiterima: 2450000, statusBayar: "Sudah Ditransfer", tglBayar: "2026-09-01" },
            { id: "gj-4", bulan: "September 2026", sdmNama: "drh. Wahid", jabatan: "Dokter Hewan Konsultan", gajiPokok: 1500000, tunjangan: 500000, totalDiterima: 2000000, statusBayar: "Sudah Ditransfer", tglBayar: "2026-09-05" }
        ];

        // 7. EXECUTIVE DSS & PADES (KEUANGAN BUMDES -> Executive DSS & PADes)
        const dssPADes = {
            tahunAnggaran: 2026,
            targetSetoranPADes: 35000000, // Rp 35 Juta untuk Kas Desa Kalurahan Pleret
            realisasiTerkini: 18500000, // Rp 18.5 Juta
            persentaseTercapai: 52.8,
            rekomendasiPanen: [
                { eartag: "DMB-002", nama: "Bima Garut", bobotKg: 61.2, alasan: "Bobot mencapai titik puncak ekonomis (>60kg). Konversi pakan mulai mendatar.", rekomendasiAksi: "Jual Segera (Harga Est. Rp 5.200.000)", estimasiLaba: 1800000 },
                { eartag: "DMB-001", nama: "Baron Dorper", bobotKg: 55.2, alasan: "Kondisi sangat prima untuk kurban premium atau pejantan breeding.", rekomendasiAksi: "Pertahankan untuk Pemuliaan / Buka Lelang", estimasiLaba: 2400000 },
                { eartag: "DMB-006", nama: "Gatotkaca", bobotKg: 43.8, alasan: "ADG sangat tinggi (255g/hari). Sangat efisien melanjutkan penggemukan 30 hari lagi.", rekomendasiAksi: "Lanjutkan Penggemukan (Target 50kg)", estimasiLaba: 1450000 }
            ]
        };

        // Simpan Data Tambahan ke LocalStorage
        localStorage.setItem(STORAGE_KEYS.DOMBA, JSON.stringify(dombaList));
        localStorage.setItem(STORAGE_KEYS.BATCHES_PENGGEMUKAN, JSON.stringify(batchesPenggemukan));
        localStorage.setItem(STORAGE_KEYS.MASTER_KANDANG, JSON.stringify(masterKandang));
        localStorage.setItem(STORAGE_KEYS.LOG_PAKAN_HARIAN, JSON.stringify(logPakanHarian));
        localStorage.setItem(STORAGE_KEYS.PRESET_VAKSIN, JSON.stringify(presetVaksin));
        localStorage.setItem(STORAGE_KEYS.GAJI_OPERASIONAL, JSON.stringify(gajiOperasional));
        localStorage.setItem(STORAGE_KEYS.DSS_PADES, JSON.stringify(dssPADes));

        // Panggil inisialisasi awal lain dari file sebelumnya jika belum ada
        if (!localStorage.getItem(STORAGE_KEYS.LAHAN)) {
            // Jalankan inisialisasi awal standar
            this.seedExistingData();
        }
    },

    seedExistingData() {
        const lahanList = [
            { id: "lhn-1", nama: "Kebun HPT 1 (Rumput Odot)", lokasi: "Blok Selatan Kedaton", luasM2: 2500, komoditas: "Rumput Odot", tglTanam: "2025-01-10", tglPanenTerakhir: "2026-08-25", tglEstimasiPanen: "2026-10-05", estimasiHasilKg: 4500, status: "Fase Pertumbuhan Rumpun", pupukDigunakan: "Kompos Kohe Domba", keterangan: "Bank pakan utama." },
            { id: "lhn-2", nama: "Kebun Legum (Indigofera & Gamal)", lokasi: "Blok Timur Kedaton", luasM2: 1800, komoditas: "Indigofera", tglTanam: "2024-11-20", tglPanenTerakhir: "2026-08-30", tglEstimasiPanen: "2026-09-28", estimasiHasilKg: 1800, status: "Siap Pangkas", pupukDigunakan: "POC Urin Domba", keterangan: "Sumber protein nabati tinggi." }
        ];
        const stokPakan = [
            { id: "stk-1", nama: "Konsentrat Penggemukan (PK 16%)", kategori: "Konsentrat", stokKg: 1250, satuan: "kg", batasMinimum: 300, biayaPerKg: 4200 },
            { id: "stk-2", nama: "Silase Tebon Jagung Fermentasi", kategori: "Silase", stokKg: 3400, satuan: "kg", batasMinimum: 800, biayaPerKg: 1200 },
            { id: "stk-3", nama: "Silase Jerami Padi EM4", kategori: "Silase", stokKg: 1800, satuan: "kg", batasMinimum: 500, biayaPerKg: 800 },
            { id: "stk-4", nama: "Hijauan Segar Odot/Pakchong", kategori: "Hijauan", stokKg: 650, satuan: "kg", batasMinimum: 200, biayaPerKg: 400 },
            { id: "stk-5", nama: "Mineral Blok & Garam Beryodium", kategori: "Suplemen", stokKg: 85, satuan: "kg", batasMinimum: 20, biayaPerKg: 15000 }
        ];
        const batchLimbah = [
            { id: "B-POP-01", nama: "Kompos Kohe Domba Halus Batch 08", tipe: "Pupuk Organik Padat (POP)", kapasitas: 2500, satuan: "kg", tglMulai: "2026-08-15", tglEstimasiSelesai: "2026-09-18", suhuTerkini: 38, status: "Pengeringan & Ayak", dekomposer: "Trichoderma + EM4", campuran: "Feses 70%, Sekam 15%, Dolomit 5%", jadwalBalik: [{ hari: "Hari ke-7", tgl: "2026-08-22", selesai: true, suhu: 58 }], targetKemasan: "125 karung @20kg" },
            { id: "B-POC-01", nama: "POC Urin Domba Plus Bio-Pestisida", tipe: "Pupuk Organik Cair (POC)", kapasitas: 600, satuan: "Liter", tglMulai: "2026-08-20", tglEstimasiSelesai: "2026-09-15", suhuTerkini: 29, status: "Siap Panen & Kemas", dekomposer: "PSB + Molase", campuran: "Urin 500L, Molase 10L, Empon-empon 20kg", jadwalBalik: [{ hari: "Aerasi 1", tgl: "2026-08-27", selesai: true, suhu: 30 }], targetKemasan: "500 botol @1L" }
        ];
        const stokPupuk = [
            { id: "pk-1", nama: "Pupuk Kompos Kohe Domba Halus (Karung 20kg)", tipe: "POP", stok: 145, satuan: "karung", hargaJual: 25000, terjualBulanIni: 85 },
            { id: "pk-2", nama: "Pupuk Organik Cair Urin Domba Plus (Botol 1 Liter)", tipe: "POC", stok: 220, satuan: "botol", hargaJual: 18000, terjualBulanIni: 130 }
        ];
        const keuanganList = [
            { id: "trx-1", tgl: "2026-09-02", tipe: "keluar", kategori: "Pakan Konsentrat", keterangan: "Beli konsentrat 1 ton", nominal: 4200000, metode: "Transfer BPD DIY", user: "Budi Santoso" },
            { id: "trx-2", tgl: "2026-09-05", tipe: "masuk", kategori: "Penjualan Ternak", keterangan: "Penjualan 2 ekor jantan aqiqah", nominal: 6800000, metode: "QRIS BUMDes", user: "Budi Santoso" },
            { id: "trx-3", tgl: "2026-09-08", tipe: "masuk", kategori: "Penjualan Pupuk POP", keterangan: "Penjualan 40 karung kompos", nominal: 1000000, metode: "Tunai", user: "Tri Haryanto" }
        ];

        localStorage.setItem(STORAGE_KEYS.LAHAN, JSON.stringify(lahanList));
        localStorage.setItem(STORAGE_KEYS.STOK_PAKAN, JSON.stringify(stokPakan));
        localStorage.setItem(STORAGE_KEYS.BATCH_LIMBAH, JSON.stringify(batchLimbah));
        localStorage.setItem(STORAGE_KEYS.STOK_PUPUK, JSON.stringify(stokPupuk));
        localStorage.setItem(STORAGE_KEYS.KEUANGAN, JSON.stringify(keuanganList));
    },

    // --- GETTERS & SETTERS LENGKAP ---

    getDomba() {
        const list = this.safeGet(STORAGE_KEYS.DOMBA, []);
        const defaultWarna = ["Kuning", "Hijau", "Merah", "Biru", "Oranye", "Putih"];
        const defaultAsal = [
            "Pasar Hewan Imogiri",
            "Peternak Rakyat Kalurahan Pleret",
            "BPTU HPT Pelaihari",
            "Mitra Kelompok Ternak Mataram",
            "Pasar Hewan Prambanan",
            "Balai Pembibitan Ternak DIY"
        ];
        return list.map((d, idx) => ({
            ...d,
            warnaEartag: d.warnaEartag || defaultWarna[idx % defaultWarna.length],
            asalTernak: d.asalTernak || defaultAsal[idx % defaultAsal.length]
        }));
    },
    saveDomba(l) { localStorage.setItem(STORAGE_KEYS.DOMBA, JSON.stringify(l)); this.triggerAutoSync(); },
    addDomba(d) { const l = this.getDomba(); l.unshift(d); this.saveDomba(l); this.addLog(`Tambah domba: ${d.eartag} (${d.nama})`); },
    updateDomba(id, f) { const l = this.getDomba(); const i = l.findIndex(d => d.id === id); if (i>=0) { l[i] = {...l[i], ...f}; this.saveDomba(l); } },
    deleteDomba(id) { const l = this.getDomba().filter(d => d.id !== id); this.saveDomba(l); },

    // Batches Penggemukan
    getBatchesPenggemukan() { return this.safeGet(STORAGE_KEYS.BATCHES_PENGGEMUKAN, []); },
    saveBatchesPenggemukan(b) { localStorage.setItem(STORAGE_KEYS.BATCHES_PENGGEMUKAN, JSON.stringify(b)); this.triggerAutoSync(); },
    addBatch(b) { const l = this.getBatchesPenggemukan(); l.unshift(b); this.saveBatchesPenggemukan(l); this.addLog(`Tambah batch: ${b.nama}`); },
    updateBatch(id, f) { const l = this.getBatchesPenggemukan(); const i = l.findIndex(b => b.id === id); if (i>=0) { l[i] = {...l[i], ...f}; this.saveBatchesPenggemukan(l); this.addLog(`Update batch: ${l[i].nama}`); } },
    deleteBatch(id) { const l = this.getBatchesPenggemukan().filter(b => b.id !== id); this.saveBatchesPenggemukan(l); this.addLog(`Hapus batch: ${id}`); },

    // Master Kandang
    getMasterKandang() { return this.safeGet(STORAGE_KEYS.MASTER_KANDANG, []); },
    saveMasterKandang(k) { localStorage.setItem(STORAGE_KEYS.MASTER_KANDANG, JSON.stringify(k)); this.triggerAutoSync(); },
    addMasterKandang(k) { const l = this.getMasterKandang(); l.push(k); this.saveMasterKandang(l); this.addLog(`Tambah kandang: ${k.nama}`); },
    updateMasterKandang(id, f) { const l = this.getMasterKandang(); const i = l.findIndex(k => k.id === id); if (i>=0) { l[i] = {...l[i], ...f}; this.saveMasterKandang(l); this.addLog(`Update kandang: ${l[i].nama}`); } },
    deleteMasterKandang(id) { const l = this.getMasterKandang().filter(k => k.id !== id); this.saveMasterKandang(l); this.addLog(`Hapus kandang: ${id}`); },

    // --- MANAJEMEN SEKAT & KOLONI KANDANG ---
    addSekatToKandang(kandangId, sekatData) {
        const kandangList = this.getMasterKandang();
        const k = kandangList.find(item => item.id === kandangId);
        if (!k) return null;
        if (!Array.isArray(k.sekatList)) k.sekatList = [];
        
        const newSekat = {
            nomor: (sekatData.nomor || `Sekat 0${k.sekatList.length + 1}`).trim(),
            kapasitas: Math.max(1, parseInt(sekatData.kapasitas) || 4),
            terisi: 0,
            eartags: []
        };
        k.sekatList.push(newSekat);
        // Otomatis sinkronkan kapasitas maksimal kandang
        k.kapasitasMaks = k.sekatList.reduce((sum, s) => sum + (s.kapasitas || 0), 0);
        this.saveMasterKandang(kandangList);
        this.addLog(`Menambah sekat/koloni "${newSekat.nomor}" pada ${k.nama}`);
        this.syncSekatOccupancy();
        return newSekat;
    },

    updateSekatInKandang(kandangId, sekatIndex, sekatData) {
        const kandangList = this.getMasterKandang();
        const k = kandangList.find(item => item.id === kandangId);
        if (!k || !k.sekatList || !k.sekatList[sekatIndex]) return null;

        const oldNomor = k.sekatList[sekatIndex].nomor;
        const newNomor = (sekatData.nomor || oldNomor).trim();
        const newKap = Math.max(1, parseInt(sekatData.kapasitas) || k.sekatList[sekatIndex].kapasitas);

        k.sekatList[sekatIndex].nomor = newNomor;
        k.sekatList[sekatIndex].kapasitas = newKap;

        // Jika nomor/nama sekat diubah, sinkronkan data domba yang berada di sekat tersebut
        if (newNomor !== oldNomor) {
            const dombaList = this.getDomba();
            const kandangKey = (k.nama || '').split('(')[0].trim().toLowerCase();
            let changed = false;
            dombaList.forEach(d => {
                const dKandang = (d.kandang || '').toLowerCase();
                if ((dKandang.includes(kandangKey) || (k.id && dKandang.includes(k.id.toLowerCase()))) && (d.sekat || '').trim() === oldNomor.trim()) {
                    d.sekat = newNomor;
                    changed = true;
                }
            });
            if (changed) this.saveDomba(dombaList);
        }

        k.kapasitasMaks = k.sekatList.reduce((sum, s) => sum + (s.kapasitas || 0), 0);
        this.saveMasterKandang(kandangList);
        this.addLog(`Ubah sekat/koloni "${newNomor}" pada ${k.nama}`);
        this.syncSekatOccupancy();
        return k.sekatList[sekatIndex];
    },

    deleteSekatFromKandang(kandangId, sekatIndex) {
        const kandangList = this.getMasterKandang();
        const k = kandangList.find(item => item.id === kandangId);
        if (!k || !k.sekatList || !k.sekatList[sekatIndex]) return false;

        const removed = k.sekatList[sekatIndex];
        // Lepas alokasi domba yang berada di sekat ini
        const dombaList = this.getDomba();
        const kandangKey = (k.nama || '').split('(')[0].trim().toLowerCase();
        let changed = false;
        dombaList.forEach(d => {
            const dKandang = (d.kandang || '').toLowerCase();
            if ((dKandang.includes(kandangKey) || (k.id && dKandang.includes(k.id.toLowerCase()))) && (d.sekat || '').trim() === (removed.nomor || '').trim()) {
                d.sekat = "Belum Dialokasikan";
                changed = true;
            }
        });
        if (changed) this.saveDomba(dombaList);

        k.sekatList.splice(sekatIndex, 1);
        k.kapasitasMaks = Math.max(0, k.sekatList.reduce((sum, s) => sum + (s.kapasitas || 0), 0));
        this.saveMasterKandang(kandangList);
        this.addLog(`Menghapus sekat/koloni "${removed.nomor}" dari ${k.nama}`);
        this.syncSekatOccupancy();
        return true;
    },

    syncSekatOccupancy() {
        const kandangList = this.safeGet(STORAGE_KEYS.MASTER_KANDANG, []);
        const dombaList = this.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");
        let changed = false;

        kandangList.forEach(k => {
            let totalKandangTerisi = 0;
            const kandangKey = (k.nama || '').split('(')[0].trim().toLowerCase();
            
            if (Array.isArray(k.sekatList)) {
                k.sekatList.forEach(s => {
                    const sheepInSekat = dombaList.filter(d => {
                        const dKandang = (d.kandang || '').toLowerCase();
                        const matchKandang = dKandang.includes(kandangKey) || (k.id && dKandang.includes(k.id.toLowerCase()));
                        const matchSekat = (d.sekat || '').trim().toLowerCase() === (s.nomor || '').trim().toLowerCase();
                        return matchKandang && matchSekat;
                    });
                    const count = sheepInSekat.length;
                    const tags = sheepInSekat.map(d => d.eartag);
                    if (s.terisi !== count || JSON.stringify(s.eartags) !== JSON.stringify(tags)) {
                        s.terisi = count;
                        s.eartags = tags;
                        changed = true;
                    }
                    totalKandangTerisi += count;
                });
            }

            if (k.terisi !== totalKandangTerisi) {
                k.terisi = totalKandangTerisi;
                changed = true;
            }
        });

        if (changed) {
            this.saveMasterKandang(kandangList);
        }
        return kandangList;
    },

    // Log Pakan Harian & Sinkronisasi Stok Gudang
    getLogPakanHarian() { return this.safeGet(STORAGE_KEYS.LOG_PAKAN_HARIAN, []); },
    saveLogPakanHarian(l) { localStorage.setItem(STORAGE_KEYS.LOG_PAKAN_HARIAN, JSON.stringify(l)); this.triggerAutoSync(); },
    addLogPakanHarian(p) {
        const l = this.getLogPakanHarian();
        l.unshift(p);
        this.saveLogPakanHarian(l);
        this.addLog(`Input pakan harian: ${p.kandang} (${p.waktu})`);

        // Sinkronisasi otomatis: kurangi persediaan stok pakan di gudang
        this.deductStokPakanFromLog(p.konsentratKg || 0, p.silaseKg || 0, p.hijauanOdotKg || 0);
    },
    deductStokPakanFromLog(konsentratKg = 0, silaseKg = 0, hijauanKg = 0) {
        const stok = this.getStokPakan();
        let changed = false;

        // 1. Kurangi Konsentrat
        const sKonsentrat = stok.find(s => s.kategori === "Konsentrat" || s.nama.toLowerCase().includes("konsentrat"));
        if (sKonsentrat && konsentratKg > 0) {
            sKonsentrat.stokKg = Math.max(0, Math.round((sKonsentrat.stokKg - konsentratKg) * 10) / 10);
            changed = true;
        }

        // 2. Kurangi Silase
        const sSilase = stok.find(s => s.kategori === "Silase" || s.nama.toLowerCase().includes("silase"));
        if (sSilase && silaseKg > 0) {
            sSilase.stokKg = Math.max(0, Math.round((sSilase.stokKg - silaseKg) * 10) / 10);
            changed = true;
        }

        // 3. Kurangi Hijauan Odot
        const sHijauan = stok.find(s => s.kategori === "Hijauan" || s.nama.toLowerCase().includes("odot") || s.nama.toLowerCase().includes("hijauan"));
        if (sHijauan && hijauanKg > 0) {
            sHijauan.stokKg = Math.max(0, Math.round((sHijauan.stokKg - hijauanKg) * 10) / 10);
            changed = true;
        }

        if (changed) {
            this.saveStokPakan(stok);
        }
    },
    calculateFCR(filterKandang = "all") {
        let logs = this.getLogPakanHarian();
        let dombaList = this.getDomba().filter(d => d.status !== "Mati");

        if (filterKandang !== "all") {
            logs = logs.filter(l => l.kandang === filterKandang);
            dombaList = dombaList.filter(d => d.kandang === filterKandang);
        }

        // Total Pakan Kumulatif (kg)
        let totalPakanKg = 0;
        logs.forEach(l => {
            totalPakanKg += (l.konsentratKg || 0) + (l.silaseKg || 0) + (l.hijauanOdotKg || 0);
        });

        // Total Bobot Gain (kg)
        let totalGainKg = 0;
        dombaList.forEach(d => {
            if (d.riwayatTimbang && d.riwayatTimbang.length > 0) {
                const initW = d.bobotAwal || d.riwayatTimbang[0].bobot;
                const lastW = d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot;
                totalGainKg += Math.max(0, lastW - initW);
            }
        });

        if (totalGainKg <= 0) totalGainKg = Math.max(1, dombaList.length * 6);
        if (totalPakanKg <= 0) totalPakanKg = Math.round(totalGainKg * 6.3);

        const fcr = Math.round((totalPakanKg / totalGainKg) * 10) / 10;
        return {
            fcr,
            totalPakanKg: Math.round(totalPakanKg),
            totalGainKg: Math.round(totalGainKg * 10) / 10,
            status: fcr <= 6.5 ? "Sangat Efisien" : (fcr <= 8.5 ? "Standar Normal" : "Perlu Evaluasi"),
            efisiensiPersen: Math.min(100, Math.round((6.0 / Math.max(1, fcr)) * 100))
        };
    },
    calculateRealtimeHPP() {
        const stok = this.getStokPakan();
        const logs = this.getLogPakanHarian();
        const dombaCount = Math.max(1, this.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual").length);

        const sKons = stok.find(s => s.kategori === "Konsentrat" || s.nama.toLowerCase().includes("konsentrat"));
        const sSil = stok.find(s => s.kategori === "Silase" || s.nama.toLowerCase().includes("silase"));
        const sHij = stok.find(s => s.kategori === "Hijauan" || s.nama.toLowerCase().includes("odot"));

        const biayaKons = sKons ? sKons.biayaPerKg : 4200;
        const biayaSil = sSil ? sSil.biayaPerKg : 1200;
        const biayaHij = sHij ? sHij.biayaPerKg : 400;

        // Rata-rata takaran harian per ekor
        let avgKons = 0.5;
        let avgSil = 1.5;
        let avgHij = 2.5;

        if (logs.length > 0) {
            const sample = logs.slice(0, 10);
            let tk = 0, ts = 0, th = 0;
            sample.forEach(l => {
                tk += l.konsentratKg || 0;
                ts += l.silaseKg || 0;
                th += l.hijauanOdotKg || 0;
            });
            avgKons = (tk / sample.length) / dombaCount;
            avgSil = (ts / sample.length) / dombaCount;
            avgHij = (th / sample.length) / dombaCount;
        }

        const hppPerEkorHari = Math.round((avgKons * biayaKons) + (avgSil * biayaSil) + (avgHij * biayaHij));
        const totalHppHarianKandang = hppPerEkorHari * dombaCount;

        return {
            hppPerEkorHari: Math.max(2500, hppPerEkorHari),
            totalHppHarianKandang,
            estimasiBulanan: totalHppHarianKandang * 30,
            biayaKons,
            biayaSil,
            biayaHij,
            avgKons: Math.round(avgKons * 100) / 100,
            avgSil: Math.round(avgSil * 100) / 100,
            avgHij: Math.round(avgHij * 100) / 100
        };
    },
    updateLogPakanHarian(idOrIdx, data) {
        const l = this.getLogPakanHarian();
        const i = typeof idOrIdx === 'number' ? idOrIdx : l.findIndex(p => p.id === idOrIdx);
        if (i >= 0 && i < l.length) {
            l[i] = { ...l[i], ...data };
            this.saveLogPakanHarian(l);
            this.addLog("Update catatan pakan harian");
            return true;
        }
        return false;
    },
    deleteLogPakanHarian(idOrIdx) {
        let l = this.getLogPakanHarian();
        if (typeof idOrIdx === 'string') {
            l = l.filter(p => p.id !== idOrIdx);
        } else if (typeof idOrIdx === 'number' && idOrIdx >= 0 && idOrIdx < l.length) {
            l.splice(idOrIdx, 1);
        }
        this.saveLogPakanHarian(l);
        this.addLog("Hapus catatan pakan harian");
        return true;
    },

    // Stok Pakan
    getStokPakan() { return this.safeGet(STORAGE_KEYS.STOK_PAKAN, []); },
    saveStokPakan(s) { localStorage.setItem(STORAGE_KEYS.STOK_PAKAN, JSON.stringify(s)); this.triggerAutoSync(); },
    addStokPakan(s) { const l = this.getStokPakan(); l.push(s); this.saveStokPakan(l); this.addLog(`Tambah bahan pakan: ${s.nama}`); },
    updateStokPakan(id, f) { const l = this.getStokPakan(); const i = l.findIndex(s => s.id === id); if (i>=0) { l[i] = {...l[i], ...f}; this.saveStokPakan(l); this.addLog(`Update bahan pakan: ${l[i].nama}`); } },
    deleteStokPakan(id) { const l = this.getStokPakan().filter(s => s.id !== id); this.saveStokPakan(l); this.addLog(`Hapus bahan pakan: ${id}`); },

    // Preset Vaksin
    getPresetVaksin() { return this.safeGet(STORAGE_KEYS.PRESET_VAKSIN, []); },
    savePresetVaksin(v) { localStorage.setItem(STORAGE_KEYS.PRESET_VAKSIN, JSON.stringify(v)); this.triggerAutoSync(); },

    // Gaji Operasional
    getGajiOperasional() { return this.safeGet(STORAGE_KEYS.GAJI_OPERASIONAL, []); },
    addGajiOperasional(g) { const l = this.getGajiOperasional(); l.unshift(g); localStorage.setItem(STORAGE_KEYS.GAJI_OPERASIONAL, JSON.stringify(l)); this.triggerAutoSync(); this.addLog(`Input penggajian: ${g.sdmNama || 'Staf'}`); },
    updateGajiOperasional(id, fields) {
        const l = this.getGajiOperasional();
        const i = l.findIndex(g => g.id === id);
        if (i >= 0) {
            l[i] = { ...l[i], ...fields };
            localStorage.setItem(STORAGE_KEYS.GAJI_OPERASIONAL, JSON.stringify(l));
            this.triggerAutoSync();
            this.addLog(`Update gaji staf: ${l[i].sdmNama}`);
            return true;
        }
        return false;
    },
    deleteGajiOperasional(id) {
        const l = this.getGajiOperasional().filter(g => g.id !== id);
        localStorage.setItem(STORAGE_KEYS.GAJI_OPERASIONAL, JSON.stringify(l));
        this.triggerAutoSync();
        this.addLog(`Hapus slip/catatan gaji: ${id}`);
        return true;
    },

    // DSS & PADes
    getDSSPADes() { return this.safeGet(STORAGE_KEYS.DSS_PADES, {}); },

    // Riwayat Timbang Cepat & ADG
    addRiwayatTimbang(dombaId, tgl, bobotBaru, catatan) {
        const list = this.getDomba();
        const d = list.find(item => item.id === dombaId || item.eartag === dombaId);
        if (!d) return null;

        if (!d.riwayatTimbang) d.riwayatTimbang = [];
        const prevTimbang = d.riwayatTimbang.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1] : { tgl: d.tglMasuk, bobot: d.bobotAwal };

        const d1 = new Date(prevTimbang.tgl);
        const d2 = new Date(tgl);
        const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
        const diffWeightKg = bobotBaru - prevTimbang.bobot;
        const adgGramPerHari = Math.round((diffWeightKg * 1000) / diffDays);

        d.riwayatTimbang.push({ tgl, bobot: parseFloat(bobotBaru), catatan });
        d.adg = adgGramPerHari;
        this.saveDomba(list);
        this.addLog(`Timbang ${d.eartag}: ${bobotBaru} kg (ADG: ${adgGramPerHari} g/hari)`);
        return { domba: d, adg: adgGramPerHari, diffWeightKg };
    },

    addRekamMedis(dombaId, record) {
        const list = this.getDomba();
        const d = list.find(item => item.id === dombaId || item.eartag === dombaId);
        if (!d) return false;
        if (!d.rekamMedis) d.rekamMedis = [];
        if (!record.id) record.id = "med-" + Date.now();
        d.rekamMedis.unshift(record);
        this.saveDomba(list);
        this.addLog(`Catat rekam medis ${d.eartag}: ${record.diagnosa}`);
        return true;
    },

    updateRekamMedis(dombaId, medisId, data) {
        const list = this.getDomba();
        const d = list.find(item => item.id === dombaId || item.eartag === dombaId);
        if (!d || !d.rekamMedis) return false;
        let i = d.rekamMedis.findIndex(m => m.id === medisId);
        if (i < 0 && typeof medisId === 'number') i = medisId;
        if (i >= 0 && i < d.rekamMedis.length) {
            d.rekamMedis[i] = { ...d.rekamMedis[i], ...data };
            this.saveDomba(list);
            this.addLog(`Update rekam medis ${d.eartag}: ${data.diagnosa || d.rekamMedis[i].diagnosa}`);
            return true;
        }
        return false;
    },

    deleteRekamMedis(dombaId, medisId) {
        const list = this.getDomba();
        const d = list.find(item => item.id === dombaId || item.eartag === dombaId);
        if (!d || !d.rekamMedis) return false;
        d.rekamMedis = d.rekamMedis.filter((m, idx) => m.id !== medisId && idx !== medisId);
        this.saveDomba(list);
        this.addLog(`Hapus rekam medis dari ${d.eartag}`);
        return true;
    },

    // Default Seed Helpers
    defaultSDMList() {
        return [
            {
                id: "sdm-1",
                nama: "H. Supardi, S.Pt.",
                jabatan: "Direktur Utama BUMKal LPM Pleret",
                unit: "Direksi & Manajemen Strategis",
                status: "Direksi",
                nik: "3402011504780002",
                noHp: "081223344551",
                pendidikan: "S1 Peternakan UGM",
                catatan: "Penanggung jawab operasional kandang & kemitraan strategis kalurahan.",
                tglBergabung: "2023-01-10",
                role: "direksi",
                password: "admin123",
                foto: ""
            },
            {
                id: "sdm-2",
                nama: "Wahyu Pratama, A.Md.",
                jabatan: "Kepala Kandang & Paramedik Veteriner",
                unit: "Divisi Pemeliharaan Ternak",
                status: "Anak Kandang",
                nik: "3402012008920005",
                noHp: "081398765432",
                pendidikan: "D3 Kesehatan Hewan",
                catatan: "Monitoring kesehatan harian, rekam medis, dan formulasi ransum pakan.",
                tglBergabung: "2023-02-01",
                role: "anak_kandang",
                password: "wahyu123",
                foto: ""
            },
            {
                id: "sdm-3",
                nama: "Tri Haryanto",
                jabatan: "Staf Operasional Pakan & Kasir",
                unit: "Divisi Logistik & Administrasi",
                status: "Anak Kandang",
                nik: "3402011211950003",
                noHp: "081567890123",
                pendidikan: "SMK Peternakan",
                catatan: "Penerimaan pakan konsentrat, distribusi ransum, dan pembukuan kas harian.",
                tglBergabung: "2023-03-15",
                role: "anak_kandang",
                password: "tri123",
                foto: ""
            },
            {
                id: "sdm-4",
                nama: "Anjar Wibowo",
                jabatan: "Kepala Unit Pengolahan Limbah & Pupuk",
                unit: "Divisi Sirkular Pupuk Organik",
                status: "Anak Kandang",
                nik: "3402010905900004",
                noHp: "081789012345",
                pendidikan: "SMA / Sertifikasi Kompos",
                catatan: "Koordinator fermentasi POP & POC urin domba terstandar dinas.",
                tglBergabung: "2023-04-01",
                role: "anak_kandang",
                password: "anjar123",
                foto: ""
            },
            {
                id: "sdm-5",
                nama: "Drs. Taufiq Ridwan",
                jabatan: "Lurah Kalurahan Pleret / Dewan Pengawas",
                unit: "Pemerintah Kalurahan Pleret",
                status: "Pemerintah",
                nik: "3402010101680001",
                noHp: "081122334455",
                pendidikan: "S1 Ilmu Pemerintahan",
                catatan: "Pengawas perwakilan masyarakat dan perwakilan pemegang saham kalurahan.",
                tglBergabung: "2022-12-01",
                role: "pemerintah",
                password: "lurah123",
                foto: ""
            }
        ];
    },

    defaultAgendasList() {
        return [
            {
                id: "agn-1",
                judul: "Musyawarah Laporan Pertanggungjawaban Kuartal III & Rencana Qurban 2027",
                kategori: "Musyawarah Kalurahan",
                status: "selesai",
                tgl: "2026-08-30",
                jamMulai: "09:00",
                jamSelesai: "12:00",
                tempat: "Pendopo Kalurahan Pleret",
                penanggungJawab: "H. Supardi, S.Pt.",
                peserta: "Lurah Pleret, Carik, BPKal, Direksi BUMKal, Tokoh Masyarakat (25 Orang)",
                notulensi: "Pemaparan realisasi PADes dari sektor peternakan mencapai 52.8% dari target. Evaluasi harga jual pupuk kompos kohe disepakati Rp 25.000/karung.",
                tindakLanjut: "Pelunasan bagi hasil PADes tahap kedua sebelum November 2026."
            },
            {
                id: "agn-2",
                judul: "Sosialisasi Pemanfaatan Pupuk Organik Kohe pada Gapoktan Pleret",
                kategori: "Penyuluhan & Kemitraan",
                status: "akan datang",
                tgl: "2026-09-25",
                jamMulai: "13:30",
                jamSelesai: "16:00",
                tempat: "Balai RW Kedaton Pleret",
                penanggungJawab: "Anjar Wibowo",
                peserta: "30 Petani anggota Gapoktan binaan BUMKal",
                notulensi: "Agenda demonstrasi aplikasi POC Urin domba untuk tanaman padi dan cabai ramah lingkungan.",
                tindakLanjut: "Siapkan 50 botol sampel POC gratis untuk demplot petani."
            }
        ];
    },

    defaultTasksList() {
        return [
            {
                id: "tsk-1",
                judul: "Formulasi Ransum Pakan Silase + Mineral Blok",
                unit: "Kandang",
                status: "done",
                priority: "high",
                assigneeNama: "Wahyu Pratama",
                tglDeadline: "2026-09-14",
                deskripsi: "Pencampuran 500kg silase tebon jagung dengan 50kg konsentrat PK16 dan 5kg premix mineral.",
                checklist: [
                    { teks: "Timbang silase tebon jagung 500kg", done: true },
                    { teks: "Campur konsentrat & premix mineral secara homogen", done: true },
                    { teks: "Uji aroma fermentasi harum asam segar", done: true }
                ]
            },
            {
                id: "tsk-2",
                judul: "Pemberian Booster Vaksin PMK & Vitamin Dorper Batch A",
                unit: "Kandang",
                status: "in_progress",
                priority: "urgent",
                assigneeNama: "Wahyu Pratama",
                tglDeadline: "2026-09-15",
                deskripsi: "Penyuntikan booster vaksinasi PMK dosis 2ml SC dan B-Complex 3ml IM untuk 6 ekor domba di Kandang A.",
                checklist: [
                    { teks: "Siapkan vaksin PMK suhu 2-8°C cold chain", done: true },
                    { teks: "Injeksi 6 ekor domba di Kandang A", done: true },
                    { teks: "Catat nomor batch vaksin di kartu rekam medis", done: false }
                ]
            },
            {
                id: "tsk-3",
                judul: "Pembalikan Tumpukan Kompos Batch POP-01 (Hari ke-14)",
                unit: "Pengolahan Pupuk",
                status: "todo",
                priority: "high",
                assigneeNama: "Anjar Wibowo",
                tglDeadline: "2026-09-16",
                deskripsi: "Pembalikan aerasi kompos kohe halus dan pengecekan kelembaban 50-60%.",
                checklist: [
                    { teks: "Ukur suhu inti tumpukan kompos (target 45-55°C)", done: false },
                    { teks: "Balik tumpukan menggunakan sekop mesin", done: false },
                    { teks: "Siram larutan dekomposer EM4 jika terlalu kering", done: false }
                ]
            },
            {
                id: "tsk-4",
                judul: "Pemanenan Kebun HPT Rumput Odot Blok Selatan",
                unit: "Pertanian HPT",
                status: "todo",
                priority: "normal",
                assigneeNama: "Tri Haryanto",
                tglDeadline: "2026-09-18",
                deskripsi: "Panen pangkas rumput odot seluas 1.000 m2 untuk bahan chopper segar harian.",
                checklist: [
                    { teks: "Potong mepet tanah sisa 5cm dari pangkal", done: false },
                    { teks: "Angkut ke gudang chopper kandang", done: false }
                ]
            },
            {
                id: "tsk-5",
                judul: "Rekonsiliasi Kas Mingguan & Penagihan Mitra BUMKal",
                unit: "Keuangan & Niaga",
                status: "review",
                priority: "normal",
                assigneeNama: "Tri Haryanto",
                tglDeadline: "2026-09-15",
                deskripsi: "Pencocokan mutasi QRIS penjualan pupuk dan pelunasan uang muka 2 ekor domba kurban.",
                checklist: [
                    { teks: "Cetak mutasi rekening kas BPD DIY", done: true },
                    { teks: "Cocokkan kuitansi kasir dengan buku kas digital", done: true },
                    { teks: "Verifikasi tanda tangan Direktur BUMKal", done: false }
                ]
            }
        ];
    },

    // Getter lainnya
    getLahan() { return this.safeGet(STORAGE_KEYS.LAHAN, []); },
    saveLahan(l) { localStorage.setItem(STORAGE_KEYS.LAHAN, JSON.stringify(l)); this.triggerAutoSync(); },
    getStokPakan() { return this.safeGet(STORAGE_KEYS.STOK_PAKAN, []); },
    saveStokPakan(s) { localStorage.setItem(STORAGE_KEYS.STOK_PAKAN, JSON.stringify(s)); this.triggerAutoSync(); },
    getKoheHarian() { return this.safeGet(STORAGE_KEYS.KOHE_HARIAN, []); },
    addKoheHarian(k) { const l = this.getKoheHarian(); l.unshift(k); localStorage.setItem(STORAGE_KEYS.KOHE_HARIAN, JSON.stringify(l)); this.triggerAutoSync(); },
    getBatchLimbah() { return this.safeGet(STORAGE_KEYS.BATCH_LIMBAH, []); },
    saveBatchLimbah(b) { localStorage.setItem(STORAGE_KEYS.BATCH_LIMBAH, JSON.stringify(b)); this.triggerAutoSync(); },
    addBatchLimbah(b) {
        const l = this.getBatchLimbah();
        l.unshift(b);
        this.saveBatchLimbah(l);
        this.addLog(`Membuat batch fermentasi: ${b.nama}`);
    },
    updateBatchLimbah(id, fields) {
        const l = this.getBatchLimbah();
        const i = l.findIndex(b => b.id === id);
        if (i >= 0) {
            l[i] = { ...l[i], ...fields };
            this.saveBatchLimbah(l);
            this.addLog(`Update batch fermentasi: ${l[i].nama}`);
            return true;
        }
        return false;
    },
    deleteBatchLimbah(id) {
        const l = this.getBatchLimbah().filter(b => b.id !== id);
        this.saveBatchLimbah(l);
        this.addLog(`Hapus batch fermentasi: ${id}`);
        return true;
    },
    getStokPupuk() { return this.safeGet(STORAGE_KEYS.STOK_PUPUK, []); },
    saveStokPupuk(p) { localStorage.setItem(STORAGE_KEYS.STOK_PUPUK, JSON.stringify(p)); this.triggerAutoSync(); },
    getTasks() { 
        const t = this.safeGet(STORAGE_KEYS.TASKS, null);
        if (!t || !Array.isArray(t) || t.length === 0) {
            const def = this.defaultTasksList();
            this.saveTasks(def);
            return def;
        }
        return t;
    },
    saveTasks(t) { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(t)); this.triggerAutoSync(); },
    getSDM() { 
        const s = this.safeGet(STORAGE_KEYS.SDM, null);
        let list = s;
        if (!list || !Array.isArray(list) || list.length === 0) {
            list = this.defaultSDMList();
            this.saveSDM(list);
            return list;
        }
        // Pastikan tiap user memiliki role terstandarisasi (direksi, anak_kandang, pemerintah), password, dan foto
        let needSave = false;
        const mapped = list.map(item => {
            let role = item.role;
            if (role === 'direktur') role = 'direksi';
            else if (role === 'petugas' || role === 'kasir') role = 'anak_kandang';
            else if (role === 'lurah') role = 'pemerintah';
            if (!role) role = 'anak_kandang';

            let status = item.status;
            if (role === 'direksi') status = 'Direksi';
            else if (role === 'pemerintah') status = 'Pemerintah';
            else if (role === 'anak_kandang' && (status === 'Karyawan' || !status)) status = 'Anak Kandang';

            const password = item.password || (role === 'direksi' ? 'admin123' : '123456');
            const foto = item.foto || '';

            if (item.role !== role || item.status !== status || !item.password || item.foto === undefined) {
                needSave = true;
            }

            return {
                ...item,
                role,
                status,
                password,
                foto
            };
        });
        if (needSave) {
            this.saveSDM(mapped);
        }
        return mapped;
    },
    saveSDM(s) { localStorage.setItem(STORAGE_KEYS.SDM, JSON.stringify(s)); this.triggerAutoSync(); },
    addSDM(user) {
        const list = this.getSDM();
        if (!user.id) user.id = "sdm-" + Date.now();
        if (!user.password) user.password = "123456";
        list.push(user);
        this.saveSDM(list);
        this.addLog(`Menambahkan akun pengurus baru: ${user.nama} (${user.jabatan})`);
        return user;
    },
    updateSDM(id, fields) {
        const list = this.getSDM();
        const idx = list.findIndex(s => s.id === id);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...fields };
            this.saveSDM(list);
            // Jika yang diupdate adalah akun aktif, perbarui sesi aktif
            const cur = this.getCurrentUser();
            if (cur && cur.id === id) {
                this.setCurrentUser(list[idx]);
            }
            this.addLog(`Memperbarui profil/akun pengurus: ${list[idx].nama}`);
            return true;
        }
        return false;
    },
    deleteSDM(id) {
        const list = this.getSDM();
        if (list.length <= 1) return false; // Minimal 1 akun harus ada
        const filtered = list.filter(s => s.id !== id);
        this.saveSDM(filtered);
        this.addLog(`Menghapus akun pengurus id: ${id}`);
        return true;
    },
    getCurrentUser() { 
        const u = this.safeGet(STORAGE_KEYS.CURRENT_USER, null);
        if (!u || !u.id || !u.nama) {
            const sdm = this.getSDM();
            const def = sdm[0] || { id: "sdm-1", nama: "H. Supardi, S.Pt.", role: "direktur", jabatan: "Direktur Utama BUMKal" };
            this.setCurrentUser(def);
            return def;
        }
        return u;
    },
    setCurrentUser(u) { localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(u)); },
    getAgendas() { 
        const a = this.safeGet(STORAGE_KEYS.AGENDAS, null);
        if (!a || !Array.isArray(a) || a.length === 0) {
            const def = this.defaultAgendasList();
            localStorage.setItem(STORAGE_KEYS.AGENDAS, JSON.stringify(def));
            return def;
        }
        return a;
    },
    saveAgendas(a) { localStorage.setItem(STORAGE_KEYS.AGENDAS, JSON.stringify(a)); this.triggerAutoSync(); },
    addAgenda(a) { const l = this.getAgendas(); l.unshift(a); this.saveAgendas(l); this.addLog(`Buat agenda rapat: ${a.judul}`); },
    updateAgenda(id, f) { const l = this.getAgendas(); const i = l.findIndex(a => a.id === id); if (i>=0) { l[i] = {...l[i], ...f}; this.saveAgendas(l); this.addLog(`Update agenda rapat: ${l[i].judul}`); } },
    deleteAgenda(id) { const l = this.getAgendas().filter(a => a.id !== id); this.saveAgendas(l); this.addLog(`Hapus agenda rapat: ${id}`); },

    getKeuangan() { return this.safeGet(STORAGE_KEYS.KEUANGAN, []); },
    saveKeuangan(l) { localStorage.setItem(STORAGE_KEYS.KEUANGAN, JSON.stringify(l)); this.triggerAutoSync(); },
    addTransaksi(t) { const l = this.getKeuangan(); l.unshift(t); this.saveKeuangan(l); this.addLog(`Tambah kas ${t.tipe}: ${t.keterangan}`); },
    updateTransaksi(id, f) { const l = this.getKeuangan(); const i = l.findIndex(t => t.id === id); if (i>=0) { l[i] = {...l[i], ...f}; this.saveKeuangan(l); this.addLog(`Update transaksi kas: ${l[i].keterangan}`); } },
    deleteTransaksi(id) { const l = this.getKeuangan().filter(t => t.id !== id); this.saveKeuangan(l); this.addLog(`Hapus transaksi kas: ${id}`); },

    getLogs() { return this.safeGet(STORAGE_KEYS.LOGS, []); },
    addLog(aksi) {
        const list = this.getLogs();
        const user = this.getCurrentUser();
        list.unshift({ tgl: new Date().toISOString().replace("T", " ").substring(0, 19), user: user.nama || "Petugas", aksi });
        if (list.length > 150) list.pop();
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(list));
    },
    getTheme() { return localStorage.getItem(STORAGE_KEYS.THEME) || "light"; },
    setTheme(t) { localStorage.setItem(STORAGE_KEYS.THEME, t); },

    // --- MASTER PENGATURAN SISTEM LENGKAP ---
    defaultPengaturan() {
        return {
            // 1. Identitas Lembaga & Kop Surat
            namaLembaga: "BUMKal LPM (Lumbung Pangan Mataram)",
            singkatanLembaga: "BUMKal LPM Pleret",
            namaPemerintahDesa: "Pemerintah Kalurahan Pleret",
            kapanewonKabupaten: "Kapanewon Pleret, Kabupaten Bantul, D.I. Yogyakarta",
            alamatSekretariat: "Kompleks Kedaton Kulon, Kalurahan Pleret, Kapanewon Pleret, Kabupaten Bantul, D.I. Yogyakarta 55791",
            kontakTelepon: "(0274) 441234",
            nomorWhatsApp: "6281223344551",
            emailResmi: "bumdes.lpm@pleret.desa.id",
            websiteResmi: "https://lumbungternak.pleret.id",
            noSKKemendesa: "AHU-01284.AH.02.01.TAHUN 2022",
            noSKLurah: "188.45/04/PLT/2021",
            unitUsahaUtama: "Penggemukan Domba & Pupuk Organik",
            alamatKandang: "Kedaton Kulon, Pleret, Bantul",
            namaDirektur: "H. Supardi, S.Pt.",
            nikDirektur: "3402011504780002",
            jabatanDirektur: "Direktur Utama BUMKal",

            namaSekretaris: "Rina Astuti, S.E.",
            nikSekretaris: "3402015206890001",
            jabatanSekretaris: "Sekretaris BUMKal",

            namaBendahara: "Siti Rahmawati, S.Ak.",
            nikBendahara: "3402016408920003",
            jabatanBendahara: "Bendahara BUMKal",

            penasihatLembaga: "Drs. Taufiq Ridwan (Lurah Pleret)",
            namaLurah: "Drs. Taufiq Ridwan",
            nipLurah: "196801011992031005",
            jabatanLurah: "Penasihat / Lurah Pleret",

            namaManajerKandang: "Budi Santoso",
            nikManajerKandang: "3402012003880005",
            jabatanManajerKandang: "Manajer Pemeliharaan & Fattening",

            namaParamedik: "drh. Wahid Hasyim",
            nikParamedik: "SIP-VET/3402/2023/04",
            jabatanParamedik: "Paramedik Veteriner & Medis",

            namaKoordinatorLimbah: "Tri Haryanto",
            nikKoordinatorLimbah: "3402011108900004",
            jabatanKoordinatorLimbah: "Koordinator Pengolahan Limbah Kohe",

            rekeningOperasional: "BPD DIY (008.211.009871)",
            dukunganPendanaan: "BKK Dana Keistimewaan DIY",
            logoUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=120&q=80",
            kopSuratUrl: "",
            modeKopSurat: "teks", // "teks" (Format Resmi Teks + Logo) | "gambar" (Gambar Banner Kop Utuh)
            catatanKakiKop: "Mewujudkan Ketahanan Pangan Nabati & Hewani Berbasis Ekonomi Sirkular Berkelanjutan",

            // 2. Parameter Operasional & Valuasi Finansial
            hargaDagingHidupPerKg: 75000,
            multiplierPejantan: 1.35,
            multiplierBunting: 1.25,
            targetSetoranPADes: 35000000,
            tahunAnggaran: 2026,
            biayaPakanHarianPerEkor: 7800,
            safetyStockPakanKg: 300,
            targetADGMinimumGram: 150,

            // 3. Tampilan Portal Publik
            portalHeroJudul: "Lumbung Ternak Terpadu Kalurahan Pleret",
            portalHeroSlogan: "Sistem Peternakan Domba Modern, Pertanian Hijauan Pakan & Pengolahan Pupuk Organik Kohe Berbasis Circular Economy",
            portalAnnouncement: "Program Penggemukan Domba Kurban 2027 & Pemesanan Pupuk Kompos Organik Kohe Resmi Dibuka!",
            showAnnouncement: true,
            showLiveStats: true,
            showKatalogDomba: true,
            showCekEartag: true,
            showKatalogPupuk: true,
            showDiagramSirkular: true,

            // 4. Katalog Produk Niaga Default
            produkPupukList: [
                { id: "pk-1", nama: "Pupuk Kompos Kohe Domba Halus (Karung 20kg)", tipe: "POP", harga: 25000, satuan: "karung", beratKg: 20, deskripsi: "Pupuk Organik Padat fermentasi EM4 & Trichoderma, bebas gulma dan kaya hara mikro.", foto: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=500&q=80" },
                { id: "pk-2", nama: "Pupuk Organik Cair Urin Domba Plus (Botol 1 Liter)", tipe: "POC", harga: 18000, satuan: "botol", beratKg: 1, deskripsi: "POC urin fermentasi bio-pestisida + molase, sumber N organik untuk percepat vegetatif tanaman.", foto: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80" },
                { id: "pk-3", nama: "Kompos Kohe Matang Curah (Pick-up / Bak)", tipe: "POP Curah", harga: 350000, satuan: "bak pick-up", beratKg: 800, deskripsi: "Kompos kohe matang siap sebar untuk lahan hortikultura dan bank pakan HPT rumput odot.", foto: "https://images.unsplash.com/photo-1592417817098-8f3d69102283?auto=format&fit=crop&w=500&q=80" }
            ],

            // 5. Alur Sirkular Farming & SOP
            sirkularSubjudul: "Integrated Circular Agriculture",
            sirkularJudul: "Siklus Tertutup Tanpa Sampah (Zero Waste)",
            sirkularDeskripsi: "Bank Pakan HPT menghasilkan nutrisi hijauan segar & silase untuk domba. Limbah kohe dan urin dialirkan ke instalasi pupuk organik yang kembali menyuburkan lahan.",
            rantaiSirkular: [
                { no: 1, judul: "Pengumpulan Limbah Kohe", deskripsi: "Feses padat (250 kg/hari) dan urin cair (120 L/hari) dialirkan dari kandang panggung ke instalasi penampungan." },
                { no: 2, judul: "Fermentasi & Dekomposisi", deskripsi: "Pengomposan POP aerobik 21 hari suhu 55°C dan aerasi drum POC anaerobik bio-pestisida." },
                { no: 3, judul: "Aplikasi ke Kebun HPT", deskripsi: "Pupuk organik menyuburkan 4.300 m2 kebun Rumput Odot & Legum Indigofera Kedaton secara zero chemical." },
                { no: 4, judul: "Produksi Pakan & Kenaikan Bobot", deskripsi: "Hijauan segar dipanen untuk silase pakan domba, menghasilkan ADG prima (>200 g/hari)." }
            ],
            sopPemberianPakan: "Pagi: Pukul 07.30 (Silase + Konsentrat) | Sore: Pukul 15.30 (Hijauan Segar + Mineral Blok)",

            // 6. Preferensi Format Ekspor / Impor
            exportDelimiter: ";", // ";" (Semicolon - Standar Excel Windows Indonesia) atau "," (Comma)
            exportDefaultFormat: "excel", // "excel" (.xls) atau "csv" (.csv)
            includeBOM: true,

            // 7. Master Jenis / Ras Ternak (Kambing & Domba)
            rasTernakList: [
                { id: "ras-1", nama: "Dorper Cross", jenis: "Domba", asal: "Afrika Selatan / Australia", targetAdg: 220, deskripsi: "Pertumbuhan daging sangat cepat, efisiensi pakan tinggi, karkas padat" },
                { id: "ras-2", nama: "Garut Tangkas", jenis: "Domba", asal: "Jawa Barat", targetAdg: 180, deskripsi: "Struktur tanduk kokoh, postur kekar, daya adaptasi iklim tropis prima" },
                { id: "ras-3", nama: "Texel Wonosobo", jenis: "Domba", asal: "Wonosobo (Diatas 1000 mdpl)", targetAdg: 210, deskripsi: "Bulu tebal wol, perototan paha & dada padat, karkas tinggi >50%" },
                { id: "ras-4", nama: "Merino", jenis: "Domba", asal: "Spanyol / Australia", targetAdg: 190, deskripsi: "Penghasil wol berkualitas dan daging karkas empuk" },
                { id: "ras-5", nama: "Morada Cross", jenis: "Domba", asal: "Tropis Brasil / Karibia", targetAdg: 175, deskripsi: "Tahan iklim panas lembab, daya tahan parasit dan penyakit tinggi" },
                { id: "ras-6", nama: "Lokal Ekor Gemuk (DEG)", jenis: "Domba", asal: "Jawa Timur / Madura", targetAdg: 150, deskripsi: "Menyimpan cadangan lemak pada ekor, sangat toleran ransum hijauan kering" },
                { id: "ras-7", nama: "Lokal Ekor Tipis (DET)", jenis: "Domba", asal: "Jawa Tengah / DIY", targetAdg: 140, deskripsi: "Sifat prolifik tinggi (sering beranak kembar 2-3), lincah dan tahan cuaca" },
                { id: "ras-8", nama: "Kambing Boer / Boerka", jenis: "Kambing", asal: "Afrika Selatan", targetAdg: 200, deskripsi: "Kambing pedaging nomor satu dunia, rasio konversi pakan sangat efisien" },
                { id: "ras-9", nama: "Kambing Peranakan Etawa (PE)", jenis: "Kambing", asal: "Kaligesing / Yogyakarta", targetAdg: 160, deskripsi: "Tipe dwiguna (pedaging & perah susu), postur tinggi besar dengan telinga panjang terkulai" },
                { id: "ras-10", nama: "Kambing Jawarandu / Bligon", jenis: "Kambing", asal: "Jawa Tengah / DIY", targetAdg: 140, deskripsi: "Persilangan Kacang & PE, tahan pakan kasar, sangat adaptif untuk peternak rakyat" },
                { id: "ras-11", nama: "Kambing Saanen", jenis: "Kambing", asal: "Lembah Saanen Swiss", targetAdg: 150, deskripsi: "Kambing perah unggul penghasil susu melimpah, warna putih krem bersih" }
            ]
        };
    },

    getPengaturan() {
        const p = this.safeGet(STORAGE_KEYS.PENGATURAN_SISTEM, null);
        if (!p || typeof p !== "object" || !p.namaLembaga) {
            const def = this.defaultPengaturan();
            this.savePengaturan(def);
            return def;
        }
        return { ...this.defaultPengaturan(), ...p };
    },

    savePengaturan(cfg) {
        localStorage.setItem(STORAGE_KEYS.PENGATURAN_SISTEM, JSON.stringify(cfg));
        this.addLog("Memperbarui Master Pengaturan Sistem BUMKal");
        this.triggerAutoSync();
    },

    resetPengaturan() {
        const def = this.defaultPengaturan();
        this.savePengaturan(def);
        return def;
    },

    // Master Ras Ternak Helpers
    getRasTernak() {
        const cfg = this.getPengaturan();
        if (!cfg.rasTernakList || !Array.isArray(cfg.rasTernakList) || cfg.rasTernakList.length === 0) {
            return this.defaultPengaturan().rasTernakList;
        }
        return cfg.rasTernakList;
    },

    saveRasTernak(list) {
        const cfg = this.getPengaturan();
        cfg.rasTernakList = list;
        this.savePengaturan(cfg);
    },

    addRasTernak(item) {
        const list = this.getRasTernak();
        if (!item.id) item.id = "ras-" + Date.now();
        list.push(item);
        this.saveRasTernak(list);
        this.addLog(`Menambah jenis/ras ternak: ${item.nama} (${item.jenis})`);
    },

    updateRasTernak(id, fields) {
        const list = this.getRasTernak();
        const i = list.findIndex(r => r.id === id);
        if (i >= 0) {
            list[i] = { ...list[i], ...fields };
            this.saveRasTernak(list);
            this.addLog(`Update jenis/ras ternak: ${list[i].nama}`);
            return true;
        }
        return false;
    },

    deleteRasTernak(id) {
        const list = this.getRasTernak().filter(r => r.id !== id);
        this.saveRasTernak(list);
        this.addLog(`Hapus jenis/ras ternak: ${id}`);
        return true;
    },

    // Valuasi Aset Biologis
    hitungValuasiAsetBiologis() {
        const list = this.getDomba();
        const cfg = this.getPengaturan();
        const hargaDagingHidupPerKg = cfg.hargaDagingHidupPerKg || 75000;
        const mulJantan = cfg.multiplierPejantan || 1.35;
        const mulBunting = cfg.multiplierBunting || 1.25;
        let totalBobotKg = 0;
        let totalValuasi = 0;

        list.forEach(d => {
            if (d.status !== "Mati" && d.status !== "Terjual") {
                const w = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                totalBobotKg += w;
                let mul = d.kategori === "Pejantan" ? mulJantan : d.status === "Bunting" ? mulBunting : 1.0;
                totalValuasi += (w * hargaDagingHidupPerKg * mul);
            }
        });

        return {
            totalPopulasiAktif: list.filter(d => d.status !== "Mati" && d.status !== "Terjual").length,
            totalBobotKg: Math.round(totalBobotKg * 10) / 10,
            totalValuasiRupiah: Math.round(totalValuasi)
        };
    },

    getKopSuratHtml() {
        const cfg = this.getPengaturan();
        if (cfg.modeKopSurat === "gambar" && cfg.kopSuratUrl) {
            return `
                <div class="kop-banner" style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 10px;">
                    <img src="${cfg.kopSuratUrl}" alt="Kop Surat Resmi" style="max-width: 100%; width: 100%; max-height: 140px; object-fit: contain; display: block; margin: 0 auto;">
                </div>
            `;
        }

        const logoHtml = cfg.logoUrl ? `
            <img src="${cfg.logoUrl}" alt="Logo Lembaga" style="width: 70px; height: 70px; object-fit: contain; border-radius: 8px; flex-shrink: 0;">
        ` : '';

        return `
            <div class="kop" style="text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 25px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 6px;">
                    ${logoHtml}
                    <div style="text-align: center;">
                        <h3 style="margin: 0; font-size: 13px; font-weight: normal; text-transform: uppercase; letter-spacing: 0.5px;">${cfg.kapanewonKabupaten || 'Kapanewon Pleret, Kabupaten Bantul'}</h3>
                        <h2 style="margin: 2px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${cfg.namaPemerintahDesa || 'Pemerintah Kalurahan Pleret'}</h2>
                        <h2 style="margin: 2px 0; font-size: 17px; font-weight: 900; text-transform: uppercase; color: #047857; letter-spacing: 0.8px;">${cfg.namaLembaga || 'BUMKal LPM Lumbung Pangan Mataram'}</h2>
                    </div>
                    ${logoHtml ? `<div style="width: 70px; height: 70px; flex-shrink: 0; visibility: hidden;"></div>` : ''}
                </div>
                <p style="margin: 0; font-size: 11px; font-style: italic; color: #333;">${cfg.alamatSekretariat || ''} • Telp: ${cfg.kontakTelepon || '-'} • WA: ${cfg.nomorWhatsApp || '-'}</p>
                <div style="margin-top: 3px; font-size: 10px; font-family: monospace; color: #555;">No. Registrasi Kemendesa: ${cfg.noSKKemendesa || '-'} • SK Lurah: ${cfg.noSKLurah || '-'}</div>
            </div>
        `;
    },

    exportAll() {
        const state = {};
        for (const [k, keyName] of Object.entries(STORAGE_KEYS)) {
            state[keyName] = localStorage.getItem(keyName);
        }
        return { version: "2.5.0", exportedAt: new Date().toISOString(), data: state };
    },

    importAll(backup) {
        if (!backup) return false;
        const target = backup.data || backup;
        let count = 0;
        for (const [keyName, value] of Object.entries(target)) {
            if (value !== null && value !== undefined && typeof keyName === "string" && keyName.startsWith("kandang_")) {
                const strVal = typeof value === "object" ? JSON.stringify(value) : String(value);
                localStorage.setItem(keyName, strVal);
                count++;
            }
        }
        return count > 0;
    },

    // --- GOOGLE FIREBASE REAL-TIME CLOUD SYNC ---
    getFirebaseConfig() {
        const defaultCfg = {
            apiKey: "AIzaSyAyKnOhVNwBMyvONO1XnxQiEaMWjSBMEt0",
            authDomain: "lumbung-ternak-pleret.firebaseapp.com",
            projectId: "lumbung-ternak-pleret",
            storageBucket: "lumbung-ternak-pleret.firebasestorage.app",
            messagingSenderId: "391388852079",
            appId: "1:391388852079:web:f359227d58353c063f029a",
            databaseURL: "https://lumbung-ternak-pleret-default-rtdb.asia-southeast1.firebasedatabase.app",
            collectionName: "lumbung_ternak_pleret",
            autoSync: true,
            lastSyncTime: null,
            status: "connected"
        };
        const saved = this.safeGet(STORAGE_KEYS.FIREBASE_CONFIG, null);
        if (!saved || !saved.apiKey || saved.apiKey.trim() === "") {
            this.saveFirebaseConfig(defaultCfg);
            return defaultCfg;
        }
        return saved;
    },

    saveFirebaseConfig(cfg) {
        localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(cfg));
    },

    _isReadyForAutoPush: false,
    _autoSyncTimer: null,
    triggerAutoSync(immediate = false) {
        if (!this._isReadyForAutoPush) {
            console.log("[AutoSync] Diabaikan: Inisialisasi cloud belum selesai.");
            return;
        }
        const cfg = this.getFirebaseConfig();
        if (!cfg.autoSync) return;
        if (this._autoSyncTimer) clearTimeout(this._autoSyncTimer);
        
        const executePush = () => {
            if (this.syncToFirebase) {
                this.syncToFirebase().catch(e => console.warn("[AutoSync] Push notice:", e));
            }
        };

        if (immediate) {
            executePush();
        } else {
            this._autoSyncTimer = setTimeout(executePush, 1200);
        }
    },

    async syncToFirebase() {
        const cfg = this.getFirebaseConfig();
        const payload = this.exportAll();
        cfg.status = "syncing";
        this.saveFirebaseConfig(cfg);
        if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
            window.App.updateCloudHeaderBadge();
        }

        let synced = false;

        // 1. Coba via Firebase SDK jika tersedia
        try {
            if (window.firebase && firebase.apps && firebase.apps.length > 0) {
                if (cfg.databaseURL && firebase.database) {
                    const rtdb = firebase.database();
                    await rtdb.ref(cfg.collectionName || "lumbung_ternak_pleret").set(payload);
                    synced = true;
                } else if (firebase.firestore) {
                    const db = firebase.firestore();
                    await db.collection(cfg.collectionName || "lumbung_ternak_pleret").doc("latest_backup").set({
                        ...payload,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    synced = true;
                }
            }
        } catch (sdkErr) {
            console.warn("SDK push notice, fallback to REST API:", sdkErr);
        }

        // 2. Fallback langsung via HTTP REST API (100% jalan di semua browser & HP)
        if (!synced && cfg.databaseURL) {
            try {
                const restUrl = `${cfg.databaseURL.replace(/\/$/, '')}/${cfg.collectionName || 'lumbung_ternak_pleret'}.json`;
                const resp = await fetch(restUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (resp.ok) {
                    synced = true;
                }
            } catch (restErr) {
                console.warn("REST push error:", restErr);
            }
        }

        if (synced) {
            cfg.status = "connected";
            cfg.lastSyncTime = payload.exportedAt;
            this.saveFirebaseConfig(cfg);
            this.addLog("Sinkronisasi data ke Google Firebase Cloud berhasil.");
            if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
                window.App.updateCloudHeaderBadge();
            }
            return { success: true, message: "Data berhasil disinkronkan otomatis ke Cloud Firebase!", timestamp: cfg.lastSyncTime };
        } else {
            cfg.status = "error";
            this.saveFirebaseConfig(cfg);
            if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
                window.App.updateCloudHeaderBadge();
            }
            return { success: false, message: "Gagal sinkronisasi ke Firebase. Pastikan koneksi internet aktif." };
        }
    },

    async pullFromFirebase() {
        const cfg = this.getFirebaseConfig();
        cfg.status = "syncing";
        this.saveFirebaseConfig(cfg);
        if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
            window.App.updateCloudHeaderBadge();
        }

        let data = null;

        // 1. Coba lewat Firebase SDK jika tersedia
        try {
            if (window.firebase && (!firebase.apps || firebase.apps.length === 0)) {
                this.initFirebaseSync();
            }
            if (window.firebase && firebase.apps && firebase.apps.length > 0) {
                if (cfg.databaseURL && firebase.database) {
                    const rtdb = firebase.database();
                    const snap = await rtdb.ref(cfg.collectionName || "lumbung_ternak_pleret").once("value");
                    data = snap.val();
                } else if (firebase.firestore) {
                    const db = firebase.firestore();
                    const doc = await db.collection(cfg.collectionName || "lumbung_ternak_pleret").doc("latest_backup").get();
                    if (doc.exists) {
                        data = doc.data();
                    }
                }
            }
        } catch (sdkErr) {
            console.warn("Firebase SDK pull notice, mencoba REST API langsung:", sdkErr);
        }

        // 2. JIKA SDK BELUM TERSEDIA ATAU TERKENDALA: Langsung tarik via Google Firebase REST API
        if (!data && cfg.databaseURL) {
            try {
                const restUrl = `${cfg.databaseURL.replace(/\/$/, '')}/${cfg.collectionName || 'lumbung_ternak_pleret'}.json`;
                const resp = await fetch(restUrl, { cache: "no-store" });
                if (resp.ok) {
                    data = await resp.json();
                }
            } catch (fetchErr) {
                console.warn("[Firebase REST] Fetch error:", fetchErr);
            }
        }

        if (data && this.importAll(data)) {
            cfg.status = "connected";
            cfg.lastSyncTime = (data && data.exportedAt) || new Date().toISOString();
            this.saveFirebaseConfig(cfg);
            this.addLog("Tarik data dari Google Firebase Cloud berhasil.");
            this._isReadyForAutoPush = true;
            if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
                window.App.updateCloudHeaderBadge();
            }
            return { success: true, message: "Data cloud berhasil disinkronkan ke sistem!", timestamp: cfg.lastSyncTime };
        } else {
            cfg.status = "connected";
            this.saveFirebaseConfig(cfg);
            this._isReadyForAutoPush = true;
            if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
                window.App.updateCloudHeaderBadge();
            }
            return { success: false, message: "Tidak ada data cadangan di cloud Firebase atau format belum valid." };
        }
    },

    // Pengecekan kilat (~50 bytes) apakah ada pembaruan di Cloud dari perangkat lain
    async checkCloudUpdate() {
        const cfg = this.getFirebaseConfig();
        if (!cfg.databaseURL) return false;
        try {
            const restUrl = `${cfg.databaseURL.replace(/\/$/, '')}/${cfg.collectionName || 'lumbung_ternak_pleret'}/exportedAt.json`;
            const resp = await fetch(restUrl, { cache: "no-store" });
            if (resp.ok) {
                const cloudTime = await resp.json();
                if (cloudTime && cloudTime !== cfg.lastSyncTime) {
                    console.log(`[AutoSync] Pembaruan cloud terdeteksi (${cloudTime} != ${cfg.lastSyncTime}). Menyelaraskan data...`);
                    const pullRes = await this.pullFromFirebase();
                    if (pullRes && pullRes.success) {
                        if (window.App) {
                            if (window.App.currentView === "admin" && typeof window.App.renderContent === "function") {
                                window.App.renderContent();
                            } else if (window.App.currentView === "public" && window.PortalPublikModule) {
                                window.PortalPublikModule.render();
                            }
                            if (typeof window.App.showToast === "function") {
                                window.App.showToast("Data cloud otomatis disinkronkan ke perangkat ini! 🔄", "info");
                            }
                        }
                        return true;
                    }
                }
            }
        } catch (err) {
            // Abaikan kesalahan jaringan sesaat
        }
        return false;
    },

    initFirebaseSync() {
        const cfg = this.getFirebaseConfig();
        if (!cfg.apiKey || !cfg.projectId) {
            cfg.status = "unconfigured";
            this.saveFirebaseConfig(cfg);
            return false;
        }

        try {
            if (window.firebase && (!firebase.apps || firebase.apps.length === 0)) {
                firebase.initializeApp({
                    apiKey: cfg.apiKey,
                    authDomain: cfg.authDomain || `${cfg.projectId}.firebaseapp.com`,
                    projectId: cfg.projectId,
                    storageBucket: cfg.storageBucket || `${cfg.projectId}.appspot.com`,
                    messagingSenderId: cfg.messagingSenderId || "",
                    appId: cfg.appId || "",
                    databaseURL: cfg.databaseURL || `https://${cfg.projectId}-default-rtdb.firebaseio.com`
                });
            }
            cfg.status = "connected";
            this.saveFirebaseConfig(cfg);

            if (cfg.autoSync && window.firebase) {
                this.listenFirebaseRealtime();
            }
            return true;
        } catch (e) {
            console.warn("Firebase Init Exception:", e);
            cfg.status = "error";
            this.saveFirebaseConfig(cfg);
            return false;
        }
    },

    listenFirebaseRealtime() {
        const cfg = this.getFirebaseConfig();
        if (!window.firebase || !firebase.apps || firebase.apps.length === 0) return;

        try {
            if (cfg.databaseURL && firebase.database) {
                const rtdb = firebase.database();
                rtdb.ref(cfg.collectionName || "lumbung_ternak_pleret").on("value", snapshot => {
                    const cloudData = snapshot.val();
                    if (cloudData && cloudData.exportedAt && cloudData.exportedAt !== cfg.lastSyncTime) {
                        console.log("Realtime update terdeteksi dari Firebase Realtime Database...");
                        this.importAll(cloudData);
                        cfg.lastSyncTime = cloudData.exportedAt;
                        this.saveFirebaseConfig(cfg);
                        if (window.App) {
                            if (window.App.currentView === "admin" && typeof window.App.renderContent === "function") {
                                window.App.renderContent();
                            } else if (window.App.currentView === "public" && window.PortalPublikModule) {
                                window.PortalPublikModule.render();
                            }
                            if (typeof window.App.showToast === "function") {
                                window.App.showToast("Data ternak & akun berhasil disinkronkan dari Cloud!", "info");
                            }
                        }
                    }
                });
            } else if (firebase.firestore) {
                const db = firebase.firestore();
                db.collection(cfg.collectionName || "lumbung_ternak_pleret").doc("latest_backup")
                    .onSnapshot(doc => {
                        if (doc.exists && doc.data()) {
                            const cloudData = doc.data();
                            if (cloudData.exportedAt && cloudData.exportedAt !== cfg.lastSyncTime) {
                                console.log("Realtime update terdeteksi dari Firebase Cloud...");
                                this.importAll(cloudData);
                                cfg.lastSyncTime = cloudData.exportedAt;
                                this.saveFirebaseConfig(cfg);
                                if (window.App) {
                                    if (window.App.currentView === "admin" && typeof window.App.renderContent === "function") {
                                        window.App.renderContent();
                                    } else if (window.App.currentView === "public" && window.PortalPublikModule) {
                                        window.PortalPublikModule.render();
                                    }
                                    if (typeof window.App.showToast === "function") {
                                        window.App.showToast("Data ternak & akun berhasil disinkronkan dari Cloud!", "info");
                                    }
                                }
                            }
                        }
                    });
            }
        } catch (e) {
            console.warn("Realtime listener error:", e);
        }
    },

    // --- CADANGKAN & PULIHKAN DATA (BACKUP & RESTORE) ---
    getSnapshots() {
        return this.safeGet(STORAGE_KEYS.BACKUP_SNAPSHOTS, []);
    },

    createSnapshot(label = "Snapshot Otomatis") {
        const snapshots = this.getSnapshots();
        const newSnap = {
            id: "snap-" + Date.now(),
            tgl: new Date().toISOString(),
            label,
            totalDomba: this.getDomba().length,
            totalLogPakan: this.getLogPakanHarian().length,
            totalTransaksi: this.safeGet(STORAGE_KEYS.KEUANGAN, []).length,
            payload: this.exportAll()
        };
        snapshots.unshift(newSnap);
        if (snapshots.length > 6) snapshots.pop(); // simpan maksimal 6 snapshot
        localStorage.setItem(STORAGE_KEYS.BACKUP_SNAPSHOTS, JSON.stringify(snapshots));
        this.addLog(`Membuat snapshot cadangan lokal: ${label}`);
        return newSnap;
    },

    restoreSnapshot(id) {
        const snapshots = this.getSnapshots();
        const target = snapshots.find(s => s.id === id);
        if (target && target.payload) {
            const res = this.importAll(target.payload);
            if (res) {
                this.addLog(`Memulihkan data dari snapshot: ${target.label}`);
            }
            return res;
        }
        return false;
    },

    deleteSnapshot(id) {
        const snapshots = this.getSnapshots().filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.BACKUP_SNAPSHOTS, JSON.stringify(snapshots));
        this.addLog("Menghapus snapshot cadangan.");
        return true;
    },

    // --- MASTER DATA SUPLIER & KEMITRAAN TERNAK ---
    defaultSuplierList() {
        return [
            {
                id: "sup-1",
                nama: "Pasar Hewan Imogiri",
                kategori: "Pasar Hewan Tradisional",
                kontak: "0812-3456-7890 (Pak H. Marzuki)",
                lokasi: "Imogiri, Bantul, D.I. Yogyakarta",
                jenisKomoditas: "Bakalan Domba Garut, Texel & Gibas",
                rating: "A",
                catatan: "Suplier reguler bakalan penggemukan jantan sehat."
            },
            {
                id: "sup-2",
                nama: "Peternak Rakyat Kalurahan Pleret",
                kategori: "Kemitraan Peternak Lokal",
                kontak: "0877-9988-1122 (Kelompok Ternak Kedaton)",
                lokasi: "Kedaton & Kanggotan, Kalurahan Pleret",
                jenisKomoditas: "Cempe, Indukan Lokal & Dara Unggul",
                rating: "A+",
                catatan: "Pemberdayaan peternak binaan BUMKal Lumbung Pangan Mataram."
            },
            {
                id: "sup-3",
                nama: "BPTU HPT Pelaihari",
                kategori: "Balai Pembibitan Pemerintah",
                kontak: "(0512) 21234 (Sekretariat Balai)",
                lokasi: "Pelaihari, Kalimantan Selatan",
                jenisKomoditas: "Pejantan Dorper Murni & Semen Beku Unggul",
                rating: "A+",
                catatan: "Kerjasama peningkatan mutu genetik nasional."
            },
            {
                id: "sup-4",
                nama: "Mitra Kelompok Ternak Mataram",
                kategori: "Koperasi Mitra",
                kontak: "0813-2211-4455 (Mas Danang)",
                lokasi: "Prambanan, Sleman, D.I. Yogyakarta",
                jenisKomoditas: "Cross Merino & Texel Super",
                rating: "B+",
                catatan: "Penyedia domba bakalan kurban dan aqiqah."
            },
            {
                id: "sup-5",
                nama: "Balai Pembibitan Ternak DIY",
                kategori: "Dinas / Instansi Daerah",
                kontak: "(0274) 562111 (Dinas Pertanian DIY)",
                lokasi: "Cangkringan, Sleman, D.I. Yogyakarta",
                jenisKomoditas: "Domba Batur & Kambing PE Unggul",
                rating: "A",
                catatan: "Program bantuan bibit ternak dana keistimewaan DIY."
            }
        ];
    },

    getSuplier() {
        const list = this.safeGet(STORAGE_KEYS.SUPLIER, null);
        if (!list || !Array.isArray(list) || list.length === 0) {
            const def = this.defaultSuplierList();
            this.saveSuplier(def);
            return def;
        }
        return list;
    },

    saveSuplier(list) {
        localStorage.setItem(STORAGE_KEYS.SUPLIER, JSON.stringify(list));
        this.triggerAutoSync();
    },

    addSuplier(s) {
        const list = this.getSuplier();
        const newSup = {
            id: s.id || "sup-" + Date.now(),
            nama: (s.nama || "").trim(),
            kategori: s.kategori || "Mitra Peternak",
            kontak: s.kontak || "-",
            lokasi: s.lokasi || "-",
            jenisKomoditas: s.jenisKomoditas || "Bakalan Domba",
            rating: s.rating || "A",
            catatan: s.catatan || ""
        };
        list.push(newSup);
        this.saveSuplier(list);
        this.addLog(`Menambahkan master suplier: ${newSup.nama}`);
        return newSup;
    },

    updateSuplier(id, fields) {
        const list = this.getSuplier();
        const idx = list.findIndex(s => s.id === id);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...fields };
            this.saveSuplier(list);
            this.addLog(`Memperbarui master suplier: ${list[idx].nama}`);
            return list[idx];
        }
        return null;
    },

    deleteSuplier(id) {
        const list = this.getSuplier();
        const found = list.find(s => s.id === id);
        const filtered = list.filter(s => s.id !== id);
        this.saveSuplier(filtered);
        if (found) this.addLog(`Menghapus master suplier: ${found.nama}`);
        return true;
    },

    // --- MASTER DATA KEWENANGAN & BATASAN ROLE USER ---
    defaultRolePermissions() {
        const allMenus = [
            "dashboard", "scan_penimbang_cepat", "siklus_batch", "master_kandang",
            "data_ternak", "history_timbang", "cetak_stiker_qr", "import_csv",
            "input_pakan_harian", "scan_vaksin_medis", "stok_pakan_hpp", "rekam_medis",
            "limbah_organik", "buku_kas_bumdes", "laporan_rapat_evaluasi", "executive_dss_pades",
            "penjualan_ternak", "gaji_operasional", "master_pengaturan", "bumdes_backup_purge",
            "firebase_sync", "master_preset_vaksin", "manajemen_user"
        ];

        return {
            direksi: {
                label: "Direksi BUMKal",
                deskripsi: "Direktur Utama, Manajer Usaha, Bendahara, dan Manajemen Operasional BUMKal.",
                allowedMenus: [...allMenus],
                canCreate: true,
                canEdit: true,
                canDelete: true,
                canExport: true
            },
            pemerintah: {
                label: "Pemerintah & Pengawas",
                deskripsi: "Lurah Pleret, Pamong Kalurahan, BPKal, dan Dewan Pengawas Lembaga.",
                allowedMenus: [
                    "dashboard", "master_kandang", "data_ternak", "history_timbang",
                    "rekam_medis", "limbah_organik", "buku_kas_bumdes", "laporan_rapat_evaluasi",
                    "executive_dss_pades", "penjualan_ternak", "gaji_operasional"
                ],
                canCreate: false,
                canEdit: false,
                canDelete: false,
                canExport: true
            },
            anak_kandang: {
                label: "Anak Kandang & Operator Lapangan",
                deskripsi: "Petugas Pemeliharaan, Paramedik Hewan, Operator Pakan & Limbah Kohe.",
                allowedMenus: [
                    "dashboard", "scan_penimbang_cepat", "siklus_batch", "master_kandang",
                    "data_ternak", "history_timbang", "cetak_stiker_qr",
                    "input_pakan_harian", "scan_vaksin_medis", "stok_pakan_hpp", "rekam_medis",
                    "limbah_organik"
                ],
                canCreate: true,
                canEdit: true,
                canDelete: false,
                canExport: false
            }
        };
    },

    getRolePermissions() {
        const saved = this.safeGet(STORAGE_KEYS.ROLE_PERMISSIONS, null);
        if (!saved || typeof saved !== "object") {
            const def = this.defaultRolePermissions();
            this.saveRolePermissions(def);
            return def;
        }
        return saved;
    },

    saveRolePermissions(perms) {
        localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(perms));
        this.addLog("Memperbarui matriks kewenangan role pengguna");
        this.triggerAutoSync();
    },

    resetRolePermissions() {
        const def = this.defaultRolePermissions();
        this.saveRolePermissions(def);
        return def;
    },

    isRoleAllowed(role, menuKey) {
        let normalizedRole = "direksi";
        const r = (role || "").toLowerCase();
        if (r.includes("pemerintah") || r.includes("lurah") || r.includes("pengawas") || r.includes("bpkal") || r.includes("dinas")) {
            normalizedRole = "pemerintah";
        } else if (r.includes("anak") || r.includes("kandang") || r.includes("operator") || r.includes("paramedik") || r.includes("medis") || r.includes("limbah")) {
            normalizedRole = "anak_kandang";
        } else {
            normalizedRole = "direksi";
        }

        const perms = this.getRolePermissions();
        const roleConfig = perms[normalizedRole];
        if (!roleConfig || !Array.isArray(roleConfig.allowedMenus)) return true;
        return roleConfig.allowedMenus.includes(menuKey);
    }
};
