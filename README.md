# UMD Canvas Grades + GPA (Chrome Extension)

A lightweight extension that overlays **current grades** on your Canvas dashboard cards and adds a slick, **unofficial GPA calculator** where you can edit credits per course and see your term GPA update live.

> ⚠️ This reads your grades directly from Canvas while you're logged in and **never sends data anywhere**. All credit inputs are saved only to your browser `localStorage` so they'll be there next time.

## Features
- 🎯 Grade badges on each course card (UMD-styled, accessible, hover effects)
- 🧮 GPA Calculator panel with editable credits (defaults to 3.0)
- 🔠 Letter grades mapped from percentages; 4.0 scale conversion
- 💾 Local persistence of credits per course (per user)
- 🛡️ Zero external requests; only calls Canvas's own API while you're logged in

## Install (Developer Mode)
1. Download this folder to your computer.
2. Open `chrome://extensions` and toggle **Developer mode** (top right).
3. Click **Load unpacked** and select this folder.
4. Navigate to <https://umd.instructure.com/> and ensure your dashboard is in **Card View**.
5. You should see grades appear on course cards. Click the **GPA** button in the bottom-right to open the calculator.

## How it works (High-level)
- We locate your Canvas user id by scanning the inline `ENV` blob present on the page (see `findID.js`). Then we hit the Canvas API endpoint:
  - `/api/v1/users/{userId}/enrollments?per_page=50`
- For each dashboard card, we find its `courseId`, fetch the corresponding enrollment, and show your **current** or **final** score if available.
- We also build a GPA table with percent → letter → points mapping. You can edit credits per course and the GPA updates live.

## Privacy
- No analytics, no external calls, no storage outside your browser.
- Credits are cached to `localStorage` under a key namespaced by your Canvas user id.

## Notes & Caveats
- This is **unofficial** and for personal use only.
- Different schools or dashboard layouts may use different DOM structures; we try multiple selectors but Canvas UI can change.
- Letter/point mapping follows a common US scale—adjust in `content.js` if your program uses different cutoffs.

## Dev Tips
- If nothing shows, open DevTools → Console and look for logs.
- Ensure the dashboard is in **Card View**.
- You can tweak the theme colors quickly by editing the CSS variables near the top of `content.js`.

## Credits
- Based on earlier content and helpers in the original scripts (`content.js`, `findID.js`, and `manifest.json`) and README guidance.