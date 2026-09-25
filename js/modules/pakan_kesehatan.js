/**
 * Modul Pakan & Kesehatan
 * Menangani 5 sub-menu:
 * 1. Input Pakan Harian
 * 2. Scan Vaksin & Medis
 * 3. Stok Pakan & HPP
 * 4. Rekam Medis
 * 5. Limbah Organik
 */

const PakanKesehatanModule = {
    currentSubMenu: "input_pakan_harian",
    pakanFilterKandang: "all",
    pakanSearchQuery: "",
    stokFilterKategori: "all",
    stokSearchQuery: "",
    medisSearchQuery: "",

    render(sub = null) {
        if (sub) this.currentSubMenu = sub;

        switch (this.currentSubMenu) {
            case "input_pakan_harian":
                return this.renderInputPakanHarian();
            case "scan_vaksin_medis":
                return this.renderScanVaksinMedis();
            case "stok_pakan_hpp":
                return this.renderStokPakanHPP();
            case "rekam_medis":
                return this.renderBukuRekamMedis();
            case "limbah_organik":
                return LimbahModule.render();
            default:
                return this.renderInputPakanHarian();
        }
    },

    // 1. INPUT PAKAN HARIAN
    renderInputPakanHarian() {
        let logPakan = Store.getLogPakanHarian();
        const masterKandang = Store.getMasterKandang ? Store.getMasterKandang() : [];
        const kandangOptions = masterKandang.length > 0 ? masterKandang.map(k => k.nama) : ["Kandang A", "Kandang B", "Kandang C"];

        // Filter & Search
        if (this.pakanSearchQuery) {
            const q = this.pakanSearchQuery.toLowerCase();
            logPakan = logPakan.filter(p => 
                p.kandang.toLowerCase().includes(q) ||
                p.petugas.toLowerCase().includes(q) ||
                (p.catatan && p.catatan.toLowerCase().includes(q)) ||
                p.tgl.includes(q)
            );
        }
        if (this.pakanFilterKandang !== "all") {
            logPakan = logPakan.filter(p => p.kandang.includes(this.pakanFilterKandang));
        }

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1">
                            <i data-lucide="box" class="w-3.5 h-3.5"></i> Nutrisi Ternak
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Pemberian Pakan Harian</h2>
                        <p class="text-xs text-slate-500">Pencatatan konsumsi konsentrat, silase jagung fermentasi, dan hijauan rumput odot per kandang.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button onclick="PakanKesehatanModule.openModalImportPakan()" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 shadow-sm transition active:scale-95 cursor-pointer">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Import Masal Pakan
                        </button>
                        <button onclick="PakanKesehatanModule.openModalCatatPakan()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md transition active:scale-95 cursor-pointer">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Catat Pakan Hari Ini
                        </button>
                    </div>
                </div>

                <!-- FILTER BAR -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
                    <div class="relative flex-1 w-full">
                        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                        <input 
                            type="text" 
                            placeholder="Cari tanggal, kandang, petugas, catatan..." 
                            value="${this.pakanSearchQuery}"
                            oninput="PakanKesehatanModule.searchPakan(this.value)"
                            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                        >
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <select 
                            onchange="PakanKesehatanModule.filterKandang(this.value)"
                            class="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                            <option value="all" ${this.pakanFilterKandang === 'all' ? 'selected' : ''}>Semua Kandang</option>
                            ${kandangOptions.map(k => `
                                <option value="${k}" ${this.pakanFilterKandang === k ? 'selected' : ''}>${k}</option>
                            `).join('')}
                        </select>
                        ${(this.pakanSearchQuery || this.pakanFilterKandang !== 'all') ? `
                            <button onclick="PakanKesehatanModule.resetFilterPakan()" class="text-xs text-rose-600 hover:underline whitespace-nowrap">
                                Reset
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="clipboard-list" class="w-4 h-4 text-teal-600"></i> Log Distribusi Pakan Kandang
                        </h3>
                        <div class="flex items-center gap-2">
                            <button onclick="ExportImport.openExportModal('pakan')" class="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer">
                                <i data-lucide="download" class="w-3.5 h-3.5"></i> Ekspor Log
                            </button>
                            <span class="text-slate-300 dark:text-slate-600">•</span>
                            <span class="text-xs text-slate-500">${logPakan.length} Catatan</span>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Tanggal & Waktu</th>
                                    <th class="py-3 px-4">Kandang</th>
                                    <th class="py-3 px-4 text-right">Konsentrat</th>
                                    <th class="py-3 px-4 text-right">Silase</th>
                                    <th class="py-3 px-4 text-right">Hijauan Odot</th>
                                    <th class="py-3 px-4">Petugas Pakan</th>
                                    <th class="py-3 px-4">Catatan Respon Ternak</th>
                                    <th class="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${logPakan.length === 0 ? `
                                    <tr>
                                        <td colspan="8" class="text-center py-6 text-slate-400">Tidak ada log pakan yang cocok dengan pencarian.</td>
                                    </tr>
                                ` : logPakan.map(p => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                            <div>${p.tgl}</div>
                                            <span class="text-[10px] text-slate-400 font-normal">${p.waktu}</span>
                                        </td>
                                        <td class="py-3 px-4 font-bold text-teal-700 dark:text-teal-400">${p.kandang}</td>
                                        <td class="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">${p.konsentratKg} kg</td>
                                        <td class="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">${p.silaseKg} kg</td>
                                        <td class="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">${p.hijauanOdotKg} kg</td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${p.petugas}</td>
                                        <td class="py-3 px-4 text-slate-500 italic">${p.catatan}</td>
                                        <td class="py-3 px-4 text-center">
                                            <div class="flex items-center justify-center gap-1">
                                                <button onclick="PakanKesehatanModule.openModalEditLogPakan('${p.id}')" title="Ubah Log Pakan" class="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg text-amber-600">
                                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                                </button>
                                                <button onclick="PakanKesehatanModule.deleteLogPakan('${p.id}')" title="Hapus Log Pakan" class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-rose-600">
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
            </div>
        `;
    },

    // 2. SCAN VAKSIN & MEDIS
    renderScanVaksinMedis() {
        const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");
        const presets = Store.getPresetVaksin();

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-1">
                            <i data-lucide="syringe" class="w-3.5 h-3.5"></i> Paramedik Veteriner
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Scan Vaksinasi & Penanganan Medis</h2>
                        <p class="text-xs text-slate-500">Pemberian vaksin, antibiotik, dan obat cacing dengan pemilihan preset formula dosis standar.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Form Tindakan Medis Kilat -->
                    <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
                        <form onsubmit="PakanKesehatanModule.submitQuickVaksin(event)" class="space-y-4 text-xs">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">1. Pilih Ternak Sasaran *</label>
                                <select id="vm-domba" required class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-sm">
                                    ${dombaList.map(d => `<option value="${d.id}">${d.eartag} - ${d.nama} (${d.ras}, ${d.kandang} / ${d.sekat})</option>`).join('')}
                                </select>
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">2. Pilih Preset Vaksin / Obat Standar *</label>
                                <select id="vm-preset" onchange="PakanKesehatanModule.onSelectPreset(this.value)" class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                                    ${presets.map(p => `<option value="${p.nama}|${p.dosis}|${p.rute}|${p.target}">${p.nama} (${p.tipe}) - ${p.dosis}</option>`).join('')}
                                </select>
                            </div>

                            <!-- Info Box Preset -->
                            <div id="vm-preset-info" class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 text-xs space-y-1">
                                <div class="font-bold flex items-center gap-1.5"><i data-lucide="info" class="w-4 h-4"></i> Rute & Dosis Standar:</div>
                                <div id="vm-preset-dosis" class="font-medium">2 ml / ekor (Subkutan - Bawah Kulit)</div>
                                <p id="vm-preset-target" class="text-[11px] text-rose-700/90 dark:text-rose-300">Pencegahan Penyakit Mulut & Kuku.</p>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Injeksi</label>
                                    <input type="date" id="vm-tgl" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                </div>
                                <div>
                                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Petugas / Paramedik</label>
                                    <input type="text" id="vm-petugas" value="drh. Wahid" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                </div>
                            </div>

                            <button type="submit" class="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2">
                                <i data-lucide="syringe" class="w-4 h-4"></i> Simpan Catatan Vaksinasi ke Rekam Medis
                            </button>
                        </form>
                    </div>

                    <!-- Preset Reference List -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-3">
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="shield-check" class="w-4 h-4 text-rose-600"></i> Standar Vaksin Kalurahan
                        </h3>
                        <div class="space-y-2 text-xs">
                            ${presets.map(p => `
                                <div class="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                                    <div class="font-bold text-slate-800 dark:text-slate-200">${p.nama}</div>
                                    <div class="text-[11px] text-slate-500">${p.rute} • ${p.dosis}</div>
                                    <div class="text-[10px] text-slate-400 mt-0.5">${p.target}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 3. STOK PAKAN & HPP
    renderStokPakanHPP() {
        let stokPakan = Store.getStokPakan();
        const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");

        // Search & Filter
        if (this.stokSearchQuery) {
            const q = this.stokSearchQuery.toLowerCase();
            stokPakan = stokPakan.filter(s => s.nama.toLowerCase().includes(q) || s.kategori.toLowerCase().includes(q));
        }
        if (this.stokFilterKategori !== "all") {
            stokPakan = stokPakan.filter(s => s.kategori.toLowerCase() === this.stokFilterKategori.toLowerCase());
        }

        // Hitung HPP Ransum & FCR Terintegrasi Realtime
        const hppData = Store.calculateRealtimeHPP 
            ? Store.calculateRealtimeHPP() 
            : { hppPerEkorHari: 4900, totalHppHarianKandang: 4900 * dombaList.length, biayaKons: 4200, biayaSil: 1200, biayaHij: 400 };
        const fcrData = Store.calculateFCR 
            ? Store.calculateFCR("all") 
            : { fcr: 5.5, status: "Sangat Efisien", efisiensiPersen: 95 };

        const biayaKons = hppData.biayaKons ?? hppData.biayaKonsentrat ?? 4200;
        const biayaSil = hppData.biayaSil ?? hppData.biayaSilase ?? 1200;
        const biayaHij = hppData.biayaHij ?? hppData.biayaHijauan ?? 400;
        const fcrStatus = fcrData.status || fcrData.statusFcr || (fcrData.fcr <= 6.5 ? "Sangat Efisien" : "Standar Normal");
        const fcrDesc = fcrData.fcrDesc || (fcrData.fcr <= 6.5 ? "Pertumbuhan bobot optimal" : "Perlu evaluasi nutrisi ransum");

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1">
                            <i data-lucide="archive" class="w-3.5 h-3.5"></i> Manajemen Biaya Pakan & FCR
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Stok Pakan, Realtime HPP & FCR</h2>
                        <p class="text-xs text-slate-500">Sinkronisasi langsung antara konsumsi ransum harian, sisa stok gudang, konversi pakan (FCR), dan beban HPP.</p>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <button onclick="PakanKesehatanModule.openModalKomoditasBaru()" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition active:scale-95">
                            <i data-lucide="plus" class="w-4 h-4"></i> + Komoditas Baru
                        </button>
                        <button onclick="PakanKesehatanModule.openModalTambahPakan()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="package-plus" class="w-4 h-4"></i> Restok Pakan Masuk
                        </button>
                    </div>
                </div>

                <!-- REALTIME HPP & FCR METRIC CARDS -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Card 1: HPP Per Ekor -->
                    <div class="bg-gradient-to-br from-teal-700 to-emerald-800 text-white p-5 rounded-2xl shadow-md space-y-1">
                        <span class="text-xs text-teal-200 font-medium">HPP Pakan Per Ekor / Hari</span>
                        <div class="text-2xl font-black">Rp ${(hppData.hppPerEkorHari || 0).toLocaleString('id-ID')}</div>
                        <p class="text-[11px] text-teal-100/80 truncate">
                            Kons: Rp ${Number(biayaKons).toLocaleString('id-ID')} • Sil: Rp ${Number(biayaSil).toLocaleString('id-ID')} • Hij: Rp ${Number(biayaHij).toLocaleString('id-ID')}
                        </p>
                    </div>

                    <!-- Card 2: Beban Kandang Hari Ini -->
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                        <span class="text-xs text-slate-500 font-medium">Total Beban Pakan / Hari</span>
                        <div class="text-2xl font-black text-slate-900 dark:text-white">Rp ${(hppData.totalHppHarianKandang || 0).toLocaleString('id-ID')}</div>
                        <p class="text-[11px] text-slate-400">Untuk ${dombaList.length} ekor domba aktif</p>
                    </div>

                    <!-- Card 3: FCR (Feed Conversion Ratio) -->
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-slate-500 font-medium">FCR (Feed Conversion Ratio)</span>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${fcrData.fcr <= 6.0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
                                ${fcrStatus}
                            </span>
                        </div>
                        <div class="text-2xl font-black text-teal-700 dark:text-teal-400">${fcrData.fcr || 5.5}</div>
                        <p class="text-[11px] text-slate-500 truncate" title="${fcrDesc}">${fcrDesc}</p>
                    </div>

                    <!-- Card 4: Estimasi Bulanan -->
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                        <span class="text-xs text-slate-500 font-medium">Estimasi Biaya Pakan (1 Bln)</span>
                        <div class="text-2xl font-black text-blue-700 dark:text-blue-400">Rp ${(hppData.estimasiBulanan || ((hppData.totalHppHarianKandang || 0) * 30)).toLocaleString('id-ID')}</div>
                        <p class="text-[11px] text-emerald-600 font-medium">Otomatis sinkron stok & transaksi</p>
                    </div>
                </div>

                <!-- STOK PAKAN TABLE WITH FILTER -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden space-y-4">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div>
                            <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Gudang Bahan Pakan & Silase</h3>
                            <p class="text-[11px] text-slate-500">${stokPakan.length} Komoditas Terdaftar</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <input 
                                type="text" 
                                placeholder="Cari bahan pakan..." 
                                value="${this.stokSearchQuery}"
                                oninput="PakanKesehatanModule.searchStok(this.value)"
                                class="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                            >
                            <select 
                                onchange="PakanKesehatanModule.filterStokKategori(this.value)"
                                class="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                            >
                                <option value="all" ${this.stokFilterKategori === 'all' ? 'selected' : ''}>Semua Kategori</option>
                                <option value="Konsentrat" ${this.stokFilterKategori === 'Konsentrat' ? 'selected' : ''}>Konsentrat</option>
                                <option value="Silase" ${this.stokFilterKategori === 'Silase' ? 'selected' : ''}>Silase</option>
                                <option value="Hijauan" ${this.stokFilterKategori === 'Hijauan' ? 'selected' : ''}>Hijauan</option>
                                <option value="Suplemen" ${this.stokFilterKategori === 'Suplemen' ? 'selected' : ''}>Suplemen</option>
                            </select>
                            ${(this.stokSearchQuery || this.stokFilterKategori !== 'all') ? `
                                <button onclick="PakanKesehatanModule.resetFilterStok()" class="text-xs text-rose-600 hover:underline whitespace-nowrap">
                                    Reset
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Nama Bahan Pakan</th>
                                    <th class="py-3 px-4">Kategori</th>
                                    <th class="py-3 px-4 text-right">Stok Tersedia</th>
                                    <th class="py-3 px-4 text-right">Batas Minimum</th>
                                    <th class="py-3 px-4 text-right">Biaya Satuan</th>
                                    <th class="py-3 px-4 text-center">Status</th>
                                    <th class="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${stokPakan.length === 0 ? `
                                    <tr>
                                        <td colspan="7" class="text-center py-10 text-slate-400 space-y-3">
                                            <i data-lucide="package-open" class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600"></i>
                                            <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Belum ada komoditas bahan pakan yang terdaftar di gudang.</p>
                                            <div class="flex items-center justify-center gap-2 pt-2">
                                                <button onclick="PakanKesehatanModule.openModalKomoditasBaru()" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow transition">
                                                    + Tambah Komoditas Pakan
                                                </button>
                                                <button onclick="PakanKesehatanModule.muatPakanStandar()" class="px-4 py-2 rounded-xl border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-bold text-xs transition">
                                                    ⚡ Muat 5 Komoditas Pakan Standar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ` : stokPakan.map(s => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                                            ${s.nama}
                                            <div class="text-[10px] text-slate-400 font-normal">
                                                📅 Update: <span class="font-semibold text-slate-600 dark:text-slate-300">${s.tglUpdate || s.tglMasuk || 'Terdaftar'}</span> • ID: ${s.id}
                                            </div>
                                        </td>
                                        <td class="py-3 px-4">${s.kategori}</td>
                                        <td class="py-3 px-4 text-right font-black text-emerald-600 text-sm">${(s.stokKg || 0).toLocaleString('id-ID')} ${s.satuan || 'kg'}</td>
                                        <td class="py-3 px-4 text-right text-slate-400">${s.batasMinimum || 200} ${s.satuan || 'kg'}</td>
                                        <td class="py-3 px-4 text-right font-semibold">Rp ${(s.biayaPerKg || 0).toLocaleString('id-ID')} / ${s.satuan || 'kg'}</td>
                                        <td class="py-3 px-4 text-center">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${(s.stokKg || 0) > (s.batasMinimum || 200) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
                                                ${(s.stokKg || 0) > (s.batasMinimum || 200) ? 'Aman' : 'Perlu Re-Stok'}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-center">
                                            <div class="flex items-center justify-center gap-1">
                                                <button onclick="PakanKesehatanModule.openModalKurangStok('${s.id}')" title="Kurang / Pakai Stok" class="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300 font-semibold text-[11px] flex items-center gap-1">
                                                    <i data-lucide="minus-circle" class="w-3.5 h-3.5"></i> Pakai
                                                </button>
                                                <button onclick="PakanKesehatanModule.openModalEditStokPakan('${s.id}')" title="Ubah Nama/Biaya/Stok" class="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg text-blue-600">
                                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                                </button>
                                                <button onclick="PakanKesehatanModule.deleteStokPakan('${s.id}')" title="Hapus Komoditas Bahan Pakan" class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-rose-600">
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
            </div>
        `;
    },

    // 4. BUKU REKAM MEDIS
    renderBukuRekamMedis() {
        const dombaList = Store.getDomba();
        let allMedis = [];
        dombaList.forEach(d => {
            (d.rekamMedis || []).forEach((m, idx) => {
                const id = m.id || ('med-' + idx);
                allMedis.push({
                    dombaId: d.id,
                    id,
                    eartag: d.eartag,
                    nama: d.nama,
                    ras: d.ras,
                    kandang: d.kandang,
                    sekat: d.sekat,
                    ...m
                });
            });
        });

        if (this.medisSearchQuery) {
            const q = this.medisSearchQuery.toLowerCase();
            allMedis = allMedis.filter(m => 
                m.eartag.toLowerCase().includes(q) ||
                m.nama.toLowerCase().includes(q) ||
                m.diagnosa.toLowerCase().includes(q) ||
                m.tindakan.toLowerCase().includes(q) ||
                (m.obat && m.obat.toLowerCase().includes(q)) ||
                m.petugas.toLowerCase().includes(q)
            );
        }
        allMedis.sort((a, b) => new Date(b.tgl) - new Date(a.tgl));

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-1">
                            <i data-lucide="heart" class="w-3.5 h-3.5 text-rose-500"></i> Kesehatan Hewan
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Buku Register Rekam Medis</h2>
                        <p class="text-xs text-slate-500">Dokumentasi riwayat penyakit, pengobatan, vaksinasi, dan hasil observasi dokter hewan.</p>
                    </div>
                    <div>
                        <button onclick="PakanKesehatanModule.openModalTambahRekamMedis()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Catat Rekam Medis Baru
                        </button>
                    </div>
                </div>

                <!-- FILTER BAR -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-3">
                    <div class="relative flex-1">
                        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                        <input 
                            type="text" 
                            placeholder="Cari eartag, ternak, diagnosa keluhan, tindakan, obat, dokter hewan..." 
                            value="${this.medisSearchQuery}"
                            oninput="PakanKesehatanModule.searchMedis(this.value)"
                            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
                        >
                    </div>
                    ${this.medisSearchQuery ? `
                        <button onclick="PakanKesehatanModule.resetFilterMedis()" class="text-xs text-rose-600 hover:underline whitespace-nowrap">
                            Reset
                        </button>
                    ` : ''}
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Tanggal</th>
                                    <th class="py-3 px-4">Eartag & Ternak</th>
                                    <th class="py-3 px-4">Diagnosa / Kasus</th>
                                    <th class="py-3 px-4">Tindakan Medis</th>
                                    <th class="py-3 px-4">Obat Diberikan</th>
                                    <th class="py-3 px-4">Dokter / Paramedik</th>
                                    <th class="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${allMedis.length === 0 ? `
                                    <tr>
                                        <td colspan="7" class="text-center py-6 text-slate-400">Tidak ada rekam medis yang cocok.</td>
                                    </tr>
                                ` : allMedis.map(m => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">${m.tgl}</td>
                                        <td class="py-3 px-4">
                                            <span class="font-bold text-slate-900 dark:text-white">${m.eartag}</span>
                                            <div class="text-[11px] text-slate-500">${m.nama}</div>
                                        </td>
                                        <td class="py-3 px-4 font-bold text-rose-700 dark:text-rose-400">${m.diagnosa}</td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-300">${m.tindakan}</td>
                                        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">${m.obat || '-'}</span></td>
                                        <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">${m.petugas}</td>
                                        <td class="py-3 px-4 text-center">
                                            <div class="flex items-center justify-center gap-1">
                                                <button onclick="PakanKesehatanModule.openModalEditRekamMedis('${m.dombaId}', '${m.id}')" title="Ubah Rekam Medis" class="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg text-amber-600">
                                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                                </button>
                                                <button onclick="PakanKesehatanModule.deleteRekamMedisRow('${m.dombaId}', '${m.id}')" title="Hapus Rekam Medis" class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-rose-600">
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
            </div>
        `;
    },

    openModalCatatPakan() {
        const stokList = Store.getStokPakan();
        const stokK = stokList.find(s => (s.kategori && s.kategori.toLowerCase() === 'konsentrat') || (s.nama && s.nama.toLowerCase().includes('konsentrat'))) || { nama: 'Konsentrat', stokKg: 0, satuan: 'kg' };
        const stokS = stokList.find(s => (s.kategori && s.kategori.toLowerCase() === 'silase') || (s.nama && s.nama.toLowerCase().includes('silase'))) || { nama: 'Silase Tebon Jagung', stokKg: 0, satuan: 'kg' };
        const stokH = stokList.find(s => (s.kategori && s.kategori.toLowerCase() === 'hijauan') || (s.nama && (s.nama.toLowerCase().includes('odot') || s.nama.toLowerCase().includes('hijauan')))) || { nama: 'Hijauan Odot', stokKg: 0, satuan: 'kg' };
        const masterKandang = Store.getMasterKandang ? Store.getMasterKandang() : [];
        const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : { nama: "Petugas" };

        App.setModalContent(`
            <div class="p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                            <i data-lucide="utensils" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">Catat Pemberian Pakan Harian</h3>
                            <p class="text-xs text-slate-500">Stok gudang otomatis terpotong & riwayat nutrisi tercatat</p>
                        </div>
                    </div>
                    <button type="button" onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PakanKesehatanModule.submitPakan(event)" class="space-y-4 text-xs">
                    <!-- Tanggal, Waktu Preset & Kandang -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">📅 Tanggal Pemberian *</label>
                            <input type="date" id="pk-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-teal-500 outline-none">
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">🏠 Kandang Alokasi *</label>
                            <select id="pk-kandang" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:ring-2 focus:ring-teal-500 outline-none">
                                ${masterKandang.length > 0 ? masterKandang.map(k => `
                                    <option value="${k.nama}">${k.nama} (${k.tipe || k.kategori || 'Kandang'}) • Terisi: ${k.terisi || 0} ekor</option>
                                `).join('') : `
                                    <option value="Kandang A">Kandang A (Pejantan & Fattening)</option>
                                    <option value="Kandang B">Kandang B (Indukan & Breeding)</option>
                                    <option value="Kandang C">Kandang C (Karantina / Pemulihan)</option>
                                `}
                            </select>
                        </div>

                        <div class="sm:col-span-2">
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">⏰ Waktu Pemberian *</label>
                            <div class="flex flex-wrap items-center gap-1.5 mb-2">
                                <button type="button" onclick="PakanKesehatanModule.setWaktuPreset('Pagi (07:30)', 'pk-waktu', this)" class="waktu-preset-btn px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer bg-teal-600 text-white border-teal-600">
                                    ☀️ Pagi (07:30)
                                </button>
                                <button type="button" onclick="PakanKesehatanModule.setWaktuPreset('Siang (12:00)', 'pk-waktu', this)" class="waktu-preset-btn px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200">
                                    🌤️ Siang (12:00)
                                </button>
                                <button type="button" onclick="PakanKesehatanModule.setWaktuPreset('Sore (15:30)', 'pk-waktu', this)" class="waktu-preset-btn px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200">
                                    ⛅ Sore (15:30)
                                </button>
                                <button type="button" onclick="PakanKesehatanModule.setWaktuPreset('Malam (20:00)', 'pk-waktu', this)" class="waktu-preset-btn px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200">
                                    🌙 Malam (20:00)
                                </button>
                            </div>
                            <input type="text" id="pk-waktu" value="Pagi (07:30)" placeholder="Atau ketik jam kustom..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-teal-500 outline-none">
                        </div>
                    </div>

                    <!-- 3 KARTU VISUAL PAKAN -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Takaran Pakan (kg) & Cek Sisa Stok</label>
                            <span class="text-[11px] text-teal-600 dark:text-teal-400 font-medium">💡 Gunakan tombol - / + untuk atur cepat</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <!-- KARTU 1: KONSENTRAT -->
                            <div class="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2.5">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-800 dark:text-amber-300 flex items-center gap-1.5 truncate" title="${stokK.nama}">
                                        🌾 ${stokK.nama || 'Konsentrat'}
                                    </span>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${stokK.stokKg < 50 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'} whitespace-nowrap">
                                        Stok: ${Number(stokK.stokKg || 0).toLocaleString('id-ID')} kg
                                    </span>
                                </div>
                                <div class="relative">
                                    <input type="number" step="0.5" id="pk-konsentrat" value="8.0" required oninput="PakanKesehatanModule.recalcLiveTotalPakan('pk-')" class="w-full p-2.5 pr-8 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-base focus:ring-2 focus:ring-amber-500 outline-none text-center">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">kg</span>
                                </div>
                                <div class="flex items-center justify-center gap-1.5">
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('pk-konsentrat', -1, 'pk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">-1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('pk-konsentrat', 1, 'pk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">+1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('pk-konsentrat', 5, 'pk-')" class="flex-1 py-1 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 text-xs shadow-sm cursor-pointer">+5</button>
                                </div>
                            </div>

                            <!-- KARTU 2: SILASE -->
                            <div class="p-3.5 rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/40 dark:bg-sky-950/20 space-y-2.5">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-800 dark:text-sky-300 flex items-center gap-1.5 truncate" title="${stokS.nama}">
                                        🌽 ${stokS.nama || 'Silase Jagung'}
                                    </span>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${stokS.stokKg < 100 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200'} whitespace-nowrap">
                                        Stok: ${Number(stokS.stokKg || 0).toLocaleString('id-ID')} kg
                                    </span>
                                </div>
                                <div class="relative">
                                    <input type="number" step="0.5" id="pk-silase" value="14.0" required oninput="PakanKesehatanModule.recalcLiveTotalPakan('pk-')" class="w-full p-2.5 pr-8 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-base focus:ring-2 focus:ring-sky-500 outline-none text-center">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">kg</span>
                                </div>
                                <div class="flex items-center justify-center gap-1.5">
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('pk-silase', -1, 'pk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">-1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('pk-silase', 1, 'pk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">+1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('pk-silase', 5, 'pk-')" class="flex-1 py-1 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 text-xs shadow-sm cursor-pointer">+5</button>
                                </div>
                            </div>

                            <!-- KARTU 3: HIJAUAN ODOT -->
                            <div class="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2.5">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-800 dark:text-emerald-300 flex items-center gap-1.5 truncate" title="${stokH.nama}">
                                        🌿 ${stokH.nama || 'Hijauan Odot'}
                                    </span>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${stokH.stokKg < 100 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'} whitespace-nowrap">
                                        Stok: ${Number(stokH.stokKg || 0).toLocaleString('id-ID')} kg
                                    </span>
                                </div>
                                <div class="relative">
                                    <input type="number" step="0.5" id="pk-odot" value="20.0" required oninput="PakanKesehatanModule.recalcLiveTotalPakan('pk-')" class="w-full p-2.5 pr-8 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-base focus:ring-2 focus:ring-emerald-500 outline-none text-center">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">kg</span>
                                </div>
                                <div class="flex items-center justify-center gap-1.5">
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('pk-odot', -1, 'pk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">-1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('pk-odot', 1, 'pk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">+1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('pk-odot', 5, 'pk-')" class="flex-1 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs shadow-sm cursor-pointer">+5</button>
                                </div>
                            </div>
                        </div>

                        <!-- BANNER CEK SISA STOK GUDANG TERKINI -->
                        <div class="mt-2.5 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div class="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                                <i data-lucide="package-check" class="w-3.5 h-3.5 text-teal-600"></i>
                                <span>Status Sisa Stok Gudang Realtime:</span>
                            </div>
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">Konsentrat: ${(stokK.stokKg || 0).toLocaleString('id-ID')} kg</span>
                                <span class="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold">Silase: ${(stokS.stokKg || 0).toLocaleString('id-ID')} kg</span>
                                <span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">Hijauan: ${(stokH.stokKg || 0).toLocaleString('id-ID')} kg</span>
                            </div>
                        </div>
                    </div>

                    <!-- RINGKASAN TOTAL PAKAN LIVE -->
                    <div class="p-3.5 bg-teal-500/10 dark:bg-teal-900/30 rounded-2xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <span class="p-2 rounded-xl bg-teal-600 text-white font-bold"><i data-lucide="scale" class="w-4 h-4"></i></span>
                            <div>
                                <span class="font-bold text-slate-800 dark:text-white block text-xs">Total Pakan Diberikan:</span>
                                <span id="pk-live-breakdown" class="text-[11px] text-slate-500 dark:text-slate-400">Konsentrat: 8 kg • Silase: 14 kg • Hijauan: 20 kg</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span id="pk-live-total" class="font-black text-lg text-teal-700 dark:text-teal-300">42.0 kg</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">👤 Petugas Pakan (Otomatis User Login) *</label>
                            <div class="relative">
                                <input type="text" id="pk-petugas" value="${currentUser.nama || ''}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold focus:ring-2 focus:ring-teal-500 outline-none">
                                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                                    Akun Aktif
                                </span>
                            </div>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">📝 Catatan Respon Pakan</label>
                            <input type="text" id="pk-catatan" value="Nafsu makan baik, air minum ad-libitum bersih" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none">
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2.5 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer">Batal</button>
                        <button type="submit" class="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition active:scale-95 cursor-pointer">
                            Simpan & Kurangi Stok Gudang
                        </button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
        if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    },

    submitPakan(e) {
        e.preventDefault();
        const user = Store.getCurrentUser ? Store.getCurrentUser() : null;
        const userNama = (user && user.nama) ? user.nama : "Petugas";
        const inputPetugas = document.getElementById("pk-petugas") ? document.getElementById("pk-petugas").value.trim() : "";
        const petugasFinal = inputPetugas || userNama;

        const newLog = {
            id: "fp-" + Date.now(),
            tgl: document.getElementById("pk-tgl").value,
            waktu: document.getElementById("pk-waktu").value,
            kandang: document.getElementById("pk-kandang").value,
            konsentratKg: parseFloat(document.getElementById("pk-konsentrat").value) || 0,
            silaseKg: parseFloat(document.getElementById("pk-silase").value) || 0,
            hijauanOdotKg: parseFloat(document.getElementById("pk-odot").value) || 0,
            petugas: petugasFinal,
            catatan: document.getElementById("pk-catatan").value.trim() || "-"
        };

        Store.addLogPakanHarian(newLog);
        App.closeModal();
        App.showToast("Catatan pemberian pakan harian berhasil disimpan!", "success");
        App.renderContent();
    },

    onSelectPreset(val) {
        const parts = val.split("|");
        const dosisEl = document.getElementById("vm-preset-dosis");
        const targetEl = document.getElementById("vm-preset-target");
        if (dosisEl) dosisEl.innerText = `${parts[1]} (${parts[2]})`;
        if (targetEl) targetEl.innerText = parts[3];
    },

    submitQuickVaksin(e) {
        e.preventDefault();
        const dombaId = document.getElementById("vm-domba").value;
        const presetVal = document.getElementById("vm-preset").value.split("|");
        const tgl = document.getElementById("vm-tgl").value;
        const petugas = document.getElementById("vm-petugas").value;

        const record = {
            tgl,
            diagnosa: `Vaksinasi / Profilaksis: ${presetVal[0]}`,
            tindakan: `Injeksi ${presetVal[2]} dosis ${presetVal[1]}`,
            obat: presetVal[0],
            statusHewan: "Sehat",
            petugas
        };

        Store.addRekamMedis(dombaId, record);
        App.showToast(`Vaksinasi ${presetVal[0]} berhasil dicatat pada domba!`, "success");
        App.navigate("rekam_medis");
    },

    onWaktuPresetChange(val, targetInputId) {
        const input = document.getElementById(targetInputId);
        if (input) {
            if (val) {
                input.value = val;
            } else {
                input.value = '';
                input.focus();
            }
        }
    },

    openModalTambahPakan() {
        const stokPakan = Store.getStokPakan();
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="package-plus" class="w-5 h-5 text-teal-600"></i> Tambah Komoditas Pakan & Restok
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PakanKesehatanModule.submitTambahPakan(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pasokan / Masuk *</label>
                        <input type="date" id="npk-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Tindakan *</label>
                        <select id="npk-mode" onchange="PakanKesehatanModule.onPakanModeChange(this.value)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            <option value="restok">Restok Komoditas Yang Sudah Ada</option>
                            <option value="baru">+ Buat Bahan Pakan Baru</option>
                        </select>
                    </div>

                    <div id="npk-field-existing">
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Bahan Pakan Yang Tersedia *</label>
                        <select id="npk-existing-id" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            ${stokPakan.map(s => `<option value="${s.id}">${s.nama} (Stok Saat Ini: ${s.stokKg} ${s.satuan})</option>`).join('')}
                        </select>
                    </div>

                    <div id="npk-field-new" class="space-y-3 hidden">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Bahan Pakan Baru *</label>
                            <input type="text" id="npk-nama" placeholder="Contoh: Ampas Tahu Kering Fermentasi" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori *</label>
                                <select id="npk-kategori" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                    <option value="Konsentrat">Konsentrat</option>
                                    <option value="Silase">Silase</option>
                                    <option value="Hijauan">Hijauan</option>
                                    <option value="Suplemen">Suplemen & Mineral</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Biaya / Harga per kg (Rp)</label>
                                <input type="number" id="npk-biaya" value="2500" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Pasokan Masuk (kg) *</label>
                        <input type="number" step="1" id="npk-jumlah" required value="250" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-lg text-teal-600">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md">Simpan Stok Pakan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    onPakanModeChange(mode) {
        const existField = document.getElementById("npk-field-existing");
        const newField = document.getElementById("npk-field-new");
        if (mode === "baru") {
            if (existField) existField.classList.add("hidden");
            if (newField) newField.classList.remove("hidden");
        } else {
            if (existField) existField.classList.remove("hidden");
            if (newField) newField.classList.add("hidden");
        }
    },

    submitTambahPakan(e) {
        e.preventDefault();
        const tgl = document.getElementById("npk-tgl").value || new Date().toISOString().split('T')[0];
        const mode = document.getElementById("npk-mode").value;
        const jumlah = parseFloat(document.getElementById("npk-jumlah").value) || 0;
        const stokList = Store.getStokPakan();

        if (mode === "restok") {
            const id = document.getElementById("npk-existing-id").value;
            const item = stokList.find(s => s.id === id);
            if (item) {
                item.stokKg += jumlah;
                item.tglUpdate = tgl;
                Store.saveStokPakan(stokList);
                Store.addLog(`Restok pakan (${tgl}): +${jumlah} kg ${item.nama}`);
                App.showToast(`Restok ${item.nama} (+${jumlah} kg) pada ${tgl} berhasil!`, "success");
            }
        } else {
            const nama = document.getElementById("npk-nama").value.trim() || "Bahan Pakan Tambahan";
            const kategori = document.getElementById("npk-kategori").value;
            const biaya = parseFloat(document.getElementById("npk-biaya").value) || 2000;
            stokList.push({
                id: "stk-" + Date.now(),
                nama,
                kategori,
                stokKg: jumlah,
                satuan: "kg",
                batasMinimum: 200,
                biayaPerKg: biaya,
                tglMasuk: tgl,
                tglUpdate: tgl
            });
            Store.saveStokPakan(stokList);
            Store.addLog(`Tambah bahan pakan baru (${tgl}): ${nama} (${jumlah} kg)`);
            App.showToast(`Bahan pakan baru "${nama}" pada ${tgl} berhasil ditambahkan!`, "success");
        }

        App.closeModal();
        App.renderContent();
    },

    openModalTambahRekamMedis() {
        const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="file-heart" class="w-5 h-5 text-rose-600"></i> Catat Rekam Medis / Diagnosa Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PakanKesehatanModule.submitTambahRekamMedis(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Domba Pasien *</label>
                        <select id="nrm-domba" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            ${dombaList.map(d => `<option value="${d.id}">${d.eartag} - ${d.nama} (${d.ras} - ${d.kandang})</option>`).join('')}
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pemeriksaan *</label>
                            <input type="date" id="nrm-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dokter / Paramedik *</label>
                            <input type="text" id="nrm-petugas" required value="drh. Wahid" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Diagnosa / Kasus Penyakit *</label>
                        <input type="text" id="nrm-diagnosa" required placeholder="Contoh: Kembung (Bloat) Akut / Scabies / Batuk" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-rose-700">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tindakan Medis Dilakukan *</label>
                        <input type="text" id="nrm-tindakan" required placeholder="Contoh: Trocar gas rumen & cekok minyak nabati / injeksi antibiotik" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Obat / Dosis Yang Diberikan</label>
                        <input type="text" id="nrm-obat" placeholder="Contoh: Tympanol 50ml + B-Complex 3ml" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md">Simpan Rekam Medis</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTambahRekamMedis(e) {
        e.preventDefault();
        const dombaId = document.getElementById("nrm-domba").value;
        const tgl = document.getElementById("nrm-tgl").value;
        const petugas = document.getElementById("nrm-petugas").value.trim();
        const diagnosa = document.getElementById("nrm-diagnosa").value.trim();
        const tindakan = document.getElementById("nrm-tindakan").value.trim();
        const obat = document.getElementById("nrm-obat").value.trim();

        const record = {
            tgl,
            diagnosa,
            tindakan,
            obat,
            petugas,
            statusHewan: "Dalam Observasi"
        };

        Store.addRekamMedis(dombaId, record);
        App.closeModal();
        App.showToast("Rekam medis baru berhasil dicatat!", "success");
        App.renderContent();
    },

    // Handlers for Log Pakan Harian
    searchPakan(val) {
        this.pakanSearchQuery = val;
        App.renderContent();
    },

    filterKandang(val) {
        this.pakanFilterKandang = val;
        App.renderContent();
    },

    resetFilterPakan() {
        this.pakanSearchQuery = "";
        this.pakanFilterKandang = "all";
        App.renderContent();
    },

    openModalEditLogPakan(id) {
        const log = Store.getLogPakanHarian().find(p => p.id === id);
        if (!log) return;

        const stokList = Store.getStokPakan();
        const stokK = stokList.find(s => (s.kategori && s.kategori.toLowerCase() === 'konsentrat') || (s.nama && s.nama.toLowerCase().includes('konsentrat'))) || { nama: 'Konsentrat', stokKg: 0, satuan: 'kg' };
        const stokS = stokList.find(s => (s.kategori && s.kategori.toLowerCase() === 'silase') || (s.nama && s.nama.toLowerCase().includes('silase'))) || { nama: 'Silase Tebon Jagung', stokKg: 0, satuan: 'kg' };
        const stokH = stokList.find(s => (s.kategori && s.kategori.toLowerCase() === 'hijauan') || (s.nama && (s.nama.toLowerCase().includes('odot') || s.nama.toLowerCase().includes('hijauan')))) || { nama: 'Hijauan Odot', stokKg: 0, satuan: 'kg' };
        const masterKandang = Store.getMasterKandang ? Store.getMasterKandang() : [];

        const totalPakan = ((log.konsentratKg || 0) + (log.silaseKg || 0) + (log.hijauanOdotKg || 0)).toFixed(1);

        App.setModalContent(`
            <div class="p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <i data-lucide="edit-3" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">Ubah Catatan Pakan Harian</h3>
                            <p class="text-xs text-slate-500">Koreksi takaran pakan, jadwal pemberian, atau kandang</p>
                        </div>
                    </div>
                    <button type="button" onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PakanKesehatanModule.submitEditLogPakan(event, '${log.id}')" class="space-y-4 text-xs">
                    <!-- Tanggal, Waktu Preset & Kandang -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">📅 Tanggal Pemberian *</label>
                            <input type="date" id="epk-tgl" required value="${log.tgl}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-amber-500 outline-none">
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">🏠 Kandang Alokasi *</label>
                            <select id="epk-kandang" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:ring-2 focus:ring-amber-500 outline-none">
                                ${masterKandang.length > 0 ? masterKandang.map(k => `
                                    <option value="${k.nama}" ${log.kandang === k.nama || (log.kandang && log.kandang.includes(k.nama)) ? 'selected' : ''}>${k.nama} (${k.tipe || k.kategori || 'Kandang'}) • Terisi: ${k.terisi || 0} ekor</option>
                                `).join('') : `
                                    <option value="Kandang A" ${log.kandang === 'Kandang A' ? 'selected' : ''}>Kandang A (Pejantan & Fattening)</option>
                                    <option value="Kandang B" ${log.kandang === 'Kandang B' ? 'selected' : ''}>Kandang B (Indukan & Breeding)</option>
                                    <option value="Kandang C" ${log.kandang === 'Kandang C' ? 'selected' : ''}>Kandang C (Karantina / Pemulihan)</option>
                                `}
                            </select>
                        </div>

                        <div class="sm:col-span-2">
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">⏰ Waktu Pemberian *</label>
                            <div class="flex flex-wrap items-center gap-1.5 mb-2">
                                <button type="button" onclick="PakanKesehatanModule.setWaktuPreset('Pagi (07:30)', 'epk-waktu', this)" class="waktu-preset-btn px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${log.waktu && log.waktu.includes('Pagi') ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}">
                                    ☀️ Pagi (07:30)
                                </button>
                                <button type="button" onclick="PakanKesehatanModule.setWaktuPreset('Siang (12:00)', 'epk-waktu', this)" class="waktu-preset-btn px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${log.waktu && log.waktu.includes('Siang') ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}">
                                    🌤️ Siang (12:00)
                                </button>
                                <button type="button" onclick="PakanKesehatanModule.setWaktuPreset('Sore (15:30)', 'epk-waktu', this)" class="waktu-preset-btn px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${log.waktu && log.waktu.includes('Sore') ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}">
                                    ⛅ Sore (15:30)
                                </button>
                                <button type="button" onclick="PakanKesehatanModule.setWaktuPreset('Malam (20:00)', 'epk-waktu', this)" class="waktu-preset-btn px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${log.waktu && log.waktu.includes('Malam') ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}">
                                    🌙 Malam (20:00)
                                </button>
                            </div>
                            <input type="text" id="epk-waktu" value="${log.waktu || 'Pagi (07:30)'}" placeholder="Atau ketik jam kustom..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-amber-500 outline-none">
                        </div>
                    </div>

                    <!-- 3 KARTU VISUAL PAKAN -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Takaran Pakan (kg) & Cek Sisa Stok</label>
                            <span class="text-[11px] text-amber-600 dark:text-amber-400 font-medium">💡 Gunakan tombol - / + untuk atur cepat</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <!-- KARTU 1: KONSENTRAT -->
                            <div class="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2.5">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-800 dark:text-amber-300 flex items-center gap-1.5 truncate" title="${stokK.nama}">
                                        🌾 ${stokK.nama || 'Konsentrat'}
                                    </span>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 whitespace-nowrap">
                                        Stok: ${Number(stokK.stokKg || 0).toLocaleString('id-ID')} kg
                                    </span>
                                </div>
                                <div class="relative">
                                    <input type="number" step="0.5" id="epk-konsentrat" value="${log.konsentratKg}" required oninput="PakanKesehatanModule.recalcLiveTotalPakan('epk-')" class="w-full p-2.5 pr-8 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-base focus:ring-2 focus:ring-amber-500 outline-none text-center">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">kg</span>
                                </div>
                                <div class="flex items-center justify-center gap-1.5">
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('epk-konsentrat', -1, 'epk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">-1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('epk-konsentrat', 1, 'epk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">+1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('epk-konsentrat', 5, 'epk-')" class="flex-1 py-1 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 text-xs shadow-sm cursor-pointer">+5</button>
                                </div>
                            </div>

                            <!-- KARTU 2: SILASE -->
                            <div class="p-3.5 rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/40 dark:bg-sky-950/20 space-y-2.5">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-800 dark:text-sky-300 flex items-center gap-1.5 truncate" title="${stokS.nama}">
                                        🌽 ${stokS.nama || 'Silase Jagung'}
                                    </span>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200 whitespace-nowrap">
                                        Stok: ${Number(stokS.stokKg || 0).toLocaleString('id-ID')} kg
                                    </span>
                                </div>
                                <div class="relative">
                                    <input type="number" step="0.5" id="epk-silase" value="${log.silaseKg}" required oninput="PakanKesehatanModule.recalcLiveTotalPakan('epk-')" class="w-full p-2.5 pr-8 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-base focus:ring-2 focus:ring-sky-500 outline-none text-center">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">kg</span>
                                </div>
                                <div class="flex items-center justify-center gap-1.5">
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('epk-silase', -1, 'epk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">-1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('epk-silase', 1, 'epk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">+1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('epk-silase', 5, 'epk-')" class="flex-1 py-1 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 text-xs shadow-sm cursor-pointer">+5</button>
                                </div>
                            </div>

                            <!-- KARTU 3: HIJAUAN ODOT -->
                            <div class="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2.5">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-slate-800 dark:text-emerald-300 flex items-center gap-1.5 truncate" title="${stokH.nama}">
                                        🌿 ${stokH.nama || 'Hijauan Odot'}
                                    </span>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 whitespace-nowrap">
                                        Stok: ${Number(stokH.stokKg || 0).toLocaleString('id-ID')} kg
                                    </span>
                                </div>
                                <div class="relative">
                                    <input type="number" step="0.5" id="epk-odot" value="${log.hijauanOdotKg}" required oninput="PakanKesehatanModule.recalcLiveTotalPakan('epk-')" class="w-full p-2.5 pr-8 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-base focus:ring-2 focus:ring-emerald-500 outline-none text-center">
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">kg</span>
                                </div>
                                <div class="flex items-center justify-center gap-1.5">
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('epk-odot', -1, 'epk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">-1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('epk-odot', 1, 'epk-')" class="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 text-xs shadow-sm cursor-pointer">+1</button>
                                    <button type="button" onclick="PakanKesehatanModule.adjustPakanQty('epk-odot', 5, 'epk-')" class="flex-1 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs shadow-sm cursor-pointer">+5</button>
                                </div>
                            </div>
                        </div>

                        <!-- BANNER CEK SISA STOK GUDANG TERKINI -->
                        <div class="mt-2.5 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div class="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                                <i data-lucide="package-check" class="w-3.5 h-3.5 text-amber-500"></i>
                                <span>Status Sisa Stok Gudang Realtime:</span>
                            </div>
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">Konsentrat: ${(stokK.stokKg || 0).toLocaleString('id-ID')} kg</span>
                                <span class="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold">Silase: ${(stokS.stokKg || 0).toLocaleString('id-ID')} kg</span>
                                <span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">Hijauan: ${(stokH.stokKg || 0).toLocaleString('id-ID')} kg</span>
                            </div>
                        </div>
                    </div>

                    <!-- RINGKASAN TOTAL PAKAN LIVE -->
                    <div class="p-3.5 bg-amber-500/10 dark:bg-amber-900/30 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <span class="p-2 rounded-xl bg-amber-500 text-white font-bold"><i data-lucide="scale" class="w-4 h-4"></i></span>
                            <div>
                                <span class="font-bold text-slate-800 dark:text-white block text-xs">Total Pakan Diberikan:</span>
                                <span id="epk-live-breakdown" class="text-[11px] text-slate-500 dark:text-slate-400">Konsentrat: ${log.konsentratKg} kg • Silase: ${log.silaseKg} kg • Hijauan: ${log.hijauanOdotKg} kg</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span id="epk-live-total" class="font-black text-lg text-amber-700 dark:text-amber-300">${totalPakan} kg</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">👤 Petugas Pakan *</label>
                            <input type="text" id="epk-petugas" required value="${log.petugas || (Store.getCurrentUser ? Store.getCurrentUser().nama : '')}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">📝 Catatan Respon Ternak</label>
                            <input type="text" id="epk-catatan" value="${log.catatan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none">
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2.5 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer">Batal</button>
                        <button type="submit" class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md transition active:scale-95 cursor-pointer">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
        if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    },

    submitEditLogPakan(e, id) {
        e.preventDefault();
        const updated = {
            tgl: document.getElementById("epk-tgl").value,
            waktu: document.getElementById("epk-waktu").value,
            kandang: document.getElementById("epk-kandang").value,
            konsentratKg: parseFloat(document.getElementById("epk-konsentrat").value) || 0,
            silaseKg: parseFloat(document.getElementById("epk-silase").value) || 0,
            hijauanOdotKg: parseFloat(document.getElementById("epk-odot").value) || 0,
            petugas: document.getElementById("epk-petugas").value.trim(),
            catatan: document.getElementById("epk-catatan").value.trim() || "-"
        };

        Store.updateLogPakanHarian(id, updated);
        App.closeModal();
        App.showToast("Catatan pakan berhasil diperbarui!", "success");
        App.renderContent();
    },

    deleteLogPakan(id) {
        if (confirm("Apakah Anda yakin ingin menghapus catatan pakan ini?")) {
            Store.deleteLogPakanHarian(id);
            App.showToast("Catatan pakan telah dihapus.", "success");
            App.renderContent();
        }
    },

    setWaktuPreset(presetVal, targetInputId, activeBtn) {
        const input = document.getElementById(targetInputId);
        if (input) {
            input.value = presetVal;
        }
        if (activeBtn && activeBtn.parentElement) {
            const btns = activeBtn.parentElement.querySelectorAll('.waktu-preset-btn');
            btns.forEach(b => {
                b.classList.remove('bg-teal-600', 'bg-amber-600', 'text-white', 'border-teal-600', 'border-amber-600');
                b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'border-slate-200', 'dark:border-slate-700');
            });
            const activeColor = targetInputId.startsWith('e') ? 'bg-amber-600 border-amber-600' : 'bg-teal-600 border-teal-600';
            activeBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300', 'border-slate-200', 'dark:border-slate-700');
            activeBtn.className += ` text-white ${activeColor}`;
        }
    },

    adjustPakanQty(inputId, delta, prefix = 'pk-') {
        const el = document.getElementById(inputId);
        if (!el) return;
        let current = parseFloat(el.value) || 0;
        let nextVal = Math.max(0, parseFloat((current + delta).toFixed(1)));
        el.value = nextVal;
        this.recalcLiveTotalPakan(prefix);
    },

    recalcLiveTotalPakan(prefix = 'pk-') {
        const kEl = document.getElementById(prefix + 'konsentrat');
        const sEl = document.getElementById(prefix + 'silase');
        const oEl = document.getElementById(prefix + 'odot');
        const totalEl = document.getElementById(prefix + 'live-total');
        const breakdownEl = document.getElementById(prefix + 'live-breakdown');

        const k = parseFloat(kEl ? kEl.value : 0) || 0;
        const s = parseFloat(sEl ? sEl.value : 0) || 0;
        const o = parseFloat(oEl ? oEl.value : 0) || 0;
        const total = (k + s + o).toFixed(1);

        if (totalEl) totalEl.textContent = `${total} kg`;
        if (breakdownEl) breakdownEl.textContent = `Konsentrat: ${k} kg • Silase: ${s} kg • Hijauan: ${o} kg`;
    },

    onWaktuPresetChange(val, targetId) {
        if (val) {
            const el = document.getElementById(targetId);
            if (el) el.value = val;
        }
    },

    // Handlers for Stok Pakan
    searchStok(val) {
        this.stokSearchQuery = val;
        App.renderContent();
    },

    filterStokKategori(val) {
        this.stokFilterKategori = val;
        App.renderContent();
    },

    resetFilterStok() {
        this.stokSearchQuery = "";
        this.stokFilterKategori = "all";
        App.renderContent();
    },

    openModalEditStokPakan(id) {
        const item = Store.getStokPakan().find(s => s.id === id);
        if (!item) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i> Ubah Komoditas Pakan
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PakanKesehatanModule.submitEditStokPakan(event, '${item.id}')" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pembaruan Terakhir *</label>
                        <input type="date" id="estk-tgl" required value="${item.tglUpdate || item.tglMasuk || new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Bahan Pakan *</label>
                        <input type="text" id="estk-nama" required value="${item.nama}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori *</label>
                            <select id="estk-kategori" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Konsentrat" ${item.kategori === 'Konsentrat' ? 'selected' : ''}>Konsentrat</option>
                                <option value="Silase" ${item.kategori === 'Silase' ? 'selected' : ''}>Silase</option>
                                <option value="Hijauan" ${item.kategori === 'Hijauan' ? 'selected' : ''}>Hijauan</option>
                                <option value="Suplemen" ${item.kategori === 'Suplemen' ? 'selected' : ''}>Suplemen & Mineral</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
                            <input type="text" id="estk-satuan" value="${item.satuan || 'kg'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stok Tersedia *</label>
                            <input type="number" step="0.1" id="estk-stok" required value="${item.stokKg}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Batas Minimum</label>
                            <input type="number" step="1" id="estk-min" value="${item.batasMinimum || 200}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Biaya Satuan (Rp)</label>
                            <input type="number" id="estk-biaya" value="${item.biayaPerKg || 0}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditStokPakan(e, id) {
        e.preventDefault();
        const tgl = document.getElementById("estk-tgl").value || new Date().toISOString().split('T')[0];
        const updated = {
            nama: document.getElementById("estk-nama").value.trim(),
            kategori: document.getElementById("estk-kategori").value,
            satuan: document.getElementById("estk-satuan").value.trim() || "kg",
            stokKg: parseFloat(document.getElementById("estk-stok").value) || 0,
            batasMinimum: parseFloat(document.getElementById("estk-min").value) || 200,
            biayaPerKg: parseFloat(document.getElementById("estk-biaya").value) || 0,
            tglUpdate: tgl
        };

        Store.updateStokPakan(id, updated);
        App.closeModal();
        App.showToast(`Bahan pakan berhasil diperbarui (Tanggal: ${tgl})!`, "success");
        App.renderContent();
    },

    openModalKomoditasBaru() {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="plus-circle" class="w-5 h-5 text-teal-600"></i> Tambah Master Komoditas Pakan Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PakanKesehatanModule.submitKomoditasBaru(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Masuk / Pencatatan *</label>
                        <input type="date" id="nkb-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Komoditas Bahan Pakan *</label>
                        <input type="text" id="nkb-nama" required placeholder="Contoh: Konsentrat Penggemukan Booster / Silase Jagung" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Ransum *</label>
                            <select id="nkb-kategori" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                <option value="Konsentrat">Konsentrat</option>
                                <option value="Silase">Silase Fermentasi</option>
                                <option value="Hijauan">Hijauan Segar (Odot/Pakchong)</option>
                                <option value="Suplemen">Suplemen & Mineral Premix</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Satuan Ukuran *</label>
                            <input type="text" id="nkb-satuan" value="kg" required placeholder="kg, karung, liter" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stok Awal Tersedia *</label>
                            <input type="number" step="0.1" id="nkb-stok" required value="500" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-teal-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Batas Minimum (ROP) *</label>
                            <input type="number" step="1" id="nkb-min" required value="200" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga / Biaya Satuan (Rp) *</label>
                            <input type="number" id="nkb-biaya" required value="4000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>
                    <p class="text-[11px] text-slate-500 italic">Data komoditas ini akan langsung digunakan pada kalkulator realtime HPP dan FCR kandang.</p>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition active:scale-95">
                            Simpan Komoditas Pakan
                        </button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitKomoditasBaru(e) {
        e.preventDefault();
        const tgl = document.getElementById("nkb-tgl").value || new Date().toISOString().split('T')[0];
        const nama = document.getElementById("nkb-nama").value.trim();
        const kategori = document.getElementById("nkb-kategori").value;
        const satuan = document.getElementById("nkb-satuan").value.trim() || "kg";
        const stokKg = parseFloat(document.getElementById("nkb-stok").value) || 0;
        const batasMinimum = parseFloat(document.getElementById("nkb-min").value) || 200;
        const biayaPerKg = parseFloat(document.getElementById("nkb-biaya").value) || 0;

        const newItem = {
            id: "stk-" + Date.now(),
            nama,
            kategori,
            stokKg,
            satuan,
            batasMinimum,
            biayaPerKg,
            tglMasuk: tgl,
            tglUpdate: tgl
        };

        const stokList = Store.getStokPakan();
        stokList.push(newItem);
        Store.saveStokPakan(stokList);
        Store.addLog(`Tambah komoditas pakan baru (${tgl}): ${nama} (${stokKg} ${satuan})`);
        App.closeModal();
        App.showToast(`Komoditas "${nama}" pada ${tgl} berhasil didaftarkan ke gudang pakan!`, "success");
        App.renderContent();
    },

    openModalKurangStok(id) {
        const item = Store.getStokPakan().find(s => s.id === id);
        if (!item) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="minus-circle" class="w-5 h-5 text-amber-500"></i> Kurangi / Pakai Stok Bahan Pakan
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PakanKesehatanModule.submitKurangStok(event, '${item.id}')" class="space-y-3 text-xs">
                    <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                        <div class="font-bold text-sm text-slate-800 dark:text-slate-200">${item.nama}</div>
                        <div class="flex items-center justify-between text-slate-500 text-[11px]">
                            <span>Kategori: <b>${item.kategori}</b></span>
                            <span>Sisa Stok Saat Ini: <b class="text-emerald-600">${(item.stokKg || 0).toLocaleString('id-ID')} ${item.satuan || 'kg'}</b></span>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pemakaian / Pengeluaran *</label>
                        <input type="date" id="kstk-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Pengurangan / Pemakaian (${item.satuan || 'kg'}) *</label>
                        <input type="number" step="0.1" max="${item.stokKg || 999999}" id="kstk-jumlah" required value="10" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-lg text-rose-600">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keperluan / Keterangan Pemakaian *</label>
                        <select id="kstk-alasan" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold mb-2">
                            <option value="Pemberian Pakan Lapangan">Pemberian Pakan Rutin Lapangan</option>
                            <option value="Penyusutan / Kerusakan Bahan">Penyusutan / Kerusakan (Spoilage)</option>
                            <option value="Pengujian Nutrisi & Ransum">Pengujian / Sampel Laboratorium Ransum</option>
                            <option value="Penyesuaian Opname Fisik">Penyesuaian Stok Opname Fisik</option>
                        </select>
                        <input type="text" id="kstk-catatan" placeholder="Catatan opsional (misal: sekat 3 atau blok timur)" class="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md transition active:scale-95">
                            Kurangi Stok
                        </button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitKurangStok(e, id) {
        e.preventDefault();
        const tgl = document.getElementById("kstk-tgl").value || new Date().toISOString().split('T')[0];
        const jumlah = parseFloat(document.getElementById("kstk-jumlah").value) || 0;
        const alasan = document.getElementById("kstk-alasan").value;
        const catatan = document.getElementById("kstk-catatan").value.trim();

        const stokList = Store.getStokPakan();
        const item = stokList.find(s => s.id === id);
        if (!item) return;

        item.stokKg = Math.max(0, (item.stokKg || 0) - jumlah);
        item.tglUpdate = tgl;
        Store.saveStokPakan(stokList);
        Store.addLog(`Pengurangan stok (${tgl}) ${item.nama}: -${jumlah} ${item.satuan} (${alasan}${catatan ? ' - ' + catatan : ''})`);

        App.closeModal();
        App.showToast(`Stok ${item.nama} berkurang ${jumlah} ${item.satuan} (${tgl}). Sisa: ${item.stokKg} ${item.satuan}`, "info");
        App.renderContent();
    },

    muatPakanStandar() {
        const today = new Date().toISOString().split('T')[0];
        const standar = [
            { id: "stk-1", nama: "Konsentrat Penggemukan (PK 16%)", kategori: "Konsentrat", stokKg: 1250, satuan: "kg", batasMinimum: 300, biayaPerKg: 4200, tglMasuk: today, tglUpdate: today },
            { id: "stk-2", nama: "Silase Tebon Jagung Fermentasi", kategori: "Silase", stokKg: 3400, satuan: "kg", batasMinimum: 800, biayaPerKg: 1200, tglMasuk: today, tglUpdate: today },
            { id: "stk-3", nama: "Silase Jerami Padi EM4", kategori: "Silase", stokKg: 1800, satuan: "kg", batasMinimum: 500, biayaPerKg: 800, tglMasuk: today, tglUpdate: today },
            { id: "stk-4", nama: "Hijauan Segar Odot/Pakchong", kategori: "Hijauan", stokKg: 650, satuan: "kg", batasMinimum: 200, biayaPerKg: 400, tglMasuk: today, tglUpdate: today },
            { id: "stk-5", nama: "Mineral Blok & Garam Beryodium", kategori: "Suplemen", stokKg: 85, satuan: "kg", batasMinimum: 20, biayaPerKg: 15000, tglMasuk: today, tglUpdate: today }
        ];
        Store.saveStokPakan(standar);
        Store.addLog("Memuat 5 komoditas bahan pakan standar pabrik.");
        App.showToast("5 komoditas bahan pakan standar berhasil dimuat!", "success");
        App.renderContent();
    },

    deleteStokPakan(id) {
        if (confirm("Apakah Anda yakin ingin menghapus komoditas bahan pakan ini?")) {
            Store.deleteStokPakan(id);
            App.showToast("Bahan pakan telah dihapus.", "success");
            App.renderContent();
        }
    },

    // Handlers for Rekam Medis
    searchMedis(val) {
        this.medisSearchQuery = val;
        App.renderContent();
    },

    resetFilterMedis() {
        this.medisSearchQuery = "";
        App.renderContent();
    },

    openModalEditRekamMedis(dombaId, medisId) {
        const domba = Store.getDomba().find(d => d.id === dombaId || d.eartag === dombaId);
        if (!domba || !domba.rekamMedis) return;
        const record = domba.rekamMedis.find((m, idx) => m.id === medisId || ('med-' + idx) === medisId || idx === medisId);
        if (!record) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i> Ubah Rekam Medis (${domba.eartag} - ${domba.nama})
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PakanKesehatanModule.submitEditRekamMedis(event, '${domba.id}', '${medisId}')" class="space-y-3 text-xs">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pemeriksaan *</label>
                            <input type="date" id="erm-tgl" required value="${record.tgl}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dokter / Paramedik *</label>
                            <input type="text" id="erm-petugas" required value="${record.petugas || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Diagnosa / Kasus Penyakit *</label>
                        <input type="text" id="erm-diagnosa" required value="${record.diagnosa || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-rose-700">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tindakan Medis Dilakukan *</label>
                        <input type="text" id="erm-tindakan" required value="${record.tindakan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Obat / Dosis Yang Diberikan</label>
                            <input type="text" id="erm-obat" value="${record.obat || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Pasien</label>
                            <select id="erm-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Sehat" ${record.statusHewan === 'Sehat' ? 'selected' : ''}>Sehat</option>
                                <option value="Dalam Observasi" ${record.statusHewan === 'Dalam Observasi' ? 'selected' : ''}>Dalam Observasi</option>
                                <option value="Karantina" ${record.statusHewan === 'Karantina' ? 'selected' : ''}>Karantina</option>
                            </select>
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditRekamMedis(e, dombaId, medisId) {
        e.preventDefault();
        const updated = {
            tgl: document.getElementById("erm-tgl").value,
            petugas: document.getElementById("erm-petugas").value.trim(),
            diagnosa: document.getElementById("erm-diagnosa").value.trim(),
            tindakan: document.getElementById("erm-tindakan").value.trim(),
            obat: document.getElementById("erm-obat").value.trim(),
            statusHewan: document.getElementById("erm-status").value
        };

        Store.updateRekamMedis(dombaId, medisId, updated);
        App.closeModal();
        App.showToast("Rekam medis berhasil diperbarui!", "success");
        App.renderContent();
    },

    deleteRekamMedisRow(dombaId, medisId) {
        if (confirm("Apakah Anda yakin ingin menghapus catatan rekam medis ini?")) {
            Store.deleteRekamMedis(dombaId, medisId);
            App.showToast("Rekam medis telah dihapus.", "success");
            App.renderContent();
        }
    },

    // 6. IMPORT MASAL & UPDATE LOG PAKAN HARIAN (ANTI-TABRAKAN)
    downloadTemplatePakanExcel() {
        const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : { nama: "Petugas" };
        const masterKandang = Store.getMasterKandang ? Store.getMasterKandang() : [];
        const k1 = masterKandang[0]?.nama || "Kandang A";
        const k2 = masterKandang[1]?.nama || "Kandang B";
        const today = new Date().toISOString().split('T')[0];
        const stokList = Store.getStokPakan();
        const stokSummary = stokList.map(s => `${s.nama}: ${s.stokKg} ${s.satuan}`).join(" | ");

        const headers = ["ID_Log", "Tanggal", "Waktu", "Kandang", "Konsentrat_kg", "Silase_kg", "Hijauan_Odot_kg", "Petugas", "Catatan"];
        const rows = [
            ["fp-01", today, "Pagi (07:30)", k1, "8.5", "15.0", "20.0", currentUser.nama || "Petugas", "Nafsu makan tinggi, pakan habis"],
            ["fp-02", today, "Pagi (08:00)", k2, "5.0", "10.0", "25.0", currentUser.nama || "Petugas", "Indukan laktasi diberi pakan ekstra"],
            ["", today, "Siang (12:00)", k1, "4.0", "8.0", "12.0", "", "Pemberian pakan siang (otomatis mengurangi stok gudang)"]
        ];
        ExportImport.exportExcelTable("template_import_pakan_bumkal", headers, rows, `Template Import & Update Masal Pakan Harian (Sisa Stok Gudang: ${stokSummary})`, "Template_Pakan");
    },

    downloadTemplatePakanCSV() {
        const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : { nama: "Petugas" };
        const pet = currentUser.nama || "Petugas";
        const masterKandang = Store.getMasterKandang ? Store.getMasterKandang() : [];
        const k1 = masterKandang[0]?.nama || "Kandang A";
        const k2 = masterKandang[1]?.nama || "Kandang B";
        const today = new Date().toISOString().split('T')[0];
        const stokList = Store.getStokPakan();
        const stokSummary = stokList.map(s => `${s.nama}: ${s.stokKg} ${s.satuan}`).join(" | ");

        const note = `# STOK GUDANG TERKINI: ${stokSummary}\r\n`;
        const header = "ID_Log;Tanggal;Waktu;Kandang;Konsentrat_kg;Silase_kg;Hijauan_Odot_kg;Petugas;Catatan\r\n";
        const sample1 = `fp-01;${today};Pagi (07:30);${k1};8.5;15.0;20.0;${pet};Nafsu makan tinggi, pakan habis\r\n`;
        const sample2 = `fp-02;${today};Pagi (08:00);${k2};5.0;10.0;25.0;${pet};Indukan laktasi ekstra\r\n`;
        const sample3 = `;${today};Siang (12:00);${k1};4.0;8.0;12.0;;Pemberian pakan siang (otomatis kurangi stok)\r\n`;
        const blob = new Blob(["\uFEFF" + note + header + sample1 + sample2 + sample3], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_import_pakan_excel_windows.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        App.showToast("Template CSV Titik-Koma (;) Pakan Harian berhasil diunduh!", "success");
    },

    openModalImportPakan() {
        const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : { nama: "Petugas" };
        const stokList = Store.getStokPakan();
        this.pendingPakanImportData = [];

        App.setModalContent(`
            <div class="p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                            <i data-lucide="file-spreadsheet" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">Import Masal & Update Log Pakan Harian</h3>
                            <p class="text-xs text-slate-500">Unggah puluhan log pakan sekaligus dari spreadsheet (Excel / CSV)</p>
                        </div>
                    </div>
                    <button type="button" onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <!-- MONITOR SISA STOK GUDANG REALTIME -->
                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            <i data-lucide="package-search" class="w-4 h-4 text-teal-600"></i>
                            Stok Pakan Terkini di Gudang (Otomatis Dikurangi Saat Upload)
                        </span>
                        <span class="text-[11px] text-teal-600 dark:text-teal-400 font-bold">Sinkronisasi Otomatis</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        ${stokList.map(s => `
                            <div class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-0.5">
                                <div class="text-[10px] text-slate-400 font-semibold truncate" title="${s.nama}">${s.nama}</div>
                                <div class="font-black text-sm text-teal-700 dark:text-teal-300">${(s.stokKg || 0).toLocaleString('id-ID')} ${s.satuan || 'kg'}</div>
                                <div class="text-[9px] ${s.stokKg > (s.batasMinimum || 200) ? 'text-emerald-600' : 'text-rose-500 font-bold'}">
                                    ${s.stokKg > (s.batasMinimum || 200) ? '● Stok Cukup' : '⚠️ Re-stok Diperlukan'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- PANDUAN PENTING & ANTI-TABRAKAN -->
                <div class="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800 space-y-2 text-xs">
                    <div class="flex items-start gap-2">
                        <div class="p-1 rounded-lg bg-teal-600 text-white font-bold shrink-0 mt-0.5">
                            <i data-lucide="info" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                            <p><b>Fitur Cerdas Anti-Tabrakan & Pengurangan Stok Otomatis:</b></p>
                            <ul class="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                                <li>Setiap catatan konsumsi pakan yang diunggah akan <b>langsung memotong persediaan stok pakan di gudang</b> secara realtime.</li>
                                <li>Jika baris memiliki <b>ID_Log</b> yang sama ATAU kombinasi <b>Tanggal + Waktu + Kandang</b> yang sama dengan data di sistem, sistem otomatis <b>mengambil data terbaru dari spreadsheet</b> dan memperbarui catatan lama serta menyesuaikan selisih stoknya.</li>
                                <li>Jika kolom <b>Petugas</b> dikosongkan, sistem otomatis mencatat nama user login Anda saat ini: <b class="text-teal-700 dark:text-teal-300">${currentUser.nama || 'Petugas'}</b>.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- DOWNLOAD TEMPLATE BUTTONS -->
                <div class="flex flex-wrap items-center gap-2">
                    <button type="button" onclick="PakanKesehatanModule.downloadTemplatePakanExcel()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 cursor-pointer">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Unduh Template Excel (.xls)
                    </button>
                    <button type="button" onclick="PakanKesehatanModule.downloadTemplatePakanCSV()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer">
                        <i data-lucide="file-text" class="w-4 h-4 text-blue-600"></i> Template CSV Titik-Koma (;)
                    </button>
                    <button type="button" onclick="ExportImport.openExportModal('pakan')" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition cursor-pointer">
                        <i data-lucide="download" class="w-4 h-4"></i> Ekspor Data Pakan Saat Ini (.xls)
                    </button>
                </div>

                <!-- FILE INPUT AREA -->
                <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/40 text-center space-y-2">
                    <i data-lucide="upload-cloud" class="w-8 h-8 mx-auto text-teal-600"></i>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Pilih File Spreadsheet Pakan (.csv atau .txt)</div>
                    <p class="text-[11px] text-slate-400">Otomatis mendeteksi pemisah Titik-Koma (;), Koma (,), atau Tab.</p>
                    <input type="file" id="pakan-csv-upload-input" accept=".csv,.txt" onchange="PakanKesehatanModule.previewPakanCSV(this)" class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer">
                </div>

                <!-- PREVIEW CONTAINER -->
                <div id="pakan-import-preview-area" class="hidden space-y-3 pt-2">
                    <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                            <i data-lucide="check-circle" class="w-4 h-4 text-teal-600"></i>
                            <span id="pakan-preview-count-label">0 Data Siap Diimpor</span>
                            <span id="pakan-preview-delim-label" class="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Pemisah: ;</span>
                        </div>
                        <span class="text-[11px] text-slate-400">Pratinjau Data</span>
                    </div>

                    <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] sticky top-0 z-10">
                                <tr>
                                    <th class="p-2 border-b">Status</th>
                                    <th class="p-2 border-b">ID Log</th>
                                    <th class="p-2 border-b">Tanggal & Waktu</th>
                                    <th class="p-2 border-b">Kandang</th>
                                    <th class="p-2 border-b text-right">Konsentrat</th>
                                    <th class="p-2 border-b text-right">Silase</th>
                                    <th class="p-2 border-b text-right">Hijauan Odot</th>
                                    <th class="p-2 border-b">Petugas</th>
                                    <th class="p-2 border-b">Catatan</th>
                                </tr>
                            </thead>
                            <tbody id="pakan-preview-tbody" class="divide-y divide-slate-100 dark:divide-slate-800"></tbody>
                        </table>
                    </div>

                    <button type="button" onclick="PakanKesehatanModule.confirmImportPakanData()" class="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                        <i data-lucide="database" class="w-4 h-4"></i> Konfirmasi & Simpan / Update Log Pakan ke Database
                    </button>
                </div>
            </div>
        `);
        App.openModal();
        if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    },

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

    previewPakanCSV(input) {
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

            if (lines[0].toLowerCase().startsWith("sep=")) {
                lines.shift();
            }

            if (lines.length <= 1) {
                App.showToast("File hanya memiliki baris header tanpa baris data!", "error");
                return;
            }

            // Deteksi Delimiter
            const headerLine = lines[0];
            const semiCount = (headerLine.match(/;/g) || []).length;
            const commaCount = (headerLine.match(/,/g) || []).length;
            const tabCount = (headerLine.match(/\t/g) || []).length;

            let delim = ";";
            if (tabCount > semiCount && tabCount > commaCount) delim = "\t";
            else if (commaCount > semiCount) delim = ",";

            const parseDateInput = (val) => {
                if (!val) return new Date().toISOString().split("T")[0];
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

            const parseKg = (val) => {
                if (!val) return 0;
                const clean = String(val).replace(',', '.').replace(/[^0-9.]/g, '');
                const num = parseFloat(clean);
                return isNaN(num) ? 0 : parseFloat(num.toFixed(1));
            };

            const existingLogs = Store.getLogPakanHarian ? Store.getLogPakanHarian() : [];
            const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : { nama: "Petugas" };
            const defaultUser = currentUser.nama || "Petugas";

            const parsedRows = [];
            let updateCandidateCount = 0;
            let newCandidateCount = 0;

            for (let i = 1; i < lines.length; i++) {
                const cols = this.parseCSVLine(lines[i], delim);
                if (cols.length >= 4) {
                    let idVal = "";
                    let tglVal = "";
                    let waktuVal = "Pagi (07:30)";
                    let kandangVal = "Kandang A";
                    let konsVal = 0;
                    let silVal = 0;
                    let hijVal = 0;
                    let petVal = "";
                    let catVal = "-";

                    // Format: ID_Log; Tanggal; Waktu; Kandang; Konsentrat_kg; Silase_kg; Hijauan_Odot_kg; Petugas; Catatan
                    if (cols.length >= 7) {
                        idVal = cols[0];
                        tglVal = parseDateInput(cols[1]);
                        waktuVal = cols[2] || "Pagi (07:30)";
                        kandangVal = cols[3] || "Kandang A";
                        konsVal = parseKg(cols[4]);
                        silVal = parseKg(cols[5]);
                        hijVal = parseKg(cols[6]);
                        petVal = cols[7] ? cols[7].trim() : defaultUser;
                        catVal = cols[8] ? cols[8].trim() : "-";
                    } else {
                        tglVal = parseDateInput(cols[0]);
                        waktuVal = cols[1] || "Pagi (07:30)";
                        kandangVal = cols[2] || "Kandang A";
                        konsVal = parseKg(cols[3]);
                        silVal = parseKg(cols[4]);
                        hijVal = parseKg(cols[5]);
                        petVal = defaultUser;
                    }

                    if (!petVal) petVal = defaultUser;

                    // Cek tabrakan
                    let isCollision = false;
                    if (idVal && existingLogs.some(p => p.id === idVal)) {
                        isCollision = true;
                    } else if (existingLogs.some(p => p.tgl === tglVal && p.kandang.toLowerCase().trim() === kandangVal.toLowerCase().trim() && p.waktu.toLowerCase().trim() === waktuVal.toLowerCase().trim())) {
                        isCollision = true;
                    }

                    if (isCollision) updateCandidateCount++;
                    else newCandidateCount++;

                    parsedRows.push({
                        id: idVal,
                        tgl: tglVal,
                        waktu: waktuVal,
                        kandang: kandangVal,
                        konsentratKg: konsVal,
                        silaseKg: silVal,
                        hijauanOdotKg: hijVal,
                        petugas: petVal,
                        catatan: catVal,
                        isUpdate: isCollision
                    });
                }
            }

            if (parsedRows.length === 0) {
                App.showToast("Gagal membaca baris pakan. Periksa struktur kolom!", "error");
                return;
            }

            this.pendingPakanImportData = parsedRows;

            // Render Preview
            const previewArea = document.getElementById("pakan-import-preview-area");
            const previewCount = document.getElementById("pakan-preview-count-label");
            const previewDelim = document.getElementById("pakan-preview-delim-label");
            const tbody = document.getElementById("pakan-preview-tbody");

            if (previewArea && previewCount && tbody) {
                previewArea.classList.remove("hidden");
                previewCount.innerHTML = `<span>${parsedRows.length} Log Pakan Terbaca</span> <span class="text-amber-600 dark:text-amber-400 font-bold">(${updateCandidateCount} Update Tabrakan</span> • <span class="text-teal-600 dark:text-teal-400 font-bold">${newCandidateCount} Baru)</span>`;
                previewDelim.textContent = `Pemisah: ${delim === ';' ? 'Titik-Koma (;)' : delim === ',' ? 'Koma (,)' : 'Tab'}`;

                tbody.innerHTML = parsedRows.map(d => `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td class="p-2">
                            ${d.isUpdate ? `
                                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 whitespace-nowrap">
                                    Update Terbaru
                                </span>
                            ` : `
                                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800 whitespace-nowrap">
                                    Data Baru
                                </span>
                            `}
                        </td>
                        <td class="p-2 font-mono text-[11px] text-slate-500">${d.id || '-'}</td>
                        <td class="p-2 font-semibold text-slate-800 dark:text-slate-200">
                            <div>${d.tgl}</div>
                            <span class="text-[10px] text-slate-400 font-normal">${d.waktu}</span>
                        </td>
                        <td class="p-2 font-bold text-teal-700 dark:text-teal-400">${d.kandang}</td>
                        <td class="p-2 text-right font-bold text-slate-900 dark:text-white">${d.konsentratKg} kg</td>
                        <td class="p-2 text-right font-bold text-slate-900 dark:text-white">${d.silaseKg} kg</td>
                        <td class="p-2 text-right font-bold text-emerald-600 dark:text-emerald-400">${d.hijauanOdotKg} kg</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400 font-medium">${d.petugas}</td>
                        <td class="p-2 text-slate-500 italic max-w-xs truncate">${d.catatan}</td>
                    </tr>
                `).join('');

                if (window.lucide) window.lucide.createIcons();
            }
        };

        reader.readAsText(file);
    },

    confirmImportPakanData() {
        if (!this.pendingPakanImportData || this.pendingPakanImportData.length === 0) {
            App.showToast("Tidak ada data pakan untuk diimpor!", "error");
            return;
        }

        let addedCount = 0;
        let updatedCount = 0;

        this.pendingPakanImportData.forEach((row) => {
            const res = Store.upsertLogPakanHarian(row, true);
            if (res && res.action === "update") {
                updatedCount++;
            } else {
                addedCount++;
            }
        });

        this.pendingPakanImportData = [];
        App.closeModal();

        let msg = "";
        if (updatedCount > 0 && addedCount > 0) {
            msg = `Sukses import: ${addedCount} log pakan baru & ${updatedCount} log tabrakan diperbarui dengan data terbaru!`;
        } else if (updatedCount > 0) {
            msg = `Sukses memperbarui ${updatedCount} log pakan yang tabrakan dengan data terbaru!`;
        } else {
            msg = `Sukses mengimpor ${addedCount} log pakan baru!`;
        }
        App.showToast(msg, "success");
        App.renderContent();
    }
};
