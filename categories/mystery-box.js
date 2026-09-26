(function () {
    const TARGET = 60;
    const MAX_TRIES_PER_CATEGORY = 8;
    const EXCLUDE_KEYS = { 'mystery-box': true };
    const EXCLUDE_TIERS = { PPTGAMES: true };
    const ALT_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg', 'avif', 'svg', 'gif'];

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    function candidateUrls(rawSrc) {
        if (!rawSrc || typeof rawSrc !== 'string') return [];
        if (rawSrc.indexOf('data:') === 0) return [];
        const noQ = rawSrc.split('?')[0];
        const urls = [noQ];
        const dot = noQ.lastIndexOf('.');
        if (dot < 0) return urls;
        const base = noQ.substring(0, dot);
        const ext = noQ.substring(dot + 1).toLowerCase();
        for (let i = 0; i < ALT_EXTENSIONS.length; i++) {
            if (ALT_EXTENSIONS[i] !== ext) urls.push(base + '.' + ALT_EXTENSIONS[i]);
        }
        return urls;
    }

    function probeUrl(url) {
        return new Promise(function (resolve) {
            const img = new Image();
            let done = false;
            function finish(val) {
                if (done) return;
                done = true;
                img.onload = img.onerror = null;
                resolve(val);
            }
            const timer = setTimeout(function () { finish(null); }, 1500);
            img.onload = function () {
                clearTimeout(timer);
                if (img.naturalWidth >= 2 && img.naturalHeight >= 2) finish(url);
                else finish(null);
            };
            img.onerror = function () {
                clearTimeout(timer);
                finish(null);
            };
            img.src = url;
        });
    }

    function findWorkingUrl(rawSrc) {
        const urls = candidateUrls(rawSrc);
        if (!urls.length) return Promise.resolve(null);
        return new Promise(function (resolve) {
            let pending = urls.length;
            let settled = false;
            urls.forEach(function (url) {
                probeUrl(url).then(function (ok) {
                    if (settled) return;
                    if (ok) {
                        settled = true;
                        resolve(ok);
                    } else {
                        pending--;
                        if (pending === 0) resolve(null);
                    }
                });
            });
        });
    }

    function toItem(src, cat, url) {
        const item = { n: src.n, u: url || src.u };
        if (typeof src.q === 'string') item.q = src.q;
        const extraHint = src.h || src.hint;
        item.h = extraHint ? (cat.label + ' — ' + extraHint) : cat.label;
        return item;
    }

    async function pickWorkingItem(data, cat, usedNames) {
        const order = data.slice();
        shuffle(order);
        const maxTries = Math.min(order.length, MAX_TRIES_PER_CATEGORY);
        for (let i = 0; i < maxTries; i++) {
            const src = order[i];
            if (!src || typeof src.n !== 'string') continue;
            const nameKey = src.n.toUpperCase();
            if (usedNames[nameKey]) continue;

            if (typeof src.q === 'string') {
                usedNames[nameKey] = true;
                return toItem(src, cat, src.u);
            }

            const url = await findWorkingUrl(src.u);
            if (!url) continue;
            usedNames[nameKey] = true;
            return toItem(src, cat, url);
        }
        return null;
    }

    async function buildMysteryBoxData() {
        const registry = window.CATEGORY_REGISTRY || [];
        const eligible = registry.filter(function (c) {
            return c && c.key && !EXCLUDE_KEYS[c.key] && !EXCLUDE_TIERS[c.tier];
        });
        shuffle(eligible);

        const usedNames = {};
        const picked = [];

        for (let i = 0; i < eligible.length && picked.length < TARGET; i++) {
            const cat = eligible[i];
            const data = window[cat.global];
            if (!Array.isArray(data) || data.length === 0) continue;
            const item = await pickWorkingItem(data, cat, usedNames);
            if (item) picked.push(item);
        }

        return picked;
    }

    if (typeof window !== 'undefined') {
        window.buildMysteryBoxData = buildMysteryBoxData;
        window.mysteryBoxData = [];
    }
})();
