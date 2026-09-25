/**
 * Utility: Backup, Restore, Export CSV & Cetak Dokumen
 */
const ExportImport = {
    // Export full state to JSON file
    exportJSON() {
        try {
            const data = Store.exportAll();
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const dateStr = new Date().toISOString().split("T")[0];
            a.href = url;
            a.download = `backup_lumbung_ternak_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            App.showToast("Berhasil mencadangkan database ke file JSON!", "success");
        } catch (e) {
            console.error(e);
            App.showToast("Gagal mengekspor database: " + e.message, "error");
        }
    },

    // Import full state from JSON file
    importJSON(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const json = JSON.parse(e.target.result);
                if (Store.importAll(json)) {
                    App.showToast("Database berhasil dipulihkan dari cadangan!", "success");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1200);
                } else {
                    App.showToast("Format cadangan tidak valid!", "error");
                }
            } catch (err) {
                console.error(err);
                App.showToast("File JSON rusak atau tidak valid!", "error");
            }
        };
        reader.readAsText(file);
    },

    // Helper format cell CSV aman
    escapeCSVCell(val, delimiter = ";") {
        if (val === null || val === undefined) return "";
        let str = String(val);
        if (str.includes(delimiter) || str.includes("\n") || str.includes("\r") || str.includes('"')) {
            str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    },

    // 1. Ekspor langsung sebagai tabel spreadsheet Microsoft Excel (.xls) bergaris & berkolom terpisah
    exportExcelTable(filename, headers, rows, title = "Data Ekspor", sheetName = "Sheet1") {
        const d = new Date().toISOString().split("T")[0];
        const cfg = typeof Store !== "undefined" && Store.getPengaturan ? Store.getPengaturan() : {};
        const orgName = cfg.namaLembaga || "BUMKal LPM Pleret";

        let html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>${sheetName}</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <style>
                    body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
                    .header-title { font-size: 14pt; font-weight: bold; color: #065f46; text-align: left; }
                    .header-subtitle { font-size: 10pt; color: #4b5563; margin-bottom: 12px; }
                    table { border-collapse: collapse; width: 100%; }
                    th { background-color: #059669; color: #ffffff; font-weight: bold; border: 1px solid #047857; padding: 8px 12px; text-align: center; }
                    td { border: 1px solid #d1d5db; padding: 6px 10px; color: #1f2937; }
                    tr:nth-child(even) td { background-color: #f9fafb; }
                </style>
            </head>
            <body>
                <div class="header-title">${orgName}</div>
                <div class="header-subtitle">${title} • Tanggal Ekspor: ${d}</div>
                <br>
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => `
                            <tr>
                                ${r.map(cell => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (typeof App !== "undefined" && App.showToast) {
            App.showToast("Berhasil mengekspor format Excel (.xls) dengan kolom terpisah rapi!", "success");
        }
    },

    // 2. Modal pilihan format ekspor (Excel vs CSV Titik-Koma vs CSV Koma)
    openExportModal(type, customHeaders = null, customRows = null, customTitle = null) {
        const typeLabels = {
            domba: "Data Master Populasi Domba",
            keuangan: "Buku Kas & Transaksi BUMDes",
            limbah: "Data Pengolahan Kohe & Pupuk",
            pakan: "Inventaris Stok Pakan & HPP",
            timbang: "Riwayat Data Penimbangan & ADG Domba",
            laporan: "Laporan Resmi Terpilih"
        };
        const title = customTitle || typeLabels[type] || "Ekspor Data";

        const modalHtml = `
            <div class="space-y-4">
                <div class="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                        <i data-lucide="file-spreadsheet" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-sm text-slate-900 dark:text-white">Pilih Format Ekspor Data</h3>
                        <p class="text-xs text-slate-500">${title}</p>
                    </div>
                </div>

                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Pilih format berkas yang sesuai dengan preferensi aplikasi spreadsheet di komputer Anda:
                </p>

                <div class="grid grid-cols-1 gap-3">
                    <!-- Option 1: Microsoft Excel (.xls) -->
                    <button onclick="ExportImport.executeExport('${type}', 'excel'); App.closeModal();" class="p-3.5 rounded-xl border-2 border-emerald-500/80 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition text-left flex items-start gap-3 group">
                        <div class="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow">
                            XLS
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <b class="text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition">Microsoft Excel Spreadsheet (.xls)</b>
                                <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Paling Rapi</span>
                            </div>
                            <p class="text-[11px] text-slate-500 mt-0.5">Kolom otomatis terpisah rapi (Kolom A, B, C), teks tidak menumpuk, header hijau dengan garis border.</p>
                        </div>
                    </button>

                    <!-- Option 2: CSV Semicolon (Standar Excel Windows / Indonesia) -->
                    <button onclick="ExportImport.executeExport('${type}', 'csv_semicolon'); App.closeModal();" class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition text-left flex items-start gap-3 group">
                        <div class="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow">
                            CSV
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <b class="text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition">CSV Regional Indonesia / Windows (Titik-Koma ;)</b>
                                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">UTF-8 BOM</span>
                            </div>
                            <p class="text-[11px] text-slate-500 mt-0.5">Pemisah titik-koma (;) sesuai regional settings Windows Indonesia, mencegah data bertumpuk di Excel.</p>
                        </div>
                    </button>

                    <!-- Option 3: CSV Comma (Standar Internasional) -->
                    <button onclick="ExportImport.executeExport('${type}', 'csv_comma'); App.closeModal();" class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left flex items-start gap-3 group">
                        <div class="w-9 h-9 rounded-lg bg-slate-600 text-white flex items-center justify-center font-bold shrink-0 shadow">
                            CSV
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <b class="text-xs text-slate-900 dark:text-white group-hover:text-slate-600 transition">CSV Standar Internasional (Koma ,)</b>
                                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Global</span>
                            </div>
                            <p class="text-[11px] text-slate-500 mt-0.5">Untuk software internasional, Google Sheets, Python Pandas, atau integrasi API sistem lain.</p>
                        </div>
                    </button>
                </div>

                <div class="pt-2 flex justify-end">
                    <button onclick="App.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition">
                        Batal
                    </button>
                </div>
            </div>
        `;
        if (typeof App !== "undefined" && App.openModal) {
            App.openModal(modalHtml);
        }
    },

    executeExport(type, format) {
        let headers = [];
        let rows = [];
        const dateStr = new Date().toISOString().split("T")[0];
        let title = "Data";
        let baseFilename = `export_${type}_${dateStr}`;

        if (type === "domba") {
            title = "Data Populasi Ternak Domba & Kambing";
            headers = ["Eartag", "Warna Eartag", "Nama Domba", "Ras", "Asal Ternak", "Kategori", "Kelamin", "Kandang", "Sekat", "Bobot Awal (kg)", "Bobot Terkini (kg)", "ADG (g/hari)", "Status", "Tgl Masuk", "Tgl Lahir"];
            rows = Store.getDomba().map(d => {
                const latestWeight = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                return [
                    d.eartag,
                    d.warnaEartag || "Kuning",
                    d.nama,
                    d.ras,
                    d.asalTernak || "Peternak Lokal Pleret",
                    d.kategori,
                    d.kelamin,
                    d.kandang,
                    d.sekat,
                    d.bobotAwal !== undefined ? Number(d.bobotAwal).toFixed(2) : "-",
                    latestWeight !== undefined ? Number(latestWeight).toFixed(2) : "-",
                    d.adg || 0,
                    d.status,
                    d.tglMasuk || "-",
                    d.tglLahir || "-"
                ];
            });
        } else if (type === "keuangan") {
            title = "Buku Kas & Arus Keuangan BUMDes";
            headers = ["ID Transaksi", "Tanggal", "Tipe", "Kategori", "Keterangan", "Nominal (Rp)", "Metode Pembayaran", "Petugas Kasir"];
            rows = Store.getKeuangan().map(k => [
                k.id,
                k.tgl,
                k.tipe === "masuk" ? "Kas Masuk" : "Kas Keluar",
                k.kategori,
                k.keterangan,
                k.nominal,
                k.metode,
                k.user
            ]);
        } else if (type === "limbah") {
            title = "Data Pengolahan Limbah & Pupuk Kohe";
            headers = ["ID Batch", "Nama Produk", "Tipe Pupuk", "Tanggal Mulai", "Kapasitas Olah", "Satuan", "Target Selesai", "Status"];
            rows = Store.getBatchLimbah().map(l => [
                l.id,
                l.nama,
                l.tipe,
                l.tglMulai,
                l.kapasitas,
                l.satuan,
                l.tglEstimasiSelesai,
                l.status
            ]);
        } else if (type === "pakan") {
            title = "Log Distribusi Pakan Harian & Nutrisi Kandang";
            headers = ["ID_Log", "Tanggal", "Waktu", "Kandang", "Konsentrat_kg", "Silase_kg", "Hijauan_Odot_kg", "Petugas", "Catatan"];
            rows = Store.getLogPakanHarian().map(p => [
                p.id,
                p.tgl,
                p.waktu,
                p.kandang,
                p.konsentratKg,
                p.silaseKg,
                p.hijauanOdotKg,
                p.petugas,
                p.catatan || "-"
            ]);
        } else if (type === "timbang") {
            title = "Riwayat Penimbangan & Pertumbuhan Bobot Domba";
            headers = ["Eartag", "Nama_Domba", "Ras", "Kandang", "Tanggal_Timbang", "Bobot_kg", "ADG_g_hari", "Petugas", "Catatan"];
            rows = [];
            Store.getDomba().forEach(d => {
                (d.riwayatTimbang || []).forEach(r => {
                    rows.push([
                        d.eartag || d.id,
                        d.nama || "-",
                        d.ras || "-",
                        d.kandang || "-",
                        r.tgl,
                        r.bobot,
                        d.adg || 0,
                        r.petugas || "-",
                        r.catatan || "-"
                    ]);
                });
            });
            rows.sort((a, b) => new Date(b[4]) - new Date(a[4]));
        }

        if (format === "excel") {
            this.exportExcelTable(baseFilename, headers, rows, title, type.toUpperCase());
        } else {
            const delimiter = format === "csv_comma" ? "," : ";";
            this.exportCSVWithDelimiter(baseFilename, headers, rows, delimiter);
        }
    },

    exportCSVWithDelimiter(baseFilename, headers, rows, delimiter = ";") {
        const esc = (val) => this.escapeCSVCell(val, delimiter);
        const headerLine = headers.map(esc).join(delimiter);
        const rowLines = rows.map(r => r.map(esc).join(delimiter));
        
        // UTF-8 BOM (\uFEFF) ensures Excel opens with proper UTF-8 charset
        const csvContent = "\uFEFF" + [headerLine, ...rowLines].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${baseFilename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const delimName = delimiter === ";" ? "Titik-Koma (;)" : "Koma (,)";
        if (typeof App !== "undefined" && App.showToast) {
            App.showToast(`Berhasil mengekspor CSV berpemisah ${delimName}!`, "success");
        }
    },

    // Legacy fallback
    exportCSV(type) {
        this.openExportModal(type);
    },

    // Print Eartag Badge Modal
    printEartag(eartagId) {
        const domba = Store.getDomba().find(d => d.eartag === eartagId);
        if (!domba) return;

        const printWindow = window.open("", "_blank", "width=800,height=600");
        const latestWeight = domba.riwayatTimbang?.length > 0 ? domba.riwayatTimbang[domba.riwayatTimbang.length - 1].bobot : domba.bobotAwal;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cetak Eartag - ${domba.eartag}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #111; }
                    .badge { border: 3px solid #059669; border-radius: 12px; padding: 20px; width: 340px; margin: 0 auto; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .header { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #047857; letter-spacing: 1px; border-bottom: 2px dashed #059669; padding-bottom: 8px; margin-bottom: 12px; }
                    .eartag { font-size: 28px; font-weight: 800; color: #111827; margin: 4px 0; }
                    .name { font-size: 16px; font-weight: 600; color: #4b5563; margin-bottom: 12px; }
                    .qr-container { margin: 12px auto; display: flex; justify-content: center; }
                    .details { font-size: 12px; text-align: left; background: #f0fdf4; border-radius: 8px; padding: 10px; margin-top: 12px; }
                    .row { display: flex; justify-content: space-between; padding: 3px 0; }
                    .footer { margin-top: 14px; font-size: 10px; color: #6b7280; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
                <script src="js/utils/qrcode.min.js"><\/script>
            </head>
            <body>
                <div class="no-print" style="text-align: center; margin-bottom: 15px;">
                    <button onclick="window.print()" style="padding: 8px 18px; background: #059669; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Cetak Eartag Sekarang</button>
                    <button onclick="window.close()" style="padding: 8px 18px; background: #6b7280; color: white; border: none; border-radius: 6px; margin-left: 8px; cursor: pointer;">Tutup</button>
                </div>
                <div class="badge">
                    <div class="header">Lumbung Ternak Terpadu Pleret</div>
                    <div class="eartag">${domba.eartag} <span style="font-size: 13px; font-weight: bold; padding: 3px 8px; border-radius: 6px; background: #fef08a; color: #854d0e; border: 1px solid #ca8a04;">Tag ${domba.warnaEartag || 'Kuning'}</span></div>
                    <div class="name">${domba.nama} (${domba.ras})</div>
                    <div id="qrcode" class="qr-container"></div>
                    <div class="details">
                        <div class="row"><span>Asal Ternak:</span><b>${domba.asalTernak || 'Peternak Lokal Pleret'}</b></div>
                        <div class="row"><span>Kandang/Sekat:</span><b>${domba.kandang} / ${domba.sekat}</b></div>
                        <div class="row"><span>Kelamin / Fase:</span><b>${domba.kelamin} / ${domba.kategori}</b></div>
                        <div class="row"><span>Bobot Terkini:</span><b>${Number(latestWeight || 0).toFixed(2)} kg</b></div>
                        <div class="row"><span>Tgl Lahir:</span><b>${domba.tglLahir}</b></div>
                        <div class="row"><span>Status:</span><b style="color: #059669;">${domba.status}</b></div>
                    </div>
                    <div class="footer">ID Ternak Terverifikasi BUMKal LPM Pleret</div>
                </div>
                <script>
                    window.onload = function() {
                        new QRCode(document.getElementById("qrcode"), {
                            text: "https://lumbungternak.pleret.id/ternak/${domba.eartag}",
                            width: 140,
                            height: 140
                        });
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    // Print Medical Card
    printMedicalCard(eartagId) {
        const domba = Store.getDomba().find(d => d.eartag === eartagId);
        if (!domba) return;

        const printWindow = window.open("", "_blank", "width=850,height=700");
        const medLogs = domba.rekamMedis || [];

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Kartu Rekam Medis - ${domba.eartag}</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 24px; color: #1f2937; }
                    .header-box { border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
                    .title { font-size: 20px; font-weight: bold; color: #047857; }
                    .subtitle { font-size: 12px; color: #4b5563; }
                    .profile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f3f4f6; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                    th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
                    th { background: #e5e7eb; color: #111827; font-weight: 600; }
                    tr:nth-child(even) { background: #f9fafb; }
                    .signature-box { margin-top: 40px; display: flex; justify-content: flex-end; }
                    .sig { text-align: center; font-size: 12px; }
                    .sig-line { margin-top: 60px; border-top: 1px solid #374151; width: 180px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="no-print" style="margin-bottom: 15px;">
                    <button onclick="window.print()" style="padding: 6px 14px; background: #059669; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Cetak Rekam Medis</button>
                </div>
                <div class="header-box">
                    <div>
                        <div class="title">KARTU REKAM MEDIS & KESEHATAN HEWAN</div>
                        <div class="subtitle">Unit Peternakan Domba Terpadu - BUMKal Lumbung Pangan Mataram Pleret</div>
                    </div>
                    <div style="text-align: right; font-weight: bold; font-size: 16px; color: #065f46;">${domba.eartag}</div>
                </div>

                <div class="profile-grid">
                    <div>Nama: <b>${domba.nama}</b></div>
                    <div>Ras: <b>${domba.ras}</b></div>
                    <div>Kelamin: <b>${domba.kelamin}</b></div>
                    <div>Kategori: <b>${domba.kategori}</b></div>
                    <div>Lokasi: <b>${domba.kandang} / ${domba.sekat}</b></div>
                    <div>Tgl Lahir: <b>${domba.tglLahir}</b></div>
                    <div>Status: <b>${domba.status}</b></div>
                    <div>ADG: <b>${domba.adg || 0} g/hari</b></div>
                </div>

                <h3>Riwayat Penanganan, Diagnosa & Vaksinasi</h3>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 90px;">Tanggal</th>
                            <th>Diagnosa / Keluhan</th>
                            <th>Tindakan / Pengobatan</th>
                            <th>Obat / Vitamin</th>
                            <th>Petugas / Paramedik</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${medLogs.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: #6b7280;">Belum ada riwayat medis (Ternak Kondisi Prima)</td></tr>' : 
                            medLogs.map(m => `
                                <tr>
                                    <td>${m.tgl}</td>
                                    <td><b>${m.diagnosa}</b><br><small style="color: #6b7280;">${m.gejala || '-'}</small></td>
                                    <td>${m.tindakan}</td>
                                    <td>${m.obat || '-'}</td>
                                    <td>${m.petugas}</td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>

                <div class="signature-box">
                    <div class="sig">
                        <div>Pleret, ${new Date().toLocaleDateString('id-ID')}</div>
                        <div>Paramedik / Dokter Hewan Penanggung Jawab</div>
                        <div class="sig-line"></div>
                        <div>( Drh. BUMKal Pleret )</div>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    // Print Struk POS Kasir
    printReceipt(transaksi) {
        const printWindow = window.open("", "_blank", "width=400,height=600");
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Struk Penjualan #${transaksi.id}</title>
                <style>
                    body { font-family: 'Courier New', monospace; margin: 10px; font-size: 12px; }
                    .text-center { text-align: center; }
                    .border-b { border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
                    .row { display: flex; justify-content: space-between; margin: 3px 0; }
                    .total { font-size: 14px; font-weight: bold; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #000; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="no-print" style="margin-bottom: 10px; text-align: center;">
                    <button onclick="window.print()">Cetak Struk</button>
                </div>
                <div class="text-center border-b">
                    <b>LUMBUNG TERNAK & PANGAN MATARAM</b><br>
                    Kalurahan Pleret, Bantul, DIY<br>
                    Telp: (0274) 123456 / WA 0812-3456-7890
                </div>
                <div class="border-b">
                    <div>No: ${transaksi.id}</div>
                    <div>Tgl: ${transaksi.tgl}</div>
                    <div>Kasir: ${transaksi.user}</div>
                    <div>Pembeli: ${transaksi.pelanggan || 'Umum'}</div>
                </div>
                <div class="border-b">
                    <div class="row">
                        <span><b>${transaksi.item}</b> x${transaksi.qty || 1}</span>
                        <span>Rp ${(transaksi.nominal).toLocaleString('id-ID')}</span>
                    </div>
                    <div style="font-size: 10px; color: #555;">Kategori: ${transaksi.kategori}</div>
                </div>
                <div class="total row">
                    <span>TOTAL BAYAR:</span>
                    <span>Rp ${(transaksi.nominal).toLocaleString('id-ID')}</span>
                </div>
                <div class="row">
                    <span>Metode:</span>
                    <span>${transaksi.metode}</span>
                </div>
                <div class="text-center" style="margin-top: 15px; font-size: 10px;">
                    *** Terima Kasih Telah Berbelanja ***<br>
                    Mendukung Kedaulatan Pangan & Kemandirian Kalurahan Pleret
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
};
