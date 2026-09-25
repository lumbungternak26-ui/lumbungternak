/**
 * Modul Scan Penimbang Cepat
 * Antarmuka efisien bagi petugas kandang saat menimbang ternak secara kilat
 */

const PenimbangCepatModule = {
    selectedDombaId: null,

    render() {
        const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");
        if (!this.selectedDombaId && dombaList.length > 0) {
            this.selectedDombaId = dombaList[0].id;
        }

        const selectedDomba = dombaList.find(d => d.id === this.selectedDombaId) || dombaList[0];
        const lastWeight = selectedDomba?.riwayatTimbang?.length > 0 
            ? selectedDomba.riwayatTimbang[selectedDomba.riwayatTimbang.length - 1].bobot 
            : selectedDomba?.bobotAwal || 0;
        const lastTgl = selectedDomba?.riwayatTimbang?.length > 0 
            ? selectedDomba.riwayatTimbang[selectedDomba.riwayatTimbang.length - 1].tgl 
            : selectedDomba?.tglMasuk || "-";

        // Riwayat Penimbangan Terbaru dari Semua Domba
        let recentWeighIns = [];
        dombaList.forEach(d => {
            (d.riwayatTimbang || []).forEach(r => {
                recentWeighIns.push({ eartag: d.eartag, nama: d.nama, ras: d.ras, kandang: d.kandang, ...r });
            });
        });
        recentWeighIns.sort((a, b) => new Date(b.tgl) - new Date(a.tgl));
        recentWeighIns = recentWeighIns.slice(0, 8);

        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div>
                        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-1">
                            <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> Mode Cepat Kandang
                        </div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Scan & Penimbangan Cepat</h2>
                        <p class="text-xs text-slate-500">Input bobot digital dengan kalkulasi otomatis Average Daily Gain (ADG) langsung di tempat timbang.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button type="button" onclick="PenimbangCepatModule.openModalImportTimbang()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> 📥 Import Masal Timbangan
                        </button>
                        <button type="button" onclick="PenimbangCepatModule.downloadTemplateTimbangExcel()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer">
                            <i data-lucide="download" class="w-4 h-4"></i> 📊 Unduh Template Excel
                        </button>
                        <button type="button" onclick="PenimbangCepatModule.downloadTemplateTimbangCSV()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer">
                            <i data-lucide="file-text" class="w-4 h-4 text-purple-600"></i> 📄 Template CSV (;)
                        </button>
                        <span class="text-xs font-semibold text-slate-500 ml-1 hidden lg:inline">Total: <b>${dombaList.length} ekor</b></span>
                    </div>
                </div>

                <!-- MAIN INTERACTIVE WEIGHING STATION -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left: 2 Spans (Weighing Form & Realtime Calc) -->
                    <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-sm space-y-5">
                        <div class="border-b border-slate-100 dark:border-slate-700 pb-4 space-y-3">
                            <div class="flex items-center justify-between">
                                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    1. Scan Barcode Eartag Ternak (Scanner USB / Kamera)
                                </label>
                                <button type="button" onclick="PenimbangCepatModule.openCameraScanner()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 transition active:scale-95">
                                    <i data-lucide="camera" class="w-3.5 h-3.5"></i> 📷 Buka Kamera Scanner
                                </button>
                            </div>

                            <!-- Hardware Barcode Wedge & Keyboard Listener Input -->
                            <div class="relative">
                                <i data-lucide="scan" class="w-5 h-5 text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                                <input 
                                    type="text" 
                                    id="qc-barcode-input" 
                                    placeholder="Arahkan Barcode Scanner USB / Ketik Eartag lalu Tekan Enter..." 
                                    onkeydown="PenimbangCepatModule.handleBarcodeInput(event)"
                                    class="w-full pl-11 pr-28 py-3 rounded-xl border-2 border-purple-500 bg-purple-50/20 dark:bg-slate-900 text-sm font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    autocomplete="off"
                                    autofocus
                                >
                                <button 
                                    type="button" 
                                    onclick="PenimbangCepatModule.submitBarcodeInput()"
                                    class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                                >
                                    Cari Eartag
                                </button>
                            </div>

                            <!-- Alternatif Dropdown Manual -->
                            <div class="flex items-center gap-2 pt-1">
                                <span class="text-[11px] text-slate-400 whitespace-nowrap">Atau pilih dari daftar ternak:</span>
                                <select onchange="PenimbangCepatModule.onSelectDomba(this.value)" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    ${dombaList.length === 0 ? '<option value="">-- Belum ada ternak domba terdaftar --</option>' : dombaList.map(d => {
                                        const w = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                                        return `<option value="${d.id}" ${d.id === this.selectedDombaId ? 'selected' : ''}>${d.eartag} - ${d.nama} (${d.ras}, Terakhir: ${w} kg) - ${d.kandang}/${d.sekat}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                        </div>

                        ${selectedDomba ? `
                            <!-- Active Animal Card Preview with Barcode Vector -->
                            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                                <img src="${selectedDomba.foto}" class="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500 shadow flex-shrink-0">
                                <div class="flex-1 text-center sm:text-left space-y-1">
                                    <div class="flex items-center justify-center sm:justify-start gap-2">
                                        <span class="text-xs font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">${selectedDomba.eartag}</span>
                                        <h3 class="font-bold text-base text-slate-900 dark:text-white">${selectedDomba.nama}</h3>
                                        <span class="text-xs text-slate-500">(${selectedDomba.ras})</span>
                                    </div>
                                    <div class="text-xs text-slate-500">
                                        Lokasi: <b>${selectedDomba.kandang} / ${selectedDomba.sekat}</b> • Kelamin: <b>${selectedDomba.kelamin}</b> • Status: <b class="text-emerald-600">${selectedDomba.status}</b>
                                    </div>
                                    <div class="text-xs text-slate-600 dark:text-slate-300 pt-1">
                                        Timbangan Terakhir: <b class="text-blue-600 dark:text-blue-400 text-sm">${Number(lastWeight || 0).toFixed(2)} kg</b> (${lastTgl})
                                    </div>
                                </div>
                                <div class="hidden md:block text-center flex-shrink-0 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 max-w-[140px]">
                                    ${window.BarcodeUtils ? BarcodeUtils.generateSVG(selectedDomba.eartag, { height: 30, barWidth: 1.2, showText: true }) : ''}
                                </div>
                            </div>

                            <!-- Input Weight & Live Calc -->
                            <form onsubmit="PenimbangCepatModule.submitQuickWeigh(event)" class="space-y-4">
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            2. Masukkan Angka Timbangan Baru (kg) *
                                        </label>
                                        <div class="relative">
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                id="qc-bobot" 
                                                required 
                                                placeholder="Contoh: 48.50" 
                                                oninput="PenimbangCepatModule.calculateLiveADG(this.value, ${lastWeight}, '${lastTgl}')"
                                                class="w-full p-4 rounded-xl border-2 border-blue-500 bg-white dark:bg-slate-900 text-3xl font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">KG</span>
                                        </div>
                                    </div>

                                    <!-- Live Delta & ADG Box -->
                                    <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-800 flex flex-col justify-center">
                                        <span class="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Hasil Kalkulasi Laju Tumbuh (ADG):</span>
                                        <div id="qc-live-adg-val" class="text-2xl font-black text-slate-400 mt-1">
                                            -- g / hari
                                        </div>
                                        <div id="qc-live-delta" class="text-xs text-slate-500 mt-1">
                                            Ketikkan bobot untuk melihat pertambahan
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Timbang</label>
                                        <input type="date" id="qc-tgl" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Kondisi Fisik</label>
                                        <input type="text" id="qc-catatan" placeholder="Contoh: Sangat padat, bulu bersih, nafsu makan tinggi" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs">
                                    </div>
                                </div>

                                <button type="submit" class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center justify-center gap-2">
                                    <i data-lucide="save" class="w-5 h-5"></i> Simpan Data Timbangan & Perbarui ADG
                                </button>
                            </form>
                        ` : `
                            <div class="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <div class="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                                    <i data-lucide="scale" class="w-6 h-6"></i>
                                </div>
                                <p class="font-bold text-slate-800 dark:text-slate-200 text-sm">Belum Ada Domba Terdaftar</p>
                                <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Database ternak saat ini kosong (0 ekor). Daftarkan domba baru di Master Domba atau lakukan pemindaian barcode eartag.</p>
                                <button onclick="App.navigate('domba')" class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                                    <i data-lucide="plus-circle" class="w-4 h-4"></i> Buka Master Domba
                                </button>
                            </div>
                        `}
                    </div>

                    <!-- Right: 1 Span (Recent Weigh-ins Log) -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
                        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="history" class="w-4 h-4 text-blue-600"></i> Riwayat Timbang Terakhir
                            </h3>
                            <span class="text-[11px] text-slate-400">Log Realtime</span>
                        </div>

                        <div class="space-y-2.5 max-h-[460px] overflow-y-auto text-xs">
                            ${recentWeighIns.length === 0 ? `
                                <div class="p-6 text-center text-slate-400 text-xs">
                                    <i data-lucide="scale" class="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600 mb-2"></i>
                                    <p class="font-semibold text-slate-600 dark:text-slate-400">Belum Ada Riwayat Timbang</p>
                                    <p class="text-[11px] text-slate-400 mt-0.5">Riwayat timbang kilat akan dicatat otomatis di sini.</p>
                                </div>
                            ` : recentWeighIns.map(r => `
                                <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 transition space-y-1">
                                    <div class="flex items-center justify-between font-bold">
                                        <span class="text-slate-800 dark:text-slate-200">${r.eartag} (${r.nama.split(' ')[0]})</span>
                                        <span class="text-emerald-600 dark:text-emerald-400 text-sm font-black">${Number(r.bobot || 0).toFixed(2)} kg</span>
                                    </div>
                                    <div class="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>${r.ras}</span>
                                        <span>${r.tgl}</span>
                                    </div>
                                    <div class="text-[10px] text-slate-500 italic">${r.catatan || 'Penimbangan rutin'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    onSelectDomba(dombaId) {
        this.selectedDombaId = dombaId;
        App.renderContent();
    },

    calculateLiveADG(newWeightStr, lastWeight, lastTglStr) {
        const newWeight = parseFloat(newWeightStr);
        const adgEl = document.getElementById("qc-live-adg-val");
        const deltaEl = document.getElementById("qc-live-delta");
        if (!adgEl || !deltaEl) return;

        if (isNaN(newWeight) || newWeight <= 0) {
            adgEl.innerText = "-- g / hari";
            adgEl.className = "text-2xl font-black text-slate-400 mt-1";
            deltaEl.innerText = "Ketikkan bobot untuk melihat pertambahan";
            return;
        }

        const deltaKg = Math.round((newWeight - lastWeight) * 100) / 100;
        const dLast = lastTglStr !== "-" ? new Date(lastTglStr) : new Date();
        const dNow = new Date();
        const diffDays = Math.max(1, Math.round((dNow - dLast) / (1000 * 60 * 60 * 24)));
        const adg = Math.round((deltaKg * 1000) / diffDays);

        if (deltaKg >= 0) {
            adgEl.innerText = `+${adg} g / hari`;
            adgEl.className = "text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1";
            deltaEl.innerHTML = `<b class="text-emerald-600">+${deltaKg.toFixed(2)} kg</b> dalam ${diffDays} hari terakhir (ADG Prima)`;
        } else {
            adgEl.innerText = `${adg} g / hari`;
            adgEl.className = "text-2xl font-black text-rose-600 dark:text-rose-400 mt-1";
            deltaEl.innerHTML = `<b class="text-rose-600">${deltaKg.toFixed(2)} kg</b> (Penurunan bobot, cek kesehatan)`;
        }
    },

    submitQuickWeigh(e) {
        e.preventDefault();
        const bobot = parseFloat(parseFloat(document.getElementById("qc-bobot").value).toFixed(2));
        const tgl = document.getElementById("qc-tgl").value;
        const catatan = document.getElementById("qc-catatan").value.trim() || "Penimbangan cepat kandang";

        const res = Store.addRiwayatTimbang(this.selectedDombaId, tgl, bobot, catatan);
        if (res) {
            App.showToast(`Berhasil menyimpan bobot ${res.domba.eartag} (${bobot.toFixed(2)} kg, ADG: ${res.adg} g/hari)!`, "success");
            App.renderContent();
        }
    },

    // --- HARDWARE & CAMERA BARCODE SCANNER LOGIC ---
    cameraStream: null,
    cameraScanInterval: null,

    handleBarcodeInput(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            this.submitBarcodeInput();
        }
    },

    submitBarcodeInput() {
        const input = document.getElementById("qc-barcode-input");
        if (!input) return;
        const code = input.value.trim();
        if (!code) return;
        this.processScannedCode(code);
        input.value = "";
    },

    processScannedCode(rawCode) {
        let code = String(rawCode || "").trim();
        // Support QR / string compound format like "BUMKAL-PLERET:DMB-001:..."
        if (code.includes(":")) {
            const parts = code.split(":");
            code = parts[1] || parts[0];
        }

        const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");
        const found = dombaList.find(d => 
            (d.eartag && d.eartag.toLowerCase() === code.toLowerCase()) ||
            (d.id && d.id.toLowerCase() === code.toLowerCase()) ||
            (d.nama && d.nama.toLowerCase() === code.toLowerCase())
        );

        if (found) {
            if (window.BarcodeUtils) BarcodeUtils.playScannerBeep();
            this.selectedDombaId = found.id;
            App.renderContent();
            App.showToast(`🏷️ Barcode ${found.eartag} (${found.nama}) terdeteksi! Siap timbang.`, "success");
            setTimeout(() => {
                const bobotInput = document.getElementById("qc-bobot");
                if (bobotInput) {
                    bobotInput.focus();
                    bobotInput.select();
                }
            }, 120);
        } else {
            App.showToast(`Eartag / Barcode "${code}" tidak ditemukan dalam daftar kambing aktif!`, "warning");
        }
    },

    openCameraScanner() {
        App.openModal(`
            <div class="space-y-4">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                            <i data-lucide="camera" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Scanner Barcode Kamera</h3>
                            <p class="text-xs text-slate-500">Arahkan kamera smartphone / webcam ke barcode eartag</p>
                        </div>
                    </div>
                    <button onclick="PenimbangCepatModule.closeCameraScanner(); App.closeModal();" class="text-slate-400 hover:text-slate-600">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <div class="relative bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center border-2 border-purple-500">
                    <video id="qc-camera-video" autoplay playsinline class="w-full h-full object-cover"></video>
                    <!-- Laser Scanner Animation Overlay -->
                    <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        <div class="w-4/5 h-28 border-2 border-purple-400 rounded-xl relative shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            <div class="absolute left-0 right-0 top-1/2 h-0.5 bg-rose-500 animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                        </div>
                        <span class="text-[11px] text-white/90 font-bold mt-2 bg-black/60 px-3 py-1 rounded-full">Posisikan Barcode di Kotak</span>
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Mendukung: Code 128, QR Code, Code 39, EAN-13</span>
                    <button type="button" onclick="PenimbangCepatModule.closeCameraScanner(); App.closeModal();" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-slate-700 dark:text-slate-200 transition">
                        Tutup Kamera
                    </button>
                </div>
            </div>
        `);

        if (window.lucide) window.lucide.createIcons();

        const video = document.getElementById("qc-camera-video");
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                .then(stream => {
                    this.cameraStream = stream;
                    if (video) {
                        video.srcObject = stream;
                        video.play();
                    }
                    this.startBarcodeDetection(video);
                })
                .catch(err => {
                    App.showToast("Akses kamera tidak diizinkan atau tidak ditemukan: " + err.message, "error");
                });
        } else {
            App.showToast("Browser tidak mendukung WebRTC Camera API!", "warning");
        }
    },

    startBarcodeDetection(video) {
        if ('BarcodeDetector' in window) {
            const detector = new window.BarcodeDetector({
                formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'ean_8']
            });
            this.cameraScanInterval = setInterval(async () => {
                if (!video || video.readyState < 2) return;
                try {
                    const barcodes = await detector.detect(video);
                    if (barcodes && barcodes.length > 0) {
                        const rawVal = barcodes[0].rawValue;
                        this.closeCameraScanner();
                        App.closeModal();
                        this.processScannedCode(rawVal);
                    }
                } catch (e) {
                    // Ignore frame scan err
                }
            }, 300);
        }
    },

    closeCameraScanner() {
        if (this.cameraScanInterval) {
            clearInterval(this.cameraScanInterval);
            this.cameraScanInterval = null;
        }
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    },

    // --- IMPORT MASAL & TEMPLATE TIMBANG CEPAT (ANTI-TABRAKAN) ---
    pendingTimbangImportData: [],

    downloadTemplateTimbangExcel() {
        const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : { nama: "Petugas" };
        const pet = currentUser.nama || "Petugas Timbang";
        const today = new Date().toISOString().split('T')[0];
        const dombaList = Store.getDomba().filter(d => d.status !== 'Mati' && d.status !== 'Terjual');

        const headers = ["Eartag", "Nama_Domba", "Kandang_Sekat", "Bobot_Sebelumnya_kg", "Tanggal_Timbang", "Bobot_Baru_kg", "Catatan", "Petugas"];
        let rows = [];

        if (dombaList.length > 0) {
            rows = dombaList.map(d => {
                const lastWeight = (d.riwayatTimbang && d.riwayatTimbang.length > 0)
                    ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot
                    : (d.bobotTerkini || d.bobotAwal || 0);
                const suggestedNewWeight = lastWeight > 0 ? (parseFloat(lastWeight) + 0.5).toFixed(2) : "25.00";
                const kandangSekat = d.kandang ? `${d.kandang}${d.sekat ? ' - ' + d.sekat : ''}` : "-";
                return [
                    d.eartag || d.id,
                    d.nama || "-",
                    kandangSekat,
                    Number(lastWeight || 0).toFixed(2),
                    today,
                    suggestedNewWeight,
                    "Penimbangan berkala",
                    pet
                ];
            });
        } else {
            rows = [
                ["D-001", "Si Manis", "Kandang A - Sekat 1", "25.50", today, "26.20", "Nafsu makan bagus", pet],
                ["D-002", "Si Hitam", "Kandang A - Sekat 2", "30.00", today, "30.80", "Kondisi sehat prima", pet]
            ];
        }

        ExportImport.exportExcelTable("template_import_timbang_bumkal", headers, rows, "Template Import & Update Masal Timbangan Domba BUMKal", "Template_Timbang");
        App.showToast("Template Excel Penimbangan (.xls) berhasil diunduh!", "success");
    },

    downloadTemplateTimbangCSV() {
        const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : { nama: "Petugas" };
        const pet = currentUser.nama || "Petugas Timbang";
        const today = new Date().toISOString().split('T')[0];
        const dombaList = Store.getDomba().filter(d => d.status !== 'Mati' && d.status !== 'Terjual');

        const note = `# TEMPLATE PENIMBANGAN MASAL BUMKAL - Format Pemisah Titik Koma (;)\r\n# Eartag domba harus sesuai dengan data domba di aplikasi. Jika tanggal timbang sama, sistem akan otomatis memperbarui dengan data terbaru.\r\n`;
        const header = "Eartag;Nama_Domba;Kandang_Sekat;Bobot_Sebelumnya_kg;Tanggal_Timbang;Bobot_Baru_kg;Catatan;Petugas\r\n";
        let body = "";

        if (dombaList.length > 0) {
            body = dombaList.map(d => {
                const lastWeight = (d.riwayatTimbang && d.riwayatTimbang.length > 0)
                    ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot
                    : (d.bobotTerkini || d.bobotAwal || 0);
                const suggestedNewWeight = lastWeight > 0 ? (parseFloat(lastWeight) + 0.5).toFixed(2) : "25.00";
                const kandangSekat = d.kandang ? `${d.kandang}${d.sekat ? ' - ' + d.sekat : ''}` : "-";
                return `${d.eartag || d.id};${d.nama || '-'};${kandangSekat};${Number(lastWeight || 0).toFixed(2)};${today};${suggestedNewWeight};Penimbangan berkala;${pet}`;
            }).join("\r\n");
        } else {
            body = `D-001;Si Manis;Kandang A - Sekat 1;25.50;${today};26.20;Nafsu makan bagus;${pet}\r\nD-002;Si Hitam;Kandang A - Sekat 2;30.00;${today};30.80;Kondisi sehat prima;${pet}`;
        }

        const blob = new Blob(["\uFEFF" + note + header + body], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_import_timbang_excel_windows.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        App.showToast("Template CSV Titik-Koma (;) Penimbangan berhasil diunduh!", "success");
    },

    openModalImportTimbang() {
        const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : { nama: "Petugas" };
        const dombaList = Store.getDomba().filter(d => d.status !== 'Mati' && d.status !== 'Terjual');
        this.pendingTimbangImportData = [];

        App.openModal(`
            <div class="p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                            <i data-lucide="scale" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">Import Masal & Update Timbangan Domba</h3>
                            <p class="text-xs text-slate-500">Unggah rekapan hasil timbang massal dari spreadsheet (Excel / CSV)</p>
                        </div>
                    </div>
                    <button type="button" onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <!-- INFO TERNAK AKTIF -->
                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <i data-lucide="info" class="w-4 h-4 text-purple-600"></i>
                        <span class="text-slate-700 dark:text-slate-300 font-medium">Populasi Domba Siap Timbang: <b>${dombaList.length} ekor aktif</b></span>
                    </div>
                    <span class="text-[11px] text-purple-600 dark:text-purple-400 font-bold">Auto Hitung ADG & Bobot Terkini</span>
                </div>

                <!-- PANDUAN PENTING & ANTI-TABRAKAN -->
                <div class="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800 space-y-2 text-xs">
                    <div class="flex items-start gap-2">
                        <div class="p-1 rounded-lg bg-purple-600 text-white font-bold shrink-0 mt-0.5">
                            <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                            <p><b>Fitur Cerdas Anti-Tabrakan & Sinkronisasi ADG:</b></p>
                            <ul class="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                                <li>Jika baris memiliki <b>Eartag</b> dan <b>Tanggal Timbang</b> yang sudah pernah tercatat (tabrakan data), sistem otomatis <b>mengambil data terbaru dari spreadsheet</b> dan memperbarui bobot, catatan, serta petugas.</li>
                                <li>Sistem secara otomatis mengurutkan riwayat kronologis, menghitung ulang <b>ADG (Average Daily Gain)</b>, serta menyinkronkan <b>Bobot Terkini</b> domba di seluruh sistem.</li>
                                <li>Jika kolom <b>Petugas</b> kosong, otomatis diisi dengan nama Anda saat ini: <b class="text-purple-700 dark:text-purple-300">${currentUser.nama || 'Petugas'}</b>.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- DOWNLOAD TEMPLATE BUTTONS -->
                <div class="flex flex-wrap items-center gap-2">
                    <button type="button" onclick="PenimbangCepatModule.downloadTemplateTimbangExcel()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 cursor-pointer">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Unduh Template Excel (.xls)
                    </button>
                    <button type="button" onclick="PenimbangCepatModule.downloadTemplateTimbangCSV()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer">
                        <i data-lucide="file-text" class="w-4 h-4 text-purple-600"></i> Template CSV Titik-Koma (;)
                    </button>
                    <button type="button" onclick="ExportImport.openExportModal('timbang')" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer">
                        <i data-lucide="download" class="w-4 h-4"></i> Ekspor Riwayat Timbang (.xls)
                    </button>
                </div>

                <!-- FILE INPUT AREA -->
                <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/40 text-center space-y-2">
                    <i data-lucide="upload-cloud" class="w-8 h-8 mx-auto text-purple-600"></i>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Pilih File Spreadsheet Timbangan (.csv atau .txt)</div>
                    <p class="text-[11px] text-slate-400">Otomatis mendeteksi pemisah Titik-Koma (;), Koma (,), atau Tab.</p>
                    <input type="file" id="timbang-csv-upload-input" accept=".csv,.txt" onchange="PenimbangCepatModule.previewTimbangCSV(this)" class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer">
                </div>

                <!-- PREVIEW CONTAINER -->
                <div id="timbang-import-preview-area" class="hidden space-y-3 pt-2">
                    <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                            <i data-lucide="check-circle" class="w-4 h-4 text-purple-600"></i>
                            <span id="timbang-preview-count-label">0 Data Siap Diimpor</span>
                            <span id="timbang-preview-delim-label" class="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Pemisah: ;</span>
                        </div>
                        <span class="text-[11px] text-slate-400">Pratinjau Data</span>
                    </div>

                    <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] sticky top-0 z-10">
                                <tr>
                                    <th class="p-2 border-b">Status</th>
                                    <th class="p-2 border-b">Eartag</th>
                                    <th class="p-2 border-b">Nama Domba</th>
                                    <th class="p-2 border-b">Tanggal Timbang</th>
                                    <th class="p-2 border-b text-right">Bobot Baru</th>
                                    <th class="p-2 border-b">Petugas</th>
                                    <th class="p-2 border-b">Catatan</th>
                                </tr>
                            </thead>
                            <tbody id="timbang-preview-tbody" class="divide-y divide-slate-100 dark:divide-slate-800"></tbody>
                        </table>
                    </div>

                    <button type="button" onclick="PenimbangCepatModule.confirmImportTimbangData()" class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                        <i data-lucide="database" class="w-4 h-4"></i> Konfirmasi & Simpan / Update Riwayat Timbang ke Database
                    </button>
                </div>
            </div>
        `);
        if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    },

    parseCSVLine(line, delim) {
        const result = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delim && !inQuotes) {
                result.push(cur.trim());
                cur = "";
            } else {
                cur += char;
            }
        }
        result.push(cur.trim());
        return result;
    },

    previewTimbangCSV(input) {
        if (!input || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            let lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length === 0) {
                App.showToast("File kosong!", "error");
                return;
            }

            if (lines[0].toLowerCase().startsWith("sep=")) {
                lines.shift();
            }

            // Abaikan baris komentar bila diawali #
            lines = lines.filter(l => !l.trim().startsWith("#"));

            if (lines.length <= 1) {
                App.showToast("File hanya memiliki baris header tanpa baris data!", "error");
                return;
            }

            // Deteksi Delimiter
            const headerLine = lines[0];
            const semiCount = (headerLine.match(/;/g) || []).length;
            const commaCount = (headerLine.match(/,/g) || []).length;
            const tabCount = (headerLine.match(/\t/g) || []).length;

            let delim = ";";
            if (tabCount > semiCount && tabCount > commaCount) delim = "\t";
            else if (commaCount > semiCount) delim = ",";

            const parseDateInput = (val) => {
                if (!val) return new Date().toISOString().split("T")[0];
                val = val.trim();
                const dmy = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (dmy) {
                    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
                }
                const ymd = val.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
                if (ymd) {
                    return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
                }
                return val;
            };

            const parseKg = (val) => {
                if (!val) return 0;
                const clean = String(val).replace(',', '.').replace(/[^0-9.]/g, '');
                const num = parseFloat(clean);
                return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
            };

            const allDomba = Store.getDomba ? Store.getDomba() : [];
            const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : { nama: "Petugas" };
            const defaultUser = currentUser.nama || "Petugas";

            const parsedRows = [];
            let updateCandidateCount = 0;
            let newCandidateCount = 0;
            let invalidEartagCount = 0;

            for (let i = 1; i < lines.length; i++) {
                const cols = this.parseCSVLine(lines[i], delim);
                if (cols.length >= 2) {
                    let eartagVal = "";
                    let namaVal = "-";
                    let kandangVal = "-";
                    let bobotLamaVal = 0;
                    let tglVal = new Date().toISOString().split("T")[0];
                    let bobotBaruVal = 0;
                    let catatanVal = "Penimbangan berkala";
                    let petugasVal = defaultUser;

                    // Format 8 Kolom Standar Template:
                    // Eartag; Nama_Domba; Kandang_Sekat; Bobot_Sebelumnya_kg; Tanggal_Timbang; Bobot_Baru_kg; Catatan; Petugas
                    if (cols.length >= 6) {
                        eartagVal = cols[0];
                        namaVal = cols[1] || "-";
                        kandangVal = cols[2] || "-";
                        bobotLamaVal = parseKg(cols[3]);
                        tglVal = parseDateInput(cols[4]);
                        bobotBaruVal = parseKg(cols[5]);
                        catatanVal = cols[6] ? cols[6].trim() : "Penimbangan berkala";
                        petugasVal = cols[7] ? cols[7].trim() : defaultUser;
                    } else if (cols.length === 3) {
                        // Minimal: Eartag; Tanggal; Bobot
                        eartagVal = cols[0];
                        tglVal = parseDateInput(cols[1]);
                        bobotBaruVal = parseKg(cols[2]);
                    } else {
                        eartagVal = cols[0];
                        namaVal = cols[1] || "-";
                        bobotBaruVal = parseKg(cols[2]);
                    }

                    if (!petugasVal) petugasVal = defaultUser;

                    // Cek ketersediaan domba
                    const cleanKey = String(eartagVal).toLowerCase().trim();
                    const targetDomba = allDomba.find(d => 
                        (d.eartag && d.eartag.toLowerCase() === cleanKey) || 
                        (d.id && d.id.toLowerCase() === cleanKey)
                    );

                    let isValidDomba = !!targetDomba;
                    let isCollision = false;

                    if (isValidDomba) {
                        if (targetDomba.nama && namaVal === "-") namaVal = targetDomba.nama;
                        // Cek tabrakan di riwayat timbang dengan tanggal yang sama
                        if (Array.isArray(targetDomba.riwayatTimbang) && targetDomba.riwayatTimbang.some(r => r.tgl === tglVal)) {
                            isCollision = true;
                            updateCandidateCount++;
                        } else {
                            newCandidateCount++;
                        }
                    } else {
                        invalidEartagCount++;
                    }

                    parsedRows.push({
                        eartag: targetDomba ? targetDomba.eartag : eartagVal,
                        dombaId: targetDomba ? targetDomba.id : eartagVal,
                        nama: namaVal,
                        tgl: tglVal,
                        bobot: bobotBaruVal,
                        catatan: catatanVal,
                        petugas: petugasVal,
                        isValidDomba,
                        isUpdate: isCollision
                    });
                }
            }

            if (parsedRows.length === 0) {
                App.showToast("Gagal membaca baris timbangan. Periksa struktur kolom berkas!", "error");
                return;
            }

            this.pendingTimbangImportData = parsedRows;

            // Render Preview
            const previewArea = document.getElementById("timbang-import-preview-area");
            const previewCount = document.getElementById("timbang-preview-count-label");
            const previewDelim = document.getElementById("timbang-preview-delim-label");
            const tbody = document.getElementById("timbang-preview-tbody");

            if (previewArea && previewCount && tbody) {
                previewArea.classList.remove("hidden");
                previewCount.innerHTML = `<span>${parsedRows.length} Baris Terbaca</span> <span class="text-amber-600 dark:text-amber-400 font-bold">(${updateCandidateCount} Update Tabrakan</span> • <span class="text-purple-600 dark:text-purple-400 font-bold">${newCandidateCount} Baru</span>${invalidEartagCount > 0 ? ` • <span class="text-rose-500 font-bold">${invalidEartagCount} Eartag Tak Dikenal</span>` : ''})</span>`;
                previewDelim.textContent = `Pemisah: ${delim === ';' ? 'Titik-Koma (;)' : delim === ',' ? 'Koma (,)' : 'Tab'}`;

                tbody.innerHTML = parsedRows.map(d => `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td class="p-2">
                            ${!d.isValidDomba ? `
                                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 whitespace-nowrap">
                                    ❌ Eartag Tidak Ada
                                </span>
                            ` : d.isUpdate ? `
                                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 whitespace-nowrap">
                                    🔄 Update Terbaru
                                </span>
                            ` : `
                                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 whitespace-nowrap">
                                    ✨ Data Baru
                                </span>
                            `}
                        </td>
                        <td class="p-2 font-mono font-bold text-[11px] text-purple-700 dark:text-purple-400">${d.eartag || '-'}</td>
                        <td class="p-2 font-semibold text-slate-800 dark:text-slate-200">${d.nama}</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400 font-medium">${d.tgl}</td>
                        <td class="p-2 text-right font-black text-sm text-slate-900 dark:text-white">${d.bobot.toFixed(2)} kg</td>
                        <td class="p-2 text-slate-600 dark:text-slate-400 font-medium">${d.petugas}</td>
                        <td class="p-2 text-slate-500 italic max-w-xs truncate">${d.catatan}</td>
                    </tr>
                `).join('');

                if (window.lucide) window.lucide.createIcons();
            }
        };

        reader.readAsText(file);
    },

    confirmImportTimbangData() {
        if (!this.pendingTimbangImportData || this.pendingTimbangImportData.length === 0) {
            App.showToast("Tidak ada data timbangan untuk diimpor!", "error");
            return;
        }

        const validRows = this.pendingTimbangImportData.filter(r => r.isValidDomba && r.bobot > 0);
        if (validRows.length === 0) {
            App.showToast("Tidak ada baris timbangan yang valid untuk diproses!", "error");
            return;
        }

        let addedCount = 0;
        let updatedCount = 0;

        validRows.forEach((row) => {
            const res = Store.upsertRiwayatTimbang(row.eartag, row.tgl, row.bobot, row.catatan, row.petugas);
            if (res && res.action === "update") {
                updatedCount++;
            } else if (res) {
                addedCount++;
            }
        });

        this.pendingTimbangImportData = [];
        App.closeModal();

        let msg = "";
        if (updatedCount > 0 && addedCount > 0) {
            msg = `Sukses import timbangan: ${addedCount} data baru & ${updatedCount} data tabrakan berhasil diperbarui dengan data terbaru!`;
        } else if (updatedCount > 0) {
            msg = `Sukses memperbarui ${updatedCount} catatan timbangan tabrakan dengan data terbaru!`;
        } else {
            msg = `Sukses mengimpor ${addedCount} data penimbangan baru!`;
        }
        App.showToast(msg, "success");
        App.renderContent();
    }
};

window.PenimbangCepatModule = PenimbangCepatModule;
