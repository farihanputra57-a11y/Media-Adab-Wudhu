window.WudhuAnimator = (function () {
  // =========================================================================
  // 1. LEFT STAGE: FULL CHARACTER AT WUDHU STATION (x: 0..495, y: 0..480)
  // =========================================================================
  function renderWudhuStation(faucetState, gender = "male") {
    const isClosed = faucetState === "closed";
    const isFemale = gender === "female";
    return `
      <!-- Soft Madrasah Wall & Floor -->
      <rect x="0" y="0" width="900" height="480" fill="url(#bgGrad)" />
      <rect x="0" y="348" width="498" height="132" fill="#d7ebe4" />
      <line x1="0" y1="348" x2="498" y2="348" stroke="#b3d4c8" stroke-width="3" />

      <!-- Subtle Tile Grid on Wudhu Wall -->
      <g stroke="#cde4dc" stroke-width="1" opacity="0.65">
        <line x1="0" y1="120" x2="498" y2="120"/>
        <line x1="0" y1="230" x2="498" y2="230"/>
        <line x1="165" y1="0" x2="165" y2="348"/>
        <line x1="330" y1="0" x2="330" y2="348"/>
      </g>

      <!-- Islamic Arch Window in Background -->
      <path d="M355 55 Q410 15 465 55 L465 185 L355 185 Z" fill="#ffffff" fill-opacity="0.58" stroke="#b3d4c8" stroke-width="2.5"/>
      <circle cx="410" cy="76" r="13" fill="#fde68a" opacity="0.85"/>

      <!-- Wudhu Pillar & Basin (Left) -->
      <rect x="20" y="132" width="92" height="278" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
      <!-- Water Drain Basin -->
      <rect x="20" y="392" width="188" height="28" rx="10" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
      <rect x="115" y="398" width="84" height="10" rx="5" fill="#94a3b8"/>

      <!-- Faucet Pipe & Spout -->
      <rect x="106" y="218" width="52" height="14" rx="6" fill="#64748b"/>
      <path d="M150 220 Q168 220 168 238 L168 250 L154 250 L154 234 Z" fill="#64748b"/>
      <!-- Valve Handle -->
      <rect x="122" y="203" width="26" height="8" rx="4" fill="${isClosed ? '#dc2626' : '#0f766e'}"/>
      <rect x="132" y="210" width="6" height="10" fill="#475569"/>

      <!-- Faucet Status Pill -->
      <g transform="translate(26, 146)">
        <rect width="128" height="28" rx="14" fill="${isClosed ? '#fee2e2' : '#e0f2fe'}" stroke="${isClosed ? '#ef4444' : '#0284c7'}" stroke-width="1.8"/>
        <text x="64" y="18" text-anchor="middle" font-size="11.5" font-weight="800" fill="${isClosed ? '#991b1b' : '#0369a1'}">
          ${isClosed ? 'Keran: TERTUTUP' : 'Keran: Kecil (Hemat)'}
        </text>
      </g>

      ${!isClosed ? `
        <!-- Gentle Animated Water Stream -->
        <line x1="161" y1="252" x2="161" y2="394" stroke="#38bdf8" stroke-width="7" stroke-linecap="round" class="anim-water"/>
        <line x1="161" y1="252" x2="161" y2="394" stroke="#e0f2fe" stroke-width="2.5" stroke-linecap="round" class="anim-water"/>
        <ellipse cx="161" cy="396" rx="18" ry="5.5" fill="#7dd3fc" opacity="0.7" class="anim-splash"/>
      ` : `
        <circle cx="161" cy="264" r="11" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
        <text x="161" y="268" text-anchor="middle" font-size="12" font-weight="800" fill="#15803d">✓</text>
      `}

      <!-- Stage Label Badge -->
      <g transform="translate(20, 18)">
        <rect width="${isFemale ? 228 : 190}" height="30" rx="15" fill="${isFemale ? '#be185d' : '#0f6b56'}"/>
        <text x="${isFemale ? 114 : 95}" y="20" text-anchor="middle" font-size="12" font-weight="800" fill="#ffffff">
          ${isFemale ? '👧 AREA PERAGA PUTRI (HIJAB)' : '👦 AREA PERAGA PUTRA'}
        </text>
      </g>
    `;
  }

  // Child character positioned right next to the faucet (center x = 295)
  function renderCharacter(pose, gender = "male") {
    const isFemale = gender === "female";
    const cx = 295;
    const headY = 128;
    const eyesClosed = pose === "niat" || pose === "calm" || pose === "doa_read";
    const openMouth = pose === "mouth";
    const liftFootR = pose === "foot_r" || pose === "foot_heel";
    const liftFootL = pose === "foot_l";

    // Connected, pose-specific arms & hands
    let armsSvg = "";
    switch (pose) {
      case "niat":
      case "calm":
      case "tertib":
        armsSvg = `
          <!-- Relaxed arms at side -->
          <path d="M${cx - 48} 212 Q${cx - 64} 252 ${cx - 52} 288" stroke="#ffffff" stroke-width="22" stroke-linecap="round" fill="none"/>
          <path d="M${cx + 48} 212 Q${cx + 64} 252 ${cx + 52} 288" stroke="#ffffff" stroke-width="22" stroke-linecap="round" fill="none"/>
          <circle cx="${cx - 52}" cy="294" r="12" fill="#fbd6b9" stroke="#d9a07b" stroke-width="1.8"/>
          <circle cx="${cx + 52}" cy="294" r="12" fill="#fbd6b9" stroke="#d9a07b" stroke-width="1.8"/>
        `;
        break;

      case "palms":
      case "fingers":
        armsSvg = `
          <!-- Both arms reaching directly under the faucet stream (x=161, y=288) -->
          <path d="M${cx - 44} 218 Q218 258 174 282" stroke="#ffffff" stroke-width="22" stroke-linecap="round" fill="none"/>
          <path d="M${cx + 42} 222 Q232 276 178 292" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
          <g class="${pose === 'palms' ? 'anim-rub-h' : 'anim-rub-v'}">
            <ellipse cx="164" cy="284" rx="22" ry="13" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
            <ellipse cx="172" cy="293" rx="21" ry="12" fill="#f3c6a5" stroke="#d9a07b" stroke-width="2"/>
            <circle cx="161" cy="276" r="7" fill="#38bdf8" class="anim-splash"/>
          </g>
        `;
        break;

      case "mouth":
      case "nose":
        armsSvg = `
          <!-- Left arm relaxed, right arm bringing water to mouth/nose -->
          <path d="M${cx + 46} 214 Q${cx + 60} 254 ${cx + 50} 288" stroke="#ffffff" stroke-width="22" stroke-linecap="round" fill="none"/>
          <circle cx="${cx + 50}" cy="294" r="12" fill="#fbd6b9" stroke="#d9a07b" stroke-width="1.8"/>
          <g class="anim-rub-v">
            <path d="M${cx - 44} 216 Q${cx - 72} 182 ${cx - 18} ${pose === 'mouth' ? 158 : 144}" stroke="#ffffff" stroke-width="22" stroke-linecap="round" fill="none"/>
            <ellipse cx="${cx - 8}" cy="${pose === 'mouth' ? 158 : 144}" rx="17" ry="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
            <circle cx="${cx - 4}" cy="${pose === 'mouth' ? 152 : 138}" r="6" fill="#38bdf8" class="anim-splash"/>
          </g>
        `;
        break;

      case "face_v":
      case "face_h":
      case "face_detail":
        armsSvg = `
          <!-- Both hands washing the face -->
          <g class="${pose === 'face_v' ? 'anim-rub-v' : pose === 'face_h' ? 'anim-rub-h' : 'anim-rub-c'}">
            <path d="M${cx - 46} 214 Q${cx - 76} 174 ${cx - 32} 138" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
            <path d="M${cx + 46} 214 Q${cx + 76} 174 ${cx + 32} 138" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
            <ellipse cx="${cx - 28}" cy="136" rx="14" ry="20" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
            <ellipse cx="${cx + 28}" cy="136" rx="14" ry="20" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
            <circle cx="${cx - 26}" cy="122" r="5" fill="#38bdf8" class="anim-splash"/>
            <circle cx="${cx + 26}" cy="122" r="5" fill="#38bdf8" class="anim-splash"/>
          </g>
        `;
        break;

      case "arm_r":
      case "arm_l":
      case "arm_elbow":
        armsSvg = `
          <!-- Sleeve rolled up, bare forearm extended under faucet + other hand rubbing up to elbow -->
          <path d="M${cx - 46} 214 L${cx - 68} 234" stroke="#ffffff" stroke-width="24" stroke-linecap="round" fill="none"/>
          <path d="M${cx - 66} 232 L168 282" stroke="#fbd6b9" stroke-width="20" stroke-linecap="round" fill="none"/>
          <!-- Elbow highlight ring -->
          <circle cx="${cx - 64}" cy="232" r="15" fill="rgba(16,185,129,0.28)" stroke="#059669" stroke-width="2.5" stroke-dasharray="4 3"/>
          <!-- Rubbing hand -->
          <g class="anim-rub-h">
            <path d="M${cx + 42} 222 Q248 268 210 264" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
            <ellipse cx="206" cy="264" rx="17" ry="11" fill="#f3c6a5" stroke="#d9a07b" stroke-width="2"/>
          </g>
        `;
        break;

      case "tap_off":
        armsSvg = `
          <!-- Left arm reaching directly to the red valve handle (x=135, y=207) -->
          <g class="anim-rub-h">
            <path d="M${cx - 44} 214 Q212 204 146 207" stroke="#ffffff" stroke-width="21" stroke-linecap="round" fill="none"/>
            <circle cx="138" cy="207" r="13" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          </g>
          <path d="M${cx + 48} 214 Q${cx + 62} 254 ${cx + 50} 288" stroke="#ffffff" stroke-width="21" stroke-linecap="round" fill="none"/>
          <circle cx="${cx + 50}" cy="294" r="12" fill="#fbd6b9" stroke="#d9a07b" stroke-width="1.8"/>
        `;
        break;

      case "head":
        armsSvg = `
          <!-- Hands raised wiping front/top of head -->
          <g class="anim-rub-h">
            <path d="M${cx - 46} 214 Q${cx - 80} 140 ${cx - 28} 82" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
            <path d="M${cx + 46} 214 Q${cx + 80} 140 ${cx + 28} 82" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
            <ellipse cx="${cx - 18}" cy="78" rx="18" ry="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
            <ellipse cx="${cx + 18}" cy="78" rx="18" ry="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          </g>
        `;
        break;

      case "ears":
        armsSvg = `
          <!-- Hands wiping both ears -->
          <g class="anim-rub-v">
            <path d="M${cx - 46} 214 Q${cx - 86} 172 ${cx - 56} 134" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
            <path d="M${cx + 46} 214 Q${cx + 86} 172 ${cx + 56} 134" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
            <circle cx="${cx - 54}" cy="134" r="12" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
            <circle cx="${cx + 54}" cy="134" r="12" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          </g>
        `;
        break;

      case "foot_r":
      case "foot_l":
      case "foot_heel":
        armsSvg = `
          <!-- Reaching down smoothly toward the raised foot under faucet -->
          <g class="anim-rub-h">
            <path d="M${cx - 44} 222 Q232 296 186 352" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
            <circle cx="182" cy="356" r="13" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          </g>
          <path d="M${cx + 46} 218 Q${cx + 62} 258 ${cx + 52} 292" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
          <circle cx="${cx + 52}" cy="298" r="12" fill="#fbd6b9" stroke="#d9a07b" stroke-width="1.8"/>
        `;
        break;

      case "doa_hands":
      case "doa_read":
        armsSvg = `
          <!-- Raised palms in Dua posture -->
          <g class="anim-raise">
            <path d="M${cx - 46} 216 Q${cx - 64} 248 ${cx - 24} 236" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
            <path d="M${cx + 46} 216 Q${cx + 64} 248 ${cx + 24} 236" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
            <ellipse cx="${cx - 18}" cy="232" rx="18" ry="10" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
            <ellipse cx="${cx + 18}" cy="232" rx="18" ry="10" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          </g>
        `;
        break;
    }

    return `
      <g class="anim-bob">
        <!-- Floor Shadow -->
        <ellipse cx="${cx}" cy="432" rx="72" ry="13" fill="#94a3b8" opacity="0.3"/>

        <!-- Legs -->
        ${liftFootR ? `
          <!-- Right leg lifted toward faucet water stream -->
          <path d="M${cx - 20} 320 Q232 346 174 374" stroke="#334155" stroke-width="26" stroke-linecap="round" fill="none"/>
          <ellipse cx="164" cy="378" rx="22" ry="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          <circle cx="164" cy="370" r="8" fill="#38bdf8" class="anim-splash"/>
          <rect x="${cx + 8}" y="320" width="26" height="98" rx="12" fill="#334155"/>
          <ellipse cx="${cx + 22}" cy="422" rx="22" ry="10" fill="#f3c6a5" stroke="#d9a07b" stroke-width="1.8"/>
        ` : liftFootL ? `
          <!-- Left leg lifted toward faucet water stream -->
          <rect x="${cx - 34}" y="320" width="26" height="98" rx="12" fill="#334155"/>
          <ellipse cx="${cx - 22}" cy="422" rx="22" ry="10" fill="#f3c6a5" stroke="#d9a07b" stroke-width="1.8"/>
          <path d="M${cx + 16} 320 Q236 350 174 374" stroke="#334155" stroke-width="26" stroke-linecap="round" fill="none"/>
          <ellipse cx="164" cy="378" rx="22" ry="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          <circle cx="164" cy="370" r="8" fill="#38bdf8" class="anim-splash"/>
        ` : `
          <rect x="${cx - 34}" y="320" width="26" height="98" rx="12" fill="#334155"/>
          <rect x="${cx + 8}" y="320" width="26" height="98" rx="12" fill="#334155"/>
          <ellipse cx="${cx - 24}" cy="422" rx="22" ry="10" fill="#f3c6a5" stroke="#d9a07b" stroke-width="1.8"/>
          <ellipse cx="${cx + 24}" cy="422" rx="22" ry="10" fill="#f3c6a5" stroke="#d9a07b" stroke-width="1.8"/>
        `}

        <!-- Baju Koko (Putra) / Gamis & Khimar (Putri) -->
        ${isFemale ? `
          <!-- Modest Long Gamis / Tunic -->
          <path d="M${cx - 52} 200 Q${cx} 188 ${cx + 52} 200 L${cx + 68} 364 L${cx - 68} 364 Z" fill="#fdf2f8" stroke="#f472b6" stroke-width="2.5"/>
          <path d="M${cx - 62} 352 Q${cx} 360 ${cx + 62} 352" fill="none" stroke="#db2777" stroke-width="2" opacity="0.5"/>
          <!-- Back/Side Hijab Veil Drape -->
          <path d="M${cx - 60} ${headY + 6} Q${cx - 64} ${headY - 70} ${cx} ${headY - 72} Q${cx + 64} ${headY - 70} ${cx + 60} ${headY + 6} L${cx + 68} 252 Q${cx} 274 ${cx - 68} 252 Z" fill="#0f6b56" stroke="#094a3b" stroke-width="2.2"/>
          <!-- Inner Face Framing Ciput -->
          <ellipse cx="${cx}" cy="${headY + 2}" rx="48" ry="52" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          <path d="M${cx - 46} ${headY - 12} Q${cx} ${headY - 46} ${cx + 46} ${headY - 12} Q${cx} ${headY - 62} ${cx - 46} ${headY - 12} Z" fill="#ffffff" opacity="0.92"/>
          <!-- Hijab Chin Pin & Gold Trim -->
          <path d="M${cx - 48} ${headY + 34} Q${cx} ${headY + 66} ${cx + 48} ${headY + 34} L${cx + 64} 246 Q${cx} 268 ${cx - 64} 246 Z" fill="#0f6b56" stroke="#094a3b" stroke-width="2"/>
          <circle cx="${cx}" cy="${headY + 56}" r="4.5" fill="#fbbf24" stroke="#ffffff" stroke-width="1.2"/>
        ` : `
          <!-- Baju Koko -->
          <path d="M${cx - 50} 200 Q${cx} 188 ${cx + 50} 200 L${cx + 58} 328 L${cx - 58} 328 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5"/>
          <path d="M${cx - 15} 196 L${cx} 228 L${cx + 15} 196 Z" fill="#0f6b56"/>
          <line x1="${cx}" y1="228" x2="${cx}" y2="296" stroke="#e2e8f0" stroke-width="2.5"/>
          <circle cx="${cx}" cy="246" r="3.2" fill="#0f6b56"/>
          <circle cx="${cx}" cy="266" r="3.2" fill="#0f6b56"/>

          <!-- Neck -->
          <rect x="${cx - 14}" y="${headY + 46}" width="28" height="24" rx="8" fill="#f3c6a5"/>

          <!-- Ears -->
          <ellipse cx="${cx - 52}" cy="${headY + 6}" rx="10" ry="15" fill="#f3c6a5" stroke="#d9a07b" stroke-width="1.8"/>
          <ellipse cx="${cx + 52}" cy="${headY + 6}" rx="10" ry="15" fill="#f3c6a5" stroke="#d9a07b" stroke-width="1.8"/>

          <!-- Head -->
          <ellipse cx="${cx}" cy="${headY}" rx="52" ry="56" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2.2"/>

          <!-- Peci Madrasah -->
          <path d="M${cx - 48} ${headY - 22} Q${cx} ${headY - 32} ${cx + 48} ${headY - 22} L${cx + 45} ${headY - 50} Q${cx} ${headY - 64} ${cx - 45} ${headY - 50} Z" fill="#0f5c4d" stroke="#093f34" stroke-width="2"/>
          <path d="M${cx - 45} ${headY - 28} Q${cx} ${headY - 37} ${cx + 45} ${headY - 28}" fill="none" stroke="#fbbf24" stroke-width="2.8"/>
        `}

        <!-- Eyes -->
        ${eyesClosed ? `
          <path d="M${cx - 24} ${headY - 2} Q${cx - 16} ${headY + 6} ${cx - 8} ${headY - 2}" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
          <path d="M${cx + 8} ${headY - 2} Q${cx + 16} ${headY + 6} ${cx + 24} ${headY - 2}" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        ` : `
          <circle cx="${cx - 18}" cy="${headY - 2}" r="5.5" fill="#1e293b"/>
          <circle cx="${cx - 16.5}" cy="${headY - 3.5}" r="2" fill="#ffffff"/>
          <circle cx="${cx + 18}" cy="${headY - 2}" r="5.5" fill="#1e293b"/>
          <circle cx="${cx + 19.5}" cy="${headY - 3.5}" r="2" fill="#ffffff"/>
        `}

        <!-- Cheeks -->
        <ellipse cx="${cx - 29}" cy="${headY + 13}" rx="8" ry="4.5" fill="#fda4af" opacity="0.5"/>
        <ellipse cx="${cx + 29}" cy="${headY + 13}" rx="8" ry="4.5" fill="#fda4af" opacity="0.5"/>

        <!-- Mouth -->
        ${openMouth ? `
          <ellipse cx="${cx}" cy="${headY + 25}" rx="8" ry="7" fill="#9a3412"/>
        ` : `
          <path d="M${cx - 12} ${headY + 23} Q${cx} ${headY + 33} ${cx + 12} ${headY + 23}" fill="none" stroke="#9a3412" stroke-width="3" stroke-linecap="round"/>
        `}

        <!-- Connected Arms & Hands -->
        ${armsSvg}
      </g>
    `;
  }

  // =========================================================================
  // 2. RIGHT STAGE: HIGH-CLARITY CLOSE-UP DETAIL PANEL (x: 508..884, y: 18..462)
  // =========================================================================
  function renderCloseUpCard(title, badgeText, innerSvg, footerNote) {
    return `
      <g transform="translate(508, 18)">
        <!-- Card Shell -->
        <rect width="376" height="444" rx="20" fill="#ffffff" stroke="#b9dbd0" stroke-width="2.5"/>
        <!-- Header Bar -->
        <path d="M0 20 Q0 0 20 0 L356 0 Q376 0 376 20 L376 58 L0 58 Z" fill="#0f6b56"/>
        <text x="18" y="24" font-size="11" font-weight="800" fill="#fef3c7" letter-spacing="0.6">${badgeText}</text>
        <text x="18" y="45" font-size="15.5" font-weight="800" fill="#ffffff">${title}</text>

        <!-- Illustration Viewport (376 x 316, y: 58..374) -->
        <rect x="12" y="68" width="352" height="302" rx="14" fill="#f3faf7" stroke="#d5ebe2" stroke-width="1.5"/>
        <g transform="translate(12, 68)">
          ${innerSvg}
        </g>

        <!-- Footer Tip -->
        <rect x="12" y="382" width="352" height="50" rx="12" fill="#fef3c7" stroke="#fcd34d" stroke-width="1.5"/>
        <text x="188" y="412" text-anchor="middle" font-size="12.5" font-weight="800" fill="#92400e">${footerNote}</text>
      </g>
    `;
  }

  function renderCloseUpContent(pose, gender = "male") {
    const isFemale = gender === "female";
    switch (pose) {
      case "niat":
        return renderCloseUpCard(
          "Hadirkan Niat & Basmalah",
          "DETAIL GERAKAN 1A",
          `
            <!-- Glowing Heart + Basmalah -->
            <circle cx="176" cy="115" r="72" fill="#dcfce7" opacity="0.7" class="anim-splash"/>
            <path d="M176 158 C126 122 114 82 142 66 C158 57 172 68 176 78 C180 68 194 57 210 66 C238 82 226 122 176 158 Z" fill="#10b981" stroke="#047857" stroke-width="3"/>
            <text x="176" y="114" text-anchor="middle" font-size="16" font-weight="800" fill="#ffffff">IKHLAS</text>
            <rect x="34" y="198" width="284" height="76" rx="14" fill="#ffffff" stroke="#0f6b56" stroke-width="2"/>
            <text x="176" y="232" text-anchor="middle" font-size="22" font-weight="700" fill="#065f46">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</text>
            <text x="176" y="258" text-anchor="middle" font-size="12.5" font-weight="700" fill="#475569">Berdiri tenang sebelum membuka keran</text>
          `,
          "Keran masih tertutup — tenangkan hati & baca Basmalah"
        );

      case "palms":
        return renderCloseUpCard(
          "Telapak & Punggung Tangan",
          "DETAIL GERAKAN 1B",
          `
            <!-- Detailed Left & Right Hands with 5 Fingers -->
            <g class="anim-rub-h">
              <!-- Hand 1 -->
              <rect x="78" y="118" width="96" height="104" rx="28" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
              <rect x="82" y="64" width="16" height="62" rx="8" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
              <rect x="102" y="50" width="16" height="74" rx="8" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
              <rect x="122" y="54" width="16" height="70" rx="8" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
              <rect x="142" y="68" width="16" height="58" rx="8" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
              <rect x="166" y="128" width="32" height="18" rx="9" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
            </g>
            <!-- Hand 2 overlapping -->
            <g transform="translate(88, 22)" class="anim-rub-v">
              <rect x="78" y="118" width="96" height="96" rx="28" fill="#f3c6a5" stroke="#c88d67" stroke-width="2.5"/>
              <rect x="86" y="72" width="15" height="54" rx="7" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
              <rect x="106" y="62" width="15" height="64" rx="7" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
              <rect x="126" y="66" width="15" height="60" rx="7" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
              <rect x="146" y="78" width="15" height="48" rx="7" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
            </g>
            <!-- Water Drops & Motion Arrows -->
            <circle cx="176" cy="42" r="9" fill="#38bdf8" class="anim-splash"/>
            <circle cx="148" cy="28" r="6" fill="#7dd3fc" class="anim-splash"/>
            <path d="M62 252 L290 252" stroke="#0f6b56" stroke-width="3" stroke-dasharray="6 4"/>
            <text x="176" y="276" text-anchor="middle" font-size="13" font-weight="800" fill="#0f6b56">Batas: Hingga Pergelangan Tangan (3×)</text>
          `,
          "Gosok lembut telapak & punggung tangan kanan–kiri"
        );

      case "fingers":
        return renderCloseUpCard(
          "Menyela-nyela Jari Tangan",
          "DETAIL GERAKAN 1C",
          `
            <!-- Interlocked Fingers Close-Up -->
            <g class="anim-rub-v">
              <rect x="88" y="138" width="176" height="96" rx="30" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
              <!-- 5 Interlocking finger slots -->
              <rect x="96" y="66" width="22" height="84" rx="11" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
              <rect x="122" y="56" width="22" height="92" rx="11" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
              <rect x="148" y="52" width="22" height="96" rx="11" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
              <rect x="174" y="56" width="22" height="92" rx="11" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
              <rect x="200" y="64" width="22" height="86" rx="11" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
              <rect x="226" y="76" width="22" height="74" rx="11" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
              <!-- Green Highlights between fingers -->
              <line x1="120" y1="74" x2="120" y2="144" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
              <line x1="146" y1="68" x2="146" y2="144" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
              <line x1="172" y1="66" x2="172" y2="144" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
              <line x1="198" y1="70" x2="198" y2="144" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
              <line x1="224" y1="78" x2="224" y2="144" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
            </g>
            <text x="176" y="268" text-anchor="middle" font-size="13.5" font-weight="800" fill="#065f46">Tautkan &amp; Gerakkan Naik–Turun</text>
            <text x="176" y="288" text-anchor="middle" font-size="12" fill="#475569">Pastikan sela-sela jari bersih terkena air</text>
          `,
          "Garis hijau: area sela jari yang wajib dibersihkan"
        );

      case "mouth":
        return renderCloseUpCard(
          "Berkumur (Madhmadhah)",
          "DETAIL GERAKAN 2A",
          `
            <!-- Close-Up Face & Cupped Hand -->
            <ellipse cx="186" cy="136" rx="76" ry="86" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
            <circle cx="158" cy="112" r="6" fill="#1e293b"/>
            <circle cx="214" cy="112" r="6" fill="#1e293b"/>
            <!-- Cheeks puffing with water swirl -->
            <ellipse cx="148" cy="166" rx="18" ry="14" fill="#bae6fd" stroke="#0284c7" stroke-width="2" class="anim-splash"/>
            <ellipse cx="224" cy="166" rx="18" ry="14" fill="#bae6fd" stroke="#0284c7" stroke-width="2" class="anim-splash"/>
            <ellipse cx="186" cy="172" rx="16" ry="11" fill="#38bdf8" stroke="#0369a1" stroke-width="2"/>
            <!-- Cupped Hand bringing water -->
            <g class="anim-rub-v">
              <path d="M74 196 Q116 226 154 188" fill="#f3c6a5" stroke="#c88d67" stroke-width="2.5"/>
              <circle cx="122" cy="186" r="10" fill="#38bdf8"/>
            </g>
            <text x="176" y="256" text-anchor="middle" font-size="13.5" font-weight="800" fill="#0369a1">Putar Air di Rongga Mulut (3×)</text>
            <text x="176" y="276" text-anchor="middle" font-size="12" fill="#475569">Ambil dengan tangan kanan, buang dengan sopan</text>
          `,
          "Tidak menengadahkan mulut langsung ke keran deras"
        );

      case "nose":
        return renderCloseUpCard(
          "Istinsyaq & Istintsar (Hidung)",
          "DETAIL GERAKAN 2B",
          `
            <!-- Close-Up Nose & Two Directional Arrows -->
            <ellipse cx="176" cy="128" rx="74" ry="82" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
            <circle cx="148" cy="108" r="5.5" fill="#1e293b"/>
            <circle cx="204" cy="108" r="5.5" fill="#1e293b"/>
            <!-- Highlighted Nose -->
            <path d="M176 112 L166 146 L186 146 Z" fill="#f3c6a5" stroke="#b45309" stroke-width="2.5"/>
            <circle cx="176" cy="144" r="22" fill="rgba(56,189,248,0.22)" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="5 4"/>
            <!-- Inhale Arrow (Right) -->
            <g class="anim-rub-v">
              <line x1="94" y1="184" x2="152" y2="154" stroke="#0f6b56" stroke-width="4" marker-end="url(#arrowGreen)"/>
              <text x="78" y="204" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0f6b56">1. Hirup (Kanan)</text>
            </g>
            <!-- Exhale Arrow (Left) -->
            <g class="anim-rub-v">
              <line x1="196" y1="154" x2="254" y2="184" stroke="#d97706" stroke-width="4" marker-end="url(#arrowAmber)"/>
              <text x="268" y="204" text-anchor="middle" font-size="11.5" font-weight="800" fill="#b45309">2. Keluarkan (Kiri)</text>
            </g>
            <text x="176" y="268" text-anchor="middle" font-size="13" font-weight="800" fill="#065f46">Hirup Lembut lalu Keluarkan (3×)</text>
          `,
          "Tangan kanan mengambil air, tangan kiri membantu mengeluarkan"
        );

      case "face_v":
        return renderCloseUpCard(
          "Wajah: Batas Atas ke Bawah",
          "DETAIL RUKUN 3A (SYAFI'I)",
          `
            ${renderFaceBaseLarge()}
            <!-- Vertical Shafi'i Arrow -->
            <line x1="176" y1="54" x2="176" y2="218" stroke="#0f6b56" stroke-width="5" marker-start="url(#arrowGreen)" marker-end="url(#arrowGreen)"/>
            <!-- Top Label -->
            <rect x="18" y="34" width="120" height="28" rx="8" fill="#0f6b56"/>
            <text x="78" y="52" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">Batas Rambut Dahi</text>
            <line x1="138" y1="48" x2="170" y2="52" stroke="#0f6b56" stroke-width="2"/>
            <!-- Bottom Label -->
            <rect x="214" y="204" width="124" height="28" rx="8" fill="#0f6b56"/>
            <text x="276" y="222" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">Bawah Ujung Dagu</text>
            <line x1="184" y1="218" x2="214" y2="218" stroke="#0f6b56" stroke-width="2"/>
            <text x="176" y="276" text-anchor="middle" font-size="13" font-weight="800" fill="#065f46">Sertakan Niat di Hati pada Basuhan Ke-1</text>
          `,
          "Wajib merata dari batas tumbuh rambut dahi hingga bawah dagu"
        );

      case "face_h":
        return renderCloseUpCard(
          "Wajah: Batas Telinga ke Telinga",
          "DETAIL RUKUN 3B (SYAFI'I)",
          `
            ${renderFaceBaseLarge()}
            <!-- Horizontal Shafi'i Arrow -->
            <line x1="94" y1="138" x2="258" y2="138" stroke="#d97706" stroke-width="5" marker-start="url(#arrowAmber)" marker-end="url(#arrowAmber)"/>
            <rect x="10" y="156" width="106" height="28" rx="8" fill="#d97706"/>
            <text x="63" y="174" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">Telinga Kanan</text>
            <rect x="236" y="156" width="106" height="28" rx="8" fill="#d97706"/>
            <text x="289" y="174" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">Telinga Kiri</text>
            <text x="176" y="274" text-anchor="middle" font-size="13" font-weight="800" fill="#92400e">Ratakan hingga Pangkal Kedua Telinga</text>
          `,
          "Jangan hanya membasuh tengah wajah — ratakan sampai pangkal telinga"
        );

      case "face_detail":
        return renderCloseUpCard(
          "Sudut Mata, Hidung & Bibir",
          "DETAIL RUKUN 3C (SYAFI'I)",
          `
            ${renderFaceBaseLarge()}
            <!-- 3 Glowing Target Rings -->
            <circle cx="152" cy="118" r="14" fill="rgba(2,132,199,0.28)" stroke="#0284c7" stroke-width="3" class="anim-splash"/>
            <circle cx="200" cy="118" r="14" fill="rgba(2,132,199,0.28)" stroke="#0284c7" stroke-width="3" class="anim-splash"/>
            <circle cx="176" cy="148" r="14" fill="rgba(2,132,199,0.28)" stroke="#0284c7" stroke-width="3" class="anim-splash"/>
            <circle cx="176" cy="176" r="16" fill="rgba(16,185,129,0.28)" stroke="#0f6b56" stroke-width="3" class="anim-splash"/>
            <text x="176" y="262" text-anchor="middle" font-size="13" font-weight="800" fill="#0369a1">Cek Sudut Mata, Cuping Hidung &amp; Bibir</text>
            <text x="176" y="282" text-anchor="middle" font-size="12" fill="#475569">Pastikan tidak ada lipatan kulit yang kering</text>
          `,
          "Usap lembut 3× tanpa menepukkan air keras ke wajah"
        );

      case "arm_r":
      case "arm_l":
        const isL = pose === "arm_l";
        return renderCloseUpCard(
          isL ? "Tangan Kiri hingga Melewati Siku" : "Tangan Kanan hingga Melewati Siku",
          isL ? "DETAIL RUKUN 4B (KIRI)" : "DETAIL RUKUN 4A (KANAN)",
          `
            <g transform="${isL ? 'translate(352,0) scale(-1,1)' : ''}">
              <!-- Arm + Fingers -->
              <rect x="64" y="114" width="212" height="52" rx="24" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
              <rect x="34" y="118" width="38" height="11" rx="5.5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
              <rect x="28" y="133" width="44" height="11" rx="5.5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
              <rect x="34" y="148" width="38" height="11" rx="5.5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
              <!-- Rolled Sleeve -->
              <rect x="274" y="106" width="60" height="68" rx="14" fill="#ffffff" stroke="#94a3b8" stroke-width="2.5"/>
              <!-- Shafi'i Mandatory Wash Zone -->
              <rect x="24" y="104" width="250" height="72" rx="30" fill="rgba(20,184,166,0.16)" stroke="#0f6b56" stroke-width="3" stroke-dasharray="7 5"/>
              <!-- Elbow Boundary Line -->
              <line x1="258" y1="68" x2="258" y2="204" stroke="#d97706" stroke-width="3.5" stroke-dasharray="5 4"/>
              <!-- Flow Direction Arrow -->
              <line x1="56" y1="196" x2="246" y2="196" stroke="#0284c7" stroke-width="4" marker-end="url(#arrowBlue)" class="anim-rub-h"/>
            </g>
            <rect x="112" y="24" width="128" height="28" rx="14" fill="${isL ? '#0284c7' : '#0f6b56'}"/>
            <text x="176" y="42" text-anchor="middle" font-size="12" font-weight="800" fill="#ffffff">${isL ? 'TANGAN KIRI (3×)' : 'TANGAN KANAN (3×)'}</text>
            <text x="176" y="244" text-anchor="middle" font-size="13" font-weight="800" fill="#065f46">Alirkan dari Ujung Jari → Melewati Siku</text>
            <text x="176" y="266" text-anchor="middle" font-size="12" fill="#b45309">Garis Oranye: Lebihkan 2–3 cm di atas tulang siku</text>
          `,
          "Gulung lengan baju di atas siku & lepas jam tangan ketat"
        );

      case "arm_elbow":
        return renderCloseUpCard(
          "Cek Belakang Siku & Sela Jari",
          "DETAIL RUKUN 4C",
          `
            <!-- Bent Elbow Back View -->
            <path d="M88 206 L176 122 L264 206" stroke="#fbd6b9" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M88 206 L176 122 L264 206" stroke="#c88d67" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.5"/>
            <!-- Highlighted Elbow Joint -->
            <circle cx="176" cy="116" r="34" fill="rgba(16,185,129,0.22)" stroke="#059669" stroke-width="3.5" stroke-dasharray="6 4" class="anim-splash"/>
            <circle cx="176" cy="116" r="14" fill="#10b981"/>
            <text x="176" y="121" text-anchor="middle" font-size="14" font-weight="800" fill="#ffffff">✓</text>
            <rect x="78" y="34" width="196" height="32" rx="10" fill="#065f46"/>
            <text x="176" y="55" text-anchor="middle" font-size="12.5" font-weight="800" fill="#ffffff">Area Belakang Siku Wajib Basah</text>
            <text x="176" y="268" text-anchor="middle" font-size="12.5" font-weight="700" fill="#475569">Sering terlewat kering saat siswa terburu-buru</text>
          `,
          "Gosok memutar bagian belakang siku agar basah sempurna"
        );

      case "tap_off":
        return renderCloseUpCard(
          "Tutup Keran (Adab Hemat Air)",
          "DETAIL ADAB 5A (ANTI-ISRAF)",
          `
            <!-- Large Faucet Valve Being Turned Off -->
            <rect x="64" y="142" width="170" height="28" rx="10" fill="#64748b"/>
            <path d="M220 144 Q254 144 254 180 L254 204 L228 204 L228 172 Z" fill="#64748b"/>
            <rect x="122" y="102" width="64" height="16" rx="8" fill="#dc2626" class="anim-rub-h"/>
            <rect x="148" y="118" width="12" height="26" fill="#475569"/>
            <!-- Crossed-out Water Waste -->
            <circle cx="241" cy="236" r="24" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
            <text x="241" y="242" text-anchor="middle" font-size="20">💧</text>
            <line x1="224" y1="219" x2="258" y2="253" stroke="#dc2626" stroke-width="4"/>
            <rect x="46" y="30" width="260" height="44" rx="12" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
            <text x="176" y="57" text-anchor="middle" font-size="14" font-weight="800" fill="#166534">STOP AIR SAAT USAP KEPALA!</text>
          `,
          "HR. Ibn Majah No. 425: Jangan boros air meski di tepi sungai"
        );

      case "head":
        if (isFemale) {
          return renderCloseUpCard(
            "Usap Kepala di Balik Jilbab (Putri)",
            "DETAIL RUKUN 5B (KHUSUS PUTRI)",
            `
              <!-- Side Profile Hijab Head showing hand slipping UNDER front edge of hijab -->
              <circle cx="176" cy="154" r="76" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
              <!-- Hairline inside hijab -->
              <path d="M108 130 Q130 72 198 78 Q242 84 248 148 Q220 116 172 110 Q132 108 108 130 Z" fill="#1e293b"/>
              <!-- Hijab Veil Draping Behind & Gently Lifted at Front Edge -->
              <path d="M126 86 Q190 54 256 108 Q272 180 250 236 L196 236 Q226 176 218 118 Q186 92 126 86 Z" fill="#0f6b56" stroke="#094a3b" stroke-width="2.5"/>
              <circle cx="136" cy="152" r="5.5" fill="#1e293b"/>
              <!-- Highlight Zone: Touching Actual Hair/Scalp Under Hijab Edge -->
              <circle cx="144" cy="96" r="24" fill="rgba(2,132,199,0.28)" stroke="#0284c7" stroke-width="3" stroke-dasharray="5 3" class="anim-splash"/>
              <!-- Hand slipping under hijab edge -->
              <g class="anim-rub-h">
                <ellipse cx="144" cy="92" rx="22" ry="11" fill="#fbd6b9" stroke="#0284c7" stroke-width="2.5"/>
              </g>
              <rect x="26" y="18" width="300" height="32" rx="10" fill="#be185d"/>
              <text x="176" y="39" text-anchor="middle" font-size="11.5" font-weight="800" fill="#ffffff">WAJIB SENTUH RAMBUT/KULIT (BUKAN KAIN JILBAB)</text>
              <text x="176" y="262" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0369a1">Masukkan Tangan Basah di Balik Tepi Jilbab</text>
              <text x="176" y="282" text-anchor="middle" font-size="11.5" fill="#475569">Usap rambut di batas kepala (bukan ujung rambut panjang)</text>
            `,
            "Mazhab Syafi'i: Tidak sah jika hanya mengusap luar kain jilbab"
          );
        }
        return renderCloseUpCard(
          "Usap Sebagian Kepala (Rukun)",
          "DETAIL RUKUN 5B (SYAFI'I)",
          `
            <!-- Side Profile Head with Clear Sweep Arc -->
            <circle cx="176" cy="154" r="76" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
            <path d="M104 134 Q124 68 198 76 Q250 84 252 152 Q228 122 174 114 Q134 112 104 134 Z" fill="#1e293b"/>
            <circle cx="136" cy="152" r="5.5" fill="#1e293b"/>
            <ellipse cx="254" cy="160" rx="11" ry="18" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
            <!-- Sweeping Arc & Hand -->
            <path d="M114 102 Q176 42 246 106" fill="none" stroke="#0284c7" stroke-width="6" stroke-dasharray="8 5"/>
            <ellipse cx="176" cy="64" rx="26" ry="12" fill="#fbd6b9" stroke="#0284c7" stroke-width="2.5" class="anim-rub-h"/>
            <text x="176" y="262" text-anchor="middle" font-size="13" font-weight="800" fill="#0369a1">Rukun: Sebagian Kulit/Rambut Kepala</text>
            <text x="176" y="282" text-anchor="middle" font-size="12" fill="#475569">Sunnah: Usap dari depan ke belakang lalu kembali</text>
          `,
          "Cukup dengan tangan basah — keran tetap tertutup/kecil"
        );

      case "ears":
        return renderCloseUpCard(
          "Usap Daun & Lubang Telinga",
          "DETAIL SUNNAH 5C",
          `
            <!-- Large Ear Close-Up -->
            <path d="M176 54 C236 54 254 116 232 174 C216 218 176 234 152 214 C132 198 144 166 154 148 C164 130 148 92 176 54 Z" fill="#fbd6b9" stroke="#c88d67" stroke-width="3"/>
            <path d="M180 86 C214 90 218 136 198 168 C186 188 168 184 166 164" fill="none" stroke="#c88d67" stroke-width="3" stroke-linecap="round"/>
            <!-- Index finger inside -->
            <circle cx="186" cy="136" r="16" fill="rgba(2,132,199,0.28)" stroke="#0284c7" stroke-width="3" class="anim-splash"/>
            <rect x="20" y="96" width="114" height="44" rx="10" fill="#0284c7"/>
            <text x="77" y="115" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">Jari Telunjuk</text>
            <text x="77" y="131" text-anchor="middle" font-size="10.5" fill="#e0f2fe">Lekuk Dalam</text>
            <!-- Thumb behind -->
            <circle cx="242" cy="146" r="15" fill="rgba(16,185,129,0.28)" stroke="#059669" stroke-width="3" class="anim-splash"/>
            <rect x="234" y="218" width="108" height="44" rx="10" fill="#0f6b56"/>
            <text x="288" y="237" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">Ibu Jari</text>
            <text x="288" y="253" text-anchor="middle" font-size="10.5" fill="#d1fae5">Belakang Daun</text>
          `,
          "Usap telinga kanan & kiri secara bersamaan (1–3×)"
        );

      case "foot_r":
      case "foot_l":
        const isFL = pose === "foot_l";
        return renderCloseUpCard(
          isFL ? "Kaki Kiri hingga Mata Kaki" : "Kaki Kanan hingga Mata Kaki",
          isFL ? "DETAIL RUKUN 6B (KIRI)" : "DETAIL RUKUN 6A (KANAN)",
          `
            <g transform="${isFL ? 'translate(352,0) scale(-1,1)' : ''}">
              <!-- Lower Leg & Foot -->
              <path d="M168 46 L232 46 L232 192 Q232 224 198 224 L76 224 Q52 224 52 204 Q52 184 96 178 L168 158 Z" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
              <!-- Ankle Bone -->
              <circle cx="202" cy="142" r="15" fill="#f3c6a5" stroke="#d97706" stroke-width="2.5"/>
              <!-- Mandatory Shafi'i Zone -->
              <rect x="44" y="114" width="198" height="118" rx="22" fill="rgba(20,184,166,0.15)" stroke="#0f6b56" stroke-width="3" stroke-dasharray="7 5"/>
              <!-- Above Ankle Line -->
              <line x1="146" y1="116" x2="256" y2="116" stroke="#d97706" stroke-width="3.5" stroke-dasharray="5 4"/>
            </g>
            <rect x="116" y="18" width="120" height="28" rx="14" fill="${isFL ? '#0284c7' : '#0f6b56'}"/>
            <text x="176" y="36" text-anchor="middle" font-size="12" font-weight="800" fill="#ffffff">${isFL ? 'KAKI KIRI (3×)' : 'KAKI KANAN (3×)'}</text>
            <text x="176" y="262" text-anchor="middle" font-size="13" font-weight="800" fill="#065f46">Wajib Melewati Tonjolan Mata Kaki</text>
            <text x="176" y="282" text-anchor="middle" font-size="12" fill="#b45309">Pastikan mata kaki dalam, luar &amp; tumit basah</text>
          `,
          "Dahulukan kaki kanan (3×), lalu kaki kiri (3×) dengan tenang"
        );

      case "foot_heel":
        return renderCloseUpCard(
          "Sela Jari Kaki & Cek Tumit",
          "DETAIL RUKUN 6C",
          `
            <!-- Foot highlighting Toes & Heel -->
            <path d="M168 58 L230 58 L230 192 Q230 222 198 222 L80 222 Q58 222 58 202 Q58 184 98 178 L168 158 Z" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
            <!-- Highlight 1: Toes -->
            <circle cx="82" cy="202" r="24" fill="rgba(2,132,199,0.25)" stroke="#0284c7" stroke-width="3" class="anim-splash"/>
            <rect x="20" y="124" width="118" height="38" rx="10" fill="#0284c7"/>
            <text x="79" y="140" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">1. Sela Jari Kaki</text>
            <text x="79" y="155" text-anchor="middle" font-size="10" fill="#e0f2fe">Pakai kelingking kiri</text>
            <!-- Highlight 2: Back Heel -->
            <circle cx="222" cy="200" r="24" fill="rgba(16,185,129,0.28)" stroke="#059669" stroke-width="3" class="anim-splash"/>
            <rect x="218" y="124" width="120" height="38" rx="10" fill="#0f6b56"/>
            <text x="278" y="140" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">2. Tumit Belakang</text>
            <text x="278" y="155" text-anchor="middle" font-size="10" fill="#d1fae5">Jangan sampai kering!</text>
            <text x="176" y="268" text-anchor="middle" font-size="12.5" font-weight="800" fill="#065f46">Dua titik kaki yang paling sering terlewat</text>
          `,
          "Periksa tumit belakang & sela jari sebelum menutup keran"
        );

      case "tertib":
        return renderCloseUpCard(
          "Urutan Rukun Wajib (Tertib)",
          "DETAIL RUKUN 7A",
          `
            <g transform="translate(24, 18)" font-size="13.5" font-weight="800">
              <rect y="0" width="304" height="50" rx="12" fill="#e3f5ef" stroke="#0f6b56" stroke-width="2"/>
              <text x="18" y="30" fill="#065f46">1. Niat + Membasuh Wajah</text>
              <text x="152" y="65" text-anchor="middle" font-size="15" fill="#0f6b56">↓</text>

              <rect y="70" width="304" height="50" rx="12" fill="#e3f5ef" stroke="#0f6b56" stroke-width="2"/>
              <text x="18" y="100" fill="#065f46">2. Membasuh Tangan hingga Siku</text>
              <text x="152" y="135" text-anchor="middle" font-size="15" fill="#0f6b56">↓</text>

              <rect y="140" width="304" height="50" rx="12" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
              <text x="18" y="170" fill="#0369a1">3. Mengusap Sebagian Kepala</text>
              <text x="152" y="205" text-anchor="middle" font-size="15" fill="#0284c7">↓</text>

              <rect y="210" width="304" height="50" rx="12" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
              <text x="18" y="240" fill="#92400e">4. Membasuh Kaki hingga Mata Kaki</text>
            </g>
          `,
          "Tertib (berurutan) adalah syarat sah wudhu Mazhab Syafi'i"
        );

      case "calm":
        return renderCloseUpCard(
          "Thuma'ninah & Hemat Air",
          "DETAIL ADAB 7B",
          `
            <circle cx="176" cy="118" r="68" fill="#dcfce7" stroke="#10b981" stroke-width="4" class="anim-splash"/>
            <text x="176" y="112" text-anchor="middle" font-size="24" font-weight="800" fill="#065f46">TENANG</text>
            <text x="176" y="136" text-anchor="middle" font-size="13" font-weight="700" fill="#047857">Thuma'ninah</text>
            <!-- Checklist badges -->
            <rect x="28" y="206" width="140" height="66" rx="12" fill="#ffffff" stroke="#0f6b56" stroke-width="2"/>
            <text x="98" y="234" text-anchor="middle" font-size="13" font-weight="800" fill="#0f6b56">✓ Keran Rapat</text>
            <text x="98" y="254" text-anchor="middle" font-size="11" fill="#475569">Tidak menetes</text>
            <rect x="184" y="206" width="140" height="66" rx="12" fill="#ffffff" stroke="#0284c7" stroke-width="2"/>
            <text x="254" y="234" text-anchor="middle" font-size="13" font-weight="800" fill="#0369a1">✓ Tidak Bercanda</text>
            <text x="254" y="254" text-anchor="middle" font-size="11" fill="#475569">Siap menuju salat</text>
          `,
          "Tutup keran hingga rapat & jaga kekhusyukan menuju saf"
        );

      case "doa_hands":
      case "doa_read":
        return renderCloseUpCard(
          pose === "doa_hands" ? "Menghadap Kiblat & Angkat Tangan" : "Doa Setelah Wudhu",
          pose === "doa_hands" ? "DETAIL ADAB 8A" : "DETAIL ADAB 8B",
          `
            <!-- Soft Golden Glow + Open Palms -->
            <circle cx="176" cy="126" r="82" fill="#fef3c7" opacity="0.85" class="anim-splash"/>
            <g class="anim-raise">
              <ellipse cx="136" cy="154" rx="42" ry="26" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5" transform="rotate(-14 136 154)"/>
              <ellipse cx="216" cy="154" rx="42" ry="26" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5" transform="rotate(14 216 154)"/>
            </g>
            <rect x="34" y="204" width="284" height="72" rx="14" fill="#ffffff" stroke="#d97706" stroke-width="2"/>
            <text x="176" y="234" text-anchor="middle" font-size="17" font-weight="700" fill="#92400e">أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ...</text>
            <text x="176" y="258" text-anchor="middle" font-size="12" font-weight="700" fill="#78350f">Baca doa lengkap pada kotak di bawah panggung</text>
          `,
          "Berdoa di tempat kering & bersih sambil menghadap kiblat"
        );

      default:
        return "";
    }
  }

  function renderFaceBaseLarge() {
    return `
      <!-- Ears -->
      <ellipse cx="98" cy="136" rx="14" ry="24" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
      <ellipse cx="254" cy="136" rx="14" ry="24" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
      <!-- Face -->
      <ellipse cx="176" cy="136" rx="76" ry="84" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
      <!-- Hairline -->
      <path d="M104 102 Q176 38 248 102 Q242 46 176 42 Q110 46 104 102 Z" fill="#1e293b"/>
      <!-- Eyes, Nose, Mouth -->
      <circle cx="148" cy="120" r="5.5" fill="#1e293b"/>
      <circle cx="204" cy="120" r="5.5" fill="#1e293b"/>
      <path d="M176 124 L170 148 L182 148" fill="none" stroke="#c88d67" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M158 174 Q176 186 194 174" fill="none" stroke="#9a3412" stroke-width="3" stroke-linecap="round"/>
      <!-- Shafi'i Dashed Face Oval -->
      <ellipse cx="176" cy="138" rx="74" ry="74" fill="rgba(20,184,166,0.12)" stroke="#0f6b56" stroke-width="2.5" stroke-dasharray="6 4"/>
    `;
  }

  function renderScene(substep, gender = "male") {
    return `
      <svg viewBox="0 0 900 480" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${substep.title}">
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e0f2fe"/>
            <stop offset="100%" stop-color="#f0fdf4"/>
          </linearGradient>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f6b56"/>
          </marker>
          <marker id="arrowAmber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706"/>
          </marker>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7"/>
          </marker>
        </defs>

        <!-- Left Half: Character Directly at Wudhu Faucet -->
        ${renderWudhuStation(substep.faucet, gender)}
        ${renderCharacter(substep.pose, gender)}

        <!-- Right Half: Dedicated High-Clarity Close-Up Illustration -->
        ${renderCloseUpContent(substep.pose, gender)}
      </svg>
    `;
  }

  // =========================================================================
  // 3. INTERACTIVE ANATOMY DIAGRAM (Zoom Modal & Kinesthetic Hotspots)
  // =========================================================================
  function renderAnatomySvg(areaKey, interactive = false, foundSet = new Set()) {
    const area = window.WUDHU_DATA.kinestheticAreas[areaKey];
    if (!area) return "";

    let baseGraphic = "";
    if (areaKey === "wajah") {
      baseGraphic = `
        <ellipse cx="104" cy="136" rx="14" ry="24" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
        <ellipse cx="256" cy="136" rx="14" ry="24" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
        <ellipse cx="180" cy="134" rx="74" ry="82" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
        <path d="M110 104 Q180 42 250 104 Q245 50 180 45 Q115 50 110 104 Z" fill="#1e293b"/>
        <circle cx="152" cy="126" r="6" fill="#1e293b"/>
        <circle cx="208" cy="126" r="6" fill="#1e293b"/>
        <path d="M180 128 L175 152 L186 152" fill="none" stroke="#c88d67" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M162 172 Q180 184 198 172" fill="none" stroke="#9a3412" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="180" cy="138" rx="72" ry="68" fill="rgba(20,184,166,0.14)" stroke="#0f6b56" stroke-width="3" stroke-dasharray="7 5"/>
      `;
    } else if (areaKey === "tangan") {
      baseGraphic = `
        <rect x="70" y="122" width="215" height="46" rx="22" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
        <rect x="44" y="126" width="34" height="10" rx="5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
        <rect x="38" y="139" width="38" height="10" rx="5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
        <rect x="44" y="152" width="34" height="10" rx="5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
        <rect x="278" y="114" width="66" height="62" rx="14" fill="#ffffff" stroke="#94a3b8" stroke-width="2.5"/>
        <rect x="36" y="114" width="244" height="62" rx="28" fill="rgba(20,184,166,0.15)" stroke="#0f6b56" stroke-width="3" stroke-dasharray="7 5"/>
        <line x1="268" y1="92" x2="268" y2="196" stroke="#d97706" stroke-width="3" stroke-dasharray="5 4"/>
        <text x="268" y="84" text-anchor="middle" font-size="11.5" font-weight="800" fill="#b45309">Batas Melewati Siku</text>
      `;
    } else if (areaKey === "kepala") {
      baseGraphic = `
        <circle cx="185" cy="136" r="74" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
        <path d="M114 118 Q135 54 205 62 Q256 70 258 134 Q236 104 182 96 Q142 94 114 118 Z" fill="#1e293b"/>
        <circle cx="145" cy="134" r="5" fill="#1e293b"/>
        <ellipse cx="262" cy="142" rx="11" ry="18" fill="#f3c6a5" stroke="#c88d67" stroke-width="2"/>
        <path d="M126 90 Q185 40 248 94" fill="none" stroke="#0284c7" stroke-width="6" stroke-dasharray="8 5"/>
        <text x="185" y="34" text-anchor="middle" font-size="12" font-weight="800" fill="#0369a1">Area Usap Sebagian Kepala</text>
      `;
    } else if (areaKey === "kaki") {
      baseGraphic = `
        <path d="M174 44 L232 44 L232 178 Q232 208 202 208 L86 208 Q66 208 66 190 Q66 172 106 168 L174 150 Z" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
        <circle cx="204" cy="132" r="14" fill="#f3c6a5" stroke="#b45309" stroke-width="2"/>
        <rect x="60" y="106" width="182" height="110" rx="22" fill="rgba(20,184,166,0.14)" stroke="#0f6b56" stroke-width="3" stroke-dasharray="7 5"/>
        <line x1="158" y1="108" x2="256" y2="108" stroke="#d97706" stroke-width="3" stroke-dasharray="5 4"/>
        <text x="275" y="112" text-anchor="start" font-size="11" font-weight="800" fill="#b45309">Di atas Mata Kaki</text>
      `;
    }

    const hotspots = area.points
      .map((pt) => {
        const isDone = foundSet.has(pt.id);
        const fill = isDone ? "#16a34a" : "#d97706";
        const symbol = interactive ? (isDone ? `${pt.label}✓` : "?") : pt.label;
        return `
          <g class="hotspot-dot" data-point-id="${pt.id}" ${interactive ? 'role="button" tabindex="0"' : ""}>
            ${interactive && !isDone ? `<circle cx="${pt.x}" cy="${pt.y}" r="18" fill="${fill}" opacity="0.35" class="hotspot-pulse"/>` : ""}
            <circle cx="${pt.x}" cy="${pt.y}" r="15" fill="${fill}" stroke="#ffffff" stroke-width="3"/>
            <text x="${pt.x}" y="${pt.y + 5}" text-anchor="middle" font-size="${interactive && isDone ? 11.5 : 13}" font-weight="800" fill="#ffffff">${symbol}</text>
          </g>
        `;
      })
      .join("");

    return `
      <svg viewBox="0 0 360 245" xmlns="http://www.w3.org/2000/svg">
        ${baseGraphic}
        ${hotspots}
      </svg>
    `;
  }

  // =========================================================================
  // 4. DEDICATED FEMALE WUDHU VISUAL DEMONSTRATION (PER SEGMENT 1-8)
  // =========================================================================
  function renderFemaleDemo(segId) {
    let content = "";
    switch (Number(segId)) {
      case 1:
        content = `
          <rect x="0" y="0" width="360" height="190" fill="#fff9fb"/>
          <!-- Left: Hand & clean nails -->
          <g transform="translate(22, 16)">
            <rect width="150" height="156" rx="14" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
            <text x="75" y="22" text-anchor="middle" font-size="11" font-weight="800" fill="#065f46">✅ KUKU BERSIH</text>
            <g class="anim-bob">
              <rect x="48" y="76" width="54" height="54" rx="16" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
              <rect x="50" y="42" width="11" height="38" rx="5.5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.6"/>
              <rect x="63" y="34" width="11" height="46" rx="5.5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.6"/>
              <rect x="76" y="38" width="11" height="42" rx="5.5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.6"/>
              <rect x="89" y="48" width="11" height="32" rx="5.5" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.6"/>
              <circle cx="75" cy="104" r="10" fill="#10b981"/>
              <text x="75" y="108" text-anchor="middle" font-size="11" font-weight="800" fill="#ffffff">✓</text>
            </g>
            <text x="75" y="146" text-anchor="middle" font-size="10" font-weight="700" fill="#047857">Tanpa kuteks kedap air</text>
          </g>
          <!-- Right: Remove tight bracelet / hair tie -->
          <g transform="translate(188, 16)">
            <rect width="150" height="156" rx="14" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
            <text x="75" y="22" text-anchor="middle" font-size="11" font-weight="800" fill="#92400e">⚠️ LEPAS GELANG</text>
            <rect x="26" y="74" width="98" height="28" rx="14" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
            <ellipse cx="75" cy="88" rx="9" ry="18" fill="none" stroke="#db2777" stroke-width="4" stroke-dasharray="4 2" class="anim-rub-h"/>
            <text x="75" y="128" text-anchor="middle" font-size="10" font-weight="700" fill="#78350f">Lepas gelang / karet</text>
            <text x="75" y="143" text-anchor="middle" font-size="10" font-weight="700" fill="#78350f">rambut yang ketat</text>
          </g>
        `;
        break;

      case 2:
        content = `
          <rect x="0" y="0" width="360" height="190" fill="#fff9fb"/>
          <!-- Hijab girl cupping water calmly -->
          <g transform="translate(115, 14)" class="anim-bob">
            <path d="M22 60 Q22 10 65 10 Q108 10 108 60 L114 148 Q65 164 16 148 Z" fill="#0f6b56" stroke="#094a3b" stroke-width="2"/>
            <ellipse cx="65" cy="64" rx="34" ry="38" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
            <circle cx="53" cy="58" r="3.5" fill="#1e293b"/>
            <circle cx="77" cy="58" r="3.5" fill="#1e293b"/>
            <ellipse cx="65" cy="80" rx="8" ry="6" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" class="anim-splash"/>
            <ellipse cx="42" cy="96" rx="14" ry="8" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8" class="anim-rub-v"/>
          </g>
          <rect x="26" y="150" width="308" height="30" rx="10" fill="#fce7f3" stroke="#f472b6" stroke-width="1.5"/>
          <text x="180" y="169" text-anchor="middle" font-size="10.8" font-weight="800" fill="#9d174d">Bersihkan lipstik tebal waterproof sebelum wudhu (3× tenang)</text>
        `;
        break;

      case 3:
        content = `
          <rect x="0" y="0" width="360" height="190" fill="#fff9fb"/>
          <!-- Hijab Face Close-Up showing sliding back ciput slightly -->
          <g transform="translate(105, 8)">
            <path d="M22 72 Q22 10 75 10 Q128 10 128 72 L136 154 Q75 168 14 154 Z" fill="#0f6b56" stroke="#094a3b" stroke-width="2"/>
            <ellipse cx="75" cy="76" rx="44" ry="50" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
            <!-- Slightly pushed back ciput line -->
            <path d="M35 50 Q75 24 115 50" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="5 3"/>
            <circle cx="60" cy="72" r="4" fill="#1e293b"/>
            <circle cx="90" cy="72" r="4" fill="#1e293b"/>
            <path d="M64 96 Q75 104 86 96" fill="none" stroke="#9a3412" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Mandatory Shafi'i face zone -->
            <ellipse cx="75" cy="78" rx="42" ry="44" fill="rgba(20,184,166,0.16)" stroke="#0f6b56" stroke-width="2.5" stroke-dasharray="5 3"/>
            <circle cx="75" cy="36" r="6" fill="#be185d" class="anim-splash"/>
            <circle cx="75" cy="122" r="6" fill="#be185d" class="anim-splash"/>
          </g>
          <rect x="12" y="28" width="96" height="44" rx="9" fill="#be185d"/>
          <text x="60" y="47" text-anchor="middle" font-size="9.5" font-weight="800" fill="#ffffff">Geser Sedikit</text>
          <text x="60" y="61" text-anchor="middle" font-size="9.5" fill="#fce7f3">Tepi Ciput/Jilbab</text>
          <rect x="252" y="54" width="96" height="52" rx="9" fill="#0f6b56"/>
          <text x="300" y="73" text-anchor="middle" font-size="9.5" font-weight="800" fill="#ffffff">Wajib Basah:</text>
          <text x="300" y="88" text-anchor="middle" font-size="9" fill="#d1fae5">Dahi, Bawah Dagu</text>
          <text x="300" y="100" text-anchor="middle" font-size="9" fill="#d1fae5">&amp; Pangkal Telinga</text>
          <text x="180" y="182" text-anchor="middle" font-size="10.5" font-weight="800" fill="#9d174d">Pastikan wajah bebas make-up / sunscreen waterproof</text>
        `;
        break;

      case 4:
        content = `
          <rect x="0" y="0" width="360" height="190" fill="#fff9fb"/>
          <!-- Rolled Gamis Sleeve above elbow -->
          <rect x="52" y="76" width="188" height="38" rx="18" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.2"/>
          <rect x="28" y="80" width="30" height="8" rx="4" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.5"/>
          <rect x="24" y="91" width="34" height="8" rx="4" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.5"/>
          <rect x="28" y="102" width="30" height="8" rx="4" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.5"/>
          <!-- Modest Pink/Cream Gamis Sleeve Rolled ABOVE Elbow -->
          <rect x="234" y="68" width="96" height="54" rx="14" fill="#fdf2f8" stroke="#db2777" stroke-width="2.5"/>
          <rect x="228" y="66" width="18" height="58" rx="7" fill="#fbcfe8" stroke="#db2777" stroke-width="2"/>
          <!-- Boundary Line -->
          <line x1="214" y1="42" x2="214" y2="142" stroke="#0f6b56" stroke-width="3" stroke-dasharray="5 3"/>
          <rect x="148" y="16" width="132" height="24" rx="8" fill="#0f6b56"/>
          <text x="214" y="32" text-anchor="middle" font-size="10" font-weight="800" fill="#ffffff">Gulung di Atas Siku ✓</text>
          <text x="180" y="162" text-anchor="middle" font-size="10.5" font-weight="800" fill="#9d174d">Berwudhu di area khusus putri yang tertutup auratnya</text>
          <text x="180" y="178" text-anchor="middle" font-size="9.8" fill="#475569">Pastikan lipatan lengan gamis tidak menghalangi tulang siku</text>
        `;
        break;

      case 5:
        content = `
          <rect x="0" y="0" width="360" height="190" fill="#fff9fb"/>
          <!-- LEFT BOX: SALAH (Only wiping outside hijab) -->
          <g transform="translate(10, 10)">
            <rect width="164" height="170" rx="14" fill="#fff1f2" stroke="#e11d48" stroke-width="2"/>
            <text x="82" y="21" text-anchor="middle" font-size="11" font-weight="800" fill="#be123c">❌ SALAH (TIDAK SAH)</text>
            <!-- Head fully covered -->
            <circle cx="82" cy="84" r="36" fill="#0f6b56" stroke="#094a3b" stroke-width="2"/>
            <ellipse cx="68" cy="88" rx="16" ry="22" fill="#fbd6b9"/>
            <!-- Hand wiping OUTSIDE cloth -->
            <ellipse cx="88" cy="40" rx="20" ry="8" fill="#fbd6b9" stroke="#e11d48" stroke-width="2" class="anim-rub-h"/>
            <text x="82" y="138" text-anchor="middle" font-size="9.5" font-weight="800" fill="#9f1239">Hanya usap kain luar</text>
            <text x="82" y="152" text-anchor="middle" font-size="9" fill="#881337">jilbab / ujung rambut</text>
          </g>
          <!-- RIGHT BOX: BENAR (Hand slipping under hijab edge) -->
          <g transform="translate(186, 10)">
            <rect width="164" height="170" rx="14" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
            <text x="82" y="21" text-anchor="middle" font-size="11" font-weight="800" fill="#065f46">✅ BENAR (SAH)</text>
            <!-- Head with hair exposed slightly under front hijab edge -->
            <circle cx="82" cy="84" r="36" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
            <path d="M52 72 Q68 46 98 54 Q112 60 116 84 L96 84 Q88 64 52 72 Z" fill="#1e293b"/>
            <path d="M74 48 Q112 46 122 86 L116 120 L86 120 Q104 90 96 62 Z" fill="#0f6b56"/>
            <!-- Hand slipping UNDER hijab edge touching hair -->
            <circle cx="68" cy="60" r="13" fill="rgba(2,132,199,0.28)" stroke="#0284c7" stroke-width="2" class="anim-splash"/>
            <ellipse cx="66" cy="58" rx="15" ry="7" fill="#fbd6b9" stroke="#0284c7" stroke-width="2" class="anim-rub-h"/>
            <text x="82" y="138" text-anchor="middle" font-size="9.5" font-weight="800" fill="#065f46">Masuk di balik tepi jilbab</text>
            <text x="82" y="152" text-anchor="middle" font-size="9" fill="#047857">sentuh rambut/kulit kepala</text>
          </g>
        `;
        break;

      case 6:
        content = `
          <rect x="0" y="0" width="360" height="190" fill="#fff9fb"/>
          <!-- LEFT: Lepas Kaus Kaki -->
          <g transform="translate(10, 10)">
            <rect width="164" height="170" rx="14" fill="#fff1f2" stroke="#e11d48" stroke-width="2"/>
            <text x="82" y="21" text-anchor="middle" font-size="10.5" font-weight="800" fill="#be123c">❌ PAKAI KAUS KAKI</text>
            <path d="M88 46 L118 46 L118 104 Q118 118 100 118 L46 118 Q36 118 36 108 Q36 98 58 96 L88 86 Z" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
            <line x1="48" y1="54" x2="116" y2="116" stroke="#e11d48" stroke-width="4"/>
            <text x="82" y="140" text-anchor="middle" font-size="9.5" font-weight="800" fill="#9f1239">Kaus kaki kain biasa</text>
            <text x="82" y="154" text-anchor="middle" font-size="9" fill="#881337">TIDAK cukup diusap</text>
          </g>
          <!-- RIGHT: Basuh Langsung Kulit Kaki -->
          <g transform="translate(186, 10)">
            <rect width="164" height="170" rx="14" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
            <text x="82" y="21" text-anchor="middle" font-size="10.5" font-weight="800" fill="#065f46">✅ LEPAS KAUS KAKI</text>
            <path d="M88 46 L118 46 L118 104 Q118 118 100 118 L46 118 Q36 118 36 108 Q36 98 58 96 L88 86 Z" fill="#fbd6b9" stroke="#c88d67" stroke-width="2"/>
            <line x1="74" y1="68" x2="128" y2="68" stroke="#0f6b56" stroke-width="2.5" stroke-dasharray="4 3"/>
            <circle cx="102" cy="84" r="7" fill="#38bdf8" class="anim-splash"/>
            <text x="82" y="140" text-anchor="middle" font-size="9.5" font-weight="800" fill="#065f46">Basuh kulit langsung</text>
            <text x="82" y="154" text-anchor="middle" font-size="9" fill="#047857">melewati mata kaki &amp; tumit</text>
          </g>
        `;
        break;

      case 7:
        content = `
          <rect x="0" y="0" width="360" height="190" fill="#fff9fb"/>
          <g transform="translate(120, 12)" class="anim-bob">
            <path d="M20 58 Q20 10 60 10 Q100 10 100 58 L108 136 Q60 150 12 136 Z" fill="#0f6b56" stroke="#094a3b" stroke-width="2"/>
            <ellipse cx="60" cy="60" rx="32" ry="36" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
            <path d="M46 56 Q52 60 58 56" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M64 56 Q70 60 76 56" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M52 74 Q60 80 68 74" fill="none" stroke="#9a3412" stroke-width="2.2" stroke-linecap="round"/>
            <circle cx="60" cy="96" r="4" fill="#fbbf24"/>
          </g>
          <rect x="20" y="148" width="320" height="32" rx="10" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
          <text x="180" y="168" text-anchor="middle" font-size="10.5" font-weight="800" fill="#065f46">Tutup keran rapat → rapikan jilbab, lengan &amp; kaus kaki di area kering</text>
        `;
        break;

      default:
        content = `
          <rect x="0" y="0" width="360" height="190" fill="#fff9fb"/>
          <circle cx="180" cy="82" r="64" fill="#fef3c7" opacity="0.7" class="anim-splash"/>
          <g transform="translate(120, 12)" class="anim-bob">
            <path d="M20 58 Q20 10 60 10 Q100 10 100 58 L108 136 Q60 150 12 136 Z" fill="#0f6b56" stroke="#094a3b" stroke-width="2"/>
            <ellipse cx="60" cy="60" rx="32" ry="36" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
            <path d="M46 56 Q52 60 58 56" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M64 56 Q70 60 76 56" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M52 74 Q60 80 68 74" fill="none" stroke="#9a3412" stroke-width="2.2" stroke-linecap="round"/>
            <g class="anim-raise">
              <ellipse cx="40" cy="116" rx="14" ry="8" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
              <ellipse cx="80" cy="116" rx="14" ry="8" fill="#fbd6b9" stroke="#c88d67" stroke-width="1.8"/>
            </g>
          </g>
          <rect x="24" y="150" width="312" height="30" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
          <text x="180" y="169" text-anchor="middle" font-size="10.5" font-weight="800" fill="#92400e">Busana rapi menutup aurat → menghadap kiblat &amp; berdoa khusyuk</text>
        `;
        break;
    }

    return `<svg viewBox="0 0 360 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Contoh Peragaan Wudhu Perempuan Segmen ${segId}">${content}</svg>`;
  }

  // =========================================================================
  // 5. WUDHU MENGGUNAKAN GAYUNG & BAK AIR (6 LANGKAH VISUAL)
  // =========================================================================
  function renderGayungScene(step) {
    const pose = step.pose;
    let rightPanel = "";

    if (pose === "gayung_rule") {
      rightPanel = renderCloseUpCard(
        "Aturan Bak Kecil (< 2 Qullah)",
        "ANTI AIR MUSTA'MAL (SYAFI'I)",
        `
          <!-- TOP: SALAH -->
          <rect x="14" y="10" width="324" height="132" rx="14" fill="#fff1f2" stroke="#e11d48" stroke-width="2"/>
          <text x="176" y="32" text-anchor="middle" font-size="12" font-weight="800" fill="#be123c">❌ SALAH — Celup Tangan ke Bak Kecil</text>
          <rect x="64" y="54" width="110" height="72" rx="10" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5"/>
          <path d="M118 42 L118 82" stroke="#fbd6b9" stroke-width="18" stroke-linecap="round"/>
          <line x1="100" y1="54" x2="136" y2="90" stroke="#e11d48" stroke-width="4"/>
          <text x="255" y="78" text-anchor="middle" font-size="11" font-weight="800" fill="#9f1239">Air bak &lt; 216 L</text>
          <text x="255" y="96" text-anchor="middle" font-size="10.5" fill="#881337">jadi MUSTA'MAL</text>
          <text x="255" y="112" text-anchor="middle" font-size="10" fill="#881337">(tidak suci mensucikan)</text>

          <!-- BOTTOM: BENAR -->
          <rect x="14" y="156" width="324" height="136" rx="14" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
          <text x="176" y="178" text-anchor="middle" font-size="12" font-weight="800" fill="#065f46">✅ BENAR — Sendok Gayung &amp; Tuang di Luar Bak</text>
          <rect x="44" y="204" width="90" height="70" rx="10" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5"/>
          <text x="89" y="244" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0369a1">Air Bak Suci ✓</text>
          <!-- Gayung pouring outside bak -->
          <g transform="translate(158, 198)" class="anim-bob">
            <rect x="0" y="12" width="44" height="28" rx="6" fill="#0f6b56" transform="rotate(24 22 26)"/>
            <rect x="-26" y="16" width="30" height="7" rx="3.5" fill="#0a4f3f" transform="rotate(24 22 26)"/>
            <line x1="46" y1="34" x2="54" y2="74" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" class="anim-water"/>
          </g>
          <text x="275" y="236" text-anchor="middle" font-size="11" font-weight="800" fill="#065f46">Tuang di atas</text>
          <text x="275" y="253" text-anchor="middle" font-size="10.5" fill="#047857">saluran luar bak</text>
        `,
        "Selalu tuang air gayung di luar bak agar air bak tetap suci!"
      );
    } else if (pose === "gayung_palms") {
      rightPanel = renderCloseUpCard(
        "Telapak, Kumur & Hidung",
        "DETAIL GAYUNG LANGKAH 2",
        `
          <!-- Gayung tilted gently pouring into cupped hand -->
          <g transform="translate(76, 42)" class="anim-bob">
            <rect x="20" y="16" width="66" height="44" rx="10" fill="#0f6b56" transform="rotate(28 53 38)"/>
            <rect x="-24" y="22" width="48" height="10" rx="5" fill="#0a4f3f" transform="rotate(28 53 38)"/>
            <line x1="88" y1="48" x2="104" y2="128" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" class="anim-water"/>
          </g>
          <ellipse cx="186" cy="186" rx="48" ry="20" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5" class="anim-rub-h"/>
          <circle cx="184" cy="172" r="9" fill="#38bdf8" class="anim-splash"/>
          <text x="176" y="242" text-anchor="middle" font-size="13" font-weight="800" fill="#065f46">Pindahkan Air ke Telapak Tangan Kanan</text>
          <text x="176" y="264" text-anchor="middle" font-size="11.5" fill="#475569">Jangan menempelkan mulut langsung ke bibir gayung</text>
        `,
        "Miringkan gayung sedikit demi sedikit (3× tenang & higienis)"
      );
    } else if (pose === "gayung_face") {
      rightPanel = renderCloseUpCard(
        "Membasuh Wajah + Niat",
        "DETAIL GAYUNG LANGKAH 3",
        `
          ${renderFaceBaseLarge()}
          <line x1="176" y1="54" x2="176" y2="216" stroke="#0f6b56" stroke-width="4" marker-start="url(#arrowGreen)" marker-end="url(#arrowGreen)"/>
          <line x1="98" y1="136" x2="254" y2="136" stroke="#d97706" stroke-width="4" marker-start="url(#arrowAmber)" marker-end="url(#arrowAmber)"/>
          <text x="176" y="256" text-anchor="middle" font-size="13" font-weight="800" fill="#065f46">Tuang ke Telapak → Usap Wajah + Niat</text>
          <text x="176" y="276" text-anchor="middle" font-size="11.5" fill="#475569">Batas dahi–dagu &amp; telinga–telinga (di luar bak)</text>
        `,
        "Hadirkan niat wudhu di hati tepat saat air pertama menyentuh wajah"
      );
    } else if (pose === "gayung_arms") {
      rightPanel = renderCloseUpCard(
        "Tuang Bergantian ke Siku",
        "DETAIL GAYUNG LANGKAH 4",
        `
          <!-- Gayung pouring over forearm to elbow -->
          <g transform="translate(52, 22)" class="anim-rub-h">
            <rect x="20" y="14" width="56" height="36" rx="8" fill="#0f6b56" transform="rotate(26 48 32)"/>
            <rect x="-18" y="18" width="40" height="9" rx="4.5" fill="#0a4f3f" transform="rotate(26 48 32)"/>
            <line x1="78" y1="44" x2="90" y2="122" stroke="#38bdf8" stroke-width="5.5" stroke-linecap="round" class="anim-water"/>
          </g>
          <rect x="64" y="146" width="212" height="46" rx="22" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
          <line x1="252" y1="122" x2="252" y2="210" stroke="#d97706" stroke-width="3.5" stroke-dasharray="5 3"/>
          <text x="252" y="114" text-anchor="middle" font-size="11" font-weight="800" fill="#b45309">Melewati Siku ✓</text>
          <text x="176" y="242" text-anchor="middle" font-size="12.5" font-weight="800" fill="#065f46">Gayung di Kiri → Basuh Tangan Kanan (3×)</text>
          <text x="176" y="264" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0369a1">Gayung di Kanan → Basuh Tangan Kiri (3×)</text>
        `,
        "Alirkan perlahan dari ujung jari hingga 2–3 cm melewati siku"
      );
    } else if (pose === "gayung_head") {
      rightPanel = renderCloseUpCard(
        "Usap Kepala (Jangan Disiram!)",
        "DETAIL GAYUNG LANGKAH 5",
        `
          <circle cx="176" cy="148" r="72" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
          <path d="M108 128 Q128 66 196 74 Q246 82 248 146 Q226 118 174 110 Q136 108 108 128 Z" fill="#1e293b"/>
          <path d="M118 98 Q176 42 240 100" fill="none" stroke="#0284c7" stroke-width="6" stroke-dasharray="8 5"/>
          <ellipse cx="176" cy="64" rx="24" ry="11" fill="#fbd6b9" stroke="#0284c7" stroke-width="2.5" class="anim-rub-h"/>
          <rect x="44" y="14" width="264" height="30" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
          <text x="176" y="34" text-anchor="middle" font-size="11.5" font-weight="800" fill="#166534">LETAKKAN GAYUNG — CUKUP TANGAN BASAH!</text>
          <text x="176" y="252" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0369a1">Usap sebagian kepala &amp; kedua telinga</text>
          <text x="176" y="272" text-anchor="middle" font-size="11.5" fill="#9d174d">Putri: masukkan tangan basah di balik tepi jilbab</text>
        `,
        "Tidak perlu menyiram 1 gayung ke kepala (hemat air & sunnah)"
      );
    } else {
      rightPanel = renderCloseUpCard(
        "Basuh Kaki di Luar Bak + Doa",
        "DETAIL GAYUNG LANGKAH 6",
        `
          <g transform="translate(56, 18)" class="anim-bob">
            <rect x="18" y="12" width="52" height="32" rx="8" fill="#0f6b56" transform="rotate(26 44 28)"/>
            <rect x="-16" y="16" width="36" height="8" rx="4" fill="#0a4f3f" transform="rotate(26 44 28)"/>
            <line x1="72" y1="40" x2="88" y2="140" stroke="#38bdf8" stroke-width="5.5" stroke-linecap="round" class="anim-water"/>
          </g>
          <path d="M168 88 L224 88 L224 196 Q224 224 194 224 L82 224 Q62 224 62 206 Q62 188 100 184 L168 166 Z" fill="#fbd6b9" stroke="#c88d67" stroke-width="2.5"/>
          <line x1="146" y1="130" x2="250" y2="130" stroke="#d97706" stroke-width="3.5" stroke-dasharray="5 3"/>
          <text x="256" y="134" text-anchor="start" font-size="10.5" font-weight="800" fill="#b45309">Mata Kaki ✓</text>
          <text x="176" y="256" text-anchor="middle" font-size="12.5" font-weight="800" fill="#065f46">Lepas Kaus Kaki → Basuh Kanan &amp; Kiri (3×)</text>
          <text x="176" y="276" text-anchor="middle" font-size="11.5" fill="#475569">Rapikan gayung di tempatnya lalu baca doa wudhu</text>
        `,
        "Pastikan sela jari kaki, tumit belakang & kedua mata kaki basah"
      );
    }

    // Dynamic Left-Side Character Pose matching EACH of the 6 Gayung steps!
    let gayungOnRim = "";
    let charLegs = `
      <rect x="300" y="320" width="24" height="98" rx="11" fill="#334155"/>
      <rect x="340" y="320" width="24" height="98" rx="11" fill="#334155"/>
      <ellipse cx="310" cy="422" rx="20" ry="10" fill="#f3c6a5" stroke="#d9a07b" stroke-width="1.6"/>
      <ellipse cx="352" cy="422" rx="20" ry="10" fill="#f3c6a5" stroke="#d9a07b" stroke-width="1.6"/>
    `;
    let charArmsAndGayung = "";
    let headOverlay = "";

    if (pose === "gayung_rule") {
      // Scooping cleanly from the bak using ONLY the gayung (hand stays outside bak)
      charArmsAndGayung = `
        <path d="M376 222 Q390 258 380 294" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
        <circle cx="380" cy="300" r="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="1.6"/>
        <g class="anim-rub-v">
          <path d="M286 222 Q242 232 206 238" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
          <circle cx="202" cy="238" r="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="1.8"/>
          <!-- Gayung handle held outside, cup dipping cleanly into bak water -->
          <rect x="132" y="232" width="70" height="8" rx="4" fill="#0a4f3f"/>
          <rect x="92" y="220" width="44" height="32" rx="7" fill="#0f6b56"/>
          <ellipse cx="114" cy="222" rx="20" ry="5" fill="#7dd3fc"/>
        </g>
        <rect x="176" y="182" width="144" height="26" rx="13" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
        <text x="248" y="199" text-anchor="middle" font-size="10.5" font-weight="800" fill="#166534">Sendok Pakai Gayung ✓</text>
      `;
    } else if (pose === "gayung_palms") {
      // Left hand pours gently from gayung outside bak into right cupped hand moving to mouth/palms
      charArmsAndGayung = `
        <path d="M286 222 Q256 232 236 244" stroke="#ffffff" stroke-width="20" stroke-linecap="round" fill="none"/>
        <g transform="translate(194, 218)" class="anim-bob">
          <rect x="0" y="6" width="42" height="28" rx="7" fill="#0f6b56" transform="rotate(-24 21 20)"/>
          <rect x="34" y="14" width="28" height="8" rx="4" fill="#0a4f3f" transform="rotate(-24 21 20)"/>
          <line x1="8" y1="34" x2="22" y2="74" stroke="#38bdf8" stroke-width="5.5" stroke-linecap="round" class="anim-water"/>
        </g>
        <g class="anim-rub-v">
          <path d="M376 220 Q320 278 228 290" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
          <ellipse cx="218" cy="292" rx="19" ry="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          <circle cx="218" cy="285" r="6" fill="#38bdf8" class="anim-splash"/>
        </g>
      `;
    } else if (pose === "gayung_face") {
      // Gayung resting neatly on bak rim while BOTH wet hands wash the face!
      gayungOnRim = `
        <g transform="translate(88, 194)">
          <rect x="0" y="0" width="42" height="26" rx="6" fill="#0f6b56"/>
          <rect x="40" y="7" width="28" height="7" rx="3.5" fill="#0a4f3f"/>
        </g>
      `;
      headOverlay = `
        <ellipse cx="332" cy="138" rx="46" ry="42" fill="rgba(56,189,248,0.16)" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="5 4"/>
      `;
      charArmsAndGayung = `
        <g class="anim-rub-v">
          <path d="M286 214 Q264 172 302 140" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
          <path d="M378 214 Q400 172 362 140" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
          <ellipse cx="305" cy="138" rx="13" ry="18" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          <ellipse cx="359" cy="138" rx="13" ry="18" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          <circle cx="308" cy="124" r="5" fill="#38bdf8" class="anim-splash"/>
          <circle cx="356" cy="124" r="5" fill="#38bdf8" class="anim-splash"/>
        </g>
      `;
    } else if (pose === "gayung_arms") {
      // Bare right forearm extended naturally downward-forward (elbow highlighted!), left arm holds gayung comfortably in front of chest pouring down onto forearm!
      charArmsAndGayung = `
        <!-- Extended bare forearm (rolled sleeve) -->
        <path d="M286 224 L268 256" stroke="#ffffff" stroke-width="23" stroke-linecap="round" fill="none"/>
        <path d="M268 256 L192 312" stroke="#fbd6b9" stroke-width="20" stroke-linecap="round" fill="none"/>
        <circle cx="266" cy="258" r="14" fill="rgba(16,185,129,0.28)" stroke="#059669" stroke-width="2.5" stroke-dasharray="4 3"/>
        <text x="278" y="286" text-anchor="start" font-size="10.5" font-weight="800" fill="#065f46">Siku ✓</text>

        <!-- Other arm naturally curving forward in front of chest holding gayung -->
        <g class="anim-rub-h">
          <path d="M376 224 Q340 264 260 238" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
          <circle cx="256" cy="238" r="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="1.8"/>
          <g transform="translate(198, 220)">
            <rect x="0" y="6" width="42" height="28" rx="7" fill="#0f6b56" transform="rotate(-22 21 20)"/>
            <rect x="34" y="14" width="26" height="7" rx="3.5" fill="#0a4f3f" transform="rotate(-22 21 20)"/>
            <line x1="8" y1="34" x2="12" y2="86" stroke="#38bdf8" stroke-width="5.5" stroke-linecap="round" class="anim-water"/>
          </g>
        </g>
      `;
    } else if (pose === "gayung_head") {
      // Gayung resting on bak rim (Hemat Air!), BOTH wet hands raised wiping head!
      gayungOnRim = `
        <g transform="translate(88, 194)">
          <rect x="0" y="0" width="42" height="26" rx="6" fill="#0f6b56"/>
          <rect x="40" y="7" width="28" height="7" rx="3.5" fill="#0a4f3f"/>
        </g>
        <rect x="28" y="162" width="136" height="24" rx="12" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
        <text x="96" y="178" text-anchor="middle" font-size="10" font-weight="800" fill="#166534">Gayung Diletakkan ✓</text>
      `;
      headOverlay = `
        <path d="M294 98 Q332 70 370 98" fill="none" stroke="#0284c7" stroke-width="5" stroke-dasharray="6 4"/>
      `;
      charArmsAndGayung = `
        <g class="anim-rub-h">
          <path d="M286 214 Q256 140 306 86" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
          <path d="M378 214 Q408 140 358 86" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
          <ellipse cx="314" cy="84" rx="17" ry="10" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
          <ellipse cx="350" cy="84" rx="17" ry="10" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
        </g>
      `;
    } else {
      // gayung_feet: Right foot lifted over outside drain, left hand pouring gayung onto foot & ankle!
      charLegs = `
        <path d="M312 320 Q268 352 214 378" stroke="#334155" stroke-width="24" stroke-linecap="round" fill="none"/>
        <ellipse cx="204" cy="382" rx="22" ry="11" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
        <circle cx="222" cy="368" r="10" fill="rgba(16,185,129,0.28)" stroke="#059669" stroke-width="2"/>
        <circle cx="206" cy="374" r="7" fill="#38bdf8" class="anim-splash"/>
        <rect x="340" y="320" width="24" height="98" rx="11" fill="#334155"/>
        <ellipse cx="352" cy="422" rx="20" ry="10" fill="#f3c6a5" stroke="#d9a07b" stroke-width="1.6"/>
      `;
      charArmsAndGayung = `
        <!-- Left arm holding gayung tilted downward pouring directly onto raised foot -->
        <path d="M286 226 Q256 266 238 286" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
        <g transform="translate(194, 268)" class="anim-bob">
          <rect x="0" y="6" width="42" height="28" rx="7" fill="#0f6b56" transform="rotate(-28 21 20)"/>
          <rect x="34" y="14" width="26" height="7" rx="3.5" fill="#0a4f3f" transform="rotate(-28 21 20)"/>
          <line x1="8" y1="34" x2="12" y2="104" stroke="#38bdf8" stroke-width="5.5" stroke-linecap="round" class="anim-water"/>
        </g>
        <!-- Right hand reaching down to rub foot/toes -->
        <g class="anim-rub-h">
          <path d="M376 232 Q314 316 244 364" stroke="#ffffff" stroke-width="19" stroke-linecap="round" fill="none"/>
          <circle cx="238" cy="368" r="12" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2"/>
        </g>
      `;
    }

    return `
      <svg viewBox="0 0 900 480" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${step.title}">
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e0f2fe"/>
            <stop offset="100%" stop-color="#f0fdf4"/>
          </linearGradient>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f6b56"/>
          </marker>
          <marker id="arrowAmber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706"/>
          </marker>
        </defs>

        <!-- Background -->
        <rect x="0" y="0" width="900" height="480" fill="url(#bgGrad)" />
        <rect x="0" y="348" width="498" height="132" fill="#d7ebe4" />
        <line x1="0" y1="348" x2="498" y2="348" stroke="#b3d4c8" stroke-width="3" />

        <!-- Badge -->
        <g transform="translate(20, 18)">
          <rect width="232" height="30" rx="15" fill="#0284c7"/>
          <text x="116" y="20" text-anchor="middle" font-size="12" font-weight="800" fill="#ffffff">🪣 PERAGAAN WUDHU GAYUNG</text>
        </g>

        <!-- Bak Air / Water Tub (Left) -->
        <rect x="24" y="220" width="142" height="178" rx="14" fill="#f8fafc" stroke="#94a3b8" stroke-width="3"/>
        <rect x="34" y="240" width="122" height="146" rx="8" fill="#bae6fd"/>
        <ellipse cx="95" cy="242" rx="60" ry="9" fill="#38bdf8" opacity="0.75"/>
        <text x="95" y="318" text-anchor="middle" font-size="13" font-weight="800" fill="#0369a1">BAK AIR</text>
        <text x="95" y="336" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0284c7">(Tetap Suci ✓)</text>
        ${gayungOnRim}

        <!-- Drain floor outside the bak -->
        <rect x="176" y="394" width="126" height="22" rx="8" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.8"/>
        <text x="239" y="409" text-anchor="middle" font-size="10" font-weight="800" fill="#475569">Saluran Luar Bak</text>

        <!-- Child Character with Step-Specific Dynamic Pose -->
        <g class="anim-bob">
          <ellipse cx="332" cy="432" rx="68" ry="12" fill="#94a3b8" opacity="0.3"/>
          ${charLegs}
          <path d="M284 202 Q332 190 380 202 L388 326 L276 326 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5"/>
          <path d="M318 198 L332 226 L346 198 Z" fill="#0f6b56"/>
          <rect x="319" y="174" width="26" height="22" rx="8" fill="#f3c6a5"/>
          <ellipse cx="332" cy="130" rx="50" ry="54" fill="#fbd6b9" stroke="#d9a07b" stroke-width="2.2"/>
          <path d="M286 108 Q332 98 378 108 L375 82 Q332 68 289 82 Z" fill="#0f5c4d" stroke="#093f34" stroke-width="2"/>
          <path d="M289 102 Q332 93 375 102" fill="none" stroke="#fbbf24" stroke-width="2.6"/>
          <circle cx="315" cy="128" r="5" fill="#1e293b"/>
          <circle cx="349" cy="128" r="5" fill="#1e293b"/>
          <path d="M320 152 Q332 162 344 152" fill="none" stroke="#9a3412" stroke-width="2.8" stroke-linecap="round"/>
          ${headOverlay}
          ${charArmsAndGayung}
        </g>

        <!-- Right Half: Close-Up Detail -->
        ${rightPanel}
      </svg>
    `;
  }

  return {
    renderScene,
    renderAnatomySvg,
    renderFemaleDemo,
    renderGayungScene
  };
})();
