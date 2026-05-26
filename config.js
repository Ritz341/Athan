/**
 * ============================================================
 *  Islamic Smart Clock — Configuration
 *  Edit this file to customise location, calculation method,
 *  audio volume, and display preferences.
 * ============================================================
 */

const CONFIG = {

  // ----------------------------------------------------------
  // LOCATION
  // Find your coordinates at: https://www.latlong.net/
  // ----------------------------------------------------------
  location: {
    latitude:  43.7001,   // e.g. Toronto, Canada
    longitude: -79.4163,
    city:      'Toronto', // displayed in UI (optional label)
  },

  // ----------------------------------------------------------
  // PRAYER CALCULATION METHOD
  // Supported values (adhan library method names):
  //   'NorthAmerica'           – ISNA (good for Canada/USA)
  //   'MuslimWorldLeague'      – MWL (Europe, Far East)
  //   'Egyptian'               – Egyptian General Authority
  //   'Karachi'                – Hanafi (South Asia)
  //   'UmmAlQura'              – Saudi Arabia / Makkah
  //   'Dubai'                  – UAE
  //   'Kuwait'                 – Kuwait
  //   'Qatar'                  – Qatar
  //   'Singapore'              – Singapore
  //   'Turkey'                 – Turkey
  //   'Tehran'                 – Iran (Shia)
  //   'MoonsightingCommittee'  – ISNA moonsighting
  // ----------------------------------------------------------
  calculationMethod: 'NorthAmerica',

  // ----------------------------------------------------------
  // ASR JURISTIC METHOD
  //   'Standard' – Shafi / Maliki / Hanbali (shadow = 1x)
  //   'Hanafi'   – Hanafi school           (shadow = 2x)
  // ----------------------------------------------------------
  asrMethod: 'Standard',

  // ----------------------------------------------------------
  // HIGH-LATITUDE RULE
  // Relevant for locations above ~48° N / S.
  // Options: 'None' | 'MiddleOfTheNight' | 'SeventhOfTheNight' | 'TwilightAngle'
  // ----------------------------------------------------------
  highLatitudeRule: 'MiddleOfTheNight',

  // ----------------------------------------------------------
  // AUDIO
  // Place your Adhan mp3 file at: assets/audio/Adhan.mp3
  // Free high-quality Adhans: https://www.islamicfinder.org/
  // ----------------------------------------------------------
  audio: {
    athanFile:      'Abdul-Basit.mp3',   // filename inside assets/audio/ (also have Yusuf-Islam.mp3)
    volume:         0.85,          // 0.0 – 1.0
    playForShuruq:  false,         // set true to play athan at sunrise too
    triggerWindowMs: 45000,        // fire athan if we're within this many ms of prayer time
  },

  // ----------------------------------------------------------
  // ALADHAN API (optional online sync)
  // The app works fully offline via adhan library.
  // Set enabled:true to sync times from Aladhan.com on startup.
  // API method numbers: 1=MWL, 2=ISNA, 3=Egypt, 4=Makkah, etc.
  // ----------------------------------------------------------
  api: {
    enabled:   true,
    method:    2,                   // ISNA — match calculationMethod above
    cacheFile: 'cache/prayer-times-cache.json',
    timeout:   5000,               // ms before falling back to adhan library
  },

  // ----------------------------------------------------------
  // DISPLAY
  // ----------------------------------------------------------
  display: {
    verseIntervalMs:  38000,  // milliseconds each Quran verse is shown (30–45 s)
    fadeMs:           1200,   // fade transition duration in ms
    cursorHideMs:     3000,   // ms of inactivity before cursor disappears
    showSeconds:      true,   // show seconds in the main clock
    clockFormat:      '12',   // '12' or '24'
  },

};

// ----------------------------------------------------------
// ISLAMIC DATABASE
// Collection of Quranic verses and Hadiths
// Easily extensible — add more entries following this structure
// ----------------------------------------------------------
const ISLAMIC_DATABASE = [
  {
    type: 'quran',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship [will be] ease.',
    reference: 'Surah Ash-Sharh 94:6'
  },
  {
    type: 'hadith',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    translation: 'Actions are according to intentions.',
    reference: 'Sahih al-Bukhari 1'
  },
  {
    type: 'quran',
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    translation: 'And say, "My Lord, increase me in knowledge."',
    reference: 'Surah Taha 20:114'
  }
  // You can easily paste 50+ more here following this exact structure!
];

// Export for use in renderer.js (CommonJS — Electron renderer with nodeIntegration)
if (typeof module !== 'undefined') module.exports = { CONFIG, ISLAMIC_DATABASE };
