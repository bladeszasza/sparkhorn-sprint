// Sparkhorn-ellenőrzés fej nélküli Chrome-ban (Node 22+): külső kérések, beszéd, hangerő (régi képlet vs. új lánc), memória, busy(), az én unikornisom.
// Használat: előbb egy helyi szerver a repó gyökerére (pl. 8125-ös port), aztán: node tests/check.mjs [url] [--gpu]
// A Chrome helye a CHROME környezeti változóval adható meg.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://localhost:8125/';
const gpu = process.argv.includes('--gpu');
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', port = 9333 + Math.floor(Math.random() * 300);
const dir = mkdtempSync(join(process.env.SCRATCH || tmpdir(), 'chrome-'));
const gl = gpu ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--window-size=1180,820', ...gl,
  '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--no-default-browser-check', '--disable-extensions', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map(), requests = [], errors = [];
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

// az oldal betöltése előtt: hangkimenet-mérő és tesztbeszéd (magyar tesztvoice-szal)
const INIT = `(() => {
  const Orig = window.AudioContext;
  window.AudioContext = class extends Orig {
    constructor(...a) {
      super(...a);
      const real = Reflect.get(Orig.prototype, 'destination', this);
      this.__tap = this.createGain(); this.__an = this.createAnalyser(); this.__an.fftSize = 2048;
      this.__tap.connect(real); this.__tap.connect(this.__an);
      window.__ctxs = (window.__ctxs || 0) + 1; window.__lastCtx = this;
    }
    get destination() { return this.__tap || Reflect.get(Orig.prototype, 'destination', this); }
  };
  window.webkitAudioContext = window.AudioContext;
  const voice = { name: 'Teszt hang', lang: 'hu-HU', voiceURI: 'teszt-hu', localService: true };
  window.__said = [];
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    getVoices: () => [voice], speak(u) { window.__said.push(u.text); setTimeout(() => u.onend && u.onend(), 20); },
    cancel() {}, addEventListener() {}, removeEventListener() {}, speaking: false, pending: false } });
})();`;

const TEST = `(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const R = [], ok = (name, pass, info) => R.push({ name, pass: !!pass, info: String(info) });
  for (let i = 0; i < 50 && !window.__sparkhorn; i++) await wait(100);
  const S = window.__sparkhorn;
  ok('a játék betölt (helyi three.js)', !!S && typeof THREE !== 'undefined' && THREE.REVISION === '128', 'three ' + (window.THREE && THREE.REVISION));
  await wait(400);
  ok('kezdőképernyő: elmondja, mit kell tenni', __said.some(t => /Válassz egy unikornist/.test(t)), __said.join(' | '));
  const n0 = __said.length; document.getElementById('start-say').click(); await wait(100);
  ok('🔊 gomb: újra elmondja (választás + irányítás)', __said.length === n0 + 1 && /Játék gombra/.test(__said[n0]) && /ugrik/.test(__said[n0]), __said.slice(n0).join(' | '));
  ok('busy(): a kezdőképernyőn nem foglalt', S.busy() === false, S.state());

  // --- hangerő: a régi képlet (közvetlenül a kimenetre) és az új lánc ugyanazon a mérőn ---
  const A = S.audio(), c = A.ctx, an = c.__an, buf = new Float32Array(an.fftSize);
  const measure = async (fn, ms = 700) => {
    let max = 0, sum = 0, n = 0; fn();
    const t0 = performance.now();
    while (performance.now() - t0 < ms) { an.getFloatTimeDomainData(buf); let s = 0; for (const x of buf) s += x * x; const r = Math.sqrt(s / buf.length); max = Math.max(max, r); sum += s / buf.length; n++; await wait(15); }
    return { max, rms: Math.sqrt(sum / Math.max(1, n)) };
  };
  const old = {
    jump: () => { const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = 'triangle'; o.frequency.value = 440; g.gain.setValueAtTime(0.10, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08); o.start(); o.stop(c.currentTime + 0.08); },
    collectible: () => { const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = 'sine'; o.frequency.setValueAtTime(660, c.currentTime); o.frequency.linearRampToValueAtTime(1100, c.currentTime + 0.10); g.gain.setValueAtTime(0.08, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.10); o.start(); o.stop(c.currentTime + 0.10); },
    win: () => { const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = 'sine'; [523, 659, 784, 1047].forEach((f, i) => o.frequency.setValueAtTime(f, c.currentTime + i * 0.12)); g.gain.setValueAtTime(0.12, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6); o.start(); o.stop(c.currentTime + 0.6); },
    gameOver: () => { const o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = 'square'; o.frequency.setValueAtTime(220, c.currentTime); o.frequency.linearRampToValueAtTime(80, c.currentTime + 0.15); g.gain.setValueAtTime(0.15, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15); o.start(); o.stop(c.currentTime + 0.15); },
  };
  for (let i = 0; i < 20 && c.state !== 'running'; i++) { c.resume(); await wait(50); }
  const lv = {};
  for (const k of ['jump', 'collectible', 'win', 'gameOver']) {
    const o = await measure(old[k]); await wait(300);
    const nw = await measure(() => S.playSFX(k)); await wait(400);
    lv[k] = { old: o, now: nw };
  }
  const bump = await measure(() => S.playSFX('bump')); await wait(300);
  const fmt = x => x.max.toFixed(3) + '/' + x.rms.toFixed(3);
  const ratios = Object.entries(lv).map(([k, v]) => [k, v.now.rms / Math.max(1e-6, v.old.rms), v]);
  ok('hangeffektek: legalább háromszor hangosabbak (teljes hosszra mért RMS)', ratios.every(([, r]) => r >= 3), ratios.map(([k, r, v]) => k + ' ×' + r.toFixed(1) + ' (régi ' + fmt(v.old) + ', új ' + fmt(v.now) + ')').join('; ') + '; bump új ' + fmt(bump));
  ok('hangeffektek: nem torzítanak (csúcs 1 alatt)', Object.values(lv).every(v => v.now.max < 0.98) && bump.max < 0.98, Object.entries(lv).map(([k, v]) => k + ' ' + v.now.max.toFixed(2)).join(', '));
  // a Csillagkert ugyanígy mérve: csengés 0,45 csúcs / 0,18 RMS, ujjongás 0,26 / 0,14 – a Sparkhorn ne legyen hangosabb
  ok('hangeffektek: nem hangosabbak a Csillagkert csengésénél (csúcs ≤ 0,47, RMS ≤ 0,2)', Object.values(lv).every(v => v.now.max <= 0.47 && v.now.rms <= 0.2) && bump.max <= 0.47, Object.entries(lv).map(([k, v]) => k + ' ' + fmt(v.now)).join(', ') + ', bump ' + fmt(bump));

  // --- kör: busy, memória, beszéd ---
  document.getElementById('start-btn').click(); await wait(900);
  ok('kör eleje: elmondja az irányítást', __said.some(t => /sávot vált/.test(t)), __said.slice(-2).join(' | '));
  ok('busy(): kör közben foglalt', S.busy() === true && S.state() === 'PLAYING' || S.busy() === true, S.state());
  await wait(1500);                                         // a zene felhangosodik
  const music = await measure(() => {}, 1500);
  A.music.disconnect(); const g0 = A.music.gain.value; A.music.gain.value = 0.085 / 0.24; A.music.connect(c.destination);
  await wait(300); const musicOld = await measure(() => {}, 1500);
  A.music.disconnect(); A.music.gain.value = g0; A.music.connect(A.master);
  const sfxOverMusic = lv.collectible.now.max / Math.max(1e-6, music.max);
  ok('zene kör közben: legalább háromszor hangosabb, és a hangeffektek fölötte szólnak', music.rms / Math.max(1e-6, musicOld.rms) >= 3 && sfxOverMusic >= 1.3, 'zene új ' + fmt(music) + ', régi ' + fmt(musicOld) + ' (×' + (music.rms / Math.max(1e-6, musicOld.rms)).toFixed(1) + '); csillag-csúcs / zene-csúcs ' + sfxOverMusic.toFixed(2));
  // 55 mp-re minden akadályfajta feltűnt (a légi akadály 25 mp-nél, a kettős 50 mp-nél): onnantól már nem nőhet
  S.tick(10, true); const m0 = S.memory();
  S.tick(45, true); const m1 = S.memory();
  const t1 = S.tick(25, true); const m2 = S.memory();
  ok('memória: 55 és 80 mp között nem nő a geometriák és textúrák száma', m2.geometries <= m1.geometries && m2.textures <= m1.textures && m1.geometries - m0.geometries <= 8, '10 mp: ' + JSON.stringify(m0) + ', 55 mp: ' + JSON.stringify(m1) + ', 80 mp: ' + JSON.stringify(m2) + '; pályán ' + t1.obstacles + ' akadály, ' + t1.stars + ' csillag, pont ' + t1.score + ', idő ' + t1.elapsed.toFixed(0));
  const s0 = __said.length; S.endRound(); await wait(200);
  const endLine = __said.slice(s0).join(' | ');
  ok('kör vége: dicséret, a csillagok száma betűvel, meghívás új körre', /Ügyes voltál!|Szép futás volt!/.test(endLine) && /Fussunk még egyet\\?/.test(endLine) && !/[0-9]/.test(endLine) && (t1.score > 0 ? /csillagot gyűjtöttél/.test(endLine) : true), endLine + ' (pont ' + t1.score + ')');
  for (let i = 0; i < 60 && S.state() !== 'SHOWCASE'; i++) await wait(100);
  ok('busy(): a kör után újra szabad', S.busy() === false, S.state());
  // unikornis-csere és második kör: nem nő a memória
  S.select(2); S.select(4); S.select(1); await wait(200);
  document.getElementById('start-btn').click(); await wait(900);
  S.tick(80, true); const m3 = S.memory();
  ok('memória: unikornis-csere és új kör után sem nő', m3.geometries <= m2.geometries && m3.textures <= m2.textures, JSON.stringify(m3));
  const s1 = __said.length; S.endRound('lives'); await wait(200);
  const lifeLine = __said.slice(s1).join(' | ');
  ok('elfogyott szívek: kedves mondat, nincs számjegy', /Majdnem sikerült!/.test(lifeLine) && /Próbáld újra/.test(lifeLine) && !/[0-9]/.test(lifeLine), lifeLine);
  ok('egyetlen hang-kontextus', window.__ctxs === 1, window.__ctxs);
  window.__results = R;
})().catch(e => { window.__results = [{ name: 'futtatás', pass: false, info: e.stack || e.message }]; });`;

try {
  let target;
  for (let k = 0; k < 50 && !target; k++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch (e) { await sleep(200); } }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.slice(0, 300) || m.params.exceptionDetails?.text);
    else if (m.method === 'Network.requestWillBeSent') requests.push(m.params.request.url);
  });
  await send('Runtime.enable'); await send('Network.enable'); await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: INIT });
  await send('Page.navigate', { url });
  await sleep(1500);
  await send('Runtime.evaluate', { expression: TEST });
  const t0 = Date.now(); let out = null;
  while (Date.now() - t0 < 120000) {
    await sleep(1000);
    const r = await send('Runtime.evaluate', { expression: 'window.__results ? JSON.stringify(window.__results) : null', returnByValue: true });
    if (r.result?.result?.value) { out = JSON.parse(r.result.result.value); break; }
  }
  if (!out) { console.log('IDŐTÚLLÉPÉS'); process.exitCode = 2; }
  else {
    // „az én unikornisom": a Csillagkert átadott színeivel a sor elején áll és ő a kiválasztott; hibás adattal minden a régi
    const label = async setup => {
      await send('Runtime.evaluate', { expression: 'localStorage.clear(); ' + setup + '; true' }); await send('Page.reload', {}); await sleep(2500);
      return (await send('Runtime.evaluate', { expression: "document.getElementById('selected-unicorn-label').textContent", returnByValue: true })).result?.result?.value || '';
    };
    const OWN = JSON.stringify({ v: 1, body: '#d6e6ff', legs: '#c3cdec', horn: '#ff5d5d', tail: '#ff5d5d', mane: ['#ff5d5d', '#ffb020', '#ffe14d', '#4cc38a', '#4a7dff'], ears: '#ffc0e0', eyes: '#382c6e' });
    const setOwn = 'localStorage.setItem("csillagkert_avatar", ' + JSON.stringify(OWN) + ')';
    const L = {
      own: await label(setOwn),
      ownOld: await label(setOwn + '; localStorage.setItem("sparkhorn_sprint_selected_unicorn", "2")'),
      bad: await label('localStorage.setItem("csillagkert_avatar", ' + JSON.stringify(JSON.stringify({ v: 1, body: 'red' })) + ')'),
      none: await label(''),
    };
    out.push({ name: 'az én unikornisom: a Csillagkert színeivel elöl áll; a régi választás és a hibás adat nem ront el semmit', pass: /Az én unikornisom/.test(L.own) && /Frostfeather/.test(L.ownOld) && /Starbloom/.test(L.bad) && /Starbloom/.test(L.none), info: JSON.stringify(L) });
    const host = new URL(url).host;
    const ext = requests.filter(u => !u.startsWith('data:') && !u.startsWith('blob:') && new URL(u).host !== host);
    out.unshift({ name: 'nincs külső kérés (three.js helyből)', pass: ext.length === 0, info: ext.join(', ') || `${requests.length} kérés, mind a saját címről` });
    out.push({ name: 'nincs kivétel a konzolon', pass: errors.length === 0, info: errors.join(' · ') || 'nincs' });
    const fail = out.filter(x => !x.pass);
    console.log(`${out.length} ellenőrzés, ${out.length - fail.length} zöld, ${fail.length} piros`);
    for (const x of out) console.log(`${x.pass ? 'OK ' : 'HIBA'} ${x.name} :: ${x.info.slice(0, 600)}`);
    process.exitCode = fail.length ? 1 : 0;
  }
} finally { try { ws?.close(); } catch (e) {} proc.kill(); }
