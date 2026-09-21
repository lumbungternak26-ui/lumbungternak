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
                    <button onclick="PakanKesehatanModule.openModalCatatPakan()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md transition active:scale-95">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i> Catat Pakan Hari Ini
                    </button>
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
                            <option value="Kandang A" ${this.pakanFilterKandang === 'Kandang A' ? 'selected' : ''}>Kandang A</option>
                            <option value="Kandang B" ${this.pakanFilterKandang === 'Kandang B' ? 'selected' : ''}>Kandang B</option>
                            <option value="Kandang C" ${this.pakanFilterKandang === 'Kandang C' ? 'selected' : ''}>Kandang C</option>
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
                        <span class="text-xs text-slate-500">${logPakan.length} Catatan</span>
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
                                            <div class="text-[10px] text-slate-400 font-normal">ID: ${s.id}</div>
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
        const stokK = stokList.find(s => s.kategori.toLowerCase() === 'konsentrat') || { stokKg: 0 };
        const stokS = stokList.find(s => s.kategori.toLowerCase() === 'silase') || { stokKg: 0 };
        const stokH = stokList.find(s => s.kategori.toLowerCase() === 'hijauan') || { stokKg: 0 };

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
                            <i data-lucide="box" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">Catat Pemberian Pakan Harian</h3>
                            <p class="text-xs text-slate-500">Stok bahan otomatis terpotong & HPP/FCR disinkronkan</p>
                        </div>
                    </div>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <!-- Live Warehouse Stock Banner -->
                <div class="p-3 bg-teal-50/70 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800 text-[11px] space-y-1.5">
                    <div class="font-bold text-teal-900 dark:text-teal-200 flex items-center justify-between">
                        <span>📦 Sisa Stok Bahan di Gudang:</span>
                        <span class="text-[10px] text-teal-600 dark:text-teal-400">Sinkron Realtime</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                        <div class="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            Konsentrat: <span class="${stokK.stokKg < 50 ? 'text-rose-600' : 'text-emerald-600'}">${stokK.stokKg.toLocaleString('id-ID')} kg</span>
                        </div>
                        <div class="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            Silase: <span class="${stokS.stokKg < 100 ? 'text-rose-600' : 'text-emerald-600'}">${stokS.stokKg.toLocaleString('id-ID')} kg</span>
                        </div>
                        <div class="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            Hijauan Odot: <span class="${stokH.stokKg < 100 ? 'text-rose-600' : 'text-emerald-600'}">${stokH.stokKg.toLocaleString('id-ID')} kg</span>
                        </div>
                    </div>
                </div>

                <form onsubmit="PakanKesehatanModule.submitPakan(event)" class="space-y-3 text-xs">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal *</label>
                            <input type="date" id="pk-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Waktu Pemberian *</label>
                            <div class="flex items-center gap-2">
                                <select onchange="PakanKesehatanModule.onWaktuPresetChange(this.value, 'pk-waktu')" class="flex-shrink-0 p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs">
                                    <option value="Pagi (07:30)">Pagi (07:30)</option>
                                    <option value="Siang (12:00)">Siang (12:00)</option>
                                    <option value="Sore (15:30)">Sore (15:30)</option>
                                    <option value="Malam (20:00)">Malam (20:00)</option>
                                    <option value="">✏️ Kustom...</option>
                                </select>
                                <input type="text" id="pk-waktu" value="Pagi (07:30)" placeholder="Ketik jam, misal: 06:45 WIB" class="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kandang Alokasi *</label>
                        <select id="pk-kandang" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                            <option value="Kandang A">Kandang A (Pejantan & Fattening)</option>
                            <option value="Kandang B">Kandang B (Indukan & Breeding)</option>
                            <option value="Kandang C">Kandang C (Karantina)</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Konsentrat (kg) *</label>
                            <input type="number" step="0.5" id="pk-konsentrat" value="8.0" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Silase (kg) *</label>
                            <input type="number" step="0.5" id="pk-silase" value="14.0" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hijauan Odot (kg) *</label>
                            <input type="number" step="0.5" id="pk-odot" value="20.0" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
                        <input type="text" id="pk-catatan" value="Nafsu makan baik, air minum ad-libitum bersih" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition active:scale-95">
                            Simpan & Kurangi Stok Gudang
                        </button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitPakan(e) {
        e.preventDefault();
        const newLog = {
            id: "fp-" + Date.now(),
            tgl: document.getElementById("pk-tgl").value,
            waktu: document.getElementById("pk-waktu").value,
            kandang: document.getElementById("pk-kandang").value,
            konsentratKg: parseFloat(document.getElementById("pk-konsentrat").value) || 0,
            silaseKg: parseFloat(document.getElementById("pk-silase").value) || 0,
            hijauanOdotKg: parseFloat(document.getElementById("pk-odot").value) || 0,
            petugas: Store.getCurrentUser().nama || "Wahyu Pratama",
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
        const mode = document.getElementById("npk-mode").value;
        const jumlah = parseFloat(document.getElementById("npk-jumlah").value) || 0;
        const stokList = Store.getStokPakan();

        if (mode === "restok") {
            const id = document.getElementById("npk-existing-id").value;
            const item = stokList.find(s => s.id === id);
            if (item) {
                item.stokKg += jumlah;
                Store.saveStokPakan(stokList);
                Store.addLog(`Restok pakan: +${jumlah} kg ${item.nama}`);
                App.showToast(`Restok ${item.nama} (+${jumlah} kg) berhasil!`, "success");
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
                biayaPerKg: biaya
            });
            Store.saveStokPakan(stokList);
            Store.addLog(`Tambah bahan pakan baru: ${nama} (${jumlah} kg)`);
            App.showToast(`Bahan pakan baru "${nama}" berhasil ditambahkan!`, "success");
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

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i> Ubah Catatan Pakan Harian
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PakanKesehatanModule.submitEditLogPakan(event, '${log.id}')" class="space-y-3 text-xs">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal *</label>
                            <input type="date" id="epk-tgl" required value="${log.tgl}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Waktu Pemberian *</label>
                            <div class="flex items-center gap-2">
                                <select onchange="PakanKesehatanModule.onWaktuPresetChange(this.value, 'epk-waktu')" class="flex-shrink-0 p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs">
                                    <option value="Pagi (07:30)" ${log.waktu && log.waktu.includes('Pagi') ? 'selected' : ''}>Pagi (07:30)</option>
                                    <option value="Siang (12:00)" ${log.waktu && log.waktu.includes('Siang') ? 'selected' : ''}>Siang (12:00)</option>
                                    <option value="Sore (15:30)" ${log.waktu && log.waktu.includes('Sore') ? 'selected' : ''}>Sore (15:30)</option>
                                    <option value="Malam (20:00)" ${log.waktu && log.waktu.includes('Malam') ? 'selected' : ''}>Malam (20:00)</option>
                                    <option value="" ${log.waktu && !log.waktu.includes('Pagi') && !log.waktu.includes('Siang') && !log.waktu.includes('Sore') && !log.waktu.includes('Malam') ? 'selected' : ''}>✏️ Kustom...</option>
                                </select>
                                <input type="text" id="epk-waktu" value="${log.waktu || ''}" placeholder="Ketik jam, misal: 06:45 WIB" class="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kandang Alokasi *</label>
                        <select id="epk-kandang" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            <option value="Kandang A" ${log.kandang === 'Kandang A' ? 'selected' : ''}>Kandang A (Pejantan & Fattening)</option>
                            <option value="Kandang B" ${log.kandang === 'Kandang B' ? 'selected' : ''}>Kandang B (Indukan & Breeding)</option>
                            <option value="Kandang C" ${log.kandang === 'Kandang C' ? 'selected' : ''}>Kandang C (Karantina)</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Konsentrat (kg)</label>
                            <input type="number" step="0.5" id="epk-konsentrat" value="${log.konsentratKg}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Silase (kg)</label>
                            <input type="number" step="0.5" id="epk-silase" value="${log.silaseKg}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hijauan Odot (kg)</label>
                            <input type="number" step="0.5" id="epk-odot" value="${log.hijauanOdotKg}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Petugas Pakan *</label>
                            <input type="text" id="epk-petugas" required value="${log.petugas || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Respon Ternak</label>
                            <input type="text" id="epk-catatan" value="${log.catatan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
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
        const updated = {
            nama: document.getElementById("estk-nama").value.trim(),
            kategori: document.getElementById("estk-kategori").value,
            satuan: document.getElementById("estk-satuan").value.trim() || "kg",
            stokKg: parseFloat(document.getElementById("estk-stok").value) || 0,
            batasMinimum: parseFloat(document.getElementById("estk-min").value) || 200,
            biayaPerKg: parseFloat(document.getElementById("estk-biaya").value) || 0
        };

        Store.updateStokPakan(id, updated);
        App.closeModal();
        App.showToast("Bahan pakan berhasil diperbarui!", "success");
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
            biayaPerKg
        };

        const stokList = Store.getStokPakan();
        stokList.push(newItem);
        Store.saveStokPakan(stokList);
        Store.addLog(`Tambah komoditas pakan baru: ${nama} (${stokKg} ${satuan})`);
        App.closeModal();
        App.showToast(`Komoditas "${nama}" berhasil didaftarkan ke gudang pakan!`, "success");
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
        const jumlah = parseFloat(document.getElementById("kstk-jumlah").value) || 0;
        const alasan = document.getElementById("kstk-alasan").value;
        const catatan = document.getElementById("kstk-catatan").value.trim();

        const stokList = Store.getStokPakan();
        const item = stokList.find(s => s.id === id);
        if (!item) return;

        item.stokKg = Math.max(0, (item.stokKg || 0) - jumlah);
        Store.saveStokPakan(stokList);
        Store.addLog(`Pengurangan stok ${item.nama}: -${jumlah} ${item.satuan} (${alasan}${catatan ? ' - ' + catatan : ''})`);

        App.closeModal();
        App.showToast(`Stok ${item.nama} berkurang ${jumlah} ${item.satuan}. Sisa: ${item.stokKg} ${item.satuan}`, "info");
        App.renderContent();
    },

    muatPakanStandar() {
        const standar = [
            { id: "stk-1", nama: "Konsentrat Penggemukan (PK 16%)", kategori: "Konsentrat", stokKg: 1250, satuan: "kg", batasMinimum: 300, biayaPerKg: 4200 },
            { id: "stk-2", nama: "Silase Tebon Jagung Fermentasi", kategori: "Silase", stokKg: 3400, satuan: "kg", batasMinimum: 800, biayaPerKg: 1200 },
            { id: "stk-3", nama: "Silase Jerami Padi EM4", kategori: "Silase", stokKg: 1800, satuan: "kg", batasMinimum: 500, biayaPerKg: 800 },
            { id: "stk-4", nama: "Hijauan Segar Odot/Pakchong", kategori: "Hijauan", stokKg: 650, satuan: "kg", batasMinimum: 200, biayaPerKg: 400 },
            { id: "stk-5", nama: "Mineral Blok & Garam Beryodium", kategori: "Suplemen", stokKg: 85, satuan: "kg", batasMinimum: 20, biayaPerKg: 15000 }
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
    }
};
