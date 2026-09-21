/**
 * Modul Keuangan, Valuasi Aset Biologis & Kasir Digital POS BUMDes
 */

const KeuanganModule = {
    render() {
        const keuangan = Store.getKeuangan();
        const stokPupuk = Store.getStokPupuk();
        const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");
        const valuasi = Store.hitungValuasiAsetBiologis();

        let totalMasuk = 0;
        let totalKeluar = 0;
        keuangan.forEach(k => {
            if (k.tipe === "masuk") totalMasuk += k.nominal;
            else totalKeluar += k.nominal;
        });
        const saldoKas = totalMasuk - totalKeluar;

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
                            <i data-lucide="wallet" class="w-3.5 h-3.5"></i> Akuntansi & Pendapatan Desa
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Arus Kas, Valuasi Aset & Kasir POS</h2>
                        <p class="text-xs text-slate-500">Pencatatan penjualan ternak qurban/aqiqah, hasil olahan pupuk kohe, arus kas masuk/keluar, dan valuasi aset biologis.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="ExportImport.exportCSV('keuangan')" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition">
                            <i data-lucide="download" class="w-4 h-4"></i> Export CSV
                        </button>
                        <button onclick="KeuanganModule.openModalTambahTrx('keluar')" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition">
                            <i data-lucide="arrow-up-right" class="w-4 h-4"></i> Catat Biaya/Pengeluaran
                        </button>
                        <button onclick="KeuanganModule.openModalPOS()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="shopping-cart" class="w-4 h-4"></i> Kasir POS Penjualan
                        </button>
                    </div>
                </div>

                <!-- 4 FINANCIAL CARDS -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-medium">Saldo Kas Operasional</span>
                        <div class="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">Rp ${saldoKas.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-slate-400">Rekening BPD DIY & Kas Fisik</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-medium">Total Kas Masuk (Omzet)</span>
                        <div class="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">Rp ${totalMasuk.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-emerald-600 font-medium">Penjualan ternak & pupuk</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-medium">Total Pengeluaran Biaya</span>
                        <div class="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">Rp ${totalKeluar.toLocaleString('id-ID')}</div>
                        <span class="text-[11px] text-slate-400">Pakan, obat, operasional</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                        <span class="text-xs text-slate-500 font-medium">Valuasi Aset Biologis</span>
                        <div class="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">Rp ${(valuasi.totalValuasiRupiah / 1000000).toFixed(2)} Jt</div>
                        <span class="text-[11px] text-slate-500 font-medium">${valuasi.totalPopulasiAktif} ekor ternak (${valuasi.totalBobotKg} kg)</span>
                    </div>
                </div>

                <!-- BUKU KAS TRANSAKSI TABLE -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <i data-lucide="receipt" class="w-4 h-4 text-emerald-600"></i> Mutasi Kas Masuk & Keluar Terakhir
                        </h3>
                        <span class="text-xs text-slate-500">${keuangan.length} Transaksi</span>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-semibold border-b dark:border-slate-700">
                                <tr>
                                    <th class="py-3 px-4">Tanggal</th>
                                    <th class="py-3 px-4">Tipe</th>
                                    <th class="py-3 px-4">Kategori</th>
                                    <th class="py-3 px-4">Keterangan</th>
                                    <th class="py-3 px-4">Metode Bayar</th>
                                    <th class="py-3 px-4 text-right">Nominal (Rp)</th>
                                    <th class="py-3 px-4 text-center">Struk</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                ${keuangan.map(k => `
                                    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${k.tgl}</td>
                                        <td class="py-3 px-4">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${k.tipe === 'masuk' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                                                ${k.tipe.toUpperCase()}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">${k.kategori}</td>
                                        <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${k.keterangan}</td>
                                        <td class="py-3 px-4">
                                            <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                                                ${k.metode}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right font-bold ${k.tipe === 'masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                                            ${k.tipe === 'masuk' ? '+' : '-'} Rp ${k.nominal.toLocaleString('id-ID')}
                                        </td>
                                        <td class="py-3 px-4 text-center">
                                            <button onclick="ExportImport.printReceipt({ id: '${k.id}', tgl: '${k.tgl}', user: '${k.user}', item: '${k.keterangan}', kategori: '${k.kategori}', nominal: ${k.nominal}, metode: '${k.metode}' })" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-emerald-600" title="Cetak Nota">
                                                <i data-lucide="printer" class="w-4 h-4"></i>
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

    openModalPOS() {
        const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");
        const stokPupuk = Store.getStokPupuk();

        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="shopping-cart" class="w-5 h-5 text-emerald-600"></i> Kasir POS Penjualan BUMDes
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganModule.submitPOS(event)" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Pembeli / Pelanggan</label>
                        <input type="text" id="pos-pelanggan" placeholder="Contoh: Bpk. H. Rahmat / Poktan Kerto" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Produk yang Dijual *</label>
                        <select id="pos-tipe" onchange="KeuanganModule.togglePosItem(this.value)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            <option value="pupuk">Produk Pupuk Kompos & POC Urin</option>
                            <option value="ternak">Hewan Ternak Domba (Kurban / Aqiqah / Bibit)</option>
                        </select>
                    </div>

                    <!-- Pilihan Item Pupuk -->
                    <div id="pos-group-pupuk" class="space-y-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Produk Pupuk *</label>
                            <select id="pos-pupuk-item" onchange="KeuanganModule.calculatePupukTotal()" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                ${stokPupuk.map(p => `
                                    <option value="${p.id}|${p.nama}|${p.hargaJual}|${p.satuan}">${p.nama} - Rp ${p.hargaJual.toLocaleString('id-ID')} (Sisa: ${p.stok} ${p.satuan})</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Kuantitas (Qty) *</label>
                                <input type="number" id="pos-qty" min="1" value="1" oninput="KeuanganModule.calculatePupukTotal()" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Harga (Rp)</label>
                                <input type="number" id="pos-total-pupuk" readonly class="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-100 font-black text-emerald-600 text-sm">
                            </div>
                        </div>
                    </div>

                    <!-- Pilihan Item Ternak (Hidden by default) -->
                    <div id="pos-group-ternak" class="space-y-3 hidden">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Domba yang Dijual *</label>
                            <select id="pos-ternak-item" onchange="KeuanganModule.selectTernak(this.value)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="">-- Pilih Ternak --</option>
                                ${dombaList.map(d => {
                                    const w = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                                    const estHarga = Math.round(w * 80000);
                                    return `<option value="${d.id}|${d.eartag}|${d.nama}|${estHarga}">${d.eartag} - ${d.nama} (${d.ras}, ${w} kg) - Est Rp ${estHarga.toLocaleString('id-ID')}</option>`;
                                }).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kesepakatan Harga Jual Ternak (Rp) *</label>
                            <input type="number" id="pos-harga-ternak" placeholder="Contoh: 3500000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-black text-emerald-600 text-sm">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Metode Pembayaran *</label>
                            <select id="pos-metode" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                <option value="QRIS BUMDes">QRIS BUMDes</option>
                                <option value="Tunai">Uang Tunai (Cash)</option>
                                <option value="Transfer BPD DIY">Transfer Bank BPD DIY</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Transaksi</label>
                            <input type="date" id="pos-tgl" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">Proses Pembayaran & Cetak Struk</button>
                    </div>
                </form>
            </div>
        `);
        KeuanganModule.calculatePupukTotal();
        App.openModal();
    },

    togglePosItem(val) {
        if (val === "pupuk") {
            document.getElementById("pos-group-pupuk").classList.remove("hidden");
            document.getElementById("pos-group-ternak").classList.add("hidden");
        } else {
            document.getElementById("pos-group-pupuk").classList.add("hidden");
            document.getElementById("pos-group-ternak").classList.remove("hidden");
        }
    },

    calculatePupukTotal() {
        const itemVal = document.getElementById("pos-pupuk-item").value.split("|");
        const harga = parseFloat(itemVal[2]) || 0;
        const qty = parseInt(document.getElementById("pos-qty").value) || 1;
        const total = harga * qty;
        const el = document.getElementById("pos-total-pupuk");
        if (el) el.value = total;
    },

    selectTernak(val) {
        if (!val) return;
        const parts = val.split("|");
        document.getElementById("pos-harga-ternak").value = parts[3];
    },

    submitPOS(e) {
        e.preventDefault();
        const tipe = document.getElementById("pos-tipe").value;
        const pelanggan = document.getElementById("pos-pelanggan").value.trim() || "Umum";
        const metode = document.getElementById("pos-metode").value;
        const tgl = document.getElementById("pos-tgl").value;
        const user = Store.getCurrentUser().nama || "Kasir";

        let nominal = 0;
        let keterangan = "";
        let kategori = "";

        if (tipe === "pupuk") {
            const itemVal = document.getElementById("pos-pupuk-item").value.split("|");
            const pupukId = itemVal[0];
            const namaPupuk = itemVal[1];
            const harga = parseFloat(itemVal[2]);
            const satuan = itemVal[3];
            const qty = parseInt(document.getElementById("pos-qty").value);

            nominal = harga * qty;
            kategori = "Penjualan Pupuk";
            keterangan = `Penjualan ${qty} ${satuan} ${namaPupuk} kepada ${pelanggan}`;

            // Kurangi stok pupuk
            const stokList = Store.getStokPupuk();
            const p = stokList.find(item => item.id === pupukId);
            if (p) {
                p.stok = Math.max(0, p.stok - qty);
                p.terjualBulanIni += qty;
                Store.saveStokPupuk(stokList);
            }
        } else {
            const ternakVal = document.getElementById("pos-ternak-item").value.split("|");
            const dombaId = ternakVal[0];
            const eartag = ternakVal[1];
            const namaDomba = ternakVal[2];
            nominal = parseFloat(document.getElementById("pos-harga-ternak").value);

            kategori = "Penjualan Ternak";
            keterangan = `Penjualan ternak ${eartag} (${namaDomba}) kepada ${pelanggan}`;

            // Update status domba jadi terjual
            Store.updateDomba(dombaId, { status: "Terjual" });
        }

        const newTrx = {
            id: "TRX-" + Date.now(),
            tgl,
            tipe: "masuk",
            kategori,
            keterangan,
            nominal,
            metode,
            user,
            pelanggan
        };

        Store.addTransaksi(newTrx);
        App.closeModal();
        App.showToast(`Transaksi Rp ${nominal.toLocaleString('id-ID')} berhasil diproses!`, "success");
        App.renderContent();

        // Tawarkan Cetak Struk
        setTimeout(() => {
            ExportImport.printReceipt(newTrx);
        }, 500);
    },

    openModalTambahTrx(tipeAwal = "keluar") {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="arrow-up-right" class="w-5 h-5 text-rose-600"></i> Catat Biaya Operasional / Pengeluaran
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KeuanganModule.submitBiaya(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Pengeluaran *</label>
                        <select id="by-kategori" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                            <option value="Pakan Konsentrat">Pakan Konsentrat / Suplemen</option>
                            <option value="Kesehatan Hewan">Kesehatan & Obat Hewan</option>
                            <option value="Bahan Baku Pupuk">Bahan Fermentasi (EM4/Molase/Sekam)</option>
                            <option value="Tenaga Kerja">Upah Tenaga Kerja Lapangan</option>
                            <option value="Listrik & Air">Listrik, Air & Bahan Bakar Mesin</option>
                            <option value="Pemeliharaan">Pemeliharaan Kandang & Alat</option>
                        </select>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rincian / Keterangan *</label>
                        <input type="text" id="by-ket" required placeholder="Contoh: Beli bensin mesin chopper 20 liter & oli" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal Biaya (Rp) *</label>
                            <input type="number" id="by-nominal" required placeholder="Contoh: 350000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-rose-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Metode Pembayaran</label>
                            <select id="by-metode" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Tunai">Uang Tunai</option>
                                <option value="Transfer BPD DIY">Transfer Bank BPD DIY</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Transaksi</label>
                        <input type="date" id="by-tgl" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md">Simpan Pengeluaran</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitBiaya(e) {
        e.preventDefault();
        const nominal = parseFloat(document.getElementById("by-nominal").value);
        const newBiaya = {
            id: "BY-" + Date.now(),
            tgl: document.getElementById("by-tgl").value,
            tipe: "keluar",
            kategori: document.getElementById("by-kategori").value,
            keterangan: document.getElementById("by-ket").value.trim(),
            nominal,
            metode: document.getElementById("by-metode").value,
            user: Store.getCurrentUser().nama || "Bendahara"
        };

        Store.addTransaksi(newBiaya);
        App.closeModal();
        App.showToast(`Biaya Rp ${nominal.toLocaleString('id-ID')} dicatat!`, "success");
        App.renderContent();
    }
};
