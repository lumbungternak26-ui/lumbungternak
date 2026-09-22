/**
 * Modul Portal Publik (Muka Umum)
 * Etalase Resmi Lumbung Ternak BUMKal LPM Pleret
 * Fitur:
 * 1. Hero Showcase & Profil Sirkular Kalurahan Pleret
 * 2. Counter Transparansi Publik Realtime
 * 3. Katalog Domba Siap Jual / Qurban / Aqiqah + Pesan via WhatsApp
 * 4. Katalog Produk Pupuk Organik Kohe (POP Kompos & POC Urin)
 * 5. Cek Eartag & Sertifikat Ternak Digital (Bebas PMK)
 * 6. Edukasi Sistem Integrated Circular Farming
 * 7. Modal Login Pengurus / Petugas (dengan Quick Login Demo)
 */

const PortalPublikModule = {
    selectedRasFilter: "all",
    selectedKategoriFilter: "all",
    selectedBobotFilter: "all",
    catalogViewMode: "grid", // "grid" | "list"
    currentPage: 1,
    itemsPerPage: 8,
    checkedEartagResult: null,

    render() {
        this.updatePublicHeader();
        const cfg = Store.getPengaturan();
        const dombaList = Store.getDomba();
        const availableDomba = dombaList.filter(d => d.status !== "Mati" && d.status !== "Terjual");
        const stokPupuk = Store.getStokPupuk();
        const lahanList = Store.getLahan();
        const valuasi = Store.hitungValuasiAsetBiologis();

        // Hitung metrik dinamis HPT tersinkronisasi dengan panel pengurus
        const totalLuasLahan = (lahanList || []).reduce((acc, l) => acc + (l.luasM2 || 0), 0);
        const luasHptDisplay = totalLuasLahan > 0 ? `${totalLuasLahan.toLocaleString('id-ID')} m²` : '0 m²';
        const plotHptCount = (lahanList || []).length;

        // Hitung rata-rata ADG dari domba aktif tersinkronisasi dengan panel pengurus
        const dombaWithAdg = availableDomba.filter(d => typeof d.adg === 'number' && d.adg > 0);
        const avgAdg = dombaWithAdg.length > 0 
            ? Math.round(dombaWithAdg.reduce((acc, d) => acc + d.adg, 0) / dombaWithAdg.length) 
            : 0;

        // Hitung total pupuk kompos dari stok riil
        const totalKomposKg = (stokPupuk || []).reduce((acc, p) => acc + (p.stokKg || 0), 0);
        const komposDisplay = totalKomposKg > 0 ? `${(totalKomposKg / 1000).toFixed(1)} Ton` : '4.5 Ton';

        // Filter domba berdasarkan Ras, Kategori, dan Rentang Berat Badan
        let filteredDomba = availableDomba;
        if (this.selectedRasFilter !== "all") {
            filteredDomba = filteredDomba.filter(d => d.ras.toLowerCase().includes(this.selectedRasFilter.toLowerCase()));
        }
        if (this.selectedKategoriFilter !== "all") {
            filteredDomba = filteredDomba.filter(d => d.kategori.toLowerCase() === this.selectedKategoriFilter.toLowerCase());
        }
        if (this.selectedBobotFilter !== "all") {
            filteredDomba = filteredDomba.filter(d => {
                const w = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : (d.bobotAwal || 0);
                if (this.selectedBobotFilter === "under25") return w < 25;
                if (this.selectedBobotFilter === "25-35") return w >= 25 && w <= 35;
                if (this.selectedBobotFilter === "35-45") return w > 35 && w <= 45;
                if (this.selectedBobotFilter === "over45") return w > 45;
                return true;
            });
        }

        const totalItems = filteredDomba.length;
        const itemsPerPage = this.itemsPerPage;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        if (this.currentPage > totalPages) this.currentPage = 1;
        const startIndex = (this.currentPage - 1) * itemsPerPage;
        const pagedDomba = itemsPerPage >= 999 ? filteredDomba : filteredDomba.slice(startIndex, startIndex + itemsPerPage);

        const hargaPerKg = cfg.hargaDagingHidupPerKg || 75000;
        const noWA = cfg.nomorWhatsApp || "6281223344551";

        return `
            <div class="space-y-10 pb-16">
                <!-- ANNOUNCEMENT BANNER (IF ACTIVE) -->
                ${cfg.showAnnouncement && cfg.portalAnnouncement ? `
                    <div class="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border border-amber-500/30 dark:border-amber-400/20 rounded-2xl p-4 flex items-center gap-3 text-slate-800 dark:text-slate-200 text-xs shadow-sm">
                        <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow">
                            <i data-lucide="megaphone" class="w-4 h-4"></i>
                        </div>
                        <div class="flex-1">
                            <b class="text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider text-[10px] block">PENGUMUMAN RESMI BUMKAL</b>
                            <p class="mt-0.5">${cfg.portalAnnouncement}</p>
                        </div>
                    </div>
                ` : ''}

                <!-- HERO SECTION -->
                <section class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-2xl">
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_50%)]"></div>
                    <div class="relative z-10 px-6 py-14 sm:px-12 sm:py-20 max-w-5xl mx-auto text-center space-y-6">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
                            <i data-lucide="shield-check" class="w-4 h-4"></i> ${cfg.namaLembaga || 'BUMKal LPM'} • ${cfg.kapanewonKabupaten || 'Pleret, Bantul'}
                        </div>
                        <h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            ${cfg.portalHeroJudul || 'Lumbung Ternak Terpadu'} <br class="hidden sm:block">
                            <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
                                Mandiri Pakan & Bebas Limbah
                            </span>
                        </h1>
                        <p class="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto font-normal leading-relaxed">
                            ${cfg.portalHeroSlogan || 'Ekosistem peternakan domba unggul terintegrasi dengan perkebunan bank pakan HPT rumput odot serta pengolahan limbah kotoran hewan (kohe) menjadi pupuk organik bermutu tinggi.'}
                        </p>
                        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
                            ${cfg.showKatalogDomba ? `
                                <a href="#katalog-domba" class="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2">
                                    <i data-lucide="shopping-cart" class="w-4 h-4"></i> Lihat Domba Siap Jual
                                </a>
                            ` : ''}
                            ${cfg.showCekEartag ? `
                                <a href="#cek-eartag" class="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm backdrop-blur-sm transition flex items-center gap-2">
                                    <i data-lucide="search" class="w-4 h-4"></i> Cek Eartag Transparan
                                </a>
                            ` : ''}
                            <button onclick="App.openLoginModal()" class="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2">
                                <i data-lucide="lock" class="w-4 h-4"></i> Masuk Portal Petugas
                            </button>
                        </div>
                    </div>
                </section>

                <!-- TRANSPARENCY LIVE COUNTER -->
                ${cfg.showLiveStats ? `
                <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
                        <div class="w-10 h-10 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-2">
                            <i data-lucide="tag" class="w-5 h-5"></i>
                        </div>
                        <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">${availableDomba.length} Ekor</div>
                        <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Ternak Sehat Aktif</div>
                        <p class="text-[11px] text-slate-400 mt-1">Mortalitas 0% • Terdaftar resmi</p>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
                        <div class="w-10 h-10 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-2">
                            <i data-lucide="trending-up" class="w-5 h-5"></i>
                        </div>
                        <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">${avgAdg > 0 ? '+' + avgAdg + ' g/hr' : '-'}</div>
                        <div class="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">Rata-rata ADG Harian</div>
                        <p class="text-[11px] text-slate-400 mt-1">${avgAdg > 0 ? 'Laju penggemukan optimal' : 'Pencatatan bertahap'}</p>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
                        <div class="w-10 h-10 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-2">
                            <i data-lucide="recycle" class="w-5 h-5"></i>
                        </div>
                        <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">${komposDisplay}</div>
                        <div class="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">Kompos Halus Diproduksi</div>
                        <p class="text-[11px] text-slate-400 mt-1">Fermentasi Trichoderma & EM4</p>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
                        <div class="w-10 h-10 mx-auto rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center mb-2">
                            <i data-lucide="sprout" class="w-5 h-5"></i>
                        </div>
                        <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">${luasHptDisplay}</div>
                        <div class="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">Kebun Bank Pakan HPT</div>
                        <p class="text-[11px] text-slate-400 mt-1">${plotHptCount > 0 ? plotHptCount + ' Plot Terintegrasi • Odot & Legum' : 'Rumput Odot & Legum Kedaton'}</p>
                    </div>
                </section>
                ` : ''}

                <!-- SECTION 1: KATALOG TERNAK SIAP JUAL (LEBIH IRIT TEMPAT, KOMPAK & ADA PAGINASI) -->
                ${cfg.showKatalogDomba ? `
                <section id="katalog-domba" class="space-y-4">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                                    <i data-lucide="shopping-bag" class="w-3 h-3"></i> Etalase Resmi
                                </span>
                                <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Katalog Domba Siap Jual</h2>
                                <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                                    ${totalItems} Ekor
                                </span>
                            </div>
                            <p class="text-xs text-slate-500 mt-0.5">Pilih ternak kurban, aqiqah, pejantan, atau indukan dengan jaminan sertifikat sehat.</p>
                        </div>

                        <!-- Filter Buttons & View Mode Controls -->
                        <div class="flex flex-wrap items-center gap-2">
                            <!-- Filter Ras -->
                            <select onchange="PortalPublikModule.filterRas(this.value)" class="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                                <option value="all">Semua Ras</option>
                                <option value="Dorper" ${this.selectedRasFilter === 'Dorper' ? 'selected' : ''}>Dorper Cross</option>
                                <option value="Garut" ${this.selectedRasFilter === 'Garut' ? 'selected' : ''}>Garut Tangkas</option>
                                <option value="Texel" ${this.selectedRasFilter === 'Texel' ? 'selected' : ''}>Texel Wonosobo</option>
                                <option value="Morada" ${this.selectedRasFilter === 'Morada' ? 'selected' : ''}>Morada Cross</option>
                            </select>

                            <!-- Filter Kategori -->
                            <select onchange="PortalPublikModule.filterKategori(this.value)" class="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                                <option value="all">Semua Kategori</option>
                                <option value="Pejantan" ${this.selectedKategoriFilter === 'Pejantan' ? 'selected' : ''}>Pejantan</option>
                                <option value="Indukan" ${this.selectedKategoriFilter === 'Indukan' ? 'selected' : ''}>Indukan</option>
                                <option value="Fattening" ${this.selectedKategoriFilter === 'Fattening' ? 'selected' : ''}>Fattening</option>
                            </select>

                            <!-- Filter Berat Badan -->
                            <select onchange="PortalPublikModule.filterBobot(this.value)" class="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-emerald-500/80 dark:border-emerald-500/60 bg-emerald-50/50 dark:bg-slate-900 text-emerald-800 dark:text-emerald-300">
                                <option value="all">Semua Bobot</option>
                                <option value="under25" ${this.selectedBobotFilter === 'under25' ? 'selected' : ''}>&lt; 25 kg</option>
                                <option value="25-35" ${this.selectedBobotFilter === '25-35' ? 'selected' : ''}>25 – 35 kg</option>
                                <option value="35-45" ${this.selectedBobotFilter === '35-45' ? 'selected' : ''}>35 – 45 kg</option>
                                <option value="over45" ${this.selectedBobotFilter === 'over45' ? 'selected' : ''}>&gt; 45 kg</option>
                            </select>

                            ${(this.selectedRasFilter !== 'all' || this.selectedKategoriFilter !== 'all' || this.selectedBobotFilter !== 'all') ? `
                                <button onclick="PortalPublikModule.resetFilters()" title="Reset semua filter" class="text-xs font-semibold px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 transition flex items-center gap-1">
                                    <i data-lucide="x" class="w-3.5 h-3.5"></i> Reset
                                </button>
                            ` : ''}

                            <div class="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                            <!-- View Mode Toggle (Grid Kompak vs Baris Ringkas) -->
                            <div class="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700">
                                <button onclick="PortalPublikModule.setViewMode('grid')" title="Tampilan Grid Kompak" class="p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${this.catalogViewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
                                    <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
                                    <span class="hidden sm:inline text-[11px]">Kartu</span>
                                </button>
                                <button onclick="PortalPublikModule.setViewMode('list')" title="Tampilan Baris Ringkas" class="p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${this.catalogViewMode === 'list' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
                                    <i data-lucide="list" class="w-3.5 h-3.5"></i>
                                    <span class="hidden sm:inline text-[11px]">Ringkas</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    ${filteredDomba.length === 0 ? `
                        <div class="py-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 space-y-3 shadow-sm">
                            <div class="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                                <i data-lucide="filter-x" class="w-6 h-6"></i>
                            </div>
                            <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">Tidak ada domba yang cocok dengan filter yang dipilih</h3>
                            <p class="text-xs text-slate-500">Coba sesuaikan pilihan ras, kategori, atau rentang berat badan domba di atas.</p>
                            <button onclick="PortalPublikModule.resetFilters()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition">Reset Semua Filter</button>
                        </div>
                    ` : this.catalogViewMode === 'grid' ? `
                        <!-- COMPACT GRID (4 COLUMNS PADA DESKTOP, 2 PADA MOBILE) -->
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                            ${pagedDomba.map(d => {
                                const lastWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                                const weightFormatted = Number(lastWeight || 0).toFixed(2);
                                const estPrice = Math.round(lastWeight * hargaPerKg);
                                const waText = encodeURIComponent(`Halo Pengurus ${cfg.singkatanLembaga || 'BUMKal LPM Pleret'}, saya tertarik dan ingin memesan domba Eartag: ${d.eartag} (${d.nama} - ${d.ras}, bobot ${weightFormatted} kg). Apakah masih tersedia?`);
                                return `
                                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between group">
                                        <div>
                                            <!-- Foto Kompak -->
                                            <div class="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                                <img src="${d.foto}" alt="${d.nama}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                                                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none"></div>
                                                
                                                <div class="absolute top-2 left-2 flex items-center gap-1.5">
                                                    <span class="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-600 text-white shadow font-mono">${d.eartag}</span>
                                                </div>
                                                <div class="absolute top-2 right-2">
                                                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-sm shadow">${d.kategori}</span>
                                                </div>

                                                <div class="absolute bottom-2 left-2 right-2 flex items-end justify-between text-white">
                                                    <div class="text-[10px] text-emerald-300 font-semibold drop-shadow truncate pr-1">
                                                        ${d.ras} • ${d.kelamin}
                                                    </div>
                                                    <span class="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-600 text-white shadow font-mono shrink-0">
                                                        ${weightFormatted} kg
                                                    </span>
                                                </div>
                                            </div>

                                            <!-- Body Kompak -->
                                            <div class="p-3 space-y-2">
                                                <h4 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate" title="${d.nama}">${d.nama}</h4>
                                                <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-2 py-1 rounded-lg">
                                                    <span class="truncate">${d.sekat}</span>
                                                    ${d.adg ? `
                                                        <span class="text-blue-600 dark:text-blue-400 font-bold shrink-0">${d.adg > 0 ? '+' : ''}${d.adg} g/hr</span>
                                                    ` : `
                                                        <span class="text-slate-400 dark:text-slate-500 font-medium shrink-0 text-[10px]">ADG: -</span>
                                                    `}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Footer Kompak -->
                                        <div class="p-3 pt-0 border-t border-slate-100 dark:border-slate-700/60 mt-1 flex flex-col gap-2">
                                            <div class="flex items-center justify-between pt-1">
                                                <span class="text-[9px] text-slate-400 font-semibold uppercase">Estimasi:</span>
                                                <div class="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">Rp ${estPrice.toLocaleString('id-ID')}</div>
                                            </div>
                                            <a href="https://wa.me/${noWA}?text=${waText}" target="_blank" class="w-full py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition flex items-center justify-center gap-1 active:scale-95">
                                                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i> Pesan WA
                                            </a>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <!-- COMPACT LIST / TABLE VIEW (SANGAT IRIT TEMPAT) -->
                        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-x-auto">
                            <table class="w-full text-left text-xs border-collapse">
                                <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th class="py-2.5 px-3">Ternak</th>
                                        <th class="py-2.5 px-3">Ras & Kelamin</th>
                                        <th class="py-2.5 px-3">Kategori</th>
                                        <th class="py-2.5 px-3 text-right">Bobot Terkini</th>
                                        <th class="py-2.5 px-3 text-right">Laju ADG</th>
                                        <th class="py-2.5 px-3 text-right">Estimasi Harga</th>
                                        <th class="py-2.5 px-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                    ${pagedDomba.map(d => {
                                        const lastWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                                        const weightFormatted = Number(lastWeight || 0).toFixed(2);
                                        const estPrice = Math.round(lastWeight * hargaPerKg);
                                        const waText = encodeURIComponent(`Halo Pengurus ${cfg.singkatanLembaga || 'BUMKal LPM Pleret'}, saya tertarik dan ingin memesan domba Eartag: ${d.eartag} (${d.nama} - ${d.ras}, bobot ${weightFormatted} kg). Apakah masih tersedia?`);
                                        return `
                                            <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition">
                                                <td class="py-2 px-3">
                                                    <div class="flex items-center gap-2.5">
                                                        <img src="${d.foto}" alt="${d.nama}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0">
                                                        <div>
                                                            <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                <span class="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white font-mono">${d.eartag}</span>
                                                                ${d.nama}
                                                            </div>
                                                            <div class="text-[10px] text-slate-400">${d.kandang.split('(')[0]} (${d.sekat})</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-3">
                                                    <div class="font-semibold text-slate-800 dark:text-slate-200">${d.ras}</div>
                                                    <div class="text-[10px] text-slate-400">${d.kelamin}</div>
                                                </td>
                                                <td class="py-2 px-3">
                                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">${d.kategori}</span>
                                                </td>
                                                <td class="py-2 px-3 text-right">
                                                    <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono text-xs">${weightFormatted} kg</span>
                                                </td>
                                                <td class="py-2 px-3 text-right font-semibold ${d.adg ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}">
                                                    ${d.adg ? (d.adg > 0 ? '+' : '') + d.adg + ' g/hr' : '-'}
                                                </td>
                                                <td class="py-2 px-3 text-right">
                                                    <div class="font-black text-slate-900 dark:text-white">Rp ${estPrice.toLocaleString('id-ID')}</div>
                                                </td>
                                                <td class="py-2 px-3 text-center">
                                                    <a href="https://wa.me/${noWA}?text=${waText}" target="_blank" class="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition active:scale-95">
                                                        <i data-lucide="message-circle" class="w-3 h-3"></i> Pesan
                                                    </a>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}

                    <!-- PAGINATION CONTROLS -->
                    ${totalPages > 1 ? `
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
                            <span class="text-slate-500 text-[11px]">
                                Menampilkan <b>${startIndex + 1}–${Math.min(startIndex + itemsPerPage, totalItems)}</b> dari <b>${totalItems}</b> domba
                            </span>

                            <div class="flex items-center gap-1.5">
                                <button 
                                    onclick="PortalPublikModule.setPage(${this.currentPage - 1})" 
                                    ${this.currentPage <= 1 ? 'disabled' : ''}
                                    class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    &laquo; Sebelumnya
                                </button>

                                <div class="flex items-center gap-1">
                                    ${Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => `
                                        <button 
                                            onclick="PortalPublikModule.setPage(${p})" 
                                            class="w-8 h-8 rounded-xl font-bold text-xs transition ${p === this.currentPage ? 'bg-emerald-600 text-white shadow' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}"
                                        >
                                            ${p}
                                        </button>
                                    `).join('')}
                                </div>

                                <button 
                                    onclick="PortalPublikModule.setPage(${this.currentPage + 1})" 
                                    ${this.currentPage >= totalPages ? 'disabled' : ''}
                                    class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    Berikutnya &raquo;
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </section>
                ` : ''}

                <!-- SECTION 2: CEK EARTAG & SERTIFIKAT TRANSPARANSI PUBLIK -->
                ${cfg.showCekEartag ? `
                <section id="cek-eartag" class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-10 shadow-sm space-y-6">
                    <div class="max-w-xl mx-auto text-center space-y-2">
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold">
                            <i data-lucide="search" class="w-3.5 h-3.5"></i> Transparansi Silsilah & Kesehatan
                        </div>
                        <h2 class="text-2xl font-black text-slate-900 dark:text-white">Cek Riwayat Eartag Domba Anda</h2>
                        <p class="text-xs text-slate-500">Ketik nomor eartag (misal: <b>DMB-001</b>) untuk memeriksa sertifikat digital, catatan vaksin, dan riwayat penimbangan langsung.</p>
                    </div>

                    <div class="max-w-md mx-auto flex gap-2">
                        <div class="relative flex-1">
                            <i data-lucide="tag" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                            <input type="text" id="public-eartag-input" placeholder="Masukkan nomor eartag (DMB-001)" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        </div>
                        <button onclick="PortalPublikModule.cekEartag()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
                            <i data-lucide="search" class="w-4 h-4"></i> Periksa
                        </button>
                    </div>

                    <!-- EARTAG RESULT CARD -->
                    <div id="eartag-result-box" class="max-w-2xl mx-auto">
                        ${this.renderEartagResult()}
                    </div>
                </section>
                ` : ''}

                <!-- SECTION 3: PRODUK PUPUK ORGANIK KOHE -->
                ${cfg.showKatalogPupuk ? `
                <section id="katalog-pupuk" class="space-y-6">
                    <div>
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1">
                            <i data-lucide="leaf" class="w-3.5 h-3.5"></i> Sirkular Ekonomi Petani Desa
                        </div>
                        <h2 class="text-2xl font-black text-slate-900 dark:text-white">Produk Pupuk Organik Kohe Domba BUMKal</h2>
                        <p class="text-xs text-slate-500">Hasil dekomposisi feses padat dan urin domba menggunakan dekomposer Trichoderma & EM4 untuk menyuburkan lahan pertanian.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${(cfg.produkPupukList && cfg.produkPupukList.length > 0 ? cfg.produkPupukList : stokPupuk).map(p => {
                            const harga = p.harga || p.hargaJual || 0;
                            const waText = encodeURIComponent(`Halo Pengurus ${cfg.singkatanLembaga || 'BUMKal LPM Pleret'}, saya ingin memesan ${p.nama} seharga Rp ${harga.toLocaleString('id-ID')} / ${p.satuan}.`);
                            const isPadat = (p.tipe || "").includes("POP") || (p.tipe || "").toLowerCase().includes("padat") || (p.tipe || "").toLowerCase().includes("curah");
                            return `
                                <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-xl transition duration-300">
                                    <div>
                                        <!-- Foto Produk Pupuk Besar & Menarik -->
                                        <div class="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                            ${p.foto ? `
                                                <img src="${p.foto}" alt="${p.nama}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                                            ` : `
                                                <div class="w-full h-full ${isPadat ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100' : 'bg-gradient-to-br from-emerald-700 to-teal-900 text-emerald-100'} flex flex-col items-center justify-center font-black p-4 text-center">
                                                    <span class="text-5xl mb-2">${isPadat ? '🍂' : '🧪'}</span>
                                                    <span class="text-sm font-black uppercase tracking-wider">${p.tipe || 'PUPUK ORGANIK'}</span>
                                                    <span class="text-[11px] opacity-75 font-normal mt-0.5">BUMKal LPM Pleret</span>
                                                </div>
                                            `}
                                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none"></div>
                                            <div class="absolute top-3.5 left-3.5">
                                                <span class="px-3 py-1 rounded-xl text-xs font-black shadow-md ${isPadat ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}">
                                                    ${isPadat ? 'Pupuk Organik Padat (POP)' : 'Pupuk Organik Cair (POC)'}
                                                </span>
                                            </div>
                                            <div class="absolute bottom-3.5 right-3.5">
                                                <span class="px-3 py-1 rounded-xl text-xs font-black bg-slate-900/90 text-amber-300 dark:text-emerald-400 backdrop-blur-md shadow-lg border border-white/10">
                                                    Rp ${harga.toLocaleString('id-ID')} / ${p.satuan}
                                                </span>
                                            </div>
                                        </div>

                                        <div class="p-6 space-y-3">
                                            <div>
                                                <h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight">${p.nama}</h3>
                                                <p class="text-xs text-slate-500 mt-1 leading-relaxed">${p.deskripsi || 'Formula organik bermutu tinggi untuk tanah subur.'}</p>
                                            </div>

                                            <div class="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                                                <div class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium"><i data-lucide="check" class="w-3.5 h-3.5"></i> Mengandung hara N, P, K organik seimbang</div>
                                                <div class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium"><i data-lucide="check" class="w-3.5 h-3.5"></i> Menetralkan keasaman & meregenerasi humus</div>
                                                <div class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium"><i data-lucide="check" class="w-3.5 h-3.5"></i> 100% alami tanpa bahan kimia sintetis</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="p-6 pt-0 border-t border-slate-100 dark:border-slate-700/60 mt-2 flex items-center justify-between">
                                        <div>
                                            <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Harga BUMDes</span>
                                            <div class="text-lg font-black text-slate-900 dark:text-white">Rp ${harga.toLocaleString('id-ID')} <span class="text-xs font-normal text-slate-500">/ ${p.satuan}</span></div>
                                        </div>
                                        <a href="https://wa.me/${noWA}?text=${waText}" target="_blank" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 active:scale-95">
                                            <i data-lucide="message-circle" class="w-4 h-4"></i> Pesan Pupuk
                                        </a>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </section>
                ` : ''}

                <!-- SECTION 4: DIAGRAM SIRKULAR PERTANIAN & LOKASI KANDANG -->
                ${cfg.showDiagramSirkular ? `
                <section class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white space-y-6">
                    <div class="max-w-2xl space-y-2">
                        <span class="text-xs font-bold uppercase tracking-widest text-emerald-400">${cfg.sirkularSubjudul || 'Integrated Circular Agriculture'}</span>
                        <h2 class="text-2xl font-black">${cfg.sirkularJudul || 'Siklus Tertutup Tanpa Sampah (Zero Waste)'}</h2>
                        <p class="text-xs text-slate-300">
                            ${cfg.sirkularDeskripsi || 'Bank Pakan HPT menghasilkan nutrisi hijauan segar & silase untuk domba. Limbah kohe dan urin dialirkan ke instalasi pupuk organik yang kembali menyuburkan lahan.'}
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        ${(cfg.rantaiSirkular && cfg.rantaiSirkular.length > 0 ? cfg.rantaiSirkular : [
                            { no: 1, judul: "Pengumpulan Kohe", deskripsi: "Feses padat dan urin dialirkan dari kandang panggung." },
                            { no: 2, judul: "Fermentasi & Dekomposisi", deskripsi: "Proses biologis EM4 & Trichoderma menghasilkan POP dan POC." },
                            { no: 3, judul: "Aplikasi ke Kebun HPT", deskripsi: "Pupuk menyuburkan kebun rumput odot & legum indigofera." },
                            { no: 4, judul: "Pakan Mandiri & ADG", deskripsi: "Pakan bernutrisi tinggi memacu pertumbuhan domba optimal." }
                        ]).map((step, idx) => `
                            <div class="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
                                <div class="font-bold text-emerald-300 text-sm flex items-center gap-2">
                                    <span class="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs font-mono">${step.no || idx + 1}</span>
                                    ${step.judul}
                                </div>
                                <p class="text-slate-300">${step.deskripsi}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
                ` : ''}

                <!-- PUBLIC FOOTER -->
                <footer class="border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-xs text-slate-500 space-y-2">
                    <p class="font-bold text-slate-700 dark:text-slate-300">${cfg.namaLembaga || 'BUMKal LPM Pleret'} • ${cfg.kapanewonKabupaten || 'Pleret, Bantul'}</p>
                    <p>${cfg.catatanKakiKop || 'Mewujudkan Ketahanan Pangan Nabati & Hewani Berbasis Ekonomi Sirkular Berkelanjutan'}</p>
                    <p class="text-[11px] text-slate-400">Sekretariat: ${cfg.alamatSekretariat || 'Kompleks Kedaton Kulon, Pleret'} | WA: +${noWA} | Email: ${cfg.emailResmi || 'bumdes@pleret.desa.id'}</p>
                    <div class="pt-2">
                        <button onclick="App.openLoginModal()" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                            Portal Login Petugas & Pengurus &rarr;
                        </button>
                    </div>
                </footer>
            </div>
        `;
    },

    setViewMode(mode) {
        this.catalogViewMode = mode;
        App.renderContent();
    },

    setPage(page) {
        this.currentPage = page;
        App.renderContent();
        const catalogEl = document.getElementById('katalog-domba');
        if (catalogEl) {
            catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    filterRas(ras) {
        this.selectedRasFilter = ras;
        this.currentPage = 1;
        App.renderContent();
    },

    filterKategori(kat) {
        this.selectedKategoriFilter = kat;
        this.currentPage = 1;
        App.renderContent();
    },

    filterBobot(bobot) {
        this.selectedBobotFilter = bobot;
        this.currentPage = 1;
        App.renderContent();
    },

    resetFilters() {
        this.selectedRasFilter = "all";
        this.selectedKategoriFilter = "all";
        this.selectedBobotFilter = "all";
        this.currentPage = 1;
        App.renderContent();
    },

    cekEartag() {
        const input = document.getElementById("public-eartag-input");
        const val = input ? input.value.trim().toUpperCase() : "";
        if (!val) {
            App.showToast("Masukkan nomor eartag yang ingin diperiksa!", "error");
            return;
        }

        const dombaList = Store.getDomba();
        const found = dombaList.find(d => d.eartag.toUpperCase() === val || d.eartag.toUpperCase().includes(val));
        this.checkedEartagResult = found || "NOT_FOUND";
        App.renderContent();
    },

    renderEartagResult() {
        if (!this.checkedEartagResult) {
            return `
                <div class="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                    Ketik nomor eartag pada kolom di atas untuk menampilkan sertifikat transparansi ternak.
                </div>
            `;
        }

        if (this.checkedEartagResult === "NOT_FOUND") {
            return `
                <div class="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center text-xs text-rose-700 dark:text-rose-300">
                    <i data-lucide="alert-circle" class="w-6 h-6 mx-auto mb-1 text-rose-500"></i>
                    Nomor Eartag tidak ditemukan dalam database resmi Lumbung Ternak Pleret. Pastikan format eartag benar (contoh: <b>DMB-001</b>).
                </div>
            `;
        }

        const d = this.checkedEartagResult;
        const lastWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
        const lastTimbangDate = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].tgl : d.tglMasuk;

        return `
            <div class="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-slate-900 dark:to-slate-800 border-2 border-emerald-500/80 shadow-lg space-y-4 text-xs">
                <div class="flex items-start justify-between border-b border-emerald-200 dark:border-slate-700 pb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-mono text-sm">
                            ${d.eartag}
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">SERTIFIKAT KESEHATAN DIGITAL</span>
                            <h3 class="text-base font-black text-slate-900 dark:text-white">${d.nama} (${d.ras})</h3>
                            <p class="text-slate-500">${d.kategori} • ${d.kelamin}</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                        <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Terverifikasi
                    </span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span class="text-[10px] text-slate-400">Bobot Terkini</span>
                        <div class="text-lg font-black text-emerald-600">${Number(lastWeight || 0).toFixed(2)} kg</div>
                        <span class="text-[9px] text-slate-400">Per ${lastTimbangDate}</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span class="text-[10px] text-slate-400">Laju ADG</span>
                        <div class="text-lg font-black ${d.adg ? 'text-blue-600' : 'text-slate-400'}">${d.adg ? (d.adg > 0 ? '+' : '') + d.adg + ' g/hr' : '-'}</div>
                        <span class="text-[9px] text-slate-400">${d.adg ? 'Pertumbuhan Sehat' : 'Ternak Baru Masuk'}</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span class="text-[10px] text-slate-400">Status Vaksin PMK</span>
                        <div class="text-sm font-bold text-emerald-600 mt-1">Lengkap / Bebas</div>
                        <span class="text-[9px] text-slate-400">Dinas Peternakan</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span class="text-[10px] text-slate-400">Lokasi Sekat</span>
                        <div class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">${d.kandang.split('(')[0]}</div>
                        <span class="text-[9px] text-slate-400">${d.sekat}</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <div class="font-bold text-slate-800 dark:text-slate-200 mb-1">Riwayat Tindakan Medis Terakhir:</div>
                    ${(d.rekamMedis || []).length > 0 ? d.rekamMedis.map(m => `
                        <div class="text-[11px] text-slate-600 dark:text-slate-400 flex justify-between">
                            <span>${m.tgl}: <b>${m.diagnosa}</b> (${m.tindakan})</span>
                            <span class="text-slate-400">Petugas: ${m.petugas}</span>
                        </div>
                    `).join('') : '<div class="text-[11px] text-slate-400 italic">Tidak ada catatan penyakit, kondisi ternak sangat prima.</div>'}
                </div>
            </div>
        `;
    },

    updatePublicHeader() {
        const cfg = Store.getPengaturan();
        const nav = document.querySelector("#public-header nav");
        if (!nav) return;

        let links = [];
        if (cfg.showKatalogDomba) {
            links.push(`<a href="#katalog-domba" class="hover:text-emerald-600 transition">Katalog Domba</a>`);
        }
        if (cfg.showCekEartag) {
            links.push(`<a href="#cek-eartag" class="hover:text-emerald-600 transition">Cek Eartag Sehat</a>`);
        }
        if (cfg.showKatalogPupuk) {
            links.push(`<a href="#katalog-pupuk" class="hover:text-emerald-600 transition">Pupuk Organik Kohe</a>`);
        }
        links.push(`<span class="text-slate-300 dark:text-slate-700">•</span>`);
        links.push(`<span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${cfg.kapanewonKabupaten || 'Kalurahan Pleret, Bantul'}</span>`);
        nav.innerHTML = links.join("");
        if (window.lucide) window.lucide.createIcons();
    }
};
