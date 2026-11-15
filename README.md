# Nexco — Tech & Career Accelerator (Salem, Tamil Nadu)
### 🤝 Powered by the Official Collaboration of Nexora Techno & Gencode
### 🚀 Full-Stack Architecture: Node.js + Express + Firebase Backend & Modular Frontend

Nexco is Salem's premier hands-on Tech & Career Acceleration ecosystem, jointly delivered through the strategic collaboration of **Nexora Techno** and **Gencode**, serving students and working professionals across **Salem, Rasipuram, Namakkal, Erode, Coimbatore, and Pan-India**.

The platform is **100% dynamic (zero hardcoding)**, powered by a secure **Node.js + Express + Firebase (Firebase Auth + Cloud Firestore)** backend with a modular frontend architecture strictly separated in `/public`:
1. 🌐 **Public Website (`public/js/landing.js`):** Conversion-optimized, localized landing page featuring live announcement tickers, joint collaboration branding, counselor lead capture, live workshops scheduler, dynamic course catalog, interactive career diagnostics, Nexco Charter honest commitments, dynamic workshop feedback, and dedicated Terms & Privacy pages.
2. 🎓 **Student LMS Portal (`public/js/lms.js`):** Interactive video classroom with timestamped notes, live class banners, course syllabi, quizzes, and a Capstone Project Dropzone.
3. ⚡ **Admin Command Center (`public/js/admin.js`):** Isolated management suite (accessible only after secure authentication) with full CRUD management to add/edit/delete courses, schedule live workshops, toggle classes to `🔴 LIVE NOW`, approve student enrollments with 1-click, moderate early learner feedback, and review student capstone projects.
4. 💾 **Reactive Cloud Store (`public/js/store.js` / `Store.js`):** Event-driven client data layer with optimistic caching in `localStorage` and real-time synchronization with Node.js REST APIs and Cloud Firestore.
5. 📊 **Official Catalog & Brand Specs (`public/js/data.js`):** Localized brand constants, track blueprints, and Salem campus configurations.
6. 🎛️ **View & Auth Orchestrator (`public/js/app.js`):** Single-page view router, authenticated session manager, mobile slide-over drawers, and toast alerts.

---

## 🚫 Critical Business Rule: Zero Payment Gateways
- **No Stripe, Razorpay, or checkout carts are used.**
- All course enrollments, masterclass seats, and admissions happen through:
  1. **Counseling & Lead Capture Forms** (`Hero Form
  `, `Counseling Modal`, `Workshop Registration`).
  2. **Direct WhatsApp Onboarding** with Senior Counselors (+91 93451 21988).
  3. **One-Click Admin Approval** in the Command Center, which immediately grants student LMS access without any payment barrier.

---

## 🛡️ Nexco Charter — Honest, Grounded Commitments
- **Zero Fake Placement Guarantees:** No exaggerated CTC or fake hike claims. Real tech hiring depends on demonstrable engineering competence, deep fundamentals, and clean problem solving.
- **Build & Deploy Live Production Projects:** No toy `todo-apps` or clone tutorials. Every learner engineers distributed microservices, semantic vector pipelines, and production design systems.
- **Direct Mentor Code Reviews & Bilingual Guidance:** Senior engineers review your Pull Requests line by line with clear Tamil & English guidance.
- **Verified Collaboration Certificate & Portfolio Proof:** Proof of engineering competence verified jointly by **Nexora Techno & Gencode**.

---

## 📍 Localized Brand Identity (Salem, Tamil Nadu, India)
- **Headquarters:** 15/2, Sankar Nagar, Salem - 636007, Tamil Nadu, India (Display: 15/2, Sankar Nagar, Salem-7).
- **Collaboration Partners:** Nexora Techno × Gencode.
- **Regions Served:** Salem, Rasipuram, Namakkal, Erode, Coimbatore, and Pan-India online.
- **Bilingual Support:** Tamil & English bilingual mentorship for code reviews and architecture design.
- **Batches & Timings:**
  - **Salem Offline Practical Labs:** Saturdays & Sundays (10:00 AM – 6:00 PM IST).
  - **Weekday Evening Live Online:** Monday to Friday (5:00 PM – 9:00 PM IST).
- **Admissions Support:** `+91 93451 21988` • `admissions@nexco.in`.
- **Direct WhatsApp:** `https://wa.me/919345121988`

---

## 🛠️ Full-Stack Backend Architecture

```
Nexco/
├── server.js               # Node.js + Express entry point (Helmet, CORS, Rate-limits, Static)
├── package.json            # Dependencies: express, cors, helmet, firebase-admin, etc.
├── .env.example            # Environment variables template for Firebase credentials
├── .env                    # Active local environment settings
├── config/
│   └── firebase.js         # Firebase Admin SDK with zero-crash Local Datastore fallback
├── middleware/
│   └── auth.js             # Token verification and Admin role guards
├── routes/
│   ├── auth.js             # POST /login, /register, /logout, GET /me
│   ├── courses.js          # CRUD /api/courses
│   ├── workshops.js        # CRUD /api/workshops (live toggle)
│   ├── leads.js            # Capture /api/leads & manage inquiries
│   ├── students.js         # 1-Click enroll & student records
│   ├── announcements.js    # Sticky top-bar banner publisher
│   ├── feedbacks.js        # Early learner feedback & moderation
│   └── submissions.js      # Student capstone review & certification
└── public/                 # Modular Frontend (strictly separated files)
    ├── index.html          # Semantic single-page layout (Public, LMS, Admin, Terms, Privacy)
    ├── css/
    │   └── styles.css      # Obsidian glassmorphic design system
    ├── js/
    │   ├── data.js         # Brand specifications & course blueprints
    │   ├── store.js        # Reactive state store & Cloud API client (also Store.js)
    │   ├── landing.js      # Public landing page controller & diagnostic engine
    │   ├── lms.js          # LearnHub interactive classroom & notes engine
    │   ├── admin.js        # Admin Command Center controller
    │   └── app.js          # View switcher, authentication, & mobile drawers
    └── assets/
        └── logo.png        # Official Nexco emblem
```

---

## 💻 Running & Testing

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Add your Firebase credentials when ready, or run immediately in fallback mode!
   ```

3. **Start the Node.js Server:**
   ```bash
   npm start
   # Server runs at http://localhost:3000
   ```

---

## 🚀 Key Modules & Architecture

### 1. Centralized Reactive State Store (`js/store.js`)
- Persists all state across page reloads via `localStorage` under `NEXCO_STATE_PROD_V2` and `NEXCO_USER_SESSION_V2`.
- Pub-Sub event bus: `NexcoStore.subscribe(domain, callback)`.
- Updates made in the **Admin Panel** instantly re-render the Public Website and Student LMS in real time without refreshing the browser!

### 2. Public Website (`js/landing.js`)
- **Top Announcement Bar:** Controlled and editable by Admin (can be toggled on/off, badge and text updated live).
- **Collaboration Badge:** Sleek glowing pill at the hero header (`🤝 An Official Collaboration of Nexora Techno & Gencode`).
- **Founding Batch Admissions Banner:** Joint venture launch banner highlighting practical projects and bilingual mentorship.
- **Hero Lead Capture Form:** Captures `Full Name`, `Email`, `WhatsApp (+91)`, `College/City`, and `Target Track`. Pushes directly to the Admin Panel.
- **Live Masterclasses & Workshops:** Live Google Meet sessions with real-time countdown, mentor details, and live status badges (`🔴 LIVE NOW`, `🟢 Seats Filling Fast`).
- **Dynamic Flagship Courses:** Pulled live from the store, tagged with joint delivery badges:
  1. *Full Stack Web Development (MERN & Python)* (Salem Hybrid + Online)
  2. *UI/UX Design & Product Prototyping* (Salem Studio + Online)
  3. *AI Tools, Prompt Engineering & Automation* (Weekend Labs + Online)
  4. *Data Science & Analytics Accelerator* (Salem Hybrid + Online)
- **Diagnostic Configurator:** Responsive 2-column split (4 radio situation cards + dark recommendation panel with full-width mobile touch buttons).
- **Capstone Project Demos:** Real enterprise architectures built by learners (Go microservices, LangGraph multi-agent orchestrator, Figma design system).
- **The Nexco Charter:** 4 transparent commitment cards.
- **Dynamic Early Learner Feedback:** Real workshop reviews approved via the Admin Panel, plus submission modal.
- **Dedicated Legal Pages:** `#terms` and `#privacy` full views.

### 3. Student LMS Portal (`js/lms.js`)
- **Dynamic Live Class Banner:** Whenever an Admin sets any session to `🔴 LIVE NOW`, a prominent pulsing alert appears inside the Student LMS Dashboard.
- **Interactive Video Classroom:** Video player with playback speeds, scrubber, and clickable chapter markers.
- **Timestamped Notes:** Notes auto-attach the exact video second. Supports `.md` export.
- **Ask Nexco AI Tutor:** Answers technical queries in Tamil and English.
- **Capstone Project Dropzone:** Submitting a GitHub repository and deployment URL pushes directly into the Admin review queue.
- **Mobile Menu Drawer:** Dedicated mobile navigation slide-over.

### 4. Nexco Admin Command Center (`js/admin.js`)
- **Isolated Protected View:** Accessible only through secure authentication.
- **Course & Curriculum Manager (CRUD):** Modal-driven creator and editor for courses.
- **Live Workshop Scheduler:** Schedule workshops and toggle live status (`🔴 LIVE NOW`).
- **Leads & 1-Click Enrollment Approval:**
  - View all leads from the landing page.
  - One-click `"Approve & Enroll ⚡"` button activates LMS access for the student.
  - Direct WhatsApp button launches a chat with a pre-composed message.
- **Feedback Moderation Tab:** Review, approve, or delete participant feedback.
- **Mobile Menu Drawer & Overflow Wrappers:** Fully responsive on all mobile screens with horizontal scroll table containers.

---

## 📂 File Structure

```
Nexco/
├── index.html            # Isolated multi-view layout (Public, LMS, Admin, Terms, Privacy, Login)
├── css/
│   └── styles.css        # Glassmorphism, animations, custom scrollbars, & theme tokens
├── js/
│   ├── store.js          # Centralized reactive state store (NEXCO_STATE_PROD_V2)
│   ├── landing.js        # Dynamic public website logic, diagnostic engine, & feedback
│   ├── lms.js            # Student LearnHub LMS player, notes, & quiz engine
│   ├── admin.js          # Admin Command Center controller (CRUD, leads, feedback)
│   └── app.js            # Strict view orchestrator, auth, mobile drawers, & routing
├── assets/
│   └── logo.png          # High-resolution Nexco brand icon & logo
└── README.md             # Complete architecture and run guide
```

---

## 💻 Running & Testing

Open `index.html` directly in any web browser or visit the local preview server:

```bash
# Preview via local server
http://localhost:3000
```

1. Use the top segmented pill to switch between **Public Website**, **Student LMS**, and **Admin Command Center**.
2. Go to **Admin Command Center** > **Course Manager** > Click **"+ Add New Course"** to publish a new program. Switch back to the **Public Website** to see it appear live in the Programs grid!
3. Go to **Live Class Scheduler** in Admin and toggle a session to **`🔴 LIVE NOW`**. Switch to the **Student LMS** or **Public Website** to see the live alert banner appear in real time!
4. Submit the Hero Lead Form on the website, then switch to the **Admin Panel** to see the inquiry in the Leads table and click **"Approve & Enroll ⚡"** to grant instant LMS access!
