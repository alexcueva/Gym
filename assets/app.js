(function () {
  "use strict";

  const DATA = ROUTINE_DATA;

  const PROFILES = {
    mujer: {
      key: "mujer",
      name: "Lluvia",
      icon: "🙋‍♀️",
      accentVar: "--accent-mujer",
      accentSoftVar: "--accent-mujer-soft",
      accentInkVar: "--accent-ink-mujer",
      gymName: "Planet Fitness",
      gymLocation: "Corvallis, Oregon · EE. UU.",
    },
    hombre: {
      key: "hombre",
      name: "Alex",
      icon: "🙋‍♂️",
      accentVar: "--accent-hombre",
      accentSoftVar: "--accent-hombre-soft",
      accentInkVar: "--accent-ink-hombre",
      gymName: "Su gimnasio",
      gymLocation: "Pendiente de confirmar",
    },
  };

  const state = {
    screen: "profile", // profile | category | routine
    profile: null,
    category: null,
    tab: null,
  };

  const app = document.getElementById("app");
  const modal = document.getElementById("video-modal");
  const videoFrame = document.getElementById("video-frame");

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function setAccent(profileKey) {
    const p = PROFILES[profileKey];
    const root = document.documentElement;
    document.body.classList.toggle("theme-mujer", profileKey === "mujer");
    if (!p) {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-soft");
      root.style.removeProperty("--accent-ink");
      return;
    }
    root.style.setProperty("--accent", `var(${p.accentVar})`);
    root.style.setProperty("--accent-soft", `var(${p.accentSoftVar})`);
    root.style.setProperty("--accent-ink", `var(${p.accentInkVar})`);
  }

  function go(screen, extra) {
    state.screen = screen;
    if (extra) Object.assign(state, extra);
    render();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function render() {
    if (state.screen === "profile") return renderProfileScreen();
    if (state.screen === "category") return renderCategoryScreen();
    if (state.screen === "routine") return renderRoutineScreen();
  }

  // ---------------- Profile screen ----------------
  function renderProfileScreen() {
    setAccent(null);
    app.innerHTML = `
      <div class="hero">
        <div class="hero__badge">Rutinas Gym</div>
        <h1>¿Quién va a<br>entrenar hoy?</h1>
        <p>Elige tu perfil para ver tu rutina, con ejemplos ilustrados y video de cada ejercicio.</p>
      </div>
      <div class="profile-grid">
        ${Object.values(PROFILES).map(profileCardHtml).join("")}
      </div>
      <p class="footnote">Los ejercicios se generan a partir de rutinas ya diseñadas. Puedes cambiar de perfil cuando quieras.</p>
    `;
    Object.values(PROFILES).forEach((p) => {
      document.getElementById(`profile-${p.key}`).addEventListener("click", () => {
        go("category", { profile: p.key });
      });
    });
  }

  function profileCardHtml(p) {
    return `
      <button id="profile-${p.key}" class="profile-card profile-card--${p.key}">
        <div class="profile-card__icon">${p.icon}</div>
        <div class="profile-card__body">
          <p class="profile-card__name">${esc(p.name)}</p>
          <p class="profile-card__meta">📍 ${esc(p.gymName)} · ${esc(p.gymLocation)}</p>
        </div>
        <div class="profile-card__chev">›</div>
      </button>
    `;
  }

  // ---------------- Category screen ----------------
  function renderCategoryScreen() {
    const profile = PROFILES[state.profile];
    setAccent(state.profile);
    const cats = DATA.categories;
    const fullBody = cats.find((c) => c.key === "fullbody");
    const rest = cats.filter((c) => c.key !== "fullbody");

    app.innerHTML = `
      ${topbarHtml({
        title: profile ? profile.name : "Elige",
        eyebrow: profile ? `${profile.gymName}` : "",
        showBack: true,
        showProfile: true,
        profileIcon: profile ? profile.icon : "🏋️",
      })}
      <div class="section-label">¿Qué quieres entrenar hoy?</div>
      <div class="cat-grid">
        ${fullBody ? catCardHtml(fullBody, true) : ""}
        ${rest.map((c) => catCardHtml(c, false)).join("")}
      </div>
      <div class="bottom-nav">
        <button class="link-btn" id="switch-profile">Cambiar de perfil</button>
      </div>
    `;

    document.getElementById("back-btn")?.addEventListener("click", () => go("profile"));
    document.getElementById("switch-profile")?.addEventListener("click", () => go("profile"));
    cats.forEach((c) => {
      document.getElementById(`cat-${c.key}`)?.addEventListener("click", () => {
        go("routine", { category: c.key, tab: null });
      });
    });
  }

  function catCardHtml(c, isFull) {
    return `
      <button id="cat-${c.key}" class="cat-card ${isFull ? "cat-card--full" : ""}">
        <div class="cat-card__emoji">${c.emoji}</div>
        <div>
          <div class="cat-card__label">${esc(c.label)}</div>
          <div class="cat-card__count">${c.count} ejercicios</div>
        </div>
      </button>
    `;
  }

  // ---------------- Routine screen ----------------
  function renderRoutineScreen() {
    const profile = PROFILES[state.profile];
    const cat = DATA.categories.find((c) => c.key === state.category);
    const catData = DATA.exercises[state.category];
    const isTabbed = !!(catData && !Array.isArray(catData) && Array.isArray(catData.tabs));

    let tabs = [];
    let exercises = [];
    if (isTabbed) {
      tabs = catData.tabs;
      if (!state.tab || !tabs.some((t) => t.key === state.tab)) {
        state.tab = tabs[0].key;
      }
      exercises = catData.byTab[state.tab] || [];
    } else {
      exercises = catData || [];
    }
    setAccent(state.profile);

    app.innerHTML = `
      ${topbarHtml({
        title: cat ? cat.label : "Rutina",
        eyebrow: profile ? profile.name : "",
        showBack: true,
        showProfile: true,
        profileIcon: profile ? profile.icon : "🏋️",
        backTarget: "category",
      })}
      ${isTabbed ? tabBarHtml(tabs, state.tab) : ""}
      <div class="routine-summary">
        <span class="pill">${cat ? cat.emoji : ""} ${exercises.length} ejercicios</span>
        <span>3-4 series por ejercicio</span>
      </div>
      <div class="exercise-list">
        ${exercises.map((ex, i) => exerciseCardHtml(ex, i)).join("")}
      </div>
      <div class="credit">
        Imágenes de referencia e ideas de ejercicio vía <a href="https://musclewiki.com" target="_blank" rel="noopener">MuscleWiki</a>. Videos alojados en YouTube.
      </div>
      <div class="bottom-nav">
        <button class="link-btn" id="switch-cat">Elegir otro grupo muscular</button>
      </div>
    `;

    document.getElementById("back-btn")?.addEventListener("click", () => go("category"));
    document.getElementById("switch-cat")?.addEventListener("click", () => go("category"));

    if (isTabbed) {
      tabs.forEach((t) => {
        document.getElementById(`tab-${t.key}`)?.addEventListener("click", () => {
          if (state.tab === t.key) return;
          state.tab = t.key;
          render();
          window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
        });
      });
    }

    exercises.forEach((ex) => {
      const mainVideo = ex.videos && ex.videos[0];
      if (mainVideo) {
        document.getElementById(`play-${ex.id}`)?.addEventListener("click", () => openVideo(mainVideo.id));
      }
      (ex.videos || []).slice(1).forEach((v, idx) => {
        document.getElementById(`extra-${ex.id}-${idx}`)?.addEventListener("click", () => openVideo(v.id));
      });
    });
  }

  function tabBarHtml(tabs, activeKey) {
    return `
      <div class="tab-bar">
        ${tabs.map((t) => `
          <button class="tab-btn ${t.key === activeKey ? "tab-btn--active" : ""}" id="tab-${t.key}">${esc(t.label)}</button>
        `).join("")}
      </div>
    `;
  }

  function exerciseCardHtml(ex, i) {
    const mainVideo = ex.videos && ex.videos[0];
    const extraVideos = (ex.videos || []).slice(1);
    return `
      <div class="ex-card">
        <div class="ex-card__num">${i + 1}</div>
        <div class="ex-card__media">
          ${ex.image
            ? `<img src="${esc(ex.image)}" alt="${esc(ex.name)}" loading="lazy">`
            : `<div class="no-img">🏋️</div>`}
        </div>
        <div class="ex-card__body">
          <p class="ex-card__name">${esc(ex.name)}</p>
          ${ex.note ? `<p class="ex-card__note">${esc(ex.note)}</p>` : ""}
          <p class="ex-card__sr">${esc(ex.seriesReps)}</p>
          <div class="ex-card__actions">
            ${mainVideo ? `<button class="btn btn--video" id="play-${ex.id}">▶ Ver video</button>` : ""}
            ${ex.wikiUrl ? `<a class="btn btn--wiki" href="${esc(ex.wikiUrl)}" target="_blank" rel="noopener">📖 Ficha</a>` : ""}
          </div>
          ${extraVideos.length ? `
            <div class="extra-row">
              ${extraVideos.map((v, idx) => `<button class="btn btn--extra" id="extra-${ex.id}-${idx}">▶ Video ${idx + 2}</button>`).join("")}
            </div>` : ""}
        </div>
      </div>
    `;
  }

  // ---------------- Shared topbar ----------------
  function topbarHtml({ title, eyebrow, showBack, showProfile, profileIcon, backTarget }) {
    return `
      <div class="topbar">
        ${showBack ? `<button class="topbar__back" id="back-btn" aria-label="Regresar">‹</button>` : ""}
        <div class="topbar__title">
          ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
          <h1>${esc(title)}</h1>
        </div>
        ${showProfile ? `<div class="topbar__profile-chip">${profileIcon || ""}</div>` : ""}
      </div>
    `;
  }

  // ---------------- Video modal ----------------
  function openVideo(youtubeId) {
    videoFrame.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeVideo() {
    modal.hidden = true;
    videoFrame.src = "";
    document.body.style.overflow = "";
  }
  modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) closeVideo();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVideo();
  });

  // ---------------- Boot ----------------
  // Siempre inicia en la pantalla de selección de perfil.
  render();
})();
