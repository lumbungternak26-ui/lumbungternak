/**
 * Modul Dashboard Utama & Analitik Eksekutif
 */
const DashboardModule = {
    render() {
        const dombaList = Store.getDomba();
        const lahanList = Store.getLahan();
        const limbahBatches = Store.getBatchLimbah();
        const stokPupuk = Store.getStokPupuk();
        const tasks = Store.getTasks();
        const keuangan = Store.getKeuangan();
        const logs = Store.getLogs().slice(0, 6);
        const valuasi = Store.hitungValuasiAsetBiologis();

        // Hitung Saldo Kas
        let totalMasuk = 0;
        let totalKeluar = 0;
        keuangan.forEach(k => {
            if (k.tipe === "masuk") totalMasuk += k.nominal;
            else totalKeluar += k.nominal;
        });
        const saldoKas = totalMasuk - totalKeluar;

        // Hitung Total Produksi Pupuk Kompos & POC
        let totalKomposKarung = 0;
        let totalPOCBotol = 0;
        stokPupuk.forEach(p => {
            if (p.tipe === "POP") totalKomposKarung += p.stok;
            if (p.tipe === "POC") totalPOCBotol += p.stok;
        });

        // Hitung Rata-rata ADG domba penggemukan/sehat
        const dombaWithAdg = dombaList.filter(d => d.adg > 0);
        const avgAdg = dombaWithAdg.length > 0 
            ? Math.round(dombaWithAdg.reduce((acc, d) => acc + d.adg, 0) / dombaWithAdg.length)
            : 0;

        // Hitung Luas Total Lahan Bank Pakan
        const totalLuasLahan = lahanList.reduce((acc, l) => acc + (l.luasM2 || 0), 0);

        // Dynamic kohe & kompos metrics
        const koheList = Store.getKoheHarian ? Store.getKoheHarian() : [];
        const todayKohe = koheList.length > 0 ? koheList[0] : { fesesPadatKg: 0, urinLiter: 0 };
        const fesesDisplay = todayKohe.fesesPadatKg > 0 ? `~${todayKohe.fesesPadatKg} kg / hari` : '0 kg / hari';
        const urinDisplay = todayKohe.urinLiter > 0 ? `${todayKohe.urinLiter} liter urin` : '0 liter urin';

        const totalKomposKg = limbahBatches.reduce((acc, b) => acc + (b.outputKomposKg || 0), 0);
        const komposDisplay = totalKomposKg > 0 
            ? (totalKomposKg >= 1000 ? `${(totalKomposKg / 1000).toFixed(1)} Ton Kompos` : `${totalKomposKg} kg Kompos`) 
            : '0 kg Kompos';

        const lahanDisplay = totalLuasLahan > 0 ? `${totalLuasLahan.toLocaleString('id-ID')} m² Lahan` : '0 m² Lahan';

        // Dynamic Kandang Breakdown
        const countA = dombaList.filter(d => (d.kandang || '').includes('Kandang A')).length;
        const countB = dombaList.filter(d => (d.kandang || '').includes('Kandang B')).length;
        const countC = dombaList.filter(d => (d.kandang || '').includes('Kandang C')).length;

        const countDorperTexelA = dombaList.filter(d => (d.kandang || '').includes('Kandang A') && ((d.ras || '').includes('Dorper') || (d.ras || '').includes('Texel'))).length;
        const countGarutMerinoA = countA - countDorperTexelA;

        const countBuntingB = dombaList.filter(d => (d.kandang || '').includes('Kandang B') && ((d.status || '') === 'Bunting' || (d.kategori || '').includes('Induk'))).length;
        const countMenyusuiB = dombaList.filter(d => (d.kandang || '').includes('Kandang B') && ((d.kategori || '') === 'Cempe' || (d.status || '') === 'Menyusui')).length;

        const countSakitC = dombaList.filter(d => (d.kandang || '').includes('Kandang C') && ((d.status || '') === 'Sakit' || (d.status || '') === 'Karantina')).length;
        const countKarantinaLainC = countC - countSakitC;

        // Peringatan Dini Stok Pakan & Obat Menipis (ROP)
        const lowStockAlerts = Store.getLowStockAlerts ? Store.getLowStockAlerts() : [];
        const alertHtml = lowStockAlerts.length > 0 ? `
            <div class="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600/60 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 animate-bounce">
                            <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-extrabold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                                    Peringatan Dini: ${lowStockAlerts.length} Item Pakan/Obat di Bawah Batas Minimum (ROP)
                                </h3>
                                <span class="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase">Penting</span>
                            </div>
                            <p class="text-xs text-amber-800 dark:text-amber-300 mt-1">
                                Stok logistik berikut telah menyentuh batas pemesanan ulang. Segera lakukan restock agar tidak kehabisan secara mendadak:
                            </p>
                            <div class="mt-2.5 flex flex-wrap gap-2">
                                ${lowStockAlerts.map(a => `
                                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border ${a.urgensi === 'danger' ? 'border-rose-400 text-rose-700 dark:text-rose-300' : 'border-amber-300 text-amber-800 dark:text-amber-300'} text-xs font-semibold shadow-xs">
                                        <span class="w-2 h-2 rounded-full ${a.urgensi === 'danger' ? 'bg-rose-500' : 'bg-amber-500'}"></span>
                                        <span><b>${a.nama}</b>: Sisa ${a.stokTerkini} ${a.satuan} (Min: ${a.batasMinimum} ${a.satuan})</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <button onclick="App.navigate('stok_pakan_hpp')" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5 flex-shrink-0 self-start md:self-auto">
                        <i data-lucide="package-plus" class="w-4 h-4"></i> Kelola Stok
                    </button>
                </div>
            </div>
        ` : '';

        return `
            <div class="space-y-6">
                ${alertHtml}

                <!-- Welcome Banner -->
                <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 p-6 md:p-8 text-white shadow-xl">
                    <div class="relative z-10 max-w-2xl">
                        <div class="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30 mb-3">
                            <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Sistem Terpadu Kandang, Pertanian & Limbah Pleret
                        </div>
                        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-white">
                            Lumbung Ternak & Pangan Mataram
                        </h1>
                        <p class="mt-2 text-sm text-emerald-100/90 leading-relaxed">
                            Mewujudkan kedaulatan pangan desa melalui integrasi pemeliharaan domba unggul, bank pakan hijauan mandiri, dan siklus ekonomi sirkular pupuk organik dari limbah kotoran hewan.
                        </p>
                        <div class="mt-5 flex flex-wrap gap-2.5">
                            <button onclick="App.openModal('modal-timbang')" class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-900 shadow-md hover:bg-emerald-50 transition active:scale-95">
                                <i data-lucide="scale" class="w-4 h-4 text-emerald-700"></i> Catat Timbangan
                            </button>
                            <button onclick="App.openModal('modal-kohe')" class="inline-flex items-center gap-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-400/40 px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95">
                                <i data-lucide="recycle" class="w-4 h-4"></i> Input Kohe Harian
                            </button>
                            <button onclick="App.navigate('keuangan')" class="inline-flex items-center gap-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-950/80 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-100 transition active:scale-95">
                                <i data-lucide="shopping-cart" class="w-4 h-4"></i> Kasir POS BUMDes
                            </button>
                        </div>
                    </div>
                    <div class="absolute -right-10 -bottom-10 opacity-15 pointer-events-none hidden md:block">
                        <i data-lucide="activity" class="w-80 h-80 text-white"></i>
                    </div>
                </div>

                <!-- 6 KPI METRICS GRID -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <!-- 1. Total Populasi Domba -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                            <span class="text-xs font-semibold">Populasi Domba</span>
                            <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <i data-lucide="award" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-bold text-slate-900 dark:text-white">${valuasi.totalPopulasiAktif} <span class="text-xs font-normal text-slate-500">ekor</span></div>
                        <div class="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <i data-lucide="trending-up" class="w-3.5 h-3.5 mr-1"></i>
                            <span>${dombaList.filter(d => d.kategori === 'Cempe').length} cempe baru lahir</span>
                        </div>
                    </div>

                    <!-- 2. Rata-rata ADG -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                            <span class="text-xs font-semibold">Rata-rata ADG</span>
                            <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <i data-lucide="trending-up" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-bold text-slate-900 dark:text-white">${avgAdg} <span class="text-xs font-normal text-slate-500">g/hari</span></div>
                        <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Target penggemukan &gt; 200 g/hari
                        </div>
                    </div>

                    <!-- 3. Valuasi Aset Biologis -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                            <span class="text-xs font-semibold">Valuasi Ternak</span>
                            <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                                <i data-lucide="coins" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-lg font-bold text-slate-900 dark:text-white truncate">Rp ${(valuasi.totalValuasiRupiah / 1000000).toFixed(1)} jt</div>
                        <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Total bobot: <b>${valuasi.totalBobotKg} kg</b>
                        </div>
                    </div>

                    <!-- 4. Lahan Bank Pakan -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                            <span class="text-xs font-semibold">Bank Pakan HPT</span>
                            <div class="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                                <i data-lucide="sprout" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-bold text-slate-900 dark:text-white">${(totalLuasLahan / 1000).toFixed(1)} <span class="text-xs font-normal text-slate-500">ribu m²</span></div>
                        <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            ${lahanList.length} plot terintegrasi
                        </div>
                    </div>

                    <!-- 5. Stok Kompos & POC -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                            <span class="text-xs font-semibold">Stok Pupuk Siap</span>
                            <div class="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                <i data-lucide="package" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-xl font-bold text-slate-900 dark:text-white">${totalKomposKarung} <span class="text-xs font-normal text-slate-500">krg</span> | ${totalPOCBotol} <span class="text-xs font-normal text-slate-500">btl</span></div>
                        <div class="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            ${limbahBatches.filter(b => b.status.includes('Aktif') || b.status.includes('Hari')).length} batch fermentasi aktif
                        </div>
                    </div>

                    <!-- 6. Saldo Kas BUMDes -->
                    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                            <span class="text-xs font-semibold">Kas Operasional</span>
                            <div class="p-2 rounded-lg bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400">
                                <i data-lucide="wallet" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="text-lg font-bold text-emerald-700 dark:text-emerald-400 truncate">Rp ${(saldoKas / 1000000).toFixed(2)} jt</div>
                        <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Masuk: Rp ${(totalMasuk / 1000000).toFixed(1)} jt
                        </div>
                    </div>
                </div>

                <!-- MAIN WORKSPACE CONTENT: 2 COLUMNS -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left: 2 Spans (Visual Data & Quick Lists) -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Distribusi Kandang & Ras -->
                        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <i data-lucide="layers" class="w-5 h-5 text-emerald-600"></i> Distribusi Ternak per Kandang & Sekat
                                    </h3>
                                    <p class="text-xs text-slate-500">Pemetaan populasi aktif di fasilitas kandang terpadu Pleret</p>
                                </div>
                                <button onclick="App.navigate('domba')" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                                    Lihat Semua &rarr;
                                </button>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <!-- Kandang A -->
                                <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/50 dark:bg-slate-900/30">
                                    <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        <span>Kandang A (Pejantan & Fattening)</span>
                                        <span class="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[11px]">
                                            ${countA} ekor
                                        </span>
                                    </div>
                                    <p class="text-[11px] text-slate-500 mb-2">Target kesiapan kurban & bibit pejantan unggul</p>
                                    <div class="space-y-1.5 text-xs">
                                        <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                            <span class="text-slate-600 dark:text-slate-400">Dorper & Texel:</span>
                                            <span class="font-semibold text-slate-800 dark:text-slate-200">${countDorperTexelA} ekor</span>
                                        </div>
                                        <div class="flex justify-between py-1">
                                            <span class="text-slate-600 dark:text-slate-400">Garut & Lainnya:</span>
                                            <span class="font-semibold text-slate-800 dark:text-slate-200">${Math.max(0, countGarutMerinoA)} ekor</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Kandang B -->
                                <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/50 dark:bg-slate-900/30">
                                    <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        <span>Kandang B (Induk & Breeding)</span>
                                        <span class="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[11px]">
                                            ${countB} ekor
                                        </span>
                                    </div>
                                    <p class="text-[11px] text-slate-500 mb-2">Koloni indukan laktasi & pemeliharaan cempe</p>
                                    <div class="space-y-1.5 text-xs">
                                        <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                            <span class="text-slate-600 dark:text-slate-400">Indukan Bunting:</span>
                                            <span class="font-semibold text-amber-600 dark:text-amber-400">${countBuntingB} ekor</span>
                                        </div>
                                        <div class="flex justify-between py-1">
                                            <span class="text-slate-600 dark:text-slate-400">Cempe Menyusui:</span>
                                            <span class="font-semibold text-emerald-600 dark:text-emerald-400">${countMenyusuiB} ekor</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Kandang C -->
                                <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/50 dark:bg-slate-900/30">
                                    <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        <span>Kandang C (Karantina Medis)</span>
                                        <span class="rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-[11px]">
                                            ${countC} ekor
                                        </span>
                                    </div>
                                    <p class="text-[11px] text-slate-500 mb-2">Isolasi ternak sakit & kedatangan baru</p>
                                    <div class="space-y-1.5 text-xs">
                                        <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                            <span class="text-slate-600 dark:text-slate-400">Observasi Medis:</span>
                                            <span class="font-semibold text-rose-600 dark:text-rose-400">${countSakitC} ekor</span>
                                        </div>
                                        <div class="flex justify-between py-1">
                                            <span class="text-slate-600 dark:text-slate-400">Ternak Sehat/Lain:</span>
                                            <span class="font-semibold text-slate-600 dark:text-slate-300">${Math.max(0, countKarantinaLainC)} ekor</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Siklus Sirkular Limbah Kohe & Bank Pakan -->
                        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <i data-lucide="refresh-cw" class="w-5 h-5 text-teal-600"></i> Alur Integrasi Sirkular (Integrated Closed-Loop)
                                    </h3>
                                    <p class="text-xs text-slate-500">Hubungan timbal balik antara limbah kotoran domba dan kesuburan bank pakan</p>
                                </div>
                                <button onclick="App.navigate('limbah')" class="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                                    Modul Limbah &rarr;
                                </button>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <div class="p-4 rounded-xl bg-gradient-to-b from-amber-50 to-orange-50/30 dark:from-amber-950/20 dark:to-slate-800 border border-amber-200/60 dark:border-amber-900/30">
                                    <div class="w-10 h-10 mx-auto rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2">
                                        <i data-lucide="sparkles" class="w-5 h-5"></i>
                                    </div>
                                    <div class="text-xs font-bold text-slate-700 dark:text-slate-200">1. Input Kohe Harian</div>
                                    <div class="text-lg font-extrabold text-amber-700 dark:text-amber-400 mt-1">${fesesDisplay}</div>
                                    <p class="text-[11px] text-slate-500 mt-1">Feses padat & ${urinDisplay} terkumpul dari talang kandang.</p>
                                </div>

                                <div class="p-4 rounded-xl bg-gradient-to-b from-emerald-50 to-teal-50/30 dark:from-emerald-950/20 dark:to-slate-800 border border-emerald-200/60 dark:border-emerald-900/30">
                                    <div class="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2">
                                        <i data-lucide="flask-conical" class="w-5 h-5"></i>
                                    </div>
                                    <div class="text-xs font-bold text-slate-700 dark:text-slate-200">2. Fermentasi Dekomposisi</div>
                                    <div class="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">${komposDisplay}</div>
                                    <p class="text-[11px] text-slate-500 mt-1">Diolah dengan Trichoderma & EM4 menjadi pupuk halus tak berbau.</p>
                                </div>

                                <div class="p-4 rounded-xl bg-gradient-to-b from-blue-50 to-indigo-50/30 dark:from-blue-950/20 dark:to-slate-800 border border-blue-200/60 dark:border-blue-900/30">
                                    <div class="w-10 h-10 mx-auto rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-2">
                                        <i data-lucide="leaf" class="w-5 h-5"></i>
                                    </div>
                                    <div class="text-xs font-bold text-slate-700 dark:text-slate-200">3. Bank Pakan & Petani</div>
                                    <div class="text-lg font-extrabold text-blue-700 dark:text-blue-400 mt-1">${lahanDisplay}</div>
                                    <p class="text-[11px] text-slate-500 mt-1">Menghasilkan hijauan Odot berlimpah dan hasil jual karungan BUMDes.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: 1 Span (Tasks & Live Activity Logs) -->
                    <div class="space-y-6">
                        <!-- Tugas Prioritas Tinggi -->
                        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <i data-lucide="check-square" class="w-4 h-4 text-emerald-600"></i> Tugas Mendesak
                                </h3>
                                <button onclick="App.navigate('kanban')" class="text-xs text-emerald-600 font-semibold hover:underline">
                                    Buka Papan &rarr;
                                </button>
                            </div>

                            <div class="space-y-2.5">
                                ${tasks.filter(t => t.status !== 'done').length === 0 ? `
                                    <div class="p-4 text-center text-slate-400 text-xs">
                                        <i data-lucide="check-circle" class="w-6 h-6 mx-auto text-emerald-500 mb-1"></i>
                                        <p class="font-medium text-slate-600 dark:text-slate-400">Semua tugas operasional selesai!</p>
                                    </div>
                                ` : tasks.filter(t => t.status !== 'done').slice(0, 3).map(t => `
                                    <div class="p-3 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 transition">
                                        <div class="flex items-center justify-between text-xs mb-1">
                                            <span class="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">${t.judul}</span>
                                            <span class="px-2 py-0.5 text-[10px] font-bold rounded ${t.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}">${t.priority}</span>
                                        </div>
                                        <div class="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                                            <span class="flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i> ${t.assigneeNama}</span>
                                            <span class="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium"><i data-lucide="calendar" class="w-3 h-3"></i> ${t.dueDate}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Live Activity Logs (Audit Trail) -->
                        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <i data-lucide="clock" class="w-4 h-4 text-slate-500"></i> Riwayat Aktivitas Terbaru
                                </h3>
                                <button onclick="App.navigate('sdm_agenda')" class="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400">
                                    Detail
                                </button>
                            </div>

                            <div class="space-y-3">
                                ${logs.length === 0 ? `
                                    <div class="p-4 text-center text-slate-400 text-xs">
                                        Belum ada catatan aktivitas sistem.
                                    </div>
                                ` : logs.map(log => `
                                    <div class="flex gap-2.5 text-xs items-start">
                                        <div class="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                                        <div class="flex-1">
                                            <p class="text-slate-700 dark:text-slate-300 text-[11px] font-medium leading-tight">${log.aksi}</p>
                                            <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                                <span><b>${log.user}</b></span>
                                                <span>•</span>
                                                <span>${log.tgl}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

window.DashboardModule = DashboardModule;
