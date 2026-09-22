/**
 * Modul Berita Acara Kematian & Afkir Ternak
 * Dokumen Legalitas & Akuntabilitas Aset Biologis LPJ BUMKal Lumbung Pangan Mataram Pleret
 * Standar Audit Inspektorat, Bamuskal, dan Akuntan Desa
 */

const BeritaAcaraModule = {
    searchQuery: "",
    filterTipe: "all",

    render() {
        const list = Store.getBeritaAcara ? Store.getBeritaAcara() : [];
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const pengaturan = Store.getPengaturan ? Store.getPengaturan() : {};

        // Filter list
        let filtered = [...list];
        if (this.filterTipe !== "all") {
            filtered = filtered.filter(b => (b.tipeKejadian || '').toLowerCase().includes(this.filterTipe.toLowerCase()));
        }
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(b => 
                (b.nomorSurat || '').toLowerCase().includes(q) ||
                (b.eartag || '').toLowerCase().includes(q) ||
                (b.nama || '').toLowerCase().includes(q) ||
                (b.penyebab || '').toLowerCase().includes(q)
            );
        }

        // Metrik KPI
        const totalSurat = list.length;
        const totalKerugian = list.reduce((acc, b) => acc + (parseFloat(b.nilaiBukuAset) || 0), 0);
        const curMonthStr = new Date().toISOString().slice(0, 7);
        const bulanIniCount = list.filter(b => (b.tglSurat || '').startsWith(curMonthStr)).length;
        const afkirCount = list.filter(b => (b.tipeKejadian || '').toLowerCase().includes('afkir')).length;

        return `
        <div class="space-y-6">
            <!-- Header Section -->
            <div class="bg-gradient-to-r from-red-700 via-rose-800 to-amber-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div class="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3">
                            <i data-lucide="file-check-2" class="w-4 h-4"></i>
                            Dokumen Legalitas & Audit LPJ
                        </div>
                        <h1 class="text-2xl md:text-3xl font-black tracking-tight">Berita Acara Kematian / Afkir Ternak</h1>
                        <p class="text-rose-100 text-sm mt-1 max-w-2xl">
                            Pencatatan resmi berita acara kematian dan afkir ternak berformat kop resmi BUMKal Pleret lengkap dengan nomor surat, diagnosa klinis medis, dan pengesahan tanda tangan berjenjang untuk LPJ audit aset biologis desa.
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <button onclick="BeritaAcaraModule.openModalTambah()" class="px-5 py-3 rounded-2xl bg-white text-rose-900 hover:bg-rose-50 font-bold shadow-lg flex items-center gap-2 transition-all transform active:scale-95">
                            <i data-lucide="plus-circle" class="w-5 h-5"></i>
                            Terbitkan Berita Acara Baru
                        </button>
                    </div>
                </div>
            </div>

            <!-- 4 KPI Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Berita Acara</span>
                        <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <i data-lucide="file-text" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-slate-800 dark:text-white mt-2">${totalSurat} <span class="text-sm font-medium text-slate-500">Dokumen</span></div>
                    <p class="text-xs text-slate-500 mt-1">Tersimpan dalam arsip audit LPJ</p>
                </div>

                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Buku Aset Mati/Afkir</span>
                        <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <i data-lucide="coins" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">Rp ${totalKerugian.toLocaleString('id-ID')}</div>
                    <p class="text-xs text-slate-500 mt-1">Akumulasi penurunan nilai buku aset</p>
                </div>

                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Kasus Bulan Ini</span>
                        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <i data-lucide="calendar" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-slate-800 dark:text-white mt-2">${bulanIniCount} <span class="text-sm font-medium text-slate-500">Ekor</span></div>
                    <p class="text-xs text-slate-500 mt-1">Periode ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                </div>

                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Ternak Afkir / Cacat</span>
                        <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">${afkirCount} <span class="text-sm font-medium text-slate-500">Ekor</span></div>
                    <p class="text-xs text-slate-500 mt-1">Keputusan afkir seleksi breeding</p>
                </div>
            </div>

            <!-- Filter & Search Toolbar -->
            <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div class="flex flex-1 w-full sm:w-auto items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400"></i>
                    <input type="text" value="${this.searchQuery}" oninput="BeritaAcaraModule.onSearch(this.value)" placeholder="Cari nomor surat, eartag, nama domba, diagnosa..." class="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 w-full placeholder-slate-400">
                    ${this.searchQuery ? `<button onclick="BeritaAcaraModule.onSearch('')" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-4 h-4"></i></button>` : ''}
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <select onchange="BeritaAcaraModule.onFilterTipe(this.value)" class="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 outline-none w-full sm:w-auto">
                        <option value="all" ${this.filterTipe === 'all' ? 'selected' : ''}>Semua Tipe Kejadian</option>
                        <option value="kematian" ${this.filterTipe === 'kematian' ? 'selected' : ''}>Kematian</option>
                        <option value="afkir" ${this.filterTipe === 'afkir' ? 'selected' : ''}>Afkir / Cacat</option>
                    </select>
                </div>
            </div>

            <!-- Arsip Berita Acara Table -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div class="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                        <h2 class="font-bold text-slate-800 dark:text-white text-lg">Buku Register Berita Acara</h2>
                        <p class="text-xs text-slate-500">Menampilkan ${filtered.length} dari ${list.length} dokumen legalitas</p>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th class="p-3.5 pl-5">Nomor & Tanggal Surat</th>
                                <th class="p-3.5">Identitas Ternak</th>
                                <th class="p-3.5">Lokasi / Kandang</th>
                                <th class="p-3.5">Tipe & Diagnosa Klinis</th>
                                <th class="p-3.5 text-right">Nilai Buku Aset</th>
                                <th class="p-3.5">Pemeriksa & Pengesah</th>
                                <th class="p-3.5 text-center pr-5">Aksi Legalitas</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="7" class="text-center py-12">
                                        <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                            <i data-lucide="file-check" class="w-8 h-8"></i>
                                        </div>
                                        <p class="font-bold text-slate-700 dark:text-slate-200 text-base">Belum Ada Berita Acara</p>
                                        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Klik tombol "Terbitkan Berita Acara Baru" di atas saat ada ternak mati atau afkir untuk mencetak dokumen resmi audit.</p>
                                    </td>
                                </tr>
                            ` : filtered.map((b, idx) => `
                                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                    <td class="p-3.5 pl-5">
                                        <div class="font-bold text-slate-900 dark:text-white font-mono text-xs text-rose-700 dark:text-rose-400">${b.nomorSurat}</div>
                                        <div class="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                            <i data-lucide="calendar" class="w-3 h-3"></i>
                                            ${b.tglSurat} (${b.jamKematian || '-'})
                                        </div>
                                    </td>
                                    <td class="p-3.5">
                                        <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span class="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">${b.eartag}</span>
                                            <span>${b.nama || '-'}</span>
                                        </div>
                                        <div class="text-xs text-slate-500 mt-0.5">${b.ras || '-'} • ${b.kelamin || '-'} • ${b.bobotTerakhir ? b.bobotTerakhir.toFixed(2) + ' kg' : '-'}</div>
                                    </td>
                                    <td class="p-3.5">
                                        <div class="text-xs font-medium text-slate-800 dark:text-slate-200">${b.kandang || '-'}</div>
                                        <div class="text-[11px] text-slate-500">${b.sekat || '-'}</div>
                                    </td>
                                    <td class="p-3.5 max-w-xs">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                            (b.tipeKejadian || '').toLowerCase().includes('afkir')
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                        }">
                                            ${b.tipeKejadian || 'Kematian'}
                                        </span>
                                        <div class="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2" title="${b.penyebab || ''}">
                                            ${b.penyebab || '-'}
                                        </div>
                                    </td>
                                    <td class="p-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                                        Rp ${(parseFloat(b.nilaiBukuAset) || 0).toLocaleString('id-ID')}
                                    </td>
                                    <td class="p-3.5 text-xs">
                                        <div class="font-semibold text-slate-800 dark:text-slate-200">${b.saksi1Nama || '-'}</div>
                                        <div class="text-[11px] text-slate-500">Dirut: ${b.mengetahuiNama || '-'}</div>
                                    </td>
                                    <td class="p-3.5 pr-5 text-center">
                                        <div class="flex items-center justify-center gap-1.5">
                                            <button onclick="BeritaAcaraModule.cetakBerkop('${b.id}')" title="Cetak Berkop Resmi" class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm">
                                                <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                                                Cetak
                                            </button>
                                            <button onclick="BeritaAcaraModule.lihatDetail('${b.id}')" title="Detail Berita Acara" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                                <i data-lucide="eye" class="w-4 h-4"></i>
                                            </button>
                                            <button onclick="BeritaAcaraModule.hapus('${b.id}')" title="Hapus Arsip" class="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
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

            <!-- Petunjuk Audit LPJ Banner -->
            <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 text-amber-900 dark:text-amber-200 flex items-start gap-4">
                <i data-lucide="info" class="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"></i>
                <div class="text-xs leading-relaxed space-y-1">
                    <div class="font-bold text-sm">Standar Operasional Prosedur (SOP) Audit Aset Ternak BUMKal:</div>
                    <p>1. Setiap kematian/afkir wajib dilaporkan maksimal 1x24 jam dengan Berita Acara resmi berkop Kalurahan Pleret & BUMKal LPM.</p>
                    <p>2. Bangkai wajib melalui diagnosa nekropsi/klinis awal oleh Paramedik Veteriner / Kepala Kandang untuk mencegah potensi penularan PMK atau antraks.</p>
                    <p>3. Lembar cetak Berita Acara fisik wajib ditandatangani basah oleh 3 pihak (Pemeriksa, Saksi, dan Direktur Utama) dan dilampirkan dalam Bundel LPJ Tahunan BUMKal ke Bamuskal & Pemerintah Kalurahan Pleret.</p>
                </div>
            </div>
        </div>

        <!-- Modal Container -->
        <div id="ba-modal-container"></div>
        `;
    },

    onSearch(q) {
        this.searchQuery = q;
        if (window.App && typeof App.renderContent === 'function') {
            App.renderContent();
        }
    },

    onFilterTipe(t) {
        this.filterTipe = t;
        if (window.App && typeof App.renderContent === 'function') {
            App.renderContent();
        }
    },

    openModalTambah(preselectedEartag = null) {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const year = new Date().getFullYear();
        const list = Store.getBeritaAcara ? Store.getBeritaAcara() : [];
        const count = list.length + 1;
        const noFormatted = String(count).padStart(3, '0');
        const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        const curMonth = romanMonths[new Date().getMonth()];
        const autoNoSurat = `${noFormatted}/BA-KMT/BUMKAL-LPM/PLT/${curMonth}/${year}`;
        const todayStr = new Date().toISOString().split('T')[0];

        const container = document.getElementById("ba-modal-container");
        if (!container) return;

        container.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div class="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-700 my-8">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <i data-lucide="file-plus-2" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-slate-800 dark:text-white">Penerbitan Berita Acara Baru</h3>
                            <p class="text-xs text-slate-500">Legalitas resmi kematian / afkir ternak aset desa</p>
                        </div>
                    </div>
                    <button onclick="BeritaAcaraModule.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <form onsubmit="BeritaAcaraModule.submitTambah(event)" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Nomor Surat Resmi</label>
                            <input type="text" id="ba-nomor-surat" value="${autoNoSurat}" required class="w-full text-sm font-mono p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Tanggal & Jam Kejadian</label>
                            <div class="grid grid-cols-2 gap-2">
                                <input type="date" id="ba-tgl" value="${todayStr}" required class="text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none">
                                <input type="text" id="ba-jam" value="07:00 WIB" placeholder="07:00 WIB" required class="text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none">
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Pilih Domba dari Database *</label>
                        <select id="ba-select-domba" onchange="BeritaAcaraModule.onPilihDomba(this.value)" required class="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none">
                            <option value="">-- Pilih Eartag / Domba --</option>
                            ${dombaList.map(d => `
                                <option value="${d.id || d.eartag}" ${preselectedEartag === d.eartag ? 'selected' : ''}>
                                    ${d.eartag} - ${d.nama || 'Tanpa Nama'} (${d.ras || 'Domba'}, ${d.kandang || 'Kandang'} / ${d.sekat || 'Sekat'}) [${d.status || 'Aktif'}]
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <!-- Auto-filled Preview Grid -->
                    <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span class="text-slate-400 block">Nama Ternak:</span>
                            <span id="ba-pv-nama" class="font-bold text-slate-800 dark:text-slate-200">-</span>
                        </div>
                        <div>
                            <span class="text-slate-400 block">Ras & Kelamin:</span>
                            <span id="ba-pv-ras" class="font-bold text-slate-800 dark:text-slate-200">-</span>
                        </div>
                        <div>
                            <span class="text-slate-400 block">Bobot Terakhir:</span>
                            <span id="ba-pv-bobot" class="font-bold text-slate-800 dark:text-slate-200">- kg</span>
                        </div>
                        <div>
                            <span class="text-slate-400 block">Nilai Buku Awal:</span>
                            <span id="ba-pv-nilai" class="font-bold text-rose-600 dark:text-rose-400">Rp 0</span>
                        </div>
                    </div>

                    <input type="hidden" id="ba-domba-id" value="">
                    <input type="hidden" id="ba-eartag" value="">
                    <input type="hidden" id="ba-nama" value="">
                    <input type="hidden" id="ba-ras" value="">
                    <input type="hidden" id="ba-kelamin" value="">
                    <input type="hidden" id="ba-kandang" value="">
                    <input type="hidden" id="ba-sekat" value="">
                    <input type="hidden" id="ba-bobot" value="0">
                    <input type="hidden" id="ba-nilaibuku" value="0">

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Tipe Kejadian *</label>
                            <select id="ba-tipe" required class="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none">
                                <option value="Kematian Alami">Kematian Alami / Sakit</option>
                                <option value="Kematian Akut (Kembung/Tersedak)">Kematian Akut (Kembung / Tersedak)</option>
                                <option value="Kecelakaan / Cedera Fisik">Kecelakaan / Cedera Fisik</option>
                                <option value="Afkir Berat (Cacat Permanen/Kemandulan)">Afkir Berat (Cacat Permanen / Kemandulan)</option>
                                <option value="Afkir Seleksi Genetik">Afkir Seleksi Genetik</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Penanganan Bangkai (Biosecurity) *</label>
                            <input type="text" id="ba-tindakan" value="Penguburan biosecurity kedalaman 1.5m + kapur aktif" required class="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Diagnosa Klinis & Kronologi Penyebab *</label>
                        <textarea id="ba-penyebab" rows="2" required placeholder="Contoh: Domba mengalami kembung akut (bloat) pasca pakan basah, dilakukan pertolongan darurat trocar namun tidak tertolong." class="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Pemeriksa (Paramedik)</label>
                            <input type="text" id="ba-saksi1" value="Wahyu Pratama, A.Md." class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Saksi Lapangan</label>
                            <input type="text" id="ba-saksi2" value="Tri Haryanto" class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Mengetahui (Direktur)</label>
                            <input type="text" id="ba-mengetahui" value="H. Supardi, S.Pt." class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        </div>
                    </div>

                    <div class="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-3">
                        <input type="checkbox" id="ba-update-status" checked class="w-4 h-4 rounded text-rose-600 focus:ring-rose-500">
                        <label for="ba-update-status" class="text-xs text-rose-900 dark:text-rose-200 font-medium">
                            Otomatis perbarui status domba terpilih menjadi <strong>"Mati"</strong> atau <strong>"Afkir"</strong> di sistem database domba
                        </label>
                    </div>

                    <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button type="button" onclick="BeritaAcaraModule.closeModal()" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
                            Batal
                        </button>
                        <button type="submit" class="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all">
                            Simpan & Terbitkan
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;

        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
        if (preselectedEartag) {
            this.onPilihDomba(preselectedEartag);
        }
    },

    onPilihDomba(dombaIdOrEartag) {
        if (!dombaIdOrEartag) return;
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const d = dombaList.find(item => item.id === dombaIdOrEartag || item.eartag === dombaIdOrEartag);
        if (!d) return;

        const latestWeight = d.riwayatTimbang?.length > 0 
            ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot 
            : (d.bobotAwal || 25);
        const nilaiAset = parseFloat(d.hargaBeli) || (latestWeight * 75000);

        document.getElementById("ba-domba-id").value = d.id || d.eartag;
        document.getElementById("ba-eartag").value = d.eartag;
        document.getElementById("ba-nama").value = d.nama || '';
        document.getElementById("ba-ras").value = d.ras || '';
        document.getElementById("ba-kelamin").value = d.kelamin || '';
        document.getElementById("ba-kandang").value = d.kandang || '';
        document.getElementById("ba-sekat").value = d.sekat || '';
        document.getElementById("ba-bobot").value = latestWeight;
        document.getElementById("ba-nilaibuku").value = nilaiAset;

        // Update preview text
        document.getElementById("ba-pv-nama").textContent = d.nama || d.eartag;
        document.getElementById("ba-pv-ras").textContent = `${d.ras || 'Domba'} (${d.kelamin || 'Jantan'})`;
        document.getElementById("ba-pv-bobot").textContent = `${parseFloat(latestWeight).toFixed(2)} kg`;
        document.getElementById("ba-pv-nilai").textContent = `Rp ${Math.round(nilaiAset).toLocaleString('id-ID')}`;
    },

    submitTambah(e) {
        e.preventDefault();
        const data = {
            nomorSurat: document.getElementById("ba-nomor-surat").value,
            tglSurat: document.getElementById("ba-tgl").value,
            tglKematian: document.getElementById("ba-tgl").value,
            jamKematian: document.getElementById("ba-jam").value,
            dombaId: document.getElementById("ba-domba-id").value,
            eartag: document.getElementById("ba-eartag").value,
            nama: document.getElementById("ba-nama").value,
            ras: document.getElementById("ba-ras").value,
            kelamin: document.getElementById("ba-kelamin").value,
            kandang: document.getElementById("ba-kandang").value,
            sekat: document.getElementById("ba-sekat").value,
            bobotTerakhir: parseFloat(document.getElementById("ba-bobot").value) || 0,
            nilaiBukuAset: parseFloat(document.getElementById("ba-nilaibuku").value) || 0,
            tipeKejadian: document.getElementById("ba-tipe").value,
            penyebab: document.getElementById("ba-penyebab").value,
            tindakanBangkai: document.getElementById("ba-tindakan").value,
            saksi1Nama: document.getElementById("ba-saksi1").value,
            saksi2Nama: document.getElementById("ba-saksi2").value,
            mengetahuiNama: document.getElementById("ba-mengetahui").value,
            updateStatusDomba: document.getElementById("ba-update-status").checked
        };

        if (!data.eartag) {
            alert("Harap pilih domba terlebih dahulu!");
            return;
        }

        const created = Store.addBeritaAcara(data);
        this.closeModal();

        if (window.App && typeof App.renderContent === 'function') {
            App.renderContent();
        }

        if (confirm("Berita Acara berhasil diterbitkan!\nApakah Anda ingin langsung mencetak dokumen berkop resmi ini?")) {
            this.cetakBerkop(created.id);
        }
    },

    lihatDetail(id) {
        const list = Store.getBeritaAcara ? Store.getBeritaAcara() : [];
        const b = list.find(item => item.id === id);
        if (!b) return;

        const container = document.getElementById("ba-modal-container");
        if (!container) return;

        container.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div class="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-5">
                    <div>
                        <h3 class="font-bold text-lg text-slate-800 dark:text-white">Detail Berita Acara</h3>
                        <p class="text-xs font-mono text-rose-600 dark:text-rose-400">${b.nomorSurat}</p>
                    </div>
                    <button onclick="BeritaAcaraModule.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <div class="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                    <div class="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                        <div><span class="text-xs text-slate-400 block">Eartag & Nama:</span> <strong>${b.eartag}</strong> (${b.nama || '-'})</div>
                        <div><span class="text-xs text-slate-400 block">Ras / Kelamin:</span> ${b.ras || '-'} / ${b.kelamin || '-'}</div>
                        <div><span class="text-xs text-slate-400 block">Kandang / Sekat:</span> ${b.kandang || '-'} (${b.sekat || '-'})</div>
                        <div><span class="text-xs text-slate-400 block">Bobot & Nilai Aset:</span> ${b.bobotTerakhir ? b.bobotTerakhir.toFixed(2) + ' kg' : '-'} • <strong>Rp ${(b.nilaiBukuAset || 0).toLocaleString('id-ID')}</strong></div>
                    </div>

                    <div>
                        <span class="text-xs text-slate-400 block font-bold uppercase">Waktu & Tipe Kejadian:</span>
                        <div class="mt-1">${b.tglKematian} pk. ${b.jamKematian || '-'} • <span class="font-bold text-rose-600">${b.tipeKejadian}</span></div>
                    </div>

                    <div>
                        <span class="text-xs text-slate-400 block font-bold uppercase">Diagnosa Klinis & Kronologi:</span>
                        <div class="mt-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs leading-relaxed">
                            ${b.penyebab || '-'}
                        </div>
                    </div>

                    <div>
                        <span class="text-xs text-slate-400 block font-bold uppercase">Tindakan Bangkai / Biosecurity:</span>
                        <div class="mt-1 text-xs">${b.tindakanBangkai || '-'}</div>
                    </div>

                    <div class="border-t border-slate-100 dark:border-slate-700 pt-3 text-xs">
                        <span class="text-slate-400 block font-bold uppercase mb-2">Penandatangan Legalitas:</span>
                        <div class="grid grid-cols-3 gap-2 text-center">
                            <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div class="text-[10px] text-slate-400">Pemeriksa</div>
                                <div class="font-bold text-slate-800 dark:text-slate-200 mt-1">${b.saksi1Nama}</div>
                            </div>
                            <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div class="text-[10px] text-slate-400">Saksi</div>
                                <div class="font-bold text-slate-800 dark:text-slate-200 mt-1">${b.saksi2Nama}</div>
                            </div>
                            <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div class="text-[10px] text-slate-400">Mengetahui (Dirut)</div>
                                <div class="font-bold text-slate-800 dark:text-slate-200 mt-1">${b.mengetahuiNama}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button onclick="BeritaAcaraModule.closeModal()" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm">
                        Tutup
                    </button>
                    <button onclick="BeritaAcaraModule.cetakBerkop('${b.id}')" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md">
                        <i data-lucide="printer" class="w-4 h-4"></i>
                        Cetak Berkop Surat
                    </button>
                </div>
            </div>
        </div>
        `;
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    },

    cetakBerkop(id) {
        const list = Store.getBeritaAcara ? Store.getBeritaAcara() : [];
        const b = list.find(item => item.id === id);
        if (!b) return;

        const container = document.getElementById("ba-modal-container");
        if (!container) return;

        container.innerHTML = `
        <div id="print-area-wrapper" class="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
            <div class="bg-white text-slate-900 rounded-3xl max-w-3xl w-full p-6 md:p-10 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:w-full print:p-0 my-4 font-serif">
                
                <!-- Action Bar (Hidden when printing) -->
                <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden font-sans">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Pratinjau Lembar Berita Acara Resmi (A4)</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="BeritaAcaraModule.cetakWindow('${b.id}')" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer">
                            <i data-lucide="printer" class="w-4 h-4"></i>
                            Cetak / Download PDF (A4)
                        </button>
                        <button type="button" onclick="BeritaAcaraModule.closeModal()" class="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>

                <!-- SURAT RESMI BERKOP (PRINT TARGET) -->
                <div class="text-slate-900 font-serif leading-relaxed" id="surat-resmi-print">
                    
                    <!-- KOP SURAT RESMI DENGAN GARIS GANDA TATA NASKAH DINAS -->
                    <div class="text-center font-sans border-b-[3px] border-slate-900 pb-2 mb-1">
                        <div class="text-[12px] font-bold tracking-wider uppercase text-slate-700">PEMERINTAH KABUPATEN BANTUL</div>
                        <div class="text-[13px] font-extrabold tracking-wide uppercase text-slate-900">KAPANEWON PLERET • PEMERINTAH KALURAHAN PLERET</div>
                        <div class="text-[17px] sm:text-[19px] font-black uppercase text-emerald-900 tracking-tight mt-0.5">BADAN USAHA MILIK KALURAHAN "LUMBUNG PANGAN MATARAM"</div>
                        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-700">UNIT USAHA PETERNAKAN TERPADU & PENGGEMUKAN DOMBA KALURAHAN</div>
                        <div class="text-[10px] text-slate-600 mt-1 italic">Alamat: Kompleks Kandang Terpadu BUMKal, Kapanewon Pleret, Kabupaten Bantul, D.I. Yogyakarta 55791 • Portal: https://ternakpleret.my.id</div>
                    </div>
                    <!-- Garis Tipis Kedua khas KOP Surat Dinas -->
                    <div class="border-b-[1px] border-slate-900 mb-6"></div>

                    <!-- JUDUL SURAT -->
                    <div class="text-center mb-6 font-sans">
                        <h2 class="text-base md:text-lg font-black uppercase tracking-wide underline">
                            BERITA ACARA PEMERIKSAAN ${b.tipeKejadian ? b.tipeKejadian.toUpperCase() : 'KEMATIAN'} TERNAK
                        </h2>
                        <div class="text-xs font-mono font-bold text-slate-800 mt-1">
                            Nomor: ${b.nomorSurat}
                        </div>
                    </div>

                    <!-- PEMBUKA -->
                    <p class="text-xs md:text-sm text-justify mb-4">
                        Pada hari ini, tanggal <strong>${b.tglSurat}</strong> bertempat di Kompleks Sentra Peternakan Domba Terpadu BUMKal Lumbung Pangan Mataram Kalurahan Pleret, yang bertanda tangan di bawah ini menerangkan dengan sebenarnya bahwa telah terjadi peristiwa <strong>${b.tipeKejadian || 'Kematian Ternak'}</strong> atas aset biologis milik BUMKal Lumbung Pangan Mataram dengan rincian identitas sebagai berikut:
                    </p>

                    <!-- TABEL IDENTITAS TERNAK -->
                    <div class="border border-slate-800 rounded-lg mb-5 overflow-hidden text-xs md:text-sm font-sans">
                        <table class="w-full text-left">
                            <tr class="border-b border-slate-300">
                                <td class="p-2.5 w-1/3 bg-slate-100 font-bold text-slate-800">Nomor Eartag / ID Ternak</td>
                                <td class="p-2.5 font-mono font-bold text-slate-900">${b.eartag}</td>
                            </tr>
                            <tr class="border-b border-slate-300">
                                <td class="p-2.5 bg-slate-100 font-bold text-slate-800">Nama / Panggilan Ternak</td>
                                <td class="p-2.5">${b.nama || '-'}</td>
                            </tr>
                            <tr class="border-b border-slate-300">
                                <td class="p-2.5 bg-slate-100 font-bold text-slate-800">Bangsa / Ras Ternak</td>
                                <td class="p-2.5">${b.ras || '-'} (${b.kelamin || '-'})</td>
                            </tr>
                            <tr class="border-b border-slate-300">
                                <td class="p-2.5 bg-slate-100 font-bold text-slate-800">Lokasi Penempatan</td>
                                <td class="p-2.5">${b.kandang || '-'} - ${b.sekat || '-'}</td>
                            </tr>
                            <tr class="border-b border-slate-300">
                                <td class="p-2.5 bg-slate-100 font-bold text-slate-800">Bobot Badan Terakhir</td>
                                <td class="p-2.5 font-bold font-mono">${b.bobotTerakhir ? parseFloat(b.bobotTerakhir).toFixed(2) + ' kg' : '-'}</td>
                            </tr>
                            <tr>
                                <td class="p-2.5 bg-slate-100 font-bold text-slate-800">Nilai Buku Aset Biologis</td>
                                <td class="p-2.5 font-bold text-rose-800 font-mono">Rp ${(parseFloat(b.nilaiBukuAset) || 0).toLocaleString('id-ID')}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- KRONOLOGI & DIAGNOSA KLINIS -->
                    <div class="mb-4 text-xs md:text-sm font-sans">
                        <div class="font-bold uppercase text-xs mb-1.5 text-slate-800">Hasil Diagnosa Klinis & Kronologi Kejadian:</div>
                        <div class="p-3.5 border border-slate-400 bg-slate-50/70 rounded-lg text-justify leading-relaxed font-serif">
                            ${b.penyebab || 'Telah dilakukan pemeriksaan fisik dan nekropsi awal oleh petugas medik veteriner kandang.'}
                        </div>
                    </div>

                    <!-- PENANGANAN BIOSECURITY -->
                    <div class="mb-6 text-xs md:text-sm font-sans">
                        <div class="font-bold uppercase text-xs mb-1.5 text-slate-800">Tindakan Pemusnahan / Biosecurity Bangkai:</div>
                        <div class="p-3 border border-slate-300 rounded-lg leading-relaxed font-serif">
                            ${b.tindakanBangkai || 'Penguburan biosecurity dengan kapur tohor (kedalaman > 1.5 meter) sesuai standar operasional pengelolaan limbah dan bangkai ternak kalurahan.'}
                        </div>
                    </div>

                    <!-- PENUTUP -->
                    <p class="text-xs md:text-sm text-justify mb-8">
                        Demikian Berita Acara ini dibuat dengan sebenarnya dan penuh rasa tanggung jawab agar dapat dipergunakan sebagai dokumen pertanggungjawaban legalitas, dasar penyesuaian buku catatan aset biologis, dan kelengkapan dokumen Laporan Pertanggungjawaban (LPJ) BUMKal kepada Bamuskal dan Pemerintah Kalurahan Pleret.
                    </p>

                    <!-- TANDA TANGAN 3 PIHAK BERJENJANG -->
                    <div class="grid grid-cols-3 gap-4 text-center text-xs md:text-sm font-sans pt-4">
                        <div>
                            <div class="text-slate-600 font-medium">Pemeriksa / Paramedik,</div>
                            <div class="h-20 flex items-end justify-center">
                                <div class="border-b-2 border-slate-900 pb-1 font-bold w-4/5 text-slate-900">${b.saksi1Nama}</div>
                            </div>
                            <div class="text-[11px] text-slate-600 mt-1">${b.saksi1Jabatan || 'Kepala Kandang'}</div>
                        </div>
                        <div>
                            <div class="text-slate-600 font-medium">Saksi Lapangan,</div>
                            <div class="h-20 flex items-end justify-center">
                                <div class="border-b-2 border-slate-900 pb-1 font-bold w-4/5 text-slate-900">${b.saksi2Nama}</div>
                            </div>
                            <div class="text-[11px] text-slate-600 mt-1">${b.saksi2Jabatan || 'Staf Peternakan'}</div>
                        </div>
                        <div>
                            <div class="text-slate-600 font-medium">Mengetahui & Menyetujui,</div>
                            <div class="h-20 flex items-end justify-center">
                                <div class="border-b-2 border-slate-900 pb-1 font-bold w-4/5 text-slate-900">${b.mengetahuiNama}</div>
                            </div>
                            <div class="text-[11px] text-slate-600 mt-1">${b.mengetahuiJabatan || 'Direktur Utama BUMKal'}</div>
                        </div>
                    </div>

                    <!-- FOOTER CAP & TANGGAL -->
                    <div class="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-sans">
                        <div>Sistem Informasi Peternakan BUMKal LPM Pleret • Arsip Audit LPJ Aset Desa</div>
                        <div>ID Dokumen: ${b.id} • Tanggal Terbit: ${b.tglSurat}</div>
                    </div>
                </div>
            </div>
        </div>
        `;

        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    },

    // JENDELA CETAK RESMI TERISOLASI A4
    cetakWindow(id) {
        const list = Store.getBeritaAcara ? Store.getBeritaAcara() : [];
        const b = list.find(item => item.id === id);
        if (!b) return;

        const printWin = window.open("", "_blank", "width=920,height=1000");
        if (!printWin) {
            window.print();
            return;
        }

        printWin.document.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <title>Berita Acara - ${b.nomorSurat ? b.nomorSurat.replace(/[\/\\]/g, '_') : b.id}</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 12mm 15mm;
                    }
                    * { box-sizing: border-box; }
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        color: #111827;
                        background: #ffffff;
                        margin: 0;
                        padding: 0;
                        font-size: 11pt;
                        line-height: 1.4;
                    }
                    .no-print {
                        background: #f8fafc;
                        padding: 12px 16px;
                        border-bottom: 1px solid #e2e8f0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-family: sans-serif;
                    }
                    .btn-print {
                        padding: 8px 18px;
                        background: #047857;
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 13px;
                    }
                    .btn-close {
                        padding: 8px 16px;
                        background: #64748b;
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 13px;
                        margin-left: 8px;
                    }
                    .paper-sheet {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .kop-wrap {
                        text-align: center;
                        font-family: Arial, sans-serif;
                        border-bottom: 3px solid #000;
                        padding-bottom: 6px;
                        margin-bottom: 2px;
                    }
                    .kop-subline {
                        border-bottom: 1px solid #000;
                        margin-bottom: 20px;
                    }
                    .kop-1 { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
                    .kop-2 { font-size: 12pt; font-weight: 800; text-transform: uppercase; }
                    .kop-3 { font-size: 15pt; font-weight: 900; color: #064e3b; text-transform: uppercase; margin: 2px 0; }
                    .kop-4 { font-size: 10pt; font-weight: bold; text-transform: uppercase; }
                    .kop-5 { font-size: 9pt; font-style: italic; color: #4b5563; }
                    .doc-title-wrap {
                        text-align: center;
                        margin: 16px 0 20px 0;
                        font-family: Arial, sans-serif;
                    }
                    .doc-title {
                        font-size: 13pt;
                        font-weight: 900;
                        text-transform: uppercase;
                        text-decoration: underline;
                        letter-spacing: 0.5px;
                    }
                    .doc-no {
                        font-size: 10pt;
                        font-family: monospace;
                        font-weight: bold;
                        margin-top: 4px;
                    }
                    .para {
                        text-align: justify;
                        margin-bottom: 14px;
                        font-size: 11pt;
                    }
                    table.data-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-family: Arial, sans-serif;
                        font-size: 10pt;
                        margin-bottom: 16px;
                    }
                    table.data-table th, table.data-table td {
                        border: 1px solid #334155;
                        padding: 6px 10px;
                    }
                    table.data-table td.label {
                        width: 35%;
                        background: #f1f5f9;
                        font-weight: bold;
                        color: #1e293b;
                    }
                    .box-section {
                        margin-bottom: 14px;
                        font-family: Arial, sans-serif;
                    }
                    .box-title {
                        font-size: 10pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                        color: #0f172a;
                    }
                    .box-content {
                        border: 1px solid #475569;
                        padding: 8px 12px;
                        border-radius: 4px;
                        background: #f8fafc;
                        font-family: 'Times New Roman', serif;
                        font-size: 10.5pt;
                        text-align: justify;
                        line-height: 1.4;
                    }
                    .sign-grid {
                        display: flex;
                        justify-content: space-between;
                        text-align: center;
                        font-family: Arial, sans-serif;
                        font-size: 10pt;
                        margin-top: 24px;
                    }
                    .sign-box {
                        width: 32%;
                    }
                    .sign-space {
                        height: 70px;
                        border-bottom: 1.5px solid #000;
                        width: 85%;
                        margin: 0 auto;
                    }
                    .legal-foot {
                        margin-top: 24px;
                        padding-top: 8px;
                        border-top: 1px solid #cbd5e1;
                        display: flex;
                        justify-content: space-between;
                        font-size: 8.5pt;
                        color: #64748b;
                        font-family: Arial, sans-serif;
                    }
                    @media print {
                        .no-print { display: none !important; }
                        body { padding: 0; }
                        .paper-sheet { padding: 0; max-width: 100%; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <div>
                        <b style="color:#047857;">Pratinjau Cetak Berita Acara Resmi</b>
                        <span style="font-size:12px;color:#64748b;margin-left:8px;">Format Baku Tata Naskah Dinas A4</span>
                    </div>
                    <div>
                        <button class="btn-print" onclick="window.print()">🖨️ Cetak Lembar Berita Acara</button>
                        <button class="btn-close" onclick="window.close()">Tutup</button>
                    </div>
                </div>

                <div class="paper-sheet">
                    <!-- KOP SURAT RESMI -->
                    <div class="kop-wrap">
                        <div class="kop-1">PEMERINTAH KABUPATEN BANTUL</div>
                        <div class="kop-2">KAPANEWON PLERET • PEMERINTAH KALURAHAN PLERET</div>
                        <div class="kop-3">BADAN USAHA MILIK KALURAHAN "LUMBUNG PANGAN MATARAM"</div>
                        <div class="kop-4">UNIT USAHA PETERNAKAN TERPADU & PENGGEMUKAN DOMBA KALURAHAN</div>
                        <div class="kop-5">Kompleks Sentra Peternakan Kalurahan Pleret, Kapanewon Pleret, Kabupaten Bantul, D.I. Yogyakarta 55791</div>
                    </div>
                    <div class="kop-subline"></div>

                    <!-- JUDUL SURAT -->
                    <div class="doc-title-wrap">
                        <div class="doc-title">BERITA ACARA PEMERIKSAAN ${b.tipeKejadian ? b.tipeKejadian.toUpperCase() : 'KEMATIAN'} TERNAK</div>
                        <div class="doc-no">Nomor: ${b.nomorSurat}</div>
                    </div>

                    <!-- PEMBUKA -->
                    <div class="para">
                        Pada hari ini, tanggal <strong>${b.tglSurat}</strong> bertempat di Kompleks Sentra Peternakan Domba Terpadu BUMKal Lumbung Pangan Mataram Kalurahan Pleret, yang bertanda tangan di bawah ini menerangkan dengan sebenarnya bahwa telah terjadi peristiwa <strong>${b.tipeKejadian || 'Kematian Ternak'}</strong> atas aset biologis milik BUMKal Lumbung Pangan Mataram dengan rincian identitas sebagai berikut:
                    </div>

                    <!-- TABEL DATA TERNAK -->
                    <table class="data-table">
                        <tr>
                            <td class="label">Nomor Eartag / ID Ternak</td>
                            <td style="font-family:monospace;font-weight:bold;font-size:11pt;">${b.eartag}</td>
                        </tr>
                        <tr>
                            <td class="label">Nama / Panggilan Ternak</td>
                            <td>${b.nama || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Bangsa / Ras Ternak</td>
                            <td>${b.ras || '-'} (${b.kelamin || '-'})</td>
                        </tr>
                        <tr>
                            <td class="label">Lokasi Kandang & Sekat</td>
                            <td>${b.kandang || '-'} - ${b.sekat || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Bobot Badan Terakhir</td>
                            <td style="font-weight:bold;font-family:monospace;">${b.bobotTerakhir ? parseFloat(b.bobotTerakhir).toFixed(2) + ' kg' : '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Nilai Buku Aset Biologis</td>
                            <td style="font-weight:bold;font-family:monospace;color:#991b1b;">Rp ${(parseFloat(b.nilaiBukuAset) || 0).toLocaleString('id-ID')}</td>
                        </tr>
                    </table>

                    <!-- DIAGNOSA KLINIS -->
                    <div class="box-section">
                        <div class="box-title">Hasil Diagnosa Klinis & Kronologi Kejadian:</div>
                        <div class="box-content">
                            ${b.penyebab || 'Telah dilakukan pemeriksaan fisik dan nekropsi awal oleh tim medik veteriner kandang.'}
                        </div>
                    </div>

                    <!-- BIOSECURITY -->
                    <div class="box-section">
                        <div class="box-title">Tindakan Pemusnahan / Biosecurity Bangkai:</div>
                        <div class="box-content">
                            ${b.tindakanBangkai || 'Penguburan biosecurity dengan kapur tohor (kedalaman > 1.5 meter) sesuai standar operasional pengelolaan limbah dan bangkai ternak kalurahan.'}
                        </div>
                    </div>

                    <!-- PENUTUP -->
                    <div class="para">
                        Demikian Berita Acara ini dibuat dengan sebenarnya dan penuh rasa tanggung jawab agar dapat dipergunakan sebagai dokumen pertanggungjawaban legalitas, dasar penyesuaian buku catatan aset biologis, dan kelengkapan dokumen Laporan Pertanggungjawaban (LPJ) BUMKal kepada Bamuskal dan Pemerintah Kalurahan Pleret.
                    </div>

                    <!-- TANDA TANGAN 3 PIHAK -->
                    <div class="sign-grid">
                        <div class="sign-box">
                            <div>Pemeriksa / Paramedik,</div>
                            <div class="sign-space"></div>
                            <div style="font-weight:bold;margin-top:4px;">${b.saksi1Nama}</div>
                            <div style="font-size:8.5pt;color:#64748b;">${b.saksi1Jabatan || 'Kepala Kandang'}</div>
                        </div>
                        <div class="sign-box">
                            <div>Saksi Lapangan,</div>
                            <div class="sign-space"></div>
                            <div style="font-weight:bold;margin-top:4px;">${b.saksi2Nama}</div>
                            <div style="font-size:8.5pt;color:#64748b;">${b.saksi2Jabatan || 'Staf Peternakan'}</div>
                        </div>
                        <div class="sign-box">
                            <div>Mengetahui & Menyetujui,</div>
                            <div class="sign-space"></div>
                            <div style="font-weight:bold;margin-top:4px;">${b.mengetahuiNama}</div>
                            <div style="font-size:8.5pt;color:#64748b;">${b.mengetahuiJabatan || 'Direktur Utama BUMKal'}</div>
                        </div>
                    </div>

                    <!-- FOOTER LEGAL -->
                    <div class="legal-foot">
                        <div>Sistem Informasi Peternakan BUMKal LPM Pleret • Arsip Audit LPJ Aset Desa</div>
                        <div>ID Dokumen: ${b.id} • Tanggal Terbit: ${b.tglSurat}</div>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWin.document.close();
    },

    hapus(id) {
        if (confirm("Apakah Anda yakin ingin menghapus arsip Berita Acara ini dari database?")) {
            Store.deleteBeritaAcara(id);
            if (window.App && typeof App.renderContent === 'function') {
                App.renderContent();
            }
        }
    },

    closeModal() {
        const container = document.getElementById("ba-modal-container");
        if (container) container.innerHTML = "";
    }
};

window.BeritaAcaraModule = BeritaAcaraModule;
