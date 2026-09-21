/**
 * Main Application Orchestrator & Router
 */

const App = {
    currentView: "public", // "public" | "admin"
    currentRoute: "dashboard",

    init() {
        // Inisialisasi Database
        Store.init();

        // Inisialisasi Tema
        this.initTheme();

        // Cek Sesi Tersimpan
        const savedSession = localStorage.getItem("kandang_auth_session");
        const savedView = localStorage.getItem("kandang_current_view");
        const savedRoute = localStorage.getItem("kandang_current_route");
        if (savedSession) {
            try {
                const u = JSON.parse(savedSession);
                Store.setCurrentUser(u);
            } catch (e) {}

            // Jika user login aktif, pertahankan di admin view (kecuali user sengaja buka public view)
            if (savedView === "admin" || !savedView) {
                this.currentView = "admin";
            } else {
                this.currentView = savedView;
            }
            if (savedRoute) {
                this.currentRoute = savedRoute;
            }
        }

        // Inisialisasi Firebase Cloud Sync Otomatis Dua Arah
        try {
            Store.initFirebaseSync();
            this.updateCloudHeaderBadge();
            // Langsung tarik database dari cloud pada inisialisasi agar perangkat baru (misal: HP) langsung tersinkron
            Store.pullFromFirebase().then(res => {
                if (res && res.success) {
                    console.log("[Cloud] Auto-pull database dari Firebase berhasil pada perangkat ini.");
                    if (window.App) {
                        if (window.App.currentView === "admin" && typeof window.App.renderContent === "function") {
                            window.App.renderContent();
                        } else if (window.App.currentView === "public" && window.PortalPublikModule) {
                            window.PortalPublikModule.render();
                        }
                    }
                }
            }).catch(err => console.warn("[Cloud] Auto-pull notice:", err))
              .finally(() => {
                  Store._isReadyForAutoPush = true;
              });
        } catch (e) {
            console.warn("Cloud sync init notice:", e);
            Store._isReadyForAutoPush = true;
        }

        // Setup Heartbeat & Background Listeners untuk Auto-Sync Antar Perangkat
        this.initAutoSyncListeners();

        // Tampilkan Tampilan Awal (Default Muka Publik untuk Umum)
        this.switchView(this.currentView, true);

        // Listeners
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") this.closeModal();
        });
    },

    initAutoSyncListeners() {
        // 1. Polling ringan (checkCloudUpdate) tiap 10 detik saat halaman aktif
        setInterval(() => {
            if (document.visibilityState === "visible" && Store.checkCloudUpdate) {
                Store.checkCloudUpdate();
            }
        }, 10000);

        // 2. Ketika user membuka kembali tab browser / membuka HP dari sleep
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible" && Store.checkCloudUpdate) {
                Store.checkCloudUpdate();
            }
        });

        window.addEventListener("focus", () => {
            if (Store.checkCloudUpdate) {
                Store.checkCloudUpdate();
            }
        });

        // 3. Ketika koneksi internet pulih
        window.addEventListener("online", () => {
            if (Store.pullFromFirebase) {
                Store.pullFromFirebase().then(() => {
                    if (this.currentView === "admin" && typeof this.renderContent === "function") {
                        this.renderContent();
                    } else if (this.currentView === "public" && window.PortalPublikModule) {
                        window.PortalPublikModule.render();
                    }
                });
            }
        });

        // 4. Pastikan data terkirim saat menutup tab / berpindah
        window.addEventListener("beforeunload", () => {
            if (Store._autoSyncTimer) {
                clearTimeout(Store._autoSyncTimer);
                const cfg = Store.getFirebaseConfig();
                if (cfg.databaseURL) {
                    const restUrl = `${cfg.databaseURL.replace(/\/$/, '')}/${cfg.collectionName || 'lumbung_ternak_pleret'}.json`;
                    const payload = Store.exportAll();
                    try {
                        fetch(restUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                            keepalive: true
                        });
                    } catch(e) {}
                }
            }
        });
    },

    switchView(view, rerender = true) {
        this.currentView = view;
        try {
            localStorage.setItem("kandang_current_view", view);
        } catch(e) {}
        const sidebar = document.getElementById("main-sidebar");
        const bodyWrapper = document.getElementById("main-body-wrapper");
        const publicHeader = document.getElementById("public-header");
        const adminHeader = document.getElementById("admin-header");

        if (view === "public") {
            if (sidebar) sidebar.classList.add("hidden");
            if (bodyWrapper) bodyWrapper.classList.remove("md:pl-64");
            if (publicHeader) publicHeader.classList.remove("hidden");
            if (adminHeader) {
                adminHeader.classList.add("hidden");
                adminHeader.classList.remove("flex");
            }
            if (window.PortalPublikModule && PortalPublikModule.updatePublicHeader) {
                PortalPublikModule.updatePublicHeader();
            }
        } else {
            if (sidebar) sidebar.classList.remove("hidden");
            if (bodyWrapper) bodyWrapper.classList.add("md:pl-64");
            if (publicHeader) publicHeader.classList.add("hidden");
            if (adminHeader) {
                adminHeader.classList.remove("hidden");
                adminHeader.classList.add("flex");
            }
            this.renderHeaderUser();
            this.updateSidebarVisibility();
        }

        if (rerender) {
            if (view === "public") {
                this.renderContent();
            } else {
                this.navigate(this.currentRoute || "dashboard");
            }
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    openLoginModal() {
        this.setModalContent(`
            <div class="p-6 space-y-5">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">LT</div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">Portal Petugas & Pengurus</h3>
                            <p class="text-xs text-emerald-600 dark:text-emerald-400">BUMKal Lumbung Pangan Mataram Pleret</p>
                        </div>
                    </div>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <!-- Form Login Pengurus Resmi (Non-Demo) -->
                <form onsubmit="App.handleLoginForm(event)" class="space-y-3.5 text-xs">
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">NIK / Username Petugas</label>
                        <input type="text" id="login-nik" value="" placeholder="Masukkan NIK atau Username terdaftar" required autocomplete="username" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kata Sandi / PIN</label>
                        <input type="password" id="login-pass" value="" placeholder="Masukkan kata sandi atau PIN" required autocomplete="current-password" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    </div>
                    <button type="submit" id="login-submit-btn" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2">
                        <i data-lucide="log-in" class="w-4 h-4"></i> Masuk ke Dashboard Pengurus
                    </button>
                    <div class="text-center pt-1">
                        <button type="button" onclick="App.syncFromLoginModal()" class="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold inline-flex items-center gap-1">
                            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Tarik / Sinkronkan Akun dari Cloud Firebase
                        </button>
                    </div>
                </form>

                <!-- Footer Informasi Keamanan Sistem Resmi -->
                <div class="pt-3 border-t border-slate-200 dark:border-slate-700 text-center space-y-1">
                    <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                        <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i> Sistem Terautentikasi Resmi BUMKal LPM
                    </div>
                    <p class="text-[10px] text-slate-400">Gunakan NIK terdaftar dan kata sandi pengurus Anda untuk mengakses sistem.</p>
                </div>
            </div>
        `);
        this.openModal();
    },

    async syncFromLoginModal() {
        this.showToast("Menghubungkan & menarik data dari Cloud Firebase...", "info");
        try {
            const res = await Store.pullFromFirebase();
            if (res && res.success) {
                this.showToast("Database & akun staf berhasil disinkronkan dari Cloud! Silakan login.", "success");
            } else {
                this.showToast(res?.message || "Belum ada cadangan di cloud atau koneksi terputus.", "warning");
            }
        } catch (err) {
            this.showToast("Gagal sinkronisasi: " + err.message, "error");
        }
    },

    async syncFromPublicHeader() {
        this.showToast("Menghubungkan ke Google Firebase Cloud...", "info");
        try {
            const res = await Store.pullFromFirebase();
            if (res && res.success) {
                if (this.currentView === "public" && window.PortalPublikModule) {
                    window.PortalPublikModule.render();
                } else if (this.currentView === "admin" && typeof this.renderContent === "function") {
                    this.renderContent();
                }
                this.updateCloudHeaderBadge();
                this.showToast("Data ternak & akun berhasil disinkronkan dari Cloud!", "success");
            } else {
                this.showToast(res?.message || "Belum ada cadangan cloud atau gagal terhubung.", "warning");
            }
        } catch (e) {
            this.showToast("Gagal sinkronisasi: " + e.message, "error");
        }
    },

    async handleLoginForm(e) {
        e.preventDefault();
        let sdmList = Store.getSDM();
        const nikInput = document.getElementById("login-nik");
        const passInput = document.getElementById("login-pass");
        const submitBtn = document.getElementById("login-submit-btn");
        const nik = nikInput ? nikInput.value.trim() : "";
        const pass = passInput ? passInput.value.trim() : "";

        if (!nik) {
            this.showToast("Silakan masukkan NIK / Username petugas!", "warning");
            if (nikInput) nikInput.focus();
            return;
        }

        let found = sdmList.find(s => s.nik === nik || (s.nama && s.nama.toLowerCase() === nik.toLowerCase()) || s.id === nik);

        // Jika akun belum ditemukan di lokal (misal perangkat baru/HP), otomatis coba tarik dari Cloud Firebase
        if (!found && Store.pullFromFirebase) {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="inline-block animate-spin mr-2">⏳</span> Memeriksa Akun di Cloud...`;
            }
            try {
                const syncRes = await Store.pullFromFirebase();
                if (syncRes && syncRes.success) {
                    sdmList = Store.getSDM();
                    found = sdmList.find(s => s.nik === nik || (s.nama && s.nama.toLowerCase() === nik.toLowerCase()) || s.id === nik);
                }
            } catch(err) {
                console.warn("Auto sync check error:", err);
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i data-lucide="log-in" class="w-4 h-4"></i> Masuk ke Dashboard Pengurus`;
                if (window.lucide) window.lucide.createIcons();
            }
        }

        if (!found) {
            this.showToast("Pengguna dengan NIK / Username tersebut tidak ditemukan!", "error");
            return;
        }
        if (found.password && found.password !== pass) {
            this.showToast("Kata sandi / PIN yang Anda masukkan salah!", "error");
            if (passInput) passInput.focus();
            return;
        }
        this.login(found.id);
    },

    login(userId) {
        const sdmList = Store.getSDM();
        const user = sdmList.find(s => s.id === userId) || sdmList[0];
        Store.setCurrentUser(user);
        try {
            localStorage.setItem("kandang_auth_session", JSON.stringify(user));
            localStorage.setItem("kandang_current_view", "admin");
            localStorage.setItem("kandang_current_route", this.currentRoute || "dashboard");
        } catch(e) {}
        this.closeModal();

        // Pastikan route saat login diizinkan untuk role user ini
        const role = user.role || "direksi";
        if (this.currentRoute && Store.isRoleAllowed && !Store.isRoleAllowed(role, this.currentRoute)) {
            const allRoutes = [
                "dashboard", "scan_penimbang_cepat", "kanban", "siklus_batch", "siklus_breeding",
                "master_kandang", "data_ternak", "history_timbang", "cetak_stiker_qr", "import_csv",
                "input_pakan_harian", "scan_vaksin_medis", "stok_pakan_hpp", "rekam_medis",
                "pertanian", "limbah_organik", "limbah", "buku_kas_bumdes", "skema_kemitraan",
                "laporan_rapat_evaluasi", "executive_dss_pades", "laporan", "penjualan_ternak",
                "gaji_operasional", "master_pengaturan", "bumdes_backup_purge",
                "firebase_sync", "master_preset_vaksin", "manajemen_user"
            ];
            this.currentRoute = allRoutes.find(r => Store.isRoleAllowed(role, r)) || "dashboard";
        }

        this.switchView("admin");
        this.updateSidebarVisibility();
        this.showToast(`Selamat datang, ${user.nama} (${user.jabatan})!`, "success");
    },

    logout() {
        try {
            localStorage.removeItem("kandang_auth_session");
            localStorage.setItem("kandang_current_view", "public");
            localStorage.setItem("kandang_current_route", "dashboard");
        } catch(e) {}
        this.switchView("public");
        this.showToast("Anda telah keluar dari portal pengurus.", "info");
    },

    // Filter Menu Sidebar Berdasarkan Hak Akses Role
    updateSidebarVisibility() {
        const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : null;
        const role = currentUser?.role || "direksi";

        // 1. Tampilkan hanya tombol menu yang diizinkan untuk role ini
        const navItems = document.querySelectorAll(".sidebar-nav-item");
        navItems.forEach(item => {
            const route = item.dataset.route;
            if (!route) return;

            const isAllowed = Store.isRoleAllowed ? Store.isRoleAllowed(role, route) : true;
            if (isAllowed) {
                item.classList.remove("hidden");
                item.style.display = "";
            } else {
                item.classList.add("hidden");
                item.style.display = "none";
            }
        });

        // 2. Tampilkan atau sembunyikan judul grup seksi menu jika seluruh menu di dalamnya disembunyikan
        const headers = document.querySelectorAll(".sidebar-section-header");
        headers.forEach(header => {
            let next = header.nextElementSibling;
            let hasVisibleItem = false;
            while (next && !next.classList.contains("sidebar-section-header")) {
                if (next.classList.contains("sidebar-nav-item") && !next.classList.contains("hidden") && next.style.display !== "none") {
                    hasVisibleItem = true;
                    break;
                }
                next = next.nextElementSibling;
            }
            if (hasVisibleItem) {
                header.classList.remove("hidden");
                header.style.display = "";
            } else {
                header.classList.add("hidden");
                header.style.display = "none";
            }
        });

        // 3. Tombol cepat cadangan database di footer sidebar
        const footerBackupBtn = document.querySelector("#main-sidebar button[data-route='bumdes_backup_purge']");
        if (footerBackupBtn) {
            const isBackupAllowed = Store.isRoleAllowed ? Store.isRoleAllowed(role, "bumdes_backup_purge") : true;
            if (isBackupAllowed) {
                footerBackupBtn.classList.remove("hidden");
                footerBackupBtn.style.display = "";
            } else {
                footerBackupBtn.classList.add("hidden");
                footerBackupBtn.style.display = "none";
            }
        }
    },

    navigate(route) {
        if (this.currentView !== "admin") {
            this.switchView("admin", false);
        }

        // Pengecekan Batasan Hak Akses Role
        const currentUser = Store.getCurrentUser ? Store.getCurrentUser() : null;
        const role = currentUser?.role || "direksi";
        if (Store.isRoleAllowed && !Store.isRoleAllowed(role, route)) {
            const roleLabels = {
                pemerintah: "Pemerintah Kalurahan",
                direksi: "Direksi BUMKal",
                anak_kandang: "Anak Kandang"
            };
            const roleName = roleLabels[role] || role;
            this.showToast(`Akses Dibatasi: Role '${roleName}' tidak memiliki wewenang untuk membuka menu ini.`, "warning");
            
            const allRoutes = [
                "dashboard", "scan_penimbang_cepat", "kanban", "siklus_batch", "siklus_breeding",
                "master_kandang", "data_ternak", "history_timbang", "cetak_stiker_qr", "import_csv",
                "input_pakan_harian", "scan_vaksin_medis", "stok_pakan_hpp", "rekam_medis",
                "pertanian", "limbah_organik", "limbah", "buku_kas_bumdes", "skema_kemitraan",
                "laporan_rapat_evaluasi", "executive_dss_pades", "laporan", "penjualan_ternak",
                "gaji_operasional", "master_pengaturan", "bumdes_backup_purge",
                "firebase_sync", "master_preset_vaksin", "manajemen_user"
            ];
            if (this.currentRoute && Store.isRoleAllowed(role, this.currentRoute)) {
                return;
            }
            route = allRoutes.find(r => Store.isRoleAllowed(role, r)) || "dashboard";
        }

        this.currentRoute = route;
        try {
            localStorage.setItem("kandang_current_route", route);
            localStorage.setItem("kandang_current_view", "admin");
        } catch(e) {}

        // Auto close drawer on mobile if opened
        const sidebar = document.getElementById("main-sidebar");
        if (sidebar && window.innerWidth < 768) {
            sidebar.classList.add("-translate-x-full");
        }

        // Perbarui visibilitas menu sidebar sesuai role pengguna
        this.updateSidebarVisibility();

        // Update active class pada sidebar
        document.querySelectorAll(".sidebar-nav-item").forEach(el => {
            if (el.dataset.route === route) {
                el.classList.add("bg-emerald-600", "text-white", "shadow-md");
                el.classList.remove("text-slate-600", "dark:text-slate-400", "hover:bg-slate-100", "dark:hover:bg-slate-800");
            } else {
                el.classList.remove("bg-emerald-600", "text-white", "shadow-md");
                el.classList.add("text-slate-600", "dark:text-slate-400", "hover:bg-slate-100", "dark:hover:bg-slate-800");
            }
        });

        // Render Konten Modul
        this.renderContent();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    renderContent() {
        const container = document.getElementById("main-content-area");
        if (!container) return;

        // Jika dalam mode publik, langsung render portal publik
        if (this.currentView === "public") {
            container.innerHTML = PortalPublikModule.render();
            this.afterRender();
            return;
        }

        let html = "";
        try {
            switch (this.currentRoute) {
                // PUSAT LAPORAN LENGKAP TERPADU
                case "laporan":
                    html = LaporanModule.render();
                    break;

                // 1. NAVIGASI UTAMA
                case "dashboard":
                    html = DashboardModule.render();
                    break;
                case "scan_penimbang_cepat":
                    html = PenimbangCepatModule.render();
                    break;
                case "kanban":
                    html = KanbanModule.render();
                    break;

                // 2. PENGGEMUKAN & BREEDING
                case "siklus_batch":
                    html = PenggemukanModule.render("siklus_batch");
                    break;
                case "siklus_breeding":
                    html = BreedingModule.render();
                    break;
                case "master_kandang":
                    html = PenggemukanModule.render("master_kandang");
                    break;
                case "data_ternak":
                    html = PenggemukanModule.render("data_ternak");
                    break;
                case "history_timbang":
                    html = PenggemukanModule.render("history_timbang");
                    break;
                case "cetak_stiker_qr":
                    html = PenggemukanModule.render("cetak_stiker_qr");
                    break;
                case "import_csv":
                    html = PenggemukanModule.render("import_csv");
                    break;

                // 3. PAKAN, LIMBAH & PERTANIAN
                case "input_pakan_harian":
                    html = PakanKesehatanModule.render("input_pakan_harian");
                    break;
                case "scan_vaksin_medis":
                    html = PakanKesehatanModule.render("scan_vaksin_medis");
                    break;
                case "stok_pakan_hpp":
                    html = PakanKesehatanModule.render("stok_pakan_hpp");
                    break;
                case "rekam_medis":
                    html = PakanKesehatanModule.render("rekam_medis");
                    break;
                case "pertanian":
                    html = PertanianModule.render();
                    break;
                case "limbah_organik":
                case "limbah":
                    html = PakanKesehatanModule.render("limbah_organik");
                    break;

                // 4. KEUANGAN BUMDES & KEMITRAAN
                case "buku_kas_bumdes":
                    html = KeuanganBumdesModule.render("buku_kas_bumdes");
                    break;
                case "skema_kemitraan":
                    html = KeuanganBumdesModule.render("skema_kemitraan");
                    break;
                case "laporan_rapat_evaluasi":
                    html = KeuanganBumdesModule.render("laporan_rapat_evaluasi");
                    break;
                case "executive_dss_pades":
                    html = KeuanganBumdesModule.render("executive_dss_pades");
                    break;
                case "penjualan_ternak":
                    html = KeuanganBumdesModule.render("penjualan_ternak");
                    break;
                case "gaji_operasional":
                    html = KeuanganBumdesModule.render("gaji_operasional");
                    break;

                // 5. PENGATURAN
                case "master_pengaturan":
                    html = PengaturanModule.render("master_pengaturan");
                    break;
                case "bumdes_backup_purge":
                    html = PengaturanModule.render("bumdes_backup_purge");
                    break;
                case "firebase_sync":
                    html = PengaturanModule.render("firebase_sync");
                    break;
                case "master_preset_vaksin":
                    html = PengaturanModule.render("master_preset_vaksin");
                    break;
                case "manajemen_user":
                    html = PengaturanModule.render("manajemen_user");
                    break;

                // LEGACY / EXTRA COMPATIBILITY ROUTES
                case "domba":
                    html = DombaModule.render();
                    break;
                case "sdm_agenda":
                    html = SdmAgendaModule.render();
                    break;
                case "keuangan":
                    html = KeuanganModule.render();
                    break;

                default:
                    html = DashboardModule.render();
            }
        } catch (err) {
            console.error("Critical error rendering route [" + this.currentRoute + "]:", err);
            html = `
                <div class="p-8 max-w-xl mx-auto my-12 bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-xl text-center space-y-4">
                    <div class="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                        <i data-lucide="alert-triangle" class="w-7 h-7"></i>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">Gagal Membuka Menu</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Terjadi penyesuaian data pada modul <b>${this.currentRoute}</b>: ${err.message || err}
                    </p>
                    <div class="flex items-center justify-center gap-3 pt-2">
                        <button onclick="App.navigate('dashboard')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition">
                            Kembali ke Dashboard
                        </button>
                        <button onclick="window.location.reload()" class="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition">
                            Muat Ulang Halaman
                        </button>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        this.afterRender();
    },

    afterRender() {
        if (this.currentRoute === "cetak_stiker_qr" && window.PenggemukanModule) {
            setTimeout(() => PenggemukanModule.renderQRCodes(), 80);
        }

        // Perbarui badge notifikasi stok menipis
        this.updateStockAlertBadge();

        // Render ulang Lucide Icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    },

    // Cloud Sync Badge Status Helper
    updateCloudHeaderBadge() {
        const dot = document.getElementById("header-cloud-dot");
        const text = document.getElementById("header-cloud-text");
        if (!dot || !text) return;
        const cfg = Store.getFirebaseConfig();
        if (cfg.status === "connected") {
            dot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
            text.innerText = cfg.autoSync ? "Cloud: Realtime" : "Cloud: Terhubung";
        } else if (cfg.status === "syncing") {
            dot.className = "w-2 h-2 rounded-full bg-amber-500 animate-ping";
            text.innerText = "Cloud: Sinkron...";
        } else if (cfg.status === "error") {
            dot.className = "w-2 h-2 rounded-full bg-rose-500";
            text.innerText = "Cloud: Gangguan";
        } else {
            dot.className = "w-2 h-2 rounded-full bg-slate-400";
            text.innerText = "Cloud: Offline";
        }
    },

    // User & Role Switcher
    renderHeaderUser() {
        const user = Store.getCurrentUser();
        const nameEl = document.getElementById("header-user-name");
        const roleEl = document.getElementById("header-user-role");
        const avatarEl = document.getElementById("header-user-avatar");

        if (nameEl) nameEl.innerText = user.nama || "Petugas";
        if (roleEl) roleEl.innerText = user.jabatan ? user.jabatan.split('(')[0] : "Staf";
        if (avatarEl) {
            if (user.foto) {
                avatarEl.innerHTML = `<img src="${user.foto}" class="w-full h-full object-cover rounded-lg" alt="${user.nama || ''}">`;
            } else if (user.nama) {
                avatarEl.innerText = user.nama.split(' ').map(n => n[0]).slice(0, 2).join('');
            }
        }
    },

    openUserSwitcher() {
        // Dinonaktifkan untuk deploy produksi — pengguna harus logout dan login ulang dengan akun lain
        this.showToast("Pergantian akun telah dinonaktifkan. Silakan logout terlebih dahulu, lalu login dengan kredensial akun yang sesuai.", "info");
    },

    // Modal Manager
    openModal(modalType = null) {
        if (typeof modalType === "string" && modalType.trim().startsWith("<")) {
            this.setModalContent(modalType);
        } else if (modalType === "modal-timbang") {
            const dombaList = Store.getDomba().filter(d => d.status !== "Mati" && d.status !== "Terjual");
            this.setModalContent(`
                <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="scale" class="w-5 h-5 text-blue-600"></i> Penimbangan Bobot Cepat
                        </h3>
                        <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>

                    <form onsubmit="App.submitQuickTimbang(event)" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Ternak Domba *</label>
                            <select id="qt-domba" required class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold">
                                ${dombaList.map(d => {
                                    const latest = d.riwayatTimbang?.length > 0 ? d.riwayatTimbang[d.riwayatTimbang.length - 1].bobot : d.bobotAwal;
                                    return `<option value="${d.id}">${d.eartag} - ${d.nama} (Terakhir: ${latest} kg)</option>`;
                                }).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Penimbangan *</label>
                            <input type="date" id="qt-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hasil Timbangan Terkini (kg) *</label>
                            <input type="number" step="0.1" id="qt-bobot" required placeholder="Contoh: 45.2" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-lg font-black text-emerald-600">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
                            <input type="text" id="qt-catatan" placeholder="Kondisi pakan atau fisik" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>

                        <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                            <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                            <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">Simpan & Perbarui ADG</button>
                        </div>
                    </form>
                </div>
            `);
        } else if (modalType === "modal-kohe") {
            this.setModalContent(`
                <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="recycle" class="w-5 h-5 text-amber-600"></i> Catat Input Limbah Kotoran Harian
                        </h3>
                        <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>

                    <form onsubmit="App.submitQuickKohe(event)" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pembersihan Kandang *</label>
                            <input type="date" id="qk-tgl" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Feses Padat (kg) *</label>
                                <input type="number" step="0.5" id="qk-feses" required placeholder="Contoh: 92.5" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-amber-700">
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Urin Terkumpul (Liter) *</label>
                                <input type="number" step="0.5" id="qk-urin" required placeholder="Contoh: 50.0" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-purple-700">
                            </div>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Kebersihan</label>
                            <input type="text" id="qk-catatan" value="Pembersihan pagi rutin, disalurkan ke bak kompos & drum penampungan" class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                        </div>

                        <div class="pt-3 flex justify-end gap-2 border-t dark:border-slate-700">
                            <button type="button" onclick="App.closeModal()" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600">Batal</button>
                            <button type="submit" class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md">Simpan Input Kohe</button>
                        </div>
                    </form>
                </div>
            `);
        } else if (modalType === "modal-backup") {
            this.setModalContent(`
                <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="database" class="w-5 h-5 text-emerald-600"></i> Cadangan & Pemulihan Database
                        </h3>
                        <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>

                    <div class="space-y-4 text-xs">
                        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2">
                            <h4 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <i data-lucide="download" class="w-4 h-4 text-emerald-600"></i> Ekspor Cadangan (Backup JSON)
                            </h4>
                            <p class="text-slate-500">Unduh seluruh data domba, lahan, pupuk, tugas, SDM, dan keuangan ke satu file aman.</p>
                            <button onclick="ExportImport.exportJSON()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
                                Unduh File Cadangan (.json)
                            </button>
                        </div>

                        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2">
                            <h4 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <i data-lucide="upload" class="w-4 h-4 text-blue-600"></i> Pulihkan Database (Restore JSON)
                            </h4>
                            <p class="text-slate-500">Pilih file cadangan JSON yang telah diekspor sebelumnya untuk mengembalikan kondisi data.</p>
                            <input type="file" id="import-json-file" accept=".json" onchange="ExportImport.importJSON(this)" class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                        </div>

                        <div class="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                            <h4 class="font-bold text-rose-800 dark:text-rose-300">Reset ke Data Pabrik (Factory Reset)</h4>
                            <p class="text-rose-600/80 text-[11px]">Mengembalikan seluruh database ke kondisi awal (seed data default Lumbung Ternak Pleret).</p>
                            <button onclick="App.resetFactory()" class="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold text-xs">
                                Reset Semua Data
                            </button>
                        </div>
                    </div>
                </div>
            `);
        }

        const modalOverlay = document.getElementById("global-modal-overlay");
        if (modalOverlay) {
            modalOverlay.classList.remove("hidden");
            modalOverlay.classList.add("flex");
            if (window.lucide) window.lucide.createIcons();
        }
    },

    closeModal() {
        const modalOverlay = document.getElementById("global-modal-overlay");
        if (modalOverlay) {
            modalOverlay.classList.add("hidden");
            modalOverlay.classList.remove("flex");
        }
    },

    setModalContent(html) {
        const container = document.getElementById("global-modal-container");
        if (container) {
            container.innerHTML = html;
        }
    },

    submitQuickTimbang(e) {
        e.preventDefault();
        const dombaId = document.getElementById("qt-domba").value;
        const tgl = document.getElementById("qt-tgl").value;
        const bobot = parseFloat(document.getElementById("qt-bobot").value);
        const catatan = document.getElementById("qt-catatan").value.trim();

        Store.addRiwayatTimbang(dombaId, tgl, bobot, catatan);
        this.closeModal();
        this.showToast("Timbangan berhasil dicatat!", "success");
        this.renderContent();
    },

    submitQuickKohe(e) {
        e.preventDefault();
        const tgl = document.getElementById("qk-tgl").value;
        const fesesPadatKg = parseFloat(document.getElementById("qk-feses").value);
        const urinLiter = parseFloat(document.getElementById("qk-urin").value);
        const catatan = document.getElementById("qk-catatan").value.trim();
        const petugas = Store.getCurrentUser().nama || "Wahyu Pratama";

        Store.addKoheHarian({ tgl, fesesPadatKg, urinLiter, petugas, catatan });
        this.closeModal();
        this.showToast("Input harian limbah kotoran disimpan!", "success");
        this.renderContent();
    },

    resetFactory() {
        if (confirm("PERINGATAN RESET PABRIK BERSIH:\n\nSemua data transaksi, ternak domba, log pakan, limbah, dan keuangan akan DIKOSONGKAN (menjadi 0).\n\nAkun user login Anda tetap utuh dan aman.\n\nApakah Anda yakin ingin melanjutkan?")) {
            Store.resetToCleanZero();
            this.closeModal();
            this.showToast("Database berhasil direset bersih (0 data)! Akun user tetap aman.", "success");
            setTimeout(() => {
                this.navigate('dashboard');
                this.renderContent();
            }, 600);
        }
    },

    updateStockAlertBadge() {
        const alerts = Store.getLowStockAlerts ? Store.getLowStockAlerts() : [];
        const badge = document.getElementById("header-stock-alert-badge");
        const count = document.getElementById("header-stock-alert-count");
        const list = document.getElementById("header-stock-alert-list");

        if (badge) {
            if (alerts.length > 0) {
                badge.innerText = alerts.length;
                badge.classList.remove("hidden");
            } else {
                badge.classList.add("hidden");
            }
        }

        if (count) {
            count.innerText = `${alerts.length} Kritis`;
        }

        if (list) {
            if (alerts.length === 0) {
                list.innerHTML = `
                    <div class="p-4 text-center text-slate-400 text-xs">
                        <i data-lucide="check-circle" class="w-6 h-6 mx-auto text-emerald-500 mb-1"></i>
                        <p class="font-semibold text-slate-700 dark:text-slate-300">Stok Pakan & Obat Aman</p>
                        <p class="text-[11px] text-slate-400 mt-0.5">Seluruh komoditas berada di atas batas minimum (ROP).</p>
                    </div>
                `;
            } else {
                list.innerHTML = alerts.map(a => `
                    <div class="p-2.5 rounded-xl border ${a.urgensi === 'danger' ? 'border-rose-200 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/30' : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30'} flex items-center justify-between gap-2">
                        <div>
                            <div class="font-bold text-slate-900 dark:text-white leading-tight">${a.nama}</div>
                            <div class="text-[11px] text-slate-500">Sisa: <b class="${a.urgensi === 'danger' ? 'text-rose-600' : 'text-amber-600'}">${a.stokTerkini} ${a.satuan}</b> (Min: ${a.batasMinimum} ${a.satuan})</div>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-black ${a.urgensi === 'danger' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}">
                            ${a.status}
                        </span>
                    </div>
                `).join('');
            }
            if (window.lucide) lucide.createIcons();
        }
    },

    toggleStockAlertDropdown() {
        const dd = document.getElementById("header-stock-alert-dropdown");
        if (dd) {
            dd.classList.toggle("hidden");
            this.updateStockAlertBadge();
        }
    },

    // Theme Switcher
    initTheme() {
        const theme = Store.getTheme();
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    },

    toggleTheme() {
        const isDark = document.documentElement.classList.contains("dark");
        if (isDark) {
            document.documentElement.classList.remove("dark");
            Store.setTheme("light");
        } else {
            document.documentElement.classList.add("dark");
            Store.setTheme("dark");
        }
        this.showToast(`Beralih ke tema ${isDark ? 'Terang (Light)' : 'Gelap (Dark)'}`, "info");
    },

    // Toast Notification
    showToast(message, type = "info") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const colors = {
            success: "bg-emerald-600 text-white border-emerald-500",
            error: "bg-rose-600 text-white border-rose-500",
            info: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700"
        };

        const toast = document.createElement("div");
        toast.className = `px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold border flex items-center gap-2 transform transition duration-300 translate-y-2 opacity-0 ${colors[type] || colors.info}`;
        toast.innerHTML = `
            <span>${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove("translate-y-2", "opacity-0");
        }, 10);

        setTimeout(() => {
            toast.classList.add("translate-y-2", "opacity-0");
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    },

    // PWA Install Prompt
    deferredInstallPrompt: null,

    showPwaInstallButtons() {
        const btns = document.querySelectorAll('#pwa-install-btn-header, #pwa-install-btn-sidebar');
        btns.forEach(btn => {
            if (btn) {
                btn.classList.remove('hidden');
                btn.style.display = '';
            }
        });
    },

    openPwaInstallGuide() {
        // Try native prompt first (Chrome/Edge on Android/Desktop)
        if (this.deferredInstallPrompt) {
            this.deferredInstallPrompt.prompt();
            this.deferredInstallPrompt.userChoice.then(result => {
                if (result.outcome === 'accepted') {
                    this.showToast("Aplikasi berhasil dipasang di perangkat Anda! 🎉", "success");
                }
                this.deferredInstallPrompt = null;
            });
            return;
        }

        // Fallback: Show manual install guide modal
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        this.setModalContent(`
            <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 flex items-center justify-center font-bold">
                            <i data-lucide="smartphone" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">📲 Pasang Aplikasi di HP</h3>
                            <p class="text-xs text-slate-500">Akses langsung dari layar utama tanpa membuka browser</p>
                        </div>
                    </div>
                    <button onclick="App.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <div class="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-violet-200 dark:border-violet-800 space-y-3 text-xs">
                    <div class="font-bold text-violet-900 dark:text-violet-200 text-sm flex items-center gap-2">
                        <i data-lucide="info" class="w-4 h-4"></i> Keunggulan Aplikasi Terpasang:
                    </div>
                    <ul class="space-y-1 text-slate-700 dark:text-slate-300">
                        <li>✅ Akses 1 klik dari layar utama HP tanpa buka browser</li>
                        <li>✅ Tampilan layar penuh seperti aplikasi native</li>
                        <li>✅ Dapat digunakan offline (data tersimpan lokal)</li>
                        <li>✅ Tidak memerlukan Play Store / App Store</li>
                        <li>✅ Ukuran sangat ringan, tidak membebani penyimpanan</li>
                    </ul>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <!-- Android Guide -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2.5">
                        <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            🤖 HP Android (Chrome / Edge):
                        </div>
                        <ol class="space-y-1.5 text-slate-700 dark:text-slate-300 list-decimal list-inside text-[11px] leading-relaxed">
                            <li>Buka aplikasi di browser <b>Chrome</b> atau <b>Edge</b>.</li>
                            <li>Ketuk tombol titik tiga <b>⋮</b> di pojok kanan atas.</li>
                            <li>Pilih menu <b>"Instal aplikasi"</b> atau <b>"Tambahkan ke Layar utama"</b>.</li>
                            <li>Tekan <b>"Instal"</b> pada dialog konfirmasi.</li>
                            <li>Ikon 🐑 <b>Kandang BUMKal</b> siap digunakan di HP.</li>
                        </ol>
                    </div>

                    <!-- iOS Safari Guide -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2.5">
                        <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                            🍎 iPhone / iPad (Safari):
                        </div>
                        <ol class="space-y-1.5 text-slate-700 dark:text-slate-300 list-decimal list-inside text-[11px] leading-relaxed">
                            <li>Buka aplikasi di browser <b>Safari</b>.</li>
                            <li>Ketuk tombol <b>📤 Bagikan (Share)</b> di bar bawah.</li>
                            <li>Scroll & pilih <b>"Tambahkan ke Layar Utama" (Add to Home Screen)</b>.</li>
                            <li>Beri nama lalu ketuk <b>"Tambah"</b> di pojok kanan atas.</li>
                            <li>Ikon 🐑 <b>Kandang BUMKal</b> langsung muncul di layar iPhone.</li>
                        </ol>
                    </div>
                </div>

                <div class="pt-2 flex justify-end">
                    <button onclick="App.closeModal()" class="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition">
                        Tutup Panduan
                    </button>
                </div>
            </div>
        `);
        this.openModal();
    }
};

// PWA: Capture beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    App.deferredInstallPrompt = e;
    App.showPwaInstallButtons();
});

// PWA: Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('[PWA] Service Worker registered:', reg.scope);
            })
            .catch(err => {
                console.warn('[PWA] Service Worker registration failed:', err);
            });
    });
}

// PWA: Show install buttons on all platforms (for manual guide)
window.addEventListener('DOMContentLoaded', () => {
    App.init();
    // Always show install buttons so users can access the guide
    setTimeout(() => {
        App.showPwaInstallButtons();
    }, 2000);
});
