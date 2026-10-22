// ============================================================
//  Insta Conscience — content.js
//  Phase 1: Login page  → job-application popup with Skip btn
//  Phase 2: Reels ONLY  → High-frequency flood (300ms) → 28 popups fill screen
//           → Job application form → "Need a break?" interactive troll
//           → Runaway Yes button (proximity dodge, 5 attempts) / Roasted No button
//           → Final Job Application → LinkedIn Jobs
// ============================================================

(function () {
  'use strict';

  // ─────────────── CONSTANTS ───────────────
  const POPUP_INTERVAL_MS    = 220;    // Rapid-fire 220ms interval for fast flooding
  const POPUPS_BEFORE_FORM   = 32;     // 32 popups to completely blanket and fill the entire screen
  const SOUND_LOGIN  = chrome.runtime.getURL('sound.mp3');
  const SOUND_REELS  = chrome.runtime.getURL('sound2.mp3');
  const MEME_LOGIN   = chrome.runtime.getURL('meme.png');
  const MEME_REELS   = chrome.runtime.getURL('meme2.png');

  // 32 dense scatter coordinates covering every corner, edge, quadrant, and center
  const SCATTER_POSITIONS = [
    { top: '1%',   left: '1%' },
    { top: '2%',   right: '1%' },
    { bottom: '1%', left: '1%' },
    { bottom: '2%', right: '1%' },
    { top: '1%',   left: '32%' },
    { top: '1%',   right: '32%' },
    { bottom: '1%', left: '32%' },
    { bottom: '1%', right: '32%' },
    { top: '28%',  left: '1%' },
    { top: '28%',  right: '1%' },
    { top: '55%',  left: '1%' },
    { top: '55%',  right: '1%' },
    { top: '18%',  left: '16%' },
    { top: '18%',  right: '16%' },
    { bottom: '18%', left: '16%' },
    { bottom: '18%', right: '16%' },
    { top: '25%',  left: '35%' },
    { top: '40%',  left: '25%' },
    { top: '40%',  right: '25%' },
    { top: '55%',  left: '35%' },
    { top: '10%',  left: '48%' },
    { bottom: '10%', left: '48%' },
    { top: '35%',  left: '10%' },
    { top: '35%',  right: '10%' },
    { top: '48%',  left: '48%' },
    { top: '12%',  left: '22%' },
    { bottom: '12%', right: '22%' },
    { top: '22%',  left: '52%' },
    { top: '65%',  left: '20%' },
    { top: '65%',  right: '20%' },
    { top: '5%',   left: '60%' },
    { bottom: '5%', right: '60%' }
  ];

  // ─────────────── STATE ───────────────────
  let loginPopupShown = false;
  let reelsModeActive = false;
  let nextPopupTimer  = null;
  let reelAudio       = null;
  let popupCount      = 0;
  let formShown       = false;
  let yesAttempts     = 0;
  let isFinalForm     = false;

  // Stored form data to prefill when form is shown again
  let savedFormData = {
    fname: '',
    lname: '',
    email: '',
    phone: '',
    position: '',
    exp: '',
    linkedin: '',
    cover: ''
  };

  // ─────────────── PAGE DETECTION ──────────
  const isLoginPage = () => {
    const url = window.location.href;
    return (
      url === 'https://www.instagram.com/' ||
      url === 'https://www.instagram.com/?hl=en' ||
      url === 'https://www.instagram.com' ||
      url.startsWith('https://www.instagram.com/?') ||
      /^https:\/\/www\.instagram\.com\/?$/.test(url)
    );
  };

  // ONLY trigger in reels section (as requested: do NOT trigger on feed/explore/home)
  const isReels = () => {
    const url = window.location.href;
    return url.includes('/reels') || url.includes('/reel/');
  };

  // ─────────────── INJECT CSS ──────────────
  function injectStyles() {
    if (document.getElementById('ic-styles')) return;
    const style = document.createElement('style');
    style.id = 'ic-styles';
    style.textContent = `
      @keyframes ic-drop-in {
        from { transform: scale(0.6) translateY(-20px); opacity: 0; }
        to   { transform: scale(1) translateY(0); opacity: 1; }
      }
      @keyframes ic-form-in {
        from { transform: translateY(30px) scale(0.95); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes ic-pop {
        0%   { transform: scale(0.85); opacity: 0; }
        60%  { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
      }
      .ic-reels-popup {
        position: fixed;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 16px 60px rgba(0,0,0,0.85);
        overflow: hidden;
        animation: ic-drop-in 0.25s cubic-bezier(.22,.68,0,1.2) both;
        pointer-events: auto;
      }
      .ic-reels-popup img {
        display: block;
        height: 300px;
        width: auto;
        max-width: 85vw;
      }
      .ic-reels-close {
        position: absolute;
        top: 8px;
        right: 10px;
        background: rgba(0,0,0,0.6);
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        line-height: 1;
        transition: background 0.2s;
      }
      .ic-reels-close:hover {
        background: #ef4444;
      }
      #ic-job-form-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.92);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        padding: 16px;
        box-sizing: border-box;
      }
      #ic-job-form-card {
        background: #ffffff;
        border-radius: 20px;
        padding: 32px 36px;
        width: min(540px, 94vw);
        max-height: 92vh;
        overflow-y: auto;
        box-shadow: 0 32px 100px rgba(0,0,0,0.95);
        animation: ic-form-in 0.45s cubic-bezier(.22,.68,0,1.2) both;
        box-sizing: border-box;
        color: #1a1a2e;
        position: relative;
      }
      #ic-job-form-card h2 {
        font-size: 22px;
        font-weight: 800;
        color: #1a1a2e;
        margin: 0 0 6px 0;
        text-align: center;
      }
      #ic-job-form-card .ic-subtitle {
        text-align: center;
        font-size: 13px;
        color: #64748b;
        margin: 0 0 20px 0;
        line-height: 1.4;
      }
      #ic-job-form-card .ic-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 12px;
        text-align: left;
      }
      #ic-job-form-card label {
        font-size: 11px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      #ic-job-form-card input,
      #ic-job-form-card select,
      #ic-job-form-card textarea {
        border: 1.5px solid #cbd5e1;
        border-radius: 8px;
        padding: 9px 12px;
        font-size: 14px;
        color: #1a1a2e;
        outline: none;
        transition: border-color 0.2s;
        font-family: inherit;
        background: #f8fafc;
        box-sizing: border-box;
        width: 100%;
      }
      #ic-job-form-card input:focus,
      #ic-job-form-card select:focus,
      #ic-job-form-card textarea:focus {
        border-color: #0a66c2;
        background: #fff;
      }
      #ic-job-form-card textarea {
        resize: vertical;
        min-height: 65px;
      }
      #ic-job-form-card .ic-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      #ic-job-form-card .ic-submit-btn {
        width: 100%;
        padding: 13px;
        background: #0a66c2;
        color: #ffffff;
        border: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        margin-top: 8px;
        transition: background 0.2s, transform 0.1s;
        font-family: inherit;
        letter-spacing: 0.3px;
      }
      #ic-job-form-card .ic-submit-btn:hover {
        background: #004182;
        transform: translateY(-1px);
      }
      #ic-job-form-card .ic-footer {
        text-align: center;
        font-size: 11px;
        color: #94a3b8;
        margin-top: 12px;
      }
      /* Troll Break Question Box */
      .ic-question-box {
        animation: ic-pop 0.35s ease both;
        text-align: center;
        padding: 10px 0;
      }
      .ic-question-title {
        font-size: 26px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 8px;
      }
      .ic-question-text {
        font-size: 16px;
        color: #475569;
        margin-bottom: 22px;
        line-height: 1.5;
        font-weight: 500;
      }
      .ic-btn-arena {
        position: relative !important;
        height: 230px !important;
        width: 100% !important;
        background: #f1f5f9 !important;
        border: 2px dashed #cbd5e1 !important;
        border-radius: 16px !important;
        margin-bottom: 16px !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      .ic-btn-no {
        position: absolute !important;
        bottom: 20px !important;
        right: 24px !important;
        padding: 11px 26px !important;
        background: #ef4444 !important;
        color: #fff !important;
        font-size: 15px !important;
        font-weight: 700 !important;
        border: none !important;
        border-radius: 10px !important;
        cursor: pointer !important;
        transition: transform 0.1s, background 0.2s !important;
        z-index: 10 !important;
        font-family: inherit !important;
      }
      .ic-btn-no:hover {
        background: #dc2626 !important;
        transform: scale(1.05) !important;
      }
      .ic-btn-yes {
        position: absolute !important;
        top: 24px !important;
        left: 24px !important;
        padding: 11px 26px !important;
        background: #10b981 !important;
        color: #fff !important;
        font-size: 15px !important;
        font-weight: 700 !important;
        border: none !important;
        border-radius: 10px !important;
        cursor: pointer !important;
        z-index: 50 !important;
        user-select: none !important;
        white-space: nowrap !important;
        font-family: inherit !important;
        transition: top 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28), left 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28), transform 0.1s ease !important;
      }
      .ic-attempt-hint {
        font-size: 14px !important;
        font-weight: 700 !important;
        color: #64748b !important;
        margin-top: 8px !important;
        min-height: 22px !important;
        transition: color 0.2s !important;
      }
      .ic-roast-card {
        animation: ic-pop 0.35s ease both;
        text-align: center;
        padding: 16px 8px;
      }
      .ic-roast-emoji {
        font-size: 52px;
        margin-bottom: 10px;
      }
      .ic-roast-title {
        font-size: 24px;
        font-weight: 800;
        color: #dc2626;
        margin-bottom: 12px;
        line-height: 1.3;
      }
      .ic-roast-body {
        font-size: 15px;
        color: #334155;
        line-height: 1.6;
        margin-bottom: 24px;
      }
    `;
    document.head.appendChild(style);
  }

  // ─────────────── PHASE 1: LOGIN PAGE ──────
  function showLoginPopup() {
    if (loginPopupShown) return;
    loginPopupShown = true;
    injectStyles();

    try {
      const audio = new Audio(SOUND_LOGIN);
      audio.loop = true;
      audio.volume = 0.6;
      audio.play().catch(() => {
        document.addEventListener('click', () => audio.play(), { once: true });
      });
    } catch (e) {}

    const backdrop = document.createElement('div');
    backdrop.id = 'ic-login-backdrop';
    Object.assign(backdrop.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.65)',
      zIndex: '2147483646',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      position: 'relative',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
      overflow: 'hidden',
      maxHeight: '85vh',
    });

    const img = document.createElement('img');
    img.src = MEME_LOGIN;
    img.alt = 'Job Application Form';
    Object.assign(img.style, {
      display: 'block',
      height: '75vh',
      width: 'auto',
      maxWidth: '90vw',
    });

    const skipBtn = document.createElement('button');
    skipBtn.id = 'ic-login-skip';
    skipBtn.textContent = 'Skip ›';
    Object.assign(skipBtn.style, {
      position: 'absolute',
      bottom: '14px',
      left: '14px',
      background: 'rgba(0,0,0,0.55)',
      color: '#ccc',
      border: '1px solid #555',
      borderRadius: '6px',
      padding: '6px 14px',
      fontSize: '13px',
      fontFamily: 'system-ui, sans-serif',
      cursor: 'pointer',
      transition: 'background 0.2s',
      zIndex: '1',
    });
    skipBtn.addEventListener('mouseover', () => { skipBtn.style.background = 'rgba(0,0,0,0.8)'; skipBtn.style.color = '#fff'; });
    skipBtn.addEventListener('mouseout',  () => { skipBtn.style.background = 'rgba(0,0,0,0.55)'; skipBtn.style.color = '#ccc'; });
    skipBtn.addEventListener('click', () => {
      backdrop.remove();
      document.querySelectorAll('audio').forEach(a => a.pause());
    });

    card.appendChild(img);
    card.appendChild(skipBtn);
    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
  }

  // ─────────────── PHASE 2: REELS ONLY ─────
  function startReelsMode() {
    if (reelsModeActive) return;
    reelsModeActive = true;
    popupCount      = 0;
    formShown       = false;
    yesAttempts     = 0;
    injectStyles();

    try {
      reelAudio = new Audio(SOUND_REELS);
      reelAudio.loop = true;
      reelAudio.volume = 0.7;
      reelAudio.play().catch(() => {});
    } catch (e) {}

    scheduleNextPopup();
  }

  function scheduleNextPopup() {
    if (!reelsModeActive) return;
    if (nextPopupTimer) clearTimeout(nextPopupTimer);

    nextPopupTimer = setTimeout(() => {
      spawnReelsPopup();

      if (popupCount < POPUPS_BEFORE_FORM) {
        scheduleNextPopup();
      } else if (!formShown) {
        formShown = true;
        // Popups have now completely blanketed the screen! Show the job application form
        setTimeout(() => {
          showJobForm();
        }, 400);
      }
    }, POPUP_INTERVAL_MS);
  }

  function spawnReelsPopup() {
    popupCount++;
    const zBase = 2147480000 + popupCount * 10;
    const pos = SCATTER_POSITIONS[(popupCount - 1) % SCATTER_POSITIONS.length];

    const popup = document.createElement('div');
    popup.className = 'ic-reels-popup';

    Object.assign(popup.style, {
      top: pos.top || 'auto',
      left: pos.left || 'auto',
      right: pos.right || 'auto',
      bottom: pos.bottom || 'auto',
      zIndex: String(zBase)
    });

    const img = document.createElement('img');
    img.src = MEME_REELS;
    img.alt = 'Still scrolling?';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ic-reels-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => popup.remove());

    popup.appendChild(img);
    popup.appendChild(closeBtn);
    document.body.appendChild(popup);

    // Block scroll once popups start accumulating
    if (popupCount >= 3) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  }

  // ─────────────── JOB APPLICATION FORM ────
  function showJobForm() {
    let overlay = document.getElementById('ic-job-form-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ic-job-form-overlay';
      document.body.appendChild(overlay);
    }

    renderJobFormCard();
  }

  function renderJobFormCard() {
    const overlay = document.getElementById('ic-job-form-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div id="ic-job-form-card">
        <h2>📋 Job Application</h2>
        <p class="ic-subtitle">${isFinalForm ? "Final Step: Ready to apply directly on LinkedIn Jobs!" : "Screen is completely full! Since you have so much time for reels, apply for a job."}</p>

        <form id="ic-actual-form">
          <div class="ic-row">
            <div class="ic-field">
              <label>First Name *</label>
              <input type="text" id="ic-fname" placeholder="John" value="${savedFormData.fname}" required>
            </div>
            <div class="ic-field">
              <label>Last Name *</label>
              <input type="text" id="ic-lname" placeholder="Doe" value="${savedFormData.lname}" required>
            </div>
          </div>

          <div class="ic-field">
            <label>Email Address *</label>
            <input type="email" id="ic-email" placeholder="john.doe@example.com" value="${savedFormData.email}" required>
          </div>

          <div class="ic-field">
            <label>Phone Number</label>
            <input type="tel" id="ic-phone" placeholder="+91 98765 43210" value="${savedFormData.phone}">
          </div>

          <div class="ic-field">
            <label>Position Applying For *</label>
            <select id="ic-position" required>
              <option value="">— Select a Role —</option>
              <option ${savedFormData.position === 'Software Engineer' ? 'selected' : ''}>Software Engineer</option>
              <option ${savedFormData.position === 'Product Manager' ? 'selected' : ''}>Product Manager</option>
              <option ${savedFormData.position === 'UI/UX Designer' ? 'selected' : ''}>UI/UX Designer</option>
              <option ${savedFormData.position === 'Data Analyst' ? 'selected' : ''}>Data Analyst</option>
              <option ${savedFormData.position === 'Marketing Specialist' ? 'selected' : ''}>Marketing Specialist</option>
              <option ${savedFormData.position === 'Business Development' ? 'selected' : ''}>Business Development</option>
              <option ${savedFormData.position === 'Content Creator' ? 'selected' : ''}>Content Creator</option>
              <option ${savedFormData.position === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>

          <div class="ic-field">
            <label>Years of Experience</label>
            <select id="ic-exp">
              <option value="">— Select —</option>
              <option ${savedFormData.exp === 'Fresher (0–1 yr)' ? 'selected' : ''}>Fresher (0–1 yr)</option>
              <option ${savedFormData.exp === '1–3 years' ? 'selected' : ''}>1–3 years</option>
              <option ${savedFormData.exp === '3–5 years' ? 'selected' : ''}>3–5 years</option>
              <option ${savedFormData.exp === '5–10 years' ? 'selected' : ''}>5–10 years</option>
              <option ${savedFormData.exp === '10+ years' ? 'selected' : ''}>10+ years</option>
            </select>
          </div>

          <div class="ic-field">
            <label>LinkedIn Profile URL</label>
            <input type="url" id="ic-linkedin" placeholder="https://linkedin.com/in/yourname" value="${savedFormData.linkedin}">
          </div>

          <div class="ic-field">
            <label>Why should we hire you?</label>
            <textarea id="ic-cover" placeholder="Tell us why you are ready to stop scrolling and start working...">${savedFormData.cover}</textarea>
          </div>

          <button type="submit" class="ic-submit-btn" id="ic-submit-btn">
            ${isFinalForm ? "🚀 Submit Application & Open LinkedIn Jobs →" : "Submit Application →"}
          </button>
          <p class="ic-footer">Your data is safe. A friendly nudge to level up! 😄</p>
        </form>
      </div>
    `;

    document.getElementById('ic-actual-form').addEventListener('submit', handleFormSubmit);
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    savedFormData.fname    = document.getElementById('ic-fname').value.trim();
    savedFormData.lname    = document.getElementById('ic-lname').value.trim();
    savedFormData.email    = document.getElementById('ic-email').value.trim();
    savedFormData.phone    = document.getElementById('ic-phone').value.trim();
    savedFormData.position = document.getElementById('ic-position').value;
    savedFormData.exp      = document.getElementById('ic-exp').value;
    savedFormData.linkedin = document.getElementById('ic-linkedin').value.trim();
    savedFormData.cover    = document.getElementById('ic-cover').value.trim();

    const btn = document.getElementById('ic-submit-btn');

    if (!savedFormData.fname || !savedFormData.lname || !savedFormData.email || !savedFormData.position) {
      btn.textContent = '⚠️ Please fill all required fields!';
      btn.style.background = '#e74c3c';
      setTimeout(() => {
        btn.textContent = isFinalForm ? '🚀 Submit Application & Open LinkedIn Jobs →' : 'Submit Application →';
        btn.style.background = '#0a66c2';
      }, 2000);
      return;
    }

    if (isFinalForm) {
      btn.textContent = '✅ Submitting... Opening LinkedIn Jobs!';
      btn.style.background = '#10b981';
      setTimeout(() => {
        window.open('https://www.linkedin.com/jobs/', '_blank');
      }, 600);
      return;
    }

    // First time submit: do NOT lead to LinkedIn yet. Ask if they want a break!
    showBreakQuestion();
  }

  // ─────────────── TROLL BREAK QUESTION ────
  function showBreakQuestion() {
    const overlay = document.getElementById('ic-job-form-overlay');
    if (!overlay) return;

    yesAttempts = 0;
    let lastAttemptTime = 0;

    overlay.innerHTML = `
      <div id="ic-job-form-card" class="ic-question-box">
        <div class="ic-question-title">Wait a second... 🤔</div>
        <div class="ic-question-text">
          Do you just want a break? Is THAT the reason why you started scrolling reels?
        </div>

        <div class="ic-btn-arena" id="ic-btn-arena">
          <button type="button" class="ic-btn-yes" id="ic-btn-yes">Yes, I need a break 😴</button>
          <button type="button" class="ic-btn-no" id="ic-btn-no">No 😤</button>
        </div>

        <div class="ic-attempt-hint" id="ic-hint">Try clicking your answer...</div>
      </div>
    `;

    const yesBtn = document.getElementById('ic-btn-yes');
    const noBtn  = document.getElementById('ic-btn-no');
    const arena  = document.getElementById('ic-btn-arena');
    const hint   = document.getElementById('ic-hint');

    // Enforce absolute positioning inline
    yesBtn.style.setProperty('position', 'absolute', 'important');
    yesBtn.style.setProperty('top', '24px', 'important');
    yesBtn.style.setProperty('left', '24px', 'important');

    // Strategic positions spread across the arena (avoiding bottom-right corner where "No" button sits)
    function getFurthestSpot(cursorX, cursorY) {
      const arenaRect = arena.getBoundingClientRect();
      const btnW = yesBtn.offsetWidth || 180;
      const btnH = yesBtn.offsetHeight || 44;
      const pad = 16;
      const maxX = Math.max(pad, arena.clientWidth - btnW - pad);
      const maxY = Math.max(pad, arena.clientHeight - btnH - pad);

      const candidates = [
        { x: pad, y: pad },                                         // Top-left
        { x: maxX, y: pad },                                        // Top-right
        { x: pad, y: maxY },                                        // Bottom-left
        { x: Math.floor(maxX * 0.5), y: pad },                      // Top-center
        { x: pad, y: Math.floor(maxY * 0.5) },                      // Middle-left
        { x: Math.floor(maxX * 0.65), y: Math.floor(maxY * 0.35) }, // Center
        { x: Math.floor(maxX * 0.3), y: maxY }                      // Bottom-center-left
      ];

      let bestSpot = candidates[0];
      let maxDist = -1;

      for (const spot of candidates) {
        const spotCenterX = arenaRect.left + spot.x + btnW / 2;
        const spotCenterY = arenaRect.top  + spot.y + btnH / 2;
        const dist = Math.hypot(cursorX - spotCenterX, cursorY - spotCenterY);
        if (dist > maxDist) {
          maxDist = dist;
          bestSpot = spot;
        }
      }

      const jitterX = Math.floor((Math.random() - 0.5) * 16);
      const jitterY = Math.floor((Math.random() - 0.5) * 16);
      return {
        x: Math.max(pad, Math.min(maxX, bestSpot.x + jitterX)),
        y: Math.max(pad, Math.min(maxY, bestSpot.y + jitterY))
      };
    }

    function triggerDodge(cursorX, cursorY, force = false) {
      if (yesAttempts >= 5) return;

      const rect = yesBtn.getBoundingClientRect();
      // Distance from cursor to nearest point of button bounding box
      const dx = Math.max(rect.left - cursorX, 0, cursorX - rect.right);
      const dy = Math.max(rect.top - cursorY, 0, cursorY - rect.bottom);
      const dist = Math.hypot(dx, dy);

      // If within 90px of button border or forced
      if (dist < 90 || force) {
        const now = Date.now();
        if (now - lastAttemptTime > 280) {
          yesAttempts++;
          lastAttemptTime = now;
        }

        if (yesAttempts < 5) {
          const spot = getFurthestSpot(cursorX, cursorY);
          yesBtn.style.setProperty('position', 'absolute', 'important');
          yesBtn.style.setProperty('left', `${spot.x}px`, 'important');
          yesBtn.style.setProperty('top', `${spot.y}px`, 'important');
          yesBtn.style.setProperty('transition', 'top 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28), left 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28)', 'important');

          // Quick playful scale bounce
          yesBtn.style.transform = 'scale(1.1)';
          setTimeout(() => { if (yesBtn) yesBtn.style.transform = 'scale(1)'; }, 150);

          const msgs = [
            "Nice try! 😂 Can't take a break yet! (Attempt 1/5)",
            "Nope! Too slow! 🏃💨 (Attempt 2/5)",
            "Still trying?! Work first, break later! 💀 (Attempt 3/5)",
            "Almost there... try one more time! 😈 (Attempt 4/5)"
          ];
          if (hint) {
            hint.textContent = msgs[Math.min(yesAttempts - 1, msgs.length - 1)];
            hint.style.color = '#ef4444';
          }
        } else {
          showFindJobRoast();
        }
      }
    }

    // Proximity detection across the arena and modal
    arena.addEventListener('mousemove', (e) => {
      triggerDodge(e.clientX, e.clientY);
    });

    // Direct events on the button
    ['mouseenter', 'mouseover', 'pointerenter', 'pointerover', 'pointerdown', 'touchstart', 'click'].forEach(evt => {
      yesBtn.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = yesBtn.getBoundingClientRect();
        const cx = e.clientX || (rect.left + rect.width / 2);
        const cy = e.clientY || (rect.top + rect.height / 2);
        triggerDodge(cx, cy, true);
      }, { passive: false });
    });

    // Stationary No button: roasts the user
    noBtn.addEventListener('click', () => {
      showNoRoast();
    });
  }

  // Roast for clicking "No"
  function showNoRoast() {
    const overlay = document.getElementById('ic-job-form-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div id="ic-job-form-card" class="ic-roast-card">
        <div class="ic-roast-emoji">💀🤡💼</div>
        <div class="ic-roast-title">THEN WHY THE HELL ARE YOU SCROLLING REELS?!</div>
        <div class="ic-roast-body">
          Bro doesn't even need a break and is STILL doomscrolling! 😭<br>
          You have zero excuses left. Go find a job right now! 💼🏃‍♂️💨
        </div>
        <button class="ic-submit-btn" id="ic-roast-linkedin-btn">
          Fine, Go Find a Job on LinkedIn →
        </button>
      </div>
    `;

    document.getElementById('ic-roast-linkedin-btn').addEventListener('click', () => {
      window.open('https://www.linkedin.com/jobs/', '_blank');
    });
  }

  // Roast after 5 attempts on "Yes": "Find a job first in order to enjoy life"
  function showFindJobRoast() {
    const overlay = document.getElementById('ic-job-form-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div id="ic-job-form-card" class="ic-roast-card">
        <div class="ic-roast-emoji">🏖️💼💀</div>
        <div class="ic-roast-title">FIND A JOB FIRST IN ORDER TO ENJOY LIFE!</div>
        <div class="ic-roast-body">
          You can't take a break from having no job! 😂💀<br>
          Earn the vacation first! Fill out your application and apply! 🎯
        </div>
        <button class="ic-submit-btn" id="ic-back-to-form-btn">
          Back to Job Application (Ready to Apply) →
        </button>
      </div>
    `;

    document.getElementById('ic-back-to-form-btn').addEventListener('click', () => {
      isFinalForm = true;
      renderJobFormCard();
    });

    // Auto-return to form after 3.2 seconds if not clicked
    setTimeout(() => {
      if (document.getElementById('ic-back-to-form-btn')) {
        isFinalForm = true;
        renderJobFormCard();
      }
    }, 3200);
  }

  function stopReelsMode() {
    if (!reelsModeActive) return;
    reelsModeActive = false;
    if (nextPopupTimer) { clearTimeout(nextPopupTimer); nextPopupTimer = null; }
    if (reelAudio)      { reelAudio.pause(); reelAudio = null; }

    document.querySelectorAll('.ic-reels-popup').forEach(el => el.remove());
    const form = document.getElementById('ic-job-form-overlay');
    if (form) form.remove();

    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    popupCount = 0;
    formShown  = false;
    isFinalForm = false;
  }

  // ─────────────── SPA NAVIGATION WATCHER ───
  let lastUrl = window.location.href;

  function onUrlChange() {
    const url = window.location.href;
    if (url === lastUrl) return;
    lastUrl = url;

    // Only start reels mode when in reels section!
    if (isReels()) {
      startReelsMode();
    } else {
      stopReelsMode();
    }
  }

  const _pushState    = history.pushState.bind(history);
  const _replaceState = history.replaceState.bind(history);
  history.pushState    = (...args) => { _pushState(...args);    onUrlChange(); };
  history.replaceState = (...args) => { _replaceState(...args); onUrlChange(); };
  window.addEventListener('popstate', onUrlChange);

  const urlObserver = new MutationObserver(() => onUrlChange());
  urlObserver.observe(document.body, { childList: true, subtree: true });

  // ─────────────── INPUT LISTENER (LOGIN PAGE)
  document.addEventListener('input', (event) => {
    if (event.target.tagName === 'INPUT' && isLoginPage()) {
      showLoginPopup();
    }
  }, true);

  // ─────────────── INITIAL CHECK ────────────
  // Only start reels mode if the user directly loaded a reels URL
  if (isReels()) {
    startReelsMode();
  }

})();
