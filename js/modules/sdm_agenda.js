/**
 * Modul Manajemen SDM, Agenda Musyawarah Desa & Audit Trail
 */

const SdmAgendaModule = {
    activeTab: "sdm", // "sdm" | "agenda" | "logs"

    render() {
        const sdmList = Store.getSDM();
        const agendaList = Store.getAgendas();
        const logs = Store.getLogs();
        const currentUser = Store.getCurrentUser();

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
                            <i data-lucide="users" class="w-3.5 h-3.5"></i> Tata Kelola Kelembagaan
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">SDM, Agenda Musyawarah & Audit Log</h2>
                        <p class="text-xs text-slate-500">Struktur pengelola BUMKal Pleret, penjadwalan musyawarah kalurahan, dan rekam jejak aktivitas sistem.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        ${this.activeTab === 'sdm' ? `
                            <button onclick="SdmAgendaModule.openModalTambahSDM()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition active:scale-95">
                                <i data-lucide="user-plus" class="w-4 h-4"></i> Tambah SDM
                            </button>
                        ` : this.activeTab === 'agenda' ? `
                            <button onclick="SdmAgendaModule.openModalTambahAgenda()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition active:scale-95">
                                <i data-lucide="calendar-plus" class="w-4 h-4"></i> Jadwalkan Agenda
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- SUB TABS NAVIGATION -->
                <div class="flex border-b border-slate-200 dark:border-slate-700 space-x-6 text-xs font-bold">
                    <button onclick="SdmAgendaModule.setTab('sdm')" class="pb-3 border-b-2 flex items-center gap-2 ${this.activeTab === 'sdm' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                        <i data-lucide="users" class="w-4 h-4"></i> Struktur Pengelola & SDM (${sdmList.length})
                    </button>
                    <button onclick="SdmAgendaModule.setTab('agenda')" class="pb-3 border-b-2 flex items-center gap-2 ${this.activeTab === 'agenda' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                        <i data-lucide="calendar" class="w-4 h-4"></i> Agenda & Musyawarah Kalurahan (${agendaList.length})
                    </button>
                    <button onclick="SdmAgendaModule.setTab('logs')" class="pb-3 border-b-2 flex items-center gap-2 ${this.activeTab === 'logs' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}">
                        <i data-lucide="shield-check" class="w-4 h-4"></i> Audit Trail / Log Aktivitas (${logs.length})
                    </button>
                </div>

                <!-- TAB 1: SDM & PENGGUNA -->
                ${this.activeTab === 'sdm' ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${sdmList.map(s => {
                            const isCurrent = currentUser.id === s.id;
                            return `
                                <div class="bg-white dark:bg-slate-800 rounded-2xl border ${isCurrent ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200/80 dark:border-slate-700/80'} p-5 shadow-sm space-y-3 flex flex-col justify-between">
                                    <div>
                                        <div class="flex items-start justify-between">
                                            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-base shadow">
                                                ${s.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                            </div>
                                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${s.status === 'Pamong' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
                                                ${s.status}
                                            </span>
                                        </div>

                                        <div class="mt-3">
                                            <h4 class="font-bold text-sm text-slate-900 dark:text-white">${s.nama}</h4>
                                            <div class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">${s.jabatan}</div>
                                            <p class="text-[11px] text-slate-500">${s.unit}</p>
                                        </div>

                                        <div class="mt-3 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                                            <div class="flex justify-between"><span class="text-slate-400">NIK:</span><b class="text-slate-700 dark:text-slate-300 font-mono">${s.nik}</b></div>
                                            <div class="flex justify-between"><span class="text-slate-400">WhatsApp:</span><b class="text-slate-700 dark:text-slate-300">${s.noHp}</b></div>
                                            <div class="flex justify-between"><span class="text-slate-400">Pendidikan:</span><b class="text-slate-700 dark:text-slate-300">${s.pendidikan}</b></div>
                                        </div>

                                        <p class="text-[11px] text-slate-500 italic mt-2">"${s.catatan}"</p>
                                    </div>

                                    <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <span class="text-[10px] text-slate-400">Bergabung: ${s.tglBergabung}</span>
                                        ${isCurrent ? `
                                            <span class="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Akun Aktif
                                            </span>
                                        ` : `
                                            <button onclick="SdmAgendaModule.switchUser('${s.id}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                                                Gunakan Akun Ini
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : this.activeTab === 'agenda' ? `
                    <!-- TAB 2: AGENDA & MUSYAWARAH -->
                    <div class="space-y-4">
                        ${agendaList.map(a => `
                            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-3">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">${a.kategori}</span>
                                        <h3 class="text-base font-bold text-slate-900 dark:text-white mt-1">${a.judul}</h3>
                                    </div>
                                    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 self-start sm:self-auto">
                                        ${a.status.toUpperCase()}
                                    </span>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <span class="text-slate-400 block text-[11px]">Waktu Pelaksanaan:</span>
                                        <b class="text-slate-800 dark:text-slate-200">${a.tgl}, ${a.jamMulai} - ${a.jamSelesai} WIB</b>
                                    </div>
                                    <div>
                                        <span class="text-slate-400 block text-[11px]">Tempat Pertemuan:</span>
                                        <b class="text-slate-800 dark:text-slate-200">${a.tempat}</b>
                                    </div>
                                    <div>
                                        <span class="text-slate-400 block text-[11px]">Penanggung Jawab:</span>
                                        <b class="text-indigo-600 dark:text-indigo-400">${a.penanggungJawab}</b>
                                    </div>
                                </div>

                                <div class="text-xs space-y-1.5">
                                    <div class="text-slate-500 font-semibold">Peserta Hadir:</div>
                                    <p class="text-slate-700 dark:text-slate-300">${a.peserta}</p>
                                </div>

                                <div class="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/30 text-xs space-y-1">
                                    <div class="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                        <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Notulensi & Poin Bahasan:
                                    </div>
                                    <p class="text-amber-900/90 dark:text-amber-300">${a.notulensi}</p>
                                    <div class="mt-2 text-[11px] font-semibold text-amber-800 dark:text-amber-400">
                                        Action Item / Tindak Lanjut: <span class="font-normal">${a.tindakLanjut}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <!-- TAB 3: AUDIT TRAIL / LOGS -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
                        <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i> Rekam Jejak Sistem (Audit Trail)
                            </h3>
                            <span class="text-xs text-slate-500">${logs.length} Aksi Tercatat</span>
                        </div>

                        <div class="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                            ${logs.map(l => `
                                <div class="p-3.5 flex items-start gap-3 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition">
                                    <div class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5">
                                        <i data-lucide="activity" class="w-3.5 h-3.5"></i>
                                    </div>
                                    <div class="flex-1">
                                        <div class="font-semibold text-slate-800 dark:text-slate-200">${l.aksi}</div>
                                        <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                                            <span>Oleh: <b>${l.user}</b></span>
                                            <span>•</span>
                                            <span>${l.tgl}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `}
            </div>
        `;
    },

    setTab(tab) {
        this.activeTab = tab;
        App.renderContent();
    },

    switchUser(sdmId) {
        const s = Store.getSDM().find(item => item.id === sdmId);
        if (s) {
            Store.setCurrentUser(s);
            App.showToast(`Beralih ke akun: ${s.nama} (${s.jabatan})`, "success");
            App.renderHeaderUser();
            if (App.updateSidebarVisibility) App.updateSidebarVisibility();
            if (App.currentRoute && Store.isRoleAllowed && !Store.isRoleAllowed(s.role || "direksi", App.currentRoute)) {
                App.navigate("dashboard");
            } else {
                App.renderContent();
            }
        }
    },

    openModalTambahSDM() {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="user-plus" class="w-5 h-5 text-indigo-600"></i> Pendaftaran Personil / Pengurus Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="SdmAgendaModule.submitSDM(event)" class="space-y-3 text-xs">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">NIK *</label>
                            <input type="text" id="sdm-nik" required placeholder="340209..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
                            <input type="text" id="sdm-nama" required placeholder="Nama dan gelar" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jabatan *</label>
                            <input type="text" id="sdm-jabatan" required placeholder="Contoh: Petugas Kebersihan & Pakan" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Kerja *</label>
                            <input type="text" id="sdm-unit" required placeholder="Contoh: Unit Peternakan Domba" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. Handphone / WA *</label>
                            <input type="text" id="sdm-hp" required placeholder="08..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input type="email" id="sdm-email" placeholder="nama@bumkal.pleret.id" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Kepegawaian</label>
                            <select id="sdm-status" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Karyawan Tetap">Karyawan Tetap</option>
                                <option value="Karyawan Kontrak">Karyawan Kontrak</option>
                                <option value="Pamong">Pamong Kalurahan</option>
                                <option value="Mitra">Mitra Lapangan</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pendidikan Terakhir</label>
                            <input type="text" id="sdm-pendidikan" placeholder="Contoh: SMK Peternakan / S1" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tugas Pokok & Tanggung Jawab</label>
                        <textarea id="sdm-catatan" rows="2" placeholder="Uraian tugas harian personil" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Simpan Data SDM</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitSDM(e) {
        e.preventDefault();
        const sdmList = Store.getSDM();
        const newSDM = {
            id: "sdm-" + (sdmList.length + 1),
            nik: document.getElementById("sdm-nik").value.trim(),
            nama: document.getElementById("sdm-nama").value.trim(),
            jabatan: document.getElementById("sdm-jabatan").value.trim(),
            unit: document.getElementById("sdm-unit").value.trim(),
            role: "staf_lapangan",
            status: document.getElementById("sdm-status").value,
            noHp: document.getElementById("sdm-hp").value.trim(),
            email: document.getElementById("sdm-email").value.trim() || "-",
            tglBergabung: new Date().toISOString().split("T")[0],
            pendidikan: document.getElementById("sdm-pendidikan").value.trim() || "-",
            catatan: document.getElementById("sdm-catatan").value.trim() || "-"
        };

        sdmList.push(newSDM);
        Store.saveSDM(sdmList);
        Store.addLog(`Menambahkan data personil baru: ${newSDM.nama} (${newSDM.jabatan})`);
        App.closeModal();
        App.showToast("Personil baru berhasil ditambahkan!", "success");
        App.renderContent();
    },

    openModalTambahAgenda() {
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="calendar-plus" class="w-5 h-5 text-indigo-600"></i> Jadwalkan Agenda Musyawarah / Monev
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="SdmAgendaModule.submitAgenda(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Agenda *</label>
                        <input type="text" id="agn-judul" required placeholder="Contoh: Rapat Koordinasi Panen Pakan & Kurban" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Pertemuan</label>
                            <input type="text" id="agn-kategori" value="Musyawarah Kalurahan" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal *</label>
                            <input type="date" id="agn-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jam Mulai *</label>
                            <input type="time" id="agn-mulai" required value="09:00" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai *</label>
                            <input type="time" id="agn-selesai" required value="12:00" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tempat Pertemuan *</label>
                        <input type="text" id="agn-tempat" required value="Pendopo Balai Kalurahan Pleret" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Peserta Undangan *</label>
                        <input type="text" id="agn-peserta" required placeholder="Lurah, Pamong, Direksi BUMDes, Pengurus Gapoktan" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab *</label>
                        <input type="text" id="agn-pj" required value="H. Supardi, S.Pt." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Jadwalkan Agenda</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitAgenda(e) {
        e.preventDefault();
        const newAgenda = {
            id: "agn-" + Date.now(),
            judul: document.getElementById("agn-judul").value.trim(),
            kategori: document.getElementById("agn-kategori").value.trim(),
            tgl: document.getElementById("agn-tgl").value,
            jamMulai: document.getElementById("agn-mulai").value,
            jamSelesai: document.getElementById("agn-selesai").value,
            tempat: document.getElementById("agn-tempat").value.trim(),
            peserta: document.getElementById("agn-peserta").value.trim(),
            penanggungJawab: document.getElementById("agn-pj").value.trim(),
            status: "terjadwal",
            notulensi: "Agenda dijadwalkan.",
            tindakLanjut: "Menyiapkan materi rapat."
        };

        Store.addAgenda(newAgenda);
        App.closeModal();
        App.showToast("Agenda baru berhasil dijadwalkan!", "success");
        App.renderContent();
    }
};
