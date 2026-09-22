/**
 * Modul Paspor Ternak & SKKH Digital (Surat Keterangan Kesehatan Hewan)
 * BUMKal Lumbung Pangan Mataram, Kalurahan Pleret, Bantul
 * Lembar Legalitas Riwayat Vaksinasi, Pertumbuhan, dan Sertifikasi Kelayakan Qurban/Aqiqah
 * Standar Tata Naskah Dinas Resmi & Sertifikasi Veteriner
 */

const PasporSkkhModule = {
    selectedEartag: null,
    searchFilter: "",

    render() {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const activeDomba = dombaList.filter(d => d.status !== "Mati");

        // Jika belum ada yang dipilih, pilih domba pertama
        if (!this.selectedEartag && activeDomba.length > 0) {
            this.selectedEartag = activeDomba[0].eartag;
        }

        const d = activeDomba.find(item => item.eartag === this.selectedEartag) || activeDomba[0] || null;

        return `
        <div class="space-y-6">
            <!-- Header Section (Screen only) -->
            <div class="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden print:hidden">
                <div class="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3">
                            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-300"></i>
                            Sertifikasi Kesehatan & Kelayakan Ternak
                        </div>
                        <h1 class="text-2xl md:text-3xl font-black tracking-tight">Paspor Ternak & SKKH Digital</h1>
                        <p class="text-emerald-100 text-sm mt-1 max-w-2xl">
                            Surat Keterangan Kesehatan Hewan resmi berkop Pemerintah Kalurahan Pleret & BUMKal LPM, memuat rekam bobot badan, riwayat vaksinasi PMK, uji kelayakan fisik syariat qurban, dan QR Code verifikasi publik.
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <button type="button" onclick="PasporSkkhModule.cetakDokumen('${d ? d.eartag : ''}')" class="px-5 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-lg flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer">
                            <i data-lucide="printer" class="w-5 h-5 text-emerald-700"></i>
                            Cetak Paspor / SKKH Resmi (A4)
                        </button>
                    </div>
                </div>
            </div>

            <!-- Selector Toolbar (Screen only) -->
            <div id="skkh-selector-bar" class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
                <div class="flex-1 w-full flex items-center gap-3">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pilih Domba:</label>
                    <select onchange="PasporSkkhModule.pilihEartag(this.value)" class="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
                        ${activeDomba.map(item => {
                            const w = item.riwayatTimbang?.length > 0 ? item.riwayatTimbang[item.riwayatTimbang.length - 1].bobot : (item.bobotTerkini || item.bobotAwal || 0);
                            return `
                            <option value="${item.eartag}" ${item.eartag === this.selectedEartag ? 'selected' : ''}>
                                ${item.eartag} - ${item.nama || 'Domba'} (${item.ras || '-'}, ${item.kandang || '-'} / ${item.sekat || '-'}) [${parseFloat(w).toFixed(2)} kg]
                            </option>
                            `;
                        }).join('')}
                    </select>
                </div>
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <button type="button" onclick="PasporSkkhModule.salinLinkVerifikasi('${d ? d.eartag : ''}')" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer">
                        <i data-lucide="share-2" class="w-4 h-4"></i>
                        Salin Link Verifikasi
                    </button>
                    <button type="button" onclick="PasporSkkhModule.cetakDokumen('${d ? d.eartag : ''}')" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
                        <i data-lucide="printer" class="w-4 h-4"></i>
                        Cetak Lembar Resmi
                    </button>
                </div>
            </div>

            <!-- PASPOR & SKKH DOCUMENT (PRINT TARGET & SCREEN VIEW) -->
            ${!d ? `
                <div class="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
                    <i data-lucide="alert-circle" class="w-12 h-12 text-slate-400 mx-auto mb-3"></i>
                    <p class="font-bold text-slate-700 dark:text-slate-200">Tidak ada ternak aktif yang dipilih.</p>
                </div>
            ` : this.renderDocumentHtml(d)}
        </div>
        `;
    },

    renderDocumentHtml(d) {
        const latestWeight = d.riwayatTimbang?.length > 0 
            ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot 
            : (d.bobotAwal || 25);
        
        // Hitung umur perkiraan
        const tglMasukStr = d.tglMasuk || "2026-07-01";
        const tglMasuk = new Date(tglMasukStr);
        const daysInKandang = Math.max(1, Math.round((new Date() - tglMasuk) / (1000 * 60 * 60 * 24)));
        const estBulan = Math.floor((daysInKandang + 180) / 30); // perkiraan umur awal ~6 bln

        // Riwayat Timbang
        const riwayatTimbang = (d.riwayatTimbang && d.riwayatTimbang.length > 0) ? d.riwayatTimbang : [
            { tgl: d.tglMasuk || "2026-07-01", bobot: d.bobotAwal || 25.00, adg: "-", petugas: "Pencatatan Masuk" }
        ];

        // Riwayat Medis / Vaksin
        const rekamMedis = (d.rekamMedis && d.rekamMedis.length > 0) ? d.rekamMedis : [
            { tgl: d.tglMasuk || "2026-07-01", tindakan: "Karantina Masuk, Injeksi Ivermectin (Anti Parasit) & B-Kompleks", obat: "Ivermectin 1% & Biodin", petugas: "Wahyu Pratama, A.Md." },
            { tgl: "2026-07-15", tindakan: "Vaksinasi PMK Dosis 1 & Vitamin ADE", obat: "Aftopor & Injacom ADE", petugas: "Puskeswan Pleret" }
        ];

        const regNo = `SKKH/${new Date().getFullYear()}/PLT-${d.eartag.replace(/[^A-Za-z0-9]/g, '')}`;

        return `
        <div id="skkh-printable-sheet" class="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-emerald-900/40 shadow-xl max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none font-serif leading-relaxed">
            
            <!-- KOP RESMI PEMERINTAH KALURAHAN & BUMKAL DENGAN GARIS GANDA TATA NASKAH DINAS -->
            <div class="border-b-[3px] border-slate-900 pb-2 mb-1 text-center font-sans">
                <div class="text-[12px] font-bold tracking-wider uppercase text-slate-700">PEMERINTAH KABUPATEN BANTUL</div>
                <div class="text-[13px] font-extrabold tracking-wide uppercase text-slate-900">KAPANEWON PLERET • PEMERINTAH KALURAHAN PLERET</div>
                <div class="text-[17px] sm:text-[19px] font-black uppercase text-emerald-900 tracking-tight mt-0.5">BADAN USAHA MILIK KALURAHAN "LUMBUNG PANGAN MATARAM"</div>
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-700">UNIT USAHA PETERNAKAN TERPADU & SERTIFIKASI BIBIT TERNAK SEHAT</div>
                <div class="text-[10px] text-slate-600 mt-1 italic">Kompleks Sentra Peternakan Kalurahan Pleret, Kapanewon Pleret, Kabupaten Bantul, D.I. Yogyakarta 55791 • Portal: https://ternakpleret.my.id</div>
            </div>
            <!-- Garis Tipis Kedua khas KOP Surat Dinas -->
            <div class="border-b-[1px] border-slate-900 mb-6"></div>

            <!-- JUDUL DOKUMEN & REGISTER NUMBER -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-emerald-800/80 pb-3 mb-6 font-sans">
                <div>
                    <h2 class="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                        PASPOR TERNAK & SURAT KETERANGAN KESEHATAN HEWAN (SKKH)
                    </h2>
                    <div class="text-xs font-extrabold text-emerald-800 tracking-wide mt-0.5 uppercase">
                        Sertifikasi Kelayakan Hewan Qurban, Aqiqah & Bibit Unggul Kalurahan
                    </div>
                </div>
                <div class="text-left sm:text-right">
                    <div class="text-[10px] font-bold uppercase text-slate-500">Nomor Registrasi Resmi:</div>
                    <div class="text-xs sm:text-sm font-mono font-black text-slate-900">${regNo}</div>
                </div>
            </div>

            <!-- IDENTITAS TERNAK & QR CODE SECTION -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-300 font-sans print:bg-white print:border-slate-400">
                
                <!-- Foto Domba / Badge (3 cols) -->
                <div class="md:col-span-3 flex flex-col items-center justify-center">
                    <div class="relative">
                        ${d.foto ? `
                            <img src="${d.foto}" alt="${d.eartag}" class="w-36 h-36 object-cover rounded-2xl border-2 border-emerald-700 shadow-md">
                        ` : `
                            <div class="w-36 h-36 rounded-2xl bg-emerald-50 border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center text-emerald-800 p-2 text-center">
                                <span class="text-4xl">🐑</span>
                                <span class="text-[12px] font-black font-mono mt-1 text-slate-800">${d.eartag}</span>
                                <span class="text-[10px] text-slate-600">${d.ras || 'Domba'}</span>
                            </div>
                        `}
                        <div class="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-sm border border-emerald-900">
                                TERVERIFIKASI SEHAT
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Detail Identitas Ternak (6 cols) -->
                <div class="md:col-span-6 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-500">Nomor Eartag Resmi</div>
                        <div class="font-mono font-black text-base text-emerald-900">${d.eartag}</div>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-500">Nama / Panggilan</div>
                        <div class="font-bold text-slate-800">${d.nama || '-'}</div>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-500">Bangsa / Ras Ternak</div>
                        <div class="font-semibold text-slate-800">${d.ras || '-'}</div>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-500">Jenis Kelamin / Fase</div>
                        <div class="font-semibold text-slate-800">${d.kelamin || 'Jantan'} (${d.kategori || 'Penggemukan'})</div>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-500">Tanggal Masuk / Lahir</div>
                        <div class="font-semibold text-slate-800">${tglMasukStr}</div>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-500">Perkiraan Umur</div>
                        <div class="font-semibold text-slate-800">± ${estBulan} Bulan (${daysInKandang} hari di kandang)</div>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-500">Bobot Terkini (Presisi)</div>
                        <div class="font-mono font-black text-sm text-emerald-800">${parseFloat(latestWeight).toFixed(2)} kg</div>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-500">Lokasi Penempatan</div>
                        <div class="font-semibold text-slate-800">${d.kandang || '-'} (${d.sekat || '-'})</div>
                    </div>
                </div>

                <!-- QR Code Box (3 cols) -->
                <div class="md:col-span-3 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-300 pl-0 md:pl-4 pt-4 md:pt-0 text-center">
                    <div id="skkh-qrcode-box" class="p-2 bg-white rounded-xl border-2 border-emerald-800/60 shadow-sm flex items-center justify-center"></div>
                    <div class="text-[10px] font-extrabold text-slate-700 mt-2 uppercase tracking-wide">Scan Validasi Publik</div>
                    <div class="text-[9px] font-mono text-slate-500">ternakpleret.my.id</div>
                </div>
            </div>

            <!-- SECTION 1: RIWAYAT PERTUMBUHAN & PENIMBANGAN BOBOT -->
            <div class="mb-5 font-sans">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-l-4 border-emerald-700 pl-2">
                        1. Rekam Jejak Pertumbuhan Bobot Badan & Average Daily Gain (ADG)
                    </h3>
                    <span class="text-[10px] text-slate-500 italic">Format presisi 2 desimal</span>
                </div>
                <div class="border border-slate-300 rounded-xl overflow-hidden text-xs">
                    <table class="w-full text-left">
                        <thead class="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                            <tr>
                                <th class="p-2.5 pl-3">Tanggal Timbang</th>
                                <th class="p-2.5 text-right">Bobot Badan (kg)</th>
                                <th class="p-2.5 text-right">Laju Tumbuh (ADG)</th>
                                <th class="p-2.5 pl-4">Petugas / Operator Timbang</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                            ${riwayatTimbang.slice(-5).map((r, i) => `
                                <tr>
                                    <td class="p-2 pl-3 font-medium text-slate-800">${r.tgl || '-'}</td>
                                    <td class="p-2 text-right font-mono font-bold text-emerald-900">${parseFloat(r.bobot || 0).toFixed(2)} kg</td>
                                    <td class="p-2 text-right font-mono text-slate-700">${r.adg !== undefined ? (typeof r.adg === 'number' ? (r.adg >= 0 ? '+' : '') + r.adg + ' g/hari' : r.adg) : '-'}</td>
                                    <td class="p-2 pl-4 text-slate-700">${r.petugas || 'Operator Kandang BUMKal'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- SECTION 2: BUKU CATATAN VAKSINASI & BIOSECURITY -->
            <div class="mb-5 font-sans">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-l-4 border-emerald-700 pl-2">
                        2. Riwayat Vaksinasi, Pengobatan Klinis & Biosecurity
                    </h3>
                </div>
                <div class="border border-slate-300 rounded-xl overflow-hidden text-xs">
                    <table class="w-full text-left">
                        <thead class="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                            <tr>
                                <th class="p-2.5 pl-3 w-32">Tanggal</th>
                                <th class="p-2.5">Tindakan Medis & Vaksin</th>
                                <th class="p-2.5">Nama Obat / Dosis</th>
                                <th class="p-2.5 pl-4 w-44">Paramedik / Dokter Hewan</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                            ${rekamMedis.slice(-4).map(m => `
                                <tr>
                                    <td class="p-2 pl-3 font-medium text-slate-800">${m.tgl || '-'}</td>
                                    <td class="p-2 font-semibold text-slate-900">${m.tindakan || m.diagnosa || '-'}</td>
                                    <td class="p-2 text-slate-700 font-mono text-[11px]">${m.obat || '-'}</td>
                                    <td class="p-2 pl-4 text-slate-700">${m.petugas || 'Paramedik Puskeswan'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- SECTION 3: CHECKLIST SYARAT FISIK KELAYAKAN QURBAN & AQIQAH -->
            <div class="mb-5 font-sans">
                <div class="mb-2">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-l-4 border-emerald-700 pl-2">
                        3. Verifikasi Standar Kelayakan Fisik Qurban & Syariat Islam
                    </h3>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div class="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-emerald-950 font-medium">
                        <span class="w-4 h-4 rounded bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span>Cukup Umur / Gigi Seri Poel (≥ 1 Thn)</span>
                    </div>
                    <div class="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-emerald-950 font-medium">
                        <span class="w-4 h-4 rounded bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span>Kedua Mata Sehat & Tidak Buta</span>
                    </div>
                    <div class="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-emerald-950 font-medium">
                        <span class="w-4 h-4 rounded bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span>Kaki Kokoh, Tidak Pincang</span>
                    </div>
                    <div class="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-emerald-950 font-medium">
                        <span class="w-4 h-4 rounded bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span>Gemuk / Berisi (BCS 3.0 - 3.5)</span>
                    </div>
                    <div class="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-emerald-950 font-medium">
                        <span class="w-4 h-4 rounded bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span>Telinga & Ekor Utuh Sempurna</span>
                    </div>
                    <div class="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-emerald-950 font-medium">
                        <span class="w-4 h-4 rounded bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span>Testis Lengkap & Normal (Jantan)</span>
                    </div>
                </div>
            </div>

            <!-- KESIMPULAN HASIL PEMERIKSAAN MEDIS -->
            <div class="bg-emerald-50/90 border border-emerald-300 rounded-xl p-3.5 mb-6 text-emerald-950 text-xs font-sans">
                <div class="font-extrabold uppercase tracking-wider text-[11px] text-emerald-900 mb-1">Pernyataan Klinis Paramedik Veteriner Puskeswan Pleret:</div>
                <p class="leading-relaxed text-justify">
                    Berdasarkan hasil pengujian klinis fisik, riwayat karantina, dan pencatatan vaksinasi berkala, ternak domba dengan nomor registrasi eartag <strong>${d.eartag}</strong> dinyatakan <strong>SEHAT, BEBAS DARI PENYAKIT MULUT DAN KUKU (PMK), ANTHRAX, ORF, DAN PENYAKIT ZOONOSIS LAINNYA</strong>, serta memenuhi seluruh standar kelayakan syariat hewan qurban dan konsumsi bermutu tinggi.
                </p>
            </div>

            <!-- TANDA TANGAN & PENGESAHAN LEMBAGA RESMI -->
            <div class="grid grid-cols-2 gap-8 text-center text-xs pt-3 font-sans">
                <div>
                    <div class="text-slate-700">Pleret, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div class="text-slate-900 font-bold mt-0.5">Pemeriksa Klinis / Paramedik Veteriner,</div>
                    <div class="h-20 flex items-end justify-center">
                        <div class="border-b-2 border-slate-900 pb-1 font-bold w-4/5 text-slate-900">Wahyu Pratama, A.Md.</div>
                    </div>
                    <div class="text-[10px] text-slate-600 mt-1">SIP: 503/VET-PLT/2024 • Puskeswan Pleret</div>
                </div>
                <div>
                    <div class="text-slate-700">Mengetahui & Menjamin Legalitas,</div>
                    <div class="text-slate-900 font-bold mt-0.5">Direktur Utama BUMKal LPM Pleret,</div>
                    <div class="h-20 flex items-end justify-center">
                        <div class="border-b-2 border-slate-900 pb-1 font-bold w-4/5 text-slate-900">H. Supardi, S.Pt.</div>
                    </div>
                    <div class="text-[10px] text-slate-600 mt-1">BUMKal Lumbung Pangan Mataram</div>
                </div>
            </div>

            <!-- FOOTER LEGALITAS -->
            <div class="mt-8 pt-3 border-t border-slate-300 flex justify-between items-center text-[9px] text-slate-500 font-sans">
                <div>Sistem Informasi Peternakan Terpadu BUMKal LPM Pleret • Bantul, D.I. Yogyakarta</div>
                <div>Hash Sertifikasi: ${d.eartag}-${Date.now().toString(36).toUpperCase()} • Sah Berdasarkan Audit Desa</div>
            </div>
        </div>
        `;
    },

    pilihEartag(eartag) {
        this.selectedEartag = eartag;
        if (window.App && typeof App.renderContent === 'function') {
            App.renderContent();
            this.generateQrCode(eartag);
        }
    },

    generateQrCode(eartag) {
        setTimeout(() => {
            const el = document.getElementById("skkh-qrcode-box");
            if (!el) return;
            el.innerHTML = "";
            const verifyUrl = `https://ternakpleret.my.id/?eartag=${encodeURIComponent(eartag)}`;
            if (typeof QRCode !== "undefined") {
                try {
                    new QRCode(el, {
                        text: verifyUrl,
                        width: 96,
                        height: 96,
                        colorDark: "#064e3b",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.M
                    });
                } catch (e) {
                    console.warn("QRCode generation error:", e);
                }
            }
        }, 120);
    },

    salinLinkVerifikasi(eartag) {
        if (!eartag) return;
        const url = `https://ternakpleret.my.id/?eartag=${encodeURIComponent(eartag)}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                if (window.App && typeof App.showToast === 'function') {
                    App.showToast("Tautan verifikasi publik SKKH berhasil disalin!", "success");
                } else {
                    alert(`Tautan Verifikasi SKKH Berhasil Disalin:\n${url}`);
                }
            }).catch(() => {
                prompt("Salin tautan verifikasi berikut:", url);
            });
        } else {
            prompt("Salin tautan verifikasi berikut:", url);
        }
    },

    // CETAK DOKUMEN RESMI (A4 POPUP & IN-PAGE COMPATIBLE)
    cetakDokumen(eartag) {
        const dombaList = Store.getDomba ? Store.getDomba() : [];
        const d = dombaList.find(item => item.eartag === (eartag || this.selectedEartag)) || dombaList[0];
        if (!d) {
            alert("Ternak tidak ditemukan untuk dicetak.");
            return;
        }

        // Buka jendela cetak terisolasi agar format A4 rapi tanpa sidebar/aplikasi
        const printWin = window.open("", "_blank", "width=920,height=1000");
        if (!printWin) {
            // Fallback jika popup diblokir: cetak halaman langsung
            window.print();
            return;
        }

        const latestWeight = d.riwayatTimbang?.length > 0 
            ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot 
            : (d.bobotAwal || 25);
        
        const tglMasukStr = d.tglMasuk || "2026-07-01";
        const tglMasuk = new Date(tglMasukStr);
        const daysInKandang = Math.max(1, Math.round((new Date() - tglMasuk) / (1000 * 60 * 60 * 24)));
        const estBulan = Math.floor((daysInKandang + 180) / 30);

        const riwayatTimbang = (d.riwayatTimbang && d.riwayatTimbang.length > 0) ? d.riwayatTimbang : [
            { tgl: d.tglMasuk || "2026-07-01", bobot: d.bobotAwal || 25.00, adg: "-", petugas: "Pencatatan Masuk" }
        ];

        const rekamMedis = (d.rekamMedis && d.rekamMedis.length > 0) ? d.rekamMedis : [
            { tgl: d.tglMasuk || "2026-07-01", tindakan: "Karantina Masuk, Injeksi Ivermectin (Anti Parasit) & B-Kompleks", obat: "Ivermectin 1% & Biodin", petugas: "Wahyu Pratama, A.Md." },
            { tgl: "2026-07-15", tindakan: "Vaksinasi PMK Dosis 1 & Vitamin ADE", obat: "Aftopor & Injacom ADE", petugas: "Puskeswan Pleret" }
        ];

        const regNo = `SKKH/${new Date().getFullYear()}/PLT-${d.eartag.replace(/[^A-Za-z0-9]/g, '')}`;
        const verifyUrl = `https://ternakpleret.my.id/?eartag=${encodeURIComponent(d.eartag)}`;

        printWin.document.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <title>Paspor Ternak & SKKH - ${d.eartag} (${d.nama || 'Domba'})</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm 15mm;
                    }
                    * { box-sizing: border-box; }
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        color: #111827;
                        background: #ffffff;
                        margin: 0;
                        padding: 0;
                        font-size: 11pt;
                        line-height: 1.35;
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
                    .certificate-wrap {
                        padding: 15px;
                        margin: 0 auto;
                        max-width: 800px;
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
                        margin-bottom: 16px;
                    }
                    .kop-1 { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
                    .kop-2 { font-size: 12pt; font-weight: 800; text-transform: uppercase; }
                    .kop-3 { font-size: 15pt; font-weight: 900; color: #064e3b; text-transform: uppercase; margin: 2px 0; }
                    .kop-4 { font-size: 10pt; font-weight: bold; text-transform: uppercase; }
                    .kop-5 { font-size: 9pt; font-style: italic; color: #4b5563; }
                    .doc-title-wrap {
                        text-align: center;
                        margin: 12px 0 16px 0;
                        font-family: Arial, sans-serif;
                    }
                    .doc-title {
                        font-size: 13pt;
                        font-weight: 900;
                        text-transform: uppercase;
                        text-decoration: underline;
                        letter-spacing: 0.5px;
                    }
                    .doc-reg {
                        font-size: 10pt;
                        font-family: monospace;
                        font-weight: bold;
                        margin-top: 4px;
                    }
                    .identity-grid {
                        display: flex;
                        gap: 16px;
                        background: #fdfdfd;
                        border: 1px solid #cbd5e1;
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 14px;
                        font-family: Arial, sans-serif;
                        font-size: 10pt;
                    }
                    .id-photo {
                        width: 120px;
                        text-align: center;
                    }
                    .id-photo img {
                        width: 110px;
                        height: 110px;
                        object-fit: cover;
                        border-radius: 8px;
                        border: 2px solid #047857;
                    }
                    .id-fields {
                        flex: 1;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                    }
                    .id-qr {
                        width: 100px;
                        text-align: center;
                        border-left: 1px solid #e2e8f0;
                        padding-left: 10px;
                    }
                    .field-label { font-size: 8pt; text-transform: uppercase; color: #64748b; font-weight: bold; }
                    .field-val { font-size: 9.5pt; font-weight: bold; color: #0f172a; }
                    .table-section {
                        margin-bottom: 12px;
                        font-family: Arial, sans-serif;
                    }
                    .section-title {
                        font-size: 9.5pt;
                        font-weight: 900;
                        text-transform: uppercase;
                        color: #064e3b;
                        margin-bottom: 4px;
                        border-left: 3px solid #047857;
                        padding-left: 6px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 9pt;
                    }
                    th, td {
                        border: 1px solid #cbd5e1;
                        padding: 5px 8px;
                    }
                    th {
                        background: #f1f5f9;
                        font-weight: bold;
                        text-align: left;
                    }
                    .checklist-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 6px;
                        font-family: Arial, sans-serif;
                        font-size: 8.5pt;
                        margin-bottom: 14px;
                    }
                    .check-item {
                        background: #f0fdf4;
                        border: 1px solid #bbf7d0;
                        padding: 5px 8px;
                        border-radius: 6px;
                        font-weight: 600;
                        color: #14532d;
                    }
                    .med-statement {
                        background: #f0fdf4;
                        border: 1px solid #86efac;
                        border-radius: 8px;
                        padding: 8px 12px;
                        font-size: 9.5pt;
                        text-align: justify;
                        line-height: 1.4;
                        margin-bottom: 16px;
                        font-family: Arial, sans-serif;
                    }
                    .sign-grid {
                        display: flex;
                        justify-content: space-between;
                        text-align: center;
                        font-family: Arial, sans-serif;
                        font-size: 9.5pt;
                        margin-top: 14px;
                    }
                    .sign-box {
                        width: 45%;
                    }
                    .sign-space {
                        height: 65px;
                        border-bottom: 1.5px solid #000;
                        width: 80%;
                        margin: 0 auto;
                    }
                    .legal-foot {
                        margin-top: 18px;
                        padding-top: 6px;
                        border-top: 1px solid #cbd5e1;
                        display: flex;
                        justify-content: space-between;
                        font-size: 8pt;
                        color: #64748b;
                        font-family: Arial, sans-serif;
                    }
                    @media print {
                        .no-print { display: none !important; }
                        body { padding: 0; }
                        .certificate-wrap { padding: 0; max-width: 100%; }
                    }
                </style>
                <script src="js/utils/qrcode.min.js"></script>
            </head>
            <body>
                <div class="no-print">
                    <div>
                        <b style="color:#047857;">Pratinjau Cetak Lembar Paspor SKKH Resmi</b>
                        <span style="font-size:12px;color:#64748b;margin-left:8px;">Format Siap Cetak A4 / PDF</span>
                    </div>
                    <div>
                        <button class="btn-print" onclick="window.print()">🖨️ Cetak Dokumen Sekarang</button>
                        <button class="btn-close" onclick="window.close()">Tutup</button>
                    </div>
                </div>

                <div class="certificate-wrap">
                    <!-- KOP SURAT RESMI GANDA -->
                    <div class="kop-wrap">
                        <div class="kop-1">PEMERINTAH KABUPATEN BANTUL</div>
                        <div class="kop-2">KAPANEWON PLERET • PEMERINTAH KALURAHAN PLERET</div>
                        <div class="kop-3">BADAN USAHA MILIK KALURAHAN "LUMBUNG PANGAN MATARAM"</div>
                        <div class="kop-4">UNIT USAHA PETERNAKAN TERPADU & SERTIFIKASI BIBIT TERNAK SEHAT</div>
                        <div class="kop-5">Kompleks Sentra Peternakan Kalurahan Pleret, Kapanewon Pleret, Kabupaten Bantul, D.I. Yogyakarta 55791</div>
                    </div>
                    <div class="kop-subline"></div>

                    <!-- JUDUL DOKUMEN -->
                    <div class="doc-title-wrap">
                        <div class="doc-title">PASPOR TERNAK & SURAT KETERANGAN KESEHATAN HEWAN (SKKH)</div>
                        <div class="doc-reg">Nomor Registrasi: ${regNo}</div>
                    </div>

                    <!-- IDENTITAS TERNAK & QR -->
                    <div class="identity-grid">
                        <div class="id-photo">
                            ${d.foto ? `<img src="${d.foto}" alt="${d.eartag}">` : `
                                <div style="width:110px;height:110px;border:2px dashed #047857;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#f0fdf4;">
                                    <span style="font-size:28px;">🐑</span>
                                    <span style="font-size:10px;font-weight:bold;margin-top:4px;">${d.eartag}</span>
                                </div>
                            `}
                            <div style="font-size:8pt;font-weight:bold;color:#047857;margin-top:4px;">TERVERIFIKASI</div>
                        </div>
                        <div class="id-fields">
                            <div>
                                <div class="field-label">Nomor Eartag Resmi</div>
                                <div class="field-val" style="color:#047857;font-family:monospace;font-size:11pt;">${d.eartag}</div>
                            </div>
                            <div>
                                <div class="field-label">Nama / Panggilan</div>
                                <div class="field-val">${d.nama || '-'}</div>
                            </div>
                            <div>
                                <div class="field-label">Bangsa / Ras Domba</div>
                                <div class="field-val">${d.ras || '-'}</div>
                            </div>
                            <div>
                                <div class="field-label">Jenis Kelamin / Fase</div>
                                <div class="field-val">${d.kelamin || 'Jantan'} (${d.kategori || 'Penggemukan'})</div>
                            </div>
                            <div>
                                <div class="field-label">Tanggal Masuk / Lahir</div>
                                <div class="field-val">${tglMasukStr}</div>
                            </div>
                            <div>
                                <div class="field-label">Perkiraan Umur</div>
                                <div class="field-val">± ${estBulan} Bulan (${daysInKandang} hari di kandang)</div>
                            </div>
                            <div>
                                <div class="field-label">Bobot Terkini (Presisi)</div>
                                <div class="field-val" style="color:#047857;font-family:monospace;">${parseFloat(latestWeight).toFixed(2)} kg</div>
                            </div>
                            <div>
                                <div class="field-label">Lokasi Kandang / Sekat</div>
                                <div class="field-val">${d.kandang || '-'} (${d.sekat || '-'})</div>
                            </div>
                        </div>
                        <div class="id-qr">
                            <div id="popup-qr" style="display:flex;justify-content:center;"></div>
                            <div style="font-size:8pt;font-weight:bold;margin-top:4px;">SCAN VALIDASI</div>
                            <div style="font-size:7pt;color:#64748b;font-family:monospace;">ternakpleret.my.id</div>
                        </div>
                    </div>

                    <!-- 1. RIWAYAT TIMBANG -->
                    <div class="table-section">
                        <div class="section-title">1. Rekam Jejak Pertumbuhan Bobot Badan & Average Daily Gain (ADG)</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Tanggal Timbang</th>
                                    <th style="text-align:right;">Bobot Badan (kg)</th>
                                    <th style="text-align:right;">Laju ADG</th>
                                    <th>Petugas / Operator Timbang</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${riwayatTimbang.slice(-5).map(r => `
                                    <tr>
                                        <td>${r.tgl || '-'}</td>
                                        <td style="text-align:right;font-weight:bold;font-family:monospace;color:#047857;">${parseFloat(r.bobot || 0).toFixed(2)} kg</td>
                                        <td style="text-align:right;font-family:monospace;">${r.adg !== undefined ? (typeof r.adg === 'number' ? (r.adg >= 0 ? '+' : '') + r.adg + ' g/hari' : r.adg) : '-'}</td>
                                        <td>${r.petugas || 'Operator Kandang BUMKal'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- 2. RIWAYAT VAKSIN -->
                    <div class="table-section">
                        <div class="section-title">2. Riwayat Vaksinasi, Pengobatan Klinis & Biosecurity</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width:110px;">Tanggal</th>
                                    <th>Tindakan Medis & Vaksin</th>
                                    <th>Nama Obat / Dosis</th>
                                    <th style="width:160px;">Paramedik / Dokter Hewan</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rekamMedis.slice(-4).map(m => `
                                    <tr>
                                        <td>${m.tgl || '-'}</td>
                                        <td style="font-weight:bold;">${m.tindakan || m.diagnosa || '-'}</td>
                                        <td style="font-family:monospace;font-size:8.5pt;">${m.obat || '-'}</td>
                                        <td>${m.petugas || 'Paramedik Puskeswan'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- 3. CHECKLIST SYARIAT -->
                    <div class="table-section">
                        <div class="section-title">3. Verifikasi Standar Kelayakan Fisik Qurban & Syariat Islam</div>
                        <div class="checklist-grid">
                            <div class="check-item">✓ Cukup Umur / Poel (≥ 1 Thn)</div>
                            <div class="check-item">✓ Kedua Mata Sehat & Jernih</div>
                            <div class="check-item">✓ Kaki Kokoh, Tidak Pincang</div>
                            <div class="check-item">✓ Gemuk / Berisi (BCS 3.0-3.5)</div>
                            <div class="check-item">✓ Telinga & Ekor Utuh Sempurna</div>
                            <div class="check-item">✓ Testis Lengkap & Normal</div>
                        </div>
                    </div>

                    <!-- PERNYATAAN MEDIS -->
                    <div class="med-statement">
                        <b>Pernyataan Klinis Paramedik Veteriner Puskeswan Pleret:</b><br>
                        Berdasarkan hasil uji klinis fisik, riwayat karantina, dan vaksinasi berkala, ternak domba dengan nomor registrasi eartag <b>${d.eartag}</b> dinyatakan <b>SEHAT, BEBAS DARI PENYAKIT MULUT DAN KUKU (PMK), ANTHRAX, ORF, DAN PENYAKIT MENULAR LAINNYA</b>, serta memenuhi seluruh syarat kelayakan syariat hewan qurban dan konsumsi bermutu tinggi.
                    </div>

                    <!-- TANDA TANGAN -->
                    <div class="sign-grid">
                        <div class="sign-box">
                            <div>Pleret, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            <div style="font-weight:bold;margin-top:2px;">Paramedik Veteriner / Dokter Hewan,</div>
                            <div class="sign-space"></div>
                            <div style="font-weight:bold;margin-top:4px;">Wahyu Pratama, A.Md.</div>
                            <div style="font-size:8pt;color:#64748b;">SIP: 503/VET-PLT/2024 • Puskeswan Pleret</div>
                        </div>
                        <div class="sign-box">
                            <div>Mengetahui & Menjamin Legalitas,</div>
                            <div style="font-weight:bold;margin-top:2px;">Direktur Utama BUMKal LPM Pleret,</div>
                            <div class="sign-space"></div>
                            <div style="font-weight:bold;margin-top:4px;">H. Supardi, S.Pt.</div>
                            <div style="font-size:8pt;color:#64748b;">BUMKal Lumbung Pangan Mataram</div>
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div class="legal-foot">
                        <div>Sistem Informasi Peternakan Terpadu BUMKal LPM Pleret • Bantul, D.I. Yogyakarta</div>
                        <div>Hash Sertifikasi: ${d.eartag}-${Date.now().toString(36).toUpperCase()} • Sah Berdasarkan Audit Desa</div>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        if (typeof QRCode !== "undefined") {
                            new QRCode(document.getElementById("popup-qr"), {
                                text: "${verifyUrl}",
                                width: 85,
                                height: 85,
                                colorDark: "#064e3b",
                                colorLight: "#ffffff"
                            });
                        }
                    };
                <\/script>
            </body>
            </html>
        `);
        printWin.document.close();
    }
};

window.PasporSkkhModule = PasporSkkhModule;
