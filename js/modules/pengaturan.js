/**
 * Modul Pengaturan & Tata Kelola Sistem
 * Menangani 3 sub-menu:
 * 1. BUMDes, Backup & Purge (bumdes_backup_purge)
 * 2. Master Preset Vaksin (master_preset_vaksin)
 * 3. Manajemen User (manajemen_user)
 */

const PengaturanModule = {
    currentSubMenu: "master_pengaturan",
    activeConfigTab: "identitas", // "identitas" | "parameter" | "portal" | "produk" | "sirkular" | "ekspor" | "ras_ternak" | "suplier" | "kewenangan"
    activeRolePermissionTab: "pemerintah",

    // TEMPLATE MASTER VAKSIN & OBAT STANDAR DINAS PETERNAKAN
    presetVaksinTemplates: [
        {
            nama: "Vaksin PMK (Aftosa / Foot and Mouth)",
            tipe: "Vaksin Wajib",
            dosis: "2 ml / ekor",
            rute: "Subkutan (SC)",
            intervalHari: 180,
            target: "Pencegahan Penyakit Mulut & Kuku hewan ruminansia standar Dinas Peternakan Bantul"
        },
        {
            nama: "Vaksin Antraks (Bacillus anthracis)",
            tipe: "Vaksin Wajib",
            dosis: "1 ml / ekor",
            rute: "Subkutan (SC)",
            intervalHari: 365,
            target: "Pencegahan radang limpa / Antraks di wilayah peternakan"
        },
        {
            nama: "Ivermectin 1% (Wormamectin / Intermectin)",
            tipe: "Antiparasit / Obat Cacing",
            dosis: "1 ml / 30 kg BB",
            rute: "Subkutan (SC)",
            intervalHari: 90,
            target: "Membasmi cacing gilig gastrointestinal, cacing paru, kutu, pinjal & kudis (scabies)"
        },
        {
            nama: "Albendazole 10% Oral Ruminansia",
            tipe: "Antiparasit / Obat Cacing",
            dosis: "5 ml / 20 kg BB",
            rute: "Oral / Minum",
            intervalHari: 90,
            target: "Pemberantasan cacing hati dewasa (Fasciola hepatica), cacing pita & cacing perut"
        },
        {
            nama: "Vitamin B-Complex Injeksi",
            tipe: "Suplemen & Imunostimulan",
            dosis: "3 ml / ekor",
            rute: "Intramuskular (IM)",
            intervalHari: 30,
            target: "Meningkatkan nafsu makan, daya tahan tubuh, metabolisme & pemulihan stres pasca angkut"
        },
        {
            nama: "Biosan TP / ATP + Vitamin B12",
            tipe: "Suplemen & Imunostimulan",
            dosis: "2.5 ml / ekor",
            rute: "Intramuskular (IM)",
            intervalHari: 30,
            target: "Memperkuat fungsi tonus otot, memulihkan energi ternak lemas & memacu kenaikan bobot ADG"
        },
        {
            nama: "Calcidex Plus (Kalsium, Magnesium & Fosfor)",
            tipe: "Mineral Tulang & Laktasi",
            dosis: "5 ml / ekor",
            rute: "Intramuskular (IM)",
            intervalHari: 45,
            target: "Mencegah kelumpuhan hypocalcemia pada indukan bunting, menyusui dan kerangka cempe"
        },
        {
            nama: "Oxytetracycline LA 20% (Long Acting)",
            tipe: "Antibiotik Spektrum Luas",
            dosis: "1 ml / 10 kg BB",
            rute: "Intramuskular (IM)",
            intervalHari: 0,
            target: "Pengobatan pneumonia/batuk ngorok, radang sendi, mastitis, busuk kuku (footrot) & infeksi bakteri"
        },
        {
            nama: "Gusanex / Permethrin Spray Antilalat & Luka",
            tipe: "Topikal / Semprot",
            dosis: "Semprot secukupnya pada area luka",
            rute: "Topikal / Semprot",
            intervalHari: 0,
            target: "Pencegahan belatung (myiasis), pengobatan luka eartag, tanduk patah & tali pusar cempe"
        }
    ],

    // TEMPLATE MASTER RAS KAMBING & DOMBA UNGGUL
    rasTernakTemplates: [
        {
            nama: "Dorper Cross",
            kategori: "Domba",
            deskripsi: "Pertumbuhan daging sangat cepat (ADG >220g/hari), efisiensi pakan tinggi, rasio karkas padat dan adaptif iklim tropis Indonesia."
        },
        {
            nama: "Garut Tangkas / Priangan",
            kategori: "Domba",
            deskripsi: "Struktur tanduk kokoh, postur kekar dan berotot tebal, sangat tangguh dan toleran iklim tropis, cocok untuk seni ketangkasan & pedaging."
        },
        {
            nama: "Texel Wonosobo",
            kategori: "Domba",
            deskripsi: "Postur tubuh padat gilig (balok), perototan paha & punggung sangat tebal, persentase karkas tinggi (>53%), bulu wol putih lebat."
        },
        {
            nama: "Merino",
            kategori: "Domba",
            deskripsi: "Penghasil wol berkualitas tinggi dunia dan pedaging unggul, postur proporsional dengan lipatan kulit khas."
        },
        {
            nama: "Morada Cross (Santa Ines)",
            kategori: "Domba",
            deskripsi: "Domba rambut tropis tanpa wol, tahan cuaca panas dan lembap tinggi, resisten terhadap parasit cacing dan footrot."
        },
        {
            nama: "Lokal Domba Ekor Gemuk (DEG)",
            kategori: "Domba",
            deskripsi: "Memiliki kantong cadangan lemak pada ekor, sangat tahan panas dan mampu mencerna pakan berserat kasar tinggi secara efisien."
        },
        {
            nama: "Lokal Domba Ekor Tipis (DET)",
            kategori: "Domba",
            deskripsi: "Sifat prolifik sangat tinggi (sering beranak kembar 2-3 cempe), lincah, tahan cuaca ekstrem dan keibuan yang sangat baik."
        },
        {
            nama: "Kambing Boer / Boerka",
            kategori: "Kambing",
            deskripsi: "Kambing pedaging nomor satu dunia, rasio pertumbuhan bobot tercepat, tubuh lebar dan karkas empuk disukai pasar aqiqah & resto."
        },
        {
            nama: "Kambing Peranakan Etawa (PE)",
            kategori: "Kambing",
            deskripsi: "Kambing dwiguna (penghasil susu segar melimpah & pedaging), postur tinggi besar dengan telinga panjang terkulai khas ras unggul."
        },
        {
            nama: "Kambing Jawarandu / Bligon",
            kategori: "Kambing",
            deskripsi: "Persilangan kambing kacang dengan etawa, adaptasi lingkungan sangat tinggi, tahan penyakit dan disukai peternak rakyat."
        },
        {
            nama: "Kambing Saanen",
            kategori: "Kambing",
            deskripsi: "Kambing perah unggul asal Swiss dengan produksi susu harian tertinggi, warna putih krem bersih dan jinak."
        },
        {
            nama: "Kambing Kacang Asli",
            kategori: "Kambing",
            deskripsi: "Kambing lokal asli Indonesia, kemampuan adaptasi ekstrem pada cuaca tropis, reproduksi sangat subur dan tahan penyakit."
        }
    ],

    render(sub = null) {
        if (sub) this.currentSubMenu = sub;

        switch (this.currentSubMenu) {
            case "master_pengaturan":
                return this.renderMasterPengaturan();
            case "bumdes_backup_purge":
                return this.renderBumdesBackupPurge();
            case "firebase_sync":
                return this.renderFirebaseSync();
            case "master_preset_vaksin":
                return this.renderMasterPresetVaksin();
            case "manajemen_user":
                return this.renderManajemenUser();
            default:
                return this.renderMasterPengaturan();
        }
    },

    // 1. BUMDES, BACKUP & PURGE
    renderBumdesBackupPurge() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">
                            <i data-lucide="database" class="w-3.5 h-3.5 text-emerald-600"></i> Sistem & Database
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Pengaturan Lembaga BUMDes, Backup & Purge Data</h2>
                        <p class="text-xs text-slate-500">Legalitas BUMKal Lumbung Pangan Mataram, pencadangan basis data lokal, dan pemulihan sistem.</p>
                    </div>
                </div>

                <!-- PROFIL LEMBAGA BUMKAL CARD -->
                ${(() => {
                    const cfg = Store.getPengaturan();
                    return `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 dark:border-slate-700">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-extrabold text-xl shadow">
                                    LT
                                </div>
                                <div>
                                    <h3 class="text-base font-bold text-slate-900 dark:text-white">${cfg.namaLembaga || 'BUMKal LPM (Lumbung Pangan Mataram)'}</h3>
                                    <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">${cfg.namaPemerintahDesa || 'Pemerintah Kalurahan Pleret'}, ${cfg.kapanewonKabupaten || 'Kapanewon Pleret, Bantul'}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    Terdaftar di Kemendesa PDTT
                                </span>
                                <button onclick="PengaturanModule.openModalEditIdentitas()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95">
                                    <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit Identitas BUMKal
                                </button>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-2">
                                <div class="flex justify-between"><span class="text-slate-400">Nomor Registrasi BUMDes:</span><b class="text-slate-700 dark:text-slate-300 font-mono">${cfg.noSKKemendesa || 'AHU-01284.AH.02.01.TAHUN 2022'}</b></div>
                                <div class="flex justify-between"><span class="text-slate-400">SK Lurah Pengesahan:</span><b class="text-slate-700 dark:text-slate-300 font-mono">${cfg.noSKLurah || '188.45/04/PLT/2021'}</b></div>
                                <div class="flex justify-between"><span class="text-slate-400">Unit Usaha Utama:</span><b class="text-slate-700 dark:text-slate-300">${cfg.unitUsahaUtama || 'Penggemukan Domba & Pupuk Organik'}</b></div>
                                <div class="flex justify-between"><span class="text-slate-400">Alamat Fasilitas Kandang:</span><b class="text-slate-700 dark:text-slate-300">${cfg.alamatKandang || cfg.alamatSekretariat || 'Kedaton Kulon, Pleret, Bantul'}</b></div>
                                <div class="flex justify-between"><span class="text-slate-400">Email Resmi Lembaga:</span><b class="text-emerald-600 dark:text-emerald-400">${cfg.emailResmi || cfg.emailLembaga || 'bumdes.lpm@pleret.desa.id'}</b></div>
                            </div>
                            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-2">
                                <div class="flex justify-between"><span class="text-slate-400">Kontak WhatsApp:</span><b class="text-slate-700 dark:text-slate-300">${cfg.nomorWhatsApp || cfg.kontakTelepon || '-'}</b></div>
                                <div class="flex justify-between"><span class="text-slate-400">Direktur Utama BUMKal:</span><b class="text-slate-700 dark:text-slate-300">${cfg.namaDirektur || 'H. Supardi, S.Pt.'}</b></div>
                                <div class="flex justify-between"><span class="text-slate-400">Penasihat (Ex-Officio):</span><b class="text-slate-700 dark:text-slate-300">${cfg.penasihatLembaga || 'Lurah Pleret'}</b></div>
                                <div class="flex justify-between"><span class="text-slate-400">Rekening Kas Operasional:</span><b class="text-slate-700 dark:text-slate-300 font-mono">${cfg.rekeningOperasional || 'BPD DIY (008.211.009871)'}</b></div>
                                <div class="flex justify-between"><span class="text-slate-400">Dukungan Pendanaan:</span><b class="text-slate-700 dark:text-slate-300">${cfg.dukunganPendanaan || 'BKK Dana Keistimewaan DIY'}</b></div>
                            </div>
                        </div>
                    </div>
                    `;
                })()}

                <!-- BACKUP & RESTORE UTILITIES -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <!-- Backup -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <i data-lucide="download" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Ekspor Cadangan Lengkap (Backup JSON)</h3>
                                <p class="text-xs text-slate-500">Unduh seluruh 21 modul data kandang ke berkas tunggal terenkripsi.</p>
                            </div>
                        </div>
                        <p class="text-xs text-slate-600 dark:text-slate-400">
                            Menyimpan seluruh data ternak domba, log timbangan ADG, log pakan harian, rekam medis vaksin, master kandang, transaksi kas BUMDes, dan SDM.
                        </p>
                        <div class="pt-2">
                            <button onclick="ExportImport.exportJSON()" class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2">
                                <i data-lucide="download" class="w-4 h-4"></i> Unduh File Cadangan (.json)
                            </button>
                        </div>
                    </div>

                    <!-- Restore -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <i data-lucide="upload" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Pulihkan Database (Restore JSON)</h3>
                                <p class="text-xs text-slate-500">Mengembalikan data dari file backup yang pernah diunduh.</p>
                            </div>
                        </div>
                        <p class="text-xs text-slate-600 dark:text-slate-400">
                            Pilih file JSON backup dari komputer Anda. Semua data yang ada saat ini akan digantikan secara aman dengan data cadangan tersebut.
                        </p>
                        <div class="pt-2">
                            <input type="file" id="pg-import-json-file" accept=".json" onchange="ExportImport.importJSON(this)" class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
                        </div>
                    </div>
                </div>

                <!-- TITIK PEMULIHAN CEPAT (LOCAL DATABASE SNAPSHOTS) -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 dark:border-slate-700">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <i data-lucide="history" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Titik Pemulihan Cepat Browser (Local Snapshots)</h3>
                                <p class="text-xs text-slate-500">Simpan status database saat ini ke dalam memori browser sebagai titik rollback instan (maksimal 6 titik cadangan).</p>
                            </div>
                        </div>
                        <button onclick="PengaturanModule.createSnapshotNow()" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95">
                            <i data-lucide="camera" class="w-4 h-4"></i> Buat Titik Cadangan Baru
                        </button>
                    </div>

                    ${(() => {
                        const snapshots = Store.getSnapshots();
                        if (snapshots.length === 0) {
                            return `
                                <div class="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs">
                                    <i data-lucide="database-backup" class="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600"></i>
                                    <p class="font-semibold">Belum ada titik pemulihan cepat yang dibuat.</p>
                                    <p class="text-[11px] text-slate-500 mt-0.5">Klik tombol di atas untuk mencadangkan kondisi data saat ini secara instan sebelum melakukan eksperimen atau perubahan besar.</p>
                                </div>
                            `;
                        }
                        return `
                            <div class="overflow-x-auto">
                                <table class="w-full text-xs text-left">
                                    <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                        <tr>
                                            <th class="py-2.5 px-3">Waktu Cadangan</th>
                                            <th class="py-2.5 px-3">Nama / Label Titik Cadangan</th>
                                            <th class="py-2.5 px-3">Ringkasan Data</th>
                                            <th class="py-2.5 px-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                        ${snapshots.map(s => `
                                            <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                                <td class="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    ${new Date(s.tgl).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td class="py-3 px-3 font-bold text-slate-900 dark:text-white">
                                                    <span class="inline-flex items-center gap-1.5">
                                                        <i data-lucide="bookmark" class="w-3.5 h-3.5 text-indigo-500"></i> ${s.label}
                                                    </span>
                                                </td>
                                                <td class="py-3 px-3 text-slate-600 dark:text-slate-400">
                                                    <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-semibold mr-1">
                                                        ${s.totalDomba || 0} Domba
                                                    </span>
                                                    <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-semibold mr-1">
                                                        ${s.totalLogPakan || 0} Pakan
                                                    </span>
                                                    <span class="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[10px] font-semibold">
                                                        ${s.totalTransaksi || 0} Transaksi
                                                    </span>
                                                </td>
                                                <td class="py-3 px-3 text-center">
                                                    <div class="flex items-center justify-center gap-1.5">
                                                        <button onclick="PengaturanModule.restoreSnapshotNow('${s.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition" title="Pulihkan kondisi data ke titik ini">
                                                            <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Pulihkan
                                                        </button>
                                                        <button onclick="PengaturanModule.deleteSnapshotNow('${s.id}')" class="p-1 rounded-lg hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 transition" title="Hapus snapshot ini">
                                                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    })()}
                </div>

                <!-- DANGER ZONE: FACTORY RESET & DATA PURGE -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-6 shadow-sm space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-rose-800 dark:text-rose-300">Area Pembersihan Data & Reset Pabrik (Factory Purge)</h3>
                            <p class="text-xs text-slate-500">Gunakan tindakan ini secara hati-hati saat ingin mengosongkan transaksi uji coba.</p>
                        </div>
                    </div>

                    <div class="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h4 class="font-bold text-rose-900 dark:text-rose-200">Reset Bersih Total (Data & Transaksi Menjadi 0)</h4>
                            <p class="text-slate-500 mt-0.5">Mengosongkan seluruh data ternak, riwayat timbang, log pakan, limbah kohe, dan kas buku BUMDes menjadi 0 bersih tanpa sisa dummy. Akun user dan kredensial login tetap tersimpan aman.</p>
                        </div>
                        <button onclick="App.resetFactory()" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition whitespace-nowrap active:scale-95">
                            Kosongkan Semua Data (Reset 0)
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // 2. MASTER PRESET VAKSIN
    renderMasterPresetVaksin() {
        const presets = Store.getPresetVaksin();

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-1">
                            <i data-lucide="flask-conical" class="w-3.5 h-3.5"></i> Farmasi Peternakan
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Master Preset Vaksin, Vitamin & Obat Ternak</h2>
                        <p class="text-xs text-slate-500">Standarisasi dosis, rute aplikasi suntik, dan interval perlakuan medis domba standar Dinas Peternakan Bantul.</p>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <button onclick="PengaturanModule.loadTemplateVaksinStandar()" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-rose-400 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40 transition active:scale-95 shadow-sm">
                            <i data-lucide="download-cloud" class="w-4 h-4"></i> Muat Template Vaksin Standar
                        </button>
                        <button onclick="PengaturanModule.openModalTambahPresetVaksin()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Tambah Preset Obat
                        </button>
                    </div>
                </div>

                <!-- PRESET VAKSIN TABLE -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="list" class="w-4 h-4 text-rose-600"></i> Katalog Preset Vaksinasi Aktif
                        </h3>
                        <span class="text-xs text-slate-500">${presets.length} Jenis Formula Obat</span>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Nama Formula / Obat</th>
                                    <th class="py-3 px-4">Klasifikasi Obat</th>
                                    <th class="py-3 px-4 font-bold">Dosis Standar</th>
                                    <th class="py-3 px-4">Rute Aplikasi</th>
                                    <th class="py-3 px-4 text-center">Interval Rutin</th>
                                    <th class="py-3 px-4">Indikasi Medis & Target Pencegahan</th>
                                    <th class="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${presets.map(p => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${p.nama}</td>
                                        <td class="py-3 px-4">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.tipe.includes('Wajib') ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}">
                                                ${p.tipe}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 font-bold text-emerald-600">${p.dosis}</td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">${p.rute}</td>
                                        <td class="py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-bold">
                                            ${p.intervalHari > 0 ? `${p.intervalHari} Hari` : 'Kondisional (Saat Sakit)'}
                                        </td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs">${p.target}</td>
                                        <td class="py-3 px-4 text-center">
                                            <button onclick="PengaturanModule.deletePresetVaksin('${p.id}')" class="p-1 rounded hover:bg-rose-50 text-rose-600" title="Hapus Preset">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // 3. MANAJEMEN USER
    renderManajemenUser() {
        const sdmList = Store.getSDM();
        const currentUser = Store.getCurrentUser();

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
                            <i data-lucide="users" class="w-3.5 h-3.5"></i> Hak Akses & SDM
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Manajemen Pengguna & Struktur Pengelola</h2>
                        <p class="text-xs text-slate-500">Daftar pengguna terdaftar, peran operasional, kata sandi akses, dan pengelolaan akun tim kandang.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="PengaturanModule.openModalTambahUser()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="user-plus" class="w-4 h-4"></i> Tambah Pengguna Baru
                        </button>
                    </div>
                </div>

                <!-- USER CARDS -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${sdmList.map(s => {
                        const isCurrent = currentUser.id === s.id;
                        return `
                            <div class="bg-white dark:bg-slate-800 rounded-2xl border ${isCurrent ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' : 'border-slate-200/80 dark:border-slate-700/80'} p-5 shadow-sm space-y-4 flex flex-col justify-between">
                                <div>
                                    <div class="flex items-start justify-between">
                                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-base shadow overflow-hidden flex-shrink-0">
                                            ${s.foto 
                                                ? `<img src="${s.foto}" class="w-full h-full object-cover">` 
                                                : s.nama.split(' ').map(n => n[0]).slice(0, 2).join('')
                                            }
                                        </div>
                                        <div class="flex items-center gap-1.5 flex-wrap justify-end">
                                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${s.status === 'Pamong' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'}">
                                                ${s.status}
                                            </span>
                                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${s.role === 'direksi' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : s.role === 'pemerintah' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}">
                                                ${s.role === 'direksi' ? 'Direksi' : s.role === 'pemerintah' ? 'Pemerintah' : 'Anak Kandang'}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="mt-3">
                                        <h4 class="font-bold text-sm text-slate-900 dark:text-white">${s.nama}</h4>
                                        <div class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">${s.jabatan}</div>
                                        <p class="text-[11px] text-slate-500">${s.unit}</p>
                                    </div>

                                    <div class="mt-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                                        <div class="flex justify-between items-center"><span class="text-slate-400">NIK:</span><b class="text-slate-700 dark:text-slate-300 font-mono">${s.nik}</b></div>
                                        <div class="flex justify-between items-center"><span class="text-slate-400">WhatsApp:</span><b class="text-slate-700 dark:text-slate-300">${s.noHp}</b></div>
                                        <div class="flex justify-between items-center pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                                            <span class="text-slate-400">Password:</span>
                                            <div class="flex items-center gap-1.5">
                                                <span id="pass-val-${s.id}" data-revealed="false" class="font-mono font-bold text-indigo-600 dark:text-indigo-400">••••••••</span>
                                                <button type="button" id="pass-btn-${s.id}" onclick="PengaturanModule.togglePasswordVisibility('${s.id}')" class="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition" title="Lihat / Sembunyikan Password">
                                                    <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                                    <!-- Action Buttons: Ubah Password, Ganti Foto, Edit Profil, Hapus -->
                                    <div class="grid grid-cols-4 gap-1">
                                        <button onclick="PengaturanModule.openModalUbahFoto('${s.id}')" class="py-1 px-1.5 rounded-lg border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition" title="Ganti foto profil atau pasang logo institusi">
                                            <i data-lucide="image" class="w-3 h-3"></i> Foto
                                        </button>
                                        <button onclick="PengaturanModule.openModalUbahPassword('${s.id}')" class="py-1 px-1.5 rounded-lg border border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition" title="Ganti kata sandi pengguna">
                                            <i data-lucide="key" class="w-3 h-3"></i> PIN
                                        </button>
                                        <button onclick="PengaturanModule.openModalEditUser('${s.id}')" class="py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition" title="Edit profil pengguna">
                                            <i data-lucide="edit-3" class="w-3 h-3"></i> Edit
                                        </button>
                                        <button onclick="PengaturanModule.deleteUser('${s.id}')" class="py-1 px-1.5 rounded-lg border border-rose-200 dark:border-rose-800/80 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex items-center justify-center transition" title="Hapus pengguna">
                                            <i data-lucide="trash-2" class="w-3 h-3"></i>
                                        </button>
                                    </div>

                                    <!-- Status / Switch Profile Button -->
                                    <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                                        <span>Bergabung: ${s.tglBergabung}</span>
                                        ${isCurrent ? `
                                            <span class="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Akun Aktif
                                            </span>
                                        ` : `
                                            <button onclick="PengaturanModule.switchUser('${s.id}')" class="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition">
                                                <i data-lucide="log-in" class="w-3 h-3"></i> Gunakan
                                            </button>
                                        `}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    // --- ACTIONS & MODALS USER ---

    togglePasswordVisibility(id) {
        const textEl = document.getElementById(`pass-val-${id}`);
        const btnEl = document.getElementById(`pass-btn-${id}`);
        if (!textEl) return;
        const user = Store.getSDM().find(s => s.id === id);
        const pass = user ? (user.password || "123456") : "******";
        const isRevealed = textEl.getAttribute("data-revealed") === "true";

        if (isRevealed) {
            textEl.textContent = "••••••••";
            textEl.setAttribute("data-revealed", "false");
            if (btnEl) {
                btnEl.innerHTML = '<i data-lucide="eye" class="w-3.5 h-3.5"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        } else {
            textEl.textContent = pass;
            textEl.setAttribute("data-revealed", "true");
            if (btnEl) {
                btnEl.innerHTML = '<i data-lucide="eye-off" class="w-3.5 h-3.5"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        }
    },

    toggleInputPasswordVisibility(inputId, btnEl) {
        const input = document.getElementById(inputId);
        if (!input) return;
        if (input.type === "password") {
            input.type = "text";
            if (btnEl) {
                btnEl.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        } else {
            input.type = "password";
            if (btnEl) {
                btnEl.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        }
    },

    openModalTambahUser() {
        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="user-plus" class="w-5 h-5 text-indigo-600"></i> Tambah Pengguna / Pengurus Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PengaturanModule.submitTambahUser(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap & Gelar *</label>
                        <input type="text" id="usr-nama" required placeholder="Contoh: Ahmad Fauzi, S.Pt." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>

                    <!-- Input Foto Profil / Logo -->
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Foto Profil / Logo Akun</label>
                        <div class="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/40 dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-700">
                            <div class="w-14 h-14 rounded-xl border border-dashed border-indigo-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 flex-shrink-0">
                                <img id="usr-foto-preview" src="" class="hidden w-full h-full object-cover">
                                <i id="usr-foto-placeholder" data-lucide="user" class="w-6 h-6 text-indigo-400"></i>
                            </div>
                            <div class="flex-1 space-y-1.5">
                                <div class="flex items-center gap-2">
                                    <input type="file" accept="image/*" onchange="PengaturanModule.handleProdukFotoUpload(this, 'usr-foto-preview', 'usr-foto-url')" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                                    <button type="button" onclick="PengaturanModule.setPresetLogoAsFoto('usr-foto-preview', 'usr-foto-url')" class="px-2.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                                        🏛️ Pakai Logo
                                    </button>
                                </div>
                                <input type="url" id="usr-foto-url" placeholder="Atau tempel URL gambar / logo (https://...)" class="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px]">
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jabatan Operasional *</label>
                            <input type="text" id="usr-jabatan" required placeholder="Contoh: Staf Pemeliharaan & Pakan" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit / Divisi *</label>
                            <input type="text" id="usr-unit" required placeholder="Contoh: Divisi Pemeliharaan Ternak" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Hak Akses Sistem *</label>
                            <select id="usr-role" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                <option value="direksi">Direksi (Manajemen BUMKal)</option>
                                <option value="anak_kandang">Anak Kandang (Petugas Lapangan / Operator)</option>
                                <option value="pemerintah">Pemerintah (Dewan Pengawas / Kalurahan)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Kepegawaian *</label>
                            <select id="usr-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Karyawan">Karyawan Tetap / Kontrak</option>
                                <option value="Pengurus">Pengurus BUMKal</option>
                                <option value="Pamong">Pamong Kalurahan</option>
                                <option value="Mitra Peternak">Mitra Peternak / Kelompok</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">NIK / No. KTP (Username Login) *</label>
                            <input type="text" id="usr-nik" required placeholder="16 digit NIK atau username unik" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp *</label>
                            <input type="tel" id="usr-nohp" required placeholder="Contoh: 081234567890" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="bg-indigo-50/60 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                        <label class="block font-bold text-indigo-900 dark:text-indigo-200">
                            Kata Sandi / Password Akun *
                        </label>
                        <div class="relative">
                            <input type="password" id="usr-password" required placeholder="Minimal 4 karakter" class="w-full p-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                            <button type="button" onclick="PengaturanModule.toggleInputPasswordVisibility('usr-password', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Password ini digunakan petugas untuk masuk ke dashboard portal pengurus.</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Bergabung</label>
                            <input type="date" id="usr-tgl" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pendidikan Terakhir</label>
                            <input type="text" id="usr-pendidikan" placeholder="Contoh: S1 Peternakan / SMK" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Penugasan / Portofolio</label>
                        <textarea id="usr-catatan" rows="2" placeholder="Catatan tugas pokok atau tanggung jawab spesifik..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 border-t dark:border-slate-700 flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition active:scale-95 flex items-center gap-1.5">
                            <i data-lucide="check" class="w-4 h-4"></i> Simpan Pengguna Baru
                        </button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTambahUser(e) {
        e.preventDefault();
        const nik = document.getElementById("usr-nik").value.trim();
        const nama = document.getElementById("usr-nama").value.trim();
        const jabatan = document.getElementById("usr-jabatan").value.trim();
        const unit = document.getElementById("usr-unit").value.trim();
        const role = document.getElementById("usr-role").value;
        const status = document.getElementById("usr-status").value;
        const noHp = document.getElementById("usr-nohp").value.trim();
        const password = document.getElementById("usr-password").value.trim();
        const tglBergabung = document.getElementById("usr-tgl").value;
        const pendidikan = document.getElementById("usr-pendidikan").value.trim();
        const catatan = document.getElementById("usr-catatan").value.trim();
        const foto = document.getElementById("usr-foto-url")?.value.trim() || "";

        if (!nama || !nik || !password) {
            App.showToast("Nama, NIK, dan Password wajib diisi!", "error");
            return;
        }

        const sdmList = Store.getSDM();
        if (sdmList.some(s => s.nik === nik)) {
            App.showToast("Pengguna dengan NIK ini sudah terdaftar!", "warning");
            return;
        }

        const newUser = {
            id: "sdm-" + Date.now(),
            nama,
            jabatan,
            unit,
            role,
            status,
            nik,
            noHp,
            password,
            foto,
            tglBergabung: tglBergabung || new Date().toISOString().split("T")[0],
            pendidikan: pendidikan || "-",
            catatan: catatan || "-"
        };

        Store.addSDM(newUser);
        App.closeModal();
        App.showToast(`Pengguna baru "${nama}" berhasil ditambahkan!`, "success");
        App.renderContent();
    },

    openModalEditUser(id) {
        const user = Store.getSDM().find(s => s.id === id);
        if (!user) {
            App.showToast("Data pengguna tidak ditemukan!", "error");
            return;
        }

        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-indigo-600"></i> Edit Profil Pengguna: ${user.nama}
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PengaturanModule.submitEditUser(event, '${user.id}')" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap & Gelar *</label>
                        <input type="text" id="edit-usr-nama" value="${user.nama || ''}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>

                    <!-- Input Foto Profil / Logo -->
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Foto Profil / Logo Akun</label>
                        <div class="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/40 dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-700">
                            <div class="w-14 h-14 rounded-xl border border-dashed border-indigo-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 flex-shrink-0">
                                <img id="edit-usr-foto-preview" src="${user.foto || ''}" class="${user.foto ? '' : 'hidden'} w-full h-full object-cover">
                                <i id="edit-usr-foto-placeholder" data-lucide="user" class="${user.foto ? 'hidden' : ''} w-6 h-6 text-indigo-400"></i>
                            </div>
                            <div class="flex-1 space-y-1.5">
                                <div class="flex items-center gap-2">
                                    <input type="file" accept="image/*" onchange="PengaturanModule.handleProdukFotoUpload(this, 'edit-usr-foto-preview', 'edit-usr-foto-url')" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                                    <button type="button" onclick="PengaturanModule.setPresetLogoAsFoto('edit-usr-foto-preview', 'edit-usr-foto-url')" class="px-2.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                                        🏛️ Pakai Logo
                                    </button>
                                </div>
                                <input type="url" id="edit-usr-foto-url" value="${user.foto || ''}" placeholder="Atau tempel URL gambar / logo (https://...)" class="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px]">
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jabatan Operasional *</label>
                            <input type="text" id="edit-usr-jabatan" value="${user.jabatan || ''}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit / Divisi *</label>
                            <input type="text" id="edit-usr-unit" value="${user.unit || ''}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Hak Akses Sistem</label>
                            <select id="edit-usr-role" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                <option value="direksi" ${user.role === 'direksi' ? 'selected' : ''}>Direksi (Manajemen BUMKal)</option>
                                <option value="anak_kandang" ${user.role === 'anak_kandang' ? 'selected' : ''}>Anak Kandang (Petugas Lapangan / Operator)</option>
                                <option value="pemerintah" ${user.role === 'pemerintah' ? 'selected' : ''}>Pemerintah (Dewan Pengawas / Kalurahan)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Kepegawaian</label>
                            <select id="edit-usr-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Karyawan" ${user.status === 'Karyawan' ? 'selected' : ''}>Karyawan Tetap / Kontrak</option>
                                <option value="Pengurus" ${user.status === 'Pengurus' ? 'selected' : ''}>Pengurus BUMKal</option>
                                <option value="Pamong" ${user.status === 'Pamong' ? 'selected' : ''}>Pamong Kalurahan</option>
                                <option value="Mitra Peternak" ${user.status === 'Mitra Peternak' ? 'selected' : ''}>Mitra Peternak / Kelompok</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">NIK / Username Login *</label>
                            <input type="text" id="edit-usr-nik" value="${user.nik || ''}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp</label>
                            <input type="tel" id="edit-usr-nohp" value="${user.noHp || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Bergabung</label>
                            <input type="date" id="edit-usr-tgl" value="${user.tglBergabung || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pendidikan Terakhir</label>
                            <input type="text" id="edit-usr-pendidikan" value="${user.pendidikan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Penugasan</label>
                        <textarea id="edit-usr-catatan" rows="2" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">${user.catatan || ''}</textarea>
                    </div>

                    <div class="pt-3 border-t dark:border-slate-700 flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition active:scale-95 flex items-center gap-1.5">
                            <i data-lucide="check" class="w-4 h-4"></i> Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
        App.openModal();
    },

    submitEditUser(e, id) {
        e.preventDefault();
        const nama = document.getElementById("edit-usr-nama").value.trim();
        const jabatan = document.getElementById("edit-usr-jabatan").value.trim();
        const unit = document.getElementById("edit-usr-unit").value.trim();
        const role = document.getElementById("edit-usr-role").value;
        const status = document.getElementById("edit-usr-status").value;
        const nik = document.getElementById("edit-usr-nik").value.trim();
        const noHp = document.getElementById("edit-usr-nohp").value.trim();
        const tglBergabung = document.getElementById("edit-usr-tgl").value;
        const pendidikan = document.getElementById("edit-usr-pendidikan").value.trim();
        const catatan = document.getElementById("edit-usr-catatan").value.trim();
        const foto = document.getElementById("edit-usr-foto-url")?.value.trim() || "";

        if (!nama || !nik) {
            App.showToast("Nama dan NIK wajib diisi!", "error");
            return;
        }

        Store.updateSDM(id, {
            nama,
            jabatan,
            unit,
            role,
            status,
            nik,
            noHp,
            foto,
            tglBergabung,
            pendidikan,
            catatan
        });

        // If current user updated, refresh session
        const curr = Store.getCurrentUser();
        if (curr && curr.id === id) {
            curr.nama = nama;
            curr.jabatan = jabatan;
            curr.foto = foto;
            curr.role = role;
            Store.setCurrentUser(curr);
        }

        App.closeModal();
        App.showToast(`Profil pengguna "${nama}" berhasil diperbarui!`, "success");
        App.renderHeaderUser();
        App.renderContent();
    },

    openModalUbahFoto(id) {
        const user = Store.getSDM().find(s => s.id === id);
        if (!user) return;
        const cfg = Store.getPengaturan();

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                            <i data-lucide="image" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Ubah Foto Profil / Logo Pengguna</h3>
                            <p class="text-xs text-slate-500">${user.nama} (${user.jabatan})</p>
                        </div>
                    </div>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PengaturanModule.submitUbahFoto(event, '${user.id}')" class="space-y-4 text-xs">
                    <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                        <div class="w-20 h-20 rounded-2xl border-2 border-indigo-500 overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow">
                            <img id="ufoto-preview" src="${user.foto || ''}" class="${user.foto ? '' : 'hidden'} w-full h-full object-cover">
                            <div id="ufoto-placeholder" class="${user.foto ? 'hidden' : ''} font-black text-indigo-600 text-lg">
                                ${user.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                        </div>
                        <div class="flex-1 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 block">Pilih Gambar atau Logo Baru</label>
                            <input type="file" accept="image/*" onchange="PengaturanModule.handleProdukFotoUpload(this, 'ufoto-preview', 'ufoto-url')" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                            <input type="url" id="ufoto-url" value="${user.foto || ''}" placeholder="Atau masukkan URL foto / logo..." class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs">
                        </div>
                    </div>

                    <!-- Preset Cepat: Pakai Logo Lembaga -->
                    <div class="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                        <div>
                            <b class="text-amber-900 dark:text-amber-200">Gunakan Logo Resmi BUMKal / Kalurahan</b>
                            <p class="text-[11px] text-amber-700/90">Gunakan lambang resmi BUMKal Pleret sebagai foto profil akun ini</p>
                        </div>
                        <button type="button" onclick="PengaturanModule.setPresetLogoAsFoto('ufoto-preview', 'ufoto-url')" class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition active:scale-95 whitespace-nowrap">
                            🏛️ Pasang Logo
                        </button>
                    </div>

                    <div class="pt-3 border-t dark:border-slate-700 flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition active:scale-95">
                            Simpan Foto Profil
                        </button>
                    </div>
                </form>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
        App.openModal();
    },

    setPresetLogoAsFoto(previewId, urlInputId) {
        const cfg = Store.getPengaturan();
        const logoUrl = cfg.logoBumdes || cfg.logoLembaga || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=150&auto=format&fit=crop&q=80";
        const preview = document.getElementById(previewId);
        const placeholder = document.getElementById(previewId.replace('preview', 'placeholder'));
        const urlInput = document.getElementById(urlInputId);
        if (preview) {
            preview.src = logoUrl;
            preview.classList.remove('hidden');
        }
        if (placeholder) {
            placeholder.classList.add('hidden');
        }
        if (urlInput) {
            urlInput.value = logoUrl;
        }
    },

    submitUbahFoto(e, id) {
        e.preventDefault();
        const foto = document.getElementById("ufoto-url").value.trim();
        const sdmList = Store.getSDM();
        const idx = sdmList.findIndex(s => s.id === id);
        if (idx !== -1) {
            sdmList[idx].foto = foto;
            Store.saveSDM(sdmList);

            // If it's the current user, update session and header avatar
            const curr = Store.getCurrentUser();
            if (curr && curr.id === id) {
                curr.foto = foto;
                Store.setCurrentUser(curr);
                App.renderHeaderUser();
            }

            App.closeModal();
            App.showToast("Foto profil / logo pengguna berhasil disimpan!", "success");
            App.renderHeaderUser();
            App.renderContent();
        }
    },

    openModalUbahPassword(id) {
        const user = Store.getSDM().find(s => s.id === id);
        if (!user) {
            App.showToast("Data pengguna tidak ditemukan!", "error");
            return;
        }

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="key" class="w-5 h-5 text-amber-500"></i> Ubah Password: ${user.nama}
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between">
                    <div>
                        <div class="font-bold text-slate-800 dark:text-slate-200">${user.nama} (${user.jabatan})</div>
                        <div class="text-slate-500">NIK: <span class="font-mono font-semibold">${user.nik}</span></div>
                    </div>
                    <div class="text-right">
                        <div class="text-[10px] text-slate-400">Password Saat Ini:</div>
                        <div class="font-mono font-bold text-indigo-600 dark:text-indigo-400">${user.password || '123456'}</div>
                    </div>
                </div>

                <form onsubmit="PengaturanModule.submitUbahPassword(event, '${user.id}')" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kata Sandi / Password Baru *</label>
                        <div class="relative">
                            <input type="password" id="new-pwd-1" required placeholder="Minimal 3 karakter baru" class="w-full p-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                            <button type="button" onclick="PengaturanModule.toggleInputPasswordVisibility('new-pwd-1', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ulangi Kata Sandi Baru *</label>
                        <div class="relative">
                            <input type="password" id="new-pwd-2" required placeholder="Ketik ulang kata sandi baru" class="w-full p-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                            <button type="button" onclick="PengaturanModule.toggleInputPasswordVisibility('new-pwd-2', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <div class="pt-3 border-t dark:border-slate-700 flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition active:scale-95 flex items-center gap-1.5">
                            <i data-lucide="check" class="w-4 h-4"></i> Simpan Password Baru
                        </button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitUbahPassword(e, id) {
        e.preventDefault();
        const p1 = document.getElementById("new-pwd-1").value.trim();
        const p2 = document.getElementById("new-pwd-2").value.trim();
        if (!p1 || !p2) {
            App.showToast("Kata sandi baru tidak boleh kosong!", "error");
            return;
        }
        if (p1 !== p2) {
            App.showToast("Konfirmasi kata sandi tidak cocok!", "error");
            return;
        }
        if (p1.length < 3) {
            App.showToast("Kata sandi minimal 3 karakter!", "warning");
            return;
        }

        Store.updateSDM(id, { password: p1 });
        App.closeModal();
        App.showToast("Kata sandi pengguna berhasil diperbarui!", "success");
        App.renderContent();
    },

    deleteUser(id) {
        const currentUser = Store.getCurrentUser();
        if (currentUser && currentUser.id === id) {
            App.showToast("Tidak dapat menghapus akun yang sedang aktif digunakan!", "warning");
            return;
        }
        const sdmList = Store.getSDM();
        if (sdmList.length <= 1) {
            App.showToast("Minimal harus tersisa 1 akun pengguna di sistem!", "error");
            return;
        }
        const target = sdmList.find(s => s.id === id);
        const name = target ? target.nama : "pengguna ini";

        if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            Store.deleteSDM(id);
            App.showToast(`Akun pengguna "${name}" berhasil dihapus.`, "info");
            App.renderContent();
        }
    },

    switchUser(id) {
        const sdmList = Store.getSDM();
        const user = sdmList.find(s => s.id === id);
        if (user) {
            Store.setCurrentUser(user);
            App.renderHeaderUser();
            if (App.updateSidebarVisibility) App.updateSidebarVisibility();
            App.showToast(`Beralih ke pengguna: ${user.nama} (${user.jabatan})`, "info");
            if (App.currentRoute && Store.isRoleAllowed && !Store.isRoleAllowed(user.role || "direksi", App.currentRoute)) {
                App.navigate("dashboard");
            } else {
                App.renderContent();
            }
        }
    },

    setMasterConfigTab(tab) {
        if (this.activeConfigTab === "portal" && document.getElementById("cfg-portalHeroJudul")) {
            this.saveMasterPengaturanForm(false);
        }
        this.activeConfigTab = tab;
        App.renderContent();
    },

    loadTemplateVaksinStandar() {
        if (!confirm("Muat daftar template vaksin & obat standar peternakan domba ke master katalog?")) return;
        const current = Store.getPresetVaksin();
        let addedCount = 0;
        this.presetVaksinTemplates.forEach(t => {
            const exists = current.some(c => (c.nama || '').toLowerCase() === (t.nama || '').toLowerCase());
            if (!exists) {
                current.push({
                    id: "vks-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
                    ...t
                });
                addedCount++;
            }
        });
        Store.savePresetVaksin(current);
        App.showToast(`Berhasil menambahkan ${addedCount} formula template vaksin standar!`, "success");
        App.renderContent();
    },

    onTemplateVaksinSelect(idx) {
        if (idx === "" || idx === null || isNaN(idx)) return;
        const t = this.presetVaksinTemplates[parseInt(idx)];
        if (!t) return;
        const namaEl = document.getElementById("pv-nama");
        const tipeEl = document.getElementById("pv-tipe");
        const dosisEl = document.getElementById("pv-dosis");
        const ruteEl = document.getElementById("pv-rute");
        const intervalEl = document.getElementById("pv-interval");
        const targetEl = document.getElementById("pv-target");

        if (namaEl) namaEl.value = t.nama;
        if (tipeEl) tipeEl.value = t.tipe;
        if (dosisEl) dosisEl.value = t.dosis;
        if (ruteEl) ruteEl.value = t.rute;
        if (intervalEl) intervalEl.value = t.intervalHari;
        if (targetEl) targetEl.value = t.target;
    },

    openModalTambahPresetVaksin() {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="flask-conical" class="w-5 h-5 text-rose-600"></i> Tambah Preset Vaksin / Obat Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <div class="p-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-1">
                    <label class="block font-bold text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1.5">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-rose-600"></i> ⚡ Pilih Template Standar Cepat:
                    </label>
                    <select onchange="PengaturanModule.onTemplateVaksinSelect(this.value)" class="w-full p-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-xs font-semibold">
                        <option value="">-- Pilih dari Template Standar (Otomatis Isi Form) --</option>
                        ${this.presetVaksinTemplates.map((t, i) => `
                            <option value="${i}">${t.nama} (${t.tipe})</option>
                        `).join('')}
                    </select>
                    <p class="text-[10px] text-slate-500">Pilih formula di atas untuk langsung mengisi nama, klasifikasi, dosis, rute, interval, dan target medis.</p>
                </div>

                <form onsubmit="PengaturanModule.submitPresetVaksin(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Vaksin / Obat *</label>
                        <input type="text" id="pv-nama" required placeholder="Contoh: Vaksin Antraks / Bovine Plus" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Klasifikasi / Tipe *</label>
                        <select id="pv-tipe" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                            <option value="Vaksin Wajib">Vaksin Wajib (PMK / Antraks)</option>
                            <option value="Antiparasit / Obat Cacing">Antiparasit / Obat Cacing</option>
                            <option value="Suplemen & Imunostimulan">Suplemen & Imunostimulan</option>
                            <option value="Mineral Tulang & Laktasi">Mineral Tulang & Laktasi</option>
                            <option value="Antibiotik Spektrum Luas">Antibiotik Spektrum Luas</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dosis Standar *</label>
                            <input type="text" id="pv-dosis" required placeholder="Contoh: 2 ml / ekor" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rute Aplikasi *</label>
                            <select id="pv-rute" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Subkutan (SC)">Subkutan (Bawah Kulit - SC)</option>
                                <option value="Intramuskular (IM)">Intramuskular (Dalam Otot Daging - IM)</option>
                                <option value="Oral / Minum">Oral (Cekok Minum)</option>
                                <option value="Topikal / Semprot">Topikal (Semprot Luar Kulit/Kuku)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Interval Pengulangan (Hari) *</label>
                        <input type="number" id="pv-interval" required value="90" placeholder="Hari (0 jika kondisional)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Indikasi / Target Medis *</label>
                        <input type="text" id="pv-target" required placeholder="Pencegahan penyakit mulut & kuku atau parasit" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md">Simpan Preset</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitPresetVaksin(e) {
        e.preventDefault();
        const nama = document.getElementById("pv-nama").value.trim();
        const tipe = document.getElementById("pv-tipe").value;
        const dosis = document.getElementById("pv-dosis").value.trim();
        const rute = document.getElementById("pv-rute").value;
        const intervalHari = parseInt(document.getElementById("pv-interval").value) || 0;
        const target = document.getElementById("pv-target").value.trim();

        const presets = Store.getPresetVaksin();
        presets.push({
            id: "vks-" + Date.now(),
            nama,
            tipe,
            dosis,
            rute,
            intervalHari,
            target
        });

        Store.savePresetVaksin(presets);
        App.closeModal();
        App.showToast(`Preset vaksin "${nama}" berhasil ditambahkan!`, "success");
        App.renderContent();
    },

    deletePresetVaksin(id) {
        if (confirm("Hapus formula preset vaksin ini?")) {
            const presets = Store.getPresetVaksin().filter(p => p.id !== id);
            Store.savePresetVaksin(presets);
            App.showToast("Preset vaksin dihapus.", "info");
            App.renderContent();
        }
    },

    // ==========================================
    // 4. MASTER PENGATURAN SISTEM LENGKAP
    // ==========================================
    setMasterConfigTab(tab) {
        if (this.activeConfigTab === "portal" && document.getElementById("cfg-portalHeroJudul")) {
            this.saveMasterPengaturanForm(false);
        }
        this.activeConfigTab = tab;
        App.renderContent();
    },

    renderMasterPengaturan() {
        const cfg = Store.getPengaturan();

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
                            <i data-lucide="sliders" class="w-3.5 h-3.5"></i> Konfigurasi Induk Aplikasi
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Master Pengaturan Sistem BUMKal</h2>
                        <p class="text-xs text-slate-500">Kelola identitas resmi, kop surat, parameter valuasi, tampilan portal publik, produk niaga, dan alur sirkular.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button onclick="App.resetFactory()" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition" title="Kosongkan seluruh data operasional menjadi 0">
                            <i data-lucide="trash-2" class="w-4 h-4"></i> Reset Bersih 0 Data
                        </button>
                        <button onclick="PengaturanModule.saveMasterPengaturanForm()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="save" class="w-4 h-4"></i> Simpan Semua Pengaturan
                        </button>
                    </div>
                </div>

                <!-- 7 SUB-TABS NAVIGATION -->
                <div class="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 space-x-6 text-xs font-bold custom-scroll pb-1">
                    <button onclick="PengaturanModule.setMasterConfigTab('identitas')" class="pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap ${this.activeConfigTab === 'identitas' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}">
                        <i data-lucide="building-2" class="w-4 h-4"></i> 1. Identitas & Kop Surat
                    </button>
                    <button onclick="PengaturanModule.setMasterConfigTab('parameter')" class="pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap ${this.activeConfigTab === 'parameter' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}">
                        <i data-lucide="activity" class="w-4 h-4"></i> 2. Parameter & Valuasi Finansial
                    </button>
                    <button onclick="PengaturanModule.setMasterConfigTab('portal')" class="pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap ${this.activeConfigTab === 'portal' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}">
                        <i data-lucide="layout" class="w-4 h-4"></i> 3. Portal Publik & Elemen
                    </button>
                    <button onclick="PengaturanModule.setMasterConfigTab('produk')" class="pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap ${this.activeConfigTab === 'produk' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}">
                        <i data-lucide="package" class="w-4 h-4"></i> 4. Katalog Produk Niaga (${cfg.produkPupukList?.length || 0})
                    </button>
                    <button onclick="PengaturanModule.setMasterConfigTab('sirkular')" class="pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap ${this.activeConfigTab === 'sirkular' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}">
                        <i data-lucide="repeat" class="w-4 h-4"></i> 5. Alur Sirkular & SOP
                    </button>
                    <button onclick="PengaturanModule.setMasterConfigTab('ekspor')" class="pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap ${this.activeConfigTab === 'ekspor' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> 6. Format Ekspor / Impor
                    </button>
                    <button onclick="PengaturanModule.setMasterConfigTab('ras_ternak')" class="pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap ${this.activeConfigTab === 'ras_ternak' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}">
                        <i data-lucide="tag" class="w-4 h-4"></i> 7. Master Ras Ternak (${Store.getRasTernak()?.length || 0})
                    </button>
                    <button onclick="PengaturanModule.setMasterConfigTab('suplier')" class="pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap ${this.activeConfigTab === 'suplier' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}">
                        <i data-lucide="truck" class="w-4 h-4"></i> 8. Master Data Suplier (${Store.getSuplier ? Store.getSuplier().length : 0})
                    </button>
                    <button onclick="PengaturanModule.setMasterConfigTab('kewenangan')" class="pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap ${this.activeConfigTab === 'kewenangan' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}">
                        <i data-lucide="shield-check" class="w-4 h-4"></i> 9. Kewenangan & Batasan Role
                    </button>
                </div>

                <!-- TAB CONTENT CONTAINER -->
                <form id="form-master-pengaturan" onsubmit="event.preventDefault(); PengaturanModule.saveMasterPengaturanForm();">
                    ${this.renderActiveConfigTabContent(cfg)}
                </form>
            </div>
        `;
    },

    renderActiveConfigTabContent(cfg) {
        switch (this.activeConfigTab) {
            case "identitas":
                return this.renderTabIdentitas(cfg);
            case "parameter":
                return this.renderTabParameter(cfg);
            case "portal":
                return this.renderTabPortal(cfg);
            case "produk":
                return this.renderTabProduk(cfg);
            case "sirkular":
                return this.renderTabSirkular(cfg);
            case "ekspor":
                return this.renderTabEkspor(cfg);
            case "ras_ternak":
                return this.renderTabRasTernak(cfg);
            case "suplier":
                return this.renderTabSuplier();
            case "kewenangan":
                return this.renderTabKewenangan();
            default:
                return this.renderTabIdentitas(cfg);
        }
    },

    // TAB 1: IDENTITAS & KOP SURAT
    renderTabIdentitas(cfg) {
        return `
            <div class="space-y-6">
                <!-- PRATINJAU KOP SURAT LIVE -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 dark:border-slate-700">
                        <div>
                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <i data-lucide="eye" class="w-4 h-4 text-emerald-600"></i> Pratinjau Kop Surat Resmi Terkini
                            </span>
                            <p class="text-[11px] text-slate-400 mt-0.5">Otomatis tertera di setiap cetak laporan resmi, notulensi rapat, dan dokumen PDF</p>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                            <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.modeKopSurat === 'gambar' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}">
                                Mode: ${cfg.modeKopSurat === 'gambar' ? '🖼️ Gambar Banner Utuh' : '📜 Teks Standar + Logo'}
                            </span>
                        </div>
                    </div>

                    <div class="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-serif overflow-hidden">
                        ${Store.getKopSuratHtml()}
                    </div>
                </div>

                <!-- KELOLA LOGO & KOP SURAT DENGAN GAMBAR SENDIRI -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
                    <div class="border-b pb-3 dark:border-slate-700">
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="image" class="w-4 h-4 text-emerald-600"></i> Kustomisasi Logo & Kop Surat dengan Gambar Anda
                        </h3>
                        <p class="text-xs text-slate-500 mt-0.5">Unggah logo instansi atau gambar kop surat utuh langsung dari komputer Anda (tersimpan offline aman di browser).</p>
                    </div>

                    <!-- PILIH MODE KOP SURAT -->
                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-3">
                        <label class="block font-bold text-xs text-slate-700 dark:text-slate-300">Pilih Model Tampilan Kop Surat Saat Dicetak:</label>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${cfg.modeKopSurat !== 'gambar' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                                <input type="radio" name="cfg-modeKopSurat" value="teks" ${cfg.modeKopSurat !== 'gambar' ? 'checked' : ''} onchange="PengaturanModule.setModeKopSurat('teks')" class="mt-0.5 text-emerald-600">
                                <div>
                                    <b class="text-xs text-slate-900 dark:text-white block">Kop Teks Standar Otomatis + Logo di Kiri</b>
                                    <p class="text-[11px] text-slate-500 mt-0.5">Otomatis mencetak Nama Pemerintah Desa, BUMKal, alamat, kontak, dan logo di sisi kiri.</p>
                                </div>
                            </label>

                            <label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${cfg.modeKopSurat === 'gambar' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                                <input type="radio" name="cfg-modeKopSurat" value="gambar" ${cfg.modeKopSurat === 'gambar' ? 'checked' : ''} onchange="PengaturanModule.setModeKopSurat('gambar')" class="mt-0.5 text-indigo-600">
                                <div>
                                    <b class="text-xs text-slate-900 dark:text-white block">Gambar Banner Kop Surat Utuh</b>
                                    <p class="text-[11px] text-slate-500 mt-0.5">Gunakan gambar kop utuh jika Anda telah memiliki kop surat resmi dalam satu gambar banner.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- 1. UPLOAD LOGO INSTANSI -->
                        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                            <div class="flex items-center justify-between">
                                <b class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <i data-lucide="shield" class="w-4 h-4 text-emerald-600"></i> 1. Logo Instansi BUMKal
                                </b>
                                ${cfg.logoUrl ? `
                                    <button type="button" onclick="PengaturanModule.removeLogo()" class="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus Logo
                                    </button>
                                ` : ''}
                            </div>

                            <div class="flex items-center gap-4">
                                <div class="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 flex-shrink-0 shadow-inner">
                                    ${cfg.logoUrl ? `
                                        <img src="${cfg.logoUrl}" alt="Logo" class="w-full h-full object-contain p-1">
                                    ` : `
                                        <div class="text-center p-1">
                                            <i data-lucide="image" class="w-6 h-6 mx-auto text-slate-400 mb-0.5"></i>
                                            <span class="text-[9px] text-slate-400 block font-semibold">Tanpa Logo</span>
                                        </div>
                                    `}
                                </div>
                                <div class="space-y-2 flex-1 text-xs">
                                    <input type="file" id="upload-logo-file" accept="image/*" class="hidden" onchange="PengaturanModule.uploadLogo(this)">
                                    <button type="button" onclick="document.getElementById('upload-logo-file').click()" class="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 active:scale-95">
                                        <i data-lucide="upload" class="w-3.5 h-3.5"></i> Unggah Gambar Logo
                                    </button>
                                    <div class="space-y-1">
                                        <label class="text-[10px] text-slate-500 font-semibold block">Atau tempel Link / URL Gambar Logo:</label>
                                        <input type="text" id="cfg-logoUrl" value="${cfg.logoUrl || ''}" placeholder="https://... atau data:image/..." onchange="PengaturanModule.updateLogoUrl(this.value)" class="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                    </div>
                                </div>
                            </div>
                            <p class="text-[10px] text-slate-400">Format: PNG, JPG, WebP. Disarankan rasio 1:1 (persegi) atau transparan.</p>
                        </div>

                        <!-- 2. UPLOAD BANNER KOP SURAT UTUH -->
                        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                            <div class="flex items-center justify-between">
                                <b class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <i data-lucide="file-text" class="w-4 h-4 text-indigo-600"></i> 2. Gambar Banner Kop Surat
                                </b>
                                ${cfg.kopSuratUrl ? `
                                    <button type="button" onclick="PengaturanModule.removeKopBanner()" class="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus Gambar Kop
                                    </button>
                                ` : ''}
                            </div>

                            <div class="space-y-3 text-xs">
                                <div class="w-full h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 shadow-inner">
                                    ${cfg.kopSuratUrl ? `
                                        <img src="${cfg.kopSuratUrl}" alt="Kop Surat" class="w-full h-full object-contain p-1">
                                    ` : `
                                        <div class="text-center p-1">
                                            <i data-lucide="layout-template" class="w-6 h-6 mx-auto text-slate-400 mb-0.5"></i>
                                            <span class="text-[10px] text-slate-400 font-semibold">Belum Ada Gambar Banner Kop</span>
                                        </div>
                                    `}
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input type="file" id="upload-kop-file" accept="image/*" class="hidden" onchange="PengaturanModule.uploadKopBanner(this)">
                                    <button type="button" onclick="document.getElementById('upload-kop-file').click()" class="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 active:scale-95">
                                        <i data-lucide="upload" class="w-3.5 h-3.5"></i> Unggah Banner Kop
                                    </button>
                                    <button type="button" onclick="PengaturanModule.setModeKopSurat(document.querySelector('input[name=cfg-modeKopSurat]:checked')?.value === 'gambar' ? 'teks' : 'gambar')" class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center justify-center gap-1">
                                        <i data-lucide="toggle-left" class="w-3.5 h-3.5"></i> Ganti Mode Cetak
                                    </button>
                                </div>

                                <div class="space-y-1">
                                    <label class="text-[10px] text-slate-500 font-semibold block">Atau tempel Link / URL Gambar Banner Kop:</label>
                                    <input type="text" id="cfg-kopSuratUrl" value="${cfg.kopSuratUrl || ''}" placeholder="https://... atau data:image/..." onchange="PengaturanModule.updateKopBannerUrl(this.value)" class="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                </div>
                            </div>
                            <p class="text-[10px] text-slate-400">Format: PNG, JPG. Disarankan lebar minimal 800px dan tinggi 100-140px.</p>
                        </div>
                    </div>
                </div>

                <!-- FORM IDENTITAS -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-4 h-4 text-indigo-600"></i> Form Edit Identitas & Pejabat Penandatangan
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap BUMKal / Lembaga</label>
                            <input type="text" id="cfg-namaLembaga" value="${cfg.namaLembaga || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Singkatan / Nama Komersial</label>
                            <input type="text" id="cfg-singkatanLembaga" value="${cfg.singkatanLembaga || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Pemerintah Kalurahan / Desa</label>
                            <input type="text" id="cfg-namaPemerintahDesa" value="${cfg.namaPemerintahDesa || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kapanewon & Kabupaten</label>
                            <input type="text" id="cfg-kapanewonKabupaten" value="${cfg.kapanewonKabupaten || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>

                        <div class="md:col-span-2">
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Alamat Lengkap Sekretariat & Fasilitas Kandang</label>
                            <input type="text" id="cfg-alamatSekretariat" value="${cfg.alamatSekretariat || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>

                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nomor Telepon Kantor</label>
                            <input type="text" id="cfg-kontakTelepon" value="${cfg.kontakTelepon || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nomor WhatsApp Resmi (Order & CS)</label>
                            <input type="text" id="cfg-nomorWhatsApp" value="${cfg.nomorWhatsApp || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>
                        <div class="md:col-span-2">
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Resmi Lembaga BUMKal</label>
                            <input type="email" id="cfg-emailResmi" value="${cfg.emailResmi || cfg.emailLembaga || ''}" placeholder="bumdes.lpm@pleret.desa.id" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>

                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">No. Registrasi BUMDes Kemendesa PDTT</label>
                            <input type="text" id="cfg-noSKKemendesa" value="${cfg.noSKKemendesa || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">No. SK Pengesahan Lurah</label>
                            <input type="text" id="cfg-noSKLurah" value="${cfg.noSKLurah || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white">
                        </div>

                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Unit Usaha Utama</label>
                            <input type="text" id="cfg-unitUsahaUtama" value="${cfg.unitUsahaUtama || 'Penggemukan Domba & Pupuk Organik'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Alamat Fasilitas Kandang</label>
                            <input type="text" id="cfg-alamatKandang" value="${cfg.alamatKandang || 'Kedaton Kulon, Pleret, Bantul'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Penasihat (Ex-Officio)</label>
                            <input type="text" id="cfg-penasihatLembaga" value="${cfg.penasihatLembaga || 'Lurah Pleret'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Rekening Kas Operasional</label>
                            <input type="text" id="cfg-rekeningOperasional" value="${cfg.rekeningOperasional || 'BPD DIY (008.211.009871)'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white">
                        </div>
                        <div class="md:col-span-2">
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dukungan Pendanaan</label>
                            <input type="text" id="cfg-dukunganPendanaan" value="${cfg.dukunganPendanaan || 'BKK Dana Keistimewaan DIY'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        </div>

                        <!-- Pejabat Tanda Tangan & Struktur Pengelola Lembaga -->
                        <div class="md:col-span-2 pt-2 border-t dark:border-slate-700">
                            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <i data-lucide="users" class="w-4 h-4 text-indigo-600"></i> Struktur Organisasi, Pejabat & Penandatangan Dokumen
                            </h4>
                            <p class="text-[11px] text-slate-500 mb-3">Sesuaikan nama pejabat, NIK/NIP, serta sebutan nama jabatan resmi yang akan tercantum pada kop surat, sertifikat, berita acara, dan dokumen BUMKal.</p>
                        </div>

                        <!-- 1. Direktur Utama -->
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                            <div class="flex items-center justify-between border-b pb-1">
                                <b class="text-slate-800 dark:text-slate-200 text-xs">Pimpinan Lembaga (Pihak I)</b>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Direksi</span>
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Jabatan Resmi *</label>
                                <input type="text" id="cfg-jabatanDirektur" value="${cfg.jabatanDirektur || 'Direktur Utama BUMKal LPM'}" placeholder="Contoh: Direktur Utama BUMKal LPM" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Lengkap & Gelar *</label>
                                <input type="text" id="cfg-namaDirektur" value="${cfg.namaDirektur || 'H. Supardi, S.Pt.'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">NIK / NIP Direktur</label>
                                <input type="text" id="cfg-nikDirektur" value="${cfg.nikDirektur || '3402011504780002'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono">
                            </div>
                        </div>

                        <!-- 2. Lurah / Penasihat -->
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                            <div class="flex items-center justify-between border-b pb-1">
                                <b class="text-slate-800 dark:text-slate-200 text-xs">Pemerintah Kalurahan (Pihak II)</b>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Pengawas</span>
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Jabatan Resmi *</label>
                                <input type="text" id="cfg-jabatanLurah" value="${cfg.jabatanLurah || 'Lurah Pleret / Penasihat Ex-Officio'}" placeholder="Contoh: Lurah Pleret / Penasihat Ex-Officio" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Lengkap & Gelar Lurah *</label>
                                <input type="text" id="cfg-namaLurah" value="${cfg.namaLurah || 'Taufiq Kamal, S.Kom.'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">NIP / NIK Lurah</label>
                                <input type="text" id="cfg-nipLurah" value="${cfg.nipLurah || '19790512 200801 1 005'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono">
                            </div>
                        </div>

                        <!-- 3. Sekretaris Lembaga -->
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                            <div class="flex items-center justify-between border-b pb-1">
                                <b class="text-slate-800 dark:text-slate-200 text-xs">Sekretaris Lembaga / Tata Usaha</b>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Sekretariat</span>
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Jabatan Resmi *</label>
                                <input type="text" id="cfg-jabatanSekretaris" value="${cfg.jabatanSekretaris || 'Sekretaris Lembaga & Tata Usaha'}" placeholder="Contoh: Sekretaris Lembaga & Tata Usaha" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Lengkap Sekretaris *</label>
                                <input type="text" id="cfg-namaSekretaris" value="${cfg.namaSekretaris || 'Siti Aminah, S.E.'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">NIK / NIP Sekretaris</label>
                                <input type="text" id="cfg-nikSekretaris" value="${cfg.nikSekretaris || '3402015509920003'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono">
                            </div>
                        </div>

                        <!-- 4. Bendahara Lembaga -->
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                            <div class="flex items-center justify-between border-b pb-1">
                                <b class="text-slate-800 dark:text-slate-200 text-xs">Bendahara & Administrasi Kas</b>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Keuangan</span>
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Jabatan Resmi *</label>
                                <input type="text" id="cfg-jabatanBendahara" value="${cfg.jabatanBendahara || 'Bendahara & Administrasi Keuangan'}" placeholder="Contoh: Bendahara & Administrasi Keuangan" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Lengkap Bendahara *</label>
                                <input type="text" id="cfg-namaBendahara" value="${cfg.namaBendahara || 'Rina Astuti, A.Md.'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">NIK / NIP Bendahara</label>
                                <input type="text" id="cfg-nikBendahara" value="${cfg.nikBendahara || '3402014811950002'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono">
                            </div>
                        </div>

                        <!-- 5. Manajer Operasional Kandang -->
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                            <div class="flex items-center justify-between border-b pb-1">
                                <b class="text-slate-800 dark:text-slate-200 text-xs">Manajer Operasional Lapangan</b>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">Kandang</span>
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Jabatan Resmi *</label>
                                <input type="text" id="cfg-jabatanManajerKandang" value="${cfg.jabatanManajerKandang || 'Manajer Operasional Kandang'}" placeholder="Contoh: Manajer Operasional Kandang" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Pejabat / Manajer *</label>
                                <input type="text" id="cfg-namaManajerKandang" value="${cfg.namaManajerKandang || 'Bambang Sutrisno'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                            </div>
                        </div>

                        <!-- 6. Paramedik & Dokter Hewan -->
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                            <div class="flex items-center justify-between border-b pb-1">
                                <b class="text-slate-800 dark:text-slate-200 text-xs">Paramedik & Dokter Hewan</b>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Medis</span>
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Jabatan Resmi *</label>
                                <input type="text" id="cfg-jabatanParamedik" value="${cfg.jabatanParamedik || 'Paramedik Veteriner & Kesehatan Ternak'}" placeholder="Contoh: Paramedik Veteriner & Kesehatan Ternak" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                            </div>
                            <div>
                                <label class="text-[11px] text-slate-500 block mb-1">Nama Dokter / Paramedik *</label>
                                <input type="text" id="cfg-namaParamedik" value="${cfg.namaParamedik || 'drh. Wahid Hasyim'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                            </div>
                        </div>

                        <!-- 7. Koordinator Sirkular & Limbah -->
                        <div class="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
                            <div class="flex items-center justify-between border-b pb-1">
                                <b class="text-slate-800 dark:text-slate-200 text-xs">Koordinator Sirkular & Pengolahan Limbah Pupuk</b>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Sirkular</span>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] text-slate-500 block mb-1">Nama Jabatan Resmi *</label>
                                    <input type="text" id="cfg-jabatanKoordinatorLimbah" value="${cfg.jabatanKoordinatorLimbah || 'Koordinator Sirkular & Pengolahan Pupuk'}" placeholder="Contoh: Koordinator Sirkular & Pengolahan Pupuk" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                                </div>
                                <div>
                                    <label class="text-[11px] text-slate-500 block mb-1">Nama Lengkap Koordinator *</label>
                                    <input type="text" id="cfg-namaKoordinatorLimbah" value="${cfg.namaKoordinatorLimbah || 'Tri Wahyudi'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // TAB 2: PARAMETER & VALUASI FINANSIAL
    renderTabParameter(cfg) {
        return `
            <div class="space-y-6">
                <!-- SEKSI 1: PARAMETER PAKAN, REALTIME HPP & FCR -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                    <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="utensils" class="w-4 h-4 text-teal-600"></i> Parameter Ransum Pakan, HPP Harian & Efisiensi FCR
                            </h3>
                            <p class="text-xs text-slate-500 mt-0.5">Penyesuaian acuan standar HPP ransum pakan per ekor, beban pakan harian/bulanan kandang, dan target FCR.</p>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                            Pakan & Performa
                        </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div class="p-4 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 space-y-2">
                            <label class="font-bold text-teal-900 dark:text-teal-200 block">HPP Pakan Per Ekor / Hari (Rp) *</label>
                            <p class="text-[11px] text-slate-500">Biaya ransum pakan rata-rata harian (Konsentrat + Silase + Hijauan) per ekor domba.</p>
                            <input type="number" id="cfg-hppPakanPerEkorHari" value="${cfg.hppPakanPerEkorHari || cfg.biayaPakanHarianPerEkor || 7800}" class="w-full p-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 font-bold text-teal-700 dark:text-teal-300">
                        </div>

                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 block">Total Beban Pakan / Hari (Rp)</label>
                            <p class="text-[11px] text-slate-500">Beban ransum seluruh kandang. Isi angka kustom, atau kosongkan (0) untuk otomatis dihitung.</p>
                            <input type="number" id="cfg-totalBebanPakanHarian" value="${cfg.totalBebanPakanHarian || 0}" placeholder="0 (Kalkulasi Otomatis)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>

                        <div class="p-4 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 space-y-2">
                            <label class="font-bold text-teal-900 dark:text-teal-200 block">FCR (Feed Conversion Ratio) *</label>
                            <p class="text-[11px] text-slate-500">Target rasio konversi pakan terhadap kenaikan bobot (Standar efisien: 5.0 - 6.5).</p>
                            <input type="number" step="0.1" id="cfg-targetFcr" value="${cfg.targetFcr || 5.5}" class="w-full p-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 font-bold text-teal-700 dark:text-teal-300">
                        </div>

                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 block">Estimasi Biaya Pakan (1 Bln) (Rp)</label>
                            <p class="text-[11px] text-slate-500">Anggaran pakan bulanan kandang. Kosongkan (0) untuk otomatis dihitung (30 hari x beban harian).</p>
                            <input type="number" id="cfg-estimasiBiayaPakanBulan" value="${cfg.estimasiBiayaPakanBulan || 0}" placeholder="0 (Kalkulasi Otomatis)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>
                </div>

                <!-- SEKSI 2: PARAMETER PENGOLAHAN LIMBAH & KAPASITAS KOMPOS KOHE -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                    <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="recycle" class="w-4 h-4 text-purple-600"></i> Parameter Produksi & Kapasitas Pengolahan Limbah Kohe
                            </h3>
                            <p class="text-xs text-slate-500 mt-0.5">Penetapan rata-rata produksi harian kotoran hewan dan daya tampung kapasitas instalasi fermentasi.</p>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                            Sirkular Ekonomi
                        </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div class="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
                            <label class="font-bold text-purple-900 dark:text-purple-200 block">Rata-rata Produksi Kohe (kg/hari) *</label>
                            <p class="text-[11px] text-slate-500">Estimasi total rata-rata feses & urin domba harian (Tampil di dashboard limbah: ~${cfg.rataRataKoheHarianKg || 91} kg/hari).</p>
                            <input type="number" id="cfg-rataRataKoheHarianKg" value="${cfg.rataRataKoheHarianKg || 91}" class="w-full p-2.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 font-bold text-purple-700 dark:text-purple-300">
                        </div>

                        <div class="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
                            <label class="font-bold text-purple-900 dark:text-purple-200 block">Total Kapasitas Pengolahan Limbah (Ton / L) *</label>
                            <p class="text-[11px] text-slate-500">Daya tampung instalasi fermentasi POP & drum POC BUMKal (Tampil di dashboard limbah: ${cfg.totalKapasitasLimbahTon || 5.1} Ton / L).</p>
                            <input type="number" step="0.1" id="cfg-totalKapasitasLimbahTon" value="${cfg.totalKapasitasLimbahTon || 5.1}" class="w-full p-2.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 font-bold text-purple-700 dark:text-purple-300">
                        </div>
                    </div>
                </div>

                <!-- SEKSI 3: PARAMETER VALUASI ASET BIOLOGIS & FINANSIAL -->
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                    <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="calculator" class="w-4 h-4 text-emerald-600"></i> Parameter Valuasi Aset Biologis & Finansial BUMDes
                            </h3>
                            <p class="text-xs text-slate-500 mt-0.5">Konfigurasi nilai tukar daging hidup, multiplier pejantan/bunting, target PADes, dan safety stock pakan.</p>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Keuangan & APBKal
                        </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 block">Harga Daging Hidup per Kg (Rp)</label>
                            <p class="text-[11px] text-slate-500">Dasar kalkulasi nilai valuasi biologis seluruh populasi ternak aktif.</p>
                            <input type="number" id="cfg-hargaDagingHidupPerKg" value="${cfg.hargaDagingHidupPerKg || 75000}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600">
                        </div>

                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 block">Multiplier Pejantan Unggul</label>
                            <p class="text-[11px] text-slate-500">Faktor pengali harga untuk pejantan bibit/pemacek (default: 1.35x).</p>
                            <input type="number" step="0.05" id="cfg-multiplierPejantan" value="${cfg.multiplierPejantan || 1.35}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>

                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 block">Multiplier Indukan Bunting</label>
                            <p class="text-[11px] text-slate-500">Faktor pengali harga untuk indukan bunting (default: 1.25x).</p>
                            <input type="number" step="0.05" id="cfg-multiplierBunting" value="${cfg.multiplierBunting || 1.25}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>

                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 block">Target Setoran PADes Tahunan (Rp)</label>
                            <p class="text-[11px] text-slate-500">Target kontribusi PADes ke APBKal Kalurahan Pleret tahun berjalan.</p>
                            <input type="number" id="cfg-targetSetoranPADes" value="${cfg.targetSetoranPADes || 35000000}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-indigo-600">
                        </div>

                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 block">Safety Stock Pakan Minimum (Kg)</label>
                            <p class="text-[11px] text-slate-500">Batas alarm merah reorder point pada modul gudang pakan.</p>
                            <input type="number" id="cfg-safetyStockPakanKg" value="${cfg.safetyStockPakanKg || 300}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>

                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between">
                            <div>
                                <label class="font-bold text-slate-700 dark:text-slate-300 block">Aksi Simpan Parameter</label>
                                <p class="text-[11px] text-slate-500">Simpan perubahan parameter ke sistem sekarang.</p>
                            </div>
                            <button type="button" onclick="PengaturanModule.saveMasterPengaturanForm()" class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95">
                                <i data-lucide="save" class="w-4 h-4"></i> Simpan Seluruh Parameter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // TAB 3: PORTAL PUBLIK & ELEMEN
    renderTabPortal(cfg) {
        return `
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
                <!-- Header Card -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 dark:border-slate-700">
                    <div>
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="globe" class="w-4 h-4 text-blue-600"></i> Kustomisasi Halaman Muka Portal Publik
                        </h3>
                        <p class="text-xs text-slate-500 mt-0.5">Atur judul banner, teks sambutan resmi, serta kendalikan visibilitas setiap modul yang ditampilkan kepada masyarakat umum.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="App.switchView('public')" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold transition">
                            <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Buka Muka Publik
                        </button>
                        <button type="button" onclick="PengaturanModule.saveMasterPengaturanForm()" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition active:scale-95">
                            <i data-lucide="save" class="w-3.5 h-3.5"></i> Simpan Pengaturan Portal
                        </button>
                    </div>
                </div>

                <!-- Konten Banner & Teks Sambutan -->
                <div class="space-y-4 text-xs">
                    <div>
                        <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul Utama Hero Banner</label>
                        <input type="text" id="cfg-portalHeroJudul" value="${cfg.portalHeroJudul || ''}" placeholder="Contoh: Lumbung Ternak Terpadu Kalurahan Pleret" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white">
                    </div>

                    <div>
                        <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Slogan / Subjudul Deskripsi Portal</label>
                        <textarea id="cfg-portalHeroSlogan" rows="2" placeholder="Deskripsi ringkas program peternakan dan visi kalurahan..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white leading-relaxed">${cfg.portalHeroSlogan || ''}</textarea>
                    </div>

                    <div>
                        <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Teks Pengumuman Banner Terkini</label>
                        <input type="text" id="cfg-portalAnnouncement" value="${cfg.portalAnnouncement || ''}" placeholder="Pengumuman penting untuk warga atau pembeli..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                </div>

                <!-- PENGATURAN VISIBILITAS MODUL PUBLIK -->
                <div class="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <b class="text-slate-900 dark:text-white text-xs block">Pengaturan Visibilitas Modul Pada Portal Publik:</b>
                            <p class="text-[11px] text-slate-500">Centang atau hilangkan centang untuk mengaktifkan atau menyembunyikan modul pada portal masyarakat sesuai kebutuhan.</p>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                            <button type="button" onclick="PengaturanModule.toggleAllPortalModules(true)" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                                ✓ Tampilkan Semua
                            </button>
                            <span class="text-slate-300">|</span>
                            <button type="button" onclick="PengaturanModule.toggleAllPortalModules(false)" class="text-rose-600 dark:text-rose-400 font-bold hover:underline">
                                ✗ Sembunyikan Semua
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <!-- 1. Banner Pengumuman -->
                        <label id="card-showAnnouncement" class="flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${cfg.showAnnouncement ? 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-600 shadow-sm' : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'}">
                            <input type="checkbox" id="cfg-showAnnouncement" ${cfg.showAnnouncement ? 'checked' : ''} onchange="PengaturanModule.handlePortalModuleToggle('showAnnouncement', this)" class="w-4 h-4 mt-0.5 rounded text-emerald-600">
                            <div class="flex-1 space-y-1">
                                <div class="flex items-center justify-between">
                                    <b class="text-slate-900 dark:text-slate-100 font-bold">1. Banner Pengumuman Resmi</b>
                                    <span id="badge-showAnnouncement" class="px-2 py-0.5 rounded text-[10px] font-bold ${cfg.showAnnouncement ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}">
                                        ${cfg.showAnnouncement ? '🟢 Ditampilkan' : '⚪ Disembunyikan'}
                                    </span>
                                </div>
                                <p class="text-[11px] text-slate-500">Tampilkan pita pengumuman dan kabar terkini di bagian atas portal publik.</p>
                            </div>
                        </label>

                        <!-- 2. Statistik Transparansi Live -->
                        <label id="card-showLiveStats" class="flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${cfg.showLiveStats ? 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-600 shadow-sm' : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'}">
                            <input type="checkbox" id="cfg-showLiveStats" ${cfg.showLiveStats ? 'checked' : ''} onchange="PengaturanModule.handlePortalModuleToggle('showLiveStats', this)" class="w-4 h-4 mt-0.5 rounded text-emerald-600">
                            <div class="flex-1 space-y-1">
                                <div class="flex items-center justify-between">
                                    <b class="text-slate-900 dark:text-slate-100 font-bold">2. Statistik Transparansi Live</b>
                                    <span id="badge-showLiveStats" class="px-2 py-0.5 rounded text-[10px] font-bold ${cfg.showLiveStats ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}">
                                        ${cfg.showLiveStats ? '🟢 Ditampilkan' : '⚪ Disembunyikan'}
                                    </span>
                                </div>
                                <p class="text-[11px] text-slate-500">4 kartu counter: total populasi aktif, ADG harian rata-rata, pupuk diproduksi, dan luas bank pakan.</p>
                            </div>
                        </label>

                        <!-- 3. Katalog Domba Siap Jual -->
                        <label id="card-showKatalogDomba" class="flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${cfg.showKatalogDomba ? 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-600 shadow-sm' : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'}">
                            <input type="checkbox" id="cfg-showKatalogDomba" ${cfg.showKatalogDomba ? 'checked' : ''} onchange="PengaturanModule.handlePortalModuleToggle('showKatalogDomba', this)" class="w-4 h-4 mt-0.5 rounded text-emerald-600">
                            <div class="flex-1 space-y-1">
                                <div class="flex items-center justify-between">
                                    <b class="text-slate-900 dark:text-slate-100 font-bold">3. Katalog Domba Siap Jual</b>
                                    <span id="badge-showKatalogDomba" class="px-2 py-0.5 rounded text-[10px] font-bold ${cfg.showKatalogDomba ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}">
                                        ${cfg.showKatalogDomba ? '🟢 Ditampilkan' : '⚪ Disembunyikan'}
                                    </span>
                                </div>
                                <p class="text-[11px] text-slate-500">Etalase foto domba siap jual, filter ras, bobot timbang, estimasi harga, dan tombol pesan via WhatsApp.</p>
                            </div>
                        </label>

                        <!-- 4. Pencarian Eartag & Bebas PMK -->
                        <label id="card-showCekEartag" class="flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${cfg.showCekEartag ? 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-600 shadow-sm' : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'}">
                            <input type="checkbox" id="cfg-showCekEartag" ${cfg.showCekEartag ? 'checked' : ''} onchange="PengaturanModule.handlePortalModuleToggle('showCekEartag', this)" class="w-4 h-4 mt-0.5 rounded text-emerald-600">
                            <div class="flex-1 space-y-1">
                                <div class="flex items-center justify-between">
                                    <b class="text-slate-900 dark:text-slate-100 font-bold">4. Pencarian Eartag & Bebas PMK</b>
                                    <span id="badge-showCekEartag" class="px-2 py-0.5 rounded text-[10px] font-bold ${cfg.showCekEartag ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}">
                                        ${cfg.showCekEartag ? '🟢 Ditampilkan' : '⚪ Disembunyikan'}
                                    </span>
                                </div>
                                <p class="text-[11px] text-slate-500">Form cek transparansi eartag publik untuk memeriksa sertifikat digital ternak dan riwayat vaksin.</p>
                            </div>
                        </label>

                        <!-- 5. Katalog Pupuk Kompos POP & POC -->
                        <label id="card-showKatalogPupuk" class="flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${cfg.showKatalogPupuk ? 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-600 shadow-sm' : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'}">
                            <input type="checkbox" id="cfg-showKatalogPupuk" ${cfg.showKatalogPupuk ? 'checked' : ''} onchange="PengaturanModule.handlePortalModuleToggle('showKatalogPupuk', this)" class="w-4 h-4 mt-0.5 rounded text-emerald-600">
                            <div class="flex-1 space-y-1">
                                <div class="flex items-center justify-between">
                                    <b class="text-slate-900 dark:text-slate-100 font-bold">5. Katalog Pupuk Kompos POP & POC</b>
                                    <span id="badge-showKatalogPupuk" class="px-2 py-0.5 rounded text-[10px] font-bold ${cfg.showKatalogPupuk ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}">
                                        ${cfg.showKatalogPupuk ? '🟢 Ditampilkan' : '⚪ Disembunyikan'}
                                    </span>
                                </div>
                                <p class="text-[11px] text-slate-500">Etalase produk hasil olahan feses & urin domba (pupuk padat dan cair) dengan harga dan pemesanan WA.</p>
                            </div>
                        </label>

                        <!-- 6. Diagram Edukasi Sirkular Farming -->
                        <label id="card-showDiagramSirkular" class="flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${cfg.showDiagramSirkular ? 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-600 shadow-sm' : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'}">
                            <input type="checkbox" id="cfg-showDiagramSirkular" ${cfg.showDiagramSirkular ? 'checked' : ''} onchange="PengaturanModule.handlePortalModuleToggle('showDiagramSirkular', this)" class="w-4 h-4 mt-0.5 rounded text-emerald-600">
                            <div class="flex-1 space-y-1">
                                <div class="flex items-center justify-between">
                                    <b class="text-slate-900 dark:text-slate-100 font-bold">6. Diagram Edukasi Sirkular Farming</b>
                                    <span id="badge-showDiagramSirkular" class="px-2 py-0.5 rounded text-[10px] font-bold ${cfg.showDiagramSirkular ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}">
                                        ${cfg.showDiagramSirkular ? '🟢 Ditampilkan' : '⚪ Disembunyikan'}
                                    </span>
                                </div>
                                <p class="text-[11px] text-slate-500">Bagan edukasi alur 4 tahap integrasi tanpa sampah (zero waste): kandang, pupuk kohe, bank pakan HPT, & ternak.</p>
                                <button type="button" onclick="event.preventDefault(); event.stopPropagation(); PengaturanModule.openModalEditDiagramSirkular()" class="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition">
                                    <i data-lucide="edit-3" class="w-3 h-3"></i> Edit Isi Bagan Alur Sirkular
                                </button>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Bottom Save Action Bar -->
                <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p class="text-[11px] text-slate-500">Perubahan visibilitas modul akan langsung tersimpan dan berpengaruh pada pengunjung Portal Muka Publik.</p>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="App.switchView('public')" class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5">
                            <i data-lucide="eye" class="w-4 h-4"></i> Lihat Tampilan Muka Publik
                        </button>
                        <button type="button" onclick="PengaturanModule.saveMasterPengaturanForm()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5">
                            <i data-lucide="save" class="w-4 h-4"></i> Simpan Pengaturan Portal Publik
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // TAB 4: MASTER PRODUK NIAGA
    renderTabProduk(cfg) {
        const list = cfg.produkPupukList || [];
        return `
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 dark:border-slate-700">
                    <div>
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="package" class="w-4 h-4 text-emerald-600"></i> Master Katalog Produk Olahan Pupuk Kohe
                        </h3>
                        <p class="text-xs text-slate-500">Produk yang ditampilkan pada katalog penjualan Muka Publik dan Kasir POS BUMKal.</p>
                    </div>
                    <button type="button" onclick="PengaturanModule.openModalTambahProdukNiaga()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition">
                        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Produk Baru
                    </button>
                </div>

                <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            <tr>
                                <th class="p-3 w-16">Foto</th>
                                <th class="p-3">Nama Produk</th>
                                <th class="p-3">Tipe</th>
                                <th class="p-3">Harga Jual</th>
                                <th class="p-3">Satuan</th>
                                <th class="p-3">Kapasitas / Berat</th>
                                <th class="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            ${list.map((p, idx) => `
                                <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                                    <td class="p-3">
                                        ${p.foto 
                                            ? `<img src="${p.foto}" class="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">` 
                                            : `<div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400"><i data-lucide="image" class="w-5 h-5"></i></div>`
                                        }
                                    </td>
                                    <td class="p-3">
                                        <b class="text-slate-900 dark:text-white block text-sm">${p.nama}</b>
                                        <span class="text-[11px] text-slate-400">${p.deskripsi || '-'}</span>
                                    </td>
                                    <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.tipe.includes('POP') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">${p.tipe}</span></td>
                                    <td class="p-3 font-bold text-emerald-600">Rp ${(p.harga).toLocaleString('id-ID')}</td>
                                    <td class="p-3 text-slate-600 dark:text-slate-400">${p.satuan}</td>
                                    <td class="p-3 text-slate-600 dark:text-slate-400">${p.beratKg} kg/L</td>
                                    <td class="p-3 text-center">
                                        <div class="flex items-center justify-center gap-1">
                                            <button type="button" onclick="PengaturanModule.openModalEditProdukNiaga('${p.id}')" class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition" title="Edit Produk & Foto">
                                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                                            </button>
                                            <button type="button" onclick="PengaturanModule.deleteProdukNiaga('${p.id}')" class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition" title="Hapus Produk">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // TAB 5: ALUR SIRKULAR & SOP
    renderTabSirkular(cfg) {
        const rantai = cfg.rantaiSirkular || [];
        return `
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
                <div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="repeat" class="w-4 h-4 text-emerald-600"></i> Rantai Sirkular Farming & Standar Operasional (SOP)
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">Definisikan 4 pilar integrasi peternakan domba dengan kebun tanaman dan pengolahan limbah.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    ${rantai.map(r => `
                        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 space-y-2">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">${r.no}</span>
                                <input type="text" id="cfg-sirkular-judul-${r.no}" value="${r.judul}" class="font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-600 w-full p-1">
                            </div>
                            <textarea id="cfg-sirkular-desc-${r.no}" rows="2" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">${r.deskripsi}</textarea>
                        </div>
                    `).join('')}
                </div>

                <div class="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label class="font-bold text-slate-800 dark:text-slate-200 block">SOP Jadwal Rutin Pemberian Pakan Harian</label>
                    <input type="text" id="cfg-sopPemberianPakan" value="${cfg.sopPemberianPakan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                </div>
            </div>
        `;
    },

    // TAB 6: PREFERENSI FORMAT EKSPOR / IMPOR
    renderTabEkspor(cfg) {
        return `
            <div class="space-y-6">
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                    <div>
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i> Preferensi Default Ekspor & Impor
                        </h3>
                        <p class="text-xs text-slate-500 mt-0.5">Tentukan format bawaan saat mengunduh data domba, kas keuangan, atau rekapitulasi laporan.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                            <b class="text-slate-800 dark:text-slate-200 block">Pemisah Karakter CSV (Delimiter)</b>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="cfg-exportDelimiter" value=";" ${cfg.exportDelimiter === ';' ? 'checked' : ''} class="text-emerald-600">
                                <div>
                                    <b class="text-slate-800 dark:text-slate-200">Titik-Koma ( ; ) - Sangat Direkomendasikan</b>
                                    <p class="text-[11px] text-slate-500">Standar regional Microsoft Excel Windows di Indonesia. Kolom A, B, C langsung terbelah sempurna.</p>
                                </div>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="cfg-exportDelimiter" value="," ${cfg.exportDelimiter === ',' ? 'checked' : ''} class="text-emerald-600">
                                <div>
                                    <b class="text-slate-800 dark:text-slate-200">Koma ( , ) - Standar Internasional</b>
                                    <p class="text-[11px] text-slate-500">Untuk software berbahasa Inggris, Google Sheets, atau integrasi pemrograman.</p>
                                </div>
                            </label>
                        </div>

                        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                            <b class="text-slate-800 dark:text-slate-200 block">Format File Unduhan Default</b>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="cfg-exportDefaultFormat" value="excel" ${cfg.exportDefaultFormat === 'excel' ? 'checked' : ''} class="text-emerald-600">
                                <div>
                                    <b class="text-slate-800 dark:text-slate-200">Microsoft Excel Spreadsheet (.xls)</b>
                                    <p class="text-[11px] text-slate-500">Langsung membuka tabel Excel dengan header warna hijau dan garis tabel rapi.</p>
                                </div>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="cfg-exportDefaultFormat" value="csv" ${cfg.exportDefaultFormat === 'csv' ? 'checked' : ''} class="text-emerald-600">
                                <div>
                                    <b class="text-slate-800 dark:text-slate-200">File Teks CSV (.csv)</b>
                                    <p class="text-[11px] text-slate-500">Format data mentah teks ringan dengan encoding UTF-8 BOM.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- TEST DOWNLOAD BUTTONS -->
                    <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
                        <span class="text-xs font-semibold text-slate-500">Uji Coba Langsung Unduhan:</span>
                        <button type="button" onclick="PenggemukanModule.downloadTemplateExcel()" class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1.5">
                            <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5"></i> Tes Unduh Excel (.xls)
                        </button>
                        <button type="button" onclick="PenggemukanModule.downloadTemplateCSVSemicolon()" class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold transition flex items-center gap-1.5">
                            <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Tes Unduh CSV Titik-Koma (;)
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // TAB 7: MASTER RAS TERNAK (KAMBING & DOMBA)
    renderTabRasTernak(cfg) {
        const list = Store.getRasTernak();
        const dombaList = Store.getDomba();

        return `
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 dark:border-slate-700">
                    <div>
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="tag" class="w-4 h-4 text-emerald-600"></i> Master Katalog Ras & Jenis Ternak (Kambing & Domba)
                        </h3>
                        <p class="text-xs text-slate-500">Kelola master jenis ternak kambing & domba untuk pendaftaran hewan dan filter otomatis.</p>
                    <div class="flex items-center gap-2 flex-wrap">
                        <button type="button" onclick="PengaturanModule.loadTemplateRasStandar()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold text-xs shadow-sm transition active:scale-95">
                            <i data-lucide="download-cloud" class="w-4 h-4"></i> Muat Template Ras Standar
                        </button>
                        <button type="button" onclick="PengaturanModule.openModalTambahRasTernak()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition active:scale-95">
                            <i data-lucide="plus" class="w-4 h-4"></i> Tambah Jenis Ternak Baru
                        </button>
                    </div>

                <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            <tr>
                                <th class="p-3">Nama Ras / Jenis</th>
                                <th class="p-3">Kategori / Spesies</th>
                                <th class="p-3">Deskripsi & Karakteristik</th>
                                <th class="p-3 text-center">Populasi Terdata</th>
                                <th class="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            ${list.map(r => {
                                const count = dombaList.filter(d => (d.ras || '').toLowerCase() === (r.nama || '').toLowerCase()).length;
                                const isKambing = (r.kategori || '').toLowerCase() === 'kambing';
                                return `
                                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                                        <td class="p-3">
                                            <b class="text-slate-900 dark:text-white block font-bold text-xs">${r.nama}</b>
                                            <span class="text-[10px] text-slate-400 font-mono">${r.id}</span>
                                        </td>
                                        <td class="p-3">
                                            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${isKambing ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}">
                                                ${r.kategori || 'Domba'}
                                            </span>
                                        </td>
                                        <td class="p-3 text-slate-600 dark:text-slate-400 max-w-xs">${r.deskripsi || '-'}</td>
                                        <td class="p-3 text-center">
                                            <span class="px-2.5 py-0.5 rounded-full font-bold font-mono text-xs ${count > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-slate-100 text-slate-500'}">
                                                ${count} Ekor
                                            </span>
                                        </td>
                                        <td class="p-3 text-center">
                                            <div class="flex items-center justify-center gap-1.5">
                                                <button type="button" onclick="PengaturanModule.openModalEditRasTernak('${r.id}')" title="Ubah Ras" class="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition">
                                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                                </button>
                                                <button type="button" onclick="PengaturanModule.deleteRasTernak('${r.id}')" title="Hapus Ras" class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // TAB 8: MASTER DATA SUPLIER & MITRA PENGADAAN
    renderTabSuplier() {
        const list = Store.getSuplier ? Store.getSuplier() : [];
        const dombaList = Store.getDomba ? Store.getDomba() : [];

        return `
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 dark:border-slate-700">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                            <i data-lucide="truck" class="w-3.5 h-3.5"></i> Rekanan & Vendor Peternakan
                        </div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Master Data Mitra Suplier (Ternak, Pakan & Obat)
                        </h3>
                        <p class="text-xs text-slate-500">Kelola database suplier penyedia bibit domba bakalan, pakan konsentrat, silase hijauan, obat, dan sarana kandang.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="PengaturanModule.openModalTambahSuplier()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Tambah Suplier Baru
                        </button>
                    </div>
                </div>

                <!-- STATS BAR SUPLIER -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                        <span class="text-slate-400 block text-[11px]">Total Mitra Terdaftar</span>
                        <b class="text-slate-800 dark:text-slate-200 text-base font-extrabold">${list.length} Vendor</b>
                    </div>
                    <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <span class="text-emerald-600 dark:text-emerald-400 block text-[11px]">Mitra Bibit & Bakalan</span>
                        <b class="text-emerald-700 dark:text-emerald-300 text-base font-extrabold">${list.filter(s => (s.kategori || '').includes('Bibit') || (s.kategori || '').includes('Ternak')).length} Mitra</b>
                    </div>
                    <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <span class="text-blue-600 dark:text-blue-400 block text-[11px]">Mitra Pakan & Konsentrat</span>
                        <b class="text-blue-700 dark:text-blue-300 text-base font-extrabold">${list.filter(s => (s.kategori || '').includes('Pakan')).length} Mitra</b>
                    </div>
                    <div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                        <span class="text-purple-600 dark:text-purple-400 block text-[11px]">Status Aktif</span>
                        <b class="text-purple-700 dark:text-purple-300 text-base font-extrabold">${list.filter(s => s.status !== 'Nonaktif').length} Aktif</b>
                    </div>
                </div>

                <!-- TABLE SUPLIER -->
                <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                            <tr>
                                <th class="p-3">Nama Perusahaan / Mitra</th>
                                <th class="p-3">Kategori Suplai</th>
                                <th class="p-3">Kontak & Telepon</th>
                                <th class="p-3">Alamat & Kota</th>
                                <th class="p-3">Rekening Bank</th>
                                <th class="p-3 text-center">Ternak Tersuplai</th>
                                <th class="p-3 text-center">Status</th>
                                <th class="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            ${list.length === 0 ? `
                                <tr>
                                    <td colspan="8" class="p-6 text-center text-slate-400">Belum ada data suplier terdaftar.</td>
                                </tr>
                            ` : list.map(s => {
                                const countDomba = dombaList.filter(d => (d.asalTernak || '').toLowerCase().includes(s.nama.toLowerCase())).length;
                                return `
                                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                                        <td class="p-3">
                                            <b class="text-slate-900 dark:text-white block font-bold text-xs">${s.nama}</b>
                                            <span class="text-[10px] text-slate-400 font-mono">${s.id}</span>
                                        </td>
                                        <td class="p-3">
                                            <span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                ${s.kategori || 'Bibit Ternak'}
                                            </span>
                                        </td>
                                        <td class="p-3">
                                            <div class="font-semibold text-slate-800 dark:text-slate-200">${s.kontak || '-'}</div>
                                            <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                                                <i data-lucide="phone" class="w-3 h-3"></i> ${s.telepon || '-'}
                                            </div>
                                        </td>
                                        <td class="p-3 text-slate-600 dark:text-slate-400 max-w-xs">
                                            <div>${s.alamat || '-'}</div>
                                            <span class="text-[10px] font-bold text-slate-500">${s.kota || 'Bantul'}</span>
                                        </td>
                                        <td class="p-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                                            ${s.rekening || '-'}
                                        </td>
                                        <td class="p-3 text-center">
                                            <span class="px-2.5 py-0.5 rounded-full font-bold font-mono text-xs ${countDomba > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}">
                                                ${countDomba} Ekor
                                            </span>
                                        </td>
                                        <td class="p-3 text-center">
                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}">
                                                ${s.status || 'Aktif'}
                                            </span>
                                        </td>
                                        <td class="p-3 text-center">
                                            <div class="flex items-center justify-center gap-1.5">
                                                <button type="button" onclick="PengaturanModule.openModalEditSuplier('${s.id}')" title="Ubah Suplier" class="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition">
                                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                                </button>
                                                <button type="button" onclick="PengaturanModule.hapusSuplier('${s.id}')" title="Hapus Suplier" class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    openModalTambahSuplier() {
        const nextId = "SPL-" + String((Store.getSuplier ? Store.getSuplier().length : 0) + 1).padStart(3, "0");
        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="truck" class="w-5 h-5 text-emerald-600"></i> Tambah Mitra / Suplier Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PengaturanModule.submitTambahSuplier(event)" class="space-y-3.5 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Suplier *</label>
                            <input type="text" id="spl-add-id" required value="${nextId}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold font-mono">
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan / Peternak Mitra *</label>
                            <input type="text" id="spl-add-nama" required placeholder="Contoh: CV Ternak Mandiri Berkah" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Suplai *</label>
                            <select id="spl-add-kategori" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                <option value="Bibit Domba & Kambing">Bibit Domba & Kambing</option>
                                <option value="Pakan Konsentrat & Bahan Baku">Pakan Konsentrat & Bahan Baku</option>
                                <option value="Hijauan Pakan & Silase">Hijauan Pakan & Silase</option>
                                <option value="Vaksin & Farmasi Hewan">Vaksin & Farmasi Hewan</option>
                                <option value="Sarpras & Peralatan Kandang">Sarpras & Peralatan Kandang</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Kemitraan *</label>
                            <select id="spl-add-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold text-emerald-600">
                                <option value="Aktif">Aktif</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Kontak Person (PIC)</label>
                            <input type="text" id="spl-add-kontak" placeholder="Contoh: Pak Maryono" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. WhatsApp / Telepon *</label>
                            <input type="text" id="spl-add-telepon" required placeholder="Contoh: 0812-3456-7890" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kota / Kabupaten</label>
                            <input type="text" id="spl-add-kota" value="Bantul" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rekening Bank Suplier</label>
                            <input type="text" id="spl-add-rekening" placeholder="Contoh: BRI 0123-01-002948-50-2 a.n Maryono" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap Kantor / Farm</label>
                        <input type="text" id="spl-add-alamat" placeholder="Contoh: Jl. Imogiri Timur Km 11, Wonokromo, Pleret" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
                        <textarea id="spl-add-catatan" rows="2" placeholder="Ketentuan spesifikasi ternak atau tempo pembayaran..." class="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 border-t dark:border-slate-700 flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 dark:text-slate-300 font-semibold">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition active:scale-95">Simpan Suplier Baru</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTambahSuplier(e) {
        e.preventDefault();
        const id = document.getElementById("spl-add-id").value.trim();
        const nama = document.getElementById("spl-add-nama").value.trim();
        const kategori = document.getElementById("spl-add-kategori").value;
        const status = document.getElementById("spl-add-status").value;
        const kontak = document.getElementById("spl-add-kontak").value.trim();
        const telepon = document.getElementById("spl-add-telepon").value.trim();
        const kota = document.getElementById("spl-add-kota").value.trim();
        const rekening = document.getElementById("spl-add-rekening").value.trim();
        const alamat = document.getElementById("spl-add-alamat").value.trim();
        const catatan = document.getElementById("spl-add-catatan").value.trim();

        Store.addSuplier({
            id,
            nama,
            kategori,
            status,
            kontak,
            telepon,
            kota,
            rekening,
            alamat,
            catatan
        });

        App.closeModal();
        App.showToast(`Suplier '${nama}' berhasil ditambahkan ke master data!`, "success");
        App.renderContent();
    },

    openModalEditSuplier(suplierId) {
        const supliers = Store.getSuplier ? Store.getSuplier() : [];
        const suplier = supliers.find(s => s.id === suplierId);
        if (!suplier) return;

        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i> Ubah Data Suplier: ${suplier.nama}
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PengaturanModule.submitEditSuplier(event, '${suplier.id}')" class="space-y-3.5 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Suplier</label>
                            <input type="text" id="spl-edit-id" readonly value="${suplier.id}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 font-bold font-mono text-slate-500">
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan / Peternak Mitra *</label>
                            <input type="text" id="spl-edit-nama" required value="${suplier.nama}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Suplai *</label>
                            <select id="spl-edit-kategori" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                ${['Bibit Domba & Kambing', 'Pakan Konsentrat & Bahan Baku', 'Hijauan Pakan & Silase', 'Vaksin & Farmasi Hewan', 'Sarpras & Peralatan Kandang', 'Lainnya'].map(k => `
                                    <option value="${k}" ${suplier.kategori === k ? 'selected' : ''}>${k}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Kemitraan *</label>
                            <select id="spl-edit-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold text-emerald-600">
                                <option value="Aktif" ${suplier.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                                <option value="Nonaktif" ${suplier.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Kontak Person (PIC)</label>
                            <input type="text" id="spl-edit-kontak" value="${suplier.kontak || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. WhatsApp / Telepon *</label>
                            <input type="text" id="spl-edit-telepon" required value="${suplier.telepon || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kota / Kabupaten</label>
                            <input type="text" id="spl-edit-kota" value="${suplier.kota || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rekening Bank Suplier</label>
                            <input type="text" id="spl-edit-rekening" value="${suplier.rekening || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap Kantor / Farm</label>
                        <input type="text" id="spl-edit-alamat" value="${suplier.alamat || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
                        <textarea id="spl-edit-catatan" rows="2" class="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">${suplier.catatan || ''}</textarea>
                    </div>

                    <div class="pt-3 border-t dark:border-slate-700 flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 dark:text-slate-300 font-semibold">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md transition active:scale-95">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditSuplier(e, suplierId) {
        e.preventDefault();
        const nama = document.getElementById("spl-edit-nama").value.trim();
        const kategori = document.getElementById("spl-edit-kategori").value;
        const status = document.getElementById("spl-edit-status").value;
        const kontak = document.getElementById("spl-edit-kontak").value.trim();
        const telepon = document.getElementById("spl-edit-telepon").value.trim();
        const kota = document.getElementById("spl-edit-kota").value.trim();
        const rekening = document.getElementById("spl-edit-rekening").value.trim();
        const alamat = document.getElementById("spl-edit-alamat").value.trim();
        const catatan = document.getElementById("spl-edit-catatan").value.trim();

        Store.updateSuplier(suplierId, {
            nama,
            kategori,
            status,
            kontak,
            telepon,
            kota,
            rekening,
            alamat,
            catatan
        });

        App.closeModal();
        App.showToast(`Data suplier '${nama}' berhasil diperbarui!`, "success");
        App.renderContent();
    },

    hapusSuplier(suplierId) {
        const supliers = Store.getSuplier ? Store.getSuplier() : [];
        const suplier = supliers.find(s => s.id === suplierId);
        if (!suplier) return;
        if (confirm(`Apakah Anda yakin ingin menghapus mitra suplier '${suplier.nama}'?`)) {
            Store.deleteSuplier(suplierId);
            App.showToast(`Suplier '${suplier.nama}' telah dihapus.`, "success");
            App.renderContent();
        }
    },

    // TAB 9: KEWENANGAN & BATASAN ROLE USER
    setRolePermissionTab(role) {
        this.activeRolePermissionTab = role;
        App.renderContent();
    },

    renderTabKewenangan() {
        const perms = Store.getRolePermissions ? Store.getRolePermissions() : Store.defaultRolePermissions();
        const activeRole = this.activeRolePermissionTab || "pemerintah";
        const currentRolePerm = perms[activeRole] || { allowedMenus: [], actions: { canCreate: false, canEdit: false, canDelete: false, canExport: false }, keterangan: "" };

        // 23 menus grouped
        const menuGroups = [
            {
                groupName: "1. Navigasi Utama & Dashboard",
                items: [
                    { key: "dashboard", label: "Dashboard Ringkasan & KPI", desc: "Statistik populasi ternak, grafik ADG, dan neraca finansial." },
                    { key: "scan_penimbang_cepat", label: "Scan & Penimbangan Cepat", desc: "Kamera pemindai eartag QR / barcode dan input timbang instan." },
                    { key: "laporan", label: "Pusat Laporan Lengkap Terpadu", desc: "Rekapitulasi seluruh laporan produksi, medis, dan neraca kas." }
                ]
            },
            {
                groupName: "2. Penggemukan & Inventaris Domba",
                items: [
                    { key: "siklus_batch", label: "Manajemen Siklus & Batch", desc: "Tracking periode penggemukan, FCR target, dan tanggal panen." },
                    { key: "master_kandang", label: "Master Denah Kandang & Sekat", desc: "Daftar sekat, kapasitas kandang, dan alokasi koloni ternak." },
                    { key: "data_ternak", label: "Inventaris Data Ternak Lengkap", desc: "Eartag, bangsa/ras ternak, asal suplier, silsilah breeding." },
                    { key: "history_timbang", label: "Riwayat Penimbangan & ADG", desc: "Log kurva kenaikan bobot harian ternak secara periodik." },
                    { key: "cetak_stiker_qr", label: "Generator Cetak Stiker Eartag", desc: "Pencetakan stiker barcode dan QR eartag multi-ukuran lembar." },
                    { key: "import_csv", label: "Import Data Ternak CSV", desc: "Migrasi data awal ternak skala banyak sekaligus dari spreadsheet." }
                ]
            },
            {
                groupName: "3. Pakan & Kesehatan Ternak",
                items: [
                    { key: "input_pakan_harian", label: "Pemberian Pakan Harian", desc: "Distribusi pakan konsentrat & hijauan per sekat kandang." },
                    { key: "scan_vaksin_medis", label: "Scan Vaksinasi & Penanganan Medis", desc: "Pemberian obat, vitamin, obat cacing, dan penandaan sakit." },
                    { key: "stok_pakan_hpp", label: "Gudang Pakan & Kalkulasi HPP", desc: "Sisa persediaan pakan konsentrat dan harga pokok pakan per kg." },
                    { key: "rekam_medis", label: "Buku Rekam Medis Hewan", desc: "Riwayat histori penyakit ternak dan tindakan paramedik." },
                    { key: "limbah_organik", label: "Pengolahan Limbah Feses & Urine", desc: "Konversi kotoran menjadi pupuk kompos dan pupuk organik cair." }
                ]
            },
            {
                groupName: "4. Keuangan BUMDes & Tata Usaha",
                items: [
                    { key: "buku_kas_bumdes", label: "Buku Kas & Transaksi Operasional", desc: "Pencatatan arus kas masuk, pengeluaran kandang, dan bukti nota." },
                    { key: "laporan_rapat_evaluasi", label: "Laporan Rapat Evaluasi & LPJ", desc: "Format laporan bulanan untuk Muskal, Lurah, dan Bamuskal." },
                    { key: "executive_dss_pades", label: "Executive DSS & Proyeksi PADes", desc: "Simulasi setoran PADes kalurahan dan analisa kelayakan bisnis." },
                    { key: "penjualan_ternak", label: "Penjualan Ternak & Invoice", desc: "Kasir penjualan domba qurban/aqiqah, karkas, dan faktur resmi." },
                    { key: "gaji_operasional", label: "Honorarium Tenaga Kerja & Paramedik", desc: "Penggajian staf kandang, insentif lembur, dan fee dokter hewan." }
                ]
            },
            {
                groupName: "5. Pengaturan & Tata Kelola Sistem",
                items: [
                    { key: "master_pengaturan", label: "Pengaturan Parameter & Kop BUMKal", desc: "Identitas lembaga, parameter margin, katalog pupuk, dan ras." },
                    { key: "bumdes_backup_purge", label: "Backup, Restore & Snapshot Data", desc: "Pencadangan file JSON lokal, titik pemulihan, dan reset pabrik." },
                    { key: "firebase_sync", label: "Sinkronisasi Cloud Real-Time", desc: "Koneksi Google Firebase Firestore untuk sinkronisasi antar-perangkat." },
                    { key: "master_preset_vaksin", label: "Master Formula Preset Vaksin", desc: "Standarisasi dosis dan jadwal perlakuan farmasi veteriner." },
                    { key: "manajemen_user", label: "Manajemen User & Akun Petugas", desc: "Pengelolaan password login staf, NIK, dan penugasan role." }
                ]
            }
        ];

        const totalAllowed = (currentRolePerm.allowedMenus || []).length;
        const totalMenus = menuGroups.reduce((acc, g) => acc + g.items.length, 0);

        return `
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 dark:border-slate-700">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
                            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Hak Akses & Matriks Kewenangan
                        </div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Master Data Kewenangan & Batasan Role Pengguna
                        </h3>
                        <p class="text-xs text-slate-500">Atur batasan menu apa saja yang boleh dibuka dan tindakan apa saja yang diizinkan untuk masing-masing role pengguna.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="PengaturanModule.resetCurrentRolePermissions('${activeRole}')" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Reset Role
                        </button>
                        <button type="button" onclick="PengaturanModule.saveCurrentRolePermissions('${activeRole}')" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="save" class="w-4 h-4"></i> Simpan Izin Role
                        </button>
                    </div>
                </div>

                <!-- 3 ROLE SELECTOR TABS -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button type="button" onclick="PengaturanModule.setRolePermissionTab('pemerintah')" class="p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${activeRole === 'pemerintah' ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40'}">
                        <div>
                            <div class="flex items-center gap-2 font-extrabold text-xs">
                                🏛️ Pemerintah (Pemerintah Kalurahan)
                            </div>
                            <p class="text-[11px] text-slate-500 mt-1">Lurah, Pamong, Carik, & Dewan Penasihat</p>
                        </div>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            ${perms.pemerintah?.allowedMenus?.length || 0} / ${totalMenus}
                        </span>
                    </button>

                    <button type="button" onclick="PengaturanModule.setRolePermissionTab('direksi')" class="p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${activeRole === 'direksi' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40'}">
                        <div>
                            <div class="flex items-center gap-2 font-extrabold text-xs">
                                👔 Direksi (Manajemen BUMKal)
                            </div>
                            <p class="text-[11px] text-slate-500 mt-1">Direktur, Sekretaris, Bendahara, Manajer</p>
                        </div>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            ${perms.direksi?.allowedMenus?.length || 0} / ${totalMenus}
                        </span>
                    </button>

                    <button type="button" onclick="PengaturanModule.setRolePermissionTab('anak_kandang')" class="p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${activeRole === 'anak_kandang' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40'}">
                        <div>
                            <div class="flex items-center gap-2 font-extrabold text-xs">
                                👨‍🌾 Anak Kandang (Operator Lapangan)
                            </div>
                            <p class="text-[11px] text-slate-500 mt-1">Petugas Pakan, Timbang, Paramedik</p>
                        </div>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            ${perms.anak_kandang?.allowedMenus?.length || 0} / ${totalMenus}
                        </span>
                    </button>
                </div>

                <!-- DESKRIPSI ROLE AKTIF & HAK AKSI GLOBAL -->
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 dark:border-slate-800">
                        <div>
                            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Deskripsi Peran:</span>
                            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">${currentRolePerm.keterangan || '-'}</h4>
                        </div>
                        <div class="text-xs font-semibold text-slate-500">
                            Izin Menu Aktif: <b class="text-emerald-600 dark:text-emerald-400">${totalAllowed}</b> dari ${totalMenus} Menu
                        </div>
                    </div>

                    <!-- HAK AKSI MUTASI DATA -->
                    <div>
                        <b class="text-xs text-slate-700 dark:text-slate-300 block mb-2">Hak Aksi Operasi Data (Action Permissions):</b>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer">
                                <input type="checkbox" id="role-action-create" ${currentRolePerm.actions?.canCreate ? 'checked' : ''} class="w-4 h-4 text-emerald-600 rounded">
                                <span class="font-medium text-slate-800 dark:text-slate-200">Tambah Data Baru</span>
                            </label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer">
                                <input type="checkbox" id="role-action-edit" ${currentRolePerm.actions?.canEdit ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded">
                                <span class="font-medium text-slate-800 dark:text-slate-200">Ubah / Edit Data</span>
                            </label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer">
                                <input type="checkbox" id="role-action-delete" ${currentRolePerm.actions?.canDelete ? 'checked' : ''} class="w-4 h-4 text-rose-600 rounded">
                                <span class="font-medium text-slate-800 dark:text-slate-200">Hapus Data</span>
                            </label>
                            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer">
                                <input type="checkbox" id="role-action-export" ${currentRolePerm.actions?.canExport ? 'checked' : ''} class="w-4 h-4 text-purple-600 rounded">
                                <span class="font-medium text-slate-800 dark:text-slate-200">Ekspor Laporan & CSV</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- MATRIKS HAK AKSES PER MENU -->
                <div class="space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <i data-lucide="layers" class="w-4 h-4 text-indigo-600"></i> Matriks Daftar Menu yang Diizinkan
                        </h4>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="PengaturanModule.toggleAllRoleMenus(true)" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                                ✓ Beri Akses Semua (${totalMenus})
                            </button>
                            <span class="text-slate-300">|</span>
                            <button type="button" onclick="PengaturanModule.toggleAllRoleMenus(false)" class="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline">
                                ✗ Cabut Semua Akses
                            </button>
                        </div>
                    </div>

                    <div class="space-y-4">
                        ${menuGroups.map(g => `
                            <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-2.5">
                                <h5 class="text-xs font-bold text-slate-700 dark:text-slate-300 border-b pb-1.5 dark:border-slate-800 flex items-center justify-between">
                                    <span>${g.groupName}</span>
                                    <span class="text-[10px] font-semibold text-slate-400">${g.items.filter(i => (currentRolePerm.allowedMenus || []).includes(i.key)).length} / ${g.items.length} diizinkan</span>
                                </h5>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    ${g.items.map(item => {
                                        const isChecked = (currentRolePerm.allowedMenus || []).includes(item.key);
                                        return `
                                            <label class="p-3 rounded-xl border transition flex items-start gap-2.5 cursor-pointer select-none ${isChecked ? 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-600 shadow-sm' : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'}">
                                                <input type="checkbox" name="role-menu-check" value="${item.key}" ${isChecked ? 'checked' : ''} onchange="this.closest('label').classList.toggle('border-emerald-400', this.checked); this.closest('label').classList.toggle('opacity-70', !this.checked)" class="w-4 h-4 mt-0.5 text-emerald-600 rounded">
                                                <div class="flex-1">
                                                    <b class="text-xs font-bold text-slate-800 dark:text-slate-200 block">${item.label}</b>
                                                    <p class="text-[10px] text-slate-500 leading-tight mt-0.5">${item.desc}</p>
                                                    <span class="text-[9px] font-mono text-slate-400 mt-1 inline-block">route: ${item.key}</span>
                                                </div>
                                            </label>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- BOTTOM SAVE ACTION -->
                <div class="pt-4 border-t dark:border-slate-700 flex justify-end gap-2">
                    <button type="button" onclick="PengaturanModule.saveCurrentRolePermissions('${activeRole}')" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5">
                        <i data-lucide="save" class="w-4 h-4"></i> Simpan Perubahan Role ${activeRole.toUpperCase()}
                    </button>
                </div>
            </div>
        `;
    },

    toggleAllRoleMenus(selectAll = true) {
        document.querySelectorAll('input[name="role-menu-check"]').forEach(cb => {
            cb.checked = selectAll;
            const parent = cb.closest('label');
            if (parent) {
                if (selectAll) {
                    parent.classList.add('border-emerald-400');
                    parent.classList.remove('opacity-70');
                } else {
                    parent.classList.remove('border-emerald-400');
                    parent.classList.add('opacity-70');
                }
            }
        });
    },

    saveCurrentRolePermissions(role) {
        const perms = Store.getRolePermissions ? Store.getRolePermissions() : Store.defaultRolePermissions();
        const allowedMenus = [];
        document.querySelectorAll('input[name="role-menu-check"]:checked').forEach(cb => {
            allowedMenus.push(cb.value);
        });

        const actions = {
            canCreate: document.getElementById("role-action-create")?.checked || false,
            canEdit: document.getElementById("role-action-edit")?.checked || false,
            canDelete: document.getElementById("role-action-delete")?.checked || false,
            canExport: document.getElementById("role-action-export")?.checked || false
        };

        if (!perms[role]) {
            perms[role] = {};
        }
        perms[role].allowedMenus = allowedMenus;
        perms[role].actions = actions;

        Store.saveRolePermissions(perms);
        if (App.updateSidebarVisibility) App.updateSidebarVisibility();
        App.showToast(`Kewenangan role '${role.toUpperCase()}' berhasil disimpan (${allowedMenus.length} menu aktif)!`, "success");
        App.renderContent();
    },

    resetCurrentRolePermissions(role) {
        if (confirm(`Kembalikan pengaturan batasan hak akses role '${role.toUpperCase()}' ke kondisi bawaan pabrik?`)) {
            const defaults = Store.defaultRolePermissions();
            const perms = Store.getRolePermissions();
            if (defaults[role]) {
                perms[role] = defaults[role];
                Store.saveRolePermissions(perms);
                if (App.updateSidebarVisibility) App.updateSidebarVisibility();
                App.showToast(`Kewenangan role '${role.toUpperCase()}' telah direset ke default pabrik.`, "success");
                App.renderContent();
            }
        }
    },

    handlePortalModuleToggle(key, inputEl) {
        const isChecked = inputEl.checked;
        const card = document.getElementById(`card-${key}`);
        const badge = document.getElementById(`badge-${key}`);

        if (card) {
            if (isChecked) {
                card.classList.add('bg-white', 'dark:bg-slate-900', 'border-emerald-400', 'dark:border-emerald-600', 'shadow-sm');
                card.classList.remove('bg-slate-100/60', 'dark:bg-slate-800/40', 'border-slate-200', 'dark:border-slate-700', 'opacity-70');
            } else {
                card.classList.remove('bg-white', 'dark:bg-slate-900', 'border-emerald-400', 'dark:border-emerald-600', 'shadow-sm');
                card.classList.add('bg-slate-100/60', 'dark:bg-slate-800/40', 'border-slate-200', 'dark:border-slate-700', 'opacity-70');
            }
        }

        if (badge) {
            badge.className = `px-2 py-0.5 rounded text-[10px] font-bold ${isChecked ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`;
            badge.innerText = isChecked ? '🟢 Ditampilkan' : '⚪ Disembunyikan';
        }

        const cfg = Store.getPengaturan();
        cfg[key] = isChecked;
        Store.savePengaturan(cfg);

        const labels = {
            showAnnouncement: 'Banner Pengumuman',
            showLiveStats: 'Statistik Transparansi Live',
            showKatalogDomba: 'Katalog Domba Siap Jual',
            showCekEartag: 'Pencarian Eartag Transparan',
            showKatalogPupuk: 'Katalog Pupuk Kompos',
            showDiagramSirkular: 'Diagram Edukasi Sirkular'
        };
        const label = labels[key] || key;
        App.showToast(`Modul '${label}' kini ${isChecked ? 'DITAMPILKAN' : 'DISEMBUNYIKAN'} di Portal Publik.`, isChecked ? 'success' : 'info');
    },

    toggleAllPortalModules(enableAll = true) {
        const keys = ['showAnnouncement', 'showLiveStats', 'showKatalogDomba', 'showCekEartag', 'showKatalogPupuk', 'showDiagramSirkular'];
        const cfg = Store.getPengaturan();

        keys.forEach(key => {
            const input = document.getElementById(`cfg-${key}`);
            if (input) {
                input.checked = enableAll;
                const card = document.getElementById(`card-${key}`);
                const badge = document.getElementById(`badge-${key}`);
                if (card) {
                    if (enableAll) {
                        card.classList.add('bg-white', 'dark:bg-slate-900', 'border-emerald-400', 'dark:border-emerald-600', 'shadow-sm');
                        card.classList.remove('bg-slate-100/60', 'dark:bg-slate-800/40', 'border-slate-200', 'dark:border-slate-700', 'opacity-70');
                    } else {
                        card.classList.remove('bg-white', 'dark:bg-slate-900', 'border-emerald-400', 'dark:border-emerald-600', 'shadow-sm');
                        card.classList.add('bg-slate-100/60', 'dark:bg-slate-800/40', 'border-slate-200', 'dark:border-slate-700', 'opacity-70');
                    }
                }
                if (badge) {
                    badge.className = `px-2 py-0.5 rounded text-[10px] font-bold ${enableAll ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`;
                    badge.innerText = enableAll ? '🟢 Ditampilkan' : '⚪ Disembunyikan';
                }
            }
            cfg[key] = enableAll;
        });

        Store.savePengaturan(cfg);
        App.showToast(`Seluruh modul portal publik berhasil ${enableAll ? 'DITAMPILKAN' : 'DISEMBUNYIKAN'}!`, enableAll ? 'success' : 'info');
    },

    openModalEditDiagramSirkular() {
        const cfg = Store.getPengaturan();
        const rantai = cfg.rantaiSirkular || [
            { no: 1, judul: "Pengumpulan Kohe", deskripsi: "Feses padat dan urin dialirkan dari kandang panggung." },
            { no: 2, judul: "Fermentasi & Dekomposisi", deskripsi: "Proses biologis EM4 & Trichoderma menghasilkan POP dan POC." },
            { no: 3, judul: "Aplikasi ke Kebun HPT", deskripsi: "Pupuk menyuburkan kebun rumput odot & legum indigofera." },
            { no: 4, judul: "Pakan Mandiri & ADG", deskripsi: "Pakan bernutrisi tinggi memacu pertumbuhan domba optimal." }
        ];

        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                            <i data-lucide="recycle" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">Edit Bagan Alur Sirkular Farming</h3>
                            <p class="text-xs text-slate-500">Sesuaikan judul, deskripsi, dan tahapan alur zero waste circular economy di Portal Publik.</p>
                        </div>
                    </div>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PengaturanModule.submitEditDiagramSirkular(event)" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Label Kategori / Subjudul (Badge Atas)</label>
                        <input type="text" id="ds-subjudul" value="${cfg.sirkularSubjudul || 'Integrated Circular Agriculture'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-700 dark:text-emerald-400">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Utama Seksi</label>
                        <input type="text" id="ds-judul" value="${cfg.sirkularJudul || 'Siklus Tertutup Tanpa Sampah (Zero Waste)'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-lg text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Paragraf Deskripsi Pengantar</label>
                        <textarea id="ds-deskripsi" rows="3" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 leading-relaxed">${cfg.sirkularDeskripsi || 'Bank Pakan HPT menghasilkan nutrisi hijauan segar & silase untuk domba. Limbah kohe dan urin dialirkan ke instalasi pupuk organik yang kembali menyuburkan lahan.'}</textarea>
                    </div>

                    <div class="pt-3 border-t dark:border-slate-700 space-y-3">
                        <div class="flex items-center justify-between">
                            <b class="text-slate-900 dark:text-white text-sm">Daftar Tahap Alur Sirkular</b>
                            <button type="button" onclick="PengaturanModule.addSirkularStep()" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow transition">
                                <i data-lucide="plus" class="w-3 h-3"></i> Tambah Tahap
                            </button>
                        </div>

                        <div id="ds-steps-container" class="space-y-3">
                            ${rantai.map((step, idx) => `
                                <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2" data-step-idx="${idx}">
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="flex items-center gap-2">
                                            <span class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">${step.no || idx + 1}</span>
                                            <b class="text-slate-700 dark:text-slate-300">Tahap ${idx + 1}</b>
                                        </div>
                                        <button type="button" onclick="PengaturanModule.removeSirkularStep(${idx})" class="text-rose-500 hover:text-rose-700 text-[11px] font-bold flex items-center gap-0.5">
                                            <i data-lucide="trash-2" class="w-3 h-3"></i> Hapus
                                        </button>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                            <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Judul Tahap</label>
                                            <input type="text" id="ds-step-judul-${idx}" value="${step.judul}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                                        </div>
                                        <div>
                                            <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Penjelasan / Deskripsi Tahap</label>
                                            <input type="text" id="ds-step-desk-${idx}" value="${step.deskripsi}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="pt-3 border-t dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <button type="button" onclick="PengaturanModule.resetDiagramSirkular()" class="text-xs text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1">
                            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Kembalikan ke Bawaan
                        </button>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                            <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition active:scale-95 flex items-center gap-1.5">
                                <i data-lucide="save" class="w-4 h-4"></i> Simpan Perubahan Alur Sirkular
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditDiagramSirkular(e) {
        e.preventDefault();
        const cfg = Store.getPengaturan();

        cfg.sirkularSubjudul = document.getElementById("ds-subjudul")?.value.trim() || "Integrated Circular Agriculture";
        cfg.sirkularJudul = document.getElementById("ds-judul")?.value.trim() || "Siklus Tertutup Tanpa Sampah (Zero Waste)";
        cfg.sirkularDeskripsi = document.getElementById("ds-deskripsi")?.value.trim() || "";

        // Collect steps
        const container = document.getElementById("ds-steps-container");
        const stepDivs = container ? container.querySelectorAll("[data-step-idx]") : [];
        const steps = [];
        stepDivs.forEach((div, idx) => {
            const judul = document.getElementById(`ds-step-judul-${idx}`)?.value.trim() || `Tahap ${idx + 1}`;
            const deskripsi = document.getElementById(`ds-step-desk-${idx}`)?.value.trim() || "";
            steps.push({ no: idx + 1, judul, deskripsi });
        });

        cfg.rantaiSirkular = steps.length > 0 ? steps : cfg.rantaiSirkular;
        Store.savePengaturan(cfg);

        App.closeModal();
        App.showToast("Bagan alur sirkular farming berhasil diperbarui!", "success");
        App.renderContent();
    },

    addSirkularStep() {
        const container = document.getElementById("ds-steps-container");
        if (!container) return;
        const existingSteps = container.querySelectorAll("[data-step-idx]");
        const newIdx = existingSteps.length;

        const div = document.createElement("div");
        div.className = "p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2";
        div.setAttribute("data-step-idx", newIdx);
        div.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">${newIdx + 1}</span>
                    <b class="text-slate-700 dark:text-slate-300">Tahap ${newIdx + 1}</b>
                </div>
                <button type="button" onclick="PengaturanModule.removeSirkularStep(${newIdx})" class="text-rose-500 hover:text-rose-700 text-[11px] font-bold flex items-center gap-0.5">
                    <i data-lucide="trash-2" class="w-3 h-3"></i> Hapus
                </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                    <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Judul Tahap</label>
                    <input type="text" id="ds-step-judul-${newIdx}" value="" placeholder="Contoh: Distribusi Hasil Panen" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                </div>
                <div>
                    <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Penjelasan / Deskripsi Tahap</label>
                    <input type="text" id="ds-step-desk-${newIdx}" value="" placeholder="Penjelasan singkat proses tahap ini..." class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                </div>
            </div>
        `;
        container.appendChild(div);
        if (typeof lucide !== 'undefined') lucide.createIcons();
        App.showToast(`Tahap ${newIdx + 1} berhasil ditambahkan. Silakan isi judul dan deskripsi.`, "info");
    },

    removeSirkularStep(idx) {
        const container = document.getElementById("ds-steps-container");
        if (!container) return;
        const steps = container.querySelectorAll("[data-step-idx]");
        if (steps.length <= 1) {
            App.showToast("Minimal harus ada 1 tahap alur sirkular!", "warning");
            return;
        }
        if (steps[idx]) {
            steps[idx].remove();
            // Re-index remaining steps
            const remaining = container.querySelectorAll("[data-step-idx]");
            remaining.forEach((el, newIdx) => {
                el.setAttribute("data-step-idx", newIdx);
                const judulInput = el.querySelector(`[id^="ds-step-judul-"]`);
                const deskInput = el.querySelector(`[id^="ds-step-desk-"]`);
                if (judulInput) judulInput.id = `ds-step-judul-${newIdx}`;
                if (deskInput) deskInput.id = `ds-step-desk-${newIdx}`;
            });
            App.showToast("Tahap alur sirkular berhasil dihapus.", "info");
        }
    },

    resetDiagramSirkular() {
        if (confirm("Kembalikan seluruh isi bagan alur sirkular ke data bawaan pabrik?")) {
            const cfg = Store.getPengaturan();
            const defaults = Store.defaultPengaturan();
            cfg.sirkularSubjudul = defaults.sirkularSubjudul;
            cfg.sirkularJudul = defaults.sirkularJudul;
            cfg.sirkularDeskripsi = defaults.sirkularDeskripsi;
            cfg.rantaiSirkular = defaults.rantaiSirkular;
            Store.savePengaturan(cfg);
            App.closeModal();
            App.showToast("Bagan alur sirkular telah dikembalikan ke bawaan.", "success");
            App.renderContent();
        }
    },

    saveMasterPengaturanForm(showToast = true) {
        const current = Store.getPengaturan();
        const updated = { ...current };

        // Helper get value safely
        const getVal = (id, def = '') => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : def;
        };
        const getNum = (id, def = 0) => {
            const el = document.getElementById(id);
            return el ? parseFloat(el.value) || def : def;
        };
        const getCheck = (id, def = true) => {
            const el = document.getElementById(id);
            return el ? el.checked : def;
        };

        // 1. Identitas
        if (document.getElementById("cfg-namaLembaga")) {
            updated.namaLembaga = getVal("cfg-namaLembaga", updated.namaLembaga);
            updated.singkatanLembaga = getVal("cfg-singkatanLembaga", updated.singkatanLembaga);
            updated.namaPemerintahDesa = getVal("cfg-namaPemerintahDesa", updated.namaPemerintahDesa);
            updated.kapanewonKabupaten = getVal("cfg-kapanewonKabupaten", updated.kapanewonKabupaten);
            updated.alamatSekretariat = getVal("cfg-alamatSekretariat", updated.alamatSekretariat);
            updated.kontakTelepon = getVal("cfg-kontakTelepon", updated.kontakTelepon);
            updated.nomorWhatsApp = getVal("cfg-nomorWhatsApp", updated.nomorWhatsApp);
            if (document.getElementById("cfg-emailResmi")) {
                const eVal = getVal("cfg-emailResmi", updated.emailResmi || "").trim();
                updated.emailResmi = eVal;
                updated.emailLembaga = eVal;
            }
            updated.noSKKemendesa = getVal("cfg-noSKKemendesa", updated.noSKKemendesa);
            updated.noSKLurah = getVal("cfg-noSKLurah", updated.noSKLurah);
            updated.jabatanDirektur = getVal("cfg-jabatanDirektur", updated.jabatanDirektur);
            updated.namaDirektur = getVal("cfg-namaDirektur", updated.namaDirektur);
            updated.nikDirektur = getVal("cfg-nikDirektur", updated.nikDirektur);
            updated.jabatanLurah = getVal("cfg-jabatanLurah", updated.jabatanLurah);
            updated.namaLurah = getVal("cfg-namaLurah", updated.namaLurah);
            updated.nipLurah = getVal("cfg-nipLurah", updated.nipLurah);
            updated.jabatanSekretaris = getVal("cfg-jabatanSekretaris", updated.jabatanSekretaris);
            updated.namaSekretaris = getVal("cfg-namaSekretaris", updated.namaSekretaris);
            updated.nikSekretaris = getVal("cfg-nikSekretaris", updated.nikSekretaris);
            updated.jabatanBendahara = getVal("cfg-jabatanBendahara", updated.jabatanBendahara);
            updated.namaBendahara = getVal("cfg-namaBendahara", updated.namaBendahara);
            updated.nikBendahara = getVal("cfg-nikBendahara", updated.nikBendahara);
            updated.jabatanManajerKandang = getVal("cfg-jabatanManajerKandang", updated.jabatanManajerKandang);
            updated.namaManajerKandang = getVal("cfg-namaManajerKandang", updated.namaManajerKandang);
            updated.jabatanParamedik = getVal("cfg-jabatanParamedik", updated.jabatanParamedik);
            updated.namaParamedik = getVal("cfg-namaParamedik", updated.namaParamedik);
            updated.jabatanKoordinatorLimbah = getVal("cfg-jabatanKoordinatorLimbah", updated.jabatanKoordinatorLimbah);
            updated.namaKoordinatorLimbah = getVal("cfg-namaKoordinatorLimbah", updated.namaKoordinatorLimbah);
            updated.unitUsahaUtama = getVal("cfg-unitUsahaUtama", updated.unitUsahaUtama);
            updated.alamatKandang = getVal("cfg-alamatKandang", updated.alamatKandang);
            updated.penasihatLembaga = getVal("cfg-penasihatLembaga", updated.penasihatLembaga);
            updated.rekeningOperasional = getVal("cfg-rekeningOperasional", updated.rekeningOperasional);
            updated.dukunganPendanaan = getVal("cfg-dukunganPendanaan", updated.dukunganPendanaan);
            if (document.getElementById("cfg-logoUrl")) {
                updated.logoUrl = getVal("cfg-logoUrl", updated.logoUrl);
            }
            if (document.getElementById("cfg-kopSuratUrl")) {
                updated.kopSuratUrl = getVal("cfg-kopSuratUrl", updated.kopSuratUrl);
            }
            const modeKopRadio = document.querySelector('input[name="cfg-modeKopSurat"]:checked');
            if (modeKopRadio) {
                updated.modeKopSurat = modeKopRadio.value;
            }
        }

        // 2. Parameter
        if (document.getElementById("cfg-hargaDagingHidupPerKg") || document.getElementById("cfg-hppPakanPerEkorHari")) {
            updated.hargaDagingHidupPerKg = getNum("cfg-hargaDagingHidupPerKg", updated.hargaDagingHidupPerKg);
            updated.multiplierPejantan = getNum("cfg-multiplierPejantan", updated.multiplierPejantan);
            updated.multiplierBunting = getNum("cfg-multiplierBunting", updated.multiplierBunting);
            updated.targetSetoranPADes = getNum("cfg-targetSetoranPADes", updated.targetSetoranPADes);

            const hppEkor = getNum("cfg-hppPakanPerEkorHari", updated.hppPakanPerEkorHari || updated.biayaPakanHarianPerEkor || 7800);
            updated.hppPakanPerEkorHari = hppEkor;
            updated.biayaPakanHarianPerEkor = hppEkor;

            updated.totalBebanPakanHarian = getNum("cfg-totalBebanPakanHarian", updated.totalBebanPakanHarian || 0);
            updated.targetFcr = getNum("cfg-targetFcr", updated.targetFcr || 5.5);
            updated.estimasiBiayaPakanBulan = getNum("cfg-estimasiBiayaPakanBulan", updated.estimasiBiayaPakanBulan || 0);
            updated.rataRataKoheHarianKg = getNum("cfg-rataRataKoheHarianKg", updated.rataRataKoheHarianKg || 91);
            updated.totalKapasitasLimbahTon = getNum("cfg-totalKapasitasLimbahTon", updated.totalKapasitasLimbahTon || 5.1);
            updated.safetyStockPakanKg = getNum("cfg-safetyStockPakanKg", updated.safetyStockPakanKg || 300);
        }

        // 3. Portal Publik
        if (document.getElementById("cfg-portalHeroJudul")) {
            updated.portalHeroJudul = getVal("cfg-portalHeroJudul", updated.portalHeroJudul);
            updated.portalHeroSlogan = getVal("cfg-portalHeroSlogan", updated.portalHeroSlogan);
            updated.portalAnnouncement = getVal("cfg-portalAnnouncement", updated.portalAnnouncement);
            updated.showAnnouncement = getCheck("cfg-showAnnouncement", updated.showAnnouncement);
            updated.showLiveStats = getCheck("cfg-showLiveStats", updated.showLiveStats);
            updated.showKatalogDomba = getCheck("cfg-showKatalogDomba", updated.showKatalogDomba);
            updated.showCekEartag = getCheck("cfg-showCekEartag", updated.showCekEartag);
            updated.showKatalogPupuk = getCheck("cfg-showKatalogPupuk", updated.showKatalogPupuk);
            updated.showDiagramSirkular = getCheck("cfg-showDiagramSirkular", updated.showDiagramSirkular);
        }

        // 5. Sirkular SOP
        if (document.getElementById("cfg-sirkular-judul-1")) {
            updated.rantaiSirkular = [1, 2, 3, 4].map(no => ({
                no,
                judul: getVal(`cfg-sirkular-judul-${no}`, `Tahap ${no}`),
                deskripsi: getVal(`cfg-sirkular-desc-${no}`, '')
            }));
            updated.sopPemberianPakan = getVal("cfg-sopPemberianPakan", updated.sopPemberianPakan);
        }

        // 6. Ekspor
        const delimRadio = document.querySelector('input[name="cfg-exportDelimiter"]:checked');
        if (delimRadio) updated.exportDelimiter = delimRadio.value;
        const fmtRadio = document.querySelector('input[name="cfg-exportDefaultFormat"]:checked');
        if (fmtRadio) updated.exportDefaultFormat = fmtRadio.value;

        Store.savePengaturan(updated);
        if (showToast) {
            App.showToast("Seluruh pengaturan berhasil disimpan secara permanen!", "success");
        }
        App.renderContent();
    },

    resetMasterPengaturan() {
        App.resetFactory();
    },

    handleProdukFotoUpload(input, previewId = 'prd-foto-preview', urlInputId = 'prd-foto-url') {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const preview = document.getElementById(previewId);
            const placeholder = document.getElementById(previewId.replace('preview', 'placeholder'));
            const urlInput = document.getElementById(urlInputId);
            if (preview) {
                preview.src = dataUrl;
                preview.classList.remove('hidden');
            }
            if (placeholder) {
                placeholder.classList.add('hidden');
            }
            if (urlInput) {
                urlInput.value = dataUrl;
            }
        };
        reader.readAsDataURL(file);
    },

    openModalTambahProdukNiaga() {
        App.openModal(`
            <div class="space-y-4">
                <div class="flex items-center gap-2 border-b pb-3 dark:border-slate-700">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <i data-lucide="package-plus" class="w-4 h-4"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-sm text-slate-900 dark:text-white">Tambah Produk Niaga Baru</h3>
                        <p class="text-xs text-slate-500">Daftarkan produk pupuk atau hasil samping kandang</p>
                    </div>
                </div>

                <form onsubmit="PengaturanModule.submitProdukNiaga(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="font-semibold block mb-1">Nama Produk *</label>
                        <input type="text" id="prd-nama" required placeholder="Contoh: Pupuk Kompos Granul Organik" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>

                    <!-- Input Foto Produk -->
                    <div>
                        <label class="font-semibold block mb-1">Foto Produk (Unggah Gambar / URL)</label>
                        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                            <div class="w-14 h-14 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 flex-shrink-0">
                                <img id="prd-foto-preview" src="" class="hidden w-full h-full object-cover">
                                <i id="prd-foto-placeholder" data-lucide="image" class="w-6 h-6 text-slate-400"></i>
                            </div>
                            <div class="flex-1 space-y-1.5">
                                <input type="file" accept="image/*" onchange="PengaturanModule.handleProdukFotoUpload(this, 'prd-foto-preview', 'prd-foto-url')" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer">
                                <input type="url" id="prd-foto-url" placeholder="Atau tempel URL gambar (https://...)" class="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px]">
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="font-semibold block mb-1">Tipe Produk *</label>
                            <select id="prd-tipe" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium">
                                <option value="POP (Padat)">POP (Padat)</option>
                                <option value="POC (Cair)">POC (Cair)</option>
                                <option value="POP Curah">POP Curah</option>
                                <option value="Media Tanam">Media Tanam</option>
                            </select>
                        </div>
                        <div>
                            <label class="font-semibold block mb-1">Harga Jual (Rp) *</label>
                            <input type="number" id="prd-harga" required placeholder="25000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="font-semibold block mb-1">Satuan Kemasan *</label>
                            <input type="text" id="prd-satuan" required placeholder="karung / botol" value="karung" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="font-semibold block mb-1">Bobot / Volume (kg/L) *</label>
                            <input type="number" id="prd-berat" required placeholder="20" value="20" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>
                    <div>
                        <label class="font-semibold block mb-1">Deskripsi Singkat</label>
                        <textarea id="prd-deskripsi" rows="2" placeholder="Kelebihan dan komposisi produk..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 border-t flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md">Simpan Produk</button>
                    </div>
                </form>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
    },

    openModalEditProdukNiaga(id) {
        const cfg = Store.getPengaturan();
        const p = (cfg.produkPupukList || []).find(item => item.id === id);
        if (!p) {
            App.showToast("Data produk tidak ditemukan!", "error");
            return;
        }

        App.openModal(`
            <div class="space-y-4">
                <div class="flex items-center gap-2 border-b pb-3 dark:border-slate-700">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-sm text-slate-900 dark:text-white">Edit Produk Niaga: ${p.nama}</h3>
                        <p class="text-xs text-slate-500">Perbarui spesifikasi, harga jual, atau foto produk</p>
                    </div>
                </div>

                <form onsubmit="PengaturanModule.submitEditProdukNiaga(event, '${p.id}')" class="space-y-3 text-xs">
                    <div>
                        <label class="font-semibold block mb-1">Nama Produk *</label>
                        <input type="text" id="edit-prd-nama" required value="${p.nama || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>

                    <!-- Input Foto Produk -->
                    <div>
                        <label class="font-semibold block mb-1">Foto Produk (Unggah Gambar / URL)</label>
                        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                            <div class="w-14 h-14 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 flex-shrink-0">
                                <img id="edit-prd-foto-preview" src="${p.foto || ''}" class="${p.foto ? '' : 'hidden'} w-full h-full object-cover">
                                <i id="edit-prd-foto-placeholder" data-lucide="image" class="${p.foto ? 'hidden' : ''} w-6 h-6 text-slate-400"></i>
                            </div>
                            <div class="flex-1 space-y-1.5">
                                <input type="file" accept="image/*" onchange="PengaturanModule.handleProdukFotoUpload(this, 'edit-prd-foto-preview', 'edit-prd-foto-url')" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer">
                                <input type="url" id="edit-prd-foto-url" value="${p.foto || ''}" placeholder="Atau tempel URL gambar (https://...)" class="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px]">
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="font-semibold block mb-1">Tipe Produk *</label>
                            <select id="edit-prd-tipe" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium">
                                <option value="POP (Padat)" ${p.tipe === 'POP (Padat)' ? 'selected' : ''}>POP (Padat)</option>
                                <option value="POC (Cair)" ${p.tipe === 'POC (Cair)' ? 'selected' : ''}>POC (Cair)</option>
                                <option value="POP Curah" ${p.tipe === 'POP Curah' ? 'selected' : ''}>POP Curah</option>
                                <option value="Media Tanam" ${p.tipe === 'Media Tanam' ? 'selected' : ''}>Media Tanam</option>
                            </select>
                        </div>
                        <div>
                            <label class="font-semibold block mb-1">Harga Jual (Rp) *</label>
                            <input type="number" id="edit-prd-harga" required value="${p.harga || 0}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="font-semibold block mb-1">Satuan Kemasan *</label>
                            <input type="text" id="edit-prd-satuan" required value="${p.satuan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="font-semibold block mb-1">Bobot / Volume (kg/L) *</label>
                            <input type="number" id="edit-prd-berat" required value="${p.beratKg || 1}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>
                    <div>
                        <label class="font-semibold block mb-1">Deskripsi Singkat</label>
                        <textarea id="edit-prd-deskripsi" rows="2" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">${p.deskripsi || ''}</textarea>
                    </div>

                    <div class="pt-3 border-t flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
    },

    submitProdukNiaga(e) {
        e.preventDefault();
        const nama = document.getElementById("prd-nama").value.trim();
        const tipe = document.getElementById("prd-tipe").value;
        const harga = parseFloat(document.getElementById("prd-harga").value) || 0;
        const satuan = document.getElementById("prd-satuan").value.trim();
        const beratKg = parseFloat(document.getElementById("prd-berat").value) || 1;
        const deskripsi = document.getElementById("prd-deskripsi").value.trim();
        const foto = document.getElementById("prd-foto-url")?.value.trim() || "";

        const cfg = Store.getPengaturan();
        if (!cfg.produkPupukList) cfg.produkPupukList = [];

        cfg.produkPupukList.push({
            id: "prd-" + Date.now(),
            nama,
            tipe,
            harga,
            satuan,
            beratKg,
            deskripsi,
            foto
        });

        Store.savePengaturan(cfg);
        App.closeModal();
        App.showToast(`Produk "${nama}" berhasil ditambahkan ke katalog niaga!`, "success");
        App.renderContent();
    },

    submitEditProdukNiaga(e, id) {
        e.preventDefault();
        const nama = document.getElementById("edit-prd-nama").value.trim();
        const tipe = document.getElementById("edit-prd-tipe").value;
        const harga = parseFloat(document.getElementById("edit-prd-harga").value) || 0;
        const satuan = document.getElementById("edit-prd-satuan").value.trim();
        const beratKg = parseFloat(document.getElementById("edit-prd-berat").value) || 1;
        const deskripsi = document.getElementById("edit-prd-deskripsi").value.trim();
        const foto = document.getElementById("edit-prd-foto-url")?.value.trim() || "";

        const cfg = Store.getPengaturan();
        if (!cfg.produkPupukList) cfg.produkPupukList = [];

        const idx = cfg.produkPupukList.findIndex(p => p.id === id);
        if (idx !== -1) {
            cfg.produkPupukList[idx] = {
                ...cfg.produkPupukList[idx],
                nama,
                tipe,
                harga,
                satuan,
                beratKg,
                deskripsi,
                foto
            };
            Store.savePengaturan(cfg);
            App.closeModal();
            App.showToast(`Produk "${nama}" berhasil diperbarui!`, "success");
            App.renderContent();
        }
    },

    deleteProdukNiaga(id) {
        if (confirm("Hapus produk ini dari katalog niaga?")) {
            const cfg = Store.getPengaturan();
            cfg.produkPupukList = (cfg.produkPupukList || []).filter(p => p.id !== id);
            Store.savePengaturan(cfg);
            App.showToast("Produk berhasil dihapus!", "success");
            App.renderContent();
        }
    },

    openModalEditIdentitas() {
        const cfg = Store.getPengaturan();
        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-emerald-600"></i> Edit Identitas Lembaga BUMKal
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PengaturanModule.submitEditIdentitas(event)" class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="md:col-span-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap BUMKal *</label>
                            <input type="text" id="edit-namaLembaga" required value="${cfg.namaLembaga || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Pemerintah Kalurahan</label>
                            <input type="text" id="edit-namaPemerintahDesa" value="${cfg.namaPemerintahDesa || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kapanewon & Kabupaten</label>
                            <input type="text" id="edit-kapanewonKabupaten" value="${cfg.kapanewonKabupaten || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nomor Registrasi Kemendesa PDTT</label>
                            <input type="text" id="edit-noSKKemendesa" value="${cfg.noSKKemendesa || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">SK Lurah Pengesahan</label>
                            <input type="text" id="edit-noSKLurah" value="${cfg.noSKLurah || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Unit Usaha Utama</label>
                            <input type="text" id="edit-unitUsahaUtama" value="${cfg.unitUsahaUtama || 'Penggemukan Domba & Pupuk Organik'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Alamat Fasilitas Kandang</label>
                            <input type="text" id="edit-alamatKandang" value="${cfg.alamatKandang || 'Kedaton Kulon, Pleret, Bantul'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Direktur Utama BUMKal</label>
                            <input type="text" id="edit-namaDirektur" value="${cfg.namaDirektur || 'H. Supardi, S.Pt.'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Penasihat (Ex-Officio)</label>
                            <input type="text" id="edit-penasihatLembaga" value="${cfg.penasihatLembaga || 'Lurah Pleret'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Rekening Kas Operasional</label>
                            <input type="text" id="edit-rekeningOperasional" value="${cfg.rekeningOperasional || 'BPD DIY (008.211.009871)'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dukungan Pendanaan</label>
                            <input type="text" id="edit-dukunganPendanaan" value="${cfg.dukunganPendanaan || 'BKK Dana Keistimewaan DIY'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div class="md:col-span-2">
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Alamat Lengkap Sekretariat</label>
                            <input type="text" id="edit-alamatSekretariat" value="${cfg.alamatSekretariat || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Resmi Lembaga BUMKal</label>
                            <input type="email" id="edit-emailResmi" value="${cfg.emailResmi || cfg.emailLembaga || ''}" placeholder="bumdes.lpm@pleret.desa.id" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold text-emerald-600">
                        </div>
                        <div>
                            <label class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nomor WhatsApp Resmi (Order & CS)</label>
                            <input type="text" id="edit-nomorWhatsApp" value="${cfg.nomorWhatsApp || cfg.kontakTelepon || ''}" placeholder="Contoh: 6281223344551" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>

                        <!-- PEJABAT STRUKTURAL & PENANDATANGAN DOKUMEN -->
                        <div class="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
                            <b class="text-slate-800 dark:text-slate-200 block text-xs border-b pb-1 font-bold">Pejabat Struktural & Nama Jabatan Resmi</b>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Jabatan Pimpinan (Direktur)</label>
                                    <input type="text" id="edit-jabatanDirektur" value="${cfg.jabatanDirektur || 'Direktur Utama BUMKal LPM'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold">
                                </div>
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">NIK Direktur</label>
                                    <input type="text" id="edit-nikDirektur" value="${cfg.nikDirektur || '3402011504780002'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono">
                                </div>
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Jabatan Pengawas (Lurah)</label>
                                    <input type="text" id="edit-jabatanLurah" value="${cfg.jabatanLurah || 'Lurah Pleret / Penasihat Ex-Officio'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold">
                                </div>
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">NIP/NIK Lurah</label>
                                    <input type="text" id="edit-nipLurah" value="${cfg.nipLurah || '19790512 200801 1 005'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono">
                                </div>
                            </div>

                            <!-- Sekretaris & Bendahara -->
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Sekretaris *</label>
                                    <input type="text" id="edit-namaSekretaris" value="${cfg.namaSekretaris || 'Siti Aminah, S.E.'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold">
                                </div>
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">NIK/NIP Sekretaris</label>
                                    <input type="text" id="edit-nikSekretaris" value="${cfg.nikSekretaris || '3402015509920003'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono">
                                </div>
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Sebutan Jabatan Sekretaris</label>
                                    <input type="text" id="edit-jabatanSekretaris" value="${cfg.jabatanSekretaris || 'Sekretaris Lembaga & Tata Usaha'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama Bendahara *</label>
                                    <input type="text" id="edit-namaBendahara" value="${cfg.namaBendahara || 'Rina Astuti, A.Md.'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold">
                                </div>
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">NIK/NIP Bendahara</label>
                                    <input type="text" id="edit-nikBendahara" value="${cfg.nikBendahara || '3402014811950002'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono">
                                </div>
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Sebutan Jabatan Bendahara</label>
                                    <input type="text" id="edit-jabatanBendahara" value="${cfg.jabatanBendahara || 'Bendahara & Administrasi Keuangan'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold">
                                </div>
                            </div>

                            <!-- Manajer, Paramedik, Koordinator -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama & Jabatan Manajer Kandang</label>
                                    <input type="text" id="edit-namaManajerKandang" value="${cfg.namaManajerKandang || 'Bambang Sutrisno'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold mb-1">
                                    <input type="text" id="edit-jabatanManajerKandang" value="${cfg.jabatanManajerKandang || 'Manajer Operasional Kandang'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px]">
                                </div>
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama & Jabatan Paramedik Hewan</label>
                                    <input type="text" id="edit-namaParamedik" value="${cfg.namaParamedik || 'drh. Wahid Hasyim'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold mb-1">
                                    <input type="text" id="edit-jabatanParamedik" value="${cfg.jabatanParamedik || 'Paramedik Veteriner & Kesehatan Ternak'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px]">
                                </div>
                                <div class="sm:col-span-2">
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nama & Jabatan Koordinator Limbah</label>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input type="text" id="edit-namaKoordinatorLimbah" value="${cfg.namaKoordinatorLimbah || 'Tri Wahyudi'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold">
                                        <input type="text" id="edit-jabatanKoordinatorLimbah" value="${cfg.jabatanKoordinatorLimbah || 'Koordinator Sirkular & Pengolahan Pupuk'}" class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px]">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- LOGO & KOP SECTION IN MODAL -->
                        <div class="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
                            <b class="text-slate-800 dark:text-slate-200 block text-xs border-b pb-1 font-bold">Kustomisasi Logo & Kop Surat Dokumen</b>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Logo Lembaga / Instansi</label>
                                    <div class="flex items-center gap-2">
                                        <input type="file" id="edit-logoFile" accept="image/*" class="hidden" onchange="PengaturanModule.handleModalImageUpload(this, 'edit-logoUrl')">
                                        <button type="button" onclick="document.getElementById('edit-logoFile').click()" class="px-2.5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-[11px] whitespace-nowrap shadow-sm">
                                            Pilih Berkas
                                        </button>
                                        <input type="text" id="edit-logoUrl" value="${cfg.logoUrl || ''}" placeholder="URL Logo atau Berkas..." class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px]">
                                    </div>
                                </div>

                                <div>
                                    <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Gambar Banner Kop Surat Utuh</label>
                                    <div class="flex items-center gap-2">
                                        <input type="file" id="edit-kopFile" accept="image/*" class="hidden" onchange="PengaturanModule.handleModalImageUpload(this, 'edit-kopSuratUrl')">
                                        <button type="button" onclick="document.getElementById('edit-kopFile').click()" class="px-2.5 py-2 rounded-lg bg-indigo-600 text-white font-bold text-[11px] whitespace-nowrap shadow-sm">
                                            Pilih Berkas
                                        </button>
                                        <input type="text" id="edit-kopSuratUrl" value="${cfg.kopSuratUrl || ''}" placeholder="URL Kop Banner..." class="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px]">
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center gap-4 pt-1">
                                <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Mode Cetak Kop:</span>
                                <label class="flex items-center gap-1.5 cursor-pointer text-[11px]">
                                    <input type="radio" name="edit-modeKopSurat" value="teks" ${cfg.modeKopSurat !== 'gambar' ? 'checked' : ''} class="text-emerald-600"> Teks Standar & Logo
                                </label>
                                <label class="flex items-center gap-1.5 cursor-pointer text-[11px]">
                                    <input type="radio" name="edit-modeKopSurat" value="gambar" ${cfg.modeKopSurat === 'gambar' ? 'checked' : ''} class="text-indigo-600"> Gambar Banner Kop
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="pt-4 border-t dark:border-slate-700 flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 dark:text-slate-300 font-semibold">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition active:scale-95">Simpan Identitas BUMKal</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditIdentitas(e) {
        e.preventDefault();
        const cfg = Store.getPengaturan();
        cfg.namaLembaga = document.getElementById("edit-namaLembaga").value.trim();
        cfg.namaPemerintahDesa = document.getElementById("edit-namaPemerintahDesa").value.trim();
        cfg.kapanewonKabupaten = document.getElementById("edit-kapanewonKabupaten").value.trim();
        cfg.noSKKemendesa = document.getElementById("edit-noSKKemendesa").value.trim();
        cfg.noSKLurah = document.getElementById("edit-noSKLurah").value.trim();
        cfg.unitUsahaUtama = document.getElementById("edit-unitUsahaUtama").value.trim();
        cfg.alamatKandang = document.getElementById("edit-alamatKandang").value.trim();
        cfg.namaDirektur = document.getElementById("edit-namaDirektur").value.trim();
        cfg.penasihatLembaga = document.getElementById("edit-penasihatLembaga").value.trim();
        cfg.rekeningOperasional = document.getElementById("edit-rekeningOperasional").value.trim();
        cfg.dukunganPendanaan = document.getElementById("edit-dukunganPendanaan").value.trim();
        cfg.alamatSekretariat = document.getElementById("edit-alamatSekretariat").value.trim();

        if (document.getElementById("edit-emailResmi")) {
            const eVal = document.getElementById("edit-emailResmi").value.trim();
            cfg.emailResmi = eVal;
            cfg.emailLembaga = eVal;
        }
        if (document.getElementById("edit-nomorWhatsApp")) {
            cfg.nomorWhatsApp = document.getElementById("edit-nomorWhatsApp").value.trim();
        }

        if (document.getElementById("edit-jabatanDirektur")) cfg.jabatanDirektur = document.getElementById("edit-jabatanDirektur").value.trim();
        if (document.getElementById("edit-nikDirektur")) cfg.nikDirektur = document.getElementById("edit-nikDirektur").value.trim();
        if (document.getElementById("edit-jabatanLurah")) cfg.jabatanLurah = document.getElementById("edit-jabatanLurah").value.trim();
        if (document.getElementById("edit-nipLurah")) cfg.nipLurah = document.getElementById("edit-nipLurah").value.trim();
        if (document.getElementById("edit-namaSekretaris")) cfg.namaSekretaris = document.getElementById("edit-namaSekretaris").value.trim();
        if (document.getElementById("edit-nikSekretaris")) cfg.nikSekretaris = document.getElementById("edit-nikSekretaris").value.trim();
        if (document.getElementById("edit-jabatanSekretaris")) cfg.jabatanSekretaris = document.getElementById("edit-jabatanSekretaris").value.trim();
        if (document.getElementById("edit-namaBendahara")) cfg.namaBendahara = document.getElementById("edit-namaBendahara").value.trim();
        if (document.getElementById("edit-nikBendahara")) cfg.nikBendahara = document.getElementById("edit-nikBendahara").value.trim();
        if (document.getElementById("edit-jabatanBendahara")) cfg.jabatanBendahara = document.getElementById("edit-jabatanBendahara").value.trim();
        if (document.getElementById("edit-namaManajerKandang")) cfg.namaManajerKandang = document.getElementById("edit-namaManajerKandang").value.trim();
        if (document.getElementById("edit-jabatanManajerKandang")) cfg.jabatanManajerKandang = document.getElementById("edit-jabatanManajerKandang").value.trim();
        if (document.getElementById("edit-namaParamedik")) cfg.namaParamedik = document.getElementById("edit-namaParamedik").value.trim();
        if (document.getElementById("edit-jabatanParamedik")) cfg.jabatanParamedik = document.getElementById("edit-jabatanParamedik").value.trim();
        if (document.getElementById("edit-namaKoordinatorLimbah")) cfg.namaKoordinatorLimbah = document.getElementById("edit-namaKoordinatorLimbah").value.trim();
        if (document.getElementById("edit-jabatanKoordinatorLimbah")) cfg.jabatanKoordinatorLimbah = document.getElementById("edit-jabatanKoordinatorLimbah").value.trim();

        if (document.getElementById("edit-logoUrl")) {
            cfg.logoUrl = document.getElementById("edit-logoUrl").value.trim();
        }
        if (document.getElementById("edit-kopSuratUrl")) {
            cfg.kopSuratUrl = document.getElementById("edit-kopSuratUrl").value.trim();
        }
        const editModeRadio = document.querySelector('input[name="edit-modeKopSurat"]:checked');
        if (editModeRadio) {
            cfg.modeKopSurat = editModeRadio.value;
        }

        Store.savePengaturan(cfg);
        App.closeModal();
        App.showToast("Identitas Lembaga BUMKal berhasil diperbarui secara permanen!", "success");
        App.renderContent();
    },

    loadTemplateRasStandar() {
        if (!confirm("Muat daftar template ras kambing & domba unggul standar ke master katalog?")) return;
        const current = Store.getRasTernak();
        let addedCount = 0;
        this.rasTernakTemplates.forEach(t => {
            const exists = current.some(c => (c.nama || '').toLowerCase() === (t.nama || '').toLowerCase());
            if (!exists) {
                current.push({
                    id: "ras-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
                    nama: t.nama,
                    kategori: t.kategori,
                    jenis: t.kategori,
                    deskripsi: t.deskripsi
                });
                addedCount++;
            }
        });
        Store.saveRasTernak(current);
        App.showToast(`Berhasil menambahkan ${addedCount} template ras ternak standar!`, "success");
        App.renderContent();
    },

    onTemplateRasSelect(idx) {
        if (idx === "" || idx === null || isNaN(idx)) return;
        const t = this.rasTernakTemplates[parseInt(idx)];
        if (!t) return;
        const namaEl = document.getElementById("ras-nama");
        const katEl = document.getElementById("ras-kategori");
        const descEl = document.getElementById("ras-deskripsi");

        if (namaEl) namaEl.value = t.nama;
        if (katEl) katEl.value = t.kategori;
        if (descEl) descEl.value = t.deskripsi;
    },

    openModalTambahRasTernak() {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="tag" class="w-5 h-5 text-emerald-600"></i> Tambah Ras / Jenis Kambing & Domba Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <div class="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                    <label class="block font-bold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-600"></i> ⚡ Pilih Template Ras Unggul Cepat:
                    </label>
                    <select onchange="PengaturanModule.onTemplateRasSelect(this.value)" class="w-full p-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs font-semibold">
                        <option value="">-- Pilih Template Ras (Otomatis Isi Form) --</option>
                        ${this.rasTernakTemplates.map((t, i) => `
                            <option value="${i}">${t.nama} (${t.kategori})</option>
                        `).join('')}
                    </select>
                    <p class="text-[10px] text-slate-500">Pilih bangsa ternak di atas untuk langsung mengisi nama, kategori spesies, dan deskripsi keunggulan.</p>
                </div>

                <form onsubmit="PengaturanModule.submitRasTernak(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Ras / Bangsa Ternak *</label>
                        <input type="text" id="ras-nama" required placeholder="Contoh: Kambing Boer / Kambing Saanen" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori / Spesies *</label>
                        <select id="ras-kategori" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            <option value="Kambing">Kambing (Capra hircus)</option>
                            <option value="Domba">Domba (Ovis aries)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Karakteristik & Keunggulan</label>
                        <textarea id="ras-deskripsi" rows="2" placeholder="Contoh: Ras pedaging unggul, pertumbuhan bobot cepat dan adaptif iklim tropis" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">Simpan Ras Ternak</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    openModalEditRasTernak(id) {
        const list = Store.getRasTernak();
        const r = list.find(item => item.id === id);
        if (!r) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i> Ubah Ras Ternak: ${r.nama}
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PengaturanModule.submitRasTernak(event, '${r.id}')" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Ras / Bangsa Ternak *</label>
                        <input type="text" id="ras-nama" required value="${r.nama}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori / Spesies *</label>
                        <select id="ras-kategori" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            <option value="Kambing" ${r.kategori === 'Kambing' ? 'selected' : ''}>Kambing (Capra hircus)</option>
                            <option value="Domba" ${r.kategori === 'Domba' ? 'selected' : ''}>Domba (Ovis aries)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Karakteristik & Keunggulan</label>
                        <textarea id="ras-deskripsi" rows="2" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">${r.deskripsi || ''}</textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitRasTernak(e, id = null) {
        e.preventDefault();
        const nama = document.getElementById("ras-nama").value.trim();
        const kategori = document.getElementById("ras-kategori").value;
        const deskripsi = document.getElementById("ras-deskripsi").value.trim();

        if (id) {
            Store.updateRasTernak(id, { nama, kategori, deskripsi });
            App.showToast(`Ras ${nama} berhasil diperbarui!`, "success");
        } else {
            Store.addRasTernak({ nama, kategori, deskripsi });
            App.showToast(`Ras/Jenis baru "${nama}" berhasil ditambahkan!`, "success");
        }

        App.closeModal();
        App.renderContent();
    },

    deleteRasTernak(id) {
        const list = Store.getRasTernak();
        const r = list.find(item => item.id === id);
        if (!r) return;

        if (confirm(`Apakah Anda yakin ingin menghapus ras "${r.nama}" dari katalog master?`)) {
            Store.deleteRasTernak(id);
            App.showToast(`Ras "${r.nama}" berhasil dihapus.`, "info");
            App.renderContent();
        }
    },

    // --- HELPER KUSTOMISASI LOGO & KOP SURAT ---
    uploadLogo(input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        if (file.size > 2 * 1024 * 1024) {
            App.showToast("Ukuran logo maksimal 2MB agar performa aplikasi tetap cepat.", "warning");
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            const cfg = Store.getPengaturan();
            cfg.logoUrl = base64;
            Store.savePengaturan(cfg);
            App.showToast("Logo instansi berhasil diunggah dan disimpan!", "success");
            App.renderContent();
        };
        reader.readAsDataURL(file);
    },

    removeLogo() {
        if (confirm("Apakah Anda yakin ingin menghapus logo instansi?")) {
            const cfg = Store.getPengaturan();
            cfg.logoUrl = "";
            Store.savePengaturan(cfg);
            App.showToast("Logo instansi telah dihapus.", "info");
            App.renderContent();
        }
    },

    updateLogoUrl(url) {
        const cfg = Store.getPengaturan();
        cfg.logoUrl = url.trim();
        Store.savePengaturan(cfg);
        App.showToast("Logo instansi berhasil diperbarui!", "success");
        App.renderContent();
    },

    uploadKopBanner(input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        if (file.size > 3 * 1024 * 1024) {
            App.showToast("Ukuran gambar banner kop maksimal 3MB.", "warning");
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            const cfg = Store.getPengaturan();
            cfg.kopSuratUrl = base64;
            cfg.modeKopSurat = "gambar"; // Otomatis aktifkan mode gambar setelah upload
            Store.savePengaturan(cfg);
            App.showToast("Banner gambar kop surat berhasil diunggah dan diaktifkan!", "success");
            App.renderContent();
        };
        reader.readAsDataURL(file);
    },

    removeKopBanner() {
        if (confirm("Apakah Anda yakin ingin menghapus gambar banner kop surat?")) {
            const cfg = Store.getPengaturan();
            cfg.kopSuratUrl = "";
            cfg.modeKopSurat = "teks"; // Kembali ke mode teks standar
            Store.savePengaturan(cfg);
            App.showToast("Banner kop surat telah dihapus, beralih ke mode teks.", "info");
            App.renderContent();
        }
    },

    updateKopBannerUrl(url) {
        const cfg = Store.getPengaturan();
        cfg.kopSuratUrl = url.trim();
        if (cfg.kopSuratUrl) cfg.modeKopSurat = "gambar";
        Store.savePengaturan(cfg);
        App.showToast("URL gambar banner kop berhasil disimpan!", "success");
        App.renderContent();
    },

    setModeKopSurat(mode) {
        const cfg = Store.getPengaturan();
        cfg.modeKopSurat = mode;
        Store.savePengaturan(cfg);
        App.showToast(`Mode kop surat diubah ke: ${mode === 'gambar' ? 'Gambar Banner Utuh' : 'Teks Standar & Logo'}`, "success");
        App.renderContent();
    },

    handleModalImageUpload(input, targetInputId) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const targetEl = document.getElementById(targetInputId);
            if (targetEl) targetEl.value = e.target.result;
            App.showToast("Gambar berhasil dimuat ke isian formulir!", "info");
        };
        reader.readAsDataURL(file);
    },

    // --- TITIK PEMULIHAN CEPAT (SNAPSHOT ACTIONS) ---
    createSnapshotNow() {
        const now = new Date();
        const defaultLabel = `Snapshot ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        const label = prompt("Masukkan nama atau keterangan titik pemulihan cadangan:", defaultLabel);
        if (label === null) return;
        const finalLabel = label.trim() || defaultLabel;
        const snap = Store.createSnapshot(finalLabel);
        App.showToast(`Titik pemulihan berhasil dibuat: "${snap.label}"`, "success");
        App.renderContent();
    },

    restoreSnapshotNow(id) {
        const snapshots = Store.getSnapshots();
        const snap = snapshots.find(s => s.id === id);
        if (!snap) return;

        if (confirm(`Peringatan: Memulihkan ke titik "${snap.label}" akan mengganti seluruh data operasional saat ini dengan data cadangan tanggal ${new Date(snap.tgl).toLocaleString('id-ID')}.\n\nApakah Anda yakin ingin melanjutkan?`)) {
            const ok = Store.restoreSnapshot(id);
            if (ok) {
                App.showToast(`Sistem berhasil dipulihkan ke titik: "${snap.label}"!`, "success");
                App.renderContent();
            } else {
                App.showToast("Gagal memulihkan data dari snapshot!", "error");
            }
        }
    },

    deleteSnapshotNow(id) {
        if (confirm("Apakah Anda yakin ingin menghapus titik pemulihan cadangan ini?")) {
            Store.deleteSnapshot(id);
            App.showToast("Titik pemulihan cadangan telah dihapus.", "info");
            App.renderContent();
        }
    },

    // --- SINKRONISASI CLOUD REAL-TIME (GOOGLE FIREBASE) ---
    renderFirebaseSync() {
        const fbConfig = Store.getFirebaseConfig();
        const isConnected = fbConfig.status === "connected";
        const isSyncing = fbConfig.status === "syncing";
        const isError = fbConfig.status === "error";

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-1">
                            <i data-lucide="cloud" class="w-3.5 h-3.5 text-sky-500"></i> Cloud Real-Time Infrastructure
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Sinkronisasi Cloud Real-Time (Google Firebase)</h2>
                        <p class="text-xs text-slate-500">Integrasi database awan real-time untuk sinkronisasi multi-perangkat pengurus, direksi, dan anak kandang secara otomatis.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                            isConnected ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            isSyncing ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            isError ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }">
                            <span class="w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : isSyncing ? 'bg-amber-500 animate-ping' : isError ? 'bg-rose-500' : 'bg-slate-400'}"></span>
                            ${isConnected ? (fbConfig.autoSync ? 'Cloud: Aktif & Realtime' : 'Cloud: Terhubung') : isSyncing ? 'Sinkronisasi...' : isError ? 'Koneksi Bermasalah' : 'Belum Terhubung'}
                        </span>
                    </div>
                </div>

                <!-- MAIN CONFIG & OPERATIONS GRID -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <!-- Column Left: Firebase Project Settings Form -->
                    <div class="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-5">
                        <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center font-bold">
                                    <i data-lucide="settings" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <h3 class="text-sm font-bold text-slate-900 dark:text-white">Konfigurasi Google Firebase Web App</h3>
                                    <p class="text-[11px] text-slate-500">Masukkan parameter dari Firebase Console Proyek Anda</p>
                                </div>
                            </div>
                        </div>

                        <form onsubmit="PengaturanModule.saveFirebaseConfig(event)" class="space-y-4 text-xs">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project ID *</label>
                                    <input type="text" id="fb-project-id" value="${fbConfig.projectId || ''}" placeholder="misal: lumbung-pangan-pleret" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                                </div>
                                <div>
                                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">API Key *</label>
                                    <input type="password" id="fb-api-key" value="${fbConfig.apiKey || ''}" placeholder="AIzaSy..." required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Auth Domain (Opsional)</label>
                                    <input type="text" id="fb-auth-domain" value="${fbConfig.authDomain || ''}" placeholder="project-id.firebaseapp.com" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                                </div>
                                <div>
                                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Database / Firestore Collection *</label>
                                    <input type="text" id="fb-collection" value="${fbConfig.collectionName || 'lumbung_ternak_pleret'}" placeholder="lumbung_ternak_pleret" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold">
                                </div>
                            </div>

                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Realtime Database URL (Opsional / Jika pakai RTDB)</label>
                                <input type="text" id="fb-db-url" value="${fbConfig.databaseURL || ''}" placeholder="https://project-id-default-rtdb.firebaseio.com" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                            </div>

                            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <div class="font-bold text-slate-800 dark:text-slate-200">Sinkronisasi Real-Time Otomatis</div>
                                    <div class="text-[11px] text-slate-500">Mendengarkan perubahan data langsung dari cloud dan menyelaraskan ke layar aktif.</div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="fb-auto-sync" ${fbConfig.autoSync ? 'checked' : ''} class="sr-only peer">
                                    <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onclick="PengaturanModule.testFirebaseConnection()" class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition flex items-center gap-1.5">
                                    <i data-lucide="radio" class="w-4 h-4 text-sky-500"></i> Tes Koneksi
                                </button>
                                <button type="submit" class="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20 transition flex items-center gap-1.5 active:scale-95">
                                    <i data-lucide="save" class="w-4 h-4"></i> Simpan Konfigurasi
                                </button>
                            </div>
                        </form>

                        <!-- Tutorial Snippet -->
                        <div class="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
                            <b class="text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                                <i data-lucide="help-circle" class="w-3.5 h-3.5"></i> Cara Menghubungkan Firebase:
                            </b>
                            <p>1. Buka <span class="font-mono text-sky-700 dark:text-sky-300">console.firebase.google.com</span> dan buat project baru (gratis mode Spark).</p>
                            <p>2. Buat Web App (klik icon &lt;/&gt;) dan salin <b>apiKey</b> serta <b>projectId</b> ke form di atas.</p>
                            <p>3. Aktifkan <b>Cloud Firestore</b> atau <b>Realtime Database</b> dalam mode uji coba (test mode).</p>
                        </div>
                    </div>

                    <!-- Column Right: Live Operations & Cloud Sync Actions -->
                    <div class="lg:col-span-5 space-y-5">
                        <!-- Cloud Status Summary Card -->
                        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="activity" class="w-4 h-4 text-sky-600"></i> Status Sinkronisasi Awan
                            </h3>

                            <div class="space-y-2.5 text-xs">
                                <div class="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                                    <span class="text-slate-500">Status Gateway:</span>
                                    <span class="font-bold capitalize ${isConnected ? 'text-emerald-600' : isError ? 'text-rose-600' : 'text-slate-600'}">
                                        ${fbConfig.status || 'Belum Dikonfigurasi'}
                                    </span>
                                </div>
                                <div class="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                                    <span class="text-slate-500">Terakhir Disinkronkan:</span>
                                    <span class="font-bold text-slate-800 dark:text-slate-200">
                                        ${fbConfig.lastSyncTime ? new Date(fbConfig.lastSyncTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Belum Ada'}
                                    </span>
                                </div>
                                <div class="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                                    <span class="text-slate-500">Target Dokumen:</span>
                                    <span class="font-mono font-bold text-sky-600">${fbConfig.collectionName || 'lumbung_ternak_pleret'}/latest_backup</span>
                                </div>
                            </div>

                            <div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                                <div class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> Auto-Sync Antar Perangkat Aktif
                                </div>
                                <p class="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                                    Data otomatis tersinkronkan dua arah secara realtime. Anda <b>tidak perlu menekan tombol apa pun secara manual</b> saat menambah atau mengubah data di PC maupun di HP.
                                </p>
                            </div>

                            <div class="pt-2 space-y-2">
                                <button onclick="PengaturanModule.syncNow()" class="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2 active:scale-95">
                                    <i data-lucide="refresh-cw" class="w-4 h-4"></i> Sinkronkan Sekarang (Opsional / Manual)
                                </button>
                            </div>

                            <p class="text-[11px] text-slate-400 text-center italic">
                                * Sinkronisasi cloud otomatis menghubungkan data domba, pakan, limbah, dan keuangan di smartphone dan komputer secara simultan.
                            </p>
                        </div>

                        <!-- Offline Fallback Notice -->
                        <div class="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-500/20 p-5 space-y-2 text-xs">
                            <div class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                <i data-lucide="shield-check" class="w-4 h-4"></i> Arsitektur Offline-First
                            </div>
                            <p class="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                                Bila tidak ada jaringan internet di area kandang, aplikasi tetap dapat beroperasi 100% normal menggunakan penyimpanan lokal browser (LocalStorage). Saat perangkat kembali terhubung internet, data dapat diunggah ke Firebase hanya dengan satu klik.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- FIREBASE CLOUD SYNC ACTIONS ---
    saveFirebaseConfig(e) {
        if (e) e.preventDefault();
        const apiKey = document.getElementById("fb-api-key")?.value.trim() || "";
        const projectId = document.getElementById("fb-project-id")?.value.trim() || "";
        const authDomain = document.getElementById("fb-auth-domain")?.value.trim() || "";
        const collectionName = document.getElementById("fb-collection")?.value.trim() || "lumbung_ternak_pleret";
        const databaseURL = document.getElementById("fb-db-url")?.value.trim() || "";
        const autoSync = document.getElementById("fb-auto-sync")?.checked || false;

        const currentCfg = Store.getFirebaseConfig();
        const newCfg = {
            ...currentCfg,
            apiKey,
            projectId,
            authDomain,
            collectionName,
            databaseURL,
            autoSync,
            status: (apiKey && projectId) ? "connected" : "unconfigured"
        };

        Store.saveFirebaseConfig(newCfg);
        if (newCfg.apiKey && newCfg.projectId) {
            Store.initFirebaseSync();
        }
        if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
            window.App.updateCloudHeaderBadge();
        }
        App.showToast("Konfigurasi Google Firebase berhasil disimpan!", "success");
        App.renderContent();
    },

    async testFirebaseConnection() {
        const projectId = document.getElementById("fb-project-id")?.value.trim();
        const apiKey = document.getElementById("fb-api-key")?.value.trim();

        if (!projectId || !apiKey) {
            App.showToast("Harap isi minimal Project ID dan API Key terlebih dahulu!", "warning");
            return;
        }

        App.showToast("Menguji koneksi ke Google Firebase Cloud...", "info");
        const ok = Store.initFirebaseSync();
        if (ok) {
            App.showToast("Koneksi Firebase berhasil diinisialisasi!", "success");
        } else {
            App.showToast("Firebase diinisialisasi dalam mode lokal / offline.", "info");
        }
        if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
            window.App.updateCloudHeaderBadge();
        }
        App.renderContent();
    },

    async syncNow() {
        App.showToast("Menyelaraskan data dengan Cloud Firebase...", "info");
        const res = await Store.pullFromFirebase();
        if (res && res.success) {
            App.showToast("Data ternak, akun, & laporan berhasil diselaraskan dari Cloud!", "success");
            App.renderContent();
        } else {
            App.showToast(res?.message || "Koneksi cloud terhubung.", "info");
        }
    },

    async pushFirebaseNow() {
        const cfg = Store.getFirebaseConfig();
        if (!cfg.apiKey || !cfg.projectId) {
            App.showToast("Harap konfigurasi Project ID dan API Key Firebase terlebih dahulu!", "warning");
            return;
        }

        App.showToast("Mengunggah seluruh data kandang ke Firebase Cloud...", "info");
        const res = await Store.syncToFirebase();
        if (res.success) {
            App.showToast(res.message, "success");
        } else {
            App.showToast(res.message, "warning");
        }
        if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
            window.App.updateCloudHeaderBadge();
        }
        App.renderContent();
    },

    async pullFirebaseNow() {
        const cfg = Store.getFirebaseConfig();
        if (!cfg.apiKey || !cfg.projectId) {
            App.showToast("Harap konfigurasi Project ID dan API Key Firebase terlebih dahulu!", "warning");
            return;
        }

        if (confirm("Perhatian: Menarik data dari Firebase Cloud akan menimpa seluruh data lokal yang ada saat ini dengan data di awan.\n\nLanjutkan penarikan data?")) {
            App.showToast("Mengunduh data dari Firebase Cloud...", "info");
            const res = await Store.pullFromFirebase();
            if (res.success) {
                App.showToast(res.message, "success");
                App.renderContent();
            } else {
                App.showToast(res.message, "warning");
            }
            if (window.App && typeof window.App.updateCloudHeaderBadge === "function") {
                window.App.updateCloudHeaderBadge();
            }
        }
    }
};
