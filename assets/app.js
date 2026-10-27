/* 職光 TOEIC Atlas — app
   Vanilla JS, no build step. Views: today / atlas / learn / practice / map / me (hash routed). */
(() => {
  'use strict';

  const WORDS = window.TOEIC_WORDS || [];
  const BY_ID = new Map(WORDS.map((w) => [w.id, w]));
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
  const POS_ZH = { 'n.': '名詞', 'v.': '動詞', 'adj.': '形容詞', 'adv.': '副詞', 'prep.': '介系詞' };

  /* ---------- icons ---------- */
  const I = {
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
  const KEY = 'toeic-atlas-v1';
  const DEFAULT_SET = { goal: 10, start: 400, accent: 'us', rate: 0.9, sfx: true, theme: 'system' };
  function fresh() { return { v: 1, cards: {}, days: {}, stars: [], set: { ...DEFAULT_SET }, onboarded: false }; }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && raw.v === 1) return { ...fresh(), ...raw, set: { ...DEFAULT_SET, ...(raw.set || {}) } };
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
    return WORDS.filter((w) => w.lv >= start).concat(WORDS.filter((w) => w.lv < start));
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
  function speak(text, accent = S.set.accent, rate = S.set.rate) {
    if (!('speechSynthesis' in window)) { toast('這個瀏覽器不支援語音朗讀，請改用 Chrome、Edge 或 Safari。'); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = accent === 'uk' ? 'en-GB' : 'en-US';
      const v = pickVoice(u.lang);
      if (v) u.voice = v;
      u.rate = rate;
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
      const started = a.play();
      const c = clip;
      const arm = () => { if (clip === c) c.t = setTimeout(() => { if (clip === c) { a.pause(); clip = null; } }, ((end - a.currentTime) / a.playbackRate) * 1000 + 40); };
      if (started && started.then) started.then(arm, () => { clip = null; speak(w.w, accent, rate); });
      else arm();
    } catch (e) { speak(w.w, accent, rate); }
  }
  let actx = null;
  function sfx(kind) {
    if (!S.set.sfx) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { ok: [660, 990], no: [220, 180], flip: [520], done: [523, 659, 784, 1046] }[kind] || [440];
      notes.forEach((f, i) => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        const t = actx.currentTime + i * 0.09;
        o.type = kind === 'no' ? 'triangle' : 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(kind === 'flip' ? 0.05 : 0.12, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g).connect(actx.destination);
        o.start(t);
        o.stop(t + 0.25);
      });
    } catch (e) { /* audio unavailable */ }
  }

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
    ['today', '今日', I.today],
    ['atlas', '圖鑑', I.atlas],
    ['practice', '練習', I.practice],
    ['map', '星圖', I.map],
    ['me', '我的', I.me],
  ];
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="top"><div class="wrap">
      <a class="brand" href="#today" aria-label="職光 TOEIC Atlas 首頁">${LOGO}<span class="brand-zh">職光</span><span class="brand-en">TOEIC Atlas</span></a>
      <nav class="nav" aria-label="主要頁面">${NAV.map(([k, t]) => `<a href="#${k}" data-nav="${k}">${t}</a>`).join('')}</nav>
      <div class="top-tools">
        <button class="search-btn" id="open-search" aria-label="搜尋單字">${I.search}<span>搜尋單字或中文</span><kbd>⌘K</kbd></button>
        <button class="icon-btn" id="toggle-sfx" aria-label="音效"></button>
        <button class="icon-btn" id="toggle-theme" aria-label="切換深淺色"></button>
      </div>
    </div></header>
    <main id="view" tabindex="-1"></main>
    <footer class="foot"><div class="wrap">
      <span>職光 TOEIC Atlas · 1,000 個多益必備單字 · 學習進度只存在你的瀏覽器</span>
      <span>致敬開源專案 <a href="https://github.com/designfuchen/word-atlas" target="_blank" rel="noopener">詞光 Word Atlas</a></span>
    </div></footer>
    <nav class="tabbar" aria-label="主要頁面">${NAV.map(([k, t, ic]) => `<a href="#${k}" data-nav="${k}">${ic}<span>${t}</span></a>`).join('')}</nav>`;
  const view = $('#view');

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

  let toastTimer;
  function toast(msg) {
    let el = $('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2400);
  }

  /* ---------- router ---------- */
  const route = { name: 'today' };
  let cleanup = null;
  function go(name) { if (location.hash !== `#${name}`) location.hash = name; else render(); }
  function render() {
    const raw = (location.hash || '#today').slice(1);
    let name = raw;
    let wordId = null;
    const m = raw.match(/^word-(\d+)$/);
    if (m) { wordId = +m[1]; name = route.name && route.name !== 'word' ? route.name : 'atlas'; }
    if (!VIEWS[name]) name = 'today';
    if (cleanup) { cleanup(); cleanup = null; }
    const changed = route.name !== name || !view.innerHTML;
    route.name = name;
    $$('[data-nav]').forEach((a) => a.setAttribute('aria-current', a.dataset.nav === name || (name === 'learn' && a.dataset.nav === 'today') ? 'page' : 'false'));
    if (changed || !wordId) { VIEWS[name](); if (!wordId) window.scrollTo(0, 0); }
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
  function markSentence(w) {
    const s = w.en;
    const a = w.a;
    const f = w.f;
    if (s.substr(a, f.length) !== f) return esc(s);
    return `${esc(s.slice(0, a))}<mark>${esc(f)}</mark>${esc(s.slice(a + f.length))}`;
  }
  document.addEventListener('click', (e) => {
    const say = e.target.closest('[data-say]');
    if (say) { e.preventDefault(); e.stopPropagation(); speak(say.dataset.say, say.dataset.accent || S.set.accent, say.dataset.slow ? 0.8 : S.set.rate); return; }
    const wd = e.target.closest('[data-word]');
    if (wd) {
      e.preventDefault(); e.stopPropagation();
      playWord(BY_ID.get(+wd.dataset.word), wd.dataset.accent || S.set.accent, wd.dataset.slow ? 0.8 : S.set.rate);
      if (wd.classList.contains('pron')) { wd.classList.add('is-playing'); setTimeout(() => wd.classList.remove('is-playing'), 900); }
      return;
    }
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); const list = open.closest('[data-list]'); openEntry(+open.dataset.open, list ? listContext : null); }
  });

  /* ======================================================
     TODAY
     ====================================================== */
  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return '夜深了，職人。';
    if (h < 11) return '早安，職人。';
    if (h < 14) return '午安，職人。';
    if (h < 18) return '午後好，職人。';
    return '晚安，職人。';
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

        <section class="section">
          <div class="today-grid">
            <article class="card wotd">
              <button data-open="${wotd.id}" aria-label="打開 ${esc(wotd.w)} 詞卡">${art(wotd, { tag: true })}</button>
              <div class="wotd-body">
                <span class="eyebrow">今日一詞</span>
                <button class="wotd-word" data-open="${wotd.id}">${esc(wotd.w)}</button>
                ${pron(wotd)}
                <p><b>${esc(zhMain(wotd))}</b> <span style="color:var(--ink-3)">${wotd.s.map((s) => s[0]).join(' / ')}</span></p>
                <p class="wotd-sent">${markSentence(wotd)} <button class="mini-spk" data-say="${esc(wotd.en)}" aria-label="朗讀例句">${I.speaker}</button></p>
                <p class="wotd-zh">${esc(wotd.zh)}</p>
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
          <div class="section-head"><h2>十五個職場場景</h2><a class="more" href="#atlas">打開圖鑑 →</a></div>
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
            <span class="eyebrow">圖鑑 · ${fmt(WORDS.length)} 詞</span>
            <h1>每個詞，都在一個職場裡。</h1>
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
  function openEntry(id, ctx, fromHash) {
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
          <div class="entry-no"><span>№ ${pad(w.id, 4)}</span><i></i><span>TOEIC ATLAS</span></div>
          <h2 class="entry-word">${esc(w.w)}</h2>
          ${pron(w)}
          <div class="senses">${w.s.map((s) => `<div class="sense"><i>${s[0]}</i><b>${esc(s[1])}</b></div>`).join('')}</div>
          <div class="example">
            <div class="block-label">職場例句</div>
            <p class="en-line">${markSentence(w)} <button class="mini-spk" data-say="${esc(w.en)}" aria-label="朗讀例句">${I.speaker}</button></p>
            <p class="zh-line">${esc(w.zh)}</p>
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
    if (kn) kn.addEventListener('click', () => { markKnown(id); sfx('ok'); toast(`${w.w} 標為已熟，21 天後再複習`); openEntry(id); refreshUnder(); });
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
    const back = ov._prevFocus;
    ov.remove();
    entryCtx = null;
    if (!$('.overlay')) document.documentElement.classList.remove('is-locked');
    try { history.replaceState(null, '', `#${route.name}`); } catch (e) { /* sandboxed */ }
    if (back && back.focus) back.focus({ preventScroll: true });
  }
  function refreshUnder() {
    if (route.name === 'atlas') paintAtlas();
    else if (route.name === 'today' || route.name === 'me') VIEWS[route.name]();
    else if (route.name === 'map') drawMap();
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
        : '<div class="empty" style="padding:30px"><span>找不到這個字。1,000 字詞庫以講義收錄為準。</span></div>';
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
    if (!session || !session.queue.length) startSession();
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
    const id = session.queue.shift();
    const c = grade(id, g);
    session.tally[g]++;
    if (c.due - Date.now() < 20 * MIN) session.queue.splice(Math.min(3, session.queue.length), 0, id);
    else session.done++;
    session.revealed = false;
    paintLearn();
  }
  function paintLearn() {
    const s = session;
    const pct = s.total ? (s.done / s.total) * 100 : 100;
    if (!s.queue.length) {
      if (s.total) sfx('done');
      const d = today();
      view.innerHTML = `<div class="wrap"><div class="learn">
        <div class="done">
          <img src="assets/brand/done.webp" alt="" width="480" height="480">
          <div class="done-body">
            <span class="eyebrow">本日航程完成</span>
            <h2>${s.total ? '今天的單字都平安降落了。' : '今天沒有待學的單字。'}</h2>
            <p style="color:var(--ink-2)">${s.total ? `這一輪記得 ${s.tally[3] + s.tally[4]} 次、模糊 ${s.tally[2]} 次、忘了 ${s.tally[1]} 次。` : '新詞與複習都完成了。'}今天累計新詞 ${d.n} 個、複習 ${d.r} 次。</p>
            <div class="row-btns">
              <a class="btn" href="#practice">用練習題鞏固 ${I.arrow}</a>
              <button class="btn ghost" id="more5">再學 5 個新詞</button>
            </div>
          </div>
        </div></div></div>`;
      $('#more5').addEventListener('click', () => { S.set.goal += 5; save(); plan(); session = null; viewLearn(); });
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
              <div class="senses">${w.s.map((x) => `<div class="sense"><i>${x[0]}</i><b>${esc(x[1])}</b></div>`).join('')}</div>
              <div class="example"><p class="en-line">${markSentence(w)} <button class="mini-spk" data-say="${esc(w.en)}" aria-label="朗讀例句">${I.speaker}</button></p><p class="zh-line">${esc(w.zh)}</p></div>
              ${w.tip ? `<div class="tip"><div class="block-label">多益考點</div><p>${esc(w.tip)}</p></div>` : ''}
            </div>` : `<p class="flash-hint">看著畫面，先在心裡說出中文意思，再翻面確認。</p>`}
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
    { k: 'zh2en', part: 'Meaning → Word', zh: '看義選詞', desc: '看插畫與中文釋義，從四個英文單字裡選出正確的那一個。', img: 'topic-education' },
    { k: 'en2zh', part: 'Word → Meaning', zh: '看詞選義', desc: '看英文單字與 KK 音標，選出正確的中文意思。', img: 'topic-thinking' },
    { k: 'listen', part: 'Part 1–2 聽力暖身', zh: '聽音辨詞', desc: '只聽真人發音，選出你聽到的單字，練多益聽力的字音反射。', img: 'listen' },
    { k: 'spell', part: 'Spelling', zh: '拼字挑戰', desc: '看中文與例句提示，把單字完整拼出來。', img: 'typing' },
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
        <span class="eyebrow">練習 · 每輪 10 題 · 只有第一次作答計入正確率</span>
        <h1>考前十題，暖機一下。</h1>
        <p class="sub">題目從你選的範圍隨機抽出，干擾選項取自同一分數段、同詞性的單字，難度貼近正式考試。</p>
      </header>
      <section class="section" style="padding-top:0">
        <div style="display:grid;gap:12px">
          <span class="eyebrow">出題範圍</span>
          <div class="chips">
            ${[['all', '全部 1,000 詞'], ...LEVELS.map((l) => [String(l.lv), `${l.lv} ${l.name}`]), ['learning', '我學過的'], ['star', '我的收藏']].map(([v, t]) => `<button class="chip" data-scope="${v}" aria-pressed="${pracState.scope === v}">${t}</button>`).join('')}
          </div>
          <p style="font-size:13px;color:var(--ink-3)">目前範圍共 <b class="num">${pool.length}</b> 個單字${pool.length < 4 ? '，至少需要 4 個字才能出題。' : '。'}</p>
        </div>
      </section>
      <section class="section">
        <div class="modes">
          ${MODES.map((m) => `<button class="mode" data-mode="${m.k}" ${pool.length < 4 ? 'disabled' : ''}><img src="assets/brand/${m.img}.webp" alt="" width="480" height="480" loading="lazy"><span class="mode-txt"><span class="m-part">${m.part}</span><h3>${m.zh}</h3><p>${m.desc}</p></span></button>`).join('')}
        </div>
      </section>
    </div>`;
    view.querySelectorAll('[data-scope]').forEach((b) => b.addEventListener('click', () => { pracState.scope = b.dataset.scope; viewPractice(); }));
    view.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => startQuiz(b.dataset.mode)));
  }

  // English inflection for distractors, mirroring the answer's form.
  const isCVC = (w) => /^[^aeiou]*[aeiou][bdgklmnprt]$/.test(w);
  function inflS(w) { if (/(s|x|z|ch|sh)$/.test(w)) return w + 'es'; if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies'; return w + 's'; }
  function inflEd(w) { if (/e$/.test(w)) return w + 'd'; if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied'; if (isCVC(w)) return w + w.slice(-1) + 'ed'; return w + 'ed'; }
  function inflIng(w) { if (/ie$/.test(w)) return w.slice(0, -2) + 'ying'; if (/[^e]e$/.test(w)) return w.slice(0, -1) + 'ing'; if (isCVC(w)) return w + w.slice(-1) + 'ing'; return w + 'ing'; }
  function formKind(w) {
    const f = w.f.toLowerCase();
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
  function distractors(w, n, pool) {
    const pos = posOf(w);
    const zh = w.s[0][1];
    const ok = (x) => x.id !== w.id && x.s[0][1] !== zh && fold(x.w) !== fold(w.w);
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
    const picks = shuffle(mode === 'listen' && voiced.length >= 10 ? voiced : pool).slice(0, 10);
    pracState.mode = mode;
    pracState.qs = picks.map((w) => {
      const q = { id: w.id };
      if (mode === 'spell') return q;
      const ds = distractors(w, 3, pool);
      if (mode === 'cloze') {
        const kind = formKind(w);
        const cap = w.a === 0;
        q.opts = shuffle([{ id: w.id, t: w.f }, ...ds.map((d) => ({ id: d.id, t: applyForm(d.w, kind, cap) }))]);
      } else {
        q.opts = shuffle([w, ...ds].map((x) => ({ id: x.id })));
      }
      return q;
    });
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
    sfx(ok ? 'ok' : 'no');
  }
  function paintQuiz() {
    const P = pracState;
    const mode = MODES.find((m) => m.k === P.mode);
    if (P.i >= P.qs.length) return paintResult();
    const q = P.qs[P.i];
    const w = BY_ID.get(q.id);
    const pct = (P.i / P.qs.length) * 100;
    let body = '';
    if (P.mode === 'cloze') {
      const before = w.en.slice(0, w.a);
      const after = w.en.slice(w.a + w.f.length);
      body = `<p class="q-sent">${esc(before)}<span class="blank" id="blank">${P.answered ? esc(w.f) : '&nbsp;'}</span>${esc(after)}</p>
        ${P.answered ? `<p class="q-sub" style="text-align:left">${esc(w.zh)}</p>` : ''}`;
    } else if (P.mode === 'zh2en') {
      body = `<div class="q-hero">${art(w, { tag: true })}<div style="display:grid;gap:8px"><p class="q-prompt zh">${esc(zhMain(w))}</p><p class="q-sub">${w.s.map((s) => `${POS_ZH[s[0]] || s[0]}`).join('／')}</p></div></div>`;
    } else if (P.mode === 'en2zh') {
      body = `<div style="display:grid;gap:10px"><p class="q-prompt">${esc(w.w)}</p><p class="q-sub">${kkHtml(w)} <button class="mini-spk" data-word="${w.id}" aria-label="播放發音">${I.speaker}</button></p></div>`;
    } else if (P.mode === 'listen') {
      body = `<div class="listen-stage"><img src="assets/brand/listen.webp" alt="" width="480" height="480"><button class="big-listen" data-word="${w.id}" aria-label="再聽一次">${I.listen}</button><p class="q-sub">點擊播放，可重複聆聽。${P.answered ? '' : ` <button class="btn ghost small" data-word="${w.id}" data-slow="1">慢速</button>`}</p></div>`;
    } else if (P.mode === 'spell') {
      const hint = w.f[0] + w.f.slice(1).replace(/[A-Za-zÀ-ÿ]/g, '_');
      body = `<div class="q-hero">${art(w, { tag: true })}<p class="q-prompt zh">${esc(zhMain(w))}</p></div>
        <p class="q-sent" style="font-size:19px">${esc(w.en.slice(0, w.a))}<span class="blank">${P.answered ? esc(w.f) : esc(hint)}</span>${esc(w.en.slice(w.a + w.f.length))}</p>
        <form class="spell" id="spell-form" autocomplete="off"><label class="sr-only" for="spell-in">輸入單字</label><input id="spell-in" type="text" autocapitalize="off" spellcheck="false" placeholder="輸入空格裡的單字" ${P.answered ? 'disabled' : ''}><button class="btn" type="submit" ${P.answered ? 'disabled' : ''}>確認</button></form>`;
    }
    const opts = q.opts ? `<div class="opts">${q.opts.map((o, i) => {
      const ow = BY_ID.get(o.id);
      const label = P.mode === 'cloze' ? `<span class="t en">${esc(o.t)}</span>` : P.mode === 'en2zh' ? `<span class="t">${esc(zhMain(ow))}</span>` : `<span class="t en">${esc(ow.w)}</span>`;
      let cls = '';
      if (P.answered) { if (o.id === w.id) cls = 'ok'; else if (o.id === q.picked) cls = 'no'; }
      return `<button class="opt ${cls}" data-o="${o.id}" ${P.answered ? 'disabled' : ''}><span class="k">${'ABCD'[i]}</span>${label}</button>`;
    }).join('')}</div>` : '';
    const ok = q.ok;
    const fb = P.answered ? `<div class="feedback">
        <button data-open="${w.id}" aria-label="打開 ${esc(w.w)} 詞卡">${art(w)}</button>
        <div style="display:grid;gap:4px;min-width:0">
          <span class="fb-title ${ok ? 'ok' : 'no'}">${ok ? '答對了' : `正確答案：${esc(P.mode === 'cloze' || P.mode === 'spell' ? w.f : w.w)}`}</span>
          <span><button data-open="${w.id}" style="font:600 19px var(--serif);text-decoration:underline;text-underline-offset:3px">${esc(w.w)}</button> ${kkHtml(w)} · ${esc(zhMain(w))}</span>
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
        const good = v === fold(w.f) || v === fold(w.w);
        q.ok = good;
        P.answered = true;
        recordAnswer(w.id, good);
        if (good) playWord(w);
        paintQuiz();
      });
      if (!P.answered) $('#spell-in').focus({ preventScroll: true });
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
    if (P.mode === 'cloze') speak(w.en); else if (P.mode === 'zh2en' || P.mode === 'listen') playWord(w);
    paintQuiz();
  }
  function nextQ() { pracState.i++; pracState.answered = false; paintQuiz(); }
  function paintResult() {
    const P = pracState;
    const right = P.results.filter((r) => r.ok).length;
    const wrong = P.results.filter((r) => !r.ok).map((r) => BY_ID.get(r.id));
    sfx('done');
    const score = Math.round((right / P.results.length) * 100);
    const mode = MODES.find((m) => m.k === P.mode);
    const msg = score === 100 ? '全對，這組單字已經穩定。' : score >= 80 ? '表現穩定，把錯的幾個再看一次。' : score >= 50 ? '一半以上答對，錯的字加入收藏，明天再練。' : '先回到圖鑑把這些字看熟，再回來挑戰。';
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
     MAP (thousand-star chart)
     ====================================================== */
  const mapState = { lv: 0, stars: [], hover: null, raf: 0 };
  function viewMap() {
    const all = counts();
    view.innerHTML = `<div class="wrap">
      <header class="page-head">
        <span class="eyebrow">星圖 · 15 個場景星座</span>
        <h1>每學會一個字，就點亮一顆星。</h1>
        <p class="sub">1,000 顆星依職場場景聚成星座。灰色是還沒學的字，帶顏色的是學習中，發光的是已熟。點一顆星就能打開詞卡。</p>
      </header>
      <div class="chips" style="margin-bottom:16px" role="group" aria-label="分數航段">
        <button class="chip" data-mlv="0" aria-pressed="${mapState.lv === 0}">全部航段</button>
        ${LEVELS.map((l) => `<button class="chip lv-${l.lv}" data-mlv="${l.lv}" aria-pressed="${mapState.lv === l.lv}"><span class="dot"></span>${l.lv} ${l.name}</button>`).join('')}
      </div>
      <div class="map-wrap" id="map-wrap">
        <canvas id="map" role="img" aria-label="千詞星圖：已學 ${all.learning + all.mastered} 個，已熟 ${all.mastered} 個"></canvas>
        <div class="map-legend"><span><i style="background:rgba(214,220,240,.5)"></i>未學</span><span><i style="background:rgb(240,196,100);box-shadow:0 0 6px rgb(240,196,100)"></i>學習中（依分數段著色）</span><span><i style="background:#fff8e8;box-shadow:0 0 8px #ffe0a0"></i>已熟</span></div>
      </div>
      <section class="section">
        <div class="map-stats">
          ${LEVELS.map((l) => { const c = counts(WORDS.filter((w) => w.lv === l.lv)); return `<div class="map-stat lv-${l.lv}"><b class="num">${c.learning + c.mastered}<small style="font-size:14px;color:var(--ink-3)"> / ${c.total}</small></b><span>${l.lv} ${l.name} · 已熟 ${c.mastered}</span></div>`; }).join('')}
        </div>
      </section>
    </div>`;
    view.querySelectorAll('[data-mlv]').forEach((b) => b.addEventListener('click', () => {
      mapState.lv = +b.dataset.mlv;
      view.querySelectorAll('[data-mlv]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      drawMap();
    }));
    const cv = $('#map');
    const wrap = $('#map-wrap');
    const tip = document.createElement('div');
    tip.className = 'map-tip';
    tip.hidden = true;
    wrap.appendChild(tip);
    const find = (e) => {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      let best = null;
      let bd = 14 * 14;
      for (const s of mapState.stars) { const d = (s.x - x) ** 2 + (s.y - y) ** 2; if (d < bd) { bd = d; best = s; } }
      return { best, x, y };
    };
    cv.addEventListener('mousemove', (e) => {
      const { best, x, y } = find(e);
      mapState.hover = best;
      if (best) {
        const w = BY_ID.get(best.id);
        tip.innerHTML = `${art(w)}<span><b>${esc(w.w)}</b>${esc(w.s[0][1])} · ${w.lv}</span>`;
        tip.hidden = false;
        const r = cv.getBoundingClientRect();
        tip.style.left = `${Math.max(8, Math.min(x + 16, r.width - tip.offsetWidth - 8))}px`;
        tip.style.top = `${Math.max(8, Math.min(y - 70, r.height - tip.offsetHeight - 8))}px`;
        cv.style.cursor = 'pointer';
      } else { tip.hidden = true; cv.style.cursor = 'crosshair'; }
    });
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
        <span class="eyebrow">我的 · 學習紀錄</span>
        <h1>你的飛行里程。</h1>
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
          <p>本站的四段航程對應講義的「衝 400／600／800／990 分」單元，各 250 字。</p>
        </article>
        <article class="card panel">
          <h2>關於職光</h2>
          <ul>
            <li>1,000 個單字、中文釋義與例句出自「衝 400／600／800／990 分必備單字」講義，依原順序收錄；修正了講義中 aprove、nconvenience、ompulsory 三處拼字。</li>
            <li>KK 音標依 CMU Pronouncing Dictionary 自動轉寫並人工校對常見多音字；15 個職場場景與 ${WORDS.filter((w) => w.tip).length} 則「多益考點」由本站編輯整理。</li>
            <li>單字插畫、場景插畫與美英發音錄音取自 Word Atlas（Word Atlas contributors，<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>），本站已縮放並合併成圖集與音訊檔。${fmt(WORDS.filter((w) => w.ar === 'w').length)} 個字使用原字插畫、${WORDS.filter((w) => w.ar === 'r').length} 個字使用同字根插畫，其餘以所屬職場場景的插畫代替；有真人錄音的字共 ${fmt(WORDS.filter((w) => w.u).length)} 個，其餘使用裝置內建語音。</li>
            <li>複習排程採 SM-2 式間隔重複：答「記得」的字間隔會逐次拉長，連續記得到 21 天以上視為「已熟」。</li>
            <li>介面與學習流程致敬開源雅思單字專案 <a href="https://github.com/designfuchen/word-atlas" target="_blank" rel="noopener">詞光 Word Atlas</a>（MIT 授權），本站為獨立實作的多益版本。</li>
          </ul>
        </article>
      </section>
    </div>`;
    view.querySelectorAll('[data-goal]').forEach((b) => b.addEventListener('click', () => { S.set.goal = +b.dataset.goal; save(); plan(); viewMe(); toast(`每日新詞改為 ${S.set.goal} 個`); }));
    view.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => { S.set.start = +b.dataset.start; const d = today(); d.plan = (d.plan || []).filter((id) => S.cards[id]); save(); plan(); viewMe(); toast(`新詞改從 ${S.set.start} 分段開始`); }));
    view.querySelectorAll('[data-accent-set]').forEach((b) => b.addEventListener('click', () => { S.set.accent = b.dataset.accentSet; save(); viewMe(); playWord(BY_ID.get(1)); }));
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
          a.download = `toeic-atlas-${ymd()}.json`;
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
      } catch (e) { toast('這不是職光的備份資料，請確認貼上的是完整的 JSON。'); }
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
        <p class="sub">職光把 1,000 個多益單字分成四段航程。選一個你現在的程度，新詞會從那一段開始。</p>
        <div class="pick">${LEVELS.map((l) => `<button class="lv-${l.lv}" data-s="${l.lv}" aria-pressed="${start === l.lv}"><b>${l.lv}</b><strong style="font-size:15px">${l.name} · ${l.en}</strong><span>${l.desc}</span></button>`).join('')}</div>
        <div style="display:grid;gap:10px"><span class="eyebrow">每天想學幾個新詞</span><div class="chips">${[5, 10, 15, 20, 30].map((n) => `<button class="chip" data-g="${n}" aria-pressed="${goal === n}">${n} 個${n === 10 ? '（建議）' : ''}</button>`).join('')}</div></div>
        <div class="dialog-foot"><button class="btn" data-go>出發 ${I.arrow}</button></div>
        </div>
      </div>`;
      ov.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => { start = +b.dataset.s; paint(); }));
      ov.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => { goal = +b.dataset.g; paint(); }));
      ov.querySelector('[data-go]').addEventListener('click', () => {
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

  /* ---------- global keys ---------- */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
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

  const VIEWS = { today: viewToday, atlas: viewAtlas, learn: viewLearn, practice: viewPractice, map: viewMap, me: viewMe };

  applyTheme();
  render();
  if (!S.onboarded) onboarding();
})();
