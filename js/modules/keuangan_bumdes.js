/**
 * Modul Keuangan BUMDes
 * Menangani 5 sub-menu:
 * 1. Buku Kas BUMDes (buku_kas_bumdes)
 * 2. Laporan Rapat Evaluasi (laporan_rapat_evaluasi)
 * 3. Executive DSS & PADes (executive_dss_pades)
 * 4. Penjualan Ternak (penjualan_ternak)
 * 5. Gaji & Operasional (gaji_operasional)
 */

const KeuanganBumdesModule = {
    currentSubMenu: "buku_kas_bumdes",
    kasFilterTipe: "all",
    kasFilterKategori: "all",
    kasSearchQuery: "",
    agendaFilterStatus: "all",
    agendaSearchQuery: "",
    gajiFilterStatus: "all",
    gajiSearchQuery: "",

    render(sub = null) {
        if (sub) this.currentSubMenu = sub;

        switch (this.currentSubMenu) {
            case "buku_kas_bumdes":
                return this.renderBukuKas();
            case "laporan_rapat_evaluasi":
                return this.renderLaporanEvaluasi();
            case "executive_dss_pades":
                return this.renderExecutiveDSS();
            case "penjualan_ternak":
                return this.renderPenjualanTernak();
            case "gaji_operasional":
                return this.renderGajiOperasional();
            default:
                return this.renderBukuKas();
        }
    },

    // 1. BUKU KAS BUMDES
    renderBukuKas() {
        const rawKeuangan = Store.getKeuangan();
        let totalMasuk = 0;
        let totalKeluar = 0;
        rawKeuangan.forEach(k => {
            if (k.tipe === "masuk") totalMasuk += k.nominal;
            else totalKeluar += k.nominal;
        });
        const saldoKas = totalMasuk - totalKeluar;

        // Apply filters
        let keuangan = [...rawKeuangan];
        if (this.kasSearchQuery) {
            const q = this.kasSearchQuery.toLowerCase();
            keuangan = keuangan.filter(k => 
                (k.keterangan && k.keterangan.toLowerCase().includes(q)) ||
                (k.kategori && k.kategori.toLowerCase().includes(q)) ||
                (k.metode && k.metode.toLowerCase().includes(q)) ||
                (k.user && k.user.toLowerCase().includes(q)) ||
                (k.tgl && k.tgl.includes(q))
            );
        }
        if (this.kasFilterTipe !== "all") {
            keuangan = keuangan.filter(k => k.tipe === this.kasFilterTipe);
        }
        if (this.kasFilterKategori !== "all") {
            keuangan = keuangan.filter(k => k.kategori.toLowerCase() === this.kasFilterKategori.toLowerCase());
        }

        // Get unique categories for dropdown
        const allCategories = Array.from(new Set(rawKeuangan.map(k => k.kategori).filter(Boolean)));

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                            <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Pembukuan Keuangan
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Buku Kas BUMDes Lumbung Pangan Mataram</h2>
                        <p class="text-xs text-slate-500">Mutasi arus kas masuk dan keluar operasional peternakan, penjualan, dan pembelian pakan.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="ExportImport.exportCSV('keuangan')" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition">
                            <i data-lucide="download" class="w-4 h-4"></i> Export CSV
                        </button>
                        <button onclick="KeuanganBumdesModule.openModalTrx('keluar')" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition">
                            <i data-lucide="arrow-up-right" class="w-4 h-4"></i> Catat Biaya/Keluar
                        </button>
                        <button onclick="KeuanganBumdesModule.openModalTrx('masuk')" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="arrow-down-left" class="w-4 h-4"></i> Catat Kas Masuk
                        </button>
                    </div>
                </div>

                <!-- 3 SUMMARY CARDS -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-slate-500 font-semibold">Saldo Kas Saat Ini</span>
                            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><i data-lucide="wallet" class="w-4 h-4"></i></div>
                        </div>
                        <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">Rp ${saldoKas.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-slate-400">Kas Tunai + Rek BPD DIY BUMKal</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-slate-500 font-semibold">Total Pemasukan (Omzet)</span>
                            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><i data-lucide="trending-up" class="w-4 h-4"></i></div>
                        </div>
                        <div class="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">Rp ${totalMasuk.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-slate-400">Penjualan domba, karkas & pupuk</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-slate-500 font-semibold">Total Pengeluaran</span>
                            <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><i data-lucide="trending-down" class="w-4 h-4"></i></div>
                        </div>
                        <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">Rp ${totalKeluar.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-slate-400">Pakan, vitamin, obat, gaji & perawatan</span>
                    </div>
                </div>

                <!-- FILTER BAR FOR BUKU KAS -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
                    <div class="relative flex-1 w-full">
                        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                        <input 
                            type="text" 
                            placeholder="Cari uraian transaksi, kategori, atau petugas..." 
                            value="${this.kasSearchQuery}"
                            oninput="KeuanganBumdesModule.searchKas(this.value)"
                            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                    </div>
                    <div class="flex items-center gap-2 w-full md:w-auto">
                        <select 
                            onchange="KeuanganBumdesModule.filterTipeKas(this.value)"
                            class="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                            <option value="all" ${this.kasFilterTipe === 'all' ? 'selected' : ''}>Semua Arus Kas</option>
                            <option value="masuk" ${this.kasFilterTipe === 'masuk' ? 'selected' : ''}>Kas Masuk (+)</option>
                            <option value="keluar" ${this.kasFilterTipe === 'keluar' ? 'selected' : ''}>Kas Keluar (-)</option>
                        </select>
                        <select 
                            onchange="KeuanganBumdesModule.filterKategoriKas(this.value)"
                            class="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                            <option value="all" ${this.kasFilterKategori === 'all' ? 'selected' : ''}>Semua Kategori</option>
                            ${allCategories.map(c => `<option value="${c}" ${this.kasFilterKategori === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                        ${(this.kasSearchQuery || this.kasFilterTipe !== 'all' || this.kasFilterKategori !== 'all') ? `
                            <button onclick="KeuanganBumdesModule.resetFilterKas()" class="text-xs text-rose-600 hover:underline whitespace-nowrap">
                                Reset
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- MUTASI TRANSAKSI TABLE -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="list" class="w-4 h-4 text-emerald-600"></i> Mutasi Rekening & Buku Kas
                        </h3>
                        <span class="text-xs text-slate-500">${keuangan.length} Transaksi Terpilih</span>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Tanggal</th>
                                    <th class="py-3 px-4">Arus</th>
                                    <th class="py-3 px-4">Kategori Akun</th>
                                    <th class="py-3 px-4">Keterangan</th>
                                    <th class="py-3 px-4">Metode Bayar</th>
                                    <th class="py-3 px-4 text-right">Nominal</th>
                                    <th class="py-3 px-4 text-center">Petugas</th>
                                    <th class="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${keuangan.length === 0 ? `
                                    <tr>
                                        <td colspan="8" class="text-center py-6 text-slate-400">Tidak ada transaksi yang cocok dengan filter pencarian.</td>
                                    </tr>
                                ` : keuangan.map(k => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">${k.tgl}</td>
                                        <td class="py-3 px-4">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${k.tipe === 'masuk' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                                                ${k.tipe === 'masuk' ? 'KAS MASUK' : 'KAS KELUAR'}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">${k.kategori}</td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-300">${k.keterangan}</td>
                                        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium">${k.metode || 'Transfer Bank'}</span></td>
                                        <td class="py-3 px-4 text-right font-bold ${k.tipe === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}">
                                            ${k.tipe === 'masuk' ? '+' : '-'} Rp ${k.nominal.toLocaleString('id-ID')}
                                        </td>
                                        <td class="py-3 px-4 text-center text-slate-500 text-[11px]">${k.user || '-'}</td>
                                        <td class="py-3 px-4 text-center">
                                            <div class="flex items-center justify-center gap-1">
                                                <button onclick="KeuanganBumdesModule.openModalEditTrx('${k.id}')" title="Ubah Transaksi" class="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg text-amber-600">
                                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                                </button>
                                                <button onclick="KeuanganBumdesModule.deleteTrx('${k.id}')" title="Hapus Transaksi" class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-rose-600">
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

    // 2. LAPORAN RAPAT EVALUASI
    renderLaporanEvaluasi() {
        const rawAgendas = Store.getAgendas();
        const logs = Store.getLogs().slice(0, 8);

        // Apply filters
        let agendas = [...rawAgendas];
        if (this.agendaSearchQuery) {
            const q = this.agendaSearchQuery.toLowerCase();
            agendas = agendas.filter(a =>
                (a.judul && a.judul.toLowerCase().includes(q)) ||
                (a.deskripsi && a.deskripsi.toLowerCase().includes(q)) ||
                (a.lokasi && a.lokasi.toLowerCase().includes(q)) ||
                (a.keputusan && a.keputusan.toLowerCase().includes(q))
            );
        }
        if (this.agendaFilterStatus !== "all") {
            agendas = agendas.filter(a => a.status === this.agendaFilterStatus);
        }

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
                            <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Notulensi & Evaluasi
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Laporan Rapat Evaluasi Bulanan BUMKal</h2>
                        <p class="text-xs text-slate-500">Notulensi musyawarah pengurus BUMKal Lumbung Pangan Mataram, Badan Permusyawaratan Kalurahan (Bamuskal), dan Pamong Kalurahan Pleret.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="KeuanganBumdesModule.cetakHasilRapat()" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition shadow-sm">
                            <i data-lucide="printer" class="w-4 h-4"></i> Cetak Dokumen Berita Acara
                        </button>
                        <button onclick="KeuanganBumdesModule.openModalTambahRapat()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Buat Agenda / Notula Baru
                        </button>
                    </div>
                </div>

                <!-- FILTER BAR FOR AGENDAS -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-3">
                    <div class="relative flex-1">
                        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                        <input 
                            type="text" 
                            placeholder="Cari judul rapat, pokok pembahasan, keputusan, atau lokasi..." 
                            value="${this.agendaSearchQuery}"
                            oninput="KeuanganBumdesModule.searchAgenda(this.value)"
                            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                    </div>
                    <select 
                        onchange="KeuanganBumdesModule.filterStatusAgenda(this.value)"
                        class="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                        <option value="all" ${this.agendaFilterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
                        <option value="Selesai" ${this.agendaFilterStatus === 'Selesai' ? 'selected' : ''}>Selesai</option>
                        <option value="Direncanakan" ${this.agendaFilterStatus === 'Direncanakan' ? 'selected' : ''}>Direncanakan</option>
                    </select>
                    ${(this.agendaSearchQuery || this.agendaFilterStatus !== 'all') ? `
                        <button onclick="KeuanganBumdesModule.resetFilterAgenda()" class="text-xs text-rose-600 hover:underline whitespace-nowrap">
                            Reset
                        </button>
                    ` : ''}
                </div>

                <!-- AGENDA RAPAT LIST -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    ${agendas.length === 0 ? `
                        <div class="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <i data-lucide="calendar" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
                            <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Tidak ada agenda rapat yang cocok dengan filter.</p>
                        </div>
                    ` : agendas.map(ag => `
                        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between">
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ag.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
                                        ${ag.status}
                                    </span>
                                    <span class="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                        <i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${ag.tgl} • ${ag.waktu}
                                    </span>
                                </div>
                                <h3 class="text-base font-bold text-slate-900 dark:text-white mt-2">${ag.judul}</h3>
                                <p class="text-xs text-slate-500 mt-1">${ag.deskripsi}</p>
                                
                                <div class="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-400">Tempat:</span>
                                        <b class="text-slate-700 dark:text-slate-300">${ag.lokasi}</b>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-400">Pimpinan Rapat:</span>
                                        <b class="text-slate-700 dark:text-slate-300">${ag.pimpinan || 'Lurah Pleret'}</b>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-400">Peserta Hadir:</span>
                                        <b class="text-slate-700 dark:text-slate-300">${ag.pesertaHadir || '18 Orang'}</b>
                                    </div>
                                </div>

                                <div class="mt-3">
                                    <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Keputusan / Kesimpulan Rapat:</h4>
                                    <div class="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs italic">
                                        "${ag.keputusan || 'Menyetujui alokasi pengadaan silase tambahan dan perluasan fermentasi limbah kohe untuk penyetoran PADes termin III.'}"
                                    </div>
                                </div>
                            </div>

                            <!-- Actions Footer -->
                            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <button onclick="KeuanganBumdesModule.cetakHasilRapat('${ag.id}')" class="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1.5 transition">
                                    <i data-lucide="printer" class="w-3.5 h-3.5"></i> Cetak Berita Acara
                                </button>
                                <div class="flex items-center gap-1.5 ml-auto">
                                    <button onclick="KeuanganBumdesModule.openModalEditRapat('${ag.id}')" class="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg text-amber-600 font-semibold flex items-center gap-1" title="Ubah Notulensi">
                                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Ubah
                                    </button>
                                    <button onclick="KeuanganBumdesModule.deleteRapat('${ag.id}')" class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-rose-600 font-semibold flex items-center gap-1" title="Hapus Agenda">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- AUDIT TRAILS OF EVALUATION -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                        <i data-lucide="history" class="w-4 h-4 text-indigo-600"></i> Catatan Riwayat Audit Kalurahan Terbaru
                    </h3>
                    <div class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        ${logs.map(l => `
                            <div class="py-2.5 flex items-center justify-between">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span class="font-semibold text-slate-800 dark:text-slate-200">${l.aksi}</span>
                                </div>
                                <div class="text-slate-400 text-[11px]">${l.tgl} • oleh <b>${l.user}</b></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // 3. EXECUTIVE DSS & PADES
    renderExecutiveDSS() {
        const dss = Store.getDSSPADes();
        const valuasi = Store.hitungValuasiAsetBiologis();
        const dombaList = Store.getDomba();
        const target = dss.targetSetoranPADes || 35000000;
        const realisasi = dss.realisasiTerkini || 18500000;
        const persen = Math.min(100, Math.round((realisasi / target) * 1000) / 10);
        const sisa = Math.max(0, target - realisasi);

        // Rekomendasi Panen Realtime dari Ternak Aktif
        const rekomendasiPanen = (dss.rekomendasiPanen || []).map(r => {
            const found = dombaList.find(d => d.eartag === r.eartag);
            return {
                ...r,
                kandang: found ? found.kandang : 'Kandang A',
                ras: found ? found.ras : 'Crossbreed'
            };
        });

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-1">
                            <i data-lucide="crown" class="w-3.5 h-3.5"></i> Executive Intelligence
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Executive Decision Support System (DSS) & Target PADes</h2>
                        <p class="text-xs text-slate-500">Analisis komprehensif bagi Lurah dan Direktur BUMKal untuk proyeksi setoran PADes dan optimalisasi waktu panen ternak.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="KeuanganBumdesModule.openModalUpdatePADes()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="edit-3" class="w-4 h-4"></i> Sesuaikan Target PADes
                        </button>
                    </div>
                </div>

                <!-- PADES TARGET PROGRESS BAR -->
                <div class="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-widest text-emerald-300">Tahun Anggaran ${dss.tahunAnggaran || 2026}</span>
                            <h3 class="text-2xl font-black mt-1">Realisasi Setoran Pendapatan Asli Desa (PADes)</h3>
                            <p class="text-xs text-emerald-200/80">Kontribusi laba bersih peternakan terpadu ke kas APBKal Kalurahan Pleret.</p>
                        </div>
                        <div class="text-right">
                            <div class="text-3xl font-black text-amber-300">${persen}%</div>
                            <span class="text-xs text-emerald-200">Tercapai</span>
                        </div>
                    </div>

                    <!-- Progress bar -->
                    <div class="w-full bg-black/30 rounded-full h-4 overflow-hidden p-0.5 border border-white/10">
                        <div class="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500" style="width: ${persen}%"></div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10 text-xs">
                        <div>
                            <span class="text-emerald-200/70">Target Tahunan Kalurahan:</span>
                            <div class="font-bold text-base text-white">Rp ${target.toLocaleString('id-ID')}</div>
                        </div>
                        <div>
                            <span class="text-emerald-200/70">Realisasi Ditransfer Terkini:</span>
                            <div class="font-bold text-base text-emerald-300">Rp ${realisasi.toLocaleString('id-ID')}</div>
                        </div>
                        <div>
                            <span class="text-emerald-200/70">Sisa Kekurangan Target:</span>
                            <div class="font-bold text-base text-amber-200">Rp ${sisa.toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                </div>

                <!-- VALUASI & METRIK KEPUTUSAN -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs font-semibold text-slate-500">Valuasi Aset Biologis Hidup</span>
                        <div class="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">Rp ${(valuasi.totalValuasiRupiah / 1000000).toFixed(2)} Juta</div>
                        <span class="text-[11px] text-slate-400">${valuasi.totalPopulasiAktif} ekor domba aktif (${valuasi.totalBobotKg} kg bobot hidup)</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs font-semibold text-slate-500">Estimasi Laba Dari Panen Siap</span>
                        <div class="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">Rp 5.650.000</div>
                        <span class="text-[11px] text-slate-400">Dari 3 ekor yang direkomendasikan DSS untuk dijual</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs font-semibold text-slate-500">Efisiensi Biaya Pakan (FCR Est)</span>
                        <div class="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">1 : 6.4</div>
                        <span class="text-[11px] text-emerald-600 font-medium">Sangat Ekonomis dengan Silase Odot EM4</span>
                    </div>
                </div>

                <!-- REKOMENDASI PANEN CERDAS (DECISION TABLE) -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <i data-lucide="sparkles" class="w-4 h-4 text-amber-500"></i> Rekomendasi Panen Ternak Cerdas (Algoritma Titik Puncak Ekonomis)
                            </h3>
                            <p class="text-[11px] text-slate-500">Menganalisis perataan kurva ADG, biaya pakan harian kumulatif, dan harga pasar daging terkini.</p>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Eartag & Nama</th>
                                    <th class="py-3 px-4">Ras & Kandang</th>
                                    <th class="py-3 px-4 text-center">Bobot Terkini</th>
                                    <th class="py-3 px-4">Analisis Titik Efisiensi</th>
                                    <th class="py-3 px-4">Rekomendasi Aksi Sistem</th>
                                    <th class="py-3 px-4 text-right">Estimasi Laba</th>
                                    <th class="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${rekomendasiPanen.map(r => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-3 px-4">
                                            <div class="font-bold text-slate-900 dark:text-white">${r.eartag}</div>
                                            <div class="text-[11px] text-slate-500">${r.nama}</div>
                                        </td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${r.ras} • <span class="font-semibold">${r.kandang}</span></td>
                                        <td class="py-3 px-4 text-center font-bold text-emerald-600 text-sm">${r.bobotKg} kg</td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">${r.alasan}</td>
                                        <td class="py-3 px-4">
                                            <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${r.rekomendasiAksi.includes('Jual') ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}">
                                                ${r.rekomendasiAksi}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right font-bold text-emerald-600">
                                            Rp ${(r.estimasiLaba || 1500000).toLocaleString('id-ID')}
                                        </td>
                                        <td class="py-3 px-4 text-center">
                                            <button onclick="App.navigate('penjualan_ternak')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-sm">
                                                Jual di POS
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

    // 4. PENJUALAN TERNAK (POS KASIR PENJUALAN)
    renderPenjualanTernak() {
        const dombaList = Store.getDomba();
        const availableDomba = dombaList.filter(d => d.status !== "Mati" && d.status !== "Terjual");
        const soldDomba = dombaList.filter(d => d.status === "Terjual");

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                            <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i> Kasir Penjualan Domba
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Kasir POS & Penjualan Ternak Domba</h2>
                        <p class="text-xs text-slate-500">Penjualan domba hidup qurban, aqiqah, bibit pemuliaan, atau karkas daging dengan cetak kwitansi resmi.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="KeuanganBumdesModule.openModalPOSPenjualan()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus" class="w-4 h-4"></i> Transaksi Penjualan Baru
                        </button>
                    </div>
                </div>

                <!-- STATUS BANNER -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Ternak Tersedia Dijual</span>
                        <div class="text-2xl font-black text-emerald-600 mt-1">${availableDomba.length} Ekor</div>
                        <span class="text-[11px] text-slate-400">Siap potong / kurban / aqiqah</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Ternak Telah Terjual</span>
                        <div class="text-2xl font-black text-blue-600 mt-1">${soldDomba.length} Ekor</div>
                        <span class="text-[11px] text-slate-400">Tercatat dalam omzet BUMDes</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Harga Daging Hidup Rata-Rata</span>
                        <div class="text-2xl font-black text-amber-600 mt-1">Rp 75.000 / kg</div>
                        <span class="text-[11px] text-slate-400">Standar acuan pasar Bantul</span>
                    </div>
                </div>

                <!-- TERNAK SIAP JUAL (QUICK SALE CARDS) -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="tag" class="w-4 h-4 text-emerald-600"></i> Katalog Ternak Siap Jual Langsung
                            <span class="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">${availableDomba.length} Ekor Siap Jual</span>
                        </h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${availableDomba.length === 0 ? `
                            <div class="col-span-full py-8 text-center text-xs text-slate-400">
                                <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-1 opacity-40"></i>
                                Tidak ada ternak dalam kategori siap jual saat ini.
                            </div>
                        ` : availableDomba.map(d => {
                            const lastWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                            const estPrice = Math.round(lastWeight * 75000);
                            const tagBadge = window.DombaModule ? DombaModule.getWarnaTagBadge(d.warnaEartag, d.eartag) : `<span class="font-mono text-[10px] font-bold">${d.eartag}</span>`;
                            return `
                                <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between space-y-3">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <div class="flex items-center gap-1.5 mb-1">
                                                ${tagBadge}
                                            </div>
                                            <h4 class="text-sm font-bold text-slate-900 dark:text-white">${d.nama}</h4>
                                            <p class="text-[11px] text-slate-500">${d.ras} • ${d.kategori} ${d.asalTernak ? `• <span class="text-emerald-600 font-medium">${d.asalTernak}</span>` : ''}</p>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-lg font-black text-emerald-600">${lastWeight} kg</div>
                                            <span class="text-[10px] text-slate-400">Bobot Akhir</span>
                                        </div>
                                    </div>

                                    <div class="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                                        <div>
                                            <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Rp ${estPrice.toLocaleString('id-ID')}</div>
                                            <span class="text-[10px] text-slate-400">Est. Nilai Jual</span>
                                        </div>
                                        <div class="flex items-center gap-1.5">
                                            <button onclick="DombaModule.openModalEditDomba('${d.id}')" title="Ubah Data Ternak" class="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 transition active:scale-95">
                                                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                                            </button>
                                            <button onclick="KeuanganBumdesModule.hapusTernakSiapJual('${d.id}')" title="Hapus Data Ternak" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 transition active:scale-95">
                                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                            </button>
                                            <button onclick="KeuanganBumdesModule.openModalPOSPenjualan('${d.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95">
                                                Jual Sekarang
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // 5. GAJI & OPERASIONAL
    renderGajiOperasional() {
        const payroll = Store.getGajiOperasional();
        let totalGaji = 0;
        let terbayarCount = 0;
        let pendingCount = 0;

        payroll.forEach(p => {
            totalGaji += Number(p.totalDiterima || 0);
            if (p.statusBayar === "Sudah Ditransfer" || p.statusBayar === "Terbayar") {
                terbayarCount++;
            } else {
                pendingCount++;
            }
        });

        const percentPaid = payroll.length > 0 ? Math.round((terbayarCount / payroll.length) * 100) : 0;

        // Apply filters
        let filteredPayroll = [...payroll];
        if (this.gajiSearchQuery) {
            const q = this.gajiSearchQuery.toLowerCase();
            filteredPayroll = filteredPayroll.filter(p => 
                (p.sdmNama && p.sdmNama.toLowerCase().includes(q)) ||
                (p.jabatan && p.jabatan.toLowerCase().includes(q)) ||
                (p.bulan && p.bulan.toLowerCase().includes(q)) ||
                (p.catatan && p.catatan.toLowerCase().includes(q))
            );
        }

        if (this.gajiFilterStatus !== "all") {
            if (this.gajiFilterStatus === "Sudah Ditransfer") {
                filteredPayroll = filteredPayroll.filter(p => p.statusBayar === "Sudah Ditransfer" || p.statusBayar === "Terbayar");
            } else if (this.gajiFilterStatus === "Pending") {
                filteredPayroll = filteredPayroll.filter(p => p.statusBayar !== "Sudah Ditransfer" && p.statusBayar !== "Terbayar");
            }
        }

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
                            <i data-lucide="banknote" class="w-3.5 h-3.5"></i> Payroll & Biaya Pegawai
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Gaji Karyawan & Biaya Operasional Rutin</h2>
                        <p class="text-xs text-slate-500">Rekapitulasi penggajian staf kandang, pengolah limbah pupuk kohe, dokter hewan konsultan, dan operasional.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="KeuanganBumdesModule.openModalTambahPayroll()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Input Penggajian Bulan Ini
                        </button>
                    </div>
                </div>

                <!-- PAYROLL SUMMARY CARDS -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Total Anggaran Gaji Bulan Ini</span>
                        <div class="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">Rp ${totalGaji.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-slate-400">${payroll.length} Orang SDM Peternakan & Pupuk</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Status Pembayaran Gaji</span>
                        <div class="text-2xl font-black ${pendingCount === 0 ? 'text-emerald-600' : 'text-amber-600'} mt-1">${percentPaid}% Terbayar</div>
                        <span class="text-[11px] ${pendingCount === 0 ? 'text-emerald-600' : 'text-amber-600'} font-semibold">${terbayarCount} Selesai • ${pendingCount} Tertunda</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-semibold">Jadwal Penggajian Rutin</span>
                        <div class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Tgl 1 - 5</div>
                        <span class="text-[11px] text-slate-400">Setiap awal bulan kalender</span>
                    </div>
                </div>

                <!-- TABEL PAYROLL -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 whitespace-nowrap">
                            <i data-lucide="users" class="w-4 h-4 text-blue-600"></i> Rincian Slip Gaji Karyawan (${payroll[0]?.bulan || 'September 2026'})
                            <span class="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-normal">Menampilkan ${filteredPayroll.length} dari ${payroll.length}</span>
                        </h3>

                        <!-- Search & Filter Controls -->
                        <div class="flex flex-wrap items-center gap-2">
                            <div class="relative min-w-[200px]">
                                <i data-lucide="search" class="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400"></i>
                                <input type="text" placeholder="Cari nama / jabatan..." value="${this.gajiSearchQuery}" 
                                       oninput="KeuanganBumdesModule.searchGaji(this.value)"
                                       class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                            </div>
                            <select onchange="KeuanganBumdesModule.filterStatusGaji(this.value)"
                                    class="py-1.5 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none">
                                <option value="all" ${this.gajiFilterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
                                <option value="Sudah Ditransfer" ${this.gajiFilterStatus === 'Sudah Ditransfer' ? 'selected' : ''}>Sudah Ditransfer / Terbayar</option>
                                <option value="Pending" ${this.gajiFilterStatus === 'Pending' ? 'selected' : ''}>Pending / Tertunda</option>
                            </select>
                            ${(this.gajiSearchQuery || this.gajiFilterStatus !== 'all') ? `
                                <button onclick="KeuanganBumdesModule.resetFilterGaji()" class="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1">
                                    <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Reset
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Nama Staf</th>
                                    <th class="py-3 px-4">Jabatan & Penugasan</th>
                                    <th class="py-3 px-4 text-right">Gaji Pokok</th>
                                    <th class="py-3 px-4 text-right">Tunjangan Kinerja</th>
                                    <th class="py-3 px-4 text-right">Total Diterima</th>
                                    <th class="py-3 px-4 text-center">Status Bayar</th>
                                    <th class="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${filteredPayroll.length === 0 ? `
                                    <tr>
                                        <td colspan="7" class="py-8 text-center text-slate-400">
                                            <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-1 opacity-40"></i>
                                            Tidak ada data penggajian yang cocok dengan filter.
                                        </td>
                                    </tr>
                                ` : filteredPayroll.map(p => {
                                    const isPaid = p.statusBayar === "Sudah Ditransfer" || p.statusBayar === "Terbayar";
                                    return `
                                        <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                            <td class="py-3 px-4">
                                                <div class="font-bold text-slate-900 dark:text-white">${p.sdmNama}</div>
                                                <div class="text-[10px] text-slate-400">Bulan: ${p.bulan || '-'} ${p.tglBayar ? `• Tgl: ${p.tglBayar}` : ''}</div>
                                            </td>
                                            <td class="py-3 px-4 text-slate-600 dark:text-slate-400">
                                                <div>${p.jabatan}</div>
                                                ${p.catatan ? `<div class="text-[10px] text-slate-400 italic">${p.catatan}</div>` : ''}
                                            </td>
                                            <td class="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">Rp ${Number(p.gajiPokok || 0).toLocaleString('id-ID')}</td>
                                            <td class="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">Rp ${Number(p.tunjangan || 0).toLocaleString('id-ID')}</td>
                                            <td class="py-3 px-4 text-right font-bold text-emerald-600 font-mono text-sm">Rp ${Number(p.totalDiterima || 0).toLocaleString('id-ID')}</td>
                                            <td class="py-3 px-4 text-center">
                                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
                                                    ${p.statusBayar}
                                                </span>
                                            </td>
                                            <td class="py-3 px-4 text-center">
                                                <div class="flex items-center justify-center gap-1.5">
                                                    <button onclick="KeuanganBumdesModule.printSlipGaji('${p.id}')" title="Cetak Slip Gaji" class="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition">
                                                        <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                                                    </button>
                                                    <button onclick="KeuanganBumdesModule.openModalEditPayroll('${p.id}')" title="Ubah Data Penggajian" class="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-600 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition">
                                                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                                                    </button>
                                                    <button onclick="KeuanganBumdesModule.deletePayroll('${p.id}')" title="Hapus Data Penggajian" class="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition">
                                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
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
            </div>
        `;
    },

    // --- MODAL HANDLERS ---

    openModalTrx(tipe = "masuk") {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="${tipe === 'masuk' ? 'arrow-down-left' : 'arrow-up-right'}" class="w-5 h-5 ${tipe === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}"></i>
                        Pencatatan Transaksi Kas ${tipe === 'masuk' ? 'Masuk' : 'Keluar'}
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganBumdesModule.submitTrx(event, '${tipe}')" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal *</label>
                        <input type="date" id="trxb-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Akun *</label>
                        <select id="trxb-kategori" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            ${tipe === 'masuk' ? `
                                <option value="Penjualan Ternak">Penjualan Ternak Domba</option>
                                <option value="Penjualan Pupuk POP">Penjualan Pupuk Kompos Padat</option>
                                <option value="Penjualan Pupuk POC">Penjualan POC Urin Domba</option>
                                <option value="Bantuan Dana Desa">Penyertaan Modal Kalurahan / BKK Danais</option>
                                <option value="Lainnya">Penerimaan Kas Lainnya</option>
                            ` : `
                                <option value="Pakan Konsentrat">Pembelian Pakan Konsentrat</option>
                                <option value="Pakan Silase">Bahan Silase & Tebon Jagung</option>
                                <option value="Obat & Vaksin">Vaksin, Obat Cacing & Vitamin</option>
                                <option value="Gaji & Upah Staf">Gaji Karyawan & Honor Harian</option>
                                <option value="Listrik & Air">Operasional Listrik & Mesin Chopper</option>
                                <option value="Perawatan Kandang">Perbaikan Sekat & Atap Kandang</option>
                            `}
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Uraian *</label>
                        <input type="text" id="trxb-keterangan" required placeholder="Contoh: Pembelian pakan konsentrat 500kg" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Metode Pembayaran *</label>
                        <select id="trxb-metode" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                            <option value="Transfer BPD DIY">Transfer Rekening BPD DIY LPM</option>
                            <option value="Tunai">Uang Tunai / Kas Kecil</option>
                            <option value="QRIS BUMDes">QRIS BUMDes Pleret</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal (Rp) *</label>
                        <input type="number" id="trxb-nominal" required placeholder="Contoh: 1500000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-lg text-emerald-600">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl ${tipe === 'masuk' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'} text-white font-bold shadow-md">Simpan Transaksi</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTrx(e, tipe) {
        e.preventDefault();
        const tgl = document.getElementById("trxb-tgl").value;
        const kategori = document.getElementById("trxb-kategori").value;
        const keterangan = document.getElementById("trxb-keterangan").value.trim();
        const metode = document.getElementById("trxb-metode").value;
        const nominal = parseFloat(document.getElementById("trxb-nominal").value);
        const user = Store.getCurrentUser().nama || "Budi Santoso";

        Store.addTransaksi({
            id: "trx-" + Date.now(),
            tgl,
            tipe,
            kategori,
            keterangan,
            metode,
            nominal,
            user
        });

        App.closeModal();
        App.showToast(`Transaksi ${tipe === 'masuk' ? 'kas masuk' : 'kas keluar'} berhasil disimpan!`, "success");
        App.renderContent();
    },

    openModalPOSPenjualan(preselectDombaId = null) {
        const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="shopping-cart" class="w-5 h-5 text-emerald-600"></i> Kasir Penjualan Domba BUMDes
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganBumdesModule.submitPOSPenjualan(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Domba Yang Dijual *</label>
                        <select id="pos-domba" required onchange="KeuanganBumdesModule.onPOSSelectDomba(this.value)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            <option value="">-- Pilih Eartag Ternak --</option>
                            ${dombaList.map(d => {
                                const w = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                                const isSel = d.id === preselectDombaId;
                                return `<option value="${d.id}" data-bobot="${w}" ${isSel ? 'selected' : ''}>${d.eartag} - ${d.nama} (${w} kg - ${d.ras})</option>`;
                            }).join('')}
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bobot Timbang Terakhir (kg)</label>
                            <input type="number" step="0.1" id="pos-bobot" readonly class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Penjualan *</label>
                            <select id="pos-tipe-jual" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                <option value="Kurban">Hewan Kurban</option>
                                <option value="Aqiqah">Aqiqah Siap Potong</option>
                                <option value="Bibit Breeding">Bibit Pemuliaan</option>
                                <option value="Timbangan Hidup">Pedaging (Timbang Hidup)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Pembeli / Konsumen *</label>
                        <input type="text" id="pos-pembeli" required placeholder="Contoh: Bpk. H. Ahmad Subandi (Warga Kedaton)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Harga Sepakat (Rp) *</label>
                        <input type="number" id="pos-harga" required placeholder="Contoh: 4200000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-black text-xl text-emerald-600">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Metode Pembayaran *</label>
                        <select id="pos-metode" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                            <option value="Transfer BPD DIY">Transfer Rek BPD DIY</option>
                            <option value="Tunai">Tunai Kasir</option>
                            <option value="QRIS BUMDes">QRIS BUMDes LPM</option>
                        </select>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">Proses Penjualan & Cetak Nota</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();

        if (preselectDombaId) {
            this.onPOSSelectDomba(preselectDombaId);
        }
    },

    onPOSSelectDomba(id) {
        const select = document.getElementById("pos-domba");
        const bobotInput = document.getElementById("pos-bobot");
        const hargaInput = document.getElementById("pos-harga");
        if (!select || !bobotInput) return;

        const opt = select.querySelector(`option[value="${id}"]`);
        if (opt) {
            const w = parseFloat(opt.getAttribute("data-bobot") || 35);
            bobotInput.value = w;
            if (hargaInput && !hargaInput.value) {
                hargaInput.value = Math.round(w * 75000);
            }
        }
    },

    submitPOSPenjualan(e) {
        e.preventDefault();
        const dombaId = document.getElementById("pos-domba").value;
        const tipeJual = document.getElementById("pos-tipe-jual").value;
        const pembeli = document.getElementById("pos-pembeli").value.trim();
        const harga = parseFloat(document.getElementById("pos-harga").value);
        const metode = document.getElementById("pos-metode").value;

        const dombaList = Store.getDomba();
        const d = dombaList.find(item => item.id === dombaId);
        if (!d) return;

        // Ubah status domba menjadi Terjual
        Store.updateDomba(d.id, {
            status: "Terjual",
            catatanJual: `Terjual kepada ${pembeli} (${tipeJual}) seharga Rp ${harga.toLocaleString('id-ID')}`
        });

        // Catat ke Buku Kas Masuk
        Store.addTransaksi({
            id: "trx-pos-" + Date.now(),
            tgl: new Date().toISOString().split('T')[0],
            tipe: "masuk",
            kategori: "Penjualan Ternak",
            keterangan: `Penjualan ${d.eartag} (${d.nama}) kpd ${pembeli}`,
            metode: metode,
            nominal: harga,
            user: Store.getCurrentUser().nama || "Kasir BUMDes"
        });

        App.closeModal();
        App.showToast(`Penjualan ${d.eartag} berhasil! Status ternak diperbarui ke 'Terjual'.`, "success");
        App.renderContent();
    },

    hapusTernakSiapJual(id) {
        const d = Store.getDomba().find(item => item.id === id);
        if (!d) return;

        if (confirm(`Apakah Anda yakin ingin menghapus data ternak "${d.eartag}" (${d.nama}) dari sistem?`)) {
            Store.deleteDomba(id);
            App.showToast(`Data ternak ${d.eartag} berhasil dihapus.`, "info");
            App.renderContent();
        }
    },

    printSlipGaji(id) {
        const payroll = Store.getGajiOperasional();
        const p = payroll.find(item => item.id === id);
        if (!p) return;

        const printWindow = window.open('', '', 'width=650,height=750');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Slip Gaji - ${p.sdmNama}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; }
                        .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
                        .title { font-size: 16px; font-weight: bold; text-transform: uppercase; }
                        .sub { font-size: 12px; color: #64748b; }
                        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
                        .total { font-size: 16px; font-weight: bold; border-top: 2px solid #0f172a; margin-top: 15px; padding-top: 10px; }
                        .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">BUMKal LPM Lumbung Pangan Mataram</div>
                        <div class="sub">Kalurahan Pleret, Kapanewon Pleret, Kabupaten Bantul, D.I. Yogyakarta</div>
                        <div class="sub"><b>SLIP GAJI & HONORARIUM PEGAWAI • ${p.bulan}</b></div>
                    </div>
                    <div class="row"><span>Nama Pegawai:</span><b>${p.sdmNama}</b></div>
                    <div class="row"><span>Jabatan:</span><span>${p.jabatan}</span></div>
                    <div class="row"><span>Tanggal Pembayaran:</span><span>${p.tglBayar}</span></div>
                    <div class="row"><span>Status Transfer:</span><span style="color:green;font-weight:bold">${p.statusBayar}</span></div>
                    <div class="row"><span>Gaji Pokok:</span><span>Rp ${p.gajiPokok.toLocaleString('id-ID')}</span></div>
                    <div class="row"><span>Tunjangan Operasional/Paramedik:</span><span>Rp ${p.tunjangan.toLocaleString('id-ID')}</span></div>
                    <div class="row total"><span>TOTAL GAJI BERSIH (TAKE HOME PAY):</span><span>Rp ${p.totalDiterima.toLocaleString('id-ID')}</span></div>
                    <div class="footer">
                        <div>Penerima,<br><br><br><b>${p.sdmNama}</b></div>
                        <div>Direktur BUMKal LPM,<br><br><br><b>H. Supardi, S.Pt.</b></div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    },

    // --- PAYROLL / GAJI & OPERASIONAL HANDLERS ---
    searchGaji(val) {
        this.gajiSearchQuery = val;
        App.renderContent();
    },

    filterStatusGaji(val) {
        this.gajiFilterStatus = val;
        App.renderContent();
    },

    resetFilterGaji() {
        this.gajiSearchQuery = "";
        this.gajiFilterStatus = "all";
        App.renderContent();
    },

    calcPayrollTotal() {
        const pokok = parseFloat(document.getElementById("pay-pokok")?.value || 0);
        const tunjangan = parseFloat(document.getElementById("pay-tunjangan")?.value || 0);
        const total = pokok + tunjangan;
        const disp = document.getElementById("pay-total-display");
        if (disp) disp.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    },

    openModalTambahPayroll() {
        const todayStr = new Date().toISOString().split('T')[0];
        const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="banknote" class="w-5 h-5 text-blue-600"></i>
                        Input Penggajian / Honorarium Karyawan Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganBumdesModule.submitTambahPayroll(event)" class="space-y-3 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Staf / Karyawan *</label>
                            <input type="text" id="pay-nama" required placeholder="Contoh: Budi Santoso" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jabatan & Penugasan *</label>
                            <input type="text" id="pay-jabatan" required placeholder="Contoh: Paramedik Kandang / Operator Pupuk" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Periode Bulan *</label>
                            <input type="text" id="pay-bulan" required value="${currentMonthName}" placeholder="Contoh: September 2026" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Transfer / Pembayaran *</label>
                            <input type="date" id="pay-tgl" required value="${todayStr}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok (Rp) *</label>
                            <input type="number" id="pay-pokok" required min="0" value="2000000" oninput="KeuanganBumdesModule.calcPayrollTotal()" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-blue-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tunjangan Kinerja / Transport (Rp)</label>
                            <input type="number" id="pay-tunjangan" min="0" value="300000" oninput="KeuanganBumdesModule.calcPayrollTotal()" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-blue-600">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Pembayaran *</label>
                            <select id="pay-status" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                                <option value="Sudah Ditransfer" selected>Sudah Ditransfer</option>
                                <option value="Pending">Pending / Belum Ditransfer</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Diterima (Take Home Pay)</label>
                            <div id="pay-total-display" class="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold font-mono text-emerald-600 border border-slate-200 dark:border-slate-700">Rp 2.300.000</div>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
                        <textarea id="pay-catatan" rows="2" placeholder="Catatan jam lembur, bonus target panen, dll..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">Simpan Data Penggajian</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTambahPayroll(e) {
        e.preventDefault();
        const pokok = parseFloat(document.getElementById("pay-pokok").value) || 0;
        const tunjangan = parseFloat(document.getElementById("pay-tunjangan").value) || 0;
        const total = pokok + tunjangan;

        const newPay = {
            id: `gj-${Date.now()}`,
            sdmNama: document.getElementById("pay-nama").value.trim(),
            jabatan: document.getElementById("pay-jabatan").value.trim(),
            bulan: document.getElementById("pay-bulan").value.trim(),
            tglBayar: document.getElementById("pay-tgl").value,
            gajiPokok: pokok,
            tunjangan: tunjangan,
            totalDiterima: total,
            statusBayar: document.getElementById("pay-status").value,
            catatan: document.getElementById("pay-catatan").value.trim()
        };

        Store.addGajiOperasional(newPay);
        App.closeModal();
        App.showToast(`Penggajian ${newPay.sdmNama} berhasil disimpan!`, "success");
        App.renderContent();
    },

    openModalEditPayroll(id) {
        const item = Store.getGajiOperasional().find(p => p.id === id);
        if (!item) {
            App.showToast("Data gaji tidak ditemukan", "error");
            return;
        }

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="pencil" class="w-5 h-5 text-amber-600"></i>
                        Ubah Data Penggajian Pegawai
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganBumdesModule.submitEditPayroll(event, '${item.id}')" class="space-y-3 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Staf / Karyawan *</label>
                            <input type="text" id="pay-nama" required value="${item.sdmNama || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jabatan & Penugasan *</label>
                            <input type="text" id="pay-jabatan" required value="${item.jabatan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Periode Bulan *</label>
                            <input type="text" id="pay-bulan" required value="${item.bulan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Transfer / Pembayaran *</label>
                            <input type="date" id="pay-tgl" required value="${item.tglBayar || new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok (Rp) *</label>
                            <input type="number" id="pay-pokok" required min="0" value="${item.gajiPokok || 0}" oninput="KeuanganBumdesModule.calcPayrollTotal()" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-blue-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tunjangan Kinerja / Transport (Rp)</label>
                            <input type="number" id="pay-tunjangan" min="0" value="${item.tunjangan || 0}" oninput="KeuanganBumdesModule.calcPayrollTotal()" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-blue-600">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Pembayaran *</label>
                            <select id="pay-status" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                                <option value="Sudah Ditransfer" ${item.statusBayar === 'Sudah Ditransfer' || item.statusBayar === 'Terbayar' ? 'selected' : ''}>Sudah Ditransfer / Terbayar</option>
                                <option value="Pending" ${item.statusBayar === 'Pending' ? 'selected' : ''}>Pending / Belum Ditransfer</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Diterima (Take Home Pay)</label>
                            <div id="pay-total-display" class="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold font-mono text-emerald-600 border border-slate-200 dark:border-slate-700">Rp ${Number(item.totalDiterima || 0).toLocaleString('id-ID')}</div>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
                        <textarea id="pay-catatan" rows="2" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">${item.catatan || ''}</textarea>
                    </div>

                    <div class="pt-3 flex justify-between items-center border-t dark:border-slate-700">
                        <button type="button" onclick="KeuanganBumdesModule.deletePayroll('${item.id}')" class="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center gap-1.5 transition">
                            <i data-lucide="trash-2" class="w-4 h-4"></i> Hapus Data
                        </button>
                        <div class="flex gap-2">
                            <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                            <button type="submit" class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md">Simpan Perubahan</button>
                        </div>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditPayroll(e, id) {
        e.preventDefault();
        const pokok = parseFloat(document.getElementById("pay-pokok").value) || 0;
        const tunjangan = parseFloat(document.getElementById("pay-tunjangan").value) || 0;
        const total = pokok + tunjangan;

        const updatedFields = {
            sdmNama: document.getElementById("pay-nama").value.trim(),
            jabatan: document.getElementById("pay-jabatan").value.trim(),
            bulan: document.getElementById("pay-bulan").value.trim(),
            tglBayar: document.getElementById("pay-tgl").value,
            gajiPokok: pokok,
            tunjangan: tunjangan,
            totalDiterima: total,
            statusBayar: document.getElementById("pay-status").value,
            catatan: document.getElementById("pay-catatan").value.trim()
        };

        Store.updateGajiOperasional(id, updatedFields);
        App.closeModal();
        App.showToast(`Data penggajian ${updatedFields.sdmNama} berhasil diperbarui!`, "success");
        App.renderContent();
    },

    deletePayroll(id) {
        const item = Store.getGajiOperasional().find(p => p.id === id);
        if (!item) return;

        if (confirm(`Apakah Anda yakin ingin menghapus data penggajian "${item.sdmNama}" (${item.bulan || ''})?`)) {
            Store.deleteGajiOperasional(id);
            App.closeModal();
            App.showToast(`Data penggajian ${item.sdmNama} berhasil dihapus!`, "success");
            App.renderContent();
        }
    },

    openModalUpdatePADes() {
        const dss = Store.getDSSPADes();
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="crown" class="w-5 h-5 text-amber-600"></i> Sesuaikan Target & Realisasi PADes
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganBumdesModule.submitUpdatePADes(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tahun Anggaran *</label>
                        <input type="number" id="pades-tahun" required value="${dss.tahunAnggaran || 2026}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Tahunan Kas Kalurahan Pleret (Rp) *</label>
                        <input type="number" id="pades-target" required value="${dss.targetSetoranPADes || 35000000}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Realisasi Disetor Terkini (Rp) *</label>
                        <input type="number" id="pades-realisasi" required value="${dss.realisasiTerkini || 18500000}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-blue-600">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md">Simpan Target PADes</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitUpdatePADes(e) {
        e.preventDefault();
        const tahun = parseInt(document.getElementById("pades-tahun").value);
        const target = parseFloat(document.getElementById("pades-target").value);
        const realisasi = parseFloat(document.getElementById("pades-realisasi").value);
        const current = Store.getDSSPADes();

        current.tahunAnggaran = tahun;
        current.targetSetoranPADes = target;
        current.realisasiTerkini = realisasi;
        current.persentaseTercapai = Math.min(100, Math.round((realisasi / target) * 1000) / 10);

        localStorage.setItem("kandang_dss_pades_v2", JSON.stringify(current));
        App.closeModal();
        App.showToast("Target dan realisasi PADes berhasil diperbarui!", "success");
        App.renderContent();
    },

    openModalTambahRapat() {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="calendar" class="w-5 h-5 text-indigo-600"></i> Buat Agenda Rapat / Notulensi Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganBumdesModule.submitTambahRapat(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Musyawarah / Evaluasi *</label>
                        <input type="text" id="rpt-judul" required placeholder="Contoh: Rapat Evaluasi Kinerja Penggemukan Qurban Batch II" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Rapat *</label>
                            <input type="date" id="rpt-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Waktu Pelaksanaan *</label>
                            <input type="text" id="rpt-waktu" required value="09:00 - 12:00 WIB" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Rapat *</label>
                        <input type="text" id="rpt-lokasi" required value="Pendopo Kalurahan Pleret" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Uraian / Ringkasan Pembahasan *</label>
                        <textarea id="rpt-deskripsi" rows="2" required placeholder="Topik evaluasi pakan, kesehatan, dan setoran PADes" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kesimpulan / Keputusan Bersama</label>
                        <textarea id="rpt-keputusan" rows="2" placeholder="Keputusan rapat yang disepakati" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Simpan Agenda</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTambahRapat(e) {
        e.preventDefault();
        const judul = document.getElementById("rpt-judul").value.trim();
        const tgl = document.getElementById("rpt-tgl").value;
        const waktu = document.getElementById("rpt-waktu").value.trim();
        const lokasi = document.getElementById("rpt-lokasi").value.trim();
        const deskripsi = document.getElementById("rpt-deskripsi").value.trim();
        const keputusan = document.getElementById("rpt-keputusan").value.trim();

        const agendas = Store.getAgendas();
        agendas.unshift({
            id: "ag-" + Date.now(),
            judul,
            tgl,
            waktu,
            lokasi,
            deskripsi,
            keputusan,
            status: "Selesai",
            pimpinan: Store.getCurrentUser().nama || "H. Supardi, S.Pt.",
            pesertaHadir: "15 Orang Pamong & Pengurus"
        });
        localStorage.setItem("kandang_agendas_v2", JSON.stringify(agendas));

        App.closeModal();
        App.showToast("Notulensi rapat evaluasi berhasil dicatat!", "success");
        App.renderContent();
    },

    openModalTambahPayroll() {
        const sdmList = Store.getSDM();
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="banknote" class="w-5 h-5 text-blue-600"></i> Input Penggajian / Payroll Staf
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganBumdesModule.submitPayroll(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bulan Periode Gaji *</label>
                        <input type="text" id="pyr-bulan" required value="September 2026" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Staf / SDM *</label>
                        <select id="pyr-sdm" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            ${sdmList.map(s => `<option value="${s.nama}" data-jabatan="${s.jabatan}">${s.nama} (${s.jabatan})</option>`).join('')}
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gaji Pokok (Rp) *</label>
                            <input type="number" id="pyr-pokok" required value="2400000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tunjangan Operasional (Rp)</label>
                            <input type="number" id="pyr-tunjangan" required value="300000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">Simpan Payroll</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitPayroll(e) {
        e.preventDefault();
        const bulan = document.getElementById("pyr-bulan").value.trim();
        const selectSdm = document.getElementById("pyr-sdm");
        const sdmNama = selectSdm.value;
        const jabatan = selectSdm.options[selectSdm.selectedIndex].getAttribute("data-jabatan") || "Staf Kandang";
        const gajiPokok = parseFloat(document.getElementById("pyr-pokok").value);
        const tunjangan = parseFloat(document.getElementById("pyr-tunjangan").value || 0);
        const totalDiterima = gajiPokok + tunjangan;

        const newPayroll = {
            id: "gj-" + Date.now(),
            bulan,
            sdmNama,
            jabatan,
            gajiPokok,
            tunjangan,
            totalDiterima,
            statusBayar: "Sudah Ditransfer",
            tglBayar: new Date().toISOString().split('T')[0]
        };

        Store.addGajiOperasional(newPayroll);

        // Catat ke Buku Kas Keluar
        Store.addTransaksi({
            id: "trx-gj-" + Date.now(),
            tgl: new Date().toISOString().split('T')[0],
            tipe: "keluar",
            kategori: "Gaji & Upah Staf",
            keterangan: `Pembayaran Gaji ${sdmNama} (${bulan})`,
            metode: "Transfer BPD DIY",
            nominal: totalDiterima,
            user: "Bendahara BUMKal"
        });

        App.closeModal();
        App.showToast(`Gaji ${sdmNama} berhasil dicatat dan diposting ke Buku Kas Keluar!`, "success");
        App.renderContent();
    },

    // --- BUKU KAS FILTER & CRUD HANDLERS ---
    searchKas(val) {
        this.kasSearchQuery = val;
        App.renderContent();
    },

    filterTipeKas(val) {
        this.kasFilterTipe = val;
        App.renderContent();
    },

    filterKategoriKas(val) {
        this.kasFilterKategori = val;
        App.renderContent();
    },

    resetFilterKas() {
        this.kasSearchQuery = "";
        this.kasFilterTipe = "all";
        this.kasFilterKategori = "all";
        App.renderContent();
    },

    openModalEditTrx(id) {
        const trx = Store.getKeuangan().find(k => k.id === id);
        if (!trx) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i> Ubah Transaksi Kas
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganBumdesModule.submitEditTrx(event, '${trx.id}')" class="space-y-3 text-xs">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal *</label>
                            <input type="date" id="etrxb-tgl" required value="${trx.tgl}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Arus Kas *</label>
                            <select id="etrxb-tipe" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                                <option value="masuk" ${trx.tipe === 'masuk' ? 'selected' : ''}>Kas Masuk (+)</option>
                                <option value="keluar" ${trx.tipe === 'keluar' ? 'selected' : ''}>Kas Keluar (-)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Akun *</label>
                        <input type="text" id="etrxb-kategori" required value="${trx.kategori}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Uraian *</label>
                        <input type="text" id="etrxb-keterangan" required value="${trx.keterangan}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Metode Pembayaran *</label>
                            <select id="etrxb-metode" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Transfer BPD DIY" ${trx.metode === 'Transfer BPD DIY' ? 'selected' : ''}>Transfer Rekening BPD DIY LPM</option>
                                <option value="Tunai" ${trx.metode === 'Tunai' ? 'selected' : ''}>Uang Tunai / Kas Kecil</option>
                                <option value="QRIS BUMDes" ${trx.metode === 'QRIS BUMDes' ? 'selected' : ''}>QRIS BUMDes Pleret</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Petugas / PIC</label>
                            <input type="text" id="etrxb-user" value="${trx.user || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal (Rp) *</label>
                        <input type="number" id="etrxb-nominal" required value="${trx.nominal}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-black text-lg text-emerald-600">
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

    submitEditTrx(e, id) {
        e.preventDefault();
        const updated = {
            tgl: document.getElementById("etrxb-tgl").value,
            tipe: document.getElementById("etrxb-tipe").value,
            kategori: document.getElementById("etrxb-kategori").value.trim(),
            keterangan: document.getElementById("etrxb-keterangan").value.trim(),
            metode: document.getElementById("etrxb-metode").value,
            user: document.getElementById("etrxb-user").value.trim() || Store.getCurrentUser().nama,
            nominal: parseFloat(document.getElementById("etrxb-nominal").value) || 0
        };

        Store.updateTransaksi(id, updated);
        App.closeModal();
        App.showToast("Transaksi kas berhasil diperbarui!", "success");
        App.renderContent();
    },

    deleteTrx(id) {
        if (confirm("Apakah Anda yakin ingin menghapus transaksi ini dari buku kas?")) {
            Store.deleteTransaksi(id);
            App.showToast("Transaksi kas telah dihapus.", "success");
            App.renderContent();
        }
    },

    // --- AGENDA RAPAT FILTER, CRUD & CETAK HANDLERS ---
    searchAgenda(val) {
        this.agendaSearchQuery = val;
        App.renderContent();
    },

    filterStatusAgenda(val) {
        this.agendaFilterStatus = val;
        App.renderContent();
    },

    resetFilterAgenda() {
        this.agendaSearchQuery = "";
        this.agendaFilterStatus = "all";
        App.renderContent();
    },

    openModalEditRapat(id) {
        const ag = Store.getAgendas().find(a => a.id === id);
        if (!ag) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i> Ubah Agenda & Notulensi Rapat
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganBumdesModule.submitEditRapat(event, '${ag.id}')" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Musyawarah / Evaluasi *</label>
                        <input type="text" id="erpt-judul" required value="${ag.judul}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Rapat *</label>
                            <input type="date" id="erpt-tgl" required value="${ag.tgl}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Waktu Pelaksanaan *</label>
                            <input type="text" id="erpt-waktu" required value="${ag.waktu}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Rapat *</label>
                            <input type="text" id="erpt-lokasi" required value="${ag.lokasi}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Rapat</label>
                            <select id="erpt-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Selesai" ${ag.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                                <option value="Direncanakan" ${ag.status === 'Direncanakan' ? 'selected' : ''}>Direncanakan</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pimpinan Rapat</label>
                            <input type="text" id="erpt-pimpinan" value="${ag.pimpinan || 'Lurah Pleret'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Peserta Hadir</label>
                            <input type="text" id="erpt-peserta" value="${ag.pesertaHadir || '18 Orang'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Uraian / Ringkasan Pembahasan *</label>
                        <textarea id="erpt-deskripsi" rows="2" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">${ag.deskripsi}</textarea>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kesimpulan / Keputusan Bersama</label>
                        <textarea id="erpt-keputusan" rows="2" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">${ag.keputusan || ''}</textarea>
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

    submitEditRapat(e, id) {
        e.preventDefault();
        const updated = {
            judul: document.getElementById("erpt-judul").value.trim(),
            tgl: document.getElementById("erpt-tgl").value,
            waktu: document.getElementById("erpt-waktu").value.trim(),
            lokasi: document.getElementById("erpt-lokasi").value.trim(),
            status: document.getElementById("erpt-status").value,
            pimpinan: document.getElementById("erpt-pimpinan").value.trim(),
            pesertaHadir: document.getElementById("erpt-peserta").value.trim(),
            deskripsi: document.getElementById("erpt-deskripsi").value.trim(),
            keputusan: document.getElementById("erpt-keputusan").value.trim()
        };

        Store.updateAgenda(id, updated);
        App.closeModal();
        App.showToast("Agenda dan notulensi rapat berhasil diperbarui!", "success");
        App.renderContent();
    },

    deleteRapat(id) {
        if (confirm("Apakah Anda yakin ingin menghapus agenda rapat ini?")) {
            Store.deleteAgenda(id);
            App.showToast("Agenda rapat telah dihapus.", "success");
            App.renderContent();
        }
    },

    // CETAK BERITA ACARA & NOTULENSI HASIL RAPAT LENGKAP KOP KALURAHAN PLERET
    cetakHasilRapat(agendaId = null) {
        const agendas = Store.getAgendas();
        let ag = null;
        if (agendaId) {
            ag = agendas.find(a => a.id === agendaId);
        }
        if (!ag && agendas.length > 0) {
            ag = agendas[0];
        }
        if (!ag) {
            App.showToast("Belum ada data notulensi rapat untuk dicetak.", "error");
            return;
        }

        const p = Store.getPengaturan();
        const namaLembaga = p.namaLembaga || "BUMKal Lumbung Pangan Mataram";
        const kalurahan = p.kalurahan || "Pleret";
        const kapanewon = p.kapanewon || "Pleret";
        const kabupaten = p.kabupaten || "Bantul";
        const unitUsaha = p.unitUsahaUtama || "Peternakan Domba Terpadu, Pakan Ternak & Pengolahan Limbah Pupuk Organik";
        const alamat = p.alamatKandang || "Kompleks Kandang Komunal Kalurahan Pleret, Bantul, D.I. Yogyakarta 55791";
        const kontak = p.kontakLembaga || "0812-3456-7890";
        const email = p.emailLembaga || "bumkal@pleret.desa.id";
        const lurah = p.penasihatLembaga || "Taufiqurrahman, S.Fil.I.";
        const direktur = p.direkturUtama || "H. Supardi, S.Pt.";
        const currentUser = Store.getCurrentUser().nama || "Wahyu Pratama";

        const printWin = window.open("", "", "width=850,height=900");
        printWin.document.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <title>Berita Acara & Notulensi Rapat - ${ag.judul}</title>
                <style>
                    @page { size: A4; margin: 18mm 15mm; }
                    body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; margin: 0; padding: 25px; font-size: 11.5pt; line-height: 1.45; }
                    .header-kop { text-align: center; position: relative; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 18px; }
                    .header-kop h3 { margin: 0; font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; }
                    .header-kop h2 { margin: 2px 0; font-size: 15pt; font-weight: bold; }
                    .header-kop h1 { margin: 2px 0; font-size: 16pt; font-weight: 900; text-transform: uppercase; }
                    .header-kop .meta-alamat { font-size: 9.5pt; margin-top: 4px; font-style: italic; }
                    .doc-title { text-align: center; margin: 16px 0 12px 0; }
                    .doc-title h4 { margin: 0; font-size: 13pt; text-decoration: underline; text-transform: uppercase; font-weight: bold; }
                    .doc-title .nomor { font-size: 10.5pt; margin-top: 3px; }
                    table.meta-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11pt; }
                    table.meta-table td { padding: 3px 5px; vertical-align: top; }
                    table.meta-table td.label { width: 28%; font-weight: bold; }
                    table.meta-table td.colon { width: 3%; }
                    .section-box { margin-bottom: 15px; text-align: justify; }
                    .section-title { font-weight: bold; font-size: 11.5pt; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid #ddd; padding-bottom: 2px; }
                    .content-box { border: 1px solid #cbd5e1; padding: 10px 14px; background-color: #f8fafc; border-radius: 4px; font-size: 11pt; }
                    .signature-section { margin-top: 35px; page-break-inside: avoid; }
                    .sig-title { text-align: right; margin-bottom: 20px; font-size: 11pt; }
                    .sig-grid { display: flex; justify-content: space-between; text-align: center; font-size: 10.5pt; }
                    .sig-col { width: 31%; }
                    .sig-space { height: 70px; }
                    .sig-name { font-weight: bold; text-decoration: underline; }
                    .sig-role { font-size: 9.5pt; color: #333; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                ${Store.getKopSuratHtml()}

                <div class="doc-title">
                    <h4>BERITA ACARA & NOTULENSI HASIL RAPAT EVALUASI</h4>
                    <div class="nomor">Nomor: 042/BA-EVAL/LPM/${new Date(ag.tgl).getFullYear()}</div>
                </div>

                <p style="text-indent: 30px; text-align: justify; margin: 10px 0;">
                    Pada hari ini, <b>${new Date(ag.tgl).toLocaleDateString('id-ID', { weekday: 'long' })}</b> tanggal <b>${new Date(ag.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</b>, bertempat di <b>${ag.lokasi}</b>, telah dilaksanakan Rapat Koordinasi dan Evaluasi Kinerja BUMKal Lumbung Pangan Mataram bersama Pemerintah Kalurahan Pleret, dengan rincian musyawarah sebagai berikut:
                </p>

                <table class="meta-table">
                    <tr>
                        <td class="label">Topik / Agenda Rapat</td>
                        <td class="colon">:</td>
                        <td><b>${ag.judul}</b></td>
                    </tr>
                    <tr>
                        <td class="label">Waktu Pelaksanaan</td>
                        <td class="colon">:</td>
                        <td>${ag.waktu}</td>
                    </tr>
                    <tr>
                        <td class="label">Tempat / Lokasi</td>
                        <td class="colon">:</td>
                        <td>${ag.lokasi}</td>
                    </tr>
                    <tr>
                        <td class="label">Pimpinan Musyawarah</td>
                        <td class="colon">:</td>
                        <td>${ag.pimpinan || direktur}</td>
                    </tr>
                    <tr>
                        <td class="label">Notulis Sidang Rapat</td>
                        <td class="colon">:</td>
                        <td>${currentUser} (Staf Sekretariat BUMKal)</td>
                    </tr>
                    <tr>
                        <td class="label">Daftar Kehadiran</td>
                        <td class="colon">:</td>
                        <td>${ag.pesertaHadir || '18 Orang (Lurah, Pamong, Bamuskal, Direksi & Pengelola Kandang)'}</td>
                    </tr>
                </table>

                <div class="section-box">
                    <div class="section-title">I. POKOK-POKOK PEMBAHASAN & EVALUASI KERJA</div>
                    <div class="content-box">
                        <p style="margin: 0;">${ag.deskripsi}</p>
                    </div>
                </div>

                <div class="section-box">
                    <div class="section-title">II. KEPUTUSAN & KESEPAKATAN BERSAMA (RESOLUSI)</div>
                    <div class="content-box" style="border-left: 4px solid #047857; background-color: #f0fdf4;">
                        <p style="margin: 0; font-weight: 600; color: #065f46;">${ag.keputusan || 'Menyetujui secara bulat realisasi efisiensi ransum pakan mandiri silase jagung dan percepatan penyetoran PADes bagi Kalurahan Pleret.'}</p>
                    </div>
                </div>

                <p style="text-indent: 30px; text-align: justify; margin: 12px 0;">
                    Demikian Berita Acara dan Notulensi Hasil Rapat ini dibuat dengan sesungguhnya dan penuh tanggung jawab untuk dijadikan landasan kerja bersama serta bahan laporan pertanggungjawaban kepada Kalurahan Pleret.
                </p>

                <div class="signature-section">
                    <div class="sig-title">Pleret, ${new Date(ag.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div class="sig-grid">
                        <div class="sig-col">
                            <div>Mengetahui,<br><b>Lurah Kalurahan Pleret</b><br>(Penasihat Lembaga)</div>
                            <div class="sig-space"></div>
                            <div class="sig-name">${lurah}</div>
                            <div class="sig-role">Pemerintah Kalurahan Pleret</div>
                        </div>
                        <div class="sig-col">
                            <div>Pimpinan Rapat,<br><b>Direktur Utama BUMKal</b><br>Lumbung Pangan Mataram</div>
                            <div class="sig-space"></div>
                            <div class="sig-name">${direktur}</div>
                            <div class="sig-role">NIP. BUMK-PLR-001</div>
                        </div>
                        <div class="sig-col">
                            <div>Notulis Rapat,<br><b>Sekretaris / Notulis</b><br>BUMKal LPM</div>
                            <div class="sig-space"></div>
                            <div class="sig-name">${currentUser}</div>
                            <div class="sig-role">NIP. BUMK-PLR-014</div>
                        </div>
                    </div>
                </div>

                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 24px; font-size: 13px; font-weight: bold; background-color: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🖨️ Cetak Berita Acara Sekarang (PDF/Printer)
                    </button>
                </div>
            </body>
            </html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
            printWin.print();
        }, 350);
    }
};
