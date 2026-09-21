/**
 * Barcode Generator Utility (Code 128 B)
 * Zero-dependency pure JavaScript vector SVG barcode generator.
 * Produces crisp, scanner-readable Code 128 barcodes for sheep/goat eartags.
 */

const BarcodeUtils = {
    // Code 128 Patterns (0-106)
    // Each pattern has alternating bar and space widths (3 bars, 3 spaces; stop has 4 bars, 3 spaces)
    PATTERNS: [
        "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
        "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
        "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
        "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
        "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
        "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
        "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
        "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
        "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
        "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
        "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (106 is STOP)
    ],

    START_B: 104,
    STOP: 106,

    /**
     * Encode ASCII string to Code 128 B symbol indices
     */
    encodeCode128B(text) {
        const clean = String(text || "").trim();
        if (!clean) return null;

        const codes = [this.START_B];
        let checksum = this.START_B;

        for (let i = 0; i < clean.length; i++) {
            const charCode = clean.charCodeAt(i);
            const val = charCode - 32; // Code 128B ASCII offset
            if (val < 0 || val > 95) continue; // supported ASCII 32 to 127
            codes.push(val);
            checksum += val * (i + 1);
        }

        const checkValue = checksum % 103;
        codes.push(checkValue);
        codes.push(this.STOP);

        return codes;
    },

    /**
     * Generate SVG string for Code 128 Barcode
     * @param {string} text - The content to encode, e.g. "DMB-001"
     * @param {object} options - Sizing and display options
     * @returns {string} SVG XML string
     */
    generateSVG(text, options = {}) {
        const {
            height = 50,
            barWidth = 2,
            quietZone = 10,
            showText = true,
            fontSize = 11,
            color = "#0f172a",
            bgColor = "transparent"
        } = options;

        const codes = this.encodeCode128B(text);
        if (!codes) return "";

        // Calculate modules
        let totalModules = quietZone * 2;
        codes.forEach((codeIdx, i) => {
            const pattern = this.PATTERNS[codeIdx];
            if (!pattern) return;
            for (let j = 0; j < pattern.length; j++) {
                totalModules += parseInt(pattern[j], 10);
            }
        });

        const svgWidth = totalModules * barWidth;
        const totalHeight = showText ? height + fontSize + 4 : height;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${totalHeight}" width="${svgWidth}" height="${totalHeight}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">`;
        if (bgColor !== "transparent") {
            svg += `<rect width="${svgWidth}" height="${totalHeight}" fill="${bgColor}"/>`;
        }

        let currentX = quietZone * barWidth;

        codes.forEach(codeIdx => {
            const pattern = this.PATTERNS[codeIdx];
            if (!pattern) return;
            for (let j = 0; j < pattern.length; j++) {
                const width = parseInt(pattern[j], 10) * barWidth;
                const isBar = j % 2 === 0; // even is bar, odd is space
                if (isBar) {
                    svg += `<rect x="${currentX}" y="0" width="${width}" height="${height}" fill="${color}"/>`;
                }
                currentX += width;
            }
        });

        if (showText) {
            svg += `<text x="${svgWidth / 2}" y="${height + fontSize}" font-family="monospace, 'Courier New', monospace" font-size="${fontSize}" font-weight="bold" fill="${color}" text-anchor="middle" letter-spacing="2">${text}</text>`;
        }

        svg += `</svg>`;
        return svg;
    },

    /**
     * Play standard handheld barcode scanner confirm beep sound
     */
    playScannerBeep() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(1760, ctx.currentTime); // high pitched A6 note
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        } catch (e) {
            // Audio context silently ignored if blocked by browser policy
        }
    }
};

window.BarcodeUtils = BarcodeUtils;
