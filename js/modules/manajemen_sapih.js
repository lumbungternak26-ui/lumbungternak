/**
 * Modul Manajemen Sapih Cempe & Pindah Sekat Otomatis
 * Terhubung Langsung dengan Master Kandang & Sekat
 * BUMKal Lumbung Pangan Mataram, Kalurahan Pleret
 */

const ManajemenSapihModule = {
    activeTab: "cempe", // "cempe" | "mutasi"
    filterStatusSapih: "all", // "all" | "siap" | "wajib" | "terlambat" | "menyusu"
    searchCempe: "",
    searchMutasi: "",

    // ==========================================
    // HELPER PENGHUBUNG MASTER KANDANG & SEKAT
    // ==========================================
    getKandangOptionsHtml(selectedKandangVal = "") {
        const kandangList = Store.getMasterKandang ? Store.getMasterKandang() : [];
        if (!kandangList || kandangList.length === 0) {
            return `
                <option value="Kandang A (Pejantan & Fattening)">Kandang A (Pejantan & Fattening)</option>
                <option value="Kandang B (Koloni Induk & Breeding)">Kandang B (Koloni Induk & Breeding)</option>
                <option value="Kandang C (Karantina & Pemulihan)">Kandang C (Karantina & Pemulihan)</option>
            `;
        }

        return kandangList.map(k => {
            const val = `${k.nama} (${k.tipe || 'Koloni'})`;
            const cleanVal = (k.nama || '').trim();
            const isSel = selectedKandangVal && (
                selectedKandangVal.toLowerCase().includes(cleanVal.toLowerCase()) || 
                cleanVal.toLowerCase().includes(selectedKandangVal.toLowerCase())
            );
            const kapasitasText = k.kapasitasMaks ? `${k.terisi || 0}/${k.kapasitasMaks} Ekor` : `${k.terisi || 0} Ekor`;
            return `<option value="${val}" ${isSel ? 'selected' : ''}>${k.nama} (${k.tipe || 'Koloni'}) • Terisi ${kapasitasText}</option>`;
        }).join('');
    },

    getSekatOptionsHtml(kandangFullName = "", selectedSekat = "") {
        const kandangList = Store.getMasterKandang ? Store.getMasterKandang() : [];
        const kNameClean = (kandangFullName || '').split('(')[0].trim().toLowerCase();
        const found = kandangList.find(k => 
            (k.nama || '').toLowerCase().includes(kNameClean) || 
            (k.id && kandangFullName.toLowerCase().includes(k.id.toLowerCase()))
        );

        let html = '';
        if (found && Array.isArray(found.sekatList) && found.sekatList.length > 0) {
            found.sekatList.forEach(s => {
                const isSel = (s.nomor === selectedSekat);
                const isPenuh = (s.terisi >= s.kapasitas);
                const tagInfo = isPenuh ? ' [PENUH]' : ` (${s.terisi || 0}/${s.kapasitas} Ekor)`;
                html += `<option value="${s.nomor}" ${isSel ? 'selected' : ''}>${s.nomor}${tagInfo}</option>`;
            });
        } else {
            const defaults = ["Sekat 01", "Sekat 02", "Sekat 03", "Sekat 04", "Sekat 05"];
            defaults.forEach(nomor => {
                html += `<option value="${nomor}" ${nomor === selectedSekat ? 'selected' : ''}>${nomor}</option>`;
            });
        }
        html += `<option value="INPUT_MANUAL">➕ Input Nomor Sekat Manual / Baru...</option>`;
        return html;
    },

    onKandangTujuanChange(kandangVal, sekatSelectId, customInputId) {
        const sekatSelect = document.getElementById(sekatSelectId);
        if (sekatSelect) {
            sekatSelect.innerHTML = this.getSekatOptionsHtml(kandangVal);
        }
        const customInput = document.getElementById(customInputId);
        if (customInput) {
            customInput.classList.add("hidden");
            customInput.required = false;
            customInput.value = "";
        }
    },

    onSekatTujuanChange(sekatVal, customInputId) {
        const customInput = document.getElementById(customInputId);
        if (!customInput) return;
        if (sekatVal === "INPUT_MANUAL") {
            customInput.classList.remove("hidden");
            customInput.required = true;
            customInput.focus();
        } else {
            customInput.classList.add("hidden");
            customInput.required = false;
        }
    },

    // Helper kalkulasi cempe & alarm usia
    getCempeList(dombaList = null) {
        const list = dombaList || (Store.getDomba ? Store.getDomba() : []);
        const today = new Date();
        return list.filter(d => {
            const kat = (d.kategori || '').toLowerCase();
            return (kat.includes('cempe') || kat.includes('anakan')) && d.status !== 'Mati' && d.status !== 'Terjual';
        }).map(c => {
            const birthDateStr = c.tglMasuk || c.tglLahir || "2026-06-01";
            const birthDate = new Date(birthDateStr);
            const ageDays = Math.max(1, Math.round((today - birthDate) / (1000 * 60 * 60 * 24)));
            
            let sapihStatus = "menyusu";
            let statusLabel = "Menyusu Induk (<60 Hari)";
            let statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
            let actionRecommended = false;

            if (ageDays >= 90) {
                sapihStatus = "terlambat";
                statusLabel = "Terlambat Sapih (>90 Hari)";
                statusClass = "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 animate-pulse";
                actionRecommended = true;
            } else if (ageDays >= 75) {
                sapihStatus = "wajib";
                statusLabel = "Wajib Sapih Segera (75-90 Hari)";
                statusClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
                actionRecommended = true;
            } else if (ageDays >= 60) {
                sapihStatus = "siap";
                statusLabel = "Siap Sapih (60-75 Hari)";
                statusClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
                actionRecommended = true;
            }

            const latestWeight = c.riwayatTimbang?.length > 0 
                ? c.riwayatTimbang[c.riwayatTimbang.length - 1].bobot 
                : (c.bobotAwal || 12);

            return {
                ...c,
                ageDays,
                sapihStatus,
                statusLabel,
                statusClass,
                actionRecommended,
                latestWeight: parseFloat(Number(latestWeight).toFixed(2))
            };
        });
    },

    // ==========================================
    // RENDER UTAMA
    // ==========================================
    render() {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const mutasiList = Store.getRiwayatMutasiSekat ? Store.getRiwayatMutasiSekat() : [];
        const cempeList = this.getCempeList(dombaList);

        // Filter status cempe
        let filteredCempe = [...cempeList];
        if (this.filterStatusSapih !== "all") {
            filteredCempe = filteredCempe.filter(c => c.sapihStatus === this.filterStatusSapih);
        }
        if (this.searchCempe) {
            const q = this.searchCempe.toLowerCase();
            filteredCempe = filteredCempe.filter(c => 
                (c.eartag || '').toLowerCase().includes(q) ||
                (c.nama || '').toLowerCase().includes(q) ||
                (c.ras || '').toLowerCase().includes(q) ||
                (c.kandang || '').toLowerCase().includes(q) ||
                (c.sekat || '').toLowerCase().includes(q)
            );
        }

        // Metrik KPI
        const totalCempe = cempeList.length;
        const siapSapihCount = cempeList.filter(c => c.sapihStatus === "siap").length;
        const wajibSapihCount = cempeList.filter(c => c.sapihStatus === "wajib").length;
        const terlambatCount = cempeList.filter(c => c.sapihStatus === "terlambat").length;

        return `
        <div class="space-y-6">
            <!-- Header Section -->
            <div class="bg-gradient-to-r from-sky-800 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div class="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3">
                            <i data-lucide="baby" class="w-4 h-4"></i>
                            Manajemen Breeding & Populasi Terhubung Master Kandang
                        </div>
                        <h1 class="text-2xl md:text-3xl font-black tracking-tight">Manajemen Sapih & Mutasi Sekat</h1>
                        <p class="text-sky-100 text-sm mt-1 max-w-2xl">
                            Monitoring otomatis usia cempe, alarm sapih ideal (60–90 hari), eksekusi sapih 1-klik, dan mutasi sekat yang terhubung langsung dengan ketersediaan kapasitas di Master Kandang.
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <button type="button" onclick="ManajemenSapihModule.openModalMutasiManual()" class="px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-sky-50 font-bold shadow-lg flex items-center gap-2 transition-all transform active:scale-95">
                            <i data-lucide="arrow-left-right" class="w-5 h-5 text-indigo-600"></i>
                            Catat Mutasi Sekat Manual
                        </button>
                    </div>
                </div>
            </div>

            <!-- 4 KPI Summary Cards (INTERACTIVE FILTER BUTTONS) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onclick="ManajemenSapihModule.onFilterSapih('all')" class="cursor-pointer p-5 rounded-2xl border transition-all transform hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${this.filterStatusSapih === 'all' ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Cempe Aktif</span>
                        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <i data-lucide="baby" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-slate-800 dark:text-white mt-2">${totalCempe} <span class="text-sm font-medium text-slate-500">Ekor</span></div>
                    <div class="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span>Seluruh anakan</span>
                        <span class="text-sky-600 font-bold">Tampilkan</span>
                    </div>
                </div>

                <div onclick="ManajemenSapihModule.onFilterSapih('siap')" class="cursor-pointer p-5 rounded-2xl border transition-all transform hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${this.filterStatusSapih === 'siap' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Siap Sapih (60-75 Hari)</span>
                        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <i data-lucide="check-circle" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">${siapSapihCount} <span class="text-sm font-medium text-slate-500">Ekor</span></div>
                    <div class="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span>Fase rumen aktif</span>
                        <span class="text-emerald-600 font-bold">Filter</span>
                    </div>
                </div>

                <div onclick="ManajemenSapihModule.onFilterSapih('wajib')" class="cursor-pointer p-5 rounded-2xl border transition-all transform hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${this.filterStatusSapih === 'wajib' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Wajib Sapih (75-90 Hari)</span>
                        <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <i data-lucide="clock" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">${wajibSapihCount} <span class="text-sm font-medium text-slate-500">Ekor</span></div>
                    <div class="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span>Segera pisahkan</span>
                        <span class="text-amber-600 font-bold">Filter</span>
                    </div>
                </div>

                <div onclick="ManajemenSapihModule.onFilterSapih('terlambat')" class="cursor-pointer p-5 rounded-2xl border transition-all transform hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${this.filterStatusSapih === 'terlambat' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Terlambat (>90 Hari)</span>
                        <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">${terlambatCount} <span class="text-sm font-medium text-slate-500">Ekor</span></div>
                    <div class="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span class="text-rose-500 font-semibold">Risiko induk kurus</span>
                        <span class="text-rose-600 font-bold">Filter</span>
                    </div>
                </div>
            </div>

            <!-- Tab Switcher (CEMPE & MUTASI) -->
            <div class="flex border-b border-slate-200 dark:border-slate-700">
                <button type="button" id="tab-btn-cempe" onclick="ManajemenSapihModule.switchTab('cempe')" class="cursor-pointer relative z-10 py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${this.activeTab === 'cempe' ? 'border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">
                    <i data-lucide="baby" class="w-4 h-4 pointer-events-none"></i>
                    <span>Monitoring Usia Sapih Cempe (${cempeList.length})</span>
                </button>
                <button type="button" id="tab-btn-mutasi" onclick="ManajemenSapihModule.switchTab('mutasi')" class="cursor-pointer relative z-10 py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${this.activeTab === 'mutasi' ? 'border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">
                    <i data-lucide="history" class="w-4 h-4 pointer-events-none"></i>
                    <span>Riwayat Mutasi Sekat (${mutasiList.length})</span>
                </button>
            </div>

            <!-- TAB CONTENT CONTAINER (INSTANT SWITCHABLE) -->
            <div id="sapih-tab-content">
                ${this.activeTab === 'cempe' ? this.renderCempeTab(filteredCempe, cempeList.length) : this.renderMutasiTab(mutasiList)}
            </div>
        </div>

        <!-- Modal Container Khusus Sapih & Mutasi -->
        <div id="sapih-modal-container"></div>
        `;
    },

    renderCempeTab(list, totalCount) {
        return `
        <div class="space-y-4">
            <!-- Filter & Search Toolbar -->
            <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div class="flex flex-1 w-full sm:w-auto items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400"></i>
                    <input type="text" value="${this.searchCempe}" oninput="ManajemenSapihModule.onSearchCempe(this.value)" placeholder="Cari eartag, nama cempe, kandang, ras..." class="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 w-full placeholder-slate-400">
                    ${this.searchCempe ? `<button type="button" onclick="ManajemenSapihModule.onSearchCempe('')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-4 h-4"></i></button>` : ''}
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <select onchange="ManajemenSapihModule.onFilterSapih(this.value)" class="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 outline-none w-full sm:w-auto">
                        <option value="all" ${this.filterStatusSapih === 'all' ? 'selected' : ''}>Semua Kategori Usia (${totalCount})</option>
                        <option value="terlambat" ${this.filterStatusSapih === 'terlambat' ? 'selected' : ''}>Terlambat Sapih (>90 Hari)</option>
                        <option value="wajib" ${this.filterStatusSapih === 'wajib' ? 'selected' : ''}>Wajib Segera (75-90 Hari)</option>
                        <option value="siap" ${this.filterStatusSapih === 'siap' ? 'selected' : ''}>Siap Sapih (60-75 Hari)</option>
                        <option value="menyusu" ${this.filterStatusSapih === 'menyusu' ? 'selected' : ''}>Menyusu Induk (<60 Hari)</option>
                    </select>
                </div>
            </div>

            <!-- Tabel Monitoring Cempe -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th class="p-3.5 pl-5">Identitas Cempe</th>
                                <th class="p-3.5">Tanggal Lahir/Masuk</th>
                                <th class="p-3.5">Usia Aktual</th>
                                <th class="p-3.5">Bobot Terkini</th>
                                <th class="p-3.5">Kandang & Sekat Asal</th>
                                <th class="p-3.5">Status & Alarm</th>
                                <th class="p-3.5 text-center pr-5">Aksi Tindakan</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
                            ${list.length === 0 ? `
                                <tr>
                                    <td colspan="7" class="text-center py-12">
                                        <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                            <i data-lucide="baby" class="w-8 h-8"></i>
                                        </div>
                                        <p class="font-bold text-slate-700 dark:text-slate-200 text-base">Tidak Ada Data Cempe Sesuai Filter</p>
                                        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Seluruh cempe telah disapih atau belum ada anakan yang terdaftar dalam fase anakan/cempe.</p>
                                    </td>
                                </tr>
                            ` : list.map(c => `
                                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                    <td class="p-3.5 pl-5">
                                        <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer hover:text-sky-600" onclick="DombaModule.openModalDetail('${c.id}')" title="Klik untuk lihat detail domba">
                                            <span class="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">${c.eartag}</span>
                                            <span>${c.nama || '-'}</span>
                                        </div>
                                        <div class="text-xs text-slate-500 mt-0.5">${c.ras || 'Domba'} • ${c.kelamin || 'Jantan'}</div>
                                    </td>
                                    <td class="p-3.5 text-xs text-slate-600 dark:text-slate-300">
                                        ${c.tglMasuk || c.tglLahir || '-'}
                                    </td>
                                    <td class="p-3.5">
                                        <div class="font-black text-slate-800 dark:text-slate-100 text-sm">${c.ageDays} <span class="text-xs font-normal text-slate-500">Hari</span></div>
                                        <div class="text-[11px] text-slate-500">± ${(c.ageDays / 30).toFixed(1)} Bulan</div>
                                    </td>
                                    <td class="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        ${c.latestWeight.toFixed(2)} kg
                                    </td>
                                    <td class="p-3.5 text-xs">
                                        <div class="font-semibold text-slate-800 dark:text-slate-200">${c.kandang || '-'}</div>
                                        <div class="text-[11px] text-slate-500">${c.sekat || '-'}</div>
                                    </td>
                                    <td class="p-3.5">
                                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${c.statusClass}">
                                            ${c.statusLabel}
                                        </span>
                                    </td>
                                    <td class="p-3.5 pr-5 text-center">
                                        <div class="flex items-center justify-center gap-1.5">
                                            ${c.actionRecommended ? `
                                                <button type="button" onclick="ManajemenSapihModule.openModalEksekusiSapih('${c.eartag}')" class="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all transform active:scale-95">
                                                    <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                                                    Sapih & Pindah
                                                </button>
                                            ` : `
                                                <button type="button" onclick="ManajemenSapihModule.openModalEksekusiSapih('${c.eartag}')" class="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all">
                                                    <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                                                    Sapih Dini
                                                </button>
                                            `}
                                            <button type="button" onclick="ManajemenSapihModule.openModalMutasiManual('${c.eartag}')" title="Mutasi Sekat Saja" class="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors">
                                                <i data-lucide="arrow-left-right" class="w-4 h-4"></i>
                                            </button>
                                            <button type="button" onclick="DombaModule.openModalDetail('${c.id}')" title="Detail Domba Lengkap" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors">
                                                <i data-lucide="eye" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Petunjuk Sapih Banner -->
            <div class="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-5 text-indigo-950 dark:text-indigo-200 flex items-start gap-4">
                <i data-lucide="lightbulb" class="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"></i>
                <div class="text-xs leading-relaxed space-y-1">
                    <div class="font-bold text-sm">Mengapa Manajemen Waktu Sapih Sangat Krusial?</div>
                    <p>• <strong>Kesehatan & Siklus Induk:</strong> Cempe yang disapih pada usia 60-75 hari mempercepat pemulihan Body Condition Score (BCS) induk, sehingga estrus (birahi) kembali normal dan target lambing interval 8 bulan tercapai.</p>
                    <p>• <strong>Perkembangan Papila Rumen:</strong> Pada usia 60 hari ke atas, anakan domba harus mulai dipaksa mencerna pakan padat konsentrat & hijauan berkualitas untuk mempercepat pertumbuhan bobot (ADG).</p>
                    <p>• <strong>Pencegahan Cedera:</strong> Indukan tidak kelelahan atau ambruk akibat defisiensi kalsium karena menyusui cempe yang sudah bertubuh besar.</p>
                </div>
            </div>
        </div>
        `;
    },

    renderMutasiTab(list) {
        const safeList = Array.isArray(list) ? list : [];
        let filtered = [...safeList];
        if (this.searchMutasi) {
            const q = this.searchMutasi.toLowerCase();
            filtered = filtered.filter(m => 
                (m.eartag || '').toLowerCase().includes(q) ||
                (m.nama || '').toLowerCase().includes(q) ||
                (m.alasan || '').toLowerCase().includes(q) ||
                (m.kandangTujuan || '').toLowerCase().includes(q) ||
                (m.sekatTujuan || '').toLowerCase().includes(q) ||
                (m.petugas || '').toLowerCase().includes(q)
            );
        }

        return `
        <div class="space-y-4">
            <!-- Filter & Search Toolbar -->
            <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div class="flex flex-1 w-full sm:w-auto items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400"></i>
                    <input type="text" value="${this.searchMutasi}" oninput="ManajemenSapihModule.onSearchMutasi(this.value)" placeholder="Cari eartag, nama domba, sekat tujuan, alasan..." class="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 w-full placeholder-slate-400">
                    ${this.searchMutasi ? `<button type="button" onclick="ManajemenSapihModule.onSearchMutasi('')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-4 h-4"></i></button>` : ''}
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs text-slate-500">
                        Total <strong>${filtered.length}</strong> riwayat mutasi sekat
                    </span>
                    <button type="button" onclick="ManajemenSapihModule.openModalMutasiManual()" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow transition cursor-pointer">
                        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                        Tambah Mutasi
                    </button>
                </div>
            </div>

            <!-- Tabel Riwayat Mutasi -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th class="p-3.5 pl-5">Tanggal</th>
                                <th class="p-3.5">Identitas Ternak</th>
                                <th class="p-3.5">Kandang & Sekat Asal</th>
                                <th class="p-3.5">Kandang & Sekat Tujuan (Master)</th>
                                <th class="p-3.5">Alasan / Kategori Mutasi</th>
                                <th class="p-3.5">Petugas / Operator</th>
                                <th class="p-3.5 pr-5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="7" class="text-center py-12">
                                        <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                            <i data-lucide="history" class="w-8 h-8"></i>
                                        </div>
                                        <p class="font-bold text-slate-700 dark:text-slate-200">Belum Ada Riwayat Mutasi Sekat</p>
                                        <p class="text-xs text-slate-500 mt-1">Setiap perpindahan ternak atau eksekusi sapih akan otomatis tercatat di sini.</p>
                                        <button type="button" onclick="ManajemenSapihModule.openModalMutasiManual()" class="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow inline-flex items-center gap-1.5 cursor-pointer">
                                            <i data-lucide="arrow-left-right" class="w-4 h-4"></i> Catat Mutasi Pertama
                                        </button>
                                    </td>
                                </tr>
                            ` : filtered.map(m => `
                                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                    <td class="p-3.5 pl-5 text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                                        ${m.tgl || '-'}
                                    </td>
                                    <td class="p-3.5">
                                        <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span class="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">${m.eartag || '-'}</span>
                                            <span>${m.nama || '-'}</span>
                                        </div>
                                        <div class="text-[11px] text-slate-500 mt-0.5">${m.ras || '-'}</div>
                                    </td>
                                    <td class="p-3.5 text-xs text-rose-700 dark:text-rose-400">
                                        <div class="font-semibold">${m.kandangAsal || '-'}</div>
                                        <div class="text-[11px] text-slate-500">${m.sekatAsal || '-'}</div>
                                    </td>
                                    <td class="p-3.5 text-xs text-emerald-700 dark:text-emerald-400">
                                        <div class="font-semibold">${m.kandangTujuan || '-'}</div>
                                        <div class="text-[11px] text-slate-500">${m.sekatTujuan || '-'}</div>
                                    </td>
                                    <td class="p-3.5 text-xs">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                                            ${m.alasan || 'Rotasi Sekat'}
                                        </span>
                                        ${m.catatan ? `<div class="text-[11px] text-slate-500 mt-0.5">${m.catatan}</div>` : ''}
                                    </td>
                                    <td class="p-3.5 text-xs text-slate-600 dark:text-slate-300">
                                        ${m.petugas || 'Operator Kandang'}
                                    </td>
                                    <td class="p-3.5 pr-5 text-center">
                                        <div class="flex items-center justify-center gap-1.5">
                                            <button type="button" onclick="ManajemenSapihModule.openModalEditMutasi('${m.id}')" title="Edit Mutasi" class="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition cursor-pointer">
                                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                                            </button>
                                            <button type="button" onclick="ManajemenSapihModule.hapusMutasi('${m.id}')" title="Hapus Riwayat" class="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer">
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

    // ==========================================
    // ACTION HANDLERS DENGAN SINKRONISASI INSTAN
    // ==========================================
    switchTab(tab) {
        this.activeTab = tab;

        // 1. Fast direct inline DOM switch if container exists
        const tabContainer = document.getElementById("sapih-tab-content");
        const btnCempe = document.getElementById("tab-btn-cempe");
        const btnMutasi = document.getElementById("tab-btn-mutasi");

        if (tabContainer && btnCempe && btnMutasi) {
            if (tab === "cempe") {
                btnCempe.className = "cursor-pointer relative z-10 py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-all border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400";
                btnMutasi.className = "cursor-pointer relative z-10 py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-all border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300";

                const cempeList = this.getCempeList();
                let filteredCempe = [...cempeList];
                if (this.filterStatusSapih !== "all") {
                    filteredCempe = filteredCempe.filter(c => c.sapihStatus === this.filterStatusSapih);
                }
                if (this.searchCempe) {
                    const q = this.searchCempe.toLowerCase();
                    filteredCempe = filteredCempe.filter(c => 
                        (c.eartag || '').toLowerCase().includes(q) ||
                        (c.nama || '').toLowerCase().includes(q) ||
                        (c.ras || '').toLowerCase().includes(q) ||
                        (c.kandang || '').toLowerCase().includes(q) ||
                        (c.sekat || '').toLowerCase().includes(q)
                    );
                }
                tabContainer.innerHTML = this.renderCempeTab(filteredCempe, cempeList.length);
            } else {
                btnMutasi.className = "cursor-pointer relative z-10 py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-all border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400";
                btnCempe.className = "cursor-pointer relative z-10 py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-all border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300";

                const rawList = Store.getRiwayatMutasiSekat ? Store.getRiwayatMutasiSekat() : [];
                const mutasiList = Array.isArray(rawList) ? rawList : [];
                tabContainer.innerHTML = this.renderMutasiTab(mutasiList);
            }

            if (window.lucide && typeof lucide.createIcons === 'function') {
                try {
                    lucide.createIcons();
                } catch (e) {
                    console.warn("Lucide error:", e);
                }
            }
            return;
        }

        // 2. Fallback full re-render
        if (window.App && typeof App.renderContent === 'function') {
            App.renderContent();
        } else {
            const main = document.getElementById("main-content-area");
            if (main) {
                main.innerHTML = this.render();
                if (window.lucide && typeof lucide.createIcons === 'function') {
                    try {
                        lucide.createIcons();
                    } catch (e) {
                        console.warn("Lucide error:", e);
                    }
                }
            }
        }
    },

    onFilterSapih(v) {
        this.filterStatusSapih = v;
        this.switchTab("cempe");
    },

    onSearchCempe(q) {
        this.searchCempe = q;
        this.switchTab("cempe");
    },

    onSearchMutasi(q) {
        this.searchMutasi = q;
        const tabContainer = document.getElementById("sapih-tab-content");
        if (tabContainer && this.activeTab === "mutasi") {
            const mutasiList = Store.getRiwayatMutasiSekat ? Store.getRiwayatMutasiSekat() : [];
            tabContainer.innerHTML = this.renderMutasiTab(mutasiList);
            if (window.lucide && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        } else {
            this.switchTab("mutasi");
        }
    },

    // ==========================================
    // MODAL EKSEKUSI SAPIH CEMPE
    // ==========================================
    openModalEksekusiSapih(eartag) {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const c = dombaList.find(item => item.eartag === eartag);
        if (!c) return;

        const defaultKategori = (c.kelamin || '').toLowerCase().includes('betina') ? 'Dara / Calon Induk' : 'Penggemukan (Fattening)';
        const latestWeight = c.riwayatTimbang?.length > 0 
            ? c.riwayatTimbang[c.riwayatTimbang.length - 1].bobot 
            : (c.bobotAwal || 12);

        const defaultKandangVal = (c.kelamin || '').toLowerCase().includes('betina')
            ? "Kandang B (Koloni Induk & Breeding)"
            : "Kandang A (Pejantan & Fattening)";

        const container = document.getElementById("sapih-modal-container");
        if (!container) return;

        container.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div class="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-700 my-8">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-5">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                            <i data-lucide="log-out" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-slate-800 dark:text-white">Eksekusi Sapih Cempe</h3>
                            <p class="text-xs text-slate-500">Pemisahan dari induk & alokasi ke sekat Master Kandang</p>
                        </div>
                    </div>
                    <button type="button" onclick="ManajemenSapihModule.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <form onsubmit="ManajemenSapihModule.submitEksekusiSapih(event)" class="space-y-4 text-sm">
                    <!-- Info Cempe Saat Ini -->
                    <div class="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <div class="font-bold text-slate-900 dark:text-white font-mono">${c.eartag} - ${c.nama || 'Cempe'}</div>
                            <div class="text-xs text-slate-500">${c.ras || 'Domba'} • ${c.kelamin || 'Jantan'}</div>
                            <div class="text-[11px] text-slate-400 mt-1">Lokasi Asal: ${c.kandang || 'Kandang B'} / ${c.sekat || 'Sekat Induk'}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-slate-400">Bobot Terkini</div>
                            <div class="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">${parseFloat(latestWeight).toFixed(2)} kg</div>
                        </div>
                    </div>

                    <input type="hidden" id="sapih-eartag" value="${c.eartag}">
                    <input type="hidden" id="sapih-nama" value="${c.nama || ''}">
                    <input type="hidden" id="sapih-ras" value="${c.ras || ''}">
                    <input type="hidden" id="sapih-kandang-asal" value="${c.kandang || 'Kandang B'}">
                    <input type="hidden" id="sapih-sekat-asal" value="${c.sekat || 'Sekat Induk'}">

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Kategori Baru Pasca Sapih *</label>
                            <select id="sapih-kategori-baru" required class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-sky-500 outline-none">
                                <option value="Penggemukan (Fattening)" ${defaultKategori.includes('Penggemukan') ? 'selected' : ''}>Penggemukan (Fattening)</option>
                                <option value="Dara / Calon Induk" ${defaultKategori.includes('Dara') ? 'selected' : ''}>Dara / Calon Induk</option>
                                <option value="Pejantan Muda">Pejantan Muda</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Bobot Sapih Aktual (kg) *</label>
                            <input type="number" step="0.01" id="sapih-bobot" value="${latestWeight}" required class="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none">
                        </div>
                    </div>

                    <!-- KANDANG & SEKAT TUJUAN (TERHUBUNG MASTER KANDANG) -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Kandang Tujuan (Master) *</label>
                            <select id="sapih-kandang-tujuan" onchange="ManajemenSapihModule.onKandangTujuanChange(this.value, 'sapih-sekat-tujuan', 'sapih-sekat-custom')" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-sky-500 outline-none">
                                ${this.getKandangOptionsHtml(defaultKandangVal)}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Sekat Tujuan (Master) *</label>
                            <select id="sapih-sekat-tujuan" onchange="ManajemenSapihModule.onSekatTujuanChange(this.value, 'sapih-sekat-custom')" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-sky-500 outline-none">
                                ${this.getSekatOptionsHtml(defaultKandangVal, "Sekat 01")}
                            </select>
                            <input type="text" id="sapih-sekat-custom" placeholder="Ketik nama sekat manual..." class="hidden mt-2 w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Tanggal Eksekusi</label>
                            <input type="date" id="sapih-tgl" value="${new Date().toISOString().split('T')[0]}" required class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Petugas Pelaksana</label>
                            <input type="text" id="sapih-petugas" value="Wahyu Pratama" required class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Catatan Kondisi Cempe Pasca Sapih</label>
                        <input type="text" id="sapih-catatan" value="Nafsu makan konsentrat grower aktif, gerak lincah dan sehat" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none">
                    </div>

                    <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button type="button" onclick="ManajemenSapihModule.closeModal()" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100">
                            Batal
                        </button>
                        <button type="submit" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all">
                            Konfirmasi & Eksekusi Sapih
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    },

    submitEksekusiSapih(e) {
        e.preventDefault();
        const eartag = document.getElementById("sapih-eartag").value;
        const nama = document.getElementById("sapih-nama").value;
        const ras = document.getElementById("sapih-ras").value;
        const kandangAsal = document.getElementById("sapih-kandang-asal").value;
        const sekatAsal = document.getElementById("sapih-sekat-asal").value;
        const kandangTujuan = document.getElementById("sapih-kandang-tujuan").value;
        
        let sekatTujuan = document.getElementById("sapih-sekat-tujuan").value;
        if (sekatTujuan === "INPUT_MANUAL") {
            sekatTujuan = document.getElementById("sapih-sekat-custom").value.trim() || "Sekat Baru";
        }

        const kategoriBaru = document.getElementById("sapih-kategori-baru").value;
        const bobotSapih = parseFloat(document.getElementById("sapih-bobot").value) || 0;
        const tgl = document.getElementById("sapih-tgl").value;
        const petugas = document.getElementById("sapih-petugas").value;
        const catatan = document.getElementById("sapih-catatan").value;

        // Catat mutasi sekat & update data domba
        Store.addMutasiSekat({
            eartag,
            nama,
            ras,
            kandangAsal,
            sekatAsal,
            kandangTujuan,
            sekatTujuan,
            alasan: `Sapih Cempe -> ${kategoriBaru}`,
            petugas,
            catatan: `Bobot sapih: ${bobotSapih.toFixed(2)} kg. ${catatan}`,
            tgl,
            kategoriBaru
        });

        // Tambah riwayat timbang di domba
        const dombaList = Store.getDomba();
        const dIdx = dombaList.findIndex(d => d.eartag === eartag);
        if (dIdx >= 0) {
            if (!dombaList[dIdx].riwayatTimbang) dombaList[dIdx].riwayatTimbang = [];
            dombaList[dIdx].riwayatTimbang.push({
                tgl,
                bobot: parseFloat(bobotSapih.toFixed(2)),
                adg: "Sapih",
                petugas
            });
            dombaList[dIdx].bobotTerkini = parseFloat(bobotSapih.toFixed(2));
            Store.saveDomba(dombaList);
        }

        // Sinkronkan okupansi sekat di master kandang
        if (Store.syncSekatOccupancy) Store.syncSekatOccupancy();

        this.closeModal();
        if (window.App && typeof App.showToast === 'function') {
            App.showToast(`Berhasil! Cempe ${eartag} disapih ke ${kandangTujuan} (${sekatTujuan})!`, "success");
        } else {
            alert(`Berhasil! Cempe ${eartag} disapih ke ${kandangTujuan} (${sekatTujuan})!`);
        }

        this.switchTab("mutasi");
    },

    // ==========================================
    // MODAL PENCATATAN MUTASI SEKAT MANUAL
    // ==========================================
    openModalMutasiManual(preselectedEartag = null) {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const activeDomba = dombaList.filter(d => d.status !== "Mati" && d.status !== "Terjual");

        // Cari domba pertama atau yang dipilih
        const selected = preselectedEartag 
            ? activeDomba.find(d => d.eartag === preselectedEartag) 
            : (activeDomba.length > 0 ? activeDomba[0] : null);

        const defaultKandangVal = selected ? selected.kandang : "Kandang A (Pejantan & Fattening)";

        const container = document.getElementById("sapih-modal-container");
        if (!container) return;

        container.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div class="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-700 my-8">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-5">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <i data-lucide="arrow-left-right" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-slate-800 dark:text-white">Pencatatan Mutasi Sekat</h3>
                            <p class="text-xs text-slate-500">Perpindahan ternak antar kandang & sekat Master Kandang</p>
                        </div>
                    </div>
                    <button type="button" onclick="ManajemenSapihModule.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <form onsubmit="ManajemenSapihModule.submitMutasiManual(event)" class="space-y-4 text-sm">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Pilih Domba *</label>
                        <select id="mm-select-domba" onchange="ManajemenSapihModule.onSelectDombaMutasi(this.value)" required class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="">-- Pilih Eartag / Domba --</option>
                            ${activeDomba.map(d => `
                                <option value="${d.eartag}" ${(selected && selected.eartag === d.eartag) ? 'selected' : ''}>
                                    ${d.eartag} - ${d.nama || 'Domba'} (${d.kandang || 'Kandang'} / ${d.sekat || 'Sekat'}) [${d.kategori || 'Ternak'}]
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-xs">
                        <div>
                            <span class="text-slate-400 block text-[11px]">Kandang Asal:</span> 
                            <span id="mm-pv-kandang" class="font-bold text-slate-700 dark:text-slate-300">${selected ? (selected.kandang || '-') : '-'}</span>
                        </div>
                        <div>
                            <span class="text-slate-400 block text-[11px]">Sekat Asal:</span> 
                            <span id="mm-pv-sekat" class="font-bold text-slate-700 dark:text-slate-300">${selected ? (selected.sekat || '-') : '-'}</span>
                        </div>
                    </div>

                    <input type="hidden" id="mm-eartag" value="${selected ? selected.eartag : ''}">
                    <input type="hidden" id="mm-nama" value="${selected ? (selected.nama || '') : ''}">
                    <input type="hidden" id="mm-ras" value="${selected ? (selected.ras || '') : ''}">
                    <input type="hidden" id="mm-kandang-asal" value="${selected ? (selected.kandang || '') : ''}">
                    <input type="hidden" id="mm-sekat-asal" value="${selected ? (selected.sekat || '') : ''}">

                    <!-- KANDANG & SEKAT TUJUAN (TERHUBUNG MASTER KANDANG) -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Kandang Tujuan (Master) *</label>
                            <select id="mm-kandang-tujuan" onchange="ManajemenSapihModule.onKandangTujuanChange(this.value, 'mm-sekat-tujuan', 'mm-sekat-custom')" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                                ${this.getKandangOptionsHtml(defaultKandangVal)}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Sekat Tujuan (Master) *</label>
                            <select id="mm-sekat-tujuan" onchange="ManajemenSapihModule.onSekatTujuanChange(this.value, 'mm-sekat-custom')" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none">
                                ${this.getSekatOptionsHtml(defaultKandangVal, "Sekat 01")}
                            </select>
                            <input type="text" id="mm-sekat-custom" placeholder="Ketik nama sekat manual..." class="hidden mt-2 w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Alasan Perpindahan *</label>
                        <select id="mm-alasan" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                            <option value="Rotasi Kandang / Pemadatan">Rotasi Kandang / Pemadatan</option>
                            <option value="Program Pemacakan / Kawin">Program Pemacakan / Perkawinan</option>
                            <option value="Karantina Medis / Sakit">Karantina Medis / Isolasi Sakit</option>
                            <option value="Lulus Karantina Masuk">Lulus Karantina Masuk & Pemulihan</option>
                            <option value="Persiapan Penjualan / Display">Persiapan Penjualan / Display Qurban</option>
                            <option value="Sapih Mandiri">Sapih Mandiri</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Tanggal Mutasi</label>
                            <input type="date" id="mm-tgl" value="${new Date().toISOString().split('T')[0]}" required class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Petugas / Operator</label>
                            <input type="text" id="mm-petugas" value="Wahyu Pratama" required class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button type="button" onclick="ManajemenSapihModule.closeModal()" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100">
                            Batal
                        </button>
                        <button type="submit" class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all">
                            Simpan Mutasi Sekat
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    },

    onSelectDombaMutasi(eartag) {
        if (!eartag) return;
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const d = dombaList.find(item => item.eartag === eartag);
        if (!d) return;

        document.getElementById("mm-eartag").value = d.eartag;
        document.getElementById("mm-nama").value = d.nama || '';
        document.getElementById("mm-ras").value = d.ras || '';
        document.getElementById("mm-kandang-asal").value = d.kandang || '-';
        document.getElementById("mm-sekat-asal").value = d.sekat || '-';

        document.getElementById("mm-pv-kandang").textContent = d.kandang || '-';
        document.getElementById("mm-pv-sekat").textContent = d.sekat || '-';

        const kandangTujuanEl = document.getElementById("mm-kandang-tujuan");
        if (kandangTujuanEl) {
            this.onKandangTujuanChange(kandangTujuanEl.value, 'mm-sekat-tujuan', 'mm-sekat-custom');
        }
    },

    submitMutasiManual(e) {
        e.preventDefault();
        const eartag = document.getElementById("mm-eartag").value;
        if (!eartag) {
            alert("Harap pilih domba terlebih dahulu!");
            return;
        }

        const kandangTujuan = document.getElementById("mm-kandang-tujuan").value;
        let sekatTujuan = document.getElementById("mm-sekat-tujuan").value;
        if (sekatTujuan === "INPUT_MANUAL") {
            sekatTujuan = document.getElementById("mm-sekat-custom").value.trim() || "Sekat Baru";
        }

        Store.addMutasiSekat({
            eartag,
            nama: document.getElementById("mm-nama").value,
            ras: document.getElementById("mm-ras").value,
            kandangAsal: document.getElementById("mm-kandang-asal").value,
            sekatAsal: document.getElementById("mm-sekat-asal").value,
            kandangTujuan,
            sekatTujuan,
            alasan: document.getElementById("mm-alasan").value,
            petugas: document.getElementById("mm-petugas").value,
            tgl: document.getElementById("mm-tgl").value
        });

        if (Store.syncSekatOccupancy) Store.syncSekatOccupancy();

        this.closeModal();

        if (window.App && typeof App.showToast === 'function') {
            App.showToast(`Mutasi sekat untuk ${eartag} berhasil disimpan!`, "success");
        }

        this.switchTab("mutasi");
    },

    openModalEditMutasi(id) {
        const list = Store.getRiwayatMutasiSekat ? Store.getRiwayatMutasiSekat() : [];
        const m = list.find(item => item.id === id);
        if (!m) {
            if (window.App && typeof App.showToast === 'function') {
                App.showToast("Data mutasi tidak ditemukan!", "error");
            } else {
                alert("Data mutasi tidak ditemukan!");
            }
            return;
        }

        const kandangVal = m.kandangTujuan || "Kandang A (Pejantan & Fattening)";
        const sekatVal = m.sekatTujuan || "Sekat 01";

        const container = document.getElementById("sapih-modal-container");
        if (!container) return;

        container.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div class="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-700 my-8">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-5">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                            <i data-lucide="edit-3" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-slate-800 dark:text-white">Edit Riwayat Mutasi Sekat</h3>
                            <p class="text-xs text-slate-500">Perbarui rincian pemindahan ternak antar kandang & sekat</p>
                        </div>
                    </div>
                    <button type="button" onclick="ManajemenSapihModule.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <form onsubmit="ManajemenSapihModule.submitEditMutasi(event, '${m.id}')" class="space-y-4 text-sm">
                    <!-- Ringkasan Domba -->
                    <div class="bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <span class="px-2 py-0.5 text-xs font-mono font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">${m.eartag || '-'}</span>
                            <span class="font-bold text-slate-800 dark:text-white ml-1.5 text-sm">${m.nama || 'Domba'}</span>
                            <div class="text-xs text-slate-500 mt-0.5">${m.ras || '-'}</div>
                        </div>
                        <div class="text-right text-xs">
                            <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Asal Mula:</span>
                            <span class="font-semibold text-rose-600 dark:text-rose-400">${m.kandangAsal || '-'} / ${m.sekatAsal || '-'}</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Tanggal Mutasi *</label>
                            <input type="date" id="em-tgl" value="${m.tgl || new Date().toISOString().split('T')[0]}" required class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Petugas / Operator *</label>
                            <input type="text" id="em-petugas" value="${m.petugas || 'Operator Kandang'}" required class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        </div>
                    </div>

                    <!-- KANDANG & SEKAT TUJUAN (TERHUBUNG MASTER KANDANG) -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Kandang Tujuan (Master) *</label>
                            <select id="em-kandang-tujuan" onchange="ManajemenSapihModule.onKandangTujuanChange(this.value, 'em-sekat-tujuan', 'em-sekat-custom')" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-sky-500 outline-none">
                                ${this.getKandangOptionsHtml(kandangVal)}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Sekat Tujuan (Master) *</label>
                            <select id="em-sekat-tujuan" onchange="ManajemenSapihModule.onSekatTujuanChange(this.value, 'em-sekat-custom')" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-sky-500 outline-none">
                                ${this.getSekatOptionsHtml(kandangVal, sekatVal)}
                            </select>
                            <input type="text" id="em-sekat-custom" placeholder="Ketik nama sekat manual..." class="hidden mt-2 w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Alasan Perpindahan *</label>
                        <select id="em-alasan" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                            <option value="Rotasi Kandang / Pemadatan" ${m.alasan && m.alasan.includes('Rotasi') ? 'selected' : ''}>Rotasi Kandang / Pemadatan</option>
                            <option value="Program Pemacakan / Perkawinan" ${m.alasan && m.alasan.includes('Pemacakan') ? 'selected' : ''}>Program Pemacakan / Perkawinan</option>
                            <option value="Karantina Medis / Isolasi Sakit" ${m.alasan && m.alasan.includes('Karantina') ? 'selected' : ''}>Karantina Medis / Isolasi Sakit</option>
                            <option value="Lulus Karantina Masuk & Pemulihan" ${m.alasan && m.alasan.includes('Lulus') ? 'selected' : ''}>Lulus Karantina Masuk & Pemulihan</option>
                            <option value="Persiapan Penjualan / Display Qurban" ${m.alasan && m.alasan.includes('Penjualan') ? 'selected' : ''}>Persiapan Penjualan / Display Qurban</option>
                            <option value="Sapih Cempe" ${m.alasan && m.alasan.includes('Sapih') ? 'selected' : ''}>Sapih Cempe</option>
                            <option value="Koreksi Data / Lainnya" ${m.alasan && !m.alasan.includes('Rotasi') && !m.alasan.includes('Pemacakan') && !m.alasan.includes('Karantina') && !m.alasan.includes('Lulus') && !m.alasan.includes('Penjualan') && !m.alasan.includes('Sapih') ? 'selected' : ''}>Koreksi Data / Lainnya</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Catatan Tambahan</label>
                        <input type="text" id="em-catatan" value="${m.catatan || ''}" placeholder="Catatan kondisi ternak saat dipindah..." class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    </div>

                    <div class="flex items-center gap-2 p-2.5 bg-sky-50/60 dark:bg-sky-950/20 rounded-xl border border-sky-100 dark:border-sky-900/40">
                        <input type="checkbox" id="em-sync-domba" checked class="w-4 h-4 text-sky-600 rounded">
                        <label for="em-sync-domba" class="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            Perbarui juga kandang & sekat domba terkini di Master Domba
                        </label>
                    </div>

                    <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button type="button" onclick="ManajemenSapihModule.closeModal()" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 cursor-pointer">
                            Batal
                        </button>
                        <button type="submit" class="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    },

    submitEditMutasi(e, id) {
        e.preventDefault();
        const kandangTujuan = document.getElementById("em-kandang-tujuan").value;
        let sekatTujuan = document.getElementById("em-sekat-tujuan").value;
        if (sekatTujuan === "INPUT_MANUAL") {
            sekatTujuan = document.getElementById("em-sekat-custom").value.trim() || "Sekat Baru";
        }
        const syncDomba = document.getElementById("em-sync-domba") ? document.getElementById("em-sync-domba").checked : true;

        Store.updateMutasiSekat(id, {
            tgl: document.getElementById("em-tgl").value,
            petugas: document.getElementById("em-petugas").value,
            kandangTujuan,
            sekatTujuan,
            alasan: document.getElementById("em-alasan").value,
            catatan: document.getElementById("em-catatan").value.trim()
        }, syncDomba);

        if (Store.syncSekatOccupancy) Store.syncSekatOccupancy();

        this.closeModal();

        if (window.App && typeof App.showToast === 'function') {
            App.showToast("Riwayat mutasi sekat berhasil diperbarui!", "success");
        }

        this.switchTab("mutasi");
    },

    hapusMutasi(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus catatan riwayat mutasi sekat ini?")) return;

        Store.deleteMutasiSekat(id);
        if (Store.syncSekatOccupancy) Store.syncSekatOccupancy();

        if (window.App && typeof App.showToast === 'function') {
            App.showToast("Catatan mutasi sekat telah dihapus.", "success");
        }

        this.switchTab("mutasi");
    },

    closeModal() {
        const container = document.getElementById("sapih-modal-container");
        if (container) container.innerHTML = "";
    }
};

window.ManajemenSapihModule = ManajemenSapihModule;
