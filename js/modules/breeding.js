/**
 * Modul Siklus Breeding & Reproduksi Domba Terpadu
 * BUMKal Lumbung Pangan Mataram Pleret
 */

const BreedingModule = {
    activeTab: "kawin", // "kawin" | "kelahiran" | "mortalitas"

    render() {
        const kawinList = Store.getBreedingKawin ? Store.getBreedingKawin() : [];
        const lahirList = Store.getBreedingKelahiran ? Store.getBreedingKelahiran() : [];
        const matiList = Store.getBreedingKematian ? Store.getBreedingKematian() : [];
        const allDomba = Store.getDomba ? Store.getDomba() : [];

        // Hitung Statistik KPI
        const totalKawin = kawinList.length;
        const buntingAktif = kawinList.filter(k => k.statusKebuntingan === "Bunting" || k.statusKebuntingan === "Menunggu Cek USG/Palpasi").length;
        
        let totalCempeHidup = 0;
        lahirList.forEach(l => {
            totalCempeHidup += (parseInt(l.jumlahHidup) || 0);
        });

        const totalKematian = matiList.length;
        const populasiAktif = allDomba.filter(d => d.status !== "Mati" && d.status !== "Terjual").length;
        const mortalityRate = (populasiAktif + totalKematian) > 0 
            ? ((totalKematian / (populasiAktif + totalKematian)) * 100).toFixed(1) 
            : "0.0";

        return `
        <div class="space-y-6 pb-12">
            <!-- Header Banner -->
            <div class="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-2">
                            <i data-lucide="heart" class="w-3.5 h-3.5"></i> Siklus Pembiakan & Perbibitan
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-black tracking-tight">Siklus Breeding & Reproduksi</h1>
                        <p class="text-rose-100 text-xs sm:text-sm mt-1 max-w-2xl">
                            Monitoring perkawinan, estimasi HPL (150 hari), silsilah kelahiran cempe otomatis, serta pemantauan mortalitas & biosecurity ternak BUMKal LPM Pleret.
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button onclick="BreedingModule.openModalKawin()" class="px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Catat Perkawinan
                        </button>
                        <button onclick="BreedingModule.openModalKelahiran()" class="px-4 py-2.5 bg-rose-900/40 hover:bg-rose-900/60 border border-white/30 text-white rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 active:scale-95">
                            <i data-lucide="baby" class="w-4 h-4"></i> Catat Kelahiran
                        </button>
                        <button onclick="BreedingModule.openModalMortalitas()" class="px-4 py-2.5 bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 text-white rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 active:scale-95">
                            <i data-lucide="skull" class="w-4 h-4"></i> Catat Kematian
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Perkawinan Aktif</span>
                        <div class="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                            <i data-lucide="heart-handshake" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="mt-3 flex items-baseline gap-2">
                        <span class="text-2xl font-black text-slate-900 dark:text-white">${totalKawin}</span>
                        <span class="text-xs text-slate-500">siklus tercatat</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Induk Bunting (Siaga HPL)</span>
                        <div class="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <i data-lucide="clock" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="mt-3 flex items-baseline gap-2">
                        <span class="text-2xl font-black text-rose-600 dark:text-rose-400">${buntingAktif}</span>
                        <span class="text-xs text-slate-500">ekor bunting</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Cempe Lahir Hidup</span>
                        <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <i data-lucide="sparkles" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="mt-3 flex items-baseline gap-2">
                        <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">${totalCempeHidup}</span>
                        <span class="text-xs text-slate-500">ekor cempe</span>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Tingkat Mortalitas</span>
                        <div class="w-8 h-8 rounded-xl ${parseFloat(mortalityRate) > 5 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'} flex items-center justify-center">
                            <i data-lucide="activity" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="mt-3 flex items-baseline gap-2">
                        <span class="text-2xl font-black ${parseFloat(mortalityRate) > 5 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}">${mortalityRate}%</span>
                        <span class="text-xs text-slate-500">(${totalKematian} ekor)</span>
                    </div>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="flex border-b border-slate-200 dark:border-slate-700 gap-2 overflow-x-auto">
                <button type="button" id="btn-tab-kawin" onclick="BreedingModule.switchTab('kawin')" class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${this.activeTab === 'kawin' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">
                    <i data-lucide="heart" class="w-4 h-4 pointer-events-none"></i> 1. Pencatatan Perkawinan & HPL
                </button>
                <button type="button" id="btn-tab-kelahiran" onclick="BreedingModule.switchTab('kelahiran')" class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${this.activeTab === 'kelahiran' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">
                    <i data-lucide="baby" class="w-4 h-4 pointer-events-none"></i> 2. Kelahiran Cempe & Silsilah
                </button>
                <button type="button" id="btn-tab-mortalitas" onclick="BreedingModule.switchTab('mortalitas')" class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${this.activeTab === 'mortalitas' ? 'border-rose-600 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">
                    <i data-lucide="skull" class="w-4 h-4 pointer-events-none"></i> 3. Mortalitas & Biosecurity
                </button>
            </div>

            <!-- Tab Content -->
            <div id="breeding-tab-content" class="mt-4">
                ${this.activeTab === 'kawin' ? this.renderTabKawin(kawinList) : ''}
                ${this.activeTab === 'kelahiran' ? this.renderTabKelahiran(lahirList) : ''}
                ${this.activeTab === 'mortalitas' ? this.renderTabMortalitas(matiList, mortalityRate, totalKematian, populasiAktif) : ''}
            </div>
        </div>
        `;
    },

    switchTab(tab) {
        this.activeTab = tab;
        if (window.App) {
            window.App.currentView = "admin";
            window.App.currentRoute = "siklus_breeding";
            try {
                localStorage.setItem("kandang_current_view", "admin");
                localStorage.setItem("kandang_current_route", "siklus_breeding");
            } catch(e) {}
        }

        const container = document.getElementById("breeding-tab-content");
        if (container) {
            const kawinList = Store.getBreedingKawin ? Store.getBreedingKawin() : [];
            const lahirList = Store.getBreedingKelahiran ? Store.getBreedingKelahiran() : [];
            const matiList = Store.getBreedingKematian ? Store.getBreedingKematian() : [];
            const allDomba = Store.getDomba ? Store.getDomba() : [];
            const totalKematian = matiList.length;
            const populasiAktif = allDomba.filter(d => d.status !== "Mati" && d.status !== "Terjual").length;
            const mortalityRate = (populasiAktif + totalKematian) > 0 
                ? ((totalKematian / (populasiAktif + totalKematian)) * 100).toFixed(1) 
                : "0.0";

            if (tab === 'kawin') {
                container.innerHTML = this.renderTabKawin(kawinList);
            } else if (tab === 'kelahiran') {
                container.innerHTML = this.renderTabKelahiran(lahirList);
            } else if (tab === 'mortalitas') {
                container.innerHTML = this.renderTabMortalitas(matiList, mortalityRate, totalKematian, populasiAktif);
            }

            // Update tab button CSS classes
            const tabKeys = ['kawin', 'kelahiran', 'mortalitas'];
            tabKeys.forEach(k => {
                const btn = document.getElementById(`btn-tab-${k}`);
                if (btn) {
                    if (k === tab) {
                        btn.className = "px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap border-rose-600 text-rose-600 dark:text-rose-400";
                    } else {
                        btn.className = "px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300";
                    }
                }
            });

            if (window.lucide) {
                window.lucide.createIcons();
            }
            return;
        }

        if (window.App && typeof App.renderContent === "function") {
            App.renderContent();
        }
    },

    // --- TAB 1: PERKAWINAN & HPL KEBUNTINGAN ---
    renderTabKawin(list) {
        if (list.length === 0) {
            return `
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div class="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="heart" class="w-8 h-8"></i>
                </div>
                <h3 class="font-bold text-base text-slate-900 dark:text-white">Belum Ada Catatan Perkawinan</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                    Silakan catat perkawinan pejantan dan betina untuk otomatis menghitung estimasi HPL kelahiran cempe (150 hari).
                </p>
                <button onclick="BreedingModule.openModalKawin()" class="mt-5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition inline-flex items-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i> Catat Perkawinan Pertama
                </button>
            </div>
            `;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rows = list.map(item => {
            const hplStr = item.estimasiHpl || item.estimasiHPL || '';
            const hplDate = hplStr ? new Date(hplStr) : null;
            let diffDays = null;
            if (hplDate && !isNaN(hplDate.getTime())) {
                hplDate.setHours(0, 0, 0, 0);
                diffDays = Math.ceil((hplDate - today) / (1000 * 60 * 60 * 24));
            }

            let countdownBadge = "";
            if (item.statusKebuntingan === "Sudah Melahirkan") {
                countdownBadge = `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">Lahir Selesai</span>`;
            } else if (item.statusKebuntingan === "Gagal") {
                countdownBadge = `<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 text-[10px] font-bold">Gagal</span>`;
            } else if (diffDays === null) {
                countdownBadge = `<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 text-[10px] font-bold">-</span>`;
            } else if (diffDays < 0) {
                countdownBadge = `<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-black animate-pulse">Lewat HPL (+${Math.abs(diffDays)} hr)</span>`;
            } else if (diffDays <= 7) {
                countdownBadge = `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-black animate-pulse">Siaga HPL (${diffDays} hr lagi)</span>`;
            } else {
                countdownBadge = `<span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-bold">H-${diffDays} hari</span>`;
            }

            let statusBadge = "";
            if (item.statusKebuntingan === "Bunting") {
                statusBadge = `<span class="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold">Bunting</span>`;
            } else if (item.statusKebuntingan === "Sudah Melahirkan") {
                statusBadge = `<span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">Melahirkan</span>`;
            } else {
                statusBadge = `<span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold">${item.statusKebuntingan || 'Observasi'}</span>`;
            }

            return `
            <tr class="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-750 text-xs">
                <td class="p-3.5">
                    <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <i data-lucide="tag" class="w-3.5 h-3.5 text-rose-500"></i> ${item.betinaEartag}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${item.kandangSekat || 'Kandang Breeding'}</div>
                </td>
                <td class="p-3.5">
                    <div class="font-semibold text-slate-800 dark:text-slate-200">
                        ${item.pejantanEartag}
                    </div>
                    <div class="text-[10px] text-slate-400">${item.metode || 'Alami'}</div>
                </td>
                <td class="p-3.5 text-slate-600 dark:text-slate-300">
                    ${item.tglKawin}
                </td>
                <td class="p-3.5">
                    <div class="font-bold text-slate-900 dark:text-white">${item.estimasiHpl}</div>
                    <div class="mt-1">${countdownBadge}</div>
                </td>
                <td class="p-3.5">
                    ${statusBadge}
                </td>
                <td class="p-3.5 max-w-xs truncate text-slate-500">
                    ${item.catatan || '-'}
                </td>
                <td class="p-3.5 text-right whitespace-nowrap space-x-1">
                    ${item.statusKebuntingan !== "Sudah Melahirkan" ? `
                    <button onclick="BreedingModule.openModalKelahiran('${item.id}')" title="Catat Kelahiran Induk Ini" class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg font-bold text-[11px] transition">
                        <i data-lucide="baby" class="w-3.5 h-3.5 inline"></i> Lahir
                    </button>
                    ` : ''}
                    <button onclick="BreedingModule.hapusKawin('${item.id}')" title="Hapus Riwayat" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join("");

        return `
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-sm text-slate-900 dark:text-white">Daftar Siklus Perkawinan & Jadwal HPL</h3>
                    <p class="text-[11px] text-slate-400">Masa bunting domba dihitung otomatis 150 hari kalender sejak tanggal perkawinan.</p>
                </div>
                <button onclick="BreedingModule.openModalKawin()" class="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5">
                    <i data-lucide="plus" class="w-4 h-4"></i> Tambah Perkawinan
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 dark:bg-slate-900/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                            <th class="p-3.5">Eartag Betina (Induk)</th>
                            <th class="p-3.5">Eartag Pejantan</th>
                            <th class="p-3.5">Tgl Kawin</th>
                            <th class="p-3.5">Estimasi HPL (150 Hari)</th>
                            <th class="p-3.5">Status Kebuntingan</th>
                            <th class="p-3.5">Catatan</th>
                            <th class="p-3.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    },

    // --- TAB 2: KELAHIRAN CEMPE & SILSILAH ---
    renderTabKelahiran(list) {
        if (list.length === 0) {
            return `
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="baby" class="w-8 h-8"></i>
                </div>
                <h3 class="font-bold text-base text-slate-900 dark:text-white">Belum Ada Catatan Kelahiran Cempe</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                    Setiap pencatatan kelahiran anak domba (cempe) akan otomatis masuk ke data Master Ternak beserta silsilah induk dan pejantan.
                </p>
                <button onclick="BreedingModule.openModalKelahiran()" class="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition inline-flex items-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i> Catat Kelahiran Baru
                </button>
            </div>
            `;
        }

        const cards = list.map(item => {
            const cempeBadges = (item.cempeList || []).map(c => `
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-lg ${c.kelamin === 'Jantan' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'} flex items-center justify-center font-bold text-[10px]">
                            ${c.kelamin === 'Jantan' ? '♂' : '♀'}
                        </span>
                        <div>
                            <div class="font-bold text-slate-900 dark:text-white">${c.eartag || 'Tanpa Eartag'}</div>
                            <div class="text-[10px] text-slate-400">${c.ras || 'Cross Dorper'}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-black text-emerald-600 dark:text-emerald-400">${c.bobotLahir || '-'} kg</div>
                        <div class="text-[9px] text-slate-400">Bobot Lahir</div>
                    </div>
                </div>
            `).join("");

            return `
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
                <div class="flex items-start justify-between">
                    <div>
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            <i data-lucide="calendar" class="w-3 h-3"></i> Tgl Lahir: ${item.tglLahir}
                        </div>
                        <h4 class="text-base font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                            <span>Induk: ${item.indukEartag}</span>
                            <span class="text-slate-300">×</span>
                            <span class="text-slate-600 dark:text-slate-300">Pejantan: ${item.pejantanEartag || '-'}</span>
                        </h4>
                        <div class="text-xs text-slate-500 mt-0.5">Lokasi: ${item.kandang} • ${item.sekat}</div>
                    </div>
                    <div class="text-right flex items-center gap-2">
                        <button onclick="BreedingModule.hapusKelahiran('${item.id}')" title="Hapus Riwayat Kelahiran" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                <!-- Detail Anak -->
                <div class="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl text-center">
                    <div>
                        <div class="text-[10px] text-slate-400 font-semibold uppercase">Total Lahir</div>
                        <div class="text-lg font-black text-slate-900 dark:text-white">${item.jumlahLahir || 1}</div>
                    </div>
                    <div>
                        <div class="text-[10px] text-emerald-600 font-semibold uppercase">Hidup</div>
                        <div class="text-lg font-black text-emerald-600">${item.jumlahHidup || 1}</div>
                    </div>
                    <div>
                        <div class="text-[10px] text-rose-500 font-semibold uppercase">Mati Lahir</div>
                        <div class="text-lg font-black text-rose-500">${item.jumlahMati || 0}</div>
                    </div>
                </div>

                <!-- Silsilah Cempe -->
                <div class="space-y-2">
                    <div class="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Anak Domba (Cempe Terdaftar):</span>
                        <span class="text-[10px] text-emerald-600 font-semibold">✓ Masuk Master Ternak</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${cempeBadges}
                    </div>
                </div>

                ${item.catatan ? `
                <div class="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 italic">
                    "${item.catatan}"
                </div>` : ''}
            </div>
            `;
        }).join("");

        return `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-sm text-slate-900 dark:text-white">Riwayat Kelahiran & Silsilah Cempe (Pedigree)</h3>
                    <p class="text-[11px] text-slate-400">Setiap cempe otomatis mendapatkan identitas silsilah dari induk dan pejantan pemacek.</p>
                </div>
                <button onclick="BreedingModule.openModalKelahiran()" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5">
                    <i data-lucide="plus" class="w-4 h-4"></i> Catat Kelahiran Baru
                </button>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                ${cards}
            </div>
        </div>
        `;
    },

    // --- TAB 3: MORTALITAS & BIOSECURITY ---
    renderTabMortalitas(list, mortalityRate, totalKematian, populasiAktif) {
        return `
        <div class="space-y-6">
            <!-- Biosecurity Alert Banner -->
            <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                        <i data-lucide="shield-alert" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm text-amber-900 dark:text-amber-300">Standar Biosecurity & Pelaporan Mortalitas (LPJ BUMKal)</h4>
                        <p class="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            Batas toleransi mortalitas kandang: <b>&lt; 5%</b>. Setiap kematian wajib melalui pemeriksaan klinis, dicatat dalam Berita Acara resmi, dan bangkai dikubur sesuai SOP biosecurity lingkungan.
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto flex-wrap">
                    <button onclick="App.navigate('berita_acara_ternak')" class="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                        <i data-lucide="file-check-2" class="w-4 h-4 text-emerald-600"></i> Register Berita Acara
                    </button>
                    <button onclick="BreedingModule.openModalMortalitas()" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-2 cursor-pointer">
                        <i data-lucide="plus" class="w-4 h-4"></i> Catat Kematian
                    </button>
                </div>
            </div>

            <!-- Tabel Data Kematian Terintegrasi Berita Acara -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Log Mortalitas & Penanganan Bangkai</span>
                            <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">Sinkron Berita Acara</span>
                        </h3>
                        <p class="text-[11px] text-slate-400">Total ${totalKematian} kasus kematian tercatat dari ${populasiAktif + totalKematian} total populasi ternak terdaftar.</p>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-900/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                <th class="p-3.5 pl-4">Eartag & Identitas</th>
                                <th class="p-3.5">Kategori / Lokasi</th>
                                <th class="p-3.5">Waktu Kejadian</th>
                                <th class="p-3.5">Diagnosa Klinis</th>
                                <th class="p-3.5">Tindakan Biosecurity</th>
                                <th class="p-3.5">Dokumen Berita Acara</th>
                                <th class="p-3.5 text-right pr-4">Aksi Legalitas</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
                            ${list.length === 0 ? `
                            <tr>
                                <td colspan="7" class="p-8 text-center text-xs text-slate-400">
                                    Alhamdulillah, belum ada catatan kasus kematian ternak (Mortalitas 0%).
                                </td>
                            </tr>
                            ` : list.map(item => `
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-750 transition">
                                <td class="p-3.5 pl-4">
                                    <div class="font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-sm">
                                        <i data-lucide="skull" class="w-3.5 h-3.5"></i> ${item.eartag}
                                    </div>
                                    <div class="text-[10px] text-slate-500 mt-0.5">${item.nama || '-'} (${item.ras || 'Domba'})</div>
                                </td>
                                <td class="p-3.5">
                                    <div class="font-semibold text-slate-800 dark:text-slate-200">${item.kategoriTernak || 'Ternak'}</div>
                                    <div class="text-[10px] text-slate-400">${item.kandang || 'Kandang'} • ${item.sekat || 'Sekat'}</div>
                                </td>
                                <td class="p-3.5">
                                    <div class="font-medium text-slate-800 dark:text-slate-200">${item.tglKematian}</div>
                                    <div class="text-[10px] font-mono text-slate-400">${item.jamKematian || '07:00 WIB'}</div>
                                </td>
                                <td class="p-3.5">
                                    <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-[10px]">
                                        ${item.penyebab}
                                    </span>
                                    ${item.catatan ? `<div class="text-[10px] text-slate-400 italic mt-1 max-w-xs truncate" title="${item.catatan}">"${item.catatan}"</div>` : ''}
                                </td>
                                <td class="p-3.5">
                                    <div class="text-slate-700 dark:text-slate-300 font-medium">${item.tindakanBangkai || 'Dikubur Sesuai SOP'}</div>
                                    <div class="text-[10px] text-slate-400 mt-0.5">Petugas: <b>${item.petugas || 'Paramedik'}</b></div>
                                </td>
                                <td class="p-3.5">
                                    ${item.beritaAcaraId ? `
                                        <div class="flex flex-col gap-1 items-start">
                                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-[10px] font-bold" title="${item.nomorSurat}">
                                                <i data-lucide="file-check-2" class="w-3 h-3 text-emerald-600"></i> ${item.nomorSurat || 'BA Terbit'}
                                            </span>
                                            <span class="text-[9px] text-slate-400">✓ Sah Dokumen LPJ BUMKal</span>
                                        </div>
                                    ` : `
                                        <span class="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 text-[10px] font-bold">
                                            Belum Ada BA
                                        </span>
                                    `}
                                </td>
                                <td class="p-3.5 text-right pr-4">
                                    <div class="flex items-center justify-end gap-1.5">
                                        ${item.beritaAcaraId ? `
                                            <button onclick="BeritaAcaraModule.cetakWindow('${item.beritaAcaraId}')" title="Cetak Berita Acara Resmi (A4)" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm transition cursor-pointer">
                                                <i data-lucide="printer" class="w-3.5 h-3.5"></i> Cetak BA
                                            </button>
                                            <button onclick="BeritaAcaraModule.lihatDetail('${item.beritaAcaraId}')" title="Lihat Detail Berita Acara" class="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer">
                                                <i data-lucide="eye" class="w-4 h-4"></i>
                                            </button>
                                        ` : ''}
                                        <button onclick="BreedingModule.hapusMortalitas('${item.id}')" title="Hapus Log Mortalitas & Berita Acara" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `;
    },

    // --- MODAL DIALOGS ---

    // 1. Modal Catat Perkawinan
    openModalKawin() {
        const domba = Store.getDomba ? Store.getDomba() : [];
        const pejantanList = domba.filter(d => (d.kategori === "Pejantan" || d.kelamin === "Jantan") && d.status !== "Mati");
        const betinaList = domba.filter(d => (d.kategori === "Indukan" || d.kelamin === "Betina") && d.status !== "Mati");

        const today = new Date().toISOString().split('T')[0];
        const defaultHpl = new Date();
        defaultHpl.setDate(defaultHpl.getDate() + 150);
        const defaultHplStr = defaultHpl.toISOString().split('T')[0];

        const html = `
        <div class="p-6 space-y-5">
            <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center">
                        <i data-lucide="heart" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white">Pencatatan Perkawinan Ternak</h3>
                        <p class="text-xs text-slate-500">Estimasi HPL otomatis 150 hari untuk persiapan kelahiran cempe.</p>
                    </div>
                </div>
                <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>

            <form onsubmit="BreedingModule.submitKawin(event)" class="space-y-4 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Eartag Pejantan (Pemacek)</label>
                        <select id="kwn-pejantan" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            <option value="">-- Pilih Pejantan --</option>
                            ${pejantanList.map(p => `<option value="${p.eartag}">${p.eartag} - ${p.nama || p.ras}</option>`).join("")}
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Eartag Betina (Indukan)</label>
                        <select id="kwn-betina" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            <option value="">-- Pilih Betina --</option>
                            ${betinaList.map(b => `<option value="${b.eartag}">${b.eartag} - ${b.nama || b.ras}</option>`).join("")}
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Kawin</label>
                        <input type="date" id="kwn-tgl" value="${today}" onchange="BreedingModule.hitungHplOtomatis(this.value)" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <label class="block font-semibold text-rose-600 dark:text-rose-400 mb-1">Estimasi HPL (150 Hari)</label>
                        <input type="date" id="kwn-hpl" value="${defaultHplStr}" required class="w-full p-2.5 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 font-bold text-rose-700 dark:text-rose-300">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Metode Kawin</label>
                        <select id="kwn-metode" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            <option value="Alami (Koloni)">Alami (Koloni Kandang)</option>
                            <option value="Alami (Hand Mating)">Alami (Hand Mating Terjadwal)</option>
                            <option value="Inseminasi Buatan (IB)">Inseminasi Buatan (IB / Straw)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Kebuntingan Awal</label>
                        <select id="kwn-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            <option value="Bunting">Bunting (Terpantau Berhasil)</option>
                            <option value="Menunggu Cek USG/Palpasi">Menunggu Cek USG/Palpasi (Observasi)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Kandang & Sekat</label>
                    <input type="text" id="kwn-kandang" placeholder="Contoh: Kandang Breeding A - Sekat 03" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                </div>

                <div>
                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
                    <textarea id="kwn-catatan" rows="2" placeholder="Catatan siklus birahi, vitamin E/Selenium, dll..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"></textarea>
                </div>

                <div class="pt-2 flex items-center justify-end gap-2">
                    <button type="button" onclick="App.closeModal()" class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold transition">Batal</button>
                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition flex items-center gap-2">
                        <i data-lucide="check" class="w-4 h-4"></i> Simpan Perkawinan
                    </button>
                </div>
            </form>
        </div>
        `;
        App.setModalContent(html);
        App.openModal();
    },

    hitungHplOtomatis(tglVal) {
        if (!tglVal) return;
        const d = new Date(tglVal);
        d.setDate(d.getDate() + 150);
        const hplEl = document.getElementById("kwn-hpl");
        if (hplEl) hplEl.value = d.toISOString().split('T')[0];
    },

    submitKawin(e) {
        e.preventDefault();
        const pejantan = document.getElementById("kwn-pejantan")?.value;
        const betina = document.getElementById("kwn-betina")?.value;
        const tgl = document.getElementById("kwn-tgl")?.value;
        const hpl = document.getElementById("kwn-hpl")?.value;
        const metode = document.getElementById("kwn-metode")?.value;
        const status = document.getElementById("kwn-status")?.value;
        const kandang = document.getElementById("kwn-kandang")?.value;
        const catatan = document.getElementById("kwn-catatan")?.value;

        if (!pejantan || !betina) {
            App.showToast("Pilih eartag pejantan dan betina!", "warning");
            return;
        }

        Store.addBreedingKawin({
            pejantanEartag: pejantan,
            betinaEartag: betina,
            tglKawin: tgl,
            estimasiHpl: hpl,
            metode: metode,
            statusKebuntingan: status,
            kandangSekat: kandang,
            catatan: catatan
        });

        App.closeModal();
        App.showToast("Data perkawinan & HPL berhasil dicatat!", "success");
        if (typeof App.renderContent === "function") App.renderContent();
    },

    hapusKawin(id) {
        if (confirm("Hapus catatan perkawinan ini?")) {
            Store.deleteBreedingKawin(id);
            App.showToast("Catatan perkawinan dihapus.", "info");
            if (typeof App.renderContent === "function") App.renderContent();
        }
    },

    // 2. Modal Catat Kelahiran Cempe
    openModalKelahiran(kawinId = "") {
        const kawinList = Store.getBreedingKawin ? Store.getBreedingKawin() : [];
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const betinaList = dombaList.filter(d => (d.kategori === "Indukan" || d.kelamin === "Betina") && d.status !== "Mati");
        const pejantanList = dombaList.filter(d => (d.kategori === "Pejantan" || d.kelamin === "Jantan") && d.status !== "Mati");

        const activeKawin = kawinId ? kawinList.find(k => k.id === kawinId) : null;
        const today = new Date().toISOString().split('T')[0];

        const html = `
        <div class="p-6 space-y-5">
            <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center">
                        <i data-lucide="baby" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white">Pencatatan Kelahiran & Silsilah Cempe</h3>
                        <p class="text-xs text-slate-500">Anak domba otomatis dimasukkan ke Master Domba BUMKal.</p>
                    </div>
                </div>
                <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>

            <form onsubmit="BreedingModule.submitKelahiran(event)" class="space-y-4 text-xs">
                <input type="hidden" id="lhr-kawin-id" value="${kawinId || ''}">

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Eartag Induk (Melahirkan)</label>
                        <select id="lhr-induk" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            <option value="">-- Pilih Induk --</option>
                            ${betinaList.map(b => `<option value="${b.eartag}" ${activeKawin && activeKawin.betinaEartag === b.eartag ? 'selected' : ''}>${b.eartag} - ${b.nama || b.ras}</option>`).join("")}
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Eartag Pejantan (Sire/Silsilah)</label>
                        <select id="lhr-pejantan" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            <option value="">-- Pilih Pejantan --</option>
                            ${pejantanList.map(p => `<option value="${p.eartag}" ${activeKawin && activeKawin.pejantanEartag === p.eartag ? 'selected' : ''}>${p.eartag} - ${p.nama || p.ras}</option>`).join("")}
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                        <input type="date" id="lhr-tgl" value="${today}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <label class="block font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Jumlah Hidup</label>
                        <input type="number" id="lhr-hidup" min="0" max="4" value="1" onchange="BreedingModule.renderCempeInputs()" required class="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-700 dark:text-emerald-300">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mati Lahir (Stillborn)</label>
                        <input type="number" id="lhr-mati" min="0" max="4" value="0" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kandang Bersalin</label>
                        <input type="text" id="lhr-kandang" value="Kandang Breeding" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sekat / Box</label>
                        <input type="text" id="lhr-sekat" value="Sekat 01" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                </div>

                <!-- Input Dinamis Detail Cempe -->
                <div class="border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-emerald-800 dark:text-emerald-300">Data Detail Anak Domba (Cempe Hidup)</span>
                        <span class="text-[10px] text-emerald-600">Otomatis buat Eartag & Masuk Master Ternak</span>
                    </div>
                    <div id="cempe-inputs-container" class="space-y-2">
                        <!-- Rendered by JS -->
                    </div>
                </div>

                <div>
                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Proses Persalinan</label>
                    <textarea id="lhr-catatan" rows="2" placeholder="Catatan persalinan normal/dibantu, kolostrum pertama, dll..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"></textarea>
                </div>

                <div class="pt-2 flex items-center justify-end gap-2">
                    <button type="button" onclick="App.closeModal()" class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold transition">Batal</button>
                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition flex items-center gap-2">
                        <i data-lucide="check" class="w-4 h-4"></i> Simpan Kelahiran & Cempe
                    </button>
                </div>
            </form>
        </div>
        `;
        App.setModalContent(html);
        App.openModal();
        this.renderCempeInputs();
    },

    renderCempeInputs() {
        const container = document.getElementById("cempe-inputs-container");
        if (!container) return;
        const count = parseInt(document.getElementById("lhr-hidup")?.value) || 1;
        const timeTail = Date.now().toString().slice(-3);

        let html = "";
        for (let i = 0; i < count; i++) {
            const defaultTag = `CMP-${timeTail}-${i + 1}`;
            html += `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                    <label class="block font-semibold text-[10px] text-slate-500 mb-0.5">Eartag Cempe #${i + 1}</label>
                    <input type="text" class="cempe-eartag w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold" value="${defaultTag}" required>
                </div>
                <div>
                    <label class="block font-semibold text-[10px] text-slate-500 mb-0.5">Jenis Kelamin</label>
                    <select class="cempe-kelamin w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        <option value="Jantan">Jantan ♂</option>
                        <option value="Betina">Betina ♀</option>
                    </select>
                </div>
                <div>
                    <label class="block font-semibold text-[10px] text-slate-500 mb-0.5">Bobot Lahir (kg)</label>
                    <input type="number" step="0.1" min="0.5" max="10" class="cempe-bobot w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value="2.8" required>
                </div>
            </div>
            `;
        }
        container.innerHTML = html;
    },

    submitKelahiran(e) {
        e.preventDefault();
        const kawinId = document.getElementById("lhr-kawin-id")?.value;
        const induk = document.getElementById("lhr-induk")?.value;
        const pejantan = document.getElementById("lhr-pejantan")?.value;
        const tgl = document.getElementById("lhr-tgl")?.value;
        const hidup = parseInt(document.getElementById("lhr-hidup")?.value) || 0;
        const mati = parseInt(document.getElementById("lhr-mati")?.value) || 0;
        const kandang = document.getElementById("lhr-kandang")?.value || "Kandang Breeding";
        const sekat = document.getElementById("lhr-sekat")?.value || "Sekat Bersalin";
        const catatan = document.getElementById("lhr-catatan")?.value;

        if (!induk) {
            App.showToast("Pilih eartag induk!", "warning");
            return;
        }

        const tags = document.querySelectorAll(".cempe-eartag");
        const genders = document.querySelectorAll(".cempe-kelamin");
        const weights = document.querySelectorAll(".cempe-bobot");

        const cempeList = [];
        tags.forEach((tagEl, idx) => {
            cempeList.push({
                eartag: tagEl.value.trim(),
                kelamin: genders[idx] ? genders[idx].value : "Jantan",
                bobotLahir: parseFloat(weights[idx]?.value) || 2.5,
                status: "Sehat"
            });
        });

        Store.addBreedingKelahiran({
            kawinId: kawinId,
            indukEartag: induk,
            pejantanEartag: pejantan,
            tglLahir: tgl,
            jumlahLahir: hidup + mati,
            jumlahHidup: hidup,
            jumlahMati: mati,
            kandang: kandang,
            sekat: sekat,
            cempeList: cempeList,
            catatan: catatan
        });

        App.closeModal();
        App.showToast(`Kelahiran berhasil disimpan! ${hidup} cempe otomatis masuk ke Master Domba.`, "success");
        if (typeof App.renderContent === "function") App.renderContent();
    },

    hapusKelahiran(id) {
        if (confirm("Hapus catatan kelahiran ini?")) {
            Store.deleteBreedingKelahiran(id);
            App.showToast("Catatan kelahiran dihapus.", "info");
            if (typeof App.renderContent === "function") App.renderContent();
        }
    },

    // 3. Modal Catat Kematian & Mortalitas Terintegrasi Berita Acara Resmi
    openModalMortalitas() {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const hidupDomba = dombaList.filter(d => d.status !== "Mati" && d.status !== "Afkir");
        const today = new Date().toISOString().split('T')[0];
        const nowTime = new Date().toTimeString().slice(0, 5) + " WIB";

        const html = `
        <div class="p-6 space-y-5">
            <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center">
                        <i data-lucide="skull" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white">Pencatatan Mortalitas & Penerbitan Berita Acara</h3>
                        <p class="text-xs text-slate-500">Standar audit LPJ BUMKal & SOP biosecurity penanganan bangkai.</p>
                    </div>
                </div>
                <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>

            <form onsubmit="BreedingModule.submitMortalitas(event)" class="space-y-4 text-xs">
                <!-- Baris 1: Pemilihan Domba -->
                <div>
                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Ternak *</label>
                    <select id="mor-domba" required onchange="BreedingModule.onDombaMatiChange(this.value)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        <option value="">-- Pilih Eartag Ternak --</option>
                        ${hidupDomba.map(d => `<option value="${d.eartag}" data-id="${d.id}" data-nama="${d.nama || ''}" data-ras="${d.ras || ''}" data-kategori="${d.kategori || 'Dewasa'}" data-kandang="${d.kandang || ''}" data-sekat="${d.sekat || ''}" data-bobot="${d.bobotTerkini || d.berat || 0}" data-harga="${d.hargaBeli || 0}">${d.eartag} - ${d.nama || d.ras} (${d.kategori || 'Ternak'} • ${d.kandang || 'Kandang'} ${d.sekat || ''})</option>`).join("")}
                    </select>
                </div>

                <!-- Info Preview Ternak Terpilih -->
                <div id="mor-ternak-info" class="hidden bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div><span class="text-slate-400 block">Nama / Ras:</span><strong id="mor-prev-ras" class="text-slate-800 dark:text-slate-200">-</strong></div>
                    <div><span class="text-slate-400 block">Kategori:</span><strong id="mor-prev-kat" class="text-slate-800 dark:text-slate-200">-</strong></div>
                    <div><span class="text-slate-400 block">Kandang / Sekat:</span><strong id="mor-prev-lokasi" class="text-slate-800 dark:text-slate-200">-</strong></div>
                    <div><span class="text-slate-400 block">Bobot & Nilai Aset:</span><strong id="mor-prev-aset" class="text-emerald-700 dark:text-emerald-400">-</strong></div>
                </div>

                <!-- Baris 2: Waktu & Tipe Kejadian -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Kematian *</label>
                        <input type="date" id="mor-tgl" value="${today}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jam Kejadian</label>
                        <input type="text" id="mor-jam" value="${nowTime}" placeholder="07:00 WIB" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Kejadian</label>
                        <select id="mor-tipe" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            <option value="Kematian Alami">Kematian Alami</option>
                            <option value="Kematian Sakit">Kematian Sakit</option>
                            <option value="Afkir Seleksi Breeding">Afkir Seleksi Breeding</option>
                            <option value="Afkir Cacat Permanen">Afkir Cacat Permanen</option>
                        </select>
                    </div>
                </div>

                <!-- Baris 3: Diagnosa Klinis & Penyebab -->
                <div>
                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Diagnosa Klinis / Penyebab Utama *</label>
                    <select id="mor-penyebab" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        <option value="Kembung Akut (Bloat / Tympanites)">Kembung Akut (Bloat / Tympanites)</option>
                        <option value="Diare Berat / Enteritis Akut">Diare Berat / Enteritis Akut</option>
                        <option value="Pneumonia / Gangguan Pernapasan Akut">Pneumonia / Gangguan Pernapasan Akut</option>
                        <option value="Hipotermia / Kedinginan Ekstrem">Hipotermia / Kedinginan Ekstrem</option>
                        <option value="Infeksi Tali Pusar / Tetanus (Cempe)">Infeksi Tali Pusar / Tetanus (Cempe)</option>
                        <option value="Distokia / Komplikasi Melahirkan">Distokia / Komplikasi Melahirkan</option>
                        <option value="Trauma Fisik / Terinjak / Cedera Fraktur">Trauma Fisik / Terinjak / Cedera Fraktur</option>
                        <option value="Keracunan Pakan / Asidosis Rumen">Keracunan Pakan / Asidosis Rumen</option>
                        <option value="Penurunan Fisik Menua / Afkir Non-Produktif">Penurunan Fisik Menua / Afkir Non-Produktif</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>

                <!-- Baris 4: SOP Biosecurity Pembuangan Bangkai -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tindakan Penanganan Bangkai</label>
                        <select id="mor-tindakan" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            <option value="Nekropsi klinis lalu dikubur kedalaman 1.5m dengan taburan kapur tohor">Nekropsi klinis lalu dikubur kedalaman 1.5m dengan kapur tohor</option>
                            <option value="Langsung dikubur kedalaman 1.5m sesuai SOP biosecurity kandang">Langsung dikubur kedalaman 1.5m sesuai SOP biosecurity</option>
                            <option value="Kremasi / Pembakaran terkendali di insinerator limbah">Kremasi / Pembakaran terkendali di insinerator limbah</option>
                            <option value="Isolasi karantina dan afkir lelang/potong darurat">Isolasi karantina dan afkir lelang/potong darurat</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Pemakaman / Pemusnahan</label>
                        <input type="text" id="mor-lokasi-kubur" value="Lahan Pengolahan Limbah Barat Kandang BUMKal" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                </div>

                <!-- Baris 5: Saksi & Legalitas -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pemeriksa / Paramedik</label>
                        <input type="text" id="mor-saksi1" value="Wahyu Pratama, A.Md." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Saksi Lapangan (ABK)</label>
                        <input type="text" id="mor-saksi2" value="Tri Haryanto" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pejabat Mengetahui</label>
                        <input type="text" id="mor-mengetahui" value="H. Supardi, S.Pt." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    </div>
                </div>

                <!-- Baris 6: Catatan / Kronologi -->
                <div>
                    <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Kronologis & Terapi yang Sempat Diberikan</label>
                    <textarea id="mor-catatan" rows="2" placeholder="Gejala awal yang terpantau, tindakan pertolongan pertama, konfirmasi bukan wabah menular..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"></textarea>
                </div>

                <!-- Opsi Penerbitan Berita Acara -->
                <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                    <input type="checkbox" id="mor-buat-ba" checked class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                    <div>
                        <label for="mor-buat-ba" class="font-bold text-emerald-900 dark:text-emerald-300 cursor-pointer">
                            Otomatis Terbitkan Berita Acara Resmi LPJ BUMKal (A4)
                        </label>
                        <div class="text-[10px] text-emerald-700 dark:text-emerald-400">
                            Menghasilkan Nomor Surat resmi berformat kop dinas untuk audit Inspektorat Kabupaten Bantul dan Bamuskal Pleret.
                        </div>
                    </div>
                </div>

                <div class="pt-2 flex items-center justify-end gap-2">
                    <button type="button" onclick="App.closeModal()" class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold transition cursor-pointer">Batal</button>
                    <button type="submit" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition flex items-center gap-2 cursor-pointer">
                        <i data-lucide="check-circle" class="w-4 h-4"></i> Simpan Mortalitas & Terbitkan BA
                    </button>
                </div>
            </form>
        </div>
        `;
        App.setModalContent(html);
        App.openModal();
        if (window.lucide) window.lucide.createIcons();
    },

    onDombaMatiChange(eartag) {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const d = dombaList.find(item => item.eartag === eartag);
        const box = document.getElementById("mor-ternak-info");
        if (!box) return;

        if (!d) {
            box.classList.add("hidden");
            return;
        }

        box.classList.remove("hidden");
        document.getElementById("mor-prev-ras").innerText = `${d.nama || '-'} (${d.ras || 'Domba'})`;
        document.getElementById("mor-prev-kat").innerText = `${d.kategori || 'Ternak'} • ${d.kelamin || '-'}`;
        document.getElementById("mor-prev-lokasi").innerText = `${d.kandang || '-'} • ${d.sekat || '-'}`;
        const bobotStr = (d.bobotTerkini || d.berat || 0).toFixed(2) + " kg";
        const hargaStr = "Rp " + (d.hargaBeli || 0).toLocaleString('id-ID');
        document.getElementById("mor-prev-aset").innerText = `${bobotStr} • ${hargaStr}`;
    },

    submitMortalitas(e) {
        e.preventDefault();
        const selDomba = document.getElementById("mor-domba");
        const eartag = selDomba?.value;
        const selectedOpt = selDomba?.options[selDomba.selectedIndex];
        const dombaId = selectedOpt?.getAttribute("data-id") || "";
        const nama = selectedOpt?.getAttribute("data-nama") || "";
        const ras = selectedOpt?.getAttribute("data-ras") || "";
        const kategori = selectedOpt?.getAttribute("data-kategori") || "Ternak";
        const kandang = selectedOpt?.getAttribute("data-kandang") || "";
        const sekat = selectedOpt?.getAttribute("data-sekat") || "";
        const bobot = parseFloat(selectedOpt?.getAttribute("data-bobot")) || 0;
        const harga = parseFloat(selectedOpt?.getAttribute("data-harga")) || 0;

        const tgl = document.getElementById("mor-tgl")?.value;
        const jam = document.getElementById("mor-jam")?.value || "07:00 WIB";
        const tipe = document.getElementById("mor-tipe")?.value || "Kematian Alami";
        const penyebab = document.getElementById("mor-penyebab")?.value;
        const tindakan = document.getElementById("mor-tindakan")?.value;
        const lokasiKubur = document.getElementById("mor-lokasi-kubur")?.value;
        const saksi1 = document.getElementById("mor-saksi1")?.value;
        const saksi2 = document.getElementById("mor-saksi2")?.value;
        const mengetahui = document.getElementById("mor-mengetahui")?.value;
        const catatan = document.getElementById("mor-catatan")?.value;
        const buatBa = document.getElementById("mor-buat-ba")?.checked !== false;

        if (!eartag) {
            App.showToast("Pilih eartag ternak terlebih dahulu!", "warning");
            return;
        }

        const res = Store.addBreedingKematian({
            dombaId: dombaId,
            eartag: eartag,
            nama: nama,
            ras: ras,
            kategoriTernak: kategori,
            kandang: kandang,
            sekat: sekat,
            bobotTerakhir: bobot,
            nilaiBukuAset: harga,
            tglKematian: tgl,
            jamKematian: jam,
            tipeKejadian: tipe,
            penyebab: penyebab,
            tindakanBangkai: tindakan,
            lokasiKubur: lokasiKubur,
            saksi1Nama: saksi1,
            saksi2Nama: saksi2,
            mengetahuiNama: mengetahui,
            catatan: catatan,
            terbitkanBA: buatBa
        });

        App.closeModal();
        App.showToast(`Kasus mortalitas ${eartag} tercatat & terbit BA No. ${res.nomorSurat || '-'}!`, "success");
        if (typeof App.renderContent === "function") App.renderContent();

        if (res.beritaAcaraId && confirm(`Pencatatan mortalitas ${eartag} berhasil disimpan!\nNomor Dokumen: ${res.nomorSurat || '-'}\n\nApakah Anda ingin langsung mencetak lembar Berita Acara Resmi (A4)?`)) {
            if (window.BeritaAcaraModule) {
                BeritaAcaraModule.cetakWindow(res.beritaAcaraId);
            }
        }
    },

    hapusMortalitas(id) {
        if (confirm("Apakah Anda yakin ingin menghapus data mortalitas ini?\nStatus domba terkait akan dipulihkan dan Berita Acara yang tertaut akan diselaraskan.")) {
            Store.deleteBreedingKematian(id);
            App.showToast("Log mortalitas dan Berita Acara terkait berhasil dihapus.", "info");
            if (typeof App.renderContent === "function") App.renderContent();
        }
    }
};

window.BreedingModule = BreedingModule;
