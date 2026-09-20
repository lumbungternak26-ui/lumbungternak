/**
 * Modul Pertanian Terpadu (Bank Pakan HPT, Lahan Pangan & Pengolahan Silase)
 */

const PertanianModule = {
    render() {
        const lahanList = Store.getLahan();
        const stokPakan = Store.getStokPakan();
        const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");

        // Kalkulasi Kebutuhan Pakan Harian Seluruh Populasi Domba
        let totalBobotTernak = 0;
        dombaList.forEach(d => {
            const w = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
            totalBobotTernak += w;
        });

        // Standar nutrisi: Hijauan Segar 10% dari Bobot Badan, Konsentrat 1.5% dari Bobot Badan
        const kebutuhanHijauanKg = Math.round(totalBobotTernak * 0.10 * 10) / 10;
        const kebutuhanKonsentratKg = Math.round(totalBobotTernak * 0.015 * 10) / 10;

        // Stok hijauan & silase saat ini
        const stokHijauan = stokPakan.find(s => s.kategori === "Hijauan")?.stokKg || 0;
        const stokSilaseJagung = stokPakan.find(s => s.nama.includes("Jagung"))?.stokKg || 0;
        const stokSilaseJerami = stokPakan.find(s => s.nama.includes("Jerami"))?.stokKg || 0;
        const stokKonsentrat = stokPakan.find(s => s.kategori === "Konsentrat")?.stokKg || 0;

        const ketahananHijauanHari = Math.floor((stokHijauan + stokSilaseJagung + stokSilaseJerami) / (kebutuhanHijauanKg || 1));
        const ketahananKonsentratHari = Math.floor(stokKonsentrat / (kebutuhanKonsentratKg || 1));

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1">
                            <i data-lucide="sprout" class="w-3.5 h-3.5"></i> Bank Pakan & Pertanian Presisi
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Pertanian Terpadu & Bank Pakan Mandiri</h2>
                        <p class="text-xs text-slate-500">Pemanfaatan pupuk kohe kandang untuk kesuburan kebun pakan HPT (Odot, Pakchong, Indigofera) dan sawah padi organik desa.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="PertanianModule.openModalTambahPlot()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Tambah Plot Lahan
                        </button>
                    </div>
                </div>

                <!-- KALKULATOR KEBUTUHAN PAKAN VS KETAHANAN STOK -->
                <div class="bg-gradient-to-r from-teal-800 to-emerald-900 text-white p-5 rounded-2xl shadow-lg">
                    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-2 text-xs font-semibold text-teal-200">
                                <i data-lucide="calculator" class="w-4 h-4"></i> Neraca Pakan Populasi Kandang
                            </div>
                            <h3 class="text-lg font-bold mt-1">Estimasi Kebutuhan Pakan: ${dombaList.length} Ekor Domba (${totalBobotTernak} kg Bobot Hidup)</h3>
                            <p class="text-xs text-teal-100/80 mt-1 max-w-xl">
                                Dihitung berdasarkan rasio konsumsi biologis domba sehat (10% hijauan segar/silase & 1.5% konsentrat protein).
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-4 text-center">
                            <div class="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15">
                                <span class="text-[11px] text-teal-200 block">Kebutuhan Hijauan</span>
                                <span class="text-xl font-black">${kebutuhanHijauanKg} kg / hari</span>
                                <span class="text-[10px] text-emerald-300 block mt-0.5">Aman ${ketahananHijauanHari} hari ke depan</span>
                            </div>
                            <div class="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15">
                                <span class="text-[11px] text-teal-200 block">Kebutuhan Konsentrat</span>
                                <span class="text-xl font-black">${kebutuhanKonsentratKg} kg / hari</span>
                                <span class="text-[10px] text-emerald-300 block mt-0.5">Aman ${ketahananKonsentratHari} hari ke depan</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PLOT LAHAN BANK PAKAN GRID -->
                <div>
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="map-pin" class="w-4 h-4 text-teal-600"></i> Plot Lahan Bank Pakan & Pertanian Desa
                            </h3>
                            <span class="text-xs text-slate-500">${lahanList.length} Plot Terdaftar</span>
                        </div>
                        <button onclick="PertanianModule.openModalTambahPlot()" class="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5 active:scale-95 self-start sm:self-auto">
                            <i data-lucide="plus" class="w-4 h-4"></i> Tambah Plot Lahan Baru
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${lahanList.map(l => `
                            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm hover:shadow-md transition space-y-3">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">${(l.luasM2 || 0).toLocaleString('id-ID')} m²</span>
                                        <h4 class="text-base font-bold text-slate-900 dark:text-white mt-1">${l.nama}</h4>
                                        <p class="text-xs text-slate-500">${l.lokasi} • <b>${l.komoditas}</b></p>
                                    </div>
                                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${l.status && l.status.includes('Siap') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}">
                                        ${l.status || 'Aktif'}
                                    </span>
                                </div>

                                <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <span class="text-slate-400 block text-[11px]">Panen Terakhir:</span>
                                        <b class="text-slate-700 dark:text-slate-300">${l.tglPanenTerakhir || '-'}</b>
                                    </div>
                                    <div>
                                        <span class="text-slate-400 block text-[11px]">Estimasi Panen Berikut:</span>
                                        <b class="text-teal-600 dark:text-teal-400">${l.tglEstimasiPanen || '-'}</b>
                                    </div>
                                    <div>
                                        <span class="text-slate-400 block text-[11px]">Potensi Hasil Panen:</span>
                                        <b class="text-slate-700 dark:text-slate-300">${(l.estimasiHasilKg || 0).toLocaleString('id-ID')} kg</b>
                                    </div>
                                    <div>
                                        <span class="text-slate-400 block text-[11px]">Aplikasi Pupuk Kohe:</span>
                                        <b class="text-emerald-600 dark:text-emerald-400">${(l.pupukDigunakan || '-').split('(')[0]}</b>
                                    </div>
                                </div>

                                <p class="text-xs text-slate-600 dark:text-slate-400 italic">"${l.keterangan || '-'}"</p>

                                <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2 flex-wrap">
                                    <span class="text-slate-400 text-[11px]">Tanam: ${l.tglTanam || '-'}</span>
                                    <div class="flex items-center gap-1.5">
                                        <button onclick="PertanianModule.openModalEditPlot('${l.id}')" class="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition flex items-center gap-1 text-[11px]" title="Ubah data atau luasan plot lahan">
                                            <i data-lucide="edit-3" class="w-3 h-3"></i> Edit
                                        </button>
                                        <button onclick="PertanianModule.hapusPlot('${l.id}')" class="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold transition flex items-center gap-1 text-[11px]" title="Hapus plot lahan">
                                            <i data-lucide="trash-2" class="w-3 h-3"></i> Hapus
                                        </button>
                                        <button onclick="PertanianModule.catatPanen('${l.id}')" class="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-semibold transition flex items-center gap-1 text-[11px]">
                                            <i data-lucide="scissors" class="w-3 h-3"></i> Panen
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- GUDANG & INVENTARIS PAKAN TERPADU -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="archive" class="w-4 h-4 text-teal-600"></i> Gudang Pakan & Silase Fermentasi
                            </h3>
                            <p class="text-xs text-slate-500">Stok bahan pakan cadangan, konsentrat, dan silase olahan limbah pertanian</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        ${stokPakan.map(s => {
                            const isLow = s.stokKg <= s.batasMinimum;
                            return `
                                <div class="p-3.5 rounded-xl border ${isLow ? 'border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'} space-y-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">${s.nama}</span>
                                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">${s.kategori}</span>
                                    </div>
                                    <div class="flex items-baseline justify-between">
                                        <div class="text-xl font-black text-slate-900 dark:text-white">${(s.stokKg || 0).toLocaleString('id-ID')} <span class="text-xs font-normal text-slate-500">${s.satuan || 'kg'}</span></div>
                                        <div class="text-xs text-slate-500">Min: ${s.batasMinimum || 0} ${s.satuan || 'kg'}</div>
                                    </div>
                                    <div class="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                        <span class="text-slate-500">Biaya: Rp ${(s.biayaPerKg || 0).toLocaleString('id-ID')} / ${s.satuan || 'kg'}</span>
                                        <button onclick="PertanianModule.tambahStok('${s.id}')" class="text-teal-600 dark:text-teal-400 font-bold hover:underline">
                                            + Update Stok
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    openModalTambahPlot() {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="plus-circle" class="w-5 h-5 text-teal-600"></i> Pendaftaran Plot Lahan Pertanian Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PertanianModule.submitPlot(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Plot Lahan *</label>
                        <input type="text" id="lhn-nama" required placeholder="Contoh: Kebun Bank Pakan 3 (Pakchong)" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Lahan *</label>
                            <input type="text" id="lhn-lokasi" required placeholder="Contoh: Padukuhan Kedaton" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Luas Lahan (m²) *</label>
                            <input type="number" id="lhn-luas" required placeholder="Contoh: 2000" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Komoditas Ditanam *</label>
                        <input type="text" id="lhn-komoditas" required placeholder="Contoh: Rumput Odot / Indigofera / Jagung" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Tanam</label>
                            <input type="date" id="lhn-tgl-tanam" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimasi Hasil Panen (kg)</label>
                            <input type="number" id="lhn-hasil" placeholder="Contoh: 3500" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pupuk Kohe yang Digunakan</label>
                        <input type="text" id="lhn-pupuk" value="Pupuk Kompos Kohe Domba BUMDes" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan Tambahan</label>
                        <textarea id="lhn-ket" rows="2" placeholder="Catatan rotasi tanam atau irigasi" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md">Simpan Plot Lahan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitPlot(e) {
        e.preventDefault();
        const newPlot = {
            id: "lhn-" + Date.now(),
            nama: document.getElementById("lhn-nama").value.trim(),
            lokasi: document.getElementById("lhn-lokasi").value.trim(),
            luasM2: parseInt(document.getElementById("lhn-luas").value) || 0,
            komoditas: document.getElementById("lhn-komoditas").value.trim(),
            tglTanam: document.getElementById("lhn-tgl-tanam").value,
            tglPanenTerakhir: "-",
            tglEstimasiPanen: "45 hari lagi",
            estimasiHasilKg: parseInt(document.getElementById("lhn-hasil").value) || 2000,
            status: "Fase Awal Tumbuh",
            pupukDigunakan: document.getElementById("lhn-pupuk").value.trim(),
            keterangan: document.getElementById("lhn-ket").value.trim() || "-"
        };

        Store.addLahan(newPlot);
        App.closeModal();
        App.showToast("Plot lahan baru berhasil ditambahkan!", "success");
        App.renderContent();
    },

    openModalEditPlot(id) {
        const l = Store.getLahan().find(item => item.id === id);
        if (!l) return;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="edit-3" class="w-5 h-5 text-teal-600"></i> Ubah / Edit Data & Luasan Plot Lahan
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PertanianModule.submitEditPlot(event, '${l.id}')" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Plot Lahan *</label>
                        <input type="text" id="edit-lhn-nama" value="${l.nama || ''}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Lahan *</label>
                            <input type="text" id="edit-lhn-lokasi" value="${l.lokasi || ''}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Luas Lahan (m²) *</label>
                            <input type="number" id="edit-lhn-luas" value="${l.luasM2 || 0}" required class="w-full p-2.5 rounded-xl border border-teal-500/50 dark:border-teal-500/50 bg-teal-50/30 dark:bg-teal-950/30 font-bold text-teal-700 dark:text-teal-300">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Komoditas Ditanam *</label>
                            <input type="text" id="edit-lhn-komoditas" value="${l.komoditas || ''}" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Lahan</label>
                            <select id="edit-lhn-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                                <option value="Fase Pertumbuhan Rumpun" ${l.status === 'Fase Pertumbuhan Rumpun' ? 'selected' : ''}>Fase Pertumbuhan Rumpun</option>
                                <option value="Siap Pangkas" ${l.status === 'Siap Pangkas' ? 'selected' : ''}>Siap Pangkas / Siap Panen</option>
                                <option value="Fase Awal Tumbuh" ${l.status === 'Fase Awal Tumbuh' ? 'selected' : ''}>Fase Awal Tumbuh</option>
                                <option value="Pasca Panen (Regrowing)" ${l.status === 'Pasca Panen (Regrowing)' ? 'selected' : ''}>Pasca Panen (Regrowing)</option>
                                <option value="Olah Tanah / Replanting" ${l.status === 'Olah Tanah / Replanting' ? 'selected' : ''}>Olah Tanah / Replanting</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Tanam</label>
                            <input type="date" id="edit-lhn-tgl-tanam" value="${l.tglTanam || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimasi Panen Berikut</label>
                            <input type="text" id="edit-lhn-estimasi-panen" value="${l.tglEstimasiPanen || ''}" placeholder="Contoh: 2026-10-15" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimasi Hasil Panen (kg)</label>
                            <input type="number" id="edit-lhn-hasil" value="${l.estimasiHasilKg || 0}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pupuk Kohe Digunakan</label>
                            <input type="text" id="edit-lhn-pupuk" value="${l.pupukDigunakan || ''}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan Tambahan</label>
                        <textarea id="edit-lhn-ket" rows="2" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">${l.keterangan || ''}</textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitEditPlot(e, id) {
        e.preventDefault();
        const fields = {
            nama: document.getElementById("edit-lhn-nama").value.trim(),
            lokasi: document.getElementById("edit-lhn-lokasi").value.trim(),
            luasM2: parseInt(document.getElementById("edit-lhn-luas").value) || 0,
            komoditas: document.getElementById("edit-lhn-komoditas").value.trim(),
            status: document.getElementById("edit-lhn-status").value,
            tglTanam: document.getElementById("edit-lhn-tgl-tanam").value,
            tglEstimasiPanen: document.getElementById("edit-lhn-estimasi-panen").value.trim(),
            estimasiHasilKg: parseInt(document.getElementById("edit-lhn-hasil").value) || 0,
            pupukDigunakan: document.getElementById("edit-lhn-pupuk").value.trim(),
            keterangan: document.getElementById("edit-lhn-ket").value.trim() || "-"
        };

        Store.updateLahan(id, fields);
        App.closeModal();
        App.showToast("Data dan luasan plot lahan berhasil diperbarui!", "success");
        App.renderContent();
    },

    hapusPlot(id) {
        const l = Store.getLahan().find(item => item.id === id);
        if (!l) return;

        if (confirm(`Hapus plot lahan "${l.nama}" (${(l.luasM2 || 0).toLocaleString('id-ID')} m²)? Tindakan ini tidak dapat dibatalkan.`)) {
            Store.deleteLahan(id);
            App.showToast(`Plot lahan "${l.nama}" berhasil dihapus.`, "info");
            App.renderContent();
        }
    },

    catatPanen(lahanId) {
        const l = Store.getLahan().find(item => item.id === lahanId);
        if (!l) return;

        const defaultDate = new Date().toISOString().split("T")[0];
        const estHasil = l.estimasiHasilKg || 500;

        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="scissors" class="w-5 h-5 text-teal-600"></i> Catat Realisasi Panen HPT Bank Pakan
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="PertanianModule.submitPanenLahan(event, '${l.id}')" class="space-y-3 text-xs">
                    <div class="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 space-y-1">
                        <div class="font-bold text-sm text-teal-900 dark:text-teal-200">${l.nama}</div>
                        <div class="flex items-center justify-between text-teal-700 dark:text-teal-300 text-[11px]">
                            <span>Komoditas: <b>${l.komoditas}</b></span>
                            <span>Luasan: <b>${(l.luasM2 || 0).toLocaleString('id-ID')} m²</b></span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Panen *</label>
                            <input type="date" id="cp-tgl" required value="${defaultDate}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hasil Panen Riil (kg) *</label>
                            <input type="number" step="1" id="cp-hasil" required value="${estHasil}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-teal-600 text-base">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Lahan Pasca Panen *</label>
                        <select id="cp-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold">
                            <option value="Pasca Panen (Regrowing)">Pasca Panen (Regrowing / Pertumbuhan Kembali)</option>
                            <option value="Fase Pemupukan Susulan">Fase Pemupukan Susulan Kohe</option>
                            <option value="Olah Tanah / Replanting">Olah Tanah / Replanting Bibit Baru</option>
                        </select>
                    </div>

                    <div>
                        <label class="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                            <input type="checkbox" id="cp-sync-stok" checked class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4">
                            <span>Otomatis tambahkan hasil panen ini ke Stok Hijauan Gudang Pakan</span>
                        </label>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-slate-600 dark:text-slate-300">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition active:scale-95">
                            Simpan Hasil Panen
                        </button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitPanenLahan(e, lahanId) {
        e.preventDefault();
        const tgl = document.getElementById("cp-tgl").value;
        const kg = parseFloat(document.getElementById("cp-hasil").value) || 0;
        const status = document.getElementById("cp-status").value;
        const syncStok = document.getElementById("cp-sync-stok").checked;

        const lahanList = Store.getLahan();
        const l = lahanList.find(item => item.id === lahanId);
        if (!l) return;

        l.tglPanenTerakhir = tgl;
        l.status = status;
        
        // Hitung estimasi panen berikutnya (40 hari untuk rumput odot)
        const nextDate = new Date(tgl);
        nextDate.setDate(nextDate.getDate() + 40);
        l.tglEstimasiPanen = nextDate.toISOString().split("T")[0];

        Store.saveLahan(lahanList);

        if (syncStok && kg > 0) {
            const stokList = Store.getStokPakan();
            let hijauanStok = stokList.find(s => s.kategori === "Hijauan" || s.nama.toLowerCase().includes("hijauan") || s.nama.toLowerCase().includes("odot"));
            if (hijauanStok) {
                hijauanStok.stokKg += kg;
            } else {
                stokList.push({
                    id: "stk-" + Date.now(),
                    nama: `Hijauan Segar (${l.komoditas})`,
                    kategori: "Hijauan",
                    stokKg: kg,
                    satuan: "kg",
                    batasMinimum: 300,
                    biayaPerKg: 400
                });
            }
            Store.saveStokPakan(stokList);
        }

        Store.addLog(`Mencatat realisasi panen ${kg} kg ${l.komoditas} dari ${l.nama}. Lahan berstatus ${status}.`);
        App.closeModal();
        App.showToast(`Panen ${kg} kg ${l.komoditas} berhasil dicatat!`, "success");
        App.renderContent();
    },

    tambahStok(stokId) {
        const stokList = Store.getStokPakan();
        const s = stokList.find(item => item.id === stokId);
        if (!s) return;

        const penambahan = prompt(`Update penambahan/pengurangan stok untuk ${s.nama} (${s.satuan}):\n(Gunakan angka positif untuk menambah, negatif untuk mengurangi)`, "100");
        if (penambahan && !isNaN(penambahan)) {
            const delta = parseFloat(penambahan);
            s.stokKg = Math.max(0, s.stokKg + delta);
            Store.saveStokPakan(stokList);
            Store.addLog(`Update stok pakan ${s.nama}: ${delta > 0 ? '+' : ''}${delta} ${s.satuan} (Sisa: ${s.stokKg} ${s.satuan})`);
            App.showToast(`Stok ${s.nama} berhasil diperbarui!`, "success");
            App.renderContent();
        }
    }
};

window.PertanianModule = PertanianModule;

