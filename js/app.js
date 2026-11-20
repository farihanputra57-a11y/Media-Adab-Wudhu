(function () {
  const DATA = window.WUDHU_DATA;
  const AUDIO = window.AudioEngine;
  const ANIM = window.WudhuAnimator;

  const STORAGE_KEY = "adab_wudhu_web_state_v1";
  const RECORDS_KEY = "adab_wudhu_quiz_records_v1";
  const SHEETS_URL_KEY = "adab_wudhu_sheets_url_v1";
  const PROFILE_KEY = "adab_wudhu_student_profile_v1";

  const state = {
    view: "home",
    level: window.LOCKED_LEVEL === "smp" ? "smp" : "sd",
    studentProfile: null,
    gender: "male",
    teacherUnlocked: false,
    quizSubmitted: false,
    segIdx: 0,
    subIdx: 0,
    gayungIdx: 0,
    animPaused: false,
    zoomOpen: false,
    kinArea: "wajah",
    completedSegments: new Set(),
    foundHotspots: {
      wajah: new Set(),
      tangan: new Set(),
      kepala: new Set(),
      kaki: new Set()
    },
    quizAnswers: {},
    quizScore: null,
    segmentAudioUrls: {},
    activeRecorder: null,
    recordingSegId: null,
    tempoTimer: null,
    tempoHoldTimer: null,
    tempoRunning: false
  };

  // ==================== PERSISTENCE ====================
  // Setiap kali halaman dibuka/direfresh, progres pembelajaran selalu mulai bersih dari 0%
  // (Data rekap guru di RECORDS_KEY & koneksi Google Sheets tetap tersimpan aman).
  function loadState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function saveState() {
    // Sengaja hanya disimpan di memori sesi berjalan agar otomatis reset ke 0% saat dibuka ulang
  }

  function loadQuizRecords() {
    try {
      return JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveQuizRecords(list) {
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  // ==================== TOAST ====================
  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 2800);
  }

  // ==================== NAVIGATION ====================
  function switchView(viewName) {
    state.view = viewName;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === viewName);
    });

    if (viewName !== "kinesthetic") stopTempo();
    if (viewName !== "learn") AUDIO.stopVoice();
    AUDIO.setBgmTheme(viewName);
    if (viewName === "home") renderHome();
    if (viewName === "learn") renderLearn(true);
    if (viewName === "gayung") renderGayung();
    if (viewName === "kinesthetic") renderKinesthetic();
    if (viewName === "quiz") renderQuiz();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ==================== VIEW 1: BERANDA ====================
  function getMasteredKinCount() {
    return Object.keys(DATA.kinestheticAreas).filter((k) => {
      return state.foundHotspots[k].size >= DATA.kinestheticAreas[k].points.length;
    }).length;
  }

  function renderHome() {
    const segDone = state.completedSegments.size;
    const kinDone = getMasteredKinCount();
    const quizDone = state.quizScore !== null ? 1 : 0;
    const totalTasks = 8 + 4 + 1;
    const pct = Math.round(((segDone + kinDone + quizDone) / totalTasks) * 100);

    document.getElementById("home-progress-pct").textContent = `${pct}%`;
    const ring = document.getElementById("home-ring-fg");
    const circ = 314.16;
    ring.style.strokeDashoffset = String(circ - (circ * pct) / 100);

    document.getElementById("stat-segments").textContent = `${segDone} / 8`;
    document.getElementById("stat-kinesthetic").textContent = `${kinDone} / 4`;
    document.getElementById("stat-quiz").textContent =
      state.quizSubmitted ? "Terkirim ✓" : state.quizScore !== null ? "Selesai" : "Belum";

    const grid = document.getElementById("home-segment-grid");
    const lvlExtras = (DATA.levelSegmentExtras && DATA.levelSegmentExtras[state.level]) || {};
    grid.innerHTML = DATA.segments
      .map((seg, idx) => {
        const done = state.completedSegments.has(seg.id);
        const segSummary = (lvlExtras[seg.id] && lvlExtras[seg.id].summary) || seg.summary;
        return `
          <button class="seg-card ${done ? "done" : ""}" data-open-seg="${idx}" type="button">
            <div class="seg-card-top">
              <span class="seg-num-pill">Segmen ${seg.id}</span>
              <span class="seg-law-tag ${seg.isRukun ? "rukun" : "sunnah"}">${seg.law}</span>
            </div>
            <div class="seg-card-emoji">${seg.emoji}</div>
            <h3>${seg.title}</h3>
            <p>${segSummary}</p>
            <div class="seg-card-foot">
              <span>${seg.substeps.length} Animasi Gerakan</span>
              <span>${done ? "✓ Selesai" : "Buka →"}</span>
            </div>
          </button>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-open-seg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.segIdx = Number(btn.dataset.openSeg);
        state.subIdx = 0;
        state.zoomOpen = false;
        switchView("learn");
      });
    });
  }

  // ==================== VIEW 2: ANIMASI 8 SEGMEN ====================
  function resolveAsset(path) {
    return (window.ASSET_BASE || "") + path;
  }

  function speakCurrentSubstep() {
    const seg = DATA.segments[state.segIdx];
    const sub = seg.substeps[state.subIdx] || seg.substeps[0];
    const fallbackText = sub.narration || `${sub.title}. ${sub.desc}`;
    const range = DATA.substepAudioRanges && DATA.substepAudioRanges[sub.code];
    if (DATA.masterVoiceFile && range) {
      AUDIO.playMp3Range(resolveAsset(DATA.masterVoiceFile), range[0], range[1], fallbackText);
    } else {
      AUDIO.speakText(fallbackText);
    }
  }

  function speakCurrentSegment() {
    const seg = DATA.segments[state.segIdx];
    const allText = seg.substeps.map((s) => s.narration || `${s.title}. ${s.desc}`).join(" ");
    const range = DATA.segmentAudioRanges && DATA.segmentAudioRanges[seg.id];
    if (DATA.masterVoiceFile && range) {
      AUDIO.playMp3Range(resolveAsset(DATA.masterVoiceFile), range[0], range[1], allText);
    } else {
      speakCurrentSubstep();
    }
  }

  function renderLearn(shouldAutoSpeak = false) {
    const seg = DATA.segments[state.segIdx];
    const sub = seg.substeps[state.subIdx] || seg.substeps[0];

    // Stepper
    const stepper = document.getElementById("learn-seg-stepper");
    stepper.innerHTML = DATA.segments
      .map((s, i) => {
        const active = i === state.segIdx ? "active" : "";
        const done = state.completedSegments.has(s.id) ? "done" : "";
        return `<button class="step-pill ${active} ${done}" data-seg-idx="${i}" type="button">${s.id}. ${s.shortTitle}</button>`;
      })
      .join("");

    stepper.querySelectorAll("[data-seg-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.segIdx = Number(btn.dataset.segIdx);
        state.subIdx = 0;
        state.zoomOpen = false;
        renderLearn(true);
      });
    });

    // Header
    document.getElementById("stage-seg-num").textContent = `Segmen ${seg.id} / 8`;
    const lawBadge = document.getElementById("stage-seg-law");
    lawBadge.textContent = seg.law;
    lawBadge.className = `badge-law ${seg.isRukun ? "rukun" : ""}`;
    document.getElementById("learn-title").textContent = seg.title;

    // Zoom button visibility
    const zoomBtn = document.getElementById("btn-toggle-zoom");
    if (seg.zoomArea) {
      zoomBtn.classList.remove("hidden");
      zoomBtn.textContent = state.zoomOpen ? "✕ Tutup Zoom Batas" : "🔍 Zoom Batas Wajib";
    } else {
      zoomBtn.classList.add("hidden");
      state.zoomOpen = false;
    }

    // Substeps bar
    const subBar = document.getElementById("substep-bar");
    subBar.innerHTML = seg.substeps
      .map(
        (st, i) => `
          <button class="substep-btn ${i === state.subIdx ? "active" : ""}" data-sub-idx="${i}" type="button">
            ${i + 1}. ${st.title}
          </button>
        `
      )
      .join("");

    subBar.querySelectorAll("[data-sub-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.subIdx = Number(btn.dataset.subIdx);
        state.zoomOpen = false;
        renderLearn(true);
      });
    });

    // Dual Side-by-Side Cartoon Stages (Putra & Putri sekaligus)
    const stageMale = document.getElementById("cartoon-stage-male");
    const stageFemale = document.getElementById("cartoon-stage-female");
    if (stageMale) {
      stageMale.innerHTML = ANIM.renderScene(sub, "male");
      stageMale.classList.toggle("paused", state.animPaused);
    }
    if (stageFemale) {
      stageFemale.innerHTML = ANIM.renderScene(sub, "female");
      stageFemale.classList.toggle("paused", state.animPaused);
    }
    document.getElementById("btn-anim-play").textContent = state.animPaused ? "▶ Lanjutkan Animasi" : "⏸ Jeda Animasi";

    // Zoom Overlay
    const zoomOverlay = document.getElementById("zoom-overlay");
    if (state.zoomOpen && seg.zoomArea) {
      const areaData = DATA.kinestheticAreas[seg.zoomArea];
      document.getElementById("zoom-title").textContent = areaData.title;
      document.getElementById("zoom-canvas").innerHTML = ANIM.renderAnatomySvg(seg.zoomArea, false, new Set());
      document.getElementById("zoom-caption").textContent = areaData.caption;
      zoomOverlay.classList.remove("hidden");
    } else {
      zoomOverlay.classList.add("hidden");
    }

    // Substep details & nav
    document.getElementById("substep-counter").textContent = `Gerakan ${state.subIdx + 1} dari ${seg.substeps.length}`;
    document.getElementById("substep-title").textContent = sub.title;
    document.getElementById("substep-desc").textContent = sub.desc;

    const prevBtn = document.getElementById("btn-prev-sub");
    const nextBtn = document.getElementById("btn-next-sub");
    prevBtn.disabled = state.segIdx === 0 && state.subIdx === 0;
    const isLastAll = state.segIdx === DATA.segments.length - 1 && state.subIdx === seg.substeps.length - 1;
    nextBtn.textContent = isLastAll
      ? "Selesai → Zona Kinestetik"
      : state.subIdx < seg.substeps.length - 1
      ? "Gerakan Berikutnya →"
      : `Lanjut Segmen ${seg.id + 1} →`;

    // Doa Card
    const doaCard = document.getElementById("doa-card");
    if (seg.doa) {
      document.getElementById("doa-label").textContent = seg.doa.label;
      document.getElementById("doa-arabic").textContent = seg.doa.arabic;
      document.getElementById("doa-latin").textContent = seg.doa.latin;
      document.getElementById("doa-meaning").textContent = `Artinya: "${seg.doa.meaning}"`;
      doaCard.classList.remove("hidden");
    } else {
      doaCard.classList.add("hidden");
    }

    // Female-specific Fiqh Card (Selalu tampil di setiap segmen)
    const femaleCard = document.getElementById("female-fiqh-card");
    const femaleGuide = DATA.femaleSegmentGuides && DATA.femaleSegmentGuides[seg.id];
    if (femaleGuide && femaleCard) {
      document.getElementById("female-fiqh-title").textContent = femaleGuide.title;
      document.getElementById("female-fiqh-list").innerHTML = femaleGuide.points
        .map((pt) => `<li>${pt}</li>`)
        .join("");
      femaleCard.classList.remove("hidden");
    } else if (femaleCard) {
      femaleCard.classList.add("hidden");
    }

    // Adab & Water Tip (menyesuaikan jenjang SD/MI vs SMP/MTs)
    const lvlData = DATA.levelSegmentExtras && DATA.levelSegmentExtras[state.level] && DATA.levelSegmentExtras[state.level][seg.id];
    const adabItems = (lvlData && lvlData.adab) ? lvlData.adab : seg.adab;
    const adabTitle = document.getElementById("adab-card-title");
    const adabSub = document.getElementById("adab-card-sub");
    if (adabTitle) {
      adabTitle.textContent = state.level === "smp" ? "Fikih & Dalil Mazhab Syafi'i" : "Adab & Batas Wajib Wudhu";
    }
    if (adabSub) {
      adabSub.textContent =
        state.level === "smp"
          ? "🎓 Materi Tingkat SMP / MTs (Pendalaman Fikih & Kitab Rujukan)"
          : "🎒 Materi Tingkat SD / MI (Ringkas, Praktis & Ramah Anak)";
    }
    document.getElementById("adab-list").innerHTML = adabItems.map((item) => `<li>${item}</li>`).join("");
    document.getElementById("water-tip").textContent = seg.waterTip;

    // Optional custom MP3 if uploaded in Studio Guru
    const vocalUrl = state.segmentAudioUrls[seg.id];
    const vocalBox = document.getElementById("vocal-status-box");
    const vocalStatusText = document.getElementById("vocal-status-text");
    const audioPlayer = document.getElementById("segment-audio-player");

    if (vocalUrl) {
      vocalBox.classList.remove("hidden");
      vocalStatusText.textContent = `MP3 Tambahan Segmen ${seg.id} (Studio Guru):`;
      if (audioPlayer.src !== vocalUrl) {
        audioPlayer.src = vocalUrl;
      }
    } else {
      vocalBox.classList.add("hidden");
      audioPlayer.pause();
      audioPlayer.removeAttribute("src");
    }

    const autoChk = document.getElementById("chk-auto-narrate");
    if (shouldAutoSpeak && autoChk && autoChk.checked) {
      speakCurrentSubstep();
    }

    // Mark Done button
    const doneBtn = document.getElementById("btn-mark-seg-done");
    const isDone = state.completedSegments.has(seg.id);
    doneBtn.textContent = isDone ? "✓ Segmen Ini Sudah Ditandai Selesai" : "✓ Tandai Segmen Ini Sudah Dipahami";
  }

  // ==================== VIEW 2B: WUDHU GAYUNG ====================
  function renderGayung() {
    const steps = DATA.gayungSteps || [];
    if (!steps.length) return;
    const step = steps[state.gayungIdx] || steps[0];

    const stepper = document.getElementById("gayung-stepper");
    stepper.innerHTML = steps
      .map(
        (s, i) => `
          <button class="step-pill ${i === state.gayungIdx ? "active" : ""}" data-gayung-idx="${i}" type="button">
            ${s.id}. ${s.title.replace(/^\d+\.\s*/, "").split("(")[0].trim()}
          </button>
        `
      )
      .join("");

    stepper.querySelectorAll("[data-gayung-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.gayungIdx = Number(btn.dataset.gayungIdx);
        renderGayung();
      });
    });

    document.getElementById("gayung-step-num").textContent = `Langkah ${state.gayungIdx + 1} / ${steps.length}`;
    document.getElementById("gayung-step-badge").textContent = step.badge;
    document.getElementById("gayung-step-title").textContent = step.title;
    document.getElementById("gayung-step-summary").textContent = step.summary;
    document.getElementById("gayung-step-points").innerHTML = step.points.map((p) => `<li>${p}</li>`).join("");
    document.getElementById("gayung-step-tip").textContent = step.tip;

    const stage = document.getElementById("gayung-stage");
    if (stage && ANIM.renderGayungScene) {
      stage.innerHTML = ANIM.renderGayungScene(step);
    }

    document.getElementById("btn-gayung-prev").disabled = state.gayungIdx <= 0;
    document.getElementById("btn-gayung-next").disabled = state.gayungIdx >= steps.length - 1;
  }

  // ==================== VIEW 3: ZONA KINESTETIK ====================
  function renderKinesthetic() {
    document.querySelectorAll("#kin-area-tabs .kin-tab").forEach((btn) => {
      const key = btn.dataset.area;
      const done = state.foundHotspots[key].size >= DATA.kinestheticAreas[key].points.length;
      btn.classList.toggle("active", key === state.kinArea);
      const baseLabel = btn.textContent.replace(" ★", "");
      btn.textContent = done ? `${baseLabel} ★` : baseLabel;
    });

    const board = document.getElementById("hotspot-board");
    const foundSet = state.foundHotspots[state.kinArea];
    board.innerHTML = ANIM.renderAnatomySvg(state.kinArea, true, foundSet);

    const areaData = DATA.kinestheticAreas[state.kinArea];
    const fb = document.getElementById("hotspot-feedback");
    if (foundSet.size >= areaData.points.length) {
      fb.className = "hotspot-feedback complete";
      fb.textContent = `★ Hebat! Semua ${areaData.points.length} urutan batas wajib pada ${areaData.title} telah kamu temukan dengan benar.`;
    } else {
      const nextPt = areaData.points[foundSet.size];
      fb.className = "hotspot-feedback";
      fb.innerHTML = `<strong>Langkah ${foundSet.size + 1} dari ${areaData.points.length}:</strong> ${nextPt.prompt}`;
    }

    board.querySelectorAll(".hotspot-dot").forEach((dot) => {
      const handlePick = () => {
        const ptId = dot.dataset.pointId;
        const pt = areaData.points.find((p) => p.id === ptId);
        if (!pt) return;

        // Already discovered point -> show its description again
        if (foundSet.has(ptId)) {
          const fbNow = document.getElementById("hotspot-feedback");
          fbNow.className = foundSet.size >= areaData.points.length ? "hotspot-feedback complete" : "hotspot-feedback";
          fbNow.innerHTML = `<strong>${pt.title}:</strong> ${pt.desc}`;
          return;
        }

        // Strict sequential check: student must find the next point in order!
        const expectedPt = areaData.points[foundSet.size];
        if (expectedPt && pt.id !== expectedPt.id) {
          AUDIO.playChime("err");
          const fbWrong = document.getElementById("hotspot-feedback");
          fbWrong.className = "hotspot-feedback wrong";
          fbWrong.innerHTML = `❌ <strong>Belum tepat urutannya!</strong> ${expectedPt.prompt}`;
          return;
        }

        foundSet.add(ptId);
        saveState();
        const isAllDone = foundSet.size >= areaData.points.length;
        AUDIO.playChime(isAllDone ? "win" : "ok");
        renderKinesthetic();
        const fbNow = document.getElementById("hotspot-feedback");
        fbNow.className = isAllDone ? "hotspot-feedback complete" : "hotspot-feedback";
        const nextHint = !isAllDone ? `<br><span style="font-weight:700">Berikutnya: ${areaData.points[foundSet.size].prompt}</span>` : "";
        fbNow.innerHTML = `✅ <strong>${pt.title}:</strong> ${pt.desc}${nextHint}`;
        if (isAllDone) {
          showToast(`★ Bintang ${state.kinArea.toUpperCase()} terbuka!`);
        }
      };
      dot.addEventListener("click", handlePick);
      dot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePick();
        }
      });
    });

    // Populate tempo dropdown once from DATA.tempoExercises
    const select = document.getElementById("tempo-segment-select");
    if (!select.options.length && DATA.tempoExercises) {
      select.innerHTML = DATA.tempoExercises
        .map((ex, i) => `<option value="${i}">${ex.title}</option>`)
        .join("");
    }
    syncKin1Nav();
    syncTempoPreview();
  }

  const KIN_AREA_ORDER = ["wajah", "tangan", "kepala", "kaki"];

  function syncKin1Nav() {
    const idx = KIN_AREA_ORDER.indexOf(state.kinArea);
    const prev = document.getElementById("btn-kin1-prev");
    const next = document.getElementById("btn-kin1-next");
    const cnt = document.getElementById("kin1-counter");
    if (prev) prev.disabled = idx <= 0;
    if (next) next.disabled = idx >= KIN_AREA_ORDER.length - 1;
    if (cnt) cnt.textContent = `Area ${idx + 1} / ${KIN_AREA_ORDER.length}`;
  }

  function getSelectedTempoExercise() {
    const select = document.getElementById("tempo-segment-select");
    const idx = select ? Number(select.value) || 0 : 0;
    return (DATA.tempoExercises && DATA.tempoExercises[idx]) || DATA.tempoExercises[0];
  }

  function syncTempoPreview() {
    const select = document.getElementById("tempo-segment-select");
    const idx = select ? Number(select.value) || 0 : 0;
    const total = DATA.tempoExercises ? DATA.tempoExercises.length : 8;
    const ex = getSelectedTempoExercise();
    if (!ex) return;
    const badge = document.getElementById("tempo-water-badge");
    const inst = document.getElementById("tempo-instruction");
    if (badge) {
      badge.textContent = ex.waterBadge;
      badge.classList.toggle("closed", Boolean(ex.isTapClosed));
    }
    if (inst && !state.tempoRunning) {
      inst.textContent = ex.prep;
    }
    const prev2 = document.getElementById("btn-kin2-prev");
    const next2 = document.getElementById("btn-kin2-next");
    const cnt2 = document.getElementById("kin2-counter");
    if (prev2) prev2.disabled = idx <= 0;
    if (next2) next2.disabled = idx >= total - 1;
    if (cnt2) cnt2.textContent = `Gerakan ${idx + 1} / ${total}`;
  }

  function startTempo() {
    stopTempo();
    const ex = getSelectedTempoExercise();
    if (!ex) return;
    state.tempoRunning = true;
    const circle = document.getElementById("tempo-circle");
    const countEl = document.getElementById("tempo-count");
    const cueEl = document.getElementById("tempo-cue");
    const instEl = document.getElementById("tempo-instruction");
    const dots = document.querySelectorAll("#tempo-dots .t-dot");
    dots.forEach((d) => d.classList.remove("active", "done"));

    let step = 1;
    const runBeat = () => {
      if (!state.tempoRunning) return;
      if (step > 3) {
        circle.classList.remove("inhale");
        countEl.textContent = "Selesai ✓";
        cueEl.textContent = "Masya Allah, tenang!";
        if (instEl) instEl.textContent = ex.done;
        AUDIO.playChime("win");
        state.tempoRunning = false;
        return;
      }

      dots.forEach((d) => {
        const s = Number(d.dataset.step);
        d.classList.toggle("done", s < step);
        d.classList.toggle("active", s === step);
      });

      circle.classList.add("inhale");
      countEl.textContent = `Hitungan ${step}`;
      cueEl.textContent = "Baca panduan & gerakkan perlahan...";
      if (instEl) instEl.textContent = ex.steps[step - 1] || ex.prep;
      AUDIO.playChime("beat");

      state.tempoHoldTimer = setTimeout(() => {
        if (!state.tempoRunning) return;
        circle.classList.remove("inhale");
        cueEl.textContent = ex.hold;
      }, 3500);

      step++;
      state.tempoTimer = setTimeout(runBeat, 6500);
    };

    runBeat();
  }

  function stopTempo() {
    state.tempoRunning = false;
    clearTimeout(state.tempoTimer);
    clearTimeout(state.tempoHoldTimer);
    const circle = document.getElementById("tempo-circle");
    if (circle) circle.classList.remove("inhale");
    const countEl = document.getElementById("tempo-count");
    const cueEl = document.getElementById("tempo-cue");
    if (countEl) countEl.textContent = "Siap";
    if (cueEl) cueEl.textContent = "Tekan Mulai";
    document.querySelectorAll("#tempo-dots .t-dot").forEach((d) => d.classList.remove("active", "done"));
    syncTempoPreview();
  }

  // ==================== VIEW 4: CEK PEMAHAMAN (TERDIFERENSIASI SD/MI vs SMP/MTs) ====================
  function getActiveQuiz() {
    if (DATA.quizByLevel && DATA.quizByLevel[state.level]) {
      return DATA.quizByLevel[state.level];
    }
    return DATA.quiz;
  }

  function renderQuiz() {
    const activeQuiz = getActiveQuiz();
    const titleEl = document.getElementById("quiz-title");
    if (titleEl) {
      titleEl.textContent =
        state.level === "smp"
          ? `Cek Pemahaman Tingkat SMP / MTs (${activeQuiz.length} Soal Kasus Fikih)`
          : `Cek Pemahaman Tingkat SD / MI (${activeQuiz.length} Soal Dasar)`;
    }
    const container = document.getElementById("quiz-container");
    container.innerHTML = activeQuiz
      .map((q) => {
        const picked = state.quizAnswers[q.id];
        const answered = typeof picked === "number";
        return `
          <div class="q-card">
            <h3>${q.question}</h3>
            <div class="q-options">
              ${q.options
                .map((opt, idx) => {
                  const cls = answered && idx === picked ? "selected" : "";
                  return `
                    <button class="q-opt ${cls}" data-qid="${q.id}" data-opt="${idx}" ${state.quizSubmitted ? "disabled" : ""} type="button">
                      ${String.fromCharCode(65 + idx)}. ${opt}${answered && idx === picked ? "  ✓" : ""}
                    </button>
                  `;
                })
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".q-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.qid;
        const optIdx = Number(btn.dataset.opt);
        state.quizAnswers[qid] = optIdx;
        // Bunyi netral agar siswa di sebelahnya tidak tahu benar/salahnya
        AUDIO.playChime("beat");
        checkQuizComplete();
        renderQuiz();
      });
    });

    renderQuizRecords();
  }

  function checkQuizComplete() {
    const activeQuiz = getActiveQuiz();
    const total = activeQuiz.length;
    const answeredCount = activeQuiz.filter((q) => typeof state.quizAnswers[q.id] === "number").length;
    const resCard = document.getElementById("quiz-result-card");
    if (answeredCount < total) {
      resCard.classList.add("hidden");
      return;
    }

    let score = 0;
    activeQuiz.forEach((q) => {
      if (state.quizAnswers[q.id] === q.correct) score++;
    });
    state.quizScore = score;
    saveState();

    // Tampilkan konfirmasi netral tanpa membocorkan jumlah benar/salah ke siswa
    document.getElementById("result-score-badge").textContent = `${total} / ${total} Soal Terjawab`;
    document.getElementById("result-title").textContent = "Seluruh Pertanyaan Sudah Dijawab!";
    document.getElementById("result-desc").textContent =
      "Pastikan Nama Lengkap & Kelas sudah diisi, lalu klik tombol di bawah untuk mengirim jawaban Anda kepada guru.";
    resCard.classList.remove("hidden");
    AUDIO.playChime("ok");
  }

  function getSheetsWebhookUrl() {
    try {
      return (DATA.googleSheetWebhookUrl || localStorage.getItem(SHEETS_URL_KEY) || "").trim();
    } catch (e) {
      return (DATA.googleSheetWebhookUrl || "").trim();
    }
  }

  function syncTeacherLockUI() {
    const card = document.getElementById("record-card");
    const lockBtn = document.getElementById("btn-teacher-lock");
    const badge = document.getElementById("sheets-status-badge");
    const urlInp = document.getElementById("sheets-url-input");

    if (card) card.classList.toggle("hidden", !state.teacherUnlocked);
    if (lockBtn) {
      lockBtn.textContent = state.teacherUnlocked ? "🔓 Mode Guru Aktif" : "🔒 Mode Guru";
    }
    const url = getSheetsWebhookUrl();
    if (urlInp && !urlInp.value) urlInp.value = url;
    if (badge) {
      badge.textContent = url ? "✅ Google Sheets: Terhubung" : "Google Sheets: Belum dihubungkan";
      badge.classList.toggle("ready", Boolean(url));
    }
  }

  function renderQuizRecords() {
    syncTeacherLockUI();
    const body = document.getElementById("quiz-records-body");
    const records = loadQuizRecords();
    if (!records.length) {
      body.innerHTML = `<tr><td colspan="7" class="empty-row">Belum ada data tersimpan.</td></tr>`;
      return;
    }
    body.innerHTML = records
      .map(
        (r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(r.name)}</td>
            <td><strong>${r.score} / ${r.total}</strong></td>
            <td>${r.pct}%</td>
            <td>${r.synced ? "✅ Google Sheets" : "💾 Lokal"}</td>
            <td>${r.time}</td>
            <td>
              <button class="btn btn-xs btn-rose-soft" data-del-rec="${i}" type="button">🗑️ Hapus</button>
            </td>
          </tr>
        `
      )
      .join("");

    body.querySelectorAll("[data-del-rec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!state.teacherUnlocked) return;
        const idx = Number(btn.dataset.delRec);
        const list = loadQuizRecords();
        list.splice(idx, 1);
        saveQuizRecords(list);
        renderQuizRecords();
        showToast("1 hasil uji kemampuan berhasil dihapus.");
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function initSavedAudioClips() {
    await AUDIO.initSavedBgm();
    for (const seg of DATA.segments) {
      const blob = await AUDIO.loadClip(`seg_${seg.id}`);
      if (blob) {
        state.segmentAudioUrls[seg.id] = URL.createObjectURL(blob);
      }
    }
  }

  function syncLevelUI() {
    document.querySelectorAll(".level-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.level === state.level);
    });
    const badge = document.getElementById("home-level-badge");
    const desc = document.getElementById("home-level-desc");
    if (badge) {
      badge.textContent =
        state.level === "smp"
          ? "🎓 Tingkat SMP / MTs • Pendalaman Fikih & Dalil Mazhab Syafi'i"
          : "🎒 Tingkat SD / MI • Materi Dasar, Praktis & Ramah Anak";
    }
    if (desc) {
      desc.innerHTML =
        state.level === "smp"
          ? "Media pembelajaran <strong>Multi-Sensory Digital</strong> tingkat <strong>SMP/MTs</strong> dengan pendalaman fikih Mazhab Syafi'i (<em>Fath al-Qarib</em> &amp; <em>Ihya' 'Ulum al-Din</em>), dalil anti-<em>israf</em>, kaidah air 2 qullah, serta soal studi kasus fikih remaja."
          : "Media pembelajaran interaktif <strong>Multi-Sensory Digital</strong> tingkat <strong>SD/MI</strong> yang memadukan animasi peragaan putra dan putri, panduan batas wajib yang mudah dipahami, latihan kinestetik 3× tenang, serta soal dasar ramah anak.";
    }
    const sel = document.getElementById("student-level-select");
    if (sel) {
      sel.value = state.level === "smp" ? "SMP/MTs" : "SD/MI";
    }
  }

  function setLevel(lvl, announce = true) {
    const next = lvl === "smp" ? "smp" : "sd";
    if (next === state.level && announce) return;
    state.level = next;
    // Reset jawaban kuis yang belum terkirim saat berganti jenjang agar soal sinkron
    if (!state.quizSubmitted) {
      state.quizAnswers = {};
      state.quizScore = null;
      const resCard = document.getElementById("quiz-result-card");
      if (resCard) resCard.classList.add("hidden");
    }
    syncLevelUI();
    if (announce) {
      showToast(
        state.level === "smp"
          ? "🎓 Beralih ke Materi & Soal Tingkat SMP / MTs (Fikih & Dalil)"
          : "🎒 Beralih ke Materi & Soal Tingkat SD / MI (Dasar & Ramah Anak)"
      );
    }
    if (state.view === "home") renderHome();
    if (state.view === "learn") renderLearn(false);
    if (state.view === "quiz") renderQuiz();
  }

  function syncGenderUI() {}

  function setGender(g, announce = true) {
    state.gender = g === "female" ? "female" : "male";
    saveState();
    syncGenderUI();
    if (announce) {
      showToast(state.gender === "female" ? "👧 Model Peraga: Putri (Berhijab)" : "👦 Model Peraga: Putra");
    }
    if (state.view === "learn") renderLearn(false);
  }

  // ==================== GLOBAL EVENTS ====================
  function bindEvents() {
    document.getElementById("btn-brand").addEventListener("click", () => switchView("home"));
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
    });
    document.querySelectorAll(".level-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLevel(btn.dataset.level, true));
    });
    document.getElementById("student-level-select").addEventListener("change", (e) => {
      setLevel(e.target.value === "SMP/MTs" ? "smp" : "sd", true);
    });
    document.querySelectorAll(".gender-btn").forEach((btn) => {
      btn.addEventListener("click", () => setGender(btn.dataset.gender, true));
    });

    // BGM otomatis selalu menyala & berganti tema per tab (tanpa tombol matikan)
    const ensureBgmStarted = () => {
      AUDIO.startBgm(state.view);
    };
    document.addEventListener("pointerdown", ensureBgmStarted, { once: true });
    document.addEventListener("keydown", ensureBgmStarted, { once: true });

    // Gayung step navigation
    document.getElementById("btn-gayung-prev").addEventListener("click", () => {
      if (state.gayungIdx > 0) {
        state.gayungIdx--;
        renderGayung();
      }
    });
    document.getElementById("btn-gayung-next").addEventListener("click", () => {
      const total = (DATA.gayungSteps || []).length;
      if (state.gayungIdx < total - 1) {
        state.gayungIdx++;
        renderGayung();
      }
    });

    // Fullscreen / Projector mode
    document.getElementById("btn-fullscreen").addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });

    // Home CTA
    document.getElementById("btn-start-learning").addEventListener("click", () => {
      state.segIdx = 0;
      state.subIdx = 0;
      switchView("learn");
    });
    document.getElementById("btn-go-kinesthetic").addEventListener("click", () => switchView("kinesthetic"));

    document.getElementById("btn-speak-female-note").addEventListener("click", () => {
      const seg = DATA.segments[state.segIdx];
      const guide = DATA.femaleSegmentGuides && DATA.femaleSegmentGuides[seg.id];
      const fallbackText = (guide && guide.audioTip) ? guide.audioTip : (guide && guide.points ? guide.points.join(". ") : "");
      const range = DATA.femaleAudioRanges && DATA.femaleAudioRanges[seg.id];
      if (DATA.femaleVoiceFile && range) {
        AUDIO.playMp3Range(resolveAsset(DATA.femaleVoiceFile), range[0], range[1], fallbackText);
        showToast(`🔊 Memutar Penjelasan Khusus Putri — Segmen ${seg.id}`);
        return;
      }
      if (fallbackText) {
        AUDIO.speakText(fallbackText);
      }
    });

    // Learn controls
    document.getElementById("btn-toggle-zoom").addEventListener("click", () => {
      state.zoomOpen = !state.zoomOpen;
      renderLearn();
    });
    document.getElementById("btn-close-zoom").addEventListener("click", () => {
      state.zoomOpen = false;
      renderLearn();
    });
    document.getElementById("btn-anim-play").addEventListener("click", () => {
      state.animPaused = !state.animPaused;
      renderLearn();
    });

    document.getElementById("btn-prev-sub").addEventListener("click", () => {
      if (state.subIdx > 0) {
        state.subIdx--;
      } else if (state.segIdx > 0) {
        state.segIdx--;
        state.subIdx = DATA.segments[state.segIdx].substeps.length - 1;
      }
      state.zoomOpen = false;
      renderLearn(true);
    });

    document.getElementById("btn-next-sub").addEventListener("click", () => {
      const seg = DATA.segments[state.segIdx];
      if (state.subIdx < seg.substeps.length - 1) {
        state.subIdx++;
        state.zoomOpen = false;
        renderLearn(true);
      } else if (state.segIdx < DATA.segments.length - 1) {
        state.completedSegments.add(seg.id);
        saveState();
        state.segIdx++;
        state.subIdx = 0;
        state.zoomOpen = false;
        AUDIO.playChime("ok");
        renderLearn(true);
      } else {
        state.completedSegments.add(seg.id);
        saveState();
        AUDIO.playChime("win");
        showToast("Semua 8 segmen selesai! Mari lanjut ke Zona Kinestetik.");
        switchView("kinesthetic");
      }
    });

    document.getElementById("btn-mark-seg-done").addEventListener("click", () => {
      const seg = DATA.segments[state.segIdx];
      state.completedSegments.add(seg.id);
      saveState();
      AUDIO.playChime("ok");
      showToast(`Segmen ${seg.id} ditandai selesai!`);
      renderLearn(false);
    });

    document.getElementById("btn-try-kinesthetic-seg").addEventListener("click", () => {
      const seg = DATA.segments[state.segIdx];
      if (seg.zoomArea) state.kinArea = seg.zoomArea;
      switchView("kinesthetic");
    });

    // AI Narrator Studio MP3 controls
    document.getElementById("btn-ai-speak").addEventListener("click", () => {
      speakCurrentSubstep();
    });
    document.getElementById("btn-ai-speak-seg").addEventListener("click", () => {
      speakCurrentSegment();
    });
    document.getElementById("btn-ai-stop").addEventListener("click", () => {
      AUDIO.stopVoice();
    });
    document.getElementById("ai-rate-select").addEventListener("change", (e) => {
      AUDIO.setSpeechRate(Number(e.target.value));
    });

    AUDIO.onSpeakingChange((speaking) => {
      const speakBtn = document.getElementById("btn-ai-speak");
      const stopBtn = document.getElementById("btn-ai-stop");
      if (!speakBtn || !stopBtn) return;
      if (speaking) {
        speakBtn.textContent = "🔊 Sedang Diputar...";
        stopBtn.classList.remove("hidden");
      } else {
        speakBtn.textContent = "🔊 Putar Suara Gerakan Ini";
        stopBtn.classList.add("hidden");
      }
    });

    AUDIO.onProgressChange((pct) => {
      const fill = document.getElementById("ai-progress-fill");
      if (fill) fill.style.width = `${pct}%`;
    });

    // Kinesthetic area tabs & tempo
    document.querySelectorAll("#kin-area-tabs .kin-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.kinArea = btn.dataset.area;
        renderKinesthetic();
      });
    });

    document.getElementById("btn-reset-kin-area").addEventListener("click", () => {
      state.foundHotspots[state.kinArea].clear();
      saveState();
      renderKinesthetic();
      showToast("Tantangan area ini diulang dari awal!");
    });

    document.getElementById("tempo-segment-select").addEventListener("change", () => {
      stopTempo();
      syncTempoPreview();
    });

    document.getElementById("btn-kin1-prev").addEventListener("click", () => {
      const idx = KIN_AREA_ORDER.indexOf(state.kinArea);
      if (idx > 0) {
        state.kinArea = KIN_AREA_ORDER[idx - 1];
        renderKinesthetic();
      }
    });

    document.getElementById("btn-kin1-next").addEventListener("click", () => {
      const idx = KIN_AREA_ORDER.indexOf(state.kinArea);
      if (idx < KIN_AREA_ORDER.length - 1) {
        state.kinArea = KIN_AREA_ORDER[idx + 1];
        renderKinesthetic();
      }
    });

    document.getElementById("btn-kin2-prev").addEventListener("click", () => {
      const select = document.getElementById("tempo-segment-select");
      const idx = Number(select.value) || 0;
      if (idx > 0) {
        select.value = String(idx - 1);
        stopTempo();
        syncTempoPreview();
      }
    });

    document.getElementById("btn-kin2-next").addEventListener("click", () => {
      const select = document.getElementById("tempo-segment-select");
      const idx = Number(select.value) || 0;
      const total = DATA.tempoExercises ? DATA.tempoExercises.length : 8;
      if (idx < total - 1) {
        select.value = String(idx + 1);
        stopTempo();
        syncTempoPreview();
      }
    });

    document.getElementById("btn-start-tempo").addEventListener("click", startTempo);
    document.getElementById("btn-stop-tempo").addEventListener("click", stopTempo);

    // Quiz actions (Anti-ubah siswa + PIN Guru + Google Sheets Sync)
    const resetQuiz = () => {
      if (state.quizSubmitted && !state.teacherUnlocked) {
        showToast("Hasil Anda sudah terkunci. Hanya guru (PIN) yang dapat mengulang kuis.");
        return;
      }
      state.quizAnswers = {};
      state.quizSubmitted = false;
      document.getElementById("quiz-result-card").classList.add("hidden");
      document.getElementById("submit-locked-note").classList.add("hidden");
      const saveBtn = document.getElementById("btn-save-record");
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "📤 Kirim & Kunci Hasil";
      }
      renderQuiz();
    };
    document.getElementById("btn-reset-quiz").addEventListener("click", resetQuiz);

    // PIN Guru Unlock / Lock
    document.getElementById("btn-teacher-lock").addEventListener("click", () => {
      if (state.teacherUnlocked) {
        state.teacherUnlocked = false;
        syncTeacherLockUI();
        showToast("🔒 Mode Guru dikunci kembali.");
        return;
      }
      const pin = window.prompt("Masukkan PIN Guru untuk membuka rekap & pengelolaan hasil:");
      if (pin === null) return;
      if (pin.trim() === String(DATA.teacherPin || "2026")) {
        state.teacherUnlocked = true;
        renderQuizRecords();
        showToast("🔓 Mode Guru terbuka! Rekap & tombol kelola kini aktif.");
      } else {
        showToast("❌ PIN Guru salah.");
      }
    });

    document.getElementById("btn-teacher-relock").addEventListener("click", () => {
      state.teacherUnlocked = false;
      syncTeacherLockUI();
      showToast("🔒 Rekap dikunci kembali ke Mode Siswa.");
    });

    document.getElementById("btn-save-sheets-url").addEventListener("click", () => {
      if (!state.teacherUnlocked) return;
      const inp = document.getElementById("sheets-url-input");
      const val = (inp.value || "").trim();
      try {
        localStorage.setItem(SHEETS_URL_KEY, val);
      } catch (e) {}
      syncTeacherLockUI();
      showToast(val ? "✅ URL Google Sheets tersimpan!" : "URL Google Sheets dikosongkan.");
    });

    document.getElementById("btn-save-record").addEventListener("click", async () => {
      if (state.quizScore === null || state.quizSubmitted) return;
      const levelSel = document.getElementById("student-level-select");
      const level = levelSel ? levelSel.value : (state.level === "smp" ? "SMP/MTs" : "SD/MI");
      const nameInp = document.getElementById("student-name-input");
      const schoolInp = document.getElementById("student-school-input");
      const classInp = document.getElementById("student-class-input");

      const prof = state.studentProfile || {};
      const rawName = (prof.name || (nameInp ? nameInp.value : "")).trim();
      const rawSchool = (prof.school || (schoolInp ? schoolInp.value : "")).trim();
      const rawClass = (prof.kelas || (classInp ? classInp.value : "")).trim();

      if (!rawName || !rawSchool || !rawClass) {
        showToast("⚠️ Identitas siswa belum lengkap. Silakan masuk melalui halaman awal.");
        return;
      }

      const name = `[${level}] ${rawName} — ${rawSchool} — Kelas ${rawClass}`;

      const saveBtn = document.getElementById("btn-save-record");
      saveBtn.disabled = true;
      saveBtn.textContent = "⏳ Mengirim hasil...";

      const total = getActiveQuiz().length;
      const pct = Math.round((state.quizScore / total) * 100);
      const time = new Date().toLocaleString("id-ID");
      const webhookUrl = getSheetsWebhookUrl();
      let synced = false;

      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              level,
              studentName: rawName,
              studentSchool: rawSchool,
              studentClass: rawClass,
              name,
              score: state.quizScore,
              total,
              pct: `${pct}%`,
              time
            })
          });
          synced = true;
        } catch (err) {
          synced = false;
        }
      }

      const records = loadQuizRecords();
      records.push({ name, score: state.quizScore, total, pct, synced, time });
      saveQuizRecords(records);

      state.quizSubmitted = true;
      saveBtn.textContent = "✅ Terkirim! Keluar otomatis...";
      document.getElementById("submit-locked-note").classList.remove("hidden");
      renderQuiz();
      showToast(synced ? "✅ Hasil terkirim ke Google Sheets Guru! Keluar otomatis..." : "✅ Hasil tercatat! Keluar otomatis...");

      // Hapus sesi identitas siswa & otomatis keluar dari halaman web setelah 1.6 detik
      try {
        sessionStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}

      try {
        AUDIO.stopVoice();
        AUDIO.stopBgm();
      } catch (e) {}

      setTimeout(() => {
        try {
          window.close();
        } catch (e) {}
        window.location.replace("../");
      }, 1600);
    });

    document.getElementById("btn-export-csv").addEventListener("click", () => {
      if (!state.teacherUnlocked) return;
      const records = loadQuizRecords();
      if (!records.length) {
        showToast("Belum ada data rekap untuk diunduh.");
        return;
      }
      const header = "No,Nama_Kelas,Skor,Total,Persentase,Status,Waktu\n";
      const rows = records
        .map((r, i) => `${i + 1},"${r.name.replace(/"/g, '""')}",${r.score},${r.total},${r.pct}%,"${r.synced ? "Google Sheets" : "Lokal"}","${r.time}"`)
        .join("\n");
      const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Rekap_Cek_Pemahaman_Adab_Wudhu.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("btn-clear-records").addEventListener("click", () => {
      if (!state.teacherUnlocked) return;
      const records = loadQuizRecords();
      if (!records.length) {
        showToast("Rekap uji kemampuan sudah kosong.");
        return;
      }
      if (window.confirm("Hapus seluruh hasil rekap uji kemampuan yang tersimpan di browser ini?")) {
        saveQuizRecords([]);
        state.quizScore = null;
        saveState();
        renderQuizRecords();
        showToast("Semua hasil uji kemampuan berhasil dihapus.");
      }
    });
  }

  // ==================== IDENTITAS SISWA TERKUNCI DARI GERBANG AWAL ====================
  function loadStudentProfile() {
    const params = new URLSearchParams(window.location.search);
    const qNama = (params.get("nama") || "").trim();
    const qSekolah = (params.get("sekolah") || "").trim();
    const qKelas = (params.get("kelas") || "").trim();

    if (qNama && qSekolah && qKelas) {
      state.studentProfile = {
        name: qNama,
        school: qSekolah,
        kelas: qKelas,
        level: state.level,
        levelLabel: state.level === "smp" ? "SMP/MTs" : "SD/MI"
      };
      try {
        sessionStorage.setItem(PROFILE_KEY, JSON.stringify(state.studentProfile));
      } catch (e) {}
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {}
      return true;
    }

    try {
      const saved = JSON.parse(sessionStorage.getItem(PROFILE_KEY) || "null");
      if (saved && saved.name && saved.school && saved.kelas) {
        state.studentProfile = {
          name: String(saved.name).trim(),
          school: String(saved.school).trim(),
          kelas: String(saved.kelas).trim(),
          level: state.level,
          levelLabel: state.level === "smp" ? "SMP/MTs" : "SD/MI"
        };
        return true;
      }
    } catch (e) {}

    // Jika siswa membuka /sd/ atau /smp/ langsung tanpa lewat halaman awal, arahkan ke gerbang utama (1 link)
    const p = window.location.pathname || "";
    if (/\/(sd|smp)\/(index\.html)?$/i.test(p)) {
      window.location.replace("../");
      return false;
    }
    return true;
  }

  function syncStudentProfileUI() {
    const prof = state.studentProfile;
    if (!prof) return;
    const nameInp = document.getElementById("student-name-input");
    const schoolInp = document.getElementById("student-school-input");
    const classInp = document.getElementById("student-class-input");

    if (nameInp) {
      nameInp.value = prof.name;
      nameInp.readOnly = true;
      nameInp.disabled = true;
    }
    if (schoolInp) {
      schoolInp.value = prof.school;
      schoolInp.readOnly = true;
      schoolInp.disabled = true;
    }
    if (classInp) {
      classInp.value = prof.kelas;
      classInp.readOnly = true;
      classInp.disabled = true;
    }
  }

  // ==================== SPLASH / WELCOME SCREEN ====================
  function initSplashScreen() {
    if (document.getElementById("splash-screen")) return;
    const isSmp = state.level === "smp";
    const levelLabel = isSmp ? "🎓 Tingkat SMP / MTs • Fikih & Dalil" : "🎒 Tingkat SD / MI • Materi Dasar";
    const prof = state.studentProfile;
    const safeName = prof ? prof.name.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    const safeSchool = prof ? prof.school.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    const safeClass = prof ? prof.kelas.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

    const splash = document.createElement("div");
    splash.id = "splash-screen";
    splash.className = "splash-screen";
    splash.innerHTML = `
      <div class="splash-logo-wrap" aria-hidden="true">
        <span class="splash-ripple"></span>
        <span class="splash-ripple delay"></span>
        <div class="splash-emblem">
          <svg viewBox="0 0 64 64" width="54" height="54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="splashDrop" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#e0f2fe"/>
                <stop offset="48%" stop-color="#38bdf8"/>
                <stop offset="100%" stop-color="#0284c7"/>
              </linearGradient>
            </defs>
            <path d="M32 6 C32 6 14 26 14 39 C14 49 22 57 32 57 C42 57 50 49 50 39 C50 26 32 6 32 6 Z" fill="url(#splashDrop)" stroke="#ffffff" stroke-width="2.4"/>
            <path d="M23 37 C22.5 42.5 25.5 47 30 48.6" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
            <circle cx="24.5" cy="29.5" r="2.6" fill="#ffffff" opacity="0.88"/>
          </svg>
        </div>
      </div>
      <span class="splash-badge">${levelLabel}</span>
      <h1 class="splash-title">${prof ? `Assalamu'alaikum, ${safeName}!` : "Adab Wudhu Multi-Sensory"}</h1>
      <p class="splash-sub">${prof ? `🏫 ${safeSchool} &nbsp;•&nbsp; Kelas ${safeClass}<br/>Identitas Anda telah terkunci otomatis untuk Cek Pemahaman.` : "Media Pembelajaran Interaktif Tata Cara &amp; Adab Berwudhu Sesuai Mazhab Syafi'i"}</p>
      <div class="splash-bar-wrap">
        <div class="splash-bar-fill" id="splash-bar-fill" style="width:${prof ? "100%" : "0%"}"></div>
      </div>
      <div class="splash-status" id="splash-status">${prof ? "Materi & audio siap! Klik tombol di bawah untuk mulai belajar." : "Menyiapkan animasi peragaan wudhu..."}</div>
      <button class="splash-enter-btn ${prof ? "ready" : ""}" id="btn-splash-enter" type="button">▶ Mulai Belajar di Beranda</button>
    `;
    document.body.appendChild(splash);

    const bar = document.getElementById("splash-bar-fill");
    const status = document.getElementById("splash-status");
    const enterBtn = document.getElementById("btn-splash-enter");

    if (!prof) {
      const steps = [
        { pct: 28, msg: "Menyiapkan animasi peragaan Putra & Putri...", delay: 220 },
        { pct: 64, msg: "Menyiapkan audio narasi & musik latar Islami...", delay: 620 },
        { pct: 100, msg: "Siap digunakan! Klik tombol di bawah untuk memulai.", delay: 1120 }
      ];
      steps.forEach((st) => {
        setTimeout(() => {
          if (bar) bar.style.width = `${st.pct}%`;
          if (status) status.textContent = st.msg;
          if (st.pct >= 100 && enterBtn) enterBtn.classList.add("ready");
        }, st.delay);
      });
    }

    enterBtn.addEventListener("click", () => {
      AUDIO.startBgm(state.view);
      AUDIO.playChime("ok");
      splash.classList.add("fade-out");
      setTimeout(() => splash.remove(), 600);
    });
  }

  // ==================== BOOT ====================
  if (!loadStudentProfile()) return;
  loadState();
  syncLevelUI();
  syncStudentProfileUI();
  syncGenderUI();
  initSplashScreen();
  bindEvents();
  initSavedAudioClips().then(() => {
    renderHome();
    try { AUDIO.startBgm("home"); } catch (e) {}
  });
})();
