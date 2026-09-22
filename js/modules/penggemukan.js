/**
 * Modul Penggemukan
 * Menangani 6 sub-menu:
 * 1. Siklus Batch
 * 2. Master Kandang
 * 3. Data Ternak
 * 4. History Timbang & ADG
 * 5. Cetak Stiker QR
 * 6. Import Masal CSV
 */

const PenggemukanModule = {
    currentSubMenu: "siklus_batch",
    batchFilterStatus: "all",
    batchSearchQuery: "",
    kandangFilterTipe: "all",
    kandangSearchQuery: "",

    // Generator Cetak Stiker Multi-QR Code State
    stikerPaperSize: "A4", // "A4" | "A3" | "A3+"
    stikerColumns: 3, // 2 | 3 | 4 | 5 | 6
    stikerFilterKandang: "all",

    render(sub = null) {
        if (sub) this.currentSubMenu = sub;

        switch (this.currentSubMenu) {
            case "siklus_batch":
                return this.renderSiklusBatch();
            case "master_kandang":
                return this.renderMasterKandang();
            case "data_ternak":
                return DombaModule.render();
            case "history_timbang":
                return this.renderHistoryTimbang();
            case "cetak_stiker_qr":
                return this.renderCetakStikerQR();
            case "import_csv":
                return this.renderImportCSV();
            default:
                return this.renderSiklusBatch();
        }
    },

    // 1. SIKLUS BATCH
    renderSiklusBatch() {
        const batches = Store.getBatchesPenggemukan();
        const dombaList = Store.getDomba();

        let filteredBatches = batches;
        if (this.batchSearchQuery) {
            const q = this.batchSearchQuery.toLowerCase();
            filteredBatches = filteredBatches.filter(b => (b.nama || '').toLowerCase().includes(q) || (b.id || '').toLowerCase().includes(q) || (b.kandangAlokasi || '').toLowerCase().includes(q));
        }
        if (this.batchFilterStatus !== "all") {
            filteredBatches = filteredBatches.filter(b => (b.status || '').toLowerCase().includes(this.batchFilterStatus.toLowerCase()));
        }

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                            <i data-lucide="package" class="w-3.5 h-3.5"></i> Periode Penggemukan
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Siklus Batch Penggemukan Ternak</h2>
                        <p class="text-xs text-slate-500">Manajemen periode pemeliharaan terfokus (Qurban, Aqiqah, Pemuliaan) dengan target ADG & tanggal panen.</p>
                    </div>
                    <button onclick="PenggemukanModule.openModalTambahBatch()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i> Buat Batch Baru
                    </button>
                </div>

                <!-- FILTER & PENCARIAN BATCH -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                    <div class="relative flex-1">
                        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                        <input type="text" placeholder="Cari nama batch, kode, atau alokasi kandang..." value="${this.batchSearchQuery || ''}" oninput="PenggemukanModule.searchBatch(this.value)" class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-slate-400">Status:</span>
                        <select onchange="PenggemukanModule.filterStatusBatch(this.value)" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
                            <option value="all" ${this.batchFilterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
                            <option value="Berjalan" ${this.batchFilterStatus === 'Berjalan' ? 'selected' : ''}>Sedang Berjalan</option>
                            <option value="Persiapan" ${this.batchFilterStatus === 'Persiapan' ? 'selected' : ''}>Fase Persiapan</option>
                            <option value="Selesai" ${this.batchFilterStatus === 'Selesai' ? 'selected' : ''}>Selesai / Panen</option>
                        </select>
                        ${(this.batchSearchQuery || this.batchFilterStatus !== 'all') ? `
                            <button onclick="PenggemukanModule.resetFilterBatch()" class="text-xs text-rose-600 font-semibold hover:underline">Reset</button>
                        ` : ''}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                    ${filteredBatches.length === 0 ? `
                        <div class="col-span-full py-10 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            Tidak ada siklus batch yang cocok dengan filter.
                        </div>
                    ` : filteredBatches.map(b => {
                        const ternakInBatch = dombaList.filter(d => d.batchId === b.id);
                        return `
                            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                                <div>
                                    <div class="flex items-start justify-between">
                                        <span class="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">${b.id}</span>
                                        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">${ternakInBatch.length} Ekor Terisi</span>
                                    </div>
                                    <h3 class="font-bold text-base text-slate-900 dark:text-white mt-2 leading-snug">${b.nama}</h3>
                                    <div class="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">${b.status}</div>

                                    <div class="mt-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Target Panen:</span>
                                            <b class="text-slate-800 dark:text-slate-200">${b.targetPanen}</b>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Target ADG:</span>
                                            <b class="text-emerald-600">${b.targetAdg} g / hari</b>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Target Bobot:</span>
                                            <b class="text-slate-800 dark:text-slate-200">${b.targetBobotKg} kg</b>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Alokasi Kandang:</span>
                                            <b class="text-slate-800 dark:text-slate-200">${b.kandangAlokasi}</b>
                                        </div>
                                    </div>

                                    <p class="text-xs text-slate-500 italic mt-3">"${b.catatan}"</p>
                                </div>

                                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                                    <button onclick="PenggemukanModule.lihatTernakBatch('${b.id}')" class="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold transition">
                                        Lihat Domba &rarr;
                                    </button>
                                    <div class="flex items-center gap-1.5">
                                        <button onclick="PenggemukanModule.openModalEditBatch('${b.id}')" class="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold transition flex items-center gap-1">
                                            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Ubah
                                        </button>
                                        <button onclick="PenggemukanModule.deleteBatch('${b.id}')" class="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 transition" title="Hapus Batch">
                                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    // 2. MASTER KANDANG
    renderMasterKandang() {
        // Sinkronisasi otomatis data okupansi ternak di seluruh sekat & kandang
        Store.syncSekatOccupancy();
        const kandangList = Store.getMasterKandang();

        let filtered = kandangList;
        if (this.kandangSearchQuery) {
            const q = this.kandangSearchQuery.toLowerCase();
            filtered = filtered.filter(k => (k.nama || '').toLowerCase().includes(q) || (k.lokasi || '').toLowerCase().includes(q) || (k.id || '').toLowerCase().includes(q));
        }
        if (this.kandangFilterTipe !== "all") {
            filtered = filtered.filter(k => (k.tipeKandang || '').toLowerCase().includes(this.kandangFilterTipe.toLowerCase()));
        }

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                            <i data-lucide="home" class="w-3.5 h-3.5"></i> Infrastruktur Peternakan
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Master Gedung Kandang & Sekat</h2>
                        <p class="text-xs text-slate-500">Pemetaan fasilitas kandang panggung, kapasitas tampung, tingkat okupansi ternak, dan pengaturan koloni / sekat.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="PenggemukanModule.openModalTambahKandang()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Tambah Kandang Baru
                        </button>
                    </div>
                </div>

                <!-- FILTER & PENCARIAN KANDANG -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                    <div class="relative flex-1">
                        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                        <input type="text" placeholder="Cari nama gedung kandang, ID, atau lokasi blok..." value="${this.kandangSearchQuery || ''}" oninput="PenggemukanModule.searchKandang(this.value)" class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-slate-400">Tipe Konstruksi:</span>
                        <select onchange="PenggemukanModule.filterTipeKandang(this.value)" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
                            <option value="all" ${this.kandangFilterTipe === 'all' ? 'selected' : ''}>Semua Tipe</option>
                            <option value="Panggung" ${this.kandangFilterTipe === 'Panggung' ? 'selected' : ''}>Panggung Kayu/Bambu</option>
                            <option value="Postal" ${this.kandangFilterTipe === 'Postal' ? 'selected' : ''}>Postal Karpet Karet</option>
                        </select>
                        ${(this.kandangSearchQuery || this.kandangFilterTipe !== 'all') ? `
                            <button onclick="PenggemukanModule.resetFilterKandang()" class="text-xs text-rose-600 font-semibold hover:underline">Reset</button>
                        ` : ''}
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    ${filtered.length === 0 ? `
                        <div class="col-span-full py-10 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            Tidak ada fasilitas kandang yang cocok dengan kriteria filter.
                        </div>
                    ` : filtered.map(k => {
                        const pct = k.kapasitasMaks > 0 ? Math.min(100, Math.round((k.terisi / k.kapasitasMaks) * 100)) : 0;
                        return `
                            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                                <div class="space-y-4">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <span class="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">${k.id.toUpperCase()}</span>
                                            <h3 class="font-bold text-base text-slate-900 dark:text-white mt-1.5">${k.nama}</h3>
                                            <p class="text-xs text-slate-500">${k.lokasi}</p>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-lg font-black text-emerald-600">${k.terisi} / ${k.kapasitasMaks}</div>
                                            <span class="text-[10px] text-slate-400">Kapasitas Ekor</span>
                                        </div>
                                    </div>

                                    <!-- Progress Bar Okupansi -->
                                    <div class="space-y-1">
                                        <div class="flex justify-between text-[11px] text-slate-500">
                                            <span>Tingkat Kepadatan:</span>
                                            <b>${pct}% Terisi</b>
                                        </div>
                                        <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div class="bg-emerald-600 h-full rounded-full" style="width: ${pct}%"></div>
                                        </div>
                                    </div>

                                    <div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                                        <div class="flex justify-between"><span class="text-slate-400">Tipe Konstruksi:</span><b class="text-slate-700 dark:text-slate-300">${k.tipeKandang}</b></div>
                                        <div class="flex justify-between"><span class="text-slate-400">Suhu Rata-rata:</span><b class="text-slate-700 dark:text-slate-300">${k.suhuRataRata}</b></div>
                                        <div class="flex justify-between"><span class="text-slate-400">Status Kebersihan:</span><b class="text-emerald-600">${k.kebersihan}</b></div>
                                    </div>

                                    <!-- Sekat Breakdown -->
                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Rincian Sekat / Koloni (${(k.sekatList || []).length} Sekat):</span>
                                            <button onclick="PenggemukanModule.openModalKelolaSekat('${k.id}')" class="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 transition hover:underline">
                                                <i data-lucide="settings-2" class="w-3.5 h-3.5"></i> Kelola Sekat
                                            </button>
                                        </div>
                                        <div class="grid grid-cols-2 gap-2 text-xs">
                                            ${(k.sekatList || []).map((s, sIdx) => `
                                                <div class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center group hover:border-emerald-400 dark:hover:border-emerald-600 transition">
                                                    <div class="truncate mr-1 min-w-0">
                                                        <span class="font-bold text-slate-800 dark:text-slate-200 block truncate">${s.nomor}</span>
                                                        <div class="text-[10px] text-slate-400 truncate">${(s.eartags || []).length > 0 ? s.eartags.join(', ') : 'Kosong'}</div>
                                                    </div>
                                                    <div class="flex items-center gap-1 flex-shrink-0">
                                                        <span class="text-[11px] font-black ${s.terisi > 0 ? 'text-emerald-600' : 'text-slate-400'} whitespace-nowrap">${s.terisi}/${s.kapasitas}</span>
                                                        <button onclick="PenggemukanModule.openModalEditSekat('${k.id}', ${sIdx})" class="p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition" title="Ubah Nama & Kapasitas Sekat">
                                                            <i data-lucide="edit-2" class="w-3 h-3"></i>
                                                        </button>
                                                        <button onclick="PenggemukanModule.kurangiSekat('${k.id}', ${sIdx})" class="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition" title="Hapus / Kurangi Sekat">
                                                            <i data-lucide="trash-2" class="w-3 h-3"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Buttons: Kelola Sekat, Ubah & Hapus Kandang -->
                                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1.5">
                                    <button onclick="PenggemukanModule.openModalKelolaSekat('${k.id}')" class="py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95" title="Tambah, kurangi, atau edit sekat di kandang ini">
                                        <i data-lucide="grid" class="w-3.5 h-3.5"></i> Sekat (${(k.sekatList || []).length})
                                    </button>
                                    <button onclick="PenggemukanModule.openModalEditKandang('${k.id}')" class="py-1.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95" title="Ubah data fasilitas kandang">
                                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Ubah
                                    </button>
                                    <button onclick="PenggemukanModule.deleteKandang('${k.id}')" class="py-1.5 px-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95" title="Hapus Kandang">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    // 4. HISTORY TIMBANG & ADG
    renderHistoryTimbang() {
        const dombaList = Store.getDomba();
        let allTimbang = [];
        dombaList.forEach(d => {
            (d.riwayatTimbang || []).forEach((r, idx) => {
                allTimbang.push({ eartag: d.eartag, dombaId: d.id, nama: d.nama, ras: d.ras, kategori: d.kategori, kandang: d.kandang, sekat: d.sekat, rawIndex: idx, ...r });
            });
        });
        allTimbang.sort((a, b) => new Date(b.tgl) - new Date(a.tgl));

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
                            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> Pertumbuhan Bobot
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">History Penimbangan & Analisis ADG</h2>
                        <p class="text-xs text-slate-500">Log lengkap seluruh rekaman timbangan ternak dengan laju pertambahan berat badan harian. Anda dapat mengedit tanggal & bobot terbaru kapan saja.</p>
                    </div>
                    <button onclick="App.openModal('modal-timbang')" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition active:scale-95">
                        <i data-lucide="scale" class="w-4 h-4"></i> Catat Timbang Baru
                    </button>
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Tanggal</th>
                                    <th class="py-3 px-4">Eartag & Ternak</th>
                                    <th class="py-3 px-4">Ras & Fase</th>
                                    <th class="py-3 px-4">Lokasi Sekat</th>
                                    <th class="py-3 px-4 text-right">Bobot Timbang</th>
                                    <th class="py-3 px-4">Catatan Perkembangan</th>
                                    <th class="py-3 px-4 text-center">Aksi Edit</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${allTimbang.length === 0 ? `
                                    <tr>
                                        <td colspan="7" class="py-8 text-center text-slate-400">Belum ada rekaman penimbangan.</td>
                                    </tr>
                                ` : allTimbang.map(r => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">${r.tgl}</td>
                                        <td class="py-3 px-4">
                                            <span class="font-bold text-slate-900 dark:text-white font-mono">${r.eartag}</span>
                                            <div class="text-[11px] text-slate-500">${r.nama || '-'}</div>
                                        </td>
                                        <td class="py-3 px-4">${r.ras || '-'} (${r.kategori || '-'})</td>
                                        <td class="py-3 px-4">${(r.kandang || '').split('(')[0]} / ${r.sekat || '-'}</td>
                                        <td class="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm font-mono">${Number(r.bobot || 0).toFixed(2)} kg</td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-400 italic">${r.catatan || 'Penimbangan rutin'}</td>
                                        <td class="py-3 px-4 text-center whitespace-nowrap">
                                            <button type="button" onclick="PenggemukanModule.openModalEditTimbang('${r.eartag}', ${r.rawIndex})" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 transition inline-flex items-center gap-1 shadow-sm mr-1.5" title="Edit Hasil Penimbangan">
                                                <i data-lucide="edit-2" class="w-3.5 h-3.5"></i> Edit Bobot
                                            </button>
                                            <button type="button" onclick="PenggemukanModule.hapusRiwayatTimbang('${r.eartag}', ${r.rawIndex})" class="p-1 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30" title="Hapus Log Timbang">
                                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
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

    openModalEditTimbang(eartag, index) {
        const domba = Store.getDomba().find(d => d.eartag === eartag);
        if (!domba || !domba.riwayatTimbang || !domba.riwayatTimbang[index]) {
            App.showToast("Data riwayat timbang tidak ditemukan!", "error");
            return;
        }
        const record = domba.riwayatTimbang[index];
        const bobotVal = parseFloat(record.bobot || 0).toFixed(2);

        App.setModalContent(`
            <div class="p-6 space-y-4 max-w-md mx-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="scale" class="w-5 h-5 text-indigo-600"></i> Edit Hasil Penimbangan
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1">
                    <div class="flex justify-between"><span class="text-slate-500">Nomor Eartag:</span><b class="font-mono text-slate-800 dark:text-slate-200">${domba.eartag}</b></div>
                    <div class="flex justify-between"><span class="text-slate-500">Nama / Ras:</span><span class="font-bold">${domba.nama || '-'} (${domba.ras || '-'})</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">Kandang / Sekat:</span><span>${domba.kandang} / ${domba.sekat}</span></div>
                </div>

                <form onsubmit="PenggemukanModule.submitEditTimbang(event, '${eartag}', ${index})" class="space-y-3.5 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Penimbangan *</label>
                        <input type="date" id="et-tgl" required value="${record.tgl || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bobot Timbang (kg) *</label>
                        <input type="number" step="0.01" min="1" max="250" id="et-bobot" required value="${bobotVal}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                        <span class="text-[10px] text-slate-400 mt-0.5 block">Format 2 digit di belakang koma (misal: 32.75 kg)</span>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Perkembangan</label>
                        <input type="text" id="et-catatan" value="${record.catatan || ''}" placeholder="Misal: Pertumbuhan pesat, nafsu makan tinggi" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="pt-3 border-t dark:border-slate-700 flex justify-end gap-2">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditTimbang(e, eartag, index) {
        e.preventDefault();
        const newTgl = document.getElementById("et-tgl").value;
        const newBobot = parseFloat(document.getElementById("et-bobot").value);
        const newCatatan = document.getElementById("et-catatan").value.trim();

        if (isNaN(newBobot) || newBobot <= 0) {
            App.showToast("Bobot ternak harus berupa angka valid lebih dari 0!", "error");
            return;
        }

        const ok = Store.updateRiwayatTimbang(eartag, index, newTgl, newBobot, newCatatan);
        if (ok) {
            App.closeModal();
            App.showToast(`Bobot ${eartag} berhasil diperbarui menjadi ${newBobot.toFixed(2)} kg!`, "success");
            App.renderContent();
        } else {
            App.showToast("Gagal memperbarui bobot ternak.", "error");
        }
    },

    hapusRiwayatTimbang(eartag, index) {
        if (!confirm(`Apakah Anda yakin ingin menghapus data penimbangan untuk domba ${eartag}?`)) return;
        const ok = Store.deleteRiwayatTimbang(eartag, index);
        if (ok) {
            App.showToast(`Data timbang untuk ${eartag} berhasil dihapus.`, "success");
            App.renderContent();
        }
    },

    // 5. CETAK STIKER QR (GENERATOR CETAK STIKER MULTI-QR CODE)
    setStikerPaperSize(size) {
        this.stikerPaperSize = size;
        if (size === "A3" && this.stikerColumns < 4) this.stikerColumns = 4;
        if (size === "A3+" && this.stikerColumns < 5) this.stikerColumns = 5;
        App.renderContent();
    },

    setStikerColumns(cols) {
        this.stikerColumns = parseInt(cols) || 3;
        App.renderContent();
    },

    setStikerFilterKandang(kandang) {
        this.stikerFilterKandang = kandang;
        App.renderContent();
    },

    getFilteredStikerDomba() {
        const list = Store.getDomba();
        if (!this.stikerFilterKandang || this.stikerFilterKandang === "all") {
            return list;
        }
        return list.filter(d => (d.kandang || '').toLowerCase().includes(this.stikerFilterKandang.toLowerCase()));
    },

    renderCetakStikerQR() {
        const dombaList = this.getFilteredStikerDomba();
        const masterKandang = Store.getMasterKandang();
        const allDomba = Store.getDomba();
        const kandangList = Array.from(new Set([
            ...masterKandang.map(k => k.nama.split('(')[0].trim()),
            ...allDomba.map(d => (d.kandang || '').split('(')[0].trim())
        ])).filter(Boolean);

        const cfg = Store.getPengaturan();

        // Responsive grid columns class on screen
        const gridColsClass = {
            2: "grid-cols-1 sm:grid-cols-2",
            3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
            5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
            6: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6"
        }[this.stikerColumns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-1">
                            <i data-lucide="scan" class="w-3.5 h-3.5"></i> Identifikasi Digital & Labeling Barcode
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Generator Cetak Stiker Multi-Barcode</h2>
                        <p class="text-xs text-slate-500">Pilih ukuran kertas (A4 / A3 / A3+) dan filter kandang untuk mencetak stiker barcode ear tag kambing</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="PenggemukanModule.cetakLembarStikerNow()" class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition active:scale-95">
                            <i data-lucide="printer" class="w-4 h-4"></i> 🖨️ Cetak Lembar Stiker Now
                        </button>
                    </div>
                </div>

                <!-- FILTER BAR: UKURAN KERTAS, BERAPA KOLOM, FILTER KANDANG -->
                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <!-- 1. Filter Ukuran Kertas -->
                        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <i data-lucide="file" class="w-4 h-4 text-purple-600"></i> Ukuran Kertas:
                            </label>
                            <div class="grid grid-cols-3 gap-1.5">
                                <button type="button" onclick="PenggemukanModule.setStikerPaperSize('A4')" class="py-2 px-2 text-center rounded-lg font-bold transition text-xs ${this.stikerPaperSize === 'A4' ? 'bg-purple-600 text-white shadow' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}">
                                    A4
                                    <span class="block text-[9px] font-normal opacity-80">210×297mm</span>
                                </button>
                                <button type="button" onclick="PenggemukanModule.setStikerPaperSize('A3')" class="py-2 px-2 text-center rounded-lg font-bold transition text-xs ${this.stikerPaperSize === 'A3' ? 'bg-purple-600 text-white shadow' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}">
                                    A3
                                    <span class="block text-[9px] font-normal opacity-80">297×420mm</span>
                                </button>
                                <button type="button" onclick="PenggemukanModule.setStikerPaperSize('A3+')" class="py-2 px-2 text-center rounded-lg font-bold transition text-xs ${this.stikerPaperSize === 'A3+' ? 'bg-purple-600 text-white shadow' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}">
                                    A3+
                                    <span class="block text-[9px] font-normal opacity-80">329×483mm</span>
                                </button>
                            </div>
                        </div>

                        <!-- 2. Berapa Kolom -->
                        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span class="flex items-center gap-1.5"><i data-lucide="columns" class="w-4 h-4 text-purple-600"></i> Berapa Kolom Stiker:</span>
                                <span class="text-[11px] text-purple-600 font-bold font-mono">${this.stikerColumns} Kolom</span>
                            </label>
                            <div class="grid grid-cols-5 gap-1">
                                ${[2, 3, 4, 5, 6].map(col => `
                                    <button type="button" onclick="PenggemukanModule.setStikerColumns(${col})" class="py-2 text-center rounded-lg font-bold transition text-xs ${this.stikerColumns === col ? 'bg-purple-600 text-white shadow' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}">
                                        ${col} Kolom
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 3. Filter Kandang -->
                        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-2">
                            <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <i data-lucide="home" class="w-4 h-4 text-purple-600"></i> Filter Kandang:
                            </label>
                            <select onchange="PenggemukanModule.setStikerFilterKandang(this.value)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="all" ${this.stikerFilterKandang === 'all' ? 'selected' : ''}>Semua Kandang (${allDomba.length} Ekor)</option>
                                ${kandangList.map(kName => {
                                    const count = allDomba.filter(d => (d.kandang || '').includes(kName)).length;
                                    const isSel = this.stikerFilterKandang === kName;
                                    return `<option value="${kName}" ${isSel ? 'selected' : ''}>${kName} (${count} Ekor)</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Ringkasan Status Pratinjau -->
                    <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                        <div class="flex items-center gap-2">
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">
                                <i data-lucide="tag" class="w-3.5 h-3.5"></i> ${dombaList.length} Stiker Siap Dicetak
                            </span>
                            <span>Tata letak: <b>Kertas ${this.stikerPaperSize}</b> dengan susunan <b>${this.stikerColumns} Kolom</b></span>
                        </div>
                        <button onclick="PenggemukanModule.cetakLembarStikerNow()" class="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-bold">
                            <i data-lucide="printer" class="w-4 h-4"></i> 🖨️ Cetak Lembar Stiker Now &rarr;
                        </button>
                    </div>
                </div>

                <!-- QR Sticker Grid (Printable Sheet Preview) -->
                ${dombaList.length === 0 ? `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center text-xs text-slate-400 space-y-2">
                        <i data-lucide="inbox" class="w-8 h-8 mx-auto text-slate-400 opacity-50"></i>
                        <p class="font-semibold">Tidak ada data domba/kambing pada filter kandang terpilih.</p>
                        <button onclick="PenggemukanModule.setStikerFilterKandang('all')" class="text-purple-600 hover:underline font-bold">Tampilkan Semua Kandang</button>
                    </div>
                ` : `
                    <div class="grid ${gridColsClass} gap-4" id="qr-sheet-container">
                        ${dombaList.map(d => {
                            const latestWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                            const tagBadge = window.DombaModule ? DombaModule.getWarnaTagBadge(d.warnaEartag, d.eartag) : `<span class="font-mono font-bold">${d.eartag}</span>`;
                            return `
                                <div class="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800 hover:border-purple-500 p-4 text-center space-y-2.5 shadow-sm transition">
                                    <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b pb-1 dark:border-slate-700">
                                        <span class="tracking-wider uppercase text-emerald-700 dark:text-emerald-400 font-black">${cfg.singkatanLembaga || 'BUMKAL LPM'}</span>
                                        <span>Tag: <b>${d.warnaEartag || 'Kuning'}</b></span>
                                    </div>
                                    <div class="flex items-center justify-center gap-1.5 pt-0.5">
                                        ${tagBadge}
                                    </div>
                                    <div class="flex justify-center my-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-700 mx-auto shadow-sm overflow-hidden">
                                        ${window.BarcodeUtils ? BarcodeUtils.generateSVG(d.eartag, { height: 38, barWidth: 1.5, showText: true }) : `<span class="font-mono font-bold">${d.eartag}</span>`}
                                    </div>
                                    <div class="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5 text-left">
                                        <div class="flex justify-between"><span>Lokasi:</span><b class="text-slate-800 dark:text-slate-200">${d.kandang.split('(')[0]} (${d.sekat})</b></div>
                                        <div class="flex justify-between"><span>Bobot:</span><b class="text-emerald-600 font-bold">${latestWeight} kg</b></div>
                                        <div class="flex justify-between"><span>Asal:</span><span class="truncate max-w-[130px]">${d.asalTernak || 'BUMKal'}</span></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
    },

    // 6. IMPORT MASAL DATA TERNAK (EXCEL & CSV MULTI-FORMAT)
    pendingImportData: [],

    renderImportCSV() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
                            <i data-lucide="upload" class="w-3.5 h-3.5"></i> Integrasi Data Spreadsheet
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Import Masal Data Ternak (Excel & CSV)</h2>
                        <p class="text-xs text-slate-500">Unggah puluhan atau ratusan data domba baru sekaligus tanpa resiko kolom bertumpuk di Excel.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button onclick="PenggemukanModule.downloadTemplateExcel()" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition active:scale-95">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Unduh Template Excel (.xls)
                        </button>
                        <button onclick="PenggemukanModule.downloadTemplateCSVSemicolon()" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                            <i data-lucide="file-text" class="w-4 h-4 text-blue-600"></i> Template CSV Titik-Koma (;)
                        </button>
                    </div>
                </div>

                <!-- INFO PANDUAN EXCEL AGAR TIDAK MENUMPUK DI KOLOM A -->
                <div class="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3 text-xs">
                    <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <i data-lucide="info" class="w-4 h-4"></i>
                    </div>
                    <div class="space-y-1">
                        <b class="text-amber-900 dark:text-amber-200 font-bold">Mengapa file CSV sering menumpuk di Kolom A saat dibuka di Excel?</b>
                        <p class="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                            Di sistem operasi Windows Indonesia, Microsoft Excel menggunakan pemisah daftar <b>titik-koma (;)</b>. Bila membuka file CSV standar internasional berpemisah koma (,), Excel akan memasukkan seluruh teks ke kolom A. Gunakan <b>Template Excel (.xls)</b> atau <b>Template CSV Titik-Koma (;)</b> yang kami sediakan agar kolom otomatis terpisah rapi (Kolom A s/d M)!
                        </p>
                    </div>
                </div>

                <!-- UPLOAD AREA -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
                    <div class="text-center space-y-2">
                        <div class="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                            <i data-lucide="upload-cloud" class="w-7 h-7"></i>
                        </div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white">Pilih File Spreadsheet Anda (.csv atau .txt)</h3>
                        <p class="text-xs text-slate-500">Sistem otomatis mendeteksi pemisah kolom baik <b>titik-koma (;)</b>, <b>koma (,)</b>, maupun <b>Tab</b>.</p>
                    </div>

                    <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/30 text-center">
                        <input type="file" id="csv-upload-input" accept=".csv,.txt" onchange="PenggemukanModule.previewCSVFile(this)" class="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer">
                    </div>

                    <!-- PREVIEW CONTAINER -->
                    <div id="import-preview-area" class="hidden space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                                <span id="preview-count-label">0 Data Siap Diimpor</span>
                                <span id="preview-delim-label" class="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Pemisah Terdeteksi: ;</span>
                            </div>
                            <span class="text-[11px] text-slate-400">Pratinjau 5 Baris Pertama</span>
                        </div>

                        <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                            <table class="w-full text-left text-xs border-collapse" id="preview-table">
                                <thead class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                                    <tr>
                                        <th class="p-2 border-b">Eartag</th>
                                        <th class="p-2 border-b">Warna Tag</th>
                                        <th class="p-2 border-b">Nama</th>
                                        <th class="p-2 border-b">Ras</th>
                                        <th class="p-2 border-b">Asal Ternak</th>
                                        <th class="p-2 border-b">Kelamin</th>
                                        <th class="p-2 border-b">Kategori</th>
                                        <th class="p-2 border-b">Kandang</th>
                                        <th class="p-2 border-b">Sekat</th>
                                        <th class="p-2 border-b">Bobot Awal</th>
                                        <th class="p-2 border-b">Harga Beli</th>
                                        <th class="p-2 border-b">Status</th>
                                        <th class="p-2 border-b">Tanggal Masuk</th>
                                    </tr>
                                </thead>
                                <tbody id="preview-tbody" class="divide-y divide-slate-100 dark:divide-slate-800">
                                </tbody>
                            </table>
                        </div>

                        <button onclick="PenggemukanModule.confirmImportData()" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95">
                            <i data-lucide="database" class="w-4 h-4"></i> Konfirmasi & Simpan Semua Data ke Database
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    downloadTemplateExcel() {
        const headers = ["Eartag", "WarnaEartag", "Nama", "Ras", "AsalTernak", "Kelamin", "Kategori", "Kandang", "Sekat", "BobotAwal", "HargaBeli", "Status", "TanggalMasuk"];
        const rows = [
            ["DMB-099", "Kuning", "Bima Super", "Dorper Cross", "Pasar Hewan Imogiri", "Jantan", "Fattening", "Kandang A", "Sekat 05", "30.50", "3000000", "Sehat", "2026-08-01"],
            ["DMB-100", "Hijau", "Dewi Kunti", "Texel Wonosobo", "Peternak Rakyat Pleret", "Betina", "Indukan", "Kandang B", "Sekat 05", "32.25", "3200000", "Sehat", "2026-08-01"],
            ["DMB-101", "Merah", "Gatot Subroto", "Garut Tangkas", "Peternak Bantul", "Jantan", "Pejantan", "Kandang A", "Sekat 06", "42.75", "4200000", "Sehat", "2026-08-01"]
        ];
        ExportImport.exportExcelTable("template_import_domba_bumkal", headers, rows, "Template Import Masal Data Domba", "Template_Ternak");
    },

    downloadTemplateCSVSemicolon() {
        const header = "Eartag;WarnaEartag;Nama;Ras;AsalTernak;Kelamin;Kategori;Kandang;Sekat;BobotAwal;HargaBeli;Status;TanggalMasuk\r\n";
        const sample1 = "DMB-099;Kuning;Bima Super;Dorper Cross;Pasar Hewan Imogiri;Jantan;Fattening;Kandang A;Sekat 05;30.50;3000000;Sehat;2026-08-01\r\n";
        const sample2 = "DMB-100;Hijau;Dewi Kunti;Texel Wonosobo;Peternak Rakyat Pleret;Betina;Indukan;Kandang B;Sekat 05;32.25;3200000;Sehat;2026-08-01\r\n";
        const blob = new Blob(["\uFEFF" + header + sample1 + sample2], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_import_domba_excel_windows.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        App.showToast("Template CSV Semicolon (Windows Indonesia) berhasil diunduh!", "success");
    },

    // Parser CSV dengan deteksi otomatis pemisah & penanganan kutip
    parseCSVLine(line, delim) {
        const result = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delim && !inQuotes) {
                result.push(cur.trim());
                cur = "";
            } else {
                cur += char;
            }
        }
        result.push(cur.trim());
        return result;
    },

    previewCSVFile(input) {
        if (!input || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            let lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length === 0) {
                App.showToast("File kosong!", "error");
                return;
            }

            // Hapus directive sep=... jika ada
            if (lines[0].toLowerCase().startsWith("sep=")) {
                lines.shift();
            }

            if (lines.length <= 1) {
                App.showToast("File hanya memiliki baris header tanpa baris data!", "error");
                return;
            }

            // Deteksi Delimiter Otomatis: Cek frekuensi ; vs , vs \t di baris header
            const headerLine = lines[0];
            const semiCount = (headerLine.match(/;/g) || []).length;
            const commaCount = (headerLine.match(/,/g) || []).length;
            const tabCount = (headerLine.match(/\t/g) || []).length;

            let delim = ";";
            if (tabCount > semiCount && tabCount > commaCount) delim = "\t";
            else if (commaCount > semiCount) delim = ",";

            const parseDateInput = (val) => {
                if (!val) return "";
                val = val.trim();
                const dmy = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (dmy) {
                    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
                }
                const ymd = val.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
                if (ymd) {
                    return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
                }
                return val;
            };

            const parseWeight = (val) => {
                if (!val) return 25.00;
                const clean = String(val).replace(',', '.').replace(/[^0-9.]/g, '');
                const num = parseFloat(clean);
                return isNaN(num) ? 25.00 : parseFloat(num.toFixed(2));
            };

            const parsedRows = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = this.parseCSVLine(lines[i], delim);
                if (cols.length >= 7 && cols[0].length > 0) {
                    if (cols.length >= 11) {
                        parsedRows.push({
                            eartag: cols[0],
                            warnaEartag: cols[1] || "Kuning",
                            nama: cols[2] || `Domba ${cols[0]}`,
                            ras: cols[3] || "Lokal Cross",
                            asalTernak: cols[4] || "Peternak Lokal Pleret",
                            kelamin: cols[5] || "Jantan",
                            kategori: cols[6] || "Fattening",
                            kandang: cols[7] || "Kandang A",
                            sekat: cols[8] || "Sekat 01",
                            bobotAwal: parseWeight(cols[9]),
                            hargaBeli: parseFloat(cols[10]) || 2500000,
                            status: cols[11] || "Sehat",
                            tglMasuk: parseDateInput(cols[12])
                        });
                    } else {
                        parsedRows.push({
                            eartag: cols[0],
                            warnaEartag: "Kuning",
                            nama: cols[1] || `Domba ${cols[0]}`,
                            ras: cols[2] || "Lokal Cross",
                            asalTernak: "Peternak Lokal Pleret",
                            kelamin: cols[3] || "Jantan",
                            kategori: cols[4] || "Fattening",
                            kandang: cols[5] || "Kandang A",
                            sekat: cols[6] || "Sekat 01",
                            bobotAwal: parseWeight(cols[7]),
                            hargaBeli: parseFloat(cols[8]) || 2500000,
                            status: cols[9] || "Sehat",
                            tglMasuk: parseDateInput(cols[10])
                        });
                    }
                }
            }

            if (parsedRows.length === 0) {
                App.showToast("Gagal memetakan kolom. Pastikan format kolom sesuai template!", "error");
                return;
            }

            this.pendingImportData = parsedRows;

            // Render Preview
            const previewArea = document.getElementById("import-preview-area");
            const previewCount = document.getElementById("preview-count-label");
            const previewDelim = document.getElementById("preview-delim-label");
            const tbody = document.getElementById("preview-tbody");

            if (previewArea && previewCount && tbody) {
                previewArea.classList.remove("hidden");
                previewCount.textContent = `${parsedRows.length} Data Ternak Siap Diimpor`;
                previewDelim.textContent = `Pemisah Terdeteksi: ${delim === ';' ? 'Titik-Koma (;)' : delim === ',' ? 'Koma (,)' : 'Tab'}`;

                const previewFive = parsedRows.slice(0, 5);
                const defaultNow = new Date().toISOString().split("T")[0];
                tbody.innerHTML = previewFive.map(d => `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td class="p-2 font-bold text-emerald-600">${d.eartag}</td>
                        <td class="p-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">${d.warnaEartag || 'Kuning'}</span></td>
                        <td class="p-2 font-semibold text-slate-800 dark:text-slate-200">${d.nama}</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400">${d.ras}</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400 font-medium">${d.asalTernak || 'Lokal'}</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400">${d.kelamin}</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400">${d.kategori}</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400">${d.kandang}</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400">${d.sekat}</td>
                        <td class="p-2 font-bold text-slate-800 dark:text-slate-200">${Number(d.bobotAwal || 0).toFixed(2)} kg</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400">Rp ${(d.hargaBeli).toLocaleString('id-ID')}</td>
                        <td class="p-2"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">${d.status || 'Sehat'}</span></td>
                        <td class="p-2 font-semibold text-emerald-600">${d.tglMasuk || defaultNow}</td>
                    </tr>
                `).join('');

                if (window.lucide) window.lucide.createIcons();
            }
        };

        reader.readAsText(file);
    },

    confirmImportData() {
        if (!this.pendingImportData || this.pendingImportData.length === 0) {
            App.showToast("Tidak ada data untuk diimpor!", "error");
            return;
        }

        const existingList = Store.getDomba();
        let addedCount = 0;
        const now = new Date().toISOString().split("T")[0];

        this.pendingImportData.forEach((row, idx) => {
            const initialWeight = parseFloat(Number(row.bobotAwal || 0).toFixed(2));
            const newD = {
                id: "dmb-imp-" + Date.now() + "-" + idx,
                eartag: row.eartag,
                warnaEartag: row.warnaEartag || "Kuning",
                nama: row.nama,
                ras: row.ras,
                asalTernak: row.asalTernak || "Peternak Lokal Pleret",
                kelamin: row.kelamin,
                kategori: row.kategori,
                kandang: row.kandang,
                sekat: row.sekat,
                bobotAwal: initialWeight,
                hargaBeli: row.hargaBeli,
                status: row.status,
                tglLahir: "2025-01-01",
                tglMasuk: row.tglMasuk || now,
                adg: 0,
                foto: "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=600&q=80",
                riwayatTimbang: [{ tgl: row.tglMasuk || now, bobot: initialWeight, catatan: "Import Berkas Spreadsheet" }],
                rekamMedis: [],
                riwayatKawin: []
            };
            existingList.unshift(newD);
            addedCount++;
        });

        Store.saveDomba(existingList);
        this.pendingImportData = [];
        App.showToast(`Sukses mengimpor ${addedCount} data ternak dengan kolom terpisah rapi!`, "success");
        setTimeout(() => {
            App.navigate("data_ternak");
        }, 600);
    },

    lihatTernakBatch(batchId) {
        DombaModule.resetFilter();
        App.navigate("data_ternak");
    },

    openModalTambahBatch() {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="package" class="w-5 h-5 text-emerald-600"></i> Buat Siklus Batch Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PenggemukanModule.submitBatch(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Siklus Batch *</label>
                        <input type="text" id="nb-nama" required placeholder="Contoh: Batch Penggemukan Qurban 2027" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target ADG (g/hari) *</label>
                            <input type="number" id="nb-adg" required value="220" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Bobot Panen (kg) *</label>
                            <input type="number" id="nb-bobot" required value="50" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai</label>
                            <input type="date" id="nb-tgl-mulai" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Panen</label>
                            <input type="date" id="nb-tgl-panen" value="2027-05-15" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Strategi Ransum</label>
                        <textarea id="nb-catatan" rows="2" placeholder="Fokus pakan silase jagung dan konsentrat PK 16%" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">Simpan Batch</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitBatch(e) {
        e.preventDefault();
        const batches = Store.getBatchesPenggemukan();
        const newB = {
            id: "btc-" + Date.now(),
            nama: document.getElementById("nb-nama").value.trim(),
            targetAdg: parseInt(document.getElementById("nb-adg").value),
            targetBobotKg: parseInt(document.getElementById("nb-bobot").value),
            tglMulai: document.getElementById("nb-tgl-mulai").value,
            targetPanen: document.getElementById("nb-tgl-panen").value,
            kandangAlokasi: "Kandang A",
            status: "Berjalan (Fase Awal)",
            catatan: document.getElementById("nb-catatan").value.trim() || "-"
        };

        batches.unshift(newB);
        Store.saveBatchesPenggemukan(batches);
        Store.addLog(`Membuat siklus batch penggemukan baru: ${newB.nama}`);
        App.closeModal();
        App.showToast("Batch baru berhasil dibuat!", "success");
        App.renderContent();
    },

    openModalTambahKandang() {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="warehouse" class="w-5 h-5 text-emerald-600"></i> Tambah Gedung Kandang Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PenggemukanModule.submitKandang(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Kandang *</label>
                        <input type="text" id="nk-nama" required placeholder="Contoh: Kandang D (Koloni Penggemukan)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Blok *</label>
                        <input type="text" id="nk-lokasi" required value="Sektor Barat Kedaton" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas Maksimal (Ekor) *</label>
                            <input type="number" id="nk-kapasitas" required value="40" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Konstruksi *</label>
                            <select id="nk-tipe" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Panggung Kayu Mahoni">Panggung Kayu Mahoni (Standar)</option>
                                <option value="Panggung Baja Ringan & Bambu">Panggung Baja Ringan & Bambu</option>
                                <option value="Kandang Postal Karpet Karet">Postal Karpet Karet</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Sekat / Paddock *</label>
                            <input type="number" id="nk-sekat" required value="6" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kondisi Ventilasi / Udara</label>
                            <input type="text" id="nk-suhu" value="28°C - 30°C (Sirkulasi Terbuka)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">Simpan Fasilitas</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitKandang(e) {
        e.preventDefault();
        const nama = document.getElementById("nk-nama").value.trim();
        const lokasi = document.getElementById("nk-lokasi").value.trim();
        const kapasitasMaks = parseInt(document.getElementById("nk-kapasitas").value);
        const tipeKandang = document.getElementById("nk-tipe").value;
        const totalSekat = parseInt(document.getElementById("nk-sekat").value) || 4;
        const suhuRataRata = document.getElementById("nk-suhu").value.trim();

        const sekatList = [];
        const capPerSekat = Math.round(kapasitasMaks / totalSekat);
        for (let i = 1; i <= totalSekat; i++) {
            sekatList.push({
                nomor: `Sekat 0${i}`,
                kapasitas: capPerSekat,
                terisi: 0,
                eartags: []
            });
        }

        const masterKandang = Store.getMasterKandang();
        masterKandang.push({
            id: "knd-" + Date.now(),
            nama,
            lokasi,
            kapasitasMaks,
            terisi: 0,
            tipeKandang,
            kebersihan: "Bersih & Sanitasi Rutin",
            suhuRataRata,
            sekatList
        });

        Store.saveMasterKandang(masterKandang);
        Store.addLog(`Menambah gedung kandang baru: ${nama}`);
        App.closeModal();
        App.showToast("Gedung kandang baru berhasil ditambahkan!", "success");
        App.renderContent();
    },

    searchBatch(val) {
        this.batchSearchQuery = val;
        App.renderContent();
    },

    filterStatusBatch(val) {
        this.batchFilterStatus = val;
        App.renderContent();
    },

    resetFilterBatch() {
        this.batchSearchQuery = "";
        this.batchFilterStatus = "all";
        App.renderContent();
    },

    openModalEditBatch(batchId) {
        const batches = Store.getBatchesPenggemukan();
        const b = batches.find(item => item.id === batchId);
        if (!b) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-indigo-600"></i> Ubah Siklus Batch: ${b.id}
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PenggemukanModule.submitEditBatch(event, '${b.id}')" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Siklus Batch *</label>
                        <input type="text" id="eb-nama" required value="${b.nama || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Siklus *</label>
                            <select id="eb-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                <option value="Berjalan (Fase Awal)" ${b.status === 'Berjalan (Fase Awal)' ? 'selected' : ''}>Berjalan (Fase Awal)</option>
                                <option value="Berjalan (Fase Akhir)" ${b.status === 'Berjalan (Fase Akhir)' ? 'selected' : ''}>Berjalan (Fase Akhir)</option>
                                <option value="Persiapan" ${b.status === 'Persiapan' ? 'selected' : ''}>Persiapan</option>
                                <option value="Selesai" ${b.status === 'Selesai' ? 'selected' : ''}>Selesai / Panen</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alokasi Kandang</label>
                            <input type="text" id="eb-kandang" value="${b.kandangAlokasi || 'Kandang A'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target ADG (g/hari) *</label>
                            <input type="number" id="eb-adg" required value="${b.targetAdg || 200}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Bobot Panen (kg) *</label>
                            <input type="number" id="eb-bobot" required value="${b.targetBobotKg || 50}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai</label>
                            <input type="date" id="eb-tgl-mulai" value="${b.tglMulai || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Panen</label>
                            <input type="date" id="eb-tgl-panen" value="${b.targetPanen || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Ransum / Strategi</label>
                        <textarea id="eb-catatan" rows="2" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">${b.catatan || ''}</textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition active:scale-95">Simpan Perubahan Batch</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditBatch(e, batchId) {
        e.preventDefault();
        const data = {
            nama: document.getElementById("eb-nama").value.trim(),
            status: document.getElementById("eb-status").value,
            kandangAlokasi: document.getElementById("eb-kandang").value.trim(),
            targetAdg: parseInt(document.getElementById("eb-adg").value),
            targetBobotKg: parseInt(document.getElementById("eb-bobot").value),
            tglMulai: document.getElementById("eb-tgl-mulai").value,
            targetPanen: document.getElementById("eb-tgl-panen").value,
            catatan: document.getElementById("eb-catatan").value.trim()
        };

        Store.updateBatch(batchId, data);
        App.closeModal();
        App.showToast("Data siklus batch berhasil diperbarui!", "success");
        App.renderContent();
    },

    deleteBatch(batchId) {
        if (confirm("Apakah Anda yakin ingin menghapus siklus batch ini?")) {
            Store.deleteBatch(batchId);
            App.showToast("Siklus batch berhasil dihapus!", "success");
            App.renderContent();
        }
    },

    searchKandang(val) {
        this.kandangSearchQuery = val;
        App.renderContent();
    },

    filterTipeKandang(val) {
        this.kandangFilterTipe = val;
        App.renderContent();
    },

    resetFilterKandang() {
        this.kandangSearchQuery = "";
        this.kandangFilterTipe = "all";
        App.renderContent();
    },

    openModalEditKandang(kandangId) {
        Store.syncSekatOccupancy();
        const kandangList = Store.getMasterKandang();
        const k = kandangList.find(item => item.id === kandangId);
        if (!k) return;
        if (!Array.isArray(k.sekatList)) k.sekatList = [];

        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="edit-3" class="w-5 h-5 text-indigo-600"></i> Ubah Gedung Kandang: ${k.nama}
                        </h3>
                        <p class="text-xs text-slate-500">ID: ${k.id} • ${k.lokasi}</p>
                    </div>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PenggemukanModule.submitEditKandang(event, '${k.id}')" class="space-y-4 text-xs">
                    <div class="space-y-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Kandang *</label>
                            <input type="text" id="ek-nama" required value="${k.nama || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Blok Fasilitas *</label>
                            <input type="text" id="ek-lokasi" required value="${k.lokasi || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas Maksimal (Ekor) *</label>
                                <input type="number" id="ek-kapasitas" required value="${k.kapasitasMaks || 30}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600">
                                <span class="text-[10px] text-slate-400">Akumulasi kapasitas seluruh bilik/sekat</span>
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Konstruksi *</label>
                                <select id="ek-tipe" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                    <option value="Panggung Kayu Mahoni" ${k.tipeKandang === 'Panggung Kayu Mahoni' ? 'selected' : ''}>Panggung Kayu Mahoni (Standar)</option>
                                    <option value="Panggung Baja Ringan & Bambu" ${k.tipeKandang === 'Panggung Baja Ringan & Bambu' ? 'selected' : ''}>Panggung Baja Ringan & Bambu</option>
                                    <option value="Kandang Postal Karpet Karet" ${k.tipeKandang === 'Kandang Postal Karpet Karet' ? 'selected' : ''}>Postal Karpet Karet</option>
                                </select>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Suhu Rata-rata / Sirkulasi</label>
                                <input type="text" id="ek-suhu" value="${k.suhuRataRata || '28°C - 30°C'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Kebersihan</label>
                                <input type="text" id="ek-kebersihan" value="${k.kebersihan || 'Bersih & Sanitasi Rutin'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                            </div>
                        </div>
                    </div>

                    <!-- PANEL PENGELOLAAN KOLONI & SEKAT KANDANG (TAMBAH / KURANGI / EDIT) -->
                    <div class="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2 space-y-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                                    <i data-lucide="layout-grid" class="w-4 h-4 text-emerald-600"></i> Pengaturan Sekat & Koloni Kandang
                                </h4>
                                <p class="text-[11px] text-slate-500">Kelola jumlah sekat, kapasitas tiap bilik, dan identitas koloni.</p>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                ${(k.sekatList || []).length} Sekat • ${k.terisi || 0} / ${k.kapasitasMaks || 0} Ekor
                            </span>
                        </div>

                        <!-- FORM CEPAT TAMBAH SEKAT BARU -->
                        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                + Tambah Sekat / Koloni Baru:
                            </label>
                            <div class="flex flex-col sm:flex-row gap-2">
                                <input type="text" id="ek-new-sekat-nomor" placeholder="Nama/Nomor Sekat (Cth: Sekat 0${(k.sekatList || []).length + 1} atau Koloni Pejantan)" class="flex-1 p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100">
                                <input type="number" id="ek-new-sekat-kapasitas" min="1" value="4" placeholder="Kapasitas" class="w-24 p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-center font-bold text-slate-800 dark:text-slate-100" title="Kapasitas Tampung (Ekor)">
                                <button type="button" onclick="PenggemukanModule.tambahSekatFromModal('${k.id}')" class="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-sm transition active:scale-95 whitespace-nowrap">
                                    <i data-lucide="plus" class="w-3.5 h-3.5"></i> Tambah Sekat
                                </button>
                            </div>
                        </div>

                        <!-- LIST SEKAT TERPASANG DENGAN TOMBOL EDIT DAN HAPUS -->
                        <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                            ${(k.sekatList || []).length === 0 ? `
                                <div class="p-4 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    Belum ada sekat/koloni di kandang ini. Tambahkan sekat pertama melalui formulir di atas.
                                </div>
                            ` : (k.sekatList || []).map((s, sIdx) => `
                                <div class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-center justify-between gap-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition">
                                    <div class="min-w-0 flex-1">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-slate-900 dark:text-white text-xs">${s.nomor}</span>
                                            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${s.terisi > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}">
                                                ${s.terisi || 0} / ${s.kapasitas} Ekor
                                            </span>
                                        </div>
                                        <div class="text-[10px] text-slate-400 truncate mt-0.5">
                                            ${(s.eartags || []).length > 0 ? `Domba: ${(s.eartags || []).join(', ')}` : 'Kosong / Belum ada domba'}
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1.5 flex-shrink-0">
                                        <button type="button" onclick="PenggemukanModule.openModalEditSekat('${k.id}', ${sIdx}, true)" class="px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 transition" title="Ubah Nama & Kapasitas Sekat">
                                            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i> Ubah
                                        </button>
                                        <button type="button" onclick="PenggemukanModule.kurangiSekat('${k.id}', ${sIdx}, true)" class="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-bold flex items-center gap-1 transition" title="Hapus / Kurangi Sekat">
                                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition active:scale-95">Simpan Perubahan Kandang</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditKandang(e, kandangId) {
        e.preventDefault();
        const data = {
            nama: document.getElementById("ek-nama").value.trim(),
            lokasi: document.getElementById("ek-lokasi").value.trim(),
            kapasitasMaks: parseInt(document.getElementById("ek-kapasitas").value),
            tipeKandang: document.getElementById("ek-tipe").value,
            suhuRataRata: document.getElementById("ek-suhu").value.trim(),
            kebersihan: document.getElementById("ek-kebersihan").value.trim()
        };

        Store.updateMasterKandang(kandangId, data);
        App.closeModal();
        App.showToast("Data gedung kandang berhasil diperbarui!", "success");
        App.renderContent();
    },

    deleteKandang(kandangId) {
        const dombaList = Store.getDomba();
        const kandang = Store.getMasterKandang().find(k => k.id === kandangId);
        const dombaInKandang = dombaList.filter(d => (d.kandang || '').includes(kandang ? kandang.nama.split('(')[0].trim() : '___'));

        if (dombaInKandang.length > 0) {
            if (!confirm(`Kandang ini masih memiliki ${dombaInKandang.length} ekor domba di dalamnya! Tetap ingin menghapus kandang ini? (Data domba akan tetap tersimpan)`)) {
                return;
            }
        } else {
            if (!confirm("Apakah Anda yakin ingin menghapus gedung kandang ini?")) {
                return;
            }
        }

        Store.deleteMasterKandang(kandangId);
        App.showToast("Gedung kandang berhasil dihapus!", "success");
        App.renderContent();
    },

    tambahSekatFromModal(kandangId) {
        const inputNomor = document.getElementById("ek-new-sekat-nomor");
        const inputKap = document.getElementById("ek-new-sekat-kapasitas");
        const k = Store.getMasterKandang().find(item => item.id === kandangId);
        if (!k) return;

        const nomor = (inputNomor && inputNomor.value.trim()) || `Sekat 0${(k.sekatList || []).length + 1}`;
        const kapasitas = parseInt(inputKap ? inputKap.value : 4) || 4;

        Store.addSekatToKandang(kandangId, { nomor, kapasitas });
        App.showToast(`Sekat "${nomor}" (Kapasitas ${kapasitas}) berhasil ditambahkan!`, "success");
        this.openModalEditKandang(kandangId);
        App.renderContent();
    },

    openModalKelolaSekat(kandangId) {
        Store.syncSekatOccupancy();
        const k = Store.getMasterKandang().find(item => item.id === kandangId);
        if (!k) return;
        if (!Array.isArray(k.sekatList)) k.sekatList = [];

        App.setModalContent(`
            <div class="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div>
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-1">
                            <i data-lucide="grid" class="w-3.5 h-3.5"></i> Pengaturan Sekat & Koloni
                        </div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Kelola Koloni & Sekat: ${k.nama}
                        </h3>
                        <p class="text-xs text-slate-500">${k.lokasi} • Total Okupansi: <b>${k.terisi || 0} / ${k.kapasitasMaks} Ekor</b> (${(k.sekatList || []).length} Sekat)</p>
                    </div>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <!-- FORM TAMBAH SEKAT CEPAT -->
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-600"></i> Tambah Sekat / Koloni Baru
                    </span>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="text" id="ks-new-nomor" placeholder="Nama / Nomor Sekat (Contoh: Sekat 0${(k.sekatList || []).length + 1} atau Koloni C)" class="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100">
                        <input type="number" id="ks-new-kapasitas" min="1" value="4" placeholder="Kapasitas" class="w-28 p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-center font-bold text-slate-800 dark:text-slate-100" title="Kapasitas Tampung (Ekor)">
                        <button type="button" onclick="PenggemukanModule.tambahSekatFromKelolaModal('${k.id}')" class="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 whitespace-nowrap">
                            <i data-lucide="plus" class="w-4 h-4"></i> Tambah Sekat
                        </button>
                    </div>
                </div>

                <!-- DAFTAR SEKAT -->
                <div class="space-y-2">
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Daftar Sekat Saat Ini (${(k.sekatList || []).length} Sekat):</span>
                    <div class="space-y-2">
                        ${(k.sekatList || []).length === 0 ? `
                            <div class="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                Belum ada sekat pada fasilitas kandang ini. Tambahkan sekat pertama melalui formulir di atas.
                            </div>
                        ` : (k.sekatList || []).map((s, sIdx) => `
                            <div class="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-400 transition">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-2">
                                        <span class="font-bold text-slate-900 dark:text-white text-xs">${s.nomor}</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${s.terisi > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}">
                                            ${s.terisi || 0} / ${s.kapasitas} Ekor
                                        </span>
                                    </div>
                                    <div class="text-[11px] text-slate-500">
                                        Domba Aktif: <span class="font-medium text-slate-700 dark:text-slate-300">${(s.eartags || []).length > 0 ? (s.eartags || []).join(', ') : '(Kosong)'}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1.5 flex-shrink-0">
                                    <button type="button" onclick="PenggemukanModule.openModalEditSekat('${k.id}', ${sIdx}, false)" class="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs flex items-center gap-1 transition" title="Ubah Nama & Kapasitas Sekat">
                                        <i data-lucide="edit-2" class="w-3.5 h-3.5"></i> Ubah
                                    </button>
                                    <button type="button" onclick="PenggemukanModule.kurangiSekat('${k.id}', ${sIdx}, false)" class="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 font-bold text-xs flex items-center gap-1 transition" title="Hapus / Kurangi Sekat">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="pt-3 border-t dark:border-slate-700 flex justify-between items-center">
                    <button type="button" onclick="PenggemukanModule.openModalEditKandang('${k.id}')" class="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                        <i data-lucide="settings" class="w-3.5 h-3.5"></i> Buka Ubah Gedung Kandang
                    </button>
                    <button type="button" onclick="App.closeModal()" class="px-5 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-xs">
                        Tutup
                    </button>
                </div>
            </div>
        `);
        App.openModal();
    },

    tambahSekatFromKelolaModal(kandangId) {
        const inputNomor = document.getElementById("ks-new-nomor");
        const inputKap = document.getElementById("ks-new-kapasitas");
        const k = Store.getMasterKandang().find(item => item.id === kandangId);
        if (!k) return;

        const nomor = (inputNomor && inputNomor.value.trim()) || `Sekat 0${(k.sekatList || []).length + 1}`;
        const kapasitas = parseInt(inputKap ? inputKap.value : 4) || 4;

        Store.addSekatToKandang(kandangId, { nomor, kapasitas });
        App.showToast(`Sekat "${nomor}" berhasil ditambahkan!`, "success");
        this.openModalKelolaSekat(kandangId);
        App.renderContent();
    },

    openModalEditSekat(kandangId, sekatIndex, returnToKandangModal = false) {
        const k = Store.getMasterKandang().find(item => item.id === kandangId);
        if (!k || !k.sekatList || !k.sekatList[sekatIndex]) return;
        const sekat = k.sekatList[sekatIndex];

        App.setModalContent(`
            <div class="p-6 space-y-4 max-w-md mx-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-indigo-600"></i> Ubah Sekat / Koloni
                    </h3>
                    <button onclick="${returnToKandangModal ? `PenggemukanModule.openModalEditKandang('${kandangId}')` : `PenggemukanModule.openModalKelolaSekat('${kandangId}')`}" class="text-slate-400 hover:text-slate-600">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <form onsubmit="PenggemukanModule.submitEditSekat(event, '${kandangId}', ${sekatIndex}, ${returnToKandangModal})" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gedung Kandang</label>
                        <input type="text" disabled value="${k.nama}" class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold cursor-not-allowed">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama / Nomor Sekat *</label>
                        <input type="text" id="es-nomor" required value="${sekat.nomor}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100">
                        <p class="text-[11px] text-slate-400 mt-1">Contoh: Sekat 01, Sekat Karantina, atau Koloni Dorper A</p>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas Maksimal Sekat (Ekor) *</label>
                        <input type="number" id="es-kapasitas" min="1" required value="${sekat.kapasitas}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600">
                    </div>

                    ${(sekat.eartags || []).length > 0 ? `
                        <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 space-y-1">
                            <div class="font-bold flex items-center gap-1"><i data-lucide="info" class="w-3.5 h-3.5"></i> Informasi Okupansi:</div>
                            <div>Sekat ini sedang dihuni oleh <b>${sekat.terisi} ekor</b>: ${(sekat.eartags || []).join(', ')}.</div>
                            <div class="text-[10px] text-amber-700 dark:text-amber-300">Jika nama sekat diubah, lokasi domba-domba ini akan otomatis tersinkronisasi.</div>
                        </div>
                    ` : ''}

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="${returnToKandangModal ? `PenggemukanModule.openModalEditKandang('${kandangId}')` : `PenggemukanModule.openModalKelolaSekat('${kandangId}')`}" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition active:scale-95">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditSekat(e, kandangId, sekatIndex, returnToKandangModal) {
        e.preventDefault();
        const nomor = document.getElementById("es-nomor").value.trim();
        const kapasitas = parseInt(document.getElementById("es-kapasitas").value);

        Store.updateSekatInKandang(kandangId, sekatIndex, { nomor, kapasitas });
        App.showToast(`Sekat "${nomor}" berhasil diperbarui!`, "success");
        if (returnToKandangModal) {
            this.openModalEditKandang(kandangId);
        } else {
            this.openModalKelolaSekat(kandangId);
        }
        App.renderContent();
    },

    kurangiSekat(kandangId, sekatIndex, returnToKandangModal = false) {
        const k = Store.getMasterKandang().find(item => item.id === kandangId);
        if (!k || !k.sekatList || !k.sekatList[sekatIndex]) return;
        const sekat = k.sekatList[sekatIndex];

        let msg = `Apakah Anda yakin ingin menghapus/mengurangi sekat "${sekat.nomor}"?`;
        if (sekat.terisi > 0 || (sekat.eartags || []).length > 0) {
            msg = `PERINGATAN: Sekat "${sekat.nomor}" saat ini terisi ${sekat.terisi} ekor domba (${(sekat.eartags || []).join(', ')}).\n\nJika sekat dihapus, lokasi ternak tersebut akan dialihkan menjadi "Belum Dialokasikan" agar data tidak hilang.\n\nTetap ingin menghapus sekat ini?`;
        }

        if (confirm(msg)) {
            Store.deleteSekatFromKandang(kandangId, sekatIndex);
            App.showToast(`Sekat "${sekat.nomor}" berhasil dihapus!`, "success");
            if (returnToKandangModal) {
                this.openModalEditKandang(kandangId);
            } else {
                const updatedK = Store.getMasterKandang().find(item => item.id === kandangId);
                if (updatedK && document.getElementById("ks-new-nomor")) {
                    this.openModalKelolaSekat(kandangId);
                }
            }
            App.renderContent();
        }
    },

    renderQRCodes() {
        if (typeof QRCode === "undefined") return;
        const dombaList = this.getFilteredStikerDomba();
        const qrSize = this.stikerColumns >= 5 ? 75 : this.stikerColumns === 4 ? 85 : 95;
        dombaList.forEach(d => {
            const el = document.getElementById(`qr-domba-${d.eartag}`);
            if (el) {
                el.innerHTML = "";
                new QRCode(el, {
                    text: `BUMKAL-PLERET:${d.eartag}:${d.nama}:${d.ras}:${d.kandang}`,
                    width: qrSize,
                    height: qrSize,
                    colorDark: "#064e3b",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
            }
        });
    },

    // CETAK LEMBAR STIKER MULTI-BARCODE (A4 / A3 / A3+)
    cetakLembarStikerNow() {
        const list = this.getFilteredStikerDomba();
        if (list.length === 0) {
            App.showToast("Tidak ada stiker ternak untuk dicetak sesuai filter kandang saat ini.", "warning");
            return;
        }

        const cfg = Store.getPengaturan();
        const paper = this.stikerPaperSize || "A4";
        const cols = this.stikerColumns || 3;
        const kandangLabel = this.stikerFilterKandang === "all" ? "Semua Kandang" : this.stikerFilterKandang;

        let pageSizeCss = "A4 portrait";
        if (paper === "A3") pageSizeCss = "A3 portrait";
        if (paper === "A3+") pageSizeCss = "329mm 483mm";

        const printWin = window.open("", "", "width=980,height=950");
        if (!printWin) {
            window.print();
            return;
        }

        const itemsHtml = list.map(d => {
            const latestWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
            const tagColor = d.warnaEartag || 'Kuning';
            const barcodeSvg = window.BarcodeUtils 
                ? BarcodeUtils.generateSVG(d.eartag, { height: 38, barWidth: 1.4, showText: true, color: "#000000" })
                : `<div style="font-family:monospace;font-weight:bold;font-size:13px;padding:4px 0;">${d.eartag}</div>`;
            return `
                <div class="stiker-card">
                    <div class="card-head">
                        <span class="instansi">${cfg.singkatanLembaga || 'BUMKAL LPM PLERET'}</span>
                        <span class="badge-tag">🏷️ ${tagColor}</span>
                    </div>
                    <div class="animal-title">${d.nama} (${d.ras})</div>
                    <div class="barcode-target">
                        ${barcodeSvg}
                    </div>
                    <div class="animal-meta">
                        <div><b>${d.kandang.split('(')[0]}</b> • ${d.sekat} • <b>${latestWeight} kg</b></div>
                        <div class="sub-meta">${d.kelamin || 'Jantan'} • Asal: ${d.asalTernak || 'BUMKal'}</div>
                    </div>
                </div>
            `;
        }).join('');

        printWin.document.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <title>Lembar Stiker Barcode - ${paper} (${cols} Kolom)</title>
                <style>
                    @page {
                        size: ${pageSizeCss};
                        margin: 8mm 6mm;
                    }
                    * { box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        margin: 0;
                        padding: 8px;
                        color: #0f172a;
                        background: #fff;
                        font-size: 11px;
                    }
                    .print-bar {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: #f1f5f9;
                        padding: 8px 12px;
                        border-radius: 6px;
                        margin-bottom: 12px;
                        border: 1px solid #cbd5e1;
                    }
                    .sheet-grid {
                        display: grid;
                        grid-template-columns: repeat(${cols}, 1fr);
                        gap: 8px;
                    }
                    .stiker-card {
                        border: 1.5px dashed #475569;
                        border-radius: 8px;
                        padding: 6px;
                        text-align: center;
                        page-break-inside: avoid;
                        break-inside: avoid;
                        background: #fff;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        min-height: 145px;
                    }
                    .card-head {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 9px;
                        font-weight: bold;
                        margin-bottom: 2px;
                    }
                    .instansi {
                        font-size: 9px;
                        font-weight: 800;
                        color: #047857;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    .badge-tag {
                        border: 1px solid #94a3b8;
                        padding: 1px 4px;
                        border-radius: 4px;
                        font-size: 8.5px;
                        background: #f8fafc;
                    }
                    .animal-title {
                        font-size: 10px;
                        font-weight: 700;
                        color: #334155;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        margin-bottom: 2px;
                    }
                    .barcode-target {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin: 2px auto;
                    }
                    .barcode-target svg {
                        max-width: 100%;
                        height: auto;
                    }
                    .animal-meta {
                        font-size: 9px;
                        background: #f8fafc;
                        border-radius: 5px;
                        padding: 3px 4px;
                        border: 1px solid #e2e8f0;
                        margin-top: 3px;
                        line-height: 1.25;
                    }
                    .sub-meta {
                        color: #64748b;
                        font-size: 8px;
                        margin-top: 1px;
                    }
                    @media print {
                        .no-print { display: none !important; }
                        body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="print-bar no-print">
                    <div>
                        <b>Generator Stiker Multi-Barcode:</b> Kertas ${paper} (${cols} Kolom) • ${list.length} Stiker • Lokasi: ${kandangLabel}
                    </div>
                    <button onclick="window.print()" style="padding: 6px 16px; background: #7c3aed; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        🖨️ Cetak Lembar Stiker Now
                    </button>
                </div>

                <div class="sheet-grid">
                    ${itemsHtml}
                </div>
            </body>
            </html>
        `);
        printWin.document.close();

        setTimeout(() => {
            printWin.focus();
            printWin.print();
        }, 350);
    },

    renderCetakStikerBarcode() {
        return this.renderCetakStikerQR();
    }
};
