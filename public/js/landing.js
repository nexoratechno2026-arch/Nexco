// Nexco Public Landing Page Logic (Dynamic & Salem, Tamil Nadu Localized)
// 100% Live Interactive Online Classes — Learn from Anywhere with Live Mentor Guidance in Tamil & English
// Listens to NexcoStore for Real-Time Updates

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
  initSiteSettings();
  renderCharterCards();
  initLiveAnnouncementBar();
  initHeroLeadForm();
  initDynamicCoursesCatalog();
  initLiveWorkshopsSection();
  initDiagnosticConfigurator();
  initSyllabusUnlockForm();
  initVideoShowcase();
  initCounselingModal();
  initDynamicFeedbackSection();

  // Re-render when store updates
  NexcoStore.subscribe("siteSettings", () => {
    initSiteSettings();
    renderCharterCards();
    initLiveAnnouncementBar();
  });
  NexcoStore.subscribe("charter", () => renderCharterCards());
  NexcoStore.subscribe("courses", () => initDynamicCoursesCatalog());
  NexcoStore.subscribe("sessions", () => initLiveWorkshopsSection());
  NexcoStore.subscribe("announcement", () => initLiveAnnouncementBar());
  NexcoStore.subscribe("feedbacks", () => initDynamicFeedbackSection());
});

// 1. Live Dynamic Site Settings (Hero, Promo Banner, Bento Grid, Contact)
function initSiteSettings() {
  const settings = NexcoStore.getSiteSettings();
  if (!settings) return;

  // Hero Section
  const heroBadge = document.getElementById("hero-collaboration-badge");
  const heroHeadline = document.getElementById("hero-display-headline");
  const heroSubheadline = document.getElementById("hero-display-subheadline");
  const heroCtaExplore = document.getElementById("hero-cta-explore");
  const heroCtaMasterclass = document.getElementById("hero-cta-masterclass");
  const heroFormTitle = document.getElementById("hero-form-title");
  const heroFormSub = document.getElementById("hero-form-sub");

  const badgeVal = settings.heroCollabBadge || settings.hero?.collaborationBadge || settings.hero?.badge;
  if (heroBadge && badgeVal) heroBadge.textContent = badgeVal;

  const headlineVal = settings.heroHeadline || settings.hero?.headline;
  if (heroHeadline && headlineVal) heroHeadline.innerHTML = escapeHTML(headlineVal).replace(/\n/g, "<br/>");

  const subheadlineVal = settings.heroSubheadline || settings.hero?.subheadline;
  if (heroSubheadline && subheadlineVal) heroSubheadline.textContent = subheadlineVal;

  const ctaPrimaryVal = settings.heroPrimaryCta || settings.hero?.primaryCtaText || settings.hero?.ctaPrimaryText;
  if (heroCtaExplore && ctaPrimaryVal) heroCtaExplore.textContent = ctaPrimaryVal;

  const ctaSecondaryVal = settings.heroSecondaryCta || settings.hero?.secondaryCtaText || settings.hero?.ctaSecondaryText;
  if (heroCtaMasterclass && ctaSecondaryVal) heroCtaMasterclass.textContent = ctaSecondaryVal;

  const leadTitleVal = settings.leadCardTitle || settings.hero?.leadCardTitle || settings.hero?.counselingCardTitle;
  if (heroFormTitle && leadTitleVal) heroFormTitle.textContent = leadTitleVal;

  const leadSubVal = settings.leadCardSubtitle || settings.hero?.leadCardSub || settings.hero?.counselingCardSubtitle;
  if (heroFormSub && leadSubVal) heroFormSub.textContent = leadSubVal;

  // Promotional Banner
  const promoBadge = document.getElementById("promo-banner-badge");
  const promoTitle = document.getElementById("promo-banner-title");
  const promoSub = document.getElementById("promo-banner-sub");

  const promoBadgeVal = settings.promoBadge || settings.promoBanner?.badge;
  if (promoBadge && promoBadgeVal) promoBadge.textContent = promoBadgeVal;

  const promoTitleVal = settings.promoHeadline || settings.promoBanner?.title;
  if (promoTitle && promoTitleVal) promoTitle.textContent = promoTitleVal;

  const promoSubVal = settings.promoSubtitle || settings.promoBanner?.subtitle;
  if (promoSub && promoSubVal) promoSub.textContent = promoSubVal;

  // Bento Grid Cards
  const card1Title = document.getElementById("bento-card1-title");
  const card1Desc = document.getElementById("bento-card1-desc");
  const card2Title = document.getElementById("bento-card2-title");
  const card2Desc = document.getElementById("bento-card2-desc");
  const card3Title = document.getElementById("bento-card3-title");
  const card3Desc = document.getElementById("bento-card3-desc");

  const b1t = settings.bento1Title || settings.bento?.card1Title;
  if (card1Title && b1t) card1Title.textContent = b1t;

  const b1d = settings.bento1Desc || settings.bento?.card1Desc;
  if (card1Desc && b1d) card1Desc.textContent = b1d;

  const b2t = settings.bento2Title || settings.bento?.card2Title;
  if (card2Title && b2t) card2Title.textContent = b2t;

  const b2d = settings.bento2Desc || settings.bento?.card2Desc;
  if (card2Desc && b2d) card2Desc.textContent = b2d;

  const b3t = settings.bento3Title || settings.bento?.card3Title;
  if (card3Title && b3t) card3Title.textContent = b3t;

  const b3d = settings.bento3Desc || settings.bento?.card3Desc;
  if (card3Desc && b3d) card3Desc.textContent = b3d;

  // Contact Info
  const phoneEls = document.querySelectorAll(".contact-phone-display");
  const emailEls = document.querySelectorAll(".contact-email-display");
  const addressEls = document.querySelectorAll(".contact-address-display");
  const waLinks = document.querySelectorAll(".contact-wa-link");

  const phoneVal = settings.phone || settings.contact?.phone || "+91 93451 21988";
  const emailVal = settings.email || settings.contact?.email || "admissions@nexco.in";
  const addrVal = settings.displayAddress || settings.registeredAddress || settings.contact?.displayAddress || settings.contact?.address || "15/2, Sankar Nagar, Salem-7, Tamil Nadu";

  phoneEls.forEach(el => { el.textContent = phoneVal; });
  emailEls.forEach(el => { el.textContent = emailVal; });
  addressEls.forEach(el => { el.textContent = addrVal; });

  const cleanNum = phoneVal.replace(/[^0-9]/g, "");
  waLinks.forEach(el => {
    el.href = `https://wa.me/${cleanNum}?text=${encodeURIComponent("Vanakkam Nexco! I would like to inquire about 100% Live Online batches.")}`;
  });
}

// 2. Render Honest Charter Cards (Dynamic from State)
function renderCharterCards() {
  const container = document.getElementById("charter-cards-grid");
  if (!container) return;

  const charterList = NexcoStore.getCharter();
  container.innerHTML = charterList.map((item, idx) => `
    <div class="reveal-up card-3d-hover delay-${((idx % 4) + 1) * 100} rounded-2xl p-6 bg-[#12171A] border border-white/10 hover:border-emerald-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-4">
          <span class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-mono text-sm font-bold">
            0${idx + 1}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-emerald-400 border border-white/10">
            Official Commitment
          </span>
        </div>
        <h4 class="text-base font-bold text-white mb-2 leading-snug">
          ${escapeHTML(item.title)}
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-4">
          ${escapeHTML(item.desc)}
        </p>
      </div>
      <div class="pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>${escapeHTML(item.tag || "Transparent Standard")}</span>
      </div>
    </div>
  `).join("");

  if (window.initScrollReveal) window.initScrollReveal();
}

// 3. Live Top Announcement Banner (Controlled by Admin)
function initLiveAnnouncementBar() {
  const bar = document.getElementById("top-live-announcement-bar");
  if (!bar) return;

  const settings = (window.NexcoStore && NexcoStore.getSiteSettings()) || {};
  const ann = (window.NexcoStore && NexcoStore.getAnnouncement()) || {};

  const isVisible = settings.bannerVisible !== undefined ? settings.bannerVisible : (ann.active !== false);
  if (!isVisible) {
    bar.classList.add("hidden");
    return;
  }

  bar.classList.remove("hidden");
  const badgeEl = document.getElementById("top-ann-badge");
  const textEl = document.getElementById("top-ann-text");
  const ctaEl = document.getElementById("top-ann-cta");

  if (badgeEl) badgeEl.textContent = settings.bannerBadge || ann.badge || "Live Online Batches";
  if (textEl) textEl.textContent = settings.bannerText || ann.text || "";
  if (ctaEl) {
    ctaEl.textContent = settings.bannerCtaText || ann.ctaText || "Book a free demo session →";
    ctaEl.href = settings.bannerCtaLink || ann.ctaLink || "#workshops";
  }
}

// 4. Hero Lead Capture Form (Push to Admin Leads in Real Time)
function initHeroLeadForm() {
  const form = document.getElementById("hero-lead-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("hero-lead-name")?.value.trim();
    const email = document.getElementById("hero-lead-email")?.value.trim();
    const phone = document.getElementById("hero-lead-phone")?.value.trim();
    const cityCollege = document.getElementById("hero-lead-city")?.value.trim();
    const program = document.getElementById("hero-lead-track")?.value;
    const honeypot = document.getElementById("hero-lead-honeypot")?.value.trim() || "";
    const submitBtn = document.getElementById("hero-lead-submit");

    if (!name || !email || !phone) {
      NexcoApp.showToast("Please fill in your name, email and mobile number.", "warning");
      return;
    }

    // Validate 10-digit Indian Mobile Number
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      NexcoApp.showToast("Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).", "warning");
      return;
    }

    const orig = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="inline-flex items-center gap-2">
        <svg class="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        Registering with Admissions Team...
      </span>
    `;

    setTimeout(() => {
      // Push lead to reactive state store
      const newLead = NexcoStore.addLead({
        name,
        email,
        phone: cleanPhone,
        city: cityCollege || "Tamil Nadu / Online Learner",
        track: program || "Full Stack Web Development",
        source: "Hero Lead Form",
        website_url: honeypot
      });

      submitBtn.disabled = false;
      submitBtn.innerHTML = orig;
      form.reset();

      NexcoApp.showToast(`🎉 Vanakkam ${name}! Your inquiry has been sent to our admissions team. We've notified Lead Mentor Karthik Sundaram.`, "success");

      // Open WhatsApp connect prompt
      openWhatsAppConnectModal(name, cleanPhone, program);
    }, 800);
  });
}

function openWhatsAppConnectModal(name, phone, program) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(`Vanakkam Nexco Salem! I am ${name} from Tamil Nadu. I just submitted my inquiry for the 100% Live Online ${program} batch. Could you share the live session schedule, 1-on-1 mentor review details, and fee structure?`);
  const settings = NexcoStore.getSiteSettings();
  const rawNum = settings?.contact?.phone || "9345121988";
  const targetNum = rawNum.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${targetNum.startsWith("91") ? targetNum : "91" + targetNum}?text=${text}`;

  const modal = document.getElementById("wa-direct-modal");
  const linkBtn = document.getElementById("wa-direct-modal-link");
  if (modal && linkBtn) {
    linkBtn.href = waUrl;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeWhatsAppConnectModal() {
  const modal = document.getElementById("wa-direct-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// 5. Dynamic Courses Catalog Filtering & Rendering
let currentCourseFilter = "all";

function initDynamicCoursesCatalog() {
  renderCoursesGrid();
  setupCourseFilterPills();
}

function setupCourseFilterPills() {
  const filterButtons = document.querySelectorAll(".course-filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("tab-active", "bg-emerald-500", "text-black", "font-bold");
        b.classList.add("text-slate-400", "bg-slate-900/60", "hover:text-white");
      });
      btn.classList.add("tab-active", "bg-emerald-500", "text-black", "font-bold");
      btn.classList.remove("text-slate-400", "bg-slate-900/60", "hover:text-white");

      currentCourseFilter = btn.getAttribute("data-filter") || "all";
      renderCoursesGrid();
    });
  });
}

function renderCoursesGrid() {
  const container = document.getElementById("courses-grid-container");
  if (!container) return;

  const allCourses = NexcoStore.getCourses();
  const filtered = currentCourseFilter === "all" 
    ? allCourses 
    : allCourses.filter(c => c.category === currentCourseFilter);

  container.innerHTML = "";

  filtered.forEach((course, idx) => {
    const card = document.createElement("div");
    card.className = `reveal-up card-3d-hover delay-${((idx % 3) + 1) * 100} group relative rounded-2xl bg-[#12171A] border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-xl`;

    const skillsHtml = (course.skills || []).slice(0, 4).map(s => 
      `<span class="px-2.5 py-1 text-xs rounded-md bg-white/5 text-slate-300 border border-white/5 font-mono">${escapeHTML(s)}</span>`
    ).join("");

    const displayBatchMode = "100% Live Online Interactive Classes";

    card.innerHTML = `
      <div>
        <!-- Top Visual Thumbnail Banner -->
        <div class="relative h-48 w-full overflow-hidden">
          <img src="${escapeHTML(course.thumbnail) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}" 
               alt="${escapeHTML(course.title)}" 
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#12171A] via-black/40 to-transparent"></div>
          
          <div class="absolute top-3 left-3 flex items-center gap-2">
            <span class="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-500 text-slate-950 shadow-md">
              ${escapeHTML(course.categoryLabel ? course.categoryLabel.toUpperCase() : 'PROGRAM')}
            </span>
            <span class="px-2.5 py-1 text-[10px] font-bold rounded-md bg-black/70 text-slate-200 border border-white/10 backdrop-blur-md">
              ${escapeHTML(course.badge || 'Flagship')}
            </span>
          </div>

          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
            <div class="flex items-center gap-1 font-bold text-amber-400">
              ★ ${course.rating || '4.9'} <span class="text-slate-300 font-normal text-[11px]">(${course.reviewsCount || 120})</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-emerald-300 border border-emerald-500/30">
              ${displayBatchMode}
            </span>
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-6">
          <div class="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 mb-2 font-semibold">
            <span>🤝</span>
            <span>Joint Track: Nexora Techno × Gencode</span>
          </div>
          <h3 class="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug mb-2">
            ${escapeHTML(course.title)}
          </h3>
          <p class="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            ${escapeHTML(course.description)}
          </p>

          <!-- Mentor details -->
          <div class="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 mb-4 text-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span class="text-slate-300 font-medium">Mentor: ${escapeHTML(course.mentorName || 'Karthik Sundaram (Lead Architect)')}</span>
          </div>

          <!-- Metrics Row -->
          <div class="grid grid-cols-2 gap-2 py-2.5 px-3 rounded-xl bg-black/40 border border-white/5 mb-4 text-xs">
            <div class="flex items-center gap-2 text-slate-300">
              <span class="text-emerald-400">⏱</span>
              <span>${escapeHTML(course.duration)}</span>
            </div>
            <div class="flex items-center gap-2 text-slate-300">
              <span class="text-emerald-400">💻</span>
              <span>100% Live Online</span>
            </div>
          </div>

          <!-- Skills tags -->
          <div class="flex flex-wrap gap-1.5 mb-2">
            ${skillsHtml}
          </div>
        </div>
      </div>

      <!-- Card Footer Actions (NO PAYMENT GATEWAY) -->
      <div class="p-6 pt-0 border-t border-white/5 mt-4 flex flex-col sm:flex-row items-center gap-2.5">
        <button onclick="NexcoLanding.openSyllabusModal('${course.id}')" 
                class="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-1.5">
          <span>View Live Curriculum</span>
          <span>↗</span>
        </button>

        <button onclick="NexcoLanding.openCounselingModal('${course.id}')" 
                class="btn-shimmer w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/20 flex items-center justify-center gap-1">
          <span>Enroll via Counselor</span>
          <span>→</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  if (window.initScrollReveal) window.initScrollReveal();
}

// 6. Live & Upcoming Masterclasses / Workshops Section
function initLiveWorkshopsSection() {
  const container = document.getElementById("workshops-grid-container");
  if (!container) return;

  const sessions = NexcoStore.getLiveSessions();
  container.innerHTML = "";

  sessions.forEach((sess, idx) => {
    const isLive = sess.status === "LIVE NOW";
    const card = document.createElement("div");
    card.className = `reveal-up card-3d-hover delay-${((idx % 3) + 1) * 100} rounded-2xl p-6 bg-[#12171A] border transition-all duration-300 shadow-xl flex flex-col justify-between ${
      isLive ? 'border-red-500/60 shadow-red-500/10 glow-border-hover' : 'border-white/10 hover:border-emerald-500/40'
    }`;

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
            isLive ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
            sess.status === 'Seats Filling Fast' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }">
            ${isLive ? '<span class="w-2 h-2 rounded-full bg-red-500 radar-live"></span>' : ''}
            <span>${escapeHTML(sess.status)}</span>
          </span>
          <span class="text-xs text-slate-400 font-mono">${sess.registeredCount || 0} / ${sess.capacity || 100} seats</span>
        </div>

        <h3 class="text-lg font-bold text-white mb-2 leading-snug">
          ${escapeHTML(sess.title)}
        </h3>
        <p class="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          ${escapeHTML(sess.description)}
        </p>

        <div class="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-slate-300 mb-5">
          <div class="flex items-center gap-2">
            <span class="text-emerald-400">📅</span>
            <span class="font-semibold text-white">${escapeHTML(sess.dateTime)}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-emerald-400">👤</span>
            <span>Mentor: ${escapeHTML(sess.mentorName)}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-emerald-400">🌐</span>
            <span>100% Live Online (Google Meet)</span>
          </div>
        </div>
      </div>

      <div>
        ${isLive ? `
          <a href="${sess.meetingLink || 'https://meet.google.com/new'}" target="_blank" 
             class="btn-shimmer w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-extrabold text-xs shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2">
            <span class="w-2 h-2 rounded-full bg-white radar-live"></span>
            <span>Join Google Meet (Live Now) ↗</span>
          </a>
        ` : `
          <button onclick="NexcoLanding.openWorkshopRegisterModal('${sess.id}')" 
                  class="btn-shimmer w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5">
            <span>Register Free for Live Session</span>
            <span>↗</span>
          </button>
        `}
      </div>
    `;

    container.appendChild(card);
  });

  if (window.initScrollReveal) window.initScrollReveal();
}

// 7. Counseling & Direct Enrollment Modal (No Payment Gateway!)
let counselingTargetCourseId = "fs-mern-python";

function openCounselingModal(courseId) {
  counselingTargetCourseId = courseId || "fs-mern-python";
  const course = NexcoStore.getCourseById(counselingTargetCourseId);
  const modal = document.getElementById("counseling-modal");
  const titleEl = document.getElementById("counseling-modal-course-title");
  const selectEl = document.getElementById("counseling-modal-course-select");

  if (!modal) return;

  if (course && titleEl) {
    titleEl.textContent = course.title;
  }

  if (selectEl) {
    selectEl.innerHTML = NexcoStore.getCourses().map(c => 
      `<option value="${c.id}" ${c.id === counselingTargetCourseId ? 'selected' : ''}>${escapeHTML(c.title)} (100% Live Online)</option>`
    ).join("");
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeCounselingModal() {
  const modal = document.getElementById("counseling-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function initCounselingModal() {
  const form = document.getElementById("counseling-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("counseling-name")?.value.trim();
    const phone = document.getElementById("counseling-phone")?.value.trim();
    const email = document.getElementById("counseling-email")?.value.trim();
    const city = document.getElementById("counseling-city")?.value.trim();
    const batchPref = document.getElementById("counseling-batch-pref")?.value;
    const courseId = document.getElementById("counseling-modal-course-select")?.value;
    const course = NexcoStore.getCourseById(courseId);

    if (!name || !phone) {
      NexcoApp.showToast("Please provide your name and WhatsApp number.", "warning");
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      NexcoApp.showToast("Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).", "warning");
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.innerHTML = "Booking Counselor Call...";

    setTimeout(() => {
      // Add lead directly into Admin state
      NexcoStore.addLead({
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@lead.nexco.in`,
        phone: cleanPhone,
        cityCollege: city || "Tamil Nadu / Online Learner",
        program: course ? course.title : "Full Stack Web Development",
        source: "Counseling Modal",
        notes: `Preferred Batch: ${batchPref} (100% Live Online). Awaiting counselor confirmation.`
      });

      btn.disabled = false;
      btn.innerHTML = "Confirm & Request Counselor Call ↗";
      form.reset();
      closeCounselingModal();

      NexcoApp.showToast(`Vanakkam ${name}! Your request has reached our admissions counselors. An engineering advisor will reach you shortly on WhatsApp.`, "success");

      // Auto-trigger WhatsApp
      openWhatsAppConnectModal(name, cleanPhone, course ? course.title : "Nexco Accelerator");
    }, 800);
  });
}

// 8. Free Live Workshop Registration Modal
function openWorkshopRegisterModal(sessionId) {
  const session = NexcoStore.getLiveSessions().find(s => s.id === sessionId);
  const modal = document.getElementById("workshop-reg-modal");
  if (!modal) return;

  document.getElementById("workshop-reg-title").textContent = session ? session.title : "Live Workshop";
  document.getElementById("workshop-reg-mentor").textContent = session ? `With ${session.mentorName} • ${session.dateTime} (100% Live Online)` : "Nexco Mentor";
  document.getElementById("workshop-reg-session-id").value = sessionId;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeWorkshopRegisterModal() {
  const modal = document.getElementById("workshop-reg-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// 9. Syllabus Modal
function openSyllabusModal(courseId) {
  const course = NexcoStore.getCourseById(courseId) || NexcoStore.getCourses()[0];
  const modal = document.getElementById("syllabus-modal");
  if (!modal) return;

  document.getElementById("syllabus-modal-title").textContent = course.title;
  document.getElementById("syllabus-modal-desc").textContent = course.description;
  document.getElementById("syllabus-modal-meta").textContent = `${course.duration} • 100% Live Online Interactive Classes • Mentor: ${course.mentorName}`;

  const modulesContainer = document.getElementById("syllabus-modal-modules");
  modulesContainer.innerHTML = (course.syllabus || []).map((item, idx) => `
    <div class="rounded-xl border border-white/10 bg-black/40 p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          ${escapeHTML(item.week)}
        </span>
        <span class="text-xs text-slate-400 font-mono">Module 0${idx + 1}</span>
      </div>
      <h4 class="text-sm font-bold text-white mb-2">${escapeHTML(item.module)}</h4>
      <div class="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs">
        <span class="text-emerald-400 font-semibold">Key Deliverable:</span>
        <span class="text-slate-300 ml-1">${escapeHTML(item.deliverable)}</span>
      </div>
    </div>
  `).join("");

  const counselorBtn = document.getElementById("syllabus-modal-counselor-btn");
  if (counselorBtn) {
    counselorBtn.onclick = () => {
      closeSyllabusModal();
      openCounselingModal(course.id);
    };
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeSyllabusModal() {
  const modal = document.getElementById("syllabus-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// 10. Diagnostic Configurator
let selectedSituationKey = "fresh-graduate";

function initDiagnosticConfigurator() {
  const radioCards = document.querySelectorAll(".diagnostic-radio-card");
  radioCards.forEach((card) => {
    card.addEventListener("click", () => {
      radioCards.forEach((c) => {
        c.classList.remove("radio-card-active");
        const dot = c.querySelector(".radio-dot");
        if (dot) dot.classList.remove("bg-emerald-500", "border-emerald-500");
      });

      card.classList.add("radio-card-active");
      const dot = card.querySelector(".radio-dot");
      if (dot) dot.classList.add("bg-emerald-500", "border-emerald-500");

      selectedSituationKey = card.getAttribute("data-situation") || "fresh-graduate";
      updateDiagnosticRecommendation();
    });
  });

  updateDiagnosticRecommendation();
}

function updateDiagnosticRecommendation() {
  const situations = {
    "fresh-graduate": {
      title: "Full Stack Web Development (MERN & Python)",
      match: "99% Match",
      badge: "Placement Track",
      highlights: [
        "Hands-on practice with modern Git, API design, and clean architecture",
        "Target product companies and remote engineering teams",
        "Live technical mock interviews with mentors in Tamil and English",
        "Direct portfolio building with deployed web and mobile applications"
      ],
      time: "15-20 hrs/week",
      hike: "First job offer with strong engineering fundamentals",
      duration: "20 Weeks + Placement Prep"
    },
    "build-saas": {
      title: "UI/UX Design & Product Prototyping",
      match: "97% Match",
      badge: "Builder Track",
      highlights: [
        "Stop passive tutorial watching: write code live alongside mentors",
        "Ship 3 end-to-end full stack web applications with authentication and database",
        "Learn UI/UX prototyping in Figma and convert designs into clean code",
        "Screen-share code reviews to debug syntax and architecture errors"
      ],
      time: "14-18 hrs/week",
      hike: "Independent builder confidence with live hosted apps",
      duration: "16 Weeks Hands-On Accelerator"
    },
    "career-transition": {
      title: "Full Stack Web Development (Foundation Bridge)",
      match: "98% Match",
      badge: "Foundation Track",
      highlights: [
        "Dedicated 4-week zero-coding foundation track: start with basics in Tamil & English",
        "Assigned 1-on-1 mentor with weekly live screen-share code reviews",
        "100% live online evening and weekend sessions with instant doubt clearing",
        "Complete portfolio of clean web applications hosted on GitHub"
      ],
      time: "15-18 hrs/week",
      hike: "Smooth career pivot with demonstrable portfolio projects",
      duration: "24 Weeks + Mentor Guidance"
    },
    "upskill-ai": {
      title: "AI Tools, Prompt Engineering & Automation",
      match: "96% Match",
      badge: "Modern Tech Track",
      highlights: [
        "Master AI agents, prompt engineering, n8n, and local LLM integrations",
        "Weekday evening batches designed for college students and working professionals",
        "Automate manual business workflows and 10x your daily engineering output",
        "Hands-on building of custom enterprise copilot tools"
      ],
      time: "10-14 hrs/week",
      hike: "Level up to modern full-stack and AI developer roles",
      duration: "14 Weeks Live Cohort"
    }
  };

  const data = situations[selectedSituationKey] || situations["fresh-graduate"];
  const titleEl = document.getElementById("diag-track-title");
  const matchEl = document.getElementById("diag-match-badge");
  const badgeEl = document.getElementById("diag-situation-badge");
  const highlightsEl = document.getElementById("diag-highlights-list");
  const timeEl = document.getElementById("diag-time-investment");
  const hikeEl = document.getElementById("diag-projected-hike");
  const durEl = document.getElementById("diag-duration");

  if (titleEl) titleEl.textContent = data.title;
  if (matchEl) matchEl.textContent = data.match;
  if (badgeEl) badgeEl.textContent = data.badge;
  if (timeEl) timeEl.textContent = data.time;
  if (hikeEl) hikeEl.textContent = data.hike;
  if (durEl) durEl.textContent = data.duration;

  if (highlightsEl) {
    highlightsEl.innerHTML = data.highlights.map(h => `
      <li class="flex items-start gap-2.5 text-slate-700 text-xs">
        <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
        <span>${escapeHTML(h)}</span>
      </li>
    `).join("");
  }
}

// 11. Syllabus Unlock Form
function initSyllabusUnlockForm() {
  const form = document.getElementById("syllabus-unlock-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const contact = document.getElementById("syllabus-unlock-contact")?.value.trim();

    if (!contact) {
      NexcoApp.showToast("Please enter your email or WhatsApp number.", "warning");
      return;
    }

    // Add lead to Admin
    NexcoStore.addLead({
      name: "Brochure Requester",
      email: contact.includes("@") ? contact : "contact@whatsapp.in",
      phone: !contact.includes("@") ? contact.replace(/[^0-9]/g, "") : "+91 93451 21988",
      cityCollege: "Tamil Nadu / Online Learner",
      program: "Full 2026 Curriculum Brochure (100% Live Online)",
      source: "Brochure Download Form",
      notes: "Downloaded 100% Live Online curriculum brochure."
    });

    NexcoApp.showToast("📄 Nexco 2026 Complete Curriculum Guide downloaded! We've dispatched a copy to your WhatsApp/email.", "success");
    form.reset();
  });
}

// 12. Video Showcase
function initVideoShowcase() {
  const btn = document.getElementById("featured-video-play-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      openVideoStoryModal("story-1");
    });
  }
}

function openVideoStoryModal(storyId) {
  const modal = document.getElementById("video-modal");
  const videoElem = document.getElementById("video-modal-player");
  if (!modal) return;

  if (videoElem) {
    videoElem.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
    videoElem.play().catch(() => {});
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeVideoStoryModal() {
  const modal = document.getElementById("video-modal");
  const videoElem = document.getElementById("video-modal-player");
  if (videoElem) videoElem.pause();
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// 13. Early Learner & Workshop Feedback (Dynamic from Store)
function initDynamicFeedbackSection() {
  const container = document.getElementById("dynamic-feedback-container");
  if (!container) return;

  const feedbacks = NexcoStore.getFeedbacks().filter(f => f.approved);
  if (feedbacks.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-slate-500 text-xs">
        No approved reviews yet. If you attended our 100% Live Online interactive masterclass or webinar, please submit your feedback below!
      </div>
    `;
    return;
  }

  container.innerHTML = feedbacks.map((f, idx) => {
    const stars = "★".repeat(f.rating || 5);
    return `
      <div class="reveal-up card-3d-hover delay-${((idx % 3) + 1) * 100} p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="text-amber-500 text-xs font-bold tracking-wider">${stars}</div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Verified Attendee
            </span>
          </div>
          <div class="text-xs font-semibold text-emerald-700 mb-2">${escapeHTML(f.workshop)}</div>
          <p class="text-xs text-slate-700 leading-relaxed italic mb-4">
            "${escapeHTML(f.comment)}"
          </p>
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
          <div>
            <div class="font-bold text-slate-900">${escapeHTML(f.name)}</div>
            <div class="text-[10px] text-slate-500">${escapeHTML(f.role)}</div>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">${escapeHTML(f.date || 'Nov 2026')}</span>
        </div>
      </div>
    `;
  }).join("");

  if (window.initScrollReveal) window.initScrollReveal();
}

// Global API
window.NexcoLanding = {
  initSiteSettings,
  renderCharterCards,
  openSyllabusModal,
  closeSyllabusModal,
  openCounselingModal,
  closeCounselingModal,
  openWorkshopRegisterModal,
  closeWorkshopRegisterModal,
  closeWhatsAppConnectModal,
  openVideoStoryModal,
  closeVideoStoryModal,
  initDynamicFeedbackSection
};
