/**
 * Modul Kanban & Manajemen Tugas Operasional Lapangan
 */

const KanbanModule = {
    activeUnitFilter: "all",

    render() {
        let tasks = Store.getTasks();
        const sdmList = Store.getSDM();

        if (this.activeUnitFilter !== "all") {
            tasks = tasks.filter(t => t.unit === this.activeUnitFilter);
        }

        const columns = [
            { id: "todo", title: "Perlu Dikerjakan", color: "border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/40" },
            { id: "in_progress", title: "Sedang Dikerjakan", color: "border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20" },
            { id: "review", title: "Uji Mutu / Review", color: "border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20" },
            { id: "done", title: "Selesai", color: "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20" }
        ];

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
                            <i data-lucide="check-square" class="w-3.5 h-3.5"></i> Tata Kelola Alur Kerja
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Papan Tugas Operasional Lapangan</h2>
                        <p class="text-xs text-slate-500">Distribusi tugas perawatan kandang domba, rotasi pakan HPT, pengemasan kompos kohe, dan administrasi BUMDes.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="KanbanModule.openModalTambahTugas()" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition active:scale-95">
                            <i data-lucide="plus" class="w-4 h-4"></i> Buat Tugas Baru
                        </button>
                    </div>
                </div>

                <!-- FILTER UNIT BUTTONS -->
                <div class="flex flex-wrap items-center gap-2 text-xs">
                    <span class="text-slate-500 font-medium mr-1">Unit Usaha:</span>
                    <button onclick="KanbanModule.setUnitFilter('all')" class="px-3 py-1.5 rounded-xl border ${this.activeUnitFilter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
                        Semua Unit (${Store.getTasks().length})
                    </button>
                    <button onclick="KanbanModule.setUnitFilter('Kandang')" class="px-3 py-1.5 rounded-xl border ${this.activeUnitFilter === 'Kandang' ? 'bg-emerald-600 text-white font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
                        Peternakan Domba
                    </button>
                    <button onclick="KanbanModule.setUnitFilter('Pertanian HPT')" class="px-3 py-1.5 rounded-xl border ${this.activeUnitFilter === 'Pertanian HPT' ? 'bg-teal-600 text-white font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
                        Pertanian Bank Pakan
                    </button>
                    <button onclick="KanbanModule.setUnitFilter('Pengolahan Pupuk')" class="px-3 py-1.5 rounded-xl border ${this.activeUnitFilter === 'Pengolahan Pupuk' ? 'bg-amber-600 text-white font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
                        Pengolahan Pupuk Kohe
                    </button>
                    <button onclick="KanbanModule.setUnitFilter('Keuangan & Niaga')" class="px-3 py-1.5 rounded-xl border ${this.activeUnitFilter === 'Keuangan & Niaga' ? 'bg-purple-600 text-white font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
                        Keuangan & Niaga
                    </button>
                </div>

                <!-- 4 KANBAN COLUMNS -->
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                    ${columns.map(col => {
                        const colTasks = tasks.filter(t => t.status === col.id);
                        return `
                            <div class="rounded-2xl border ${col.color} p-4 flex flex-col min-h-[480px]">
                                <!-- Column Header -->
                                <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-700/80">
                                    <div class="flex items-center gap-2">
                                        <h3 class="font-bold text-xs text-slate-800 dark:text-slate-200">${col.title}</h3>
                                        <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
                                            ${colTasks.length}
                                        </span>
                                    </div>
                                </div>

                                <!-- Cards Container -->
                                <div class="space-y-3 flex-1">
                                    ${colTasks.length === 0 ? `
                                        <div class="py-8 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-xl">
                                            Kosong
                                        </div>
                                    ` : colTasks.map(t => {
                                        const doneChecklist = (t.checklist || []).filter(c => c.done).length;
                                        const totalChecklist = (t.checklist || []).length;
                                        const prioColor = t.priority === 'urgent' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                                          t.priority === 'high' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';

                                        return `
                                            <div class="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition space-y-2.5">
                                                <div class="flex items-center justify-between">
                                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded ${prioColor}">${t.priority.toUpperCase()}</span>
                                                    <span class="text-[11px] font-semibold text-slate-500">${t.unit}</span>
                                                </div>

                                                <h4 onclick="KanbanModule.openDetailTugas('${t.id}')" class="font-bold text-xs text-slate-900 dark:text-white leading-snug hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                                    ${t.judul}
                                                </h4>

                                                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    ${t.deskripsi}
                                                </p>

                                                ${totalChecklist > 0 ? `
                                                    <div class="space-y-1">
                                                        <div class="flex justify-between text-[10px] text-slate-400">
                                                            <span>Progress Checklist</span>
                                                            <b>${doneChecklist}/${totalChecklist}</b>
                                                        </div>
                                                        <div class="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                            <div class="bg-blue-600 h-full rounded-full transition-all" style="width: ${(doneChecklist / totalChecklist) * 100}%"></div>
                                                        </div>
                                                    </div>
                                                ` : ''}

                                                <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                                    <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                                                        <div class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">
                                                            ${(t.assigneeNama || 'P').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span class="line-clamp-1">${(t.assigneeNama || 'Petugas').split(' ')[0]}</span>
                                                    </div>

                                                    <div class="flex items-center gap-1 text-[11px] text-slate-400">
                                                        <i data-lucide="calendar" class="w-3 h-3"></i> ${(t.dueDate || t.tglDeadline || '').length >= 5 ? (t.dueDate || t.tglDeadline).slice(5) : (t.dueDate || t.tglDeadline || '-')}
                                                    </div>
                                                </div>

                                                <!-- Quick Status Mover -->
                                                <div class="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                                                    <span>Pindah Alur:</span>
                                                    <div class="flex gap-1">
                                                        ${col.id !== 'todo' ? `
                                                            <button onclick="KanbanModule.pindahStatus('${t.id}', '${col.id === 'done' ? 'review' : col.id === 'review' ? 'in_progress' : 'todo'}')" class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200">
                                                                &larr;
                                                            </button>
                                                        ` : ''}
                                                        ${col.id !== 'done' ? `
                                                            <button onclick="KanbanModule.pindahStatus('${t.id}', '${col.id === 'todo' ? 'in_progress' : col.id === 'in_progress' ? 'review' : 'done'}')" class="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-200 font-bold">
                                                                &rarr;
                                                            </button>
                                                        ` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    setUnitFilter(unit) {
        this.activeUnitFilter = unit;
        App.renderContent();
    },

    pindahStatus(taskId, newStatus) {
        Store.updateTaskStatus(taskId, newStatus);
        App.showToast("Status tugas berhasil diperbarui!", "success");
        App.renderContent();
    },

    openDetailTugas(taskId) {
        const t = Store.getTasks().find(item => item.id === taskId);
        if (!t) return;

        App.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-start justify-between border-b pb-3 dark:border-slate-700">
                    <div>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">${t.unit}</span>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white mt-1">${t.judul}</h3>
                    </div>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <div class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    ${t.deskripsi}
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                        <span class="text-slate-400 block text-[11px]">Penanggung Jawab:</span>
                        <b class="text-slate-800 dark:text-slate-200">${t.assigneeNama || 'Petugas'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Prioritas:</span>
                        <b class="text-rose-600 uppercase">${t.priority || 'normal'}</b>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px]">Batas Waktu:</span>
                        <b class="text-slate-800 dark:text-slate-200">${t.dueDate || t.tglDeadline || '-'}</b>
                    </div>
                </div>

                <!-- Checklist Lapangan -->
                <div class="space-y-2 pt-2 border-t dark:border-slate-700">
                    <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">Checklist Pekerjaan Lapangan:</h4>
                    <div class="space-y-1.5 text-xs">
                        ${(t.checklist || []).map((c, i) => `
                            <label class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 cursor-pointer">
                                <input type="checkbox" ${c.done ? 'checked' : ''} onchange="KanbanModule.toggleChecklist('${t.id}', ${i})" class="rounded text-blue-600 focus:ring-blue-500">
                                <span class="${c.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'} font-medium">${c.text || c.teks || ''}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Komentar & Catatan Lapangan -->
                <div class="space-y-2 pt-2 border-t dark:border-slate-700">
                    <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">Catatan & Bukti Pelaksanaan:</h4>
                    <div class="space-y-2 text-xs">
                        ${(t.comments || []).length === 0 ? `
                            <p class="text-slate-400 italic text-[11px]">Belum ada catatan lapangan.</p>
                        ` : (t.comments || []).map(cm => `
                            <div class="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                                <div class="flex justify-between font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                                    <span>${cm.author}</span>
                                    <span class="text-slate-400 font-normal">${cm.tgl}</span>
                                </div>
                                <p class="text-slate-600 dark:text-slate-300 mt-1">${cm.text}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex gap-2 pt-2">
                        <input type="text" id="t-komentar" placeholder="Tulis catatan atau laporan kendala..." class="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs">
                        <button onclick="KanbanModule.tambahKomentar('${t.id}')" class="px-3 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs">Kirim</button>
                    </div>
                </div>

                <div class="pt-3 border-t dark:border-slate-700 flex items-center justify-between">
                    <button onclick="KanbanModule.hapusTugas('${t.id}')" class="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-bold text-xs flex items-center gap-1.5 transition">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus Tugas
                    </button>
                    <button onclick="App.closeModal()" class="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition">
                        Tutup
                    </button>
                </div>
            </div>
        `);
        App.openModal();
    },

    hapusTugas(taskId) {
        if (confirm("Hapus tugas ini dari papan Kanban? Tindakan ini tidak dapat dibatalkan.")) {
            Store.deleteTask(taskId);
            App.closeModal();
            App.showToast("Tugas berhasil dihapus dari Kanban!", "info");
            App.renderContent();
        }
    },

    toggleChecklist(taskId, index) {
        const tasks = Store.getTasks();
        const t = tasks.find(item => item.id === taskId);
        if (t && t.checklist && t.checklist[index]) {
            t.checklist[index].done = !t.checklist[index].done;
            Store.saveTasks(tasks);
            App.renderContent();
            KanbanModule.openDetailTugas(taskId);
        }
    },

    tambahKomentar(taskId) {
        const input = document.getElementById("t-komentar");
        const val = input.value.trim();
        if (!val) return;

        const tasks = Store.getTasks();
        const t = tasks.find(item => item.id === taskId);
        if (t) {
            if (!t.comments) t.comments = [];
            const user = Store.getCurrentUser();
            t.comments.push({
                author: user.nama || "Petugas",
                tgl: new Date().toLocaleDateString('id-ID') + ", " + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                text: val
            });
            Store.saveTasks(tasks);
            Store.addLog(`Menambahkan catatan pada tugas "${t.judul}": ${val}`);
            KanbanModule.openDetailTugas(taskId);
        }
    },

    openModalTambahTugas() {
        const sdmList = Store.getSDM();
        App.setModalContent(`
            <div class="p-6 space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="plus-circle" class="w-5 h-5 text-blue-600"></i> Buat Tugas Operasional Baru
                    </h3>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <form onsubmit="KanbanModule.submitTugas(event)" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Tugas *</label>
                        <input type="text" id="tsk-judul" required placeholder="Contoh: Pembersihan Sanitasi Kandang A" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Kerja *</label>
                            <select id="tsk-unit" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="Kandang">Peternakan Domba</option>
                                <option value="Pertanian HPT">Pertanian Bank Pakan</option>
                                <option value="Pengolahan Pupuk">Pengolahan Pupuk Kohe</option>
                                <option value="Keuangan & Niaga">Keuangan & Niaga</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prioritas *</label>
                            <select id="tsk-prio" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                <option value="normal">Normal</option>
                                <option value="high">Tinggi (High)</option>
                                <option value="urgent">Mendesak (Urgent)</option>
                                <option value="low">Rendah (Low)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Lengkap *</label>
                        <textarea id="tsk-desc" required rows="3" placeholder="Rincian instruksi pelaksanaan tugas..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Petugas Pelaksana (Assignee) *</label>
                            <select id="tsk-sdm" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                                ${sdmList.map(s => `<option value="${s.id}|${s.nama}">${s.nama} (${s.jabatan.split('(')[0]})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Batas Waktu (Due Date) *</label>
                            <input type="date" id="tsk-date" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                    </div>

                    <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                        <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">Simpan Tugas</button>
                    </div>
                </form>
            </div>
        `);
        App.openModal();
    },

    submitTugas(e) {
        e.preventDefault();
        const sdmVal = document.getElementById("tsk-sdm").value.split("|");
        const newTask = {
            id: "tsk-" + Date.now(),
            judul: document.getElementById("tsk-judul").value.trim(),
            unit: document.getElementById("tsk-unit").value,
            priority: document.getElementById("tsk-prio").value,
            deskripsi: document.getElementById("tsk-desc").value.trim(),
            assigneeId: sdmVal[0],
            assigneeNama: sdmVal[1],
            dueDate: document.getElementById("tsk-date").value,
            status: "todo",
            checklist: [
                { id: "c-init", text: "Pelaksanaan awal dan koordinasi", done: false }
            ],
            comments: []
        };

        Store.addTask(newTask);
        App.closeModal();
        App.showToast("Tugas baru berhasil ditambahkan ke papan Kanban!", "success");
        App.renderContent();
    }
};

window.KanbanModule = KanbanModule;

