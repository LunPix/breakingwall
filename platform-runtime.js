/* BreakingWall publication bootstrap; generated from assets/scripts/platform. */
(function(){"use strict";var modules={"platform/Adapters":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADAPTERS = exports.VKAdapter = exports.YandexAdapter = exports.CrazyGamesAdapter = exports.StandaloneAdapter = void 0;
const Browser_1 = require("./Browser");
const Cloud_1 = require("./Cloud");
class StandaloneAdapter {
    constructor() {
        this.id = 'standalone';
        this.locale = typeof navigator === 'undefined' ? 'en' : navigator.language;
        this.rewarded = false;
        this.cloud = null;
        this.storageScope = 'guest';
    }
    async init(_hooks) { }
    ready() { }
    gameplay(_active) { }
    showRewarded(c) { c.failed('unavailable'); }
    dispose() { }
}
exports.StandaloneAdapter = StandaloneAdapter;
class CrazyGamesAdapter extends StandaloneAdapter {
    constructor(config) {
        super();
        this.config = config;
        this.id = 'crazygames';
    }
    async init(h) {
        var _a, _b, _c, _d;
        if (!((_a = window.CrazyGames) === null || _a === void 0 ? void 0 : _a.SDK))
            await (0, Browser_1.loadScript)('https://sdk.crazygames.com/crazygames-sdk-v3.js', this.config.sdkTimeoutMs);
        this.sdk = window.CrazyGames.SDK;
        await this.sdk.init();
        if (this.sdk.environment === 'disabled')
            throw Error('crazygames_disabled');
        this.sdk.game.loadingStart();
        this.listener = (s) => h.mute(!!s.muteAudio);
        this.listener(this.sdk.game.settings || {});
        this.sdk.game.addSettingsChangeListener(this.listener);
        this.locale = ((_c = (_b = this.sdk.user) === null || _b === void 0 ? void 0 : _b.systemInfo) === null || _c === void 0 ? void 0 : _c.locale) || navigator.language;
        this.rewarded = this.config.crazygames.launch === 'full' && !!((_d = this.sdk.ad) === null || _d === void 0 ? void 0 : _d.requestAd);
        this.cloud = new Cloud_1.CrazyGamesStorage(this.sdk.data);
    }
    ready() { var _a; (_a = this.sdk) === null || _a === void 0 ? void 0 : _a.game.loadingStop(); }
    gameplay(on) { if (this.sdk)
        (0, Browser_1.safeCall)(() => on ? this.sdk.game.gameplayStart() : this.sdk.game.gameplayStop()); }
    reportCompletion(percentage) { var _a, _b, _c; (_c = (_a = this.sdk) === null || _a === void 0 ? void 0 : (_b = _a.game).reportGameCompletedPercentage) === null || _c === void 0 ? void 0 : _c.call(_b, percentage); }
    happytime() { var _a, _b, _c; (_c = (_a = this.sdk) === null || _a === void 0 ? void 0 : (_b = _a.game).happytime) === null || _c === void 0 ? void 0 : _c.call(_b); }
    showRewarded(c) { this.sdk.ad.requestAd('rewarded', { adStarted: () => c.started(), adFinished: () => { c.rewarded(); c.closed(); }, adError: (e) => c.failed(String((e === null || e === void 0 ? void 0 : e.code) || 'ad_error')) }); }
    dispose() { if (this.listener)
        (0, Browser_1.safeCall)(() => this.sdk.game.removeSettingsChangeListener(this.listener)); }
}
exports.CrazyGamesAdapter = CrazyGamesAdapter;
class YandexAdapter extends StandaloneAdapter {
    constructor(config) {
        super();
        this.config = config;
        this.id = 'yandex';
    }
    async init(h) {
        var _a, _b, _c, _d;
        if (!window.YaGames)
            await (0, Browser_1.loadScript)(this.config.yandex.sdkUrl, this.config.sdkTimeoutMs);
        this.sdk = await window.YaGames.init();
        this.locale = ((_b = (_a = this.sdk.environment) === null || _a === void 0 ? void 0 : _a.i18n) === null || _b === void 0 ? void 0 : _b.lang) || 'en';
        this.rewarded = !!((_c = this.sdk.adv) === null || _c === void 0 ? void 0 : _c.showRewardedVideo);
        this.pause = () => h.pause('sdk', true);
        this.resume = () => h.pause('sdk', false);
        this.sdk.on('game_api_pause', this.pause);
        this.sdk.on('game_api_resume', this.resume);
        try {
            const p = await (0, Browser_1.deadline)(this.sdk.getPlayer(), 4000, 'player_timeout');
            this.storageScope = ((_d = p.getUniqueID) === null || _d === void 0 ? void 0 : _d.call(p)) || 'guest';
            this.cloud = new Cloud_1.YandexStorage(p);
        }
        catch ( /* Anonymous/offline play remains available. */_e) { /* Anonymous/offline play remains available. */ }
    }
    ready() { var _a, _b, _c; (_c = (_b = (_a = this.sdk) === null || _a === void 0 ? void 0 : _a.features) === null || _b === void 0 ? void 0 : _b.LoadingAPI) === null || _c === void 0 ? void 0 : _c.ready(); }
    gameplay(on) { if (this.sdk)
        (0, Browser_1.safeCall)(() => { var _a, _b; return on ? (_a = this.sdk.features.GameplayAPI) === null || _a === void 0 ? void 0 : _a.start() : (_b = this.sdk.features.GameplayAPI) === null || _b === void 0 ? void 0 : _b.stop(); }); }
    showRewarded(c) { this.sdk.adv.showRewardedVideo({ callbacks: { onOpen: () => c.started(), onRewarded: () => c.rewarded(), onClose: () => c.closed(), onError: () => c.failed('ad_error') } }); }
    dispose() { if (this.sdk) {
        (0, Browser_1.safeCall)(() => this.sdk.off('game_api_pause', this.pause));
        (0, Browser_1.safeCall)(() => this.sdk.off('game_api_resume', this.resume));
    } }
}
exports.YandexAdapter = YandexAdapter;
class VKAdapter extends StandaloneAdapter {
    constructor(id) { super(); this.id = id; }
    async supports(method) { try {
        return !!await (0, Browser_1.deadline)(this.bridge.supportsAsync(method), 3000, 'supports_timeout');
    }
    catch (_a) {
        return false;
    } }
    async init(h) {
        if (!window.vkBridge)
            await (0, Browser_1.loadScript)('platform/vendor/vk-bridge-2.15.9.min.js');
        this.bridge = window.vkBridge;
        this.listener = (event) => { var _a; const type = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.type; if (type === 'VKWebAppViewHide')
            h.pause('sdk', true); if (type === 'VKWebAppViewRestore')
            h.pause('sdk', false); };
        this.bridge.subscribe(this.listener);
        await this.bridge.send('VKWebAppInit');
        const q = new URLSearchParams(location.search);
        this.locale = q.get('vk_language') || navigator.language;
        this.storageScope = q.get('vk_user_id') || 'guest';
        this.rewarded = await this.supports('VKWebAppShowNativeAds') && await this.supports('VKWebAppCheckNativeAds');
        if (this.rewarded) {
            try {
                const a = await (0, Browser_1.deadline)(this.bridge.send('VKWebAppCheckNativeAds', { ad_format: 'reward' }), 4000, 'ads_check_timeout');
                this.rewarded = !!a.result;
            }
            catch (_a) {
                this.rewarded = false;
            }
        }
        if (await this.supports('VKWebAppStorageGet') && await this.supports('VKWebAppStorageSet'))
            this.cloud = new Cloud_1.BridgeCloud(this.bridge, this.id);
    }
    showRewarded(c) { void this.bridge.send('VKWebAppCheckNativeAds', { ad_format: 'reward' }).then((a) => { if (!a.result) {
        c.failed('no_fill');
        return;
    } c.started(); return this.bridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' }).then((r) => { if (r.result) {
        c.rewarded();
        c.closed();
    }
    else
        c.failed('not_completed'); }); }).catch(() => c.failed('ad_error')); }
    dispose() { if (this.listener)
        (0, Browser_1.safeCall)(() => this.bridge.unsubscribe(this.listener)); }
}
exports.VKAdapter = VKAdapter;
/** Register another adapter here; gameplay and the editable Cocos UI never depend on an SDK. */
exports.ADAPTERS = { standalone: () => new StandaloneAdapter(), crazygames: c => new CrazyGamesAdapter(c), yandex: c => new YandexAdapter(c), vk: () => new VKAdapter('vk'), ok: () => new VKAdapter('ok') };

},
"platform/Analytics":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analytics = void 0;
const Browser_1 = require("./Browser");
class Analytics {
    constructor(config, platform) {
        this.config = config;
        this.platform = platform;
        this.providers = [];
        this.journal = [];
        this.pending = [];
        this.active = false;
        this.disposed = false;
        this.status = 'not_configured';
        this.onceKeys = new Set();
        this.lang = 'en';
        this.room = 1;
        this.tool = 0;
        this.coins = 0;
        this.economyTimer = 0;
        this.sdkApi = null;
        this.cancelReady = null;
        this.initializing = false;
        try {
            if (config.analytics.consent !== 'denied') {
                const saved = localStorage.getItem('bw.analyticsConsent.v1');
                if (saved === 'granted' || saved === 'denied')
                    config.analytics.consent = saved;
            }
        }
        catch (_a) { }
    }
    get needsConsent() { const a = this.config.analytics; return a.enabled && !!a.gameKey && !!a.secretKey && a.consent === 'required' && !(a.respectDoNotTrack && navigator.doNotTrack === '1'); }
    async setConsent(on) {
        var _a, _b, _c;
        const a = this.config.analytics;
        a.consent = on ? 'granted' : 'denied';
        try {
            localStorage.setItem('bw.analyticsConsent.v1', a.consent);
        }
        catch (_d) { }
        if (!on) {
            this.pending = [];
            (_a = this.cancelReady) === null || _a === void 0 ? void 0 : _a.call(this);
            (_b = this.sdkApi) === null || _b === void 0 ? void 0 : _b.setEnabledEventSubmission(false);
            this.status = 'consent_denied';
            return;
        }
        if (a.respectDoNotTrack && (navigator.doNotTrack === '1' || window.doNotTrack === '1')) {
            this.status = 'do_not_track';
            return;
        }
        (_c = this.sdkApi) === null || _c === void 0 ? void 0 : _c.setEnabledEventSubmission(true);
        if (this.active)
            this.status = 'active';
        else
            await this.init();
    }
    setContext(room, tool, lang) { this.room = room; this.tool = tool; this.lang = lang; }
    async init() {
        if (this.disposed || this.initializing || this.active)
            return;
        const a = this.config.analytics;
        if (!a.enabled) {
            this.status = 'disabled';
            return;
        }
        if (!a.gameKey || !a.secretKey) {
            this.status = 'not_configured';
            return;
        }
        if (a.respectDoNotTrack && (navigator.doNotTrack === '1' || window.doNotTrack === '1')) {
            this.status = 'do_not_track';
            return;
        }
        if (a.consent !== 'granted') {
            this.status = 'consent_' + a.consent;
            return;
        }
        this.initializing = true;
        this.status = 'sdk_initializing';
        try {
            await (0, Browser_1.loadScript)('platform/vendor/GameAnalytics-5.0.0.min.js');
            if (this.disposed || a.consent !== 'granted')
                return;
            const ga = window.gameanalytics, api = ga.GameAnalytics;
            if (!this.sdkApi) {
                this.sdkApi = api;
                api.configureBuild(this.config.build);
                api.configureAvailableCustomDimensions01(['standalone', 'crazygames', 'yandex', 'vk', 'ok']);
                api.configureAvailableCustomDimensions02(['en', 'ru']);
                api.configureAvailableResourceCurrencies(['Coins']);
                api.configureAvailableResourceItemTypes(['gameplay', 'tool', 'upgrade', 'dynamite', 'capture', 'reward']);
                api.setCustomDimension01(this.platform);
                api.setCustomDimension02(this.lang);
                api.initialize(a.gameKey, a.secretKey);
            }
            // SDK 5.0.0 queues initialize(), but rejects events until its async session handshake finishes.
            // Keep the bounded startup queue until this pinned SDK reports a usable session; never block gameplay.
            if (!await this.waitForSession(api))
                return;
            this.addProvider({ name: 'GameAnalytics', event: (name, params, value) => {
                    api.setCustomDimension02(this.lang);
                    const detail = typeof params.placement === 'string' ? params.placement : typeof params.item === 'string' ? params.item : 'all', fields = {};
                    // The pinned SDK rejects booleans and treats numeric zero as null in custom fields.
                    for (const key of Object.keys(params)) {
                        const v = params[key];
                        fields[key] = typeof v === 'boolean' || v === 0 ? String(v) : v;
                    }
                    api.addDesignEvent(`bw:${name}:${this.platform}:${detail}`, value, fields);
                }, progress: (status, room, score) => api.addProgressionEvent(ga.EGAProgressionStatus[status], 'escape', 'room_' + ('000' + room).slice(-3), undefined, score), resource: (flow, amount, type, item) => api.addResourceEvent(ga.EGAResourceFlowType[flow], 'Coins', amount, type, item), dispose: () => api.onStop() });
            this.status = 'active';
        }
        catch (_a) {
            this.status = 'sdk_unavailable';
        }
        finally {
            this.initializing = false;
        }
    }
    waitForSession(api) {
        return new Promise(resolve => {
            let timer, done = false;
            const started = Date.now();
            const finish = (ready) => { if (done)
                return; done = true; clearTimeout(timer); this.cancelReady = null; resolve(ready); };
            const check = () => {
                if (this.disposed || this.config.analytics.consent !== 'granted') {
                    finish(false);
                    return;
                }
                if (api.isSdkReady(true, false)) {
                    finish(true);
                    return;
                }
                const slow = Date.now() - started >= this.config.sdkTimeoutMs;
                if (slow)
                    this.status = 'sdk_waiting';
                timer = setTimeout(check, slow ? 1000 : 100);
            };
            this.cancelReady = () => finish(false);
            check();
        });
    }
    addProvider(p) { this.providers.push(p); this.active = true; const pending = this.pending; this.pending = []; for (const fn of pending)
        fn(); }
    send(fn) { if (this.disposed || this.config.analytics.consent === 'denied')
        return; const run = () => { for (const p of this.providers)
        try {
            fn(p);
        }
        catch (_a) { } }; if (this.active)
        run();
    else if (this.pending.length < 128)
        this.pending.push(run); }
    event(name, params = {}, value) {
        const safe = { build: this.config.build, platform: this.platform, language: this.lang, room: this.room, tool: this.tool };
        for (const key of Object.keys(params))
            if (/^(placement|item|amount|level|reason|hits|broken|seconds|resumed|rewarded)$/.test(key))
                safe[key] = params[key];
        this.journal.push({ name, params: safe, value, at: Date.now() });
        if (this.journal.length > 256)
            this.journal.shift();
        this.send(p => p.event(name, safe, value));
    }
    once(key, name, params = {}) { if (this.onceKeys.has(key))
        return; this.onceKeys.add(key); this.event(name, params); }
    progress(status, room, score) { this.send(p => p.progress(status, room, score)); this.event('room_' + status.toLowerCase(), { hits: score || 0 }); }
    resource(flow, amount, type, item) { if (!Number.isFinite(amount) || amount <= 0)
        return; this.send(p => p.resource(flow, amount, type, item)); }
    coin(amount) { this.coins += amount; }
    tick(dt) { this.economyTimer += dt; if (this.economyTimer >= 30) {
        this.economyTimer = 0;
        this.flushCoins();
    } }
    flushCoins() { if (this.coins) {
        this.resource('Source', this.coins, 'gameplay', 'pickup');
        this.coins = 0;
    } }
    snapshot() { return { status: this.status, providers: this.providers.map(p => p.name), events: this.journal.map(e => (Object.assign(Object.assign({}, e), { params: Object.assign({}, e.params) }))) }; }
    dispose() { var _a, _b; this.flushCoins(); this.disposed = true; (_a = this.cancelReady) === null || _a === void 0 ? void 0 : _a.call(this); for (const p of this.providers)
        try {
            p.dispose();
        }
        catch (_c) { } (_b = this.sdkApi) === null || _b === void 0 ? void 0 : _b.setEnabledEventSubmission(false); this.providers = []; this.pending = []; }
}
exports.Analytics = Analytics;

},
"platform/Browser":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localHost = localHost;
exports.detectPlatform = detectPlatform;
exports.deadline = deadline;
exports.loadScript = loadScript;
exports.safeCall = safeCall;
function localHost(host) { return /^(localhost$|\[::1\]$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host); }
function onDomain(host, domain) { return host === domain || host.slice(-domain.length - 1) === '.' + domain; }
/** Launch parameters are a routing hint, never an authentication or payment proof. */
function detectPlatform(w = window) {
    var _a;
    const q = new URLSearchParams(w.location.search);
    const origins = [w.location.origin];
    try {
        if (w.top !== w.self && w.document.referrer)
            origins.push(new URL(w.document.referrer).origin);
    }
    catch (_b) { }
    try {
        for (let i = 0; i < w.location.ancestorOrigins.length; i++)
            origins.push(w.location.ancestorOrigins[i]);
    }
    catch (_c) { }
    const hosts = origins.map(v => { try {
        return new URL(v).hostname.toLowerCase();
    }
    catch (_a) {
        return '';
    } });
    if (q.get('vk_client') === 'ok' || hosts.some(h => onDomain(h, 'ok.ru')))
        return 'ok';
    if (w.vkBridge || q.has('vk_app_id') || q.has('vk_platform') || hosts.some(h => onDomain(h, 'vk.com') || onDomain(h, 'vk.ru')))
        return 'vk';
    // Use public portal origins or an available SDK. Uploads must not contain service-storage hostnames.
    if (w.YaGames || hosts.some(h => onDomain(h, 'games.yandex.ru') || onDomain(h, 'games.yandex.com') || onDomain(h, 'yandex.ru') || onDomain(h, 'yandex.com')))
        return 'yandex';
    if (((_a = w.CrazyGames) === null || _a === void 0 ? void 0 : _a.SDK) || hosts.some(h => onDomain(h, 'crazygames.com') || onDomain(h, 'crazygames.fr') || onDomain(h, 'crazygames.de') || onDomain(h, '1001juegos.com') || onDomain(h, 'crazygamesfiles.com')))
        return 'crazygames';
    return 'standalone';
}
function deadline(job, ms, label) { return new Promise((resolve, reject) => { const timer = setTimeout(() => reject(Error(label)), ms); job.then(v => { clearTimeout(timer); resolve(v); }, e => { clearTimeout(timer); reject(e); }); }); }
const scripts = {};
function loadScript(src, ms = 8000) {
    const existing = scripts[src];
    if (existing)
        return existing;
    return scripts[src] = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        let done = false;
        const finish = (error) => { if (done)
            return; done = true; clearTimeout(timer); s.onload = s.onerror = null; if (error) {
            s.remove();
            delete scripts[src];
            reject(error);
        }
        else
            resolve(); };
        const timer = setTimeout(() => finish(Error('script_timeout')), ms);
        s.src = src;
        s.async = true;
        s.onload = () => finish();
        s.onerror = () => finish(Error('script_unavailable'));
        document.head.appendChild(s);
    });
}
function safeCall(fn) { try {
    fn();
}
catch (_a) { } }

},
"platform/Cloud":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeCloud = exports.YandexStorage = exports.CrazyGamesStorage = exports.SAVE_KEYS = exports.SAVE_KEY = void 0;
exports.checksum = checksum;
exports.stringifySave = stringifySave;
exports.parseSave = parseSave;
exports.packCloud = packCloud;
exports.unpackCloud = unpackCloud;
const Browser_1 = require("./Browser");
exports.SAVE_KEY = 'bw_escape_v4';
exports.SAVE_KEYS = { standalone: 'bw_standalone_escape_v4', crazygames: 'bw_crazygames_escape_v4', yandex: 'bw_yandex_escape_v4', vk: 'bw_vk_escape_v4', ok: 'bw_ok_escape_v4' };
class CrazyGamesStorage {
    constructor(data) {
        this.data = data;
        this.name = 'CrazyGames Data SDK';
        this.storageKey = exports.SAVE_KEYS.crazygames;
    }
    async read() { return this.data.getItem(this.storageKey) || this.data.getItem(exports.SAVE_KEY) || null; }
    async write(value) { if (value.length > 180000)
        throw Error('cloud_quota'); this.data.setItem(this.storageKey, value); }
}
exports.CrazyGamesStorage = CrazyGamesStorage;
class YandexStorage {
    constructor(player) {
        this.player = player;
        this.name = 'Yandex Player Data';
        this.storageKey = exports.SAVE_KEYS.yandex;
    }
    async read() { const data = await this.player.getData([this.storageKey, exports.SAVE_KEY]); return data[this.storageKey] || data[exports.SAVE_KEY] || null; }
    async write(value) { if (value.length > 180000)
        throw Error('cloud_quota'); await this.player.setData({ [this.storageKey]: value }, true); }
}
exports.YandexStorage = YandexStorage;
function checksum(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
} return (h >>> 0).toString(16); }
/** JSON alone turns Float32Array into an object without length/every, making a wall impossible to restore. */
function stringifySave(value) { return JSON.stringify(value, (_key, v) => Object.prototype.toString.call(v) === '[object Float32Array]' ? { $bwFloat32: Array.from(v) } : v); }
function parseSave(raw) { return JSON.parse(raw, (_key, v) => { if (v && typeof v === 'object' && Object.prototype.hasOwnProperty.call(v, '$bwFloat32')) {
    const values = v.$bwFloat32;
    if (!Array.isArray(values) || values.length > 100000 || !values.every(Number.isFinite))
        throw Error('invalid_wall_buffer');
    return new Float32Array(values);
} return v; }); }
/** Compression preserves Unicode and the existing archive of wall simulations within SDK quotas. */
async function packCloud(value) { await (0, Browser_1.loadScript)('platform/vendor/lz-string.min.js'); return 'lz1:' + window.LZString.compressToBase64(stringifySave(value)); }
async function unpackCloud(value) { if (value.slice(0, 4) !== 'lz1:')
    throw Error('save_format'); await (0, Browser_1.loadScript)('platform/vendor/lz-string.min.js'); const raw = window.LZString.decompressFromBase64(value.slice(4)); if (!raw || raw.length > 6000000)
    throw Error('save_corrupt'); return parseSave(raw); }
/** Two banks and a manifest committed last: an interrupted upload cannot corrupt the previous save. */
class BridgeCloud {
    constructor(bridge, id = 'vk') {
        this.bridge = bridge;
        this.bank = 0;
        this.storageKey = exports.SAVE_KEYS[id];
        this.name = id === 'ok' ? 'OK Bridge Storage' : 'VK Bridge Storage';
    }
    async get(keys) { const r = await (0, Browser_1.deadline)(this.bridge.send('VKWebAppStorageGet', { keys }), 6000, 'cloud_read_timeout'); const out = {}; for (const v of r.keys || [])
        out[v.key] = v.value; return out; }
    async read() {
        const values = await this.get([this.storageKey]);
        if (!values[this.storageKey])
            return null;
        const m = JSON.parse(values[this.storageKey]);
        if (m.v !== 1 || !Number.isInteger(m.count) || m.count < 1 || m.count > 48 || ![0, 1].includes(m.bank))
            throw Error('cloud_manifest');
        this.bank = m.bank;
        const keys = Array.from({ length: m.count }, (_, i) => `${this.storageKey}_${m.bank}_${i}`), parts = await this.get(keys), s = keys.map(k => parts[k] || '').join('');
        if (checksum(s) !== m.hash)
            throw Error('cloud_incomplete');
        return s;
    }
    async write(value) {
        const count = Math.ceil(value.length / 3500);
        if (count < 1 || count > 48)
            throw Error('cloud_quota');
        const bank = 1 - this.bank;
        for (let i = 0; i < count; i++) {
            const r = await (0, Browser_1.deadline)(this.bridge.send('VKWebAppStorageSet', { key: `${this.storageKey}_${bank}_${i}`, value: value.slice(i * 3500, (i + 1) * 3500) }), 8000, 'cloud_write_timeout');
            if (!r.result)
                throw Error('cloud_write_failed');
            await new Promise(r => setTimeout(r, 550));
        }
        const r = await (0, Browser_1.deadline)(this.bridge.send('VKWebAppStorageSet', { key: this.storageKey, value: JSON.stringify({ v: 1, bank, count, hash: checksum(value) }) }), 8000, 'cloud_commit_timeout');
        if (!r.result)
            throw Error('cloud_commit_failed');
        this.bank = bank;
    }
}
exports.BridgeCloud = BridgeCloud;

},
"platform/Contracts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = { platform: 'auto', build: '0.29.6', previewAds: true, sdkTimeoutMs: 8000, crazygames: { launch: 'basic' }, yandex: { sdkUrl: '/sdk.js' }, analytics: { enabled: true, gameKey: '', secretKey: '', consent: 'granted', respectDoNotTrack: true } };

},
"platform/Platform":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformService = void 0;
exports.getPlatform = getPlatform;
const Contracts_1 = require("./Contracts");
const Adapters_1 = require("./Adapters");
const Browser_1 = require("./Browser");
const Analytics_1 = require("./Analytics");
class PlatformService {
    constructor(config = {}) {
        this.name = 'Platform ads';
        this.reasons = new Set();
        this.listeners = [];
        this.removers = [];
        this.desired = false;
        this.playing = false;
        this.loaded = false;
        this.dead = false;
        this.soundOff = false;
        this.sdkStatus = 'initializing';
        this.adPending = false;
        this.cancelAd = null;
        this.completion = -1;
        this.config = Object.assign(Object.assign(Object.assign({}, Contracts_1.DEFAULT_CONFIG), config), { crazygames: Object.assign(Object.assign({}, Contracts_1.DEFAULT_CONFIG.crazygames), config.crazygames), yandex: Object.assign(Object.assign({}, Contracts_1.DEFAULT_CONFIG.yandex), config.yandex), analytics: Object.assign(Object.assign({}, Contracts_1.DEFAULT_CONFIG.analytics), config.analytics) });
        this.id = this.config.platform === 'auto' ? (0, Browser_1.detectPlatform)() : this.config.platform;
        this.adapter = Adapters_1.ADAPTERS[this.id](this.config);
        this.analytics = new Analytics_1.Analytics(this.config, this.id);
    }
    get suspended() { return this.reasons.size > 0; }
    get muted() { return this.soundOff || this.suspended; }
    get rewarded() { return this.sdkStatus === 'ready' && this.adapter.rewarded; }
    get cloud() { return this.sdkStatus === 'ready' ? this.adapter.cloud : null; }
    get previewAds() { return this.id === 'standalone' && this.config.previewAds && (0, Browser_1.localHost)(location.hostname); }
    get locale() { return /^ru(?:$|[-_])/i.test(this.adapter.locale) ? 'ru' : 'en'; }
    get storageScope() { return this.adapter.storageScope; }
    async init() {
        this.analytics.event('game_boot');
        const listen = (target, name, fn) => { target.addEventListener(name, fn); this.removers.push(() => target.removeEventListener(name, fn)); };
        listen(document, 'visibilitychange', () => this.pause('hidden', document.hidden));
        listen(window, 'blur', () => this.pause('blur', true));
        listen(window, 'focus', () => this.pause('blur', false));
        this.pause('hidden', document.hidden);
        try {
            const init = this.adapter.init({ pause: (r, on) => { if (!this.dead && this.sdkStatus !== 'unavailable')
                    this.pause(r, on); }, mute: on => { if (this.dead || this.sdkStatus === 'unavailable')
                    return; this.soundOff = on; this.changed(); } });
            void init.then(() => { if (this.dead || this.sdkStatus === 'unavailable')
                this.adapter.dispose(); }, () => { });
            await (0, Browser_1.deadline)(init, this.config.sdkTimeoutMs + 6000, 'sdk_init_timeout');
            if (this.dead) {
                this.adapter.dispose();
                return this;
            }
            this.sdkStatus = 'ready';
        }
        catch (_a) {
            this.sdkStatus = 'unavailable';
            this.adapter.dispose();
            this.reasons.delete('sdk');
            this.soundOff = false;
        }
        this.analytics.event('sdk_ready', { reason: this.sdkStatus });
        void this.analytics.init();
        this.changed();
        return this;
    }
    subscribe(fn) { this.listeners.push(fn); fn(); return () => { const i = this.listeners.indexOf(fn); if (i >= 0)
        this.listeners.splice(i, 1); }; }
    changed() { if (this.dead)
        return; this.sync(); for (const l of this.listeners.slice())
        l(); }
    pause(reason, on) { if (on)
        this.reasons.add(reason);
    else
        this.reasons.delete(reason); this.changed(); }
    ready() { if (this.loaded || this.dead)
        return; this.loaded = true; if (this.sdkStatus === 'ready')
        (0, Browser_1.safeCall)(() => this.adapter.ready()); this.analytics.event('game_ready'); this.sync(); }
    gameplay(on) { if (this.desired === on)
        return; this.desired = on; this.sync(); }
    reportCompletion(completed, total) {
        if (this.dead || this.sdkStatus !== 'ready' || !Number.isFinite(completed) || !Number.isFinite(total) || total <= 0)
            return;
        const percentage = Math.round(Math.max(0, Math.min(1, completed / total)) * 10000) / 100;
        if (percentage === this.completion)
            return;
        this.completion = percentage;
        (0, Browser_1.safeCall)(() => { var _a, _b; return (_b = (_a = this.adapter).reportCompletion) === null || _b === void 0 ? void 0 : _b.call(_a, percentage); });
    }
    happytime() { if (!this.dead && this.sdkStatus === 'ready')
        (0, Browser_1.safeCall)(() => { var _a, _b; return (_b = (_a = this.adapter).happytime) === null || _b === void 0 ? void 0 : _b.call(_a); }); }
    sync() { const externalPause = this.id === 'crazygames' ? Array.from(this.reasons).some(r => r !== 'hidden' && r !== 'blur') : this.suspended; const on = this.desired && this.loaded && !externalPause && !this.dead; if (on === this.playing)
        return; this.playing = on; if (this.sdkStatus === 'ready')
        this.adapter.gameplay(on); if (!on)
        this.analytics.flushCoins(); }
    /** The ad lock begins before the auction. Reward callbacks cannot release it before the overlay closes. */
    show(reward, close, error, placement = 'unknown') {
        if (!this.rewarded || this.adPending || this.dead) {
            error();
            return;
        }
        this.adPending = true;
        this.pause('ad', true);
        this.analytics.event('ad_requested', { placement });
        let ended = false, granted = false, started = false;
        const finish = (code) => { if (ended)
            return; ended = true; clearTimeout(timer); this.cancelAd = null; this.adPending = false; this.analytics.event(code ? 'ad_failed' : 'ad_closed', Object.assign({ placement, rewarded: granted }, (code ? { reason: code } : {}))); this.pause('ad', false); if (code)
            error();
        else
            close(); };
        const timer = setTimeout(() => finish('callback_timeout'), 180000);
        this.cancelAd = () => finish('disposed');
        try {
            this.adapter.showRewarded({ started: () => { if (!ended && !started) {
                    started = true;
                    this.analytics.event('ad_started', { placement });
                } }, rewarded: () => { if (ended || granted)
                    return; granted = true; this.analytics.event('ad_rewarded', { placement }); reward(); }, closed: () => finish(), failed: code => finish(code) });
        }
        catch (_a) {
            finish('sdk_exception');
        }
    }
    event(name, params = {}) { this.analytics.event(name, params); }
    snapshot() { var _a; return { id: this.id, status: this.sdkStatus, locale: this.locale, rewarded: this.rewarded, previewAds: this.previewAds, cloud: ((_a = this.cloud) === null || _a === void 0 ? void 0 : _a.name) || null, suspended: this.suspended, reasons: Array.from(this.reasons), muted: this.muted, playing: this.playing, ready: this.loaded }; }
    dispose() { var _a; if (this.dead)
        return; this.gameplay(false); (_a = this.cancelAd) === null || _a === void 0 ? void 0 : _a.call(this); this.dead = true; this.adapter.dispose(); this.analytics.dispose(); for (const remove of this.removers)
        remove(); this.listeners = []; if (window.BWPlatform === this) {
        delete window.__BW_PLATFORM_READY;
        delete window.BWPlatform;
    } }
}
exports.PlatformService = PlatformService;
function getPlatform() { const w = window; if (!w.__BW_PLATFORM_READY) {
    const service = new PlatformService(w.BW_PUBLICATION || {});
    w.BWPlatform = service;
    w.__BW_PLATFORM_READY = service.init();
} return w.__BW_PLATFORM_READY; }

}},cache={};function load(id){if(cache[id])return cache[id].exports;if(!modules[id])throw Error("Missing platform module: "+id);var m=cache[id]={exports:{}};function req(p){var parts=id.split("/");parts.pop();p.split("/").forEach(function(v){if(v==="..")parts.pop();else if(v!==".")parts.push(v);});return load(parts.join("/"));}modules[id](req,m,m.exports);return m.exports;}load("platform/Platform").getPlatform();})();
