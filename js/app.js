(function () {
  const DATA = window.WUDHU_DATA;
  const AUDIO = window.AudioEngine;
  const ANIM = window.WudhuAnimator;

  const STORAGE_KEY = "adab_wudhu_web_state_v1";
  const SESSION_PROGRESS_KEY = "adab_wudhu_session_progress_v1";
  const RECORDS_KEY = "adab_wudhu_quiz_records_v1";
  const SHEETS_URL_KEY = "adab_wudhu_sheets_url_v1";
  const PROFILE_KEY = "adab_wudhu_student_profile_v1";
  const TEACHER_SHEETS_VIEW_URL = "https://docs.google.com/spreadsheets/d/1DoK0WDUYcwFKM1Ly5ol8bTAbn3GOkwP6zWv32aM6oic/edit";

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
  // Progres disimpan sementara di sessionStorage selama sesi siswa masih aktif (agar tidak hilang jika HP tidak sengaja ter-refresh),
  // dan otomatis direset bersih ke 0% saat selesai 100% & keluar ke Halaman Awal.
  function loadState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const saved = JSON.parse(sessionStorage.getItem(SESSION_PROGRESS_KEY) || "null");
      if (saved && saved.level === state.level) {
        if (Array.isArray(saved.completedSegments)) {
          state.completedSegments = new Set(saved.completedSegments);
        }
        if (saved.foundHotspots) {
          ["wajah", "tangan", "kepala", "kaki"].forEach((k) => {
            if (Array.isArray(saved.foundHotspots[k])) {
              state.foundHotspots[k] = new Set(saved.foundHotspots[k]);
            }
          });
        }
        if (saved.quizAnswers && typeof saved.quizAnswers === "object") {
          state.quizAnswers = saved.quizAnswers;
        }
        if (typeof saved.quizScore === "number") {
          state.quizScore = saved.quizScore;
        }
        if (typeof saved.quizSubmitted === "boolean") {
          state.quizSubmitted = saved.quizSubmitted;
        }
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      const payload = {
        level: state.level,
        completedSegments: Array.from(state.completedSegments),
        foundHotspots: {
          wajah: Array.from(state.foundHotspots.wajah),
          tangan: Array.from(state.foundHotspots.tangan),
          kepala: Array.from(state.foundHotspots.kepala),
          kaki: Array.from(state.foundHotspots.kaki)
        },
        quizAnswers: state.quizAnswers,
        quizScore: state.quizScore,
        quizSubmitted: state.quizSubmitted
      };
      sessionStorage.setItem(SESSION_PROGRESS_KEY, JSON.stringify(payload));
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
    AUDIO.setBgmTheme(viewName);
    if (viewName === "home") renderHome();
    if (viewName === "learn") renderLearn(true);
    if (viewName === "gayung") renderGayung();
    if (viewName === "kinesthetic") renderKinesthetic();
    if (viewName === "quiz") renderQuiz();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ==================== VIEW 1: BERANDA ====================
  let isExitingToGateway = false;

  function getMasteredKinCount() {
    return Object.keys(DATA.kinestheticAreas).filter((k) => {
      return state.foundHotspots[k].size >= DATA.kinestheticAreas[k].points.length;
    }).length;
  }

  function isTeacherSession() {
    return Boolean(state.studentProfile && state.studentProfile.isTeacher);
  }

  function getSessionMode() {
    if (isTeacherSession()) return "teacher";
    const s = String((state.studentProfile && state.studentProfile.sesi) || "Posttest").toLowerCase();
    if (s.includes("pre")) return "pretest";
    if (s.includes("latih")) return "latihan";
    return "posttest";
  }

  function getOverallProgress() {
    const segDone = state.completedSegments.size;
    const kinDone = getMasteredKinCount();
    if (isTeacherSession()) {
      const totalTasks = 8 + 4;
      const pct = Math.round(((segDone + kinDone) / totalTasks) * 100);
      const is100 = segDone >= 8 && kinDone >= 4;
      return { segDone, kinDone, quizDone: 0, pct, is100 };
    }
    const quizDone = state.quizScore !== null ? 1 : 0;
    const totalTasks = 8 + 4 + 1;
    const pct = Math.round(((segDone + kinDone + quizDone) / totalTasks) * 100);
    const is100 = segDone >= 8 && kinDone >= 4 && quizDone >= 1;
    return { segDone, kinDone, quizDone, pct, is100 };
  }

  function jumpToIncompleteMaterial() {
    const prog = getOverallProgress();
    if (prog.segDone < 8) {
      const nextSegIdx = DATA.segments.findIndex((s) => !state.completedSegments.has(s.id));
      state.segIdx = nextSegIdx >= 0 ? nextSegIdx : 0;
      state.subIdx = 0;
      state.zoomOpen = false;
      switchView("learn");
      showToast(`📚 Silakan tuntaskan Segmen ${state.segIdx + 1} (${prog.segDone}/8 selesai) hingga 100%!`);
      return;
    }
    if (prog.kinDone < 4) {
      const nextArea = Object.keys(DATA.kinestheticAreas).find(
        (k) => state.foundHotspots[k].size < DATA.kinestheticAreas[k].points.length
      );
      if (nextArea) state.kinArea = nextArea;
      switchView("kinesthetic");
      showToast(`✋ Silakan tuntaskan Zona Kinestetik (${prog.kinDone}/4 bintang) hingga 100%!`);
      return;
    }
    if (!isTeacherSession()) {
      switchView("quiz");
    }
  }

  const LAST_THANKYOU_KEY = "adab_wudhu_last_thankyou_v1";

  function performFinalExit() {
    if (isExitingToGateway) return;
    isExitingToGateway = true;

    const teacherMode = isTeacherSession();
    const prof = state.studentProfile || {};
    const dispName = (prof.name || (teacherMode ? "Bapak/Ibu Guru" : "Siswa")).trim();
    const dispSchool = (prof.school || "-").trim();
    const dispClass = (prof.kelas || "-").trim();
    const dispLevel = prof.levelLabel || (state.level === "smp" ? "SMP / MTs" : "SD / MI");
    const dispSesi = teacherMode ? "Mode Mengajar Guru" : (prof.sesi || "Posttest").trim();
    const dispTime = new Date().toLocaleString("id-ID");
    const totalQ = getActiveQuiz().length || 10;
    const hasScore = !teacherMode && typeof state.quizScore === "number";
    const scorePct = hasScore ? Math.round((state.quizScore / totalQ) * 100) : null;

    const thankYouPayload = {
      isTeacher: teacherMode,
      name: dispName,
      school: dispSchool,
      kelas: dispClass,
      level: dispLevel,
      sesi: dispSesi,
      submitted: Boolean(state.quizSubmitted),
      score: hasScore ? state.quizScore : null,
      total: totalQ,
      pct: scorePct,
      time: dispTime
    };

    try {
      sessionStorage.removeItem(PROFILE_KEY);
      sessionStorage.removeItem(SESSION_PROGRESS_KEY);
      sessionStorage.removeItem(SHUFFLED_QUIZ_KEY);
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(LAST_THANKYOU_KEY, JSON.stringify(thankYouPayload));
    } catch (e) {}

    try {
      AUDIO.stopVoice();
      AUDIO.stopBgm();
      AUDIO.playChime("win");
    } catch (e) {}

    const targetHome = getGatewayUrl() + "?selesai=1";
    showThankYouExitModal(thankYouPayload, targetHome);
  }

  function showThankYouExitModal(info, targetHome) {
    let modal = document.getElementById("thank-you-exit-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "thank-you-exit-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.style.cssText =
        "position:fixed;inset:0;z-index:99999;background:rgba(4,47,36,0.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:18px;animation:fadeUp 0.25s ease;";
      document.body.appendChild(modal);
    }

    const isT = Boolean(info.isTeacher);
    const isLat = !isT && String(info.sesi || "").toLowerCase().includes("latih");
    const roleBadge = isT
      ? "👨‍🏫 SESI MENGAJAR GURU SELESAI"
      : info.submitted
      ? `✅ JAWABAN ${String(info.sesi || "KUIS").toUpperCase()} TERKIRIM`
      : `📖 SESI ${String(info.sesi || "BELAJAR").toUpperCase()} SELESAI`;

    const subtitleText = isT
      ? `Terima kasih <strong>${escapeHtml(info.name)}</strong> telah menayangkan materi &amp; membimbing pembelajaran Adab Wudhu di kelas.`
      : info.submitted
      ? `Terima kasih <strong>${escapeHtml(info.name)}</strong>, data dan jawaban <strong>${escapeHtml(info.sesi)}</strong> Anda telah berhasil dikirim ke rekapan Google Sheets Guru.`
      : `Terima kasih <strong>${escapeHtml(info.name)}</strong> telah mengikuti sesi <strong>${escapeHtml(info.sesi)}</strong> Adab Wudhu dengan tertib.`;

    const scoreRowHtml =
      isLat && info.score !== null
        ? `<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px dashed #cbd5e1;"><span style="color:#475569;font-weight:600;">Skor Latihan Mandiri</span><strong style="color:#0f6b56;">${info.score} / ${info.total} (${info.pct}%)</strong></div>`
        : "";

    modal.innerHTML = `
      <div style="background:#ffffff;color:#0f172a;max-width:480px;width:100%;border-radius:24px;padding:26px 24px 22px;box-shadow:0 24px 60px rgba(0,0,0,0.38);border:2px solid #10b981;text-align:center;font-family:inherit;">
        <div style="width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#10b981,#0f6b56);color:#ffffff;font-size:30px;display:grid;place-items:center;margin:0 auto 12px;box-shadow:0 10px 24px rgba(16,185,129,0.32);">
          ${isT ? "👨‍🏫" : "✅"}
        </div>
        <div style="display:inline-block;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;padding:4px 12px;border-radius:999px;font-size:11.5px;font-weight:800;letter-spacing:0.4px;margin-bottom:8px;">
          ${roleBadge}
        </div>
        <h2 style="margin:0 0 6px;font-size:21px;font-weight:800;color:#064e3b;">
          Jazakumullahu Khairan, ${escapeHtml(info.name)}!
        </h2>
        <p style="margin:0 0 16px;font-size:13.5px;color:#334155;line-height:1.5;">
          ${subtitleText}
        </p>

        <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:16px;padding:12px 16px;text-align:left;font-size:13px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:800;color:#0f6b56;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
            📋 Ringkasan Data ${isT ? "Pengajar" : "Peserta"}
          </div>
          <div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px dashed #cbd5e1;">
            <span style="color:#475569;font-weight:600;">${isT ? "Nama Guru" : "Nama Lengkap Siswa"}</span>
            <strong style="color:#0f172a;">${escapeHtml(info.name)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px dashed #cbd5e1;">
            <span style="color:#475569;font-weight:600;">Sekolah / Madrasah</span>
            <strong style="color:#0f172a;">${escapeHtml(info.school)} (${escapeHtml(info.level)})</strong>
          </div>
          <div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px dashed #cbd5e1;">
            <span style="color:#475569;font-weight:600;">${isT ? "Kelas & Lokal Diajar" : "Kelas & Lokal"}</span>
            <strong style="color:#0f172a;">Kelas ${escapeHtml(info.kelas)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;${scoreRowHtml ? "border-bottom:1px dashed #cbd5e1;" : ""}">
            <span style="color:#475569;font-weight:600;">Sesi / Mode</span>
            <strong style="color:#0284c7;">${escapeHtml(info.sesi)}</strong>
          </div>
          ${scoreRowHtml}
        </div>

        <button type="button" id="btn-thankyou-home-now" style="width:100%;border:none;border-radius:13px;padding:12px 16px;background:linear-gradient(135deg,#0f6b56,#059669);color:#ffffff;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 8px 20px rgba(15,107,86,0.28);">
          🏠 Kembali ke Halaman Awal Sekarang
        </button>
        <div style="margin-top:8px;font-size:11.5px;color:#64748b;font-weight:600;" id="thankyou-countdown-note">
          Otomatis kembali ke Halaman Awal dalam 3 detik...
        </div>
      </div>
    `;

    const goNow = () => {
      window.location.replace(targetHome);
    };
    const btnNow = document.getElementById("btn-thankyou-home-now");
    if (btnNow) btnNow.addEventListener("click", goNow);

    let secLeft = 3;
    const noteEl = document.getElementById("thankyou-countdown-note");
    const iv = setInterval(() => {
      secLeft--;
      if (secLeft > 0 && noteEl) {
        noteEl.textContent = `Otomatis kembali ke Halaman Awal dalam ${secLeft} detik...`;
      } else {
        clearInterval(iv);
      }
    }, 1000);

    setTimeout(goNow, 3200);
  }

  function checkExitWhen100AndSubmitted() {
    if (isTeacherSession()) return false;
    const prog = getOverallProgress();
    if (state.quizSubmitted && prog.is100) {
      showToast("🎉 Pemahaman Materi sudah 100% & Cek Pemahaman terkirim! Otomatis keluar ke Halaman Awal...");
      performFinalExit();
      return true;
    }
    return false;
  }

  function renderHome() {
    const teacherMode = isTeacherSession();
    const prof = state.studentProfile || {};
    const progBox = document.querySelector(".hero-progress-box");

    if (teacherMode) {
      const homeTitle = document.getElementById("home-title");
      const homeDesc = document.getElementById("home-level-desc");
      const startBtn = document.getElementById("btn-start-learning");
      const kinBtn = document.getElementById("btn-go-kinesthetic");

      if (homeTitle) {
        homeTitle.textContent = "Panel Pengajaran Tata Cara & Adab Wudhu (Mode Guru)";
      }
      if (homeDesc) {
        homeDesc.innerHTML =
          state.level === "smp"
            ? "Mode presentasi &amp; pengajaran guru tingkat <strong>SMP / MTs</strong> berbasis fikih Mazhab Syafi'i (<em>Fath al-Qarib</em> &amp; <em>Ihya' 'Ulum al-Din</em>) untuk menayangkan peragaan animasi Putra &amp; Putri, batas wajib wudhu, kaidah air 2 qullah, serta demonstrasi kinestetik di kelas."
            : "Mode presentasi &amp; pengajaran guru tingkat <strong>SD / MI</strong> untuk menayangkan animasi peragaan wudhu Putra &amp; Putri, penjelasan batas wajib yang ramah anak, panduan wudhu gayung, serta demonstrasi praktik kinestetik 3× bersama siswa di kelas.";
      }
      if (startBtn) startBtn.textContent = "▶ Tayangkan Animasi Segmen 1";
      if (kinBtn) kinBtn.textContent = "✋ Demonstrasi Kinestetik";

      if (progBox) {
        progBox.innerHTML = `
          <div class="teacher-hero-card" style="width:100%;text-align:left;display:flex;flex-direction:column;gap:10px;">
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(254,243,199,0.22);border:1px solid rgba(253,230,138,0.55);color:#fef3c7;padding:5px 11px;border-radius:999px;font-size:12px;font-weight:800;width:fit-content;">
              👨‍🏫 IDENTITAS PENGAJAR (MODE GURU)
            </div>
            <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;font-size:13px;color:#ffffff;">
              <div><span style="opacity:0.8">Nama Guru:</span> <strong>${escapeHtml(prof.name || "Guru Pengajar")}</strong></div>
              <div><span style="opacity:0.8">Sekolah / Madrasah:</span> <strong>${escapeHtml(prof.school || "-")}</strong></div>
              <div><span style="opacity:0.8">Kelas Diajar:</span> <strong>${escapeHtml(prof.kelas || "-")}</strong></div>
              <div><span style="opacity:0.8">Jenjang Materi:</span> <strong>${state.level === "smp" ? "SMP / MTs" : "SD / MI"}</strong></div>
            </div>
            <div style="font-size:12px;color:#d1fae5;line-height:1.45;">
              💡 Seluruh 8 segmen animasi, audio narator, panduan wudhu gayung, dan zona kinestetik siap ditayangkan di kelas.
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              <button type="button" id="btn-open-live-rekap" class="btn btn-sm" style="flex:1 1 100%;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1c1917;border:1px solid #fde68a;font-weight:800;border-radius:10px;padding:10px 12px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.18);">
                📊 Filter Rekap &amp; Analisis N-Gain (Live di Web)
              </button>
              <a href="${TEACHER_SHEETS_VIEW_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="flex:1;min-width:155px;background:rgba(254,243,199,0.92);color:#92400e;border:1px solid #fcd34d;font-weight:800;text-align:center;text-decoration:none;border-radius:10px;padding:8px 10px;display:inline-flex;align-items:center;justify-content:center;gap:6px;">
                📗 Buka Google Sheets (Viewer)
              </a>
              <button type="button" id="btn-open-rubric" class="btn btn-sm" style="flex:1;min-width:155px;background:#e0f2fe;color:#0369a1;border:1px solid #7dd3fc;font-weight:800;border-radius:10px;padding:8px 10px;cursor:pointer;">
                📋 Rubrik Observasi Praktik
              </button>
            </div>
          </div>
        `;
        const liveRekapBtn = document.getElementById("btn-open-live-rekap");
        if (liveRekapBtn) liveRekapBtn.addEventListener("click", openLiveRekapModal);
        const rubBtn = document.getElementById("btn-open-rubric");
        if (rubBtn) rubBtn.addEventListener("click", openPsychomotorRubricModal);
      }
    } else {
      const prog = getOverallProgress();
      const { segDone, kinDone, pct } = prog;

      const pctEl = document.getElementById("home-progress-pct");
      if (pctEl) pctEl.textContent = `${pct}%`;
      const ring = document.getElementById("home-ring-fg");
      if (ring) {
        const circ = 314.16;
        ring.style.strokeDashoffset = String(circ - (circ * pct) / 100);
      }

      const segEl = document.getElementById("stat-segments");
      if (segEl) segEl.textContent = `${segDone} / 8`;
      const kinEl = document.getElementById("stat-kinesthetic");
      if (kinEl) kinEl.textContent = `${kinDone} / 4`;
      const statQuizEl = document.getElementById("stat-quiz");
      if (statQuizEl) {
        statQuizEl.textContent =
          state.quizSubmitted ? "Terkirim ✓" : state.quizScore !== null ? "Selesai" : "Belum";
      }
    }

    const grid = document.getElementById("home-segment-grid");
    const lvlExtras = (DATA.levelSegmentExtras && DATA.levelSegmentExtras[state.level]) || {};
    grid.innerHTML = DATA.segments
      .map((seg, idx) => {
        const done = !teacherMode && state.completedSegments.has(seg.id);
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
              <span>${teacherMode ? "Tayangkan →" : done ? "✓ Selesai" : "Buka →"}</span>
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

    renderHomeAcademicSection();
  }

  function renderHomeAcademicSection() {
    const homeView = document.getElementById("view-home");
    if (!homeView) return;
    let sec = document.getElementById("home-academic-section");
    if (!sec) {
      sec = document.createElement("div");
      sec.id = "home-academic-section";
      sec.className = "home-academic-grid";
      homeView.appendChild(sec);
    }

    const isSmp = state.level === "smp";
    const tpItems = isSmp
      ? [
          "Menganalisis dalil Al-Qur'an (QS. Al-Ma'idah: 6) serta ketentuan fikih rukun, syarat sah, dan sunnah wudhu menurut <strong>Mazhab Syafi'i</strong>.",
          "Membedakan hukum air <em>mutlaq</em> dan air <em>musta'mal</em> serta menerapkan kaidah <strong>2 Qullah</strong> saat berwudhu menggunakan gayung/bak air.",
          "Mengidentifikasi ketentuan fikih wudhu bagi remaja putra &amp; putri (berhijab, penghalang air di kulit/kuku, serta adab menjaga aurat).",
          "Menerapkan adab <em>thuma'ninah</em> (3× basuhan tenang), sikap <em>anti-israf</em> (hemat air), serta mengevaluasi studi kasus fikih wudhu."
        ]
      : [
          "Memahami pengertian, niat, serta urutan rukun dan sunnah berwudhu secara tertib sesuai tuntunan <strong>Mazhab Syafi'i</strong>.",
          "Mengenali batas wajib anggota wudhu (wajah, kedua tangan hingga siku, sebagian kepala, dan kedua kaki hingga mata kaki) dengan tepat.",
          "Mempraktikkan tata cara berwudhu menggunakan keran maupun gayung/bak air secara tenang (<em>thuma'ninah</em>) dan tidak boros air.",
          "Membiasakan adab kesopanan, kebersihan, serta doa sebelum dan sesudah berwudhu dalam kehidupan sehari-hari."
        ];

    sec.innerHTML = `
      <div class="academic-card academic-fiqh-full">
        <div class="academic-card-head">
          <span class="academic-ico">📖</span>
          <div>
            <h3>Ringkasan Syarat Sah &amp; Hal yang Membatalkan Wudhu (Mazhab Syafi'i)</h3>
            <small>Rujukan Fikih <em>Fath al-Qarib al-Mujib</em> — Wajib Dipahami Sebelum &amp; Sesudah Berwudhu</small>
          </div>
        </div>
        <div class="fiqh-two-col">
          <div class="fiqh-box">
            <h4>✅ Syarat Sah Wudhu</h4>
            <ul>
              <li><strong>Islam &amp; Tamyiz</strong> (sudah dapat membedakan baik dan buruk).</li>
              <li><strong>Suci dari haid &amp; nifas</strong> (khusus bagi siswi perempuan).</li>
              <li><strong>Menggunakan air suci menyucikan (<em>air mutlaq</em>)</strong>, bukan air <em>musta'mal</em>.</li>
              <li><strong>Tidak ada penghalang air ke kulit/kuku</strong> (seperti cat, kuteks, lem, atau lilin).</li>
              <li><strong>Tidak ada benda yang mengubah sifat air</strong> di atas anggota wudhu.</li>
            </ul>
          </div>
          <div class="fiqh-box fiqh-box-warn">
            <h4>⚠️ Hal yang Membatalkan Wudhu (<em>Nawaqidh al-Wudhu</em>)</h4>
            <ul>
              <li><strong>Keluar sesuatu dari qubul atau dubur</strong> (buang air kecil/besar, kentut).</li>
              <li><strong>Hilang akal</strong> karena tidur dengan posisi duduk tidak mantap, pingsan, atau gila.</li>
              <li><strong>Bersentuhan kulit laki-laki &amp; perempuan dewasa bukan mahram</strong> tanpa penghalang.</li>
              <li><strong>Menyentuh kemaluan manusia</strong> menggunakan telapak tangan bagian dalam tanpa penghalang.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="academic-card">
        <div class="academic-card-head">
          <span class="academic-ico">🎯</span>
          <div>
            <h3>Capaian &amp; Tujuan Pembelajaran (${isSmp ? "SMP / MTs" : "SD / MI"})</h3>
            <small>Indikator Kompetensi Fikih &amp; Adab Wudhu — Kurikulum Merdeka PAI</small>
          </div>
        </div>
        <ol class="academic-tp-list">
          ${tpItems.map((t) => `<li>${t}</li>`).join("")}
        </ol>
      </div>

      <div class="academic-card">
        <div class="academic-card-head">
          <span class="academic-ico">📚</span>
          <div>
            <h3>Modul Ajar &amp; Materi Pembelajaran Lengkap (SD/MI &amp; SMP/MTs)</h3>
            <small>Dokumen Modul Fikih &amp; Adab Berwudhu Sesuai Tuntunan Mazhab Syafi'i</small>
          </div>
        </div>
        <p style="font-size:13.2px;color:#475569;margin:0 0 12px;line-height:1.5;">
          Akses langsung dokumen <strong>Modul Ajar &amp; Materi Pembelajaran</strong> untuk jenjang <strong>SD / MI (Kelas IV–VI)</strong> maupun pendalaman fikih &amp; dalil tingkat <strong>SMP / MTs (Kelas VII)</strong>:
        </p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <a href="${getGatewayUrl()}?modul=sd" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background:#f0f9ff;color:#0369a1;border:1.5px solid #0284c7;font-weight:800;border-radius:12px;padding:11px 14px;text-decoration:none;display:flex;align-items:center;justify-content:space-between;">
            <span>🎒 Modul Tingkat SD / MI (Kelas IV, V &amp; VI)</span>
            <span>Buka Modul di Web →</span>
          </a>
          <a href="${getGatewayUrl()}?modul=smp" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background:#eef2ff;color:#4338ca;border:1.5px solid #4f46e5;font-weight:800;border-radius:12px;padding:11px 14px;text-decoration:none;display:flex;align-items:center;justify-content:space-between;">
            <span>🎓 Modul Tingkat SMP / MTs (Kelas VII)</span>
            <span>Buka Modul di Web →</span>
          </a>
        </div>
      </div>
    `;
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

    // Dual Side-by-Side Cartoon Stages + Filter Tampilan (Putra & Putri | Khusus Putra | Khusus Putri)
    const stageMale = document.getElementById("cartoon-stage-male");
    const stageFemale = document.getElementById("cartoon-stage-female");
    const dualGrid = stageMale && stageMale.closest(".dual-stage-grid");
    if (dualGrid) {
      let filterBar = document.getElementById("stage-gender-filter");
      if (!filterBar) {
        filterBar = document.createElement("div");
        filterBar.id = "stage-gender-filter";
        filterBar.className = "stage-gender-filter";
        filterBar.innerHTML = `
          <span class="sgf-label">Tampilan Peraga:</span>
          <button type="button" class="sgf-btn active" data-sgf="both">👦👧 Putra &amp; Putri</button>
          <button type="button" class="sgf-btn" data-sgf="male">👦 Khusus Putra</button>
          <button type="button" class="sgf-btn" data-sgf="female">🧕 Khusus Putri</button>
        `;
        dualGrid.parentElement.insertBefore(filterBar, dualGrid);
        filterBar.querySelectorAll(".sgf-btn").forEach((b) => {
          b.addEventListener("click", () => {
            state.stageFilter = b.dataset.sgf || "both";
            applyStageGenderFilter();
          });
        });
      }
      applyStageGenderFilter();
    }
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

    // Mark Done button (sembunyikan di Mode Guru agar UI murni untuk pengajaran guru)
    const doneBtn = document.getElementById("btn-mark-seg-done");
    const kinSegBtn = document.getElementById("btn-try-kinesthetic-seg");
    if (isTeacherSession()) {
      if (doneBtn) doneBtn.style.display = "none";
      if (kinSegBtn) kinSegBtn.textContent = "✋ Demonstrasi Kinestetik 3×";
    } else if (doneBtn) {
      doneBtn.style.display = "";
      const isDone = state.completedSegments.has(seg.id);
      doneBtn.textContent = isDone ? "✓ Segmen Ini Sudah Ditandai Selesai" : "✓ Tandai Segmen Ini Sudah Dipahami";
    }
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
        speakKinestheticPoint(pt, isAllDone);
        renderKinesthetic();
        const fbNow = document.getElementById("hotspot-feedback");
        fbNow.className = isAllDone ? "hotspot-feedback complete" : "hotspot-feedback";
        const nextHint = !isAllDone ? `<br><span style="font-weight:700">Berikutnya: ${areaData.points[foundSet.size].prompt}</span>` : "";
        fbNow.innerHTML = `✅ <strong>${pt.title}:</strong> ${pt.desc}${nextHint}`;
        if (isAllDone) {
          showToast(`★ Bintang ${state.kinArea.toUpperCase()} terbuka!`);
          checkExitWhen100AndSubmitted();
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

  let tempoCountdownTimer = null;

  function ensureTempoProgressBar() {
    const dotsWrap = document.getElementById("tempo-dots");
    if (!dotsWrap) return null;
    let wrap = document.getElementById("tempo-beat-bar-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "tempo-beat-bar-wrap";
      wrap.className = "tempo-beat-bar-wrap";
      wrap.innerHTML = `<div class="tempo-beat-bar-fill" id="tempo-beat-bar-fill"></div>`;
      dotsWrap.parentElement.insertBefore(wrap, dotsWrap);
    }
    return document.getElementById("tempo-beat-bar-fill");
  }

  function speakKinestheticPoint(pt, isAllDone) {
    if (!window.speechSynthesis || !pt) return;
    if (AUDIO && typeof AUDIO.isSpeaking === "function" && AUDIO.isSpeaking()) return;
    try {
      window.speechSynthesis.cancel();
      const cleanTitle = String(pt.title || "").replace(/—/g, ",");
      const msg = isAllDone
        ? `${cleanTitle}. Alhamdulillah, seluruh batas wajib selesai!`
        : `${cleanTitle}.`;
      const u = new SpeechSynthesisUtterance(msg);
      u.lang = "id-ID";
      u.rate = 1.05;
      u.pitch = 1.02;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function speakCountdownWord(text) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "id-ID";
      u.rate = 0.95;
      u.pitch = 1.0;
      const voices = AUDIO.getVoices ? AUDIO.getVoices() : [];
      if (voices && voices.length) u.voice = voices[0];
      AUDIO.duckBgm(true);
      u.onend = () => {
        if (!state.tempoRunning) AUDIO.duckBgm(false);
      };
      window.speechSynthesis.speak(u);
    } catch (e) {}
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
    const barFill = ensureTempoProgressBar();
    dots.forEach((d) => d.classList.remove("active", "done"));

    const ordinals = ["pertama", "kedua", "ketiga"];
    const numberWords = { 6: "enam", 5: "lima", 4: "empat", 3: "tiga", 2: "dua", 1: "satu" };

    let step = 1;
    const runBeat = () => {
      if (!state.tempoRunning) return;
      clearInterval(tempoCountdownTimer);
      if (step > 3) {
        circle.classList.remove("inhale");
        countEl.textContent = "Selesai ✓";
        cueEl.textContent = "Masya Allah, tenang!";
        if (barFill) {
          barFill.style.transition = "none";
          barFill.style.width = "100%";
        }
        if (instEl) instEl.textContent = ex.done;
        AUDIO.playChime("win");
        speakCountdownWord("Selesai. Masya Allah, tenang.");
        state.tempoRunning = false;
        return;
      }

      dots.forEach((d) => {
        const s = Number(d.dataset.step);
        d.classList.toggle("done", s < step);
        d.classList.toggle("active", s === step);
      });

      circle.classList.add("inhale");
      countEl.textContent = `Hitungan ${step} / 3`;
      if (instEl) instEl.textContent = ex.steps[step - 1] || ex.prep;
      AUDIO.playChime("beat");

      // Animasi progress bar halus 6.5 detik + suara hitung mundur 6, 5, 4, 3, 2, 1
      if (barFill) {
        barFill.style.transition = "none";
        barFill.style.width = "0%";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            barFill.style.transition = "width 6.5s linear";
            barFill.style.width = "100%";
          });
        });
      }

      let secLeft = 6;
      cueEl.textContent = `🔊 Hitungan: ${secLeft} detik`;
      speakCountdownWord(`Hitungan ${ordinals[step - 1] || step}. Enam.`);
      tempoCountdownTimer = setInterval(() => {
        if (!state.tempoRunning) {
          clearInterval(tempoCountdownTimer);
          return;
        }
        secLeft--;
        if (secLeft >= 1) {
          cueEl.textContent = secLeft <= 3 ? `🔊 ${ex.hold} (${secLeft} dtk)` : `🔊 Gerakkan perlahan... (${secLeft} dtk)`;
          speakCountdownWord(numberWords[secLeft] || String(secLeft));
        } else {
          clearInterval(tempoCountdownTimer);
        }
      }, 1000);

      state.tempoHoldTimer = setTimeout(() => {
        if (!state.tempoRunning) return;
        circle.classList.remove("inhale");
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
    clearInterval(tempoCountdownTimer);
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    try { AUDIO.duckBgm(false); } catch (e) {}
    const circle = document.getElementById("tempo-circle");
    if (circle) circle.classList.remove("inhale");
    const countEl = document.getElementById("tempo-count");
    const cueEl = document.getElementById("tempo-cue");
    if (countEl) countEl.textContent = "Siap";
    if (cueEl) cueEl.textContent = "Tekan Mulai";
    const barFill = document.getElementById("tempo-beat-bar-fill");
    if (barFill) {
      barFill.style.transition = "none";
      barFill.style.width = "0%";
    }
    document.querySelectorAll("#tempo-dots .t-dot").forEach((d) => d.classList.remove("active", "done"));
    syncTempoPreview();
  }

  // ==================== VIEW 4: CEK PEMAHAMAN (ACAK UNIK PER SISWA + BEDA PRETEST / POSTTEST / LATIHAN) ====================
  const SHUFFLED_QUIZ_KEY = "adab_wudhu_shuffled_quiz_v1";

  function fisherYatesShuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildShuffledQuiz(baseQuiz) {
    return fisherYatesShuffle(baseQuiz).map((q, newIdx) => {
      const cleanQuestion = String(q.question || "").replace(/^\s*\d+\.\s*/, "").trim();
      const taggedOpts = (q.options || []).map((text, idx) => ({ text, isCorrect: idx === q.correct }));
      const shuffledOpts = fisherYatesShuffle(taggedOpts);
      const newCorrect = shuffledOpts.findIndex((o) => o.isCorrect);
      return {
        ...q,
        question: `${newIdx + 1}. ${cleanQuestion}`,
        options: shuffledOpts.map((o) => o.text),
        correct: newCorrect >= 0 ? newCorrect : 0
      };
    });
  }

  function getActiveQuiz() {
    const baseQuiz = (DATA.quizByLevel && DATA.quizByLevel[state.level]) ? DATA.quizByLevel[state.level] : DATA.quiz;
    if (state.shuffledQuiz && state.shuffledQuizLevel === state.level && state.shuffledQuiz.length === baseQuiz.length) {
      return state.shuffledQuiz;
    }
    try {
      const cached = JSON.parse(sessionStorage.getItem(SHUFFLED_QUIZ_KEY) || "null");
      if (cached && cached.level === state.level && Array.isArray(cached.items) && cached.items.length === baseQuiz.length) {
        state.shuffledQuiz = cached.items;
        state.shuffledQuizLevel = state.level;
        return state.shuffledQuiz;
      }
    } catch (e) {}

    state.shuffledQuiz = buildShuffledQuiz(baseQuiz);
    state.shuffledQuizLevel = state.level;
    try {
      sessionStorage.setItem(SHUFFLED_QUIZ_KEY, JSON.stringify({ level: state.level, items: state.shuffledQuiz }));
    } catch (e) {}
    return state.shuffledQuiz;
  }

  function renderQuiz() {
    const activeQuiz = getActiveQuiz();
    const sessionMode = getSessionMode();
    const isLatihan = sessionMode === "latihan";
    const isPretest = sessionMode === "pretest";

    const titleEl = document.getElementById("quiz-title");
    if (titleEl) {
      const modeTag = isPretest ? "PRETEST (Kemampuan Awal)" : isLatihan ? "LATIHAN MANDIRI (Dengan Umpan Balik)" : "POSTTEST (Evaluasi Akhir)";
      titleEl.textContent =
        state.level === "smp"
          ? `${modeTag} — SMP / MTs (${activeQuiz.length} Soal Acak)`
          : `${modeTag} — SD / MI (${activeQuiz.length} Soal Acak)`;
    }

    const totalQ = activeQuiz.length;
    const unansweredNums = [];
    activeQuiz.forEach((q, idx) => {
      if (typeof state.quizAnswers[q.id] !== "number") {
        unansweredNums.push(idx + 1);
      }
    });
    const answeredCount = totalQ - unansweredNums.length;

    const container = document.getElementById("quiz-container");
    let progBanner = document.getElementById("quiz-progress-status-bar");
    if (!progBanner && container && container.parentElement) {
      progBanner = document.createElement("div");
      progBanner.id = "quiz-progress-status-bar";
      progBanner.className = "quiz-progress-status-bar";
      container.parentElement.insertBefore(progBanner, container);
    }
    if (progBanner) {
      const isComplete = unansweredNums.length === 0;
      progBanner.className = `quiz-progress-status-bar ${isComplete ? "complete" : "pending"}`;
      progBanner.innerHTML = isComplete
        ? `<div class="qps-left">✅ <strong>Terjawab Lengkap: ${answeredCount} / ${totalQ} Soal</strong></div><div class="qps-right">Silakan gulir ke bawah untuk menekan tombol <strong>📤 Kirim &amp; Kunci Hasil</strong>.</div>`
        : `<div class="qps-left">📝 <strong>Progres Jawaban: ${answeredCount} / ${totalQ} Soal</strong></div><div class="qps-right">⚠️ Belum dijawab (${unansweredNums.length} soal): <strong>Nomor ${unansweredNums.join(", ")}</strong></div>`;
    }

    container.innerHTML = activeQuiz
      .map((q, idx) => {
        const picked = state.quizAnswers[q.id];
        const answered = typeof picked === "number";
        const isRight = answered && picked === q.correct;
        const feedbackHtml =
          isLatihan && answered
            ? `<div class="latihan-fb ${isRight ? "ok" : "err"}">${
                isRight
                  ? `✅ <strong>Tepat sekali!</strong> ${q.explain || "Pemahaman Anda sudah sesuai tuntunan Mazhab Syafi'i."}`
                  : `❌ <strong>Belum tepat.</strong> Jawaban benar: <strong>${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}</strong>${q.explain ? ` — ${q.explain}` : ""}`
              }</div>`
            : "";

        return `
          <div class="q-card">
            <h3>${q.question}</h3>
            <div class="q-options">
              ${q.options
                .map((opt, idx) => {
                  let cls = "";
                  if (answered && idx === picked) {
                    cls = isLatihan ? (idx === q.correct ? "selected latihan-right" : "selected latihan-wrong") : "selected";
                  } else if (isLatihan && answered && idx === q.correct) {
                    cls = "latihan-right";
                  }
                  return `
                    <button class="q-opt ${cls}" data-qid="${q.id}" data-opt="${idx}" ${state.quizSubmitted ? "disabled" : ""} type="button">
                      ${String.fromCharCode(65 + idx)}. ${opt}${answered && idx === picked ? "  ✓" : ""}
                    </button>
                  `;
                })
                .join("")}
            </div>
            ${feedbackHtml}
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".q-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.qid;
        const optIdx = Number(btn.dataset.opt);
        state.quizAnswers[qid] = optIdx;
        if (isLatihan) {
          const targetQ = activeQuiz.find((item) => item.id === qid);
          AUDIO.playChime(targetQ && optIdx === targetQ.correct ? "ok" : "err");
        } else {
          // Bunyi netral pada Pretest & Posttest agar siswa di sebelahnya tidak tahu benar/salahnya
          AUDIO.playChime("beat");
        }
        checkQuizComplete(true);
        renderQuiz();
      });
    });

    checkQuizComplete(false);
    renderQuizRecords();
  }

  function checkQuizComplete(playSound = false) {
    const activeQuiz = getActiveQuiz();
    const total = activeQuiz.length;
    const unansweredNums = [];
    activeQuiz.forEach((q, idx) => {
      if (typeof state.quizAnswers[q.id] !== "number") unansweredNums.push(idx + 1);
    });
    const answeredCount = total - unansweredNums.length;
    const resCard = document.getElementById("quiz-result-card");

    let missingCard = document.getElementById("quiz-missing-alert-card");
    if (!missingCard && resCard && resCard.parentElement) {
      missingCard = document.createElement("div");
      missingCard.id = "quiz-missing-alert-card";
      missingCard.className = "quiz-missing-alert-card";
      resCard.parentElement.insertBefore(missingCard, resCard);
    }

    if (answeredCount < total) {
      resCard.classList.add("hidden");
      if (missingCard) {
        missingCard.classList.remove("hidden");
        missingCard.innerHTML = `
          <div class="qma-badge">📝 Terjawab ${answeredCount} dari ${total} Soal</div>
          <h4>⚠️ Tombol Kirim Belum Aktif — Masih Ada ${unansweredNums.length} Soal yang Terlewat!</h4>
          <p>Silakan pilih jawaban terlebih dahulu pada: <strong>Soal Nomor ${unansweredNums.join(", ")}</strong> agar tombol <strong>📤 Kirim &amp; Kunci Hasil</strong> muncul di sini.</p>
        `;
      }
      return;
    }
    if (missingCard) missingCard.classList.add("hidden");

    let score = 0;
    activeQuiz.forEach((q) => {
      if (state.quizAnswers[q.id] === q.correct) score++;
    });
    state.quizScore = score;
    saveState();

    // Tampilkan konfirmasi sesuai mode sesi (Pretest / Posttest / Latihan Mandiri)
    const sessionMode = getSessionMode();
    const prog = getOverallProgress();
    const badgeEl = document.getElementById("result-score-badge");
    const titleEl = document.getElementById("result-title");
    const descEl = document.getElementById("result-desc");
    const lockedNote = document.getElementById("submit-locked-note");

    let contBtn = document.getElementById("btn-continue-to-100");
    if (!contBtn) {
      contBtn = document.createElement("button");
      contBtn.id = "btn-continue-to-100";
      contBtn.type = "button";
      contBtn.className = "btn btn-emerald";
      contBtn.style.marginLeft = "8px";
      contBtn.addEventListener("click", () => jumpToIncompleteMaterial());
      const actionsWrap = resCard.querySelector(".result-actions");
      if (actionsWrap) actionsWrap.appendChild(contBtn);
    }

    // 2. Baris Identitas Siswa Terkunci (tetap terlihat di semua sesi termasuk Latihan Mandiri agar desain seragam dengan Pretest & Posttest)
    const studentBar = document.querySelector(".quiz-student-bar");
    if (studentBar) {
      studentBar.classList.remove("hidden");
      studentBar.style.display = "";
    }

    if (sessionMode === "pretest") {
      badgeEl.textContent = `${total} / ${total} Soal Pretest Terjawab`;
      titleEl.textContent = "Seluruh Soal Pretest Sudah Dijawab!";
      descEl.textContent = "Klik tombol di bawah untuk mengirim hasil Pretest Anda kepada guru dan keluar otomatis ke Halaman Awal.";
      contBtn.classList.add("hidden");
    } else if (sessionMode === "latihan") {
      const pctLat = Math.round((score / total) * 100);
      badgeEl.textContent = `${total} / ${total} Soal Latihan Terjawab • Skor: ${score} / ${total} (${pctLat}%)`;
      titleEl.textContent = "Seluruh Soal Latihan Mandiri Sudah Dijawab!";
      descEl.textContent = "Klik tombol '📤 Kirim & Kunci Hasil' di bawah untuk mengirim hasil Latihan Mandiri Anda ke rekapan Google Sheets Guru dan keluar otomatis ke Halaman Awal, atau klik '↻ Ulangi Kuis' jika ingin berlatih kembali.";
      contBtn.classList.add("hidden");
    } else if (state.quizSubmitted && !prog.is100) {
      badgeEl.textContent = `${total} / ${total} Soal Terjawab • Pemahaman Materi ${prog.pct}%`;
      titleEl.textContent = "Seluruh Pertanyaan Sudah Dijawab!";
      descEl.innerHTML = `⚠️ <strong>Belum Dapat Keluar dari Web!</strong> Pemahaman Materi Anda baru <strong>${prog.pct}%</strong> (Segmen Materi: <strong>${prog.segDone}/8</strong> • Bintang Kinestetik: <strong>${prog.kinDone}/4</strong>). Selesaikan seluruh materi hingga <strong>100%</strong> untuk keluar otomatis.`;
      if (lockedNote) {
        lockedNote.classList.remove("hidden");
        lockedNote.innerHTML = `🔒 Jawaban Anda sudah tersimpan, tetapi halaman <strong>terkunci tidak dapat keluar</strong> sebelum <strong>Pemahaman Materi mencapai 100%</strong> (saat ini ${prog.pct}%).`;
      }
      contBtn.textContent = `▶ Lanjutkan Materi hingga 100% (${prog.pct}%)`;
      contBtn.classList.remove("hidden");
    } else if (!prog.is100) {
      badgeEl.textContent = `${total} / ${total} Soal Terjawab • Pemahaman Materi ${prog.pct}%`;
      titleEl.textContent = "Seluruh Pertanyaan Sudah Dijawab!";
      descEl.innerHTML = `⚠️ Pemahaman Materi saat ini baru <strong>${prog.pct}%</strong> (Segmen Materi: <strong>${prog.segDone}/8</strong> • Bintang Kinestetik: <strong>${prog.kinDone}/4</strong>). Anda dapat mengirim jawaban sekarang, namun <strong>tidak dapat keluar dari web sebelum Pemahaman Materi mencapai 100%</strong>.`;
      contBtn.textContent = `▶ Lengkapi Materi 100% (${prog.pct}%)`;
      contBtn.classList.remove("hidden");
    } else {
      badgeEl.textContent = `${total} / ${total} Soal Terjawab • Pemahaman Materi 100%`;
      titleEl.textContent = "Seluruh Pertanyaan Sudah Dijawab!";
      descEl.textContent =
        "Alhamdulillah, Pemahaman Materi sudah 100%! Klik tombol di bawah untuk mengirim hasil Posttest kepada guru dan keluar otomatis.";
      contBtn.classList.add("hidden");
    }

    resCard.classList.remove("hidden");
    if (playSound) AUDIO.playChime("ok");
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
        if (checkExitWhen100AndSubmitted()) return;
        state.segIdx++;
        state.subIdx = 0;
        state.zoomOpen = false;
        AUDIO.playChime("ok");
        renderLearn(true);
      } else {
        state.completedSegments.add(seg.id);
        saveState();
        AUDIO.playChime("win");
        if (checkExitWhen100AndSubmitted()) return;
        showToast("Semua 8 segmen selesai! Mari lanjut ke Zona Kinestetik.");
        switchView("kinesthetic");
      }
    });

    document.getElementById("btn-mark-seg-done").addEventListener("click", () => {
      const seg = DATA.segments[state.segIdx];
      state.completedSegments.add(seg.id);
      saveState();
      AUDIO.playChime("ok");
      renderLearn(false);
      if (checkExitWhen100AndSubmitted()) return;
      showToast(`Segmen ${seg.id} ditandai selesai! (${state.completedSegments.size}/8)`);
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

    if (typeof AUDIO.onLoadingChange === "function") {
      AUDIO.onLoadingChange((loading) => {
        const speakBtn = document.getElementById("btn-ai-speak");
        if (speakBtn && loading) {
          speakBtn.textContent = "⏳ Memuat Audio Narator...";
        }
      });
    }

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
      const rawSession = (prof.sesi || "Posttest").trim();

      if (!rawName || !rawSchool || !rawClass) {
        showToast("⚠️ Identitas siswa belum lengkap. Silakan masuk melalui halaman awal.");
        return;
      }

      const name = `[${level}] ${rawName} — ${rawSchool} — Kelas ${rawClass} (${rawSession})`;

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
          const postPromise = fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            keepalive: true,
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              level,
              studentName: rawName,
              studentSchool: rawSchool,
              studentClass: rawClass,
              studentSession: rawSession,
              name,
              score: state.quizScore,
              total,
              pct: `${pct}%`,
              time
            })
          });
          await Promise.race([
            postPromise,
            new Promise((resolve) => setTimeout(resolve, 1400))
          ]);
          synced = true;
        } catch (err) {
          synced = false;
        }
      }

      const records = loadQuizRecords();
      records.push({ name, score: state.quizScore, total, pct, synced, time });
      saveQuizRecords(records);

      state.quizSubmitted = true;
      const sessionModeNow = getSessionMode();
      const progAfter = getOverallProgress();

      // Pada Pretest & Latihan Mandiri, tidak dikunci oleh syarat 100% materi
      if (sessionModeNow === "posttest" && !progAfter.is100) {
        saveBtn.textContent = `🔒 Jawaban Tersimpan (Pemahaman Materi ${progAfter.pct}% — Wajib 100% untuk Keluar)`;
        checkQuizComplete(false);
        renderQuiz();
        showToast(
          `⚠️ Jawaban tersimpan, tetapi Anda belum dapat keluar sebelum Pemahaman Materi 100% (saat ini ${progAfter.pct}%: Segmen ${progAfter.segDone}/8, Kinestetik ${progAfter.kinDone}/4)!`
        );
        return;
      }

      saveBtn.textContent =
        sessionModeNow === "pretest"
          ? "✅ Pretest Terkirim! Kembali ke Halaman Awal..."
          : sessionModeNow === "latihan"
          ? "✅ Latihan Tercatat! Kembali ke Halaman Awal..."
          : "✅ Terkirim (Pemahaman Materi 100%)! Kembali ke Halaman Awal...";
      document.getElementById("submit-locked-note").classList.remove("hidden");
      renderQuiz();
      showToast("✅ Jawaban berhasil terkirim ke Google Sheets Guru! Otomatis kembali ke Halaman Awal...");
      performFinalExit();
    });

    // Cegah siswa menutup/meninggalkan halaman secara paksa khusus pada sesi Posttest sebelum 100%
    window.addEventListener("beforeunload", (e) => {
      if (getSessionMode() === "posttest" && !isExitingToGateway && !getOverallProgress().is100) {
        e.preventDefault();
        e.returnValue = "Pemahaman Materi Anda belum mencapai 100%. Selesaikan seluruh materi terlebih dahulu sebelum keluar.";
        return e.returnValue;
      }
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
  function getGatewayUrl() {
    const clean = window.location.href.split("?")[0].split("#")[0];
    return clean.replace(/\/(sd|smp)(\/index\.html|\/)?$/i, "/");
  }

  function installBackButtonLock() {
    const cleanUrl = window.location.href.split("?")[0].split("#")[0];
    try {
      window.history.replaceState({ adabWudhuGuard: true }, document.title, cleanUrl);
      window.history.pushState({ adabWudhuGuard: true }, document.title, cleanUrl);
    } catch (e) {}

    window.addEventListener("popstate", () => {
      if (isExitingToGateway) return;
      const modeNow = getSessionMode();
      if (modeNow === "teacher" || modeNow === "latihan") return;
      if (modeNow === "pretest" && !state.quizSubmitted) {
        try {
          window.history.pushState({ adabWudhuGuard: true }, document.title, cleanUrl);
        } catch (e) {}
        showToast("🔒 Selesaikan dan kirim seluruh soal Pretest terlebih dahulu!");
        return;
      }
      const prog = getOverallProgress();
      if (!prog.is100 || !state.quizSubmitted) {
        try {
          window.history.pushState({ adabWudhuGuard: true }, document.title, cleanUrl);
        } catch (e) {}
        showToast(
          `🔒 Tidak dapat keluar/kembali sebelum Pemahaman Materi 100% & Kuis Terkirim (saat ini ${prog.pct}%)!`
        );
      }
    });

    window.addEventListener("pageshow", (ev) => {
      if (ev.persisted || !isExitingToGateway) {
        try {
          const saved = JSON.parse(sessionStorage.getItem(PROFILE_KEY) || "null");
          if (!saved || !saved.name) {
            window.location.replace(getGatewayUrl());
          }
        } catch (e) {}
      }
    });
  }

  function loadStudentProfile() {
    const params = new URLSearchParams(window.location.search);
    const qNama = (params.get("nama") || "").trim();
    const qSekolah = (params.get("sekolah") || "").trim();
    const qKelas = (params.get("kelas") || "").trim();
    const qSesi = (params.get("sesi") || "Posttest").trim();
    const qGuru = params.get("guru") === "1";

    if (qNama && qSekolah && qKelas) {
      state.studentProfile = {
        name: qNama,
        school: qSekolah,
        kelas: qKelas,
        sesi: qSesi,
        level: state.level,
        levelLabel: state.level === "smp" ? "SMP/MTs" : "SD/MI",
        isTeacher: qGuru
      };
      try {
        sessionStorage.setItem(PROFILE_KEY, JSON.stringify(state.studentProfile));
      } catch (e) {}
      installBackButtonLock();
      return true;
    }

    try {
      const saved = JSON.parse(sessionStorage.getItem(PROFILE_KEY) || "null");
      if (saved && saved.name && saved.school && saved.kelas) {
        state.studentProfile = {
          name: String(saved.name).trim(),
          school: String(saved.school).trim(),
          kelas: String(saved.kelas).trim(),
          sesi: String(saved.sesi || "Posttest").trim(),
          level: state.level,
          levelLabel: state.level === "smp" ? "SMP/MTs" : "SD/MI",
          isTeacher: Boolean(saved.isTeacher)
        };
        installBackButtonLock();
        return true;
      }
    } catch (e) {}

    // Jika siswa membuka /sd/ atau /smp/ langsung tanpa lewat halaman awal, arahkan ke URL absolut gerbang utama
    const p = window.location.pathname || "";
    if (/\/(sd|smp)(\/index\.html|\/)?$/i.test(p)) {
      window.location.replace(getGatewayUrl());
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

    const lockedHdr = document.querySelector(".student-locked-header");
    if (lockedHdr && !prof.isTeacher) {
      const sesiTag = escapeHtml(prof.sesi || "Posttest");
      lockedHdr.innerHTML = `<span>🔒 <strong>Identitas Siswa Terkunci</strong> • Sesi: <strong>${sesiTag}</strong> (diambil otomatis dari halaman awal).</span>`;
    }

    // Atur navigasi tab berdasarkan Mode (Guru / Pretest / Latihan Mandiri / Posttest)
    const sessionMode = getSessionMode();
    const quizTabBtn = document.querySelector('.nav-tab[data-view="quiz"]');
    const quizViewSec = document.getElementById("view-quiz");
    const materialTabs = document.querySelectorAll('.nav-tab:not([data-view="quiz"]):not(#btn-teacher-exit-menu)');
    const mainNav = (quizTabBtn && quizTabBtn.parentElement) || document.querySelector(".nav-tabs, .main-nav, nav");
    let teacherExitBtn = document.getElementById("btn-teacher-exit-menu");

    const ensureExitBtn = (labelText) => {
      if (mainNav && !teacherExitBtn) {
        teacherExitBtn = document.createElement("button");
        teacherExitBtn.id = "btn-teacher-exit-menu";
        teacherExitBtn.type = "button";
        teacherExitBtn.className = "nav-tab teacher-exit-tab";
        teacherExitBtn.style.background = "#fee2e2";
        teacherExitBtn.style.color = "#991b1b";
        teacherExitBtn.style.border = "1px solid #fca5a5";
        teacherExitBtn.style.fontWeight = "800";
        teacherExitBtn.addEventListener("click", () => {
          showToast("🚪 Keluar kembali ke Halaman Awal...");
          performFinalExit();
        });
        mainNav.appendChild(teacherExitBtn);
      }
      if (teacherExitBtn) {
        teacherExitBtn.innerHTML = `<span class="tab-ico">🚪</span><span>${labelText}</span>`;
        teacherExitBtn.style.display = "";
      }
    };

    if (sessionMode === "teacher") {
      materialTabs.forEach((t) => (t.style.display = ""));
      if (quizTabBtn) quizTabBtn.style.display = "none";
      if (quizViewSec) quizViewSec.style.display = "none";
      ensureExitBtn("Keluar");
    } else if (sessionMode === "pretest") {
      // Pada PRETEST: sembunyikan seluruh tab materi agar siswa tidak mengintip materi sebelum tes awal!
      materialTabs.forEach((t) => (t.style.display = "none"));
      if (quizTabBtn) {
        quizTabBtn.style.display = "";
        quizTabBtn.innerHTML = `<span class="tab-ico">📝</span><span>Soal Pretest</span>`;
      }
      if (quizViewSec) quizViewSec.style.display = "";
      if (teacherExitBtn) teacherExitBtn.style.display = "none";
    } else if (sessionMode === "latihan") {
      // Pada LATIHAN MANDIRI: semua tab terbuka bebas + tombol Keluar bebas kapan saja
      materialTabs.forEach((t) => (t.style.display = ""));
      if (quizTabBtn) {
        quizTabBtn.style.display = "";
        quizTabBtn.innerHTML = `<span class="tab-ico">📖</span><span>Latihan Soal</span>`;
      }
      if (quizViewSec) quizViewSec.style.display = "";
      ensureExitBtn("Keluar");
    } else {
      // Pada POSTTEST: semua 5 tab aktif + wajib tuntas 100% sebelum keluar
      materialTabs.forEach((t) => (t.style.display = ""));
      if (quizTabBtn) quizTabBtn.style.display = "";
      if (quizViewSec) quizViewSec.style.display = "";
      if (teacherExitBtn) teacherExitBtn.style.display = "none";
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
      <span class="splash-badge">${prof && prof.isTeacher ? `👨‍🏫 Mode Mengajar Guru • ${levelLabel}` : levelLabel}</span>
      <h1 class="splash-title">${prof ? `Assalamu'alaikum, ${safeName}!` : "Adab Wudhu Multi-Sensory"}</h1>
      <p class="splash-sub">${prof ? (prof.isTeacher ? `🏫 ${safeSchool} &nbsp;•&nbsp; ${safeClass}<br/>Mode Mengajar Guru Aktif (Hanya Materi Pembelajaran, Tanpa Cek Pemahaman).` : `🏫 ${safeSchool} &nbsp;•&nbsp; Kelas ${safeClass}<br/>Identitas Anda telah terkunci otomatis untuk Cek Pemahaman.`) : "Media Pembelajaran Interaktif Tata Cara &amp; Adab Berwudhu Sesuai Mazhab Syafi'i"}</p>
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

  // ==================== PANDUAN PENGGUNAAN & KONTROL BGM TOPBAR ====================
  function initTopbarUtilities() {
    const fsBtn = document.getElementById("btn-fullscreen");
    const container = (fsBtn && fsBtn.parentElement) || document.querySelector(".topbar-actions, .topbar-inner");
    if (!container) return;

    // 1. Tombol Toggle BGM (🎵/🔇) agar tidak bentrok suara saat dipakai serentak di kelas
    if (!document.getElementById("btn-toggle-bgm")) {
      const bgmBtn = document.createElement("button");
      bgmBtn.id = "btn-toggle-bgm";
      bgmBtn.type = "button";
      bgmBtn.className = "btn btn-outline btn-sm topbar-util-btn";
      bgmBtn.textContent = "🎵 BGM";
      bgmBtn.title = "Nyalakan / Matikan Musik Latar Islami";
      bgmBtn.addEventListener("click", () => {
        const playing = AUDIO.toggleBgm();
        bgmBtn.textContent = playing ? "🎵 BGM" : "🔇 BGM";
        bgmBtn.classList.toggle("bgm-muted", !playing);
        showToast(playing ? "🎵 Musik latar Islami dinyalakan." : "🔇 Musik latar dimatikan (narator tetap aktif).");
      });
      if (fsBtn) container.insertBefore(bgmBtn, fsBtn);
      else container.appendChild(bgmBtn);
    }

    // 2. Tombol ❓ Panduan Penggunaan (butir penting validasi ahli media & kemudahan pengguna)
    if (!document.getElementById("btn-open-guide")) {
      const guideBtn = document.createElement("button");
      guideBtn.id = "btn-open-guide";
      guideBtn.type = "button";
      guideBtn.className = "btn btn-outline btn-sm topbar-util-btn";
      guideBtn.textContent = "❓ Panduan";
      guideBtn.title = "Buka Panduan Penggunaan Media";
      guideBtn.addEventListener("click", openGuideModal);
      if (fsBtn) container.insertBefore(guideBtn, fsBtn);
      else container.appendChild(guideBtn);
    }
  }

  function openGuideModal() {
    let modal = document.getElementById("guide-modal-backdrop");
    if (modal) modal.remove();

    const teacherMode = isTeacherSession();
    const isSmp = state.level === "smp";
    modal = document.createElement("div");
    modal.id = "guide-modal-backdrop";
    modal.className = "guide-modal-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <div class="guide-modal-card">
        <div class="guide-modal-head">
          <h3>❓ Panduan Penggunaan Media (${teacherMode ? "Mode Guru" : isSmp ? "Siswa SMP/MTs" : "Siswa SD/MI"})</h3>
          <button type="button" class="btn btn-outline btn-sm" id="btn-close-guide">✕ Tutup</button>
        </div>
        <div class="guide-modal-body">
          ${
            teacherMode
              ? `
                <ol class="guide-step-list">
                  <li><strong>Presentasi Kelas:</strong> Klik tombol <strong>Proyektor</strong> di pojok kanan atas untuk tampilan layar penuh. Anda dapat mematikan/menyalakan musik latar lewat tombol <strong>🎵/🔇 BGM</strong>.</li>
                  <li><strong>Tayangkan Materi Inti:</strong> Jelaskan <strong>8 Segmen Animasi Putra &amp; Putri</strong> (lengkap dengan <em>Zoom Batas Wajib</em> &amp; audio narator), <strong>Wudhu Gayung (2 Qullah)</strong>, serta demonstrasikan <strong>Zona Kinestetik 3× Thuma'ninah</strong>.</li>
                  <li><strong>Penilaian Kognitif &amp; Psikomotorik:</strong> Hasil <em>Cek Pemahaman</em> siswa (ranah kognitif) dapat dipantau langsung lewat tombol <strong>📊 Buka Rekap Google Sheets</strong> di Beranda Mode Guru, lalu dipadukan dengan observasi praktik wudhu nyata di tempat wudhu sekolah (ranah psikomotorik).</li>
                  <li><strong>Keluar:</strong> Klik tombol <strong>🚪 Keluar</strong> pada menu atas kapan saja untuk kembali ke Halaman Awal.</li>
                </ol>
              `
              : `
                <ol class="guide-step-list">
                  <li><strong>Langkah 1 — Pelajari 8 Segmen Materi:</strong> Buka tab <strong>🎬 Animasi 8 Segmen</strong>, dengarkan narator audio, amati batas wajib Putra &amp; Putri, lalu klik <strong>"✓ Tandai Segmen Ini Sudah Dipahami"</strong> pada setiap segmen (8/8).</li>
                  <li><strong>Langkah 2 — Pahami Wudhu Gayung &amp; Zona Kinestetik:</strong> Pelajari tab <strong>🪣 Wudhu Gayung</strong>, lalu tuntaskan <strong>4 Area Bintang Kinestetik</strong> pada tab <strong>✋ Zona Kinestetik</strong> (4/4).</li>
                  <li><strong>Langkah 3 — Kerjakan Cek Pemahaman (10 Soal):</strong> Buka tab <strong>✅ Cek Pemahaman</strong>, jawab seluruh 10 soal dengan jujur, lalu klik <strong>📤 Kirim &amp; Simpan Jawaban</strong>.</li>
                  <li><strong>Syarat Keluar 100%:</strong> Halaman otomatis keluar ke Halaman Awal setelah <strong>Pemahaman Materi mencapai 100%</strong> dan jawaban terkirim ke Google Sheets Guru. Jika terlalu ramai di kelas tanpa <em>headset</em>, gunakan tombol <strong>🎵/🔇 BGM</strong> di pojok atas.</li>
                </ol>
              `
          }
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    document.getElementById("btn-close-guide").addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  function applyStageGenderFilter() {
    const mode = state.stageFilter || "both";
    const stageMale = document.getElementById("cartoon-stage-male");
    const stageFemale = document.getElementById("cartoon-stage-female");
    const maleCard = stageMale && stageMale.closest(".stage-pane, .stage-col, .dual-stage-pane") || (stageMale && stageMale.parentElement);
    const femaleCard = stageFemale && stageFemale.closest(".stage-pane, .stage-col, .dual-stage-pane") || (stageFemale && stageFemale.parentElement);
    const dualGrid = stageMale && stageMale.closest(".dual-stage-grid");

    if (maleCard) maleCard.style.display = mode === "female" ? "none" : "";
    if (femaleCard) femaleCard.style.display = mode === "male" ? "none" : "";
    if (dualGrid) dualGrid.classList.toggle("single-gender-mode", mode !== "both");

    const filterBar = document.getElementById("stage-gender-filter");
    if (filterBar) {
      filterBar.querySelectorAll(".sgf-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.sgf === mode);
      });
    }
  }

  function loadHtml2PdfScript() {
    if (typeof window.html2pdf === "function") return Promise.resolve(window.html2pdf);
    return new Promise((resolve, reject) => {
      const existing = document.getElementById("html2pdf-cdn-script");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.html2pdf));
        existing.addEventListener("error", () => reject(new Error("Gagal memuat pustaka PDF.")));
        return;
      }
      const s = document.createElement("script");
      s.id = "html2pdf-cdn-script";
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      s.onload = () => resolve(window.html2pdf);
      s.onerror = () => reject(new Error("Gagal memuat pustaka PDF."));
      document.head.appendChild(s);
    });
  }

  function openPsychomotorRubricModal() {
    let modal = document.getElementById("rubric-modal-backdrop");
    if (modal) modal.remove();

    const prof = state.studentProfile || {};
    const isSmp = state.level === "smp";
    const levelLabel = isSmp ? "SMP / MTs" : "SD / MI";
    const teacherName = escapeHtml(prof.name || "Guru PAI");
    const schoolName = escapeHtml(prof.school || "-");
    const className = escapeHtml(prof.kelas || "-");

    const tpItems = isSmp
      ? [
          "Menganalisis dalil Al-Qur'an (QS. Al-Ma'idah: 6) serta ketentuan fikih rukun, syarat sah, dan sunnah wudhu menurut <strong>Mazhab Syafi'i</strong>.",
          "Membedakan hukum air <em>mutlaq</em> dan air <em>musta'mal</em> serta menerapkan kaidah <strong>2 Qullah</strong> saat berwudhu menggunakan gayung/bak air.",
          "Mengidentifikasi ketentuan fikih wudhu bagi remaja putra &amp; putri (berhijab, penghalang air di kulit/kuku, serta adab menjaga aurat).",
          "Menerapkan adab <em>thuma'ninah</em> (3× basuhan tenang), sikap <em>anti-israf</em> (hemat air), serta mengevaluasi studi kasus fikih wudhu."
        ]
      : [
          "Memahami pengertian, niat, serta urutan rukun dan sunnah berwudhu secara tertib sesuai tuntunan <strong>Mazhab Syafi'i</strong>.",
          "Mengenali batas wajib anggota wudhu (wajah, kedua tangan hingga siku, sebagian kepala, dan kedua kaki hingga mata kaki) dengan tepat.",
          "Mempraktikkan tata cara berwudhu menggunakan keran maupun gayung/bak air secara tenang (<em>thuma'ninah</em>) dan tidak boros air.",
          "Membiasakan adab kesopanan, kebersihan, serta doa sebelum dan sesudah berwudhu dalam kehidupan sehari-hari."
        ];

    modal = document.createElement("div");
    modal.id = "rubric-modal-backdrop";
    modal.className = "guide-modal-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <div class="guide-modal-card rubric-modal-card" style="max-width:860px;">
        <div class="guide-modal-head no-print-in-modal">
          <h3>📋 Lembar Rubrik Observasi Praktik Wudhu (${levelLabel})</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn btn-emerald btn-sm" id="btn-download-rubric-pdf">⬇️ Unduh PDF (Langsung ke Downloads)</button>
            <button type="button" class="btn btn-soft btn-sm" id="btn-print-rubric">🖨️ Cetak Printer</button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-close-rubric">✕ Tutup</button>
          </div>
        </div>
        <div class="guide-modal-body" id="rubric-pdf-sheet" style="background:#ffffff;color:#0f172a;padding:12px 14px;">
          <div style="border-bottom:2px solid #065f46;padding-bottom:10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div>
              <div style="font-size:11px;font-weight:800;color:#0f6b56;letter-spacing:0.5px;text-transform:uppercase;">MEDIA PEMBELAJARAN ADAB WUDHU MULTI-SENSORY • MAZHAB SYAFI'I</div>
              <h2 style="margin:3px 0 4px;font-size:17px;color:#064e3b;">Lembar Rubrik Observasi Praktik, Ringkasan Fikih &amp; Capaian Pembelajaran</h2>
              <div style="font-size:12px;color:#334155;">Guru Pengajar: <strong>${teacherName}</strong> &nbsp;•&nbsp; Sekolah: <strong>${schoolName} (${levelLabel})</strong> &nbsp;•&nbsp; Kelas: <strong>${className}</strong></div>
            </div>
          </div>

          <!-- 1. RINGKASAN SYARAT SAH & HAL YANG MEMBATALKAN WUDHU -->
          <div style="border:1px solid #a7f3d0;background:#f0fdf9;border-radius:10px;padding:10px 12px;margin-bottom:10px;">
            <div style="font-size:12.5px;font-weight:800;color:#065f46;margin-bottom:6px;">📖 1. Ringkasan Syarat Sah &amp; Hal yang Membatalkan Wudhu (Mazhab Syafi'i — Fath al-Qarib)</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11.5px;line-height:1.45;">
              <div style="background:#ffffff;border:1px solid #a7f3d0;border-radius:8px;padding:8px 10px;">
                <strong style="color:#065f46;display:block;margin-bottom:4px;">✅ Syarat Sah Wudhu:</strong>
                <ul style="margin:0;padding-left:16px;">
                  <li>Islam &amp; Tamyiz (dapat membedakan baik dan buruk).</li>
                  <li>Suci dari haid &amp; nifas (khusus siswi perempuan).</li>
                  <li>Memakai air suci menyucikan (<em>air mutlaq</em>), bukan <em>musta'mal</em>.</li>
                  <li>Tidak ada penghalang air ke kulit/kuku (cat, kuteks, lem).</li>
                </ul>
              </div>
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 10px;">
                <strong style="color:#92400e;display:block;margin-bottom:4px;">⚠️ Hal yang Membatalkan Wudhu (Nawaqidh):</strong>
                <ul style="margin:0;padding-left:16px;">
                  <li>Keluar sesuatu dari qubul atau dubur.</li>
                  <li>Hilang akal / tidur dengan posisi duduk tidak mantap.</li>
                  <li>Bersentuhan kulit laki-laki &amp; perempuan dewasa bukan mahram.</li>
                  <li>Menyentuh kemaluan manusia dengan telapak tangan dalam.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 2. CAPAIAN & TUJUAN PEMBELAJARAN -->
          <div style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:10px;padding:10px 12px;margin-bottom:12px;">
            <div style="font-size:12.5px;font-weight:800;color:#065f46;margin-bottom:5px;">🎯 2. Capaian &amp; Tujuan Pembelajaran (${levelLabel} — Kurikulum Merdeka PAI)</div>
            <ol style="margin:0;padding-left:18px;font-size:11.5px;line-height:1.48;color:#1e293b;">
              ${tpItems.map((t) => `<li style="margin-bottom:3px;">${t}</li>`).join("")}
            </ol>
          </div>

          <!-- 3. TABEL LEMBAR RUBRIK OBSERVASI PRAKTIK WUDHU -->
          <div style="font-size:12.5px;font-weight:800;color:#065f46;margin-bottom:4px;">📋 3. Tabel Rubrik Observasi Praktik Wudhu (Psikomotorik &amp; Afektif)</div>
          <p style="font-size:11.5px;color:#475569;margin:0 0 8px;">
            Skala Penilaian: <strong>4 = Sangat Baik</strong> &nbsp;|&nbsp; <strong>3 = Baik</strong> &nbsp;|&nbsp; <strong>2 = Cukup</strong> &nbsp;|&nbsp; <strong>1 = Perlu Bimbingan</strong>.
          </p>
          <table class="rubric-table" style="font-size:11.8px;">
            <thead>
              <tr>
                <th>No</th>
                <th>Aspek Praktik &amp; Adab Wudhu (Mazhab Syafi'i)</th>
                <th>Indikator Ketercapaian</th>
                <th>Skor (1–4)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td><strong>Niat &amp; Basmalah</strong></td><td>Membaca Basmalah &amp; menghadirkan niat saat air pertama menyentuh wajah.</td><td>___</td></tr>
              <tr><td>2</td><td><strong>Batas Wajib Wajah</strong></td><td>Meratakan air dari batas tumbuh rambut hingga dagu, dan antar kedua telinga.</td><td>___</td></tr>
              <tr><td>3</td><td><strong>Kedua Tangan hingga Siku</strong></td><td>Membasuh tangan kanan lalu kiri melewati kedua siku dan menyela jari.</td><td>___</td></tr>
              <tr><td>4</td><td><strong>Mengusap Kepala &amp; Telinga</strong></td><td>Mengusap sebagian kulit/rambut di batas kepala &amp; telinga dengan air baru.</td><td>___</td></tr>
              <tr><td>5</td><td><strong>Kedua Kaki hingga Mata Kaki</strong></td><td>Membasuh kaki kanan lalu kiri melewati mata kaki, tumit, dan sela jari kaki.</td><td>___</td></tr>
              <tr><td>6</td><td><strong>Tertib &amp; Thuma'ninah</strong></td><td>Berurutan sesuai rukun, tenang (tidak tergesa-gesa), dan masing-masing 3× basuhan.</td><td>___</td></tr>
              <tr><td>7</td><td><strong>Adab Hemat Air (Anti-Israf)</strong></td><td>Membuka keran kecil / menjaga air bak 2 Qullah agar tidak musta'mal.</td><td>___</td></tr>
              <tr><td>8</td><td><strong>Doa Setelah Wudhu</strong></td><td>Menghadap kiblat di tempat suci dan membaca doa syahadat setelah wudhu.</td><td>___</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    document.getElementById("btn-close-rubric").addEventListener("click", close);
    document.getElementById("btn-print-rubric").addEventListener("click", () => {
      document.body.classList.add("printing-rubric-only");
      window.print();
      setTimeout(() => document.body.classList.remove("printing-rubric-only"), 500);
    });

    const dlBtn = document.getElementById("btn-download-rubric-pdf");
    dlBtn.addEventListener("click", async () => {
      const sheetEl = document.getElementById("rubric-pdf-sheet");
      if (!sheetEl) return;
      const origText = dlBtn.textContent;
      dlBtn.disabled = true;
      dlBtn.textContent = "⏳ Menyiapkan File PDF...";
      try {
        const html2pdf = await loadHtml2PdfScript();
        const safeSchool = String(prof.school || (isSmp ? "SMP_MTs" : "SD_MI")).replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeClass = String(prof.kelas || "Kelas").replace(/[^a-zA-Z0-9_-]/g, "_");
        const filename = `Rubrik_Observasi_Wudhu_${safeSchool}_${safeClass}.pdf`;
        await html2pdf()
          .set({
            margin: [8, 8, 8, 8],
            filename,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
          })
          .from(sheetEl)
          .save();
        showToast(`✅ File ${filename} berhasil diunduh ke folder Downloads!`);
      } catch (err) {
        document.body.classList.add("printing-rubric-only");
        window.print();
        setTimeout(() => document.body.classList.remove("printing-rubric-only"), 500);
      } finally {
        dlBtn.disabled = false;
        dlBtn.textContent = origText;
      }
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  // ==================== MODAL FILTER REKAP & ANALISIS N-GAIN LIVE DI WEB (MODE GURU) ====================
  const SHEETS_DOC_ID = "1DoK0WDUYcwFKM1Ly5ol8bTAbn3GOkwP6zWv32aM6oic";
  const SCHOOL_TABS_META = [
    { school: "SDN 1", tab: "Rekap SDN 1", level: "SD/MI", classes: ["Semua Kelas", "4A", "4B", "4C", "4D", "5A", "5B", "5C", "5D", "6A", "6B", "6C", "6D"] },
    { school: "SDN 2", tab: "Rekap SDN 2", level: "SD/MI", classes: ["Semua Kelas", "4A", "4B", "4C", "4D", "5A", "5B", "5C", "5D", "6A", "6B", "6C", "6D"] },
    { school: "MI 1", tab: "Rekap MI 1", level: "SD/MI", classes: ["Semua Kelas", "4A", "4B", "4C", "4D", "5A", "5B", "5C", "5D", "6A", "6B", "6C", "6D"] },
    { school: "MI 2", tab: "Rekap MI 2", level: "SD/MI", classes: ["Semua Kelas", "4A", "4B", "4C", "4D", "5A", "5B", "5C", "5D", "6A", "6B", "6C", "6D"] },
    { school: "SMPN 1", tab: "Rekap SMPN 1", level: "SMP/MTs", classes: ["Semua Kelas", "7A", "7B", "7C", "7D"] },
    { school: "SMPN 2", tab: "Rekap SMPN 2", level: "SMP/MTs", classes: ["Semua Kelas", "7A", "7B", "7C", "7D"] },
    { school: "MTs 1", tab: "Rekap MTs 1", level: "SMP/MTs", classes: ["Semua Kelas", "7A", "7B", "7C", "7D"] },
    { school: "MTs 2", tab: "Rekap MTs 2", level: "SMP/MTs", classes: ["Semua Kelas", "7A", "7B", "7C", "7D"] }
  ];

  async function fetchSheetTabRows(schoolName) {
    const meta = SCHOOL_TABS_META.find((m) => m.school.toUpperCase() === String(schoolName || "").toUpperCase()) || SCHOOL_TABS_META[0];
    const url = `https://docs.google.com/spreadsheets/d/${SHEETS_DOC_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(meta.tab)}`;
    const res = await fetch(url, { cache: "no-store" });
    const txt = await res.text();
    const jsonMatch = txt.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
    if (!jsonMatch) throw new Error("Format respons Google Sheets tidak dikenali.");
    const parsed = JSON.parse(jsonMatch[1]);
    const tableRows = (parsed && parsed.table && parsed.table.rows) || [];
    const items = [];

    tableRows.forEach((r) => {
      const c = (r && r.c) || [];
      const getVal = (idx) => (c[idx] && (c[idx].f !== undefined ? c[idx].f : c[idx].v)) ?? "";
      const rawNo = Number(c[0] && c[0].v);
      const rawLevel = String(getVal(1)).trim();
      const rawName = String(getVal(2)).trim();
      const rawSchool = String(getVal(3)).trim();
      const rawKelas = String(getVal(4)).trim().toUpperCase();
      const rawSesi = String(getVal(5)).trim() || "Posttest";
      const rawScore = Number(c[6] && c[6].v);
      const rawTotal = Number(c[7] && c[7].v) || 10;
      const rawKategori = String(getVal(9)).trim();
      const rawWaktu = String(getVal(10)).trim();

      if (!rawName || rawName === "Nama Lengkap" || isNaN(rawNo) || rawNo <= 0) return;
      const score = isNaN(rawScore) ? 0 : rawScore;
      const pct = Math.round((score / rawTotal) * 100);
      items.push({
        no: rawNo,
        level: rawLevel || meta.level,
        name: rawName,
        school: rawSchool || meta.school,
        kelas: rawKelas || "-",
        sesi: rawSesi,
        score,
        total: rawTotal,
        pct,
        kategori: rawKategori || (pct >= 80 ? "Sangat Baik" : pct >= 60 ? "Baik" : "Perlu Pendampingan"),
        waktu: rawWaktu || "-"
      });
    });
    return items;
  }

  function openLiveRekapModal() {
    let modal = document.getElementById("live-rekap-modal-backdrop");
    if (modal) modal.remove();

    const prof = state.studentProfile || {};
    const defaultSchool = SCHOOL_TABS_META.find((m) => m.school.toUpperCase() === String(prof.school || "").toUpperCase())
      ? prof.school
      : state.level === "smp"
      ? "SMPN 1"
      : "SDN 1";
    const defaultClass = (prof.kelas && prof.kelas !== "-" ? String(prof.kelas).toUpperCase() : "Semua Kelas");

    modal = document.createElement("div");
    modal.id = "live-rekap-modal-backdrop";
    modal.className = "guide-modal-backdrop";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <div class="guide-modal-card rubric-modal-card live-rekap-modal-card" style="max-width:940px;">
        <div class="guide-modal-head">
          <div>
            <h3>📊 Panel Filter Rekap Nilai &amp; Analisis N-Gain (Real-Time Google Sheets)</h3>
            <small style="color:#475569;font-size:12px;">Memungkinkan Guru memfilter Kelas &amp; Sesi serta mencetak laporan meskipun Google Sheets dikunci dalam mode <strong>Pelihat (Viewer)</strong>.</small>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn btn-soft btn-sm" id="btn-refresh-live-rekap">🔄 Segarkan</button>
            <button type="button" class="btn btn-emerald btn-sm" id="btn-print-live-rekap">🖨️ Cetak / PDF</button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-close-live-rekap">✕ Tutup</button>
          </div>
        </div>
        <div class="guide-modal-body">
          <div class="live-rekap-filters" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;background:#f0fdf9;border:1.5px solid #99f6e4;border-radius:12px;padding:12px 14px;margin-bottom:14px;">
            <div>
              <label style="display:block;font-size:11.5px;font-weight:800;color:#065f46;margin-bottom:4px;">🏫 Pilih Sekolah / Tab Rekap</label>
              <select id="lr-school-sel" class="select-input select-sm">
                ${SCHOOL_TABS_META.map((m) => `<option value="${m.school}" ${m.school === defaultSchool ? "selected" : ""}>${m.school} (${m.level})</option>`).join("")}
              </select>
            </div>
            <div>
              <label style="display:block;font-size:11.5px;font-weight:800;color:#065f46;margin-bottom:4px;">🏷️ Filter Kelas &amp; Lokal</label>
              <select id="lr-class-sel" class="select-input select-sm"></select>
            </div>
            <div>
              <label style="display:block;font-size:11.5px;font-weight:800;color:#065f46;margin-bottom:4px;">📝 Filter Sesi Evaluasi</label>
              <select id="lr-sesi-sel" class="select-input select-sm">
                <option value="Semua Sesi">Semua Sesi (Pretest + Posttest + Latihan)</option>
                <option value="Pretest">Pretest (Kemampuan Awal)</option>
                <option value="Posttest">Posttest (Evaluasi Akhir)</option>
                <option value="Latihan">Latihan Mandiri</option>
              </select>
            </div>
          </div>

          <div id="lr-stats-strip" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px;"></div>

          <div id="lr-status-msg" style="font-size:13px;color:#0f6b56;font-weight:700;margin-bottom:8px;">⏳ Mengambil data real-time dari Google Sheets...</div>

          <div class="table-wrap" style="max-height:360px;overflow-y:auto;border:1px solid #cbd5e1;border-radius:12px;">
            <table class="rubric-table" id="lr-data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Lengkap Siswa</th>
                  <th>Sekolah</th>
                  <th>Kelas</th>
                  <th>Sesi</th>
                  <th>Skor</th>
                  <th>Persentase</th>
                  <th>Kategori</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody id="lr-table-body">
                <tr><td colspan="9" style="text-align:center;padding:18px;">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const schoolSel = document.getElementById("lr-school-sel");
    const classSel = document.getElementById("lr-class-sel");
    const sesiSel = document.getElementById("lr-sesi-sel");
    const statsStrip = document.getElementById("lr-stats-strip");
    const statusMsg = document.getElementById("lr-status-msg");
    const tbody = document.getElementById("lr-table-body");

    let cachedRows = [];

    const populateClassOptions = (keepCurrent = false) => {
      const meta = SCHOOL_TABS_META.find((m) => m.school === schoolSel.value) || SCHOOL_TABS_META[0];
      const prevVal = keepCurrent ? classSel.value : defaultClass;
      classSel.innerHTML = meta.classes
        .map((c) => `<option value="${c}" ${c === prevVal ? "selected" : ""}>${c === "Semua Kelas" ? "Semua Kelas" : `Kelas ${c}`}</option>`)
        .join("");
      if (!meta.classes.includes(prevVal)) classSel.value = "Semua Kelas";
    };

    const renderFilteredTable = () => {
      const fClass = classSel.value;
      const fSesi = sesiSel.value;

      const classRows = cachedRows.filter((r) => fClass === "Semua Kelas" || r.kelas === fClass);
      const filtered = classRows.filter((r) => {
        if (fSesi === "Semua Sesi") return true;
        return r.sesi.toLowerCase().includes(fSesi.toLowerCase());
      });

      // Hitung Rata-Rata Pretest, Posttest, Latihan Mandiri & N-Gain pada Kelas terpilih
      const preRows = classRows.filter((r) => r.sesi.toLowerCase().includes("pre"));
      const postRows = classRows.filter((r) => r.sesi.toLowerCase().includes("post"));
      const latRows = classRows.filter((r) => r.sesi.toLowerCase().includes("latih"));
      const avgOf = (arr) => (arr.length ? arr.reduce((a, b) => a + b.pct, 0) / arr.length : null);
      const preAvg = avgOf(preRows);
      const postAvg = avgOf(postRows);
      const latAvg = avgOf(latRows);
      const curAvg = avgOf(filtered);

      let nGainText = "Belum lengkap (butuh Pre & Post)";
      let nGainCat = "";
      if (preAvg !== null && postAvg !== null) {
        const denom = 100 - preAvg;
        const nGain = denom > 0 ? (postAvg - preAvg) / denom : postAvg >= 100 ? 1.0 : 0;
        const delta = (postAvg - preAvg).toFixed(1);
        nGainCat = nGain >= 0.7 ? "Tinggi" : nGain >= 0.3 ? "Sedang" : "Rendah";
        nGainText = `${nGain.toFixed(2)} (${nGainCat} • Δ +${delta}%)`;
      }

      statsStrip.innerHTML = `
        <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;padding:10px 12px;">
          <div style="font-size:11px;color:#64748b;font-weight:700;">DATA TERFILTER</div>
          <div style="font-size:17px;font-weight:800;color:#0f172a;">${filtered.length} Siswa</div>
          <div style="font-size:11.5px;color:#0f6b56;font-weight:700;">Rata-rata: ${curAvg !== null ? `${curAvg.toFixed(1)}%` : "-"}</div>
        </div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 12px;">
          <div style="font-size:11px;color:#92400e;font-weight:700;">RATA-RATA PRETEST</div>
          <div style="font-size:17px;font-weight:800;color:#92400e;">${preAvg !== null ? `${preAvg.toFixed(1)}%` : "-"}</div>
          <div style="font-size:11.5px;color:#b45309;">${preRows.length} data masuk</div>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 12px;">
          <div style="font-size:11px;color:#1e40af;font-weight:700;">RATA-RATA POSTTEST</div>
          <div style="font-size:17px;font-weight:800;color:#1e40af;">${postAvg !== null ? `${postAvg.toFixed(1)}%` : "-"}</div>
          <div style="font-size:11.5px;color:#1d4ed8;">${postRows.length} data masuk</div>
        </div>
        <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:10px 12px;">
          <div style="font-size:11px;color:#0f766e;font-weight:700;">RATA-RATA LATIHAN</div>
          <div style="font-size:17px;font-weight:800;color:#0f766e;">${latAvg !== null ? `${latAvg.toFixed(1)}%` : "-"}</div>
          <div style="font-size:11.5px;color:#0d9488;">${latRows.length} data masuk</div>
        </div>
        <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:10px;padding:10px 12px;">
          <div style="font-size:11px;color:#065f46;font-weight:700;">EFEKTIVITAS (N-GAIN R&amp;D)</div>
          <div style="font-size:14.5px;font-weight:800;color:#065f46;">${nGainText}</div>
          <div style="font-size:11px;color:#047857;">Kriteria Hake (g ≥ 0.70 = Tinggi)</div>
        </div>
      `;

      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:18px;color:#64748b;">Belum ada data untuk filter <strong>${escapeHtml(schoolSel.value)}</strong> • <strong>${escapeHtml(fClass)}</strong> • <strong>${escapeHtml(fSesi)}</strong>.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered
        .map(
          (r, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${escapeHtml(r.name)}</strong></td>
              <td>${escapeHtml(r.school)}</td>
              <td style="text-align:center;font-weight:700;">${escapeHtml(r.kelas)}</td>
              <td style="text-align:center;"><span style="padding:2px 8px;border-radius:999px;font-size:11.5px;font-weight:800;background:${
                r.sesi.toLowerCase().includes("pre") ? "#fef3c7;color:#92400e" : r.sesi.toLowerCase().includes("post") ? "#dbeafe;color:#1e40af" : "#ccfbf1;color:#0f766e"
              }">${escapeHtml(r.sesi)}</span></td>
              <td style="text-align:center;font-weight:800;">${r.score} / ${r.total}</td>
              <td style="text-align:center;font-weight:800;">${r.pct}%</td>
              <td style="text-align:center;">${escapeHtml(r.kategori)}</td>
              <td style="font-size:11.5px;">${escapeHtml(r.waktu)}</td>
            </tr>
          `
        )
        .join("");
    };

    const loadSchoolData = async () => {
      statusMsg.textContent = `⏳ Mengambil data real-time tab Rekap ${schoolSel.value} dari Google Sheets...`;
      try {
        cachedRows = await fetchSheetTabRows(schoolSel.value);
        statusMsg.textContent = `✅ Terhubung ke Google Sheets (Mode Aman Pelihat/Viewer) • Menampilkan tab Rekap ${schoolSel.value} (${cachedRows.length} total baris).`;
        renderFilteredTable();
      } catch (err) {
        statusMsg.textContent = `⚠️ Gagal memuat langsung dari Google Sheets (${err.message}). Silakan klik tombol Buka Google Sheets.`;
        cachedRows = [];
        renderFilteredTable();
      }
    };

    populateClassOptions(false);
    loadSchoolData();

    schoolSel.addEventListener("change", () => {
      populateClassOptions(false);
      loadSchoolData();
    });
    classSel.addEventListener("change", renderFilteredTable);
    sesiSel.addEventListener("change", renderFilteredTable);
    document.getElementById("btn-refresh-live-rekap").addEventListener("click", loadSchoolData);
    document.getElementById("btn-print-live-rekap").addEventListener("click", () => {
      document.body.classList.add("printing-rubric-only");
      window.print();
      setTimeout(() => document.body.classList.remove("printing-rubric-only"), 500);
    });
    const close = () => modal.remove();
    document.getElementById("btn-close-live-rekap").addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  // ==================== BOOT ====================
  if (!loadStudentProfile()) return;
  loadState();
  syncLevelUI();
  syncStudentProfileUI();
  syncGenderUI();
  initTopbarUtilities();
  initSplashScreen();
  bindEvents();
  initSavedAudioClips().then(() => {
    if (getSessionMode() === "pretest") {
      switchView("quiz");
    } else {
      renderHome();
    }
    try { AUDIO.startBgm(state.view); } catch (e) {}
  });
})();