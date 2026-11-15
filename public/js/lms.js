// Nexco LearnHub LMS Engine (Dynamic & Connected to NexcoStore)

document.addEventListener("DOMContentLoaded", () => {
  initLMSNavigation();
  initClassroomPlayer();
  initClassroomNotes();
  initClassroomAITutor();
  initQuizEngine();
  initProjectSubmission();
  initLeaderboard();
  initCertificate();
  initWeeklyChart();
  renderLMSLiveSessionBanner();

  // Re-render when live sessions or courses change in Admin
  NexcoStore.subscribe("sessions", () => {
    renderLMSLiveSessionBanner();
  });
  NexcoStore.subscribe("submissions", () => {
    updateSubmittedProjectStatus();
  });
});

let currentLmsTab = "dashboard";
let activeLessonId = "les-2-2";
let userNotes = [
  { id: "n-1", timestamp: "08:15", seconds: 495, text: "Live online screen-share lab on Saturday will cover PostgreSQL index optimization with pgbench." },
  { id: "n-2", timestamp: "18:40", seconds: 1120, text: "Remember to configure connection pooling using PgBouncer for high concurrency." }
];
let isVideoPlaying = false;
let videoCurrentTime = 840;
let videoDuration = 2535;
let playbackSpeed = 1.0;
let userQuizAnswers = {};

// 1. LMS Live Class Banner (Dynamically triggered by Admin!)
function renderLMSLiveSessionBanner() {
  const container = document.getElementById("lms-live-class-alert");
  if (!container) return;

  const sessions = NexcoStore.getLiveSessions();
  const liveNow = sessions.find(s => s.status === "LIVE NOW");

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
              <span class="px-2 py-0.2 rounded text-[10px] font-extrabold bg-red-500 text-white uppercase">🔴 Class is Live Now</span>
              <span class="text-xs text-red-200 font-mono">${liveNow.batch}</span>
            </div>
            <h4 class="text-sm font-bold text-white mt-0.5">${liveNow.title}</h4>
            <div class="text-[11px] text-red-200/90">Mentor: ${liveNow.mentorName} • Google Meet Active</div>
          </div>
        </div>
        <a href="${liveNow.meetingLink}" target="_blank" 
           class="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-red-950 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 shrink-0">
          <span>Join Live Session ↗</span>
        </a>
      </div>
    `;
  } else {
    // Show upcoming session pill
    const upcoming = sessions.find(s => s.status === "Seats Filling Fast" || s.status === "Upcoming Workshop");
    if (upcoming) {
      container.classList.remove("hidden");
      container.innerHTML = `
        <div class="rounded-xl p-3 bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">📅 Next Live Session</span>
            <span class="text-white font-medium">${upcoming.title} (${upcoming.dateTime})</span>
          </div>
          <a href="${upcoming.meetingLink}" target="_blank" class="text-emerald-400 hover:underline font-semibold text-[11px]">
            Save Meet Link →
          </a>
        </div>
      `;
    } else {
      container.classList.add("hidden");
    }
  }
}

// 2. LMS Navigation
function initLMSNavigation() {
  const navItems = document.querySelectorAll(".lms-nav-item");
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      if (tab === "website") {
        NexcoApp.switchView("landing");
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
  }
}

// 3. Classroom Video Player Logic
function initClassroomPlayer() {
  const playBtn = document.getElementById("classroom-play-toggle");
  const scrubber = document.getElementById("classroom-scrubber");
  const speedBtn = document.getElementById("classroom-speed-btn");
  const timeDisplay = document.getElementById("classroom-time-display");
  const video = document.getElementById("classroom-video-element");

  if (!video || !playBtn) return;

  video.addEventListener("timeupdate", () => {
    videoCurrentTime = video.currentTime;
    if (video.duration) videoDuration = video.duration;
    updateTimeDisplay();
    if (scrubber) scrubber.value = (videoCurrentTime / videoDuration) * 100;
  });

  video.addEventListener("play", () => {
    isVideoPlaying = true;
    updatePlayButtonIcon();
  });

  video.addEventListener("pause", () => {
    isVideoPlaying = false;
    updatePlayButtonIcon();
  });

  playBtn.addEventListener("click", () => {
    if (video.paused) {
      video.play().catch(e => console.log("Autoplay policy:", e));
    } else {
      video.pause();
    }
  });

  if (scrubber) {
    scrubber.addEventListener("input", (e) => {
      const pct = parseFloat(e.target.value);
      video.currentTime = (pct / 100) * videoDuration;
    });
  }

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
  let speedIdx = 1;
  if (speedBtn) {
    speedBtn.addEventListener("click", () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      playbackSpeed = speeds[speedIdx];
      video.playbackRate = playbackSpeed;
      speedBtn.textContent = `${playbackSpeed}x`;
      NexcoApp.showToast(`Playback speed set to ${playbackSpeed}x`, "info");
    });
  }

  setupChapterMarkers();
  renderClassroomSyllabus();
}

function updatePlayButtonIcon() {
  const playBtn = document.getElementById("classroom-play-toggle");
  if (!playBtn) return;
  if (isVideoPlaying) {
    playBtn.innerHTML = `
      <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
        <rect x="6" y="4" width="4" height="16" rx="1"></rect>
        <rect x="14" y="4" width="4" height="16" rx="1"></rect>
      </svg>
    `;
  } else {
    playBtn.innerHTML = `
      <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `;
  }
}

function updateTimeDisplay() {
  const timeDisplay = document.getElementById("classroom-time-display");
  if (!timeDisplay) return;

  const fmt = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  timeDisplay.textContent = `${fmt(videoCurrentTime)} / ${fmt(videoDuration)}`;
}

function seekToSeconds(seconds) {
  const video = document.getElementById("classroom-video-element");
  if (video) {
    video.currentTime = seconds;
    video.play().catch(() => {});
    NexcoApp.showToast(`Seeked to ${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`, "info");
  }
}

function setupChapterMarkers() {
  const container = document.getElementById("classroom-chapters-list");
  if (!container) return;

  const chapters = [
    { time: "00:00", title: "Setup React 19 & Python API Environment" },
    { time: "08:15", title: "Salem Retail SaaS DB Schema Design" },
    { time: "18:40", title: "Bilingual Tamil/English Localization Setup" },
    { time: "32:10", title: "Benchmarking Query Performance & Docker Build" }
  ];

  container.innerHTML = chapters.map((ch) => {
    const [m, s] = ch.time.split(":").map(Number);
    const sec = m * 60 + s;
    return `
      <button onclick="NexcoLMS.seekToSeconds(${sec})" 
              class="w-full text-left p-2.5 rounded-lg bg-black/40 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between group">
        <div class="flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></span>
          <span class="text-xs text-slate-300 group-hover:text-emerald-300 font-medium">${ch.title}</span>
        </div>
        <span class="text-[11px] font-mono text-emerald-400/80 px-2 py-0.5 rounded bg-emerald-500/10">${ch.time}</span>
      </button>
    `;
  }).join("");
}

function renderClassroomSyllabus() {
  const container = document.getElementById("classroom-syllabus-accordion");
  if (!container) return;

  const modules = [
    {
      id: "mod-1",
      title: "Module 1: Modern Web Foundations & Git",
      completed: true,
      lessons: [
        { id: "les-1-1", title: "1.1 HTML5 Semantic Canvas & Clean Git Workflow", duration: "32:10", completed: true },
        { id: "les-1-2", title: "1.2 Modern JavaScript ES2026 & Async Runtime", duration: "45:20", completed: true }
      ]
    },
    {
      id: "mod-2",
      title: "Module 2: React 19, TypeScript & Backend APIs",
      completed: false,
      active: true,
      lessons: [
        { id: "les-2-1", title: "2.1 React 19 Server Components & Actions", duration: "28:15", completed: true },
        { id: "les-2-2", title: "2.2 Building Production REST & FastAPIs", duration: "42:15", completed: false, active: true },
        { id: "les-2-3", title: "2.3 PostgreSQL Schema & High-Throughput Indexes", duration: "34:50", completed: false }
      ]
    },
    {
      id: "mod-3",
      title: "Module 3: AI Tools & Workflow Automation (n8n/Ollama)",
      completed: false,
      lessons: [
        { id: "les-3-1", title: "3.1 Prompt Engineering & Local LLM Integration", duration: "36:00", completed: false },
        { id: "les-3-2", title: "3.2 Autonomous Copilots for Business Systems", duration: "48:30", completed: false }
      ]
    }
  ];

  container.innerHTML = modules.map((mod, modIdx) => `
    <div class="rounded-xl border border-white/10 bg-[#161D22] overflow-hidden mb-3">
      <button onclick="NexcoLMS.toggleModuleAccordion('mod-body-${mod.id}')"
              class="w-full p-3.5 bg-black/30 flex items-center justify-between text-left hover:bg-black/50 transition-colors">
        <div class="flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-md ${mod.completed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-500 text-black font-bold'} flex items-center justify-center text-xs">
            ${mod.completed ? '✓' : `0${modIdx + 1}`}
          </span>
          <span class="text-xs font-bold text-white">${mod.title}</span>
        </div>
        <span class="text-slate-400 text-xs">▼</span>
      </button>

      <div id="mod-body-${mod.id}" class="p-2 space-y-1.5 bg-black/20">
        ${mod.lessons.map(les => `
          <div onclick="NexcoLMS.selectClassroomLesson('${les.id}')" 
               class="p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                 les.id === activeLessonId 
                   ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300' 
                   : 'hover:bg-white/5 text-slate-300'
               }">
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${les.completed ? 'bg-emerald-500 text-black font-bold' : les.id === activeLessonId ? 'border-2 border-emerald-400' : 'border border-slate-600'}">
                ${les.completed ? '✓' : ''}
              </span>
              <span class="text-xs font-medium leading-tight">${les.title}</span>
            </div>
            <span class="text-[10px] font-mono text-slate-400 shrink-0 ml-2">${les.duration}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function toggleModuleAccordion(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("hidden");
}

function selectClassroomLesson(lessonId) {
  activeLessonId = lessonId;
  renderClassroomSyllabus();
  NexcoApp.showToast(`Switched active lesson. Video loaded.`, "info");
}

// 4. Timestamped Notes
function initClassroomNotes() {
  renderNotesList();

  const addNoteBtn = document.getElementById("add-note-btn");
  const noteInput = document.getElementById("classroom-note-input");
  const exportBtn = document.getElementById("export-notes-btn");

  if (addNoteBtn && noteInput) {
    addNoteBtn.addEventListener("click", () => {
      const text = noteInput.value.trim();
      if (!text) {
        NexcoApp.showToast("Please enter some text for your note.", "warning");
        return;
      }

      const video = document.getElementById("classroom-video-element");
      const currentSec = video ? Math.floor(video.currentTime) : 0;
      const mins = Math.floor(currentSec / 60);
      const secs = Math.floor(currentSec % 60);
      const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

      userNotes.unshift({
        id: `note-${Date.now()}`,
        timestamp: timeStr,
        seconds: currentSec,
        text
      });

      noteInput.value = "";
      renderNotesList();
      NexcoApp.showToast(`📌 Note saved at [${timeStr}]`, "success");
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      let md = `# Nexco LearnHub Notes - Salem Batch #14\n\n`;
      userNotes.forEach((n) => {
        md += `- **[${n.timestamp}]**: ${n.text}\n`;
      });
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Nexco_Classroom_Notes.md`;
      a.click();
      URL.revokeObjectURL(url);
      NexcoApp.showToast("Notes exported as Markdown!", "success");
    });
  }
}

function renderNotesList() {
  const container = document.getElementById("classroom-notes-list");
  if (!container) return;

  container.innerHTML = userNotes.map((note) => `
    <div class="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-all flex items-start justify-between gap-3 group">
      <div class="flex-1">
        <button onclick="NexcoLMS.seekToSeconds(${note.seconds})" 
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-black font-semibold transition-all mb-1.5">
          <span>▶ ${note.timestamp}</span>
        </button>
        <p class="text-xs text-slate-300 leading-relaxed">${note.text}</p>
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
  NexcoApp.showToast("Note removed.", "info");
}

// 5. Ask Nexco AI Tutor
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
    userDiv.innerHTML = `<div class="max-w-[85%] p-3 rounded-2xl rounded-tr-none bg-emerald-600 text-white text-xs">${q}</div>`;
    feed.appendChild(userDiv);
    input.value = "";
    feed.scrollTop = feed.scrollHeight;

    setTimeout(() => {
      let ans = "";
      const lower = q.toLowerCase();
      if (lower.includes("tamil") || lower.includes("bilingual")) {
        ans = "Vanakkam! Yes, all 100% live online classes and live screen-share doubt sessions are conducted bilingually in Tamil & English. Mentors explain architectural logic in Tamil whenever needed!";
      } else if (lower.includes("offline") || lower.includes("salem") || lower.includes("lab") || lower.includes("address") || lower.includes("location")) {
        ans = "Nexco's Registered Headquarters & Administration Office is located at **15/2, Sankar Nagar, Salem-7 (636007)**. All classes, code reviews, and live masterclasses are conducted 100% Live Online with interactive screen-share guidance.";
      } else {
        ans = "Great question! In our production stack, we ensure database queries are indexed with composite B-Trees in PostgreSQL, and we wrap backend endpoints with async handlers in FastAPI. Feel free to bring this to today's live office hours!";
      }

      const botDiv = document.createElement("div");
      botDiv.className = "flex justify-start";
      botDiv.innerHTML = `
        <div class="max-w-[85%] p-3.5 rounded-2xl rounded-tl-none bg-slate-900 border border-emerald-500/30 text-slate-200 text-xs leading-relaxed space-y-1">
          <span class="text-emerald-400 font-bold text-[10px] block">Nexco Live AI Tutor</span>
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

// 6. Interactive Quiz Engine
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
      question: "Which HTTP status code should a FastAPI backend return upon successful creation of a new database record?",
      options: ["200 OK", "201 Created", "204 No Content", "301 Redirect"],
      correctIndex: 1,
      explanation: "201 Created is the standard HTTP status code indicating that the resource has been successfully created."
    },
    {
      id: "q-2",
      question: "In React 19, what is the primary benefit of Server Actions over traditional REST mutation fetches?",
      options: [
        "They only work with PHP servers",
        "They allow seamless server-side execution directly from form actions without manual fetch boilerplates",
        "They disable CSS stylesheets",
        "They make databases slower"
      ],
      correctIndex: 1,
      explanation: "Server Actions allow forms and functions to execute directly on the server runtime, automatically managing revalidations and pending states."
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
      <div id="explanation-${q.id}" class="hidden mt-3 p-3 rounded-xl text-xs"></div>
    </div>
  `).join("");
}

function recordQuizChoice(qId, optIdx) {
  userQuizAnswers[qId] = optIdx;
}

function gradeQuiz() {
  if (Object.keys(userQuizAnswers).length < 2) {
    NexcoApp.showToast("Please answer both questions before submitting!", "warning");
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
    NexcoApp.showToast(`Quiz completed! You scored ${score * 50}%`, "success");
  }
}

// 7. Project Submission Dropzone (Pushes to Admin Panel in Real Time!)
function initProjectSubmission() {
  const form = document.getElementById("project-submission-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const githubUrl = document.getElementById("project-github-url")?.value.trim();
    const deployUrl = document.getElementById("project-deploy-url")?.value.trim();
    const notes = document.getElementById("project-notes")?.value.trim();

    if (!githubUrl || !githubUrl.includes("github.com")) {
      NexcoApp.showToast("Please enter a valid GitHub repository URL.", "warning");
      return;
    }

    const btn = document.getElementById("project-submit-btn");
    btn.disabled = true;
    btn.innerHTML = "Submitting to Staff Architect in Salem Hub...";

    setTimeout(() => {
      // Add submission directly to reactive store (Admin sees this immediately!)
      NexcoStore.addProjectSubmission({
        studentName: "Alex Rivera / Anand K. (Cohort #14)",
        programTitle: "Full Stack Web Development",
        githubUrl,
        deployUrl: deployUrl || "None provided",
        notes: notes || "Submitted capstone repository."
      });

      btn.disabled = false;
      btn.innerHTML = "Submit Project for Staff Review";
      form.reset();

      updateSubmittedProjectStatus();
      NexcoApp.showToast("🚀 Capstone project submitted to Salem Staff Mentors for code review!", "success");
    }, 1000);
  });
}

function updateSubmittedProjectStatus() {
  const statusCard = document.getElementById("project-status-card");
  const subs = NexcoStore.getProjectSubmissions();
  if (statusCard && subs.length > 0) {
    const latest = subs[0];
    statusCard.classList.remove("hidden");
    document.getElementById("submitted-github-link").textContent = latest.githubUrl;
    document.getElementById("submitted-deploy-link").textContent = latest.deployUrl || "None";
    document.getElementById("submitted-status-text").textContent = latest.status;

    if (latest.mentorFeedback) {
      document.getElementById("submitted-mentor-feedback").textContent = latest.mentorFeedback;
      document.getElementById("submitted-feedback-row").classList.remove("hidden");
    }
  }
}

// 8. Leaderboard & Certificates
function initLeaderboard() {
  const tbody = document.getElementById("leaderboard-tbody");
  if (!tbody) return;

  const learners = [
    { rank: 1, name: "K. Vigneshwaran (Salem)", xp: 6420, streak: 31, projects: 5, badge: "Master Architect", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" },
    { rank: 2, name: "M. Soundarya (Rasipuram)", xp: 5910, streak: 26, projects: 4, badge: "Bug Hunter", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" },
    { rank: 3, name: "R. Gokul (Namakkal)", xp: 5120, streak: 19, projects: 4, badge: "Hackathon Winner", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" },
    { rank: 4, name: "Alex Rivera / Anand K. (You)", xp: 4850, streak: 12, projects: 3, badge: "Salem Cohort #14", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", isCurrentUser: true }
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
    NexcoApp.showToast("📄 Nexco Salem Certified Full Stack Specialization PDF downloaded!", "success");
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
  seekToSeconds,
  toggleModuleAccordion,
  selectClassroomLesson,
  deleteNote,
  recordQuizChoice
};
