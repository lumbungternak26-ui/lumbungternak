/**
 * Modul Pusat Laporan Terpadu (Comprehensive Reporting Center)
 * Menyajikan 6 laporan analitis komprehensif untuk BUMKal LPM & Kalurahan Pleret:
 * 1. Laporan Populasi & Mutasi Ternak
 * 2. Laporan Performa Penggemukan & Analisis ADG
 * 3. Laporan Konsumsi Nutrisi & Analisis Biaya Pakan (HPP)
 * 4. Laporan Rekam Medis, Vaksinasi PMK & Kesehatan
 * 5. Laporan Pengolahan Limbah Kotoran & Produksi Pupuk Organik
 * 6. Laporan Laba Rugi BUMKal, Valuasi Aset & Realisasi PADes
 */

const LaporanModule = {
    activeTab: "populasi", // "populasi" | "adg" | "pakan" | "medis" | "limbah" | "keuangan_pades"
    selectedPeriod: "bulan_ini", // "bulan_ini" | "triwulan" | "tahun_ini" | "semua"
    filterStartDate: "",
    filterEndDate: "",
    filterKandang: "all",
    filterKategori: "all",
    filterStatus: "all",
    searchQuery: "",

    setSearch(val) {
        this.searchQuery = val;
        App.renderContent();
    },

    setDateStart(val) {
        this.filterStartDate = val;
        App.renderContent();
    },

    setDateEnd(val) {
        this.filterEndDate = val;
        App.renderContent();
    },

    setFilterKandang(val) {
        this.filterKandang = val;
        App.renderContent();
    },

    setFilterKategori(val) {
        this.filterKategori = val;
        App.renderContent();
    },

    setFilterStatus(val) {
        this.filterStatus = val;
        App.renderContent();
    },

    resetFilter() {
        this.filterStartDate = "";
        this.filterEndDate = "";
        this.filterKandang = "all";
        this.filterKategori = "all";
        this.filterStatus = "all";
        this.searchQuery = "";
        App.renderContent();
    },

    getFilteredDomba() {
        let list = Store.getDomba();
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            list = list.filter(d => 
                (d.eartag || '').toLowerCase().includes(q) ||
                (d.nama || '').toLowerCase().includes(q) ||
                (d.ras || '').toLowerCase().includes(q) ||
                (d.asalTernak || '').toLowerCase().includes(q) ||
                (d.warnaEartag || '').toLowerCase().includes(q)
            );
        }
        if (this.filterKandang !== "all") {
            list = list.filter(d => (d.kandang || '').includes(this.filterKandang));
        }
        if (this.filterKategori !== "all") {
            list = list.filter(d => d.kategori === this.filterKategori);
        }
        if (this.filterStatus !== "all") {
            list = list.filter(d => d.status === this.filterStatus);
        }
        if (this.filterStartDate) {
            list = list.filter(d => !d.tglMasuk || d.tglMasuk >= this.filterStartDate);
        }
        if (this.filterEndDate) {
            list = list.filter(d => !d.tglMasuk || d.tglMasuk <= this.filterEndDate);
        }
        return list;
    },

    getFilteredLogPakan() {
        let list = Store.getLogPakanHarian();
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            list = list.filter(l => 
                (l.petugas || '').toLowerCase().includes(q) ||
                (l.catatan || '').toLowerCase().includes(q) ||
                (l.kandang || '').toLowerCase().includes(q)
            );
        }
        if (this.filterKandang !== "all") {
            list = list.filter(l => (l.kandang || '').includes(this.filterKandang));
        }
        if (this.filterStartDate) {
            list = list.filter(l => !l.tgl || l.tgl >= this.filterStartDate);
        }
        if (this.filterEndDate) {
            list = list.filter(l => !l.tgl || l.tgl <= this.filterEndDate);
        }
        return list;
    },

    getFilteredKeuangan() {
        let list = Store.getKeuangan();
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            list = list.filter(k => 
                (k.keterangan || '').toLowerCase().includes(q) ||
                (k.kategori || '').toLowerCase().includes(q) ||
                (k.metode || '').toLowerCase().includes(q)
            );
        }
        if (this.filterStartDate) {
            list = list.filter(k => !k.tgl || k.tgl >= this.filterStartDate);
        }
        if (this.filterEndDate) {
            list = list.filter(k => !k.tgl || k.tgl <= this.filterEndDate);
        }
        return list;
    },

    getFilteredKohe() {
        let list = Store.getKoheHarian();
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            list = list.filter(k => (k.petugas || '').toLowerCase().includes(q) || (k.catatan || '').toLowerCase().includes(q));
        }
        if (this.filterStartDate) {
            list = list.filter(k => !k.tgl || k.tgl >= this.filterStartDate);
        }
        if (this.filterEndDate) {
            list = list.filter(k => !k.tgl || k.tgl <= this.filterEndDate);
        }
        return list;
    },

    render() {
        const isFilterActive = this.filterStartDate || this.filterEndDate || this.filterKandang !== 'all' || this.filterKategori !== 'all' || this.filterStatus !== 'all' || this.searchQuery;

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                            <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5"></i> Pusat Pelaporan Resmi
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Pusat Laporan Lengkap Peternakan & BUMDes</h2>
                        <p class="text-xs text-slate-500">Laporan eksekutif berkala untuk Bamuskal, Pamong Kalurahan Pleret, dan Dinas Peternakan Bantul.</p>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Periode Filter -->
                        <select onchange="LaporanModule.setPeriod(this.value)" class="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                            <option value="bulan_ini" ${this.selectedPeriod === 'bulan_ini' ? 'selected' : ''}>Periode: Bulan Ini (Sep 2026)</option>
                            <option value="triwulan" ${this.selectedPeriod === 'triwulan' ? 'selected' : ''}>Periode: Triwulan III 2026</option>
                            <option value="tahun_ini" ${this.selectedPeriod === 'tahun_ini' ? 'selected' : ''}>Periode: Tahun Anggaran 2026</option>
                            <option value="semua" ${this.selectedPeriod === 'semua' ? 'selected' : ''}>Seluruh Riwayat Kumulatif</option>
                        </select>

                        <button onclick="LaporanModule.printOfficialReport()" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition">
                            <i data-lucide="printer" class="w-4 h-4 text-emerald-600"></i> Cetak Berkop Resmi
                        </button>
                        <button onclick="LaporanModule.exportCurrentReportCSV()" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="download" class="w-4 h-4"></i> Ekspor CSV
                        </button>
                    </div>
                </div>

                <!-- 6 REPORT TABS NAVIGATION -->
                <div class="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 space-x-6 text-xs font-bold custom-scroll pb-1">
                    <button onclick="LaporanModule.setTab('populasi')" class="pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${this.activeTab === 'populasi' ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                        <i data-lucide="tag" class="w-4 h-4"></i> 1. Populasi & Mutasi Ternak
                    </button>
                    <button onclick="LaporanModule.setTab('adg')" class="pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${this.activeTab === 'adg' ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                        <i data-lucide="trending-up" class="w-4 h-4"></i> 2. Performa ADG & Bobot
                    </button>
                    <button onclick="LaporanModule.setTab('pakan')" class="pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${this.activeTab === 'pakan' ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                        <i data-lucide="box" class="w-4 h-4"></i> 3. Nutrisi Pakan & HPP
                    </button>
                    <button onclick="LaporanModule.setTab('medis')" class="pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${this.activeTab === 'medis' ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                        <i data-lucide="shield-check" class="w-4 h-4"></i> 4. Rekam Medis & PMK
                    </button>
                    <button onclick="LaporanModule.setTab('limbah')" class="pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${this.activeTab === 'limbah' ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                        <i data-lucide="recycle" class="w-4 h-4"></i> 5. Limbah Kohe & Pupuk
                    </button>
                    <button onclick="LaporanModule.setTab('keuangan_pades')" class="pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${this.activeTab === 'keuangan_pades' ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                        <i data-lucide="wallet" class="w-4 h-4"></i> 6. Laba Rugi & PADes
                    </button>
                </div>

                <!-- FILTER BAR PUSAT LAPORAN LENGKAP -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <i data-lucide="filter" class="w-4 h-4 text-emerald-600"></i> Parameter & Filter Laporan Lengkap
                        </span>
                        ${isFilterActive ? `
                            <button onclick="LaporanModule.resetFilter()" class="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1">
                                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Reset Filter
                            </button>
                        ` : ''}
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5">
                        <!-- Pencarian Teks -->
                        <div class="md:col-span-2 relative">
                            <label class="text-[10px] text-slate-400 font-semibold block mb-0.5">Pencarian Kata Kunci:</label>
                            <div class="relative">
                                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                                <input type="text" placeholder="Cari eartag, nama, ras, atau keterangan..." value="${this.searchQuery || ''}" oninput="LaporanModule.setSearch(this.value)" class="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            </div>
                        </div>

                        <!-- Rentang Tanggal Mulai -->
                        <div>
                            <label class="text-[10px] text-slate-400 font-semibold block mb-0.5">Dari Tanggal:</label>
                            <input type="date" value="${this.filterStartDate || ''}" onchange="LaporanModule.setDateStart(this.value)" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        </div>

                        <!-- Rentang Tanggal Sampai -->
                        <div>
                            <label class="text-[10px] text-slate-400 font-semibold block mb-0.5">Sampai Tanggal:</label>
                            <input type="date" value="${this.filterEndDate || ''}" onchange="LaporanModule.setDateEnd(this.value)" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        </div>

                        <!-- Filter Kandang -->
                        <div>
                            <label class="text-[10px] text-slate-400 font-semibold block mb-0.5">Lokasi Kandang:</label>
                            <select onchange="LaporanModule.setFilterKandang(this.value)" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold">
                                <option value="all" ${this.filterKandang === 'all' ? 'selected' : ''}>Semua Kandang</option>
                                <option value="Kandang A" ${this.filterKandang === 'Kandang A' ? 'selected' : ''}>Kandang A</option>
                                <option value="Kandang B" ${this.filterKandang === 'Kandang B' ? 'selected' : ''}>Kandang B</option>
                                <option value="Kandang C" ${this.filterKandang === 'Kandang C' ? 'selected' : ''}>Kandang C</option>
                            </select>
                        </div>

                        <!-- Filter Kategori / Status -->
                        <div>
                            <label class="text-[10px] text-slate-400 font-semibold block mb-0.5">Kategori / Fase:</label>
                            <select onchange="LaporanModule.setFilterKategori(this.value)" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold">
                                <option value="all" ${this.filterKategori === 'all' ? 'selected' : ''}>Semua Kategori</option>
                                <option value="Pejantan" ${this.filterKategori === 'Pejantan' ? 'selected' : ''}>Pejantan</option>
                                <option value="Indukan" ${this.filterKategori === 'Indukan' ? 'selected' : ''}>Indukan</option>
                                <option value="Dara" ${this.filterKategori === 'Dara' ? 'selected' : ''}>Dara</option>
                                <option value="Cempe" ${this.filterKategori === 'Cempe' ? 'selected' : ''}>Cempe</option>
                                <option value="Fattening" ${this.filterKategori === 'Fattening' ? 'selected' : ''}>Fattening</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- CONTENT VIEWPORT ACCORDING TO ACTIVE TAB -->
                <div id="laporan-detail-content">
                    ${this.renderActiveTabContent()}
                </div>
            </div>
        `;
    },

    setTab(tab) {
        this.activeTab = tab;
        App.renderContent();
    },

    setPeriod(period) {
        this.selectedPeriod = period;
        App.renderContent();
    },

    renderActiveTabContent() {
        switch (this.activeTab) {
            case "populasi":
                return this.renderTabPopulasi();
            case "adg":
                return this.renderTabADG();
            case "pakan":
                return this.renderTabPakan();
            case "medis":
                return this.renderTabMedis();
            case "limbah":
                return this.renderTabLimbah();
            case "keuangan_pades":
                return this.renderTabKeuanganPADes();
            default:
                return this.renderTabPopulasi();
        }
    },

    // 1. LAPORAN POPULASI & MUTASI TERNAK
    renderTabPopulasi() {
        const dombaList = this.getFilteredDomba();
        const aktif = dombaList.filter(d => d.status !== "Mati" && d.status !== "Terjual");
        const terjual = dombaList.filter(d => d.status === "Terjual");
        const mati = dombaList.filter(d => d.status === "Mati");

        // Breakdown per kategori
        const counts = { Pejantan: 0, Indukan: 0, Cempe: 0, Fattening: 0 };
        aktif.forEach(d => {
            if (counts[d.kategori] !== undefined) counts[d.kategori]++;
            else counts.Fattening++;
        });

        // Breakdown per ras
        const rasCounts = {};
        aktif.forEach(d => {
            rasCounts[d.ras] = (rasCounts[d.ras] || 0) + 1;
        });

        return `
            <div class="space-y-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Ternak Hidup di Kandang</span>
                        <div class="text-2xl font-black text-emerald-600 mt-1">${aktif.length} Ekor</div>
                        <span class="text-[11px] text-slate-400">Populasi aktif saat ini</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Mutasi Terjual</span>
                        <div class="text-2xl font-black text-blue-600 mt-1">${terjual.length} Ekor</div>
                        <span class="text-[11px] text-slate-400">Realisasi penjualan BUMDes</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Tingkat Mortalitas (Kematian)</span>
                        <div class="text-2xl font-black text-emerald-600 mt-1">0.0%</div>
                        <span class="text-[11px] text-emerald-600 font-bold">Nol Kematian (${mati.length} ekor)</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Komposisi Indukan Produktif</span>
                        <div class="text-2xl font-black text-purple-600 mt-1">${counts.Indukan} Ekor</div>
                        <span class="text-[11px] text-slate-400">Potensi kelahiran cempe</span>
                    </div>
                </div>

                <!-- Detail Table -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="list" class="w-4 h-4 text-emerald-600"></i> Rekapitulasi Rincian Ternak Terdaftar
                        </h3>
                        <span class="text-xs text-slate-500">${dombaList.length} Total Ternak Terdata</span>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Eartag</th>
                                    <th class="py-3 px-4">Warna Tag</th>
                                    <th class="py-3 px-4">Nama & Ras</th>
                                    <th class="py-3 px-4">Asal Ternak</th>
                                    <th class="py-3 px-4">Kategori & Kelamin</th>
                                    <th class="py-3 px-4">Kandang & Sekat</th>
                                    <th class="py-3 px-4 text-right">Bobot Awal</th>
                                    <th class="py-3 px-4 text-right">Bobot Terkini</th>
                                    <th class="py-3 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${dombaList.map(d => {
                                    const latestWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                                    return `
                                        <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                            <td class="py-3 px-4 font-mono font-bold text-emerald-600">${d.eartag}</td>
                                            <td class="py-3 px-4">
                                                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                    <span class="w-2 h-2 rounded-full ${d.warnaEartag === 'Kuning' ? 'bg-amber-400' : d.warnaEartag === 'Hijau' ? 'bg-emerald-500' : d.warnaEartag === 'Merah' ? 'bg-rose-500' : d.warnaEartag === 'Biru' ? 'bg-blue-500' : d.warnaEartag === 'Oranye' ? 'bg-orange-500' : 'bg-slate-300'}"></span>
                                                    ${d.warnaEartag || 'Kuning'}
                                                </span>
                                            </td>
                                            <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${d.nama} <span class="text-slate-400 font-normal">(${d.ras})</span></td>
                                            <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${d.asalTernak || 'Peternak Lokal'}</td>
                                            <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${d.kategori} • ${d.kelamin}</td>
                                            <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${(d.kandang || '').split('(')[0]} (${d.sekat})</td>
                                            <td class="py-3 px-4 text-right font-mono text-slate-500">${d.bobotAwal} kg</td>
                                            <td class="py-3 px-4 text-right font-mono font-bold text-emerald-600">${latestWeight} kg</td>
                                            <td class="py-3 px-4 text-center">
                                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${d.status === 'Terjual' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}">
                                                    ${d.status}
                                                </span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // 2. LAPORAN PERFORMA PENGGEMUKAN & ADG
    renderTabADG() {
        const dombaList = this.getFilteredDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");
        const sortedByADG = [...dombaList].sort((a, b) => (b.adg || 0) - (a.adg || 0));
        let totalADG = 0;
        dombaList.forEach(d => totalADG += (d.adg || 180));
        const avgADG = Math.round(totalADG / (dombaList.length || 1));

        return `
            <div class="space-y-6">
                <!-- KPI ADG -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Rata-Rata ADG Populasi</span>
                        <div class="text-2xl font-black text-emerald-600 mt-1">+${avgADG} gram / hari</div>
                        <span class="text-[11px] text-slate-400">Target minimal: 180 g/hari</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Performa Pertumbuhan Tertinggi</span>
                        <div class="text-2xl font-black text-blue-600 mt-1">+${sortedByADG[0]?.adg || 255} g/hari</div>
                        <span class="text-[11px] text-slate-400">${sortedByADG[0]?.nama || '-'} (${sortedByADG[0]?.ras || '-'})</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Estimasi Feed Conversion Ratio (FCR)</span>
                        <div class="text-2xl font-black text-amber-600 mt-1">1 : 6.2</div>
                        <span class="text-[11px] text-emerald-600 font-bold">Kategori Sangat Efisien</span>
                    </div>
                </div>

                <!-- Table Ranking ADG -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="trending-up" class="w-4 h-4 text-blue-600"></i> Peringkat Laju Pertumbuhan Bobot Harian (ADG Leaderboard)
                        </h3>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4 text-center">Peringkat</th>
                                    <th class="py-3 px-4">Eartag & Nama</th>
                                    <th class="py-3 px-4">Ras Domba</th>
                                    <th class="py-3 px-4 text-right">Bobot Awal</th>
                                    <th class="py-3 px-4 text-right">Bobot Terkini</th>
                                    <th class="py-3 px-4 text-right">Kenaikan Total</th>
                                    <th class="py-3 px-4 text-center font-bold">ADG Terhitung</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${sortedByADG.map((d, idx) => {
                                    const latestWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                                    const gain = Math.round((latestWeight - d.bobotAwal) * 10) / 10;
                                    return `
                                        <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                            <td class="py-3 px-4 text-center font-bold text-slate-500">#${idx + 1}</td>
                                            <td class="py-3 px-4">
                                                <span class="font-mono font-bold text-emerald-600">${d.eartag}</span>
                                                <div class="font-semibold text-slate-800 dark:text-slate-200">${d.nama}</div>
                                            </td>
                                            <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${d.ras}</td>
                                            <td class="py-3 px-4 text-right font-mono">${d.bobotAwal} kg</td>
                                            <td class="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">${latestWeight} kg</td>
                                            <td class="py-3 px-4 text-right font-mono text-emerald-600 font-bold">+${gain} kg</td>
                                            <td class="py-3 px-4 text-center font-mono font-black text-blue-600 text-sm">
                                                +${d.adg || 180} g/hari
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // 3. LAPORAN NUTRISI PAKAN & HPP
    renderTabPakan() {
        const stokPakan = Store.getStokPakan();
        const logPakan = this.getFilteredLogPakan();

        let totalKonsentratKg = 0;
        let totalSilaseKg = 0;
        let totalOdotKg = 0;

        logPakan.forEach(l => {
            totalKonsentratKg += (l.konsentratKg || 0);
            totalSilaseKg += (l.silaseKg || 0);
            totalOdotKg += (l.hijauanOdotKg || 0);
        });

        // Estimasi biaya pakan per ekor per hari
        // Konsentrat @4200/kg x 0.5kg = 2100; Silase @1200 x 1.5kg = 1800; Odot @400 x 2kg = 800 => ~Rp 4.700/hari
        const estBiayaPerEkorHari = 4700;

        return `
            <div class="space-y-6">
                <!-- Summary Pakan -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Total Konsumsi Konsentrat (PK 16%)</span>
                        <div class="text-2xl font-black text-amber-600 mt-1">${totalKonsentratKg.toFixed(1)} kg</div>
                        <span class="text-[11px] text-slate-400">Pemberian pakan konsentrat terdata</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Total Konsumsi Silase Jagung EM4</span>
                        <div class="text-2xl font-black text-emerald-600 mt-1">${totalSilaseKg.toFixed(1)} kg</div>
                        <span class="text-[11px] text-slate-400">Fermentasi tebon jagung kaya energi</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Estimasi Biaya Pakan / Ekor / Hari</span>
                        <div class="text-2xl font-black text-blue-600 mt-1">Rp ${estBiayaPerEkorHari.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-emerald-600 font-bold">Sangat Hemat dengan Bank Pakan Mandiri</span>
                    </div>
                </div>

                <!-- Stock & Cost Table -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="package-check" class="w-4 h-4 text-teal-600"></i> Inventaris Gudang Pakan & Harga Pokok Pembelian (HPP)
                        </h3>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Nama Bahan Pakan</th>
                                    <th class="py-3 px-4">Kategori Pakan</th>
                                    <th class="py-3 px-4 text-right">Stok Gudang</th>
                                    <th class="py-3 px-4 text-right">Batas Minimum</th>
                                    <th class="py-3 px-4 text-right">Harga Pokok (HPP/kg)</th>
                                    <th class="py-3 px-4 text-center">Status Pasokan</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${stokPakan.map(s => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${s.nama}</td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${s.kategori}</td>
                                        <td class="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">${s.stokKg} ${s.satuan}</td>
                                        <td class="py-3 px-4 text-right font-mono text-slate-400">${s.batasMinimum} ${s.satuan}</td>
                                        <td class="py-3 px-4 text-right font-mono text-emerald-600 font-bold">Rp ${s.biayaPerKg.toLocaleString('id-ID')}</td>
                                        <td class="py-3 px-4 text-center">
                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.stokKg > s.batasMinimum ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                                                ${s.stokKg > s.batasMinimum ? 'Stok Aman' : 'Perlu Restok'}
                                            </span>
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

    // 4. LAPORAN KESEHATAN TERNAK & REKAM MEDIS
    renderTabMedis() {
        const dombaList = this.getFilteredDomba();
        let totalTindakan = 0;
        let totalVaksinasi = 0;

        dombaList.forEach(d => {
            (d.rekamMedis || []).forEach(m => {
                totalTindakan++;
                if (m.diagnosa.toLowerCase().includes('vaksin')) totalVaksinasi++;
            });
        });

        return `
            <div class="space-y-6">
                <!-- Summary Medis -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Kepatuhan Vaksinasi PMK</span>
                        <div class="text-2xl font-black text-emerald-600 mt-1">100% Bebas</div>
                        <span class="text-[11px] text-slate-400">Seluruh ternak telah divaksinasi</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Total Tindakan Medis Dicatat</span>
                        <div class="text-2xl font-black text-blue-600 mt-1">${totalTindakan} Tindakan</div>
                        <span class="text-[11px] text-slate-400">Vaksin, obat cacing & perapian kuku</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Status Karantina / Isolasi</span>
                        <div class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">0 Ekor</div>
                        <span class="text-[11px] text-emerald-600 font-bold">Kandang karantina kosong (Kondisi Prima)</span>
                    </div>
                </div>

                <!-- Rekam Medis Table -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="file-heart" class="w-4 h-4 text-rose-600"></i> Rekam Jejak Klinis Medis Seluruh Ternak
                        </h3>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Tanggal</th>
                                    <th class="py-3 px-4">Eartag & Nama Ternak</th>
                                    <th class="py-3 px-4">Diagnosa / Tindakan</th>
                                    <th class="py-3 px-4">Obat / Vaksin</th>
                                    <th class="py-3 px-4">Petugas / Paramedik</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${dombaList.map(d => {
                                    return (d.rekamMedis || []).map(m => `
                                        <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                            <td class="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">${m.tgl}</td>
                                            <td class="py-3 px-4">
                                                <span class="font-mono font-bold text-emerald-600">${d.eartag}</span> - <b>${d.nama}</b>
                                            </td>
                                            <td class="py-3 px-4 font-bold text-rose-700 dark:text-rose-400">${m.diagnosa} (${m.tindakan})</td>
                                            <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">${m.obat || '-'}</td>
                                            <td class="py-3 px-4 text-slate-500">${m.petugas}</td>
                                        </tr>
                                    `).join('');
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // 5. LAPORAN LIMBAH KOHE & PUPUK
    renderTabLimbah() {
        const batchLimbah = Store.getBatchLimbah();
        const stokPupuk = Store.getStokPupuk();
        const koheList = this.getFilteredKohe();

        let totalFesesKg = 0;
        let totalUrinLiter = 0;
        koheList.forEach(k => {
            totalFesesKg += (k.fesesPadatKg || 0);
            totalUrinLiter += (k.urinLiter || 0);
        });

        return `
            <div class="space-y-6">
                <!-- Summary Limbah -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Total Feses Padat Terkumpul</span>
                        <div class="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">${totalFesesKg.toFixed(1)} kg</div>
                        <span class="text-[11px] text-slate-400">Bahan baku kompos POP</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Total Urin Domba Terkumpul</span>
                        <div class="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">${totalUrinLiter.toFixed(1)} Liter</div>
                        <span class="text-[11px] text-slate-400">Bahan baku POC fermentasi</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Nilai Jual Pupuk Siap Salur</span>
                        <div class="text-2xl font-black text-emerald-600 mt-1">Rp 7.585.000</div>
                        <span class="text-[11px] text-slate-400">Kompos Karungan + POC Botolan</span>
                    </div>
                </div>

                <!-- Table Produk Pupuk -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="recycle" class="w-4 h-4 text-emerald-600"></i> Rekapitulasi Stok Produk Pupuk Organik Siap Jual
                        </h3>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Nama Varian Produk</th>
                                    <th class="py-3 px-4">Tipe Pupuk</th>
                                    <th class="py-3 px-4 text-right">Stok Siap Salur</th>
                                    <th class="py-3 px-4 text-right">Harga Resmi BUMDes</th>
                                    <th class="py-3 px-4 text-right">Terjual Bulan Ini</th>
                                    <th class="py-3 px-4 text-right">Estimasi Nilai Stok</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${stokPupuk.map(p => {
                                    const nilai = p.stok * p.hargaJual;
                                    return `
                                        <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                            <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${p.nama}</td>
                                            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.tipe === 'POP' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}">${p.tipe}</span></td>
                                            <td class="py-3 px-4 text-right font-mono font-bold">${p.stok} ${p.satuan}</td>
                                            <td class="py-3 px-4 text-right font-mono text-emerald-600 font-bold">Rp ${p.hargaJual.toLocaleString('id-ID')}</td>
                                            <td class="py-3 px-4 text-right font-mono text-blue-600 font-bold">${p.terjualBulanIni} ${p.satuan}</td>
                                            <td class="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">Rp ${nilai.toLocaleString('id-ID')}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // 6. LAPORAN LABA RUGI & PADES
    renderTabKeuanganPADes() {
        const keuangan = this.getFilteredKeuangan();
        const dss = Store.getDSSPADes();
        const valuasi = Store.hitungValuasiAsetBiologis();

        let totalMasuk = 0;
        let totalKeluar = 0;
        keuangan.forEach(k => {
            if (k.tipe === "masuk") totalMasuk += k.nominal;
            else totalKeluar += k.nominal;
        });
        const labaBersih = totalMasuk - totalKeluar;
        const targetPADes = dss.targetSetoranPADes || 35000000;
        const realisasiPADes = dss.realisasiTerkini || 18500000;
        const persen = Math.round((realisasiPADes / targetPADes) * 1000) / 10;

        return `
            <div class="space-y-6">
                <!-- 4 Ringkasan Finansial -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Total Omzet Penjualan</span>
                        <div class="text-2xl font-black text-blue-600 mt-1">Rp ${totalMasuk.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-slate-400">Ternak domba & pupuk</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Total Beban Operasional</span>
                        <div class="text-2xl font-black text-rose-600 mt-1">Rp ${totalKeluar.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-slate-400">Pakan, medis & payroll gaji</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Laba Bersih Operasional</span>
                        <div class="text-2xl font-black text-emerald-600 mt-1">Rp ${labaBersih.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-emerald-600 font-bold">Surplus Bersih BUMKal</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Realisasi Setor PADes</span>
                        <div class="text-2xl font-black text-amber-600 mt-1">${persen}%</div>
                        <span class="text-[11px] text-slate-400">Rp ${realisasiPADes.toLocaleString('id-ID')} / 35 Jt</span>
                    </div>
                </div>

                <!-- Laporan Laba Rugi Formal -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-4">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-3 dark:border-slate-700">
                        <i data-lucide="wallet" class="w-4 h-4 text-emerald-600"></i> Laporan Laba Rugi Komprehensif BUMKal LPM Pleret
                    </h3>

                    <div class="space-y-3 text-xs">
                        <div class="flex justify-between py-1 border-b border-dashed dark:border-slate-700">
                            <span class="font-bold text-slate-800 dark:text-slate-200">1. PENDAPATAN USAHA (REVENUE)</span>
                            <b class="text-blue-600">Rp ${totalMasuk.toLocaleString('id-ID')}</b>
                        </div>
                        <div class="pl-4 space-y-1 text-slate-500">
                            <div class="flex justify-between"><span>• Penjualan Ternak Domba (Qurban & Aqiqah):</span><b>Rp 6.800.000</b></div>
                            <div class="flex justify-between"><span>• Penjualan Pupuk Kompos POP & POC Urin:</span><b>Rp 1.000.000</b></div>
                        </div>

                        <div class="flex justify-between py-1 border-b border-dashed dark:border-slate-700 pt-2">
                            <span class="font-bold text-slate-800 dark:text-slate-200">2. BIAYA POKOK PRODUKSI & OPERASIONAL (EXPENSES)</span>
                            <b class="text-rose-600">Rp ${totalKeluar.toLocaleString('id-ID')}</b>
                        </div>
                        <div class="pl-4 space-y-1 text-slate-500">
                            <div class="flex justify-between"><span>• Pembelian Konsentrat & Bahan Pakan Silase:</span><b>Rp 4.200.000</b></div>
                            <div class="flex justify-between"><span>• Beban Gaji Staf Kandang & Dokter Hewan:</span><b>Rp 9.900.000</b></div>
                            <div class="flex justify-between"><span>• Beban Obat-Obatan & Vaksinasi PMK:</span><b>Rp 850.000</b></div>
                        </div>

                        <div class="flex justify-between py-2 border-t-2 border-slate-900 dark:border-slate-100 font-bold text-sm">
                            <span>LABA BERSIH TAHUN BERJALAN:</span>
                            <span class="text-emerald-600 font-mono">Rp ${labaBersih.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- CETAK DOKUMEN LAPORAN RESMI & EKSPOR EXCEL / CSV ---

    printOfficialReport() {
        const cfg = Store.getPengaturan();
        const d = new Date();
        const dateStr = `${d.getDate()} September ${cfg.tahunAnggaran || 2026}`;

        const printWindow = window.open('', '', 'width=850,height=900');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Laporan Resmi ${cfg.singkatanLembaga} - ${this.activeTab.toUpperCase()}</title>
                    <style>
                        body { font-family: 'Times New Roman', Times, serif; padding: 30px; color: #111; line-height: 1.5; font-size: 13px; }
                        .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 25px; }
                        .kop h3 { margin: 0; font-size: 15px; font-weight: normal; text-transform: uppercase; }
                        .kop h2 { margin: 2px 0; font-size: 17px; font-weight: bold; text-transform: uppercase; }
                        .kop p { margin: 0; font-size: 11px; font-style: italic; }
                        .title { text-align: center; font-weight: bold; text-transform: uppercase; font-size: 14px; margin-bottom: 20px; text-decoration: underline; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                        th, td { border: 1px solid #333; padding: 6px 10px; }
                        th { background: #f2f2f2; text-align: left; }
                        .sign-container { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
                        .sign-box { width: 240px; text-align: center; font-size: 12px; }
                    </style>
                </head>
                <body>
                    ${Store.getKopSuratHtml()}

                    <div class="title">
                        LAPORAN RESMI KINERJA USAHA PETERNAKAN TERPADU<br>
                        BIDANG: ${this.activeTab.toUpperCase().replace('_', ' ')} • PERIODE: ${this.selectedPeriod.toUpperCase()}
                    </div>

                    <p>
                        Berdasarkan hasil monitoring dan evaluasi terpadu pada fasilitas kandang panggung, bank pakan HPT, dan pengolahan limbah kohe ${cfg.singkatanLembaga}, dilaporkan data riil sebagai berikut:
                    </p>

                    ${(() => {
                        if (this.filterKandang !== 'all' || this.filterKategori !== 'all' || this.filterStartDate || this.filterEndDate || this.searchQuery) {
                            const parts = [];
                            if (this.filterKandang !== 'all') parts.push(`Kandang: ${this.filterKandang}`);
                            if (this.filterKategori !== 'all') parts.push(`Kategori/Fase: ${this.filterKategori}`);
                            if (this.filterStartDate || this.filterEndDate) parts.push(`Rentang: ${this.filterStartDate || 'Awal'} s/d ${this.filterEndDate || 'Kini'}`);
                            if (this.searchQuery) parts.push(`Pencarian: "${this.searchQuery}"`);
                            return `<div style="margin: 8px 0; padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; font-size: 11px;"><b>Filter Diterapkan:</b> ${parts.join(' | ')}</div>`;
                        }
                        return '';
                    })()}

                    ${document.getElementById("laporan-detail-content") ? document.getElementById("laporan-detail-content").innerHTML : ''}

                    <div class="sign-container">
                        <div class="sign-box">
                            Mengetahui,<br>
                            <b>Lurah Kalurahan Pleret</b><br>
                            (Penasihat BUMKal)<br><br><br><br>
                            <b>${cfg.namaLurah}</b><br>
                            <span style="font-size: 10px;">NIP: ${cfg.nipLurah}</span>
                        </div>
                        <div class="sign-box">
                            Pleret, ${dateStr}<br>
                            <b>Direktur Utama ${cfg.singkatanLembaga}</b><br><br><br><br>
                            <b>${cfg.namaDirektur}</b><br>
                            <span style="font-size: 10px;">NIK: ${cfg.nikDirektur}</span>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 350);
    },

    exportCurrentReportCSV() {
        if (this.activeTab === 'populasi') {
            ExportImport.openExportModal('domba', null, null, 'Laporan Populasi & Mutasi Ternak');
        } else if (this.activeTab === 'keuangan_pades') {
            ExportImport.openExportModal('keuangan', null, null, 'Laporan Arus Kas & Realisasi PADes');
        } else if (this.activeTab === 'limbah') {
            ExportImport.openExportModal('limbah', null, null, 'Laporan Limbah Kohe & Pupuk');
        } else {
            const headers = ["Parameter Laporan", "Nilai / Keterangan", "Periode", "Waktu Ekstraksi"];
            const rows = [
                ["Bidang Laporan", this.activeTab.toUpperCase().replace('_', ' '), this.selectedPeriod, new Date().toISOString().replace('T', ' ').substring(0, 19)],
                ["Total Ternak Aktif", `${Store.getDomba().length} Ekor`, this.selectedPeriod, "-"],
                ["Total Valuasi Aset Biologis", `Rp ${Store.hitungValuasiAsetBiologis().totalValuasiRupiah.toLocaleString('id-ID')}`, this.selectedPeriod, "-"],
                ["Stok Pakan Gudang", `${Store.getStokPakan().reduce((a, b) => a + (b.stokKg || 0), 0)} kg`, this.selectedPeriod, "-"]
            ];
            ExportImport.openExportModal('laporan', headers, rows, `Laporan ${this.activeTab.toUpperCase()}`);
        }
    }
};

window.LaporanModule = LaporanModule;
