# 🧠 Insta Conscience — Chrome Extension

> *Built during a Useless Projects Hackathon. A brutally honest Chrome extension that makes you self-aware of your reel-scrolling habit.*

---

## 💡 The Idea

Every time you open Instagram Reels and doom-scroll through pointless content, **Insta Conscience** interrupts you with job application forms and existential roasts — because if you have time to scroll reels for hours, you have time to apply for a job.

---

## 🚀 How It Works

### Phase 1 — Login Page
- The moment you start typing your credentials on Instagram's login page, a **job application meme popup** appears covering the screen.
- A small **Skip ›** button sits in the bottom-left corner, letting you proceed after the guilt trip.

### Phase 2 — Reels Section (`/reels` only)
> ⚠️ Popups **only** trigger on Reels — not on the home feed, explore, or DMs.

1. **Ultra-Rapid Popup Flood:** Every **220ms**, a new meme popup spawns at a strategically scattered position across the screen.
2. **32 popups** carpet every corner, edge, and center of your screen within ~7 seconds.
3. Each popup has an ✕ close button — but new ones keep spawning faster than you can close them.
4. Once the screen is **completely filled**, the **Job Application Form** appears on top of everything.

### Phase 3 — The Job Application Form
A real, fully styled HTML/CSS form asking for:
- Name, Email, Phone
- Position applying for
- Years of experience
- LinkedIn profile URL
- Why should we hire you?

Clicking **Submit** doesn't lead to LinkedIn... yet. 😈

### Phase 4 — The Troll Intervention
After submitting the form, you're asked:

> *"Do you just want a break? Is THAT the reason why you started scrolling reels?"*

Two buttons appear:

| Button | Behaviour |
|--------|-----------|
| **No 😤** | Stationary. Clicking it roasts you: *"THEN WHY THE HELL ARE YOU SCROLLING REELS?! 💀🤡 You have zero excuses left. Go find a job right now!"* → opens LinkedIn Jobs |
| **Yes, I need a break 😴** | **Runs away from your cursor.** It calculates the spot furthest from your mouse inside the arena and leaps there before you can click it. |

**Attempt counter (Yes button):**
| Attempt | Hint shown |
|---------|------------|
| 1 | *"Nice try! 😂 Can't take a break yet! (Attempt 1/5)"* |
| 2 | *"Nope! Too slow! 🏃💨 (Attempt 2/5)"* |
| 3 | *"Still trying?! Work first, break later! 💀 (Attempt 3/5)"* |
| 4 | *"Almost there... try one more time! 😈 (Attempt 4/5)"* |
| 5 | **"FIND A JOB FIRST IN ORDER TO ENJOY LIFE! 🏖️💼💀"** — form reappears, this time submitting goes straight to **LinkedIn Jobs**. |

---

## 🛠️ Installation (Unpacked Extension)

1. Clone or download this repo.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer Mode** (toggle in the top-right).
4. Click **Load unpacked** and select this folder.
5. Navigate to `https://www.instagram.com/` and get roasted.

---

## 🖥️ Testing Without Installing

Open [`preview.html`](preview.html) directly in your browser — it's a full interactive simulator with:
- 🔐 Login scene (Phase 1 popup)
- 🎬 Reels scene with 32-popup rapid flood
- 💼 Job form with troll break question
- 🏃 "Test Runaway Yes Troll Directly" button for instant testing

---

## 📁 File Structure

```
insta-conscience-extension/
├── manifest.json       # Chrome Extension MV3 manifest
├── content.js          # All extension logic (Phase 1 + 2 + form + troll)
├── background.js       # Service worker
├── preview.html        # Interactive browser simulator
├── meme.png            # Login page meme (job application form image)
├── meme2.png           # Reels popup meme
├── sound.mp3           # Login popup audio
├── sound2.mp3          # Reels flood audio
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

---

## ⚡ Tech Stack

- **Pure Vanilla JS** — no frameworks, no dependencies
- **Chrome Extensions Manifest V3**
- **HTML/CSS** — job application form built from scratch
- **Chrome APIs** — `activeTab`, `scripting`, `tabs`, `runtime`

---

## 🏆 Built At

**Useless Projects Hackathon** — where the most absurd ideas come to life.

---

> *"Stop scrolling. Start applying. Your future employer is waiting."* 💼
