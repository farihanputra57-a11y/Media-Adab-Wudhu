window.AudioEngine = (function () {
  let ctx = null;
  let masterGain = null;
  let reverbNode = null;
  let dryGain = null;
  let wetGain = null;

  let bgmPlaying = false;
  let bgmVolume = 0.34;
  let isDucked = false;
  let bgmTimer = null;
  let beatStep = 0;
  let currentTheme = "home";

  let customBgmAudio = null;
  let customBgmUrl = null;

  // 5 Distinct Serene Islamic Ambient BGM Themes (one unique theme per tab!)
  const BGM_THEMES = {
    home: {
      stepMs: 660,
      chords: [
        { pad: [146.83, 220.0, 261.63, 329.63], arp: [293.66, 349.23, 440.0, 523.25, 440.0, 349.23, 329.63, 293.66] },
        { pad: [130.81, 196.0, 261.63, 329.63], arp: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.63, 261.63] },
        { pad: [116.54, 174.61, 233.08, 293.66], arp: [233.08, 293.66, 349.23, 440.0, 349.23, 293.66, 261.63, 233.08] },
        { pad: [110.0,  164.81, 220.0,  293.66], arp: [220.0,  293.66, 329.63, 440.0, 329.63, 293.66, 277.18, 220.0] }
      ],
      melody: [
        587.33, null, null, 659.25, 587.33, null, 523.25, null,
        523.25, null, null, 587.33, 523.25, null, 440.0,  null,
        466.16, null, null, 523.25, 466.16, null, 440.0,  null,
        440.0,  null, 392.0, null,  440.0,  null, null,   null
      ]
    },
    learn: {
      // Calm G-Hijaz meditative atmosphere for watching animations
      stepMs: 720,
      chords: [
        { pad: [196.0, 246.94, 293.66, 392.0], arp: [392.0, 415.30, 493.88, 587.33, 493.88, 415.30, 392.0, 293.66] },
        { pad: [155.56, 196.0, 233.08, 311.13], arp: [311.13, 392.0, 466.16, 587.33, 466.16, 392.0, 349.23, 311.13] },
        { pad: [174.61, 220.0, 261.63, 349.23], arp: [349.23, 415.30, 493.88, 523.25, 493.88, 415.30, 349.23, 293.66] },
        { pad: [196.0, 246.94, 293.66, 392.0], arp: [392.0, 493.88, 587.33, 493.88, 415.30, 392.0, 349.23, 392.0] }
      ],
      melody: [
        783.99, null, null, 698.46, 622.25, null, 587.33, null,
        622.25, null, 587.33, null, 493.88, null, null, null,
        523.25, null, null, 587.33, 493.88, null, 415.30, null,
        392.0,  null, null, null,   493.88, null, null, null
      ]
    },
    gayung: {
      // Flowing C-Pentatonic / A-minor water-harp shimmer
      stepMs: 620,
      chords: [
        { pad: [220.0, 261.63, 329.63, 392.0], arp: [440.0, 523.25, 659.25, 523.25, 440.0, 392.0, 329.63, 392.0] },
        { pad: [174.61, 220.0, 261.63, 329.63], arp: [349.23, 440.0, 523.25, 659.25, 523.25, 440.0, 392.0, 349.23] },
        { pad: [130.81, 196.0, 261.63, 329.63], arp: [261.63, 329.63, 392.0, 523.25, 587.33, 523.25, 392.0, 329.63] },
        { pad: [196.0, 246.94, 293.66, 392.0], arp: [392.0, 493.88, 587.33, 523.25, 493.88, 392.0, 329.63, 293.66] }
      ],
      melody: [
        659.25, null, 587.33, null, 523.25, null, 440.0, null,
        523.25, null, null, 587.33, 523.25, null, null, null,
        783.99, null, 659.25, null, 587.33, null, 523.25, null,
        587.33, null, 493.88, null, 440.0, null, null, null
      ]
    },
    kinesthetic: {
      // Brighter gentle rhythmic E-minor pulse for active student movement
      stepMs: 540,
      chords: [
        { pad: [164.81, 246.94, 293.66, 329.63], arp: [329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 440.0, 392.0] },
        { pad: [130.81, 196.0, 246.94, 329.63], arp: [261.63, 329.63, 392.0, 493.88, 523.25, 493.88, 392.0, 329.63] },
        { pad: [146.83, 220.0, 293.66, 369.99], arp: [293.66, 369.99, 440.0, 587.33, 440.0, 369.99, 329.63, 293.66] },
        { pad: [164.81, 246.94, 329.63, 392.0], arp: [329.63, 392.0, 493.88, 659.25, 493.88, 392.0, 369.99, 329.63] }
      ],
      melody: [
        659.25, null, 739.99, null, 783.99, null, 659.25, null,
        523.25, null, 587.33, null, 659.25, null, null, null,
        587.33, null, 659.25, null, 739.99, null, 587.33, null,
        659.25, null, null, 587.33, 493.88, null, null, null
      ]
    },
    quiz: {
      // Ultra-calm minimalist F-major concentration atmosphere
      stepMs: 820,
      chords: [
        { pad: [174.61, 220.0, 261.63, 329.63], arp: [349.23, null, 440.0, null, 523.25, null, 440.0, null] },
        { pad: [146.83, 220.0, 261.63, 349.23], arp: [293.66, null, 349.23, null, 440.0, null, 349.23, null] },
        { pad: [116.54, 174.61, 220.0, 293.66], arp: [233.08, null, 293.66, null, 349.23, null, 293.66, null] },
        { pad: [130.81, 196.0, 261.63, 329.63], arp: [261.63, null, 329.63, null, 392.0, null, 329.63, null] }
      ],
      melody: [
        523.25, null, null, null, 587.33, null, null, null,
        440.0,  null, null, null, null,   null, null, null,
        466.16, null, null, null, 440.0,  null, null, null,
        392.0,  null, null, null, 349.23, null, null, null
      ]
    }
  };

  // ==================== INDEXEDDB STORAGE ====================
  const DB_NAME = "AdabWudhuAudioDB";
  const STORE_NAME = "clips";
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
    return dbPromise;
  }

  async function saveClip(key, blob) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(blob, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      return false;
    }
  }

  async function loadClip(key) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return null;
    }
  }

  async function deleteClip(key) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      return false;
    }
  }

  // ==================== WEB AUDIO STUDIO GRAPH ====================
  function createReverbImpulse(audioCtx, duration = 2.6, decay = 2.8) {
    const rate = audioCtx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = audioCtx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const env = Math.pow(1 - i / length, decay);
        data[i] = (Math.random() * 2 - 1) * env * 0.45;
      }
    }
    return impulse;
  }

  function ensureCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();

      masterGain = ctx.createGain();
      masterGain.gain.value = getEffectiveBgmGain();

      reverbNode = ctx.createConvolver();
      reverbNode.buffer = createReverbImpulse(ctx, 2.5, 2.6);

      dryGain = ctx.createGain();
      dryGain.gain.value = 0.62;

      wetGain = ctx.createGain();
      wetGain.gain.value = 0.45;

      dryGain.connect(masterGain);
      reverbNode.connect(wetGain);
      wetGain.connect(masterGain);
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function getEffectiveBgmGain() {
    const duckFactor = isDucked ? 0.24 : 1.0;
    return Math.max(0.0001, bgmVolume * duckFactor);
  }

  function updateMasterGainSmooth() {
    const target = getEffectiveBgmGain();
    if (ctx && masterGain) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.22);
    }
    if (customBgmAudio) {
      customBgmAudio.volume = Math.min(1, target);
    }
  }

  function duckBgm(duck) {
    isDucked = Boolean(duck);
    updateMasterGainSmooth();
  }

  function playWarmPad(freqs, duration = 5.4) {
    const c = ensureCtx();
    const now = c.currentTime;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(680, now);
    filter.Q.value = 0.7;

    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.065, now + 1.3);
    env.gain.setValueAtTime(0.055, now + duration - 1.5);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    freqs.forEach((f, idx) => {
      const osc = c.createOscillator();
      osc.type = idx % 2 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(f, now);
      osc.detune.setValueAtTime(idx % 2 === 0 ? -4 : 4, now);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + duration + 0.1);
    });

    filter.connect(env);
    env.connect(dryGain);
    env.connect(reverbNode);
  }

  function playOudArp(freq, pan = 0) {
    const c = ensureCtx();
    const now = c.currentTime;
    const dur = 1.9;

    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, now);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, now);

    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1900, now);
    filter.frequency.exponentialRampToValueAtTime(420, now + dur);

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    const panner = c.createStereoPanner ? c.createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(pan, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);

    if (panner) {
      gain.connect(panner);
      panner.connect(dryGain);
      panner.connect(reverbNode);
    } else {
      gain.connect(dryGain);
      gain.connect(reverbNode);
    }

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.05);
    osc2.stop(now + dur + 0.05);
  }

  function playNeyFlute(freq, duration = 1.65) {
    const c = ensureCtx();
    const now = c.currentTime;

    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 0.992, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.14);

    // Subtle breathy vibrato
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.setValueAtTime(4.8, now);
    lfoGain.gain.setValueAtTime(2.6, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq, now);
    filter.Q.value = 1.4;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.25);
    gain.gain.setValueAtTime(0.055, now + duration - 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dryGain);
    gain.connect(reverbNode);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + duration + 0.08);
    lfo.stop(now + duration + 0.08);
  }

  function playBellNote(freq, pan = 0) {
    const c = ensureCtx();
    const now = c.currentTime;
    const dur = 2.2;
    const osc = c.createOscillator();
    const overtone = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(freq * 2.756, now); // crisp kalimba/bell harmonic

    const g1 = c.createGain();
    g1.gain.setValueAtTime(0.0001, now);
    g1.gain.linearRampToValueAtTime(0.095, now + 0.015);
    g1.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.0001, now);
    g2.gain.linearRampToValueAtTime(0.028, now + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    const panner = c.createStereoPanner ? c.createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(pan, now);

    osc.connect(g1);
    overtone.connect(g2);
    if (panner) {
      g1.connect(panner);
      g2.connect(panner);
      panner.connect(dryGain);
      panner.connect(reverbNode);
    } else {
      g1.connect(dryGain);
      g2.connect(reverbNode);
    }
    osc.start(now);
    overtone.start(now);
    osc.stop(now + dur + 0.05);
    overtone.stop(now + 0.7);
  }

  function playWaterDrop(freq, pan = 0) {
    const c = ensureCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = "sine";
    // Classic gentle water-droplet upward pitch blip
    osc.frequency.setValueAtTime(freq * 0.78, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.18, now + 0.14);

    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.09, now + 0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    const panner = c.createStereoPanner ? c.createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(pan, now);

    osc.connect(g);
    if (panner) {
      g.connect(panner);
      panner.connect(dryGain);
      panner.connect(reverbNode);
    } else {
      g.connect(reverbNode);
    }
    osc.start(now);
    osc.stop(now + 0.46);
  }

  function playSoftDaf(isDum = true) {
    const c = ensureCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = isDum ? "sine" : "triangle";
    if (isDum) {
      osc.frequency.setValueAtTime(118, now);
      osc.frequency.exponentialRampToValueAtTime(58, now + 0.16);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.16, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    } else {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.075, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    }
    osc.connect(g);
    g.connect(dryGain);
    g.connect(reverbNode);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  function playSoftPiano(freqs) {
    const c = ensureCtx();
    const now = c.currentTime;
    const dur = 3.2;
    freqs.forEach((f, idx) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f * 2, now); // warm Rhodes octave
      const g = c.createGain();
      const offset = idx * 0.045;
      g.gain.setValueAtTime(0.0001, now + offset);
      g.gain.linearRampToValueAtTime(0.045, now + offset + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + offset + dur);
      osc.connect(g);
      g.connect(dryGain);
      g.connect(reverbNode);
      osc.start(now + offset);
      osc.stop(now + offset + dur + 0.05);
    });
  }

  function startBgm(themeName) {
    if (themeName && BGM_THEMES[themeName]) {
      currentTheme = themeName;
    }
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
    bgmPlaying = true;
    ensureCtx();
    const theme = BGM_THEMES[currentTheme] || BGM_THEMES.home;
    const stepMs = theme.stepMs;
    const tick = () => {
      if (!bgmPlaying) return;
      const activeTheme = BGM_THEMES[currentTheme] || BGM_THEMES.home;
      const stepInCycle = beatStep % 32;
      const barIdx = Math.floor(stepInCycle / 8);
      const stepInBar = stepInCycle % 8;
      const chord = activeTheme.chords[barIdx];
      const arpFreq = chord.arp[stepInBar];
      const pan = stepInBar % 2 === 0 ? -0.32 : 0.32;

      if (currentTheme === "home") {
        // 🏠 Beranda: Warm Pad + Plucked Oud + Breathy Ney Flute
        if (stepInBar === 0) playWarmPad(chord.pad, (activeTheme.stepMs * 8.2) / 1000);
        if (arpFreq) playOudArp(arpFreq, pan);
        const ney = activeTheme.melody[stepInCycle];
        if (ney && beatStep >= 2) playNeyFlute(ney, 1.55);
      } else if (currentTheme === "learn") {
        // 🎬 Animasi 8 Segmen: Shimmering Kalimba/Music-Box Bells + Airy Pad
        if (stepInBar === 0) playWarmPad(chord.pad, (activeTheme.stepMs * 8.2) / 1000);
        if (arpFreq && stepInBar % 2 === 0) playBellNote(arpFreq * 1.5, pan);
        const mel = activeTheme.melody[stepInCycle];
        if (mel) playBellNote(mel, -pan);
      } else if (currentTheme === "gayung") {
        // 🪣 Wudhu Gayung: Refreshing Water-Droplet Plucks + Flowing Harp
        if (stepInBar === 0) playWarmPad(chord.pad, (activeTheme.stepMs * 8.2) / 1000);
        if (arpFreq) playWaterDrop(arpFreq * 1.5, pan);
        const mel = activeTheme.melody[stepInCycle];
        if (mel) playOudArp(mel, -pan);
      } else if (currentTheme === "kinesthetic") {
        // ✋ Zona Kinestetik: Upbeat Soft Rebana/Daf Percussion Groove + Rhythmic Oud
        if (stepInBar === 0 || stepInBar === 4) playSoftDaf(true);
        if (stepInBar === 2 || stepInBar === 6 || stepInBar === 7) playSoftDaf(false);
        if (arpFreq) playOudArp(arpFreq, pan);
        const mel = activeTheme.melody[stepInCycle];
        if (mel) playBellNote(mel, 0);
      } else {
        // ✅ Cek Pemahaman: Calm Study Rhodes Piano Chords (Fokus Khusyuk)
        if (stepInBar === 0) playSoftPiano(chord.pad);
        if (arpFreq && stepInBar === 4) playBellNote(arpFreq, pan * 0.5);
      }

      beatStep++;
    };
    tick();
    bgmTimer = setInterval(tick, stepMs);
  }

  function setBgmTheme(themeName) {
    const next = BGM_THEMES[themeName] ? themeName : "home";
    if (next === currentTheme && bgmPlaying) return;
    currentTheme = next;
    beatStep = 0;
    startBgm(currentTheme);
  }

  function stopBgm() {
    bgmPlaying = false;
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
    if (customBgmAudio) {
      customBgmAudio.pause();
    }
  }

  function toggleBgm() {
    if (bgmPlaying) stopBgm();
    else startBgm();
    return bgmPlaying;
  }

  function setVolume(val) {
    bgmVolume = Math.max(0, Math.min(1, val));
    updateMasterGainSmooth();
  }

  async function setCustomBgm(fileBlob) {
    if (customBgmUrl) URL.revokeObjectURL(customBgmUrl);
    customBgmUrl = URL.createObjectURL(fileBlob);
    if (customBgmAudio) customBgmAudio.pause();
    customBgmAudio = new Audio(customBgmUrl);
    customBgmAudio.loop = true;
    customBgmAudio.volume = getEffectiveBgmGain();
    await saveClip("custom_bgm", fileBlob);
    if (bgmPlaying) {
      stopBgm();
      startBgm();
    }
  }

  async function resetCustomBgm() {
    if (customBgmAudio) {
      customBgmAudio.pause();
      customBgmAudio = null;
    }
    if (customBgmUrl) {
      URL.revokeObjectURL(customBgmUrl);
      customBgmUrl = null;
    }
    await deleteClip("custom_bgm");
    if (bgmPlaying) {
      stopBgm();
      startBgm();
    }
  }

  function playChime(type = "ok") {
    try {
      const c = ensureCtx();
      const now = c.currentTime;
      const freqs =
        type === "ok" ? [523.25, 659.25] :
        type === "win" ? [523.25, 659.25, 783.99] :
        type === "beat" ? [440] :
        [311.13, 277.18];

      freqs.forEach((f, idx) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.11);
        g.gain.setValueAtTime(0.0001, now + idx * 0.11);
        g.gain.linearRampToValueAtTime(0.1, now + idx * 0.11 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.32);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.35);
      });
    } catch (e) {}
  }

  async function initSavedBgm() {
    const saved = await loadClip("custom_bgm");
    if (saved) {
      customBgmUrl = URL.createObjectURL(saved);
      customBgmAudio = new Audio(customBgmUrl);
      customBgmAudio.loop = true;
      customBgmAudio.volume = getEffectiveBgmGain();
      return true;
    }
    return false;
  }

  // ==================== SKILLED AI VOICEOVER ENGINE ====================
  const synth = window.speechSynthesis || null;
  let availableVoices = [];
  let selectedVoiceURI = null;
  let speechRate = 1.0;
  let isSpeaking = false;
  let speakSessionId = 0;
  let stateListeners = [];

  function scoreVoice(v) {
    const name = (v.name || "").toLowerCase();
    const lang = (v.lang || "").toLowerCase();
    if (!lang.startsWith("id") && !name.includes("indones")) return -1;
    let score = 10;
    if (name.includes("ardi") && name.includes("natural")) score += 100; // Best male Neural AI Ustadz voice (Edge)
    if (name.includes("gadis") && name.includes("natural")) score += 92; // Best female Neural AI voice (Edge)
    if (name.includes("online") || name.includes("natural") || name.includes("neural")) score += 60;
    if (name.includes("google") && lang.startsWith("id")) score += 50;
    if (name.includes("ardi")) score += 30;
    if (lang === "id-id") score += 10;
    return score;
  }

  function refreshVoices() {
    if (!synth) return [];
    const all = synth.getVoices() || [];
    const idVoices = all
      .filter((v) => scoreVoice(v) > 0)
      .sort((a, b) => scoreVoice(b) - scoreVoice(a));

    availableVoices = idVoices.length ? idVoices : all.slice(0, 6);
    if (!selectedVoiceURI && availableVoices.length) {
      selectedVoiceURI = availableVoices[0].voiceURI;
    }
    return availableVoices;
  }

  function getVoices() {
    if (!availableVoices.length) refreshVoices();
    return availableVoices;
  }

  function setVoiceURI(uri) {
    selectedVoiceURI = uri;
  }

  function getSelectedVoiceURI() {
    if (!selectedVoiceURI) refreshVoices();
    return selectedVoiceURI;
  }

  function setSpeechRate(rate) {
    speechRate = Math.max(0.75, Math.min(1.25, Number(rate) || 1.0));
    if (masterVoiceAudio) {
      masterVoiceAudio.playbackRate = speechRate;
    }
  }

  function notifySpeaking(speaking) {
    isSpeaking = speaking;
    duckBgm(speaking);
    stateListeners.forEach((fn) => fn(speaking));
  }

  function onSpeakingChange(fn) {
    stateListeners.push(fn);
  }

  // ==================== STUDIO MP3 RANGE PLAYER ====================
  let masterVoiceAudio = null;
  let rangeEndSec = null;
  let rangeStartSec = 0;
  let rangeRaf = null;
  let progressListeners = [];

  function onProgressChange(fn) {
    progressListeners.push(fn);
  }

  function notifyProgress(pct) {
    progressListeners.forEach((fn) => fn(pct));
  }

  function stopMp3Range() {
    if (rangeRaf) {
      cancelAnimationFrame(rangeRaf);
      rangeRaf = null;
    }
    if (masterVoiceAudio) {
      masterVoiceAudio.pause();
    }
    rangeEndSec = null;
    notifyProgress(0);
  }

  function playMp3Range(src, startSec, endSec, fallbackText) {
    stopVoice();
    const mySession = ++speakSessionId;

    if (!masterVoiceAudio || masterVoiceAudio.dataset.src !== src) {
      masterVoiceAudio = new Audio(src);
      masterVoiceAudio.dataset.src = src;
      masterVoiceAudio.preload = "auto";
    }

    rangeStartSec = Math.max(0, Number(startSec) || 0);
    rangeEndSec = Number(endSec) || null;
    masterVoiceAudio.playbackRate = speechRate;

    const triggerFallback = () => {
      if (mySession !== speakSessionId) return;
      masterVoiceAudio = null;
      if (fallbackText) {
        speakText(fallbackText);
      } else {
        notifySpeaking(false);
        notifyProgress(0);
      }
    };

    masterVoiceAudio.onerror = () => {
      triggerFallback();
    };

    const beginPlay = () => {
      if (mySession !== speakSessionId) return;
      try {
        masterVoiceAudio.currentTime = rangeStartSec;
      } catch (e) {}

      const p = masterVoiceAudio.play();
      notifySpeaking(true);

      const monitor = () => {
        if (mySession !== speakSessionId || !masterVoiceAudio || masterVoiceAudio.paused) return;
        const cur = masterVoiceAudio.currentTime;
        const effectiveEnd = rangeEndSec || masterVoiceAudio.duration || (rangeStartSec + 10);
        const span = Math.max(0.5, effectiveEnd - rangeStartSec);
        const pct = Math.max(0, Math.min(100, ((cur - rangeStartSec) / span) * 100));
        notifyProgress(pct);

        if ((rangeEndSec && cur >= rangeEndSec) || masterVoiceAudio.ended) {
          masterVoiceAudio.pause();
          notifyProgress(100);
          setTimeout(() => {
            if (mySession === speakSessionId) notifyProgress(0);
          }, 350);
          notifySpeaking(false);
          return;
        }
        rangeRaf = requestAnimationFrame(monitor);
      };
      rangeRaf = requestAnimationFrame(monitor);

      if (p && typeof p.catch === "function") {
        p.catch(() => {
          triggerFallback();
        });
      }
    };

    if (masterVoiceAudio.error) {
      triggerFallback();
      return true;
    }

    if (masterVoiceAudio.readyState >= 1) {
      beginPlay();
    } else {
      masterVoiceAudio.onloadedmetadata = () => {
        masterVoiceAudio.onloadedmetadata = null;
        beginPlay();
      };
      masterVoiceAudio.load();
    }
    return true;
  }

  function stopVoice() {
    speakSessionId++;
    stopMp3Range();
    if (synth) {
      try { synth.cancel(); } catch (e) {}
    }
    notifySpeaking(false);
  }

  function speakText(text) {
    if (!synth || !text) return false;
    stopVoice();
    const mySession = ++speakSessionId;

    const voices = getVoices();
    const chosen = voices.find((v) => v.voiceURI === selectedVoiceURI) || voices[0] || null;

    // Split into natural phrases so the AI pauses cleanly and sounds expressive
    const chunks = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!chunks.length) return false;
    notifySpeaking(true);

    let idx = 0;
    const speakNext = () => {
      if (mySession !== speakSessionId) return;
      if (idx >= chunks.length) {
        notifySpeaking(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(chunks[idx]);
      utter.lang = "id-ID";
      utter.rate = speechRate;
      utter.pitch = 0.98;
      if (chosen) utter.voice = chosen;

      utter.onend = () => {
        if (mySession !== speakSessionId) return;
        idx++;
        setTimeout(speakNext, 220);
      };
      utter.onerror = () => {
        if (mySession !== speakSessionId) return;
        notifySpeaking(false);
      };
      synth.speak(utter);
    };

    speakNext();
    return true;
  }

  if (synth && typeof synth.onvoiceschanged !== "undefined") {
    synth.onvoiceschanged = () => {
      refreshVoices();
    };
  }

  return {
    startBgm,
    setBgmTheme,
    toggleBgm,
    stopBgm,
    setVolume,
    duckBgm,
    setCustomBgm,
    resetCustomBgm,
    initSavedBgm,
    playChime,
    saveClip,
    loadClip,
    deleteClip,
    // AI Voice API
    getVoices,
    refreshVoices,
    setVoiceURI,
    getSelectedVoiceURI,
    setSpeechRate,
    speakText,
    playMp3Range,
    stopVoice,
    isSpeaking: () => isSpeaking,
    onSpeakingChange,
    onProgressChange
  };
})();
