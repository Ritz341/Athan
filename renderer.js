/**
 * ============================================================
 *  Islamic Smart Clock — Renderer Process (renderer.js)
 *
 *  Responsibilities:
 *    · Live clock (12/24 hr) with blinking colons
 *    · Gregorian + Hijri date display
 *    · Prayer times — computed offline via adhan library,
 *      optionally refreshed from aladhan.com API with caching
 *    · Prayer card state management (current / next / passed)
 *    · Countdown timer to next prayer
 *    · Athan audio trigger
 *    · Quran verse rotation with fade transition
 *    · Auto cursor-hide on inactivity
 *
 *  Runs inside Electron renderer with nodeIntegration: true.
 * ============================================================
 */

'use strict';

// ─────────────────────────────────────────────────────────────
//  Node / Electron dependencies
// ─────────────────────────────────────────────────────────────
const adhan  = require('adhan');
const fs     = require('fs');
const path   = require('path');
const https  = require('https');
const http   = require('http');

// CONFIG is injected by config.js (loaded before this script in index.html).
// We keep a live mutable copy so settings changes apply without restart.
let LOC         = { ...CONFIG.location };
let CALC_METHOD = CONFIG.calculationMethod;
let ASR_METHOD  = CONFIG.asrMethod;
let HL_RULE     = CONFIG.highLatitudeRule;
const AUDIO_CFG = CONFIG.audio;
const API_CFG   = CONFIG.api;
let DISP_CFG    = { ...CONFIG.display };

// ─────────────────────────────────────────────────────────────
//  Settings — persist user overrides to settings.json
// ─────────────────────────────────────────────────────────────
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

function loadSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return;
    const saved = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    if (saved.location)         LOC         = { ...LOC,      ...saved.location };
    if (saved.calculationMethod) CALC_METHOD = saved.calculationMethod;
    if (saved.asrMethod)         ASR_METHOD  = saved.asrMethod;
    if (saved.highLatitudeRule)  HL_RULE     = saved.highLatitudeRule;
    if (saved.display)           DISP_CFG    = { ...DISP_CFG, ...saved.display };
    console.log('[Settings] Loaded from settings.json');
  } catch (e) {
    console.warn('[Settings] Could not load settings.json:', e.message);
  }
}

function saveSettings(data) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('[Settings] Saved.');
  } catch (e) {
    console.warn('[Settings] Could not save settings.json:', e.message);
  }
}

// ─────────────────────────────────────────────────────────────
//  Wallpaper rotation — crossfades images from assets/images/
// ─────────────────────────────────────────────────────────────
let wallpaperTimer    = null;   // setInterval handle
let wallpaperImages   = [];     // array of file:// URLs
let wallpaperIndex    = 0;
let wallpaperActiveEl = 'a';    // which layer is currently visible ('a' or 'b')

function loadWallpaperImages() {
  const imgDir = path.join(__dirname, 'assets', 'images');
  const exts   = /\.(jpg|jpeg|png|webp|gif|bmp)$/i;
  try {
    if (!fs.existsSync(imgDir)) return [];
    return fs.readdirSync(imgDir)
      .filter(f => exts.test(f))
      .map(f => `file://${path.join(imgDir, f).replace(/\\/g, '/')}`);
  } catch (e) {
    console.warn('[Wallpaper] Could not read images folder:', e.message);
    return [];
  }
}

function showWallpaperImage(url) {
  // Alternate between layer A and layer B
  const next     = wallpaperActiveEl === 'a' ? 'b' : 'a';
  const layerNext = document.getElementById(`wallpaper-${next}`);
  const layerPrev = document.getElementById(`wallpaper-${wallpaperActiveEl}`);

  if (!layerNext || !layerPrev) return;

  // Load new image into the hidden layer, then crossfade
  layerNext.style.backgroundImage = `url("${url}")`;
  layerNext.classList.add('active');
  layerPrev.classList.remove('active');
  wallpaperActiveEl = next;

  // Sample the image and update clock color to contrast nicely
  updateClockColorFromImage(url);
}

function startWallpaperRotation(intervalMs) {
  wallpaperImages = loadWallpaperImages();
  if (wallpaperImages.length === 0) {
    console.warn('[Wallpaper] No images found in assets/images/ — wallpaper disabled');
    return;
  }

  // Shuffle so order is random each session
  wallpaperImages.sort(() => Math.random() - 0.5);

  // Show first image immediately
  showWallpaperImage(wallpaperImages[0]);
  wallpaperIndex = 0;

  // Rotate on interval
  clearInterval(wallpaperTimer);
  wallpaperTimer = setInterval(() => {
    wallpaperIndex = (wallpaperIndex + 1) % wallpaperImages.length;
    showWallpaperImage(wallpaperImages[wallpaperIndex]);
  }, intervalMs || 30000);

  console.log(`[Wallpaper] Rotating ${wallpaperImages.length} images every ${(intervalMs||30000)/1000}s`);
}

function stopWallpaperRotation() {
  clearInterval(wallpaperTimer);
  wallpaperTimer = null;
  const a = document.getElementById('wallpaper-a');
  const b = document.getElementById('wallpaper-b');
  if (a) a.classList.remove('active');
  if (b) b.classList.remove('active');
  resetClockColor();  // back to default gold
}

// ─────────────────────────────────────────────────────────────
//  Color extraction — samples the clock region of a wallpaper
//  image and returns the average RGB color there.
//  Uses Node.js fs to read the file as base64 (avoids canvas
//  taint issues with file:// URLs in Electron).
// ─────────────────────────────────────────────────────────────
function fileUrlToPath(fileUrl) {
  // file://C:/path/to/img.jpg  →  C:\path\to\img.jpg  (Windows)
  let p = decodeURIComponent(fileUrl.replace(/^file:\/\//, ''));
  if (process.platform === 'win32' && p.startsWith('/')) p = p.slice(1);
  return p.replace(/\//g, path.sep);
}

function extractAvgColor(imageUrl) {
  return new Promise((resolve) => {
    try {
      const filePath = fileUrlToPath(imageUrl);
      const buffer   = fs.readFileSync(filePath);
      const ext      = path.extname(filePath).slice(1).toLowerCase();
      const mime     = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg'
                     : ext === 'png' ? 'image/png'
                     : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const dataUrl  = `data:${mime};base64,${buffer.toString('base64')}`;

      const img = new Image();
      img.onload = () => {
        try {
          // Sample just the clock area: centre-top 60% wide × top 40% tall
          const sw = img.naturalWidth  * 0.6;
          const sh = img.naturalHeight * 0.4;
          const sx = img.naturalWidth  * 0.2;
          const sy = img.naturalHeight * 0.02;

          const canvas = document.createElement('canvas');
          canvas.width  = 80;
          canvas.height = 40;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 80, 40);

          const data = ctx.getImageData(0, 0, 80, 40).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 20) { r += data[i]; g += data[i+1]; b += data[i+2]; n++; }
          }
          resolve(n > 0 ? { r: r/n, g: g/n, b: b/n } : null);
        } catch (e) { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    } catch (e) { resolve(null); }
  });
}

// ─────────────────────────────────────────────────────────────
//  Color math helpers
// ─────────────────────────────────────────────────────────────
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l   = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    default: h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function luminance(r, g, b) {
  // Relative luminance (WCAG formula)
  const lin = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}

// Given the average background color under the clock, pick a
// high-contrast, vibrant clock color with a matching neon glow.
function generateClockColor(avg) {
  if (!avg) {
    // Default: gold
    return { color: '#d4af37', glow: 'rgba(212,175,55,0.45)' };
  }

  const lum = luminance(avg.r, avg.g, avg.b);
  const { h } = rgbToHsl(avg.r, avg.g, avg.b);

  // Complementary hue (opposite on wheel)
  const compH = (h + 180) % 360;

  let clockL, clockS;
  if (lum < 0.2) {
    // Very dark background → bright vivid colour
    clockL = 78; clockS = 90;
  } else if (lum < 0.5) {
    // Medium background → bright saturated
    clockL = 82; clockS = 85;
  } else {
    // Light background → deep rich colour
    clockL = 38; clockS = 95;
  }

  const color = `hsl(${Math.round(compH)}, ${clockS}%, ${clockL}%)`;
  const glow  = `hsla(${Math.round(compH)}, ${clockS}%, ${Math.max(clockL - 15, 30)}%, 0.55)`;

  return { color, glow };
}

// Apply clock color to :root CSS variables
function applyClockColor(color, glow) {
  const root = document.documentElement;
  root.style.setProperty('--clock-color', color);
  root.style.setProperty('--clock-glow',  glow);
}

// Reset to default gold when wallpaper is off
function resetClockColor() {
  const root = document.documentElement;
  root.style.setProperty('--clock-color', '#d4af37');
  root.style.setProperty('--clock-glow',  'rgba(212,175,55,0.40)');
}

// ─────────────────────────────────────────────────────────────
//  Update clock color based on current wallpaper image
// ─────────────────────────────────────────────────────────────
async function updateClockColorFromImage(imageUrl) {
  const avg = await extractAvgColor(imageUrl);
  const { color, glow } = generateClockColor(avg);
  applyClockColor(color, glow);
  console.log(`[Color] bg≈rgb(${avg ? [Math.round(avg.r),Math.round(avg.g),Math.round(avg.b)].join(',') : '?'}) → clock: ${color}`);
}

function applyTheme(themeName, intervalMs) {
  const body = document.body;
  if (themeName === 'wallpaper') {
    body.classList.add('theme-wallpaper');
    startWallpaperRotation(intervalMs || DISP_CFG.wallpaperIntervalMs || 30000);
  } else {
    body.classList.remove('theme-wallpaper');
    stopWallpaperRotation();
  }
}

// ─────────────────────────────────────────────────────────────
//  Quran Verses (Arabic + English + Surah reference)
// ─────────────────────────────────────────────────────────────
const VERSES = [
  { ar: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', en: 'In the name of Allah, the Most Gracious, the Most Merciful.', ref: 'Al-Fatiha 1:1' },
  { ar: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', en: 'All praise is due to Allah, Lord of all the worlds.', ref: 'Al-Fatiha 1:2' },
  { ar: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', en: 'Indeed, with hardship comes ease.', ref: 'Ash-Sharh 94:6' },
  { ar: 'وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ', en: 'Seek help through patience and prayer. Indeed, Allah is with the patient.', ref: 'Al-Baqarah 2:153' },
  { ar: 'حَٰفِظُوا۟ عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ', en: 'Guard strictly your prayers, especially the middle prayer.', ref: 'Al-Baqarah 2:238' },
  { ar: 'وَلَذِكْرُ ٱللَّهِ أَكْبَرُ', en: 'And the remembrance of Allah is the greatest.', ref: 'Al-Ankabut 29:45' },
  { ar: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ', en: 'Verily, in the remembrance of Allah do hearts find rest.', ref: 'Ar-Ra\'d 13:28' },
  { ar: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ', en: 'And He is with you wherever you are.', ref: 'Al-Hadid 57:4' },
  { ar: 'إِنَّ ٱللَّهَ لَا يُضِيعُ أَجْرَ ٱلْمُحْسِنِينَ', en: 'Indeed, Allah does not waste the reward of the doers of good.', ref: 'At-Tawbah 9:120' },
  { ar: 'وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا', en: 'And whoever fears Allah — He will make a way out for him.', ref: 'At-Talaq 65:2' },
  { ar: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ', en: 'And whoever relies upon Allah — then He is sufficient for him.', ref: 'At-Talaq 65:3' },
  { ar: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ', en: 'Remember Me, and I will remember you.', ref: 'Al-Baqarah 2:152' },
  { ar: 'وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ', en: 'And when My servants ask about Me — indeed I am near.', ref: 'Al-Baqarah 2:186' },
  { ar: 'رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْآخِرَةِ حَسَنَةً', en: 'Our Lord, give us good in this world and good in the Hereafter.', ref: 'Al-Baqarah 2:201' },
  { ar: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا', en: 'Allah does not burden a soul beyond that it can bear.', ref: 'Al-Baqarah 2:286' },
  { ar: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', en: 'Say: He is Allah, the One.', ref: 'Al-Ikhlas 112:1' },
  { ar: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ', en: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of all existence.', ref: 'Al-Baqarah 2:255' },
  { ar: 'إِنَّ ٱللَّهَ كَانَ عَلِيمًا حَكِيمًا', en: 'Indeed, Allah is ever Knowing and Wise.', ref: 'An-Nisa 4:11' },
  { ar: 'وَبِٱلْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ', en: 'And in the hours before dawn they would ask forgiveness.', ref: 'Adh-Dhariyat 51:18' },
  { ar: 'وَأَقِمِ ٱلصَّلَوٰةَ إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ', en: 'Establish prayer. Indeed, prayer prohibits immorality and wrongdoing.', ref: 'Al-Ankabut 29:45' },
  { ar: 'وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ ٱلشَّمْسِ وَقَبْلَ غُرُوبِهَا', en: 'Glorify the praises of your Lord before sunrise and before sunset.', ref: 'Taha 20:130' },
  { ar: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ', en: 'O you who believe! Seek help through patience and prayer.', ref: 'Al-Baqarah 2:153' },
  { ar: 'تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ', en: 'Blessed is He in whose hand is dominion, and He is over all things competent.', ref: 'Al-Mulk 67:1' },
  { ar: 'وَٱعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ ٱلْيَقِينُ', en: 'And worship your Lord until there comes to you the certainty.', ref: 'Al-Hijr 15:99' },
  { ar: 'سُبْحَٰنَ رَبِّكَ رَبِّ ٱلْعِزَّةِ عَمَّا يَصِفُونَ', en: 'Glory be to your Lord, the Lord of might, above what they describe.', ref: 'As-Saffat 37:180' },
];

// ─────────────────────────────────────────────────────────────
//  Hijri month names (Arabic)
// ─────────────────────────────────────────────────────────────
const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'رَبِيع الأَوَّل', 'رَبِيع الآخِر',
  'جُمَادَى الأُولَى', 'جُمَادَى الآخِرَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو القَعْدَة', 'ذُو الحِجَّة',
];

// ─────────────────────────────────────────────────────────────
//  Application State
// ─────────────────────────────────────────────────────────────
let prayerTimes    = null;   // { fajr, sunrise, dhuhr, asr, maghrib, isha } — Date objects
let todayKey       = '';     // YYYY-MM-DD, detect midnight rollover
let athanFired     = {};     // { prayerName: true } — reset each day
let verseIndex     = 0;
let cursorTimer    = null;

// ─────────────────────────────────────────────────────────────
//  DOM helpers
// ─────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─────────────────────────────────────────────────────────────
//  Utility — zero-pad numbers
// ─────────────────────────────────────────────────────────────
function pad2(n) { return String(Math.max(0, Math.round(n))).padStart(2, '0'); }

// ─────────────────────────────────────────────────────────────
//  Utility — date string key  YYYY-MM-DD
// ─────────────────────────────────────────────────────────────
function dateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// ─────────────────────────────────────────────────────────────
//  Utility — format a Date for prayer display  (hh:mm AM/PM or HH:MM)
// ─────────────────────────────────────────────────────────────
function formatPrayerTime(date) {
  if (!date) return '--:--';
  const h = date.getHours();
  const m = date.getMinutes();
  if (DISP_CFG.clockFormat === '12') {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12    = h % 12 || 12;
    return `${pad2(h12)}:${pad2(m)} ${suffix}`;
  }
  return `${pad2(h)}:${pad2(m)}`;
}

// ─────────────────────────────────────────────────────────────
//  Gregorian → Hijri calendar conversion
//  Algorithm: Tabular Islamic calendar (Reingold–Dershowitz)
// ─────────────────────────────────────────────────────────────
function toHijri(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1–12
  const d = date.getDate();

  // Gregorian date → Julian Day Number
  const a  = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  const jdn = d
    + Math.floor((153 * m2 + 2) / 5)
    + 365 * y2
    + Math.floor(y2 / 4)
    - Math.floor(y2 / 100)
    + Math.floor(y2 / 400)
    - 32045;

  // Julian Day Number → Hijri
  const l  = jdn - 1948440 + 10632;
  const n  = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j  = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719)
           + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2
    - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43)
    + 29;

  const hMonth = Math.floor((24 * l3) / 709);
  const hDay   = l3 - Math.floor((709 * hMonth) / 24);
  const hYear  = 30 * n + j - 30;

  const mIdx = Math.max(0, Math.min(11, hMonth - 1));
  return `${hDay} ${HIJRI_MONTHS_AR[mIdx]} ${hYear} هـ`;
}

// ─────────────────────────────────────────────────────────────
//  Build adhan CalculationParameters from CONFIG
// ─────────────────────────────────────────────────────────────
function buildAdhanParams() {
  const methods = {
    NorthAmerica:          () => adhan.CalculationMethod.NorthAmerica(),
    MuslimWorldLeague:     () => adhan.CalculationMethod.MuslimWorldLeague(),
    Egyptian:              () => adhan.CalculationMethod.Egyptian(),
    Karachi:               () => adhan.CalculationMethod.Karachi(),
    UmmAlQura:             () => adhan.CalculationMethod.UmmAlQura(),
    Dubai:                 () => adhan.CalculationMethod.Dubai(),
    Kuwait:                () => adhan.CalculationMethod.Kuwait(),
    Qatar:                 () => adhan.CalculationMethod.Qatar(),
    Singapore:             () => adhan.CalculationMethod.Singapore(),
    Turkey:                () => adhan.CalculationMethod.Turkey(),
    Tehran:                () => adhan.CalculationMethod.Tehran(),
    MoonsightingCommittee: () => adhan.CalculationMethod.MoonsightingCommittee(),
  };

  const factory = methods[CALC_METHOD] || methods.NorthAmerica;
  const params  = factory();

  // Asr juristic school
  params.madhab = (ASR_METHOD === 'Hanafi')
    ? adhan.Madhab.Hanafi
    : adhan.Madhab.Shafi;

  // High-latitude rule
  const hlrMap = {
    None:              adhan.HighLatitudeRule.None,
    MiddleOfTheNight:  adhan.HighLatitudeRule.MiddleOfTheNight,
    SeventhOfTheNight: adhan.HighLatitudeRule.SeventhOfTheNight,
    TwilightAngle:     adhan.HighLatitudeRule.TwilightAngle,
  };
  params.highLatitudeRule = hlrMap[HL_RULE] || adhan.HighLatitudeRule.MiddleOfTheNight;

  return params;
}

// ─────────────────────────────────────────────────────────────
//  Calculate prayer times locally (offline — always available)
// ─────────────────────────────────────────────────────────────
function calcPrayerTimesLocal(date) {
  const coords = new adhan.Coordinates(LOC.latitude, LOC.longitude);
  const params = buildAdhanParams();
  const times  = new adhan.PrayerTimes(coords, date, params);

  return {
    fajr:    times.fajr,
    sunrise: times.sunrise,
    dhuhr:   times.dhuhr,
    asr:     times.asr,
    maghrib: times.maghrib,
    isha:    times.isha,
  };
}

// ─────────────────────────────────────────────────────────────
//  Parse a "HH:MM" string from aladhan into a Date for today
// ─────────────────────────────────────────────────────────────
function apiTimeToDate(timeStr, referenceDate) {
  if (!timeStr) return null;
  const [hh, mm] = timeStr.split(':').map(Number);
  const d = new Date(referenceDate);
  d.setHours(hh, mm, 0, 0);
  return d;
}

// ─────────────────────────────────────────────────────────────
//  Load cache (returns null if not found / stale)
// ─────────────────────────────────────────────────────────────
function loadCache(key) {
  try {
    const cachePath = path.join(__dirname, API_CFG.cacheFile);
    if (!fs.existsSync(cachePath)) return null;
    const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (data.date !== key) return null;
    return data.timings; // { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha }
  } catch (_) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  Save to cache
// ─────────────────────────────────────────────────────────────
function saveCache(key, timings) {
  try {
    const cachePath = path.join(__dirname, API_CFG.cacheFile);
    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify({ date: key, timings }), 'utf8');
  } catch (e) {
    console.warn('[Cache] Write failed:', e.message);
  }
}

// ─────────────────────────────────────────────────────────────
//  Fetch prayer times from aladhan.com API (async, best-effort)
// ─────────────────────────────────────────────────────────────
function fetchApiPrayerTimes(date, key) {
  return new Promise((resolve, reject) => {
    const ts  = Math.floor(date.getTime() / 1000);
    const url = `http://api.aladhan.com/v1/timings/${ts}?latitude=${LOC.latitude}&longitude=${LOC.longitude}&method=${API_CFG.method}`;

    const req = http.get(url, { timeout: API_CFG.timeout }, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          if (json.code === 200 && json.data && json.data.timings) {
            saveCache(key, json.data.timings);
            resolve(json.data.timings);
          } else {
            reject(new Error('API returned unexpected data'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('API timeout')); });
  });
}

// ─────────────────────────────────────────────────────────────
//  Load today's prayer times (API + cache + local fallback)
// ─────────────────────────────────────────────────────────────
async function loadPrayerTimes(date) {
  const key = dateKey(date);

  // Always start with local calculation (instant, no network needed)
  prayerTimes = calcPrayerTimesLocal(date);
  renderPrayerTimes();

  if (!API_CFG.enabled) return;

  // Try cache first
  const cached = loadCache(key);
  if (cached) {
    console.log('[Prayer] Using cached API times for', key);
    prayerTimes = {
      fajr:    apiTimeToDate(cached.Fajr,    date),
      sunrise: apiTimeToDate(cached.Sunrise, date),
      dhuhr:   apiTimeToDate(cached.Dhuhr,   date),
      asr:     apiTimeToDate(cached.Asr,     date),
      maghrib: apiTimeToDate(cached.Maghrib, date),
      isha:    apiTimeToDate(cached.Isha,    date),
    };
    renderPrayerTimes();
    return;
  }

  // Fetch from API
  try {
    console.log('[Prayer] Fetching from aladhan.com…');
    const timings = await fetchApiPrayerTimes(date, key);
    prayerTimes = {
      fajr:    apiTimeToDate(timings.Fajr,    date),
      sunrise: apiTimeToDate(timings.Sunrise, date),
      dhuhr:   apiTimeToDate(timings.Dhuhr,   date),
      asr:     apiTimeToDate(timings.Asr,     date),
      maghrib: apiTimeToDate(timings.Maghrib, date),
      isha:    apiTimeToDate(timings.Isha,    date),
    };
    console.log('[Prayer] API times loaded successfully');
    renderPrayerTimes();
  } catch (e) {
    console.warn('[Prayer] API fetch failed, using local calculation:', e.message);
  }
}

// ─────────────────────────────────────────────────────────────
//  Render prayer times to the DOM
// ─────────────────────────────────────────────────────────────
function renderPrayerTimes() {
  if (!prayerTimes) return;
  $('time-fajr').textContent    = formatPrayerTime(prayerTimes.fajr);
  $('time-sunrise').textContent = formatPrayerTime(prayerTimes.sunrise);
  $('time-dhuhr').textContent   = formatPrayerTime(prayerTimes.dhuhr);
  $('time-asr').textContent     = formatPrayerTime(prayerTimes.asr);
  $('time-maghrib').textContent = formatPrayerTime(prayerTimes.maghrib);
  $('time-isha').textContent    = formatPrayerTime(prayerTimes.isha);
}

// ─────────────────────────────────────────────────────────────
//  Prayer list (ordered) for state management
// ─────────────────────────────────────────────────────────────
const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

const PRAYER_STATUS_LABELS = {
  fajr:    { current: 'CURRENT',  next: 'NEXT' },
  sunrise: { current: 'SHURUQ',   next: 'NEXT' },
  dhuhr:   { current: 'CURRENT',  next: 'NEXT' },
  asr:     { current: 'CURRENT',  next: 'NEXT' },
  maghrib: { current: 'CURRENT',  next: 'NEXT' },
  isha:    { current: 'CURRENT',  next: 'NEXT' },
};

// ─────────────────────────────────────────────────────────────
//  Update prayer card states (current / next / passed)
// ─────────────────────────────────────────────────────────────
function updatePrayerStates(now) {
  if (!prayerTimes) return;

  // Determine which prayer window is "current" (the most recent prayer that has passed)
  // and which is "next" (the first future prayer)
  let currentPrayer = null;
  let nextPrayer    = null;

  for (let i = 0; i < PRAYER_ORDER.length; i++) {
    const name = PRAYER_ORDER[i];
    const t    = prayerTimes[name];
    if (!t) continue;
    if (t <= now) {
      currentPrayer = name;
    } else if (!nextPrayer) {
      nextPrayer = name;
    }
  }

  // Apply CSS state classes
  PRAYER_ORDER.forEach(name => {
    const card       = document.getElementById(`prayer-${name}`);
    const statusEl   = document.getElementById(`status-${name}`);
    if (!card || !statusEl) return;

    card.classList.remove('state-current', 'state-next', 'state-passed');
    statusEl.textContent = '';

    if (name === currentPrayer) {
      card.classList.add('state-current');
      statusEl.textContent = PRAYER_STATUS_LABELS[name].current;
    } else if (name === nextPrayer) {
      card.classList.add('state-next');
      statusEl.textContent = PRAYER_STATUS_LABELS[name].next;
    } else if (prayerTimes[name] && prayerTimes[name] < now && name !== currentPrayer) {
      card.classList.add('state-passed');
    }
  });

  return { currentPrayer, nextPrayer };
}

// ─────────────────────────────────────────────────────────────
//  Update countdown to next prayer
// ─────────────────────────────────────────────────────────────
function updateCountdown(now) {
  if (!prayerTimes) return;

  // Find next prayer time
  let nextName = null;
  let nextTime = null;

  for (const name of PRAYER_ORDER) {
    const t = prayerTimes[name];
    if (t && t > now) {
      nextName = name;
      nextTime = t;
      break;
    }
  }

  const nameEl    = $('next-prayer-name');
  const cdDisplay = $('countdown-display');
  const cdH       = $('cd-h');
  const cdM       = $('cd-m');
  const cdS       = $('cd-s');

  if (!nextName || !nextTime) {
    // After Isha — show "until Fajr tomorrow" placeholder
    nameEl.textContent = 'Fajr';
    cdH.textContent    = '--';
    cdM.textContent    = '--';
    cdS.textContent    = '--';
    cdDisplay.classList.remove('imminent');
    return;
  }

  const diffMs  = nextTime.getTime() - now.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const hours   = Math.floor(diffSec / 3600);
  const mins    = Math.floor((diffSec % 3600) / 60);
  const secs    = diffSec % 60;

  nameEl.textContent = nextName.charAt(0).toUpperCase() + nextName.slice(1);
  cdH.textContent    = pad2(hours);
  cdM.textContent    = pad2(mins);
  cdS.textContent    = pad2(secs);

  // Flash red when < 5 minutes remain
  cdDisplay.classList.toggle('imminent', diffMs < 5 * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────
//  Athan audio trigger
// ─────────────────────────────────────────────────────────────
function checkAndPlayAthan(now) {
  if (!prayerTimes) return;

  const audioEl = $('athan-audio');
  if (!audioEl) return;

  for (const name of PRAYER_ORDER) {
    // Optionally skip Shuruq
    if (name === 'sunrise' && !AUDIO_CFG.playForShuruq) continue;
    if (athanFired[name]) continue;

    const t = prayerTimes[name];
    if (!t) continue;

    const diff = Math.abs(now.getTime() - t.getTime());
    if (diff <= AUDIO_CFG.triggerWindowMs && now >= t) {
      athanFired[name] = true;
      playAthan(name);
      break; // only one athan at a time
    }
  }
}

function playAthan(prayerName) {
  const audioEl = $('athan-audio');
  if (!audioEl) return;

  const src = path.join(__dirname, 'assets', 'audio', AUDIO_CFG.athanFile);
  if (!fs.existsSync(src)) {
    console.warn('[Athan] Audio file not found:', src);
    return;
  }

  console.log('[Athan] Playing for', prayerName);
  audioEl.src    = `file://${src}`;
  audioEl.volume = Math.min(1, Math.max(0, AUDIO_CFG.volume));
  audioEl.currentTime = 0;
  audioEl.play().catch(e => console.warn('[Athan] Playback error:', e.message));

  showAthanIndicator(prayerName);
}

function showAthanIndicator(prayerName) {
  // Create / reuse a floating toast indicator
  let indicator = document.querySelector('.athan-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'athan-indicator';
    document.body.appendChild(indicator);
  }
  const label = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);
  indicator.textContent = `🕌  ${label} Athan`;
  indicator.classList.add('visible');

  // Auto-hide after 30 s
  setTimeout(() => indicator.classList.remove('visible'), 30000);
}

// ─────────────────────────────────────────────────────────────
//  Clock — update every second
// ─────────────────────────────────────────────────────────────
function tickClock() {
  const now = new Date();
  const key = dateKey(now);

  // ── Midnight rollover — reload prayer times for new day ──
  if (key !== todayKey) {
    todayKey   = key;
    athanFired = {};
    loadPrayerTimes(now);
    updateDates(now);
    updateLocation();
  }

  // ── Digital clock ────────────────────────────────────────
  let h   = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  if (DISP_CFG.clockFormat === '12') {
    $('ampm-display').textContent = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
  } else {
    $('ampm-display').textContent = '';
  }

  $('clock-h').textContent = pad2(h);
  $('clock-m').textContent = pad2(m);

  if (DISP_CFG.showSeconds) {
    $('clock-s').textContent = pad2(s);
    document.querySelectorAll('.colon').forEach(el => el.style.display = '');
  } else {
    $('clock-s').textContent = '';
    // hide second colon
    const colons = document.querySelectorAll('.colon');
    if (colons[1]) colons[1].style.display = 'none';
  }

  // ── Prayer states + countdown ────────────────────────────
  updatePrayerStates(now);
  updateCountdown(now);
  checkAndPlayAthan(now);
}

// ─────────────────────────────────────────────────────────────
//  Date display (Gregorian + Hijri)
// ─────────────────────────────────────────────────────────────
function updateDates(date) {
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  const dayName  = DAYS[date.getDay()];
  const monthName = MONTHS[date.getMonth()];
  const day      = date.getDate();
  const year     = date.getFullYear();

  $('date-gregorian').textContent = `${dayName}, ${day} ${monthName} ${year}`;
  $('date-hijri').textContent     = toHijri(date);
}

// ─────────────────────────────────────────────────────────────
//  Location chip
// ─────────────────────────────────────────────────────────────
function updateLocation() {
  const el = $('location-label');
  if (el) el.textContent = LOC.city || `${LOC.latitude.toFixed(2)}°, ${LOC.longitude.toFixed(2)}°`;
}

// ─────────────────────────────────────────────────────────────
//  Verse pool — merge hardcoded VERSES with ISLAMIC_DATABASE
//  (ISLAMIC_DATABASE comes from config.js and can be extended there)
// ─────────────────────────────────────────────────────────────
function buildVersePool() {
  // Normalise ISLAMIC_DATABASE entries to {ar, en, ref} shape
  const dbEntries = (typeof ISLAMIC_DATABASE !== 'undefined' ? ISLAMIC_DATABASE : [])
    .map(item => ({
      ar:  item.arabic      || '',
      en:  item.translation || '',
      ref: (item.type === 'hadith' ? 'Hadith: ' : '') + (item.reference || ''),
    }));

  // Merge: hardcoded VERSES first, then any extras from config.js
  return [...VERSES, ...dbEntries];
}

// ─────────────────────────────────────────────────────────────
//  Quran verse rotation (single implementation)
// ─────────────────────────────────────────────────────────────
function showVerse(pool, idx) {
  const v = pool[idx];
  if (!v) return;
  $('verse-arabic').textContent      = v.ar;
  $('verse-translation').textContent = v.en;
  $('verse-reference').textContent   = v.ref;
}

function startVerseRotation() {
  const pool      = buildVersePool();
  const container = $('verse-container');

  // Show first verse immediately
  showVerse(pool, verseIndex);

  // Rotate using CSS fade-out class (matches styles.css .fade-out transition)
  setInterval(() => {
    if (container) container.classList.add('fade-out');

    setTimeout(() => {
      verseIndex = (verseIndex + 1) % pool.length;
      showVerse(pool, verseIndex);
      if (container) container.classList.remove('fade-out');
    }, DISP_CFG.fadeMs);
  }, DISP_CFG.verseIntervalMs);
}

// ─────────────────────────────────────────────────────────────
//  Auto cursor-hide on inactivity
// ─────────────────────────────────────────────────────────────
function setupCursorHide() {
  const HIDE_DELAY = DISP_CFG.cursorHideMs || 3000;

  function showCursor() {
    document.body.classList.remove('hide-cursor');
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => {
      document.body.classList.add('hide-cursor');
    }, HIDE_DELAY);
  }

  document.addEventListener('mousemove',  showCursor, { passive: true });
  document.addEventListener('mousedown',  showCursor, { passive: true });
  document.addEventListener('touchstart', showCursor, { passive: true });

  // Start hidden
  cursorTimer = setTimeout(() => {
    document.body.classList.add('hide-cursor');
  }, HIDE_DELAY);
}

// ─────────────────────────────────────────────────────────────
//  Settings Modal — open / close / populate / save
// ─────────────────────────────────────────────────────────────
function setupSettingsModal() {
  const overlay    = $('settings-overlay');
  const openBtn    = $('settings-btn');
  const closeBtn   = $('settings-close');
  const cancelBtn  = $('settings-cancel');
  const saveBtn    = $('settings-save');
  const presetSel  = $('s-preset');

  if (!overlay) return;

  // ── Show/hide interval row based on theme selection ──────
  function syncWallpaperRow() {
    const theme = $('setting-theme') ? $('setting-theme').value : 'default';
    const row   = $('wp-interval-row');
    if (row) row.style.display = (theme === 'wallpaper') ? '' : 'none';
  }
  if ($('setting-theme')) {
    $('setting-theme').addEventListener('change', syncWallpaperRow);
  }

  // ── Open ──────────────────────────────────────────────────
  function openSettings() {
    // Populate fields with current live values
    $('s-city').value    = LOC.city || '';
    $('s-lat').value     = LOC.latitude;
    $('s-lng').value     = LOC.longitude;
    $('s-method').value  = CALC_METHOD;
    $('s-asr').value     = ASR_METHOD;
    $('s-hl').value      = HL_RULE;
    $('s-clockfmt').value = DISP_CFG.clockFormat;
    $('s-seconds').checked = DISP_CFG.showSeconds;
    if ($('setting-theme')) $('setting-theme').value = DISP_CFG.theme || 'default';
    if ($('s-wp-interval')) $('s-wp-interval').value = String(DISP_CFG.wallpaperIntervalMs || 30000);
    presetSel.value = '';
    syncWallpaperRow();

    overlay.classList.add('open');
    $('s-city').focus();
  }

  // ── Close ─────────────────────────────────────────────────
  function closeSettings() {
    overlay.classList.remove('open');
  }

  // ── Preset picker — auto-fills lat/lng/city ───────────────
  presetSel.addEventListener('change', () => {
    const val = presetSel.value;
    if (!val) return;
    const [lat, lng, city] = val.split(',');
    $('s-lat').value  = lat;
    $('s-lng').value  = lng;
    $('s-city').value = city;
  });

  // ── Save & Apply ──────────────────────────────────────────
  saveBtn.addEventListener('click', () => {
    const lat  = parseFloat($('s-lat').value);
    const lng  = parseFloat($('s-lng').value);
    const city = $('s-city').value.trim() || `${lat.toFixed(2)}°N`;

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      showToast('⚠ Invalid coordinates — check Latitude / Longitude');
      return;
    }

    // Apply to live variables
    LOC.latitude   = lat;
    LOC.longitude  = lng;
    LOC.city       = city;
    CALC_METHOD    = $('s-method').value;
    ASR_METHOD     = $('s-asr').value;
    HL_RULE        = $('s-hl').value;
    DISP_CFG.clockFormat        = $('s-clockfmt').value;
    DISP_CFG.showSeconds        = $('s-seconds').checked;
    DISP_CFG.theme              = $('setting-theme') ? $('setting-theme').value : 'default';
    DISP_CFG.wallpaperIntervalMs = $('s-wp-interval') ? parseInt($('s-wp-interval').value) : 30000;

    // Apply theme immediately
    applyTheme(DISP_CFG.theme, DISP_CFG.wallpaperIntervalMs);

    // Persist
    saveSettings({
      location:          { latitude: lat, longitude: lng, city },
      calculationMethod: CALC_METHOD,
      asrMethod:         ASR_METHOD,
      highLatitudeRule:  HL_RULE,
      display: {
        clockFormat:         DISP_CFG.clockFormat,
        showSeconds:         DISP_CFG.showSeconds,
        theme:               DISP_CFG.theme,
        wallpaperIntervalMs: DISP_CFG.wallpaperIntervalMs,
      },
    });

    // Refresh prayer times + UI immediately
    athanFired = {};
    loadPrayerTimes(new Date());
    updateLocation();

    closeSettings();
    showToast('✓ Settings saved');
  });

  // ── Event bindings ────────────────────────────────────────
  openBtn.addEventListener('click', openSettings);
  closeBtn.addEventListener('click', closeSettings);
  cancelBtn.addEventListener('click', closeSettings);

  // Click backdrop to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSettings();
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeSettings();
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  Toast notification
// ─────────────────────────────────────────────────────────────
function showToast(msg) {
  let toast = document.querySelector('.settings-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'settings-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─────────────────────────────────────────────────────────────
//  Keyboard shortcuts (dev convenience)
// ─────────────────────────────────────────────────────────────
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+D — reload prayer times (useful after config change)
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      console.log('[Dev] Force reloading prayer times…');
      athanFired = {};
      loadPrayerTimes(new Date());
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  Initialise everything
// ─────────────────────────────────────────────────────────────
async function init() {
  console.log('[App] Islamic Smart Clock starting…');

  // Load persisted user settings first (overrides config.js defaults)
  loadSettings();

  // Set default clock color CSS vars so they always exist
  resetClockColor();

  // Apply theme (wallpaper or minimal dark) based on loaded settings
  applyTheme(DISP_CFG.theme || 'default', DISP_CFG.wallpaperIntervalMs || 30000);

  const now = new Date();
  todayKey  = dateKey(now);

  // Static setup (runs once)
  updateLocation();
  updateDates(now);

  // Load prayer times (async — local first, API in background)
  await loadPrayerTimes(now);

  // Live clock — tick every second
  tickClock(); // run immediately
  setInterval(tickClock, 1000);

  // Quran verse rotation
  startVerseRotation();

  // UX
  setupCursorHide();
  setupKeyboardShortcuts();
  setupSettingsModal();

  console.log('[App] Ready. Location:', LOC.city, '| Method:', CALC_METHOD);
}

// ─────────────────────────────────────────────────────────────
//  Entry point
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
