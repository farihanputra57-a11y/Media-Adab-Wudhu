(function () {
  const DATA = window.WUDHU_DATA;
  const AUDIO = window.AudioEngine;
  const ANIM = window.WudhuAnimator;

  const STORAGE_KEY = "adab_wudhu_web_state_v1";
  const RECORDS_KEY = "adab_wudhu_quiz_records_v1";

  const state = {
    view: "home",
    gender: "male",
    segIdx: 0,
    subIdx: 0,
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
    tempoRunning: false
  };

  // ==================== PERSISTENCE ====================
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      (parsed.completedSegments || []).forEach((id) => state.completedSegments.add(id));
      if (parsed.foundHotspots) {
        Object.keys(state.foundHotspots).forEach((k) => {
          (parsed.foundHotspots[k] || []).forEach((pt) => state.foundHotspots[k].add(pt));
        });
      }
      if (typeof parsed.quizScore === "number") state.quizScore = parsed.quizScore;
      if (parsed.gender === "female" || parsed.gender === "male") state.gender = parsed.gender;
    } catch (e) {}
  }

  function saveState() {
    try {
      const payload = {
        gender: state.gender,
        completedSegments: Array.from(state.completedSegments),
        foundHotspots: {
          wajah: Array.from(state.foundHotspots.wajah),
          tangan: Array.from(state.foundHotspots.tangan),
          kepala: Array.from(state.foundHotspots.kepala),
          kaki: Array.from(state.foundHotspots.kaki)
        },
        quizScore: state.quizScore
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
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
    if (viewName === "home") renderHome();
    if (viewName === "learn") renderLearn(true);
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
      state.quizScore !== null ? `${state.quizScore} / ${DATA.quiz.length}` : "Belum";

    const grid = document.getElementById("home-segment-grid");
    grid.innerHTML = DATA.segments
      .map((seg, idx) => {
        const done = state.completedSegments.has(seg.id);
        return `
          <button class="seg-card ${done ? "done" : ""}" data-open-seg="${idx}" type="button">
            <div class="seg-card-top">
              <span class="seg-num-pill">Segmen ${seg.id}</span>
              <span class="seg-law-tag ${seg.isRukun ? "rukun" : "sunnah"}">${seg.law}</span>
            </div>
            <div class="seg-card-emoji">${seg.emoji}</div>
            <h3>${seg.title}</h3>
            <p>${seg.summary}</p>
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
  function speakCurrentSubstep() {
    const seg = DATA.segments[state.segIdx];
    const sub = seg.substeps[state.subIdx] || seg.substeps[0];
    const range = DATA.substepAudioRanges && DATA.substepAudioRanges[sub.code];
    if (DATA.masterVoiceFile && range) {
      AUDIO.playMp3Range(DATA.masterVoiceFile, range[0], range[1]);
    } else {
      const text = sub.narration || `${sub.title}. ${sub.desc}`;
      AUDIO.speakText(text);
    }
  }

  function speakCurrentSegment() {
    const seg = DATA.segments[state.segIdx];
    const range = DATA.segmentAudioRanges && DATA.segmentAudioRanges[seg.id];
    if (DATA.masterVoiceFile && range) {
      AUDIO.playMp3Range(DATA.masterVoiceFile, range[0], range[1]);
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

    // Adab & Water Tip
    document.getElementById("adab-list").innerHTML = seg.adab.map((item) => `<li>${item}</li>`).join("");
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
      fb.textContent = `★ Hebat! Semua ${areaData.points.length} titik batas wajib pada ${areaData.title} telah kamu kenali.`;
    } else {
      fb.className = "hotspot-feedback";
      fb.textContent = `Sentuh titik bernomor pada gambar (${foundSet.size}/${areaData.points.length} ditemukan). ${areaData.caption}`;
    }

    board.querySelectorAll(".hotspot-dot").forEach((dot) => {
      const handlePick = () => {
        const ptId = dot.dataset.pointId;
        const pt = areaData.points.find((p) => p.id === ptId);
        if (!pt) return;
        const wasNew = !foundSet.has(ptId);
        foundSet.add(ptId);
        saveState();
        AUDIO.playChime(foundSet.size >= areaData.points.length ? "win" : "ok");
        renderKinesthetic();
        const fbNow = document.getElementById("hotspot-feedback");
        fbNow.innerHTML = `<strong>${pt.title}:</strong> ${pt.desc}`;
        if (wasNew && foundSet.size >= areaData.points.length) {
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

    // Populate tempo dropdown once
    const select = document.getElementById("tempo-segment-select");
    if (!select.options.length) {
      const options = [
        "Membasuh Telapak & Sela Jari (3×)",
        "Berkumur & Istinsyaq (3×)",
        "Membasuh Wajah: Dahi–Dagu & Telinga–Telinga (3×)",
        "Membasuh Tangan Kanan hingga Melewati Siku (3×)",
        "Membasuh Tangan Kiri hingga Melewati Siku (3×)",
        "Mengusap Sebagian Kepala & Telinga (Keran Ditutup)",
        "Membasuh Kaki Kanan hingga Mata Kaki & Tumit (3×)",
        "Membasuh Kaki Kiri hingga Mata Kaki & Tumit (3×)"
      ];
      select.innerHTML = options.map((o, i) => `<option value="${i}">${o}</option>`).join("");
    }
  }

  function startTempo() {
    stopTempo();
    state.tempoRunning = true;
    const circle = document.getElementById("tempo-circle");
    const countEl = document.getElementById("tempo-count");
    const cueEl = document.getElementById("tempo-cue");
    const dots = document.querySelectorAll("#tempo-dots .t-dot");
    dots.forEach((d) => d.classList.remove("active", "done"));

    let step = 1;
    const runBeat = () => {
      if (!state.tempoRunning) return;
      if (step > 3) {
        circle.classList.remove("inhale");
        countEl.textContent = "Selesai ✓";
        cueEl.textContent = "Masya Allah, tenang & rapi!";
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
      cueEl.textContent = "Gerakkan perlahan & rata...";
      AUDIO.playChime("beat");

      setTimeout(() => {
        if (!state.tempoRunning) return;
        circle.classList.remove("inhale");
        cueEl.textContent = "Tahan sejenak (thuma'ninah)";
      }, 1300);

      step++;
      state.tempoTimer = setTimeout(runBeat, 2600);
    };

    runBeat();
  }

  function stopTempo() {
    state.tempoRunning = false;
    clearTimeout(state.tempoTimer);
    const circle = document.getElementById("tempo-circle");
    if (circle) circle.classList.remove("inhale");
    const countEl = document.getElementById("tempo-count");
    const cueEl = document.getElementById("tempo-cue");
    if (countEl) countEl.textContent = "Siap";
    if (cueEl) cueEl.textContent = "Tekan Mulai";
    document.querySelectorAll("#tempo-dots .t-dot").forEach((d) => d.classList.remove("active", "done"));
  }

  // ==================== VIEW 4: CEK PEMAHAMAN ====================
  function renderQuiz() {
    const container = document.getElementById("quiz-container");
    container.innerHTML = DATA.quiz
      .map((q) => {
        const picked = state.quizAnswers[q.id];
        const answered = typeof picked === "number";
        return `
          <div class="q-card">
            <h3>${q.question}</h3>
            <div class="q-options">
              ${q.options
                .map((opt, idx) => {
                  let cls = "";
                  if (answered) {
                    if (idx === q.correct) cls = "correct";
                    else if (idx === picked) cls = "wrong";
                  }
                  return `
                    <button class="q-opt ${cls}" data-qid="${q.id}" data-opt="${idx}" ${answered ? "disabled" : ""} type="button">
                      ${String.fromCharCode(65 + idx)}. ${opt}
                    </button>
                  `;
                })
                .join("")}
            </div>
            ${answered ? `<div class="q-explain">${picked === q.correct ? "✅ " : "💡 "}${q.explain}</div>` : ""}
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".q-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.qid;
        const optIdx = Number(btn.dataset.opt);
        const qObj = DATA.quiz.find((x) => x.id === qid);
        state.quizAnswers[qid] = optIdx;
        AUDIO.playChime(optIdx === qObj.correct ? "ok" : "err");
        checkQuizComplete();
        renderQuiz();
      });
    });

    renderQuizRecords();
  }

  function checkQuizComplete() {
    const total = DATA.quiz.length;
    const answeredCount = Object.keys(state.quizAnswers).length;
    const resCard = document.getElementById("quiz-result-card");
    if (answeredCount < total) {
      resCard.classList.add("hidden");
      return;
    }

    let score = 0;
    DATA.quiz.forEach((q) => {
      if (state.quizAnswers[q.id] === q.correct) score++;
    });
    state.quizScore = score;
    saveState();

    document.getElementById("result-score-badge").textContent = `${score} / ${total}`;
    const pct = Math.round((score / total) * 100);
    document.getElementById("result-title").textContent =
      pct >= 80 ? "Masya Allah, Pemahaman Sangat Baik!" : "Bagus! Mari Tinjau Kembali Batas Wajibnya";
    document.getElementById("result-desc").textContent =
      `Skor pemahaman pasca-paparan: ${pct}%. Simpan ke rekap kelas sebagai bukti manipulation check penelitian.`;
    resCard.classList.remove("hidden");
    AUDIO.playChime("win");
  }

  function renderQuizRecords() {
    const body = document.getElementById("quiz-records-body");
    const records = loadQuizRecords();
    if (!records.length) {
      body.innerHTML = `<tr><td colspan="6" class="empty-row">Belum ada data tersimpan.</td></tr>`;
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
    document.querySelectorAll(".gender-btn").forEach((btn) => {
      btn.addEventListener("click", () => setGender(btn.dataset.gender, true));
    });

    // BGM controls
    const bgmBtn = document.getElementById("btn-bgm-toggle");
    const bgmIcon = document.getElementById("bgm-icon");
    bgmBtn.addEventListener("click", () => {
      const playing = AUDIO.toggleBgm();
      bgmIcon.textContent = playing ? "🔊" : "🔇";
      bgmBtn.setAttribute("aria-pressed", String(playing));
      showToast(playing ? "Musik latar Islami dinyalakan" : "Musik latar dimatikan");
    });

    document.getElementById("bgm-volume").addEventListener("input", (e) => {
      AUDIO.setVolume(Number(e.target.value) / 100);
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
      if (guide && guide.audioTip) {
        AUDIO.speakText(guide.audioTip);
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

    document.getElementById("btn-start-tempo").addEventListener("click", startTempo);
    document.getElementById("btn-stop-tempo").addEventListener("click", stopTempo);

    // Quiz actions
    const resetQuiz = () => {
      state.quizAnswers = {};
      document.getElementById("quiz-result-card").classList.add("hidden");
      renderQuiz();
    };
    document.getElementById("btn-reset-quiz").addEventListener("click", resetQuiz);
    document.getElementById("btn-retry-quiz").addEventListener("click", resetQuiz);

    document.getElementById("btn-save-record").addEventListener("click", () => {
      if (state.quizScore === null) return;
      const nameInp = document.getElementById("student-name-input");
      const name = nameInp.value.trim() || "Siswa Madrasah";
      const records = loadQuizRecords();
      const total = DATA.quiz.length;
      records.push({
        name,
        score: state.quizScore,
        total,
        pct: Math.round((state.quizScore / total) * 100),
        time: new Date().toLocaleString("id-ID")
      });
      saveQuizRecords(records);
      nameInp.value = "";
      renderQuizRecords();
      showToast("Hasil cek pemahaman berhasil disimpan ke rekap kelas!");
    });

    document.getElementById("btn-export-csv").addEventListener("click", () => {
      const records = loadQuizRecords();
      if (!records.length) {
        showToast("Belum ada data rekap untuk diunduh.");
        return;
      }
      const header = "No,Nama_Kelas,Skor,Total,Persentase,Waktu\n";
      const rows = records
        .map((r, i) => `${i + 1},"${r.name.replace(/"/g, '""')}",${r.score},${r.total},${r.pct}%,"${r.time}"`)
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

  // ==================== BOOT ====================
  loadState();
  syncGenderUI();
  bindEvents();
  initSavedAudioClips().then(() => {
    renderHome();
  });
})();
