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
    { lv: 400, name: 'Take-off', en: 'Take-off', desc: 'Basic words from daily life and the office: the base for notices and announcements.' },
    { lv: 600, name: 'Climb', en: 'Climb', desc: 'Core words for work processes and business deals; common in Parts 5 and 6.' },
    { lv: 800, name: 'Cruise', en: 'Cruise', desc: 'Contracts, finance and management: the key to long Part 7 texts.' },
    { lv: 990, name: 'Arrival', en: 'Arrival', desc: 'Advanced business and legal words that win the top scores.' },
  ];
  const LV = Object.fromEntries(LEVELS.map((l) => [l.lv, l]));

  const TOPICS = [
    { k: 'off', zh: 'Office', en: 'Office' },
    { k: 'hr', zh: 'Careers', en: 'Careers' },
    { k: 'fin', zh: 'Finance', en: 'Finance' },
    { k: 'mkt', zh: 'Marketing', en: 'Marketing' },
    { k: 'biz', zh: 'Business', en: 'Business' },
    { k: 'law', zh: 'Legal', en: 'Legal' },
    { k: 'ops', zh: 'Operations', en: 'Operations' },
    { k: 'tech', zh: 'Tech', en: 'Tech' },
    { k: 'evt', zh: 'Events', en: 'Events' },
    { k: 'trv', zh: 'Travel', en: 'Travel' },
    { k: 'hos', zh: 'Hospitality', en: 'Hospitality' },
    { k: 'shop', zh: 'Shopping', en: 'Shopping' },
    { k: 'home', zh: 'Property', en: 'Property' },
    { k: 'med', zh: 'Health', en: 'Health' },
    { k: 'core', zh: 'Core', en: 'Core' },
  ];
  const TP = Object.fromEntries(TOPICS.map((t) => [t.k, t]));
  const STATUS_ZH = { new: 'New', learning: 'Learning', mastered: 'Mastered' };
  const POS_EN = { 'n.': 'noun', 'v.': 'verb', 'adj.': 'adjective', 'adv.': 'adverb', 'prep.': 'preposition' };
  const POS_ZH = { 'n.': 'noun', 'v.': 'verb', 'adj.': 'adjective', 'adv.': 'adverb', 'prep.': 'preposition' };

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
    quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5v-7Z"/><path d="M8.5 9h7M8.5 12h4.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 7l10 10M17 7 7 17"/></svg>',
    work: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5.5v13l9-6.5-9-6.5ZM16 5h2.5v14H16z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 5.5v13l-9-6.5 9-6.5ZM5.5 5H8v14H5.5z"/></svg>',
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
    // words whose picture did not fit their meaning show a lettered tile (small) or their example sentence (large)
    if (typeof w === 'object' && w.ar === 'x') {
      if (opt.full) return `<div class="art is-text lv-${w.lv} ${opt.cls || ''}"><span class="eyebrow">In a sentence</span><p>${markSentence(dailyEx(w))}</p></div>`;
      return `<div class="art is-mono lv-${w.lv} ${opt.cls || ''}" aria-hidden="true">${I.quote}</div>`;
    }
    const tag = '';
    return `<div class="art ${opt.cls || ''}" style="${spriteCss(idx, 'thumb')}" role="img" aria-label="${typeof w === 'object' ? esc(w.w) + ' picture' : 'scene picture'}">${opt.full ? `<div class="art-full" data-full="${idx}"></div>` : ''}${tag}</div>`;
  }
  const sheetCache = new Map();
  function fullSheet(idx) {
    const url = `assets/img/full-${Math.floor(idx / (SP.full.cols * SP.full.cols))}.webp`;
    let p = sheetCache.get(url);
    if (!p) {
      p = new Promise((res, rej) => { const im = new Image(); im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(res); im.onerror = rej; im.src = url; });
      p.then(() => { p.done = true; }, () => {});
      sheetCache.set(url, p);
    }
    return p;
  }
  // warm the full-size plates of the words a session is about to show
  const preloadFull = (ids) => ids.forEach((id) => { const w = BY_ID.get(id); if (w) fullSheet(w.i); });
  function loadFull(root = document) {
    root.querySelectorAll('[data-full]:not(.is-in)').forEach((el) => {
      const idx = +el.dataset.full;
      const p = fullSheet(idx);
      el.setAttribute('style', spriteCss(idx, 'full'));
      if (p.done) el.classList.add('is-in'); // already decoded once: show it sharp at once, no fade
      else p.then(() => el.classList.add('is-in'), () => {});
    });
  }

  /* ---------- helpers ---------- */
  // after an in-place repaint (answering, flipping) the card must not replay its entrance animation
  const settle = () => document.querySelectorAll('#view .q-card, #view .flash').forEach((el) => el.classList.add('no-enter'));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const fmt = (n) => n.toLocaleString('en-US');
  const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const zhMain = (w) => w.s.map((s) => s[1]).join('；');
  const zhShort = (w) => `${w.s[0][0]} ${w.s[0][1]}`;
  const kkHtml = (w) => `[${esc(w.kk)}]`;
  const posOf = (w) => w.s[0][0];
  const pl = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  // learning extras: [simpler English hint, roots, memory hook, word family, key collocation, collocation meaning]
  const EX = window.TOEIC_EXTRA || { w: {}, pairs: [], part2: [], docs: [], iv: { intro: [], qa: [] } };
  const xw = (w) => EX.w[w.id] || ['', '', '', '', '', ''];
  const hasArt = (w) => w.ar !== 'x';
  const shortDef = (w, n = 46) => (w.d.length > n ? w.d.slice(0, n).replace(/\s+\S*$/, '') + '…' : w.d);

  /* ---------- storage ---------- */
  const KEY = 'toeic-atlas-v1'; // kept from the first release so saved progress survives the rename
  const DEFAULT_SET = { goal: 10, start: 400, accent: 'us', rate: 0.9, sfx: true, theme: 'system', amb: 'night', ambVol: 0.45, splash: true, passN: 3, reward: '', cap: 30, lite: false, mix: 'mix' };
  // v2 fields are only ever added; saved progress, stars and notes from earlier versions load unchanged
  function fresh() {
    return { v: 1, cards: {}, days: {}, stars: [], story: { read: {}, best: {} }, sprint: {}, notes: [], exi: {}, set: { ...DEFAULT_SET }, onboarded: false,
      wrong: {}, stubOk: {}, tamed: 0, mine: {}, ret: { 7: [0, 0], 30: [0, 0] }, fix: [], freeze: 1, earned: [], queue: [], place: null, ivf: {}, docs: {} };
  }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && raw.v === 1) return { ...fresh(), ...raw, story: { read: {}, best: {}, ...(raw.story || {}) }, ret: { 7: [0, 0], 30: [0, 0], ...(raw.ret || {}) }, set: { ...DEFAULT_SET, ...(raw.set || {}) } };
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
    if (d < 50 * MIN) return `${Math.max(1, Math.round(d / MIN))} min`;
    if (d < DAY) return `${Math.round(d / 36e5)} h`;
    const days = Math.round(d / DAY);
    if (days < 31) return `${days} d`;
    return `${(days / 30).toFixed(1).replace(/\.0$/, '')} mo`;
  }
  // "in 10 minutes", "in 1 day", "in 3 days", "in 2 months"
  function ivlLong(c, now = Date.now()) {
    const d = c.due - now;
    if (d < 50 * MIN) { const m = Math.max(1, Math.round(d / MIN)); return `in ${m} minute${m === 1 ? '' : 's'}`; }
    if (d < DAY) { const h = Math.round(d / 36e5); return `in ${h} hour${h === 1 ? '' : 's'}`; }
    const days = Math.round(d / DAY);
    if (days < 31) return days === 1 ? 'tomorrow' : `in ${days} days`;
    const mo = +(days / 30).toFixed(1);
    return `in ${mo} month${mo === 1 ? '' : 's'}`;
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
    const goal = S.set.goal + (d.bonus || 0);
    if (!d.plan) d.plan = [];
    const keep = d.plan.filter((id) => S.cards[id] && (S.cards[id].first || '') === ymd());
    if (keep.length >= goal) { d.plan = keep; return d.plan; }
    const pending = d.plan.filter((id) => !S.cards[id]);
    const seen = new Set([...keep, ...pending]);
    const out = [...keep, ...pending].slice(0, goal);
    S.queue = S.queue.filter((id) => !S.cards[id]);
    for (const w of [...S.queue.map((id) => BY_ID.get(id)), ...newOrder()]) {
      if (out.length >= goal) break;
      if (!S.cards[w.id] && !seen.has(w.id)) { out.push(w.id); seen.add(w.id); }
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
  // real retention: how often a word is still remembered about 7 and about 30 days after it was last seen
  function logRetention(c0, ok, now = Date.now()) {
    if (!c0 || c0.st !== 'review' || !c0.last) return;
    const gap = (now - c0.last) / DAY;
    const b = gap >= 5 && gap <= 12 ? 7 : gap >= 21 && gap <= 45 ? 30 : 0;
    if (!b) return;
    S.ret[b][1]++;
    if (ok) S.ret[b][0]++;
  }
  // the day's review list is capped: the most important cards first, the rest wait for another day
  function reviewPlan(now = Date.now()) {
    const due = dueIds(now);
    const score = (id) => {
      const c = S.cards[id];
      const over = (now - c.due) / (Math.max(1, c.ivl || 0) * DAY + DAY);
      return (isStubborn(id) ? 100 : 0) + (c.st === 'learning' ? 50 : 0) + Math.min(30, over * 10) + (3 - (c.ease || 2.5)) * 5;
    };
    const ranked = due.slice().sort((a, b) => score(b) - score(a));
    return { list: ranked.slice(0, S.set.cap), later: Math.max(0, ranked.length - S.set.cap), all: ranked.length };
  }
  /* stubborn words: three or more misses; they get their own drill until answered right three times in a row */
  const isStubborn = (id) => (S.wrong[id] || 0) >= 3;
  const stubborn = () => Object.keys(S.wrong).filter((id) => S.wrong[id] >= 3).map(Number).filter((id) => BY_ID.has(id));
  function miss(id) {
    S.missDay = S.missDay || {};
    S.stubOk[id] = 0;
    if (S.missDay[id] === ymd()) return;
    S.missDay[id] = ymd();
    S.wrong[id] = (S.wrong[id] || 0) + 1;
  }
  function drillHit(id) {
    if (!isStubborn(id)) return false;
    S.stubOk[id] = (S.stubOk[id] || 0) + 1;
    if (S.stubOk[id] < 3) return false;
    delete S.wrong[id]; delete S.stubOk[id]; S.tamed++;
    return true;
  }
  function grade(id, g) {
    const isNew = !S.cards[id];
    logRetention(S.cards[id], g >= 3);
    const c = nextState(S.cards[id], g);
    if (isNew) c.first = ymd();
    S.cards[id] = c;
    const d = today();
    if (isNew) d.n++;
    else { d.r++; d.rv = d.rv || []; if (!d.rv.includes(id)) d.rv.push(id); }
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
    const act = (k) => { const r = S.days[k]; return (r && r.n + r.r + r.q > 0) || S.fix.includes(k); };
    if (!act(ymd(d))) d.setDate(d.getDate() - 1);
    while (act(ymd(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  const activeOn = (k) => { const r = S.days[k]; return !!(r && r.n + r.r + r.q > 0); };
  const dayKey = (off) => { const d = new Date(); d.setDate(d.getDate() + off); return ymd(d); };
  // a repair card can fill exactly one missed day (yesterday) when the day before it was active
  function repairable() {
    const y = dayKey(-1);
    return S.freeze > 0 && !activeOn(y) && !S.fix.includes(y) && (activeOn(dayKey(-2)) || S.fix.includes(dayKey(-2)));
  }
  function useRepair() { if (!repairable()) return false; S.fix.push(dayKey(-1)); S.freeze--; save(); return true; }
  // every 7 days in a row earns one card (hold at most 2)
  function earnRepair() {
    const st = streak();
    if (st > 0 && st % 7 === 0 && !S.earned.includes(ymd()) && activeOn(ymd())) { S.earned.push(ymd()); if (S.freeze < 2) { S.freeze++; save(); return true; } save(); }
    return false;
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
    { k: 'night', zh: 'Night flight music', note: 'Warm electric piano and soft pads', len: 96 },
    { k: 'cabin', zh: 'Cabin hum', note: 'A calm engine sound, like a long flight', len: 64 },
    { k: 'sea', zh: 'Harbor waves', note: 'Waves on the sea wall', len: 66 },
    { k: 'rain', zh: 'Rain on the window', note: 'Soft rain, good for focus', len: 60 },
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
    if (S.set.amb !== 'off' && !S.set.lite) setAmbience(S.set.amb);
  }
  window.addEventListener('pointerdown', armAudio, { once: true });
  window.addEventListener('keydown', armAudio, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (!SND.ctx || !SND.armed) return;
    if (document.hidden) SND.ctx.suspend().catch(() => {}); else SND.ctx.resume().catch(() => {});
  });

  const LANG = { us: 'en-US', uk: 'en-GB', au: 'en-AU' };
  const ACC = { us: 'US accent', uk: 'UK accent', au: 'Australian accent' };
  // listening questions rotate US, UK and Australian voices unless the learner picks one
  const listenAccent = (i) => (S.set.mix === 'mix' ? ['us', 'uk', 'au'][((i % 3) + 3) % 3] : S.set.mix);
  function speak(text, accent = S.set.accent, rate = S.set.rate, onend) {
    if (!('speechSynthesis' in window)) { toast('This browser cannot read text aloud. Please use Chrome, Edge or Safari.'); if (onend) setTimeout(onend, 400); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANG[accent] || 'en-US';
      const v = pickVoice(u.lang);
      if (v) u.voice = v;
      u.rate = rate;
      duck(true, 15000);
      u.onend = u.onerror = () => { duck(false); if (onend) onend(); };
      speechSynthesis.speak(u);
    } catch (e) { toast('Read-aloud is not working right now.'); if (onend) setTimeout(onend, 400); }
  }
  /* Recorded pronunciations: one audio sprite per accent, seek to [start, duration]. */
  const tracks = {};
  let clip = null;
  function playWord(w, accent = S.set.accent, rate = S.set.rate) {
    const seg = accent === 'au' ? null : w[accent === 'uk' ? 'k' : 'u'];
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
    if (S.set.lite || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
  // power-saving mode: no splash, paper grain, ambience, confetti or animated transitions
  function applyLite() {
    document.documentElement.classList.toggle('lite', !!S.set.lite);
    if (S.set.lite && SND.amb) setAmbience(null);
  }
  function applyTheme() {
    applyLite();
    document.documentElement.lang = 'en';
    const t = S.set.theme;
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }
  function isDark() {
    const t = S.set.theme;
    return t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /* ---------- shell ---------- */
  // a beginner's home holds only today's tasks; the star map, the four legs and the 15 scenes live under 我的
  const NAV = [
    ['today', 'Today', I.today],
    ['practice', 'Practice', I.practice],
    ['work', 'Work', I.work],
    ['atlas', 'Words', I.atlas],
    ['me', 'Me', I.me],
  ];
  const NAV_PARENT = { learn: 'today', recap: 'today', place: 'today', commute: 'today', sprint: 'practice', story: 'practice', drill: 'practice', docs: 'work', interview: 'work', jd: 'work', map: 'me' };
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="top"><div class="wrap">
      <a class="brand" href="#today" aria-label="TOEIC Voyage home">${LOGO}<span class="brand-zh">多益詞旅</span><span class="brand-en">TOEIC Voyage</span></a>
      <nav class="nav" aria-label="Main pages">${NAV.map(([k, t]) => `<a href="#${k}" data-nav="${k}">${t}</a>`).join('')}</nav>
      <div class="top-tools">
        <button class="search-btn" id="open-search" aria-label="Search words" title="Search words (⌘K or /)">${I.search}<span>Search words</span><kbd>⌘K</kbd></button>
        <div class="amb">
          <button class="icon-btn amb-btn" id="amb-btn" aria-expanded="false" aria-controls="amb-pop" aria-label="Background sound" title="Background sound">${I.wave}<span class="amb-bars" aria-hidden="true"><i></i><i></i><i></i></span></button>
          <div class="amb-pop" id="amb-pop" role="dialog" aria-label="Background sound" hidden></div>
        </div>
        <button class="icon-btn" id="toggle-sfx" aria-label="Sound effects" title="Sound effects"></button>
        <button class="icon-btn" id="toggle-theme" aria-label="Light or dark" title="Light or dark"></button>
      </div>
    </div></header>
    <main id="view" tabindex="-1"></main>
    <footer class="foot"><div class="wrap">
      <span>TOEIC Voyage · 1,000 workplace words · think in English · your progress stays in this browser</span>
      <span>Inspired by the open-source project <a href="https://github.com/designfuchen/word-atlas" target="_blank" rel="noopener">Word Atlas</a></span>
    </div></footer>
    <nav class="tabbar" aria-label="Main pages">${NAV.map(([k, t, ic]) => `<a href="#${k}" data-nav="${k}">${ic}<span>${t}</span></a>`).join('')}</nav>`;
  const view = $('#view');
  // tapping the tab of the page you are on brings that page back to its start (e.g. from a results screen)
  $$('[data-nav]').forEach((a) => a.addEventListener('click', (e) => { if (location.hash === `#${a.dataset.nav}`) { e.preventDefault(); render(); } }));

  function paintAmb() {
    const btn = $('#amb-btn');
    if (!btn) return;
    const playing = !!SND.amb;
    btn.classList.toggle('is-on', playing);
    btn.title = playing ? `Background: ${AMBS.find((x) => x.k === SND.amb.id).zh}` : 'Background sound';
    const pop = $('#amb-pop');
    if (pop.hidden) return;
    pop.innerHTML = `
      <p class="eyebrow">Background sound · helps you focus</p>
      <ul>
        ${AMBS.map((a) => `<li><button data-amb="${a.k}" aria-pressed="${S.set.amb === a.k}"><b>${a.zh}</b><span>${a.note}</span></button></li>`).join('')}
        <li><button data-amb="off" aria-pressed="${S.set.amb === 'off'}"><b>Off</b><span>Only word audio and sound effects</span></button></li>
      </ul>
      <label class="amb-vol" for="amb-vol">Volume<input id="amb-vol" type="range" min="0" max="1" step="0.05" value="${S.set.ambVol}"></label>
      <p class="amb-note">It gets quieter when a word or sentence is read.</p>`;
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
    s.title = S.set.sfx ? 'Sound effects: on' : 'Sound effects: off';
    const t = $('#toggle-theme');
    t.innerHTML = isDark() ? I.sun : I.moon;
    t.title = isDark() ? 'Light mode' : 'Dark mode';
  }
  $('#toggle-sfx').addEventListener('click', () => { S.set.sfx = !S.set.sfx; save(); paintTools(); sfx('flip'); toast(S.set.sfx ? 'Sound effects on' : 'Sound effects off'); });
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
  const reducedMotion = () => !!S.set.lite || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function vt(kind, update, after) {
    if (reducedMotion()) { update(); if (after) after(); return; }
    if (document.startViewTransition) {
      document.documentElement.dataset.vt = kind;
      // the slide is the card's entrance; without settle() its CSS entrance would replay once the transition ends
      const t = document.startViewTransition(kind === 'card' ? () => { update(); settle(); } : update);
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
  const NAV_ORDER = ['today', 'place', 'learn', 'recap', 'commute', 'practice', 'drill', 'sprint', 'story', 'work', 'docs', 'interview', 'jd', 'atlas', 'me', 'map'];

  /* ---------- router ---------- */
  const route = { name: 'today', sub: 0, hash: 'today' };
  let cleanup = null;
  // entrance animations play when a page is opened, not each time it repaints
  let enterT = 0;
  function enterView() {
    view.classList.add('is-enter');
    clearTimeout(enterT);
    enterT = setTimeout(() => view.classList.remove('is-enter'), 1200);
  }
  const topBar = $('.top');
  const onScrollTop = () => topBar.classList.toggle('is-scrolled', window.scrollY > 6);
  window.addEventListener('scroll', onScrollTop, { passive: true });
  function go(name) { if (location.hash !== `#${name}`) location.hash = name; else render(); }
  function render() {
    const raw = (location.hash || '#today').slice(1);
    let name = raw;
    let wordId = null;
    const m = raw.match(/^word-(\d+)$/);
    let sub = 0;
    if (m) { wordId = +m[1]; name = route.name && route.name !== 'word' ? route.name : 'atlas'; sub = route.sub; }
    const sm = raw.match(/^(story|sprint|docs)-(\d+)$/);
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
    $$('[data-nav]').forEach((a) => a.setAttribute('aria-current', a.dataset.nav === name || NAV_PARENT[name] === a.dataset.nav ? 'page' : 'false'));
    if (changed || !wordId) {
      const from = NAV_ORDER.indexOf(prevRoute) * 100 + (prevRoute === name ? prevSub : 0); const to = NAV_ORDER.indexOf(name) * 100 + sub;
      const doIt = () => { VIEWS[name](); if (!wordId) window.scrollTo(0, 0); if (changed) enterView(); };
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
      <button class="pron" data-word="${w.id}" data-accent="us" aria-label="US pronunciation"><span class="spk">${I.speaker}</span><small>US</small><b>${kkHtml(w)}</b></button>
      <button class="pron" data-word="${w.id}" data-accent="uk" aria-label="UK pronunciation"><span class="spk">${I.speaker}</span><small>UK</small></button>
      <button class="pron" data-word="${w.id}" data-accent="au" aria-label="Australian pronunciation"><span class="spk">${I.speaker}</span><small>AU</small></button>
    </div>`;
  const BY_WORD = new Map(WORDS.map((w) => [fold(w.w), w]));
  const wordLink = (t) => { const hit = BY_WORD.get(fold(t)); return hit ? `<button class="nym-chip is-link" data-open="${hit.id}">${esc(t)}</button>` : `<span class="nym-chip">${esc(t)}</span>`; };
  // near-synonyms with a swap verdict and the difference in simple English
  const SWAP = { Y: ['is-y', 'Usually swaps'], S: ['is-s', 'Sometimes'], N: ['is-n', 'Different meaning'] };
  // how often people use a word in everyday English (Zipf frequency → 1–5 dots)
  const FREQ = [[5.3, 5, 'very common'], [4.6, 4, 'common'], [3.9, 3, 'less common'], [3.2, 2, 'rare'], [-1, 1, 'very rare']];
  const freqOf = (z) => FREQ.find((f) => z >= f[0]);
  const freqHtml = (z) => { const f = freqOf(z); return `<span class="freq f${f[1]}" title="How often people use it">${'<i></i>'.repeat(f[1])}${'<i class="off"></i>'.repeat(5 - f[1])}<b>${f[2]}</b></span>`; };
  function synHtml(w) {
    const list = (EX.syn && EX.syn[w.id]) || w.syn.map((t) => [t, '', '', null]);
    if (!list.length) return '';
    const self = EX.wz ? EX.wz[w.id] : null;
    const top = list.filter((x) => x[1] !== 'N' && x[3] != null).reduce((a, x) => (x[3] > a ? x[3] : a), self == null ? -9 : self);
    return `<div class="syn-box">
      <div class="block-label">Similar words · can you swap them?</div>
      ${self != null ? `<div class="syn-row is-self"><span class="syn-w"><b>${esc(w.w)}</b></span>${freqHtml(self)}${self >= top ? '<span class="most">Most used</span>' : ''}</div>` : ''}
      ${list.map(([t, c, note, z]) => `<div class="syn-row">
        <span class="syn-w">${wordLink(t)}</span>
        ${z != null ? freqHtml(z) : ''}
        ${c !== 'N' && z != null && z >= top && (self == null || z > self) ? '<span class="most">Most used</span>' : ''}
        ${c ? `<span class="swap ${SWAP[c][0]}">${SWAP[c][1]}</span>` : ''}
        ${note ? `<span class="syn-note">${esc(note)}</span>` : ''}
      </div>`).join('')}
      <p class="syn-legend">Dots show how often people use the word in everyday English. Pick the most used one when you are not sure.</p>
    </div>`;
  }
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
     TODAY — only what to do today
     ====================================================== */
  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return 'Still up, traveler?';
    if (h < 11) return 'Good morning, traveler.';
    if (h < 14) return 'Good afternoon, traveler.';
    if (h < 18) return 'Good afternoon, traveler.';
    return 'Good evening, traveler.';
  }
  function viewToday() {
    const now = new Date();
    const p = plan();
    const pendingNew = p.filter((id) => !S.cards[id]);
    const rv = reviewPlan();
    const d = today();
    const stub = stubborn();
    const tw = todaysWords().length;
    const mins = Math.max(3, Math.round(pendingNew.length * 0.7 + rv.list.length * 0.25));
    const work = pendingNew.length + rv.list.length;
    const earned = earnRepair();
    const baseLeft = Math.max(0, Math.min(pendingNew.length, S.set.goal - d.n));
    const bonusLeft = pendingNew.length - baseLeft;
    const reviewed = (d.rv || []).length;
    const tasks = [
      { k: 'rev', t: rv.list.length ? `Review ${pl(rv.list.length, 'word')}` : 'Review', done: !rv.list.length, sub: rv.list.length ? (rv.later ? `Today, review the ${rv.list.length} most important ones. The other ${rv.later} can wait.` : 'Answer first, then see the card. Missed words come back soon.') : reviewed ? `${pl(reviewed, 'word')} reviewed today` : 'Nothing due today', href: '#learn' },
      { k: 'new', t: baseLeft ? `Learn ${pl(baseLeft, 'new word')}` : 'New words', done: !baseLeft, sub: baseLeft ? `About ${Math.max(3, Math.round(baseLeft * 0.7))} min · read the English card, then answer in English` : `${pl(Math.min(d.n, S.set.goal), 'new word')} today`, href: '#learn' },
      ...(d.bonus ? [{ k: 'bonus', bonus: true, t: `+${d.bonus} bonus words`, done: !bonusLeft, sub: bonusLeft ? `${bonusLeft} left · extra for today, your daily goal stays ${S.set.goal}` : 'Done · extra for today', href: '#learn' }] : []),
      ...(stub.length ? [{ k: 'stub', t: pl(stub.length, 'hard word'), done: false, sub: 'Words you missed on 3 different days, with new question types', href: '#practice', act: 'stub' }] : []),
      { k: 'recap', t: 'Bedtime recap', done: !!d.recap, sub: d.recap ? 'Done' : tw ? `Today’s ${pl(tw, 'word')} · about 3 min` : 'Opens after you learn new words', href: '#recap', off: !tw && !d.recap },
    ];
    const core = tasks.filter((x) => !x.bonus);
    const saved = session && session.queue.length ? session : restoreSession();
    const n = core.filter((x) => x.done).length;
    const st = streak();
    view.innerHTML = `
      <div class="wrap today">
        <header class="page-head">
          <span class="eyebrow">${WEEK[now.getDay()]} · ${MON[now.getMonth()]} ${now.getDate()}</span>
          <h1>${greeting()}</h1>
        </header>
        ${!S.place ? `<a class="notice" href="#place"><b>Take the 3-minute level check</b><span>Start at 400 or 600 based on your result, not always from the easiest words.</span>${I.arrow}</a>` : ''}
        ${repairable() ? `<div class="notice is-warm"><b>You missed yesterday</b><span>Use a streak saver to fill the gap? You have ${S.freeze}.</span><button class="btn small" id="use-fix">Use a streak saver</button></div>` : ''}
        ${earned ? `<div class="notice is-good"><b>${st} days in a row!</b><span>You got 1 streak saver. It can fill one missed day.</span></div>` : ''}
        <section class="todo card" aria-label="Today’s plan">
          <div class="todo-head">
            <div><span class="eyebrow">Today’s plan</span><h2>${work ? `About ${mins} minutes` : n === core.length ? 'All done for today' : 'Almost done'}</h2></div>
            <div class="streak-chip" title="Days in a row"><b class="num">${st}</b><span>day streak</span>${S.freeze ? `<i title="Streak savers">Saver ×${S.freeze}</i>` : ''}</div>
          </div>
          <div class="meter todo-meter"><i class="m-mastered" style="width:${(n / core.length) * 100}%"></i></div>
          <p class="todo-count">${n} of ${core.length} done</p>
          <ol class="todo-list">
            ${tasks.map((x, k) => `<li><a class="todo-item rh-step ${x.done ? 'is-done' : ''} ${x.off ? 'is-off' : ''} ${x.bonus ? 'is-bonus' : ''}" href="${x.off ? '#today' : x.href}" ${x.act ? `data-act="${x.act}"` : ''}>
              <span class="rh-no">${x.bonus ? '+' : k + 1 - (tasks.slice(0, k).some((y) => y.bonus) ? 1 : 0)}</span>
              <span class="rh-txt"><b>${x.t}</b><span>${x.sub}</span></span>
              ${x.done ? `<span class="rh-ok">${I.check}<span class="sr-only">done</span></span>` : x.off ? '' : `<span class="rh-go">${I.arrow}</span>`}
            </a></li>`).join('')}
          </ol>
          <div class="todo-cta">
            ${work ? `<a class="btn" href="#learn">${saved && saved.step ? `Continue · card ${saved.step + 1} of ${saved.step + saved.queue.length}` : 'Start'} ${I.arrow}</a>` : `<button class="btn" id="extra">+5 bonus words ${I.arrow}</button><a class="btn ghost" href="#practice">Practice</a>`}
            <a class="btn ghost" href="#commute">${I.listen}<span>Hands-free commute</span></a>
          </div>
        </section>
        <p class="today-more">Progress, the star map, the four levels and the 15 work topics are on the <a href="#me">Me</a> page.</p>
      </div>`;
    const fx = $('#use-fix');
    if (fx) fx.addEventListener('click', () => { if (useRepair()) { sfx('ignite'); toast(`Yesterday is filled. ${streak()} days in a row.`); viewToday(); } });
    const extra = $('#extra');
    if (extra) extra.addEventListener('click', () => { d.bonus = (d.bonus || 0) + 5; save(); plan(); session = null; go('learn'); });
    const sb = view.querySelector('[data-act="stub"]');
    if (sb) sb.addEventListener('click', (e) => { e.preventDefault(); startDrill(); });
  }

  /* ======================================================
     PLACEMENT — 3 minutes, word → English meaning, an honest "I don't know"
     ====================================================== */
  const PLACE_MIN = 3;
  const PLACE_KEY = 'toeic-voyage:place';
  let place = null;
  // a check in progress survives a page reload; the clock keeps running from the original start
  function savePlace() {
    try {
      if (place && place.stage === 'run') localStorage.setItem(PLACE_KEY, JSON.stringify({ items: place.items, i: place.i, t0: place.t0, res: place.res }));
      else localStorage.removeItem(PLACE_KEY);
    } catch (e) { /* storage unavailable */ }
  }
  function restorePlace() {
    try {
      const p = JSON.parse(localStorage.getItem(PLACE_KEY));
      if (p && Array.isArray(p.items) && Array.isArray(p.res) && Date.now() - p.t0 < 30 * MIN) return { stage: 'run', ...p };
    } catch (e) { /* ignore */ }
    return null;
  }
  function placeClock() {
    const P = place;
    clearInterval(P.tick);
    P.tick = setInterval(() => {
      const left = PLACE_MIN * MIN - (Date.now() - P.t0);
      if (left <= 0) { placeFinish(); return; }
      const el = $('#pl-clock');
      if (el) el.textContent = `${Math.floor(left / MIN)}:${pad(Math.floor((left % MIN) / 1000))}`;
    }, 500);
  }
  function viewPlace() {
    if (!place || place.stage === 'done' || place.stage === 'result') place = restorePlace() || { stage: 'intro' };
    if (place.stage === 'run') {
      if (Date.now() - place.t0 >= PLACE_MIN * MIN) { placeFinish(); return; }
      placeClock();
    }
    paintPlace();
    const onKey = (e) => {
      if (!place || place.stage !== 'run' || e.target.matches('input, textarea')) return;
      const k = e.key.toLowerCase();
      const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
      if (i >= 0) { e.preventDefault(); placeAnswer(i); } else if (k === '5' || k === '0') placeAnswer(-1);
    };
    document.addEventListener('keydown', onKey);
    cleanup = () => { document.removeEventListener('keydown', onKey); clearInterval(place && place.tick); };
  }
  function placeItems() {
    const out = [];
    for (const l of LEVELS) {
      const pool = shuffle(WORDS.filter((w) => w.lv === l.lv && xw(w)[0]));
      out.push(...pool.slice(0, 8).map((w) => ({ id: w.id, lv: l.lv })));
    }
    // easy first, then mixed upward
    const first = out.slice(0, 4);
    const items = [...first, ...shuffle(out.slice(4))];
    for (const it of items) {
      const w = BY_ID.get(it.id);
      it.opts = shuffle([{ t: w.d, ok: true }, ...distractors(w, 3, WORDS.filter((x) => x.lv === w.lv)).map((d) => ({ t: d.d }))]);
    }
    return items;
  }
  function paintPlace() {
    const P = place;
    if (P.stage === 'intro') {
      view.innerHTML = `<div class="wrap"><div class="learn sp"><div class="sp-intro">
        <span class="eyebrow mono">LEVEL CHECK · 3 MINUTES</span>
        <h1>3-minute level check</h1>
        <p>See a word, hear it, and choose the right English meaning. If you don’t know, press “I don’t know”. Wrong guesses lower your result; “I don’t know” does not.</p>
        <ul class="sp-stars-how"><li><b>400</b>Do well on the 400-level words to start at 600</li><li><b>3:00</b>It stops when time is up. Every answer counts.</li><li><b>✓</b>If you reload the page, the check goes on where you were</li></ul>
        <div class="row-btns"><button class="btn" id="pl-go">Start ${I.arrow}</button>${S.onboarded ? '' : '<button class="btn ghost" id="pl-skip">Skip, start at 400</button>'}</div>
      </div></div></div>`;
      $('#pl-go').addEventListener('click', () => {
        Object.assign(P, { stage: 'run', items: placeItems(), i: 0, t0: Date.now(), res: [] });
        savePlace();
        placeClock();
        sfx('start');
        vt('card', paintPlace);
      });
      const sk = $('#pl-skip');
      if (sk) sk.addEventListener('click', () => { S.onboarded = true; S.place = { at: ymd(), acc: {}, start: 400, skipped: true }; S.set.start = 400; save(); go('today'); });
      return;
    }
    if (P.stage === 'result') return placeResult();
    const it = P.items[P.i];
    if (!it) return placeFinish();
    const w = BY_ID.get(it.id);
    const left = Math.max(0, PLACE_MIN * MIN - (Date.now() - P.t0));
    view.innerHTML = `<div class="wrap"><div class="quiz">
      <div class="learn-top">
        <a class="icon-btn" href="#today" aria-label="Leave the check" title="Leave (you can come back to it)">${I.close}</a>
        <div class="meter"><i style="width:${(P.i / P.items.length) * 100}%"></i></div>
        <span class="count num">Question ${P.i + 1} of ${P.items.length}</span>
        <span class="sp-clock num" id="pl-clock">${Math.floor(left / MIN)}:${pad(Math.floor((left % MIN) / 1000))}</span>
      </div>
      <article class="q-card">
        <div class="flash-head"><span class="eyebrow">Level check · choose the meaning</span></div>
        <div class="q-word"><span class="q-big">${esc(w.w)}</span><button class="pron is-mini" data-word="${w.id}" aria-label="Listen"><span class="spk">${I.speaker}</span><b>${kkHtml(w)}</b></button><span class="def-tag">${posTag(w)}</span></div>
        <div class="opts is-long">${it.opts.map((o, i) => `<button class="opt" data-pl="${i}"><span class="k">${'ABCD'[i]}</span><span class="t def">${esc(o.t)}</span></button>`).join('')}</div>
        <button class="btn ghost idk" data-pl="-1">I don’t know</button>
      </article>
    </div></div>`;
    view.querySelectorAll('[data-pl]').forEach((b) => b.addEventListener('click', () => placeAnswer(+b.dataset.pl)));
  }
  function placeAnswer(i) {
    const P = place;
    if (P.stage !== 'run') return;
    const it = P.items[P.i];
    if (!it || (i >= 0 && !it.opts[i])) return;
    P.res.push({ lv: it.lv, r: i < 0 ? 'idk' : it.opts[i].ok ? 'ok' : 'no' });
    sfx('tap');
    P.i++;
    savePlace();
    if (P.i >= P.items.length || Date.now() - P.t0 >= PLACE_MIN * MIN) return placeFinish();
    vt('card', paintPlace);
  }
  // score per level: right answers minus a guessing penalty (a wrong pick costs 1/3, "I don't know" costs nothing),
  // and a harder level can never score above an easier one
  function placeScores(res) {
    const acc = {};
    let cap = 1;
    for (const l of LEVELS) {
      const r = res.filter((x) => x.lv === l.lv);
      if (!r.length) { acc[l.lv] = null; continue; }
      const ok = r.filter((x) => x.r === 'ok').length;
      const no = r.filter((x) => x.r === 'no').length;
      const v = Math.max(0, (ok - no / 3) / r.length);
      acc[l.lv] = Math.min(v, cap);
      cap = acc[l.lv];
    }
    return acc;
  }
  function placeFinish() {
    const P = place;
    if (!P || P.stage !== 'run') return;
    clearInterval(P.tick);
    const res = P.res.map((x) => (x.r ? x : { lv: x.lv, r: x.ok ? 'ok' : 'no' }));
    const acc = placeScores(res);
    const n400 = res.filter((x) => x.lv === 400).length;
    const start = acc[400] != null && acc[400] >= 0.7 && n400 >= 3 ? 600 : 400;
    const count = (k) => res.filter((x) => x.r === k).length;
    S.place = { at: ymd(), acc, start, n: res.length, ok: count('ok'), no: count('no'), idk: count('idk') };
    S.set.start = start;
    S.onboarded = true;
    const d = today(); d.plan = (d.plan || []).filter((id) => S.cards[id]);
    save();
    P.stage = 'result';
    savePlace();
    sfx('complete');
    if (route.name === 'place') vt('card', placeResult);
  }
  function placeResult() {
    const pl0 = S.place;
    const acc = pl0.acc;
    const sc = estScore();
    view.innerHTML = `<div class="wrap"><div class="quiz"><div class="done">
      <img src="assets/brand/done.webp" alt="" width="480" height="480">
      <div class="done-body">
        <span class="eyebrow">Done · ${pl(pl0.n, 'answer')}</span>
        <h2>Start at ${pl0.start}${pl0.start === 600 ? '. You already know the basics well.' : '. Build a strong base first.'}</h2>
        <div class="done-stats is-three">
          <div><b class="num">${pl0.ok}</b><span>right</span></div>
          <div><b class="num">${pl0.no}</b><span>wrong</span></div>
          <div><b class="num">${pl0.idk}</b><span>I don’t know</span></div>
        </div>
        <div class="lv-rows">${LEVELS.map((l) => `<div class="lv-row lv-${l.lv}"><b>${l.lv}</b><div class="meter"><i class="m-mastered" style="width:${(acc[l.lv] || 0) * 100}%"></i></div><span>${acc[l.lv] == null ? 'not reached' : Math.round(acc[l.lv] * 100) + '%'}</span></div>`).join('')}</div>
        <p class="done-note">Level scores take away a little for each wrong guess, and a harder level never scores higher than an easier one.</p>
        <p style="color:var(--ink-2)">Estimated TOEIC score from vocabulary: <b class="num">${sc == null ? '—' : `${Math.max(10, sc - 50)}–${Math.min(990, sc + 50)}`}</b> (words only, a rough guide). ${S.set.goal} new words a day; change it in Me → Settings.</p>
        <div class="row-btns"><a class="btn" href="#learn">Start today’s ${S.set.goal} words ${I.arrow}</a><a class="btn ghost" href="#today">Back to Today</a></div>
      </div>
    </div></div></div>`;
  }
  // a rough vocabulary-based estimate; null until there is enough to go on
  function estScore() {
    const placed = S.place && !S.place.skipped && S.place.acc;
    if (!placed && Object.keys(S.cards).length < 20) return null;
    const k = {};
    for (const l of LEVELS) {
      const list = WORDS.filter((w) => w.lv === l.lv);
      let v = 0;
      for (const w of list) { const st = status(w.id); v += st === 'mastered' ? 1 : st === 'learning' ? 0.5 : 0; }
      let f = v / list.length;
      const p = placed ? S.place.acc[l.lv] : null;
      if (p != null) f = Math.max(f, p * 0.9);
      k[l.lv] = f;
    }
    // easier words weigh more: knowing every 400 word is worth more than knowing a few 990 words
    const s = 10 + 980 * (0.35 * k[400] + 0.27 * k[600] + 0.22 * k[800] + 0.16 * k[990]);
    return Math.round(s / 5) * 5;
  }

  /* ======================================================
     COMMUTE — hands-free: word, English meaning, example; no Chinese
     ====================================================== */
  const commute = { ids: [], i: 0, on: false, tok: 0, step: '' };
  function commuteList() {
    const seen = new Set();
    const out = [];
    const add = (id) => { if (!seen.has(id) && BY_ID.has(id)) { seen.add(id); out.push(id); } };
    reviewPlan().list.forEach(add);
    todaysWords().forEach(add);
    Object.entries(S.cards).sort((a, b) => (b[1].last || 0) - (a[1].last || 0)).slice(0, 40).forEach(([id]) => add(+id));
    if (out.length < 10) plan().forEach(add);
    return out.slice(0, 40);
  }
  function viewCommute() {
    commute.ids = commuteList();
    commute.i = Math.min(commute.i, Math.max(0, commute.ids.length - 1));
    paintCommute();
    const onKey = (e) => { if (e.target.matches('input, textarea')) return; if (e.key === ' ') { e.preventDefault(); toggleCommute(); } else if (e.key === 'ArrowRight') cmStep(1); else if (e.key === 'ArrowLeft') cmStep(-1); };
    document.addEventListener('keydown', onKey);
    cleanup = () => { document.removeEventListener('keydown', onKey); stopCommute(); };
  }
  function paintCommute() {
    const C = commute;
    const w = BY_ID.get(C.ids[C.i]);
    if (!w) {
      view.innerHTML = `<div class="wrap"><div class="learn"><div class="done"><img src="assets/brand/listen.webp" alt="" width="480" height="480"><div class="done-body"><span class="eyebrow">Hands-free commute</span><h2>Learn a few words first, then they can play here.</h2><div class="row-btns"><a class="btn" href="#learn">Learn new words ${I.arrow}</a></div></div></div></div></div>`;
      return;
    }
    const ex = dailyEx(w);
    view.innerHTML = `<div class="wrap"><div class="learn commute">
      <div class="learn-top">
        <a class="icon-btn" href="#today" aria-label="Leave">${I.close}</a>
        <div class="meter"><i style="width:${((C.i + 1) / C.ids.length) * 100}%"></i></div>
        <span class="count num">Word ${C.i + 1} of ${C.ids.length}</span>
      </div>
      <article class="cm-card">
        <span class="eyebrow">Hands-free · word → meaning → example · ${ACC[listenAccent(C.i)]}</span>
        <div class="cm-word ${C.step === 'word' ? 'is-on' : ''}">${esc(w.w)}</div>
        <p class="cm-line ${C.step === 'def' ? 'is-on' : ''}"><span class="def-tag">${posTag(w)}</span>${esc(w.d)}</p>
        <p class="cm-line is-ex ${C.step === 'ex' ? 'is-on' : ''}">${markSentence(ex)}</p>
      </article>
      <div class="cm-ctrl">
        <button class="icon-btn big" id="cm-prev" aria-label="Previous word" title="Previous word">${I.prev}</button>
        <button class="cm-play" id="cm-play" aria-label="${C.on ? 'Pause' : 'Play'}" title="${C.on ? 'Pause' : 'Play'}">${C.on ? I.pause : I.play}</button>
        <button class="icon-btn big" id="cm-next" aria-label="Next word" title="Next word">${I.next}</button>
      </div>
      <div class="cm-set"><label for="cm-rate">Speed <span class="num" id="cm-rate-v">${S.set.rate.toFixed(2)}×</span></label><input id="cm-rate" type="range" min="0.6" max="1.2" step="0.05" value="${S.set.rate}"></div>
      <p class="kbd-hint">Put on headphones, press play and keep your phone in your pocket. Some phones stop the voice when the screen turns off; keep it on or make auto-lock longer.</p>
    </div></div>`;
    $('#cm-play').addEventListener('click', toggleCommute);
    $('#cm-prev').addEventListener('click', () => cmStep(-1));
    $('#cm-next').addEventListener('click', () => cmStep(1));
    const r = $('#cm-rate');
    r.addEventListener('input', () => { S.set.rate = +r.value; $('#cm-rate-v').textContent = `${S.set.rate.toFixed(2)}×`; });
    r.addEventListener('change', save);
    try {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: w.w, artist: 'TOEIC Voyage · hands-free', album: w.d });
        navigator.mediaSession.setActionHandler('play', () => { if (!C.on) toggleCommute(); });
        navigator.mediaSession.setActionHandler('pause', () => { if (C.on) toggleCommute(); });
        navigator.mediaSession.setActionHandler('nexttrack', () => cmStep(1));
        navigator.mediaSession.setActionHandler('previoustrack', () => cmStep(-1));
      }
    } catch (e) { /* not supported */ }
  }
  function stopCommute() {
    commute.on = false; commute.tok++; commute.step = '';
    try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    if (clip) { clip.a.pause(); clip = null; }
  }
  function toggleCommute() {
    if (commute.on) { stopCommute(); paintCommute(); return; }
    armAudio();
    commute.on = true;
    cmRun();
  }
  function cmStep(dlt) {
    const was = commute.on;
    stopCommute();
    commute.i = (commute.i + dlt + commute.ids.length) % commute.ids.length;
    paintCommute();
    if (was) { commute.on = true; cmRun(); }
  }
  function cmRun() {
    const C = commute;
    const tok = ++C.tok;
    const w = BY_ID.get(C.ids[C.i]);
    if (!w) return;
    const acc = listenAccent(C.i);
    const alive = () => C.on && C.tok === tok && route.name === 'commute';
    const later = (fn, ms) => setTimeout(() => { if (alive()) fn(); }, ms);
    const mark = (st) => { C.step = st; $$('.cm-word, .cm-line', view).forEach((el) => el.classList.remove('is-on')); const el = st === 'word' ? $('.cm-word') : st === 'def' ? $('.cm-line:not(.is-ex)') : $('.cm-line.is-ex'); if (el) el.classList.add('is-on'); };
    paintCommute();
    mark('word');
    const seg = acc === 'au' ? null : w[acc === 'uk' ? 'k' : 'u'];
    const afterWord = () => later(() => { mark('def'); speak(w.d, acc, S.set.rate, () => later(() => { mark('ex'); speak(dailyEx(w).en, acc, S.set.rate, () => later(() => { C.i = (C.i + 1) % C.ids.length; cmRun(); }, 1400)); }, 700)); }, 700);
    if (seg) { playWord(w, acc); later(afterWord, (seg[1] / Math.max(0.75, Math.min(1.1, S.set.rate / 0.9))) * 1000 + 300); }
    else speak(w.w, acc, S.set.rate, afterWord);
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
      else if (atlasState.st === 'stub') { if (!isStubborn(w.id)) return false; }
      else if (atlasState.st !== 'all' && status(w.id) !== atlasState.st) return false;
      if (q) return fold(w.w).includes(q) || fold(w.d).includes(q) || zhMain(w).includes(atlasState.q.trim());
      return true;
    });
  }
  function viewAtlas() {
    view.innerHTML = `
      <div class="wrap">
        <header class="page-head atlas-head">
          <div style="display:grid;gap:10px">
            <span class="eyebrow">Words · ${fmt(WORDS.length)}</span>
            <h1>Every word has a place at work.</h1>
            <p class="sub">Meanings in basic English · ${fmt(WORDS.filter(hasArt).length)} pictures that fit · US and UK voices · roots and word families</p>
          </div>
          <label class="search-field"><span class="sr-only">Search words</span>${I.search}<input id="atlas-q" type="search" placeholder="Search a word or its meaning" value="${esc(atlasState.q)}" autocomplete="off"></label>
        </header>
        <div class="filters">
          <div class="chips" role="group" aria-label="Level">
            <button class="chip" data-f="lv" data-v="0" aria-pressed="${atlasState.lv === 0}">All levels</button>
            ${LEVELS.map((l) => `<button class="chip lv-${l.lv}" data-f="lv" data-v="${l.lv}" aria-pressed="${atlasState.lv === l.lv}"><span class="dot"></span>${l.lv} ${l.name}</button>`).join('')}
          </div>
          <div class="chips scroll" role="group" aria-label="Topic">
            <button class="chip" data-f="topic" data-v="all" aria-pressed="${atlasState.topic === 'all'}">All topics</button>
            ${TOPICS.map((t) => `<button class="chip" data-f="topic" data-v="${t.k}" aria-pressed="${atlasState.topic === t.k}">${t.zh}</button>`).join('')}
          </div>
          <div class="filter-bar">
            <div class="chips">
              <div class="seg" role="group" aria-label="Status">
                ${[['all', 'All'], ['new', 'New'], ['learning', 'Learning'], ['mastered', 'Mastered'], ['star', 'Saved'], ['stub', 'Hard words']].map(([v, t]) => `<button data-f="st" data-v="${v}" aria-pressed="${atlasState.st === v}">${t}</button>`).join('')}
              </div>
              <div class="seg" role="group" aria-label="Part of speech">
                ${[['all', 'Part of speech'], ['n.', 'n.'], ['v.', 'v.'], ['adj.', 'adj.'], ['adv.', 'adv.']].map(([v, t]) => `<button data-f="pos" data-v="${v}" aria-pressed="${atlasState.pos === v}">${t}</button>`).join('')}
              </div>
            </div>
            <div class="filter-right">
              <span class="count num" id="atlas-count"></span>
              <div class="seg" role="group" aria-label="View">
                <button data-f="view" data-v="grid" aria-pressed="${atlasState.view === 'grid'}" aria-label="Cards">${I.grid.replace('<svg', '<svg width="16" height="16"')}</button>
                <button data-f="view" data-v="list" aria-pressed="${atlasState.view === 'list'}" aria-label="List">${I.list.replace('<svg', '<svg width="16" height="16"')}</button>
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
    $('#atlas-count').textContent = `${fmt(list.length)} results`;
    const shown = list.slice(0, atlasState.limit);
    const box = $('#atlas-results');
    if (!list.length) {
      box.innerHTML = `<div class="empty"><img src="assets/brand/empty.webp" alt="" width="480" height="480"><b>No words found</b><span>Try fewer filters or another search word.</span><button class="btn ghost small" id="clear-f">Clear filters</button></div>`;
      $('#clear-f').addEventListener('click', () => { Object.assign(atlasState, { lv: 0, topic: 'all', pos: 'all', st: 'all', q: '', limit: 60 }); viewAtlas(); });
    } else if (atlasState.view === 'grid') {
      box.innerHTML = `<div class="grid">${shown.map((w) => `
        <button class="wcard" data-open="${w.id}">
          ${art(w)}
          <div class="wcard-body">
            <div class="wcard-top"><span class="wcard-word">${esc(w.w)}</span><span class="wcard-meta">${lvBadge(w.lv)}<span class="st ${status(w.id)}" title="${STATUS_ZH[status(w.id)]}"></span></span></div>
            <span class="wcard-def">${esc(shortDef(w, 58))}</span>
            <span class="wcard-zh"><i>${w.s[0][0]}</i></span>
          </div>
        </button>`).join('')}</div>`;
    } else {
      box.innerHTML = `<div class="list">${shown.map((w) => `
        <button class="wrow" data-open="${w.id}">
          ${art(w)}
          <span class="w">${esc(w.w)}</span>
          <span class="k">${kkHtml(w)}</span>
          <span class="z"><i>${w.s[0][0]}</i>${esc(shortDef(w, 60))}</span>
          ${lvBadge(w.lv)}
          <span class="st ${status(w.id)}" title="${STATUS_ZH[status(w.id)]}"></span>
        </button>`).join('')}</div>`;
    }
    const more = $('#atlas-more');
    more.innerHTML = list.length > atlasState.limit ? `<button class="btn ghost" id="more-btn">Show ${Math.min(60, list.length - atlasState.limit)} more</button>` : '';
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
    ov.setAttribute('aria-label', `${w.w} card`);
    const sheet = ov.querySelector('.sheet');
    const st = status(id);
    const starred = S.stars.includes(id);
    const idx = entryCtx ? entryCtx.indexOf(id) : -1;
    const prev = idx > 0 ? entryCtx[idx - 1] : null;
    const next = idx >= 0 && idx < entryCtx.length - 1 ? entryCtx[idx + 1] : null;
    const pool = WORDS.filter((x) => x.t === w.t && x.id !== id && Math.abs(x.lv - w.lv) <= 200);
    const related = [...pool.filter(hasArt), ...pool.filter((x) => !hasArt(x))].sort((a, b) => (hash(a.w + id) % 97) - (hash(b.w + id) % 97)).slice(0, 6);
    const c = S.cards[id];
    const x = xw(w);
    const pair = EX.pairs.find((pp) => pp.w.some((t) => fold(t) === fold(w.w)));
    sheet.innerHTML = `
      <button class="sheet-close" aria-label="Off">${I.close}</button>
      <div class="entry">
        <div class="entry-side">
          ${art(w, { full: true })}
          <div class="entry-actions">
            <button class="btn ghost small" id="e-star" aria-pressed="${starred}">${starred ? I.starOn : I.star}${starred ? 'Saved' : 'Saved'}</button>
            ${st === 'mastered' ? '<button class="btn ghost small" id="e-forget">Learn again</button>' : '<button class="btn ghost small" id="e-known">I know this</button>'}
          </div>
          <p class="entry-state">${st === 'new' ? 'New word. Add it to today, or mark it as known.' : st === 'mastered' ? `Mastered. Next review: ${new Date(c.due).toLocaleDateString('zh-TW')}` : `Learning. Reviewed ${c.reps} times. Next: ${c.due <= Date.now() ? 'now' : ivlLabel(c) + ''}`}${isStubborn(id) ? '<br><b class="stub-tag">Hard word: missed ' + S.wrong[id] + ' times</b>' : ''}</p>
          ${entryCtx ? `<div class="entry-nav"><button class="btn ghost small" id="e-prev" ${prev ? '' : 'disabled'}>${I.left}Previous</button><span>${idx + 1} / ${entryCtx.length}</span><button class="btn ghost small" id="e-next" ${next ? '' : 'disabled'}>Next${I.right}</button></div>` : ''}
        </div>
        <div class="entry-main">
          <div class="entry-meta">${lvBadge(w.lv, true)}<span class="badge plain">${TP[w.t].zh}</span><span class="badge plain">${posTag(w)}</span></div>
          <div class="entry-no"><span>№ ${pad(w.id, 4)}</span><i></i><span>TOEIC VOYAGE</span></div>
          <h2 class="entry-word">${esc(w.w)}</h2>
          ${pron(w)}
          <p class="def-line is-big"><span class="def-tag">EN</span>${esc(w.d)}</p>
          ${x[0] ? `<p class="def-simple"><span class="def-tag">simpler</span>${esc(x[0])}</p>` : ''}
          <div class="senses is-small" lang="zh-Hant">${sensesByPos(w).map(([pos, zh]) => `<div class="sense"><i>${pos}</i><b>${esc(zh)}</b></div>`).join('')}</div>
          ${x[4] ? `<div><div class="block-label">Learn this phrase first</div><p class="col-line is-key"><b>${esc(x[4])}</b><span>= ${esc(x[5])}</span> <button class="mini-spk" data-say="${esc(x[4])}" aria-label="Read aloud">${I.speaker}</button></p></div>` : ''}
          <div class="hook-box">
            <div class="block-label">Memory hook</div>
            ${x[1] ? `<div class="roots">${rootsHtml(x[1])}</div>` : ''}
            ${x[2] ? `<p class="hook" lang="zh-Hant">${esc(x[2])}</p>` : ''}
            <label class="mine"><span>My own hook</span><input id="e-mine" maxlength="80" placeholder="Your own way to remember it: a picture or a line" value="${esc(S.mine[id] || '')}"></label>
          </div>
          ${x[3] ? `<div><div class="block-label">Word family</div><div class="family">${familyHtml(x[3])}<span class="fam is-self"><b>${esc(w.w)}</b><i>${esc(posOf(w))}</i></span></div></div>` : ''}
          ${pair ? `<div class="pair-box"><div class="block-label">Don’t mix up</div>${pair.w.map((t) => `<p><b>${esc(t)}</b>${esc(pair.n[t])}</p>`).join('')}<button class="btn ghost small" id="e-pair">Practice confusable words ${I.arrow}</button></div>` : ''}
          <div class="examples">
            ${[dailyEx(w), toeicEx(w)].map((ex) => `<div class="example" data-sh-box>
              <span class="ex-tag ${ex.k === 't' ? 'is-toeic' : ''}">${ex.k === 't' ? 'TOEIC example' : 'Everyday example'}</span>
              <p class="en-line">${markSentence(ex)}</p>
              <p class="zh-line" lang="zh-Hant">${esc(ex.zh)}</p>
              ${shadowBtns(ex.en)}
              <div class="sh-out"></div>
            </div>`).join('')}
            ${storyCue(w)}
          </div>
          ${synHtml(w)}
          ${w.ant.length ? `<div class="nyms"><div class="nym"><span class="block-label">Opposites</span><div class="nym-list">${w.ant.map(wordLink).join('')}</div></div></div>` : ''}
          <div>
            <div class="block-label">More phrases</div>
            <div class="cols">${w.col.map((cc) => `<div class="col"><b>${esc(cc[0])}</b><span>${esc(cc[1])}</span></div>`).join('')}</div>
          </div>
          ${w.tip ? `<div class="tip"><div class="block-label">TOEIC tip</div><p>${esc(w.tip)}</p></div>` : ''}
          <div>
            <div class="block-label">Same topic · ${TP[w.t].zh}</div>
            <div class="related">${related.map((r) => `<button data-open="${r.id}">${art(r)}<span style="min-width:0"><b>${esc(r.w)}</b><span>${esc(shortDef(r, 40))}</span></span></button>`).join('')}</div>
          </div>
        </div>
      </div>`;
    sheet.scrollTop = 0;
    loadFull(sheet);
    sheet.querySelector('.sheet-close').addEventListener('click', closeEntry);
    $('#e-star').addEventListener('click', () => { const on = toggleStar(id); toast(on ? `Saved ${w.w}` : `Removed ${w.w}`); openEntry(id); refreshUnder(); });
    const kn = $('#e-known');
    if (kn) kn.addEventListener('click', () => { markKnown(id); sfx('ignite'); burstFrom(kn, 26, 0.8); toast(`${w.w} is mastered. Next review in 21 days.`); openEntry(id); refreshUnder(); });
    const fg = $('#e-forget');
    if (fg) fg.addEventListener('click', () => { forget(id); toast(`${w.w} is new again`); openEntry(id); refreshUnder(); });
    const mine = $('#e-mine');
    mine.addEventListener('change', () => { const v = mine.value.trim(); if (v) S.mine[id] = v; else delete S.mine[id]; save(); toast(v ? 'Your hook is saved' : 'Your hook is cleared'); });
    const ep = $('#e-pair');
    if (ep) ep.addEventListener('click', () => { closeEntryNow(ov); pracState.scope = 'all'; startQuiz('pair'); if (route.name !== 'practice') go('practice'); });
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
    ov.setAttribute('aria-label', 'Search words');
    ov.innerHTML = `<div class="palette"><label class="search-field"><span class="sr-only">Search</span>${I.search}<input id="pal-q" type="search" placeholder="Type a word, for example invoice" autocomplete="off"></label><div class="pal-list" role="listbox" id="pal-list"></div><div class="pal-hint"><span>↑↓ choose</span><span>Enter opens the card</span><span>Esc closes</span></div></div>`;
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
        ? (q ? '' : '<div class="eyebrow" style="padding:8px 14px">Words with TOEIC tips</div>') + res.map((w, i) => `<button class="pal-item" role="option" data-i="${i}" aria-selected="${i === sel}">${art(w)}<span><b>${esc(w.w)}</b><span>${esc(shortDef(w, 50))}</span></span>${lvBadge(w.lv)}</button>`).join('')
        : '<div class="empty" style="padding:30px"><span>Not found. This site has 1,000 common TOEIC words.</span></div>';
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
     LEARN — answer before the card turns over.
     New words: an English-only card first, then a check question a few cards later.
     Reviews: a question first. Wrong = 忘了 automatically; right = choose 記得 or 很簡單.
     ====================================================== */
  let session = null;
  // a missed word waits for at least this many other cards before it comes back
  const REQUEUE_GAP = 4;
  const SESSION_KEY = 'toeic-voyage:session';
  // the session in progress survives a page reload (same day only)
  function saveSession() {
    try {
      if (!session || !session.queue.length) localStorage.removeItem(SESSION_KEY);
      else localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, day: ymd() }));
    } catch (e) { /* storage unavailable */ }
  }
  function restoreSession() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (s && s.day === ymd() && Array.isArray(s.queue) && s.queue.length && s.queue.every((x) => BY_ID.has(x.id))) return s;
    } catch (e) { /* ignore */ }
    return null;
  }
  const requeue = (s, item) => s.queue.splice(Math.min(REQUEUE_GAP, s.queue.length), 0, item);
  function startSession() {
    const rv = reviewPlan();
    const fresh = plan().filter((id) => !S.cards[id]);
    preloadFull(fresh);
    session = { queue: [...rv.list.map((id) => ({ id, k: 'q' })), ...fresh.map((id) => ({ id, k: 'intro' }))], step: 0, later: rv.later, tally: { forgot: 0, ok: 0, easy: 0 }, q: null, n: 0, nNew: fresh.length, nRev: rv.list.length };
    saveSession();
  }
  function viewLearn() {
    if (!session || !session.queue.length) {
      session = restoreSession();
      if (!session) { startSession(); if (session.queue.length) sfx('start'); }
    }
    paintLearn();
    const onKey = (e) => {
      if ($('.overlay') || !session || e.target.matches('input, textarea')) return;
      const it = session.queue[0];
      if (!it) return;
      if (it.k === 'intro') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gotIntro(); } return; }
      const q = session.q;
      if (q && q.answered && q.ok && ['1', '2'].includes(e.key)) { e.preventDefault(); rateLearn(e.key === '1' ? 3 : q.hinted ? 3 : 4); return; }
      if (q && q.answered && !q.ok && e.key === 'Enter') { e.preventDefault(); rateLearn(1); return; }
      choiceKey(e, q, null);
    };
    document.addEventListener('keydown', onKey);
    cleanup = () => document.removeEventListener('keydown', onKey);
  }
  function gotIntro() {
    const s = session;
    const it = s.queue.shift();
    s.step++;
    // the check comes back after several other cards, so it is recall, not copying
    requeue(s, { id: it.id, k: 'q', isNew: true });
    saveSession();
    sfx('page');
    vt('card', paintLearn);
  }
  function learnQ(it) {
    const s = session;
    const w = BY_ID.get(it.id);
    const c = S.cards[it.id];
    // new words and young cards: pick the meaning; older cards: produce the word from its meaning
    const type = it.isNew || !c || (c.ivl || 0) < 4 ? (s.n % 3 === 2 && !it.isNew ? 'type' : 'word2def') : (s.n % 2 ? 'word2def' : 'type');
    s.n++;
    return makeQ(type, w, WORDS.filter((x) => x.lv === w.lv));
  }
  function rateLearn(g) {
    const s = session;
    const it = s.queue.shift();
    s.step++;
    const c = grade(it.id, g);
    if (g === 1) s.tally.forgot++; else if (g === 4) s.tally.easy++; else s.tally.ok++;
    if (g >= 3) sfx('page');
    if (c.due - Date.now() < 20 * MIN) requeue(s, { id: it.id, k: 'q' });
    s.q = null;
    saveSession();
    vt('card', paintLearn);
  }
  // what is still open on today's plan after this session
  function openTasks() {
    const out = [];
    if (stubborn().length) out.push(['Hard words', '#practice', 'stub']);
    const d = today();
    if (!d.recap && todaysWords().length) out.push(['Bedtime recap', '#recap']);
    return out;
  }
  function learnDone() {
    const s = session;
    const steps = s.step;
    if (steps) { sfx('complete'); setTimeout(() => burst(innerWidth / 2, innerHeight * 0.38, 70, 1.4), 120); }
    try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
    const d = today();
    earnRepair();
    const rest = openTasks();
    const reviewed = (d.rv || []).length;
    view.innerHTML = `<div class="wrap"><div class="learn">
      <div class="done">
        <img src="assets/brand/done.webp" alt="" width="480" height="480">
        <div class="done-body">
          <span class="eyebrow">${s.story ? `Chapter ${s.story}` : rest.length ? 'Review done' : 'Today’s plan is done'}</span>
          <h2>${s.story ? `You studied every word in chapter ${s.story}.` : steps ? (rest.length ? 'Your reviews and new words are done.' : 'Today’s words have landed safely.') : 'Nothing to learn right now.'}</h2>
          <div class="done-stats">
            <div><b class="num">${d.n}</b><span>new words today</span></div>
            <div><b class="num">${reviewed}</b><span>${reviewed === 1 ? 'word' : 'words'} reviewed today</span></div>
            <div><b class="num">${s.tally.ok + s.tally.easy}</b><span>remembered this session</span></div>
            <div><b class="num">${s.tally.forgot}</b><span>forgot (they come back)</span></div>
          </div>
          ${s.later ? `<p class="done-note">${s.later} more due ${s.later === 1 ? 'word waits' : 'words wait'} for the next days, so you do not have to do them all now.</p>` : ''}
          ${rest.length ? `<p class="done-note">Still on today’s plan: ${rest.map(([t, h, act]) => `<a href="${h}" ${act ? `data-act="${act}"` : ''}>${t}</a>`).join(' · ')}</p>` : ''}
          <div class="row-btns">
            ${s.story
              ? `<button class="btn" data-cloze="${s.story}">Check with the story quiz ${I.arrow}</button><button class="btn ghost" data-story="${s.story}">Back to chapter ${s.story}</button>`
              : `<a class="btn" href="#today">Back to Today ${I.arrow}</a><a class="btn ghost" href="#practice">Practice</a><button class="btn ghost" id="more5">+5 bonus words</button>`}
          </div>
        </div>
      </div></div></div>`;
    const m5 = $('#more5');
    // bonus words are extra for today only; the daily goal in Settings stays the same
    if (m5) m5.addEventListener('click', () => { const dd = today(); dd.bonus = (dd.bonus || 0) + 5; save(); plan(); session = null; viewLearn(); });
    const st = view.querySelector('[data-act="stub"]');
    if (st) st.addEventListener('click', (e) => { e.preventDefault(); startDrill(); });
    const cz = view.querySelector('[data-cloze]');
    if (cz) cz.addEventListener('click', () => { const no = +cz.dataset.cloze; session = null; storyState.cloze = { no, pending: true }; go(`story-${no}`); });
  }
  // one progress rule everywhere: "Card n of N" (N grows when a missed word is added back)
  const learnTop = (s) => {
    const total = s.step + s.queue.length;
    return `<div class="learn-top">
      <a class="icon-btn" href="#today" aria-label="Leave" title="Leave (your place is saved)">${I.close}</a>
      <div class="meter" role="progressbar" aria-valuenow="${Math.round((s.step / Math.max(1, total)) * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${(s.step / Math.max(1, total)) * 100}%"></i></div>
      <span class="count num">Card ${Math.min(s.step + 1, total)} of ${total}</span>
    </div>`;
  };
  // the card itself, English only: picture or sentence, definition, collocation, roots, family
  function cardFront(w, opt = {}) {
    const x = xw(w);
    const ex = dailyEx(w);
    return `<article class="flash ${hasArt(w) ? '' : 'no-art'} ${opt.cls || ''}">
      ${hasArt(w) ? art(w, { full: true }) : ''}
      <div class="flash-body">
        <div class="flash-head"><div style="display:flex;gap:8px;flex-wrap:wrap">${lvBadge(w.lv)}<span class="badge plain">${posTag(w)}</span></div>${opt.badge || ''}</div>
        <div class="flash-word">${esc(w.w)}</div>
        ${pron(w)}
        <p class="def-line is-big"><span class="def-tag">EN</span>${esc(w.d)}</p>
        ${opt.zh ? `<p class="zh-small" lang="zh-Hant">${esc(zhMain(w))}</p>` : ''}
        <div class="example"><p class="en-line">${markSentence(ex)} <button class="mini-spk" data-say="${esc(ex.en)}" aria-label="Read the example">${I.speaker}</button></p>${opt.zh ? `<p class="zh-line" lang="zh-Hant">${esc(ex.zh)}</p>` : ''}</div>
        ${x[4] && !opt.noPhrase ? `<p class="col-line"><span class="def-tag">use it</span><b>${esc(x[4])}</b><span>= ${esc(x[5])}</span></p>` : ''}
        ${x[1] || x[3] ? `<div class="word-parts">${x[1] ? `<span class="roots">${rootsHtml(x[1])}</span>` : ''}${x[3] ? `<span class="family">${familyHtml(x[3])}</span>` : ''}</div>` : ''}
        ${opt.zh && x[2] ? `<p class="hook" lang="zh-Hant"><b>Memory hook</b>${esc(x[2])}</p>` : ''}
        ${opt.zh && S.mine[w.id] ? `<p class="hook is-mine"><b>My hook</b>${esc(S.mine[w.id])}</p>` : ''}
      </div>
    </article>`;
  }
  const rootsHtml = (r) => r.split('+').map((p) => { const [a, b] = p.split('='); return `<span class="root"><b>${esc(a)}</b>${b ? `<i>${esc(b)}</i>` : ''}</span>`; }).join('<span class="plus">+</span>');
  const familyHtml = (f) => f.split(';').map((t) => { const m = t.trim().match(/^(.+?)\s+([a-z./]+)$/); const word = m ? m[1] : t.trim(); const hit = BY_WORD.get(fold(word)); return `<span class="fam">${hit ? `<button data-open="${hit.id}">${esc(word)}</button>` : `<b>${esc(word)}</b>`}${m ? `<i>${esc(m[2])}</i>` : ''}</span>`; }).join('');
  // the action bar sits fixed at the bottom, so answering never scrolls the question away
  const dock = (inner) => `<div class="dock" role="group" aria-label="Next step"><div class="dock-in">${inner}</div></div>`;
  const verdict = (q) => (q.ok ? `<span class="verdict is-ok">${I.check}Correct${q.hinted ? ' · with a hint' : ''}</span>` : `<span class="verdict is-no">${I.cross}Not quite${q.gaveUp ? '' : q.typed ? ` · you typed “${esc(q.typed)}”` : ''}</span>`);
  function paintLearn() {
    const s = session;
    if (!s.queue.length) return learnDone();
    const it = s.queue[0];
    const w = BY_ID.get(it.id);
    if (it.k === 'intro') {
      hintCtx = null;
      view.innerHTML = `<div class="wrap has-dock"><div class="learn">
        ${learnTop(s)}
        ${cardFront(w, { badge: '<span class="badge plain lv-800">NEW</span>' })}
        <p class="kbd-hint">Listen, read the example aloud and think about the meaning in English. <kbd>Enter</kbd> next</p>
      </div></div>
      ${dock(`<span class="dock-note">This word comes back as a question after a few cards.</span><button class="btn" id="got">I’ve got it ${I.arrow}</button>`)}`;
      loadFull(view);
      $('#got').addEventListener('click', gotIntro);
      if (!it.played) { it.played = true; if (s.interacted) setTimeout(() => playWord(w), 200); }
      s.interacted = true;
      return;
    }
    if (!s.q || s.q.id !== it.id) { s.q = learnQ(it); saveSession(); }
    const q = s.q;
    const c = S.cards[w.id];
    const when = [3, 4].map((g) => ivlLong(nextState(c, g)));
    view.innerHTML = `<div class="wrap ${q.answered ? 'has-dock' : ''}"><div class="learn">
      ${learnTop(s)}
      <article class="q-card">
        <div class="flash-head"><span class="eyebrow">${it.isNew ? 'New word check' : 'Review'} · ${QLABEL[q.type]}</span>${lvBadge(w.lv)}</div>
        ${qPrompt(q)}
        ${qChoices(q)}
        ${hintHtml(q)}
      </article>
      ${q.answered ? cardFront(w, { zh: true, cls: 'is-back' }) : ''}
    </div></div>
    ${q.answered ? dock(q.ok
      ? `${verdict(q)}<div class="rates is-two">
          <button class="rate r3" data-g="3">Remembered<small>see you ${when[0]}</small></button>
          ${q.hinted ? '<button class="rate r4" disabled title="You used a hint, so choose Remembered">Easy<small>not after a hint</small></button>' : `<button class="rate r4" data-g="4">Easy<small>see you ${when[1]}</small></button>`}
        </div>`
      : `${verdict(q)}<span class="dock-note">Saved as “forgot”. It comes back after ${REQUEUE_GAP} cards.</span><button class="btn" data-g="1">Next ${I.arrow}</button>`) : ''}`;
    loadFull(view);
    wireQ(q, {
      paint: paintLearn,
      after: (qq) => {
        if (!qq.ok) miss(qq.id);
        const d = today(); d.q++; if (qq.ok) d.c++;
        save();
        saveSession();
        paintLearn();
        settle();
        if (qq.ok) burstFrom($('.opt.ok') || $('.spell'), 18, 0.6);
        const b = document.querySelector('.dock [data-g]');
        if (b) b.focus({ preventScroll: true });
      },
    });
    document.querySelectorAll('.dock [data-g]').forEach((b) => b.addEventListener('click', () => rateLearn(+b.dataset.g)));
  }

  /* ======================================================
     QUESTION KIT — every question type needs the meaning recalled in English.
     Prompts and hints are English only; Chinese appears after answering, small, under the English definition.
     ====================================================== */
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
  function kindOf(f, base) {
    f = f.toLowerCase(); base = base.toLowerCase();
    if (f === base) return '';
    if (f.endsWith('ing') && !base.endsWith('ing')) return 'ing';
    if (f.endsWith('s') && !base.endsWith('s')) return 's';
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
  // near-synonyms (listed synonyms or a shared gloss) would make a question ambiguous
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
  const posTag = (w) => POS_EN[posOf(w)] || posOf(w);
  const underscores = (f) => f.replace(/[A-Za-zÀ-ÿ]/g, '_');
  const BLANK = '________';
  // where the word (or an inflected form of it) sits inside a phrase
  function findForm(text, w) {
    const base = w.w.toLowerCase();
    const low = text.toLowerCase();
    let k = -1;
    while ((k = low.indexOf(base, k + 1)) >= 0) {
      const before = low[k - 1] || ' ';
      if (!/[a-z]/.test(before)) {
        const m = /^[a-z]*/.exec(low.slice(k + base.length))[0];
        if (!m || ['s', 'es', 'ed', 'd', 'ing'].includes(m)) return { a: k, f: text.substr(k, base.length + m.length) };
      }
    }
    // inflected with spelling changes: facilities, committed, occupied, operating, implies
    if (/[\s-]/.test(base)) return null;
    for (const f of [inflS(base), inflEd(base), inflIng(base)]) {
      const m = new RegExp(`(^|[^a-z])(${f})(?![a-z])`, 'i').exec(text);
      if (m) return { a: m.index + m[1].length, f: m[2] };
    }
    return null;
  }
  function clozeHint(w) {
    const ex = dailyEx(w);
    return `${esc(ex.en.slice(0, ex.a))}<b class="hint-blank">${esc(ex.f[0] + underscores(ex.f.slice(1)))}</b>${esc(ex.en.slice(ex.a + ex.f.length))}`;
  }
  // three English layers: a simpler paraphrase, similar words, then a blanked sentence (or a spelling clue)
  function hintsFor(w, type, f) {
    const x = xw(w);
    // only near-synonyms that can stand in for the word (not ones with a different meaning)
    const syn = (EX.syn && EX.syn[w.id] ? EX.syn[w.id].filter((x) => x[1] !== 'N').map((x) => x[0]) : w.syn).filter((t) => fold(t) !== fold(w.w)).slice(0, 3);
    const simple = x[0] ? `<b>In simple words:</b> ${esc(x[0])}` : '';
    const synL = syn.length ? `<b>Similar words:</b> ${syn.map(esc).join(', ')}` : '';
    const spell = (s) => `<b>Spelling:</b> it starts with “${esc(s[0])}” and has ${s.replace(/[^A-Za-z]/g, '').length} letters`;
    if (type === 'word2def' || type === 'hear') return [`<b>In a sentence:</b> ${markSentence(dailyEx(w))}`, synL, simple].filter(Boolean);
    if (type === 'cloze' || type === 'dict' || type === 'col') return [simple, synL, spell(f || w.w)].filter(Boolean);
    return [simple, synL, `<b>Fill in:</b> ${clozeHint(w)}`].filter(Boolean);
  }

  /* one question object for every host (learn, practice, sprint, drills): q.type decides prompt, choices and checking */
  function makeQ(type, w, pool, n = 0) {
    pool = pool && pool.length >= 4 ? pool : WORDS;
    const q = { type, id: w ? w.id : 0, h: 0, answered: false, accent: listenAccent(n) };
    if (type === 'col') {
      const x = xw(w);
      const m = x[4] ? findForm(x[4], w) : null;
      if (!m) return makeQ('def', w, pool, n);
      Object.assign(q, { phrase: x[4], gloss: x[5], f: m.f, a: m.a });
      const kind = kindOf(m.f, w.w);
      const cap = m.a === 0 && /^[A-Z]/.test(m.f);
      q.opts = shuffle([{ t: m.f, ok: true, id: w.id }, ...distractors(w, 3, pool).map((d) => ({ t: applyForm(d.w, kind, cap), id: d.id }))]);
    } else if (type === 'cloze' || type === 'dict' || type === 'spell') {
      q.ex = nextCloze(w);
      save();
      if (type === 'cloze') {
        const cap = q.ex.a === 0;
        q.opts = shuffle([{ t: q.ex.f, ok: true, id: w.id }, ...distractors(w, 3, pool).map((d) => ({ t: applyForm(d.w, q.ex.kind, cap), id: d.id }))]);
      } else q.input = true;
      q.f = q.ex.f;
    } else if (type === 'type') {
      q.input = true; q.f = w.w;
    } else if (type === 'def') {
      q.opts = shuffle([{ t: w.w, ok: true, id: w.id }, ...distractors(w, 3, pool).map((d) => ({ t: d.w, id: d.id }))]);
    } else if (type === 'word2def' || type === 'hear') {
      q.long = true;
      q.opts = shuffle([{ t: w.d, ok: true, id: w.id }, ...distractors(w, 3, pool).map((d) => ({ t: d.d, id: d.id }))]);
    }
    q.hints = hintsFor(w, type, q.f);
    return q;
  }
  function makeP2(item, n) {
    const [id, Q, A, B, C] = item;
    const q = { type: 'p2', id, item, h: 0, answered: false, accent: listenAccent(n), say: Q };
    q.opts = shuffle([{ t: A, ok: true }, { t: B }, { t: C }]);
    const w = BY_ID.get(id);
    q.hints = [`<b>Transcript:</b> ${esc(Q)}`, w ? `<b>Key word:</b> ${esc(w.w)} — ${esc(xw(w)[0] || w.d)}` : ''].filter(Boolean);
    return q;
  }
  function makePair(pair, s) {
    const [key, form, sent] = s;
    const q = { type: 'pair', id: BY_WORD.get(fold(key))?.id || 0, pair, key, f: form, sent, h: 0, answered: false };
    q.opts = pair.w.map((t) => ({ t, ok: t === key }));
    q.hints = pair.w.map((t) => `<b>${esc(t)}:</b> ${esc(pair.n[t])}`);
    return q;
  }
  const qWord = (q) => BY_ID.get(q.id);
  function sayQ(q, slow) {
    const w = qWord(q);
    if (q.type === 'hear') playWord(w, q.accent, slow ? 0.75 : S.set.rate);
    else if (q.type === 'dict') speak(q.ex.en, q.accent, slow ? 0.75 : S.set.rate);
    else if (q.type === 'p2') speak(q.say, q.accent, slow ? 0.75 : S.set.rate);
  }
  const blankSpan = (q, f) => `<span class="blank">${q.answered ? esc(f) : '&nbsp;'}</span>`;
  const QLABEL = { cloze: 'Part 5 · sentence', def: 'Meaning → word', spell: 'Spelling', type: 'Recall · type the word', word2def: 'Word → meaning',
    hear: 'Listening · word', dict: 'Listening · gap', p2: 'Listening · Part 2', col: 'Phrases', pair: 'Confusable words' };
  function qPrompt(q) {
    const w = qWord(q);
    const t = q.type;
    if (t === 'cloze') return `<p class="q-sent">${esc(q.ex.en.slice(0, q.ex.a))}${blankSpan(q, q.ex.f)}${esc(q.ex.en.slice(q.ex.a + q.ex.f.length))}</p>${q.answered && q.ex.zh ? `<p class="q-zh">${esc(q.ex.zh)}</p>` : ''}`;
    if (t === 'def') return `<div class="q-def"><span class="def-tag">${posTag(w)}</span><p>${esc(w.d)}</p></div>`;
    if (t === 'spell') return `<div class="q-def is-small"><span class="def-tag">${posTag(w)}</span><p>${esc(w.d)}</p></div><p class="q-sent is-mid">${esc(q.ex.en.slice(0, q.ex.a))}<span class="blank">${q.answered ? esc(q.ex.f) : BLANK}</span>${esc(q.ex.en.slice(q.ex.a + q.ex.f.length))}</p>`;
    if (t === 'type') return `<div class="q-def"><span class="def-tag">${posTag(w)}</span><p>${esc(w.d)}</p></div>`;
    if (t === 'word2def') return `<div class="q-word"><span class="q-big">${esc(w.w)}</span><button class="pron is-mini" data-word="${w.id}" aria-label="Listen"><span class="spk">${I.speaker}</span><b>${kkHtml(w)}</b></button><span class="def-tag">${posTag(w)}</span></div><p class="q-ask">Which meaning is right?</p>`;
    if (t === 'hear') return `<div class="listen-stage is-compact"><button class="big-listen" data-sayq aria-label="Play again">${I.listen}</button><span class="acc-tag">${ACC[q.accent]}</span><p class="q-ask">${q.answered ? `<b class="q-reveal">${esc(w.w)}</b>` : 'Listen. What does this word mean?'} <button class="btn ghost small" data-sayq="slow">Slower</button></p></div>`;
    if (t === 'dict') {
      const shown = q.answered || q.showText;
      return `<div class="listen-stage is-compact"><button class="big-listen" data-sayq aria-label="Play again">${I.listen}</button><span class="acc-tag">${ACC[q.accent]}</span></div>
        <p class="q-sent is-mid ${shown ? '' : 'is-hidden'}" ${shown ? '' : 'aria-hidden="true"'}>${esc(q.ex.en.slice(0, q.ex.a))}<span class="blank">${q.answered ? esc(q.ex.f) : BLANK}</span>${esc(q.ex.en.slice(q.ex.a + q.ex.f.length))}</p>
        <p class="q-ask">Listen and type the missing word. <button class="btn ghost small" data-sayq="slow">Slower</button>${shown ? '' : ' <button class="btn ghost small" data-showtext>Show the sentence (counts as a hint)</button>'}</p>`;
    }
    if (t === 'p2') return `<div class="listen-stage is-compact"><button class="big-listen" data-sayq aria-label="Play again">${I.listen}</button><span class="acc-tag">${ACC[q.accent]}</span><p class="q-ask">${q.answered ? `<b class="q-reveal">“${esc(q.say)}”</b>` : 'Listen to the question. Choose the best response.'} <button class="btn ghost small" data-sayq="slow">Slower</button></p></div>`;
    if (t === 'col') return `<p class="q-sent">${esc(q.phrase.slice(0, q.a))}${blankSpan(q, q.f)}${esc(q.phrase.slice(q.a + q.f.length))}</p><p class="q-gloss"><span class="def-tag">means</span>${esc(q.gloss)}</p>`;
    if (t === 'pair') { const k = q.sent.indexOf('___'); return `<p class="q-sent">${esc(q.sent.slice(0, k))}${blankSpan(q, q.f)}${esc(q.sent.slice(k + 3))}</p>`; }
    return '';
  }
  function qChoices(q) {
    if (q.input) {
      const ph = q.type === 'dict' ? 'Type what you hear' : 'Type the word';
      return `<form class="spell" id="q-form" autocomplete="off"><label class="sr-only" for="q-in">Type the word</label><input id="q-in" type="text" maxlength="30" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${ph}" ${q.answered ? `disabled value="${esc(q.typed || '')}"` : ''}><button class="btn" type="submit" disabled>Check</button></form>
        ${q.synMsg && !q.answered ? `<p class="syn-msg" role="status">${q.synMsg}</p>` : ''}`;
    }
    return `<div class="opts ${q.long ? 'is-long' : ''} ${q.opts.length === 3 ? 'is-three' : ''} ${q.opts.length === 2 ? 'is-two' : ''}">${q.opts.map((o, i) => {
      let cls = '';
      if (q.answered) { if (o.ok) cls = 'ok'; else if (i === q.picked) cls = 'no'; }
      return `<button class="opt ${cls}" data-o="${i}" ${q.answered ? 'disabled' : ''}><span class="k">${'ABCD'[i]}</span><span class="t ${q.long || q.type === 'p2' ? 'def' : 'en'}">${esc(o.t)}</span></button>`;
    }).join('')}</div>`;
  }
  function hintHtml(q) {
    if (q.answered || !q.hints || !q.hints.length) return '';
    const n = q.h || 0;
    const all = n >= q.hints.length;
    return `<div class="hints" aria-live="polite">
      ${q.hints.slice(0, n).map((t, i) => `<p class="qhint"><span class="hint-no">${i + 1}</span><span>${t}</span></p>`).join('')}
      <button class="hint-btn ${all ? 'is-give' : ''}" data-hint>${I.bulb}<span>${all ? 'I still don’t know · show the answer' : n ? 'One more hint' : 'Stuck? Get an English hint'}</span><small>${all ? 'counts as wrong' : `${n + 1} / ${q.hints.length}`}</small></button>
    </div>`;
  }
  // answer check for typed questions: the exact form, or the dictionary form of the word
  function typedOk(q, v) {
    const w = qWord(q);
    v = fold(v.trim());
    return v === fold(q.f) || (w && v === fold(w.w));
  }
  // a near-synonym that fits is not wrong: the learner gets another try
  function typedSyn(q, v) {
    const w = qWord(q);
    if (!w || !EX.syn || !EX.syn[w.id]) return null;
    v = fold(v.trim());
    const hit = EX.syn[w.id].find((x) => x[1] !== 'N' && fold(x[0]) === v);
    return hit ? hit[0] : null;
  }
  function fbHtml(q) {
    const w = qWord(q);
    if (q.type === 'p2') {
      const right = q.opts.find((o) => o.ok).t;
      return `<div class="feedback is-plain"><div class="fb-main">
        <span class="fb-title ${q.ok ? 'ok' : 'no'}">${q.ok ? `${I.check}Correct` : `${I.cross}Not quite · best response: ${esc(right)}`}</span>
        <span class="fb-q">“${esc(q.say)}” <button class="mini-spk" data-sayq aria-label="Play again">${I.speaker}</button></span>
        ${w ? `<span class="fb-def"><button data-open="${w.id}" class="fb-word is-sm">${esc(w.w)}</button> ${esc(w.d)}<small lang="zh-Hant">${esc(zhMain(w))}</small></span>` : ''}
      </div></div>`;
    }
    if (q.type === 'pair') {
      return `<div class="feedback is-plain"><div class="fb-main">
        <span class="fb-title ${q.ok ? 'ok' : 'no'}">${q.ok ? `${I.check}Correct` : `${I.cross}Not quite · answer: ${esc(q.f)}`}</span>
        ${q.pair.w.map((t) => { const pw = BY_WORD.get(fold(t)); return `<span class="fb-def"><b class="fb-pw">${pw ? `<button data-open="${pw.id}" class="fb-word is-sm">${esc(t)}</button>` : esc(t)}</b>${esc(q.pair.n[t])}${pw ? `<small lang="zh-Hant">${esc(zhMain(pw))}</small>` : ''}</span>`; }).join('')}
      </div></div>`;
    }
    const x = xw(w);
    const shown = q.f || w.w;
    const wrongLine = q.typed ? `You typed “${esc(q.typed)}” · answer: ${esc(shown)}` : `${q.gaveUp ? 'No problem. ' : ''}Answer: ${esc(shown)}`;
    return `<div class="feedback ${hasArt(w) ? '' : 'no-art'}">
        ${hasArt(w) ? `<button data-open="${w.id}" aria-label="Open ${esc(w.w)}">${art(w)}</button>` : ''}
        <div class="fb-main">
          <span class="fb-title ${q.ok ? 'ok' : 'no'}">${q.ok ? `${I.check}${q.hinted ? 'Correct (with a hint)' : 'Correct'}` : `${I.cross}Not quite · ${wrongLine}`}</span>
          <span><button data-open="${w.id}" class="fb-word">${esc(w.w)}</button> ${kkHtml(w)} <button class="mini-spk" data-word="${w.id}" aria-label="Listen">${I.speaker}</button></span>
          <span class="fb-def">${esc(w.d)}<small lang="zh-Hant">${esc(zhMain(w))}</small></span>
          ${q.type === 'col' ? `<span class="fb-col"><b>${esc(q.phrase)}</b> = ${esc(q.gloss)}</span>` : ''}
          ${!q.ok && x[2] ? `<span class="fb-hook" lang="zh-Hant"><b>Memory hook</b>${x[1] ? `<i>${esc(x[1].replace(/\+/g, ' + '))}</i>` : ''}${esc(x[2])}</span>` : ''}
        </div>
      </div>`;
  }
  // records a first answer for stats, stubborn-word tracking and the day's counters
  function tally(q) {
    const d = today();
    d.q++;
    if (q.ok) d.c++;
    if (q.id && !q.ok) miss(q.id);
    save();
  }
  // shared wiring: choices, typing, hints and replay; host.after(q) runs once the question is answered
  function wireQ(q, host) {
    const done = (ok, extra) => {
      if (q.answered) return;
      Object.assign(q, { answered: true, ok, ...extra });
      const w = qWord(q);
      if (q.type === 'cloze') speak(q.ex.en);
      else if (q.type === 'dict') speak(q.ex.en, q.accent);
      else if (q.type === 'col') speak(q.phrase);
      else if (q.type === 'pair') speak(q.sent.replace('___', q.f));
      else if (q.type === 'p2') speak(`${q.say} ... ${q.opts.find((o) => o.ok).t}`, q.accent);
      else if (w && q.type !== 'hear') playWord(w);
      else if (w && !ok) playWord(w, q.accent);
      sfx(ok ? 'correct' : 'wrong');
      host.after(q);
    };
    hintCtx = { q, paint: host.paint, giveUp: () => done(false, { gaveUp: true, picked: -1, typed: '' }) };
    view.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.o; done(!!q.opts[i].ok, { picked: i }); }));
    const form = $('#q-form');
    if (form) {
      const input = $('#q-in');
      const btn = form.querySelector('button[type="submit"]');
      const sync = () => { btn.disabled = q.answered || !input.value.trim(); };
      sync();
      input.addEventListener('input', sync);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = input.value.trim();
        if (!v || q.answered) return;
        const syn = !typedOk(q, v) && typedSyn(q, v);
        if (syn) { q.synMsg = `“${esc(syn)}” is another word that fits. Type the word we are learning.`; sfx('tap'); host.paint(); settle(); return; }
        done(typedOk(q, v), { typed: v });
      });
      input.addEventListener('keydown', (e) => { if (e.key.length === 1 || e.key === 'Backspace') sfx('key'); });
      if (!q.answered) input.focus({ preventScroll: true });
    }
    view.querySelectorAll('[data-sayq]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); sayQ(q, b.dataset.sayq === 'slow'); }));
    const st = view.querySelector('[data-showtext]');
    if (st) st.addEventListener('click', () => { q.showText = true; q.hinted = true; host.paint(); settle(); });
    if (['hear', 'dict', 'p2'].includes(q.type) && !q.played && !q.answered) { q.played = true; setTimeout(() => { if (hintCtx && hintCtx.q === q) sayQ(q); }, 300); }
    return done;
  }
  let hintCtx = null;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-hint]');
    if (!b || !hintCtx) return;
    e.preventDefault();
    const q = hintCtx.q;
    if (q.answered) return;
    if ((q.h || 0) < q.hints.length) { q.h = (q.h || 0) + 1; q.hinted = true; sfx('flip'); hintCtx.paint(); settle(); }
    else hintCtx.giveUp();
  });
  // number keys pick a choice; Enter moves on once answered
  function choiceKey(e, q, onNext) {
    if (!q) return false;
    if (!q.answered && q.opts && !q.input) {
      const k = e.key.toLowerCase();
      const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
      if (i >= 0 && q.opts[i]) { e.preventDefault(); view.querySelector(`[data-o="${i}"]`)?.click(); return true; }
    } else if (q.answered && e.key === 'Enter' && onNext) { e.preventDefault(); onNext(); return true; }
    return false;
  }

  /* ======================================================
     PRACTICE
     ====================================================== */
  const MODES = [
    { k: 'cloze', part: 'Part 5', zh: 'Sentence gap', desc: 'Choose the word that fits a work sentence. Six different sentences per word.', img: 'data' },
    { k: 'def', part: 'English → Word', zh: 'Meaning', desc: 'Read a simple English meaning and choose the word.', img: 'topic-thinking' },
    { k: 'spell', part: 'Spelling', zh: 'Spelling', desc: 'Read the meaning and the sentence, then type the word.', img: 'typing' },
    { k: 'hear', part: 'Listening', zh: 'Hear a word', desc: 'Listen only and choose its meaning. US, UK and Australian voices.', img: 'listen' },
    { k: 'p2', part: 'Listening · Part 2', zh: 'Part 2 replies', desc: 'Hear a work question and choose the best reply.', img: 'listen' },
    { k: 'dict', part: 'Listening', zh: 'Dictation', desc: 'Hear a sentence and type the missing word.', img: 'typing' },
    { k: 'col', part: 'Collocations', zh: 'Phrases', desc: 'Learn words in groups, like submit a report.', img: 'topic-education' },
    { k: 'pair', part: 'Confusables', zh: 'Confusables', desc: 'affect / effect, principal / principle: choose the right one.', img: 'topic-thinking' },
  ];
  // scope: null until the learner picks one; then learned words are the default once there are enough
  const pracState = { scope: null, mode: null, qs: [], i: 0, results: [] };
  const learnedCount = () => Object.keys(S.cards).length;
  function scopePool(scope) {
    if (scope === 'star') return WORDS.filter((w) => S.stars.includes(w.id));
    if (scope === 'learning') return WORDS.filter((w) => status(w.id) !== 'new');
    if (scope === 'stub') return stubborn().map((id) => BY_ID.get(id));
    if (/^\d+$/.test(scope)) return WORDS.filter((w) => w.lv === +scope);
    return WORDS;
  }
  // the Practice tab always opens the hub; a session in progress is offered as "Resume"
  function viewPractice() {
    const P = pracState;
    const open = P.mode && P.qs.length && P.i < P.qs.length;
    if (P.mode && !open) { P.mode = null; P.qs = []; }
    if (P.scope === 'stub' && !open) P.scope = null;
    if (!P.scope) P.scope = learnedCount() >= 10 ? 'learning' : 'all';
    const pool = scopePool(P.scope);
    const stub = stubborn();
    view.innerHTML = `<div class="wrap">
      <header class="page-head">
        <span class="eyebrow">Practice · questions and hints in English</span>
        <h1>Think of the meaning in English first.</h1>
        <p class="sub">Every question needs the meaning. If you are stuck, open the English hints one by one. Chinese appears only after you answer.</p>
      </header>
      ${open ? `<div class="notice is-resume"><b>Resume session?</b><span>${P.mode === 'mix' ? 'Hard words' : (MODES.find((m) => m.k === P.mode) || {}).zh} · question ${P.i + 1} of ${P.qs.length}</span><span class="row-btns"><button class="btn small" id="resume">Resume ${I.arrow}</button><button class="btn ghost small" id="discard">Start over</button></span></div>` : ''}
      <div class="drill-row">
        <button class="drill-card ${stub.length ? '' : 'is-empty'}" id="go-stub" ${stub.length ? '' : 'disabled'}>
          <span class="eyebrow">Hard words</span>
          <b class="num">${stub.length}</b>
          <span>${stub.length ? 'Words you missed on 3 different days. Get one right 3 times in a row to finish it.' : `No hard words now. ${S.tamed ? `You have finished ${S.tamed}.` : 'Words you miss on 3 different days come here.'}`}</span>
        </button>
        <button class="drill-card" id="go-pair">
          <span class="eyebrow">Confusable pairs</span>
          <b class="num">${EX.pairs.length}</b>
          <span>affect / effect, principal / principle, rise / raise… choose the right one.</span>
        </button>
      </div>
      <section class="section">
        <div class="section-head"><h2>Question types</h2><span class="more">10 questions a round · first answers count</span></div>
        <div style="display:grid;gap:12px">
          <span class="eyebrow">Words to use</span>
          <div class="chips">
            ${[['all', 'All 1,000'], ...LEVELS.map((l) => [String(l.lv), `${l.lv} ${l.name}`]), ['learning', 'Learned'], ['star', 'Saved']].map(([v, t]) => `<button class="chip" data-scope="${v}" aria-pressed="${pracState.scope === v}">${t}</button>`).join('')}
          </div>
          <p style="font-size:13px;color:var(--ink-3)">Words in this set: <b class="num">${pool.length}</b>${pool.length < 4 ? '. You need at least 4.' : '.'} Listening voices: ${S.set.mix === 'mix' ? 'US, UK and Australian in turn' : ACC[S.set.mix]} (change in Me → Settings).</p>
        </div>
        <div class="modes">
          ${MODES.map((m) => `<button class="mode" data-mode="${m.k}" ${pool.length < 4 && !['p2', 'pair'].includes(m.k) ? 'disabled' : ''}><img src="assets/brand/${m.img}.webp" alt="" width="480" height="480" loading="lazy"><span class="mode-txt"><span class="m-part">${m.part}</span><h3>${m.zh}</h3><p>${m.desc}</p></span></button>`).join('')}
        </div>
      </section>
      ${sprintMap()}
      ${storyFeature() || `<section class="section">
        <div class="section-head"><h2>Story</h2><a class="more" href="#story">All chapters →</a></div>
        <a class="card panel story-link" href="#story"><b>${esc(STORY.series.title)}</b><span>Read the story, then check with a Part 6 quiz.</span></a>
      </section>`}
      ${S.notes.length ? `<section class="section">
        <div class="section-head"><h2>My sentences</h2><span class="more">${S.notes.length} sentences</span></div>
        <div class="notes" data-list>${S.notes.slice(-12).reverse().map((n) => { const w = BY_ID.get(n.id); return `<div class="note"><button class="note-w" data-open="${w.id}">${esc(w.w)}</button><p>${esc(n.t)}</p><span>${esc(n.at)}</span></div>`; }).join('')}</div>
      </section>` : ''}
    </div>`;
    listContext = S.notes.slice(-12).reverse().map((n) => n.id);
    view.querySelectorAll('[data-scope]').forEach((b) => b.addEventListener('click', () => { pracState.scope = b.dataset.scope; viewPractice(); }));
    view.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => startQuiz(b.dataset.mode)));
    view.querySelectorAll('[data-passn]').forEach((b) => b.addEventListener('click', () => { S.set.passN = +b.dataset.passn; save(); viewPractice(); }));
    $('#go-stub').addEventListener('click', startDrill);
    const rs = $('#resume');
    if (rs) { rs.addEventListener('click', () => { paintQuiz(); window.scrollTo(0, 0); }); $('#discard').addEventListener('click', () => { P.mode = null; P.qs = []; viewPractice(); }); }
    $('#go-pair').addEventListener('click', () => startQuiz('pair'));
  }
  function startDrill() {
    if (!stubborn().length) { toast('No hard words now.'); return; }
    pracState.scope = 'stub';
    startQuiz('mix');
    if (route.name !== 'practice') go('practice');
  }
  function startQuiz(mode) {
    const pool = scopePool(pracState.scope);
    const P = pracState;
    let qs = [];
    if (mode === 'p2') {
      const ids = new Set(pool.map((w) => w.id));
      const near = EX.part2.filter((x) => ids.has(x[0]));
      qs = shuffle(near.length >= 10 ? near : EX.part2).slice(0, 10).map((it, n) => makeP2(it, n));
    } else if (mode === 'pair') {
      qs = shuffle(EX.pairs.flatMap((p) => p.s.map((s) => [p, s]))).slice(0, 10).map(([p, s]) => makePair(p, s));
    } else {
      if (pool.length < (mode === 'mix' ? 1 : 4)) return;
      const voiced = pool.filter((w) => w.u);
      const src = mode === 'hear' && voiced.length >= 10 ? voiced : pool;
      const picks = mode === 'mix' ? shuffle(pool).slice(0, Math.min(12, Math.max(pool.length, 6))) : shuffle(src).slice(0, 10);
      while (mode === 'mix' && picks.length < 6) picks.push(pool[picks.length % pool.length]);
      const mixT = ['def', 'cloze', 'spell', 'col', 'word2def', 'hear'];
      qs = picks.map((w, n) => makeQ(mode === 'mix' ? mixT[(n + hash(w.w)) % mixT.length] : mode, w, pool, n));
    }
    Object.assign(P, { mode, qs, i: 0, results: [], streak: 0 });
    paintQuiz();
    window.scrollTo(0, 0);
  }
  function paintQuiz() {
    const P = pracState;
    if (P.i >= P.qs.length) return paintResult();
    const q = P.qs[P.i];
    const w = qWord(q);
    const pct = ((P.i + (q.answered ? 1 : 0)) / P.qs.length) * 100;
    view.innerHTML = `<div class="wrap ${q.answered ? 'has-dock' : ''}"><div class="quiz">
      <div class="learn-top">
        <button class="icon-btn" id="q-exit" aria-label="End practice" title="End practice">${I.close}</button>
        <div class="meter"><i style="width:${pct}%"></i></div>
        <span class="count num">Question ${P.i + 1} of ${P.qs.length}</span>
      </div>
      <article class="q-card">
        <div class="flash-head"><span class="eyebrow">${P.mode === 'mix' ? 'Hard words · ' : ''}${QLABEL[q.type]}</span>${w ? lvBadge(w.lv) : ''}</div>
        ${qPrompt(q)}
        ${qChoices(q)}
        ${hintHtml(q)}
      </article>
      ${q.answered ? `${fbHtml(q)}${q.tamed ? `<p class="tamed">${esc(w.w)}: right 3 times in a row. It is no longer a hard word!</p>` : ''}` : ''}
      ${!q.answered && q.opts && !q.input ? `<p class="kbd-hint">Keys <kbd>1</kbd>–<kbd>${q.opts.length}</kbd> to answer</p>` : ''}
    </div></div>
    ${q.answered ? dock(`${verdict(q)}<button class="btn" id="q-next">${P.i === P.qs.length - 1 ? 'See results' : 'Next'} ${I.arrow}</button>`) : ''}`;
    loadFull(view);
    $('#q-exit').addEventListener('click', () => { P.mode = null; P.qs = []; if (P.scope === 'stub') P.scope = null; viewPractice(); });
    wireQ(q, {
      paint: paintQuiz,
      after: (qq) => {
        P.results.push({ id: qq.id, ok: qq.ok, q: qq });
        tally(qq);
        if (P.mode === 'mix') { if (qq.ok) { if (drillHit(qq.id)) qq.tamed = true; } save(); }
        P.streak = qq.ok ? (P.streak || 0) + 1 : 0;
        if (qq.ok && P.streak % 3 === 0) setTimeout(() => sfx('streak'), 280);
        paintQuiz();
        settle();
        if (qq.ok) burstFrom($('.opt.ok') || $('.spell'), 22, 0.7);
      },
    });
    const nx = $('#q-next');
    if (nx) { nx.addEventListener('click', nextQ); nx.focus({ preventScroll: true }); }
  }
  function nextQ() { pracState.i++; vt('card', paintQuiz); }
  function paintResult() {
    const P = pracState;
    const right = P.results.filter((r) => r.ok).length;
    const wrongIds = [...new Set(P.results.filter((r) => !r.ok && r.id).map((r) => r.id))];
    const wrong = wrongIds.map((id) => BY_ID.get(id)).filter(Boolean);
    const chose = (id) => {
      const r = P.results.find((x) => x.id === id && !x.ok);
      if (!r || !r.q) return '';
      const q = r.q;
      if (q.gaveUp) return 'You chose: show the answer';
      if (q.typed) return `You typed: “${esc(q.typed)}”`;
      if (q.opts && q.picked >= 0) return `You chose: “${esc(q.opts[q.picked].t.length > 60 ? q.opts[q.picked].t.slice(0, 58) + '…' : q.opts[q.picked].t)}”`;
      return '';
    };
    sfx('complete');
    if (right / P.results.length >= 0.8) setTimeout(() => burst(innerWidth / 2, innerHeight * 0.35, 70, 1.4), 120);
    const score = Math.round((right / P.results.length) * 100);
    const mode = MODES.find((m) => m.k === P.mode) || { part: 'Stubborn words', zh: 'Hard words' };
    const msg = score === 100 ? 'All correct. You know these words well.' : score >= 80 ? 'Good job. Look at the missed ones again.' : score >= 50 ? 'More than half correct. Missed words come back in reviews.' : 'Study these word cards first, then try again.';
    view.innerHTML = `<div class="wrap"><div class="quiz">
      <div class="done">
        <img src="assets/brand/${score >= 80 ? 'done' : 'night'}.webp" alt="" width="480" height="480">
        <div class="done-body">
          <span class="eyebrow">${mode.part} · ${mode.zh}</span>
          <span class="score num">${right}<small style="font-size:28px;color:var(--ink-3)"> / ${P.results.length}</small></span>
          <h2>${msg}</h2>
          <div class="row-btns">
            <button class="btn" id="again">Another round ${I.arrow}</button>
            <button class="btn ghost" id="other">Other type</button>
          </div>
        </div>
      </div>
      ${wrong.length ? `<div class="result-list" data-list>
        <span class="eyebrow">Missed words</span>
        ${wrong.map((w) => `<button class="result-row ${hasArt(w) ? '' : 'no-art'}" data-open="${w.id}">${hasArt(w) ? art(w) : ''}<b>${esc(w.w)}</b><span>${esc(shortDef(w, 70))}<small class="you-chose">${chose(w.id)}</small></span></button>`).join('')}
        <button class="btn ghost small" id="star-wrong" style="justify-self:start">${I.star}Save the missed words</button>
      </div>` : ''}
    </div></div>`;
    listContext = wrong.map((w) => w.id);
    $('#again').addEventListener('click', () => { if (P.mode === 'mix') startDrill(); else startQuiz(P.mode); });
    $('#other').addEventListener('click', () => { P.mode = null; P.qs = []; if (P.scope === 'stub') P.scope = null; viewPractice(); });
    const sw = $('#star-wrong');
    if (sw) sw.addEventListener('click', () => { wrong.forEach((w) => { if (!S.stars.includes(w.id)) S.stars.push(w.id); }); save(); toast(`Saved ${wrong.length} words`); sw.disabled = true; });
  }
  document.addEventListener('keydown', (e) => {
    if (route.name !== 'practice' || !pracState.mode || $('.overlay') || e.target.matches('input, textarea')) return;
    const q = pracState.qs[pracState.i];
    if (q && document.activeElement?.id !== 'q-next') choiceKey(e, q, nextQ);
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
      <span class="ex-tag is-story">${I.book}Story · chapter ${h.no}</span>
      <span class="story-cue-en">${sent}</span>
      <span class="story-cue-go">Back to chapter ${h.no} ${I.arrow}</span>
    </button>`;
  }
  function storyFeature() {
    if (!CH.length) return '';
    const ch = nextChapter() || CH[CH.length - 1];
    const prev = chapterOf(ch.no - 1);
    const n = learnedIn(ch);
    return `<section class="section">
      <div class="section-head"><h2>Story</h2><a class="more" href="#story">All chapters →</a></div>
      <a class="tale-feature" href="#story-${ch.no}">
        ${art(ch.cover, { full: true })}
        <div class="tale-feature-body">
          <span class="eyebrow mono">${esc(STORY.series.title)} · CHAPTER ${pad(ch.no)}</span>
          <h3>${esc(ch.title)}</h3>
          <p>${esc(prev ? prev.nextEn || prev.next : STORY.series.blurbEn || STORY.series.blurb)}</p>
          <div class="tale-feature-foot"><span>${ch.words.length} words · ${n} learned</span><span class="btn small">${S.story.read[ch.no] ? 'Read again' : n ? 'Keep reading' : 'Read first'} ${I.arrow}</span></div>
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
        <span class="eyebrow">Story · 400 level · first five chapters</span>
        <h1>${esc(STORY.series.title)}</h1>
        <p class="sub">${esc(STORY.series.blurbEn || STORY.series.blurb)}</p>
      </header>
      <div class="tale-how">
        <div><b>1</b><span><strong>Read</strong>Each chapter hides 9–10 words from the 400 level. Tap a word to open its card.</span></div>
        <div><b>2</b><span><strong>Learn</strong>New words follow the chapters, so today you learn the words of the next chapter.</span></div>
        <div><b>3</b><span><strong>Story quiz</strong>Put the words back into the story, like TOEIC Part 6.</span></div>
      </div>
      <section class="section">
        <div class="section-head"><h2>Chapters</h2><span class="more">${learned} / ${total} story words learned</span></div>
        <div class="tale-list">
          ${CH.map((c) => {
            const n = learnedIn(c);
            const best = S.story.best[c.no];
            return `<a class="tale-row" href="#story-${c.no}">
              ${art(c.cover)}
              <div class="tale-row-body">
                <span class="eyebrow mono">CHAPTER ${pad(c.no)} · ${esc(c.genreEn || c.genre)}</span>
                <b>${esc(c.title)}</b>
                <div class="meter"><i class="m-mastered" style="width:${(n / c.words.length) * 100}%"></i></div>
              </div>
              <div class="tale-row-state">
                ${S.story.read[c.no] ? '<span class="badge plain lv-600">Read</span>' : c === nextChapter() ? '<span class="badge plain lv-800">Next chapter</span>' : ''}
                ${best != null ? `<span class="num">Quiz ${best}/${c.words.length}</span>` : `<span class="num">${n}/${c.words.length} words</span>`}
              </div>
            </a>`;
          }).join('')}
          <div class="tale-row is-soon">
            <div class="art tale-soon-art">${I.book}</div>
            <div class="tale-row-body">
              <span class="eyebrow mono">CHAPTER 06 · 600 CLIMB</span>
              <b>Why is the destination field empty?</b>
              <span class="tale-row-en">To be continued</span>
            </div>
            <div class="tale-row-state"><span class="badge plain">Coming soon</span></div>
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
      <p class="st-zh" lang="zh-Hant">${zh}</p>
      <div class="st-tools"><button class="mini-spk" data-say="${say}" aria-label="Read this part">${I.speaker}</button><button class="st-tr" aria-label="Show Chinese for this part">中</button></div>
    </div>`;
  }
  function paintChapter(ch) {
    const next = chapterOf(ch.no + 1);
    const todo = ch.words.filter((id) => status(id) !== 'mastered').length;
    const showZh = false; // reading stays in English; a paragraph's Chinese opens only on its own 譯 button
    listContext = ch.words.slice();
    view.innerHTML = `<div class="wrap tale">
      <div class="tale-bar">
        <a class="icon-btn" href="#story" aria-label="All chapters">${I.left}</a>
        <span class="eyebrow">${esc(STORY.series.title)} · chapter ${ch.no} / ${CH.length}</span>
        <span class="tale-bar-tools">
          <button class="btn ghost small" id="tale-read">${I.speaker}<span>Read it all</span></button>
        </span>
      </div>
      <header class="tale-head">
        ${art(ch.cover, { full: true })}
        <div class="tale-head-txt">
          <span class="eyebrow mono">CHAPTER ${pad(ch.no)} · ${esc(ch.genreEn || ch.genre)}</span>
          <h1>${esc(ch.title)}</h1>
        </div>
      </header>
      <div class="tale-words" data-list>
        <span class="block-label">Words in this chapter · tap to open</span>
        <div class="tale-chips">${ch.words.map((id) => { const w = BY_ID.get(id); return `<button class="tale-chip st-${status(id)}" data-open="${id}"><b>${esc(w.w)}</b><span>${esc(shortDef(w, 34))}</span></button>`; }).join('')}</div>
      </div>
      <article class="tale-body ${showZh ? 'show-zh' : ''}" data-list>
        ${ch.blocks.map(blockHtml).join('')}
        <p class="tale-end">— End of chapter ${ch.no} —</p>
      </article>
      <aside class="tale-next">
        <span class="eyebrow">${next ? 'Next time' : 'To be continued'}</span>
        <p>${esc(ch.nextEn || ch.next)}</p>
      </aside>
      <div class="tale-actions">
        <button class="btn" id="tale-cloze">Story quiz · Part 6 ${I.arrow}</button>
        ${todo ? `<button class="btn ghost" id="tale-learn">Learn ${todo} words</button>` : '<span class="tale-done">All words mastered ✓</span>'}
        ${next ? `<a class="btn ghost" href="#story-${next.no}">Chapter ${next.no} ${I.right}</a>` : ''}
      </div>
    </div>`;
    loadFull(view);
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
    if (!('speechSynthesis' in window)) { toast('This browser cannot read text aloud. Please use Chrome, Edge or Safari.'); return; }
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
    session = { queue: ids.map((id) => (S.cards[id] ? { id, k: 'q' } : { id, k: 'intro' })), step: 0, later: 0, tally: { forgot: 0, ok: 0, easy: 0 }, q: null, n: 0, story: ch.no };
    saveSession();
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
  // plain (unmarked) uses of any answer word in the passage
  function clozeFormsRe(blanks) {
    const forms = blanks.flatMap((b) => b.forms || []).sort((a, b) => b.length - a.length).map((f) => f.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'));
    return forms.length ? new RegExp(`\\b(?:${forms.join('|')})\\b`, 'gi') : /$^/;
  }
  // the sentence that holds a gap, with its markup kept so it can be drawn the same way
  function clozeSentence(ch, id) {
    for (const b of ch.blocks) {
      for (const line of blockLinesRaw(b)) {
        if (!line.includes(`[[${id}:`)) continue;
        const parts = line.replace(/([.!?]["”]?)\s+(?=["“]?[A-Z])/g, '$1\u0001').split('\u0001');
        return parts.find((x) => x.includes(`[[${id}:`)) || line;
      }
    }
    return '';
  }
  const blockLinesRaw = (b) => (b.k === 'sms' ? b.en.split('\n').map((l) => l.split('|')[1]) : b.k === 'doc' ? b.en.split('\n') : [b.en]);
  function startCloze(ch) {
    const seen = new Set();
    const blanks = [];
    ch.blocks.forEach((b) => { for (const m of b.en.matchAll(MARK_RE)) { const id = +m[1]; if (!seen.has(id)) { seen.add(id); blanks.push({ id, f: m[2] }); } } });
    const lv = BY_ID.get(ch.words[0]).lv;
    for (const q of blanks) {
      const w = BY_ID.get(q.id);
      const kind = blankKind(q.f, w.w.toLowerCase());
      const mates = shuffle(ch.words.filter((id) => id !== q.id).map((id) => BY_ID.get(id)).filter((x) => posOf(x) === posOf(w) && !confusable(w, x))).slice(0, 1);
      const more = distractors(w, 8, WORDS.filter((x) => x.lv === lv && !ch.words.includes(x.id)));
      const used = new Set([fold(q.f)]);
      const opts = [{ id: w.id, t: q.f.toLowerCase() }];
      for (const d of [...mates, ...more]) {
        if (opts.length === 4) break;
        const t = applyForm(d.w, kind, false).toLowerCase();
        if (used.has(fold(t))) continue;
        used.add(fold(t));
        opts.push({ id: d.id, t });
      }
      q.opts = shuffle(opts);
    }
    for (const q of blanks) { const b = BY_ID.get(q.id).w.toLowerCase(); q.forms = [...new Set([b, inflS(b), inflEd(b), inflIng(b), q.f.toLowerCase()])]; }
    storyState.cloze = { no: ch.no, blanks, i: 0, answered: false, right: 0 };
    paintCloze(ch);
  }
  function paintCloze(ch) {
    const C = storyState.cloze;
    if (C.i >= C.blanks.length) return paintClozeResult(ch);
    const q = C.blanks[C.i];
    const order = new Map(C.blanks.map((b, k) => [b.id, k]));
    const done = new Set();
    const gap = (k, f, first) => {
      const b = C.blanks[k];
      if (k < C.i || (k === C.i && C.answered)) return `<span class="cz-blank is-filled ${b.ok ? 'ok' : 'no'}">${esc(f)}</span>`;
      const cur = k === C.i;
      return `<span class="cz-blank ${cur ? 'is-cur' : ''}" ${cur && first ? 'id="cz-cur"' : ''}>(${k + 1})</span>`;
    };
    const plainRe = clozeFormsRe(C.blanks);
    const plain = (t) => esc(t).replace(plainRe, (m) => {
      const k = C.blanks.findIndex((b) => b.forms.includes(m.toLowerCase()));
      return k < 0 ? m : gap(k, m, false);
    });
    const inline = (t) => t.split(/(\[\[\d+:[^\]]+\]\])/).map((part) => {
      const mm = /^\[\[(\d+):([^\]]+)\]\]$/.exec(part);
      if (!mm) return plain(part);
      const id = +mm[1];
      const k = order.get(id);
      if (k == null) return esc(mm[2]);
      const first = !done.has(id);
      done.add(id);
      return gap(k, mm[2], first);
    }).join('');
    const passage = ch.blocks.map((b) => {
      if (b.k === 'sms') return `<div class="st-sms">${b.en.split('\n').map((l) => { const [who, txt] = l.split('|'); return `<div class="bubble ${who === 'Jun' ? 'is-me' : ''}"><small>${esc(who)}</small><span>${inline(txt)}</span></div>`; }).join('')}</div>`;
      if (b.k === 'doc') return `<div class="st-paper">${b.en.split('\n').map((l, j) => (l ? `<div class="${j === 0 ? 'st-paper-head' : ''}">${inline(l)}</div>` : '<div class="gap"></div>')).join('')}</div>`;
      return `<p class="st-en">${inline(b.en)}</p>`;
    }).join('');
    const w = BY_ID.get(q.id);
    const line = clozeSentence(ch, q.id);
    view.innerHTML = `<div class="wrap tale cz">
      <div class="learn-top">
        <button class="icon-btn" id="cz-exit" aria-label="End quiz">${I.close}</button>
        <div class="meter"><i style="width:${((C.i + (C.answered ? 1 : 0)) / C.blanks.length) * 100}%"></i></div>
        <span class="count num">Gap ${C.i + 1} of ${C.blanks.length}</span>
      </div>
      <article class="tale-body cz-passage">
        <span class="eyebrow mono">PART 6 · CHAPTER ${pad(ch.no)}</span>
        ${passage}
      </article>
      <div class="cz-panel q-card">
        <div class="flash-head"><span class="eyebrow">Which word goes in gap (${C.i + 1})?</span>${lvBadge(w.lv)}</div>
        ${line ? `<p class="cz-sent">${inline(line)}</p>` : ''}
        <div class="opts">${q.opts.map((o, k) => {
          let cls = '';
          if (C.answered) { if (o.id === q.id) cls = 'ok'; else if (o.id === q.picked) cls = 'no'; }
          return `<button class="opt ${cls}" data-o="${k}" ${C.answered ? 'disabled' : ''}><span class="k">${'ABCD'[k]}</span><span class="t en">${esc(o.t)}</span></button>`;
        }).join('')}</div>
        ${C.answered ? `<div class="cz-fb">
          <span class="fb-title ${q.ok ? 'ok' : 'no'}">${q.ok ? `${I.check}Correct` : `${I.cross}Not quite · answer: ${esc(q.f.toLowerCase())}`}</span>
          <span><button data-open="${w.id}" class="cz-word">${esc(w.w)}</button> ${kkHtml(w)} · ${esc(w.d)} <small lang="zh-Hant">${esc(zhMain(w))}</small></span>
          <button class="btn" id="cz-next">${C.i === C.blanks.length - 1 ? 'See results' : 'Next gap'} ${I.arrow}</button>
        </div>` : '<p class="kbd-hint">Keys <kbd>1</kbd>–<kbd>4</kbd> or <kbd>A</kbd>–<kbd>D</kbd> to answer</p>'}
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
    settle();
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
    const msg = C.right === n ? 'All correct. These words now live in the story for you.' : C.right / n >= 0.7 ? 'Most are right. Read the missed words in the story again.' : 'Read the chapter again, watch the marked words, then try again.';
    view.innerHTML = `<div class="wrap"><div class="quiz">
      <div class="done">
        <img src="assets/brand/${C.right / n >= 0.8 ? 'done' : 'night'}.webp" alt="" width="480" height="480">
        <div class="done-body">
          <span class="eyebrow">Story quiz · chapter ${ch.no}</span>
          <span class="score num">${C.right}<small style="font-size:28px;color:var(--ink-3)"> / ${n}</small></span>
          <h2>${msg}</h2>
          <div class="row-btns">
            ${C.right / n < 0.6
              ? `<button class="btn" data-story="${ch.no}">Read the chapter again ${I.arrow}</button><button class="btn ghost" id="cz-again">Try again</button>${next ? `<a class="btn ghost" href="#story-${next.no}">Chapter ${next.no}</a>` : ''}`
              : `${next ? `<a class="btn" href="#story-${next.no}">Read chapter ${next.no} ${I.arrow}</a>` : `<a class="btn" href="#story">All chapters ${I.arrow}</a>`}<button class="btn ghost" id="cz-again">Try again</button><button class="btn ghost" data-story="${ch.no}">Read again</button>`}
          </div>
        </div>
      </div>
      ${wrong.length ? `<div class="result-list" data-list>
        <span class="eyebrow">Missed words</span>
        ${wrong.map((w) => `<button class="result-row" data-open="${w.id}">${art(w)}<b>${esc(w.w)}</b><span>${esc(shortDef(w, 70))}</span></button>`).join('')}
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
      <div class="section-head"><h2>Sprint levels</h2><span class="more">${passed} / ${L.length} passed · ★ ${stars} / ${L.length * 3}</span></div>
      <div class="sp-how">
        <div><b>1</b><span><strong>See & say</strong>Read the meaning, example and phrase, then say them aloud.</span></div>
        <div><b>2</b><span><strong>Recall</strong>Sentence gaps, meanings, listening and phrases. Missed words go back in the pile.</span></div>
        <div><b>3</b><span><strong>Use it</strong>Write your own sentence with the 3 hardest words.</span></div>
      </div>
      <div class="sp-rule">
        <span>Each word needs</span>
        <div class="seg">${[2, 3, 6].map((n) => `<button data-passn="${n}" aria-pressed="${S.set.passN === n}">${n} in a row</button>`).join('')}</div>
        <span>to pass · we suggest 3</span>
      </div>
      <div class="sp-grid">
        ${L.map((x) => {
          const r = S.sprint[x.no];
          if (!sprintOpen(x.no)) return `<span class="sp-tile lv-${x.lv} is-locked" aria-label="Level ${x.no} is locked"><b>${pad(x.no)}</b><i>${x.lv}</i></span>`;
          return `<a class="sp-tile lv-${x.lv} ${r ? 'is-done' : ''} ${nx && nx.no === x.no ? 'is-next' : ''}" href="#sprint-${x.no}" aria-label="Level ${x.no}${r ? `, ${r.stars} stars` : ''}"><b>${pad(x.no)}</b><i>${x.lv}</i><span class="sp-stars">${r ? starStr(r.stars) : nx && nx.no === x.no ? 'Go' : '☆☆☆'}</span></a>`;
        }).join('')}
      </div>
    </section>`;
  }

  let sprint = null;
  let spTick = null;
  function viewSprint() {
    const no = route.sub;
    const L = sprints()[no - 1];
    if (!L || !sprintOpen(no)) { toast('Finish the level before this one to open it.'); go('practice'); return; }
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
          if (i >= 0 && q.opts && q.opts[i] && !q.input) { e.preventDefault(); view.querySelector(`[data-o="${i}"]`)?.click(); }
        } else if (q && q.answered && e.key === 'Enter' && document.activeElement?.id !== 'sp-next') { e.preventDefault(); spNextQ(); }
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
        <a class="icon-btn" href="#practice" aria-label="Leave this level">${I.close}</a>
        <div class="meter" role="progressbar" aria-valuenow="${Math.round((done / total) * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${(done / total) * 100}%"></i></div>
        <span class="count num">${label}</span>
        <span class="sp-clock num ${over ? 'is-over' : ''}" id="sp-clock" aria-label="Time left">${spClock()}</span>
      </div>
      <ol class="sp-steps">${['See & say', 'Recall', 'Use it'].map((t, k) => `<li class="${['see', 'recall', 'make'].indexOf(sprint.stage) === k ? 'is-on' : ['see', 'recall', 'make'].indexOf(sprint.stage) > k ? 'is-past' : ''}"><b>${k + 1}</b>${t}</li>`).join('')}</ol>`;
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
        <h1>Level ${pad(P.no)}</h1>
        <p>${words.length} words · ${SPRINT_MIN} minutes · English clues only · ${S.set.passN} in a row each${best ? ` · best ${starStr(best.stars)}` : ''}</p>
        <div class="sp-faces">${words.map((w) => art(w)).join('')}</div>
        <ul class="sp-stars-how">
          <li><b>★</b>Finish all three steps</li>
          <li><b>★★</b>80% right on the first try</li>
          <li><b>★★★</b>Finish in ${SPRINT_MIN} minutes and write all 3 sentences</li>
        </ul>
        <button class="btn" id="sp-go">Start the clock ${I.arrow}</button>
      </div>
    </div></div>`;
    $('#sp-go').addEventListener('click', () => {
      preloadFull(P.ids);
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
      ${spTop(`Word ${P.i + 1} of ${P.ids.length}`, P.i, P.ids.length)}
      <article class="flash sp-see ${hasArt(w) ? '' : 'no-art'}">
        ${hasArt(w) ? art(w, { full: true }) : ''}
        <div class="flash-body">
          <div class="flash-head"><div style="display:flex;gap:8px">${lvBadge(w.lv)}<span class="badge plain">${TP[w.t].en}</span></div><span class="badge plain">${POS_EN[posOf(w)] || posOf(w)}</span></div>
          <div class="flash-word">${esc(w.w)}</div>
          ${pron(w)}
          <p class="def-line"><span class="def-tag">EN</span>${esc(w.d)}</p>
          <div class="example"><p class="en-line">${markSentence(ex)} <button class="mini-spk" data-say="${esc(ex.en)}" aria-label="Read the example">${I.speaker}</button></p></div>
          ${xw(w)[1] ? `<div class="word-parts"><span class="roots">${rootsHtml(xw(w)[1])}</span></div>` : ''}
        </div>
      </article>
      <div class="sp-actions">
        ${SR ? `<button class="btn ghost" id="sp-mic">${I.listen}<span>Check my speaking</span></button>` : ''}
        <button class="btn" id="sp-said">I said it ${I.arrow}</button>
      </div>
      <p class="kbd-hint">Say the word aloud, then the example.<kbd>Enter</kbd> Next</p>
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
    try { r = new SR(); } catch (e) { toast('This browser cannot recognize speech.'); return; }
    spRec = r;
    r.lang = S.set.accent === 'uk' ? 'en-GB' : 'en-US';
    r.maxAlternatives = 5;
    r.interimResults = false;
    const label = btn.querySelector('span');
    btn.classList.add('is-on');
    label.textContent = 'Say the word…';
    const target = fold(w.w);
    const stem = target.length > 5 ? target.slice(0, -2) : target;
    r.onresult = (e) => {
      const alts = Array.from(e.results[0]).map((a) => fold(a.transcript));
      const ok = alts.some((t) => t.includes(target) || t.split(/\s+/).some((x) => x.startsWith(stem)));
      btn.classList.remove('is-on');
      if (ok) { label.textContent = 'Heard it ✓'; btn.classList.add('is-ok'); sprint.voice++; sfx('correct'); burstFrom(btn, 18, 0.6); }
      else { label.textContent = `Heard "${alts[0] || '…'}". Try again.`; sfx('wrong'); }
    };
    r.onerror = (e) => { btn.classList.remove('is-on'); label.textContent = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'Microphone is blocked' : 'Didn’t hear you. Try again.'; };
    r.onend = () => { btn.classList.remove('is-on'); if (spRec === r) spRec = null; };
    try { r.start(); } catch (e) { label.textContent = 'Check my speaking'; btn.classList.remove('is-on'); }
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
    // the first question for a word never repeats what the see-card just showed (its meaning line)
    const types = card.seen ? ['cloze', 'def', 'hear', 'col', 'word2def'] : ['cloze', 'hear', 'col'];
    const type = types[(card.seen + hash(w.w)) % types.length];
    const group = sprint.ids.map((id) => BY_ID.get(id));
    return makeQ(type, w, group, sprint.qn = (sprint.qn || 0) + 1);
  }
  function spRecall() {
    const P = sprint;
    if (!P.queue.length && !(P.q && P.q.answered)) { P.stage = 'make'; return spMake(); }
    if (!P.q) { P.qcard = P.queue[0]; P.q = spMakeQ(P.qcard); }
    const q = P.q;
    const card = P.qcard;
    const need = S.set.passN;
    const prog = P.cleared * need + P.queue.reduce((a, c) => a + Math.min(c.streak, need), 0);
    view.innerHTML = `<div class="wrap"><div class="quiz sp">
      ${spTop(`${prog} / ${P.ids.length * need} correct`, prog, P.ids.length * need)}
      <article class="q-card">
        <div class="flash-head"><span class="eyebrow">${QLABEL[q.type]}</span><span class="sp-dots" aria-label="${card.streak} in a row for this word">${Array.from({ length: need }, (_, k) => `<i class="${k < card.streak ? 'on' : ''}"></i>`).join('')}</span></div>
        ${qPrompt(q)}
        ${qChoices(q)}
        ${hintHtml(q)}
      </article>
      <p class="sp-count">${P.queue.length} ${P.queue.length === 1 ? 'word' : 'words'} still in the pile · each word needs ${need} right in a row</p>
      ${q.answered && !q.ok ? fbHtml(q) : ''}
      ${P.combo >= 3 ? `<div class="sp-combo" aria-live="polite">Combo ×${P.combo}</div>` : ''}
    </div></div>
    ${q.answered && !q.ok ? dock(`${verdict(q)}<span class="dock-note">This word comes back a few questions later.</span><button class="btn" id="sp-next">Got it ${I.arrow}</button>`) : ''}`;
    loadFull(view); // before focus(), which forces a style pass and would make the plate fade in again
    wireQ(q, { paint: spRecall, after: () => spAnswer() });
    const nx = $('#sp-next');
    if (nx) { nx.addEventListener('click', spNextQ); nx.focus({ preventScroll: true }); }
  }
  function spAnswer() {
    const P = sprint;
    const q = P.q;
    if (!q || !q.answered || q.counted) return;
    q.counted = true;
    const card = P.queue.shift();
    card.seen++;
    if (!(q.id in P.first)) P.first[q.id] = q.ok;
    tally(q);
    const need = S.set.passN;
    if (q.ok) {
      card.streak++;
      P.combo++;
      P.bestCombo = Math.max(P.bestCombo, P.combo);
      if (card.streak >= need) P.cleared++;
      else P.queue.splice(Math.min(P.queue.length, 3 + card.streak * 3), 0, card); // space the next look out a little more each time
      if (P.combo % 5 === 0) sfx('streak');
    } else {
      card.streak = 0;
      P.combo = 0;
      P.wrong[q.id] = (P.wrong[q.id] || 0) + 1;
      P.queue.splice(Math.min(P.queue.length, REQUEUE_GAP), 0, card); // back into the deck, a few questions later
    }
    spRecall();
    settle();
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
      ${spTop(`Sentence ${P.mi + 1} of 3`, P.mi, 3)}
      <article class="q-card sp-make">
        <div class="sp-make-head">${hasArt(w) ? art(w) : ''}<div><div class="flash-word">${esc(w.w)}</div><p class="def-line"><span class="def-tag">${POS_EN[posOf(w)] || posOf(w)}</span>${esc(w.d)}</p></div></div>
        <p class="sp-make-hint">Write a sentence with <b>${esc(w.w)}</b> about your life: your job, school or yesterday. At least 5 words; you can change the form (like ${esc(applyForm(w.w, posOf(w) === 'v.' ? 'ed' : posOf(w) === 'n.' ? 's' : '', false))}).</p>
        <form id="sp-form" class="sp-form" autocomplete="off">
          <label class="sr-only" for="sp-in">Your sentence</label>
          <textarea id="sp-in" rows="3" spellcheck="true" placeholder="I ..." ${shown ? 'disabled' : ''}>${shown ? esc(shown) : ''}</textarea>
          ${shown ? '' : '<div class="row-btns"><button class="btn" type="submit">Done</button><button class="btn ghost" type="button" id="sp-skip">Skip</button></div>'}
        </form>
        <p class="sp-make-msg" id="sp-msg" aria-live="polite"></p>
        ${shown ? `<div class="example"><span class="ex-tag is-toeic">Example</span><p class="en-line">${markSentence(toeicEx(w))}</p></div><button class="btn" id="sp-mnext" style="justify-self:end">${P.mi === 2 ? 'See results' : 'Next'} ${I.arrow}</button>` : ''}
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
      if (!has) { msg.textContent = `Your sentence does not use ${w.w} yet.`; sfx('wrong'); return; }
      if (t.split(' ').length < 5) { msg.textContent = 'Write a little more: at least 5 words.'; sfx('wrong'); return; }
      P.made.push(w.id);
      S.notes.push({ id: w.id, t, at: ymd() });
      save();
      P.shown = t;
      sfx('correct');
      spMake();
      settle();
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
        <div class="sp-stamp lv-${P.lv}"><span class="eyebrow mono">LEVEL ${pad(P.no)}</span><b>${starStr(P.stars)}</b><span>${P.stars === 3 ? 'Perfect' : P.stars === 2 ? 'Great' : 'Passed'}</span></div>
        <div class="done-body">
          <span class="eyebrow">Level ${pad(P.no)} done${P.isBest ? ' · new best' : ''}</span>
          <div class="sp-stats">
            <div><b class="num">${Math.floor(P.ms / MIN)}:${pad(Math.floor((P.ms % MIN) / 1000))}</b><span>time / ${SPRINT_MIN}:00</span></div>
            <div><b class="num">${Math.round(P.acc * 100)}%</b><span>first-try accuracy</span></div>
            <div><b class="num">${P.bestCombo}</b><span>best combo</span></div>
            <div><b class="num">${P.made.length}</b><span>your sentences</span></div>
          </div>
          <p style="color:var(--ink-2)">These 20 words are now in your reviews. Missed ones come back tomorrow; look at them again in the bedtime recap tonight.</p>
          <div class="row-btns">
            ${next && sprintOpen(next.no) ? `<a class="btn" href="#sprint-${next.no}">Next level ${I.arrow}</a>` : `<a class="btn" href="#practice">All levels ${I.arrow}</a>`}
            <button class="btn ghost" id="sp-again">Try again</button>
          </div>
        </div>
      </div>
      ${hard.length ? `<div class="result-list" data-list><span class="eyebrow">Missed on the first try</span>${hard.map((w) => `<button class="result-row" data-open="${w.id}">${art(w)}<b>${esc(w.w)}</b><span>${esc(w.d)}</span></button>`).join('')}</div>` : ''}
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
      { k: 'review', t: 'Morning review', done: due === 0, sub: due ? `${due} due · about ${Math.max(1, Math.round(due * 0.3))} min` : d.r ? `${d.r} reviews ✓` : 'Nothing due today ✓', href: '#learn', go: 'Review' },
      { k: 'sprint', t: 'One sprint', done: (d.sp || 0) > 0, sub: (d.sp || 0) > 0 ? `${d.sp} passed today ✓` : nx ? `Level ${nx.no} · 20 words · ${SPRINT_MIN} min` : 'All 50 levels done', href: nx ? `#sprint-${nx.no}` : '#practice', go: 'Go' },
      { k: 'recap', t: 'Bedtime recap', done: !!d.recap, sub: d.recap ? 'Done ✓' : tw ? `Today’s ${tw} words · about 3 min` : 'Opens after you learn new words', href: '#recap', go: 'Recap', off: !tw && !d.recap },
    ];
  }
  function rewardLine() {
    const steps = rhythm();
    if (!steps.every((x) => x.done) || !S.set.reward) return '';
    return `<p class="reward-line">All three steps done. Enjoy your "${esc(S.set.reward)}".</p>`;
  }
  function rhythmCard() {
    const steps = rhythm();
    const n = steps.filter((x) => x.done).length;
    const h = new Date().getHours();
    return `<section class="section">
      <div class="section-head"><h2>Today’s rhythm</h2><span class="more">${n} / 3 done</span></div>
      <div class="rhythm">
        <div class="meter rhythm-meter"><i class="m-mastered" style="width:${(n / 3) * 100}%"></i></div>
        ${steps.map((x, k) => `<a class="rh-step ${x.done ? 'is-done' : ''} ${x.off ? 'is-off' : ''} ${!x.done && !x.off && ((x.k === 'recap' && h >= 20) || (x.k !== 'recap' && steps.slice(0, k).every((y) => y.done))) ? 'is-now' : ''}" href="${x.off ? '#today' : x.href}">
          <span class="rh-no">${x.done ? '✓' : k + 1}</span>
          <span class="rh-txt"><b>${x.t}</b><span>${x.sub}</span></span>
          ${x.done || x.off ? '' : `<span class="rh-go">${x.go} ${I.arrow}</span>`}
        </a>`).join('')}
        <label class="reward"><span>My reward after three steps:</span><input id="reward-in" maxlength="24" placeholder="a bubble tea, a TV show…" value="${esc(S.set.reward)}"></label>
        ${n === 3 ? `<p class="reward-line">${S.set.reward ? `All three steps done. Enjoy your "${esc(S.set.reward)}".` : 'All three steps done. Sleep will help you keep today’s words.'}</p>` : '<p class="rh-note">Review yesterday’s words in the morning and today’s at bedtime. Sleep helps you remember.</p>'}
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
  function rcShow() { recap.shown = true; sfx('flip'); paintRecap(); settle(); playWord(BY_ID.get(recap.ids[recap.i])); }
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
      view.innerHTML = `<div class="wrap"><div class="learn"><div class="done"><img src="assets/brand/night.webp" alt="" width="480" height="480"><div class="done-body"><span class="eyebrow">Bedtime recap</span><h2>No new words yet today.</h2><p style="color:var(--ink-2)">Learn some words first, then come back before bed.</p><div class="row-btns"><a class="btn" href="#practice">Practice ${I.arrow}</a></div></div></div></div></div>`;
      return;
    }
    if (R.i >= R.ids.length) {
      if (!R.done) { R.done = true; today().recap = true; save(); sfx('complete'); }
      view.innerHTML = `<div class="wrap"><div class="learn"><div class="done">
        <img src="assets/brand/night.webp" alt="" width="480" height="480">
        <div class="done-body">
          <span class="eyebrow">Recap done</span>
          <h2>Good night. Let sleep do the rest.</h2>
          <p style="color:var(--ink-2)">${R.ids.length} words${R.unsure.length ? `. ${R.unsure.length} unsure ones are saved, so you can practice just those tomorrow` : ', and you remembered every one'}.</p>
          ${rewardLine()}
          <div class="row-btns"><a class="btn" href="#today">Back to Today ${I.arrow}</a></div>
        </div></div></div></div>`;
      return;
    }
    const w = BY_ID.get(R.ids[R.i]);
    view.innerHTML = `<div class="wrap"><div class="learn">
      <div class="learn-top">
        <a class="icon-btn" href="#today" aria-label="Leave">${I.close}</a>
        <div class="meter"><i style="width:${(R.i / R.ids.length) * 100}%"></i></div>
        <span class="count num">Word ${R.i + 1} of ${R.ids.length}</span>
      </div>
      <article class="flash rc-card ${hasArt(w) ? '' : 'no-art'}">
        ${hasArt(w) ? art(w, { full: true }) : ''}
        <div class="flash-body">
          <span class="eyebrow">Bedtime recap · which word is it?</span>
          <p class="def-line is-big"><span class="def-tag">${POS_EN[posOf(w)] || posOf(w)}</span>${esc(w.d)}</p>
          ${R.shown ? `<div class="flash-back"><div class="flash-word">${esc(w.w)}</div>${pron(w)}<p class="en-line rc-sent">${markSentence(dailyEx(w))}</p></div>` : ''}
        </div>
      </article>
      ${R.shown
        ? `<div class="rates rc-rates"><button class="rate r1" id="rc-no">Not sure<small>save it</small></button><button class="rate r4" id="rc-yes">Remembered<small>Next</small></button></div><p class="kbd-hint"><kbd>1</kbd> Not sure　<kbd>2</kbd> Remembered</p>`
        : `<button class="btn reveal-btn" id="rc-show">Show answer</button><p class="kbd-hint"><kbd>Space</kbd> Show answer</p>`}
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
        <span class="eyebrow">Star map · 4 levels · 15 topics</span>
        <h1>Every word you learn lights a star.</h1>
        <p class="sub">The four rings from the center out are the 400, 600, 800 and 990 levels. Each of the 14 arms is a work topic; Core words, the 15th topic, are spread across the whole map. Learning words light up; mastered words shine gold.</p>
      </header>
      <div class="chips" style="margin-bottom:16px" role="group" aria-label="Level">
        <button class="chip" data-mlv="0" aria-pressed="${mapState.lv === 0}">All levels</button>
        ${LEVELS.map((l) => `<button class="chip lv-${l.lv}" data-mlv="${l.lv}" aria-pressed="${mapState.lv === l.lv}"><span class="dot"></span>${l.lv} ${l.name}</button>`).join('')}
      </div>
      <div class="map-wrap" id="map-wrap" role="img" aria-label="Star map: ${all.learning + all.mastered} learned, ${all.mastered} mastered">
        <canvas id="map"></canvas>
        <div class="map-legend"><span><i style="background:rgba(214,220,240,.5)"></i>New</span><span><i style="background:rgb(240,196,100);box-shadow:0 0 6px rgb(240,196,100)"></i>Learning</span><span><i style="background:#fff8e8;box-shadow:0 0 8px #ffe0a0"></i>Mastered</span></div>
        <div class="gx-hint" id="gx-hint"><span class="gx-hint-long">Drag to turn · scroll or pinch to zoom · tap a star to open it · double-click to reset</span><span class="gx-hint-short">Drag · pinch · tap a star</span></div>
      </div>
      <section class="section">
        <div class="map-stats">
          ${LEVELS.map((l) => { const c = counts(WORDS.filter((w) => w.lv === l.lv)); return `<div class="map-stat lv-${l.lv}"><b class="num">${c.learning + c.mastered}<small style="font-size:14px;color:var(--ink-3)"> / ${c.total}</small></b><span>${l.lv} ${l.name} · ${c.mastered} mastered</span></div>`; }).join('')}
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
      tip.innerHTML = `${art(w)}<span><b>${esc(w.w)}</b>${esc(shortDef(w, 40))} · ${w.lv}</span>`;
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
     WORKPLACE — emails, Teams chats and meeting invites; interview prep; job-ad checker
     ====================================================== */
  const DOC_KIND = { email: 'Email', teams: 'Teams', invite: 'Invite' };
  // texts in the order they are drawn: invite header values first, then the body
  const docTexts = (doc) => [...(doc.k === 'invite' ? doc.h.map((x) => x[1]) : []), ...doc.b.map((x) => x[1])];
  const docWords = (doc) => [...docTexts(doc).join(' ').matchAll(MARK_RE)].map((m) => +m[1]);
  function viewWork() {
    view.innerHTML = `<div class="wrap">
      <header class="page-head">
        <span class="eyebrow">Work · use your words at an international company</span>
        <h1>Use English at real work.</h1>
        <p class="sub">Fill in emails, Teams chats and invites; get ready for interviews; check how many words of a job ad you know.</p>
      </header>
      <div class="work-tiles">
        <a class="work-tile" href="#interview"><span class="eyebrow">Job interviews</span><b>Self-introductions and 12 common questions</b><span>Answers use your words. Listen and repeat to practice speaking.</span></a>
        <a class="work-tile" href="#jd"><span class="eyebrow">Job ad checker</span><b>Paste a job ad and see what you know</b><span>Add the new words to your learning in one tap.</span></a>
      </div>
      <section class="section">
        <div class="section-head"><h2>Work documents</h2><span class="more">${EX.docs.length} documents · choose the best word for each gap</span></div>
        <div class="doc-list">${EX.docs.map((doc, i) => {
          const ids = docWords(doc);
          const known = ids.filter((id) => S.cards[id]).length;
          const best = S.docs[i + 1];
          return `<a class="doc-tile is-${doc.k}" href="#docs-${i + 1}"><span class="doc-kind">${DOC_KIND[doc.k]}</span><b>${esc(doc.t)}</b><span>${ids.length} gaps · you know ${known}${best != null ? ` · best ${best}/${ids.length}` : ''}</span></a>`;
        }).join('')}</div>
      </section>
    </div>`;
  }
  /* one document at a time: tap a blank, choose a word; feedback right away */
  let docState = null;
  function viewDocs() {
    const no = route.sub;
    const doc = EX.docs[no - 1];
    if (!doc) { go('work'); return; }
    if (!docState || docState.no !== no) {
      const blanks = [];
      docTexts(doc).forEach((t) => { for (const m of t.matchAll(MARK_RE)) blanks.push({ id: +m[1], f: m[2] }); });
      blanks.forEach((b) => {
        const w = BY_ID.get(b.id);
        const kind = kindOf(b.f, w.w);
        const cap = /^[A-Z]/.test(b.f);
        b.opts = shuffle([{ t: b.f, ok: true }, ...distractors(w, 3, WORDS.filter((x) => x.lv <= w.lv + 200)).map((d) => ({ t: applyForm(d.w, kind, cap) }))]);
      });
      docState = { no, blanks, cur: 0 };
    }
    paintDoc();
  }
  function paintDoc() {
    const D = docState;
    const doc = EX.docs[D.no - 1];
    let k = 0;
    const fill = (t) => esc(t).replace(MARK_RE, () => {
      const b = D.blanks[k];
      const i = k++;
      const st = b.picked == null ? '' : b.ok ? 'ok' : 'no';
      return `<button class="doc-blank ${st} ${i === D.cur && b.picked == null ? 'is-cur' : ''}" data-b="${i}">${b.picked == null ? `<span>${i + 1}</span>` : esc(b.f)}</button>`;
    });
    const head = doc.k === 'email'
      ? `<div class="doc-meta">${doc.h.map((h) => `<div>${esc(h)}</div>`).join('')}</div>`
      : doc.k === 'invite' ? `<div class="doc-meta is-invite">${doc.h.map(([a, b]) => `<div><i>${esc(a)}</i>${fill(b)}</div>`).join('')}</div>` : '';
    const body = doc.k === 'teams'
      ? `<div class="st-sms doc-chat">${doc.b.map(([who, t]) => `<div class="bubble ${who === doc.b[0][0] ? '' : 'is-me'}"><small>${esc(who)}</small><span>${fill(t)}</span></div>`).join('')}</div>`
      : doc.b.map(([, t]) => `<p>${t.split('\n').map(fill).join('<br>')}</p>`).join('');
    const b = D.blanks[D.cur];
    const all = D.blanks.every((x) => x.picked != null);
    const right = D.blanks.filter((x) => x.ok).length;
    view.innerHTML = `<div class="wrap"><div class="quiz doc-wrap">
      <div class="learn-top"><a class="icon-btn" href="#work" aria-label="Back to Work">${I.left}</a><div class="meter"><i style="width:${(D.blanks.filter((x) => x.picked != null).length / D.blanks.length) * 100}%"></i></div><span class="count num">${D.blanks.filter((x) => x.picked != null).length} of ${D.blanks.length} filled</span></div>
      <article class="doc is-${doc.k}">
        <div class="doc-top"><span class="doc-kind">${DOC_KIND[doc.k]}</span><b>${esc(doc.t)}</b></div>
        ${head}
        <div class="doc-body">${body}</div>
      </article>
      ${all ? `<div class="done doc-done"><div class="done-body"><span class="eyebrow">Done</span><span class="score num">${right}<small style="font-size:28px;color:var(--ink-3)"> / ${D.blanks.length}</small></span>
          <div class="result-list" data-list>${D.blanks.map((x) => { const w = BY_ID.get(x.id); return `<button class="result-row ${x.ok ? '' : 'is-no'}" data-open="${w.id}">${art(w)}<b>${esc(w.w)}</b><span>${esc(shortDef(w, 60))}<small lang="zh-Hant">${esc(w.s[0][1])}</small></span></button>`; }).join('')}</div>
          <div class="row-btns">${EX.docs[D.no] ? `<a class="btn" href="#docs-${D.no + 1}">Next ${I.arrow}</a>` : ''}<button class="btn ghost" id="doc-again">Try again</button><a class="btn ghost" href="#work">All documents</a></div></div></div>`
        : `<div class="q-card doc-pick"><span class="eyebrow">Gap ${D.cur + 1} · choose the best word</span>${b.picked == null
          ? `<div class="opts">${b.opts.map((o, i) => `<button class="opt" data-dp="${i}"><span class="k">${'ABCD'[i]}</span><span class="t en">${esc(o.t)}</span></button>`).join('')}</div>`
          : `${fbHtml({ type: 'cloze', id: b.id, f: b.f, ok: b.ok, answered: true, ex: { en: '' } })}<button class="btn" id="doc-next" style="justify-self:end">Next gap ${I.arrow}</button>`}</div>`}
    </div></div>`;
    listContext = D.blanks.map((x) => x.id);
    view.querySelectorAll('[data-b]').forEach((el) => el.addEventListener('click', () => { D.cur = +el.dataset.b; paintDoc(); }));
    view.querySelectorAll('[data-dp]').forEach((el) => el.addEventListener('click', () => {
      const o = b.opts[+el.dataset.dp];
      b.picked = +el.dataset.dp; b.ok = !!o.ok;
      const d = today(); d.q++; if (b.ok) d.c++; if (!b.ok) miss(b.id);
      sfx(b.ok ? 'correct' : 'wrong');
      playWord(BY_ID.get(b.id));
      if (D.blanks.every((x) => x.picked != null)) { S.docs[D.no] = Math.max(S.docs[D.no] || 0, D.blanks.filter((x) => x.ok).length); sfx('complete'); }
      save();
      paintDoc();
    }));
    const nx = $('#doc-next');
    if (nx) { nx.addEventListener('click', () => { const n = D.blanks.findIndex((x) => x.picked == null); D.cur = n; paintDoc(); }); nx.focus({ preventScroll: true }); }
    const ag = $('#doc-again');
    if (ag) ag.addEventListener('click', () => { docState = null; viewDocs(); });
  }

  /* ---------- speaking: listen, repeat, see what the browser heard (for reference only) ---------- */
  function shadow(text, btn, out) {
    if (!SR) { out.innerHTML = '<p class="sh-res">This browser cannot recognize speech. Try Chrome or Edge on a computer or Android.</p>'; return; }
    if (spRec) { try { spRec.abort(); } catch (e) { /* ignore */ } spRec = null; }
    let r;
    try { r = new SR(); } catch (e) { toast('This browser cannot recognize speech.'); return; }
    spRec = r;
    r.lang = LANG[S.set.accent] || 'en-US';
    r.interimResults = false;
    r.maxAlternatives = 1;
    btn.classList.add('is-on');
    const label = btn.querySelector('span');
    const was = label ? label.textContent : '';
    if (label) label.textContent = 'Say it now…';
    const want = fold(text).replace(/[^a-z' ]+/g, ' ').split(/\s+/).filter(Boolean);
    r.onresult = (e) => {
      const said = e.results[0][0].transcript;
      const got = new Set(fold(said).replace(/[^a-z' ]+/g, ' ').split(/\s+/).filter(Boolean));
      const hit = want.filter((x) => got.has(x)).length;
      const pct = want.length ? Math.round((hit / want.length) * 100) : 0;
      out.innerHTML = `<p class="sh-res"><b>The browser heard:</b>${esc(said)}</p><p class="sh-words">${text.split(/\s+/).map((t) => `<span class="${got.has(fold(t).replace(/[^a-z']/g, '')) ? 'is-hit' : ''}">${esc(t)}</span>`).join(' ')}</p><p class="sh-score">${pct}% of the words match · only a guide; accents and noise affect it.</p>`;
      sfx(pct >= 70 ? 'correct' : 'tap');
    };
    r.onerror = (e) => { out.innerHTML = `<p class="sh-res">${e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'Please allow the microphone.' : 'Didn’t hear you. Try again.'}</p>`; };
    r.onend = () => { btn.classList.remove('is-on'); if (label) label.textContent = was; if (spRec === r) spRec = null; };
    try { r.start(); } catch (e) { btn.classList.remove('is-on'); if (label) label.textContent = was; }
  }
  // any [data-shadow] button repeats the text in data-text and writes the result under it
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-shadow]');
    if (!b) return;
    e.preventDefault();
    const box = b.closest('[data-sh-box]');
    const out = box ? box.querySelector('.sh-out') : null;
    if (out) shadow(b.dataset.shadow, b, out);
  });
  const shadowBtns = (text) => `<span class="sh-tools"><button class="btn ghost small" data-say="${esc(text)}">${I.speaker}<span>Listen</span></button>${SR ? `<button class="btn ghost small" data-shadow="${esc(text)}">${I.mic}<span>Repeat</span></button>` : ''}</span>`;

  /* ---------- interview ---------- */
  const ivState = { tab: 'intro', tpl: 'fresh' };
  const IV_FIELDS = { name: 'Your name', school: 'School', major: 'Major', 'old job': 'Job title', 'old company': 'Company', 'new field': 'New field', 'current job': 'Job title', company: 'Company', amount: 'NT$ 40,000–45,000 a month' };
  function ivFill(t) {
    return t.replace(/\{([a-z ]+)\}/g, (m, k) => (S.ivf[k] ? S.ivf[k] : `[${IV_FIELDS[k] || k}]`));
  }
  const ivPlain = (t) => ivFill(t).replace(MARK_RE, '$2');
  const ivHtml = (t) => esc(ivFill(t)).replace(MARK_RE, (m, id, f) => `<button class="tw st-${status(+id)}" data-open="${id}">${f}</button>`).replace(/\[([^\]]+)\]/g, '<i class="iv-ph">[$1]</i>');
  function viewInterview() {
    const T = EX.iv.intro.find((x) => x.k === ivState.tpl) || EX.iv.intro[0];
    const fields = [...new Set(T.p.flatMap(([en]) => [...en.matchAll(/\{([a-z ]+)\}/g)].map((m) => m[1])))];
    view.innerHTML = `<div class="wrap iv">
      <header class="page-head">
        <span class="eyebrow">Job interviews</span>
        <h1>Tell your story with your words.</h1>
        <p class="sub">Marked words are from this site; tap to open them. Listen, then repeat; the result is only a guide. Open the Chinese under each part if you need it.</p>
      </header>
      <div class="seg iv-tabs" role="tablist">${[['intro', 'Self-introduction'], ['qa', 'Common questions']].map(([v, t]) => `<button data-ivtab="${v}" aria-pressed="${ivState.tab === v}">${t}</button>`).join('')}</div>
      ${ivState.tab === 'intro' ? `
        <div class="chips">${EX.iv.intro.map((x) => `<button class="chip" data-tpl="${x.k}" aria-pressed="${x.k === T.k}">${esc(x.t)}</button>`).join('')}</div>
        <form class="iv-fields" autocomplete="off">${fields.map((f) => `<label><span>${esc(IV_FIELDS[f] || f)}</span><input data-ivf="${esc(f)}" value="${esc(S.ivf[f] || '')}" placeholder="${esc(IV_FIELDS[f] || f)}"></label>`).join('')}</form>
        <article class="card panel iv-card" data-list>
          ${T.p.map(([en, zh]) => `<div class="iv-p" data-sh-box><p class="iv-en">${ivHtml(en)}</p>${shadowBtns(ivPlain(en))}<div class="sh-out"></div><details class="iv-zh" lang="zh-Hant"><summary>中文</summary><p>${esc(ivFill(zh))}</p></details></div>`).join('')}
        </article>`
      : `<div class="iv-qa" data-list>${EX.iv.qa.map((x, i) => `<article class="card panel iv-q" data-sh-box>
          <span class="eyebrow">Q${i + 1}</span>
          <h3 class="iv-question">${esc(x.q)} <button class="mini-spk" data-say="${esc(x.q)}" aria-label="Listen to the question">${I.speaker}</button></h3>
          <p class="iv-en">${ivHtml(x.a)}</p>
          ${shadowBtns(ivPlain(x.a))}
          <div class="sh-out"></div>
          <details class="iv-zh" lang="zh-Hant"><summary>中文 · tip</summary><p>${esc(ivFill(x.zh))}</p><p class="iv-tip">${esc(x.tip || '')}</p></details>
        </article>`).join('')}</div>`}
    </div>`;
    listContext = [...view.querySelectorAll('[data-open]')].map((b) => +b.dataset.open);
    view.querySelectorAll('[data-ivtab]').forEach((b) => b.addEventListener('click', () => { ivState.tab = b.dataset.ivtab; viewInterview(); }));
    view.querySelectorAll('[data-tpl]').forEach((b) => b.addEventListener('click', () => { ivState.tpl = b.dataset.tpl; viewInterview(); }));
    view.querySelectorAll('[data-ivf]').forEach((inp) => inp.addEventListener('change', () => { S.ivf[inp.dataset.ivf] = inp.value.trim().slice(0, 60); save(); viewInterview(); }));
  }

  /* ---------- job-ad checker ---------- */
  let FORMS = null;
  function formMap() {
    if (FORMS) return FORMS;
    FORMS = { one: new Map(), multi: [] };
    for (const w of WORDS) {
      const b = w.w.toLowerCase();
      if (/[\s-]/.test(b)) { FORMS.multi.push([b, w.id]); continue; }
      for (const f of [b, inflS(b), inflEd(b), inflIng(b)]) if (!FORMS.one.has(f)) FORMS.one.set(f, w.id);
    }
    return FORMS;
  }
  const JD_SAMPLE = `Marketing Coordinator (Taipei office)
We are a multinational consumer brand looking for an enthusiastic coordinator to support our regional marketing team.
Responsibilities:
- Coordinate product launches and promotional campaigns with internal teams and external vendors
- Track the budget, prepare weekly reports and analyze sales data
- Update the customer database and respond to inquiries from clients
- Assist with trade shows, events and press releases
Requirements:
- Bachelor's degree in marketing, business or a relevant field
- 1–2 years of experience; fresh graduates are welcome to apply
- Strong communication skills in English and Mandarin
- Able to prioritize tasks and meet tight deadlines in a flexible, fast-paced environment
We offer competitive compensation, annual leave, health insurance and a clear career path.`;
  const jdState = { text: '', msg: '', full: false };
  function analyzeJD(text) {
    const F = formMap();
    const found = new Map();
    const low = text.toLowerCase();
    for (const [m, id] of F.multi) if (low.includes(m)) found.set(id, (found.get(id) || 0) + 1);
    const parts = text.split(/([A-Za-z][A-Za-z'’-]*)/);
    const html = parts.map((p, i) => {
      if (i % 2 === 0) return esc(p);
      const key = p.toLowerCase().replace(/[’']s$/, '');
      let id = F.one.get(key);
      if (!id && key.includes('-')) id = F.one.get(key.split('-')[0]);
      if (!id) return esc(p);
      found.set(id, (found.get(id) || 0) + 1);
      const st = status(id);
      return `<button class="jd-w ${st === 'new' ? 'is-new' : 'is-known'}" data-open="${id}">${esc(p)}</button>`;
    }).join('');
    const ids = [...found.keys()];
    return { html, ids, known: ids.filter((id) => status(id) !== 'new'), unknown: ids.filter((id) => status(id) === 'new' && !S.queue.includes(id)), queued: ids.filter((id) => status(id) === 'new' && S.queue.includes(id)) };
  }
  function viewJD() {
    const t = jdState.text;
    const R = t.trim() ? analyzeJD(t) : null;
    view.innerHTML = `<div class="wrap jd">
      <header class="page-head">
        <span class="eyebrow">Job ad checker</span>
        <h1>How many words of this job ad do you know?</h1>
        <p class="sub">Paste an English job description. Words you know are green; new ones are orange and can be added to your learning. Nothing is uploaded.</p>
      </header>
      <div class="card panel jd-input">
        <label class="sr-only" for="jd-text">Job description</label>
        <textarea id="jd-text" rows="9" placeholder="Paste a job description here…">${esc(t)}</textarea>
        ${jdState.msg ? `<p class="jd-msg" role="alert">${esc(jdState.msg)}</p>` : ''}
        <div class="row-btns"><button class="btn" id="jd-go">Check ${I.arrow}</button><button class="btn ghost" id="jd-sample">Use an example</button>${t ? '<button class="btn ghost" id="jd-clear">Clear</button>' : ''}</div>
      </div>
      ${R ? `<section class="section jd-out">
        <div class="jd-kpis">
          <div><b class="num">${R.ids.length}</b><span>TOEIC words found</span></div>
          <div class="is-known"><b class="num">${R.known.length}</b><span>already learned</span></div>
          <div class="is-new"><b class="num">${R.unknown.length + R.queued.length}</b><span>still new</span></div>
        </div>
        ${R.unknown.length ? `<div class="jd-add"><div class="chips" data-list>${R.unknown.map((id) => `<button class="chip" data-open="${id}">${esc(BY_ID.get(id).w)}</button>`).join('')}</div><button class="btn" id="jd-add">Learn these ${R.unknown.length} words ${I.arrow}</button></div>`
          : R.queued.length ? `<p class="jd-note">The ${R.queued.length} new words from this ad are first in your new words.</p>` : R.ids.length ? '<p class="jd-note">You have learned every TOEIC word in this ad. Great!</p>' : '<p class="jd-note is-empty">No TOEIC words found in this text. Try a longer English job description.</p>'}
        ${R.ids.length ? `<article class="card panel jd-text ${jdState.full || t.length < 700 ? '' : 'is-short'}" data-list><span class="eyebrow">Your text with the words marked</span><div class="jd-body">${R.html.replace(/\n/g, '<br>')}</div></article>
        ${t.length >= 700 ? `<button class="btn ghost small" id="jd-more">${jdState.full ? 'Show less' : 'Show the whole text'}</button>` : ''}` : ''}
      </section>` : ''}
    </div>`;
    listContext = R ? R.ids : [];
    const ta = $('#jd-text');
    $('#jd-go').addEventListener('click', () => {
      const v = ta.value.slice(0, 20000);
      if (!v.trim()) { jdState.msg = 'Paste some text first.'; jdState.text = ''; viewJD(); $('#jd-text').focus(); return; }
      Object.assign(jdState, { text: v, msg: '', full: false });
      viewJD();
    });
    const more = $('#jd-more');
    if (more) more.addEventListener('click', () => { jdState.full = !jdState.full; viewJD(); });
    $('#jd-sample').addEventListener('click', () => { Object.assign(jdState, { text: JD_SAMPLE, msg: '', full: false }); viewJD(); });
    const cl = $('#jd-clear');
    if (cl) cl.addEventListener('click', () => { Object.assign(jdState, { text: '', msg: '', full: false }); viewJD(); });
    const add = $('#jd-add');
    if (add) add.addEventListener('click', () => {
      const ids = R.unknown;
      S.queue = [...ids, ...S.queue.filter((id) => !ids.includes(id))];
      const d = today(); d.plan = (d.plan || []).filter((id) => S.cards[id]);
      save(); plan();
      sfx('ignite');
      toast(`Added ${ids.length} words. They come first in your new words (${S.set.goal} a day).`);
      viewJD();
    });
  }

  /* ======================================================
     ME
     ====================================================== */
  function viewMe() {
    const all = counts();
    const days = Object.values(S.days);
    const totalQ = days.reduce((a, d) => a + d.q, 0);
    const totalC = days.reduce((a, d) => a + d.c, 0);
    const cells = [];
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - end.getDay() - 7 * 17);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = ymd(d);
      const r = S.days[k];
      cells.push({ k, v: r ? r.n + r.r + r.q : 0, fix: S.fix.includes(k) });
    }
    const lvl = (v) => (v === 0 ? '' : v < 10 ? 'h1' : v < 30 ? 'h2' : 'h3');
    const ret = (b) => (S.ret[b][1] ? `${Math.round((S.ret[b][0] / S.ret[b][1]) * 100)}%` : '—');
    const sc = estScore();
    const showScore = sc != null;
    view.innerHTML = `<div class="wrap">
      <header class="page-head">
        <span class="eyebrow">Me · progress and settings</span>
        <h1>See your progress.</h1>
        <p class="sub">Your progress lives only in this browser. No sign-up. Export a backup before you change devices or clear your browser.</p>
      </header>
      <div class="me-grid">
        <div style="display:grid;gap:20px">
          <section class="card panel">
            <div class="score-est">
              <div><span class="eyebrow">Estimated TOEIC score (vocabulary)</span><b class="num ${showScore ? '' : 'is-empty'}">${showScore ? `${Math.max(10, sc - 50)}–${Math.min(990, sc + 50)}` : 'Take the level check first'}</b><span class="hint">${showScore ? 'Based on your words and the level check. Words only, a rough guide.' : 'We need the 3-minute level check, or at least 20 learned words, to estimate a score.'}</span></div>
              <a class="btn ${S.place && !S.place.skipped ? 'ghost' : ''} small" href="#place">${S.place && !S.place.skipped ? 'Retake the level check' : 'Take the 3-minute level check'} ${I.arrow}</a>
            </div>
            <div class="kpis">
              <div class="kpi"><b class="num">${all.learning + all.mastered}</b><span>Words learned</span></div>
              <div class="kpi"><b class="num">${all.mastered}</b><span>Words mastered</span></div>
              <div class="kpi"><b class="num">${ret(7)}</b><span>Remembered after 7 days<small>${S.ret[7][1]} checks</small></span></div>
              <div class="kpi"><b class="num">${ret(30)}</b><span>Remembered after 30 days<small>${S.ret[30][1]} checks</small></span></div>
            </div>
            <p class="hint">How often you get a word right the first time when you see it again about 7 days (5–12) or 30 days (21–45) later.</p>
            <div class="kpis is-three">
              <div class="kpi"><b class="num">${streak()}</b><span>Days in a row</span></div>
              <div class="kpi"><b class="num">${S.freeze}</b><span>Streak savers<small>1 for every 7 days, up to 2</small></span></div>
              <div class="kpi"><b class="num">${totalQ ? Math.round((totalC / totalQ) * 100) + '%' : '—'}</b><span>Accuracy</span></div>
            </div>
            <div>
              <div class="heat-months" aria-hidden="true">${cells.filter((c, i) => i % 7 === 0).map((c, i, arr) => { const m = +c.k.slice(5, 7); const prev = i ? +arr[i - 1].k.slice(5, 7) : 0; return `<span>${m !== prev ? MON[m - 1] : ''}</span>`; }).join('')}</div>
              <div class="heat" aria-label="Last 18 weeks">${cells.map((c) => `<i class="${c.fix ? 'is-fix' : lvl(c.v)}" title="${c.k}：${c.fix ? 'Streak savers' : c.v}"></i>`).join('')}</div>
              <div class="heat-foot"><span>18 weeks ago</span><span>less <i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--paper-2)"></i> <i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--ochre)"></i> more</span><span>Today</span></div>
            </div>
          </section>
          <section class="card panel">
            <div class="section-head" style="margin:0"><h2>Four levels</h2><a class="more" href="#map">Star map →</a></div>
            <div class="lv-rows">
              ${LEVELS.map((l) => { const c = counts(WORDS.filter((w) => w.lv === l.lv)); return `<button class="lv-row lv-${l.lv}" data-leg="${l.lv}"><b>${l.lv}</b><div class="meter"><i class="m-mastered" style="width:${(c.mastered / c.total) * 100}%"></i><i class="m-learning" style="width:${(c.learning / c.total) * 100}%"></i></div><span>${c.mastered} mastered · ${c.learning} learning</span></button>`; }).join('')}
            </div>
          </section>
          <section class="card panel">
            <h2>15 work topics</h2>
            <div class="topics is-compact">
              ${TOPICS.map((t) => { const list = WORDS.filter((w) => w.t === t.k); const c = counts(list); return `<button class="topic" data-topic="${t.k}">${art(coverIdx(t.k))}<span class="topic-txt"><b>${t.zh}</b><span class="num">${c.learning + c.mastered}/${list.length}</span></span></button>`; }).join('')}
            </div>
            <div class="row-btns"><a class="btn ghost small" href="#map">${I.map}<span>Star map</span></a><a class="btn ghost small" href="#story">${I.book}<span>Story</span></a></div>
          </section>
        </div>
        <section class="card panel">
          <h2>Settings</h2>
          <div class="setting"><span class="lab">New words a day</span><div class="chips">${[5, 10, 15, 20, 30].map((n) => `<button class="chip" data-goal="${n}" aria-pressed="${S.set.goal === n}">${n}${n === 10 ? ' (suggested)' : ''}</button>`).join('')}</div><span class="hint">10 is good to start: about 5–10 minutes.</span></div>
          <div class="setting"><span class="lab">Most reviews a day</span><div class="chips">${[20, 30, 50, 100].map((n) => `<button class="chip" data-cap="${n}" aria-pressed="${S.set.cap === n}">${n}</button>`).join('')}</div><span class="hint">When more words are due, the most important come first and the rest wait. Missing a few days will not bury you.</span></div>
          <div class="setting"><span class="lab">Start new words at</span><div class="chips">${LEVELS.map((l) => `<button class="chip lv-${l.lv}" data-start="${l.lv}" aria-pressed="${S.set.start === l.lv}"><span class="dot"></span>${l.lv} ${l.name}</button>`).join('')}</div><span class="hint">The next level follows when this one is done.</span></div>
          <div class="setting"><span class="lab">Listening voices</span><div class="seg">${[['mix', 'Mix'], ['us', 'US'], ['uk', 'UK'], ['au', 'Australian']].map(([v, t]) => `<button data-mix="${v}" aria-pressed="${S.set.mix === v}">${t}</button>`).join('')}</div><span class="hint">TOEIC uses US, UK, Canadian and Australian voices. US and UK words are real recordings; Australian voices and sentences use your device voice.</span></div>
          <div class="setting"><span class="lab">Word card voice</span><div class="seg">${[['us', 'US'], ['uk', 'UK'], ['au', 'Australian']].map(([v, t]) => `<button data-accent-set="${v}" aria-pressed="${S.set.accent === v}">${t}</button>`).join('')}</div></div>
          <div class="setting"><label for="rate">Reading speed <span class="num" id="rate-v">${S.set.rate.toFixed(2)}×</span></label><input id="rate" type="range" min="0.6" max="1.2" step="0.05" value="${S.set.rate}"></div>
          <div class="setting"><span class="lab">Power saving</span><div class="seg">${[[false, 'Off'], [true, 'On']].map(([v, t]) => `<button data-lite="${v}" aria-pressed="${!!S.set.lite === v}">${t}</button>`).join('')}</div><span class="hint">Turns off the intro, paper texture, background sound, confetti and page animations, so older phones run smoothly.</span></div>
          <div class="setting"><span class="lab">Intro animation</span><div class="seg">${[[true, 'Once a day'], [false, 'Off']].map(([v, t]) => `<button data-splash-set="${v}" aria-pressed="${S.set.splash === v}">${t}</button>`).join('')}</div></div>
          <div class="setting"><span class="lab">Look</span><div class="seg">${[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(([v, t]) => `<button data-theme-set="${v}" aria-pressed="${S.set.theme === v}">${t}</button>`).join('')}</div></div>
          <div class="setting">
            <span class="lab">Backup</span>
            <div class="backup"><img src="assets/brand/data.webp" alt="" width="480" height="480" loading="lazy"><span class="hint">Progress lives only in this browser. Export it, keep it in notes or cloud storage, and paste it back on a new device.</span></div>
            <div class="row-btns">
              <button class="btn ghost small" id="export">Export</button>
              <button class="btn ghost small" id="import">Paste a backup</button>
              <label class="btn ghost small" for="import-file" style="cursor:pointer">Restore from a file</label>
              <input id="import-file" type="file" accept="application/json,.json" hidden>
            </div>
            <textarea class="data-box" id="data-box" hidden aria-label="Progress data"></textarea>
            <div class="row-btns" id="data-actions" hidden></div>
          </div>
          <div class="setting"><span class="lab">Reset</span><button class="btn small is-danger" id="reset" style="justify-self:start">${I.cross}Delete all progress</button><span class="hint">This cannot be undone. You will be asked to confirm.</span></div>
        </section>
      </div>

      <section class="section about">
        <article class="card panel">
          <h2>How TOEIC is scored</h2>
          <p>The TOEIC Listening &amp; Reading test has 200 questions in about 2 hours: 100 listening (Parts 1–4) and 100 reading (Parts 5–7), 495 points each, 10–990 in total. Certificates come in five colors:</p>
          <div class="score-bands">
            <div class="band"><i style="background:#c9a227"></i><b>860–990</b><span>Gold: handles professional topics with ease</span></div>
            <div class="band"><i style="background:#3466a4"></i><b>730–855</b><span>Blue: handles most work communication</span></div>
            <div class="band"><i style="background:#3c8657"></i><b>470–725</b><span>Green: handles daily and routine work</span></div>
            <div class="band"><i style="background:#8a5a3c"></i><b>220–465</b><span>Brown: basic communication</span></div>
            <div class="band"><i style="background:#d9752f"></i><b>10–215</b><span>Orange: beginner</span></div>
          </div>
          <p>This site puts its 1,000 words into four levels, 400, 600, 800 and 990, with 250 words each.</p>
        </article>
        <article class="card panel">
          <h2>About TOEIC Voyage</h2>
          <ul>
            <li>Think in English: questions and hints are in English; Chinese appears only after you answer.</li>
            <li>Every meaning uses only the 2,000 most common English words. Simpler paraphrases, roots, memory hooks, word families and phrases are all original.</li>
            <li>The 5,000 quiz sentences, ${EX.part2.length} Part 2 questions, ${EX.pairs.length} confusable pairs, ${EX.docs.length} work documents and the interview answers are all original.</li>
            <li>The story "Flight NS-014" and its translation are original.</li>
            <li>KK phonetics come from the CMU Pronouncing Dictionary, checked by hand; ${WORDS.filter((w) => w.tip).length} TOEIC tips are written by this site.</li>
            <li>Pictures and US/UK recordings come from Word Atlas (Word Atlas contributors, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>), resized and combined. After checking each one, ${fmt(WORDS.filter(hasArt).length)} pictures that fit their word are kept; the other cards show an example. Real recordings: ${fmt(WORDS.filter((w) => w.u).length)} words; the rest use your device voice.</li>
            <li>Reviews use SM-2 spaced repetition: each time you remember a word, the gap grows. A word is mastered after 21 days.</li>
            <li>Music, background sounds and sound effects are made by this site; change them in the top menu.</li>
            <li>Design inspired by the open-source IELTS project <a href="https://github.com/designfuchen/word-atlas" target="_blank" rel="noopener">Word Atlas</a> (MIT license). This is an independent TOEIC version.</li>
          </ul>
        </article>
      </section>
    </div>`;
    view.querySelectorAll('[data-leg]').forEach((b) => b.addEventListener('click', () => { atlasState.lv = +b.dataset.leg; atlasState.topic = 'all'; go('atlas'); }));
    view.querySelectorAll('[data-topic]').forEach((b) => b.addEventListener('click', () => { atlasState.topic = b.dataset.topic; atlasState.lv = 0; go('atlas'); }));
    view.querySelectorAll('[data-goal]').forEach((b) => b.addEventListener('click', () => { S.set.goal = +b.dataset.goal; save(); plan(); viewMe(); toast(`${S.set.goal} new words a day`); }));
    view.querySelectorAll('[data-cap]').forEach((b) => b.addEventListener('click', () => { S.set.cap = +b.dataset.cap; save(); viewMe(); toast(`Up to ${S.set.cap} reviews a day`); }));
    view.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => { S.set.start = +b.dataset.start; const d = today(); d.plan = (d.plan || []).filter((id) => S.cards[id]); save(); plan(); viewMe(); toast(`New words start at ${S.set.start}`); }));
    view.querySelectorAll('[data-mix]').forEach((b) => b.addEventListener('click', () => { S.set.mix = b.dataset.mix; save(); viewMe(); if (S.set.mix !== 'mix') speak('When will the shipment arrive?', S.set.mix); }));
    view.querySelectorAll('[data-accent-set]').forEach((b) => b.addEventListener('click', () => { S.set.accent = b.dataset.accentSet; save(); viewMe(); playWord(BY_ID.get(1)); }));
    view.querySelectorAll('[data-lite]').forEach((b) => b.addEventListener('click', () => { S.set.lite = b.dataset.lite === 'true'; save(); applyLite(); viewMe(); toast(S.set.lite ? 'Power saving on' : 'Power saving off'); }));
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
      acts.innerHTML = '<button class="btn small" id="copy-data">Copy</button><button class="btn ghost small" id="dl-data">Download JSON</button><span class="data-msg" id="data-msg" role="status"></span>';
      // every result is shown on the page as well as in a toast, so nothing fails silently
      const say = (msg, bad) => { const m = $('#data-msg'); if (m) { m.textContent = msg; m.classList.toggle('is-bad', !!bad); } toast(msg); };
      const legacyCopy = () => { box.hidden = false; box.focus(); box.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } return ok; };
      $('#copy-data').addEventListener('click', () => {
        const fallback = () => (legacyCopy() ? say('Copied. Keep it in notes or cloud storage.') : say('Copy blocked here. The text is selected: press Ctrl/⌘ + C.', true));
        if (navigator.clipboard && navigator.clipboard.writeText) {
          let settled = false;
          const t = setTimeout(() => { if (!settled) { settled = true; fallback(); } }, 1200);
          navigator.clipboard.writeText(json).then(() => { if (!settled) { settled = true; clearTimeout(t); say('Copied. Keep it in notes or cloud storage.'); } }, () => { if (!settled) { settled = true; clearTimeout(t); fallback(); } });
        } else fallback();
      });
      $('#dl-data').addEventListener('click', () => {
        // a page inside a frame (like the Claude preview) is not allowed to start downloads
        if (window.self !== window.top) { say('Download blocked — use Copy', true); return; }
        try {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
          a.download = `toeic-voyage-${ymd()}.json`;
          document.body.appendChild(a); a.click(); a.remove();
          say(`Download started: toeic-voyage-${ymd()}.json`);
        } catch (e) { say('Download blocked — use Copy', true); }
      });
    });
    const restore = (text) => {
      try {
        const raw = JSON.parse(text);
        if (!raw || raw.v !== 1 || typeof raw.cards !== 'object') throw new Error('bad');
        S = { ...fresh(), ...raw, ret: { 7: [0, 0], 30: [0, 0], ...(raw.ret || {}) }, set: { ...DEFAULT_SET, ...(raw.set || {}) } };
        save(); applyTheme(); paintTools(); viewMe();
        toast(`Restored ${Object.keys(S.cards).length} words`);
      } catch (e) { toast('This is not a TOEIC Voyage backup. Please paste the whole JSON.'); }
    };
    $('#import').addEventListener('click', () => {
      box.hidden = false; acts.hidden = false;
      box.value = '';
      box.placeholder = 'Paste your exported JSON here';
      box.focus();
      acts.innerHTML = '<button class="btn small" id="do-import">Restore</button>';
      $('#do-import').addEventListener('click', () => restore(box.value));
    });
    $('#import-file').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => restore(String(r.result));
      r.readAsText(f);
    });
    $('#reset').addEventListener('click', () => confirmDialog('Delete all progress?', 'Your words, reviews, saved words, sentences and daily records will be deleted for good. Export a backup first.', 'Clear', () => {
      const keep = S.set;
      S = fresh(); S.set = keep; S.onboarded = true; save(); session = null; viewMe(); toast('Progress deleted');
    }));
  }

  /* ---------- dialogs ---------- */
  function confirmDialog(title, body, okText, onOk) {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.setAttribute('role', 'alertdialog');
    ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="dialog" style="width:min(460px,100%)"><div class="dialog-body"><h2 style="font-size:24px">${esc(title)}</h2><p class="sub">${esc(body)}</p><div class="dialog-foot"><button class="btn ghost" data-x>Cancel</button><button class="btn" data-ok style="background:var(--bad);color:var(--card)">${esc(okText)}</button></div></div></div>`;
    document.body.appendChild(ov);
    const close = () => ov.remove();
    ov._close = close;
    ov.querySelector('[data-x]').addEventListener('click', close);
    ov.querySelector('[data-ok]').addEventListener('click', () => { close(); onOk(); });
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelector('[data-x]').focus();
  }
  // first visit: a short welcome, then the 3-minute level check
  function onboarding() {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Welcome');
    ov.innerHTML = `<div class="dialog">
      <div class="dialog-art" style="background-image:url(assets/brand/og.webp)" role="img" aria-label="An island map on an open book"></div>
      <div class="dialog-body">
        <span class="eyebrow">WELCOME ABOARD</span>
        <h2>Think in English. No translating in your head.</h2>
        <p class="sub">Questions and hints are in English; Chinese appears only after you answer. Take a 3-minute level check to start at 400 or 600. Then learn 10 new words a day, 5–10 minutes at a time.</p>
        <div class="dialog-foot"><button class="btn ghost" data-skip>Skip, start at 400</button><button class="btn" data-go>Take the level check ${I.arrow}</button></div>
      </div>
    </div>`;
    document.body.appendChild(ov);
    document.documentElement.classList.add('is-locked');
    const close = () => { ov.remove(); if (!$('.overlay')) document.documentElement.classList.remove('is-locked'); };
    ov.querySelector('[data-go]').addEventListener('click', () => { sfx('start'); close(); go('place'); });
    ov.querySelector('[data-skip]').addEventListener('click', () => { S.onboarded = true; S.place = { at: ymd(), acc: {}, start: 400, skipped: true }; S.set.start = 400; save(); close(); render(); });
    ov.querySelector('[data-go]').focus();
  }

  /* ======================================================
     SPLASH: stardust gathers into the mark, the name and the wordmark; a tap opens the cabin door
     ====================================================== */
  const SPLASH_KEY = 'toeic-voyage:splash';
  function shouldSplash() {
    if (S.set.splash === false || S.set.lite) return false;
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
    ov.setAttribute('aria-label', 'TOEIC Voyage welcome');
    ov.innerHTML = `<canvas class="splash-cv" aria-hidden="true"></canvas>
      <p class="splash-en" aria-hidden="true">TOEIC VOYAGE</p>
      <div class="splash-ui">
        <p class="splash-tag">1,000 workplace words · a flight from 400 to 990</p>
        <button class="splash-go" id="splash-go">Tap to board</button>
        <button class="splash-skip" id="splash-skip">Skip</button>
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

  const VIEWS = { today: viewToday, place: viewPlace, recap: viewRecap, commute: viewCommute, sprint: viewSprint, story: viewStory, atlas: viewAtlas, learn: viewLearn,
    practice: viewPractice, work: viewWork, docs: viewDocs, interview: viewInterview, jd: viewJD, map: viewMap, me: viewMe };

  applyTheme();
  render();
  const afterSplash = () => { if (!S.onboarded) onboarding(); };
  if (shouldSplash()) runSplash(afterSplash); else afterSplash();
})();
