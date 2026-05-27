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
  // --- EXISTING SAMPLES ---
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
  },

  // --- ADDITIONAL QURANIC ENTRIES ---
  {
    type: 'quran',
    arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful.',
    reference: 'Surah Al-Fatiha 1:1'
  },
  {
    type: 'quran',
    arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    translation: 'All praise is due to Allah, Lord of all the worlds.',
    reference: 'Surah Al-Fatiha 1:2'
  },
  {
    type: 'quran',
    arabic: 'وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ',
    translation: 'Seek help through patience and prayer. Indeed, Allah is with the patient.',
    reference: 'Surah Al-Baqarah 2:153'
  },
  {
    type: 'quran',
    arabic: 'حَٰفِظُوا۟ عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ',
    translation: 'Guard strictly your prayers, especially the middle prayer.',
    reference: 'Surah Al-Baqarah 2:238'
  },
  {
    type: 'quran',
    arabic: 'وَلَذِكْرُ ٱللَّهِ أَكْبَرُ',
    translation: 'And the remembrance of Allah is the greatest.',
    reference: 'Surah Al-Ankabut 29:45'
  },
  {
    type: 'quran',
    arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    translation: 'Verily, in the remembrance of Allah do hearts find rest.',
    reference: 'Surah Ar-Ra\'d 13:28'
  },
  {
    type: 'quran',
    arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
    translation: 'And He is with you wherever you are.',
    reference: 'Surah Al-Hadid 57:4'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ ٱللَّهَ لَا يُضِيعُ أَجْرَ ٱلْمُحْسِنِينَ',
    translation: 'Indeed, Allah does not waste the reward of the doers of good.',
    reference: 'Surah At-Tawbah 9:120'
  },
  {
    type: 'quran',
    arabic: 'وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا',
    translation: 'And whoever fears Allah — He will make a way out for him.',
    reference: 'Surah At-Talaq 65:2'
  },
  {
    type: 'quran',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهو حَسْبُهُۥٓ',
    translation: 'And whoever relies upon Allah — then He is sufficient for him.',
    reference: 'Surah At-Talaq 65:3'
  },
  {
    type: 'quran',
    arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ',
    translation: 'Remember Me, and I will remember you.',
    reference: 'Surah Al-Baqarah 2:152'
  },
  {
    type: 'quran',
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ',
    translation: 'And when My servants ask about Me — indeed I am near.',
    reference: 'Surah Al-Baqarah 2:186'
  },
  {
    type: 'quran',
    arabic: 'رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْآخِرَةِ حَسَنَةً',
    translation: 'Our Lord, give us good in this world and good in the Hereafter.',
    reference: 'Surah Al-Baqarah 2:201'
  },
  {
    type: 'quran',
    arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not burden a soul beyond that it can bear.',
    reference: 'Surah Al-Baqarah 2:286'
  },
  {
    type: 'quran',
    arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
    translation: 'Say: He is Allah, the One.',
    reference: 'Surah Al-Ikhlas 112:1'
  },
  {
    type: 'quran',
    arabic: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ',
    translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of all existence.',
    reference: 'Surah Al-Baqarah 2:255'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ ٱللَّهَ كَانَ عَلِيمًا حَكِيمًا',
    translation: 'Indeed, Allah is ever Knowing and Wise.',
    reference: 'Surah An-Nisa 4:11'
  },
  {
    type: 'quran',
    arabic: 'وَبِٱلْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ',
    translation: 'And in the hours before dawn they would ask forgiveness.',
    reference: 'Surah Adh-Dhariyat 51:18'
  },
  {
    type: 'quran',
    arabic: 'وَأَقِمِ ٱلصَّلَوٰةَ إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ',
    translation: 'Establish prayer. Indeed, prayer prohibits immorality and wrongdoing.',
    reference: 'Surah Al-Ankabut 29:45'
  },
  {
    type: 'quran',
    arabic: 'وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ ٱلشَّمْسِ وَقَبْلَ غُرُوبِهَا',
    translation: 'Glorify the praises of your Lord before sunrise and before sunset.',
    reference: 'Surah Taha 20:130'
  },
  {
    type: 'quran',
    arabic: 'تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ',
    translation: 'Blessed is He in whose hand is dominion, and He is over all things competent.',
    reference: 'Surah Al-Mulk 67:1'
  },
  {
    type: 'quran',
    arabic: 'وَٱعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ ٱلْيَقِينُ',
    translation: 'And worship your Lord until there comes to you the certainty.',
    reference: 'Surah Al-Hijr 15:99'
  },
  {
    type: 'quran',
    arabic: 'سُبْحَٰنَ رَبِّكَ رَبِّ ٱلْعِزَّةِ عَمَّا يَصِفُونَ',
    translation: 'Glory be to your Lord, the Lord of might, above what they describe.',
    reference: 'Surah As-Saffat 37:180'
  },
  {
    type: 'quran',
    arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    translation: 'If you are grateful, I will surely increase you.',
    reference: 'Surah Ibrahim 14:7'
  },
  {
    type: 'quran',
    arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    translation: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah."',
    reference: 'Surah Az-Zumar 39:53'
  },
  {
    type: 'quran',
    arabic: 'وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ',
    translation: 'And take provisions, but indeed, the best provision is righteousness.',
    reference: 'Surah Al-Baqarah 2:197'
  },
  {
    type: 'quran',
    arabic: 'عَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ',
    translation: 'Perhaps you hate a thing and it is good for you.',
    reference: 'Surah Al-Baqarah 2:216'
  },
  {
    type: 'quran',
    arabic: 'وَعَسَىٰ أَن تُحِبُّوا شَيْئًا وَهُوَ شَرٌّ لَّكُمْ ۗ وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ',
    translation: 'And perhaps you love a thing and it is bad for you. And Allah knows, while you know not.',
    reference: 'Surah Al-Baqarah 2:216'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ',
    translation: 'Indeed, Allah loves those who are constantly repentant and loves those who purify themselves.',
    reference: 'Surah Al-Baqarah 2:222'
  },
  {
    type: 'quran',
    arabic: 'وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ',
    translation: 'And do good; indeed, Allah loves the doers of good.',
    reference: 'Surah Al-Baqarah 2:195'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ',
    translation: 'Indeed, Allah loves those who rely [upon Him].',
    reference: 'Surah Ali \'Imran 3:159'
  },
  {
    type: 'quran',
    arabic: 'فَاصْبِرْ صَبْرًا جَمِيلًا',
    translation: 'So be patient with a beautiful patience.',
    reference: 'Surah Al-Ma\'arij 70:5'
  },
  {
    type: 'quran',
    arabic: 'وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ',
    translation: 'And be patient, and your patience is not but through Allah.',
    reference: 'Surah An-Nahl 16:127'
  },
  {
    type: 'quran',
    arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا',
    translation: 'And those who strive for Us - We will surely guide them to Our ways.',
    reference: 'Surah Al-\'Ankabut 29:69'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا وَّالَّذِينَ هُم مُّحْسِنُونَ',
    translation: 'Indeed, Allah is with those who fear Him and those who are doers of good.',
    reference: 'Surah An-Nahl 16:128'
  },
  {
    type: 'quran',
    arabic: 'وَمَن يَقْتَرِفْ حَسَنَةً نَّزِدْ لَهُ فِيهَا حُسْنًا',
    translation: 'And whoever commits a good deed - We will increase for him good therein.',
    reference: 'Surah Ash-Shura 42:22'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ',
    translation: 'Indeed, good deeds do away with misdeeds.',
    reference: 'Surah Hud 11:114'
  },
  {
    type: 'quran',
    arabic: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ',
    translation: 'So whoever does an atom\'s weight of good will see it.',
    reference: 'Surah Az-Zalzalah 99:7'
  },
  {
    type: 'quran',
    arabic: 'وَقُولُوا لِلنَّاسِ حُسْنًا',
    translation: 'And speak to people good words.',
    reference: 'Surah Al-Baqarah 2:83'
  },
  {
    type: 'quran',
    arabic: 'ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ',
    translation: 'Repel [evil] by that [deed] which is better.',
    reference: 'Surah Fussilat 41:34'
  },
  {
    type: 'quran',
    arabic: 'وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ',
    translation: 'And who restrain anger and who pardon the people.',
    reference: 'Surah Ali \'Imran 3:134'
  },
  {
    type: 'quran',
    arabic: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ',
    translation: 'And when you have decided, then rely upon Allah.',
    reference: 'Surah Ali \'Imran 3:159'
  },
  {
    type: 'quran',
    arabic: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    translation: 'So do not weaken and do not grieve, and you will be superior if you are [true] believers.',
    reference: 'Surah Ali \'Imran 3:139'
  },
  {
    type: 'quran',
    arabic: 'إِن يَنصُرْكُمُ اللَّهِ فَلَا غَالِبَ لَكُمْ',
    translation: 'If Allah should aid you, no one can overcome you.',
    reference: 'Surah Ali \'Imran 3:160'
  },
  {
    type: 'quran',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
    translation: 'Our Lord, let not our hearts deviate after You have guided us.',
    reference: 'Surah Ali \'Imran 3:8'
  },
  {
    type: 'quran',
    arabic: 'يَا أَيُّهَا النَّاسُ أَنْتُمُ الْفُقَرَاءُ إِلَى اللَّهِ ۖ وَاللَّهُ هُوَ الْغَنِيُّ الْحَمِيدُ',
    translation: 'O mankind, you are those in need of Allah, while Allah is the Free of need, the Praiseworthy.',
    reference: 'Surah Fatir 35:15'
  },
  {
    type: 'quran',
    arabic: 'مَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُ حَيَاةً طَيِّبَةً',
    translation: 'Whoever does righteousness, whether male or female, while he is a believer - We will surely cause him to live a good life.',
    reference: 'Surah An-Nahl 16:97'
  },
  {
    type: 'quran',
    arabic: 'وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ',
    translation: 'And that there is not for man except that for which he strives.',
    reference: 'Surah An-Najm 53:39'
  },
  {
    type: 'quran',
    arabic: 'وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ',
    translation: 'And that his effort is going to be seen.',
    reference: 'Surah An-Najm 53:40'
  },
  {
    type: 'quran',
    arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
    translation: 'And your Lord is going to give you, and you will be satisfied.',
    reference: 'Surah Ad-Duha 93:5'
  },
  {
    type: 'quran',
    arabic: 'أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ',
    translation: 'Did He not find you an orphan and give [you] refuge?',
    reference: 'Surah Ad-Duha 93:6'
  },
  {
    type: 'quran',
    arabic: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ',
    translation: 'And He found you lost and guided [you].',
    reference: 'Surah Ad-Duha 93:7'
  },
  {
    type: 'quran',
    arabic: 'وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ',
    translation: 'And He found you poor and made [you] self-sufficient.',
    reference: 'Surah Ad-Duha 93:8'
  },
  {
    type: 'quran',
    arabic: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
    translation: 'Your Lord has not taken leave of you, nor has He detested you.',
    reference: 'Surah Ad-Duha 93:3'
  },
  {
    type: 'quran',
    arabic: 'وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ',
    translation: 'And the Hereafter is better for you than the first [life].',
    reference: 'Surah Ad-Duha 93:4'
  },
  {
    type: 'quran',
    arabic: 'وَجَعَلْنَا بَعْضَكُمْ لِبَعْضٍ فِتْنَةً أَتَصْبِرُونَ',
    translation: 'And We have made some of you as a trial for others - will you have patience?',
    reference: 'Surah Al-Furqan 25:20'
  },
  {
    type: 'quran',
    arabic: 'وَمَا كَانَ رَبُّكَ نَسِيًّا',
    translation: 'And never is your Lord forgetful.',
    reference: 'Surah Maryam 19:64'
  },
  {
    type: 'quran',
    arabic: 'قَالَ لَا تَخَافَا ۖ إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ',
    translation: 'He said, "Fear not. Indeed, I am with you both; I hear and I see."',
    reference: 'Surah Taha 20:46'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ رَبِّي Lَسَمِيعُ الدُّعَاءِ',
    translation: 'Indeed, my Lord is the Hearer of supplication.',
    reference: 'Surah Ibrahim 14:39'
  },
  {
    type: 'quran',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي',
    translation: 'My Lord, expand for me my breast [with assurance].',
    reference: 'Surah Taha 20:25'
  },
  {
    type: 'quran',
    arabic: 'وَيَسِّرْ لِي أَمْرِي',
    translation: 'And ease for me my task.',
    reference: 'Surah Taha 20:26'
  },
  {
    type: 'quran',
    arabic: 'وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي',
    translation: 'And untie the knot from my tongue.',
    reference: 'Surah Taha 20:27'
  },
  {
    type: 'quran',
    arabic: 'يَفْقَهُوا قَوْلِي',
    translation: 'That they may understand my speech.',
    reference: 'Surah Taha 20:28'
  },
  {
    type: 'quran',
    arabic: 'أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ',
    translation: '"Indeed, adversity has touched me, and you are the Most Merciful of the merciful."',
    reference: 'Surah Al-Anbiya 21:83'
  },
  {
    type: 'quran',
    arabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    translation: '"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."',
    reference: 'Surah Al-Anbiya 21:87'
  },
  {
    type: 'quran',
    arabic: 'فَاسْتَجَبْنَا لَهُ وَنَجَّيْنَاهُ مِنَ الْغَمِّ ۚ وَكَذَٰلِكَ نُنجِي الْمُؤْمِنِينَ',
    translation: 'So We answered him and delivered him from the distress. And thus do We save the believers.',
    reference: 'Surah Al-Anbiya 21:88'
  },
  {
    type: 'quran',
    arabic: 'رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ',
    translation: '"My Lord, do not leave me alone, while you are the best of inheritors."',
    reference: 'Surah Al-Anbiya 21:89'
  },
  {
    type: 'quran',
    arabic: 'وَخُلِقَ الْإِنسَانُ ضَعِيفًا',
    translation: 'And mankind was created weak.',
    reference: 'Surah An-Nisa 4:28'
  },
  {
    type: 'quran',
    arabic: 'يُرِيدُ اللَّهُ أَن يُخَفِّفَ عَنكُمْ',
    translation: 'Allah intends to lighten [the burden] for you.',
    reference: 'Surah An-Nisa 4:28'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ',
    translation: 'Indeed, the mercy of Allah is near to the doers of good.',
    reference: 'Surah Al-A\'raf 7:56'
  },
  {
    type: 'quran',
    arabic: 'وَأُفَوِّضُ أَمْرِي إِلَى اللَّهِ ۚ إِنَّ اللَّهَ بَصِيرٌ بِالْعِبَادِ',
    translation: 'And I entrust my affair to Allah. Indeed, Allah is Seeing of [His] servants.',
    reference: 'Surah Ghafir 40:44'
  },
  {
    type: 'quran',
    arabic: 'قُلْ لَنْ يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا',
    translation: 'Say, "Never will we be struck except by what Allah has decreed for us."',
    reference: 'Surah At-Tawbah 9:51'
  },
  {
    type: 'quran',
    arabic: 'هُوَ مَوْلَانَا ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ',
    translation: 'He is our protector; and upon Allah let the believers rely.',
    reference: 'Surah At-Tawbah 9:51'
  },
  {
    type: 'quran',
    arabic: 'وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ',
    translation: 'And rely upon the Ever-Living who does not die.',
    reference: 'Surah Al-Furqan 25:58'
  },
  {
    type: 'quran',
    arabic: 'الَّذِي خَلَقَنِي فَهُوَ يَهْدِينِ',
    translation: 'Who created me, and He [it is who] guides me.',
    reference: 'Surah Ash-Shu\'ara 26:78'
  },
  {
    type: 'quran',
    arabic: 'وَالَّذِي هُوَ يُطْعِمُنِي وَيَسْقِينِ',
    translation: 'And it is He who feeds me and gives me drink.',
    reference: 'Surah Ash-Shu\'ara 26:79'
  },
  {
    type: 'quran',
    arabic: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
    translation: 'And when I am ill, it is He who cures me.',
    reference: 'Surah Ash-Shu\'ara 26:80'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
    translation: 'Indeed, this Quran guides to that which is most suitable.',
    reference: 'Surah Al-Isra 17:9'
  },
  {
    type: 'quran',
    arabic: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
    translation: 'And We send down of the Quran that which is healing and mercy for the believers.',
    reference: 'Surah Al-Isra 17:82'
  },
  {
    type: 'quran',
    arabic: 'يَا أَيُّهَا الْإِنسَانُ مَا غَرَّكَ بِرَبِّكَ الْكَرِيمِ',
    translation: 'O mankind, what has deceived you concerning your Lord, the Generous?',
    reference: 'Surah Al-Infitar 82:6'
  },
  {
    type: 'quran',
    arabic: 'فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ أَنتَ وَلِيِّي فِي الدُّنْيَا وَالْآخِرَةِ',
    translation: 'Creator of the heavens and earth, You are my protector in this world and the Hereafter.',
    reference: 'Surah Yusuf 12:101'
  },
  {
    type: 'quran',
    arabic: 'تَوَفَّنِي مُسْلِمًا وَأَلْحِقْنِي بِالصَّالِحِينَ',
    translation: 'Cause me to die a Muslim and join me with the righteous.',
    reference: 'Surah Yusuf 12:101'
  },
  {
    type: 'quran',
    arabic: 'إِنَّ اللَّهَ مَعَنَا',
    translation: '"Do not grieve; indeed Allah is with us."',
    reference: 'Surah At-Tawbah 9:40'
  },
  {
    type: 'quran',
    arabic: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ',
    translation: 'And my success is not but through Allah. Upon Him I have relied, and to Him I return.',
    reference: 'Surah Hud 11:88'
  },

  // --- SAHIH HADITH ENTRIES (Words of Prophet Muhammad, peace be upon him) ---
  {
    type: 'hadith',
    arabic: 'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ',
    translation: 'Indeed, Allah is gentle and He loves gentleness.',
    reference: 'Sahih Muslim 2593'
  },
  {
    type: 'hadith',
    arabic: 'الدِّينُ النَّصِيحَةُ',
    translation: 'The religion is sincere advice.',
    reference: 'Sahih Muslim 55'
  },
  {
    type: 'hadith',
    arabic: 'لَا يَشْكُرُ اللَّهَ مَنْ لَا يَشْكُرُ النَّاسَ',
    translation: 'He who does not thank the people does not thank Allah.',
    reference: 'Sunan Abi Dawud 4811 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ',
    translation: 'A good word is a charitable act.',
    reference: 'Sahih al-Bukhari 2989'
  },
  {
    type: 'hadith',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    translation: 'Your smiling in the face of your brother is charity.',
    reference: 'Jami\' at-Tirmidhi 1956 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ',
    translation: 'A strong believer is better and more lovable to Allah than a weak believer.',
    reference: 'Sahih Muslim 2664'
  },
  {
    type: 'hadith',
    arabic: 'احْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجِزْ',
    translation: 'Cherish that which gives you benefit, seek help from Allah and do not lose heart.',
    reference: 'Sahih Muslim 2664'
  },
  {
    type: 'hadith',
    arabic: 'وَإِنْ أَصَابَكَ شَيْءٌ فَلَا تَقُلْ لَوْ أَنِّي فَعَلْتُ كَانَ كَذَا وَكَذَا',
    translation: 'If anything afflicts you, do not say: "If I had only done such and such..."',
    reference: 'Sahih Muslim 2664'
  },
  {
    type: 'hadith',
    arabic: 'قُلْ قَدَرُ اللَّهِ وَمَا شَاءَ فَعَلَ',
    translation: 'Say: "It is the decree of Allah and He does what He wills."',
    reference: 'Sahih Muslim 2664'
  },
  {
    type: 'hadith',
    arabic: 'يَسِّرُوا وَلَا تُعَسِّرُوا ، وَبَشِّرُوا وَلَا تُنَفِّرُوا',
    translation: 'Make things easy for people and do not make them difficult, give good tidings and do not repel them.',
    reference: 'Sahih al-Bukhari 6125'
  },
  {
    type: 'hadith',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best among you are those who learn the Quran and teach it.',
    reference: 'Sahih al-Bukhari 5027'
  },
  {
    type: 'hadith',
    arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ',
    translation: 'Fear Allah wherever you may be.',
    reference: 'Jami\' at-Tirmidhi 1987 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا',
    translation: 'Follow up a bad deed with a good deed and it will wipe it out.',
    reference: 'Jami\' at-Tirmidhi 1987 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
    translation: 'And behave towards the people with a good character.',
    reference: 'Jami\' at-Tirmidhi 1987 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'احْفَظِ اللَّهَ يَحْفَظْكَ',
    translation: 'Be mindful of Allah and He will protect you.',
    reference: 'Jami\' at-Tirmidhi 2516 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ',
    translation: 'Be mindful of Allah and you will find Him in front of you.',
    reference: 'Jami\' at-Tirmidhi 2516 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ',
    translation: 'When you ask, ask Allah [alone].',
    reference: 'Jami\' at-Tirmidhi 2516 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ',
    translation: 'And when you seek assistance, seek assistance from Allah.',
    reference: 'Jami\' at-Tirmidhi 2516 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'وَاعْلَمْ أَنَّ النَّصْرَ مَعَ الصَّبْرِ',
    translation: 'And know that victory comes with patience.',
    reference: 'Musnad Ahmad 2803 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'وَأَنَّ الْفَرَجَ مَعَ الْكَرْبِ',
    translation: 'And relief comes with distress.',
    reference: 'Musnad Ahmad 2803 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ',
    translation: 'The nearest a servant comes to his Lord is when he is prostrating.',
    reference: 'Sahih Muslim 482'
  },
  {
    type: 'hadith',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Whoever takes a path upon which to obtain knowledge, Allah makes the path to Paradise easy for him.',
    reference: 'Sahih Muslim 2699'
  },
  {
    type: 'hadith',
    arabic: 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    translation: 'Verily Allah does not look at your faces and your wealth, but He looks at your hearts and your deeds.',
    reference: 'Sahih Muslim 2564'
  },
  {
    type: 'hadith',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    translation: 'Whoever believes in Allah and the Last Day should speak what is good or keep quiet.',
    reference: 'Sahih al-Bukhari 6018'
  },
  {
    type: 'hadith',
    arabic: 'لاَ يَدْخُلُ الْجَنَّةَ مَنْ كَانَ فِي قَلْبِهِ مِثْقَالُ ذَرَّةٍ مِنْ كِبْرٍ',
    translation: 'He who has in his heart the weight of a mustard seed of pride shall not enter Paradise.',
    reference: 'Sahih Muslim 91'
  },
  {
    type: 'hadith',
    arabic: 'لَيْسَ الْغِنَى عَنْ كَثْرَةِ الْعَرَضِ وَلَكِنَّ الْغِنَى غِنَى النَّفْسِ',
    translation: 'Richness does not lie in the abundance of worldly goods, but true richness is the richness of the soul.',
    reference: 'Sahih al-Bukhari 6446'
  },
  {
    type: 'hadith',
    arabic: 'مَنْ لاَ يَرْحَمِ النَّاسَ لاَ يَرْحَمْهُ اللَّهُ',
    translation: 'He who does not show mercy to the people, Allah will not show mercy to him.',
    reference: 'Sahih Muslim 2319'
  },
  {
    type: 'hadith',
    arabic: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    translation: 'The most beloved of deeds to Allah are those that are most consistent, even if they are small.',
    reference: 'Sahih al-Bukhari 5861'
  },
  {
    type: 'hadith',
    arabic: 'مَنْ صَلَّى عَلَىَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا',
    translation: 'Whoever sends blessings upon me once, Allah will send blessings upon him ten times.',
    reference: 'Sahih Muslim 408'
  },
  {
    type: 'hadith',
    arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
    translation: 'Supplication (Dua) is the essence of worship.',
    reference: 'Jami\' at-Tirmidhi 2969 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'إِنَّ الدِّينَ يُسْرٌ',
    translation: 'Indeed, the religion is easy.',
    reference: 'Sahih al-Bukhari 39'
  },
  {
    type: 'hadith',
    arabic: 'طُوبَى لِمَنْ وَجَدَ فِي صَحِيفَتِهِ اسْتِغْفَارًا كَثِيرًا',
    translation: 'Glad tidings to him who finds a lot of seeking forgiveness in his record.',
    reference: 'Sunan Ibn Majah 3818 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    translation: 'Charity does not decrease wealth.',
    reference: 'Sahih Muslim 2588'
  },
  {
    type: 'hadith',
    arabic: 'وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلاَّ عِزًّا',
    translation: 'And Allah increases the honor of him who forgives.',
    reference: 'Sahih Muslim 2588'
  },
  {
    type: 'hadith',
    arabic: 'وَمَا تَواضَعَ أَحَدٌ لِلَّهِ إِلاَّ رَفَعَهُ اللَّهُ',
    translation: 'And no one humbles himself before Allah but Allah will exalt him.',
    reference: 'Sahih Muslim 2588'
  },
  {
    type: 'hadith',
    arabic: 'الْطهُورُ شَطْرُ الإِيمَانِ',
    translation: 'Purity is half of faith.',
    reference: 'Sahih Muslim 223'
  },
  {
    type: 'hadith',
    arabic: 'الْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ',
    translation: 'Saying "Al-Hamdulillah" (All praise belongs to Allah) fills the scale.',
    reference: 'Sahih Muslim 223'
  },
  {
    type: 'hadith',
    arabic: 'وَالصَّلاَةُ نُورٌ',
    translation: 'And prayer is a light.',
    reference: 'Sahih Muslim 223'
  },
  {
    type: 'hadith',
    arabic: 'وَالصَّدَقَةُ بُرْهَانٌ',
    translation: 'And charity is a proof of faith.',
    reference: 'Sahih Muslim 223'
  },
  {
    type: 'hadith',
    arabic: 'وَالصَّبْرُ ضِيَاءٌ',
    translation: 'And patience is a bright glow.',
    reference: 'Sahih Muslim 223'
  },
  {
    type: 'hadith',
    arabic: 'كُلُّ ابْنِ آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ',
    translation: 'Every son of Adam commits sin, and the best of those who commit sin are those who repent.',
    reference: 'Sunan Ibn Majah 4251 (Sahih)'
  },
  {
    type: 'hadith',
    arabic: 'لَا تُظْهِرِ الشَّمَاتَةَ لِأَخِيكَ فَيَرْحَمَهُ اللَّهُ وَيَبْتَلِيكَ',
    translation: 'Do not express joy at your brother\'s misfortune, lest Allah have mercy on him and afflict you.',
    reference: 'Jami\' at-Tirmidhi 2506 (Sahih)'
  }
];

// Export for use in renderer.js (CommonJS — Electron renderer with nodeIntegration)
if (typeof module !== 'undefined') module.exports = { CONFIG, ISLAMIC_DATABASE };
