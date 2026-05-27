/* ---------- State ---------- */
const state = {
  q: "",
  cat: "All",
  tags: new Set(),
  sort: "default",
  view: localStorage.getItem("projectsView") || "grid"
};

/* ---------- Helpers ---------- */
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function highlight(text, q) {
  if (!q) return escapeHTML(text);
  const safe = escapeHTML(text);
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(safeQ, "ig"), m => `<mark>${m}</mark>`);
}

const LINK_ICONS = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.55v-1.92c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.55C20.21 21.39 23.5 17.09 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>',
  live: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  demo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  paper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>'
};

/* ---------- Filter + sort ---------- */
function filterProjects() {
  const q = state.q.trim().toLowerCase();
  return PROJECTS.filter(p => {
    if (state.cat !== "All" && p.category !== state.cat) return false;
    if (state.tags.size > 0) {
      const tagSet = new Set((p.tags || []).map(t => t.toLowerCase()));
      for (const t of state.tags) if (!tagSet.has(t.toLowerCase())) return false;
    }
    if (q) {
      const hay = (p.title + " " + p.summary + " " + p.category + " " + (p.tags || []).join(" ") + " " + (p.role || "")).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function sortProjects(list) {
  const c = list.slice();
  switch (state.sort) {
    case "newest":   c.sort((a, b) => (b.year || 0) - (a.year || 0)); break;
    case "oldest":   c.sort((a, b) => (a.year || 0) - (b.year || 0)); break;
    case "name-asc": c.sort((a, b) => a.title.localeCompare(b.title)); break;
    case "featured": c.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    default:         break;
  }
  return c;
}

/* ---------- Render: summary tiles ---------- */
function renderSummary() {
  const el = document.getElementById("summary");
  const total = PROJECTS.length;
  const cats = new Set(PROJECTS.map(p => p.category));
  const tags = new Set();
  PROJECTS.forEach(p => (p.tags || []).forEach(t => tags.add(t)));
  const featured = PROJECTS.filter(p => p.featured).length;
  const latestYear = Math.max(...PROJECTS.map(p => p.year || 0));
  el.innerHTML = `
    <div class="summary-card"><p class="num">${total}</p><p class="lbl">Projects</p></div>
    <div class="summary-card"><p class="num">${cats.size}</p><p class="lbl">Categories</p></div>
    <div class="summary-card"><p class="num">${tags.size}</p><p class="lbl">Unique tags</p></div>
    <div class="summary-card"><p class="num">${featured}</p><p class="lbl">Featured</p></div>
    <div class="summary-card"><p class="num">${latestYear}</p><p class="lbl">Latest project</p></div>
  `;
}

/* ---------- Render: category chips ---------- */
function renderCategoryChips() {
  const el = document.getElementById("categoryChips");
  const cats = ["All", ...Array.from(new Set(PROJECTS.map(p => p.category)))];
  el.innerHTML = cats.map(c => {
    const count = c === "All" ? PROJECTS.length : PROJECTS.filter(p => p.category === c).length;
    const active = state.cat === c ? "active" : "";
    return `<button class="chip ${active}" data-cat="${escapeHTML(c)}">
      ${escapeHTML(c)} <span class="count">${count}</span>
    </button>`;
  }).join("");
}

/* ---------- Render: tag filter (top tags) ---------- */
function renderTagFilter() {
  const el = document.getElementById("tagChips");
  const freq = {};
  PROJECTS.forEach(p => (p.tags || []).forEach(t => freq[t] = (freq[t] || 0) + 1));
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 12);
  el.innerHTML = `<span class="filter-label">Popular tags</span>` + top.map(([t, c]) => {
    const active = state.tags.has(t) ? "active" : "";
    return `<button class="chip ${active}" data-tag="${escapeHTML(t)}">
      ${escapeHTML(t)} <span class="count">${c}</span>
    </button>`;
  }).join("");
}

/* ---------- Render: view toggle ---------- */
function renderViewToggle() {
  document.querySelectorAll("#viewToggle button").forEach(b => {
    b.classList.toggle("active", b.dataset.view === state.view);
  });
}

/* ---------- Render: project cards ---------- */
function thumbMarkup(thumb) {
  if (!thumb) return `<div class="project-thumb thumb-1" aria-hidden="true"></div>`;
  if (typeof thumb === "number") return `<div class="project-thumb thumb-${thumb}" aria-hidden="true"></div>`;
  if (typeof thumb === "string" && /^\d+$/.test(thumb)) return `<div class="project-thumb thumb-${thumb}" aria-hidden="true"></div>`;
  return `<div class="project-thumb"><img src="${escapeHTML(thumb)}" alt="" loading="lazy"></div>`;
}

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  const empty = document.getElementById("emptyState");
  const meta = document.getElementById("resultsMeta");

  const filtered = sortProjects(filterProjects());
  grid.className = "projects-grid" + (state.view === "list" ? " list-view" : "");

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    const q = state.q.trim();
    grid.innerHTML = filtered.map(p => {
      const tagsHTML = (p.tags || []).map(t => {
        const active = state.tags.has(t) ? "active" : "";
        return `<button class="tag ${active}" data-tag="${escapeHTML(t)}">${escapeHTML(t)}</button>`;
      }).join("");
      const links = (p.links || []).map(l => {
        const icon = LINK_ICONS[l.kind] || LINK_ICONS.live;
        const ext = /^https?:/.test(l.url);
        const target = ext ? ` target="_blank" rel="noopener"` : "";
        return `<a class="proj-link" href="${escapeHTML(l.url)}"${target}>${icon}${escapeHTML(l.label)}</a>`;
      });
      if (p.detail) {
        links.unshift(`<a class="proj-link" href="${escapeHTML(p.detail)}">${LINK_ICONS.live}View details →</a>`);
      }
      return `
        <article class="project-card ${p.featured ? "featured" : ""}">
          ${thumbMarkup(p.thumb)}
          <div class="project-body">
            <div class="project-meta">
              <span class="cat">${escapeHTML(p.category)}</span>
              <span class="dot"></span>
              <span>${escapeHTML(p.date || String(p.year || ""))}</span>
            </div>
            <h3 class="project-title">${p.detail ? '<a href="' + escapeHTML(p.detail) + '">' + highlight(p.title, q) + '</a>' : highlight(p.title, q)}</h3>
            <p class="project-summary">${highlight(p.summary, q)}</p>
            ${tagsHTML ? `<div class="project-tags">${tagsHTML}</div>` : ""}
            ${links.length ? `<div class="project-links">${links.join("")}</div>` : ""}
          </div>
        </article>
      `;
    }).join("");
  }

  const total = PROJECTS.length;
  const isFiltered = state.q || state.cat !== "All" || state.tags.size > 0;
  meta.innerHTML = isFiltered
    ? `Showing <strong>${filtered.length}</strong> of <strong>${total}</strong> projects`
    : `<strong>${total}</strong> projects total`;
  document.getElementById("clearAll").disabled = !isFiltered;
}

/* ---------- Bind ---------- */
function bind() {
  const searchInput = document.getElementById("searchInput");
  const searchWrap = searchInput.closest(".search-wrap");
  const clearBtn = document.getElementById("searchClear");

  searchInput.addEventListener("input", e => {
    state.q = e.target.value;
    searchWrap.classList.toggle("has-text", !!state.q);
    clearBtn.classList.toggle("visible", !!state.q);
    renderProjects();
  });
  clearBtn.addEventListener("click", () => {
    searchInput.value = ""; state.q = "";
    searchWrap.classList.remove("has-text");
    clearBtn.classList.remove("visible");
    searchInput.focus();
    renderProjects();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== searchInput && !e.metaKey && !e.ctrlKey) {
      e.preventDefault(); searchInput.focus(); searchInput.select();
    }
    if (e.key === "Escape" && document.activeElement === searchInput && state.q) {
      searchInput.value = ""; state.q = "";
      searchWrap.classList.remove("has-text");
      clearBtn.classList.remove("visible");
      renderProjects();
    }
  });

  document.getElementById("categoryChips").addEventListener("click", e => {
    const btn = e.target.closest("[data-cat]"); if (!btn) return;
    state.cat = btn.dataset.cat;
    renderCategoryChips(); renderProjects();
  });

  document.getElementById("tagChips").addEventListener("click", e => {
    const btn = e.target.closest("[data-tag]"); if (!btn) return;
    const t = btn.dataset.tag;
    if (state.tags.has(t)) state.tags.delete(t); else state.tags.add(t);
    renderTagFilter(); renderProjects();
  });

  document.getElementById("projectsGrid").addEventListener("click", e => {
    const btn = e.target.closest("[data-tag]"); if (!btn) return;
    e.preventDefault();
    const t = btn.dataset.tag;
    if (state.tags.has(t)) state.tags.delete(t); else state.tags.add(t);
    renderTagFilter(); renderProjects();
  });

  document.getElementById("sortSelect").addEventListener("change", e => {
    state.sort = e.target.value;
    renderProjects();
  });

  document.getElementById("viewToggle").addEventListener("click", e => {
    const btn = e.target.closest("[data-view]"); if (!btn) return;
    state.view = btn.dataset.view;
    localStorage.setItem("projectsView", state.view);
    renderViewToggle(); renderProjects();
  });

  document.getElementById("clearAll").addEventListener("click", () => {
    state.q = ""; state.cat = "All"; state.tags.clear();
    searchInput.value = "";
    searchWrap.classList.remove("has-text");
    clearBtn.classList.remove("visible");
    renderCategoryChips(); renderTagFilter(); renderProjects();
  });

  /* Theme */
  const themeBtn = document.getElementById("themeToggle");
  if (localStorage.getItem("theme") === "dark") document.documentElement.setAttribute("data-theme", "dark");
  themeBtn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "" : "dark";
    if (next) document.documentElement.setAttribute("data-theme", next);
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", next || "light");
  });

  /* Hamburger */
  const hamburger = document.getElementById("navHamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const navbar = hamburger.closest(".navbar");
      const open = navbar.classList.toggle("nav-open");
      hamburger.setAttribute("aria-expanded", String(open));
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCategoryChips();
  renderTagFilter();
  renderViewToggle();
  renderProjects();
  bind();
});
