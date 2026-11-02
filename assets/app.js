/* 多益詞旅 TOEIC Voyage — app
   Vanilla JS, no build step. Views: today / atlas / learn / practice / map / me (hash routed). */
(() => {
  'use strict';

  const WORDS = window.TOEIC_WORDS || [];
  const BY_ID = new Map(WORDS.map((w) => [w.id, w]));
  const CLOZE = window.TOEIC_CLOZE || {};
  const STORY = window.TOEIC_STORIES || { series: {}, chapters: [] };
  const CH = STORY.chapters;
  const DAY = 864e5;
  const MIN = 6e4;

  const LEVELS = [
    { lv: 400, name: '起飛', en: 'Take-off', desc: '生活與辦公室最常出現的基礎字，聽懂公告、看懂通知的地基。' },
    { lv: 600, name: '爬升', en: 'Climb', desc: '職場流程與商務往來的中堅詞，Part 5、6 的常客。' },
    { lv: 800, name: '巡航', en: 'Cruise', desc: '合約、財務、管理語境，讀懂 Part 7 長篇文章的關鍵。' },
    { lv: 990, name: '抵達', en: 'Arrival', desc: '高階商業與法務用語，拉開高分差距的決勝字。' },
  ];
  const LV = Object.fromEntries(LEVELS.map((l) => [l.lv, l]));

  const TOPICS = [
    { k: 'off', zh: '辦公行政', en: 'Office' },
    { k: 'hr', zh: '人資職涯', en: 'Careers' },
    { k: 'fin', zh: '財務金融', en: 'Finance' },
    { k: 'mkt', zh: '行銷媒體', en: 'Marketing' },
    { k: 'biz', zh: '企業經營', en: 'Business' },
    { k: 'law', zh: '合約法規', en: 'Legal' },
    { k: 'ops', zh: '製造物流', en: 'Operations' },
    { k: 'tech', zh: '科技數位', en: 'Tech' },
    { k: 'evt', zh: '會議活動', en: 'Events' },
    { k: 'trv', zh: '旅遊交通', en: 'Travel' },
    { k: 'hos', zh: '餐飲住宿', en: 'Hospitality' },
    { k: 'shop', zh: '購物消費', en: 'Shopping' },
    { k: 'home', zh: '房產設施', en: 'Property' },
    { k: 'med', zh: '醫療健康', en: 'Health' },
    { k: 'core', zh: '通用核心', en: 'Core' },
  ];
  const TP = Object.fromEntries(TOPICS.map((t) => [t.k, t]));
  const STATUS_ZH = { new: '未學', learning: '學習中', mastered: '已熟' };
  const POS_EN = { 'n.': 'noun', 'v.': 'verb', 'adj.': 'adjective', 'adv.': 'adverb', 'prep.': 'preposition' };
  const POS_ZH = { 'n.': '名詞', 'v.': '動詞', 'adj.': '形容詞', 'adv.': '副詞', 'prep.': '介系詞' };

  /* ---------- icons ---------- */
  const I = {
    wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m22 9-6 6M16 9l6 6"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4V3Z"/></svg>',
    starOn: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4V3Z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h3l2-5 4 10 2-5h7"/></svg>',
    atlas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13ZM13 4h5.5c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5H13V4Z"/></svg>',
    practice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></svg>',
    me: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10 5 7.2 4.5 3.5 5v13c3.7-.5 6.5 0 8.5 1.5 2-1.5 4.8-2 8.5-1.5V5c-3.7-.5-6.5 0-8.5 1.5ZM12 6.5v13"/></svg>',
    listen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/></svg>',
  };
  const LOGO = '<svg class="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="20" r="12.5" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3" opacity=".55"/><path d="M8 25c6-1 16-6 24-15" stroke="var(--ochre)" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 4"/><path d="M27.5 9.5 33 8l-1.6 5.4-2.1-1.8-3 .8 1.2-2.9Z" fill="var(--ochre)"/><path d="M14 27.5h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  /* Painted plates live in sprite atlases: one request per 100 thumbnails, one per 25 full plates. */
  const SP = window.TOEIC_SPRITE || { thumb: { cols: 10 }, full: { cols: 5 }, covers: {} };
  function spriteCss(idx, kind) {
    const s = SP[kind];
    const per = s.cols * s.cols;
    const i = idx % per;
    const pos = (v) => `${((v / (s.cols - 1)) * 100).toFixed(3)}%`;
    return `background-image:url(assets/img/${kind}-${Math.floor(idx / per)}.webp);background-size:${s.cols * 100}% ${s.cols * 100}%;background-position:${pos(i % s.cols)} ${pos(Math.floor(i / s.cols))}`;
  }
  const coverIdx = (t) => SP.covers[t];
  function art(w, opt = {}) {
    const idx = typeof w === 'number' ? w : w.i;
    const tag = opt.tag && typeof w === 'object' && w.ar === 's' ? `<span class="art-tag">${TP[w.t].zh} · 場景插畫</span>` : '';
    return `<div class="art ${opt.cls || ''}" style="${spriteCss(idx, 'thumb')}" role="img" aria-label="${typeof w === 'object' ? esc(w.w) + ' 插畫' : '場景插畫'}">${opt.full ? `<div class="art-full" data-full="${idx}"></div>` : ''}${tag}</div>`;
  }
  const sheetCache = new Map();
  function loadFull(root = document) {
    root.querySelectorAll('[data-full]:not(.is-in)').forEach((el) => {
      const idx = +el.dataset.full;
      const per = SP.full.cols * SP.full.cols;
      const url = `assets/img/full-${Math.floor(idx / per)}.webp`;
      let p = sheetCache.get(url);
      if (!p) {
        p = new Promise((res, rej) => { const im = new Image(); im.onload = res; im.onerror = rej; im.src = url; });
        sheetCache.set(url, p);
      }
      el.setAttribute('style', spriteCss(idx, 'full'));
      p.then(() => el.classList.add('is-in'), () => {});
    });
  }

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const fmt = (n) => n.toLocaleString('en-US');
  const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  const zhMain = (w) => w.s.map((s) => s[1]).join('；');
  const zhShort = (w) => `${w.s[0][0]} ${w.s[0][1]}`;
  const kkHtml = (w) => `[${esc(w.kk)}]`;
  const posOf = (w) => w.s[0][0];

  /* ---------- storage ---------- */
  const KEY = 'toeic-atlas-v1'; // kept from the first release so saved progress survives the rename
  const DEFAULT_SET = { goal: 10, start: 400, accent: 'us', rate: 0.9, sfx: true, theme: 'system', amb: 'night', ambVol: 0.45, splash: true, passN: 3, reward: '' };
  function fresh() { return { v: 1, cards: {}, days: {}, stars: [], story: { read: {}, best: {} }, sprint: {}, notes: [], exi: {}, set: { ...DEFAULT_SET }, onboarded: false }; }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && raw.v === 1) return { ...fresh(), ...raw, story: { read: {}, best: {}, ...(raw.story || {}) }, set: { ...DEFAULT_SET, ...(raw.set || {}) } };
    } catch (e) { /* storage unavailable */ }
    return fresh();
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  /* ---------- scheduling (SM-2 style, four grades) ---------- */
  function status(id) {
    const c = S.cards[id];
    if (!c) return 'new';
    return c.st === 'review' && c.ivl >= 21 ? 'mastered' : 'learning';
  }
  function nextState(c0, g, now = Date.now()) {
    const c = c0 ? { ...c0 } : { st: 'learning', ivl: 0, ease: 2.5, reps: 0, lapses: 0 };
    if (c.st === 'learning') {
      if (g === 1) c.due = now + MIN;
      else if (g === 2) c.due = now + 10 * MIN;
      else if (g === 3) { c.st = 'review'; c.ivl = 1; c.due = now + DAY; }
      else { c.st = 'review'; c.ivl = 4; c.due = now + 4 * DAY; }
    } else {
      if (g === 1) { c.lapses++; c.ease = Math.max(1.3, c.ease - 0.2); c.st = 'learning'; c.ivl = 1; c.due = now + 10 * MIN; }
      else {
        if (g === 2) { c.ease = Math.max(1.3, c.ease - 0.15); c.ivl = Math.max(1, c.ivl * 1.2); }
        else if (g === 3) c.ivl = Math.max(c.ivl + 1, c.ivl * c.ease);
        else { c.ivl = Math.max(c.ivl + 2, c.ivl * c.ease * 1.3); c.ease += 0.15; }
        c.ivl = Math.round(c.ivl);
        c.due = now + c.ivl * DAY;
      }
    }
    c.reps++;
    c.last = now;
    return c;
  }
  function ivlLabel(c, now = Date.now()) {
    const d = c.due - now;
    if (d < 50 * MIN) return `${Math.max(1, Math.round(d / MIN))} 分鐘`;
    if (d < DAY) return `${Math.round(d / 36e5)} 小時`;
    const days = Math.round(d / DAY);
    if (days < 31) return `${days} 天`;
    return `${(days / 30).toFixed(1).replace(/\.0$/, '')} 個月`;
  }
  function today() {
    const k = ymd();
    if (!S.days[k]) S.days[k] = { n: 0, r: 0, q: 0, c: 0, plan: null };
    return S.days[k];
  }
  function newOrder() {
    const start = S.set.start;
    // same order as the sprint levels: story words first, then each leg mixed across topics
    const all = sprintOrder().map((id) => BY_ID.get(id));
    return all.filter((w) => w.lv >= start).concat(all.filter((w) => w.lv < start));
  }
  function plan() {
    const d = today();
    const goal = S.set.goal;
    if (!d.plan) d.plan = [];
    const keep = d.plan.filter((id) => S.cards[id] && (S.cards[id].first || '') === ymd());
    if (keep.length >= goal) { d.plan = keep; return d.plan; }
    const pending = d.plan.filter((id) => !S.cards[id]);
    const seen = new Set([...keep, ...pending]);
    const out = [...keep, ...pending].slice(0, goal);
    for (const w of newOrder()) {
      if (out.length >= goal) break;
      if (!S.cards[w.id] && !seen.has(w.id)) out.push(w.id);
    }
    d.plan = out;
    save();
    return out;
  }
  function dueIds(now = Date.now()) {
    return Object.entries(S.cards)
      .filter(([, c]) => c.due <= now)
      .sort((a, b) => a[1].due - b[1].due)
      .map(([id]) => +id);
  }
  function grade(id, g) {
    const isNew = !S.cards[id];
    const c = nextState(S.cards[id], g);
    if (isNew) c.first = ymd();
    S.cards[id] = c;
    const d = today();
    if (isNew) d.n++; else d.r++;
    save();
    return c;
  }
  function markKnown(id) {
    const isNew = !S.cards[id];
    const now = Date.now();
    S.cards[id] = { ...(S.cards[id] || { lapses: 0, reps: 0 }), st: 'review', ivl: 21, ease: 2.7, due: now + 21 * DAY, last: now, first: S.cards[id]?.first || ymd() };
    if (isNew) today().n++;
    save();
  }
  function forget(id) { delete S.cards[id]; save(); }
  function toggleStar(id) {
    const i = S.stars.indexOf(id);
    if (i >= 0) S.stars.splice(i, 1); else S.stars.push(id);
    save();
    return i < 0;
  }
  function streak() {
    let n = 0;
    const d = new Date();
    const act = (k) => { const r = S.days[k]; return r && r.n + r.r + r.q > 0; };
    if (!act(ymd(d))) d.setDate(d.getDate() - 1);
    while (act(ymd(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function counts(list = WORDS) {
    let learning = 0, mastered = 0;
    for (const w of list) { const s = status(w.id); if (s === 'learning') learning++; else if (s === 'mastered') mastered++; }
    return { total: list.length, learning, mastered, fresh: list.length - learning - mastered };
  }

  /* ---------- speech + sound ---------- */
  let voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices(); } catch (e) { voices = []; } }
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function pickVoice(lang) {
    const list = voices.filter((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(lang.toLowerCase()));
    const pref = ['Google', 'Samantha', 'Daniel', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Sonia', 'Serena', 'Alex'];
    for (const p of pref) { const v = list.find((x) => x.name.includes(p)); if (v) return v; }
    return list[0] || null;
  }
  /* ---------- sound: cues, ambience, ducking (Web Audio) ---------- */
  const AMBS = [
    { k: 'night', zh: '夜航配樂', note: '溫暖電鋼琴與長音鋪底，陪你慢慢背', len: 96 },
    { k: 'cabin', zh: '機艙巡航', note: '平穩的引擎低鳴，像長途航班上', len: 64 },
    { k: 'sea', zh: '港邊浪聲', note: '一波波拍上堤岸的海浪', len: 66 },
    { k: 'rain', zh: '窗邊雨聲', note: '細雨打在窗上，適合專心', len: 60 },
  ];
  const CUE_GAIN = { tap: 0.35, key: 0.3, page: 0.4, flip: 0.5, correct: 0.6, wrong: 0.5, streak: 0.55, start: 0.6, ignite: 0.55, complete: 0.65 };
  const SND = { ctx: null, master: null, bufs: new Map(), amb: null, ducked: false, armed: false };
  function audioCtx() {
    if (!SND.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      SND.ctx = new C();
      SND.master = SND.ctx.createGain();
      SND.master.connect(SND.ctx.destination);
    }
    if (SND.ctx.state === 'suspended' && SND.armed && !document.hidden) SND.ctx.resume().catch(() => {});
    return SND.ctx;
  }
  function loadSound(file) {
    let p = SND.bufs.get(file);
    if (!p) {
      const c = audioCtx();
      p = c
        ? fetch(`assets/sound/${file}`).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))
          .then((b) => new Promise((res, rej) => c.decodeAudioData(b, res, rej))).catch(() => null)
        : Promise.resolve(null);
      SND.bufs.set(file, p);
    }
    return p;
  }
  async function sfx(name) {
    if (!S.set.sfx) return;
    const c = audioCtx();
    if (!c) return;
    const buf = await loadSound(`${name}.mp3`);
    if (!buf) return;
    const src = c.createBufferSource();
    const g = c.createGain();
    g.gain.value = CUE_GAIN[name] || 0.4;
    src.buffer = buf;
    src.connect(g).connect(SND.master);
    src.start();
  }
  const ambLevel = () => S.set.ambVol * (SND.ducked ? 0.3 : 1);
  function rampTo(g, v, sec) {
    const t = SND.ctx.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(v, t + sec);
  }
  async function setAmbience(id) {
    const c = audioCtx();
    if (!c) return;
    if (SND.amb && SND.amb.id === id) { rampTo(SND.amb.gain, ambLevel(), 0.4); return; }
    const old = SND.amb;
    SND.amb = null;
    if (old) { rampTo(old.gain, 0, 1.4); old.src.stop(c.currentTime + 1.5); }
    paintAmb();
    const meta = AMBS.find((a) => a.k === id);
    if (!meta) return;
    const buf = await loadSound(`amb-${id}.mp3`);
    if (!buf || SND.amb || S.set.amb !== id) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    // Files carry 2 s of the loop's head after the end, so [1, 1 + len] is seamless whatever the decoder pads.
    src.loopStart = 1;
    src.loopEnd = Math.min(buf.duration, 1 + meta.len);
    const gain = c.createGain();
    gain.gain.value = 0;
    src.connect(gain).connect(SND.master);
    src.start(0, 1);
    SND.amb = { id, src, gain };
    rampTo(gain, ambLevel(), 2.5);
    paintAmb();
  }
  let duckTimer = 0;
  function duck(on, ms) {
    clearTimeout(duckTimer);
    SND.ducked = on;
    if (SND.amb) rampTo(SND.amb.gain, ambLevel(), on ? 0.15 : 0.8);
    if (on && ms) duckTimer = setTimeout(() => duck(false), ms);
  }
  function armAudio() {
    if (SND.armed) return;
    SND.armed = true;
    const c = audioCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
    Object.keys(CUE_GAIN).forEach((k) => loadSound(`${k}.mp3`));
    if (S.set.amb !== 'off') setAmbience(S.set.amb);
  }
  window.addEventListener('pointerdown', armAudio, { once: true });
  window.addEventListener('keydown', armAudio, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (!SND.ctx || !SND.armed) return;
    if (document.hidden) SND.ctx.suspend().catch(() => {}); else SND.ctx.resume().catch(() => {});
  });

  function speak(text, accent = S.set.accent, rate = S.set.rate) {
    if (!('speechSynthesis' in window)) { toast('這個瀏覽器不支援語音朗讀，請改用 Chrome、Edge 或 Safari。'); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = accent === 'uk' ? 'en-GB' : 'en-US';
      const v = pickVoice(u.lang);
      if (v) u.voice = v;
      u.rate = rate;
      duck(true, 15000);
      u.onend = u.onerror = () => duck(false);
      speechSynthesis.speak(u);
    } catch (e) { toast('語音朗讀暫時無法使用。'); }
  }
  /* Recorded pronunciations: one audio sprite per accent, seek to [start, duration]. */
  const tracks = {};
  let clip = null;
  function playWord(w, accent = S.set.accent, rate = S.set.rate) {
    const seg = w[accent === 'uk' ? 'k' : 'u'];
    if (!seg) { speak(w.w, accent, rate); return; }
    try {
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      let a = tracks[accent];
      if (!a) {
        a = tracks[accent] = new Audio(`assets/audio/${accent}.mp3`);
        a.preload = 'auto';
        a.addEventListener('timeupdate', () => { if (clip && clip.a === a && a.currentTime >= clip.end) { a.pause(); clip = null; } });
        a.addEventListener('error', () => { a.broken = true; });
      }
      if (a.broken) { speak(w.w, accent, rate); return; }
      if (clip) { clip.a.pause(); clearTimeout(clip.t); }
      const end = seg[0] + seg[1] + 0.06;
      clip = { a, end };
      a.playbackRate = Math.max(0.75, Math.min(1.1, rate / 0.9));
      a.currentTime = Math.max(0, seg[0] - 0.02);
      duck(true, (seg[1] / a.playbackRate) * 1000 + 450);
      const started = a.play();
      const c = clip;
      const arm = () => { if (clip === c) c.t = setTimeout(() => { if (clip === c) { a.pause(); clip = null; } }, ((end - a.currentTime) / a.playbackRate) * 1000 + 40); };
      if (started && started.then) started.then(arm, () => { clip = null; speak(w.w, accent, rate); });
      else arm();
    } catch (e) { speak(w.w, accent, rate); }
  }

  /* Ink-and-gold confetti from a point on screen (correct answers, finished flights). */
  const burstLayer = { cv: null, parts: [], raf: 0 };
  function burst(x, y, count = 30, spread = 1) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cv = burstLayer.cv;
    if (!cv) { cv = burstLayer.cv = document.createElement('canvas'); cv.className = 'burst-layer'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv); }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(innerWidth * dpr)) { cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); }
    const colors = ['#c4573a', '#cb922c', '#6a8c63', '#5f88a8', '#e8b65a', '#1a2035'];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (2.2 + Math.random() * 5.2) * spread;
      burstLayer.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2.6 * spread, r: 2 + Math.random() * 3.6, c: colors[i % colors.length], life: 1, rot: Math.random() * 3, vr: (Math.random() - 0.5) * 0.4, star: i % 7 === 0 });
    }
    if (!burstLayer.raf) burstLayer.raf = requestAnimationFrame(burstTick);
  }
  function burstTick() {
    const cv = burstLayer.cv;
    const g = cv.getContext('2d');
    const dpr = cv.width / innerWidth;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, innerWidth, innerHeight);
    burstLayer.parts = burstLayer.parts.filter((p) => p.life > 0);
    for (const p of burstLayer.parts) {
      p.x += p.vx; p.y += p.vy; p.vx *= 0.94; p.vy = p.vy * 0.94 + 0.3; p.rot += p.vr; p.life -= 0.02;
      g.save();
      g.globalAlpha = Math.max(0, p.life);
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.fillStyle = p.c;
      if (p.star) {
        g.beginPath();
        for (let k = 0; k < 8; k++) { const rr = k % 2 ? p.r * 0.45 : p.r * 1.3; g.lineTo(Math.cos((k * Math.PI) / 4) * rr, Math.sin((k * Math.PI) / 4) * rr); }
        g.fill();
      } else if (p.r > 3.6) g.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * 0.6);
      else { g.beginPath(); g.arc(0, 0, p.r / 2, 0, 6.283); g.fill(); }
      g.restore();
    }
    burstLayer.raf = burstLayer.parts.length ? requestAnimationFrame(burstTick) : 0;
    if (!burstLayer.raf) g.clearRect(0, 0, innerWidth, innerHeight);
  }
  const burstFrom = (el, count, spread) => { if (!el) return; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, count, spread); };

  /* ---------- theme ---------- */
  function applyTheme() {
    const t = S.set.theme;
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }
  function isDark() {
    const t = S.set.theme;
    return t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /* ---------- shell ---------- */
  const NAV = [
    ['today', '啟程', I.today],
    ['story', '故事', I.book],
    ['atlas', '詞庫', I.atlas],
    ['practice', '闖關', I.practice],
    ['map', '星圖', I.map],
    ['me', '護照', I.me],
  ];
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="top"><div class="wrap">
      <a class="brand" href="#today" aria-label="多益詞旅 TOEIC Voyage 首頁">${LOGO}<span class="brand-zh">多益詞旅</span><span class="brand-en">TOEIC Voyage</span></a>
      <nav class="nav" aria-label="主要頁面">${NAV.map(([k, t]) => `<a href="#${k}" data-nav="${k}">${t}</a>`).join('')}</nav>
      <div class="top-tools">
        <button class="search-btn" id="open-search" aria-label="搜尋單字">${I.search}<span>搜尋單字或中文</span><kbd>⌘K</kbd></button>
        <div class="amb">
          <button class="icon-btn amb-btn" id="amb-btn" aria-expanded="false" aria-controls="amb-pop" aria-label="環境音" title="環境音">${I.wave}<span class="amb-bars" aria-hidden="true"><i></i><i></i><i></i></span></button>
          <div class="amb-pop" id="amb-pop" role="dialog" aria-label="環境音" hidden></div>
        </div>
        <button class="icon-btn" id="toggle-sfx" aria-label="音效"></button>
        <button class="icon-btn" id="toggle-theme" aria-label="切換深淺色"></button>
      </div>
    </div></header>
    <main id="view" tabindex="-1"></main>
    <footer class="foot"><div class="wrap">
      <span>多益詞旅 TOEIC Voyage · 1,000 個多益必備單字 · 學習進度只存在你的瀏覽器</span>
      <span>致敬開源專案 <a href="https://github.com/designfuchen/word-atlas" target="_blank" rel="noopener">詞光 Word Atlas</a></span>
    </div></footer>
    <nav class="tabbar" aria-label="主要頁面">${NAV.map(([k, t, ic]) => `<a href="#${k}" data-nav="${k}">${ic}<span>${t}</span></a>`).join('')}</nav>`;
  const view = $('#view');

  function paintAmb() {
    const btn = $('#amb-btn');
    if (!btn) return;
    const playing = !!SND.amb;
    btn.classList.toggle('is-on', playing);
    btn.title = playing ? `環境音：${AMBS.find((x) => x.k === SND.amb.id).zh}` : '環境音';
    const pop = $('#amb-pop');
    if (pop.hidden) return;
    pop.innerHTML = `
      <p class="eyebrow">環境音 · 陪你專心背單字</p>
      <ul>
        ${AMBS.map((a) => `<li><button data-amb="${a.k}" aria-pressed="${S.set.amb === a.k}"><b>${a.zh}</b><span>${a.note}</span></button></li>`).join('')}
        <li><button data-amb="off" aria-pressed="${S.set.amb === 'off'}"><b>關閉</b><span>只保留單字發音與音效</span></button></li>
      </ul>
      <label class="amb-vol" for="amb-vol">音量<input id="amb-vol" type="range" min="0" max="1" step="0.05" value="${S.set.ambVol}"></label>
      <p class="amb-note">唸單字和例句時，環境音會自動降低。</p>`;
    pop.querySelectorAll('[data-amb]').forEach((b) => b.addEventListener('click', () => {
      S.set.amb = b.dataset.amb; save();
      armAudio();
      setAmbience(S.set.amb === 'off' ? null : S.set.amb);
      paintAmb();
    }));
    const vol = $('#amb-vol');
    vol.addEventListener('input', () => { S.set.ambVol = +vol.value; if (SND.amb) rampTo(SND.amb.gain, ambLevel(), 0.1); });
    vol.addEventListener('change', save);
  }
  function toggleAmbPop(open) {
    const pop = $('#amb-pop');
    const btn = $('#amb-btn');
    pop.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (open) paintAmb();
  }
  document.addEventListener('pointerdown', (e) => { const pop = $('#amb-pop'); if (pop && !pop.hidden && !e.target.closest('.amb')) toggleAmbPop(false); });
  function paintTools() {
    const s = $('#toggle-sfx');
    s.innerHTML = S.set.sfx ? I.sound : I.mute;
    s.setAttribute('aria-pressed', String(S.set.sfx));
    s.title = S.set.sfx ? '音效：開' : '音效：關';
    const t = $('#toggle-theme');
    t.innerHTML = isDark() ? I.sun : I.moon;
    t.title = isDark() ? '切換為淺色' : '切換為深色';
  }
  $('#toggle-sfx').addEventListener('click', () => { S.set.sfx = !S.set.sfx; save(); paintTools(); sfx('flip'); toast(S.set.sfx ? '音效已開啟' : '音效已關閉'); });
  $('#toggle-theme').addEventListener('click', () => { S.set.theme = isDark() ? 'light' : 'dark'; save(); applyTheme(); paintTools(); if (route.name === 'map') drawMap(); });
  $('#open-search').addEventListener('click', openPalette);
  $('#amb-btn').addEventListener('click', () => toggleAmbPop($('#amb-pop').hidden));

  let toastTimer;
  function toast(msg) {
    let el = $('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2400);
  }

  /* ---------- transitions: View Transitions API with a CSS fallback ---------- */
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function vt(kind, update, after) {
    if (reducedMotion()) { update(); if (after) after(); return; }
    if (document.startViewTransition) {
      document.documentElement.dataset.vt = kind;
      const t = document.startViewTransition(update);
      t.ready.catch(() => {});                 // a newer transition can skip this one; that is fine
      t.updateCallbackDone.catch(() => {});
      t.finished.catch(() => {}).finally(() => { if (document.documentElement.dataset.vt === kind) delete document.documentElement.dataset.vt; if (after) after(); });
      return;
    }
    update();
    const el = kind === 'card' ? view.querySelector('.flash, .q-card') : kind.startsWith('page') ? view : null;
    if (el) { el.classList.remove('vt-fallback'); void el.offsetWidth; el.classList.add('vt-fallback'); }
    if (after) after();
  }
  const NAV_ORDER = ['today', 'learn', 'recap', 'story', 'atlas', 'practice', 'sprint', 'map', 'me'];

  /* ---------- router ---------- */
  const route = { name: 'today', sub: 0, hash: 'today' };
  let cleanup = null;
  function go(name) { if (location.hash !== `#${name}`) location.hash = name; else render(); }
  function render() {
    const raw = (location.hash || '#today').slice(1);
    let name = raw;
    let wordId = null;
    const m = raw.match(/^word-(\d+)$/);
    let sub = 0;
    if (m) { wordId = +m[1]; name = route.name && route.name !== 'word' ? route.name : 'atlas'; sub = route.sub; }
    const sm = raw.match(/^(story|sprint)-(\d+)$/);
    if (sm) { name = sm[1]; sub = +sm[2]; }
    if (!VIEWS[name]) name = 'today';
    if (cleanup) { cleanup(); cleanup = null; }
    const prevRoute = route.name;
    const prevSub = route.sub;
    const changed = route.name !== name || route.sub !== sub || !view.innerHTML;
    if (changed && view.innerHTML && SND.armed) sfx('page');
    route.name = name;
    route.sub = sub;
    if (!wordId) route.hash = raw;
    $$('[data-nav]').forEach((a) => a.setAttribute('aria-current', a.dataset.nav === name || ((name === 'learn' || name === 'recap') && a.dataset.nav === 'today') || (name === 'sprint' && a.dataset.nav === 'practice') ? 'page' : 'false'));
    if (changed || !wordId) {
      const from = NAV_ORDER.indexOf(prevRoute) * 100 + (prevRoute === name ? prevSub : 0); const to = NAV_ORDER.indexOf(name) * 100 + sub;
      const doIt = () => { VIEWS[name](); if (!wordId) window.scrollTo(0, 0); };
      if (changed && view.dataset.ready) vt(to >= from ? 'page-fwd' : 'page-back', doIt); else doIt();
      view.dataset.ready = '1';
    }
    paintTools();
    if (wordId && BY_ID.has(wordId)) openEntry(wordId, null, true);
  }
  window.addEventListener('hashchange', render);

  /* ---------- shared fragments ---------- */
  const lvBadge = (lv, withName) => `<span class="badge lv-${lv}">${lv}${withName ? ` · ${LV[lv].name}` : ''}</span>`;
  const pron = (w) => `
    <div class="prons">
      <button class="pron" data-word="${w.id}" data-accent="us"><span class="spk">${I.speaker}</span><small>美</small><b>${kkHtml(w)}</b></button>
      <button class="pron" data-word="${w.id}" data-accent="uk"><span class="spk">${I.speaker}</span><small>英</small><b>${w.k ? '英式真人發音' : '英式發音'}</b></button>
    </div>`;
  const BY_WORD = new Map(WORDS.map((w) => [fold(w.w), w]));
  const wordLink = (t) => { const hit = BY_WORD.get(fold(t)); return hit ? `<button class="nym-chip is-link" data-open="${hit.id}">${esc(t)}</button>` : `<span class="nym-chip">${esc(t)}</span>`; };
  function sensesByPos(w) {
    const out = [];
    for (const [pos, zh] of w.s) { const last = out[out.length - 1]; if (last && last[0] === pos) last[1] += '；' + zh; else out.push([pos, zh]); }
    return out;
  }
  const dailyEx = (w) => w.ex.find((e) => e.k === 'd') || w.ex[0];
  const toeicEx = (w) => w.ex.find((e) => e.k === 't') || w.ex[0];
  // fill-in-the-blank questions rotate through several workplace sentences, so a word is never tied to one memorized line
  function nextCloze(w) {
    const t = toeicEx(w);
    const pool = (CLOZE[w.id] || []).map(([en, a, f, kind]) => ({ en, a, f, kind })).concat({ en: t.en, a: t.a, f: t.f, zh: t.zh, kind: formKind(w) });
    const k = (S.exi[w.id] || 0) % pool.length;
    S.exi[w.id] = k + 1;
    return pool[k];
  }
  function markSentence(ex) {
    const s = ex.en;
    const a = ex.a;
    const f = ex.f;
    if (s.substr(a, f.length) !== f) return esc(s);
    return `${esc(s.slice(0, a))}<mark>${esc(f)}</mark>${esc(s.slice(a + f.length))}`;
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('.chip, .seg button, .pick button, #e-star, .amb-pop button')) sfx('tap');
    const say = e.target.closest('[data-say]');
    if (say) { e.preventDefault(); e.stopPropagation(); speak(say.dataset.say, say.dataset.accent || S.set.accent, say.dataset.slow ? 0.8 : S.set.rate); return; }
    const wd = e.target.closest('[data-word]');
    if (wd) {
      e.preventDefault(); e.stopPropagation();
      playWord(BY_ID.get(+wd.dataset.word), wd.dataset.accent || S.set.accent, wd.dataset.slow ? 0.8 : S.set.rate);
      if (wd.classList.contains('pron')) { wd.classList.add('is-playing'); setTimeout(() => wd.classList.remove('is-playing'), 900); }
      return;
    }
    const tale = e.target.closest('[data-story]');
    if (tale) { e.preventDefault(); const ov = $('.overlay.is-entry'); if (ov) closeEntryNow(ov); go(`story-${tale.dataset.story}`); return; }
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); const list = open.closest('[data-list]'); openEntry(+open.dataset.open, list ? listContext : null, false, open); }
  });

  /* ======================================================
     TODAY
     ====================================================== */
  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return '夜深了，旅人。';
    if (h < 11) return '早安，旅人。';
    if (h < 14) return '午安，旅人。';
    if (h < 18) return '午後好，旅人。';
    return '晚安，旅人。';
  }
  function viewToday() {
    const now = new Date();
    const p = plan();
    const pendingNew = p.filter((id) => !S.cards[id]);
    const due = dueIds();
    const total = pendingNew.length + due.length;
    const mins = Math.max(1, Math.round(pendingNew.length * 0.8 + due.length * 0.3));
    const d = today();
    const wotd = WORDS[hash(ymd()) % WORDS.length];
    const levelNow = LEVELS.find((l) => l.lv >= S.set.start) || LEVELS[0];
    const nextLv = LEVELS[Math.min(3, LEVELS.indexOf(levelNow) + 1)];
    const flight = `TA${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const doneToday = total === 0;
    const faces = (pendingNew.length ? pendingNew : due).slice(0, 5).map((id) => BY_ID.get(id));

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(now); dd.setDate(now.getDate() - i);
      const r = S.days[ymd(dd)];
      days.push({ d: dd, v: r ? r.n + r.r + r.q : 0, today: i === 0 });
    }
    const maxV = Math.max(10, ...days.map((x) => x.v));
    const goal = S.set.goal;
    const ringPct = Math.min(1, d.n / goal);
    const C = 2 * Math.PI * 52;
    const acc = d.q ? Math.round((d.c / d.q) * 100) : null;

    view.innerHTML = `
      <div class="wrap">
        <header class="page-head">
          <span class="eyebrow">${now.getMonth() + 1}月${now.getDate()}日 · 星期${WEEK[now.getDay()]}</span>
          <h1>${greeting()}</h1>
        </header>

        <section class="hero" aria-label="今日學習計畫">
          <img class="hero-img" src="assets/brand/hero.webp" alt="" width="1800" height="1200">
          <div class="hero-body">
            <span class="hero-flight">FLIGHT ${flight} · ${levelNow.lv} → ${levelNow.lv === 990 ? '990' : nextLv.lv} · 今日航程</span>
            ${doneToday
              ? `<h2>今日航程完成</h2><p>新詞 ${d.n} 個、複習 ${d.r} 次。明天同一時間，我們再出發。</p>`
              : `<h2>新詞<em class="num">${pendingNew.length}</em>${due.length ? `<small>複習 ${due.length}</small>` : ''}</h2><p>約 ${mins} 分鐘。先溫故，再知新。</p>`}
            ${faces.length ? `<div class="faces"><div class="faces-stack">${faces.map((w) => art(w)).join('')}</div><span>${doneToday ? '' : '今天會遇見它們'}</span></div>` : ''}
            <div class="hero-cta">
              ${doneToday
                ? `<button class="btn" id="extra">再加 5 個新詞 ${I.arrow}</button><a class="btn ghost" href="#practice">去練習</a>`
                : `<a class="btn" href="#learn">開始今天的航程 ${I.arrow}</a>`}
            </div>
          </div>
        </section>

        ${rhythmCard()}

        ${storyFeature()}

        <section class="section">
          <div class="today-grid">
            <article class="card wotd">
              <button data-open="${wotd.id}" aria-label="打開 ${esc(wotd.w)} 詞卡">${art(wotd, { tag: true })}</button>
              <div class="wotd-body">
                <span class="eyebrow">今日一詞</span>
                <button class="wotd-word" data-open="${wotd.id}">${esc(wotd.w)}</button>
                ${pron(wotd)}
                <p><b>${esc(zhMain(wotd))}</b> <span style="color:var(--ink-3)">${wotd.s.map((s) => s[0]).join(' / ')}</span></p>
                <p class="wotd-sent">${markSentence(dailyEx(wotd))} <button class="mini-spk" data-say="${esc(dailyEx(wotd).en)}" aria-label="朗讀例句">${I.speaker}</button></p>
                <p class="wotd-zh">${esc(dailyEx(wotd).zh)}</p>
              </div>
            </article>
            <article class="card week">
              <div class="week-top"><span class="eyebrow">這一週</span><span class="badge plain lv-990">連續 ${streak()} 天</span></div>
              <div class="ring-row">
                <div class="ring" role="img" aria-label="今日新詞 ${d.n} / ${goal}">
                  <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--paper-2)" stroke-width="9"/><circle cx="60" cy="60" r="52" fill="none" stroke="var(--ochre)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - ringPct)}"/></svg>
                  <div class="ring-txt"><b class="num">${d.n}</b><span>/ ${goal} 新詞</span></div>
                </div>
                <div class="bars" aria-label="近七天學習量">
                  ${days.map((x) => `<div class="bar ${x.today ? 'is-today' : ''}" title="${x.d.getMonth() + 1}/${x.d.getDate()}：${x.v}"><i class="${x.v ? 'on' : ''}" style="height:${Math.max(7, (x.v / maxV) * 96)}px"></i><span>${WEEK[x.d.getDay()]}</span></div>`).join('')}
                </div>
              </div>
              <div class="week-stats">
                <div><b class="num">${d.n + d.r}</b><span>今日學習</span></div>
                <div><b class="num">${d.q}</b><span>今日答題</span></div>
                <div><b class="num">${acc === null ? '—' : acc + '%'}</b><span>首答正確率</span></div>
              </div>
            </article>
          </div>
        </section>

        <section class="section">
          <div class="section-head"><h2>四段航程</h2><a class="more" href="#map">看千詞星圖 →</a></div>
          <div class="legs">
            ${LEVELS.map((l) => {
              const c = counts(WORDS.filter((w) => w.lv === l.lv));
              return `<button class="leg lv-${l.lv}" data-leg="${l.lv}">
                <div class="leg-top"><span class="leg-score">${l.lv}</span><span class="leg-name">${l.name}</span></div>
                <p>${l.desc}</p>
                <div class="meter"><i class="m-mastered" style="width:${(c.mastered / c.total) * 100}%"></i><i class="m-learning" style="width:${(c.learning / c.total) * 100}%"></i></div>
                <div class="leg-foot"><span>已熟 ${c.mastered} · 學習中 ${c.learning}</span><span class="num">${c.total} 詞</span></div>
              </button>`;
            }).join('')}
          </div>
        </section>

        <section class="section">
          <div class="section-head"><h2>十五個職場停靠站</h2><a class="more" href="#atlas">打開詞庫 →</a></div>
          <div class="topics">
            ${TOPICS.map((t) => {
              const list = WORDS.filter((w) => w.t === t.k);
              const c = counts(list);
              return `<button class="topic" data-topic="${t.k}">${art(coverIdx(t.k))}<span class="topic-txt"><b>${t.zh}</b><span class="num">${c.learning + c.mastered}/${list.length}</span></span></button>`;
            }).join('')}
          </div>
        </section>
      </div>`;

    view.querySelectorAll('[data-leg]').forEach((b) => b.addEventListener('click', () => { atlasState.lv = +b.dataset.leg; atlasState.topic = 'all'; go('atlas'); }));
    view.querySelectorAll('[data-topic]').forEach((b) => b.addEventListener('click', () => { atlasState.topic = b.dataset.topic; atlasState.lv = 0; go('atlas'); }));
    const rw = $('#reward-in');
    if (rw) rw.addEventListener('change', () => { S.set.reward = rw.value.trim(); save(); viewToday(); });
    const extra = $('#extra');
    if (extra) extra.addEventListener('click', () => { S.set.goal += 5; save(); plan(); go('learn'); });
  }

  /* ======================================================
     ATLAS
     ====================================================== */
  const atlasState = { lv: 0, topic: 'all', pos: 'all', st: 'all', q: '', view: 'grid', limit: 60 };
  let listContext = [];
  function filterWords() {
    const q = fold(atlasState.q.trim());
    return WORDS.filter((w) => {
      if (atlasState.lv && w.lv !== atlasState.lv) return false;
      if (atlasState.topic !== 'all' && w.t !== atlasState.topic) return false;
      if (atlasState.pos !== 'all' && !w.s.some((s) => s[0] === atlasState.pos)) return false;
      if (atlasState.st === 'star') { if (!S.stars.includes(w.id)) return false; }
      else if (atlasState.st !== 'all' && status(w.id) !== atlasState.st) return false;
      if (q) return fold(w.w).includes(q) || zhMain(w).includes(atlasState.q.trim());
      return true;
    });
  }
  function viewAtlas() {
    view.innerHTML = `
      <div class="wrap">
        <header class="page-head atlas-head">
          <div style="display:grid;gap:10px">
            <span class="eyebrow">詞庫 · ${fmt(WORDS.length)} 詞</span>
            <h1>每個詞，都停靠在一個職場裡。</h1>
            <p class="sub">${fmt(WORDS.filter((w) => w.ar !== 's').length)} 幅單字插畫 · 美英真人發音 · KK 音標 · 依四段分數與 15 個職場場景整理</p>
          </div>
          <label class="search-field"><span class="sr-only">搜尋單字</span>${I.search}<input id="atlas-q" type="search" placeholder="搜尋英文單字或中文釋義" value="${esc(atlasState.q)}" autocomplete="off"></label>
        </header>
        <div class="filters">
          <div class="chips" role="group" aria-label="分數航段">
            <button class="chip" data-f="lv" data-v="0" aria-pressed="${atlasState.lv === 0}">所有航段</button>
            ${LEVELS.map((l) => `<button class="chip lv-${l.lv}" data-f="lv" data-v="${l.lv}" aria-pressed="${atlasState.lv === l.lv}"><span class="dot"></span>${l.lv} ${l.name}</button>`).join('')}
          </div>
          <div class="chips scroll" role="group" aria-label="職場場景">
            <button class="chip" data-f="topic" data-v="all" aria-pressed="${atlasState.topic === 'all'}">所有場景</button>
            ${TOPICS.map((t) => `<button class="chip" data-f="topic" data-v="${t.k}" aria-pressed="${atlasState.topic === t.k}">${t.zh}</button>`).join('')}
          </div>
          <div class="filter-bar">
            <div class="chips">
              <div class="seg" role="group" aria-label="學習狀態">
                ${[['all', '全部'], ['new', '未學'], ['learning', '學習中'], ['mastered', '已熟'], ['star', '收藏']].map(([v, t]) => `<button data-f="st" data-v="${v}" aria-pressed="${atlasState.st === v}">${t}</button>`).join('')}
              </div>
              <div class="seg" role="group" aria-label="詞性">
                ${[['all', '詞性'], ['n.', 'n.'], ['v.', 'v.'], ['adj.', 'adj.'], ['adv.', 'adv.']].map(([v, t]) => `<button data-f="pos" data-v="${v}" aria-pressed="${atlasState.pos === v}">${t}</button>`).join('')}
              </div>
            </div>
            <div class="filter-right">
              <span class="count num" id="atlas-count"></span>
              <div class="seg" role="group" aria-label="顯示方式">
                <button data-f="view" data-v="grid" aria-pressed="${atlasState.view === 'grid'}" aria-label="卡片">${I.grid.replace('<svg', '<svg width="16" height="16"')}</button>
                <button data-f="view" data-v="list" aria-pressed="${atlasState.view === 'list'}" aria-label="清單">${I.list.replace('<svg', '<svg width="16" height="16"')}</button>
              </div>
            </div>
          </div>
        </div>
        <div id="atlas-results" data-list></div>
        <div class="load-more" id="atlas-more"></div>
      </div>`;
    const input = $('#atlas-q');
    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { atlasState.q = input.value; atlasState.limit = 60; paintAtlas(); }, 120); });
    view.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => {
      const f = b.dataset.f;
      atlasState[f] = f === 'lv' ? +b.dataset.v : b.dataset.v;
      atlasState.limit = 60;
      view.querySelectorAll(`[data-f="${f}"]`).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      paintAtlas();
    }));
    paintAtlas();
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((ents) => { if (ents.some((e) => e.isIntersecting) && listContext.length > atlasState.limit) { atlasState.limit += 60; paintAtlas(true); } }, { rootMargin: '400px' });
      io.observe($('#atlas-more'));
    }
    cleanup = () => io && io.disconnect();
  }
  function paintAtlas() {
    const list = filterWords();
    listContext = list.map((w) => w.id);
    $('#atlas-count').textContent = `${fmt(list.length)} 個結果`;
    const shown = list.slice(0, atlasState.limit);
    const box = $('#atlas-results');
    if (!list.length) {
      box.innerHTML = `<div class="empty"><img src="assets/brand/empty.webp" alt="" width="480" height="480"><b>沒有符合的單字</b><span>試試放寬航段、場景或狀態篩選，或換個關鍵字。</span><button class="btn ghost small" id="clear-f">清除所有篩選</button></div>`;
      $('#clear-f').addEventListener('click', () => { Object.assign(atlasState, { lv: 0, topic: 'all', pos: 'all', st: 'all', q: '', limit: 60 }); viewAtlas(); });
    } else if (atlasState.view === 'grid') {
      box.innerHTML = `<div class="grid">${shown.map((w) => `
        <button class="wcard" data-open="${w.id}">
          ${art(w, { tag: true })}
          <div class="wcard-body">
            <div class="wcard-top"><span class="wcard-word">${esc(w.w)}</span><span class="wcard-meta">${lvBadge(w.lv)}<span class="st ${status(w.id)}" title="${STATUS_ZH[status(w.id)]}"></span></span></div>
            <span class="wcard-zh"><i>${w.s[0][0]}</i>${esc(zhMain(w))}</span>
          </div>
        </button>`).join('')}</div>`;
    } else {
      box.innerHTML = `<div class="list">${shown.map((w) => `
        <button class="wrow" data-open="${w.id}">
          ${art(w)}
          <span class="w">${esc(w.w)}</span>
          <span class="k">${kkHtml(w)}</span>
          <span class="z"><i>${w.s[0][0]}</i>${esc(zhMain(w))}</span>
          ${lvBadge(w.lv)}
          <span class="st ${status(w.id)}" title="${STATUS_ZH[status(w.id)]}"></span>
        </button>`).join('')}</div>`;
    }
    const more = $('#atlas-more');
    more.innerHTML = list.length > atlasState.limit ? `<button class="btn ghost" id="more-btn">再顯示 ${Math.min(60, list.length - atlasState.limit)} 個</button>` : '';
    const mb = $('#more-btn');
    if (mb) mb.addEventListener('click', () => { atlasState.limit += 60; paintAtlas(); });
  }

  /* ======================================================
     ENTRY (word card)
     ====================================================== */
  let entryCtx = null;
  let entrySource = null;
  function openEntry(id, ctx, fromHash, trigger) {
    const srcArt = trigger && !trigger.closest('.overlay') ? trigger.querySelector('.art') : null;
    if (srcArt && !$('.overlay.is-entry') && document.startViewTransition && !reducedMotion()) {
      entrySource = srcArt;
      srcArt.style.viewTransitionName = 'word-art';
      vt('modal', () => {
        srcArt.style.viewTransitionName = '';
        openEntryNow(id, ctx, fromHash);
        const art = $('.overlay.is-entry .entry-side > .art');
        if (art) art.style.viewTransitionName = 'word-art';
      }, () => { const art = $('.overlay.is-entry .entry-side > .art'); if (art) art.style.viewTransitionName = ''; });
      return;
    }
    if (!$('.overlay.is-entry')) entrySource = srcArt;
    openEntryNow(id, ctx, fromHash);
  }
  function openEntryNow(id, ctx, fromHash) {
    const w = BY_ID.get(id);
    if (!w) return;
    entryCtx = ctx && ctx.length ? ctx : entryCtx && entryCtx.includes(id) ? entryCtx : null;
    let ov = $('.overlay.is-entry');
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'overlay is-entry';
      ov.setAttribute('role', 'dialog');
      ov.setAttribute('aria-modal', 'true');
      ov.innerHTML = '<div class="sheet"></div>';
      document.body.appendChild(ov);
      document.documentElement.classList.add('is-locked');
      ov.addEventListener('click', (e) => { if (e.target === ov) closeEntry(); });
      ov._prevFocus = document.activeElement;
    }
    ov.setAttribute('aria-label', `${w.w} 詞卡`);
    const sheet = ov.querySelector('.sheet');
    const st = status(id);
    const starred = S.stars.includes(id);
    const idx = entryCtx ? entryCtx.indexOf(id) : -1;
    const prev = idx > 0 ? entryCtx[idx - 1] : null;
    const next = idx >= 0 && idx < entryCtx.length - 1 ? entryCtx[idx + 1] : null;
    const pool = WORDS.filter((x) => x.t === w.t && x.id !== id && Math.abs(x.lv - w.lv) <= 200);
    const related = [...pool.filter((x) => x.ar !== 's'), ...pool.filter((x) => x.ar === 's')].sort((a, b) => (hash(a.w + id) % 97) - (hash(b.w + id) % 97)).slice(0, 6);
    const c = S.cards[id];
    sheet.innerHTML = `
      <button class="sheet-close" aria-label="關閉">${I.close}</button>
      <div class="entry">
        <div class="entry-side">
          ${art(w, { full: true, tag: true })}
          <div class="entry-actions">
            <button class="btn ghost small" id="e-star" aria-pressed="${starred}">${starred ? I.starOn : I.star}${starred ? '已收藏' : '收藏'}</button>
            ${st === 'mastered' ? '<button class="btn ghost small" id="e-forget">重新學習</button>' : '<button class="btn ghost small" id="e-known">我已經會了</button>'}
          </div>
          <p class="entry-state">${st === 'new' ? '還沒學過。加入今天的航程，或直接標為已會。' : st === 'mastered' ? `已熟，下次複習：${new Date(c.due).toLocaleDateString('zh-TW')}` : `學習中，已複習 ${c.reps} 次，下次：${c.due <= Date.now() ? '現在' : ivlLabel(c) + '後'}`}</p>
          ${entryCtx ? `<div class="entry-nav"><button class="btn ghost small" id="e-prev" ${prev ? '' : 'disabled'}>${I.left}上一個</button><span>${idx + 1} / ${entryCtx.length}</span><button class="btn ghost small" id="e-next" ${next ? '' : 'disabled'}>下一個${I.right}</button></div>` : ''}
        </div>
        <div class="entry-main">
          <div class="entry-meta">${lvBadge(w.lv, true)}<span class="badge plain">${TP[w.t].zh}</span></div>
          <div class="entry-no"><span>№ ${pad(w.id, 4)}</span><i></i><span>TOEIC VOYAGE</span></div>
          <h2 class="entry-word">${esc(w.w)}</h2>
          ${pron(w)}
          <p class="def-line"><span class="def-tag">EN</span>${esc(w.d)}</p>
          <div class="senses">${sensesByPos(w).map(([pos, zh]) => `<div class="sense"><i>${pos}<small>${POS_ZH[pos] || ''}</small></i><b>${esc(zh)}</b></div>`).join('')}</div>
          ${w.syn.length || w.ant.length ? `<div class="nyms">
            ${w.syn.length ? `<div class="nym"><span class="block-label">近似詞</span><div class="nym-list">${w.syn.map(wordLink).join('')}</div></div>` : ''}
            ${w.ant.length ? `<div class="nym"><span class="block-label">相反詞</span><div class="nym-list">${w.ant.map(wordLink).join('')}</div></div>` : ''}
          </div>` : ''}
          <div class="examples">
            ${[dailyEx(w), toeicEx(w)].map((ex) => `<div class="example">
              <span class="ex-tag ${ex.k === 't' ? 'is-toeic' : ''}">${ex.k === 't' ? '多益例句' : '日常例句'}</span>
              <p class="en-line">${markSentence(ex)} <button class="mini-spk" data-say="${esc(ex.en)}" aria-label="朗讀例句">${I.speaker}</button></p>
              <p class="zh-line">${esc(ex.zh)}</p>
            </div>`).join('')}
            ${storyCue(w)}
          </div>
          <div>
            <div class="block-label">常用搭配</div>
            <div class="cols">${w.col.map((c) => `<div class="col"><b>${esc(c[0])}</b><span>${esc(c[1])}</span></div>`).join('')}</div>
          </div>
          ${w.tip ? `<div class="tip"><div class="block-label">多益考點</div><p>${esc(w.tip)}</p></div>` : ''}
          <div>
            <div class="block-label">同場景單字 · ${TP[w.t].zh}</div>
            <div class="related">${related.map((r) => `<button data-open="${r.id}">${art(r)}<span style="min-width:0"><b>${esc(r.w)}</b><span>${esc(r.s[0][1])}</span></span></button>`).join('')}</div>
          </div>
        </div>
      </div>`;
    sheet.scrollTop = 0;
    loadFull(sheet);
    sheet.querySelector('.sheet-close').addEventListener('click', closeEntry);
    $('#e-star').addEventListener('click', () => { const on = toggleStar(id); toast(on ? `已收藏 ${w.w}` : `已取消收藏 ${w.w}`); openEntry(id); refreshUnder(); });
    const kn = $('#e-known');
    if (kn) kn.addEventListener('click', () => { markKnown(id); sfx('ignite'); burstFrom(kn, 26, 0.8); toast(`${w.w} 標為已熟，21 天後再複習`); openEntry(id); refreshUnder(); });
    const fg = $('#e-forget');
    if (fg) fg.addEventListener('click', () => { forget(id); toast(`${w.w} 已重設為未學`); openEntry(id); refreshUnder(); });
    if (prev) $('#e-prev').addEventListener('click', () => openEntry(prev));
    if (next) $('#e-next').addEventListener('click', () => openEntry(next));
    sheet.querySelector('.sheet-close').focus({ preventScroll: true });
    if (!fromHash) { try { history.replaceState(null, '', `#word-${id}`); } catch (e) { /* sandboxed */ } }
  }
  function closeEntry() {
    const ov = $('.overlay.is-entry');
    if (!ov) return;
    const src = entrySource; entrySource = null;
    const art = ov.querySelector('.entry-side > .art');
    if (src && src.isConnected && art && document.startViewTransition && !reducedMotion()) {
      art.style.viewTransitionName = 'word-art';
      vt('modal', () => { art.style.viewTransitionName = ''; closeEntryNow(ov); src.style.viewTransitionName = 'word-art'; }, () => { src.style.viewTransitionName = ''; });
      return;
    }
    closeEntryNow(ov);
  }
  function closeEntryNow(ov) {
    const back = ov._prevFocus;
    ov.remove();
    entryCtx = null;
    if (!$('.overlay')) document.documentElement.classList.remove('is-locked');
    try { history.replaceState(null, '', `#${route.hash || route.name}`); } catch (e) { /* sandboxed */ }
    if (back && back.focus) back.focus({ preventScroll: true });
  }
  function refreshUnder() {
    if (route.name === 'atlas') paintAtlas();
    else if (route.name === 'today' || route.name === 'me') VIEWS[route.name]();
    else if (route.name === 'map') { if (mapState.galaxy) mapState.galaxy.setStates(); else drawMap(); }
  }

  /* ---------- search palette ---------- */
  function openPalette() {
    if ($('.palette')) return;
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', '搜尋單字');
    ov.innerHTML = `<div class="palette"><label class="search-field"><span class="sr-only">搜尋</span>${I.search}<input id="pal-q" type="search" placeholder="輸入英文或中文，例如 invoice、報價" autocomplete="off"></label><div class="pal-list" role="listbox" id="pal-list"></div><div class="pal-hint"><span>↑↓ 選擇</span><span>Enter 打開詞卡</span><span>Esc 關閉</span></div></div>`;
    document.body.appendChild(ov);
    document.documentElement.classList.add('is-locked');
    const input = $('#pal-q', ov);
    const listEl = $('#pal-list', ov);
    let res = [];
    let sel = 0;
    const paint = () => {
      const q = input.value.trim();
      const fq = fold(q);
      if (!q) res = WORDS.filter((w) => w.tip).slice(0, 8);
      else {
        res = WORDS.map((w) => {
          const fw = fold(w.w);
          let score = -1;
          if (fw === fq) score = 100; else if (fw.startsWith(fq)) score = 80 - fw.length; else if (fw.includes(fq)) score = 40; else if (zhMain(w).includes(q)) score = 30;
          return [score, w];
        }).filter((x) => x[0] >= 0).sort((a, b) => b[0] - a[0]).slice(0, 30).map((x) => x[1]);
      }
      sel = Math.min(sel, Math.max(0, res.length - 1));
      listEl.innerHTML = res.length
        ? (q ? '' : '<div class="eyebrow" style="padding:8px 14px">附多益考點的字</div>') + res.map((w, i) => `<button class="pal-item" role="option" data-i="${i}" aria-selected="${i === sel}">${art(w)}<span><b>${esc(w.w)}</b><span>${esc(zhShort(w))}</span></span>${lvBadge(w.lv)}</button>`).join('')
        : '<div class="empty" style="padding:30px"><span>找不到這個字。目前詞庫收錄 1,000 個多益常考字。</span></div>';
    };
    const close = () => { ov.remove(); if (!$('.overlay')) document.documentElement.classList.remove('is-locked'); };
    const pick = (i) => { const w = res[i]; if (!w) return; close(); openEntry(w.id, res.map((x) => x.id)); };
    input.addEventListener('input', () => { sel = 0; paint(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(res.length - 1, sel + 1); paint(); listEl.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); paint(); listEl.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter') { e.preventDefault(); pick(sel); }
    });
    listEl.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) pick(+b.dataset.i); });
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov._close = close;
    paint();
    input.focus();
  }

  /* ======================================================
     LEARN (flashcards)
     ====================================================== */
  let session = null;
  function startSession() {
    const due = dueIds();
    const fresh = plan().filter((id) => !S.cards[id]);
    session = { queue: [...due, ...fresh], total: due.length + fresh.length, done: 0, revealed: false, tally: { 1: 0, 2: 0, 3: 0, 4: 0 }, seen: new Set() };
  }
  function viewLearn() {
    if (!session || !session.queue.length) { startSession(); if (session.queue.length) sfx('start'); }
    paintLearn();
    const onKey = (e) => {
      if ($('.overlay') || !session || e.target.matches('input, textarea')) return;
      if (e.key === ' ' || e.key === 'Enter') { if (!session.revealed && session.queue.length) { e.preventDefault(); reveal(); } }
      else if (session.revealed && ['1', '2', '3', '4'].includes(e.key)) rate(+e.key);
    };
    document.addEventListener('keydown', onKey);
    cleanup = () => document.removeEventListener('keydown', onKey);
  }
  function reveal() { session.revealed = true; sfx('flip'); paintLearn(); }
  function rate(g) {
    if (g >= 3) { sfx('correct'); burstFrom(view.querySelector(`[data-g="${g}"]`), 18, 0.6); } else sfx('page');
    const id = session.queue.shift();
    const c = grade(id, g);
    session.tally[g]++;
    if (c.due - Date.now() < 20 * MIN) session.queue.splice(Math.min(3, session.queue.length), 0, id);
    else session.done++;
    session.revealed = false;
    vt('card', paintLearn);
  }
  function paintLearn() {
    const s = session;
    const pct = s.total ? (s.done / s.total) * 100 : 100;
    if (!s.queue.length) {
      if (s.total) { sfx('complete'); setTimeout(() => burst(innerWidth / 2, innerHeight * 0.38, 70, 1.4), 120); }
      const d = today();
      view.innerHTML = `<div class="wrap"><div class="learn">
        <div class="done">
          <img src="assets/brand/done.webp" alt="" width="480" height="480">
          <div class="done-body">
            <span class="eyebrow">本日航程完成</span>
            <h2>${s.story ? `第 ${s.story} 章的單字都學過一輪了。` : s.total ? '今天的單字都平安降落了。' : '今天沒有待學的單字。'}</h2>
            <p style="color:var(--ink-2)">${s.total ? `這一輪記得 ${s.tally[3] + s.tally[4]} 次、模糊 ${s.tally[2]} 次、忘了 ${s.tally[1]} 次。` : '新詞與複習都完成了。'}今天累計新詞 ${d.n} 個、複習 ${d.r} 次。</p>
            <div class="row-btns">
              ${s.story
                ? `<button class="btn" data-cloze="${s.story}">用故事填空驗收 ${I.arrow}</button><button class="btn ghost" data-story="${s.story}">回到第 ${s.story} 章</button>`
                : `<a class="btn" href="#practice">用練習題鞏固 ${I.arrow}</a>${nextChapter() && nextChapter().words.some((id) => S.cards[id]) ? `<button class="btn ghost" data-story="${nextChapter().no}">讀故事第 ${nextChapter().no} 章</button>` : ''}<button class="btn ghost" id="more5">再學 5 個新詞</button>`}
            </div>
          </div>
        </div></div></div>`;
      const m5 = $('#more5');
      if (m5) m5.addEventListener('click', () => { S.set.goal += 5; save(); plan(); session = null; viewLearn(); });
      const cz = view.querySelector('[data-cloze]');
      if (cz) cz.addEventListener('click', () => { const no = +cz.dataset.cloze; session = null; storyState.cloze = { no, pending: true }; go(`story-${no}`); });
      return;
    }
    const w = BY_ID.get(s.queue[0]);
    const c = S.cards[w.id];
    const isNew = !c;
    const opts = [1, 2, 3, 4].map((g) => ivlLabel(nextState(c, g)));
    view.innerHTML = `<div class="wrap"><div class="learn">
      <div class="learn-top">
        <a class="icon-btn" href="#today" aria-label="離開學習">${I.close}</a>
        <div class="meter" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
        <span class="count num">${s.done} / ${s.total}</span>
      </div>
      <article class="flash ${s.revealed ? '' : 'is-front'}">
        ${art(w, { full: true, tag: true })}
        <div class="flash-body">
          <div class="flash-head">
            <div style="display:flex;gap:8px">${lvBadge(w.lv, true)}<span class="badge plain">${TP[w.t].zh}</span></div>
            <span class="badge plain ${isNew ? 'lv-800' : 'lv-990'}">${isNew ? '新詞' : '複習'}</span>
          </div>
          <div class="flash-word">${esc(w.w)}</div>
          ${pron(w)}
          ${s.revealed ? `
            <div class="flash-back">
              <p class="def-line"><span class="def-tag">EN</span>${esc(w.d)}</p>
              <div class="senses">${sensesByPos(w).map((x) => `<div class="sense"><i>${x[0]}</i><b>${esc(x[1])}</b></div>`).join('')}</div>
              ${storyCue(w, true)}
              <div class="example"><span class="ex-tag">多益例句</span><p class="en-line">${markSentence(toeicEx(w))} <button class="mini-spk" data-say="${esc(toeicEx(w).en)}" aria-label="朗讀例句">${I.speaker}</button></p><p class="zh-line">${esc(toeicEx(w).zh)}</p></div>
              <div class="cols compact">${w.col.slice(0, 2).map((c) => `<div class="col"><b>${esc(c[0])}</b><span>${esc(c[1])}</span></div>`).join('')}</div>
              ${w.tip ? `<div class="tip"><div class="block-label">多益考點</div><p>${esc(w.tip)}</p></div>` : ''}
            </div>` : `<p class="flash-hint">看著畫面、聽發音，先用英文想：它在說什麼？能不能用它說一句話？再翻面確認。</p>`}
        </div>
      </article>
      ${s.revealed ? `
        <div class="rates">
          <button class="rate r1" data-g="1">忘了<small>${opts[0]}</small></button>
          <button class="rate r2" data-g="2">模糊<small>${opts[1]}</small></button>
          <button class="rate r3" data-g="3">記得<small>${opts[2]}</small></button>
          <button class="rate r4" data-g="4">很簡單<small>${opts[3]}</small></button>
        </div>
        <p class="kbd-hint">鍵盤 <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> 評分　按鈕下方是下次複習的時間</p>`
      : `<button class="btn reveal-btn" id="reveal">翻面看答案</button><p class="kbd-hint">鍵盤 <kbd>Space</kbd> 翻面</p>`}
    </div></div>`;
    loadFull(view);
    const rv = $('#reveal');
    if (rv) rv.addEventListener('click', reveal);
    view.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => rate(+b.dataset.g)));
    if (!s.revealed && !s.seen.has(w.id)) { s.seen.add(w.id); if (s.interacted) playWord(w); }
    s.interacted = true;
  }

  /* ======================================================
     PRACTICE
     ====================================================== */
  const MODES = [
    { k: 'cloze', part: 'Part 5 句子填空', zh: '例句填空', desc: '例句挖空，四個同詞性選項選一個，跟多益 Part 5 詞彙題同樣的考法。', img: 'data' },
    { k: 'pic', part: 'Picture → Word', zh: '看圖選字', desc: '只看插畫，直接想出英文單字。不繞道中文，畫面和字直接連在一起。', img: 'topic-education' },
    { k: 'def', part: 'English → Word', zh: '英英釋義', desc: '讀一句簡單的英文解釋，選出它在說哪個字，練 Part 7 換句話說的反射。', img: 'topic-thinking' },
    { k: 'listen', part: 'Part 1–2 聽力暖身', zh: '聽音辨詞', desc: '只聽真人發音，選出你聽到的單字，練多益聽力的字音反射。', img: 'listen' },
    { k: 'spell', part: 'Spelling', zh: '拼字挑戰', desc: '看英文解釋與例句提示，把單字完整拼出來。', img: 'typing' },
  ];
  const pracState = { scope: 'all', mode: null, qs: [], i: 0, answered: false, results: [] };
  function scopePool(scope) {
    if (scope === 'star') return WORDS.filter((w) => S.stars.includes(w.id));
    if (scope === 'learning') return WORDS.filter((w) => status(w.id) !== 'new');
    if (/^\d+$/.test(scope)) return WORDS.filter((w) => w.lv === +scope);
    return WORDS;
  }
  function viewPractice() {
    if (pracState.mode && pracState.qs.length) { paintQuiz(); return; }
    const pool = scopePool(pracState.scope);
    view.innerHTML = `<div class="wrap">
      <header class="page-head">
        <span class="eyebrow">闖關 · 50 關 × 20 字 · 全程用英文線索作答</span>
        <h1>一關 15 分鐘，把 20 個字練到會用。</h1>
        <p class="sub">每一關三步：看圖聽音大聲唸、用圖片／英文解釋／例句回想到連續答對，最後挑 3 個字自己造句。題目只給英文線索，不在中英之間來回翻譯。</p>
      </header>
      ${sprintMap()}
      <section class="section">
        <div class="section-head"><h2>自由練習</h2><span class="more">每輪 10 題 · 只有第一次作答計入正確率</span></div>
        <div style="display:grid;gap:12px">
          <span class="eyebrow">出題範圍</span>
          <div class="chips">
            ${[['all', '全部 1,000 詞'], ...LEVELS.map((l) => [String(l.lv), `${l.lv} ${l.name}`]), ['learning', '我學過的'], ['star', '我的收藏']].map(([v, t]) => `<button class="chip" data-scope="${v}" aria-pressed="${pracState.scope === v}">${t}</button>`).join('')}
          </div>
          <p style="font-size:13px;color:var(--ink-3)">目前範圍共 <b class="num">${pool.length}</b> 個單字${pool.length < 4 ? '，至少需要 4 個字才能出題。' : '。'}</p>
        </div>
        <div class="modes">
          ${MODES.map((m) => `<button class="mode" data-mode="${m.k}" ${pool.length < 4 ? 'disabled' : ''}><img src="assets/brand/${m.img}.webp" alt="" width="480" height="480" loading="lazy"><span class="mode-txt"><span class="m-part">${m.part}</span><h3>${m.zh}</h3><p>${m.desc}</p></span></button>`).join('')}
        </div>
      </section>
      ${S.notes.length ? `<section class="section">
        <div class="section-head"><h2>我的造句本</h2><span class="more">${S.notes.length} 句</span></div>
        <div class="notes" data-list>${S.notes.slice(-12).reverse().map((n) => { const w = BY_ID.get(n.id); return `<div class="note"><button class="note-w" data-open="${w.id}">${esc(w.w)}</button><p>${esc(n.t)}</p><span>${esc(n.at)}</span></div>`; }).join('')}</div>
      </section>` : ''}
    </div>`;
    listContext = S.notes.slice(-12).reverse().map((n) => n.id);
    view.querySelectorAll('[data-scope]').forEach((b) => b.addEventListener('click', () => { pracState.scope = b.dataset.scope; viewPractice(); }));
    view.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => startQuiz(b.dataset.mode)));
    view.querySelectorAll('[data-passn]').forEach((b) => b.addEventListener('click', () => { S.set.passN = +b.dataset.passn; save(); viewPractice(); }));
  }

  // English inflection for distractors, mirroring the answer's form.
  // Final-stress verbs that double their last consonant, and irregular past forms used in the word list.
  const DOUBLE = new Set(['permit', 'transfer', 'occur', 'submit', 'commit', 'deter', 'incur', 'offset', 'admit', 'refer', 'prefer', 'control', 'regret']);
  const IRREG_ED = { seek: 'sought', draw: 'drawn', bear: 'borne', withdraw: 'withdrawn', rise: 'risen', undertake: 'undertaken', oversee: 'overseen',
    withhold: 'withheld', shrink: 'shrunk', offset: 'offset', forecast: 'forecast', broadcast: 'broadcast', strike: 'struck', fit: 'fit', lead: 'led', pay: 'paid', buy: 'bought' };
  const isCVC = (w) => /^[^aeiou]*[aeiou][bdgklmnprt]$/.test(w) || DOUBLE.has(w);
  function inflS(w) { if (/(s|x|z|ch|sh)$/.test(w)) return w + 'es'; if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies'; return w + 's'; }
  function inflEd(w) { if (IRREG_ED[w]) return IRREG_ED[w]; if (/e$/.test(w)) return w + 'd'; if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied'; if (isCVC(w)) return w + w.slice(-1) + 'ed'; return w + 'ed'; }
  function inflIng(w) { if (/ie$/.test(w)) return w.slice(0, -2) + 'ying'; if (/[^e]e$/.test(w)) return w.slice(0, -1) + 'ing'; if (isCVC(w)) return w + w.slice(-1) + 'ing'; return w + 'ing'; }
  function formKind(w) {
    const f = toeicEx(w).f.toLowerCase();
    const b = w.w.toLowerCase();
    if (f === b) return '';
    if (f.endsWith('ing')) return 'ing';
    if (f.endsWith('s') && !b.endsWith('s')) return 's';
    return 'ed';
  }
  function applyForm(word, kind, cap) {
    let out = word;
    if (/\s|-/.test(word)) out = word;
    else if (kind === 's') out = inflS(word);
    else if (kind === 'ed') out = inflEd(word);
    else if (kind === 'ing') out = inflIng(word);
    return cap ? out[0].toUpperCase() + out.slice(1) : out;
  }
  const ZH_TERMS = new Map();
  const zhTerms = (w) => {
    if (!ZH_TERMS.has(w.id)) ZH_TERMS.set(w.id, new Set(w.s.flatMap((s) => s[1].split(/[；;、，,（）()…]/)).map((t) => t.trim()).filter((t) => t.length >= 2)));
    return ZH_TERMS.get(w.id);
  };
  // near-synonyms (listed synonyms or a shared Chinese gloss) would make a question ambiguous
  function confusable(a, b) {
    if (a.syn.some((t) => fold(t) === fold(b.w)) || b.syn.some((t) => fold(t) === fold(a.w))) return true;
    const A = zhTerms(a);
    for (const t of zhTerms(b)) if (A.has(t)) return true;
    return false;
  }
  function distractors(w, n, pool) {
    const pos = posOf(w);
    const zh = w.s[0][1];
    const ok = (x) => x.id !== w.id && x.s[0][1] !== zh && fold(x.w) !== fold(w.w) && !confusable(w, x);
    let c = shuffle(pool.filter((x) => ok(x) && posOf(x) === pos && x.lv === w.lv));
    if (c.length < n) c = c.concat(shuffle(WORDS.filter((x) => ok(x) && posOf(x) === pos && !c.includes(x))));
    if (c.length < n) c = c.concat(shuffle(WORDS.filter((x) => ok(x) && !c.includes(x))));
    return c.slice(0, n);
  }
  function startQuiz(mode) {
    const pool = scopePool(pracState.scope);
    if (pool.length < 4) return;
    // prefer words that are due or learning, then the rest
    const voiced = pool.filter((w) => w.u);
    const drawn = pool.filter((w) => w.ar === 'w');
    if (mode === 'pic' && drawn.length < 4) { toast('這個範圍裡有專屬插畫的字不到 4 個，換個範圍試試。'); return; }
    const picks = shuffle(mode === 'listen' && voiced.length >= 10 ? voiced : mode === 'pic' ? drawn : pool).slice(0, 10);
    pracState.mode = mode;
    pracState.qs = picks.map((w) => {
      const q = { id: w.id };
      if (mode === 'cloze' || mode === 'spell') q.ex = nextCloze(w);
      if (mode === 'spell') return q;
      const ds = distractors(w, 3, pool);
      if (mode === 'cloze') {
        const X = q.ex;
        const cap = X.a === 0;
        q.opts = shuffle([{ id: w.id, t: X.f }, ...ds.map((d) => ({ id: d.id, t: applyForm(d.w, X.kind, cap) }))]);
      } else {
        q.opts = shuffle([w, ...ds].map((x) => ({ id: x.id })));
      }
      return q;
    });
    save();
    pracState.i = 0;
    pracState.answered = false;
    pracState.results = [];
    paintQuiz();
  }
  function recordAnswer(id, ok) {
    pracState.results.push({ id, ok });
    const d = today();
    d.q++;
    if (ok) d.c++;
    save();
    sfx(ok ? 'correct' : 'wrong');
    pracState.streak = ok ? (pracState.streak || 0) + 1 : 0;
    if (ok && pracState.streak > 0 && pracState.streak % 3 === 0) setTimeout(() => sfx('streak'), 280);
  }
  function paintQuiz() {
    const P = pracState;
    const mode = MODES.find((m) => m.k === P.mode);
    if (P.i >= P.qs.length) return paintResult();
    const q = P.qs[P.i];
    const w = BY_ID.get(q.id);
    const pct = (P.i / P.qs.length) * 100;
    const X = q.ex || toeicEx(w);
    let body = '';
    if (P.mode === 'cloze') {
      const before = X.en.slice(0, X.a);
      const after = X.en.slice(X.a + X.f.length);
      body = `<p class="q-sent">${esc(before)}<span class="blank" id="blank">${P.answered ? esc(X.f) : '&nbsp;'}</span>${esc(after)}</p>
        ${P.answered && X.zh ? `<p class="q-sub" style="text-align:left">${esc(X.zh)}</p>` : ''}`;
    } else if (P.mode === 'pic') {
      body = `<div class="q-pic">${art(w, { full: true })}</div><p class="q-sub">這張圖在說哪個字？</p>`;
    } else if (P.mode === 'def') {
      body = `<div class="q-def"><span class="def-tag">${POS_EN[posOf(w)] || posOf(w)}</span><p>${esc(w.d)}</p></div>`;
    } else if (P.mode === 'listen') {
      body = `<div class="listen-stage"><img src="assets/brand/listen.webp" alt="" width="480" height="480"><button class="big-listen" data-word="${w.id}" aria-label="再聽一次">${I.listen}</button><p class="q-sub">點擊播放，可重複聆聽。${P.answered ? '' : ` <button class="btn ghost small" data-word="${w.id}" data-slow="1">慢速</button>`}</p></div>`;
    } else if (P.mode === 'spell') {
      const hint = X.f[0] + X.f.slice(1).replace(/[A-Za-zÀ-ÿ]/g, '_');
      body = `<div class="q-hero ${w.ar === 'w' ? '' : 'is-solo'}">${w.ar === 'w' ? art(w) : ''}<div class="q-def is-small"><span class="def-tag">${POS_EN[posOf(w)] || posOf(w)}</span><p>${esc(w.d)}</p></div></div>
        <p class="q-sent" style="font-size:19px">${esc(X.en.slice(0, X.a))}<span class="blank">${P.answered ? esc(X.f) : esc(hint)}</span>${esc(X.en.slice(X.a + X.f.length))}</p>
        <form class="spell" id="spell-form" autocomplete="off"><label class="sr-only" for="spell-in">輸入單字</label><input id="spell-in" type="text" autocapitalize="off" spellcheck="false" placeholder="輸入空格裡的單字" ${P.answered ? 'disabled' : ''}><button class="btn" type="submit" ${P.answered ? 'disabled' : ''}>確認</button></form>`;
    }
    const opts = q.opts ? `<div class="opts">${q.opts.map((o, i) => {
      const ow = BY_ID.get(o.id);
      const label = P.mode === 'cloze' ? `<span class="t en">${esc(o.t)}</span>` : `<span class="t en">${esc(ow.w)}</span>`;
      let cls = '';
      if (P.answered) { if (o.id === w.id) cls = 'ok'; else if (o.id === q.picked) cls = 'no'; }
      return `<button class="opt ${cls}" data-o="${o.id}" ${P.answered ? 'disabled' : ''}><span class="k">${'ABCD'[i]}</span>${label}</button>`;
    }).join('')}</div>` : '';
    const ok = q.ok;
    const fb = P.answered ? `<div class="feedback">
        <button data-open="${w.id}" aria-label="打開 ${esc(w.w)} 詞卡">${art(w)}</button>
        <div style="display:grid;gap:4px;min-width:0">
          <span class="fb-title ${ok ? 'ok' : 'no'}">${ok ? '答對了' : `正確答案：${esc(P.mode === 'cloze' || P.mode === 'spell' ? X.f : w.w)}`}</span>
          <span><button data-open="${w.id}" style="font:600 19px var(--serif);text-decoration:underline;text-underline-offset:3px">${esc(w.w)}</button> ${kkHtml(w)}</span>
          <span class="fb-def">${esc(w.d)}<small>${esc(zhMain(w))}</small></span>
          ${w.tip && !ok ? `<span class="fb-tip">考點：${esc(w.tip)}</span>` : ''}
        </div>
      </div>
      <button class="btn" id="q-next" style="justify-self:end">${P.i === P.qs.length - 1 ? '看結果' : '下一題'} ${I.arrow}</button>` : '';
    view.innerHTML = `<div class="wrap"><div class="quiz">
      <div class="learn-top">
        <button class="icon-btn" id="q-exit" aria-label="結束練習">${I.close}</button>
        <div class="meter"><i style="width:${pct}%"></i></div>
        <span class="count num">${P.i + 1} / ${P.qs.length}</span>
      </div>
      <article class="q-card">
        <div class="flash-head"><span class="eyebrow">${mode.part} · ${mode.zh}</span>${lvBadge(w.lv)}</div>
        ${body}
        ${opts}
      </article>
      ${fb}
      ${!P.answered && q.opts ? '<p class="kbd-hint">鍵盤 <kbd>1</kbd>–<kbd>4</kbd> 或 <kbd>A</kbd>–<kbd>D</kbd> 作答</p>' : ''}
    </div></div>`;
    $('#q-exit').addEventListener('click', () => { P.mode = null; P.qs = []; viewPractice(); });
    view.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => answer(+b.dataset.o)));
    const nx = $('#q-next');
    if (nx) { nx.addEventListener('click', nextQ); nx.focus({ preventScroll: true }); }
    const form = $('#spell-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = fold($('#spell-in').value.trim());
        if (!v) return;
        const good = v === fold(X.f) || v === fold(w.w);
        q.ok = good;
        P.answered = true;
        recordAnswer(w.id, good);
        if (good) playWord(w);
        paintQuiz();
        if (good) burstFrom($('.spell'), 26, 0.8);
      });
      if (!P.answered) $('#spell-in').focus({ preventScroll: true });
      $('#spell-in').addEventListener('keydown', (e) => { if (e.key.length === 1 || e.key === 'Backspace') sfx('key'); });
    }
    if (P.mode === 'listen' && !P.answered && !q.played) { q.played = true; setTimeout(() => playWord(w), 250); }
  }
  function answer(oid) {
    const P = pracState;
    if (P.answered) return;
    const q = P.qs[P.i];
    q.picked = oid;
    q.ok = oid === q.id;
    P.answered = true;
    recordAnswer(q.id, q.ok);
    const w = BY_ID.get(q.id);
    if (P.mode === 'cloze') speak(q.ex.en); else playWord(w);
    paintQuiz();
    if (q.ok) burstFrom($('.opt.ok'), 26, 0.8);
  }
  function nextQ() { pracState.i++; pracState.answered = false; vt('card', paintQuiz); }
  function paintResult() {
    const P = pracState;
    const right = P.results.filter((r) => r.ok).length;
    const wrong = P.results.filter((r) => !r.ok).map((r) => BY_ID.get(r.id));
    sfx('complete');
    if (right / P.results.length >= 0.8) setTimeout(() => burst(innerWidth / 2, innerHeight * 0.35, 70, 1.4), 120);
    const score = Math.round((right / P.results.length) * 100);
    const mode = MODES.find((m) => m.k === P.mode);
    const msg = score === 100 ? '全對，這組單字已經穩定。' : score >= 80 ? '表現穩定，把錯的幾個再看一次。' : score >= 50 ? '一半以上答對，錯的字加入收藏，明天再練。' : '先回到詞庫把這些字看熟，再回來挑戰。';
    view.innerHTML = `<div class="wrap"><div class="quiz">
      <div class="done">
        <img src="assets/brand/${score >= 80 ? 'done' : 'night'}.webp" alt="" width="480" height="480">
        <div class="done-body">
          <span class="eyebrow">${mode.part} · ${mode.zh}</span>
          <span class="score num">${right}<small style="font-size:28px;color:var(--ink-3)"> / ${P.results.length}</small></span>
          <h2>${msg}</h2>
          <div class="row-btns">
            <button class="btn" id="again">再來一輪 ${I.arrow}</button>
            <button class="btn ghost" id="other">換個題型</button>
          </div>
        </div>
      </div>
      ${wrong.length ? `<div class="result-list" data-list>
        <span class="eyebrow">答錯的單字</span>
        ${wrong.map((w) => `<button class="result-row" data-open="${w.id}">${art(w)}<b>${esc(w.w)}</b><span>${esc(zhShort(w))}</span></button>`).join('')}
        <button class="btn ghost small" id="star-wrong" style="justify-self:start">${I.star}把答錯的字加入收藏</button>
      </div>` : ''}
    </div></div>`;
    listContext = wrong.map((w) => w.id);
    $('#again').addEventListener('click', () => startQuiz(P.mode));
    $('#other').addEventListener('click', () => { P.mode = null; P.qs = []; viewPractice(); });
    const sw = $('#star-wrong');
    if (sw) sw.addEventListener('click', () => { wrong.forEach((w) => { if (!S.stars.includes(w.id)) S.stars.push(w.id); }); save(); toast(`已收藏 ${wrong.length} 個單字`); sw.disabled = true; });
  }
  document.addEventListener('keydown', (e) => {
    if (route.name !== 'practice' || !pracState.mode || $('.overlay') || e.target.matches('input, textarea')) return;
    const q = pracState.qs[pracState.i];
    if (!q) return;
    if (!pracState.answered && q.opts) {
      const k = e.key.toLowerCase();
      const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
      if (i >= 0 && q.opts[i]) { e.preventDefault(); answer(q.opts[i].id); }
    } else if (pracState.answered && e.key === 'Enter' && document.activeElement?.id !== 'q-next') { e.preventDefault(); nextQ(); }
  });

  /* ======================================================
     STORY — a serialized novel whose chapters carry the word list
     ====================================================== */
  const MARK_RE = /\[\[(\d+):([^\]]+)\]\]/g;
  const plainTale = (t) => t.replace(MARK_RE, '$2');
  const blockLines = (b) => (b.k === 'sms' ? b.en.split('\n').map((l) => l.split('|')[1]) : b.k === 'doc' ? b.en.split('\n') : [b.en]);
  // word id -> the sentence where it first appears in the story
  const STORY_HIT = new Map();
  for (const ch of CH) {
    for (const b of ch.blocks) {
      for (const line of blockLines(b)) {
        const sents = [];
        for (const piece of line.replace(/([.!?]["”]?)\s+(?=["“]?[A-Z])/g, '$1\u0001').split('\u0001')) {
          if (sents.length && /\b(Ms|Mr|Mrs|Dr|No)\.$/.test(sents[sents.length - 1])) sents[sents.length - 1] += ' ' + piece; else sents.push(piece);
        }
        for (const sent of sents) for (const m of sent.matchAll(MARK_RE)) if (!STORY_HIT.has(+m[1])) STORY_HIT.set(+m[1], { no: ch.no, sent });
      }
    }
  }
  const chapterOf = (no) => CH.find((c) => c.no === no);
  const nextChapter = () => CH.find((c) => !S.story.read[c.no]) || null;
  const learnedIn = (ch) => ch.words.filter((id) => S.cards[id]).length;
  function storyCue(w, compact) {
    const h = STORY_HIT.get(w.id);
    if (!h) return '';
    const sent = esc(h.sent).replace(MARK_RE, (m, id, f) => (+id === w.id ? `<mark>${f}</mark>` : f));
    return `<button class="story-cue ${compact ? 'is-compact' : ''}" data-story="${h.no}">
      <span class="ex-tag is-story">${I.book}故事 · 第 ${h.no} 章</span>
      <span class="story-cue-en">${sent}</span>
      <span class="story-cue-go">回到《${esc(STORY.series.zh)}》第 ${h.no} 章 ${I.arrow}</span>
    </button>`;
  }
  function storyFeature() {
    if (!CH.length) return '';
    const ch = nextChapter() || CH[CH.length - 1];
    const prev = chapterOf(ch.no - 1);
    const n = learnedIn(ch);
    return `<section class="section">
      <div class="section-head"><h2>航程故事</h2><a class="more" href="#story">全部章節 →</a></div>
      <a class="tale-feature" href="#story-${ch.no}">
        ${art(ch.cover, { full: true })}
        <div class="tale-feature-body">
          <span class="eyebrow mono">${esc(STORY.series.title)} · CHAPTER ${pad(ch.no)}</span>
          <h3>${esc(ch.zh)}<small>${esc(ch.title)}</small></h3>
          <p>${esc(prev ? prev.next : STORY.series.blurb)}</p>
          <div class="tale-feature-foot"><span>本章 ${ch.words.length} 個單字 · 已學 ${n}</span><span class="btn small">${S.story.read[ch.no] ? '重讀' : n ? '讀下去' : '先讀故事'} ${I.arrow}</span></div>
        </div>
      </a>
    </section>`;
  }

  const storyState = { cloze: null };
  function viewStory() {
    const no = route.sub;
    const ch = chapterOf(no);
    if (!ch) return paintTaleList();
    if (storyState.cloze && storyState.cloze.no === no && storyState.cloze.pending) return startCloze(ch);
    storyState.cloze = null;
    paintChapter(ch);
  }
  function paintTaleList() {
    const total = CH.reduce((a, c) => a + c.words.length, 0);
    const learned = CH.reduce((a, c) => a + learnedIn(c), 0);
    view.innerHTML = `<div class="wrap">
      <header class="page-head">
        <span class="eyebrow">航程故事 · 400 起飛段 · 試讀五章</span>
        <h1>${esc(STORY.series.zh)}</h1>
        <p class="sub">${esc(STORY.series.blurb)}</p>
      </header>
      <div class="tale-how">
        <div><b>1</b><span><strong>讀故事</strong>每章把 9–10 個 400 分段單字藏進劇情，點亮的字一按就打開詞卡。</span></div>
        <div><b>2</b><span><strong>學單字</strong>每天的新詞會照章節順序排，今天學的字，就是下一章會遇見的字。</span></div>
        <div><b>3</b><span><strong>故事填空</strong>用多益 Part 6 的考法，把字放回劇情裡。記住情節，就記住了字。</span></div>
      </div>
      <section class="section">
        <div class="section-head"><h2>章節</h2><span class="more">已學 ${learned} / ${total} 個故事單字</span></div>
        <div class="tale-list">
          ${CH.map((c) => {
            const n = learnedIn(c);
            const best = S.story.best[c.no];
            return `<a class="tale-row" href="#story-${c.no}">
              ${art(c.cover)}
              <div class="tale-row-body">
                <span class="eyebrow mono">CHAPTER ${pad(c.no)} · ${esc(c.genre)}</span>
                <b>${esc(c.zh)}</b>
                <span class="tale-row-en">${esc(c.title)}</span>
                <div class="meter"><i class="m-mastered" style="width:${(n / c.words.length) * 100}%"></i></div>
              </div>
              <div class="tale-row-state">
                ${S.story.read[c.no] ? '<span class="badge plain lv-600">已讀</span>' : c === nextChapter() ? '<span class="badge plain lv-800">下一章</span>' : ''}
                ${best != null ? `<span class="num">填空 ${best}/${c.words.length}</span>` : `<span class="num">${n}/${c.words.length} 字</span>`}
              </div>
            </a>`;
          }).join('')}
          <div class="tale-row is-soon">
            <div class="art tale-soon-art">${I.book}</div>
            <div class="tale-row-body">
              <span class="eyebrow mono">CHAPTER 06 · 600 爬升段</span>
              <b>目的地那一欄，為什麼是空白的？</b>
              <span class="tale-row-en">To be continued</span>
            </div>
            <div class="tale-row-state"><span class="badge plain">即將啟航</span></div>
          </div>
        </div>
      </section>
    </div>`;
  }

  function taleInline(t) {
    return esc(t).replace(MARK_RE, (m, id, f) => `<button class="tw st-${status(+id)}" data-open="${id}">${f}</button>`);
  }
  function blockHtml(b, i) {
    const say = esc(blockLines(b).map(plainTale).join(' '));
    let en;
    let zh;
    if (b.k === 'sms') {
      const zl = b.zh.split('\n').map((l) => l.split('|'));
      en = `<div class="st-sms">${b.en.split('\n').map((l, j) => { const [who, txt] = l.split('|'); return `<div class="bubble ${who === 'Jun' ? 'is-me' : ''}"><small>${esc(who)}</small><span>${taleInline(txt)}</span></div>`; }).join('')}</div>`;
      zh = zl.map(([who, txt]) => `${esc(who)}：${esc(txt)}`).join('<br>');
    } else if (b.k === 'doc') {
      en = `<div class="st-paper">${b.en.split('\n').map((l, j) => (l ? `<div class="${j === 0 ? 'st-paper-head' : ''}">${taleInline(l)}</div>` : '<div class="gap"></div>')).join('')}</div>`;
      zh = b.zh.split('\n').map((l) => esc(l)).join('<br>');
    } else {
      en = `<p class="st-en">${taleInline(b.en)}</p>`;
      zh = esc(b.zh);
    }
    return `<div class="st-block st-${b.k}" data-i="${i}">
      ${en}
      <p class="st-zh">${zh}</p>
      <div class="st-tools"><button class="mini-spk" data-say="${say}" aria-label="朗讀這段">${I.speaker}</button><button class="st-tr" aria-label="顯示這段的中文">譯</button></div>
    </div>`;
  }
  function paintChapter(ch) {
    const next = chapterOf(ch.no + 1);
    const todo = ch.words.filter((id) => status(id) !== 'mastered').length;
    const showZh = !!S.set.storyZh;
    listContext = ch.words.slice();
    view.innerHTML = `<div class="wrap tale">
      <div class="tale-bar">
        <a class="icon-btn" href="#story" aria-label="回到章節列表">${I.left}</a>
        <span class="eyebrow">《${esc(STORY.series.zh)}》 · 第 ${ch.no} / ${CH.length} 章</span>
        <span class="tale-bar-tools">
          <button class="btn ghost small" id="tale-read">${I.speaker}<span>朗讀全章</span></button>
          <button class="btn ghost small" id="tale-zh" aria-pressed="${showZh}">中文${showZh ? '開' : '關'}</button>
        </span>
      </div>
      <header class="tale-head">
        ${art(ch.cover, { full: true })}
        <div class="tale-head-txt">
          <span class="eyebrow mono">CHAPTER ${pad(ch.no)} · ${esc(ch.genre)}</span>
          <h1>${esc(ch.title)}</h1>
          <p>${esc(ch.zh)}</p>
        </div>
      </header>
      <div class="tale-words" data-list>
        <span class="block-label">本章單字 · 點字看詞卡</span>
        <div class="tale-chips">${ch.words.map((id) => { const w = BY_ID.get(id); return `<button class="tale-chip st-${status(id)}" data-open="${id}"><b>${esc(w.w)}</b><span>${esc(w.s[0][1])}</span></button>`; }).join('')}</div>
      </div>
      <article class="tale-body ${showZh ? 'show-zh' : ''}" data-list>
        ${ch.blocks.map(blockHtml).join('')}
        <p class="tale-end">— 第 ${ch.no} 章 完 —</p>
      </article>
      <aside class="tale-next">
        <span class="eyebrow">${next ? '下一章預告' : '未完待續'}</span>
        <p>${esc(ch.next)}</p>
      </aside>
      <div class="tale-actions">
        <button class="btn" id="tale-cloze">故事填空 · Part 6 ${I.arrow}</button>
        ${todo ? `<button class="btn ghost" id="tale-learn">學這章的 ${todo} 個字</button>` : '<span class="tale-done">本章單字都已熟 ✓</span>'}
        ${next ? `<a class="btn ghost" href="#story-${next.no}">第 ${next.no} 章 ${I.right}</a>` : ''}
      </div>
    </div>`;
    loadFull(view);
    $('#tale-zh').addEventListener('click', (e) => {
      S.set.storyZh = !S.set.storyZh; save();
      e.currentTarget.setAttribute('aria-pressed', S.set.storyZh);
      e.currentTarget.textContent = `中文${S.set.storyZh ? '開' : '關'}`;
      $('.tale-body').classList.toggle('show-zh', S.set.storyZh);
      $$('.st-block.is-zh').forEach((b) => b.classList.remove('is-zh'));
    });
    view.querySelectorAll('.st-tr').forEach((b) => b.addEventListener('click', () => { sfx('tap'); b.closest('.st-block').classList.toggle('is-zh'); }));
    $('#tale-read').addEventListener('click', (e) => readTale($$('.st-block', view), e.currentTarget));
    $('#tale-cloze').addEventListener('click', () => { storyState.cloze = { no: ch.no }; vt('page-fwd', () => { startCloze(ch); window.scrollTo(0, 0); }); });
    const tl = $('#tale-learn');
    if (tl) tl.addEventListener('click', () => learnChapter(ch));
    const end = $('.tale-next');
    const markRead = () => { if (!S.story.read[ch.no]) { S.story.read[ch.no] = Date.now(); save(); } };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { markRead(); io.disconnect(); } });
      io.observe(end);
      cleanup = () => { io.disconnect(); stopTale(); };
    } else { markRead(); cleanup = stopTale; }
  }
  let taleBtn = null;
  function stopTale() {
    if (!taleBtn) return;
    taleBtn.classList.remove('is-on');
    taleBtn = null;
    $$('.st-block.is-reading').forEach((x) => x.classList.remove('is-reading'));
    try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    duck(false);
  }
  function readTale(blocks, btn) {
    if (taleBtn) { stopTale(); return; }
    if (!('speechSynthesis' in window)) { toast('這個瀏覽器不支援語音朗讀，請改用 Chrome、Edge 或 Safari。'); return; }
    speechSynthesis.cancel();
    taleBtn = btn;
    btn.classList.add('is-on');
    duck(true, 600000);
    const lang = S.set.accent === 'uk' ? 'en-GB' : 'en-US';
    const v = pickVoice(lang);
    blocks.forEach((el, i) => {
      const u = new SpeechSynthesisUtterance(el.querySelector('[data-say]').dataset.say);
      u.lang = lang;
      if (v) u.voice = v;
      u.rate = S.set.rate;
      u.onstart = () => {
        if (taleBtn !== btn) return;
        blocks.forEach((x) => x.classList.toggle('is-reading', x === el));
        el.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
      };
      if (i === blocks.length - 1) u.onend = () => { if (taleBtn === btn) stopTale(); };
      speechSynthesis.speak(u);
    });
  }
  function learnChapter(ch) {
    const ids = ch.words.filter((id) => status(id) !== 'mastered');
    session = { queue: ids, total: ids.length, done: 0, revealed: false, tally: { 1: 0, 2: 0, 3: 0, 4: 0 }, seen: new Set(), story: ch.no };
    sfx('start');
    go('learn');
  }

  /* Part 6 style: every target word becomes a numbered blank in the running text. */
  function blankKind(f, base) {
    const a = f.toLowerCase();
    if (a === base) return '';
    if (a.endsWith('ing') && !base.endsWith('ing')) return 'ing';
    if (a.endsWith('s') && !base.endsWith('s')) return 's';
    if (a.endsWith('d') && !base.endsWith('d')) return 'ed';
    return '';
  }
  function startCloze(ch) {
    const seen = new Set();
    const blanks = [];
    ch.blocks.forEach((b) => { for (const m of b.en.matchAll(MARK_RE)) { const id = +m[1]; if (!seen.has(id)) { seen.add(id); blanks.push({ id, f: m[2] }); } } });
    const lv = BY_ID.get(ch.words[0]).lv;
    for (const q of blanks) {
      const w = BY_ID.get(q.id);
      const kind = blankKind(q.f, w.w.toLowerCase());
      const cap = /^[A-Z]/.test(q.f) && !/^[A-Z]/.test(w.w);
      const mates = shuffle(ch.words.filter((id) => id !== q.id).map((id) => BY_ID.get(id)).filter((x) => posOf(x) === posOf(w) && !confusable(w, x)));
      const more = distractors(w, 6, WORDS.filter((x) => x.lv === lv));
      const used = new Set([fold(q.f)]);
      const opts = [{ id: w.id, t: q.f }];
      for (const d of [...mates, ...more]) {
        if (opts.length === 4) break;
        const t = applyForm(d.w, kind, cap);
        if (used.has(fold(t))) continue;
        used.add(fold(t));
        opts.push({ id: d.id, t });
      }
      q.opts = shuffle(opts);
    }
    storyState.cloze = { no: ch.no, blanks, i: 0, answered: false, right: 0 };
    paintCloze(ch);
  }
  function paintCloze(ch) {
    const C = storyState.cloze;
    if (C.i >= C.blanks.length) return paintClozeResult(ch);
    const q = C.blanks[C.i];
    const order = new Map(C.blanks.map((b, k) => [b.id, k]));
    const done = new Set();
    const inline = (t) => esc(t).replace(MARK_RE, (m, id, f) => {
      id = +id;
      const k = order.get(id);
      if (k == null || done.has(id)) return f;
      done.add(id);
      const b = C.blanks[k];
      if (k < C.i || (k === C.i && C.answered)) return `<span class="cz-blank is-filled ${b.ok ? 'ok' : 'no'}">${f}</span>`;
      return `<span class="cz-blank ${k === C.i ? 'is-cur' : ''}" ${k === C.i ? 'id="cz-cur"' : ''}>(${k + 1})</span>`;
    });
    const passage = ch.blocks.map((b) => {
      if (b.k === 'sms') return `<div class="st-sms">${b.en.split('\n').map((l) => { const [who, txt] = l.split('|'); return `<div class="bubble ${who === 'Jun' ? 'is-me' : ''}"><small>${esc(who)}</small><span>${inline(txt)}</span></div>`; }).join('')}</div>`;
      if (b.k === 'doc') return `<div class="st-paper">${b.en.split('\n').map((l, j) => (l ? `<div class="${j === 0 ? 'st-paper-head' : ''}">${inline(l)}</div>` : '<div class="gap"></div>')).join('')}</div>`;
      return `<p class="st-en">${inline(b.en)}</p>`;
    }).join('');
    const w = BY_ID.get(q.id);
    view.innerHTML = `<div class="wrap tale cz">
      <div class="learn-top">
        <button class="icon-btn" id="cz-exit" aria-label="結束填空">${I.close}</button>
        <div class="meter"><i style="width:${(C.i / C.blanks.length) * 100}%"></i></div>
        <span class="count num">${C.i + 1} / ${C.blanks.length}</span>
      </div>
      <article class="tale-body cz-passage">
        <span class="eyebrow mono">PART 6 · CHAPTER ${pad(ch.no)} · ${esc(ch.title)}</span>
        ${passage}
      </article>
      <div class="cz-panel q-card">
        <div class="flash-head"><span class="eyebrow">第 (${C.i + 1}) 格該填哪個字？</span>${lvBadge(w.lv)}</div>
        <div class="opts">${q.opts.map((o, k) => {
          let cls = '';
          if (C.answered) { if (o.id === q.id) cls = 'ok'; else if (o.id === q.picked) cls = 'no'; }
          return `<button class="opt ${cls}" data-o="${k}" ${C.answered ? 'disabled' : ''}><span class="k">${'ABCD'[k]}</span><span class="t en">${esc(o.t)}</span></button>`;
        }).join('')}</div>
        ${C.answered ? `<div class="cz-fb">
          <span class="fb-title ${q.ok ? 'ok' : 'no'}">${q.ok ? '答對了' : `正確答案：${esc(q.f)}`}</span>
          <span><button data-open="${w.id}" class="cz-word">${esc(w.w)}</button> ${kkHtml(w)} · ${esc(zhMain(w))}</span>
          <button class="btn" id="cz-next">${C.i === C.blanks.length - 1 ? '看結果' : '下一格'} ${I.arrow}</button>
        </div>` : '<p class="kbd-hint">鍵盤 <kbd>1</kbd>–<kbd>4</kbd> 或 <kbd>A</kbd>–<kbd>D</kbd> 作答</p>'}
      </div>
    </div>`;
    $('#cz-exit').addEventListener('click', () => { storyState.cloze = null; paintChapter(ch); window.scrollTo(0, 0); });
    view.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => clozeAnswer(ch, +b.dataset.o)));
    const nx = $('#cz-next');
    if (nx) { nx.addEventListener('click', () => clozeNext(ch)); nx.focus({ preventScroll: true }); }
    const cur = $('#cz-cur') || view.querySelectorAll('.cz-blank.is-filled')[C.i];
    if (cur && C.i > 0) cur.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    const onKey = (e) => {
      if ($('.overlay') || e.target.matches('input, textarea')) return;
      if (!C.answered) {
        const k = e.key.toLowerCase();
        const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
        if (i >= 0 && q.opts[i]) { e.preventDefault(); clozeAnswer(ch, i); }
      } else if (e.key === 'Enter' && document.activeElement?.id !== 'cz-next') { e.preventDefault(); clozeNext(ch); }
    };
    if (cleanup) cleanup();
    document.addEventListener('keydown', onKey);
    cleanup = () => document.removeEventListener('keydown', onKey);
  }
  function clozeAnswer(ch, k) {
    const C = storyState.cloze;
    if (C.answered) return;
    const q = C.blanks[C.i];
    q.picked = q.opts[k].id;
    q.ok = q.picked === q.id;
    C.answered = true;
    if (q.ok) C.right++;
    const d = today();
    d.q++;
    if (q.ok) d.c++;
    save();
    sfx(q.ok ? 'correct' : 'wrong');
    playWord(BY_ID.get(q.id));
    paintCloze(ch);
    if (q.ok) burstFrom($('.opt.ok'), 26, 0.8);
  }
  function clozeNext(ch) { const C = storyState.cloze; C.i++; C.answered = false; vt('card', () => paintCloze(ch)); }
  function paintClozeResult(ch) {
    const C = storyState.cloze;
    const n = C.blanks.length;
    const wrong = C.blanks.filter((b) => !b.ok).map((b) => BY_ID.get(b.id));
    S.story.best[ch.no] = Math.max(S.story.best[ch.no] || 0, C.right);
    S.story.read[ch.no] = S.story.read[ch.no] || Date.now();
    save();
    sfx('complete');
    if (C.right / n >= 0.8) setTimeout(() => burst(innerWidth / 2, innerHeight * 0.35, 70, 1.4), 120);
    const next = chapterOf(ch.no + 1);
    const msg = C.right === n ? '全部填回原位。這一章的字，已經和劇情綁在一起了。' : C.right / n >= 0.7 ? '大部分都放對了，錯的字回到故事裡再讀一次。' : '先回去重讀這一章，留意亮起來的字，再挑戰一次。';
    view.innerHTML = `<div class="wrap"><div class="quiz">
      <div class="done">
        <img src="assets/brand/${C.right / n >= 0.8 ? 'done' : 'night'}.webp" alt="" width="480" height="480">
        <div class="done-body">
          <span class="eyebrow">故事填空 · 第 ${ch.no} 章 ${esc(ch.zh)}</span>
          <span class="score num">${C.right}<small style="font-size:28px;color:var(--ink-3)"> / ${n}</small></span>
          <h2>${msg}</h2>
          <div class="row-btns">
            ${next ? `<a class="btn" href="#story-${next.no}">讀第 ${next.no} 章 ${I.arrow}</a>` : `<a class="btn" href="#story">回到章節列表 ${I.arrow}</a>`}
            <button class="btn ghost" id="cz-again">再填一次</button>
            <button class="btn ghost" data-story="${ch.no}">重讀本章</button>
          </div>
        </div>
      </div>
      ${wrong.length ? `<div class="result-list" data-list>
        <span class="eyebrow">填錯的單字</span>
        ${wrong.map((w) => `<button class="result-row" data-open="${w.id}">${art(w)}<b>${esc(w.w)}</b><span>${esc(zhShort(w))}</span></button>`).join('')}
      </div>` : ''}
    </div></div>`;
    listContext = wrong.map((w) => w.id);
    if (cleanup) { cleanup(); cleanup = null; }
    $('#cz-again').addEventListener('click', () => vt('card', () => startCloze(ch)));
  }

  /* ======================================================
     SPRINT — 50 timed levels of 20 words: see & say, recall until it sticks, then use it
     ====================================================== */
  const SPRINT_SIZE = 20;
  const SPRINT_MIN = 15;
  let SPRINT_ORDER = null;
  function sprintOrder() {
    if (SPRINT_ORDER) return SPRINT_ORDER;
    const told = CH.flatMap((c) => c.words);
    const toldSet = new Set(told);
    const out = [];
    for (const l of LEVELS) {
      out.push(...told.filter((id) => BY_ID.get(id).lv === l.lv));
      // deal the rest of the leg round-robin across topics, so one level mixes scenes and parts of speech
      const byT = new Map();
      for (const w of WORDS) if (w.lv === l.lv && !toldSet.has(w.id)) { if (!byT.has(w.t)) byT.set(w.t, []); byT.get(w.t).push(w.id); }
      const lists = [...byT.values()];
      while (lists.some((x) => x.length)) for (const x of lists) if (x.length) out.push(x.shift());
    }
    SPRINT_ORDER = out;
    return out;
  }
  let SPRINTS = null;
  function sprints() {
    if (SPRINTS) return SPRINTS;
    const o = sprintOrder();
    SPRINTS = [];
    for (let i = 0; i < o.length; i += SPRINT_SIZE) {
      const ids = o.slice(i, i + SPRINT_SIZE);
      const lvs = ids.map((id) => BY_ID.get(id).lv);
      const lv = [...new Set(lvs)].sort((a, b) => lvs.filter((x) => x === b).length - lvs.filter((x) => x === a).length)[0];
      SPRINTS.push({ no: SPRINTS.length + 1, ids, lv });
    }
    return SPRINTS;
  }
  const sprintDone = (no) => !!S.sprint[no];
  function sprintOpen(no) {
    const L = sprints()[no - 1];
    if (!L) return false;
    if (no === 1 || sprintDone(no) || sprintDone(no - 1)) return true;
    return sprints()[no - 2].lv !== L.lv; // the first level of every leg is always open
  }
  const nextSprint = () => sprints().find((L) => !sprintDone(L.no) && sprintOpen(L.no)) || null;
  const starStr = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
  function sprintMap() {
    const L = sprints();
    const passed = L.filter((x) => sprintDone(x.no)).length;
    const stars = L.reduce((a, x) => a + (S.sprint[x.no]?.stars || 0), 0);
    const nx = nextSprint();
    return `<section class="section">
      <div class="section-head"><h2>衝刺關卡</h2><span class="more">已過 ${passed} / ${L.length} 關 · ★ ${stars} / ${L.length * 3}</span></div>
      <div class="sp-how">
        <div><b>1</b><span><strong>看・唸</strong>插畫、英文解釋、例句一起看，跟著發音大聲唸出來。</span></div>
        <div><b>2</b><span><strong>回想</strong>輪流用圖片、英文解釋、例句挖空、聲音考你，答錯立刻放回牌堆。</span></div>
        <div><b>3</b><span><strong>造句</strong>挑 3 個最容易錯的字，自己寫一句。會用，才算真的會。</span></div>
      </div>
      <div class="sp-rule">
        <span>每個字要連續答對</span>
        <div class="seg">${[2, 3, 6].map((n) => `<button data-passn="${n}" aria-pressed="${S.set.passN === n}">${n} 次</button>`).join('')}</div>
        <span>才算過關 · 建議 3 次</span>
      </div>
      <div class="sp-grid">
        ${L.map((x) => {
          const r = S.sprint[x.no];
          if (!sprintOpen(x.no)) return `<span class="sp-tile lv-${x.lv} is-locked" aria-label="第 ${x.no} 關未解鎖"><b>${pad(x.no)}</b><i>${x.lv}</i></span>`;
          return `<a class="sp-tile lv-${x.lv} ${r ? 'is-done' : ''} ${nx && nx.no === x.no ? 'is-next' : ''}" href="#sprint-${x.no}" aria-label="第 ${x.no} 關${r ? `，${r.stars} 顆星` : ''}"><b>${pad(x.no)}</b><i>${x.lv}</i><span class="sp-stars">${r ? starStr(r.stars) : nx && nx.no === x.no ? '出發' : '☆☆☆'}</span></a>`;
        }).join('')}
      </div>
    </section>`;
  }

  let sprint = null;
  let spTick = null;
  function viewSprint() {
    const no = route.sub;
    const L = sprints()[no - 1];
    if (!L || !sprintOpen(no)) { toast('先完成前一關，這一關才會解鎖。'); go('practice'); return; }
    if (!sprint || sprint.no !== no || sprint.stage === 'done') sprint = { no, ids: L.ids.slice(), lv: L.lv, stage: 'intro', i: 0 };
    paintSprint();
    const onKey = (e) => {
      if ($('.overlay') || !sprint || e.target.matches('input, textarea')) return;
      if (sprint.stage === 'see' && e.key === 'Enter') { e.preventDefault(); spNextSee(); }
      else if (sprint.stage === 'recall') {
        const q = sprint.q;
        if (q && !q.answered) {
          const k = e.key.toLowerCase();
          const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
          if (i >= 0 && q.opts[i]) { e.preventDefault(); spAnswer(i); }
        } else if (q && q.answered && e.key === 'Enter') { e.preventDefault(); spNextQ(); }
      }
    };
    document.addEventListener('keydown', onKey);
    cleanup = () => { document.removeEventListener('keydown', onKey); clearInterval(spTick); spTick = null; if (spRec) { try { spRec.abort(); } catch (e) { /* ignore */ } } };
  }
  function spClock() {
    if (!sprint.t0) return '';
    const left = SPRINT_MIN * MIN - (Date.now() - sprint.t0);
    const a = Math.abs(left);
    return `${left < 0 ? '+' : ''}${Math.floor(a / MIN)}:${pad(Math.floor((a % MIN) / 1000))}`;
  }
  function spTop(label, done, total) {
    const over = sprint.t0 && Date.now() - sprint.t0 > SPRINT_MIN * MIN;
    return `<div class="learn-top">
        <a class="icon-btn" href="#practice" aria-label="離開這一關">${I.close}</a>
        <div class="meter" role="progressbar" aria-valuenow="${Math.round((done / total) * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${(done / total) * 100}%"></i></div>
        <span class="count num">${label}</span>
        <span class="sp-clock num ${over ? 'is-over' : ''}" id="sp-clock" aria-label="剩餘時間">${spClock()}</span>
      </div>
      <ol class="sp-steps">${['看・唸', '回想', '造句'].map((t, k) => `<li class="${['see', 'recall', 'make'].indexOf(sprint.stage) === k ? 'is-on' : ['see', 'recall', 'make'].indexOf(sprint.stage) > k ? 'is-past' : ''}"><b>${k + 1}</b>${t}</li>`).join('')}</ol>`;
  }
  function spStartClock() {
    clearInterval(spTick);
    spTick = setInterval(() => {
      const el = $('#sp-clock');
      if (!el || !sprint || !sprint.t0) return;
      el.textContent = spClock();
      el.classList.toggle('is-over', Date.now() - sprint.t0 > SPRINT_MIN * MIN);
    }, 1000);
  }
  function paintSprint() {
    const P = sprint;
    if (P.stage === 'intro') return spIntro();
    if (P.stage === 'see') return spSee();
    if (P.stage === 'recall') return spRecall();
    if (P.stage === 'make') return spMake();
    return spDone();
  }
  function spIntro() {
    const P = sprint;
    const best = S.sprint[P.no];
    const words = P.ids.map((id) => BY_ID.get(id));
    view.innerHTML = `<div class="wrap"><div class="learn sp">
      <div class="sp-intro">
        <span class="eyebrow mono">LEVEL ${pad(P.no)} · ${P.lv} ${LV[P.lv].name}</span>
        <h1>第 ${P.no} 關</h1>
        <p>${words.length} 個字 · 倒數 ${SPRINT_MIN} 分鐘 · 每個字連續答對 ${S.set.passN} 次${best ? ` · 最佳 ${starStr(best.stars)}` : ''}</p>
        <div class="sp-faces">${words.map((w) => art(w)).join('')}</div>
        <ul class="sp-stars-how">
          <li><b>★</b>完成三步就過關</li>
          <li><b>★★</b>第一次作答的正確率達 80%</li>
          <li><b>★★★</b>${SPRINT_MIN} 分鐘內完成，而且 3 句都自己寫</li>
        </ul>
        <button class="btn" id="sp-go">開始倒數 ${I.arrow}</button>
      </div>
    </div></div>`;
    $('#sp-go').addEventListener('click', () => {
      Object.assign(P, { stage: 'see', i: 0, t0: Date.now(), first: {}, wrong: {}, voice: 0, made: [], combo: 0, bestCombo: 0 });
      sfx('start');
      spStartClock();
      vt('card', paintSprint);
    });
  }
  /* step 1: see, hear and say every word once */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let spRec = null;
  function spSee() {
    const P = sprint;
    const w = BY_ID.get(P.ids[P.i]);
    const ex = dailyEx(w);
    view.innerHTML = `<div class="wrap"><div class="learn sp">
      ${spTop(`${P.i + 1} / ${P.ids.length}`, P.i, P.ids.length)}
      <article class="flash sp-see">
        ${art(w, { full: true, tag: true })}
        <div class="flash-body">
          <div class="flash-head"><div style="display:flex;gap:8px">${lvBadge(w.lv, true)}<span class="badge plain">${TP[w.t].zh}</span></div><span class="badge plain">${POS_EN[posOf(w)] || posOf(w)}</span></div>
          <div class="flash-word">${esc(w.w)}</div>
          ${pron(w)}
          <p class="def-line"><span class="def-tag">EN</span>${esc(w.d)}</p>
          <div class="example"><p class="en-line">${markSentence(ex)} <button class="mini-spk" data-say="${esc(ex.en)}" aria-label="朗讀例句">${I.speaker}</button></p></div>
          <details class="sp-zh"><summary>需要的話，看中文</summary><p>${esc(zhMain(w))}</p><p>${esc(ex.zh)}</p></details>
        </div>
      </article>
      <div class="sp-actions">
        ${SR ? `<button class="btn ghost" id="sp-mic">${I.listen}<span>跟讀檢查</span></button>` : ''}
        <button class="btn" id="sp-said">我唸出來了 ${I.arrow}</button>
      </div>
      <p class="kbd-hint">大聲唸單字，再唸一次例句。<kbd>Enter</kbd> 下一個</p>
    </div></div>`;
    loadFull(view);
    $('#sp-said').addEventListener('click', spNextSee);
    const mic = $('#sp-mic');
    if (mic) mic.addEventListener('click', () => spListen(w, mic));
    setTimeout(() => { if (sprint === P && P.stage === 'see' && P.ids[P.i] === w.id) playWord(w); }, 250);
  }
  function spListen(w, btn) {
    if (spRec) { try { spRec.abort(); } catch (e) { /* ignore */ } spRec = null; }
    let r;
    try { r = new SR(); } catch (e) { toast('這個瀏覽器無法使用語音辨識。'); return; }
    spRec = r;
    r.lang = S.set.accent === 'uk' ? 'en-GB' : 'en-US';
    r.maxAlternatives = 5;
    r.interimResults = false;
    const label = btn.querySelector('span');
    btn.classList.add('is-on');
    label.textContent = '請唸出單字…';
    const target = fold(w.w);
    const stem = target.length > 5 ? target.slice(0, -2) : target;
    r.onresult = (e) => {
      const alts = Array.from(e.results[0]).map((a) => fold(a.transcript));
      const ok = alts.some((t) => t.includes(target) || t.split(/\s+/).some((x) => x.startsWith(stem)));
      btn.classList.remove('is-on');
      if (ok) { label.textContent = '發音辨識通過 ✓'; btn.classList.add('is-ok'); sprint.voice++; sfx('correct'); burstFrom(btn, 18, 0.6); }
      else { label.textContent = `聽成「${alts[0] || '…'}」，再試一次`; sfx('wrong'); }
    };
    r.onerror = (e) => { btn.classList.remove('is-on'); label.textContent = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? '麥克風未開放' : '沒聽到，再試一次'; };
    r.onend = () => { btn.classList.remove('is-on'); if (spRec === r) spRec = null; };
    try { r.start(); } catch (e) { label.textContent = '跟讀檢查'; btn.classList.remove('is-on'); }
  }
  function spNextSee() {
    const P = sprint;
    if (P.stage !== 'see') return;
    sfx('page');
    P.i++;
    if (P.i >= P.ids.length) {
      P.stage = 'recall';
      P.queue = shuffle(P.ids).map((id) => ({ id, streak: 0, seen: 0 }));
      P.cleared = 0;
      P.q = null;
    }
    vt('card', paintSprint);
  }
  /* step 2: recall with English cues until each word is right N times in a row */
  function spMakeQ(card) {
    const w = BY_ID.get(card.id);
    const types = ['cloze', w.ar === 'w' ? 'pic' : null, 'def', w.u ? 'listen' : null].filter(Boolean);
    const type = types[(card.seen + hash(w.w)) % types.length];
    const group = sprint.ids.map((id) => BY_ID.get(id));
    const ds = distractors(w, 3, group);
    const q = { id: w.id, type, answered: false };
    if (type === 'cloze') {
      const ex = nextCloze(w);
      save();
      q.ex = ex;
      const cap = ex.a === 0;
      q.opts = shuffle([{ id: w.id, t: ex.f }, ...ds.map((d) => ({ id: d.id, t: applyForm(d.w, ex.kind, cap) }))]);
    } else q.opts = shuffle([w, ...ds].map((x) => ({ id: x.id, t: x.w })));
    return q;
  }
  function spRecall() {
    const P = sprint;
    if (!P.queue.length && !(P.q && P.q.answered)) { P.stage = 'make'; return spMake(); }
    if (!P.q) { P.qcard = P.queue[0]; P.q = spMakeQ(P.qcard); }
    const q = P.q;
    const card = P.qcard;
    const w = BY_ID.get(q.id);
    const need = S.set.passN;
    const prog = P.cleared * need + P.queue.reduce((a, c) => a + Math.min(c.streak, need), 0);
    let body = '';
    if (q.type === 'cloze') body = `<p class="q-sent">${esc(q.ex.en.slice(0, q.ex.a))}<span class="blank">${q.answered ? esc(q.ex.f) : '&nbsp;'}</span>${esc(q.ex.en.slice(q.ex.a + q.ex.f.length))}</p>`;
    else if (q.type === 'pic') body = `<div class="q-pic">${art(w, { full: true })}</div><p class="q-sub">這張圖在說哪個字？</p>`;
    else if (q.type === 'def') body = `<div class="q-def"><span class="def-tag">${POS_EN[posOf(w)] || posOf(w)}</span><p>${esc(w.d)}</p></div>`;
    else body = `<div class="listen-stage is-compact"><button class="big-listen" data-word="${w.id}" aria-label="再聽一次">${I.listen}</button><p class="q-sub">聽到的是哪個字？ <button class="btn ghost small" data-word="${w.id}" data-slow="1">慢速</button></p></div>`;
    const tag = { cloze: '例句挖空', pic: '看圖', def: '英文解釋', listen: '聽音' }[q.type];
    view.innerHTML = `<div class="wrap"><div class="quiz sp">
      ${spTop(`剩 ${P.queue.length} 字`, prog, P.ids.length * need)}
      <article class="q-card">
        <div class="flash-head"><span class="eyebrow">${tag}</span><span class="sp-dots" aria-label="這個字已連續答對 ${card.streak} 次">${Array.from({ length: need }, (_, k) => `<i class="${k < card.streak ? 'on' : ''}"></i>`).join('')}</span></div>
        ${body}
        <div class="opts">${q.opts.map((o, k) => {
          let cls = '';
          if (q.answered) { if (o.id === q.id) cls = 'ok'; else if (o.id === q.picked) cls = 'no'; }
          return `<button class="opt ${cls}" data-o="${k}" ${q.answered ? 'disabled' : ''}><span class="k">${'ABCD'[k]}</span><span class="t en">${esc(o.t)}</span></button>`;
        }).join('')}</div>
      </article>
      ${q.answered && !q.ok ? `<div class="feedback">
        <button data-open="${w.id}" aria-label="打開 ${esc(w.w)} 詞卡">${art(w)}</button>
        <div style="display:grid;gap:4px;min-width:0">
          <span class="fb-title no">正確答案：${esc(q.type === 'cloze' ? q.ex.f : w.w)}　這個字稍後會再出現</span>
          <span class="fb-def">${esc(w.d)}<small>${esc(zhMain(w))}</small></span>
        </div>
      </div>
      <button class="btn" id="sp-next" style="justify-self:end">知道了 ${I.arrow}</button>` : ''}
      ${P.combo >= 3 ? `<div class="sp-combo" aria-live="polite">連對 ×${P.combo}</div>` : ''}
    </div></div>`;
    view.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => spAnswer(+b.dataset.o)));
    const nx = $('#sp-next');
    if (nx) { nx.addEventListener('click', spNextQ); nx.focus({ preventScroll: true }); }
    loadFull(view);
    if (q.type === 'listen' && !q.played) { q.played = true; setTimeout(() => playWord(w), 250); }
  }
  function spAnswer(k) {
    const P = sprint;
    const q = P.q;
    if (!q || q.answered) return;
    q.answered = true;
    q.picked = q.opts[k].id;
    q.ok = q.picked === q.id;
    const card = P.queue.shift();
    card.seen++;
    if (!(q.id in P.first)) P.first[q.id] = q.ok;
    const d = today();
    d.q++;
    if (q.ok) d.c++;
    save();
    const need = S.set.passN;
    if (q.ok) {
      card.streak++;
      P.combo++;
      P.bestCombo = Math.max(P.bestCombo, P.combo);
      if (card.streak >= need) P.cleared++;
      else P.queue.splice(Math.min(P.queue.length, 3 + card.streak * 3), 0, card); // space the next look out a little more each time
      sfx(P.combo % 5 === 0 ? 'streak' : 'correct');
    } else {
      card.streak = 0;
      P.combo = 0;
      P.wrong[q.id] = (P.wrong[q.id] || 0) + 1;
      P.queue.splice(Math.min(P.queue.length, 2), 0, card); // straight back into the deck
      sfx('wrong');
    }
    if (q.type === 'cloze') speak(q.ex.en); else if (q.type !== 'listen' || !q.ok) playWord(BY_ID.get(q.id));
    spRecall();
    if (q.ok) {
      burstFrom($('.opt.ok'), card.streak >= need ? 30 : 14, card.streak >= need ? 0.9 : 0.5);
      setTimeout(() => { if (sprint === P && P.q === q) spNextQ(); }, 650);
    }
  }
  function spNextQ() { const P = sprint; if (!P.q || !P.q.answered) return; P.q = null; vt('card', paintSprint); }
  /* step 3: produce — write a sentence with the three hardest words */
  function spMake() {
    const P = sprint;
    if (!P.makeIds) {
      P.makeIds = P.ids.slice().sort((a, b) => (P.wrong[b] || 0) - (P.wrong[a] || 0) || (hash(String(a) + P.t0) % 97) - (hash(String(b) + P.t0) % 97)).slice(0, 3);
      P.mi = 0;
    }
    if (P.mi >= P.makeIds.length) return spFinish();
    const w = BY_ID.get(P.makeIds[P.mi]);
    const shown = P.shown;
    view.innerHTML = `<div class="wrap"><div class="learn sp">
      ${spTop(`${P.mi + 1} / 3 句`, P.mi, 3)}
      <article class="q-card sp-make">
        <div class="sp-make-head">${w.ar === 'w' ? art(w) : ''}<div><div class="flash-word">${esc(w.w)}</div><p class="def-line"><span class="def-tag">${POS_EN[posOf(w)] || posOf(w)}</span>${esc(w.d)}</p></div></div>
        <p class="sp-make-hint">用 <b>${esc(w.w)}</b> 寫一句跟你自己有關的話：你的工作、學校、昨天發生的事都可以。至少 5 個英文字，字形可以變化（如 ${esc(applyForm(w.w, posOf(w) === 'v.' ? 'ed' : posOf(w) === 'n.' ? 's' : '', false))}）。</p>
        <form id="sp-form" class="sp-form" autocomplete="off">
          <label class="sr-only" for="sp-in">你的句子</label>
          <textarea id="sp-in" rows="3" spellcheck="true" placeholder="I ..." ${shown ? 'disabled' : ''}>${shown ? esc(shown) : ''}</textarea>
          ${shown ? '' : '<div class="row-btns"><button class="btn" type="submit">寫好了</button><button class="btn ghost" type="button" id="sp-skip">跳過</button></div>'}
        </form>
        <p class="sp-make-msg" id="sp-msg" aria-live="polite"></p>
        ${shown ? `<div class="example"><span class="ex-tag is-toeic">參考例句</span><p class="en-line">${markSentence(toeicEx(w))}</p></div><button class="btn" id="sp-mnext" style="justify-self:end">${P.mi === 2 ? '看成績' : '下一句'} ${I.arrow}</button>` : ''}
      </article>
    </div></div>`;
    if (shown) { $('#sp-mnext').addEventListener('click', () => { P.mi++; P.shown = null; vt('card', paintSprint); }); $('#sp-mnext').focus({ preventScroll: true }); return; }
    const input = $('#sp-in');
    input.focus({ preventScroll: true });
    input.addEventListener('keydown', (e) => { if (e.key.length === 1 || e.key === 'Backspace') sfx('key'); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#sp-form').requestSubmit(); } });
    $('#sp-skip').addEventListener('click', () => { P.mi++; vt('card', paintSprint); });
    $('#sp-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const t = input.value.trim().replace(/\s+/g, ' ');
      const msg = $('#sp-msg');
      const base = fold(w.w);
      const stem = /\s|-/.test(base) ? base : base.replace(/(e|y)$/, '').slice(0, Math.max(3, base.length - 2));
      const has = fold(t).includes(base) || fold(t).split(/[^a-z'-]+/).some((x) => x.startsWith(stem));
      if (!has) { msg.textContent = `句子裡還沒有 ${w.w} 喔。`; sfx('wrong'); return; }
      if (t.split(' ').length < 5) { msg.textContent = '再多寫幾個字，至少 5 個英文字。'; sfx('wrong'); return; }
      P.made.push(w.id);
      S.notes.push({ id: w.id, t, at: ymd() });
      save();
      P.shown = t;
      sfx('correct');
      spMake();
      burstFrom($('.sp-make'), 22, 0.7);
    });
  }
  function spFinish() {
    const P = sprint;
    const ms = Date.now() - P.t0;
    const firstOk = P.ids.filter((id) => P.first[id]).length;
    const acc = firstOk / P.ids.length;
    const stars = 1 + (acc >= 0.8 ? 1 : 0) + (ms <= SPRINT_MIN * MIN && P.made.length === 3 ? 1 : 0);
    const prev = S.sprint[P.no];
    S.sprint[P.no] = { stars: Math.max(stars, prev?.stars || 0), ms: Math.min(ms, prev?.ms || Infinity), acc: Math.max(acc, prev?.acc || 0), at: ymd() };
    const now = Date.now();
    for (const id of P.ids) if (!S.cards[id] || S.cards[id].due <= now) grade(id, P.first[id] ? 3 : 2); // hand the words to spaced review
    const d = today();
    d.sp = (d.sp || 0) + 1;
    save();
    clearInterval(spTick);
    Object.assign(P, { stage: 'done', ms, acc, stars, isBest: !prev || stars > prev.stars });
    vt('card', spDone);
  }
  function spDone() {
    const P = sprint;
    const next = sprints()[P.no];
    const hard = P.ids.filter((id) => !P.first[id]).map((id) => BY_ID.get(id));
    sfx('complete');
    setTimeout(() => burst(innerWidth / 2, innerHeight * 0.35, 40 + P.stars * 25, 1 + P.stars * 0.2), 160);
    view.innerHTML = `<div class="wrap"><div class="quiz">
      <div class="done sp-done">
        <div class="sp-stamp lv-${P.lv}"><span class="eyebrow mono">LEVEL ${pad(P.no)}</span><b>${starStr(P.stars)}</b><span>${P.stars === 3 ? '完美通關' : P.stars === 2 ? '漂亮過關' : '過關'}</span></div>
        <div class="done-body">
          <span class="eyebrow">第 ${P.no} 關完成${P.isBest ? ' · 新紀錄' : ''}</span>
          <div class="sp-stats">
            <div><b class="num">${Math.floor(P.ms / MIN)}:${pad(Math.floor((P.ms % MIN) / 1000))}</b><span>用時 / ${SPRINT_MIN}:00</span></div>
            <div><b class="num">${Math.round(P.acc * 100)}%</b><span>首答正確率</span></div>
            <div><b class="num">${P.bestCombo}</b><span>最長連對</span></div>
            <div><b class="num">${P.made.length}</b><span>自己造的句子</span></div>
          </div>
          <p style="color:var(--ink-2)">這 20 個字已排進間隔複習：明天早上的「晨間複習」會再見到答錯過的字，今晚睡前用「睡前快掃」再看一遍。</p>
          <div class="row-btns">
            ${next && sprintOpen(next.no) ? `<a class="btn" href="#sprint-${next.no}">下一關 ${I.arrow}</a>` : `<a class="btn" href="#practice">回關卡地圖 ${I.arrow}</a>`}
            <button class="btn ghost" id="sp-again">再挑戰一次</button>
          </div>
        </div>
      </div>
      ${hard.length ? `<div class="result-list" data-list><span class="eyebrow">第一次答錯的字</span>${hard.map((w) => `<button class="result-row" data-open="${w.id}">${art(w)}<b>${esc(w.w)}</b><span>${esc(w.d)}</span></button>`).join('')}</div>` : ''}
      ${rewardLine()}
    </div></div>`;
    listContext = hard.map((w) => w.id);
    $('#sp-again').addEventListener('click', () => { sprint = { no: P.no, ids: P.ids, lv: P.lv, stage: 'intro', i: 0 }; vt('card', paintSprint); });
  }

  /* ---------- daily rhythm: morning review, one sprint, a bedtime recap ---------- */
  function todaysWords() {
    const k = ymd();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return Object.entries(S.cards).filter(([, c]) => c.first === k || (c.last && c.last >= +start)).map(([id]) => +id);
  }
  function rhythm() {
    const d = today();
    const due = dueIds().length;
    const nx = nextSprint();
    const tw = todaysWords().length;
    return [
      { k: 'review', t: '晨間複習', done: due === 0, sub: due ? `${due} 個字到期 · 約 ${Math.max(1, Math.round(due * 0.3))} 分鐘` : d.r ? `複習了 ${d.r} 次 ✓` : '今天沒有到期的字 ✓', href: '#learn', go: '開始複習' },
      { k: 'sprint', t: '衝刺一關', done: (d.sp || 0) > 0, sub: (d.sp || 0) > 0 ? `今天過了 ${d.sp} 關 ✓` : nx ? `第 ${nx.no} 關 · 20 字 · ${SPRINT_MIN} 分鐘` : '50 關全部完成', href: nx ? `#sprint-${nx.no}` : '#practice', go: '出發' },
      { k: 'recap', t: '睡前快掃', done: !!d.recap, sub: d.recap ? '已掃過 ✓' : tw ? `今天的 ${tw} 個字 · 約 3 分鐘` : '學完新字後開放', href: '#recap', go: '快掃', off: !tw && !d.recap },
    ];
  }
  function rewardLine() {
    const steps = rhythm();
    if (!steps.every((x) => x.done) || !S.set.reward) return '';
    return `<p class="reward-line">今天三步都完成了，去享受你的「${esc(S.set.reward)}」吧。</p>`;
  }
  function rhythmCard() {
    const steps = rhythm();
    const n = steps.filter((x) => x.done).length;
    const h = new Date().getHours();
    return `<section class="section">
      <div class="section-head"><h2>今日節奏</h2><span class="more">完成 ${n} / 3</span></div>
      <div class="rhythm">
        <div class="meter rhythm-meter"><i class="m-mastered" style="width:${(n / 3) * 100}%"></i></div>
        ${steps.map((x, k) => `<a class="rh-step ${x.done ? 'is-done' : ''} ${x.off ? 'is-off' : ''} ${!x.done && !x.off && ((x.k === 'recap' && h >= 20) || (x.k !== 'recap' && steps.slice(0, k).every((y) => y.done))) ? 'is-now' : ''}" href="${x.off ? '#today' : x.href}">
          <span class="rh-no">${x.done ? '✓' : k + 1}</span>
          <span class="rh-txt"><b>${x.t}</b><span>${x.sub}</span></span>
          ${x.done || x.off ? '' : `<span class="rh-go">${x.go} ${I.arrow}</span>`}
        </a>`).join('')}
        <label class="reward"><span>三步完成，我要犒賞自己：</span><input id="reward-in" maxlength="24" placeholder="一杯手搖、一集影集…" value="${esc(S.set.reward)}"></label>
        ${n === 3 ? `<p class="reward-line">${S.set.reward ? `三步都完成了，去享受你的「${esc(S.set.reward)}」吧。` : '三步都完成了。今天的字，交給睡眠去鞏固。'}</p>` : '<p class="rh-note">早上先複習前一天的字，睡前再掃一遍當天的字，睡眠會幫你把它們存進長期記憶。</p>'}
      </div>
    </section>`;
  }
  /* bedtime recap: picture and definition first, the word on tap */
  let recap = null;
  function viewRecap() {
    const ids = todaysWords();
    if (!recap || recap.day !== ymd() || recap.done) recap = { day: ymd(), ids: shuffle(ids), i: 0, shown: false, unsure: [] };
    paintRecap();
    const onKey = (e) => {
      if ($('.overlay') || !recap || recap.i >= recap.ids.length) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!recap.shown) rcShow(); else rcNext(true); }
      else if (recap.shown && e.key === '1') rcNext(false);
      else if (recap.shown && e.key === '2') rcNext(true);
    };
    document.addEventListener('keydown', onKey);
    cleanup = () => document.removeEventListener('keydown', onKey);
  }
  function rcShow() { recap.shown = true; sfx('flip'); paintRecap(); playWord(BY_ID.get(recap.ids[recap.i])); }
  function rcNext(sure) {
    const id = recap.ids[recap.i];
    if (!sure) { recap.unsure.push(id); if (!S.stars.includes(id)) S.stars.push(id); save(); }
    recap.i++;
    recap.shown = false;
    vt('card', paintRecap);
  }
  function paintRecap() {
    const R = recap;
    if (!R.ids.length) {
      view.innerHTML = `<div class="wrap"><div class="learn"><div class="done"><img src="assets/brand/night.webp" alt="" width="480" height="480"><div class="done-body"><span class="eyebrow">睡前快掃</span><h2>今天還沒有學新字。</h2><p style="color:var(--ink-2)">先闖一關或完成今日航程，睡前再回來掃一遍。</p><div class="row-btns"><a class="btn" href="#practice">去闖關 ${I.arrow}</a></div></div></div></div></div>`;
      return;
    }
    if (R.i >= R.ids.length) {
      if (!R.done) { R.done = true; today().recap = true; save(); sfx('complete'); }
      view.innerHTML = `<div class="wrap"><div class="learn"><div class="done">
        <img src="assets/brand/night.webp" alt="" width="480" height="480">
        <div class="done-body">
          <span class="eyebrow">睡前快掃完成</span>
          <h2>晚安，旅人。剩下的交給睡眠。</h2>
          <p style="color:var(--ink-2)">掃過 ${R.ids.length} 個字${R.unsure.length ? `，${R.unsure.length} 個不太確定的已加入收藏，明天練習時可以只練它們` : '，每個都還記得'}。</p>
          ${rewardLine()}
          <div class="row-btns"><a class="btn" href="#today">回到啟程 ${I.arrow}</a></div>
        </div></div></div></div>`;
      return;
    }
    const w = BY_ID.get(R.ids[R.i]);
    view.innerHTML = `<div class="wrap"><div class="learn">
      <div class="learn-top">
        <a class="icon-btn" href="#today" aria-label="離開快掃">${I.close}</a>
        <div class="meter"><i style="width:${(R.i / R.ids.length) * 100}%"></i></div>
        <span class="count num">${R.i + 1} / ${R.ids.length}</span>
      </div>
      <article class="flash rc-card">
        ${art(w, { full: true })}
        <div class="flash-body">
          <span class="eyebrow">睡前快掃 · 想得起是哪個字嗎？</span>
          <p class="def-line is-big"><span class="def-tag">${POS_EN[posOf(w)] || posOf(w)}</span>${esc(w.d)}</p>
          ${R.shown ? `<div class="flash-back"><div class="flash-word">${esc(w.w)}</div>${pron(w)}<p class="en-line rc-sent">${markSentence(dailyEx(w))}</p></div>` : ''}
        </div>
      </article>
      ${R.shown
        ? `<div class="rates rc-rates"><button class="rate r1" id="rc-no">不太確定<small>加入收藏</small></button><button class="rate r4" id="rc-yes">記得<small>下一個</small></button></div><p class="kbd-hint"><kbd>1</kbd> 不太確定　<kbd>2</kbd> 記得</p>`
        : `<button class="btn reveal-btn" id="rc-show">看答案</button><p class="kbd-hint"><kbd>Space</kbd> 看答案</p>`}
    </div></div>`;
    loadFull(view);
    const sh = $('#rc-show');
    if (sh) sh.addEventListener('click', rcShow);
    const y = $('#rc-yes');
    if (y) { y.addEventListener('click', () => rcNext(true)); $('#rc-no').addEventListener('click', () => rcNext(false)); }
  }

  /* ======================================================
     MAP (thousand-star chart)
     ====================================================== */
  /* ======================================================
     3D STAR MAP (WebGL): four orbits for the four score legs, one spiral arm per workplace topic
     ====================================================== */
  const ARM_TOPICS = TOPICS.filter((t) => t.k !== 'core');
  const TOPIC_RGB = { off: [127, 178, 230], hr: [239, 143, 107], fin: [242, 196, 109], mkt: [214, 160, 230], biz: [159, 184, 255], law: [180, 170, 240],
    ops: [216, 190, 150], tech: [130, 200, 255], evt: [155, 227, 143], trv: [127, 214, 230], hos: [255, 179, 138], shop: [255, 159, 168],
    home: [190, 220, 120], med: [143, 208, 200], core: [210, 214, 235] };
  const ORBIT_R = { 400: [0.16, 0.32], 600: [0.34, 0.5], 800: [0.52, 0.68], 990: [0.7, 0.88] };
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function galaxyLayout() {
    const n = WORDS.length;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const labelAt = {};
    WORDS.forEach((w, i) => {
      const r = seeded(hash(w.w) + w.id * 7919);
      const g = () => (r() + r() + r() - 1.5) / 1.5;
      const [r0, r1] = ORBIT_R[w.lv];
      const radius = r0 + r() * (r1 - r0);
      let angle;
      if (w.t === 'core') angle = r() * Math.PI * 2;                 // core words drift between the arms
      else {
        const arm = ARM_TOPICS.findIndex((t) => t.k === w.t);
        angle = (arm / ARM_TOPICS.length) * Math.PI * 2 + radius * 2.9 + g() * (0.07 + 0.02 / radius);
      }
      const thick = (w.t === 'core' ? 0.03 : 0.045) * (1 - radius * 0.5);
      pos.set([Math.cos(angle) * radius, g() * thick, Math.sin(angle) * radius], i * 3);
      col.set(TOPIC_RGB[w.t].map((v) => v / 255), i * 3);
      seed[i] = r();
    });
    ARM_TOPICS.forEach((t, a) => {
      const radius = 0.94; const angle = (a / ARM_TOPICS.length) * Math.PI * 2 + radius * 2.9;
      labelAt[t.k] = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
    });
    // decorative dust: spiral haze plus a far star shell
    const dn = 2600; const dust = new Float32Array(dn * 3); const dcol = new Float32Array(dn * 3); const dseed = new Float32Array(dn);
    const r = seeded(424242);
    for (let i = 0; i < dn; i++) {
      const g = () => (r() + r() + r() - 1.5) / 1.5;
      let x, y, z, c;
      if (i < 2000) {
        const radius = 0.05 + Math.pow(r(), 0.8) * 1.0; const arm = Math.floor(r() * ARM_TOPICS.length);
        const ang = (arm / ARM_TOPICS.length) * Math.PI * 2 + radius * 2.9 + g() * 0.22;
        x = Math.cos(ang) * radius; z = Math.sin(ang) * radius; y = g() * 0.06 * (1 - radius * 0.4);
        c = TOPIC_RGB[ARM_TOPICS[arm].k].map((v) => (v / 255) * 0.55 + 0.25);
      } else {
        const u = r() * 2 - 1; const th = r() * Math.PI * 2; const R = 4 + r() * 3;
        x = Math.sqrt(1 - u * u) * Math.cos(th) * R; y = u * R; z = Math.sqrt(1 - u * u) * Math.sin(th) * R; c = [0.85, 0.87, 1];
      }
      dust.set([x, y, z], i * 3); dcol.set(c, i * 3); dseed[i] = r();
    }
    // nebula haze: large, faint sprites along each arm plus a warm core bulge
    const nn = 420; const neb = new Float32Array(nn * 3); const ncol = new Float32Array(nn * 3); const nseed = new Float32Array(nn);
    for (let i = 0; i < nn; i++) {
      const g = () => (r() + r() + r() - 1.5) / 1.5;
      let x, y, z, c;
      if (i < 60) { const rr = Math.abs(g()) * 0.12; const a = r() * 6.283; x = Math.cos(a) * rr; z = Math.sin(a) * rr; y = g() * 0.03; c = [1.0, 0.82, 0.55]; }
      else {
        const arm = i % ARM_TOPICS.length; const radius = 0.15 + r() * 0.85;
        const ang = (arm / ARM_TOPICS.length) * Math.PI * 2 + radius * 2.9 + g() * 0.12;
        x = Math.cos(ang) * radius; z = Math.sin(ang) * radius; y = g() * 0.04; c = TOPIC_RGB[ARM_TOPICS[arm].k].map((v) => v / 255);
      }
      neb.set([x, y, z], i * 3); ncol.set(c, i * 3); nseed[i] = r();
    }
    return { n, pos, col, seed, labelAt, dust, dcol, dseed, dn, neb, ncol, nseed, nn };
  }

  const STAR_VS = `
    attribute vec3 aPos; attribute vec3 aCol; attribute float aSeed; attribute float aState;
    uniform mat4 uVP; uniform float uTime, uIntro, uScale, uMotion, uDust;
    varying vec3 vCol; varying float vAlpha; varying float vCore;
    void main() {
      float t = clamp((uIntro - aSeed * 0.35) / 0.65, 0.0, 1.0);
      float e = 1.0 - pow(1.0 - t, 3.0);
      float ang = atan(aPos.z, aPos.x) + (1.0 - e) * 3.2 * (1.0 - uDust * 0.7);
      float rad = length(aPos.xz) * mix(2.2, 1.0, e);
      vec3 p = vec3(cos(ang) * rad, aPos.y * e, sin(ang) * rad);
      vec4 clip = uVP * vec4(p, 1.0);
      gl_Position = clip;
      float tw = mix(1.0, 0.72 + 0.28 * sin(uTime * (0.8 + aSeed * 2.2) + aSeed * 60.0), uMotion);
      float st = aState;                       // 0 new, 1 learning, 2 mastered, 3 dimmed, 4 hovered
      float size = 2.6 + aSeed * 1.4; float a = 0.55; float core = 0.0; vec3 c = mix(aCol, vec3(0.82, 0.86, 1.0), 0.35);
      if (uDust > 1.5) { size = 46.0 + aSeed * 90.0; a = 0.05 + aSeed * 0.03; c = aCol; }
      else if (uDust > 0.5) { size = 1.6 + aSeed * 1.8; a = 0.3 + aSeed * 0.3; c = aCol; }
      else if (st > 3.5) { size = 15.0; a = 1.0; core = 1.0; c = vec3(1.0); }
      else if (st > 2.5) { size = 2.0; a = 0.12; }
      else if (st > 1.5) { size = 9.5 + aSeed * 3.0; a = 1.0; core = 1.0; c = mix(aCol, vec3(1.0, 0.95, 0.82), 0.35); }
      else if (st > 0.5) { size = 5.5 + aSeed * 1.5; a = 0.95; c = aCol; }
      gl_PointSize = size * uScale / clip.w * tw;
      vCol = c; vAlpha = a * e * tw; vCore = core;
    }`;
  const STAR_FS = `
    precision mediump float;
    varying vec3 vCol; varying float vAlpha; varying float vCore;
    void main() {
      vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0;
      if (r > 1.0) discard;
      float glow = exp(-r * r * 4.5);
      float hot = vCore * exp(-r * r * 40.0);
      gl_FragColor = vec4(vCol * glow + vec3(hot), (glow + hot) * vAlpha);
    }`;
  const LINE_VS = `attribute vec3 aPos; uniform mat4 uVP; void main(){ gl_Position = uVP * vec4(aPos, 1.0); }`;
  const LINE_FS = `precision mediump float; uniform vec4 uColor; void main(){ gl_FragColor = uColor; }`;

  function mat4Perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2); const nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function mat4LookAt(e, c) {
    let z = [e[0] - c[0], e[1] - c[1], e[2] - c[2]]; let l = Math.hypot(...z); z = z.map((v) => v / l);
    let x = [z[2], 0, -z[0]]; l = Math.hypot(...x) || 1; x = x.map((v) => v / l);
    const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
      -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1];
  }
  function mat4Mul(a, b) {
    const o = new Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; }
    return o;
  }

  function createGalaxy(wrap) {
    const cv = document.createElement('canvas');
    cv.className = 'gx-canvas';
    const gl = cv.getContext('webgl', { antialias: true, premultipliedAlpha: false, alpha: false });
    if (!gl) return null;
    wrap.prepend(cv);
    const compile = (vs, fs) => {
      const p = gl.createProgram();
      [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(([type, src]) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(p, s); });
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      return p;
    };
    let prog, lineProg;
    try { prog = compile(STAR_VS, STAR_FS); lineProg = compile(LINE_VS, LINE_FS); } catch (e) { cv.remove(); return null; }
    const L = galaxyLayout();
    const buf = (data) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; };
    const B = { pos: buf(L.pos), col: buf(L.col), seed: buf(L.seed), state: gl.createBuffer(), dpos: buf(L.dust), dcol: buf(L.dcol), dseed: buf(L.dseed), dstate: buf(new Float32Array(L.dn)), npos: buf(L.neb), ncol: buf(L.ncol), nseed: buf(L.nseed), nstate: buf(new Float32Array(L.nn)) };
    // orbit rings at the outer edge of each leg
    const ringPts = []; const RING_SEG = 160;
    [0.33, 0.51, 0.69, 0.89].forEach((rr) => { for (let i = 0; i < RING_SEG; i++) { const a = (i / RING_SEG) * Math.PI * 2; ringPts.push(Math.cos(a) * rr, 0, Math.sin(a) * rr); } });
    B.ring = buf(new Float32Array(ringPts));
    const loc = (p, names) => Object.fromEntries(names.map((n) => [n, n[0] === 'a' ? gl.getAttribLocation(p, n) : gl.getUniformLocation(p, n)]));
    const U = loc(prog, ['aPos', 'aCol', 'aSeed', 'aState', 'uVP', 'uTime', 'uIntro', 'uScale', 'uMotion', 'uDust']);
    const LU = loc(lineProg, ['aPos', 'uVP', 'uColor']);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cam = { yaw: -0.6, pitch: 0.62, dist: 2.25, vyaw: 0, vpitch: 0, idle: 0 };
    const G = { cv, gl, L, cam, lv: 0, hover: -1, intro: reduce ? 1 : 0, raf: 0, vp: null, w: 0, h: 0, states: new Float32Array(L.n), proj: new Float32Array(L.n * 3) };
    G.setStates = () => {
      WORDS.forEach((w, i) => {
        const st = status(w.id);
        let v = st === 'mastered' ? 2 : st === 'learning' ? 1 : 0;
        if (G.lv && w.lv !== G.lv) v = 3;
        if (i === G.hover) v = 4;
        G.states[i] = v;
      });
      gl.bindBuffer(gl.ARRAY_BUFFER, B.state); gl.bufferData(gl.ARRAY_BUFFER, G.states, gl.DYNAMIC_DRAW);
    };
    G.resize = () => {
      const r = wrap.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
      G.w = r.width; G.h = r.height; cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      cv.style.width = `${r.width}px`; cv.style.height = `${r.height}px`; G.dpr = dpr;
    };
    const attrib = (a, b, size) => { gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, size, gl.FLOAT, false, 0, 0); };
    let last = performance.now(); let t0 = last;
    const frame = (now) => {
      const dt = Math.min(50, now - last); last = now;
      if (!document.hidden) {
        const c = G.cam;
        if (!G.dragging) {
          c.yaw += c.vyaw; c.pitch += c.vpitch; c.vyaw *= 0.94; c.vpitch *= 0.9;
          c.idle += dt;
          if (!reduce && c.idle > 2500) c.yaw += 0.00006 * dt;
        }
        c.pitch = Math.max(0.12, Math.min(1.35, c.pitch));
        if (G.intro < 1) G.intro = Math.min(1, G.intro + dt / 2400);
        const eye = [Math.cos(c.pitch) * Math.cos(c.yaw) * c.dist, Math.sin(c.pitch) * c.dist, Math.cos(c.pitch) * Math.sin(c.yaw) * c.dist];
        G.vp = mat4Mul(mat4Perspective(0.9, G.w / G.h, 0.05, 30), mat4LookAt(eye, [0, -0.02, 0]));
        gl.viewport(0, 0, cv.width, cv.height);
        gl.clearColor(0.027, 0.043, 0.086, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        // orbits
        gl.useProgram(lineProg); gl.uniformMatrix4fv(LU.uVP, false, G.vp); attrib(LU.aPos, B.ring, 3);
        [400, 600, 800, 990].forEach((lv, k) => {
          const on = !G.lv || G.lv === lv;
          gl.uniform4f(LU.uColor, 0.95, 0.86, 0.62, (on ? 0.16 : 0.05) * G.intro);
          gl.drawArrays(gl.LINE_LOOP, k * RING_SEG, RING_SEG);
        });
        // stars
        gl.useProgram(prog);
        gl.uniformMatrix4fv(U.uVP, false, G.vp);
        gl.uniform1f(U.uTime, (now - t0) / 1000); gl.uniform1f(U.uIntro, G.intro);
        gl.uniform1f(U.uScale, G.dpr * Math.min(G.w, G.h) / 300); gl.uniform1f(U.uMotion, reduce ? 0 : 1);
        gl.uniform1f(U.uDust, 2); attrib(U.aPos, B.npos, 3); attrib(U.aCol, B.ncol, 3); attrib(U.aSeed, B.nseed, 1); attrib(U.aState, B.nstate, 1);
        gl.drawArrays(gl.POINTS, 0, L.nn);
        gl.uniform1f(U.uDust, 1); attrib(U.aPos, B.dpos, 3); attrib(U.aCol, B.dcol, 3); attrib(U.aSeed, B.dseed, 1); attrib(U.aState, B.dstate, 1);
        gl.drawArrays(gl.POINTS, 0, L.dn);
        gl.uniform1f(U.uDust, 0); attrib(U.aPos, B.pos, 3); attrib(U.aCol, B.col, 3); attrib(U.aSeed, B.seed, 1); attrib(U.aState, B.state, 1);
        gl.drawArrays(gl.POINTS, 0, L.n);
        G.placeLabels();
      }
      G.raf = requestAnimationFrame(frame);
    };
    const project = (x, y, z) => {
      const m = G.vp; const cx = m[0] * x + m[4] * y + m[8] * z + m[12]; const cy = m[1] * x + m[5] * y + m[9] * z + m[13]; const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
      return [(cx / cw * 0.5 + 0.5) * G.w, (1 - (cy / cw * 0.5 + 0.5)) * G.h, cw];
    };
    // floating topic labels and orbit labels
    const labels = document.createElement('div'); labels.className = 'gx-labels'; wrap.append(labels);
    const topicEls = ARM_TOPICS.map((t) => { const el = document.createElement('span'); el.className = 'gx-label'; el.textContent = t.zh; labels.append(el); return [t.k, el]; });
    const orbitEls = [[400, 0.33], [600, 0.51], [800, 0.69], [990, 0.89]].map(([lv, rr]) => { const el = document.createElement('span'); el.className = 'gx-orbit'; el.textContent = `${lv} ${LV[lv].name}`; labels.append(el); return [rr, el, lv]; });
    G.placeLabels = () => {
      if (!G.vp) return;
      topicEls.forEach(([k, el]) => {
        const [x, y, w] = project(...L.labelAt[k]);
        const a = Math.max(0, Math.min(1, (3.4 - w) / 1.6)) * G.intro;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`; el.style.opacity = a.toFixed(2);
      });
      orbitEls.forEach(([rr, el, lv]) => {
        const ang = -G.cam.yaw + Math.PI / 2;                 // keep the orbit label at the front of the ring
        const [x, y] = project(Math.cos(ang) * rr, 0, Math.sin(ang) * rr);
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, 6px)`; el.style.opacity = ((!G.lv || G.lv === lv ? 0.85 : 0.3) * G.intro).toFixed(2);
      });
    };
    G.pick = (mx, my) => {
      let best = -1; let bd = 18 * 18;
      for (let i = 0; i < L.n; i++) {
        if (G.states[i] === 3) continue;
        const [x, y, w] = project(L.pos[i * 3], L.pos[i * 3 + 1], L.pos[i * 3 + 2]);
        if (w <= 0) continue;
        const d = (x - mx) ** 2 + (y - my) ** 2 - (G.states[i] >= 1 ? 40 : 0);
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    };
    G.screenOf = (i) => project(L.pos[i * 3], L.pos[i * 3 + 1], L.pos[i * 3 + 2]);
    // pointer: drag to orbit, wheel / pinch to zoom, tap to open
    const pts = new Map(); let downAt = null; let pinch0 = 0; let dist0 = 0;
    cv.addEventListener('pointerdown', (e) => {
      cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      downAt = [e.clientX, e.clientY, performance.now()]; G.dragging = true; G.cam.idle = 0; G.cam.vyaw = G.cam.vpitch = 0;
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); dist0 = G.cam.dist; }
    });
    cv.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      if (pts.has(e.pointerId)) {
        const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pts.size === 2) {
          const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
          G.cam.dist = Math.max(1.05, Math.min(3.4, dist0 * pinch0 / Math.max(1, d)));
        } else {
          const dx = e.clientX - prev[0]; const dy = e.clientY - prev[1];
          G.cam.vyaw = dx * 0.0055; G.cam.vpitch = dy * 0.004;
          G.cam.yaw += G.cam.vyaw; G.cam.pitch += G.cam.vpitch;
        }
        G.onHover(-1);
      } else G.onHover(G.pick(e.clientX - r.left, e.clientY - r.top), e.clientX - r.left, e.clientY - r.top);
    });
    const up = (e) => {
      pts.delete(e.pointerId);
      if (!pts.size) {
        G.dragging = false;
        if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6 && performance.now() - downAt[2] < 500) {
          const r = cv.getBoundingClientRect(); const i = G.pick(e.clientX - r.left, e.clientY - r.top);
          if (i >= 0) G.onOpen(i);
          G.cam.vyaw = G.cam.vpitch = 0;
        }
        downAt = null;
      }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => { if (!pts.size) G.onHover(-1); });
    cv.addEventListener('wheel', (e) => { e.preventDefault(); G.cam.idle = 0; G.cam.dist = Math.max(1.05, Math.min(3.4, G.cam.dist * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
    cv.addEventListener('dblclick', () => { Object.assign(G.cam, { yaw: -0.6, pitch: 0.62, dist: 2.25, vyaw: 0, vpitch: 0 }); });
    G.start = () => { G.resize(); G.setStates(); if (!G.raf) G.raf = requestAnimationFrame(frame); };
    G.stop = () => { cancelAnimationFrame(G.raf); G.raf = 0; };
    return G;
  }

  const mapState = { lv: 0, stars: [], hover: null, raf: 0, galaxy: null };
  function viewMap() {
    const all = counts();
    view.innerHTML = `<div class="wrap">
      <header class="page-head">
        <span class="eyebrow">星圖 · 四條航道 · 十四條職場旋臂</span>
        <h1>每學會一個字，就點亮一顆星。</h1>
        <p class="sub">由內到外四條軌道是 400、600、800、990 四段航程，每條旋臂是一個職場場景，通用核心字散布在整片星盤。學習中的字會亮起，已熟的字會燃成金白色。</p>
      </header>
      <div class="chips" style="margin-bottom:16px" role="group" aria-label="分數航段">
        <button class="chip" data-mlv="0" aria-pressed="${mapState.lv === 0}">全部航段</button>
        ${LEVELS.map((l) => `<button class="chip lv-${l.lv}" data-mlv="${l.lv}" aria-pressed="${mapState.lv === l.lv}"><span class="dot"></span>${l.lv} ${l.name}</button>`).join('')}
      </div>
      <div class="map-wrap" id="map-wrap" role="img" aria-label="千詞星圖：已學 ${all.learning + all.mastered} 個，已熟 ${all.mastered} 個">
        <canvas id="map"></canvas>
        <div class="map-legend"><span><i style="background:rgba(214,220,240,.5)"></i>未學</span><span><i style="background:rgb(240,196,100);box-shadow:0 0 6px rgb(240,196,100)"></i>學習中</span><span><i style="background:#fff8e8;box-shadow:0 0 8px #ffe0a0"></i>已熟</span></div>
        <div class="gx-hint" id="gx-hint"><span class="gx-hint-long">拖曳旋轉 · 滾輪或雙指縮放 · 點星星打開詞卡 · 雙擊回正</span><span class="gx-hint-short">拖曳旋轉 · 雙指縮放 · 點星星看詞卡</span></div>
      </div>
      <section class="section">
        <div class="map-stats">
          ${LEVELS.map((l) => { const c = counts(WORDS.filter((w) => w.lv === l.lv)); return `<div class="map-stat lv-${l.lv}"><b class="num">${c.learning + c.mastered}<small style="font-size:14px;color:var(--ink-3)"> / ${c.total}</small></b><span>${l.lv} ${l.name} · 已熟 ${c.mastered}</span></div>`; }).join('')}
        </div>
      </section>
    </div>`;
    const wrap = $('#map-wrap');
    const tip = document.createElement('div');
    tip.className = 'map-tip';
    tip.hidden = true;
    wrap.appendChild(tip);
    const showTip = (w, x, y) => {
      if (!w) { tip.hidden = true; return; }
      tip.innerHTML = `${art(w)}<span><b>${esc(w.w)}</b>${esc(w.s[0][1])} · ${w.lv}</span>`;
      tip.hidden = false;
      const r = wrap.getBoundingClientRect();
      tip.style.left = `${Math.max(8, Math.min(x + 16, r.width - tip.offsetWidth - 8))}px`;
      tip.style.top = `${Math.max(8, Math.min(y - 70, r.height - tip.offsetHeight - 8))}px`;
    };
    const G = createGalaxy(wrap);
    mapState.galaxy = G;
    if (G) {
      $('#map').remove();
      G.lv = mapState.lv;
      G.onHover = (i, x, y) => {
        if (i === G.hover) { if (i >= 0) showTip(WORDS[i], x, y); return; }
        G.hover = i; G.setStates(); G.cv.style.cursor = i >= 0 ? 'pointer' : 'grab';
        showTip(i >= 0 ? WORDS[i] : null, x, y);
        if (i >= 0) sfx('tap');
      };
      G.onOpen = (i) => { sfx('ignite'); openEntry(WORDS[i].id, WORDS.map((w) => w.id)); };
      const ro = 'ResizeObserver' in window ? new ResizeObserver(() => G.resize()) : null;
      if (ro) ro.observe(wrap);
      G.start();
      setTimeout(() => { const h = $('#gx-hint'); if (h) h.classList.add('is-faded'); }, 5000);
      cleanup = () => { G.stop(); if (ro) ro.disconnect(); mapState.galaxy = null; };
    } else {
      $('#gx-hint').remove();
      const cv = $('#map');
      const find = (e) => {
        const r = cv.getBoundingClientRect(); const x = e.clientX - r.left; const y = e.clientY - r.top;
        let best = null; let bd = 14 * 14;
        for (const s of mapState.stars) { const d = (s.x - x) ** 2 + (s.y - y) ** 2; if (d < bd) { bd = d; best = s; } }
        return { best, x, y };
      };
      cv.addEventListener('mousemove', (e) => { const { best, x, y } = find(e); mapState.hover = best; showTip(best ? BY_ID.get(best.id) : null, x, y); cv.style.cursor = best ? 'pointer' : 'crosshair'; });
      cv.addEventListener('mouseleave', () => { tip.hidden = true; mapState.hover = null; });
      cv.addEventListener('click', (e) => { const { best } = find(e); if (best) openEntry(best.id, mapState.stars.map((s) => s.id)); });
      const ro = 'ResizeObserver' in window ? new ResizeObserver(() => drawMap()) : null;
      if (ro) ro.observe(wrap); else drawMap();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let last = 0;
      const loop = (t) => { mapState.raf = requestAnimationFrame(loop); if (t - last > 60) { last = t; paintStars(t); } };
      if (!reduce) mapState.raf = requestAnimationFrame(loop);
      cleanup = () => { cancelAnimationFrame(mapState.raf); if (ro) ro.disconnect(); };
    }
    view.querySelectorAll('[data-mlv]').forEach((b) => b.addEventListener('click', () => {
      mapState.lv = +b.dataset.mlv;
      view.querySelectorAll('[data-mlv]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      if (mapState.galaxy) { mapState.galaxy.lv = mapState.lv; mapState.galaxy.setStates(); } else drawMap();
    }));
  }
  function drawMap() {
    const cv = $('#map');
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
    const W = r.width;
    const H = r.height;
    const portrait = H > W;
    const cx = W / 2;
    const cy = H / 2;
    const ring = TOPICS.filter((t) => t.k !== 'core');
    const centers = { core: [cx, cy] };
    ring.forEach((t, i) => {
      const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
      centers[t.k] = [cx + Math.cos(a) * W * (portrait ? 0.35 : 0.41), cy + Math.sin(a) * H * (portrait ? 0.4 : 0.37)];
    });
    const unit = Math.min(W, H) / 112;
    const idx = {};
    mapState.stars = WORDS.map((w) => {
      const i = (idx[w.t] = (idx[w.t] || 0) + 1);
      const [ox, oy] = centers[w.t];
      const h = hash(w.w);
      const rr = Math.sqrt(i) * unit * (w.t === 'core' ? 1.08 : 1.3) * (0.9 + (h % 20) / 100);
      const a = i * 2.39996 + (h % 100) / 60;
      return { id: w.id, lv: w.lv, t: w.t, x: ox + Math.cos(a) * rr, y: oy + Math.sin(a) * rr * (w.t === 'core' ? 0.78 : 1), tw: (h % 628) / 100, sz: 0.7 + (h % 9) / 10, st: status(w.id) };
    });
    // static layer: sky, dust, nebulae, constellation labels
    const bg = document.createElement('canvas');
    bg.width = cv.width; bg.height = cv.height;
    const g = bg.getContext('2d');
    g.scale(dpr, dpr);
    const sky = g.createRadialGradient(cx, cy * 0.9, 0, cx, cy, Math.max(W, H) * 0.75);
    sky.addColorStop(0, '#18213d'); sky.addColorStop(0.55, '#0d1326'); sky.addColorStop(1, '#05080f');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    for (const t of TOPICS) {
      const [x, y] = centers[t.k];
      const rgb = NEBULA[t.k];
      const n = WORDS.filter((w) => w.t === t.k).length;
      const rad = Math.sqrt(n) * unit * (t.k === 'core' ? 1.25 : 1.6) + 30;
      const neb = g.createRadialGradient(x, y, 0, x, y, rad);
      neb.addColorStop(0, `rgba(${rgb},0.20)`); neb.addColorStop(0.6, `rgba(${rgb},0.06)`); neb.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = neb; g.beginPath(); g.arc(x, y, rad, 0, 6.283); g.fill();
    }
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 520; i++) {
      g.fillStyle = `rgba(230,225,255,${0.05 + rnd() * 0.22})`;
      g.beginPath(); g.arc(rnd() * W, rnd() * H, rnd() * 0.9 + 0.2, 0, 6.283); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    g.textAlign = 'center';
    for (const tp of TOPICS) {
      const [x, y] = centers[tp.k];
      const list = mapState.stars.filter((s) => s.t === tp.k);
      const lit = list.filter((s) => s.st !== 'new').length;
      const off = Math.sqrt(list.length) * unit * (tp.k === 'core' ? 0.9 : 1.3) + 18;
      g.fillStyle = 'rgba(242,235,221,0.86)';
      g.font = `700 ${Math.max(12, Math.min(15, W / 64))}px "Noto Serif TC", serif`;
      g.fillText(tp.zh, x, y + off);
      g.fillStyle = 'rgba(242,235,221,0.42)';
      g.font = `400 ${Math.max(10, Math.min(12, W / 90))}px ui-monospace, monospace`;
      g.fillText(`${lit} / ${list.length}`, x, y + off + 17);
    }
    mapState.bg = bg;
    mapState.dpr = dpr;
    mapState.size = [W, H];
    paintStars(performance.now());
  }
  const LV_RGB = { 400: '229,124,90', 600: '151,184,142', 800: '143,178,204', 990: '240,196,100' };
  const NEBULA = { off: '95,136,168', hr: '196,87,58', fin: '203,146,44', mkt: '154,98,131', biz: '80,110,170', law: '120,120,170',
    ops: '160,120,80', tech: '100,110,200', evt: '106,140,99', trv: '70,150,190', hos: '210,130,70', shop: '196,86,110',
    home: '130,150,70', med: '60,150,140', core: '150,140,190' };
  function paintStars(t) {
    const cv = $('#map');
    if (!cv || !mapState.bg) return;
    const ctx = cv.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(mapState.bg, 0, 0);
    ctx.setTransform(mapState.dpr, 0, 0, mapState.dpr, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (const s of mapState.stars) {
      const dim = mapState.lv && s.lv !== mapState.lv;
      const tw = 0.72 + 0.28 * Math.sin(t / 900 + s.tw);
      if (s.st === 'new') {
        ctx.fillStyle = `rgba(214,220,240,${dim ? 0.06 : 0.22 + 0.16 * tw})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, 0.9 * s.sz, 0, 6.283); ctx.fill();
      } else {
        const rgb = LV_RGB[s.lv];
        const strong = s.st === 'mastered';
        const a = dim ? 0.15 : strong ? tw : 0.75;
        const halo = strong ? 11 : 6;
        const gg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, halo);
        gg.addColorStop(0, `rgba(${rgb},${0.65 * a})`); gg.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(s.x, s.y, halo, 0, 6.283); ctx.fill();
        ctx.fillStyle = strong ? `rgba(255,248,232,${a})` : `rgba(${rgb},${a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, strong ? 1.9 : 1.5, 0, 6.283); ctx.fill();
        if (strong && !dim) {
          ctx.strokeStyle = `rgba(255,240,210,${0.35 * tw})`; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(s.x - 6, s.y); ctx.lineTo(s.x + 6, s.y); ctx.moveTo(s.x, s.y - 6); ctx.lineTo(s.x, s.y + 6); ctx.stroke();
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    const h = mapState.hover;
    if (h) {
      ctx.strokeStyle = 'rgba(242,235,221,0.95)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(h.x, h.y, 7, 0, 6.283); ctx.stroke();
    }
  }

  /* ======================================================
     ME
     ====================================================== */
  function viewMe() {
    const all = counts();
    const days = Object.values(S.days);
    const totalQ = days.reduce((a, d) => a + d.q, 0);
    const totalC = days.reduce((a, d) => a + d.c, 0);
    // 18-week heatmap ending this week
    const cells = [];
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - end.getDay() - 7 * 17);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const r = S.days[ymd(d)];
      const v = r ? r.n + r.r + r.q : 0;
      cells.push({ k: ymd(d), v });
    }
    const lvl = (v) => (v === 0 ? '' : v < 10 ? 'h1' : v < 30 ? 'h2' : 'h3');
    view.innerHTML = `<div class="wrap">
      <header class="page-head">
        <span class="eyebrow">護照 · 學習紀錄</span>
        <h1>你的旅行護照。</h1>
        <p class="sub">所有進度只存在這台裝置的瀏覽器裡，不需要註冊。換裝置或清除瀏覽資料前，記得先匯出備份。</p>
      </header>
      <div class="me-grid">
        <div style="display:grid;gap:20px">
          <section class="card panel">
            <div class="kpis">
              <div class="kpi"><b class="num">${all.learning + all.mastered}</b><span>已學單字</span></div>
              <div class="kpi"><b class="num">${all.mastered}</b><span>已熟單字</span></div>
              <div class="kpi"><b class="num">${streak()}</b><span>連續天數</span></div>
              <div class="kpi"><b class="num">${totalQ ? Math.round((totalC / totalQ) * 100) + '%' : '—'}</b><span>練習正確率</span></div>
            </div>
            <div>
              <div class="heat" aria-label="近 18 週學習熱度">${cells.map((c) => `<i class="${lvl(c.v)}" title="${c.k}：${c.v}"></i>`).join('')}</div>
              <div class="heat-foot"><span>18 週前</span><span>少 <i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--paper-2)"></i> <i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--ochre)"></i> 多</span><span>今天</span></div>
            </div>
          </section>
          <section class="card panel">
            <h2>四段航程進度</h2>
            <div class="lv-rows">
              ${LEVELS.map((l) => { const c = counts(WORDS.filter((w) => w.lv === l.lv)); return `<div class="lv-row lv-${l.lv}"><b>${l.lv}</b><div class="meter"><i class="m-mastered" style="width:${(c.mastered / c.total) * 100}%"></i><i class="m-learning" style="width:${(c.learning / c.total) * 100}%"></i></div><span>${c.mastered} 熟 · ${c.learning} 學</span></div>`; }).join('')}
            </div>
          </section>
        </div>
        <section class="card panel">
          <h2>設定</h2>
          <div class="setting"><span class="lab">每日新詞</span><div class="chips">${[5, 10, 15, 20, 30].map((n) => `<button class="chip" data-goal="${n}" aria-pressed="${S.set.goal === n}">${n} 個</button>`).join('')}</div></div>
          <div class="setting"><span class="lab">新詞從哪一段開始</span><div class="chips">${LEVELS.map((l) => `<button class="chip lv-${l.lv}" data-start="${l.lv}" aria-pressed="${S.set.start === l.lv}"><span class="dot"></span>${l.lv} ${l.name}</button>`).join('')}</div><span class="hint">這一段學完後，會自動接著下一段。</span></div>
          <div class="setting"><span class="lab">預設發音</span><div class="seg">${[['us', '美式'], ['uk', '英式']].map(([v, t]) => `<button data-accent-set="${v}" aria-pressed="${S.set.accent === v}">${t}</button>`).join('')}</div><span class="hint">多益聽力包含美、英、加、澳四種口音，兩種都聽熟最保險。</span></div>
          <div class="setting"><label for="rate">朗讀速度 <span class="num" id="rate-v">${S.set.rate.toFixed(2)}×</span></label><input id="rate" type="range" min="0.6" max="1.2" step="0.05" value="${S.set.rate}"></div>
          <div class="setting"><span class="lab">開場動畫</span><div class="seg">${[[true, '每天第一次播放'], [false, '關閉']].map(([v, t]) => `<button data-splash-set="${v}" aria-pressed="${S.set.splash === v}">${t}</button>`).join('')}</div></div>
          <div class="setting"><span class="lab">外觀</span><div class="seg">${[['system', '跟隨系統'], ['light', '淺色'], ['dark', '深色']].map(([v, t]) => `<button data-theme-set="${v}" aria-pressed="${S.set.theme === v}">${t}</button>`).join('')}</div></div>
          <div class="setting">
            <span class="lab">備份與還原</span>
            <div class="backup"><img src="assets/brand/data.webp" alt="" width="480" height="480" loading="lazy"><span class="hint">進度只存在這個瀏覽器。匯出後貼到記事本或雲端硬碟保存，換裝置時再貼回來還原。</span></div>
            <div class="row-btns">
              <button class="btn ghost small" id="export">匯出進度</button>
              <button class="btn ghost small" id="import">貼上備份還原</button>
              <label class="btn ghost small" for="import-file" style="cursor:pointer">從檔案還原</label>
              <input id="import-file" type="file" accept="application/json,.json" hidden>
            </div>
            <textarea class="data-box" id="data-box" hidden aria-label="進度資料"></textarea>
            <div class="row-btns" id="data-actions" hidden></div>
          </div>
          <div class="setting"><span class="lab">清除進度</span><button class="btn ghost small" id="reset" style="color:var(--bad);justify-self:start">清除所有學習紀錄</button></div>
        </section>
      </div>

      <section class="section about">
        <article class="card panel">
          <h2>多益怎麼計分</h2>
          <p>TOEIC Listening &amp; Reading 測驗共 200 題、約 2 小時：聽力 Part 1–4 共 100 題，閱讀 Part 5–7 共 100 題，各 495 分，總分 10–990。證書依分數分為五種顏色：</p>
          <div class="score-bands">
            <div class="band"><i style="background:#c9a227"></i><b>860–990</b><span>金色證書，能流暢處理專業議題</span></div>
            <div class="band"><i style="background:#3466a4"></i><b>730–855</b><span>藍色證書，可勝任多數職場溝通</span></div>
            <div class="band"><i style="background:#3c8657"></i><b>470–725</b><span>綠色證書，能處理日常與例行工作</span></div>
            <div class="band"><i style="background:#8a5a3c"></i><b>220–465</b><span>棕色證書，具備基本溝通能力</span></div>
            <div class="band"><i style="background:#d9752f"></i><b>10–215</b><span>橘色證書，入門階段</span></div>
          </div>
          <p>本站把 1,000 個字依難度分成 400、600、800、990 四段航程，每段 250 字，由淺入深。</p>
        </article>
        <article class="card panel">
          <h2>關於多益詞旅</h2>
          <ul>
            <li>每個字的英英釋義、分詞性中文釋義、近似詞、相反詞、日常例句、多益例句、中文翻譯與常用搭配，皆由本站以台灣用語原創撰寫。</li>
            <li>填空題使用的 5,000 句多益情境例句（每字 5 句，與詞卡上的多益例句輪流出題）為本站原創撰寫。</li>
            <li>航程故事《NS-014 號航班》是本站原創的連載小說，人物、情節與中文翻譯皆為原創；每章收錄 9–10 個同分數段的單字，並避開意思相近的字放在同一章，減少混淆。</li>
            <li>KK 音標依 CMU Pronouncing Dictionary 自動轉寫並人工校對常見多音字；15 個職場場景與 ${WORDS.filter((w) => w.tip).length} 則「多益考點」由本站編輯整理。</li>
            <li>單字插畫、場景插畫與美英發音錄音取自 Word Atlas（Word Atlas contributors，<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>），本站已縮放並合併成圖集與音訊檔。${fmt(WORDS.filter((w) => w.ar === 'w').length)} 個字使用原字插畫、${WORDS.filter((w) => w.ar === 'r').length} 個字使用同字根插畫，其餘以所屬職場場景的插畫代替；有真人錄音的字共 ${fmt(WORDS.filter((w) => w.u).length)} 個，其餘使用裝置內建語音。</li>
            <li>複習排程採 SM-2 式間隔重複：答「記得」的字間隔會逐次拉長，連續記得到 21 天以上視為「已熟」。</li>
            <li>背景配樂、三段環境音與所有介面音效，皆為本站以程式原創合成（D 大調電鋼琴、加法合成長音與卷積殘響），可在頂部的環境音選單切換或關閉。</li>
            <li>介面與學習流程致敬開源雅思單字專案 <a href="https://github.com/designfuchen/word-atlas" target="_blank" rel="noopener">詞光 Word Atlas</a>（MIT 授權），本站為獨立實作的多益版本。</li>
          </ul>
        </article>
      </section>
    </div>`;
    view.querySelectorAll('[data-goal]').forEach((b) => b.addEventListener('click', () => { S.set.goal = +b.dataset.goal; save(); plan(); viewMe(); toast(`每日新詞改為 ${S.set.goal} 個`); }));
    view.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => { S.set.start = +b.dataset.start; const d = today(); d.plan = (d.plan || []).filter((id) => S.cards[id]); save(); plan(); viewMe(); toast(`新詞改從 ${S.set.start} 分段開始`); }));
    view.querySelectorAll('[data-accent-set]').forEach((b) => b.addEventListener('click', () => { S.set.accent = b.dataset.accentSet; save(); viewMe(); playWord(BY_ID.get(1)); }));
    view.querySelectorAll('[data-splash-set]').forEach((b) => b.addEventListener('click', () => { S.set.splash = b.dataset.splashSet === 'true'; save(); viewMe(); }));
    view.querySelectorAll('[data-theme-set]').forEach((b) => b.addEventListener('click', () => { S.set.theme = b.dataset.themeSet; save(); applyTheme(); paintTools(); viewMe(); }));
    const rate = $('#rate');
    rate.addEventListener('input', () => { S.set.rate = +rate.value; $('#rate-v').textContent = `${S.set.rate.toFixed(2)}×`; });
    rate.addEventListener('change', () => { save(); speak('The quarterly report is due on Friday.'); });
    const box = $('#data-box');
    const acts = $('#data-actions');
    $('#export').addEventListener('click', () => {
      const json = JSON.stringify(S);
      box.hidden = false; acts.hidden = false;
      box.value = json;
      acts.innerHTML = '<button class="btn small" id="copy-data">複製到剪貼簿</button><button class="btn ghost small" id="dl-data">下載 JSON 檔</button>';
      $('#copy-data').addEventListener('click', () => {
        const done = () => toast('已複製，貼到記事本或雲端硬碟保存');
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(json).then(done, () => { box.select(); toast('請按 Ctrl/⌘ + C 複製選取的文字'); });
        else { box.select(); toast('請按 Ctrl/⌘ + C 複製選取的文字'); }
      });
      $('#dl-data').addEventListener('click', () => {
        try {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
          a.download = `toeic-voyage-${ymd()}.json`;
          document.body.appendChild(a); a.click(); a.remove();
        } catch (e) { toast('這個環境無法下載檔案，請改用「複製到剪貼簿」。'); }
      });
    });
    const restore = (text) => {
      try {
        const raw = JSON.parse(text);
        if (!raw || raw.v !== 1 || typeof raw.cards !== 'object') throw new Error('bad');
        S = { ...fresh(), ...raw, set: { ...DEFAULT_SET, ...(raw.set || {}) } };
        save(); applyTheme(); paintTools(); viewMe();
        toast(`已還原：${Object.keys(S.cards).length} 個單字的紀錄`);
      } catch (e) { toast('這不是多益詞旅的備份資料，請確認貼上的是完整的 JSON。'); }
    };
    $('#import').addEventListener('click', () => {
      box.hidden = false; acts.hidden = false;
      box.value = '';
      box.placeholder = '把先前匯出的 JSON 貼在這裡';
      box.focus();
      acts.innerHTML = '<button class="btn small" id="do-import">還原這份備份</button>';
      $('#do-import').addEventListener('click', () => restore(box.value));
    });
    $('#import-file').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => restore(String(r.result));
      r.readAsText(f);
    });
    $('#reset').addEventListener('click', () => confirmDialog('清除所有學習紀錄？', '已學單字、複習排程、收藏與每日紀錄都會刪除，無法復原。建議先匯出備份。', '清除', () => {
      const keep = S.set;
      S = fresh(); S.set = keep; S.onboarded = true; save(); session = null; viewMe(); toast('已清除學習紀錄');
    }));
  }

  /* ---------- dialogs ---------- */
  function confirmDialog(title, body, okText, onOk) {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.setAttribute('role', 'alertdialog');
    ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="dialog" style="width:min(460px,100%)"><div class="dialog-body"><h2 style="font-size:24px">${esc(title)}</h2><p class="sub">${esc(body)}</p><div class="dialog-foot"><button class="btn ghost" data-x>取消</button><button class="btn" data-ok style="background:var(--bad);color:var(--card)">${esc(okText)}</button></div></div></div>`;
    document.body.appendChild(ov);
    const close = () => ov.remove();
    ov._close = close;
    ov.querySelector('[data-x]').addEventListener('click', close);
    ov.querySelector('[data-ok]').addEventListener('click', () => { close(); onOk(); });
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelector('[data-x]').focus();
  }
  function onboarding() {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', '設定學習起點');
    let start = S.set.start;
    let goal = S.set.goal;
    const paint = () => {
      ov.innerHTML = `<div class="dialog">
        <div class="dialog-art" style="background-image:url(assets/brand/og.webp)" role="img" aria-label="攤開的書頁上浮現一座島嶼地圖"></div>
        <div class="dialog-body">
        <span class="eyebrow">WELCOME ABOARD · 歡迎登機</span>
        <h2>先決定你的起飛點。</h2>
        <p class="sub">多益詞旅把 1,000 個多益單字分成四段航程。選一個你現在的程度，新詞會從那一段開始。</p>
        <div class="pick">${LEVELS.map((l) => `<button class="lv-${l.lv}" data-s="${l.lv}" aria-pressed="${start === l.lv}"><b>${l.lv}</b><strong style="font-size:15px">${l.name} · ${l.en}</strong><span>${l.desc}</span></button>`).join('')}</div>
        <div style="display:grid;gap:10px"><span class="eyebrow">每天想學幾個新詞</span><div class="chips">${[5, 10, 15, 20, 30].map((n) => `<button class="chip" data-g="${n}" aria-pressed="${goal === n}">${n} 個${n === 10 ? '（建議）' : ''}</button>`).join('')}</div></div>
        <div class="dialog-foot"><button class="btn" data-go>出發 ${I.arrow}</button></div>
        </div>
      </div>`;
      ov.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => { start = +b.dataset.s; paint(); }));
      ov.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => { goal = +b.dataset.g; paint(); }));
      ov.querySelector('[data-go]').addEventListener('click', () => {
        sfx('start');
        S.set.start = start; S.set.goal = goal; S.onboarded = true;
        const d = today(); d.plan = (d.plan || []).filter((id) => S.cards[id]);
        save(); ov.remove(); document.documentElement.classList.remove('is-locked'); render();
      });
    };
    paint();
    document.body.appendChild(ov);
    document.documentElement.classList.add('is-locked');
    ov.querySelector('[data-go]').focus();
  }

  /* ======================================================
     SPLASH: stardust gathers into the mark, the name and the wordmark; a tap opens the cabin door
     ====================================================== */
  const SPLASH_KEY = 'toeic-voyage:splash';
  function shouldSplash() {
    if (S.set.splash === false) return false;
    const h = (location.hash || '').slice(1);
    if (h && h !== 'today') return false;               // deep links go straight to the content
    try { return localStorage.getItem(SPLASH_KEY) !== ymd(); } catch (e) { return true; }
  }
  function splashTargets(w, h, count) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const s = Math.min(w, h); const cx = w / 2; const R = s * 0.075; const cy = h * 0.5 - s * 0.2;
    g.fillStyle = g.strokeStyle = '#fff';
    // the mark: a ring, a dotted flight path and a small plane
    g.lineWidth = Math.max(2, s * 0.007);
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.setLineDash([s * 0.004, s * 0.014]); g.beginPath(); g.moveTo(cx - R * 0.62, cy + R * 0.28); g.quadraticCurveTo(cx, cy + R * 0.1, cx + R * 0.48, cy - R * 0.45); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(cx + R * 0.36, cy - R * 0.5); g.lineTo(cx + R * 0.68, cy - R * 0.62); g.lineTo(cx + R * 0.58, cy - R * 0.3); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx - R * 0.32, cy + R * 0.55); g.lineTo(cx + R * 0.32, cy + R * 0.55); g.stroke();
    const zh = Math.min(w * 0.17, s * 0.15);
    g.font = `900 ${zh}px "Noto Serif TC", "Songti TC", "PMingLiU", serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('多益詞旅', cx, cy + R + zh * 0.95);
    const data = g.getImageData(0, 0, w, h).data;
    const lit = [];
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 120) lit.push(x, y);
    const pts = [];
    for (let i = 0; i < count && lit.length; i++) { const k = Math.floor(Math.random() * (lit.length / 2)) * 2; pts.push([lit[k] + Math.random() * 2, lit[k + 1] + Math.random() * 2]); }
    return { pts, below: cy + R + zh * 2.3, en: cy + R + zh * 1.62, enSize: Math.max(13, zh * 0.19) };
  }
  function runSplash(done) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ov = document.createElement('div');
    ov.className = 'splash';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', '多益詞旅 歡迎登機');
    ov.innerHTML = `<canvas class="splash-cv" aria-hidden="true"></canvas>
      <p class="splash-en" aria-hidden="true">TOEIC VOYAGE</p>
      <div class="splash-ui">
        <p class="splash-tag">一千個職場單字，一段從 400 飛到 990 的航程</p>
        <button class="splash-go" id="splash-go">點一下，登機出發</button>
        <button class="splash-skip" id="splash-skip">略過</button>
      </div>`;
    document.body.appendChild(ov);
    document.documentElement.classList.add('is-locked');
    const cv = ov.querySelector('canvas');
    const w = innerWidth; const h = innerHeight; const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr;
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const palette = [['243,236,223', 0.56], ['232,182,90', 0.18], ['229,124,90', 0.11], ['151,184,142', 0.08], ['143,178,204', 0.07]];
    const pick = () => { let r = Math.random(); for (const [c, p] of palette) if ((r -= p) <= 0) return c; return palette[0][0]; };
    let P = []; let raf = 0; let phase = 'gather'; let t0 = performance.now(); let tOpen = 0; let below = h * 0.75;
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    const build = () => {
      const N = w < 700 ? 2300 : 4600;
      const T = splashTargets(w, h, N); below = T.below;
      ov.querySelector('.splash-ui').style.top = `${Math.min(h - 150, below)}px`;
      const enEl = ov.querySelector('.splash-en'); enEl.style.top = `${T.en}px`; enEl.style.fontSize = `${T.enSize}px`;
      P = T.pts.map(([tx, ty]) => {
        const a = Math.random() * Math.PI * 2; const rr = Math.max(w, h) * (0.45 + Math.random() * 0.7);
        const sx = w / 2 + Math.cos(a) * rr * 0.9; const sy = h / 2 + Math.sin(a) * rr * 0.6;
        return { x: sx, y: sy, sx, sy, tx, ty, vx: 0, vy: 0, c: pick(), r: 0.6 + Math.random() * 1.3, d: Math.random() * 0.55, tw: Math.random() * 6.28 };
      });
    };
    const tick = (now) => {
      const t = (now - t0) / 1000;
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(7, 11, 22, 0.32)'; g.fillRect(0, 0, w, h);          // trails
      g.globalCompositeOperation = 'lighter';
      for (const p of P) {
        if (phase !== 'open') {
          const k = ease((t - p.d) / 1.9);
          const swirl = (1 - k) * 0.9;
          const ax = p.sx + (p.tx - p.sx) * k; const ay = p.sy + (p.ty - p.sy) * k;
          const dx = ax - w / 2; const dy = ay - h / 2;
          p.x = w / 2 + dx * Math.cos(swirl) - dy * Math.sin(swirl);
          p.y = h / 2 + dx * Math.sin(swirl) + dy * Math.cos(swirl);
          if (k >= 1) { p.x += Math.sin(t * 1.3 + p.tw) * 0.25; p.y += Math.cos(t * 1.1 + p.tw) * 0.25; }
        } else {
          p.vx += (p.x - w / 2) * 0.0009 + (Math.random() - 0.5) * 0.3; p.vy += (p.y - h / 2) * 0.0009 - 0.05;
          p.x += p.vx; p.y += p.vy;
        }
        const a = 0.55 + 0.45 * Math.sin(t * 2.2 + p.tw);
        g.fillStyle = `rgba(${p.c},${(phase === 'open' ? Math.max(0, 1 - (now - tOpen) / 900) : 1) * a})`;
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
      }
      if (phase === 'gather' && t > 2.3) { phase = 'ready'; ov.classList.add('is-ready'); $('#splash-go', ov).focus({ preventScroll: true }); }
      raf = requestAnimationFrame(tick);
    };
    const finish = () => {
      cancelAnimationFrame(raf); ov.remove();
      if (!$('.overlay')) document.documentElement.classList.remove('is-locked');
      try { localStorage.setItem(SPLASH_KEY, ymd()); } catch (e) { /* ignore */ }
      done();
    };
    const open = () => {
      if (phase === 'open') return;
      armAudio(); sfx('start');
      phase = 'open'; tOpen = performance.now();
      ov.classList.add('is-open');
      setTimeout(finish, reduce ? 200 : 1100);
    };
    $('#splash-go', ov).addEventListener('click', open);
    $('#splash-skip', ov).addEventListener('click', (e) => { e.stopPropagation(); armAudio(); finish(); });
    ov.addEventListener('click', (e) => { if (phase === 'ready' && !e.target.closest('button')) open(); });
    ov.addEventListener('keydown', (e) => { if (e.key === 'Escape') { armAudio(); finish(); } });
    if (reduce) { ov.classList.add('is-ready', 'is-still'); return; }
    const go = () => { build(); g.fillStyle = '#070b16'; g.fillRect(0, 0, w, h); t0 = performance.now(); raf = requestAnimationFrame(tick); };
    // wait briefly for the display fonts so the stardust spells the real letterforms
    const fontsReady = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('900 64px "Noto Serif TC"', '多益詞旅'), document.fonts.load('600 20px "Fraunces"', 'TOEIC')]) : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(go, go);
  }

  /* ---------- global keys ---------- */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
    if (e.key === 'Escape' && !$('#amb-pop').hidden) { toggleAmbPop(false); $('#amb-btn').focus(); return; }
    if (e.key === 'Escape') {
      const top = $$('.overlay').pop();
      if (!top) return;
      if (top.classList.contains('is-entry')) closeEntry();
      else if (top._close) top._close();
      return;
    }
    if (e.key === '/' && !e.target.matches('input, textarea') && !$('.overlay')) { e.preventDefault(); openPalette(); return; }
    const ov = $('.overlay.is-entry');
    if (ov && !e.target.matches('input, textarea')) {
      if (e.key === 'ArrowLeft') $('#e-prev:not([disabled])')?.click();
      if (e.key === 'ArrowRight') $('#e-next:not([disabled])')?.click();
    }
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => paintTools());

  const VIEWS = { today: viewToday, recap: viewRecap, sprint: viewSprint, story: viewStory, atlas: viewAtlas, learn: viewLearn, practice: viewPractice, map: viewMap, me: viewMe };

  applyTheme();
  render();
  const afterSplash = () => { if (!S.onboarded) onboarding(); };
  if (shouldSplash()) runSplash(afterSplash); else afterSplash();
})();
