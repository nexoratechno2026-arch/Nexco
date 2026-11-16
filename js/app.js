// Nexco 3-Portal Application Orchestrator
// Coordinates Public Website, Student LMS, Admin Command Center, Auth, Terms & Privacy Pages, & Real-Time Notifications
// Joint Collaboration: Nexora Techno × Gencode (Salem, Tamil Nadu)

class NexcoApplication {
  constructor() {
    this.currentView = "public"; // 'public' | 'lms' | 'admin' | 'terms' | 'privacy'
    this.init();
  }

  init() {
    this.setupViewSwitcher();
    this.setupAuthSystem();
    this.setupNotificationCenter();
    this.setupMobileMenu();
    this.setupFeedbackModal();
    this.setupFloatingWidgets();
    this.setupSmoothScroll();
    this.initScrollReveal();
    this.updateUserSessionUI();

    // Check initial hash route
    this.checkInitialHash();

    // Subscribe to state changes
    NexcoStore.subscribe("auth", () => this.updateUserSessionUI());
    NexcoStore.subscribe("notifications", () => this.renderNotifications());

    console.log("Nexco Production Platform Initialized: A Collaboration of Nexora Techno & Gencode (Salem, TN).");
  }

  checkInitialHash() {
    const hash = window.location.hash;
    if (hash === "#terms") {
      this.switchView("terms");
    } else if (hash === "#privacy") {
      this.switchView("privacy");
    } else if (hash === "#admin") {
      const user = NexcoStore.getCurrentUser();
      if (user && user.role === "admin") {
        this.switchView("admin");
      } else {
        this.switchView("public");
      }
    } else if (hash === "#lms") {
      const user = NexcoStore.getCurrentUser();
      if (user) {
        this.switchView("lms");
      } else {
        this.switchView("public");
      }
    }
  }

  // ==========================================
  // 1. STRICT VIEW ROUTER (Conditional Isolation & Security Guard)
  // ==========================================
  switchView(targetView) {
    // Normalize aliases
    if (targetView === "landing") targetView = "public";

    const user = NexcoStore.getCurrentUser();

    // STRICT AUTH GUARD FOR ADMIN
    if (targetView === "admin") {
      if (!user || user.role !== "admin") {
        this.showToast("🔒 Unauthorized: Administrator credentials required to access the Command Center.", "warning");
        this.openAuthModal("login");
        return;
      }
    }

    // AUTH GUARD FOR LMS
    if (targetView === "lms") {
      if (!user) {
        this.showToast("🎓 Please sign in to access your Nexco LearnHub LMS portal.", "info");
        this.openAuthModal("login");
        return;
      }
    }

    const publicContainer = document.getElementById("view-landing-page");
    const lmsContainer = document.getElementById("view-lms-portal");
    const adminContainer = document.getElementById("view-admin-portal");
    const termsContainer = document.getElementById("view-terms-page");
    const privacyContainer = document.getElementById("view-privacy-page");
    const floatingWidgets = document.getElementById("floating-widgets-container");

    // Hide all view containers strictly via both classes and inline display
    const allViews = [
      { id: "public", el: publicContainer, displayType: "block" },
      { id: "lms", el: lmsContainer, displayType: "flex" },
      { id: "admin", el: adminContainer, displayType: "flex" },
      { id: "terms", el: termsContainer, displayType: "block" },
      { id: "privacy", el: privacyContainer, displayType: "block" }
    ];

    allViews.forEach(({ el }) => {
      if (el) {
        el.classList.add("hidden");
        el.style.display = "none";
      }
    });

    this.currentView = targetView;

    if (targetView === "public") {
      if (publicContainer) {
        publicContainer.classList.remove("hidden");
        publicContainer.style.display = "block";
      }
      if (floatingWidgets) floatingWidgets.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (targetView === "lms") {
      if (lmsContainer) {
        lmsContainer.classList.remove("hidden");
        lmsContainer.style.display = "flex";
      }
      if (floatingWidgets) floatingWidgets.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        if (window.NexcoLMS) NexcoLMS.switchLMSTab("dashboard");
      }, 50);
      const userName = user ? user.name : "Learner";
      this.showToast(`🎓 Welcome, ${userName}! Student LearnHub Active`, "info");
    } else if (targetView === "admin") {
      if (adminContainer) {
        adminContainer.classList.remove("hidden");
        adminContainer.style.display = "flex";
      }
      if (floatingWidgets) floatingWidgets.classList.add("hidden"); // do not obstruct admin tables
      window.scrollTo({ top: 0, behavior: "smooth" });
      this.showToast("⚡ Nexco Admin Command Center Active", "success");
    } else if (targetView === "terms") {
      if (termsContainer) {
        termsContainer.classList.remove("hidden");
        termsContainer.style.display = "block";
      }
      if (floatingWidgets) floatingWidgets.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (targetView === "privacy") {
      if (privacyContainer) {
        privacyContainer.classList.remove("hidden");
        privacyContainer.style.display = "block";
      }
      if (floatingWidgets) floatingWidgets.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (targetView === "login") {
      if (publicContainer) {
        publicContainer.classList.remove("hidden");
        publicContainer.style.display = "block";
      }
      this.openAuthModal("login");
    }

    this.updateUserSessionUI();
    setTimeout(() => {
      this.initScrollReveal();
    }, 100);
  }

  setupViewSwitcher() {
    // Portal back-to-website buttons
    document.querySelectorAll(".back-to-website-trigger, #lms-back-to-web, #lms-back-to-web-logo, #admin-back-to-web, #terms-back-to-web, #privacy-back-to-web").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.switchView("public");
      });
    });

    // Admin to LMS trigger
    const adminToLms = document.getElementById("admin-to-lms-btn");
    if (adminToLms) {
      adminToLms.addEventListener("click", (e) => {
        e.preventDefault();
        this.switchView("lms");
      });
    }

    // Terms triggers
    document.querySelectorAll(".terms-link, #footer-terms-link").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const authModal = document.getElementById("auth-modal");
        if (authModal) authModal.classList.add("hidden");
        this.switchView("terms");
      });
    });

    // Privacy triggers
    document.querySelectorAll(".privacy-link, #footer-privacy-link").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const authModal = document.getElementById("auth-modal");
        if (authModal) authModal.classList.add("hidden");
        this.switchView("privacy");
      });
    });

    // Hash change routing
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash;
      if (hash === "#terms") this.switchView("terms");
      else if (hash === "#privacy") this.switchView("privacy");
      else if (hash === "#admin") {
        const user = NexcoStore.getCurrentUser();
        if (user && user.role === "admin") this.switchView("admin");
      }
      else if (hash === "#lms") {
        const user = NexcoStore.getCurrentUser();
        if (user) this.switchView("lms");
      }
    });

    // Navbar portal shortcut
    const navJumpBtn = document.getElementById("nav-portal-jump-btn");
    if (navJumpBtn) {
      navJumpBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const user = NexcoStore.getCurrentUser();
        if (user && user.role === "admin") {
          this.switchView("admin");
        } else {
          this.switchView("lms");
        }
      });
    }

    // Explicit Admin Portal Triggers (Strictly locked to Admin)
    document.querySelectorAll(".admin-portal-trigger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const user = NexcoStore.getCurrentUser();
        if (user && user.role === "admin") {
          this.switchView("admin");
        } else {
          this.showToast("🔒 Admin login required.", "warning");
          this.openAuthModal("login");
        }
      });
    });
  }

  // ==========================================
  // 2. AUTHENTICATION & LOGIN/SIGNUP SYSTEM
  // ==========================================
  openAuthModal(tab = "login") {
    const authModal = document.getElementById("auth-modal");
    if (!authModal) return;
    this.switchAuthTab(tab);
    authModal.classList.remove("hidden");
    authModal.classList.add("flex");
  }

  closeAuthModal() {
    const authModal = document.getElementById("auth-modal");
    if (!authModal) return;
    authModal.classList.add("hidden");
    authModal.classList.remove("flex");
  }

  setupAuthSystem() {
    const authClose = document.getElementById("auth-modal-close");
    const tabLogin = document.getElementById("auth-tab-login");
    const tabSignup = document.getElementById("auth-tab-signup");
    const formLogin = document.getElementById("auth-login-form");
    const formSignup = document.getElementById("auth-signup-form");

    // Open Modal Triggers
    const openLoginTriggers = [
      document.getElementById("nav-login-btn"),
      document.getElementById("mobile-login-btn"),
      document.getElementById("footer-admin-login-link")
    ];

    openLoginTriggers.forEach((btn) => {
      if (!btn) return;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.openAuthModal("login");
      });
    });

    // Close Modal
    authClose?.addEventListener("click", () => this.closeAuthModal());

    // Switch Tabs
    tabLogin?.addEventListener("click", () => this.switchAuthTab("login"));
    tabSignup?.addEventListener("click", () => this.switchAuthTab("signup"));

    // EYE ICON PASSWORD VISIBILITY TOGGLE (Strictly Masked by Default)
    const toggleLoginPass = document.getElementById("toggle-login-pass-visibility");
    const loginPassInput = document.getElementById("auth-login-password");
    if (toggleLoginPass && loginPassInput) {
      toggleLoginPass.addEventListener("click", () => {
        if (loginPassInput.type === "password") {
          loginPassInput.type = "text";
          toggleLoginPass.textContent = "🙈";
        } else {
          loginPassInput.type = "password";
          toggleLoginPass.textContent = "👁";
        }
      });
    }

    const toggleSignupPass = document.getElementById("toggle-signup-pass-visibility");
    const signupPassInput = document.getElementById("auth-signup-password");
    if (toggleSignupPass && signupPassInput) {
      toggleSignupPass.addEventListener("click", () => {
        if (signupPassInput.type === "password") {
          signupPassInput.type = "text";
          toggleSignupPass.textContent = "🙈";
        } else {
          signupPassInput.type = "password";
          toggleSignupPass.textContent = "👁";
        }
      });
    }

    let lockoutInterval = null;

    const startLockoutCountdown = (lockedUntil) => {
      const banner = document.getElementById("auth-login-lockout-banner");
      const timerText = document.getElementById("auth-lockout-timer-text");
      const warningBadge = document.getElementById("auth-login-warning-badge");
      const emailInput = document.getElementById("auth-login-email");
      const passInput = document.getElementById("auth-login-password");
      const submitBtn = document.getElementById("auth-login-submit");
      const challengeBox = document.getElementById("auth-challenge-container");

      if (lockoutInterval) clearInterval(lockoutInterval);

      if (warningBadge) warningBadge.classList.add("hidden");
      if (challengeBox) challengeBox.classList.add("hidden");
      if (banner) banner.classList.remove("hidden");

      if (emailInput) emailInput.disabled = true;
      if (passInput) passInput.disabled = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-50", "cursor-not-allowed");
      }

      const updateTimer = () => {
        const remainingMs = lockedUntil - Date.now();
        if (remainingMs <= 0) {
          clearInterval(lockoutInterval);
          if (banner) banner.classList.add("hidden");
          if (emailInput) emailInput.disabled = false;
          if (passInput) passInput.disabled = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
          }
          this.showToast("Lockout cooldown expired. You may attempt to sign in.", "info");
          return;
        }

        const totalSec = Math.ceil(remainingMs / 1000);
        const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
        const ss = String(totalSec % 60).padStart(2, "0");
        if (timerText) {
          timerText.textContent = `🔒 Login disabled for security. Please wait ${mm}:${ss} before trying again.`;
        }
      };

      updateTimer();
      lockoutInterval = setInterval(updateTimer, 1000);
    };

    const loadLoginChallenge = async () => {
      const container = document.getElementById("auth-challenge-container");
      const display = document.getElementById("auth-challenge-display");
      const idInput = document.getElementById("auth-challenge-id");
      const valInput = document.getElementById("auth-challenge-input");

      if (!container || !display) return;
      display.textContent = "Loading...";

      const challenge = await NexcoStore.getAuthChallenge();
      if (challenge) {
        container.classList.remove("hidden");
        display.textContent = challenge.prompt || challenge.question;
        if (idInput) idInput.value = challenge.challengeId;
        if (valInput) {
          valInput.value = "";
          valInput.focus();
        }
      }
    };

    document.getElementById("auth-challenge-refresh-btn")?.addEventListener("click", () => {
      loadLoginChallenge();
    });

    // Password Strength Meter in Registration Form
    const signupPassInputForStrength = document.getElementById("auth-signup-password");
    const strengthText = document.getElementById("password-strength-text");
    const bars = [
      document.getElementById("pwd-bar-1"),
      document.getElementById("pwd-bar-2"),
      document.getElementById("pwd-bar-3"),
      document.getElementById("pwd-bar-4")
    ];

    const evaluatePasswordStrength = (pwd) => {
      let score = 0;
      if (!pwd) return score;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
      return score;
    };

    signupPassInputForStrength?.addEventListener("input", (e) => {
      const pwd = e.target.value;
      const score = evaluatePasswordStrength(pwd);

      bars.forEach(b => {
        if (b) b.className = "h-full rounded-full bg-white/10 transition-colors";
      });

      if (!pwd || pwd.length < 8) {
        if (strengthText) {
          strengthText.textContent = "Too Short (Min 8 chars)";
          strengthText.className = "font-bold text-slate-500";
        }
        return;
      }

      if (score === 1) {
        if (bars[0]) bars[0].className = "h-full rounded-full bg-red-500 transition-colors";
        if (strengthText) {
          strengthText.textContent = "Weak";
          strengthText.className = "font-bold text-red-400";
        }
      } else if (score === 2) {
        if (bars[0]) bars[0].className = "h-full rounded-full bg-amber-500 transition-colors";
        if (bars[1]) bars[1].className = "h-full rounded-full bg-amber-500 transition-colors";
        if (strengthText) {
          strengthText.textContent = "Medium";
          strengthText.className = "font-bold text-amber-400";
        }
      } else if (score === 3) {
        if (bars[0]) bars[0].className = "h-full rounded-full bg-emerald-400 transition-colors";
        if (bars[1]) bars[1].className = "h-full rounded-full bg-emerald-400 transition-colors";
        if (bars[2]) bars[2].className = "h-full rounded-full bg-emerald-400 transition-colors";
        if (strengthText) {
          strengthText.textContent = "Strong";
          strengthText.className = "font-bold text-emerald-400";
        }
      } else if (score >= 4) {
        bars.forEach(b => {
          if (b) b.className = "h-full rounded-full bg-emerald-500 transition-colors shadow-sm shadow-emerald-500/50";
        });
        if (strengthText) {
          strengthText.textContent = "Very Strong ✓";
          strengthText.className = "font-bold text-emerald-300";
        }
      }
    });

    // Login Form Submit (NO Admin Hints in UI)
    formLogin?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("auth-login-email")?.value.trim();
      const pass = document.getElementById("auth-login-password")?.value;
      const challengeId = document.getElementById("auth-challenge-id")?.value;
      const challengeAnswer = document.getElementById("auth-challenge-input")?.value?.trim();
      const warningBadge = document.getElementById("auth-login-warning-badge");
      const warningText = document.getElementById("auth-warning-badge-text");

      const challengeContainer = document.getElementById("auth-challenge-container");
      const isChallengeActive = challengeContainer && !challengeContainer.classList.contains("hidden");
      if (isChallengeActive && !challengeAnswer) {
        this.showToast("Please solve the human verification puzzle to continue.", "warning");
        document.getElementById("auth-challenge-input")?.focus();
        return;
      }

      const res = await NexcoStore.login(email, pass, challengeId, challengeAnswer);

      if (res.success) {
        this.closeAuthModal();
        formLogin.reset();
        if (warningBadge) warningBadge.classList.add("hidden");
        document.getElementById("auth-challenge-container")?.classList.add("hidden");

        if (res.role === "admin") {
          this.switchView("admin");
        } else {
          this.switchView("lms");
        }
        this.showToast(`Logged in successfully as ${res.user.name}`, "success");
      } else {
        // Check for Hard Lockout (HTTP 429)
        if (res.lockedUntil) {
          startLockoutCountdown(res.lockedUntil);
          this.showToast("Account locked due to multiple failed attempts. Please wait.", "error");
          return;
        }

        // Show remaining attempts warning
        if (typeof res.remainingAttempts === "number") {
          if (warningBadge && warningText) {
            warningBadge.classList.remove("hidden");
            warningText.innerHTML = `⚠️ Incorrect credentials. <strong>${res.remainingAttempts} login attempt${res.remainingAttempts === 1 ? '' : 's'} remaining</strong> before temporary 15-minute lockout.`;
          }
        }

        // Check if Human Verification Challenge is required
        if (res.challengeRequired) {
          await loadLoginChallenge();
          this.showToast("Please solve the human security verification challenge.", "warning");
        } else {
          this.showToast(res.message, "warning");
        }
      }
    });

    // Signup Form Submit with Strict Password Complexity & 10-Digit Indian Phone Validation
    formSignup?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("auth-signup-name")?.value.trim();
      const email = document.getElementById("auth-signup-email")?.value.trim();
      const phone = document.getElementById("auth-signup-phone")?.value.trim();
      const password = document.getElementById("auth-signup-password")?.value;
      const alerts = document.getElementById("auth-signup-alerts")?.checked;
      const termsAccepted = document.getElementById("auth-signup-terms")?.checked;

      if (!termsAccepted) {
        this.showToast("Please agree to the Terms & Conditions and Privacy Policy to create an account.", "warning");
        return;
      }

      // Validate Indian 10-digit mobile number
      const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        this.showToast("Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).", "warning");
        return;
      }

      // Validate Password Complexity on Client
      const strengthScore = evaluatePasswordStrength(password);
      if (strengthScore < 4) {
        this.showToast("Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol (!@#$%^&*).", "warning");
        return;
      }

      const res = await NexcoStore.signup({ name, email, phone: cleanPhone, password, receiveAlerts: alerts });
      if (res.success) {
        this.closeAuthModal();
        formSignup.reset();
        this.switchView("lms");
        this.showToast(`Account created! Welcome to Nexco LearnHub, ${res.user.name}! 🚀`, "success");
      } else {
        this.showToast(res.message, "warning");
      }
    });

    // 1-Click Google Sign-In
    const googleBtn = document.getElementById("google-signin-btn");
    googleBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      const originalHtml = googleBtn.innerHTML;
      googleBtn.disabled = true;
      googleBtn.innerHTML = `<span>Connecting to Google...</span>`;

      const res = await NexcoStore.signInWithGoogle();

      googleBtn.disabled = false;
      googleBtn.innerHTML = originalHtml;

      if (res.success) {
        this.closeAuthModal();
        if (res.role === "admin") {
          this.switchView("admin");
        } else {
          this.switchView("lms");
        }
        this.showToast(`Signed in with Google as ${res.user.name}! 🚀`, "success");
      } else {
        this.showToast(res.message || "Google sign-in canceled.", "warning");
      }
    });

    // Logout triggers (Desktop, LMS, Admin & Mobile)
    const logoutBtns = [
      document.getElementById("nav-logout-btn"),
      document.getElementById("mobile-logout-btn"),
      document.getElementById("lms-logout-btn"),
      document.getElementById("admin-logout-btn")
    ];

    logoutBtns.forEach((btn) => {
      btn?.addEventListener("click", async (e) => {
        e.preventDefault();
        await NexcoStore.logout();
        this.switchView("public");
        this.showToast("Logged out successfully.", "info");
      });
    });
  }

  switchAuthTab(tab) {
    const tabLogin = document.getElementById("auth-tab-login");
    const tabSignup = document.getElementById("auth-tab-signup");
    const formLogin = document.getElementById("auth-login-form");
    const formSignup = document.getElementById("auth-signup-form");
    const title = document.getElementById("auth-modal-title");

    if (tab === "login") {
      tabLogin?.classList.add("bg-emerald-500", "text-black", "font-bold", "shadow-md");
      tabLogin?.classList.remove("text-slate-400");
      tabSignup?.classList.remove("bg-emerald-500", "text-black", "font-bold", "shadow-md");
      tabSignup?.classList.add("text-slate-400");

      formLogin?.classList.remove("hidden");
      formSignup?.classList.add("hidden");
      if (title) title.textContent = "Sign In to Nexco Portal";
    } else {
      tabSignup?.classList.add("bg-emerald-500", "text-black", "font-bold", "shadow-md");
      tabSignup?.classList.remove("text-slate-400");
      tabLogin?.classList.remove("bg-emerald-500", "text-black", "font-bold", "shadow-md");
      tabLogin?.classList.add("text-slate-400");

      formSignup?.classList.remove("hidden");
      formLogin?.classList.add("hidden");
      if (title) title.textContent = "Create Learner Account";
    }
  }

  updateUserSessionUI() {
    const user = NexcoStore.getCurrentUser();

    // Desktop Navbar Elements
    const loggedOutActions = document.getElementById("nav-logged-out-actions");
    const userControls = document.getElementById("nav-user-controls");
    const dynamicButtons = document.getElementById("nav-dynamic-auth-buttons");
    const navUserName = document.getElementById("nav-user-name");
    const lmsHeaderName = document.getElementById("lms-header-user-name");
    const lmsStudentName = document.getElementById("lms-student-name");

    // Mobile Menu Elements
    const mobileLoggedOut = document.getElementById("mobile-logged-out-actions");
    const mobileUserControls = document.getElementById("mobile-user-controls");
    const mobileUserName = document.getElementById("mobile-user-name");
    const mobileLmsBtn = document.getElementById("mobile-lms-btn");
    const mobileAdminBtn = document.getElementById("mobile-admin-btn");

    // Always clear dynamic buttons container first to prevent duplicate buttons!
    if (dynamicButtons) {
      dynamicButtons.innerHTML = "";
    }

    // STRICT ADMIN LOCKDOWN: Hide all admin portal triggers by default
    const adminTriggers = document.querySelectorAll(".admin-portal-trigger");
    if (user && user.role === "admin") {
      adminTriggers.forEach(el => el.classList.remove("hidden"));
    } else {
      adminTriggers.forEach(el => el.classList.add("hidden"));
    }

    if (user) {
      // User is logged in: strictly hide loggedOutActions and display userControls
      if (loggedOutActions) {
        loggedOutActions.classList.add("hidden");
        loggedOutActions.style.display = "none";
      }
      if (userControls) {
        userControls.classList.remove("hidden");
        userControls.style.display = "flex";
      }

      if (mobileLoggedOut) {
        mobileLoggedOut.classList.add("hidden");
        mobileLoggedOut.style.display = "none";
      }
      if (mobileUserControls) {
        mobileUserControls.classList.remove("hidden");
        mobileUserControls.style.display = "flex";
      }

      if (mobileUserName) mobileUserName.textContent = user.name;
      if (navUserName) navUserName.textContent = user.name.split(" ")[0];
      if (lmsHeaderName) lmsHeaderName.textContent = user.name;
      if (lmsStudentName) lmsStudentName.textContent = user.name;

      // Populate single set of dynamic buttons based on role
      if (dynamicButtons) {
        if (user.role === "admin") {
          // ADMIN: ONE Admin Center button + ONE Preview LMS button
          const adminBtn = document.createElement("button");
          adminBtn.id = "nav-admin-center-btn";
          adminBtn.className = "px-3 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors";
          adminBtn.innerHTML = `<span>⚡</span><span>Admin Center</span>`;
          adminBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.switchView("admin");
          });

          const previewLmsBtn = document.createElement("button");
          previewLmsBtn.id = "nav-preview-lms-btn";
          previewLmsBtn.className = "px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors";
          previewLmsBtn.innerHTML = `<span>🎓</span><span>Preview LMS</span>`;
          previewLmsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.switchView("lms");
          });

          dynamicButtons.appendChild(adminBtn);
          dynamicButtons.appendChild(previewLmsBtn);

          if (mobileAdminBtn) {
            mobileAdminBtn.classList.remove("hidden");
            mobileAdminBtn.style.display = "flex";
          }
        } else {
          // STUDENT: ONLY ONE button: LearnHub LMS
          const lmsBtn = document.createElement("button");
          lmsBtn.id = "nav-student-lms-btn";
          lmsBtn.className = "px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap btn-shimmer transition-colors";
          lmsBtn.innerHTML = `<span>🎓</span><span>LearnHub LMS</span>`;
          lmsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.switchView("lms");
          });

          dynamicButtons.appendChild(lmsBtn);

          if (mobileAdminBtn) {
            mobileAdminBtn.classList.add("hidden");
            mobileAdminBtn.style.display = "none";
          }
        }
      }
    } else {
      // Logged out: strictly show loggedOutActions and hide userControls
      if (loggedOutActions) {
        loggedOutActions.classList.remove("hidden");
        loggedOutActions.style.display = "flex";
      }
      if (userControls) {
        userControls.classList.add("hidden");
        userControls.style.display = "none";
      }

      if (mobileLoggedOut) {
        mobileLoggedOut.classList.remove("hidden");
        mobileLoggedOut.style.display = "flex";
      }
      if (mobileUserControls) {
        mobileUserControls.classList.add("hidden");
        mobileUserControls.style.display = "none";
      }

      if (lmsHeaderName) lmsHeaderName.textContent = "Guest Learner";
      if (lmsStudentName) lmsStudentName.textContent = "Learner";
    }

    this.renderNotifications();
  }

  // ==========================================
  // 3. REAL-TIME NOTIFICATION SYSTEM
  // ==========================================
  setupNotificationCenter() {
    // Popover toggles
    const navNotifBtn = document.getElementById("nav-notif-btn");
    const navPopover = document.getElementById("nav-notif-popover");
    const lmsNotifBtn = document.getElementById("lms-notif-btn");
    const lmsPopover = document.getElementById("lms-notif-popover");

    if (navNotifBtn && navPopover) {
      navNotifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navPopover.classList.toggle("hidden");
      });
    }

    if (lmsNotifBtn && lmsPopover) {
      lmsNotifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        lmsPopover.classList.toggle("hidden");
      });
    }

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (navPopover && !navPopover.contains(e.target) && e.target !== navNotifBtn) {
        navPopover.classList.add("hidden");
      }
      if (lmsPopover && !lmsPopover.contains(e.target) && e.target !== lmsNotifBtn) {
        lmsPopover.classList.add("hidden");
      }
    });

    // Mark all as read
    document.querySelectorAll("#nav-notif-read-all, #lms-notif-read-all").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        NexcoStore.markNotificationsAsRead();
        this.renderNotifications();
        this.showToast("All notifications marked as read.", "info");
      });
    });
  }

  renderNotifications() {
    const notifs = NexcoStore.getNotifications();
    const unreadCount = NexcoStore.getUnreadNotificationCount();

    const navBadge = document.getElementById("nav-notif-badge");
    const lmsBadge = document.getElementById("lms-notif-badge");
    const navList = document.getElementById("nav-notif-list");
    const lmsList = document.getElementById("lms-notif-list");

    // Update badges
    [navBadge, lmsBadge].forEach((badge) => {
      if (!badge) return;
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    });

    const html = notifs.length === 0
      ? `<div class="p-6 text-center text-slate-500 text-xs">No notifications yet. You're all caught up!</div>`
      : notifs.map((n) => {
          const icon = n.type === "live" ? "🔴" : n.type === "workshop" ? "📅" : n.type === "approval" ? "✅" : "📢";
          return `
            <div class="p-3 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-2.5 ${n.read ? 'opacity-70' : 'bg-emerald-500/5 border border-emerald-500/20'}">
              <span class="text-base shrink-0 mt-0.5">${icon}</span>
              <div class="flex-1 space-y-0.5">
                <div class="font-bold text-white flex items-center justify-between">
                  <span>${n.title}</span>
                  <span class="text-[10px] text-slate-400 font-mono font-normal">${n.timestamp}</span>
                </div>
                <p class="text-[11px] text-slate-300 leading-relaxed">${n.message}</p>
              </div>
            </div>
          `;
        }).join("");

    if (navList) navList.innerHTML = html;
    if (lmsList) lmsList.innerHTML = html;
  }

  handleSessionInvalidation(message) {
    this.updateUserSessionUI();
    this.switchView("public");
    this.showToast(message || "Admin session invalidated: Another admin login has occurred. Please sign in again.", "warning");
    setTimeout(() => {
      this.openAuthModal("login");
    }, 400);
  }

  // ==========================================
  // 4. TOAST NOTIFICATIONS
  // ==========================================
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast max-w-md px-4 py-3 rounded-xl border flex items-center gap-3 shadow-2xl backdrop-blur-md text-xs font-medium z-50 ${
      type === "success" 
        ? "bg-[#072B21]/95 text-emerald-200 border-emerald-500/40" 
        : type === "warning"
          ? "bg-[#2A1805]/95 text-amber-200 border-amber-500/40" 
          : "bg-[#12171A]/95 text-slate-200 border-white/15"
    }`;

    const icon = type === "success" 
      ? `<span class="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs shrink-0">✓</span>`
      : type === "warning"
        ? `<span class="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs shrink-0">!</span>`
        : `<span class="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">ℹ</span>`;

    toast.innerHTML = `
      ${icon}
      <div class="flex-1 leading-relaxed">${message}</div>
      <button class="text-slate-400 hover:text-white p-1 ml-1" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-out");
      setTimeout(() => toast.remove(), 250);
    }, 4500);
  }

  // ==========================================
  // 5. WORKSHOP FEEDBACK MODAL
  // ==========================================
  setupFeedbackModal() {
    const modal = document.getElementById("feedback-modal");
    const openBtn = document.getElementById("open-feedback-modal-btn");
    const closeBtn = document.getElementById("feedback-modal-close");
    const form = document.getElementById("feedback-form");

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("feedback-name")?.value.trim();
        const role = document.getElementById("feedback-role")?.value.trim();
        const workshop = document.getElementById("feedback-workshop")?.value;
        const rating = document.getElementById("feedback-rating")?.value;
        const comment = document.getElementById("feedback-comment")?.value.trim();
        const linkedin = document.getElementById("feedback-linkedin")?.value.trim();

        if (!name || !comment) {
          this.showToast("Please provide your name and honest feedback.", "warning");
          return;
        }

        NexcoStore.addFeedback({
          name,
          role: role || "Workshop Participant",
          workshop: workshop || "100% Live Online Masterclass",
          rating: parseInt(rating) || 5,
          comment,
          linkedin: linkedin || ""
        });

        modal?.classList.add("hidden");
        modal?.classList.remove("flex");
        form.reset();

        this.showToast("🙏 Thank you! Your feedback has been submitted for mentor review.", "success");
      });
    }
  }

  // ==========================================
  // 6. FLOATING WIDGETS (AI ASSISTANT & WHATSAPP)
  // ==========================================
  setupFloatingWidgets() {
    const aiBtn = document.getElementById("floating-ai-btn");
    const aiDrawer = document.getElementById("floating-ai-drawer");
    const aiClose = document.getElementById("floating-ai-close");
    const aiFeed = document.getElementById("floating-ai-feed");
    const aiInput = document.getElementById("floating-ai-input");
    const aiSend = document.getElementById("floating-ai-send");

    if (aiBtn && aiDrawer) {
      aiBtn.addEventListener("click", () => {
        aiDrawer.classList.toggle("hidden");
        if (!aiDrawer.classList.contains("hidden")) {
          aiInput?.focus();
        }
      });

      aiClose?.addEventListener("click", () => {
        aiDrawer.classList.add("hidden");
      });

      const handleAiSend = (overrideText = null) => {
        const query = overrideText || aiInput?.value.trim();
        if (!query) return;

        // User Message
        const userMsg = document.createElement("div");
        userMsg.className = "flex justify-end";
        userMsg.innerHTML = `
          <div class="max-w-[85%] p-3 rounded-2xl bg-emerald-500 text-slate-950 font-medium text-xs leading-relaxed">
            ${query}
          </div>
        `;
        aiFeed?.appendChild(userMsg);
        if (aiInput) aiInput.value = "";
        aiFeed.scrollTop = aiFeed.scrollHeight;

        // Thinking Indicator
        const botThinking = document.createElement("div");
        botThinking.className = "flex justify-start";
        botThinking.innerHTML = `
          <div class="max-w-[85%] p-3 rounded-2xl bg-[#181C1E] border border-white/10 text-xs text-slate-300">
            <span class="animate-pulse">Consulting Academic Advisor...</span>
          </div>
        `;
        aiFeed?.appendChild(botThinking);
        aiFeed.scrollTop = aiFeed.scrollHeight;

        setTimeout(() => {
          botThinking.remove();
          let botAnswer = "Vanakkam! Nexco is an official collaboration of Nexora Techno & Gencode based in Salem, Tamil Nadu (Registered HQ: 15/2, Sankar Nagar, Salem-7). All classes, code reviews, and live masterclasses are conducted 100% Live Online with interactive screen-share guidance in Tamil & English. Would you like to speak to Lead Mentor Karthik Sundaram on WhatsApp (+91 93451 21988)?";

          const lower = query.toLowerCase();
          if (lower.includes("fee") || lower.includes("cost") || lower.includes("price")) {
            botAnswer = "Admissions at Nexco are counseling-led with zero automatic payment checkouts. Our programs include flexible monthly installment options for college students and working professionals. Contact our counseling desk at +91 93451 21988 to review course plans.";
          } else if (lower.includes("salem") || lower.includes("location") || lower.includes("address") || lower.includes("offline")) {
            botAnswer = "Nexco's Registered Headquarters & Administration Office is located at 15/2, Sankar Nagar, Salem - 636007, Tamil Nadu. All learning, code reviews, and live masterclasses are conducted 100% Live Online with interactive screen-share guidance in Tamil & English.";
          } else if (lower.includes("tamil") || lower.includes("language")) {
            botAnswer = "Yes! All live online masterclasses, 1-on-1 doubt solving, and code reviews at Nexco are offered in Tamil and English bilingual format so language is never a barrier to mastering systems.";
          } else if (lower.includes("collaboration") || lower.includes("nexora") || lower.includes("gencode")) {
            botAnswer = "Nexco is an official joint venture powered by the combined engineering expertise of Nexora Techno and Gencode. Every curriculum module, live online masterclass, and graduation certificate is jointly verified by both engineering teams.";
          }

          const botMsg = document.createElement("div");
          botMsg.className = "flex justify-start";
          botMsg.innerHTML = `
            <div class="max-w-[85%] p-3 rounded-2xl bg-[#181C1E] border border-emerald-500/30 text-xs text-slate-200 leading-relaxed space-y-2">
              <div class="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <span>🤖 Nexco Live Advisor</span>
              </div>
              <p>${botAnswer}</p>
            </div>
          `;
          aiFeed?.appendChild(botMsg);
          aiFeed.scrollTop = aiFeed.scrollHeight;
        }, 600);
      };

      aiSend?.addEventListener("click", () => handleAiSend());
      aiInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleAiSend();
      });

      document.querySelectorAll(".ai-advisor-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          handleAiSend(chip.getAttribute("data-prompt"));
        });
      });
    }

    // WhatsApp floating button
    const waBtn = document.getElementById("floating-wa-btn");
    if (waBtn) {
      waBtn.addEventListener("click", () => {
        const text = encodeURIComponent("Vanakkam Nexco Salem! I am interested in exploring founding batch admissions for 100% Live Online classes with live mentor guidance.");
        const settings = NexcoStore.getSiteSettings();
        const rawNum = settings?.contact?.phone || "9345121988";
        const targetNum = rawNum.replace(/[^0-9]/g, "");
        window.open(`https://wa.me/${targetNum.startsWith("91") ? targetNum : "91" + targetNum}?text=${text}`, "_blank");
      });
    }
  }

  // ==========================================
  // 7. RESPONSIVE MOBILE DRAWERS (PUBLIC, LMS, ADMIN)
  // ==========================================
  setupMobileMenu() {
    // 1. Public Navbar Drawer
    const toggle = document.getElementById("mobile-menu-toggle");
    const menu = document.getElementById("mobile-menu-drawer");
    const close = document.getElementById("mobile-menu-close");

    if (toggle && menu) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("hidden");
      });
      
      close?.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.add("hidden");
      });

      // Close on clicking any link or anchor inside mobile drawer
      menu.querySelectorAll("a, .mobile-nav-link").forEach((link) => {
        link.addEventListener("click", () => menu.classList.add("hidden"));
      });

      // Close on clicking any action button inside mobile drawer (e.g. login, sign up)
      menu.querySelectorAll("button").forEach((btn) => {
        if (btn !== close) {
          btn.addEventListener("click", () => menu.classList.add("hidden"));
        }
      });

      // Close on outside tap/click
      document.addEventListener("click", (e) => {
        if (!menu.classList.contains("hidden") && !menu.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
          menu.classList.add("hidden");
        }
      });
    }

    // Mobile Drawer Navigation Actions
    const mobileLmsBtn = document.getElementById("mobile-lms-btn");
    if (mobileLmsBtn) {
      mobileLmsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        menu?.classList.add("hidden");
        this.switchView("lms");
      });
    }

    const mobileAdminBtn = document.getElementById("mobile-admin-btn");
    if (mobileAdminBtn) {
      mobileAdminBtn.addEventListener("click", (e) => {
        e.preventDefault();
        menu?.classList.add("hidden");
        const user = NexcoStore.getCurrentUser();
        if (user && user.role === "admin") {
          this.switchView("admin");
        } else {
          this.showToast("🔒 Admin login required.", "warning");
          this.openAuthModal("login");
        }
      });
    }

    // 2. LMS Mobile Drawer
    const lmsToggle = document.getElementById("lms-mobile-menu-btn");
    const lmsMenu = document.getElementById("lms-mobile-drawer");
    const lmsClose = document.getElementById("lms-mobile-menu-close");

    if (lmsToggle && lmsMenu) {
      lmsToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        lmsMenu.classList.toggle("hidden");
      });

      lmsClose?.addEventListener("click", (e) => {
        e.stopPropagation();
        lmsMenu.classList.add("hidden");
      });

      lmsMenu.querySelectorAll(".lms-nav-item, a, button").forEach((link) => {
        if (link !== lmsClose) {
          link.addEventListener("click", () => lmsMenu.classList.add("hidden"));
        }
      });

      document.addEventListener("click", (e) => {
        if (!lmsMenu.classList.contains("hidden") && !lmsMenu.contains(e.target) && e.target !== lmsToggle && !lmsToggle.contains(e.target)) {
          lmsMenu.classList.add("hidden");
        }
      });
    }

    // 3. Admin Mobile Drawer
    const adminToggle = document.getElementById("admin-mobile-menu-btn");
    const adminMenu = document.getElementById("admin-mobile-drawer");
    const adminClose = document.getElementById("admin-mobile-menu-close");

    if (adminToggle && adminMenu) {
      adminToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        adminMenu.classList.toggle("hidden");
      });

      adminClose?.addEventListener("click", (e) => {
        e.stopPropagation();
        adminMenu.classList.add("hidden");
      });

      adminMenu.querySelectorAll(".admin-nav-item, a, button").forEach((link) => {
        if (link !== adminClose) {
          link.addEventListener("click", () => adminMenu.classList.add("hidden"));
        }
      });

      document.addEventListener("click", (e) => {
        if (!adminMenu.classList.contains("hidden") && !adminMenu.contains(e.target) && e.target !== adminToggle && !adminToggle.contains(e.target)) {
          adminMenu.classList.add("hidden");
        }
      });
    }
  }

  // ==========================================
  // 8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // ==========================================
  initScrollReveal() {
    const reveals = document.querySelectorAll(
      ".reveal-up:not(.is-visible), .reveal-left:not(.is-visible), .reveal-right:not(.is-visible), .reveal-scale:not(.is-visible)"
    );
    if (!reveals.length) return;

    if (!("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (targetId === "#" || !targetId.startsWith("#")) return;
        
        // If clicking a section anchor while on terms, privacy, admin, or lms, switch back to public first
        if (["terms", "privacy", "admin", "lms"].includes(this.currentView)) {
          if (["#hero", "#programs", "#impact", "#workshops", "#diagnostic", "#demos", "#charter", "#feedback", "#salem-hub"].includes(targetId)) {
            this.switchView("public");
          }
        }

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }
}

// Global scroll reveal hook for dynamically injected HTML cards
window.initScrollReveal = () => {
  if (window.NexcoApp && window.NexcoApp.initScrollReveal) {
    window.NexcoApp.initScrollReveal();
  }
};

// Global App Proxy for immediate inline onclick access
window.App = {
  navigate(view) {
    if (view === "landing" || view === "website") view = "public";
    if (window.NexcoApp && window.NexcoApp.switchView) {
      return window.NexcoApp.switchView(view);
    }
  },
  switchView(view) {
    return this.navigate(view);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  window.NexcoApp = new NexcoApplication();
  window.NexcoApp.navigate = function(view) {
    if (view === "landing" || view === "website") view = "public";
    return this.switchView(view);
  };
  window.App = window.NexcoApp;
});
