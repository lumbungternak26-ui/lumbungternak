/**
 * Modul Pengolahan Limbah Kotoran Hewan (Kohe Padat & Urin Domba)
 * Sirkular Ekonomi: Kompos POP, Pupuk Cair POC, dan Distribusi Komersial
 */

const LimbahModule = {
    batchSearchQuery: "",
    batchFilterTipe: "all",

    render() {
        const koheHarian = Store.getKoheHarian();
        const batchLimbahAll = Store.getBatchLimbah();
        const stokPupuk = Store.getStokPupuk();

        let batchLimbah = batchLimbahAll;
        if (this.batchSearchQuery) {
            const q = this.batchSearchQuery.toLowerCase();
            batchLimbah = batchLimbah.filter(b => 
                (b.nama || '').toLowerCase().includes(q) || 
                (b.id || '').toLowerCase().includes(q) || 
                (b.dekomposer || '').toLowerCase().includes(q)
            );
        }
        if (this.batchFilterTipe !== "all") {
            batchLimbah = batchLimbah.filter(b => b.tipe === this.batchFilterTipe);
        }

        // Hitung Total Kohe Terkumpul 7 Hari Terakhir
        const totalFesesKg = koheHarian.reduce((acc, k) => acc + k.fesesPadatKg, 0);
        const totalUrinL = koheHarian.reduce((acc, k) => acc + k.urinLiter, 0);

        // Estimasi Nilai Ekonomi Produk Pupuk
        const totalValuasiPupuk = stokPupuk.reduce((acc, p) => acc + (p.stok * p.hargaJual), 0);

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-1">
                            <i data-lucide="recycle" class="w-3.5 h-3.5"></i> Sirkular Ekonomi Limbah Ternak
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Pengolahan Limbah Kotoran Hewan (Kohe)</h2>
                        <p class="text-xs text-slate-500">Mengubah feses dan urin domba menjadi Pupuk Organik Padat (POP) super halus dan Pupuk Organik Cair (POC) kaya nitrogen & mikroba.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="LimbahModule.openModalBatchBaru()" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition">
                            <i data-lucide="flask-conical" class="w-4 h-4"></i> Buat Batch Fermentasi
                        </button>
                        <button onclick="App.openModal('modal-kohe')" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Catat Input Kohe
                        </button>
                    </div>
                </div>

                <!-- 3 SUMMARY METRICS -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-4">
                        <div class="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                            <i data-lucide="sparkles" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <span class="text-xs text-slate-500 font-medium">Kohe Terkumpul (7 Hari)</span>
                            <div class="text-xl font-bold text-slate-900 dark:text-white">${totalFesesKg} kg <span class="text-xs font-normal text-slate-400">feses</span> | ${totalUrinL} L <span class="text-xs font-normal text-slate-400">urin</span></div>
                            <span class="text-[11px] text-amber-600 font-semibold">Rata-rata ~91 kg/hari</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-4">
                        <div class="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                            <i data-lucide="flask-conical" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <span class="text-xs text-slate-500 font-medium">Batch Pengolahan Aktif</span>
                            <div class="text-xl font-bold text-slate-900 dark:text-white">${batchLimbahAll.length} Batch</div>
                            <span class="text-[11px] text-purple-600 font-semibold">Total kapasitas 5.1 Ton / L</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-4">
                        <div class="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                            <i data-lucide="banknote" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <span class="text-xs text-slate-500 font-medium">Valuasi Stok Pupuk Jadi</span>
                            <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">Rp ${totalValuasiPupuk.toLocaleString('id-ID')}</div>
                            <span class="text-[11px] text-slate-400">Siap edar & konsumsi bank pakan</span>
                        </div>
                    </div>
                </div>

                <!-- BATCH FERMENTASI PUPUK ORGANIK (POP & POC) -->
                <div class="space-y-3">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="flame" class="w-4 h-4 text-amber-600"></i> Batch Fermentasi Pupuk Kompos & Cair
                        </h3>
                        <span class="text-xs text-slate-500">Menampilkan ${batchLimbah.length} dari ${batchLimbahAll.length} Batch</span>
                    </div>

                    <!-- FILTER & PENCARIAN BATCH LIMBAH -->
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                        <div class="relative flex-1">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                            <input type="text" placeholder="Cari kode batch, nama kompos, atau dekomposer..." value="${this.batchSearchQuery || ''}" oninput="LimbahModule.searchBatch(this.value)" class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-slate-400">Tipe:</span>
                            <select onchange="LimbahModule.filterTipeBatch(this.value)" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
                                <option value="all" ${this.batchFilterTipe === 'all' ? 'selected' : ''}>Semua Tipe Pupuk</option>
                                <option value="Kompos Padat (POP)" ${this.batchFilterTipe === 'Kompos Padat (POP)' ? 'selected' : ''}>Kompos Padat (POP)</option>
                                <option value="Pupuk Organik Cair (POC)" ${this.batchFilterTipe === 'Pupuk Organik Cair (POC)' ? 'selected' : ''}>Pupuk Organik Cair (POC)</option>
                            </select>
                            ${(this.batchSearchQuery || this.batchFilterTipe !== 'all') ? `
                                <button onclick="LimbahModule.resetFilterBatch()" class="text-xs text-rose-600 font-semibold hover:underline">Reset</button>
                            ` : ''}
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        ${batchLimbah.length === 0 ? `
                            <div class="col-span-full py-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                Tidak ada batch fermentasi pupuk yang cocok dengan pencarian / filter.
                            </div>
                        ` : batchLimbah.map(b => {
                            const isPadat = (b.tipe || '').includes("Padat");
                            return `
                                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                                    <div>
                                        <div class="flex items-start justify-between gap-2 mb-1">
                                            <span class="text-[10px] font-black px-2 py-0.5 rounded ${isPadat ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'}">${b.id}</span>
                                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${(b.kapasitas || 0).toLocaleString('id-ID')} ${b.satuan || 'kg'}</span>
                                        </div>
                                        <h4 class="font-bold text-sm text-slate-900 dark:text-white leading-snug">${b.nama}</h4>
                                        <div class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">${b.status}</div>

                                        <!-- Parameter Teknis -->
                                        <div class="mt-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                                            <div class="flex justify-between">
                                                <span class="text-slate-400 text-[11px]">Suhu Tumpukan:</span>
                                                <span class="font-bold ${b.suhuTerkini > 50 ? 'text-rose-600' : 'text-emerald-600'}">${b.suhuTerkini} °C</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-slate-400 text-[11px]">Dekomposer:</span>
                                                <span class="font-medium text-slate-700 dark:text-slate-300">${b.dekomposer}</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-slate-400 text-[11px]">Tgl Mulai:</span>
                                                <span class="text-slate-600 dark:text-slate-400">${b.tglMulai}</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-slate-400 text-[11px]">Estimasi Panen:</span>
                                                <span class="font-bold text-slate-800 dark:text-slate-200">${b.tglEstimasiSelesai}</span>
                                            </div>
                                        </div>

                                        <!-- Jadwal Pembalikan / Aerasi -->
                                        <div class="mt-3 space-y-1.5">
                                            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Jadwal Pembalikan / Aerasi:</span>
                                            <div class="flex flex-wrap gap-1.5">
                                                ${(b.jadwalBalik || []).map(j => `
                                                    <span class="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${j.selesai ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}">
                                                        <i data-lucide="${j.selesai ? 'check' : 'clock'}" class="w-3 h-3"></i>
                                                        ${j.hari} (${j.suhu ? j.suhu + '°C' : (j.tgl || '').slice(5)})
                                                    </span>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                                        <button onclick="LimbahModule.catatSuhu('${b.id}')" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1" title="Ukur Suhu Terkini">
                                            <i data-lucide="thermometer" class="w-3.5 h-3.5"></i> Suhu
                                        </button>
                                        <div class="flex items-center gap-1.5">
                                            <button onclick="LimbahModule.openModalEditBatch('${b.id}')" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1 transition active:scale-95" title="Ubah Batch Fermentasi">
                                                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Ubah
                                            </button>
                                            <button onclick="LimbahModule.deleteBatch('${b.id}')" class="p-1 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:hover:bg-rose-950/40 transition active:scale-95" title="Hapus Batch Fermentasi">
                                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- KATALOG PRODUK PUPUK JADI & STOK EDAR -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="shopping-bag" class="w-4 h-4 text-emerald-600"></i> Katalog Produk Pupuk BUMDes Siap Jual & Aplikasi
                            </h3>
                            <p class="text-xs text-slate-500">Hasil kemasan pupuk organik siap distribusi ke petani binaan atau pembeli retail</p>
                        </div>
                        <button onclick="App.navigate('keuangan')" class="text-xs font-semibold text-emerald-600 hover:underline">
                            Buka Kasir Penjualan &rarr;
                        </button>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        ${stokPupuk.map(p => `
                            <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-2 flex flex-col justify-between">
                                <div>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded ${p.tipe === 'POP' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}">${p.tipe}</span>
                                    <h4 class="font-bold text-xs text-slate-900 dark:text-white mt-1.5 leading-snug">${p.nama}</h4>
                                    <div class="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                        Rp ${p.hargaJual.toLocaleString('id-ID')} <span class="text-xs font-normal text-slate-400">/ ${p.satuan}</span>
                                    </div>
                                    <div class="text-xs text-slate-500 mt-2">
                                        Sisa Stok: <b class="text-slate-800 dark:text-slate-200">${p.stok} ${p.satuan}</b>
                                    </div>
                                    <div class="text-[11px] text-slate-400">
                                        Terjual bulan ini: ${p.terjualBulanIni} ${p.satuan}
                                    </div>
                                </div>
                                <button onclick="App.navigate('keuangan')" class="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition">
                                    Jual di POS Kasir
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- RIWAYAT INPUT KOHE HARIAN TABEL -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="clipboard-list" class="w-4 h-4 text-amber-600"></i> Log Harian Pengumpulan Kotoran dari Kandang
                        </h3>
                        <button onclick="App.openModal('modal-kohe')" class="text-xs text-amber-600 font-semibold hover:underline">
                            + Catat Input Hari Ini
                        </button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-2.5 px-4">Tanggal</th>
                                    <th class="py-2.5 px-4 text-right">Feses Padat (kg)</th>
                                    <th class="py-2.5 px-4 text-right">Urin (Liter)</th>
                                    <th class="py-2.5 px-4">Petugas Kebersihan</th>
                                    <th class="py-2.5 px-4">Catatan Kondisi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${koheHarian.map(k => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">${k.tgl}</td>
                                        <td class="py-2.5 px-4 text-right font-bold text-amber-700 dark:text-amber-400">${k.fesesPadatKg} kg</td>
                                        <td class="py-2.5 px-4 text-right font-bold text-purple-700 dark:text-purple-400">${k.urinLiter} L</td>
                                        <td class="py-2.5 px-4 text-slate-600 dark:text-slate-400">${k.petugas}</td>
                                        <td class="py-2.5 px-4 text-slate-500">${k.catatan}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    openModalBatchBaru() {
        const nextId = "B-POP-" + String(Store.getBatchLimbah().length + 1).padStart(2, "0");
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="flask-conical" class="w-5 h-5 text-purple-600"></i> Buat Batch Fermentasi Pupuk Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="LimbahModule.submitBatch(event)" class="space-y-3 text-xs">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Batch *</label>
                            <input type="text" id="btc-id" required value="${nextId}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Pupuk *</label>
                            <select id="btc-tipe" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Pupuk Organik Padat (POP)">Pupuk Organik Padat (POP)</option>
                                <option value="Pupuk Organik Cair (POC)">Pupuk Organik Cair (POC)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Batch *</label>
                        <input type="text" id="btc-nama" required placeholder="Contoh: Kompos Kohe Domba Super Batch 10" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas Input (kg atau Liter) *</label>
                            <input type="number" id="btc-kapasitas" required placeholder="Contoh: 2000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dekomposer Digunakan *</label>
                            <input type="text" id="btc-dekomposer" required value="EM4 Pertanian + Tetes Tebu" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Komposisi Bahan Campuran</label>
                        <input type="text" id="btc-campuran" value="Feses domba 70%, Sekam padi 15%, Dolomit 5%, Bekatul 10%" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai Fermentasi</label>
                            <input type="date" id="btc-tgl" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Jumlah Kemasan</label>
                            <input type="text" id="btc-target" value="100 karung @20kg" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md">Mulai Batch Fermentasi</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitBatch(e) {
        e.preventDefault();
        const tglMulai = document.getElementById("btc-tgl").value;
        const dEst = new Date(tglMulai);
        dEst.setDate(dEst.getDate() + 30);

        const newBatch = {
            id: document.getElementById("btc-id").value.trim(),
            tipe: document.getElementById("btc-tipe").value,
            nama: document.getElementById("btc-nama").value.trim(),
            kapasitas: parseInt(document.getElementById("btc-kapasitas").value),
            satuan: document.getElementById("btc-tipe").value.includes("Padat") ? "kg" : "Liter",
            tglMulai,
            tglEstimasiSelesai: dEst.toISOString().split("T")[0],
            suhuTerkini: 45,
            status: "Fermentasi Aktif (Hari ke-1)",
            dekomposer: document.getElementById("btc-dekomposer").value.trim(),
            campuran: document.getElementById("btc-campuran").value.trim(),
            jadwalBalik: [
                { hari: "Hari ke-7", tgl: "7 hari lagi", selesai: false, suhu: null },
                { hari: "Hari ke-14", tgl: "14 hari lagi", selesai: false, suhu: null },
                { hari: "Hari ke-21", tgl: "21 hari lagi", selesai: false, suhu: null }
            ],
            hasilAkhir: null,
            targetKemasan: document.getElementById("btc-target").value.trim()
        };

        Store.addBatchLimbah(newBatch);
        App.closeModal();
        App.showToast(`Batch pupuk ${newBatch.id} berhasil dimulai!`, "success");
        App.renderContent();
    },

    catatSuhu(batchId) {
        const batchList = Store.getBatchLimbah();
        const b = batchList.find(item => item.id === batchId);
        if (!b) return;

        const suhuInput = prompt(`Update suhu tumpukan terbaru untuk ${b.id} (${b.nama}) dalam °C:`, b.suhuTerkini);
        if (suhuInput && !isNaN(suhuInput)) {
            b.suhuTerkini = parseFloat(suhuInput);
            Store.saveBatchLimbah(batchList);
            Store.addLog(`Update suhu batch ${b.id}: ${b.suhuTerkini} °C`);
            App.showToast(`Suhu batch ${b.id} diperbarui: ${b.suhuTerkini}°C`, "success");
            App.renderContent();
        }
    },

    searchBatch(val) {
        this.batchSearchQuery = val;
        App.renderContent();
    },

    filterTipeBatch(val) {
        this.batchFilterTipe = val;
        App.renderContent();
    },

    resetFilterBatch() {
        this.batchSearchQuery = "";
        this.batchFilterTipe = "all";
        App.renderContent();
    },

    openModalEditBatch(batchId) {
        const batchList = Store.getBatchLimbah();
        const b = batchList.find(item => item.id === batchId);
        if (!b) return;

        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-purple-600"></i> Ubah Batch Fermentasi Pupuk: ${b.id}
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="LimbahModule.submitEditBatch(event, '${b.id}')" class="space-y-4 text-xs">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Batch (Readonly)</label>
                            <input type="text" value="${b.id}" disabled class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Pupuk *</label>
                            <select id="edit-btc-tipe" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                <option value="Kompos Padat (POP)" ${b.tipe === 'Kompos Padat (POP)' ? 'selected' : ''}>Kompos Padat (POP)</option>
                                <option value="Pupuk Organik Cair (POC)" ${b.tipe === 'Pupuk Organik Cair (POC)' ? 'selected' : ''}>Pupuk Organik Cair (POC)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Batch Pupuk *</label>
                        <input type="text" id="edit-btc-nama" required value="${b.nama || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kapasitas Input *</label>
                            <input type="number" id="edit-btc-kapasitas" required value="${b.kapasitas || 0}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-purple-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Fermentasi *</label>
                            <input type="text" id="edit-btc-status" required value="${b.status || 'Fermentasi Aktif'}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dekomposer Digunakan</label>
                            <input type="text" id="edit-btc-dekomposer" value="${b.dekomposer || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Suhu Terkini (°C)</label>
                            <input type="number" step="0.1" id="edit-btc-suhu" value="${b.suhuTerkini || 45}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai</label>
                            <input type="date" id="edit-btc-tgl" value="${b.tglMulai || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimasi Panen</label>
                            <input type="date" id="edit-btc-est" value="${b.tglEstimasiSelesai || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Kemasan</label>
                        <input type="text" id="edit-btc-target" value="${b.targetKemasan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition active:scale-95">Simpan Perubahan Batch</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditBatch(e, batchId) {
        e.preventDefault();
        const tipe = document.getElementById("edit-btc-tipe").value;
        const data = {
            tipe,
            nama: document.getElementById("edit-btc-nama").value.trim(),
            kapasitas: parseInt(document.getElementById("edit-btc-kapasitas").value),
            satuan: tipe.includes("Padat") ? "kg" : "Liter",
            status: document.getElementById("edit-btc-status").value.trim(),
            dekomposer: document.getElementById("edit-btc-dekomposer").value.trim(),
            suhuTerkini: parseFloat(document.getElementById("edit-btc-suhu").value),
            tglMulai: document.getElementById("edit-btc-tgl").value,
            tglEstimasiSelesai: document.getElementById("edit-btc-est").value,
            targetKemasan: document.getElementById("edit-btc-target").value.trim()
        };

        Store.updateBatchLimbah(batchId, data);
        App.closeModal();
        App.showToast(`Data batch pupuk ${batchId} berhasil diperbarui!`, "success");
        App.renderContent();
    },

    deleteBatch(batchId) {
        if (confirm(`Apakah Anda yakin ingin menghapus batch fermentasi ${batchId}?`)) {
            Store.deleteBatchLimbah(batchId);
            App.showToast(`Batch fermentasi ${batchId} berhasil dihapus!`, "success");
            App.renderContent();
        }
    }
};
