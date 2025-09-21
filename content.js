// UMD Canvas Grades + GPA 
// Authors: Zishan Vahora & Mostafa Elamin
// Purpose: In order to make tracking your grades and GPA easier, with just a quick display!

/* THEME */
const UMD_THEME = `
  :root {
    --umd-red: #E21833;
    --umd-gold: #FFD200;
    --paper: #FFFFFF;
    --ink: #0F172A;
    --muted: #6B7280;
    --ok: #059669;
    --warn: #B45309;
    --shadow: 0 6px 18px rgba(0,0,0,.16);
  }

  /* Badge at top-right of the Canvas card header */
  .umd-grade-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    font-size: 12px;
    font-weight: 800;
    background: linear-gradient(135deg, var(--umd-gold), #FFE55E);
    color: #7A0019;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid rgba(0,0,0,.08);
    box-shadow: var(--shadow);
    letter-spacing: .25px;
    transition: transform .18s ease, box-shadow .18s ease;
    user-select: none;
  }
  .umd-grade-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(0,0,0,.2);
  }

  /* GPA widget (button + bigger panel) */
  .umd-gpa-fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
  }
  .umd-gpa-fab button {
    all: unset;
    cursor: pointer;
    background: linear-gradient(135deg, var(--umd-red), #9C1426);
    color: white;
    padding: 12px 16px;
    border-radius: 999px;
    box-shadow: var(--shadow);
    font-weight: 900;
    letter-spacing: .3px;
  }
  .umd-gpa-panel {
    position: fixed;
    bottom: 88px;
    right: 24px;
    width: min(900px, 96vw);   /* wider */
    max-height: 86vh;          /* taller */
    overflow: auto;
    z-index: 99999;
    background: var(--paper);
    color: var(--ink);
    border-radius: 16px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(0,0,0,.08);
  }
  .umd-gpa-head {
    padding: 14px 16px;
    background: linear-gradient(135deg, var(--umd-gold), #FFE55E);
    border-bottom: 1px solid rgba(0,0,0,.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
  .umd-gpa-title { font-weight: 900; color: #7A0019 }
  .umd-gpa-body { padding: 14px 16px; }
  .umd-gpa-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .umd-gpa-table th, .umd-gpa-table td {
    padding: 10px 8px;
    border-bottom: 1px dashed rgba(0,0,0,.08);
    text-align: left;
    vertical-align: middle;
  }
  .umd-chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 800;
    font-size: 12px;
    letter-spacing: .2px;
  }
  .chip-ok  { background: rgba(5,150,105,.10); color: #065F46; border: 1px solid rgba(5,150,105,.25); }
  .chip-warn{ background: rgba(180,83,9,.10); color: #92400E; border: 1px solid rgba(180,83,9,.25); }

  .umd-gpa-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px 16px;
    gap: 12px;
  }
  .umd-gpa-actions { display: flex; gap: 8px; }
  .umd-btn { all: unset; cursor: pointer; background: #111827; color: #fff; padding: 10px 14px; border-radius: 12px; font-weight: 800; }
  .umd-btn.secondary { background: #374151; }
  .umd-muted { color: var(--muted); }

  .umd-form-row { display:flex; gap:8px; align-items:center; margin-top:10px; flex-wrap:wrap; }
  .umd-form-row input[type="text"], .umd-form-row input[type="number"] {
    padding: 8px 10px; border-radius: 10px; border: 1px solid rgba(0,0,0,.15);
  }
  .umd-pill { padding: 2px 8px; border-radius:999px; border:1px solid rgba(0,0,0,.1); font-size:12px; }
`;

(function ensureThemeMounted(){
  if (!document.querySelector("#umd-theme-vars")) {
    const s = document.createElement("style");
    s.id = "umd-theme-vars";
    s.textContent = UMD_THEME;
    document.head.appendChild(s);
  }
})();

/* USER ID HELPER */
// Provided by your findID.js; we call its global to avoid duplicating logic.
function getCanvasUserId() {
  if (typeof window.getCurrentUserId === 'function') return window.getCurrentUserId();
  return null;
}

/* GRADE FETCH: Canvas enrollments API */
async function fetchGradeForCourse(courseId) {
  const userId = getCanvasUserId();
  if (!userId) return 'N/A';
  try {
    const res = await fetch(`/api/v1/users/${userId}/enrollments?per_page=100`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`Canvas API ${res.status}`);
    const data = await res.json();
    const enr = data.find(e => e.grades && String(e.course_id) === String(courseId));
    if (!enr) return 'N/A';
    const raw = enr.grades.current_score ?? enr.grades.final_score;
    const pct = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(pct) ? Math.round(pct * 100) / 100 : 'N/A';
  } catch (e) {
    console.error('Grade fetch failed:', e);
    return 'N/A';
  }
}

/* GPA MAPPINGS */
function letterFromPercent(p) {
  if (!Number.isFinite(p)) return 'N/A';
  if (p >= 97) return 'A+';
  if (p >= 93) return 'A';
  if (p >= 90) return 'A-';
  if (p >= 87) return 'B+';
  if (p >= 83) return 'B';
  if (p >= 80) return 'B-';
  if (p >= 77) return 'C+';
  if (p >= 73) return 'C';
  if (p >= 70) return 'C-';
  if (p >= 67) return 'D+';
  if (p >= 63) return 'D';
  if (p >= 60) return 'D-';
  return 'F';
}
function pointsFromLetter(L) {
  const map = { 'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D+':1.3,'D':1.0,'D-':0.7,'F':0.0 };
  return map[L] ?? NaN;
}

/*  BADGE INJECTION ON DASHBOARD CARDS */
async function addGradesToDashboard() {
  if (!location.hostname.includes('umd.instructure.com')) return;
  await new Promise(r => setTimeout(r, 800)); // let dashboard render

  const cards = document.querySelectorAll('.ic-DashboardCard,[data-testid="DashboardCard"],.dashboard-card');
  const courses = []; // collected for GPA widget

  for (const card of cards) {
    const link = card.querySelector('.ic-DashboardCard__link, a[href*="/courses/"]');
    const titleNode = card.querySelector('.ic-DashboardCard__header-title, .ellipsible, h2, h3');
    const header = card.querySelector('.ic-DashboardCard__header') || card;
    if (!link || !header) continue;

    const m = link.href.match(/courses\/(\d+)/);
    const courseId = m ? m[1] : null;
    if (!courseId) continue;

    const percent = await fetchGradeForCourse(courseId);
    const name = (titleNode?.textContent || `Course ${courseId}`).trim();

    // anchor our absolute-positioned badge
    header.style.position = 'relative';
    header.querySelectorAll('.umd-grade-badge').forEach(n => n.remove()); // avoid dupes

    const badge = document.createElement('div');
    badge.className = 'umd-grade-badge';
    badge.textContent = Number.isFinite(percent) ? `${percent}%` : 'N/A';
    header.appendChild(badge);

    courses.push({ id: courseId, name, percent });
  }

  mountGpaWidget(courses);
}

/* GPA WIDGET + STORAGE */
function keyScope(suffix) {
  const uid = getCanvasUserId() || 'anonymous';
  return `umd-gpa-${suffix}-${uid}`;
}
function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || '') ?? fallback; }
  catch { return fallback; }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function mountGpaWidget(courseRows) {
  if (document.querySelector('.umd-gpa-fab')) return;

  const fabWrap = document.createElement('div');
  fabWrap.className = 'umd-gpa-fab';
  const fab = document.createElement('button');
  fab.textContent = 'GPA';
  fabWrap.appendChild(fab);

  const panel = document.createElement('div');
  panel.className = 'umd-gpa-panel';
  panel.style.display = 'none';
  panel.innerHTML = `
    <div class="umd-gpa-head">
      <div class="umd-gpa-title">GPA Calculator (unofficial)</div>
      <button class="umd-btn secondary" data-close>Close</button>
    </div>
    <div class="umd-gpa-body">
      <table class="umd-gpa-table">
        <thead>
          <tr>
            <th style="width:30%">Course</th>
            <th style="width:12%">Percent</th>
            <th style="width:10%">Letter</th>
            <th style="width:12%">Credits</th>
            <th style="width:10%">Exclude</th>
            <th style="width:14%">Pts × Cr</th>
            <th style="width:12%">Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      <div class="umd-form-row" style="margin-top:12px">
        <span class="umd-pill">Add What-If Class</span>
        <input type="text" placeholder="Class name" id="umd-add-name" />
        <input type="number" step="0.1" min="0" max="100" placeholder="Percent" id="umd-add-pct" />
        <input type="number" step="0.5" min="0" placeholder="Credits" id="umd-add-cr" />
        <button class="umd-btn" id="umd-add-btn">Add</button>
      </div>

      <p class="umd-muted" style="margin-top:8px">
        Tip: Toggle <b>Exclude</b> to remove a class from GPA. Add "What-If" rows to try scenarios.
      </p>
    </div>
    <div class="umd-gpa-foot">
      <div id="umd-gpa-summary" class="umd-chip chip-ok">GPA: —</div>
      <div class="umd-gpa-actions">
        <button class="umd-btn" data-recalc>Recalculate</button>
        <button class="umd-btn secondary" data-reset>Reset</button>
      </div>
    </div>
  `;

  document.body.appendChild(fabWrap);
  document.body.appendChild(panel);

  fab.addEventListener('click', () => {
    panel.style.display = (panel.style.display === 'none' ? 'block' : 'none');
  });
  panel.querySelector('[data-close]')?.addEventListener('click', () => {
    panel.style.display = 'none';
  });

  const tbody = panel.querySelector('tbody');

  // persisted state
  const credits = loadJSON(keyScope('credits'), {});   // { courseId: credits }
  const excludes = loadJSON(keyScope('excludes'), {}); // { courseId: true/false }
  const customs  = loadJSON(keyScope('customs'), []);  // [ { id, name, percent, credits, excluded } ]

  // build a row (Canvas or custom)
  function mkRow(row, opts) {
    const isCustom = opts?.custom === true;
    const id = row.id;
    const name = row.name;
    const percent = Number.isFinite(row.percent) ? row.percent : (isCustom ? row.percent : NaN);
    const letter = letterFromPercent(percent);
    const defaultCr = isCustom ? (row.credits ?? 3) : (credits[id] ?? 3);
    const excluded = !!(isCustom ? row.excluded : excludes[id]);

    const tr = document.createElement('tr');
    tr.dataset.id = id;
    tr.dataset.custom = isCustom ? '1' : '0';
    tr.innerHTML = `
      <td title="${name}">${name}</td>
      <td>${Number.isFinite(percent) ? percent + '%' : 'N/A'}</td>
      <td>${Number.isFinite(percent) ? letter : 'N/A'}</td>
      <td><input type="number" step="0.5" min="0" value="${defaultCr}" class="umd-cr" style="width:72px; padding:6px 8px; border-radius:8px; border:1px solid rgba(0,0,0,.15)"></td>
      <td><input type="checkbox" class="umd-ex" ${excluded ? 'checked' : ''}></td>
      <td class="umd-pxc">—</td>
      <td>${isCustom ? '<button class="umd-btn secondary umd-del">Delete</button>' : '<span class="umd-muted">Canvas</span>'}</td>
    `;
    tbody.appendChild(tr);
  }

  // real Canvas courses
  courseRows.forEach(r => mkRow(r));
  // previously saved custom rows
  customs.forEach(c => {
    if (!c.id) c.id = 'custom-' + Math.random().toString(36).slice(2,9);
    mkRow(c, { custom:true });
  });

  // add a new custom row
  panel.querySelector('#umd-add-btn')?.addEventListener('click', () => {
    const name = panel.querySelector('#umd-add-name').value.trim() || 'Custom Course';
    const pct = parseFloat(panel.querySelector('#umd-add-pct').value);
    const cr  = Math.max(0, parseFloat(panel.querySelector('#umd-add-cr').value || '3'));
    if (!Number.isFinite(pct)) { alert('Enter a valid percent (0–100)'); return; }

    const id = 'custom-' + Math.random().toString(36).slice(2,9);
    const row = { id, name, percent:pct, credits:cr, excluded:false };
    customs.push(row);
    saveJSON(keyScope('customs'), customs);
    mkRow(row, { custom:true });
    recalc();
  });

  // update credits/excludes; delete custom rows
  panel.addEventListener('input', (e) => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const id = tr.dataset.id;
    if (e.target.classList.contains('umd-cr')) {
      const v = Math.max(0, parseFloat(e.target.value || '0'));
      if (tr.dataset.custom === '1') {
        const obj = customs.find(x => x.id === id); if (obj) obj.credits = v;
        saveJSON(keyScope('customs'), customs);
      } else {
        credits[id] = v; saveJSON(keyScope('credits'), credits);
      }
      recalc();
    }
    if (e.target.classList.contains('umd-ex')) {
      const excluded = e.target.checked;
      if (tr.dataset.custom === '1') {
        const obj = customs.find(x => x.id === id); if (obj) obj.excluded = excluded;
        saveJSON(keyScope('customs'), customs);
      } else {
        excludes[id] = excluded; saveJSON(keyScope('excludes'), excludes);
      }
      recalc();
    }
  });
  panel.addEventListener('click', (e) => {
    if (e.target.classList.contains('umd-del')) {
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      const idx = customs.findIndex(x => x.id === id);
      if (idx >= 0) {
        customs.splice(idx, 1);
        saveJSON(keyScope('customs'), customs);
        tr.remove();
        recalc();
      }
    }
  });

  // compute GPA
  function recalc() {
    let sumPxC = 0, sumC = 0;
    tbody.querySelectorAll('tr').forEach(tr => {
      const pctStr = tr.children[1].textContent.replace('%','').trim();
      const pct = parseFloat(pctStr);
      const L = letterFromPercent(pct);
      const P = pointsFromLetter(L);
      const cr = Math.max(0, parseFloat(tr.querySelector('.umd-cr')?.value || '0'));
      const excluded = tr.querySelector('.umd-ex')?.checked;

      const pxcCell = tr.querySelector('.umd-pxc');
      const pxc = (Number.isFinite(P) && !excluded) ? P * cr : 0;
      pxcCell.textContent = (!excluded && Number.isFinite(P)) ? pxc.toFixed(2) : '—';

      if (!excluded && Number.isFinite(P)) {
        sumPxC += pxc;
        sumC += cr;
      }
    });
    const gpa = sumC > 0 ? (sumPxC / sumC) : 0;
    const chip = panel.querySelector('#umd-gpa-summary');
    chip.textContent = `GPA: ${sumC > 0 ? gpa.toFixed(3) : '—'}`;
    chip.className = `umd-chip ${gpa >= 3.5 ? 'chip-ok' : 'chip-warn'}`;
  }

  panel.querySelector('[data-recalc]')?.addEventListener('click', recalc);

  panel.querySelector('[data-reset]')?.addEventListener('click', () => {
    localStorage.removeItem(keyScope('credits'));
    localStorage.removeItem(keyScope('excludes'));
    localStorage.removeItem(keyScope('customs'));
    // quick refresh of the widget:
    panel.remove();
    document.querySelector('.umd-gpa-fab')?.remove();
    mountGpaWidget(courseRows);
  });

  recalc();
}

/* BOOT */
(function boot() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addGradesToDashboard);
  } else {
    addGradesToDashboard();
  }
})();
