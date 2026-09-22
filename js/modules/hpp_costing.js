/**
 * Modul Perhitungan HPP Riil per Ekor (Unit Costing Domba & Analisis Margin Laba Bersih)
 * BUMKal Lumbung Pangan Mataram, Kalurahan Pleret
 * Rumus Otomatis:
 * HPP Total = Harga Beli Bakalan + (Hari Pemeliharaan * HPP Pakan/Hari) + Biaya Medis/Vaksin + Overhead
 * Net Profit = Estimasi Harga Jual - HPP Total
 */

const HppCostingModule = {
    filterKategori: "all",
    filterKandang: "all",
    searchQuery: "",
    customHargaPerKg: 75000,
    customHppPakan: 5500,

    render() {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const cfg = Store.getHPPConfig ? Store.getHPPConfig() : {};
        const sysCfg = Store.getPengaturan ? Store.getPengaturan() : {};
        if (!this.customHargaPerKg) this.customHargaPerKg = cfg.hargaDagingHidupPerKg || sysCfg.hargaDagingHidupPerKg || 75000;
        if (!this.customHppPakan) this.customHppPakan = cfg.hppPakanPerHari || 5500;

        // Filter data ternak aktif (abaikan yang mati)
        let list = dombaList.filter(d => d.status !== "Mati");

        if (this.filterKategori !== "all") {
            list = list.filter(d => (d.kategori || '').toLowerCase() === this.filterKategori.toLowerCase());
        }
        if (this.filterKandang !== "all") {
            list = list.filter(d => (d.kandang || '').toLowerCase().includes(this.filterKandang.toLowerCase()));
        }
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            list = list.filter(d => (d.eartag || '').toLowerCase().includes(q) || (d.nama || '').toLowerCase().includes(q) || (d.ras || '').toLowerCase().includes(q));
        }

        // Kalkulasi HPP untuk seluruh ternak yang difilter
        const costingData = list.map(d => {
            const costing = Store.hitungHPPUnitDomba(d, {
                hppPakanPerHari: this.customHppPakan,
                hargaDagingHidupPerKg: this.customHargaPerKg,
                biayaMedisPerTindakan: cfg.biayaMedisPerTindakan || 25000,
                biayaMedisStandar: cfg.biayaMedisStandar || 35000,
                overheadPerHari: cfg.overheadPerHari || 1000
            });
            return { domba: d, costing };
        });

        // Agregat Metrik KPI
        const totalEkor = costingData.length;
        const totalBeli = costingData.reduce((acc, c) => acc + c.costing.hargaBeli, 0);
        const totalPakan = costingData.reduce((acc, c) => acc + c.costing.totalBiayaPakan, 0);
        const totalMedis = costingData.reduce((acc, c) => acc + c.costing.biayaMedis, 0);
        const totalOverhead = costingData.reduce((acc, c) => acc + c.costing.totalOverhead, 0);
        const grandTotalHPP = costingData.reduce((acc, c) => acc + c.costing.hppTotal, 0);
        const grandTotalEstimasiJual = costingData.reduce((acc, c) => acc + c.costing.estimasiHargaJual, 0);
        const grandTotalLabaBersih = grandTotalEstimasiJual - grandTotalHPP;
        const avgHPPPerEkor = totalEkor > 0 ? Math.round(grandTotalHPP / totalEkor) : 0;
        const avgMarginPersen = grandTotalHPP > 0 ? Math.round((grandTotalLabaBersih / grandTotalHPP) * 1000) / 10 : 0;

        return `
            <div class="space-y-6">
                <!-- Header Banner -->
                <div class="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="space-y-1.5">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                            <i data-lucide="calculator" class="w-4 h-4"></i> Unit Costing & Profit Margin Realtime
                        </div>
                        <h2 class="text-2xl font-black">Perhitungan HPP Riil per Ekor</h2>
                        <p class="text-xs text-emerald-100/80 max-w-2xl font-normal leading-relaxed">
                            Menganalisis modal riil akumulatif (beli bakalan + pakan harian + medis + overhead) serta proyeksi margin laba bersih aktual ternak saat dijual.
                        </p>
                    </div>

                    <div class="flex flex-wrap items-center gap-2.5">
                        <button onclick="HppCostingModule.openModalTarif()" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 backdrop-blur-sm">
                            <i data-lucide="sliders" class="w-4 h-4"></i> Konfigurasi Komponen Biaya
                        </button>
                        <button onclick="HppCostingModule.exportCSV()" class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center gap-1.5">
                            <i data-lucide="download" class="w-4 h-4"></i> Ekspor CSV
                        </button>
                    </div>
                </div>

                <!-- 4 KPI Summary Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <div class="flex items-center justify-between text-slate-500 mb-1">
                            <span class="text-xs font-semibold">Total Modal Berjalan (HPP)</span>
                            <div class="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                <i data-lucide="wallet" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-black text-slate-900 dark:text-white">Rp ${grandTotalHPP.toLocaleString('id-ID')}</div>
                        <p class="text-[11px] text-slate-400 mt-1">Akumulasi ${totalEkor} ekor ternak aktif</p>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <div class="flex items-center justify-between text-slate-500 mb-1">
                            <span class="text-xs font-semibold">Rata-Rata HPP / Ekor</span>
                            <div class="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                                <i data-lucide="scale" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-black text-blue-600">Rp ${avgHPPPerEkor.toLocaleString('id-ID')}</div>
                        <p class="text-[11px] text-slate-400 mt-1">Modal per ekor sampai hari ini</p>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <div class="flex items-center justify-between text-slate-500 mb-1">
                            <span class="text-xs font-semibold">Proyeksi Nilai Jual Total</span>
                            <div class="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-black text-amber-600">Rp ${grandTotalEstimasiJual.toLocaleString('id-ID')}</div>
                        <p class="text-[11px] text-slate-400 mt-1">Berdasarkan Rp ${this.customHargaPerKg.toLocaleString('id-ID')} / kg bobot hidup</p>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <div class="flex items-center justify-between text-slate-500 mb-1">
                            <span class="text-xs font-semibold">Proyeksi Laba Bersih</span>
                            <div class="p-2 rounded-xl ${grandTotalLabaBersih >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                                <i data-lucide="trending-up" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-black ${grandTotalLabaBersih >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
                            ${grandTotalLabaBersih >= 0 ? '+' : ''}Rp ${grandTotalLabaBersih.toLocaleString('id-ID')}
                        </div>
                        <p class="text-[11px] font-bold ${grandTotalLabaBersih >= 0 ? 'text-emerald-600' : 'text-rose-600'} mt-1">
                            Margin Bersih: ${avgMarginPersen}%
                        </p>
                    </div>
                </div>

                <!-- Simulator Interaktif Live Target Harga & Biaya Pakan -->
                <div class="bg-emerald-50/60 dark:bg-slate-800/80 rounded-2xl border border-emerald-200 dark:border-slate-700 p-5 space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-slate-700 pb-3">
                        <div class="flex items-center gap-2">
                            <span class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                                🎛️
                            </span>
                            <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">Simulasi Interaktif Margin & Harga Pasar</h3>
                        </div>
                        <button onclick="HppCostingModule.resetSimulator()" class="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline self-start">
                            Reset ke Standar Sistem
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                        <div class="space-y-1.5">
                            <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                <span>Target Harga Jual Daging Hidup / kg:</span>
                                <span class="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono text-sm">
                                    Rp ${Number(this.customHargaPerKg).toLocaleString('id-ID')} / kg
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="50000" 
                                max="110000" 
                                step="1000" 
                                value="${this.customHargaPerKg}"
                                oninput="HppCostingModule.onSliderHargaChange(this.value)"
                                class="w-full h-2 bg-emerald-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            >
                            <div class="flex justify-between text-[10px] text-slate-400 font-medium">
                                <span>Rp 50.000 (Pasar Normal)</span>
                                <span>Rp 75.000 (Standar BUMKal)</span>
                                <span>Rp 110.000 (Puncak Idul Adha)</span>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                                <span>Biaya Pakan Harian / Ekor / Hari:</span>
                                <span class="text-blue-600 dark:text-blue-400 font-extrabold font-mono text-sm">
                                    Rp ${Number(this.customHppPakan).toLocaleString('id-ID')} / hari
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="3000" 
                                max="10000" 
                                step="250" 
                                value="${this.customHppPakan}"
                                oninput="HppCostingModule.onSliderPakanChange(this.value)"
                                class="w-full h-2 bg-blue-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            >
                            <div class="flex justify-between text-[10px] text-slate-400 font-medium">
                                <span>Rp 3.000 (Full Odot Mandiri)</span>
                                <span>Rp 5.500 (Ransum Standar)</span>
                                <span>Rp 10.000 (Konsentrat Intensif)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filter & Controls -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div class="flex-1 max-w-sm relative">
                        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                        <input 
                            type="text" 
                            placeholder="Cari Eartag, Nama, atau Ras Domba..." 
                            value="${this.searchQuery}"
                            oninput="HppCostingModule.onSearch(this.value)"
                            class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                        >
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <select onchange="HppCostingModule.onFilterKategori(this.value)" class="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                            <option value="all" ${this.filterKategori === 'all' ? 'selected' : ''}>Semua Kategori</option>
                            <option value="Fattening" ${this.filterKategori === 'Fattening' ? 'selected' : ''}>Fattening (Penggemukan)</option>
                            <option value="Pejantan" ${this.filterKategori === 'Pejantan' ? 'selected' : ''}>Pejantan</option>
                            <option value="Indukan" ${this.filterKategori === 'Indukan' ? 'selected' : ''}>Indukan</option>
                            <option value="Dara" ${this.filterKategori === 'Dara' ? 'selected' : ''}>Dara</option>
                            <option value="Cempe" ${this.filterKategori === 'Cempe' ? 'selected' : ''}>Cempe</option>
                        </select>

                        <select onchange="HppCostingModule.onFilterKandang(this.value)" class="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                            <option value="all" ${this.filterKandang === 'all' ? 'selected' : ''}>Semua Kandang</option>
                            <option value="Kandang A" ${this.filterKandang === 'Kandang A' ? 'selected' : ''}>Kandang A</option>
                            <option value="Kandang B" ${this.filterKandang === 'Kandang B' ? 'selected' : ''}>Kandang B</option>
                            <option value="Kandang C" ${this.filterKandang === 'Kandang C' ? 'selected' : ''}>Kandang C</option>
                        </select>
                    </div>
                </div>

                <!-- Unit Costing Table -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-3">Ternak</th>
                                    <th class="py-3 px-3">Kandang / Sekat</th>
                                    <th class="py-3 px-3 text-center">Hari Rawat</th>
                                    <th class="py-3 px-3 text-right">Harga Beli</th>
                                    <th class="py-3 px-3 text-right">Biaya Pakan</th>
                                    <th class="py-3 px-3 text-right">Medis & OH</th>
                                    <th class="py-3 px-3 text-right font-black">HPP Total</th>
                                    <th class="py-3 px-3 text-right">Bobot (kg)</th>
                                    <th class="py-3 px-3 text-right">Estimasi Jual</th>
                                    <th class="py-3 px-3 text-right font-black">Laba Bersih</th>
                                    <th class="py-3 px-3 text-center">Margin</th>
                                    <th class="py-3 px-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${costingData.length === 0 ? `
                                    <tr>
                                        <td colspan="12" class="py-10 text-center text-slate-400 italic">
                                            Tidak ada data ternak yang cocok dengan kriteria filter.
                                        </td>
                                    </tr>
                                ` : costingData.map(item => {
                                    const d = item.domba;
                                    const c = item.costing;
                                    const isProfit = c.labaBersih >= 0;
                                    return `
                                        <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition">
                                            <td class="py-2.5 px-3">
                                                <div class="flex items-center gap-2">
                                                    <img src="${d.foto}" alt="${d.nama}" class="w-9 h-9 rounded-lg object-cover border shrink-0">
                                                    <div>
                                                        <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                                            <span class="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white font-mono">${d.eartag}</span>
                                                            <span class="truncate max-w-[110px]">${d.nama}</span>
                                                        </div>
                                                        <div class="text-[10px] text-slate-400">${d.ras} • ${d.kategori}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                                                <div class="font-semibold">${d.kandang.split('(')[0]}</div>
                                                <div class="text-[10px] text-slate-400">${d.sekat}</div>
                                            </td>
                                            <td class="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                                ${c.hariPemeliharaan} hr
                                                <div class="text-[9px] text-slate-400 font-normal">Msk: ${d.tglMasuk || '-'}</div>
                                            </td>
                                            <td class="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                                                Rp ${c.hargaBeli.toLocaleString('id-ID')}
                                            </td>
                                            <td class="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                                                Rp ${c.totalBiayaPakan.toLocaleString('id-ID')}
                                            </td>
                                            <td class="py-2.5 px-3 text-right font-mono text-slate-500">
                                                Rp ${(c.biayaMedis + c.totalOverhead).toLocaleString('id-ID')}
                                            </td>
                                            <td class="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/30">
                                                Rp ${c.hppTotal.toLocaleString('id-ID')}
                                            </td>
                                            <td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                ${c.latestWeight.toFixed(2)}
                                            </td>
                                            <td class="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                Rp ${c.estimasiHargaJual.toLocaleString('id-ID')}
                                            </td>
                                            <td class="py-2.5 px-3 text-right font-mono font-black ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
                                                ${isProfit ? '+' : ''}Rp ${c.labaBersih.toLocaleString('id-ID')}
                                            </td>
                                            <td class="py-2.5 px-3 text-center font-mono font-bold">
                                                <span class="px-2 py-0.5 rounded-full text-[10px] ${isProfit ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'}">
                                                    ${c.marginPersen}%
                                                </span>
                                            </td>
                                            <td class="py-2.5 px-3 text-center">
                                                <button onclick="HppCostingModule.openModalDetail('${d.id}')" title="Lihat Rincian Biaya" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 transition">
                                                    <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                                                </button>
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

    onSliderHargaChange(val) {
        this.customHargaPerKg = parseInt(val, 10);
        App.renderContent();
    },

    onSliderPakanChange(val) {
        this.customHppPakan = parseInt(val, 10);
        App.renderContent();
    },

    resetSimulator() {
        const cfg = Store.getHPPConfig ? Store.getHPPConfig() : {};
        const sysCfg = Store.getPengaturan ? Store.getPengaturan() : {};
        this.customHargaPerKg = cfg.hargaDagingHidupPerKg || sysCfg.hargaDagingHidupPerKg || 75000;
        this.customHppPakan = cfg.hppPakanPerHari || 5500;
        App.renderContent();
    },

    onFilterKategori(val) {
        this.filterKategori = val;
        App.renderContent();
    },

    onFilterKandang(val) {
        this.filterKandang = val;
        App.renderContent();
    },

    onSearch(val) {
        this.searchQuery = val;
        App.renderContent();
    },

    openModalDetail(dombaId) {
        const d = Store.getDomba().find(item => item.id === dombaId);
        if (!d) return;

        const costing = Store.hitungHPPUnitDomba(d, {
            hppPakanPerHari: this.customHppPakan,
            hargaDagingHidupPerKg: this.customHargaPerKg
        });

        const isProfit = costing.labaBersih >= 0;

        App.setModalContent(`
            <div class="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
                <div class="flex items-start justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <img src="${d.foto}" class="w-12 h-12 rounded-xl object-cover border">
                        <div>
                            <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">RINCIAN UNIT COSTING TERNAK</span>
                            <h3 class="text-base font-black text-slate-900 dark:text-white">${d.eartag} - ${d.nama}</h3>
                            <p class="text-xs text-slate-500">${d.ras} • ${d.kategori} • ${d.sekat}</p>
                        </div>
                    </div>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <!-- Breakdown Cards -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
                        <span class="text-[10px] text-slate-400">Harga Beli Bakalan</span>
                        <div class="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">Rp ${costing.hargaBeli.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
                        <span class="text-[10px] text-slate-400">Total Biaya Pakan</span>
                        <div class="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">Rp ${costing.totalBiayaPakan.toLocaleString('id-ID')}</div>
                        <span class="text-[9px] text-slate-400">${costing.hariPemeliharaan} hr × Rp ${costing.hppPakanHarian.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
                        <span class="text-[10px] text-slate-400">Biaya Medis & Obat</span>
                        <div class="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">Rp ${costing.biayaMedis.toLocaleString('id-ID')}</div>
                        <span class="text-[9px] text-slate-400">${costing.countMedis} tindakan klinis</span>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
                        <span class="text-[10px] text-slate-400">Alokasi Overhead</span>
                        <div class="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">Rp ${costing.totalOverhead.toLocaleString('id-ID')}</div>
                        <span class="text-[9px] text-slate-400">Listrik, sewa & nakes</span>
                    </div>
                </div>

                <!-- Total HPP vs Estimasi Jual -->
                <div class="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
                    <div class="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                        <span>Total Beban Modal (HPP Riil):</span>
                        <span class="font-mono font-black text-base">Rp ${costing.hppTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                        <span>Estimasi Nilai Jual (${costing.latestWeight.toFixed(2)} kg × Rp ${costing.hargaPerKg.toLocaleString('id-ID')}):</span>
                        <span class="font-mono font-black text-base text-amber-400">Rp ${costing.estimasiHargaJual.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm pt-1">
                        <span class="font-bold">Estimasi Laba Bersih Aktual:</span>
                        <div class="text-right">
                            <span class="font-mono font-black text-lg ${isProfit ? 'text-emerald-400' : 'text-rose-400'}">
                                ${isProfit ? '+' : ''}Rp ${costing.labaBersih.toLocaleString('id-ID')}
                            </span>
                            <span class="block text-[11px] ${isProfit ? 'text-emerald-300' : 'text-rose-300'}">Margin: ${costing.marginPersen}%</span>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end pt-2">
                    <button onclick="App.closeModal()" class="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold">
                        Tutup
                    </button>
                </div>
            </div>
        `);
        App.openModal();
    },

    openModalTarif() {
        const cfg = Store.getHPPConfig ? Store.getHPPConfig() : {};
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="sliders" class="w-5 h-5 text-emerald-600"></i> Konfigurasi Komponen Biaya HPP
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="HppCostingModule.submitTarif(event)" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Standar HPP Pakan / Ekor / Hari (Rp) *</label>
                        <input type="number" id="hpp-pakan-cfg" required value="${cfg.hppPakanPerHari || 5500}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        <p class="text-[11px] text-slate-400 mt-1">Rata-rata biaya gabungan pakan konsentrat, silase, dan rumput odot.</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Biaya Medis Standar (Rp) *</label>
                            <input type="number" id="hpp-medis-std-cfg" required value="${cfg.biayaMedisStandar || 35000}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                            <p class="text-[10px] text-slate-400 mt-1">Obat cacing & vitamin awal.</p>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Biaya per Tindakan Medis (Rp) *</label>
                            <input type="number" id="hpp-medis-act-cfg" required value="${cfg.biayaMedisPerTindakan || 25000}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                            <p class="text-[10px] text-slate-400 mt-1">Biaya per rekam medis.</p>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alokasi Overhead / Ekor / Hari (Rp) *</label>
                        <input type="number" id="hpp-overhead-cfg" required value="${cfg.overheadPerHari || 1000}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        <p class="text-[11px] text-slate-400 mt-1">Proporsi listrik kandang, air bersih, operasional dan sewa lahan.</p>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">Simpan Komponen Biaya</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTarif(e) {
        e.preventDefault();
        const pakan = parseFloat(document.getElementById("hpp-pakan-cfg").value) || 5500;
        const medisStd = parseFloat(document.getElementById("hpp-medis-std-cfg").value) || 35000;
        const medisAct = parseFloat(document.getElementById("hpp-medis-act-cfg").value) || 25000;
        const overhead = parseFloat(document.getElementById("hpp-overhead-cfg").value) || 1000;

        const newCfg = {
            hppPakanPerHari: pakan,
            biayaMedisStandar: medisStd,
            biayaMedisPerTindakan: medisAct,
            overheadPerHari: overhead,
            hargaDagingHidupPerKg: this.customHargaPerKg
        };

        Store.saveHPPConfig(newCfg);
        this.customHppPakan = pakan;
        App.closeModal();
        App.showToast("Komponen biaya HPP berhasil diperbarui!", "success");
        App.renderContent();
    },

    exportCSV() {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const cfg = Store.getHPPConfig ? Store.getHPPConfig() : {};
        const costingData = dombaList.filter(d => d.status !== "Mati").map(d => {
            const c = Store.hitungHPPUnitDomba(d, {
                hppPakanPerHari: this.customHppPakan,
                hargaDagingHidupPerKg: this.customHargaPerKg
            });
            return {
                eartag: d.eartag,
                nama: d.nama,
                ras: d.ras,
                kategori: d.kategori,
                kandang: d.kandang,
                sekat: d.sekat,
                tglMasuk: d.tglMasuk || "-",
                hariPemeliharaan: c.hariPemeliharaan,
                hargaBeli: c.hargaBeli,
                totalBiayaPakan: c.totalBiayaPakan,
                biayaMedis: c.biayaMedis,
                totalOverhead: c.totalOverhead,
                hppTotal: c.hppTotal,
                bobotTerkini: c.latestWeight,
                hargaPerKg: c.hargaPerKg,
                estimasiHargaJual: c.estimasiHargaJual,
                labaBersih: c.labaBersih,
                marginPersen: c.marginPersen
            };
        });

        const headers = [
            "Eartag", "Nama Domba", "Ras", "Kategori", "Kandang", "Sekat", "Tgl Masuk",
            "Hari Pemeliharaan", "Harga Beli (Rp)", "Biaya Pakan (Rp)", "Biaya Medis (Rp)",
            "Overhead (Rp)", "HPP Total (Rp)", "Bobot Terkini (kg)", "Harga per Kg (Rp)",
            "Estimasi Jual (Rp)", "Laba Bersih (Rp)", "Margin (%)"
        ];

        let csv = headers.join(";") + "\n";
        costingData.forEach(row => {
            csv += [
                row.eartag,
                `"${row.nama}"`,
                `"${row.ras}"`,
                row.kategori,
                `"${row.kandang}"`,
                row.sekat,
                row.tglMasuk,
                row.hariPemeliharaan,
                row.hargaBeli,
                row.totalBiayaPakan,
                row.biayaMedis,
                row.totalOverhead,
                row.hppTotal,
                row.bobotTerkini,
                row.hargaPerKg,
                row.estimasiHargaJual,
                row.labaBersih,
                row.marginPersen
            ].join(";") + "\n";
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `HPP_Unit_Costing_Domba_BUMKal_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        App.showToast("Ekspor data HPP berhasil diunduh!", "success");
    }
};

window.HppCostingModule = HppCostingModule;
