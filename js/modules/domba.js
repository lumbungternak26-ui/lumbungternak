/**
 * Modul Manajemen Ternak Domba Lengkap
 * Mencakup Eartag, Bobot & ADG, Rekam Medis, Breeding, dan Cetak QR Code
 */

const DombaModule = {
    activeFilterKandang: "all",
    activeFilterRas: "all",
    activeFilterKategori: "all",
    activeFilterStatus: "all",
    activeFilterWarnaTag: "all",
    searchQuery: "",
    viewMode: "grid", // "grid" | "table"

    getWarnaTagBadge(warna = "Kuning", eartag = "") {
        const w = (warna || "Kuning").toLowerCase();
        let bg = "bg-amber-400 text-slate-950 border-amber-500";
        let dot = "bg-amber-800";
        if (w.includes("hijau")) {
            bg = "bg-emerald-600 text-white border-emerald-700";
            dot = "bg-emerald-200";
        } else if (w.includes("merah")) {
            bg = "bg-rose-600 text-white border-rose-700";
            dot = "bg-rose-200";
        } else if (w.includes("biru")) {
            bg = "bg-blue-600 text-white border-blue-700";
            dot = "bg-blue-200";
        } else if (w.includes("oranye") || w.includes("orange")) {
            bg = "bg-orange-500 text-white border-orange-600";
            dot = "bg-orange-200";
        } else if (w.includes("putih")) {
            bg = "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600";
            dot = "bg-slate-500";
        }
        return `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm border ${bg}">
                <span class="w-2 h-2 rounded-full ${dot} shrink-0"></span>
                <span>${eartag}</span>
                <span class="text-[9px] uppercase tracking-wider opacity-90 font-bold">(${warna || 'Kuning'})</span>
            </span>
        `;
    },

    getWarnaEartagOptionsHtml(selectedWarna = "Kuning") {
        const options = [
            { val: "Kuning", label: "🟡 Kuning" },
            { val: "Hijau", label: "🟢 Hijau" },
            { val: "Merah", label: "🔴 Merah" },
            { val: "Biru", label: "🔵 Biru" },
            { val: "Oranye", label: "🟠 Oranye" },
            { val: "Putih", label: "⚪ Putih" }
        ];
        return options.map(o => `<option value="${o.val}" ${selectedWarna === o.val ? 'selected' : ''}>${o.label}</option>`).join('');
    },

    getRasOptionsHtml(selectedRas = "") {
        const rasList = Store.getRasTernak();
        const dombaGroup = rasList.filter(r => (r.kategori || '').toLowerCase() === 'domba');
        const kambingGroup = rasList.filter(r => (r.kategori || '').toLowerCase() === 'kambing');
        const otherGroup = rasList.filter(r => (r.kategori || '').toLowerCase() !== 'domba' && (r.kategori || '').toLowerCase() !== 'kambing');

        let html = '';
        if (dombaGroup.length > 0) {
            html += `<optgroup label="Ras Domba">`;
            dombaGroup.forEach(r => {
                html += `<option value="${r.nama}" ${r.nama === selectedRas ? 'selected' : ''}>${r.nama}</option>`;
            });
            html += `</optgroup>`;
        }
        if (kambingGroup.length > 0) {
            html += `<optgroup label="Ras Kambing">`;
            kambingGroup.forEach(r => {
                html += `<option value="${r.nama}" ${r.nama === selectedRas ? 'selected' : ''}>${r.nama}</option>`;
            });
            html += `</optgroup>`;
        }
        if (otherGroup.length > 0) {
            html += `<optgroup label="Lainnya">`;
            otherGroup.forEach(r => {
                html += `<option value="${r.nama}" ${r.nama === selectedRas ? 'selected' : ''}>${r.nama}</option>`;
            });
            html += `</optgroup>`;
        }
        return html;
    },

    getSuplierOptionsHtml(selectedValue = "") {
        const supliers = (Store.getSuplier ? Store.getSuplier() : []).filter(s => s.status !== 'Nonaktif');
        let html = `<option value="">-- Pilih Asal Suplier / Mitra --</option>`;
        let matchFound = false;

        supliers.forEach(s => {
            const isSel = (s.nama === selectedValue);
            if (isSel) matchFound = true;
            html += `<option value="${s.nama}" ${isSel ? 'selected' : ''}>${s.nama} (${s.kategori} - ${s.kota})</option>`;
        });

        const isCustom = selectedValue && !matchFound;
        html += `<option value="LAINNYA" ${isCustom ? 'selected' : ''}>➕ Lainnya / Input Manual...</option>`;
        return html;
    },

    isCustomSuplier(val) {
        if (!val) return false;
        const supliers = (Store.getSuplier ? Store.getSuplier() : []);
        return !supliers.some(s => s.nama === val);
    },

    handleSuplierChange(selectEl, customInputId) {
        const customInput = document.getElementById(customInputId);
        if (!customInput) return;
        if (selectEl.value === "LAINNYA") {
            customInput.classList.remove("hidden");
            customInput.required = true;
            customInput.focus();
        } else {
            customInput.classList.add("hidden");
            customInput.required = false;
            customInput.value = "";
        }
    },

    render() {
        let list = Store.getDomba();

        // Terapkan Filter & Pencarian
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

        if (this.activeFilterKandang !== "all") {
            list = list.filter(d => (d.kandang || '').includes(this.activeFilterKandang));
        }
        if (this.activeFilterRas !== "all") {
            list = list.filter(d => (d.ras || '').toLowerCase().includes(this.activeFilterRas.toLowerCase()));
        }
        if (this.activeFilterKategori !== "all") {
            list = list.filter(d => d.kategori === this.activeFilterKategori);
        }
        if (this.activeFilterStatus !== "all") {
            list = list.filter(d => d.status === this.activeFilterStatus);
        }
        if (this.activeFilterWarnaTag !== "all") {
            list = list.filter(d => (d.warnaEartag || 'Kuning').toLowerCase() === this.activeFilterWarnaTag.toLowerCase());
        }

        const totalSemua = Store.getDomba().length;
        const totalPejantan = Store.getDomba().filter(d => d.kategori === "Pejantan").length;
        const totalBunting = Store.getDomba().filter(d => d.status === "Bunting").length;
        const totalCempe = Store.getDomba().filter(d => d.kategori === "Cempe").length;
        const totalFattening = Store.getDomba().filter(d => d.kategori === "Fattening").length;

        return `
            <div class="space-y-6">
                <!-- Header & Quick Actions -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                            <i data-lucide="tag" class="w-3.5 h-3.5"></i> Master Data Ternak
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Inventaris & Pemuliaan Ternak Domba</h2>
                        <p class="text-xs text-slate-500">Pencatatan silsilah, pertumbuhan bobot harian (ADG), status reproduksi, dan kartu rekam medis.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button onclick="ExportImport.exportCSV('domba')" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                            <i data-lucide="download" class="w-4 h-4"></i> Export CSV
                        </button>
                        <button onclick="DombaModule.openModalKawin()" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition">
                            <i data-lucide="heart" class="w-4 h-4"></i> Kawin / Breeding
                        </button>
                        <button onclick="App.openModal('modal-timbang')" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition">
                            <i data-lucide="scale" class="w-4 h-4"></i> Timbang Cepat
                        </button>
                        <button onclick="DombaModule.openModalTambah()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Tambah Domba
                        </button>
                    </div>
                </div>

                <!-- MINI STATS BAR -->
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <span class="text-[11px] text-slate-500 font-medium">Total Terdaftar</span>
                        <div class="text-xl font-bold text-slate-800 dark:text-white mt-0.5">${totalSemua} ekor</div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <span class="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Pejantan Pemacek</span>
                        <div class="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">${totalPejantan} ekor</div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <span class="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Indukan Bunting</span>
                        <div class="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">${totalBunting} ekor</div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Cempe Menyusui</span>
                        <div class="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">${totalCempe} ekor</div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <span class="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Batch Fattening</span>
                        <div class="text-xl font-bold text-purple-700 dark:text-purple-300 mt-0.5">${totalFattening} ekor</div>
                    </div>
                </div>

                <!-- FILTER CONTROLS & SEARCH BAR -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
                    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        <!-- Search Box -->
                        <div class="relative flex-1">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                            <input 
                                type="text" 
                                placeholder="Cari kode eartag, nama domba, atau ras..." 
                                value="${this.searchQuery}"
                                oninput="DombaModule.onSearch(this.value)"
                                class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >
                        </div>

                        <!-- View Mode Toggle -->
                        <div class="flex items-center gap-1.5 self-end md:self-auto">
                            <span class="text-xs text-slate-500 mr-1">Tampilan:</span>
                            <button onclick="DombaModule.setViewMode('grid')" class="p-2 rounded-lg border ${this.viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'}">
                                <i data-lucide="grid" class="w-4 h-4"></i>
                            </button>
                            <button onclick="DombaModule.setViewMode('table')" class="p-2 rounded-lg border ${this.viewMode === 'table' ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'}">
                                <i data-lucide="list" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Filter Dropdowns & Pills -->
                    <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span class="text-slate-500 font-medium">Filter:</span>
                        
                        <!-- Kandang Filter -->
                        <select onchange="DombaModule.setFilter('kandang', this.value)" class="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500">
                            <option value="all" ${this.activeFilterKandang === 'all' ? 'selected' : ''}>Semua Kandang</option>
                            <option value="Kandang A" ${this.activeFilterKandang === 'Kandang A' ? 'selected' : ''}>Kandang A (Pejantan & Fattening)</option>
                            <option value="Kandang B" ${this.activeFilterKandang === 'Kandang B' ? 'selected' : ''}>Kandang B (Induk & Koloni)</option>
                            <option value="Kandang C" ${this.activeFilterKandang === 'Kandang C' ? 'selected' : ''}>Kandang C (Karantina)</option>
                        </select>

                        <!-- Kategori Filter -->
                        <select onchange="DombaModule.setFilter('kategori', this.value)" class="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500">
                            <option value="all" ${this.activeFilterKategori === 'all' ? 'selected' : ''}>Semua Fase</option>
                            <option value="Pejantan" ${this.activeFilterKategori === 'Pejantan' ? 'selected' : ''}>Pejantan</option>
                            <option value="Indukan" ${this.activeFilterKategori === 'Indukan' ? 'selected' : ''}>Indukan</option>
                            <option value="Dara" ${this.activeFilterKategori === 'Dara' ? 'selected' : ''}>Dara</option>
                            <option value="Cempe" ${this.activeFilterKategori === 'Cempe' ? 'selected' : ''}>Cempe</option>
                            <option value="Fattening" ${this.activeFilterKategori === 'Fattening' ? 'selected' : ''}>Fattening (Penggemukan)</option>
                        </select>

                        <!-- Status Filter -->
                        <select onchange="DombaModule.setFilter('status', this.value)" class="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500">
                            <option value="all" ${this.activeFilterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
                            <option value="Sehat" ${this.activeFilterStatus === 'Sehat' ? 'selected' : ''}>Sehat Prima</option>
                            <option value="Bunting" ${this.activeFilterStatus === 'Bunting' ? 'selected' : ''}>Bunting</option>
                            <option value="Laktasi" ${this.activeFilterStatus === 'Laktasi' ? 'selected' : ''}>Laktasi</option>
                            <option value="Karantina" ${this.activeFilterStatus === 'Karantina' ? 'selected' : ''}>Karantina</option>
                        </select>

                        <!-- Warna Tag Filter -->
                        <select onchange="DombaModule.setFilter('warnaTag', this.value)" class="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 font-medium">
                            <option value="all" ${this.activeFilterWarnaTag === 'all' ? 'selected' : ''}>🏷️ Semua Warna Tag</option>
                            <option value="Kuning" ${this.activeFilterWarnaTag === 'Kuning' ? 'selected' : ''}>🟡 Kuning</option>
                            <option value="Hijau" ${this.activeFilterWarnaTag === 'Hijau' ? 'selected' : ''}>🟢 Hijau</option>
                            <option value="Merah" ${this.activeFilterWarnaTag === 'Merah' ? 'selected' : ''}>🔴 Merah</option>
                            <option value="Biru" ${this.activeFilterWarnaTag === 'Biru' ? 'selected' : ''}>🔵 Biru</option>
                            <option value="Oranye" ${this.activeFilterWarnaTag === 'Oranye' ? 'selected' : ''}>🟠 Oranye</option>
                            <option value="Putih" ${this.activeFilterWarnaTag === 'Putih' ? 'selected' : ''}>⚪ Putih</option>
                        </select>

                        ${(this.searchQuery || this.activeFilterKandang !== 'all' || this.activeFilterKategori !== 'all' || this.activeFilterStatus !== 'all' || this.activeFilterWarnaTag !== 'all') ? `
                            <button onclick="DombaModule.resetFilter()" class="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline ml-auto">
                                Reset Filter
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- DOMBA LISTINGS: GRID VIEW -->
                ${this.viewMode === 'grid' ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        ${list.length === 0 ? `
                            <div class="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <i data-lucide="tag" class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3"></i>
                                <h4 class="text-base font-bold text-slate-700 dark:text-slate-300">Tidak ada domba yang cocok</h4>
                                <p class="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter di atas.</p>
                            </div>
                        ` : list.map(d => {
                            const latestWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                            const statusColor = d.status === 'Sehat' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                                d.status === 'Bunting' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                                d.status === 'Laktasi' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                                'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
                            
                            return `
                                <div class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <!-- Card Header Image & Badge -->
                                        <div class="relative h-40 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                            <img src="${d.foto}" alt="${d.nama}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                            
                                            <!-- Eartag Badge with Color -->
                                            <div class="absolute top-3 left-3">
                                                ${this.getWarnaTagBadge(d.warnaEartag, d.eartag)}
                                            </div>

                                            <!-- Status Badge -->
                                            <div class="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold shadow ${statusColor}">
                                                ${d.status}
                                            </div>

                                            <!-- Name on overlay -->
                                            <div class="absolute bottom-2.5 left-3 right-3 text-white">
                                                <h4 class="font-bold text-sm leading-snug drop-shadow">${d.nama}</h4>
                                                <div class="text-[11px] text-slate-200 drop-shadow flex items-center gap-1.5">
                                                    <span>${d.ras}</span>
                                                    <span>•</span>
                                                    <span>${d.kelamin}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Card Body Details -->
                                        <div class="p-4 space-y-2.5 text-xs">
                                            <div class="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                                                <span class="text-slate-500">Kandang / Sekat:</span>
                                                <span class="font-semibold text-slate-800 dark:text-slate-200">${d.sekat} (${d.kandang.split('(')[0].trim()})</span>
                                            </div>
                                            <div class="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                                                <span class="text-slate-500">Bobot Terkini:</span>
                                                <span class="font-bold text-base text-emerald-600 dark:text-emerald-400">${latestWeight} kg</span>
                                            </div>
                                            <div class="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                                                <span class="text-slate-400">Tgl & Bobot Masuk:</span>
                                                <span class="font-semibold text-slate-700 dark:text-slate-300">${d.tglMasuk || '-'} (${d.bobotAwal !== undefined ? d.bobotAwal : '-'} kg)</span>
                                            </div>
                                            <div class="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                                                <span class="text-slate-500">ADG (Laju Tumbuh):</span>
                                                <span class="font-semibold ${d.adg >= 200 ? 'text-emerald-600' : d.adg >= 120 ? 'text-blue-600' : 'text-amber-600'}">
                                                    ${d.adg ? '+' + d.adg + ' g/hari' : '-'}
                                                </span>
                                            </div>
                                            <div class="flex justify-between items-center py-1">
                                                <span class="text-slate-500">Fase / Kategori:</span>
                                                <span class="font-medium text-slate-700 dark:text-slate-300">${d.kategori}</span>
                                            </div>
                                            <div class="flex justify-between items-center py-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                                                <span class="text-slate-400">Asal Ternak:</span>
                                                <span class="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">${d.asalTernak || 'Peternak Lokal Pleret'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Card Footer Actions -->
                                    <div class="p-3 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                                        <button onclick="ExportImport.printEartag('${d.eartag}')" title="Cetak QR Eartag" class="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition">
                                            <i data-lucide="qr-code" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="ExportImport.printMedicalCard('${d.eartag}')" title="Cetak Rekam Medis" class="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition">
                                            <i data-lucide="file-text" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="DombaModule.openModalEditDomba('${d.id}')" title="Ubah Data Ternak" class="p-2 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition">
                                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                                        </button>
                                        <button onclick="DombaModule.openModalDetail('${d.id}')" class="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 transition text-center">
                                            Lihat Detail
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <!-- DOMBA LISTINGS: TABLE VIEW -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-xs text-left">
                                <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th class="py-3.5 px-4">Eartag & Warna</th>
                                        <th class="py-3.5 px-4">Nama & Asal Ternak</th>
                                        <th class="py-3.5 px-4">Ras / Bangsa</th>
                                        <th class="py-3.5 px-4">Kelamin</th>
                                        <th class="py-3.5 px-4">Fase</th>
                                        <th class="py-3.5 px-4">Kandang/Sekat</th>
                                        <th class="py-3.5 px-4 text-right">Bobot</th>
                                        <th class="py-3.5 px-4 text-right">ADG</th>
                                        <th class="py-3.5 px-4 text-center">Status</th>
                                        <th class="py-3.5 px-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                    ${list.map(d => {
                                        const latestWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                                        return `
                                            <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition">
                                                <td class="py-3 px-4">
                                                    ${this.getWarnaTagBadge(d.warnaEartag, d.eartag)}
                                                </td>
                                                <td class="py-3 px-4">
                                                    <div class="font-bold text-slate-800 dark:text-slate-200">${d.nama}</div>
                                                    <div class="text-[11px] text-slate-500 flex items-center gap-1">
                                                        <span class="text-slate-400">Asal:</span> <b>${d.asalTernak || 'Peternak Lokal Pleret'}</b>
                                                    </div>
                                                </td>
                                                <td class="py-3 px-4 font-semibold">${d.ras}</td>
                                                <td class="py-3 px-4">${d.kelamin}</td>
                                                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-medium">${d.kategori}</span></td>
                                                <td class="py-3 px-4">${d.sekat}</td>
                                                 <td class="py-3 px-4 text-right">
                                                     <div class="font-bold text-emerald-600 dark:text-emerald-400">${latestWeight} kg</div>
                                                     <div class="text-[10px] text-slate-400 font-medium whitespace-nowrap">Masuk: ${d.tglMasuk || '-'} (${d.bobotAwal !== undefined ? d.bobotAwal : '-'} kg)</div>
                                                 </td>
                                                <td class="py-3 px-4 text-right font-semibold">${d.adg ? '+' + d.adg + ' g' : '-'}</td>
                                                <td class="py-3 px-4 text-center">
                                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${d.status === 'Sehat' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'}">${d.status}</span>
                                                </td>
                                                <td class="py-3 px-4 text-center">
                                                    <div class="flex items-center justify-center gap-1">
                                                        <button onclick="ExportImport.printEartag('${d.eartag}')" title="Cetak Eartag" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500">
                                                            <i data-lucide="qr-code" class="w-4 h-4"></i>
                                                        </button>
                                                        <button onclick="DombaModule.openModalEditDomba('${d.id}')" title="Ubah Data Ternak" class="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded text-amber-600">
                                                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                                                        </button>
                                                        <button onclick="DombaModule.openModalDetail('${d.id}')" class="px-2.5 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100">
                                                            Detail
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
                `}
            </div>
        `;
    },

    onSearch(val) {
        this.searchQuery = val;
        App.renderContent();
    },

    setFilter(key, val) {
        if (key === "kandang") this.activeFilterKandang = val;
        if (key === "kategori") this.activeFilterKategori = val;
        if (key === "status") this.activeFilterStatus = val;
        if (key === "warnaTag") this.activeFilterWarnaTag = val;
        App.renderContent();
    },

    resetFilter() {
        this.searchQuery = "";
        this.activeFilterKandang = "all";
        this.activeFilterRas = "all";
        this.activeFilterKategori = "all";
        this.activeFilterStatus = "all";
        this.activeFilterWarnaTag = "all";
        App.renderContent();
    },

    setViewMode(mode) {
        this.viewMode = mode;
        App.renderContent();
    },

    // Modal Tambah Domba Baru
    openModalTambah() {
        const nextId = "DMB-" + String(Store.getDomba().length + 1).padStart(3, "0");
        const kandangList = Store.getMasterKandang ? Store.getMasterKandang() : [];
        const kandangOptions = kandangList.length > 0 
            ? kandangList.map(k => `<option value="${k.nama}">${k.nama}</option>`).join('')
            : `
                <option value="Kandang A (Pejantan & Fattening)">Kandang A (Pejantan & Fattening)</option>
                <option value="Kandang B (Koloni Induk & Breeding)">Kandang B (Koloni Induk & Breeding)</option>
                <option value="Kandang C (Karantina & Pemulihan)">Kandang C (Karantina & Pemulihan)</option>
            `;
        const initialKandang = kandangList.length > 0 ? kandangList[0].nama : "Kandang A (Pejantan & Fattening)";

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="plus-circle" class="w-5 h-5 text-emerald-600"></i> Pendaftaran Domba Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="DombaModule.submitTambah(event)" class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Eartag *</label>
                            <input type="text" id="add-eartag" required value="${nextId}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Warna Eartag *</label>
                            <select id="add-warna-tag" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                ${this.getWarnaEartagOptionsHtml('Kuning')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama / Panggilan *</label>
                            <input type="text" id="add-nama" required placeholder="Contoh: Barata Super" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ras / Bangsa Ternak *</label>
                            <select id="add-ras" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                ${this.getRasOptionsHtml()}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin *</label>
                            <select id="add-kelamin" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Jantan">Jantan</option>
                                <option value="Betina">Betina</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori / Fase *</label>
                            <select id="add-kategori" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Fattening">Fattening (Penggemukan)</option>
                                <option value="Pejantan">Pejantan Pemacek</option>
                                <option value="Indukan">Indukan</option>
                                <option value="Dara">Dara</option>
                                <option value="Cempe">Cempe</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kandang Alokasi *</label>
                            <select id="add-kandang" onchange="DombaModule.updateSekatDatalist(this.value, 'add-sekat-datalist')" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                ${kandangOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Sekat / Koloni *</label>
                            <input type="text" id="add-sekat" list="add-sekat-datalist" required placeholder="Pilih atau ketik sekat..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                            <datalist id="add-sekat-datalist">
                                ${this.getSekatOptionsForKandang(initialKandang)}
                            </datalist>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Asal Ternak (Suplier / Sumber) *</label>
                            <select id="add-asal-ternak-select" required onchange="DombaModule.handleSuplierChange(this, 'add-asal-ternak-custom')" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                ${this.getSuplierOptionsHtml()}
                            </select>
                            <input type="text" id="add-asal-ternak-custom" placeholder="Ketik nama suplier / mitra baru..." class="w-full mt-2 p-2 rounded-xl border border-dashed border-emerald-500 dark:border-emerald-600 bg-white dark:bg-slate-900 font-medium hidden">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Masuk *</label>
                            <input type="date" id="add-tgl-masuk" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold text-emerald-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bobot Masuk (kg) *</label>
                            <input type="number" step="0.1" id="add-bobot" required placeholder="Contoh: 25.5" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                            <input type="date" id="add-tgl-lahir" value="2025-01-01" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Beli / Aset (Rp)</label>
                            <input type="number" id="add-harga" placeholder="Contoh: 2500000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Induk Betina</label>
                            <input type="text" id="add-induk" placeholder="Contoh: Garut Super / Eartag DMB-003" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pejantan Pemacek</label>
                            <input type="text" id="add-pejantan" placeholder="Contoh: Dorper Fullblood / Eartag DMB-001" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Foto Ternak</label>
                        <input type="url" id="add-foto" value="https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=600&q=80" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">Simpan Data Domba</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTambah(e) {
        e.preventDefault();
        const eartag = document.getElementById("add-eartag").value.trim();
        const warnaEartag = document.getElementById("add-warna-tag").value;
        const nama = document.getElementById("add-nama").value.trim();
        const ras = document.getElementById("add-ras").value;
        const kelamin = document.getElementById("add-kelamin").value;
        const kategori = document.getElementById("add-kategori").value;
        const kandang = document.getElementById("add-kandang").value;
        const sekat = document.getElementById("add-sekat").value.trim();
        
        const asalSelect = document.getElementById("add-asal-ternak-select");
        const asalCustom = document.getElementById("add-asal-ternak-custom");
        let asalTernak = asalSelect ? asalSelect.value : "";
        if (asalTernak === "LAINNYA" || !asalTernak) {
            asalTernak = asalCustom ? asalCustom.value.trim() : "";
        }
        if (!asalTernak) asalTernak = "Peternak Lokal Pleret";

        const tglMasuk = document.getElementById("add-tgl-masuk")?.value || new Date().toISOString().split("T")[0];
        const tglLahir = document.getElementById("add-tgl-lahir").value;
        const bobotAwal = parseFloat(document.getElementById("add-bobot").value);
        const hargaBeli = parseFloat(document.getElementById("add-harga").value) || 0;
        const induk = document.getElementById("add-induk").value.trim() || "-";
        const pejantan = document.getElementById("add-pejantan").value.trim() || "-";
        const foto = document.getElementById("add-foto").value.trim();

        const newDomba = {
            id: "dmb-" + Date.now(),
            eartag,
            warnaEartag,
            nama,
            ras,
            kelamin,
            kategori,
            kandang,
            sekat,
            asalTernak,
            tglLahir,
            tglMasuk,
            bobotAwal,
            hargaBeli,
            status: "Sehat",
            induk,
            pejantan,
            foto,
            adg: 0,
            riwayatTimbang: [{ tgl: tglMasuk, bobot: bobotAwal, catatan: "Bobot awal masuk kandang" }],
            rekamMedis: [],
            riwayatKawin: []
        };

        Store.addDomba(newDomba);
        App.closeModal();
        App.showToast(`Domba ${eartag} (${nama}) berhasil ditambahkan!`, "success");
        App.renderContent();
    },

    // Modal Detail Domba Lengkap
    openModalDetail(dombaId) {
        const d = Store.getDomba().find(item => item.id === dombaId);
        if (!d) return;

        const latestWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;

        App.setModalContent(`
            <div class="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <img src="${d.foto}" class="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow">
                        <div>
                            <div class="flex items-center gap-2">
                                ${this.getWarnaTagBadge(d.warnaEartag, d.eartag)}
                                <h3 class="text-lg font-bold text-slate-900 dark:text-white">${d.nama}</h3>
                            </div>
                            <p class="text-xs text-slate-500 mt-1">${d.ras} • ${d.kelamin} • ${d.kategori} • <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Asal: ${d.asalTernak || 'Peternak Lokal Pleret'}</span></p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="ExportImport.printEartag('${d.eartag}')" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1">
                            <i data-lucide="qr-code" class="w-3.5 h-3.5"></i> Cetak QR
                        </button>
                        <button onclick="ExportImport.printMedicalCard('${d.eartag}')" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1">
                            <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Rekam Medis
                        </button>
                        <button onclick="App.closeModal()" class="p-1 text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <div>
                        <span class="text-slate-400 block text-[11px]">Kandang & Sekat</span>
                        <b class="text-slate-800 dark:text-slate-200">${d.kandang.split('(')[0]} / ${d.sekat}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Bobot Terkini</span>
                        <b class="text-emerald-600 dark:text-emerald-400 text-sm">${latestWeight} kg</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Tanggal Masuk Kandang</span>
                        <b class="text-emerald-700 dark:text-emerald-400 font-bold">${d.tglMasuk || '-'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Bobot Awal Masuk</span>
                        <b class="text-slate-800 dark:text-slate-200 font-bold">${d.bobotAwal !== undefined ? d.bobotAwal + ' kg' : '-'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Laju Tumbuh (ADG)</span>
                        <b class="text-blue-600 dark:text-blue-400">${d.adg ? '+' + d.adg + ' g/hari' : '-'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Status Kesehatan</span>
                        <span class="inline-block px-2 py-0.5 mt-0.5 rounded font-bold text-[10px] ${d.status === 'Sehat' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${d.status}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Asal Ternak (Sumber)</span>
                        <b class="text-emerald-700 dark:text-emerald-400 font-semibold">${d.asalTernak || 'Peternak Lokal Pleret'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Warna Eartag Fisik</span>
                        <b class="text-slate-800 dark:text-slate-200">${d.warnaEartag || 'Kuning'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Tanggal Lahir</span>
                        <b class="text-slate-700 dark:text-slate-300">${d.tglLahir || '-'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Indukan Betina</span>
                        <b class="text-slate-700 dark:text-slate-300">${d.induk || '-'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Pejantan Pemacek</span>
                        <b class="text-slate-700 dark:text-slate-300">${d.pejantan || '-'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Biaya Pengadaan</span>
                        <b class="text-slate-700 dark:text-slate-300">Rp ${(d.hargaBeli || 0).toLocaleString('id-ID')}</b>
                    </div>
                </div>

                <!-- Tab Riwayat Timbangan -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <i data-lucide="scale" class="w-4 h-4 text-emerald-600"></i> Riwayat Penimbangan Bobot
                        </h4>
                        <button onclick="DombaModule.openModalTambahTimbang('${d.id}')" class="text-xs text-emerald-600 font-semibold hover:underline">
                            + Catat Timbangan Baru
                        </button>
                    </div>

                    <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-2 px-3">Tanggal</th>
                                    <th class="py-2 px-3 text-right">Bobot (kg)</th>
                                    <th class="py-2 px-3">Catatan Petugas</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${(d.riwayatTimbang || []).map(r => `
                                    <tr>
                                        <td class="py-2 px-3 text-slate-600 dark:text-slate-300">${r.tgl}</td>
                                        <td class="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">${r.bobot} kg</td>
                                        <td class="py-2 px-3 text-slate-500">${r.catatan || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Tab Rekam Medis -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <i data-lucide="heart-pulse" class="w-4 h-4 text-rose-600"></i> Rekam Medis & Tindakan Dokter
                        </h4>
                        <button onclick="DombaModule.openModalTambahMedis('${d.id}')" class="text-xs text-rose-600 font-semibold hover:underline">
                            + Tambah Tindakan Medis
                        </button>
                    </div>

                    <div class="space-y-2 text-xs">
                        ${(d.rekamMedis || []).length === 0 ? `
                            <p class="text-xs text-slate-400 italic py-2">Belum ada riwayat keluhan atau sakit (Kondisi Sehat).</p>
                        ` : (d.rekamMedis || []).map(m => `
                            <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="font-bold text-slate-800 dark:text-slate-200">${m.diagnosa}</span>
                                    <span class="text-slate-400 text-[11px]">${m.tgl}</span>
                                </div>
                                <p class="text-slate-600 dark:text-slate-400">${m.tindakan}</p>
                                <div class="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                                    <span>Obat: <b>${m.obat || '-'}</b></span>
                                    <span>Petugas: <b>${m.petugas}</b></span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Footer Delete Option & Actions -->
                <div class="pt-3 border-t dark:border-slate-700 flex justify-between items-center text-xs">
                    <button onclick="DombaModule.hapusDomba('${d.id}')" class="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus Ternak
                    </button>
                    <div class="flex items-center gap-2">
                        <button onclick="DombaModule.openModalEditDomba('${d.id}')" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center gap-1">
                            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Ubah Data
                        </button>
                        <button onclick="App.closeModal()" class="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        `);
        App.openModal();
    },

    // Modal Tambah Timbangan Individu
    openModalTambahTimbang(dombaId) {
        const d = Store.getDomba().find(item => item.id === dombaId);
        if (!d) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="scale" class="w-5 h-5 text-blue-600"></i> Catat Timbangan: ${d.eartag} (${d.nama})
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="DombaModule.submitTimbang(event, '${d.id}')" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Timbang *</label>
                        <input type="date" id="tb-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bobot Timbangan Terkini (kg) *</label>
                        <input type="number" step="0.1" id="tb-bobot" required placeholder="Contoh: 48.5" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-base font-bold text-emerald-600">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Pertumbuhan</label>
                        <textarea id="tb-catatan" rows="2" placeholder="Contoh: Respon pakan silase sangat tinggi, kondisi fisik sehat." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">Simpan Timbangan & Hitung ADG</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTimbang(e, dombaId) {
        e.preventDefault();
        const tgl = document.getElementById("tb-tgl").value;
        const bobot = parseFloat(document.getElementById("tb-bobot").value);
        const catatan = document.getElementById("tb-catatan").value.trim();

        Store.addRiwayatTimbang(dombaId, tgl, bobot, catatan);
        App.closeModal();
        App.showToast("Timbangan berhasil disimpan! ADG telah diperbarui.", "success");
        App.renderContent();
    },

    // Modal Tambah Tindakan Medis
    openModalTambahMedis(dombaId) {
        const d = Store.getDomba().find(item => item.id === dombaId);
        if (!d) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="heart-pulse" class="w-5 h-5 text-rose-600"></i> Rekam Medis: ${d.eartag} (${d.nama})
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="DombaModule.submitMedis(event, '${d.id}')" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pemeriksaan *</label>
                        <input type="date" id="med-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Diagnosa / Jenis Penanganan *</label>
                        <input type="text" id="med-diagnosa" required placeholder="Contoh: Vaksinasi B-Complex / Scabies / Kembung" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tindakan / Terapi Dilakukan *</label>
                        <textarea id="med-tindakan" required rows="2" placeholder="Contoh: Injeksi intramuskular vitamin dan salep antiseptik" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Obat / Vitamin</label>
                            <input type="text" id="med-obat" placeholder="Contoh: Calcidex 5ml" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Update Status Ternak</label>
                            <select id="med-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Sehat">Sehat</option>
                                <option value="Karantina">Karantina / Isolasi</option>
                                <option value="Bunting">Bunting</option>
                                <option value="Laktasi">Laktasi</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Petugas / Paramedik *</label>
                        <input type="text" id="med-petugas" required value="drh. Wahid" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
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

    submitMedis(e, dombaId) {
        e.preventDefault();
        const record = {
            tgl: document.getElementById("med-tgl").value,
            diagnosa: document.getElementById("med-diagnosa").value.trim(),
            tindakan: document.getElementById("med-tindakan").value.trim(),
            obat: document.getElementById("med-obat").value.trim(),
            statusHewan: document.getElementById("med-status").value,
            petugas: document.getElementById("med-petugas").value.trim()
        };

        Store.addRekamMedis(dombaId, record);
        App.closeModal();
        App.showToast("Rekam medis berhasil ditambahkan!", "success");
        App.renderContent();
    },

    // Modal Perkawinan / Breeding
    openModalKawin() {
        const jantans = Store.getDomba().filter(d => d.kelamin === "Jantan" && d.kategori === "Pejantan");
        const betinas = Store.getDomba().filter(d => d.kelamin === "Betina" && (d.kategori === "Indukan" || d.kategori === "Dara"));

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="heart" class="w-5 h-5 text-purple-600"></i> Pencatatan Perkawinan (Breeding Cycle)
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="DombaModule.submitKawin(event)" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Kawin *</label>
                        <input type="date" id="kwn-tgl" required value="${new Date().toISOString().split('T')[0]}" onchange="DombaModule.updateHPL(this.value)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Pejantan Pemacek *</label>
                            <select id="kwn-pejantan" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                ${jantans.map(j => `<option value="${j.id}">${j.eartag} - ${j.nama} (${j.ras})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Indukan Betina *</label>
                            <select id="kwn-betina" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                ${betinas.map(b => `<option value="${b.id}">${b.eartag} - ${b.nama} (${b.ras})</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Estimasi Otomatis Kelahiran (Gestasi 150 hari) -->
                    <div class="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 space-y-1">
                        <div class="font-bold flex items-center gap-1.5">
                            <i data-lucide="calendar" class="w-4 h-4"></i> Estimasi Hari Perkiraan Lahir (HPL):
                        </div>
                        <div id="kwn-hpl-text" class="text-sm font-extrabold text-purple-700 dark:text-purple-300">
                            11 Februari 2027 (Masa kebuntingan rata-rata 150 hari)
                        </div>
                        <p class="text-[11px] text-purple-600/90 dark:text-purple-400">Status betina otomatis diubah menjadi "Bunting".</p>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md">Simpan Siklus Kawin</button>
                    </div>
                </form>
            </div>
        `);
        DombaModule.updateHPL(new Date().toISOString().split('T')[0]);
        App.openModal();
    },

    updateHPL(tglKawinStr) {
        const d = new Date(tglKawinStr);
        d.setDate(d.getDate() + 150);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const hplFormatted = d.toLocaleDateString('id-ID', options);
        const el = document.getElementById("kwn-hpl-text");
        if (el) {
            el.innerText = `${hplFormatted} (Masa kebuntingan rata-rata 150 hari)`;
        }
    },

    submitKawin(e) {
        e.preventDefault();
        const tglKawin = document.getElementById("kwn-tgl").value;
        const pejantanId = document.getElementById("kwn-pejantan").value;
        const betinaId = document.getElementById("kwn-betina").value;

        const pejantan = Store.getDomba().find(d => d.id === pejantanId);
        const betina = Store.getDomba().find(d => d.id === betinaId);

        if (betina && pejantan) {
            const dHpl = new Date(tglKawin);
            dHpl.setDate(dHpl.getDate() + 150);
            const hplStr = dHpl.toISOString().split("T")[0];

            if (!betina.riwayatKawin) betina.riwayatKawin = [];
            betina.riwayatKawin.unshift({
                tglKawin,
                pejantanEartag: pejantan.eartag,
                pejantanNama: pejantan.nama,
                status: `Bunting Aktif (HPL: ${hplStr})`
            });
            betina.status = "Bunting";
            Store.updateDomba(betina.id, { status: "Bunting", riwayatKawin: betina.riwayatKawin });
            App.closeModal();
            App.showToast(`Perkawinan ${pejantan.eartag} & ${betina.eartag} tercatat! HPL: ${hplStr}`, "success");
            App.renderContent();
        }
    },

    openModalEditDomba(dombaId) {
        const d = Store.getDomba().find(item => item.id === dombaId);
        if (!d) return;

        const kandangList = Store.getMasterKandang ? Store.getMasterKandang() : [];
        const kandangOptions = kandangList.length > 0 
            ? kandangList.map(k => `<option value="${k.nama} (${k.tipe})" ${d.kandang.startsWith(k.nama) ? 'selected' : ''}>${k.nama} (${k.tipe})</option>`).join('')
            : `
                <option value="Kandang A (Pejantan & Fattening)" ${d.kandang.includes('Kandang A') ? 'selected' : ''}>Kandang A (Pejantan & Fattening)</option>
                <option value="Kandang B (Koloni Induk & Breeding)" ${d.kandang.includes('Kandang B') ? 'selected' : ''}>Kandang B (Koloni Induk & Breeding)</option>
                <option value="Kandang C (Karantina & Pemulihan)" ${d.kandang.includes('Kandang C') ? 'selected' : ''}>Kandang C (Karantina & Pemulihan)</option>
            `;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i> Ubah Data Domba: ${d.eartag}
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="DombaModule.submitEditDomba(event, '${d.id}')" class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Eartag *</label>
                            <input type="text" id="edit-eartag" required value="${d.eartag}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Warna Eartag *</label>
                            <select id="edit-warna-tag" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                ${this.getWarnaEartagOptionsHtml(d.warnaEartag)}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama / Panggilan *</label>
                            <input type="text" id="edit-nama" required value="${d.nama}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ras / Bangsa Ternak *</label>
                            <select id="edit-ras" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                ${this.getRasOptionsHtml(d.ras)}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenis Kelamin *</label>
                            <select id="edit-kelamin" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Jantan" ${d.kelamin === 'Jantan' ? 'selected' : ''}>Jantan</option>
                                <option value="Betina" ${d.kelamin === 'Betina' ? 'selected' : ''}>Betina</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori / Fase *</label>
                            <select id="edit-kategori" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                ${['Fattening', 'Pejantan', 'Indukan', 'Dara', 'Cempe'].map(k => `
                                    <option value="${k}" ${d.kategori === k ? 'selected' : ''}>${k}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kandang Alokasi *</label>
                            <select id="edit-kandang" onchange="DombaModule.updateSekatDatalist(this.value, 'edit-sekat-datalist')" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                ${kandangOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Sekat / Koloni *</label>
                            <input type="text" id="edit-sekat" list="edit-sekat-datalist" required value="${d.sekat}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                            <datalist id="edit-sekat-datalist">
                                ${this.getSekatOptionsForKandang(d.kandang)}
                            </datalist>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Hewan *</label>
                            <select id="edit-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold text-emerald-600">
                                ${['Sehat', 'Bunting', 'Laktasi', 'Karantina', 'Terjual', 'Mati'].map(s => `
                                    <option value="${s}" ${d.status === s ? 'selected' : ''}>${s}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Asal Ternak (Suplier / Sumber) *</label>
                            <select id="edit-asal-ternak-select" required onchange="DombaModule.handleSuplierChange(this, 'edit-asal-ternak-custom')" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                ${this.getSuplierOptionsHtml(d.asalTernak || '')}
                            </select>
                            <input type="text" id="edit-asal-ternak-custom" value="${this.isCustomSuplier(d.asalTernak) ? (d.asalTernak || '') : ''}" placeholder="Ketik nama suplier / mitra baru..." class="w-full mt-2 p-2 rounded-xl border border-dashed border-emerald-500 dark:border-emerald-600 bg-white dark:bg-slate-900 font-medium ${this.isCustomSuplier(d.asalTernak) ? '' : 'hidden'}">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Masuk *</label>
                            <input type="date" id="edit-tgl-masuk" required value="${d.tglMasuk || new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold text-emerald-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bobot Masuk (kg) *</label>
                            <input type="number" step="0.1" id="edit-bobot" required value="${d.bobotAwal}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                            <input type="date" id="edit-tgl-lahir" value="${d.tglLahir || '2025-01-01'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Beli / Aset (Rp)</label>
                            <input type="number" id="edit-harga" value="${d.hargaBeli || 0}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Induk Betina</label>
                            <input type="text" id="edit-induk" value="${d.induk || '-'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pejantan Pemacek</label>
                            <input type="text" id="edit-pejantan" value="${d.pejantan || '-'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Foto Ternak URL</label>
                        <input type="text" id="edit-foto" value="${d.foto || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
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

    submitEditDomba(e, dombaId) {
        e.preventDefault();
        const existing = Store.getDomba().find(d => d.id === dombaId);
        const eartag = document.getElementById("edit-eartag").value.trim();
        const warnaEartag = document.getElementById("edit-warna-tag").value;
        const nama = document.getElementById("edit-nama").value.trim();
        const ras = document.getElementById("edit-ras").value;
        const kelamin = document.getElementById("edit-kelamin").value;
        const kategori = document.getElementById("edit-kategori").value;
        const kandang = document.getElementById("edit-kandang").value;
        const sekat = document.getElementById("edit-sekat").value.trim();
        const status = document.getElementById("edit-status").value;

        const asalSelect = document.getElementById("edit-asal-ternak-select");
        const asalCustom = document.getElementById("edit-asal-ternak-custom");
        let asalTernak = asalSelect ? asalSelect.value : "";
        if (asalTernak === "LAINNYA" || (asalCustom && !asalCustom.classList.contains("hidden"))) {
            asalTernak = asalCustom ? asalCustom.value.trim() : "";
        }
        if (!asalTernak) asalTernak = "Peternak Lokal Pleret";

        const tglMasuk = document.getElementById("edit-tgl-masuk")?.value || (existing ? existing.tglMasuk : "") || new Date().toISOString().split("T")[0];
        const tglLahir = document.getElementById("edit-tgl-lahir").value;
        const bobotAwal = parseFloat(document.getElementById("edit-bobot").value);
        const hargaBeli = parseFloat(document.getElementById("edit-harga").value) || 0;
        const induk = document.getElementById("edit-induk").value.trim() || "-";
        const pejantan = document.getElementById("edit-pejantan").value.trim() || "-";
        const foto = document.getElementById("edit-foto").value.trim() || (existing?.foto || "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&auto=format&fit=crop&q=60");

        // Sinkronkan rekaman timbangan bobot awal agar selalu sesuai tanggal masuk dan berat masuk
        let riwayatTimbang = existing && Array.isArray(existing.riwayatTimbang) ? [...existing.riwayatTimbang] : [];
        if (riwayatTimbang.length === 0) {
            riwayatTimbang = [{ tgl: tglMasuk, bobot: bobotAwal, catatan: "Bobot awal masuk kandang" }];
        } else {
            riwayatTimbang[0] = {
                ...riwayatTimbang[0],
                tgl: tglMasuk,
                bobot: bobotAwal,
                catatan: riwayatTimbang[0].catatan || "Bobot awal masuk kandang"
            };
        }
        riwayatTimbang.sort((a, b) => new Date(a.tgl) - new Date(b.tgl));

        let adg = 0;
        if (riwayatTimbang.length >= 2) {
            const last = riwayatTimbang[riwayatTimbang.length - 1];
            const prev = riwayatTimbang[riwayatTimbang.length - 2];
            const diffDays = Math.max(1, Math.round((new Date(last.tgl) - new Date(prev.tgl)) / (1000 * 60 * 60 * 24)));
            const diffWeightKg = last.bobot - prev.bobot;
            adg = Math.round((diffWeightKg * 1000) / diffDays);
        }

        Store.updateDomba(dombaId, {
            eartag,
            warnaEartag,
            nama,
            ras,
            kelamin,
            kategori,
            kandang,
            sekat,
            status,
            asalTernak,
            tglLahir,
            tglMasuk,
            bobotAwal,
            hargaBeli,
            induk,
            pejantan,
            foto,
            riwayatTimbang,
            adg
        });

        App.closeModal();
        App.showToast(`Data domba ${eartag} (${nama}) berhasil diperbarui!`, "success");
        App.renderContent();
    },

    hapusDomba(dombaId) {
        if (confirm("Apakah Anda yakin ingin menghapus data ternak ini dari sistem?")) {
            Store.deleteDomba(dombaId);
            App.closeModal();
            App.showToast("Data domba telah dihapus.", "success");
            App.renderContent();
        }
    },

    getSekatOptionsForKandang(kandangNameOrId) {
        if (!kandangNameOrId) return '';
        const kandangList = Store.getMasterKandang ? Store.getMasterKandang() : [];
        const key = (kandangNameOrId || '').split('(')[0].trim().toLowerCase();
        const found = kandangList.find(k => (k.nama || '').toLowerCase().includes(key) || (k.id && (kandangNameOrId || '').toLowerCase().includes(k.id.toLowerCase())));
        if (found && Array.isArray(found.sekatList) && found.sekatList.length > 0) {
            return found.sekatList.map(s => `<option value="${s.nomor}">${s.nomor} (${s.terisi || 0}/${s.kapasitas} Ekor)</option>`).join('');
        }
        return `
            <option value="Sekat 01">Sekat 01</option>
            <option value="Sekat 02">Sekat 02</option>
            <option value="Sekat 03">Sekat 03</option>
            <option value="Sekat 04">Sekat 04</option>
        `;
    },

    updateSekatDatalist(kandangName, datalistId) {
        const datalistEl = document.getElementById(datalistId);
        if (datalistEl) {
            datalistEl.innerHTML = this.getSekatOptionsForKandang(kandangName);
        }
    }
};
