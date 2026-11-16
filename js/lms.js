// =========================================================================
// Nexco LearnHub LMS Engine (Dynamic & Connected to NexcoStore)
// 100% Live Interactive Online Classes — In-App Resource & Workspace Viewer
// =========================================================================

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  initLMSNavigation();
  initInAppViewer();
  initClassroomNotes();
  initClassroomAITutor();
  initQuizEngine();
  initProjectSubmission();
  initLeaderboard();
  initCertificate();
  initWeeklyChart();
  renderLMSLiveSessionBanner();

  // Re-render when live sessions or courses change in Admin
  if (window.NexcoStore) {
    NexcoStore.subscribe("sessions", () => {
      renderLMSLiveSessionBanner();
    });
    NexcoStore.subscribe("submissions", () => {
      updateSubmittedProjectStatus();
    });
    NexcoStore.subscribe("courses", () => {
      renderClassroomSyllabus();
    });
  }
});

let currentLmsTab = "dashboard";
let activeModuleId = "mod-2";
let activeResourceId = "res-2-1";
let activeResource = null;
let isViewerFullscreen = false;

let userNotes = [
  { id: "n-1", timestamp: "Session 2", seconds: 0, text: "Live online screen-share lab on Saturday will cover PostgreSQL composite B-Tree index optimization." },
  { id: "n-2", timestamp: "Lab 3", seconds: 0, text: "Remember to configure connection pooling using PgBouncer for serverless high-concurrency." }
];
let userQuizAnswers = {};

// =========================================================================
// 1. LMS LIVE CLASS BANNER (Dynamically triggered by Admin!)
// =========================================================================
function renderLMSLiveSessionBanner() {
  const container = document.getElementById("lms-live-class-alert");
  if (!container) return;

  const sessions = window.NexcoStore ? NexcoStore.getLiveSessions() : [];
  const liveNow = sessions.find(s => s?.status === "LIVE NOW" || s?.isLive);

  if (liveNow) {
    container.classList.remove("hidden");
    container.innerHTML = `
      <div class="rounded-2xl p-4 bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-2 border-red-500/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-subtle-pulse">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
            <span class="w-3 h-3 rounded-full bg-white animate-ping"></span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500 text-white uppercase">🔴 Class is Live Now</span>
              <span class="text-xs text-red-200 font-mono">${escapeHTML(liveNow.batch || "Cohort Live")}</span>
            </div>
            <h4 class="text-sm font-bold text-white mt-0.5">${escapeHTML(liveNow.title)}</h4>
            <div class="text-[11px] text-red-200/90">Mentor: ${escapeHTML(liveNow.mentorName || "Staff Architect")} • Google Meet Active</div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="NexcoLMS.selectClassroomResource('${activeModuleId}', '${activeResourceId}')" 
                  class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all">
            View in Classroom
          </button>
          <a href="${escapeHTML(liveNow.meetingLink || 'https://meet.google.com')}" target="_blank" rel="noopener noreferrer"
             class="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-red-950 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2">
            <span>Join Google Meet ↗</span>
          </a>
        </div>
      </div>
    `;
  } else {
    // Show upcoming session pill
    const upcoming = sessions.find(s => s?.status === "Seats Filling Fast" || s?.status === "Upcoming Workshop");
    if (upcoming) {
      container.classList.remove("hidden");
      container.innerHTML = `
        <div class="rounded-xl p-3 bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">📅 Next Live Session</span>
            <span class="text-white font-medium">${escapeHTML(upcoming.title)} (${escapeHTML(upcoming.dateTime || "Weekend")})</span>
          </div>
          <a href="${escapeHTML(upcoming.meetingLink || '#')}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline font-semibold text-[11px]">
            Save Meet Link →
          </a>
        </div>
      `;
    } else {
      container.classList.add("hidden");
    }
  }
}

// =========================================================================
// 2. LMS NAVIGATION & TABS
// =========================================================================
function initLMSNavigation() {
  const navItems = document.querySelectorAll(".lms-nav-item");
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      if (tab === "website") {
        if (window.NexcoApp?.switchView) {
          NexcoApp.switchView("landing");
        }
        return;
      }
      switchLMSTab(tab);
    });
  });
}

function switchLMSTab(tabName) {
  currentLmsTab = tabName;

  document.querySelectorAll(".lms-nav-item").forEach((btn) => {
    const t = btn.getAttribute("data-tab");
    if (t === tabName) {
      btn.classList.add("bg-emerald-500/15", "text-emerald-400", "font-semibold", "border-emerald-500/30");
      btn.classList.remove("text-slate-400", "hover:text-white");
    } else {
      btn.classList.remove("bg-emerald-500/15", "text-emerald-400", "font-semibold", "border-emerald-500/30");
      btn.classList.add("text-slate-400", "hover:text-white");
    }
  });

  const sections = ["dashboard", "classroom", "assignments", "leaderboard", "certificates"];
  sections.forEach((sec) => {
    const el = document.getElementById(`lms-view-${sec}`);
    if (el) {
      if (sec === tabName) {
        el.classList.remove("hidden");
        el.classList.add("block");
      } else {
        el.classList.add("hidden");
        el.classList.remove("block");
      }
    }
  });

  if (tabName === "dashboard") {
    renderWeeklyChart();
    renderLMSLiveSessionBanner();
  } else if (tabName === "classroom") {
    if (!activeResource) {
      initDefaultActiveResource();
    }
  }
}

// =========================================================================
// 3. IN-APP VIEWER & CLASSROOM ACCORDION (No Fake Videos!)
// =========================================================================
function getCohortModules() {
  if (window.NEXCO_DATA?.lms?.classroomModules && Array.isArray(NEXCO_DATA.lms.classroomModules)) {
    return NEXCO_DATA.lms.classroomModules;
  }
  return [
    {
      id: "mod-1",
      title: "Module 1: Modern Web Foundations & TypeScript",
      completed: true,
      resources: [
        {
          id: "res-1-1",
          title: "Live Class: TypeScript & Modern Clean Architecture",
          type: "live",
          url: "https://meet.google.com/nex-co-live",
          mentor: "Karthik Sundaram (Lead Architect)",
          dateTime: "Completed • Notes & Code Saved",
          isLive: false,
          completed: true,
          description: "Interactive session on TypeScript type safety, generics, and clean interface design."
        },
        {
          id: "res-1-2",
          title: "Study Guide: React 19 Server Components",
          type: "doc",
          url: "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview",
          completed: true,
          description: "Official cohort reference document on React 19 Server Components and Actions."
        }
      ]
    },
    {
      id: "mod-2",
      title: "Module 2: React 19, TypeScript & Backend APIs",
      completed: false,
      active: true,
      resources: [
        {
          id: "res-2-1",
          title: "Live Class: PostgreSQL Schema Design & Indexing",
          type: "live",
          url: "https://meet.google.com/nex-co-live",
          mentor: "Karthik Sundaram (Lead Architect)",
          dateTime: "Saturday & Sunday • 7:00 PM IST",
          isLive: true,
          completed: false,
          active: true,
          description: "Live interactive coding session: Designing normalized schemas, writing complex SQL queries, and optimizing indexes."
        },
        {
          id: "res-2-2",
          title: "Study Guide: High-Performance REST & FastAPIs",
          type: "doc",
          url: "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview",
          completed: false,
          description: "Architecture blueprint for robust API authentication, rate limiting, and database connection pooling."
        },
        {
          id: "res-2-3",
          title: "Practice Exercise: Build a Multi-Tenant Storefront API",
          type: "task",
          url: "https://github.com/nexoratechno2026-arch/Nexco/blob/main/README.md",
          completed: false,
          description: "Build an API with JWT authentication, PostgreSQL queries, and validation middleware."
        }
      ]
    },
    {
      id: "mod-3",
      title: "Module 3: AI Tools, Prompt Engineering & Automation",
      completed: false,
      resources: [
        {
          id: "res-3-1",
          title: "Live Class: Building Workflow Automations with n8n",
          type: "live",
          url: "https://meet.google.com/nex-co-live",
          mentor: "Divya Balasubramanian (AI Engineering Lead)",
          dateTime: "Upcoming • Next Weekend",
          isLive: false,
          completed: false,
          description: "Hands-on workflow automation: Connecting WhatsApp, Gmail, and databases with custom AI agents."
        },
        {
          id: "res-3-2",
          title: "Code Repository: Local LLM Copilot with Ollama",
          type: "repo",
          url: "https://github.com/nexoratechno2026-arch/Nexco",
          completed: false,
          description: "Repository template for running local open-source LLMs with Python FastEmbed and SQLite."
        }
      ]
    }
  ];
}

function initInAppViewer() {
  initDefaultActiveResource();
  renderClassroomSyllabus();
}

function initDefaultActiveResource() {
  const modules = getCohortModules();
  // Find active module or first module
  const targetMod = modules.find(m => m.active) || modules[0];
  if (!targetMod) return;

  activeModuleId = targetMod.id;
  const resources = targetMod.resources || targetMod.lessons || [];
  const targetRes = resources.find(r => r.active) || resources[0];

  if (targetRes) {
    activeResourceId = targetRes.id;
    activeResource = targetRes;
    renderViewer(targetRes);
  }
}

// Convert various web links into embeddable URLs
function parseEmbedUrl(url, type) {
  if (!url) return "";

  // Google Meet & Zoom cannot be embedded inside iframe due to X-Frame-Options: DENY
  if (url.includes("meet.google.com") || url.includes("zoom.us")) {
    return { isMeet: true, url };
  }

  // YouTube Links
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { isMeet: false, url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0` };
  }

  // Loom Links
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch && loomMatch[1]) {
    return { isMeet: false, url: `https://www.loom.com/embed/${loomMatch[1]}` };
  }

  // Google Drive
  if (url.includes("drive.google.com") && url.includes("/view")) {
    return { isMeet: false, url: url.replace("/view", "/preview") };
  }

  // Google Docs / Sheets / Slides
  if (url.includes("docs.google.com") && (url.includes("/edit") || url.includes("/view"))) {
    return { isMeet: false, url: url.replace(/\/(edit|view).*$/, "/preview") };
  }

  // CodePen
  if (url.includes("codepen.io") && url.includes("/pen/")) {
    return { isMeet: false, url: url.replace("/pen/", "/embed/") };
  }

  return { isMeet: false, url };
}

function renderViewer(resource) {
  if (!resource) return;
  activeResource = resource;

  const titleEl = document.getElementById("lms-viewer-title");
  const badgeEl = document.getElementById("lms-viewer-type-badge");
  const extLink = document.getElementById("lms-viewer-external-link");
  const frameContainer = document.getElementById("lms-viewer-frame-container");

  if (titleEl) titleEl.textContent = resource.title || "Classroom Session";
  if (extLink) {
    extLink.href = resource.url || "#";
    extLink.setAttribute("target", "_blank");
  }

  // Badge configuration based on resource type
  const typeMap = {
    live: { label: "🔴 Live Class", bg: "bg-red-500/20 text-red-300 border-red-500/30" },
    doc: { label: "📄 Study Doc", bg: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    repo: { label: "💻 Code Repo", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    task: { label: "📝 Practice Task", bg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    video: { label: "🎥 Recorded Video", bg: "bg-purple-500/20 text-purple-300 border-purple-500/30" }
  };

  const currentType = typeMap[resource.type] || typeMap.live;
  if (badgeEl) {
    badgeEl.className = `px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider shrink-0 border ${currentType.bg}`;
    badgeEl.textContent = currentType.label;
  }

  if (!frameContainer) return;

  const parsed = parseEmbedUrl(resource.url, resource.type);

  // If Google Meet / Zoom or type is "live": Render In-App Live Class Lobby Card
  if (parsed.isMeet || resource.type === "live" || (resource.url && resource.url.includes("meet.google.com"))) {
    const isLiveNow = resource.isLive !== false;
    frameContainer.innerHTML = `
      <div class="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#12171A] border border-emerald-500/30 shadow-2xl text-center space-y-5 my-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full ${isLiveNow ? 'bg-red-500/15 border border-red-500/40 text-red-400' : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'} font-bold text-xs uppercase tracking-wider">
          <span class="w-2.5 h-2.5 rounded-full ${isLiveNow ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}"></span>
          <span>${isLiveNow ? 'Live Interactive Class Active' : 'Scheduled Live Session'}</span>
        </div>

        <div>
          <h3 class="text-lg sm:text-xl font-bold text-white mb-1.5">${escapeHTML(resource.title)}</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            ${escapeHTML(resource.description || 'Join live online with mentors. Have your code editor ready, share your screen for doubt solving, and build together.')}
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-black/50 border border-white/5 text-xs text-left">
          <div>
            <span class="block text-[10px] text-slate-500 font-mono uppercase">Mentor</span>
            <span class="font-semibold text-emerald-300 truncate block">${escapeHTML(resource.mentor || 'Karthik Sundaram')}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-500 font-mono uppercase">Schedule</span>
            <span class="font-semibold text-slate-200 truncate block">${escapeHTML(resource.dateTime || '7:00 PM IST')}</span>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <span class="block text-[10px] text-slate-500 font-mono uppercase">Format</span>
            <span class="font-semibold text-slate-200 truncate block">Tamil &amp; English</span>
          </div>
        </div>

        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="${escapeHTML(resource.url || 'https://meet.google.com')}" target="_blank" rel="noopener noreferrer" 
             class="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2">
            <span>Launch Google Meet in New Tab</span>
            <span>↗</span>
          </a>
          <button onclick="NexcoLMS.copyMeetingLink('${escapeHTML(resource.url || 'https://meet.google.com')}')" 
                  class="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/10">
            <span>📋</span>
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    `;
  } else {
    // Embeddable iframe view (Google Docs, YouTube, Loom, GitHub)
    frameContainer.innerHTML = `
      <div class="w-full h-full flex flex-col min-h-[380px] sm:min-h-[460px]">
        <iframe id="lms-active-iframe" 
                src="${escapeHTML(parsed.url)}" 
                class="w-full flex-1 min-h-[380px] sm:min-h-[460px] border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen></iframe>
        <div class="p-2 sm:p-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <span>Trouble viewing document or code inline?</span>
          <a href="${escapeHTML(resource.url)}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline font-semibold flex items-center gap-1">
            <span>Open directly in external tab</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    `;
  }

  // Update resource list for the active module
  const modules = getCohortModules();
  const currentMod = modules.find(m => m.id === activeModuleId);
  if (currentMod) {
    const list = currentMod.resources || currentMod.lessons || [];
    renderClassroomResourcesList(list, resource.id);
  }
}

function renderClassroomResourcesList(resources, activeId) {
  const container = document.getElementById("classroom-resources-list");
  const countEl = document.getElementById("lms-active-resource-count");
  if (!container) return;

  if (countEl) {
    countEl.textContent = `${resources.length} Session Resources`;
  }

  const iconMap = {
    live: "🔴",
    doc: "📄",
    repo: "💻",
    task: "📝",
    video: "🎥"
  };

  container.innerHTML = resources.map((res) => {
    const isActive = res.id === activeId;
    const icon = iconMap[res.type] || "📌";

    return `
      <div onclick="NexcoLMS.selectClassroomResource('${activeModuleId}', '${res.id}')"
           class="p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
             isActive 
               ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
               : 'bg-black/30 border-white/5 hover:border-emerald-500/30 text-slate-300 hover:text-white'
           }">
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="text-sm shrink-0">${icon}</span>
          <span class="text-xs font-semibold truncate leading-tight">${escapeHTML(res.title)}</span>
        </div>
        <a href="${escapeHTML(res.url || '#')}" target="_blank" rel="noopener noreferrer" 
           onclick="event.stopPropagation()"
           title="Open in new tab"
           class="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0">
          ↗
        </a>
      </div>
    `;
  }).join("");
}

function renderClassroomSyllabus() {
  const container = document.getElementById("classroom-syllabus-accordion");
  if (!container) return;

  const modules = getCohortModules();

  const iconMap = {
    live: "🔴",
    doc: "📄",
    repo: "💻",
    task: "📝",
    video: "🎥"
  };

  container.innerHTML = modules.map((mod, modIdx) => {
    const items = mod.resources || mod.lessons || [];
    const isCompleted = mod.completed;
    const isCurrent = mod.id === activeModuleId;

    return `
      <div class="rounded-xl border border-white/10 bg-[#161D22] overflow-hidden mb-3 shadow-md">
        <button onclick="NexcoLMS.toggleModuleAccordion('mod-body-${mod.id}')"
                class="w-full p-3.5 bg-black/30 flex items-center justify-between text-left hover:bg-black/50 transition-colors">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <span class="w-6 h-6 rounded-md shrink-0 ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-500 text-black font-bold'} flex items-center justify-center text-xs">
              ${isCompleted ? '✓' : `0${modIdx + 1}`}
            </span>
            <span class="text-xs font-bold text-white truncate">${escapeHTML(mod.title)}</span>
          </div>
          <span class="text-slate-400 text-xs shrink-0 ml-2">▼</span>
        </button>

        <div id="mod-body-${mod.id}" class="p-2 space-y-1.5 bg-black/20 ${isCurrent ? '' : 'hidden'}">
          ${items.map(item => {
            const isItemActive = item.id === activeResourceId;
            const icon = iconMap[item.type] || "📌";

            return `
              <div onclick="NexcoLMS.selectClassroomResource('${mod.id}', '${item.id}')" 
                   class="p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                     isItemActive 
                       ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300' 
                       : 'hover:bg-white/5 text-slate-300'
                   }">
                <div class="flex items-center gap-2 overflow-hidden">
                  <span class="text-xs shrink-0">${icon}</span>
                  <span class="text-xs font-medium leading-tight truncate">${escapeHTML(item.title)}</span>
                </div>
                <span class="text-[10px] font-mono text-slate-400 shrink-0 ml-2 uppercase">${escapeHTML(item.type || "resource")}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function toggleModuleAccordion(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("hidden");
}

function selectClassroomResource(moduleId, resourceId) {
  activeModuleId = moduleId;
  activeResourceId = resourceId;

  const modules = getCohortModules();
  const currentMod = modules.find(m => m.id === moduleId);
  if (currentMod) {
    const list = currentMod.resources || currentMod.lessons || [];
    const item = list.find(r => r.id === resourceId);
    if (item) {
      renderViewer(item);
    }
  }

  renderClassroomSyllabus();
  if (window.NexcoApp?.showToast) {
    NexcoApp.showToast("Loaded session into classroom viewer.", "info");
  }
}

function selectClassroomLesson(lessonId) {
  const modules = getCohortModules();
  for (const m of modules) {
    const list = m.resources || m.lessons || [];
    const found = list.find(r => r.id === lessonId);
    if (found) {
      selectClassroomResource(m.id, lessonId);
      return;
    }
  }
}

function reloadActiveViewer() {
  if (activeResource) {
    renderViewer(activeResource);
    if (window.NexcoApp?.showToast) {
      NexcoApp.showToast("Classroom viewer reloaded.", "info");
    }
  }
}

function toggleFullscreenViewer() {
  const viewer = document.getElementById("lms-content-viewer");
  if (!viewer) return;

  isViewerFullscreen = !isViewerFullscreen;
  if (isViewerFullscreen) {
    viewer.classList.add("lms-viewer-fullscreen");
    document.body.style.overflow = "hidden";
  } else {
    viewer.classList.remove("lms-viewer-fullscreen");
    document.body.style.overflow = "";
  }
}

function copyMeetingLink(url) {
  const link = url || "https://meet.google.com";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(() => {
      if (window.NexcoApp?.showToast) {
        NexcoApp.showToast("📋 Google Meet link copied to clipboard!", "success");
      }
    }).catch(() => {
      prompt("Copy meeting link:", link);
    });
  } else {
    prompt("Copy meeting link:", link);
  }
}

// =========================================================================
// 4. INTERACTIVE SESSION NOTES
// =========================================================================
function initClassroomNotes() {
  renderNotesList();

  const addNoteBtn = document.getElementById("add-note-btn");
  const noteInput = document.getElementById("classroom-note-input");
  const exportBtn = document.getElementById("export-notes-btn");

  if (addNoteBtn && noteInput) {
    addNoteBtn.addEventListener("click", () => {
      const text = noteInput.value.trim();
      if (!text) {
        if (window.NexcoApp?.showToast) {
          NexcoApp.showToast("Please enter some text for your note.", "warning");
        }
        return;
      }

      userNotes.unshift({
        id: `note-${Date.now()}`,
        timestamp: activeResource ? activeResource.title : "Live Session",
        seconds: 0,
        text
      });

      noteInput.value = "";
      renderNotesList();
      if (window.NexcoApp?.showToast) {
        NexcoApp.showToast("📌 Note saved to session notebook!", "success");
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      let md = `# Nexco LearnHub Classroom Notes\n\n`;
      userNotes.forEach((n) => {
        md += `### ${n.timestamp}\n${n.text}\n\n`;
      });
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Nexco_Live_Classroom_Notes.md`;
      a.click();
      URL.revokeObjectURL(url);
      if (window.NexcoApp?.showToast) {
        NexcoApp.showToast("Notes exported as Markdown!", "success");
      }
    });
  }
}

function renderNotesList() {
  const container = document.getElementById("classroom-notes-list");
  if (!container) return;

  container.innerHTML = userNotes.map((note) => `
    <div class="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-all flex items-start justify-between gap-3 group">
      <div class="flex-1">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 font-semibold mb-1">
          📌 ${escapeHTML(note.timestamp)}
        </span>
        <p class="text-xs text-slate-300 leading-relaxed">${escapeHTML(note.text)}</p>
      </div>
      <button onclick="NexcoLMS.deleteNote('${note.id}')" 
              class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1" title="Delete note">
        ✕
      </button>
    </div>
  `).join("");
}

function deleteNote(id) {
  userNotes = userNotes.filter(n => n.id !== id);
  renderNotesList();
  if (window.NexcoApp?.showToast) {
    NexcoApp.showToast("Note removed.", "info");
  }
}

// =========================================================================
// 5. ASK NEXCO AI MENTOR (Bilingual Tamil & English)
// =========================================================================
function initClassroomAITutor() {
  const input = document.getElementById("classroom-ai-input");
  const sendBtn = document.getElementById("classroom-ai-send");
  const feed = document.getElementById("classroom-ai-feed");

  if (!input || !sendBtn || !feed) return;

  const handleSend = (preset) => {
    const q = preset || input.value.trim();
    if (!q) return;

    const userDiv = document.createElement("div");
    userDiv.className = "flex justify-end";
    userDiv.innerHTML = `<div class="max-w-[85%] p-3 rounded-2xl rounded-tr-none bg-emerald-600 text-white text-xs">${escapeHTML(q)}</div>`;
    feed.appendChild(userDiv);
    input.value = "";
    feed.scrollTop = feed.scrollHeight;

    setTimeout(() => {
      let ans = "";
      const lower = q.toLowerCase();
      if (lower.includes("tamil") || lower.includes("bilingual")) {
        ans = "Vanakkam! Yes, all our live classes and screen-share reviews are conducted bilingually in Tamil & English. Mentors explain tough engineering concepts in Tamil whenever you need extra clarity!";
      } else if (lower.includes("offline") || lower.includes("salem") || lower.includes("location") || lower.includes("address")) {
        ans = "Nexco's Registered HQ & Administration Office is located at **15/2, Sankar Nagar, Salem-7 (636007)**. All classes, labs, and mentor doubt sessions happen 100% Live Online over interactive Google Meet!";
      } else {
        ans = "Great question! When designing production systems, make sure to add composite B-Tree indexes on foreign keys in PostgreSQL and handle API errors gracefully. Bring this up in today's live office hours session!";
      }

      const botDiv = document.createElement("div");
      botDiv.className = "flex justify-start";
      botDiv.innerHTML = `
        <div class="max-w-[85%] p-3.5 rounded-2xl rounded-tl-none bg-slate-900 border border-emerald-500/30 text-slate-200 text-xs leading-relaxed space-y-1">
          <span class="text-emerald-400 font-bold text-[10px] block">Nexco Live AI Mentor</span>
          <div>${ans}</div>
        </div>
      `;
      feed.appendChild(botDiv);
      feed.scrollTop = feed.scrollHeight;
    }, 800);
  };

  sendBtn.addEventListener("click", () => handleSend());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });

  document.querySelectorAll(".ai-tutor-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      handleSend(chip.getAttribute("data-query"));
    });
  });
}

// =========================================================================
// 6. INTERACTIVE ASSESSMENT QUIZ
// =========================================================================
function initQuizEngine() {
  renderQuiz();

  const submitBtn = document.getElementById("quiz-submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", gradeQuiz);
  }

  const retakeBtn = document.getElementById("quiz-retake-btn");
  if (retakeBtn) {
    retakeBtn.addEventListener("click", () => {
      userQuizAnswers = {};
      renderQuiz();
      document.getElementById("quiz-result-card")?.classList.add("hidden");
      document.getElementById("quiz-submit-btn")?.classList.remove("hidden");
    });
  }
}

function renderQuiz() {
  const container = document.getElementById("quiz-questions-container");
  if (!container) return;

  const questions = [
    {
      id: "q-1",
      question: "Which HTTP status code should a backend API return upon successful creation of a new database record?",
      options: ["200 OK", "201 Created", "204 No Content", "301 Redirect"],
      correctIndex: 1,
      explanation: "201 Created is the standard HTTP status code indicating that the resource has been successfully created."
    },
    {
      id: "q-2",
      question: "In React 19, what is the primary benefit of Server Actions over traditional client fetch requests?",
      options: [
        "They only work with PHP servers",
        "They allow seamless server-side execution directly from form actions without manual fetch boilerplates",
        "They disable CSS stylesheets",
        "They make database queries slower"
      ],
      correctIndex: 1,
      explanation: "Server Actions allow form submissions to execute directly on the server runtime, automatically managing revalidations and pending states."
    }
  ];

  container.innerHTML = questions.map((q, idx) => `
    <div id="quiz-card-${q.id}" class="p-5 rounded-2xl bg-[#161D22] border border-white/10 mb-4 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-emerald-400">Question 0${idx + 1}</span>
        <span class="text-xs text-slate-500">50 XP</span>
      </div>
      <h4 class="text-sm font-semibold text-white mb-3">${q.question}</h4>
      <div class="space-y-2">
        ${q.options.map((opt, optIdx) => `
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-emerald-500/40 cursor-pointer transition-all">
            <input type="radio" name="question-${q.id}" value="${optIdx}" 
                   onchange="NexcoLMS.recordQuizChoice('${q.id}', ${optIdx})"
                   class="mt-0.5 text-emerald-500 focus:ring-emerald-500 bg-black/60 border-white/20" />
            <span class="text-xs text-slate-300">${opt}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function recordQuizChoice(qId, optIdx) {
  userQuizAnswers[qId] = optIdx;
}

function gradeQuiz() {
  if (Object.keys(userQuizAnswers).length < 2) {
    if (window.NexcoApp?.showToast) {
      NexcoApp.showToast("Please answer both questions before submitting!", "warning");
    }
    return;
  }

  let score = 0;
  if (userQuizAnswers["q-1"] === 1) score++;
  if (userQuizAnswers["q-2"] === 1) score++;

  const resultCard = document.getElementById("quiz-result-card");
  const scoreText = document.getElementById("quiz-score-text");

  if (resultCard && scoreText) {
    resultCard.classList.remove("hidden");
    scoreText.textContent = `${score}/2 (${score * 50}%)`;
    document.getElementById("quiz-submit-btn")?.classList.add("hidden");
    if (window.NexcoApp?.showToast) {
      NexcoApp.showToast(`Quiz completed! You scored ${score * 50}%`, "success");
    }
  }
}

// =========================================================================
// 7. PROJECT SUBMISSION DROPZONE (Pushes to Admin in Real Time!)
// =========================================================================
function initProjectSubmission() {
  // Support either #lms-assignment-form or #project-submission-form
  const form = document.getElementById("lms-assignment-form") || document.getElementById("project-submission-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const githubUrl = (document.getElementById("lms-assign-github") || document.getElementById("project-github-url"))?.value.trim();
    const deployUrl = (document.getElementById("lms-assign-deploy") || document.getElementById("project-deploy-url"))?.value.trim();
    const project = (document.getElementById("lms-assign-project") || document.getElementById("project-milestone"))?.value;
    const notes = (document.getElementById("lms-assign-notes") || document.getElementById("project-notes"))?.value.trim();

    if (!githubUrl || !githubUrl.includes("github.com")) {
      if (window.NexcoApp?.showToast) {
        NexcoApp.showToast("Please enter a valid GitHub repository URL.", "warning");
      }
      return;
    }

    const btn = form.querySelector("button[type='submit']");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "Submitting for Mentor Code Review...";
    }

    setTimeout(() => {
      if (window.NexcoStore) {
        NexcoStore.addProjectSubmission({
          studentName: "Subramanian Raman (Live Batch)",
          programTitle: project || "Full Stack Web Development",
          githubUrl,
          deployUrl: deployUrl || "None provided",
          notes: notes || "Submitted capstone repository."
        });
      }

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "Submit Project for Mentor Review ↗";
      }
      form.reset();

      updateSubmittedProjectStatus();
      if (window.NexcoApp?.showToast) {
        NexcoApp.showToast("🚀 Project submitted to mentors for line-by-line review!", "success");
      }
    }, 800);
  });
}

function updateSubmittedProjectStatus() {
  const statusCard = document.getElementById("project-status-card");
  const subs = window.NexcoStore ? NexcoStore.getProjectSubmissions() : [];
  if (statusCard && subs.length > 0) {
    const latest = subs[0];
    statusCard.classList.remove("hidden");
    const ghLink = document.getElementById("submitted-github-link");
    const depLink = document.getElementById("submitted-deploy-link");
    const stText = document.getElementById("submitted-status-text");

    if (ghLink) ghLink.textContent = latest.githubUrl;
    if (depLink) depLink.textContent = latest.deployUrl || "None";
    if (stText) stText.textContent = latest.status;

    if (latest.mentorFeedback) {
      const fbEl = document.getElementById("submitted-mentor-feedback");
      const fbRow = document.getElementById("submitted-feedback-row");
      if (fbEl) fbEl.textContent = latest.mentorFeedback;
      if (fbRow) fbRow.classList.remove("hidden");
    }
  }
}

// =========================================================================
// 8. LEADERBOARD & CERTIFICATES
// =========================================================================
function initLeaderboard() {
  const tbody = document.getElementById("leaderboard-tbody");
  if (!tbody) return;

  const learners = [
    { rank: 1, name: "K. Vigneshwaran (Salem)", xp: 6420, streak: 31, projects: 5, badge: "Master Architect", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" },
    { rank: 2, name: "M. Soundarya (Rasipuram)", xp: 5910, streak: 26, projects: 4, badge: "Bug Hunter", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" },
    { rank: 3, name: "R. Gokul (Namakkal)", xp: 5120, streak: 19, projects: 4, badge: "Hackathon Winner", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" },
    { rank: 4, name: "Subramanian Raman (You)", xp: 4850, streak: 12, projects: 3, badge: "Live Cohort #1", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", isCurrentUser: true }
  ];

  tbody.innerHTML = learners.map((item) => `
    <tr class="border-b border-white/5 ${item.isCurrentUser ? 'bg-emerald-500/10 font-semibold' : 'hover:bg-white/5'} transition-colors">
      <td class="py-3 px-4 text-xs font-mono">#${item.rank}</td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-2.5">
          <img src="${item.avatar}" class="w-7 h-7 rounded-full object-cover" />
          <span class="text-xs text-white ${item.isCurrentUser ? 'text-emerald-300 font-bold' : ''}">${item.name}</span>
        </div>
      </td>
      <td class="py-3 px-4 text-xs font-mono text-emerald-400 font-bold">${item.xp.toLocaleString()} XP</td>
      <td class="py-3 px-4 text-xs text-amber-400">🔥 ${item.streak} Days</td>
      <td class="py-3 px-4 text-xs text-slate-300">${item.projects} Shipped</td>
      <td class="py-3 px-4 text-xs">
        <span class="px-2 py-0.5 rounded-full text-[11px] bg-white/5 text-slate-300 border border-white/10">${item.badge}</span>
      </td>
    </tr>
  `).join("");
}

function initCertificate() {
  document.getElementById("cert-download-btn")?.addEventListener("click", () => {
    if (window.NexcoApp?.showToast) {
      NexcoApp.showToast("📄 Nexco Certified Full Stack Specialization credential downloaded!", "success");
    }
  });
}

function initWeeklyChart() {
  renderWeeklyChart();
}

function renderWeeklyChart() {
  const container = document.getElementById("weekly-chart-svg-container");
  if (!container) return;

  const data = [
    { day: "Mon", hours: 4.5, cohortAvg: 2.8 },
    { day: "Tue", hours: 5.2, cohortAvg: 3.1 },
    { day: "Wed", hours: 3.9, cohortAvg: 2.9 },
    { day: "Thu", hours: 6.0, cohortAvg: 3.4 },
    { day: "Fri", hours: 4.8, cohortAvg: 2.7 },
    { day: "Sat", hours: 7.5, cohortAvg: 4.8 },
    { day: "Sun", hours: 5.5, cohortAvg: 3.8 }
  ];

  const svgWidth = 420;
  const svgHeight = 160;
  const padLeft = 35;
  const padBottom = 25;
  const chartW = svgWidth - padLeft - 10;
  const chartH = svgHeight - padBottom - 10;
  const colW = chartW / data.length;

  let barsHtml = "";
  data.forEach((d, i) => {
    const x = padLeft + i * colW + 10;
    const barWidth = 18;
    const userH = (d.hours / 8.0) * chartH;
    const userY = chartH - userH + 10;
    const avgH = (d.cohortAvg / 8.0) * chartH;
    const avgY = chartH - avgH + 10;

    barsHtml += `
      <rect x="${x}" y="${avgY}" width="${barWidth}" height="${avgH}" rx="4" fill="rgba(255,255,255,0.08)"></rect>
      <rect x="${x + 6}" y="${userY}" width="${barWidth}" height="${userH}" rx="4" fill="#10B981" class="hover:opacity-80 transition-opacity">
        <title>${d.day}: ${d.hours}h (Cohort: ${d.cohortAvg}h)</title>
      </rect>
      <text x="${x + 12}" y="${svgHeight - 6}" font-size="10" fill="#94A3B8" text-anchor="middle" font-family="Plus Jakarta Sans">${d.day}</text>
    `;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-44 overflow-visible">
      <line x1="${padLeft}" y1="10" x2="${svgWidth - 10}" y2="10" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"></line>
      <line x1="${padLeft}" y1="${chartH / 2 + 10}" x2="${svgWidth - 10}" y2="${chartH / 2 + 10}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"></line>
      <line x1="${padLeft}" y1="${chartH + 10}" x2="${svgWidth - 10}" y2="${chartH + 10}" stroke="rgba(255,255,255,0.15)"></line>
      <text x="${padLeft - 8}" y="14" font-size="9" fill="#64748B" text-anchor="end">8h</text>
      <text x="${padLeft - 8}" y="${chartH / 2 + 14}" font-size="9" fill="#64748B" text-anchor="end">4h</text>
      <text x="${padLeft - 8}" y="${chartH + 10}" font-size="9" fill="#64748B" text-anchor="end">0h</text>
      ${barsHtml}
    </svg>
  `;
}

// Global API
window.NexcoLMS = {
  switchLMSTab,
  toggleModuleAccordion,
  selectClassroomLesson,
  selectClassroomResource,
  reloadActiveViewer,
  toggleFullscreenViewer,
  copyMeetingLink,
  deleteNote,
  recordQuizChoice,
  gradeQuiz
};
