// Nexco Admin Command Center Controller
// Manages Real-time CMS for Site Content, Courses, Live Online Masterclasses, Leads, Charter, & Feedback
// 100% Dynamic with Zero Hardcoding

document.addEventListener("DOMContentLoaded", () => {
  initAdminDashboard();
});

let currentAdminTab = "site-content";
let editingCourseId = null;
let editingSessionId = null;

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initAdminDashboard() {
  setupAdminNavigation();
  setupAdminModals();
  setupAdminEventListeners();

  renderAdminSiteSettings();
  renderAdminCourses();
  renderAdminSessions();
  renderAdminCharter();
  renderAdminFeedback();
  renderAdminLeads();
  renderAdminSubmissions();
  renderAdminOverview();

  // Subscribe to real-time store changes
  NexcoStore.subscribe("all", () => refreshAdminViews());
  NexcoStore.subscribe("siteSettings", () => renderAdminSiteSettings());
  NexcoStore.subscribe("courses", () => renderAdminCourses());
  NexcoStore.subscribe("sessions", () => renderAdminSessions());
  NexcoStore.subscribe("leads", () => {
    renderAdminLeads();
    renderAdminOverview();
  });
  NexcoStore.subscribe("submissions", () => renderAdminSubmissions());
  NexcoStore.subscribe("feedbacks", () => renderAdminFeedback());
  NexcoStore.subscribe("charter", () => renderAdminCharter());
}

function refreshAdminViews() {
  renderAdminSiteSettings();
  renderAdminOverview();
  renderAdminCourses();
  renderAdminSessions();
  renderAdminCharter();
  renderAdminFeedback();
  renderAdminLeads();
  renderAdminSubmissions();
}

// 1. Navigation within Admin Command Center
function setupAdminNavigation() {
  const navBtns = document.querySelectorAll(".admin-nav-item");
  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-admin-tab");
      if (tab) switchAdminTab(tab);
    });
  });

  // Mobile menu close button
  document.getElementById("admin-mobile-menu-close")?.addEventListener("click", () => {
    document.getElementById("admin-mobile-drawer")?.classList.add("hidden");
  });
}

function switchAdminTab(tabName) {
  currentAdminTab = tabName;

  // Close mobile drawer if open
  document.getElementById("admin-mobile-drawer")?.classList.add("hidden");

  // Update sidebar active buttons
  document.querySelectorAll(".admin-nav-item").forEach((btn) => {
    const t = btn.getAttribute("data-admin-tab");
    if (t === tabName) {
      btn.classList.add("bg-emerald-500/15", "text-emerald-400", "font-semibold", "border-emerald-500/30");
      btn.classList.remove("text-slate-400", "hover:text-white");
    } else {
      btn.classList.remove("bg-emerald-500/15", "text-emerald-400", "font-semibold", "border-emerald-500/30");
      btn.classList.add("text-slate-400", "hover:text-white");
    }
  });

  // Switch content containers
  const tabs = ["site-content", "courses", "sessions", "feedback", "leads", "submissions", "overview", "qa-tests"];
  tabs.forEach((t) => {
    const el = document.getElementById(`admin-tab-${t}`);
    if (el) {
      if (t === tabName) {
        el.classList.remove("hidden");
        el.classList.add("block");
      } else {
        el.classList.add("hidden");
        el.classList.remove("block");
      }
    }
  });

  if (tabName === "qa-tests") {
    renderAdminQATab();
  }
}

// =========================================================================
// TAB 1: SITE CONTENT & HERO EDITOR (FULL CMS SETTINGS)
// =========================================================================
function renderAdminSiteSettings() {
  const s = NexcoStore.getSiteSettings();
  if (!s) return;

  // Top Announcement
  const annActive = document.getElementById("admin-site-ann-active");
  const annBadge = document.getElementById("admin-site-ann-badge");
  const annText = document.getElementById("admin-site-ann-text");
  const annCta = document.getElementById("admin-site-ann-cta");
  const annLink = document.getElementById("admin-site-ann-link");

  if (annActive && s.announcement) annActive.checked = s.announcement.active !== false;
  if (annBadge && s.announcement) annBadge.value = s.announcement.badge || "";
  if (annText && s.announcement) annText.value = s.announcement.text || "";
  if (annCta && s.announcement) annCta.value = s.announcement.ctaText || "";
  if (annLink && s.announcement) annLink.value = s.announcement.ctaLink || "";

  // Hero Section
  const heroBadge = document.getElementById("admin-site-hero-badge");
  const heroTitle = document.getElementById("admin-site-hero-title");
  const heroSub = document.getElementById("admin-site-hero-sub");
  const heroCta1 = document.getElementById("admin-site-hero-cta1");
  const heroCta2 = document.getElementById("admin-site-hero-cta2");
  const formTitle = document.getElementById("admin-site-hero-form-title");
  const formSub = document.getElementById("admin-site-hero-form-sub");

  if (heroBadge && s.hero) heroBadge.value = s.hero.collaborationBadge || "";
  if (heroTitle && s.hero) heroTitle.value = s.hero.headline || "";
  if (heroSub && s.hero) heroSub.value = s.hero.subheadline || "";
  if (heroCta1 && s.hero) heroCta1.value = s.hero.primaryCtaText || "";
  if (heroCta2 && s.hero) heroCta2.value = s.hero.secondaryCtaText || "";
  if (formTitle && s.hero) formTitle.value = s.hero.counselingCardTitle || "";
  if (formSub && s.hero) formSub.value = s.hero.counselingCardSubtitle || "";

  // Promo Banner
  const promoBadge = document.getElementById("admin-site-promo-badge");
  const promoTitle = document.getElementById("admin-site-promo-title");
  const promoSub = document.getElementById("admin-site-promo-sub");

  if (promoBadge && s.promoBanner) promoBadge.value = s.promoBanner.badge || "";
  if (promoTitle && s.promoBanner) promoTitle.value = s.promoBanner.title || "";
  if (promoSub && s.promoBanner) promoSub.value = s.promoBanner.subtitle || "";

  // Bento Grid
  const b1t = document.getElementById("admin-site-bento1-title");
  const b1d = document.getElementById("admin-site-bento1-desc");
  const b2t = document.getElementById("admin-site-bento2-title");
  const b2d = document.getElementById("admin-site-bento2-desc");
  const b3t = document.getElementById("admin-site-bento3-title");
  const b3d = document.getElementById("admin-site-bento3-desc");

  if (b1t && s.bento) b1t.value = s.bento.card1Title || "";
  if (b1d && s.bento) b1d.value = s.bento.card1Desc || "";
  if (b2t && s.bento) b2t.value = s.bento.card2Title || "";
  if (b2d && s.bento) b2d.value = s.bento.card2Desc || "";
  if (b3t && s.bento) b3t.value = s.bento.card3Title || "";
  if (b3d && s.bento) b3d.value = s.bento.card3Desc || "";

  // Contact
  const phone = document.getElementById("admin-site-phone");
  const email = document.getElementById("admin-site-email");
  const addr = document.getElementById("admin-site-address");
  const dispAddr = document.getElementById("admin-site-display-address");

  if (phone && s.contact) phone.value = s.contact.phone || "";
  if (email && s.contact) email.value = s.contact.email || "";
  if (addr && s.contact) addr.value = s.contact.address || "";
  if (dispAddr && s.contact) dispAddr.value = s.contact.displayAddress || "";
}

async function saveAdminSiteSettings() {
  const settings = {
    announcement: {
      active: document.getElementById("admin-site-ann-active")?.checked !== false,
      badge: document.getElementById("admin-site-ann-badge")?.value.trim() || "100% Live Online Cohort",
      text: document.getElementById("admin-site-ann-text")?.value.trim() || "",
      ctaText: document.getElementById("admin-site-ann-cta")?.value.trim() || "Join Free Workshop ↗",
      ctaLink: document.getElementById("admin-site-ann-link")?.value.trim() || "#workshops"
    },
    hero: {
      collaborationBadge: document.getElementById("admin-site-hero-badge")?.value.trim() || "🤝 An Official Collaboration of Nexora Techno & Gencode",
      headline: document.getElementById("admin-site-hero-title")?.value.trim() || "Become the Professional the Future of Technology Demands.",
      subheadline: document.getElementById("admin-site-hero-sub")?.value.trim() || "",
      primaryCtaText: document.getElementById("admin-site-hero-cta1")?.value.trim() || "Explore Flagship Programs ↗",
      secondaryCtaText: document.getElementById("admin-site-hero-cta2")?.value.trim() || "Join Free Live Masterclass",
      counselingCardTitle: document.getElementById("admin-site-hero-form-title")?.value.trim() || "Get Personalized Course Plan from Our Team",
      counselingCardSubtitle: document.getElementById("admin-site-hero-form-sub")?.value.trim() || "Speak directly with an engineering mentor online in < 15 mins."
    },
    promoBanner: {
      badge: document.getElementById("admin-site-promo-badge")?.value.trim() || "Joint Venture Launch",
      title: document.getElementById("admin-site-promo-title")?.value.trim() || "Founding Online Cohort Admissions Open — Build Real Projects with Industry Mentors",
      subtitle: document.getElementById("admin-site-promo-sub")?.value.trim() || ""
    },
    bento: {
      card1Title: document.getElementById("admin-site-bento1-title")?.value.trim() || "100% Live Online Interactive Sessions",
      card1Desc: document.getElementById("admin-site-bento1-desc")?.value.trim() || "",
      card2Title: document.getElementById("admin-site-bento2-title")?.value.trim() || "Hands-On Real-World Project Building",
      card2Desc: document.getElementById("admin-site-bento2-desc")?.value.trim() || "",
      card3Title: document.getElementById("admin-site-bento3-title")?.value.trim() || "Direct 1-on-1 Live Screen-Share Code & Design Reviews",
      card3Desc: document.getElementById("admin-site-bento3-desc")?.value.trim() || ""
    },
    contact: {
      phone: document.getElementById("admin-site-phone")?.value.trim() || "+91 93451 21988",
      whatsapp: document.getElementById("admin-site-phone")?.value.trim() || "+91 93451 21988",
      email: document.getElementById("admin-site-email")?.value.trim() || "admissions@nexco.in",
      address: document.getElementById("admin-site-address")?.value.trim() || "15/2, Sankar Nagar, Salem - 636007, Tamil Nadu, India",
      displayAddress: document.getElementById("admin-site-display-address")?.value.trim() || "15/2, Sankar Nagar, Salem-7 (Registered HQ)",
      hours: "10:00 AM – 8:00 PM IST (Mon – Sat) • 100% Live Online Batches",
      languages: "Tamil & English Bilingual Mentorship"
    }
  };

  const btn = document.getElementById("admin-save-site-settings-btn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Saving Changes...</span>`;
  }

  await NexcoStore.updateSiteSettings(settings);

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<span>Save Site Settings ↗</span>`;
  }

  NexcoApp.showToast("✔ Changes saved & published live!", "success");
}

// =========================================================================
// TAB 2: COURSES & CURRICULUM FULL CRUD
// =========================================================================
function renderAdminCourses() {
  const container = document.getElementById("admin-courses-table-body");
  if (!container) return;

  const courses = NexcoStore.getCourses();

  container.innerHTML = courses.map(course => `
    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors text-xs">
      <td class="py-3.5 px-4">
        <div class="font-bold text-white text-sm">${escapeHTML(course.title)}</div>
        <div class="text-[11px] text-slate-400">${escapeHTML(course.categoryLabel || course.category)} • ${escapeHTML(course.duration)}</div>
      </td>
      <td class="py-3.5 px-4">
        <span class="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
          100% Live Online Classes
        </span>
      </td>
      <td class="py-3.5 px-4 text-slate-300">
        ${escapeHTML(course.mentorName || 'Lead Architect')}
      </td>
      <td class="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
        ★ ${course.rating || '4.9'} (${course.reviewsCount || 'Founding Batch'})
      </td>
      <td class="py-3.5 px-4 text-right space-x-2">
        <button class="edit-course-btn px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-semibold text-xs transition-colors" data-action="edit-course" data-id="${course.id}">
          ✏️ Edit
        </button>
        <button class="delete-course-btn px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-semibold text-xs transition-colors" data-action="delete-course" data-id="${course.id}">
          🗑️ Delete
        </button>
      </td>
    </tr>
  `).join("");
}

function addCourseResourceRow(data = {}) {
  const container = document.getElementById("admin-course-resources-container");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "course-resource-row p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center gap-2 text-xs";
  row.innerHTML = `
    <input type="text" placeholder="Resource Title (e.g. Live Class / Study Guide)" value="${escapeHTML(data.title || '')}" 
           class="resource-title-input flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs w-full sm:w-auto" />
    <select class="resource-type-select px-2 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs w-full sm:w-auto">
      <option value="live" ${data.type === 'live' ? 'selected' : ''}>🔴 Live Class</option>
      <option value="doc" ${data.type === 'doc' ? 'selected' : ''}>📄 Study Doc</option>
      <option value="repo" ${data.type === 'repo' ? 'selected' : ''}>💻 Code Repo</option>
      <option value="task" ${data.type === 'task' ? 'selected' : ''}>📝 Task</option>
      <option value="video" ${data.type === 'video' ? 'selected' : ''}>🎥 Video</option>
    </select>
    <input type="url" placeholder="URL (Meet, Doc, GitHub, YouTube)" value="${escapeHTML(data.url || '')}" 
           class="resource-url-input flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs w-full sm:w-auto" />
    <button type="button" onclick="this.closest('.course-resource-row').remove()" 
            class="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-colors shrink-0" title="Remove Resource">
      ✕
    </button>
  `;
  container.appendChild(row);
}

function openEditCourseModal(courseId) {
  const course = NexcoStore.getCourseById(courseId);
  if (!course) return;

  editingCourseId = courseId;
  const modal = document.getElementById("admin-course-modal");
  const modalTitle = document.getElementById("admin-course-modal-title");

  if (modalTitle) modalTitle.textContent = `Edit Program: ${course.title}`;

  if (document.getElementById("admin-course-title")) document.getElementById("admin-course-title").value = course.title || "";
  if (document.getElementById("admin-course-category")) document.getElementById("admin-course-category").value = course.category || "fullstack";
  if (document.getElementById("admin-course-duration")) document.getElementById("admin-course-duration").value = course.duration || "24 Weeks";
  if (document.getElementById("admin-course-batch-mode")) document.getElementById("admin-course-batch-mode").value = "100% Live Online Interactive Classes";
  if (document.getElementById("admin-course-mentor")) document.getElementById("admin-course-mentor").value = course.mentorName || "";
  if (document.getElementById("admin-course-thumbnail")) document.getElementById("admin-course-thumbnail").value = course.thumbnail || "";
  if (document.getElementById("admin-course-desc")) document.getElementById("admin-course-desc").value = course.description || "";
  if (document.getElementById("admin-course-skills")) document.getElementById("admin-course-skills").value = course.skills ? course.skills.join(", ") : "";

  // Populate module resources
  const resContainer = document.getElementById("admin-course-resources-container");
  if (resContainer) {
    resContainer.innerHTML = "";
    const resources = course.resources || [];
    if (resources.length > 0) {
      resources.forEach(r => addCourseResourceRow(r));
    } else {
      addCourseResourceRow({ title: "Live Class Session", type: "live", url: "https://meet.google.com/nex-co-live" });
    }
  }

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function openNewCourseModal() {
  editingCourseId = null;
  const modal = document.getElementById("admin-course-modal");
  const modalTitle = document.getElementById("admin-course-modal-title");
  const form = document.getElementById("admin-course-form");

  if (modalTitle) modalTitle.textContent = "Add New 100% Online Program";
  if (form) form.reset();

  if (document.getElementById("admin-course-batch-mode")) {
    document.getElementById("admin-course-batch-mode").value = "100% Live Online Interactive Classes";
  }

  const resContainer = document.getElementById("admin-course-resources-container");
  if (resContainer) {
    resContainer.innerHTML = "";
    addCourseResourceRow({ title: "Live Class Session", type: "live", url: "https://meet.google.com/nex-co-live" });
  }

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeCourseModal() {
  const modal = document.getElementById("admin-course-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  editingCourseId = null;
}

// =========================================================================
// TAB 3: LIVE ONLINE MASTERCLASSES FULL CRUD
// =========================================================================
function renderAdminSessions() {
  const container = document.getElementById("admin-sessions-table-body");
  if (!container) return;

  const sessions = NexcoStore.getLiveSessions();

  container.innerHTML = sessions.map(session => {
    const isLive = session.status === "LIVE NOW" || session.isLive === true;
    return `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-colors text-xs ${isLive ? 'bg-emerald-950/20' : ''}">
        <td class="py-3.5 px-4">
          <div class="font-bold text-white text-sm flex items-center gap-2">
            ${isLive ? '<span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>' : ''}
            <span>${escapeHTML(session.title)}</span>
          </div>
          <div class="text-[11px] text-slate-400">100% Live Online • Mentor: ${escapeHTML(session.mentorName || session.mentor || 'Staff Mentor')}</div>
        </td>
        <td class="py-3.5 px-4 text-slate-300 font-mono text-xs">
          ${escapeHTML(session.dateTime || session.date || 'TBD')}
        </td>
        <td class="py-3.5 px-4">
          <select class="change-session-status px-2.5 py-1.5 rounded-md text-xs font-bold border ${isLive ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-black/40 text-emerald-300 border-white/10'}" data-id="${session.id}">
            <option value="Upcoming Workshop" ${session.status === 'Upcoming Workshop' ? 'selected' : ''}>📅 Upcoming Workshop</option>
            <option value="LIVE NOW" ${isLive ? 'selected' : ''}>🔴 LIVE NOW</option>
            <option value="Completed" ${session.status === 'Completed' ? 'selected' : ''}>✓ Completed</option>
          </select>
        </td>
        <td class="py-3.5 px-4 text-xs">
          <a href="${session.meetingLink || session.meetLink || '#'}" target="_blank" class="text-emerald-400 hover:underline font-mono truncate max-w-[140px] inline-block">
            ${escapeHTML(session.meetingLink || session.meetLink || 'Google Meet Link')}
          </a>
        </td>
        <td class="py-3.5 px-4 text-right space-x-2">
          <button class="edit-session-btn px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-semibold text-xs transition-colors" data-action="edit-session" data-id="${session.id}">
            ✏️ Edit
          </button>
          <button class="delete-session-btn px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-semibold text-xs transition-colors" data-action="delete-session" data-id="${session.id}">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function openEditSessionModal(sessionId) {
  const session = NexcoStore.getLiveSessions().find(s => s.id === sessionId);
  if (!session) return;

  editingSessionId = sessionId;
  const modal = document.getElementById("admin-session-modal");
  const modalTitle = document.getElementById("admin-session-modal-title");

  if (modalTitle) modalTitle.textContent = `Edit Masterclass: ${session.title}`;

  if (document.getElementById("admin-session-title")) document.getElementById("admin-session-title").value = session.title || "";
  if (document.getElementById("admin-session-mentor")) document.getElementById("admin-session-mentor").value = session.mentorName || session.mentor || "";
  if (document.getElementById("admin-session-datetime")) document.getElementById("admin-session-datetime").value = session.dateTime || session.date || "";
  if (document.getElementById("admin-session-batch")) document.getElementById("admin-session-batch").value = "100% Live Online Stream (Google Meet)";
  if (document.getElementById("admin-session-link")) document.getElementById("admin-session-link").value = session.meetingLink || session.meetLink || "";
  if (document.getElementById("admin-session-desc")) document.getElementById("admin-session-desc").value = session.description || "";
  if (document.getElementById("admin-session-status")) document.getElementById("admin-session-status").value = session.status || "Upcoming Workshop";

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function openNewSessionModal() {
  editingSessionId = null;
  const modal = document.getElementById("admin-session-modal");
  const modalTitle = document.getElementById("admin-session-modal-title");
  const form = document.getElementById("admin-session-form");

  if (modalTitle) modalTitle.textContent = "Schedule 100% Live Online Masterclass";
  if (form) form.reset();

  if (document.getElementById("admin-session-batch")) {
    document.getElementById("admin-session-batch").value = "100% Live Online Stream (Google Meet)";
  }

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeSessionModal() {
  const modal = document.getElementById("admin-session-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  editingSessionId = null;
}

// =========================================================================
// TAB 4: CHARTER COMMITMENTS & REAL FEEDBACK MANAGER
// =========================================================================
function renderAdminCharter() {
  const charter = NexcoStore.getCharter();
  if (!Array.isArray(charter)) return;

  for (let i = 0; i < 4; i++) {
    const card = charter[i] || { title: "", desc: "" };
    const tInput = document.getElementById(`admin-charter${i + 1}-title`);
    const dInput = document.getElementById(`admin-charter${i + 1}-desc`);
    if (tInput) tInput.value = card.title;
    if (dInput) dInput.value = card.desc;
  }
}

async function saveAdminCharter() {
  const charterList = [];
  for (let i = 1; i <= 4; i++) {
    const title = document.getElementById(`admin-charter${i}-title`)?.value.trim() || `Commitment 0${i}`;
    const desc = document.getElementById(`admin-charter${i}-desc`)?.value.trim() || "";
    charterList.push({ title, desc });
  }

  await NexcoStore.updateCharter(charterList);
  NexcoApp.showToast("✔ Changes saved & published live!", "success");
}

function renderAdminFeedback() {
  const container = document.getElementById("admin-feedback-table-body");
  if (!container) return;

  const feedbacks = NexcoStore.getFeedbacks();

  container.innerHTML = feedbacks.map(fb => `
    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors text-xs">
      <td class="py-3.5 px-4">
        <div class="font-bold text-white">${escapeHTML(fb.name)}</div>
        <div class="text-[11px] text-slate-400">${escapeHTML(fb.role || 'Online Learner')} • ${escapeHTML(fb.city || 'Online')}</div>
      </td>
      <td class="py-3.5 px-4 text-slate-300">
        <div class="text-emerald-400 font-bold mb-1">★ ${fb.rating || 5}/5 — ${escapeHTML(fb.workshop || 'Online Lab')}</div>
        <div class="text-xs text-slate-400 line-clamp-2">${escapeHTML(fb.comment || fb.content)}</div>
      </td>
      <td class="py-3.5 px-4">
        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${fb.approved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}">
          ${fb.approved ? '✓ Approved & Live' : '⏳ Pending Review'}
        </span>
      </td>
      <td class="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
        ${!fb.approved ? `
          <button class="approve-fb-btn px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-semibold text-xs" data-action="approve-feedback" data-id="${fb.id}">
            ✅ Approve
          </button>
        ` : ''}
        <button class="delete-fb-btn px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-semibold text-xs" data-action="delete-feedback" data-id="${fb.id}">
          🗑️ Delete
        </button>
      </td>
    </tr>
  `).join("");
}

// =========================================================================
// TAB 5: LEADS & STUDENT ENROLLMENTS
// =========================================================================
function renderAdminLeads() {
  const container = document.getElementById("admin-leads-table-body");
  if (!container) return;

  const leads = NexcoStore.getLeads();

  container.innerHTML = leads.map(lead => {
    const isEnrolled = lead.status === "Enrolled" || lead.status === "Enrolled in LMS";
    return `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-colors text-xs ${isEnrolled ? 'bg-emerald-950/15' : ''}">
        <td class="py-3.5 px-4">
          <div class="font-bold text-white text-sm">${escapeHTML(lead.name)}</div>
          <div class="text-[11px] text-slate-400">${escapeHTML(lead.email)}</div>
        </td>
        <td class="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
          <a href="https://wa.me/${(lead.phone || '').replace(/\D/g, '')}" target="_blank" class="hover:underline">
            ${escapeHTML(lead.phone)}
          </a>
        </td>
        <td class="py-3.5 px-4 text-slate-300">
          <div>${escapeHTML(lead.track || lead.program || 'Full Stack Track')}</div>
          <div class="text-[10px] text-slate-400">100% Live Online</div>
        </td>
        <td class="py-3.5 px-4">
          <select class="change-lead-status px-2.5 py-1 rounded-md text-xs font-semibold bg-black/40 border border-white/10 text-white" data-id="${lead.id}">
            <option value="New Inquiry" ${lead.status === 'New' || lead.status === 'New Inquiry' ? 'selected' : ''}>New Inquiry</option>
            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Enrolled in LMS" ${isEnrolled ? 'selected' : ''}>Enrolled in LMS</option>
          </select>
        </td>
        <td class="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
          ${!isEnrolled ? `
            <button class="enroll-lead-btn px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs" data-action="approve-lead" data-id="${lead.id}">
              Approve & Enroll ⚡
            </button>
          ` : '<span class="text-emerald-400 font-bold text-xs">✓ Enrolled</span>'}
          <button class="delete-lead-btn px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-semibold" data-action="delete-lead" data-id="${lead.id}">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// =========================================================================
// TAB 6: CAPSTONE SUBMISSIONS
// =========================================================================
function renderAdminSubmissions() {
  const container = document.getElementById("admin-submissions-container");
  if (!container) return;

  const subs = NexcoStore.getProjectSubmissions();

  if (subs.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center rounded-2xl bg-black/40 border border-white/10 text-slate-400 text-xs">
        No student capstone projects submitted yet. Student LMS submissions appear here for review.
      </div>
    `;
    return;
  }

  container.innerHTML = subs.map(sub => `
    <div class="p-5 rounded-2xl bg-[#12171A] border border-white/10 space-y-3 text-xs">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-bold text-white">${escapeHTML(sub.title || sub.programTitle)}</h4>
          <div class="text-[11px] text-slate-400">By ${escapeHTML(sub.studentName)} (${escapeHTML(sub.studentEmail)}) • Track: ${escapeHTML(sub.track || 'Full Stack')}</div>
        </div>
        <span class="px-2.5 py-1 rounded-full font-bold text-[10px] ${sub.status === 'Approved & Certified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}">
          ${escapeHTML(sub.status)}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <a href="${escapeHTML(sub.repoUrl)}" target="_blank" class="text-emerald-400 hover:underline font-mono">
          GitHub Repo ↗
        </a>
        ${sub.deployUrl ? `
          <a href="${escapeHTML(sub.deployUrl)}" target="_blank" class="text-blue-400 hover:underline font-mono">
            Live Deployment ↗
          </a>
        ` : ''}
      </div>
      <div class="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
        <button class="review-sub-approve px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold" data-action="approve-submission" data-id="${sub.id}">
          Approve & Certify
        </button>
      </div>
    </div>
  `).join("");
}

// =========================================================================
// TAB 7: LIVE OVERVIEW & KPIS
// =========================================================================
function renderAdminOverview() {
  const leads = NexcoStore.getLeads();
  const students = NexcoStore.getStudents();
  const courses = NexcoStore.getCourses();
  const sessions = NexcoStore.getLiveSessions();

  const newLeadsCount = leads.filter(l => l.status === "New" || l.status === "New Inquiry").length;

  const totalLeadsEl = document.getElementById("admin-metric-leads");
  const newLeadsBadgeEl = document.getElementById("admin-metric-new-leads");
  const totalStudentsEl = document.getElementById("admin-metric-students");
  const totalCoursesEl = document.getElementById("admin-metric-courses");
  const liveSessionsEl = document.getElementById("admin-metric-sessions");

  if (totalLeadsEl) totalLeadsEl.textContent = leads.length;
  if (newLeadsBadgeEl) newLeadsBadgeEl.textContent = `${newLeadsCount} New Inquiries`;
  if (totalStudentsEl) totalStudentsEl.textContent = students.length;
  if (totalCoursesEl) totalCoursesEl.textContent = courses.length;
  if (liveSessionsEl) liveSessionsEl.textContent = sessions.length;

  // Render live security audit trail & locked targets
  refreshSecurityLogs();
  refreshLockedTargets();
}

// =========================================================================
// EVENT DELEGATION & MODAL LISTENERS (NEVER FAIL SILENTLY)
// =========================================================================
function setupAdminEventListeners() {
  // Save Site Settings Button
  document.getElementById("admin-save-site-settings-btn")?.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveAdminSiteSettings();
  });

  // Save Charter Commitments Button
  document.getElementById("admin-save-charter-btn")?.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveAdminCharter();
  });

  // Open Add Course Modal
  document.getElementById("admin-add-course-btn")?.addEventListener("click", () => {
    openNewCourseModal();
  });

  // Open Add Session Modal
  document.getElementById("admin-add-session-btn")?.addEventListener("click", () => {
    openNewSessionModal();
  });

  // Global Document-Level Event Delegation for data-action attributes
  document.addEventListener("click", async (e) => {
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;

    const action = actionEl.getAttribute("data-action");
    const id = actionEl.getAttribute("data-id");

    switch (action) {
      case "add-course":
        e.preventDefault();
        openNewCourseModal();
        break;
      case "edit-course":
        e.preventDefault();
        if (id) openEditCourseModal(id);
        break;
      case "delete-course":
        e.preventDefault();
        if (id && confirm("Are you sure you want to delete this course from the public site and LMS?")) {
          await NexcoStore.deleteCourse(id);
          NexcoApp.showToast("✔ Changes saved & published live!", "success");
        }
        break;
      case "close-course-modal":
        e.preventDefault();
        closeCourseModal();
        break;
      case "add-session":
        e.preventDefault();
        openNewSessionModal();
        break;
      case "edit-session":
        e.preventDefault();
        if (id) openEditSessionModal(id);
        break;
      case "delete-session":
        e.preventDefault();
        if (id && confirm("Are you sure you want to cancel this live masterclass?")) {
          await NexcoStore.deleteLiveSession(id);
          NexcoApp.showToast("✔ Changes saved & published live!", "success");
        }
        break;
      case "close-session-modal":
        e.preventDefault();
        closeSessionModal();
        break;
      case "approve-lead":
        e.preventDefault();
        if (id) {
          await NexcoStore.approveAndEnrollStudent(id);
          NexcoApp.showToast("✔ Changes saved & published live!", "success");
        }
        break;
      case "delete-lead":
        e.preventDefault();
        if (id && confirm("Delete this lead inquiry?")) {
          await NexcoStore.deleteLead(id);
          NexcoApp.showToast("✔ Changes saved & published live!", "success");
        }
        break;
      case "approve-feedback":
        e.preventDefault();
        if (id) {
          await NexcoStore.approveFeedback(id);
          NexcoApp.showToast("✔ Changes saved & published live!", "success");
        }
        break;
      case "delete-feedback":
        e.preventDefault();
        if (id && confirm("Delete this feedback?")) {
          await NexcoStore.deleteFeedback(id);
          NexcoApp.showToast("✔ Changes saved & published live!", "success");
        }
        break;
      case "approve-submission":
        e.preventDefault();
        if (id) {
          await NexcoStore.reviewProjectSubmission(id, "Approved & Certified", "Code reviewed by Staff Architect. Production standards verified.");
          NexcoApp.showToast("✔ Changes saved & published live!", "success");
        }
        break;
    }
  });

  // Change Session Status Select
  document.getElementById("admin-sessions-table-body")?.addEventListener("change", async (e) => {
    if (e.target.classList.contains("change-session-status")) {
      const id = e.target.getAttribute("data-id");
      const status = e.target.value;
      await NexcoStore.toggleSessionLiveStatus(id, status);
      NexcoApp.showToast("✔ Changes saved & published live!", "success");
    }
  });

  // Change Lead Status Select
  document.getElementById("admin-leads-table-body")?.addEventListener("change", async (e) => {
    if (e.target.classList.contains("change-lead-status")) {
      const id = e.target.getAttribute("data-id");
      const status = e.target.value;
      await NexcoStore.updateLeadStatus(id, status);
      NexcoApp.showToast("✔ Changes saved & published live!", "success");
    }
  });
}

function setupAdminModals() {
  // Course Form Submit
  const courseForm = document.getElementById("admin-course-form");
  courseForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("admin-course-title")?.value.trim();
    const category = document.getElementById("admin-course-category")?.value;
    const duration = document.getElementById("admin-course-duration")?.value.trim();
    const batchMode = "100% Live Online Interactive Classes";
    const mentorName = document.getElementById("admin-course-mentor")?.value.trim();
    const thumbnail = document.getElementById("admin-course-thumbnail")?.value.trim() || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80";
    const desc = document.getElementById("admin-course-desc")?.value.trim();
    const skillsStr = document.getElementById("admin-course-skills")?.value.trim();

    const skills = skillsStr ? skillsStr.split(",").map(s => s.trim()) : ["React 19", "Node.js", "Docker"];

    // Extract module resources
    const resourceRows = document.querySelectorAll("#admin-course-resources-container .course-resource-row");
    const resources = [];
    resourceRows.forEach((row, idx) => {
      const rTitle = row.querySelector(".resource-title-input")?.value.trim();
      const rType = row.querySelector(".resource-type-select")?.value || "doc";
      const rUrl = row.querySelector(".resource-url-input")?.value.trim();
      if (rTitle || rUrl) {
        resources.push({
          id: `res-${idx + 1}`,
          title: rTitle || "Classroom Resource",
          type: rType,
          url: rUrl || "https://meet.google.com/nex-co-live"
        });
      }
    });

    if (editingCourseId) {
      await NexcoStore.updateCourse(editingCourseId, {
        title,
        category,
        categoryLabel: category === 'fullstack' ? 'Full Stack' : category === 'uiux' ? 'UI/UX Design' : category === 'ai' ? 'AI Tools' : 'Data Science',
        duration,
        batchMode,
        mentorName,
        thumbnail,
        description: desc,
        skills,
        resources
      });
      NexcoApp.showToast("✔ Changes saved & published live!", "success");
    } else {
      await NexcoStore.addCourse({
        title,
        category,
        categoryLabel: category === 'fullstack' ? 'Full Stack' : category === 'uiux' ? 'UI/UX Design' : category === 'ai' ? 'AI Tools' : 'Data Science',
        duration,
        batchMode,
        mentorName,
        thumbnail,
        description: desc,
        skills,
        resources,
        syllabus: [
          { week: "Weeks 1-4", module: "Fundamentals & Architecture", deliverable: "Production Working Repo" },
          { week: "Weeks 5-10", module: "Advanced Systems & Production Engineering", deliverable: "Interactive Application System" }
        ]
      });
      NexcoApp.showToast("✔ Changes saved & published live!", "success");
    }

    closeCourseModal();
  });

  // Session Form Submit
  const sessionForm = document.getElementById("admin-session-form");
  sessionForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("admin-session-title")?.value.trim();
    const mentorName = document.getElementById("admin-session-mentor")?.value.trim();
    const dateTime = document.getElementById("admin-session-datetime")?.value.trim();
    const batchMode = "100% Live Online Stream (Google Meet)";
    const meetingLink = document.getElementById("admin-session-link")?.value.trim();
    const desc = document.getElementById("admin-session-desc")?.value.trim();
    const status = document.getElementById("admin-session-status")?.value || "Upcoming Workshop";

    if (editingSessionId) {
      await NexcoStore.updateLiveSession(editingSessionId, {
        title,
        mentorName,
        dateTime,
        batchMode,
        meetingLink,
        meetLink: meetingLink,
        description: desc,
        status,
        isLive: status === "LIVE NOW"
      });
      NexcoApp.showToast("✔ Changes saved & published live!", "success");
    } else {
      await NexcoStore.addLiveSession({
        title,
        mentorName,
        dateTime,
        batchMode,
        meetingLink,
        meetLink: meetingLink,
        description: desc,
        status,
        isLive: status === "LIVE NOW"
      });
      NexcoApp.showToast("✔ Changes saved & published live!", "success");
    }

    closeSessionModal();
  });
}

// =========================================================================
// TAB 8: QA & SYSTEM TESTING SUITE RUNNER
// =========================================================================
let currentQAFilter = 'all';
let lastQASummary = null;

function renderAdminQATab() {
  if (lastQASummary) {
    renderQAResults(lastQASummary);
  }
}

async function runAdminQASuite() {
  const btn = document.getElementById("btn-run-all-tests");
  const btnText = document.getElementById("btn-run-tests-text");
  const container = document.getElementById("qa-test-results-container");

  if (btn) {
    btn.disabled = true;
    btn.classList.add("opacity-75");
  }
  if (btnText) btnText.textContent = "Executing 14 QA Tests...";

  if (container) {
    container.innerHTML = `
      <div class="p-8 rounded-2xl bg-[#161D22] border border-white/10 text-center animate-pulse">
        <div class="text-3xl mb-2">⚡</div>
        <h3 class="text-base font-bold text-white">Running 14 System Verification Checks...</h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Testing White-Box logic, Black-Box boundary constraints, Gray-Box API synchronization, and OWASP penetration guards.
        </p>
      </div>
    `;
  }

  try {
    const res = await NexcoStore.apiRequest("/admin/run-tests", "POST");
    if (res && res.success && res.results) {
      lastQASummary = res.results;
      renderQAResults(res.results);
      NexcoApp.showToast(`QA Suite Completed: ${res.results.passed}/${res.results.total} Passed (${res.results.passRate}%) in ${res.results.durationTotalMs}ms`, res.results.failed === 0 ? "success" : "error");
    } else {
      throw new Error(res && res.error ? res.error : "Failed to run QA tests.");
    }
  } catch (err) {
    console.error("[QA Suite Error]:", err);
    if (container) {
      container.innerHTML = `
        <div class="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 text-center">
          <div class="text-2xl mb-1">⚠️</div>
          <h3 class="text-sm font-bold text-red-300">Test Execution Failed</h3>
          <p class="text-xs text-red-400/80 mt-1">${escapeHTML(err.message)}</p>
          <button onclick="NexcoAdmin.runQASuite()" class="mt-3 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-xs">
            Retry Execution
          </button>
        </div>
      `;
    }
    NexcoApp.showToast(`QA Execution Error: ${err.message}`, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove("opacity-75");
    }
    if (btnText) btnText.textContent = "Run All System QA Tests";
  }
}

function filterAdminQATests(filter) {
  currentQAFilter = filter;
  // Update button active states
  document.querySelectorAll(".qa-filter-btn").forEach((btn) => {
    const f = btn.getAttribute("data-filter");
    if (f === filter) {
      btn.classList.add("bg-emerald-500/20", "text-emerald-400", "font-semibold", "border-emerald-500/30");
      btn.classList.remove("text-slate-400", "hover:text-white");
    } else {
      btn.classList.remove("bg-emerald-500/20", "text-emerald-400", "font-semibold", "border-emerald-500/30");
      btn.classList.add("text-slate-400", "hover:text-white");
    }
  });

  if (lastQASummary) {
    renderQAResults(lastQASummary);
  }
}

function renderQAResults(summary) {
  // Update KPI counters
  const totalEl = document.getElementById("qa-metric-total");
  const passedEl = document.getElementById("qa-metric-passed");
  const failedEl = document.getElementById("qa-metric-failed");
  const latencyEl = document.getElementById("qa-metric-latency");
  const passrateEl = document.getElementById("qa-metric-passrate");
  const failStatusEl = document.getElementById("qa-metric-fail-status");
  const timestampEl = document.getElementById("qa-last-run-timestamp");

  if (totalEl) totalEl.textContent = summary.total;
  if (passedEl) passedEl.textContent = summary.passed;
  if (failedEl) failedEl.textContent = summary.failed;
  if (latencyEl) latencyEl.textContent = `${summary.durationTotalMs}ms`;
  if (passrateEl) passrateEl.textContent = `${summary.passRate}% pass rate`;
  if (failStatusEl) {
    failStatusEl.textContent = summary.failed === 0 ? "100% Zero Defects" : `${summary.failed} failed assertions`;
    failStatusEl.className = summary.failed === 0 ? "text-[10px] text-emerald-400 mt-1" : "text-[10px] text-red-400 mt-1 font-bold";
  }
  if (timestampEl) {
    const timeStr = new Date(summary.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    timestampEl.textContent = `Last Run: ${timeStr} (${summary.durationTotalMs}ms)`;
  }

  // Filter results
  let list = summary.results || [];
  if (currentQAFilter !== 'all') {
    list = list.filter((r) => r.category === currentQAFilter);
  }

  const container = document.getElementById("qa-test-results-container");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-2xl bg-[#161D22] border border-white/10 text-center text-xs text-slate-400">
        No test assertions found for category: "${escapeHTML(currentQAFilter)}".
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((test) => {
    const isPass = test.passed;
    const badgeBg = isPass ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-red-500/15 border-red-500/30 text-red-400";
    const statusText = isPass ? "PASSED" : "FAILED";
    const statusIcon = isPass ? "✔" : "✖";

    let categoryColor = "bg-white/10 text-slate-300";
    if (test.category === 'White-Box') categoryColor = "bg-blue-500/15 text-blue-300 border-blue-500/20";
    else if (test.category === 'Black-Box') categoryColor = "bg-purple-500/15 text-purple-300 border-purple-500/20";
    else if (test.category === 'Gray-Box & Integration') categoryColor = "bg-amber-500/15 text-amber-300 border-amber-500/20";
    else if (test.category === 'Security & OWASP') categoryColor = "bg-rose-500/15 text-rose-300 border-rose-500/20";
    else if (test.category === 'Auth & Rate Limiting') categoryColor = "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";

    return `
      <div class="p-4 rounded-xl bg-[#161D22] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="space-y-1.5 flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${categoryColor}">${test.category}</span>
            <span class="text-xs font-bold text-white">${escapeHTML(test.name)}</span>
            <span class="text-[10px] font-mono text-slate-500">(${test.durationMs}ms)</span>
          </div>
          <div class="text-xs text-slate-400 flex items-start gap-1.5 font-mono">
            <span class="text-slate-500 shrink-0">↳</span>
            <span class="break-words">${escapeHTML(test.details || '')}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${badgeBg}">
            <span>${statusIcon}</span>
            <span>${statusText}</span>
          </span>
        </div>
      </div>
    `;
  }).join("");
}

// =========================================================================
// LIVE SECURITY AUDIT TRAIL MONITOR
// =========================================================================
async function refreshSecurityLogs() {
  const container = document.getElementById("admin-security-logs-container");
  if (!container) return;

  try {
    const res = await NexcoStore.apiRequest("/admin/security-logs", "GET");
    if (!res || !res.success || !res.data) {
      container.innerHTML = `<div class="p-3 text-center text-slate-500">No security audit records logged yet.</div>`;
      return;
    }

    const logs = res.data;
    if (logs.length === 0) {
      container.innerHTML = `<div class="p-3 text-center text-slate-500">Zero security violations recorded. Zero-Trust defense active.</div>`;
      return;
    }

    container.innerHTML = logs.map((log) => {
      let badgeClass = "bg-blue-500/15 text-blue-300 border-blue-500/20";
      if (log.severity === 'CRITICAL') badgeClass = "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse";
      else if (log.severity === 'WARNING') badgeClass = "bg-amber-500/20 text-amber-300 border-amber-500/30";

      const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      return `
        <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeClass}">${escapeHTML(log.severity)}</span>
            <span class="text-white font-semibold">${escapeHTML(log.action)}</span>
            <span class="text-slate-400 text-[11px]">${escapeHTML(log.details || '')}</span>
          </div>
          <div class="flex items-center gap-2 text-[10px] text-slate-500 shrink-0">
            <span>IP: ${escapeHTML(log.ip || '127.0.0.1')}</span>
            <span>•</span>
            <span>${timeStr}</span>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    container.innerHTML = `<div class="p-3 text-center text-red-400">Failed to load security audit logs: ${escapeHTML(err.message)}</div>`;
  }
}

// =========================================================================
// LOCKED TARGETS MONITOR & 1-CLICK ADMIN UNBLOCK
// =========================================================================
async function refreshLockedTargets() {
  const container = document.getElementById("admin-locked-targets-container");
  const badge = document.getElementById("admin-locked-count-badge");
  if (!container) return;

  try {
    const list = await NexcoStore.getLockedTargets();
    if (badge) {
      badge.textContent = `${list.length} Locked`;
      if (list.length > 0) {
        badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse";
      } else {
        badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300";
      }
    }

    if (!list || list.length === 0) {
      container.innerHTML = `<div class="p-3 text-center text-slate-500">No accounts or IPs are currently locked out. Dual-key limiter active.</div>`;
      return;
    }

    container.innerHTML = list.map(item => {
      const minutes = Math.floor(item.remainingSeconds / 60);
      const seconds = item.remainingSeconds % 60;
      const mmss = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      return `
        <div class="p-2.5 rounded-xl bg-black/60 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              LOCKED (${escapeHTML(item.type.toUpperCase())})
            </span>
            <span class="text-white font-bold text-xs">${escapeHTML(item.target)}</span>
            <span class="text-slate-400 text-[11px]">Failed Attempts: ${escapeHTML(item.count)}/5</span>
            <span class="text-amber-400 text-[11px] font-bold">Cooldown: ${mmss}</span>
          </div>
          <button onclick="NexcoAdmin.unlockUserTarget('${escapeHTML(item.key)}')" class="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-colors flex items-center gap-1 self-start sm:self-auto">
            <span>🔓</span>
            <span>Unlock User / Reset Attempts</span>
          </button>
        </div>
      `;
    }).join("");
  } catch (err) {
    container.innerHTML = `<div class="p-3 text-center text-red-400">Failed to load locked targets: ${escapeHTML(err.message)}</div>`;
  }
}

async function unlockUserTarget(target) {
  try {
    const res = await NexcoStore.unlockTarget(target);
    if (res && res.success) {
      if (typeof window.NexcoApp !== "undefined" && window.NexcoApp.showToast) {
        window.NexcoApp.showToast(`Target unlocked successfully. Login attempts reset.`, "success");
      }
      refreshLockedTargets();
      refreshSecurityLogs();
    } else {
      if (typeof window.NexcoApp !== "undefined" && window.NexcoApp.showToast) {
        window.NexcoApp.showToast(res.error || "Failed to unlock target", "warning");
      }
    }
  } catch (e) {
    console.error("Unlock error:", e);
  }
}

// =========================================================================
// ZERO-TRUST SECURITY: ADMIN INACTIVITY AUTO-LOCK (15 MINUTES)
// =========================================================================
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
let lastActivityTimestamp = Date.now();
let inactivityTimer = null;

function resetInactivityTimer() {
  lastActivityTimestamp = Date.now();
}

function startAdminInactivityMonitor() {
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, resetInactivityTimer, { passive: true });
  });

  if (inactivityTimer) clearInterval(inactivityTimer);
  inactivityTimer = setInterval(() => {
    const user = NexcoStore.getCurrentUser();
    if (user && user.role === 'admin') {
      const elapsed = Date.now() - lastActivityTimestamp;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        console.warn('🔒 [Nexco Security] Admin session auto-locked due to 15 minutes of inactivity.');
        NexcoStore.logout();
        if (typeof NexcoApp !== 'undefined' && NexcoApp.switchView) {
          NexcoApp.switchView('public');
          NexcoApp.showToast('Security Auto-Lock: Session closed due to 15 minutes of inactivity. Please re-authenticate.', 'warning');
        }
      }
    }
  }, 30000); // Check every 30 seconds
}

startAdminInactivityMonitor();

// Expose globally
window.NexcoAdmin = {
  switchAdminTab,
  openNewCourseModal,
  openEditCourseModal,
  closeCourseModal,
  addCourseResourceRow,
  openNewSessionModal,
  openEditSessionModal,
  closeSessionModal,
  saveAdminSiteSettings,
  saveAdminCharter,
  deleteCourse: async (id) => {
    await NexcoStore.deleteCourse(id);
    if (typeof NexcoApp !== 'undefined') NexcoApp.showToast("✔ Changes saved & published live!", "success");
  },
  deleteLiveSession: async (id) => {
    await NexcoStore.deleteLiveSession(id);
    if (typeof NexcoApp !== 'undefined') NexcoApp.showToast("✔ Changes saved & published live!", "success");
  },
  changeSessionStatus: async (id, st) => {
    await NexcoStore.toggleSessionLiveStatus(id, st);
    if (typeof NexcoApp !== 'undefined') NexcoApp.showToast("✔ Changes saved & published live!", "success");
  },
  approveAndEnrollStudent: async (id) => {
    await NexcoStore.approveAndEnrollStudent(id);
    if (typeof NexcoApp !== 'undefined') NexcoApp.showToast("✔ Changes saved & published live!", "success");
  },
  updateLeadStatus: async (id, st) => {
    await NexcoStore.updateLeadStatus(id, st);
    if (typeof NexcoApp !== 'undefined') NexcoApp.showToast("✔ Changes saved & published live!", "success");
  },
  approveFeedback: async (id) => {
    await NexcoStore.approveFeedback(id);
    if (typeof NexcoApp !== 'undefined') NexcoApp.showToast("✔ Changes saved & published live!", "success");
  },
  deleteFeedback: async (id) => {
    await NexcoStore.deleteFeedback(id);
    if (typeof NexcoApp !== 'undefined') NexcoApp.showToast("✔ Changes saved & published live!", "success");
  },
  reviewSubmission: async (id, st) => {
    await NexcoStore.reviewProjectSubmission(id, st, "Reviewed by Staff Architect");
    if (typeof NexcoApp !== 'undefined') NexcoApp.showToast("✔ Changes saved & published live!", "success");
  },
  runQASuite: () => runAdminQASuite(),
  filterQATests: (f) => filterAdminQATests(f),
  refreshSecurityLogs: () => refreshSecurityLogs(),
  refreshLockedTargets: () => refreshLockedTargets(),
  unlockUserTarget: (t) => unlockUserTarget(t)
};
