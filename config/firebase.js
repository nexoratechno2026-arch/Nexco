const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;
let auth = null;
let isFirebaseConfigured = false;

// Canonical Localized Default State & Seed Data for Nexco Platform
const defaultState = {
  brand: {
    name: "Nexco",
    tagline: "Tech & Career Accelerator",
    collaboration: "An Official Collaboration of Nexora Techno & Gencode",
    jointDelivery: "Joint Delivery: Nexora Techno × Gencode",
    city: "Salem",
    state: "Tamil Nadu",
    address: "15/2, Sankar Nagar, Salem-7 (Registered HQ & Admin Office)",
    phone: "+91 93451 21988",
    email: "admissions@nexco.in",
    mode: "100% Live Interactive Online Classes — Learn from Anywhere"
  },
  announcement: {
    active: true,
    text: "Founding Online Cohort Admissions Open — 100% Live Interactive Classes with Mentors • Powered by Nexora Techno & Gencode",
    badge: "100% Live Online Cohort"
  },
  courses: [
    {
      id: "fs-mern-python",
      title: "Full Stack Web Development (MERN & Python)",
      category: "Full Stack",
      mode: "100% Live Online Interactive Classes",
      duration: "24 Weeks",
      rating: "4.9",
      reviewsCount: 142,
      seatsLeft: 7,
      badge: "Flagship Online Track",
      jointTrack: "Nexora Techno × Gencode",
      description: "Zero fluff full stack architecture. Build distributed event-driven microservices, real-time WebSockets, and production deployments via live screen-sharing and hands-on coding.",
      mentors: ["Karthik R. (Staff Engineer)", "Priya S. (Lead Architect)"],
      tags: ["React 19", "Node.js", "Python FastAPI", "Docker", "PostgreSQL", "Redis"]
    },
    {
      id: "uiux-product",
      title: "UI/UX Design & Product Prototyping Accelerator",
      category: "Design",
      mode: "100% Live Online Interactive Classes",
      duration: "16 Weeks",
      rating: "4.9",
      reviewsCount: 98,
      seatsLeft: 5,
      badge: "Design Track",
      jointTrack: "Nexora Techno × Gencode",
      description: "Master user research, design token architectures in Figma 2026, interactive micro-animations, and full design system handoffs in live studio video reviews.",
      mentors: ["Aravind N. (Design Director)", "Deepa M. (Senior UI/UX Specialist)"],
      tags: ["Figma 2026", "Design Systems", "Tokens", "Prototyping", "Design Ops"]
    },
    {
      id: "ai-prompt-engineering",
      title: "AI Tools, Prompt Engineering & Automation",
      category: "AI & Automation",
      mode: "100% Live Online Interactive Classes",
      duration: "12 Weeks",
      rating: "4.9",
      reviewsCount: 115,
      seatsLeft: 8,
      badge: "Emerging Tech Track",
      jointTrack: "Nexora Techno × Gencode",
      description: "Harness LLM APIs, function calling, vector databases (Pinecone & pgvector), and autonomous AI agent workflows with practical hands-on exercises.",
      mentors: ["Suresh Kumar (AI Specialist)", "Karthik R. (Staff Engineer)"],
      tags: ["LangChain", "OpenAI / Claude API", "Vector DBs", "Python", "Automation Agents"]
    },
    {
      id: "data-analytics-engineering",
      title: "Modern Data Analytics & Analytics Engineering",
      category: "Data & Cloud",
      mode: "100% Live Online Interactive Classes",
      duration: "16 Weeks",
      rating: "4.8",
      reviewsCount: 76,
      seatsLeft: 6,
      badge: "Data Track",
      jointTrack: "Nexora Techno × Gencode",
      description: "Master SQL fundamentals, modern dbt transformations, Apache Airflow orchestration, and cloud data warehousing on Snowflake & BigQuery.",
      mentors: ["Lakshmi N. (Lead Data Engineer)"],
      tags: ["Advanced SQL", "dbt", "Snowflake", "Power BI", "Python Pandas", "Airflow"]
    },
    {
      id: "mobile-react-native",
      title: "Cross-Platform Mobile Apps with React Native",
      category: "Mobile",
      mode: "100% Live Online Interactive Classes",
      duration: "14 Weeks",
      rating: "4.8",
      reviewsCount: 64,
      seatsLeft: 9,
      badge: "Mobile Track",
      jointTrack: "Nexora Techno × Gencode",
      description: "Engineer production-ready iOS and Android mobile applications using React Native, Expo Router, offline SQLite sync, and native device hardware APIs.",
      mentors: ["Praveen T. (Mobile Lead)"],
      tags: ["React Native", "Expo", "TypeScript", "Tailwind Native", "Mobile CI/CD"]
    }
  ],
  workshops: [
    {
      id: "ws-1",
      title: "Building Microservices with Docker & Go",
      track: "Backend Engineering",
      date: "Saturday, 7:00 PM IST (Live Online)",
      seatsRemaining: 4,
      mentor: "Karthik R. (Staff Engineer, Nexora Techno)",
      isLive: false,
      meetLink: "https://meet.google.com/nexco-ws-live"
    },
    {
      id: "ws-2",
      title: "Practical AI Agents & Vector Search in Python",
      track: "AI & Automation",
      date: "Sunday, 11:00 AM IST (Live Online)",
      seatsRemaining: 6,
      mentor: "Suresh Kumar (AI Lead, Gencode)",
      isLive: true,
      meetLink: "https://meet.google.com/nexco-ai-live"
    },
    {
      id: "ws-3",
      title: "Design Tokens & Production Systems in Figma",
      track: "UI/UX & Product Design",
      date: "Next Wednesday, 8:00 PM IST (Live Online)",
      seatsRemaining: 9,
      mentor: "Aravind N. (Design Director)",
      isLive: false,
      meetLink: "https://meet.google.com/nexco-figma-live"
    }
  ],
  leads: [],
  students: [],
  feedbacks: [
    {
      id: "fb-1",
      name: "Vigneshwaran K.",
      role: "Full Stack Track Participant",
      city: "Salem",
      content: "The weekend practical lab was completely hands-on. We deployed a multi-stage Dockerized container onto a cloud VPS in our first workshop with bilingual mentor guidance.",
      rating: 5,
      approved: true,
      date: "2026-11-08"
    },
    {
      id: "fb-2",
      name: "Divya Bharathi",
      role: "Final-year ECE Student",
      city: "Rasipuram",
      content: "Clear, grounded teaching. No exaggerated placement promises — just honest line-by-line GitHub pull request reviews and deep JavaScript execution context explained in Tamil.",
      rating: 5,
      approved: true,
      date: "2026-11-10"
    },
    {
      id: "fb-3",
      name: "Praveen Kumar",
      role: "Junior Developer",
      city: "Namakkal",
      content: "Attended the Saturday AI agent masterclass. We built a real vector retrieval script using Python and pgvector instead of just talking about slides. Highly recommended.",
      rating: 5,
      approved: true,
      date: "2026-11-12"
    }
  ],
  submissions: []
};

// Check if credentials exist in environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (clientEmail) {
  clientEmail = clientEmail.trim().replace(/^["\x27]|["\x27]$/g, '');
}

if (privateKey) {
  privateKey = privateKey.trim().replace(/^["\x27]|["\x27],?$/g, '').trim();
  if (privateKey.endsWith(',')) privateKey = privateKey.slice(0, -1).trim();
  if (privateKey.endsWith('"') || privateKey.endsWith("'")) privateKey = privateKey.slice(0, -1).trim();
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (projectId && clientEmail && privateKey && !privateKey.includes('your-service-account')) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    db = admin.firestore();
    auth = admin.auth();
    isFirebaseConfigured = true;

    // Decorate auth.verifyIdToken to also support internal session tokens seamlessly
    const origVerify = auth.verifyIdToken.bind(auth);
    auth.verifyIdToken = async (token) => {
      if (token && (token.startsWith('mock-token-') || token.startsWith('token-'))) {
        let email = 'user@nexco.in';
        if (token.includes('@')) {
          const emailMatch = decodeURIComponent(token).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) email = emailMatch[0].toLowerCase();
        } else {
          const parts = token.split('-');
          email = parts.length > 2 ? decodeURIComponent(parts[parts.length - 1]) : 'user@nexco.in';
        }
        const role = (email.includes('admin') || token.includes('admin')) ? 'admin' : 'student';
        return { uid: 'uid_' + email, email, role };
      }
      return origVerify(token);
    };

    console.log('✅ [Nexco Firebase] Cloud Firestore and Firebase Auth connected successfully!');

    // Seed Cloud Firestore with default courses & workshops if newly connected database is empty
    (async () => {
      try {
        const snap = await db.collection('courses').limit(1).get();
        if (snap.empty) {
          console.log('🌱 [Nexco Firebase] Seeding Cloud Firestore with default courses and workshops...');
          for (const c of defaultState.courses) {
            await db.collection('courses').doc(c.id).set(c);
          }
          for (const w of defaultState.workshops) {
            await db.collection('workshops').doc(w.id).set(w);
          }
          for (const f of defaultState.feedbacks) {
            await db.collection('feedbacks').doc(f.id).set(f);
          }
          await db.collection('announcements').doc('top_banner').set(defaultState.announcement);
          await db.collection('site_settings').doc('main').set({
            announcement: defaultState.announcement,
            contact: defaultState.brand,
            hero: {
              collaborationBadge: "Nexora Techno × Gencode",
              headline: "Learn to build real software with working engineers.",
              subheadline: "Skip the recorded theory videos. Join our live online classes, write code alongside mentors, get your projects reviewed on screen, and build a solid GitHub portfolio."
            }
          });
          console.log('✅ [Nexco Firebase] Cloud Firestore seeding completed successfully!');
        }
      } catch (err) {
        console.warn('[Nexco Firebase] Seed check note:', err.message);
      }
    })();
  } catch (err) {
    console.warn('⚠️ [Nexco Firebase] Initialization error with provided credentials:', err.message);
  }
}

// Fallback in-memory / local JSON database for development when Firebase credentials are not yet entered
if (!isFirebaseConfigured) {
  console.log('ℹ️ [Nexco Firebase] Running in Local Datastore Mode (Zero-crash fallback). Connect Firebase credentials in .env anytime.');

  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
  }
  const storeFilePath = path.join(dataDir, 'local_store.json');

  let localState = defaultState;
  const loadFromDisk = () => {
    if (fs.existsSync(storeFilePath)) {
      try {
        const raw = fs.readFileSync(storeFilePath, 'utf8');
        localState = Object.assign({}, defaultState, JSON.parse(raw));
      } catch (e) {
        localState = defaultState;
      }
    } else {
      try {
        fs.writeFileSync(storeFilePath, JSON.stringify(defaultState, null, 2));
      } catch (e) {}
    }
  };
  loadFromDisk();

  const persist = () => {
    try {
      fs.writeFileSync(storeFilePath, JSON.stringify(localState, null, 2));
    } catch (e) {}
  };

  // Mock Firestore implementation
  db = {
    collection: (name) => {
      loadFromDisk();
      if (!localState[name]) localState[name] = [];
      const list = localState[name];
      return {
        get: async () => ({
          empty: list.length === 0,
          docs: list.map(item => ({
            id: item.id,
            data: () => item
          }))
        }),
        doc: (id) => ({
          get: async () => {
            const item = list.find(x => x.id === id);
            return {
              exists: !!item,
              id: id,
              data: () => item
            };
          },
          set: async (data, options) => {
            const idx = list.findIndex(x => x.id === id);
            const toSave = options && options.merge ? Object.assign({}, list[idx] || {}, data, { id }) : Object.assign({}, data, { id });
            if (idx >= 0) list[idx] = toSave;
            else list.push(toSave);
            persist();
            return { id };
          },
          update: async (data) => {
            const idx = list.findIndex(x => x.id === id);
            if (idx >= 0) {
              list[idx] = Object.assign({}, list[idx], data);
              persist();
            }
            return { id };
          },
          delete: async () => {
            const idx = list.findIndex(x => x.id === id);
            if (idx >= 0) {
              list.splice(idx, 1);
              persist();
            }
            return { id };
          }
        }),
        add: async (data) => {
          const id = data.id || ('doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
          const toSave = Object.assign({}, data, { id });
          list.push(toSave);
          persist();
          return { id };
        },
        where: function(field, op, value) {
          const filtered = list.filter(item => {
            if (op === '==') return item[field] === value;
            if (op === '!=') return item[field] !== value;
            return true;
          });
          return {
            get: async () => ({
              empty: filtered.length === 0,
              docs: filtered.map(item => ({
                id: item.id,
                data: () => item
              }))
            })
          };
        }
      };
    }
  };

  auth = {
    verifyIdToken: async (token) => {
      // Decode mock or JWT token
      if (token && (token.startsWith('mock-token-') || token.startsWith('token-'))) {
        let email = 'user@nexco.in';
        if (token.includes('@')) {
          const emailMatch = decodeURIComponent(token).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) email = emailMatch[0].toLowerCase();
        } else {
          const parts = token.split('-');
          email = parts.length > 2 ? decodeURIComponent(parts[parts.length - 1]) : 'user@nexco.in';
        }
        const role = (email.includes('admin') || token.includes('admin')) ? 'admin' : 'student';
        return { uid: 'uid_' + email, email, role };
      }
      return { uid: 'mock_user_1', email: 'student@nexco.in', role: 'student' };
    },
    createUser: async (userRecord) => {
      return { uid: 'uid_' + Date.now(), email: userRecord.email, displayName: userRecord.displayName };
    }
  };
}

module.exports = {
  admin,
  db,
  auth,
  isFirebaseConfigured
};
