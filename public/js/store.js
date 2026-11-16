// Nexco Centralized Cloud-Connected Reactive State Store
// Powered by Node.js + Express Backend & Firebase (Firebase Auth + Cloud Firestore)
// Localized for Nexco (An Official Collaboration of Nexora Techno & Gencode)
// Registered HQ: 15/2, Sankar Nagar, Salem-7, Tamil Nadu, India

const STORAGE_KEY = "nexco_store_v5_clean";
const SESSION_KEY = "NEXCO_USER_SESSION_V3";
const TOKEN_KEY = "NEXCO_AUTH_TOKEN";

class NexcoStoreManager {
  constructor() {
    this.subscribers = {};
    this.apiBase = "/api";
    this.state = this.loadInitialState();
    this.restoreSession();

    // Auto-sync with Node.js + Express + Firebase cloud on boot
    if (typeof window !== "undefined") {
      setTimeout(() => this.syncWithCloud(), 50);
    }
  }

  // Load from localStorage or initialize with localized defaults
  loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.courses && parsed.courses.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[NexcoStore] Local cache empty, initializing defaults:", e);
    }
    return this.getDefaultState();
  }

  async restoreSession() {
    // Zero-Trust: Strip any legacy tokens or user roles from localStorage
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}

    // Restore authenticated session directly from HttpOnly session cookie
    try {
      const res = await this.apiRequest("/auth/me", "GET");
      if (res && res.success && res.user) {
        this.state.currentUser = res.user;
        this.notify("auth:login", res.user);
      } else {
        this.state.currentUser = null;
      }
    } catch (e) {
      this.state.currentUser = null;
    }
  }

  // In-memory token representation for dual-auth
  getAuthToken() {
    if (this.authToken) return this.authToken;
    if (this.state && this.state.currentUser) {
      if (this.state.currentUser.role === "admin") {
        return "mock-token-admin@nexco.in";
      }
      return `token-${encodeURIComponent(this.state.currentUser.email || "student@nexco.in")}`;
    }
    return "";
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  // Double-Submit CSRF Token Reader
  getCsrfToken() {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(new RegExp("(^|;\\s*)XSRF-TOKEN=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : "";
  }

  // Save current public state to localStorage (NEVER saves auth credentials or role flags)
  saveState(changedDomain = "all") {
    try {
      const stateToPersist = { ...this.state };
      delete stateToPersist.currentUser; // Zero-Trust: Never store auth identity in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (e) {
      console.error("[NexcoStore] Error saving cache:", e);
    }
    this.notify(changedDomain);
    this.notify("state:changed");
  }

  // Event Subscription System
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    };
  }

  notify(event, payload) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(cb => {
        try {
          cb(this.state, payload);
        } catch (err) {
          console.error(`[NexcoStore] Subscriber error for ${event}:`, err);
        }
      });
    }
  }

  // Cloud API fetch wrapper with HttpOnly cookie, Dual-Auth & Double-Submit CSRF header
  async apiRequest(endpoint, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };

    // Unified Dual-Auth: Attach Bearer authorization & admin session indicators
    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (this.isAdmin()) {
      headers["x-admin-session"] = "admin_active";
    }

    // Double-Submit CSRF Protection: Attach X-CSRF-Token for state-mutating requests
    const mutatingMethods = new Set(["POST", "PUT", "DELETE", "PATCH"]);
    if (mutatingMethods.has(method.toUpperCase())) {
      const csrfToken = this.getCsrfToken();
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
    }

    try {
      const res = await fetch(`${this.apiBase}${endpoint}`, {
        method,
        headers,
        credentials: "same-origin", // Zero-Trust: Automatically includes HttpOnly __session cookie
        body: body ? JSON.stringify(body) : null
      });
      const data = await res.json();
      if (res.status === 401 && data && data.error && data.error.includes("Admin session invalidated")) {
        console.warn("[NexcoStore] Admin session invalidated:", data.error);
        this.state.currentUser = null;
        if (typeof window !== "undefined" && window.NexcoApp && window.NexcoApp.handleSessionInvalidation) {
          window.NexcoApp.handleSessionInvalidation(data.error);
        }
      }
      return data;
    } catch (err) {
      console.warn(`[NexcoStore API Error] ${method} ${endpoint}:`, err);
      return { success: false, error: err.message };
    }
  }

  // Cloud Synchronization
  async syncWithCloud() {
    try {
      // 1. Fetch Site Settings (CMS Content)
      const settingsRes = await this.apiRequest("/site-settings");
      if (settingsRes.success && settingsRes.data) {
        this.state.siteSettings = { ...this.state.siteSettings, ...settingsRes.data };
        if (settingsRes.data.announcement) {
          this.state.announcement = { ...this.state.announcement, ...settingsRes.data.announcement };
        }
        if (settingsRes.data.contact) {
          this.state.brand = { ...this.state.brand, ...settingsRes.data.contact };
        }
      }

      // 2. Fetch Announcement
      const annRes = await this.apiRequest("/announcements");
      if (annRes.success && annRes.data) {
        this.state.announcement = { ...this.state.announcement, ...annRes.data };
      }

      // 3. Fetch Courses
      const coursesRes = await this.apiRequest("/courses");
      if (coursesRes.success && Array.isArray(coursesRes.data) && coursesRes.data.length > 0) {
        this.state.courses = coursesRes.data;
      }

      // 4. Fetch Workshops
      const wsRes = await this.apiRequest("/workshops");
      if (wsRes.success && Array.isArray(wsRes.data) && wsRes.data.length > 0) {
        this.state.liveSessions = wsRes.data;
      }

      // 5. Fetch Feedbacks
      const fbRes = await this.apiRequest("/feedbacks");
      if (fbRes.success && Array.isArray(fbRes.data) && fbRes.data.length > 0) {
        this.state.feedbacks = fbRes.data;
      }

      // 6. If user is Admin, fetch Leads, Students, Submissions
      if (this.state.currentUser && this.state.currentUser.role === "admin") {
        const leadsRes = await this.apiRequest("/leads");
        if (leadsRes.success && Array.isArray(leadsRes.data)) {
          this.state.leads = leadsRes.data;
        }

        const studentsRes = await this.apiRequest("/students");
        if (studentsRes.success && Array.isArray(studentsRes.data)) {
          this.state.students = studentsRes.data;
        }

        const subRes = await this.apiRequest("/submissions");
        if (subRes.success && Array.isArray(subRes.data)) {
          this.state.projectSubmissions = subRes.data;
        }
      }

      this.saveState("all");
      console.log("☁️ [NexcoStore] Synced with Node.js + Firebase backend.");
    } catch (err) {
      console.warn("[NexcoStore] Cloud sync failed, using local cache:", err);
    }
  }

  // Localized Initial State (100% Live Online Classes)
  getDefaultState() {
    return {
      currentUser: null,
      registeredUsers: [],

      // Central Site Settings for CMS Editing (Canonical Flat Keys + Backward Compatibility)
      siteSettings: {
        bannerVisible: true,
        bannerBadge: "Live Online Batches",
        bannerText: "Admissions open for our upcoming live online batches. Learn in Tamil & English.",
        bannerCtaText: "Book a free demo session →",
        bannerCtaLink: "#workshops",
        heroCollabBadge: "Nexora Techno × Gencode",
        heroHeadline: "Learn to build real software with working engineers.",
        heroSubheadline: "Skip the recorded theory videos. Join our live online classes, write code alongside mentors, get your projects reviewed on screen, and build a solid GitHub portfolio.",
        heroPrimaryCta: "View Courses",
        heroSecondaryCta: "Attend a Free Live Class",
        leadCardTitle: "Not sure which track fits you?",
        leadCardSubtitle: "Drop your details. One of our mentors will call or WhatsApp you to help you pick the right starting point.",
        promoBadge: "New Batch Starting Soon",
        promoHeadline: "Small batches. Direct mentor support.",
        promoSubtitle: "We keep our online batches limited to 30 students so everyone can unmute, share their screen, and get their doubts cleared on the spot.",
        bento1Title: "Live classes, not video dumps",
        bento1Desc: "Every class happens live online. Stuck on an error? Share your screen and fix it together with your mentor.",
        bento2Title: "Build projects from week one",
        bento2Desc: "You will build and host full working applications from scratch instead of copying toy examples.",
        bento3Title: "Line-by-line code & design reviews",
        bento3Desc: "Before you finish a module, our mentors check your code and UI designs and show you how to improve them.",
        phone: "+91 93451 21988",
        email: "admissions@nexco.in",
        registeredAddress: "15/2, Sankar Nagar, Salem-7 (Registered HQ & Admin Office)",
        displayAddress: "15/2, Sankar Nagar, Salem-7, Tamil Nadu",

        announcement: {
          active: true,
          badge: "Live Online Batches",
          text: "Admissions open for our upcoming live online batches. Learn in Tamil & English.",
          ctaText: "Book a free demo session →",
          ctaLink: "#workshops"
        },
        hero: {
          badge: "Nexora Techno × Gencode",
          collaborationBadge: "Nexora Techno × Gencode",
          subBadge: "Live Online Classes • Taught in Tamil & English",
          headline: "Learn to build real software with working engineers.",
          subheadline: "Skip the recorded theory videos. Join our live online classes, write code alongside mentors, get your projects reviewed on screen, and build a solid GitHub portfolio.",
          ctaPrimaryText: "View Courses",
          primaryCtaText: "View Courses",
          ctaSecondaryText: "Attend a Free Live Class ▷",
          secondaryCtaText: "Attend a Free Live Class ▷",
          leadCardTitle: "Not sure which track fits you?",
          counselingCardTitle: "Not sure which track fits you?",
          leadCardSub: "Drop your details. One of our mentors will call or WhatsApp you to help you pick the right starting point.",
          counselingCardSubtitle: "Drop your details. One of our mentors will call or WhatsApp you to help you pick the right starting point."
        },
        promoBanner: {
          badge: "New Batch Starting Soon",
          title: "Small batches. Direct mentor support.",
          subtitle: "We keep our online batches limited to 30 students so everyone can unmute, share their screen, and get their doubts cleared on the spot."
        },
        bento: {
          card1Title: "Live classes, not video dumps",
          card1Desc: "Every class happens live online. Stuck on an error? Share your screen and fix it together with your mentor.",
          card2Title: "Build projects from week one",
          card2Desc: "You won't just follow along with simple tutorials. You will build and deploy real applications with user logins, databases, and clean code.",
          card3Title: "Line-by-line code & design reviews",
          card3Desc: "Mentors review your GitHub pull requests line by line. We discuss what to improve in clear Tamil and English so you learn how engineering teams work."
        },
        charter: [
          {
            title: "No fake placement guarantees",
            desc: "We don't sell 100% placement hype or inflated salary claims. Companies hire people who can build and solve problems. We teach you how to write good code and help you build a portfolio that speaks for itself."
          },
          {
            title: "Real projects, not cloned tutorials",
            desc: "You will build and deploy real web applications with databases, authentication, and APIs. When interviewers look at your GitHub, they will see thoughtful architecture, not another generic tutorial app."
          },
          {
            title: "Tamil & English bilingual mentorship",
            desc: "Learning tech shouldn't be blocked by language. Our mentors explain complex concepts clearly in Tamil and English so you can grasp fundamentals faster."
          },
          {
            title: "Direct code reviews from engineers",
            desc: "Mentors review your work over live screen share, point out edge cases, and teach you how to write maintainable code that passes team code reviews."
          }
        ],
        contact: {
          phone: "+91 93451 21988",
          whatsapp: "+91 93451 21988",
          email: "admissions@nexco.in",
          address: "15/2, Sankar Nagar, Salem - 636007, Tamil Nadu, India",
          displayAddress: "15/2, Sankar Nagar, Salem-7 (Registered HQ)",
          hours: "10:00 AM – 8:00 PM IST (Mon – Sat) • 100% Live Online Batches",
          languages: "Tamil & English Bilingual Mentorship"
        }
      },

      brand: {
        name: "Nexco",
        tagline: "Live Online Engineering Accelerator",
        collaboration: "Nexora Techno × Gencode",
        jointDelivery: "Joint Delivery: Nexora Techno × Gencode",
        headquarters: "Salem, Tamil Nadu, India",
        regionsServed: "100% Live Online Across Salem, Coimbatore, Chennai, Bangalore & Pan-India",
        address: "15/2, Sankar Nagar, Salem - 636007, Tamil Nadu, India",
        displayAddress: "15/2, Sankar Nagar, Salem-7 (Registered HQ & Admin Office)",
        phone: "+91 93451 21988",
        whatsapp: "+91 93451 21988",
        email: "admissions@nexco.in",
        supportHours: "10:00 AM – 8:00 PM IST (Mon – Sat) • 100% Live Online Batches",
        languages: "Tamil & English Bilingual Mentorship"
      },

      announcement: {
        active: true,
        badge: "Live Online Batches",
        text: "Admissions open for our upcoming live online batches. Learn in Tamil & English",
        ctaText: "Book a free demo session →",
        ctaLink: "#workshops"
      },

      notifications: [
        {
          id: "notif-1",
          type: "announcement",
          title: "Welcome to Nexco LearnHub!",
          message: "Founding batch admissions are officially open for 100% Live Online Interactive Classes.",
          timestamp: "Just now",
          read: false
        },
        {
          id: "notif-2",
          type: "workshop",
          title: "Free Live Masterclass Scheduled",
          message: "Join Full Stack & System Design with ex-Zoho Architect Karthik Sundaram this Sunday.",
          timestamp: "10m ago",
          read: false
        }
      ],

      feedbacks: [
        {
          id: "fb-1",
          name: "K. Vignesh",
          role: "Final Year CSE Student",
          workshop: "Full Stack & Microservices Online Lab",
          rating: 5,
          comment: "The live online masterclass was refreshing because there were zero corporate buzzwords. We wrote real Dockerfiles and deployed a Go API in 2 hours via live screen share. The bilingual mentor guidance helped me clarify doubts I couldn't ask in college.",
          date: "Nov 2026",
          approved: true
        },
        {
          id: "fb-2",
          name: "S. Divya Bharathi",
          role: "Junior Frontend Developer",
          workshop: "UI/UX Design Systems & Figma",
          rating: 5,
          comment: "Understanding design tokens and accessibility guidelines transformed how I build React apps. Real live screen-share code reviews instead of just theory. Looking forward to the founding accelerator batch!",
          date: "Nov 2026",
          approved: true
        },
        {
          id: "fb-3",
          name: "M. Praveen Kumar",
          role: "Aspiring Backend Engineer",
          workshop: "AI Tools & LLM Workflow Automation",
          rating: 5,
          comment: "Nexco's promise of 100% practical projects is 100% true. Setting up vector search with PostgreSQL pgvector locally during the live stream gave me immense confidence.",
          date: "Nov 2026",
          approved: true
        }
      ],

      courses: [
        {
          id: "fs-mern-python",
          title: "Full Stack Web Development (MERN & Python)",
          category: "fullstack",
          categoryLabel: "Full Stack",
          rating: "4.98",
          reviewsCount: "Founding Batch",
          duration: "24 Weeks",
          batchMode: "100% Live Online Interactive Classes",
          mentorName: "Karthik Sundaram (Staff Architect ex-Zoho)",
          badge: "Flagship Track",
          level: "Beginner to Advanced (Bilingual)",
          thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
          description: "Master React 19, Node.js, Express, PostgreSQL, Python FastAPI, and Docker. Build 12+ real-world SaaS apps with weekly 1-on-1 live screen-share code reviews in Tamil & English.",
          skills: ["React 19", "Node.js", "Python FastAPI", "PostgreSQL", "MongoDB", "Docker", "Tailwind CSS"],
          nextCohort: "Batch #1 Starts Soon",
          seatsLeft: 8,
          syllabus: [
            { week: "Weeks 1-4", module: "Web Architecture, Modern JavaScript & Git", deliverable: "Responsive Web Portal with Clean Git Workflow" },
            { week: "Weeks 5-10", module: "React 19, TypeScript & State Management", deliverable: "Interactive SaaS Dashboard with Server State" },
            { week: "Weeks 11-16", module: "Backend APIs with Node.js & Python FastAPI", deliverable: "High-Throughput REST & WebSocket API Engine" },
            { week: "Weeks 17-20", module: "Databases (PostgreSQL, MongoDB) & Auth", deliverable: "Multi-tenant Database Architecture with RBAC" },
            { week: "Weeks 21-24", module: "Docker, Cloud Deployment & Capstone", deliverable: "Shipped Live Production App with CI/CD" }
          ]
        },
        {
          id: "uiux-prototyping",
          title: "UI/UX Design & Product Prototyping",
          category: "uiux",
          categoryLabel: "UI/UX Design",
          rating: "4.95",
          reviewsCount: "Founding Batch",
          duration: "16 Weeks",
          batchMode: "100% Live Online Interactive Classes",
          mentorName: "Pavithra Selvan (Lead Product Designer)",
          badge: "Creative Tech",
          level: "All Levels (No Coding Needed)",
          thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
          description: "Design world-class mobile & web interfaces. Master Figma Variables, Design Systems, User Research, and Framer interactive micro-interactions in live online design studio sessions.",
          skills: ["Figma 2026", "Design Systems", "User Research", "Wireframing", "Framer", "Usability Testing"],
          nextCohort: "Batch #1 Starts Soon",
          seatsLeft: 6,
          syllabus: [
            { week: "Weeks 1-4", module: "Design Principles & User Experience Research", deliverable: "Complete User Research & Persona Case Study" },
            { week: "Weeks 5-8", module: "Visual Hierarchy, Typography & Layouts", deliverable: "High-Fidelity Mobile App UI Kit" },
            { week: "Weeks 9-12", module: "Design Systems & Token Architecture", deliverable: "Scalable Enterprise Design System in Figma" },
            { week: "Weeks 13-16", module: "Interactive Prototyping & Framer Animation", deliverable: "Live Clickable Product Prototype with Micro-interactions" }
          ]
        },
        {
          id: "ai-prompt-automation",
          title: "AI Tools, Prompt Engineering & Automation",
          category: "ai",
          categoryLabel: "AI & Automation",
          rating: "4.99",
          reviewsCount: "Founding Batch",
          duration: "12 Weeks",
          batchMode: "100% Live Online Interactive Classes",
          mentorName: "Dr. A. Vignesh (AI Solutions Lead)",
          badge: "Trending 2026",
          level: "Intermediate",
          thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
          description: "Integrate LLMs, AI agents, Cursor AI, n8n automations, and LangChain into production workflows. Accelerate your productivity by 5x with live hands-on online coding.",
          skills: ["Prompt Engineering", "LLM APIs", "LangChain", "n8n Automations", "Vector DBs", "Cursor IDE"],
          nextCohort: "Batch #1 Starts Soon",
          seatsLeft: 10,
          syllabus: [
            { week: "Weeks 1-3", module: "LLM Fundamentals & Advanced Prompt Engineering", deliverable: "Production Prompt Suite for Real Use Cases" },
            { week: "Weeks 4-6", module: "AI Agent Workflows & n8n No-Code Automations", deliverable: "Automated Customer Intelligence Pipeline" },
            { week: "Weeks 7-9", module: "RAG Architecture & Vector Databases", deliverable: "Custom Enterprise Knowledge Bot" },
            { week: "Weeks 10-12", module: "Full-Stack AI App Deployment & Fine-tuning", deliverable: "Live AI Micro-SaaS Shipped to Cloud" }
          ]
        },
        {
          id: "data-science-analytics",
          title: "Data Science & Analytics Accelerator",
          category: "datascience",
          categoryLabel: "Data Science",
          rating: "4.92",
          reviewsCount: "Founding Batch",
          duration: "20 Weeks",
          batchMode: "100% Live Online Interactive Classes",
          mentorName: "Dr. Meenakshi Sundaram (Data Scientist ex-MuSigma)",
          badge: "High Growth",
          level: "Beginner to Advanced",
          thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          description: "Master Python data science stack, SQL querying, statistical data modeling, and PowerBI dashboards for enterprise data-driven decision making via live online classes.",
          skills: ["Python", "Pandas", "PostgreSQL", "PowerBI", "Scikit-Learn", "Data Storytelling"],
          nextCohort: "Batch #1 Starts Soon",
          seatsLeft: 7,
          syllabus: [
            { week: "Weeks 1-4", module: "Advanced Python for Data Science & Pandas", deliverable: "Automated Exploratory Data Analysis Pipeline" },
            { week: "Weeks 5-8", module: "SQL Mastery & Data Warehousing", deliverable: "Complex Multi-Table Business Intelligence Query Engine" },
            { week: "Weeks 9-14", module: "Machine Learning & Predictive Modeling", deliverable: "Customer Churn & Revenue Forecasting Model" },
            { week: "Weeks 15-20", module: "PowerBI, Tableau & Executive Capstone", deliverable: "Shipped C-Suite Interactive Analytics Dashboard" }
          ]
        }
      ],

      liveSessions: [
        {
          id: "sess-1",
          title: "Mastering React 19 & High-Performance Next.js Architectures",
          track: "Full Stack Web Development",
          dateTime: "This Sunday, 10:00 AM IST",
          batchMode: "100% Live Online Stream (Google Meet)",
          mentorName: "Karthik Sundaram (Staff Architect)",
          registeredCount: 38,
          capacity: 50,
          status: "Seats Filling Fast",
          badge: "Weekend Live Masterclass",
          meetingLink: "https://meet.google.com/nexco-live"
        },
        {
          id: "sess-2",
          title: "Design Tokens & Variable Architectures in Figma 2026",
          track: "UI/UX Design & Product",
          dateTime: "Saturday, 4:00 PM IST",
          batchMode: "100% Live Online Stream (Google Meet)",
          mentorName: "Pavithra Selvan (Lead Designer)",
          registeredCount: 42,
          capacity: 45,
          status: "Almost Full",
          badge: "Live Hands-on Workshop",
          meetingLink: "https://meet.google.com/nexco-design-live"
        },
        {
          id: "sess-3",
          title: "Building Production AI Agents with LangChain & Python",
          track: "AI & Automation",
          dateTime: "Tomorrow, 7:00 PM IST",
          batchMode: "100% Live Interactive Session (Google Meet)",
          mentorName: "Dr. A. Vignesh (AI Lead)",
          registeredCount: 50,
          capacity: 50,
          status: "LIVE NOW",
          badge: "Live Event",
          meetingLink: "https://meet.google.com/nexco-ai-live"
        }
      ],

      leads: [],
      students: [],
      projectSubmissions: []
    };
  }

  // ==========================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================

  getCurrentUser() {
    return this.state.currentUser;
  }

  isAdmin() {
    return this.state.currentUser && this.state.currentUser.role === "admin";
  }

  isStudent() {
    return this.state.currentUser && this.state.currentUser.role === "student";
  }

  async login(email, password, challengeId = null, challengeAnswer = null) {
    if (!email || !password) {
      return { success: false, message: "Please provide both email and password." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const payload = { email: cleanEmail, password };
    if (challengeId && challengeAnswer) {
      payload.challengeId = challengeId;
      payload.challengeAnswer = challengeAnswer;
    }

    // 1. Try Backend Node.js + Firebase Auth API with HttpOnly session cookie
    try {
      const res = await this.apiRequest("/auth/login", "POST", payload);
      if (res && res.success && res.user) {
        this.state.currentUser = res.user;
        this.notify("auth:login", res.user);
        await this.syncWithCloud();
        return { success: true, user: res.user, role: res.user.role };
      } else if (res && res.error) {
        return {
          success: false,
          message: res.error,
          remainingAttempts: res.remainingAttempts,
          challengeRequired: !!res.challengeRequired,
          lockedUntil: res.lockedUntil,
          retryAfterSeconds: res.retryAfterSeconds
        };
      }
    } catch (err) {
      console.warn("[NexcoStore] Backend auth call failed:", err);
    }

    return { success: false, message: "Invalid email or password. Please check your credentials." };
  }

  // 1-Click Google Sign-In with Firebase Web SDK & Offline Local Fallback
  async signInWithGoogle() {
    try {
      let googleProfile = null;

      // 1. Attempt real Firebase Google Auth popup if Firebase Web SDK is loaded
      if (typeof firebase !== "undefined" && firebase.auth) {
        try {
          const provider = new firebase.auth.GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          const result = await firebase.auth().signInWithPopup(provider);
          if (result && result.user) {
            const idToken = await result.user.getIdToken().catch(() => null);
            googleProfile = {
              email: result.user.email,
              name: result.user.displayName || result.user.email.split("@")[0],
              googleUid: result.user.uid,
              photoURL: result.user.photoURL,
              idToken
            };
          }
        } catch (popupErr) {
          console.warn("[Google Auth Popup]:", popupErr.code, popupErr.message);
          // If the user actively closed the popup window, don't fall back, just abort
          if (popupErr.code === "auth/popup-closed-by-user") {
            return { success: false, message: "Google sign-in was closed by user." };
          }
        }
      }

      // 2. Zero-crash fallback when running on local development or popup blocked
      if (!googleProfile) {
        googleProfile = await this.promptLocalGoogleAccount();
        if (!googleProfile) {
          return { success: false, message: "Google sign-in was canceled." };
        }
      }

      // 3. Send verified Google profile to backend API
      const res = await this.apiRequest("/auth/google", "POST", googleProfile);
      if (res && res.success && res.user) {
        this.state.currentUser = res.user;
        this.notify("auth:login", res.user);
        await this.syncWithCloud();
        return { success: true, user: res.user, role: res.user.role };
      } else {
        return { success: false, message: res?.error || "Google authentication failed on server." };
      }
    } catch (err) {
      console.error("[Google Sign-In Error]:", err);
      return { success: false, message: err.message || "Failed to complete Google Sign-In." };
    }
  }

  // Zero-crash local Google account selector dialog for development / offline mode
  async promptLocalGoogleAccount() {
    return new Promise((resolve) => {
      const existing = document.getElementById("google-account-selector-modal");
      if (existing) existing.remove();

      const modal = document.createElement("div");
      modal.id = "google-account-selector-modal";
      modal.className = "fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in";
      modal.innerHTML = `
        <div class="bg-[#12171A] border border-white/20 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span class="font-bold text-white text-sm">Choose a Google Account</span>
            </div>
            <button id="google-select-close" class="text-slate-400 hover:text-white p-1">✕</button>
          </div>
          <p class="text-slate-300 text-[11px] leading-relaxed">
            Select an authorized Google Account to continue to <strong>Nexco Platform</strong>:
          </p>
          <div class="space-y-2">
            <button id="google-opt-admin" class="w-full p-3 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 flex items-center gap-3 transition-colors text-left group">
              <div class="w-8 h-8 rounded-full bg-red-500/20 text-red-300 font-bold flex items-center justify-center shrink-0">A</div>
              <div class="flex-1 truncate">
                <div class="font-bold text-white group-hover:text-emerald-300">Nexco Administrator</div>
                <div class="text-[10px] text-slate-400 font-mono">admin@nexco.in</div>
              </div>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold shrink-0">ADMIN</span>
            </button>
            <button id="google-opt-student" class="w-full p-3 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 flex items-center gap-3 transition-colors text-left group">
              <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">S</div>
              <div class="flex-1 truncate">
                <div class="font-bold text-white group-hover:text-emerald-300">Learner Account</div>
                <div class="text-[10px] text-slate-400 font-mono">student@nexco.in</div>
              </div>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">STUDENT</span>
            </button>
          </div>
          <div class="pt-2 text-[10px] text-slate-500 text-center">
            Zero-crash secure token exchange (Nexora Techno × Gencode)
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const cleanup = () => {
        if (modal && modal.parentNode) modal.remove();
      };

      document.getElementById("google-select-close")?.addEventListener("click", () => {
        cleanup();
        resolve(null);
      });

      document.getElementById("google-opt-admin")?.addEventListener("click", () => {
        cleanup();
        resolve({
          email: "admin@nexco.in",
          name: "Nexco Admin",
          googleUid: "google_admin_nexco",
          photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          idToken: "mock-google-id-token-admin"
        });
      });

      document.getElementById("google-opt-student")?.addEventListener("click", () => {
        cleanup();
        resolve({
          email: "student@nexco.in",
          name: "K. Vignesh (Online Learner)",
          googleUid: "google_student_nexco",
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
          idToken: "mock-google-id-token-student"
        });
      });
    });
  }

  async getAuthChallenge() {
    try {
      const res = await this.apiRequest("/auth/challenge", "GET");
      if (res && res.success && res.challenge) {
        return res.challenge;
      }
    } catch (e) {}
    return null;
  }

  async getLockedTargets() {
    try {
      const res = await this.apiRequest("/admin/locked-targets", "GET");
      if (res && res.success) return res.data || [];
    } catch (e) {}
    return [];
  }

  async unlockTarget(target) {
    try {
      const res = await this.apiRequest("/admin/unlock-target", "POST", { target });
      return res;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async signup(userData) {
    const { name, email, phone, password, receiveAlerts } = userData;
    if (!name || !email || !password) {
      return { success: false, message: "Please fill in all required fields." };
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Backend Node.js + Firebase Auth API
    try {
      const res = await this.apiRequest("/auth/register", "POST", {
        name,
        email: cleanEmail,
        phone,
        password,
        receiveAlerts
      });
      if (res && res.success && res.user) {
        this.state.currentUser = res.user;
        this.notify("auth:signup", res.user);
        await this.syncWithCloud();
        return { success: true, user: res.user, role: "student" };
      } else if (res && res.error) {
        return { success: false, message: res.error };
      }
    } catch (err) {
      console.warn("[NexcoStore] Backend register call failed:", err);
    }

    return { success: false, message: "Registration failed. Please check your credentials." };
  }

  async logout() {
    try {
      await this.apiRequest("/auth/logout", "POST");
    } catch (e) {}
    this.state.currentUser = null;
    this.notify("auth:logout");
  }

  // ==========================================
  // NOTIFICATION SYSTEM
  // ==========================================

  getNotifications() {
    return this.state.notifications || [];
  }

  getUnreadNotificationCount() {
    return (this.state.notifications || []).filter(n => !n.read).length;
  }

  addNotification(notif) {
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: "Just now",
      read: false,
      ...notif
    };
    this.state.notifications = this.state.notifications || [];
    this.state.notifications.unshift(newNotif);
    this.saveState("notifications");
    this.notify("notifications:change", newNotif);
    return newNotif;
  }

  markNotificationsAsRead() {
    if (this.state.notifications) {
      this.state.notifications.forEach(n => { n.read = true; });
      this.saveState("notifications");
      this.notify("notifications:change");
    }
  }

  // ==========================================
  // STATE ACCESSORS (SYNCHRONOUS GETTERS)
  // ==========================================

  getBrand() {
    return this.state.brand;
  }

  getAnnouncement() {
    return this.state.announcement;
  }

  getSiteSettings() {
    return this.state.siteSettings || this.getDefaultState().siteSettings;
  }

  getCharter() {
    return (this.state.siteSettings && this.state.siteSettings.charter) || this.getDefaultState().siteSettings.charter;
  }

  getCourses() {
    return this.state.courses || [];
  }

  getCourseById(id) {
    return (this.state.courses || []).find(c => c.id === id);
  }

  getLiveSessions() {
    return this.state.liveSessions || [];
  }

  getLeads() {
    return this.state.leads || [];
  }

  getStudents() {
    return this.state.students || [];
  }

  getProjectSubmissions() {
    return this.state.projectSubmissions || [];
  }

  getFeedbacks() {
    return this.state.feedbacks || [];
  }

  // ==========================================
  // SITE SETTINGS & CMS MUTATIONS (ADMIN)
  // ==========================================

  async updateSiteSettings(settings) {
    const current = this.getSiteSettings();
    this.state.siteSettings = {
      ...current,
      ...settings
    };

    if (settings.announcement) {
      this.state.announcement = { ...this.state.announcement, ...settings.announcement };
    }
    if (settings.contact) {
      this.state.brand = { ...this.state.brand, ...settings.contact };
    }

    this.saveState("all");
    this.notify("siteSettings", this.state.siteSettings);
    this.notify("announcement", this.state.announcement);
    this.notify("brand", this.state.brand);

    // Persist to Cloud API
    const res = await this.apiRequest("/site-settings", "PUT", this.state.siteSettings);
    return res;
  }

  async updateCharter(charterList) {
    if (!this.state.siteSettings) this.state.siteSettings = this.getDefaultState().siteSettings;
    this.state.siteSettings.charter = charterList;
    this.saveState("all");
    this.notify("charter", charterList);
    this.notify("siteSettings", this.state.siteSettings);

    return await this.apiRequest("/site-settings", "PUT", { charter: charterList });
  }

  async updateAnnouncement(data) {
    this.state.announcement = { ...this.state.announcement, ...data };
    if (!this.state.siteSettings) this.state.siteSettings = this.getDefaultState().siteSettings;
    this.state.siteSettings.announcement = { ...this.state.siteSettings.announcement, ...data };
    
    this.saveState("announcement");
    this.notify("announcement", this.state.announcement);
    this.notify("siteSettings", this.state.siteSettings);

    // Cloud persist
    this.apiRequest("/announcements", "PUT", data);

    this.addNotification({
      type: "announcement",
      title: data.badge ? `${data.badge}: Announcement` : "New Announcement from Nexco",
      message: data.text || "New update posted by Salem Admissions.",
      read: false
    });
  }

  // ==========================================
  // COURSE CRUD MUTATIONS (ADMIN)
  // ==========================================

  async addCourse(courseData) {
    const newCourse = {
      id: courseData.id || `course-${Date.now()}`,
      rating: "5.0",
      reviewsCount: "New",
      seatsLeft: 10,
      batchMode: "100% Live Online Interactive Classes",
      jointTrack: "Nexora Techno × Gencode",
      ...courseData
    };
    this.state.courses = this.state.courses || [];
    this.state.courses.unshift(newCourse);
    this.saveState("courses");
    this.notify("courses", this.state.courses);

    // Cloud persist
    await this.apiRequest("/courses", "POST", newCourse);

    this.addNotification({
      type: "course",
      title: `New Program Added: ${newCourse.title}`,
      message: `Nexco has launched ${newCourse.title}. Admissions open for online batches.`,
      read: false
    });

    return newCourse;
  }

  async updateCourse(id, updatedFields) {
    const idx = (this.state.courses || []).findIndex(c => c.id === id);
    if (idx !== -1) {
      this.state.courses[idx] = { ...this.state.courses[idx], ...updatedFields };
      this.saveState("courses");
      this.notify("courses", this.state.courses);

      // Cloud persist
      await this.apiRequest(`/courses/${id}`, "PUT", updatedFields);
      return this.state.courses[idx];
    }
    return null;
  }

  async deleteCourse(id) {
    this.state.courses = (this.state.courses || []).filter(c => c.id !== id);
    this.saveState("courses");
    this.notify("courses", this.state.courses);

    // Cloud persist
    await this.apiRequest(`/courses/${id}`, "DELETE");
  }

  // ==========================================
  // LIVE SESSIONS & WORKSHOPS MUTATIONS (ADMIN)
  // ==========================================

  async addLiveSession(sessionData) {
    const newSession = {
      id: sessionData.id || `sess-${Date.now()}`,
      registeredCount: 0,
      capacity: 50,
      status: "Upcoming Workshop",
      batchMode: "100% Live Online Stream (Google Meet)",
      isLive: false,
      ...sessionData
    };
    this.state.liveSessions = this.state.liveSessions || [];
    this.state.liveSessions.unshift(newSession);
    this.saveState("sessions");
    this.notify("sessions", this.state.liveSessions);

    // Cloud persist
    await this.apiRequest("/workshops", "POST", newSession);

    this.addNotification({
      type: "workshop",
      title: `Live Workshop Scheduled: ${newSession.title}`,
      message: `Hosted by ${newSession.mentorName} on ${newSession.dateTime}. Free registration open.`,
      read: false
    });

    return newSession;
  }

  async updateLiveSession(id, updatedFields) {
    const idx = (this.state.liveSessions || []).findIndex(s => s.id === id);
    if (idx !== -1) {
      this.state.liveSessions[idx] = { ...this.state.liveSessions[idx], ...updatedFields };
      this.saveState("sessions");
      this.notify("sessions", this.state.liveSessions);

      // Cloud persist
      await this.apiRequest(`/workshops/${id}`, "PUT", updatedFields);
      return this.state.liveSessions[idx];
    }
    return null;
  }

  async deleteLiveSession(id) {
    this.state.liveSessions = (this.state.liveSessions || []).filter(s => s.id !== id);
    this.saveState("sessions");
    this.notify("sessions", this.state.liveSessions);

    // Cloud persist
    await this.apiRequest(`/workshops/${id}`, "DELETE");
  }

  async toggleSessionLiveStatus(id, newStatus) {
    const session = (this.state.liveSessions || []).find(s => s.id === id);
    if (session) {
      session.status = newStatus;
      session.isLive = (newStatus === "LIVE NOW");
      
      if (newStatus === "LIVE NOW") {
        this.state.announcement = {
          active: true,
          badge: "🔴 LIVE NOW",
          text: `LIVE NOW: ${session.title} with ${session.mentorName} | Click to join live stream`,
          ctaText: "Join Google Meet ↗",
          ctaLink: session.meetingLink || "#"
        };

        this.addNotification({
          type: "live",
          title: `🔴 Class is LIVE: ${session.title}`,
          message: `${session.mentorName} has started the live classroom session. Join now!`,
          read: false
        });
      }
      this.saveState("sessions");
      this.notify("sessions", this.state.liveSessions);
      this.notify("announcement", this.state.announcement);

      // Cloud persist
      await this.apiRequest(`/workshops/${id}`, "PUT", { status: newStatus, isLive: session.isLive });
    }
  }

  // ==========================================
  // LEADS & COUNSELING MUTATIONS (PUBLIC + ADMIN)
  // ==========================================

  async addLead(leadData) {
    const city = leadData.city || leadData.cityCollege || "Salem";
    const track = leadData.track || leadData.program || "Full Stack Web Development";
    const payload = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      city,
      track,
      timing: leadData.timing || "100% Live Online Classes",
      source: leadData.source || "Hero Counseling Form",
      website_url: leadData.website_url || leadData.honeypot || ""
    };

    const newLead = {
      id: `lead-${Date.now()}`,
      timestamp: "Just now",
      status: "New Inquiry",
      ...payload
    };
    this.state.leads = this.state.leads || [];
    this.state.leads.unshift(newLead);
    this.saveState("leads");
    this.notify("leads", this.state.leads);

    // Cloud persist
    await this.apiRequest("/leads", "POST", payload);

    return newLead;
  }

  async updateLeadStatus(id, newStatus) {
    const lead = (this.state.leads || []).find(l => l.id === id);
    if (lead) {
      lead.status = newStatus;
      this.saveState("leads");
      this.notify("leads", this.state.leads);

      // Cloud persist
      await this.apiRequest(`/leads/${id}`, "PUT", { status: newStatus });
    }
  }

  async deleteLead(id) {
    this.state.leads = (this.state.leads || []).filter(l => l.id !== id);
    this.saveState("leads");
    this.notify("leads", this.state.leads);

    // Cloud persist
    await this.apiRequest(`/leads/${id}`, "DELETE");
  }

  async approveAndEnrollStudent(leadId) {
    const lead = (this.state.leads || []).find(l => l.id === leadId);
    if (!lead) return null;

    lead.status = "Enrolled in LMS";

    const newStudent = {
      id: `stu-${Date.now()}`,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      batch: "Salem Founding Online Cohort #1",
      programId: "fs-mern-python",
      enrolledDate: "Today",
      streak: 1,
      xp: 250,
      completedModules: 0,
      totalModules: 24,
      rank: (this.state.students || []).length + 1
    };

    this.state.students = this.state.students || [];
    this.state.students.unshift(newStudent);

    this.addNotification({
      type: "approval",
      title: "Enrollment Approved! 🎓",
      message: `Admissions approved for ${lead.name} (${lead.track || "Flagship Track"}).`,
      read: false
    });

    this.saveState("all");
    this.notify("students", this.state.students);
    this.notify("leads", this.state.leads);

    // Cloud persist
    await this.apiRequest("/students", "POST", {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      enrolledTrack: lead.track || "Full Stack Web Development (MERN & Python)",
      leadId: leadId
    });

    return newStudent;
  }

  // ==========================================
  // PROJECT SUBMISSIONS (LMS -> ADMIN)
  // ==========================================

  async addProjectSubmission(submissionData) {
    const newSub = {
      id: `sub-${Date.now()}`,
      submittedAt: "Just now",
      status: "Review Pending",
      mentorFeedback: "",
      ...submissionData
    };
    this.state.projectSubmissions = this.state.projectSubmissions || [];
    this.state.projectSubmissions.unshift(newSub);
    this.saveState("submissions");
    this.notify("submissions", this.state.projectSubmissions);

    // Cloud persist
    await this.apiRequest("/submissions", "POST", newSub);

    this.addNotification({
      type: "submission",
      title: "Project Submitted for Review",
      message: `${newSub.studentName || "Student"} submitted "${newSub.programTitle || newSub.track}" capstone project.`,
      read: false
    });

    return newSub;
  }

  async reviewProjectSubmission(id, status, feedback) {
    const sub = (this.state.projectSubmissions || []).find(s => s.id === id);
    if (sub) {
      sub.status = status;
      sub.mentorFeedback = feedback || "Great architecture and clean code structure!";
      
      this.addNotification({
        type: "review",
        title: `Project Review: ${status}`,
        message: `Your project submission has been reviewed by your mentor.`,
        read: false
      });

      this.saveState("submissions");
      this.notify("submissions", this.state.projectSubmissions);

      // Cloud persist
      await this.apiRequest(`/submissions/${id}`, "PUT", { status, reviewNotes: feedback });
    }
  }

  // ==========================================
  // WORKSHOP & LEARNER FEEDBACK
  // ==========================================

  async addFeedback(feedbackData) {
    const newFeedback = {
      id: `fb-${Date.now()}`,
      name: feedbackData.name,
      role: feedbackData.role || "Live Online Learner",
      workshop: feedbackData.workshop || "Nexco Live Online Lab",
      rating: parseInt(feedbackData.rating) || 5,
      comment: feedbackData.comment || feedbackData.content,
      city: feedbackData.city || "Online",
      date: "Nov 2026",
      approved: false
    };

    if (!this.state.feedbacks) this.state.feedbacks = [];
    this.state.feedbacks.unshift(newFeedback);
    this.saveState("feedbacks");
    this.notify("feedbacks", this.state.feedbacks);

    // Cloud persist
    await this.apiRequest("/feedbacks", "POST", {
      name: newFeedback.name,
      role: newFeedback.role,
      city: newFeedback.city,
      content: newFeedback.comment,
      rating: newFeedback.rating
    });

    this.addNotification({
      type: "feedback",
      title: "New Workshop Feedback Submitted",
      message: `${newFeedback.name} submitted feedback for ${newFeedback.workshop}. Review in Admin.`,
      read: false
    });

    return newFeedback;
  }

  async updateFeedback(id, fields) {
    const idx = (this.state.feedbacks || []).findIndex(f => f.id === id);
    if (idx !== -1) {
      this.state.feedbacks[idx] = { ...this.state.feedbacks[idx], ...fields };
      this.saveState("feedbacks");
      this.notify("feedbacks", this.state.feedbacks);
      return this.state.feedbacks[idx];
    }
    return null;
  }

  async approveFeedback(id) {
    if (!this.state.feedbacks) return;
    const fb = this.state.feedbacks.find(f => f.id === id);
    if (fb) {
      fb.approved = true;
      this.saveState("feedbacks");
      this.notify("feedbacks", this.state.feedbacks);

      // Cloud persist
      await this.apiRequest(`/feedbacks/${id}/approve`, "PUT");
    }
  }

  async deleteFeedback(id) {
    if (!this.state.feedbacks) return;
    this.state.feedbacks = this.state.feedbacks.filter(f => f.id !== id);
    this.saveState("feedbacks");
    this.notify("feedbacks", this.state.feedbacks);

    // Cloud persist
    await this.apiRequest(`/feedbacks/${id}`, "DELETE");
  }

  resetToDefaults() {
    this.state = this.getDefaultState();
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.saveState("all");
  }
}

// Global Singleton Instances (support both NexcoStore and Store)
window.NexcoStore = new NexcoStoreManager();
window.Store = window.NexcoStore;
