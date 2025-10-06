# UMD Canvas Grades + GPA (Chrome Extension)


A extension that overlays **current grades** on your Canvas dashboard cards and adds a **unofficial GPA calculator** where you can edit credits per course and see your term GPA update live.


## Features
- Grade badges on each course card (UMD-styled, accessible, hover effects)
-  GPA Calculator panel with editable credits (defaults to 3.0) NOTE: IT IS A POP-UP IN THE BOTTOM RIGHT
-  Letter grades mapped from percentages; 4.0 scale conversion
-  Local persistence of credits per course (per user)
- 🛡 Zero external requests; only calls Canvas's own API while you're logged in

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
- Live video of the project here <https://devpost.com/software/ezcanvasdisplay>

## Notes & Caveats
- Different schools or dashboard layouts may use different DOM structures
- Letter/point mapping follows a common US scale—adjust in `content.js` if your program uses different cutoffs.
- the point section in the GPA calculator doesnt represent the number of credits, it is just there to help calculate your actual GPA. Only the Credit section represents the amount of credits the class is.

## Dev Tips
- If nothing shows up, just open DevTools, then Console and look for logs.
- Make sure the dashboard is in **Card View**.
