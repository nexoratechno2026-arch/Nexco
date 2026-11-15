// Nexco Official Data Catalog & Configuration
// An Official Collaboration of Nexora Techno & Gencode
// Headquarters: 15/2, Sankar Nagar, Salem-7, Tamil Nadu, India
const NEXCO_DATA = {
  // Brand Configuration
  brand: {
    name: "Nexco",
    tagline: "Tech & Career Accelerator",
    collaboration: "An Official Collaboration of Nexora Techno & Gencode",
    jointDelivery: "Joint Delivery: Nexora Techno × Gencode",
    location: "15/2, Sankar Nagar, Salem-7, Tamil Nadu, India",
    phone: "+91 93451 21988",
    whatsapp: "+91 93451 21988",
    accentEmerald: "#10B981",
    accentMint: "#22C55E",
    darkBg: "#0A0D0E",
    charcoal: "#12171A"
  },

  // Courses Catalog
  courses: [
    {
      id: "fs-ai",
      title: "Full Stack Web & AI Engineering",
      category: "fullstack",
      categoryLabel: "Full Stack",
      rating: "4.95",
      reviewsCount: "840+",
      duration: "24 Weeks",
      projectsCount: "14+ Real Projects",
      badge: "Most Popular",
      level: "Beginner to Advanced",
      description: "Master modern TypeScript, Next.js 15, PostgreSQL, pgvector, LangChain, and build production-grade AI-powered SaaS applications.",
      skills: ["React 19", "Next.js 15", "TypeScript", "PostgreSQL", "LangChain", "Vector DBs", "Docker", "AWS"],
      nextCohort: "Nov 25, 2026",
      seatsLeft: 6,
      instructors: [
        { name: "Devin Vance", role: "Staff Architect ex-Stripe", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
        { name: "Siddharth Rao", role: "Principal Engineer ex-Amazon", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" }
      ],
      syllabus: [
        {
          week: "Weeks 1-4",
          module: "Modern Frontend Architecture & TypeScript",
          topics: ["Advanced TypeScript Generics & Type Systems", "React 19 Server Components & Actions", "State Machines with XState & Zustand", "Tailwind CSS Design Systems & Accessibility"],
          deliverable: "Responsive Cloud Management Dashboard with Zero Layout Shifts"
        },
        {
          week: "Weeks 5-9",
          module: "Backend Engineering, Microservices & Databases",
          topics: ["Node.js & Bun runtime internals", "PostgreSQL schema design & high-concurrency indexes", "Prisma ORM & Drizzle ORM migrations", "Redis caching, queues with BullMQ, WebSocket live feeds"],
          deliverable: "High-Throughput Collaborative Workspace Engine (10k req/sec benchmark)"
        },
        {
          week: "Weeks 10-15",
          module: "Generative AI, Embeddings & RAG Systems",
          topics: ["Embeddings & Vector Cosine Similarity with pgvector", "RAG architectures with Hybrid Search & Re-ranking", "LangChain & LlamaIndex orchestrations", "Function Calling & Multi-Agent systems with LangGraph"],
          deliverable: "Autonomous AI Research & Document Synthesis Copilot"
        },
        {
          week: "Weeks 16-20",
          module: "Cloud Native DevOps, Kubernetes & CI/CD",
          topics: ["Docker container optimization (multi-stage builds)", "Kubernetes clusters, pods, services, ingress routing", "AWS ECS, RDS, S3, CloudFront edge caching", "GitHub Actions automated test & deploy matrix"],
          deliverable: "Production Kubernetes Pipeline on AWS with Zero Downtime Canaries"
        },
        {
          week: "Weeks 21-24",
          module: "Capstone Launch & Career Acceleration",
          topics: ["Enterprise Capstone build with 1:1 Staff Mentor code reviews", "System Design Interview Mastery (Scaling to 10M DAU)", "Live Technical Mock Interviews with FAANG Leads", "Portfolio review & direct referral blitz"],
          deliverable: "Shipped Live SaaS Product with paying user capability + Production Repo"
        }
      ]
    },
    {
      id: "ai-genai",
      title: "Data Science & GenAI Masterclass",
      category: "ai",
      categoryLabel: "AI & Data Science",
      rating: "4.92",
      reviewsCount: "620+",
      duration: "20 Weeks",
      projectsCount: "12+ Real Projects",
      badge: "High Growth",
      level: "Intermediate",
      description: "From Python & Deep Learning fundamentals to Fine-tuning Open LLMs, Agentic Workflows, and Production RAG pipelines.",
      skills: ["Python", "PyTorch", "Hugging Face", "vLLM", "Ollama", "Unsloth", "LangGraph", "ChromaDB"],
      nextCohort: "Dec 02, 2026",
      seatsLeft: 8,
      instructors: [
        { name: "Dr. Elena Rostova", role: "AI Research Scientist ex-DeepMind", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" },
        { name: "Marcus Chen", role: "Head of ML at FinTech Scaleup", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" }
      ],
      syllabus: [
        {
          week: "Weeks 1-4",
          module: "Advanced Python, Linear Algebra & Probabilistic ML",
          topics: ["Vectorized NumPy, Pandas optimization", "Mathematical foundations: Gradient Descent, Matrix Decompositions", "Statistical Modeling & Hypothesis Testing", "Scikit-Learn Ensemble models"],
          deliverable: "Financial Fraud Detection Pipeline with 99.2% ROC-AUC"
        },
        {
          week: "Weeks 5-8",
          module: "Deep Learning Foundations with PyTorch",
          topics: ["Tensors, Autograd, Custom Loss Functions", "Convolutional Neural Networks & Vision Transformers", "Recurrent Networks to Transformer Self-Attention", "GPU Training Acceleration with CUDA & Mixed Precision"],
          deliverable: "Multimodal Medical Imaging Diagnostic Classifier"
        },
        {
          week: "Weeks 9-14",
          module: "Transformer Architectures & LLM Fine-Tuning",
          topics: ["BERT, RoBERTa, LLaMA-3 architecture breakdown", "LoRA, QLoRA, PEFT fine-tuning techniques using Unsloth", "Direct Preference Optimization (DPO) & RLHF", "Quantization (GGUF, AWQ, FP8) & high-throughput serving with vLLM"],
          deliverable: "Domain-Specific Legal / Medical LLM fine-tuned and hosted on GPU endpoints"
        },
        {
          week: "Weeks 15-20",
          module: "Autonomous Agents & Enterprise Production ML",
          topics: ["LangGraph autonomous cyclic agents with tool calling", "Semantic evaluation with Ragas & Arize Phoenix", "MLOps with MLflow, Weights & Biases", "AI Safety, Guardrails & LLM Red-Teaming"],
          deliverable: "Autonomous Multi-Agent Market Research Analyst with Live Web Search"
        }
      ]
    },
    {
      id: "ui-ux",
      title: "Product UI/UX & Design Systems",
      category: "design",
      categoryLabel: "UI/UX Design",
      rating: "4.96",
      reviewsCount: "510+",
      duration: "16 Weeks",
      projectsCount: "10+ Case Studies",
      badge: "High Demand",
      level: "All Levels",
      description: "Craft world-class enterprise SaaS interfaces, master Figma variables & tokens, conduct user research, and build production design systems.",
      skills: ["Figma", "Design Systems", "User Research", "Wireframing", "Micro-Interactions", "Prototyping", "Framer", "Usability Testing"],
      nextCohort: "Nov 28, 2026",
      seatsLeft: 5,
      instructors: [
        { name: "Chloe Dupont", role: "Design Director ex-Airbnb", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80" },
        { name: "Arjun Nair", role: "Lead Product Designer at Razorpay", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80" }
      ],
      syllabus: [
        {
          week: "Weeks 1-4",
          module: "Design Foundations, Cognitive Psychology & Research",
          topics: ["Gestalt Principles, Fitts's Law, Hicks's Law", "Qualitative & Quantitative User Interviews", "Persona creation, Journey Mapping, Problem Statements", "Information Architecture & Low-Fidelity Wireframes"],
          deliverable: "Comprehensive Product Discovery & User Journey Research Deck"
        },
        {
          week: "Weeks 5-8",
          module: "High-Fidelity Interface Design & Figma Mastery",
          topics: ["Auto-Layout 5.0, Component Sets, Variants", "Figma Variables: Colors, Spacing, Typography & Dark Mode tokens", "Responsive breakpoints across Mobile, Tablet, Desktop", "Visual hierarchy, micro-typography, icon grids"],
          deliverable: "Complete Responsive SaaS Web App UI with 50+ Component States"
        },
        {
          week: "Weeks 9-12",
          module: "Design Systems & Tokenized Engineering Handoff",
          topics: ["Atomic Design Principles & Token Taxonomies", "Syncing Figma Tokens with GitHub & Tailwind Config", "Interactive Prototyping with Variables & Conditionals", "Accessibility WCAG AAA Compliance Audit"],
          deliverable: "Production-grade Design System with 150+ components, states, and docs"
        },
        {
          week: "Weeks 13-16",
          module: "Interactive Motion & Capstone Product Showcase",
          topics: ["Micro-interaction motion with Framer & Principle", "Live Usability Testing with Maze & Hotjar", "Portfolio Case Study storytelling for Product Design Roles", "Design Sprint Simulation with Engineering Team"],
          deliverable: "Interactive Framer Portfolio with 2 Production Case Studies"
        }
      ]
    },
    {
      id: "cloud-devops",
      title: "Cloud Native DevOps & Kubernetes",
      category: "cloud",
      categoryLabel: "Cloud & DevOps",
      rating: "4.91",
      reviewsCount: "430+",
      duration: "18 Weeks",
      projectsCount: "11+ Cloud Labs",
      badge: "Critical Tech",
      level: "Intermediate",
      description: "Architect self-healing cloud infrastructure, manage multi-tenant Kubernetes clusters, automate with Terraform, and enforce GitOps.",
      skills: ["Kubernetes", "Docker", "Terraform", "AWS", "ArgoCD", "Prometheus", "Grafana", "Helm"],
      nextCohort: "Dec 05, 2026",
      seatsLeft: 9,
      instructors: [
        { name: "Kavita Sen", role: "Lead DevOps Architect ex-Uber", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80" },
        { name: "Liam O'Connor", role: "Cloud Reliability Specialist", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" }
      ],
      syllabus: [
        {
          week: "Weeks 1-4",
          module: "Linux Systems, Networking & Containerization",
          topics: ["Linux kernel namespaces, cgroups, systemd", "TCP/IP, DNS, SSL/TLS, reverse proxies with NGINX", "Docker security, rootless containers, multi-stage builds", "Docker Compose microservices orchestration"],
          deliverable: "Hardened, Multi-tier Microservice Container Cluster"
        },
        {
          week: "Weeks 5-9",
          module: "Kubernetes Production Administration",
          topics: ["Cluster architecture: etcd, API server, Kubelet, CNI", "Deployments, StatefulSets, DaemonSets, ConfigMaps", "Ingress Controllers (Traefik, NGINX) & Cert-Manager", "StorageClasses, PersistentVolumes, Dynamic Provisioning"],
          deliverable: "Production 3-Node Kubernetes Cluster with TLS & Automated Scaling"
        },
        {
          week: "Weeks 10-14",
          module: "Infrastructure as Code & GitOps",
          topics: ["Terraform HCL, modules, state management on AWS S3", "ArgoCD GitOps declarative continuous delivery", "Helm charts creation & versioned packaging", "Vault secrets injection into Kubernetes pods"],
          deliverable: "Full Infrastructure as Code provisioning AWS EKS via Terraform & ArgoCD"
        },
        {
          week: "Weeks 15-18",
          module: "Observability, Chaos Engineering & SRE Practices",
          topics: ["Prometheus metrics scraping & PromQL queries", "Grafana enterprise dashboards & PagerDuty alerts", "Distributed Tracing with OpenTelemetry & Jaeger", "Chaos Mesh fault injection testing & SLA/SLO definition"],
          deliverable: "Full Observability Suite with Automated Chaos Recovery"
        }
      ]
    },
    {
      id: "ent-llm",
      title: "Enterprise LLM Engineering & Agents",
      category: "ai",
      categoryLabel: "AI & Data Science",
      rating: "4.98",
      reviewsCount: "380+",
      duration: "14 Weeks",
      projectsCount: "9+ Production Systems",
      badge: "Cutting Edge",
      level: "Advanced",
      description: "Build production multi-agent systems, autonomous coding copilots, memory persistence, and real-time streaming LLM applications.",
      skills: ["LangGraph", "CrewAI", "LlamaIndex", "Semantic Cache", "DSPy", "Function Calling", "Guardrails"],
      nextCohort: "Nov 30, 2026",
      seatsLeft: 4,
      instructors: [
        { name: "Dr. Elena Rostova", role: "AI Research Scientist", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" }
      ],
      syllabus: [
        {
          week: "Weeks 1-4",
          module: "Advanced Agentic Loops & Tool Calling",
          topics: ["ReAct pattern internals, memory graphs", "Deterministic tool calling & JSON schema validation", "Human-in-the-loop approval workflows", "Handling context window overflows & compaction"],
          deliverable: "Autonomous GitHub PR Reviewer & Automated Unit Test Generator"
        },
        {
          week: "Weeks 5-9",
          module: "Graph-Based Workflows with LangGraph",
          topics: ["Stateful multi-actor systems with LangGraph", "Hierarchical supervisor agent architectures", "Branching, conditional routing & rollback states", "Persistent thread storage with PostgreSQL checkpointers"],
          deliverable: "Multi-Agent Investment Banking Due Diligence Platform"
        },
        {
          week: "Weeks 10-14",
          module: "Production Optimization, Caching & DSPy",
          topics: ["DSPy prompt optimization through automatic assertions", "Semantic caching with GPTCache & Redis", "Latency streaming with SSE & WebSockets", "LLM Cost attribution & rate-limiting per tenant"],
          deliverable: "Production Multi-Tenant Enterprise Agent Gateway"
        }
      ]
    },
    {
      id: "dist-systems",
      title: "High-Performance Distributed Systems",
      category: "fullstack",
      categoryLabel: "Full Stack",
      rating: "4.94",
      reviewsCount: "290+",
      duration: "16 Weeks",
      projectsCount: "8+ Hardcore Labs",
      badge: "Staff Engineer Track",
      level: "Advanced",
      description: "Design consensus protocols, custom caching layers, distributed log brokers, and handle millions of concurrent socket connections.",
      skills: ["Go", "Rust", "Raft Consensus", "Kafka", "Distributed Caching", "gRPC", "Protobuf"],
      nextCohort: "Dec 08, 2026",
      seatsLeft: 7,
      instructors: [
        { name: "Devin Vance", role: "Staff Architect ex-Stripe", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }
      ],
      syllabus: [
        {
          week: "Weeks 1-4",
          module: "Concurrency, Async I/O & Networking Internals",
          topics: ["Goroutines, channels, memory models, work-stealing schedulers", "Epoll, kqueue, asynchronous non-blocking sockets", "gRPC over HTTP/2 and Protobuf serializations", "Zero-copy I/O with sendfile & memory mapped files"],
          deliverable: "Custom High-Throughput HTTP/gRPC Reverse Proxy in Go"
        },
        {
          week: "Weeks 5-10",
          module: "Distributed Consensus & Storage Engines",
          topics: ["Raft consensus algorithm implementation from scratch", "LSM-Tree storage engines (SSTables, MemTable, WAL)", "Leader election, log replication, heartbeats", "Vector Clocks, CRDTs for conflict-free state merging"],
          deliverable: "Distributed Key-Value Store with Fault-Tolerant Raft Consensus"
        },
        {
          week: "Weeks 11-16",
          module: "Event Streaming Brokers & Large Scale Architecture",
          topics: ["Kafka internal architecture: partitions, consumer groups, offsets", "Consistent hashing rings & dynamic rebalancing", "Distributed rate limiters (Token Bucket, Leaky Bucket)", "Real-time payment transaction ledger with idempotency"],
          deliverable: "Scalable Event Broker supporting 100k events/sec with guaranteed ordering"
        }
      ]
    }
  ],

  // Diagnostic Configurator Situations
  diagnosticSituations: {
    "career-transition": {
      id: "career-transition",
      title: "I want a career transition",
      subtitle: "Switching from non-tech, QA, support or another domain into high-growth software engineering.",
      badge: "Most Common Transition",
      matchPercentage: "98% Match",
      recommendedTrack: "Full Stack Web & AI Engineering (with Foundation Bridge)",
      programOptions: [
        { value: "fs-ai", label: "Full Stack Web & AI Engineering (Recommended)" },
        { value: "ui-ux", label: "Product UI/UX & Design Systems Track" },
        { value: "ai-genai", label: "Data Science & GenAI Accelerated" }
      ],
      highlights: [
        "Includes dedicated 4-week Foundation Module: zero coding experience needed to begin",
        "Assigned 1-on-1 Senior Mentor with weekly code reviews & doubt solving",
        "Complete portfolio of 14 live deployed full-stack & AI applications",
        "Resume re-engineering, LinkedIn optimization & guaranteed interview referrals"
      ],
      timeInvestment: "15-18 hours/week",
      projectedHike: "120% - 180% average compensation increase",
      timelineDuration: "24 Weeks + 8 Weeks Career Placement Support"
    },
    "fresh-graduate": {
      id: "fresh-graduate",
      title: "I am a final-year student / fresh graduate",
      subtitle: "Aiming to bypass low-tier mass recruiters and land a top-tier product company role right after graduation.",
      badge: "Fast-Track Placement",
      matchPercentage: "99% Match",
      recommendedTrack: "Nexco Accelerator - Full Stack & Placement FastTrack",
      programOptions: [
        { value: "fs-ai", label: "Full Stack Web & AI Engineering (Fast-Track)" },
        { value: "dist-systems", label: "High-Performance Distributed Systems" },
        { value: "cloud-devops", label: "Cloud Native DevOps & Kubernetes" }
      ],
      highlights: [
        "Heavy emphasis on Data Structures & Algorithms + Real Production Systems",
        "Build full-stack apps that impress Staff Engineers during portfolio screenings",
        "10+ live technical mock interviews with actual interviewers from FAANG & Unicorns",
        "Direct access to Nexco Hiring Partner Network (180+ tech companies)"
      ],
      timeInvestment: "20-25 hours/week",
      projectedHike: "First job offer starting ₹14LPA - ₹28LPA or $45k - $70k remote",
      timelineDuration: "20 Weeks + Direct Campus Placement Referral Drive"
    },
    "upskill-ai": {
      id: "upskill-ai",
      title: "I want to upskill in AI & Modern Tech",
      subtitle: "Stuck in legacy tech stack or plateaued in mid-level role; aiming for Senior/Staff Architect positions.",
      badge: "High Seniority Impact",
      matchPercentage: "96% Match",
      recommendedTrack: "Enterprise LLM Engineering & Autonomous Agents",
      programOptions: [
        { value: "ent-llm", label: "Enterprise LLM Engineering & Agents (Recommended)" },
        { value: "ai-genai", label: "Data Science & GenAI Masterclass" },
        { value: "dist-systems", label: "High-Performance Distributed Systems" }
      ],
      highlights: [
        "Go beyond toy OpenAI API calls: master LangGraph, multi-agent frameworks & DSPy",
        "Architect enterprise-scale RAG with pgvector, hybrid search & reranking",
        "Learn vLLM high-throughput GPU serving, LoRA fine-tuning & evaluation benchmarks",
        "System design for AI products handling millions of real user queries"
      ],
      timeInvestment: "12-15 hours/week (Built for working professionals)",
      projectedHike: "Promotion to Lead AI Engineer or ₹32LPA - ₹50LPA package",
      timelineDuration: "14-16 Weeks Executive Accelerated Cohort"
    },
    "build-saas": {
      id: "build-saas",
      title: "I want to build real-world SaaS products",
      subtitle: "Prioritize shipping live products, monetization, scalable backend architectures, and AI features.",
      badge: "Builder & Founder Track",
      matchPercentage: "97% Match",
      recommendedTrack: "Modern Product Architecture & Cloud Native SaaS",
      programOptions: [
        { value: "fs-ai", label: "Full Stack Web & AI Engineering" },
        { value: "cloud-devops", label: "Cloud Native DevOps & Kubernetes" },
        { value: "ui-ux", label: "Product UI/UX & Design Systems" }
      ],
      highlights: [
        "Ship 3 end-to-end production SaaS products with Stripe billing & user auth",
        "Master Next.js 15 Server Actions, PostgreSQL, Redis queues, and Docker deployment",
        "Integrate AI copilot features that deliver genuine user utility",
        "Nexco Demo Day: Pitch your working SaaS to seed investors & engineering leaders"
      ],
      timeInvestment: "16-20 hours/week",
      projectedHike: "Ship your own profitable SaaS or join Series-A startups as founding engineer",
      timelineDuration: "20 Weeks Hands-On Build Accelerator"
    }
  },

  // Testimonials & Social Proof
  testimonials: [
    {
      name: "Rohan Kulkarni",
      role: "Software Development Engineer 2",
      company: "Razorpay",
      previousRole: "Junior QA Tester (Manual)",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
      quote: "I was stuck writing manual test cases for 2 years with barely 4 LPA. Nexco completely restructured how I write code. The 1-on-1 mentor code reviews were ruthless in the best way possible. Placed at Razorpay with an 18 LPA offer in 5 months!",
      rating: 5,
      linkedInVerified: true,
      hike: "+350% Hike",
      track: "Full Stack & AI"
    },
    {
      name: "Ananya Deshmukh",
      role: "Lead Product Designer",
      company: "Swiggy",
      previousRole: "Graphic Designer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      quote: "The Figma variables, design token pipeline, and usability research case studies at Nexco are light years ahead of any generic bootcamp. My portfolio stood out immediately to design directors.",
      rating: 5,
      linkedInVerified: true,
      hike: "+180% Hike",
      track: "Product UI/UX"
    },
    {
      name: "David Morales",
      role: "AI Systems Engineer",
      company: "Scale AI (Remote)",
      previousRole: "Final Year Student (Tier-3 College)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      quote: "College taught us 10-year-old C++ and theoretical DBMS. In Nexco, I was building vector search pipelines with pgvector and fine-tuning open LLaMA models on GPU clusters. Landed a $72,000 remote offer before graduation day.",
      rating: 5,
      linkedInVerified: true,
      hike: "First Job: $72k",
      track: "Data Science & GenAI"
    },
    {
      name: "Pooja Sundaram",
      role: "Senior Cloud Engineer",
      company: "Microsoft",
      previousRole: "Sysadmin at Legacy IT Services",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      quote: "The Kubernetes chaos engineering and multi-cloud Terraform modules gave me the confidence to ace Microsoft's 5-round technical architecture loops. Nexco mentors are genuine industry architects.",
      rating: 5,
      linkedInVerified: true,
      hike: "+140% Hike",
      track: "Cloud & DevOps"
    },
    {
      name: "Karan Johar",
      role: "Full Stack AI Engineer",
      company: "CRED",
      previousRole: "Non-Tech Support Executive",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      quote: "I thought non-tech people couldn't break into high-paying engineering. The foundation track took me from zero variables to building full-stack reactive apps with Next.js and Redis. Life-changing experience.",
      rating: 5,
      linkedInVerified: true,
      hike: "+260% Hike",
      track: "Full Stack & AI"
    },
    {
      name: "Elena Vasquez",
      role: "Machine Learning Architect",
      company: "Stripe",
      previousRole: "Data Analyst",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      quote: "The enterprise LLM engineering track covers what companies are actually building right now: autonomous agents, tool orchestration, and high-throughput model hosting. Absolutely unbeatable.",
      rating: 5,
      linkedInVerified: true,
      hike: "+125% Hike",
      track: "Enterprise LLM"
    }
  ],

  // Student Video Stories
  videoStories: [
    {
      id: "story-1",
      studentName: "Aditya Verma",
      transition: "Mechanical Engineer ➔ SDE-2 at Razorpay",
      hike: "₹4.5LPA ➔ ₹24LPA (430% Hike)",
      thumbnail: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "3:42",
      summary: "How Aditya spent 6 months rebuilding his engineering foundations, built a distributed rate limiter in Go, and cracked 4 product offers."
    },
    {
      id: "story-2",
      studentName: "Meera Patel",
      transition: "Tier-3 Fresher ➔ Remote Frontend Eng at US Startup",
      hike: "First Job: $55,000/yr Remote",
      thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "4:15",
      summary: "Meera shares how building an open-source Next.js canvas tool during the Nexco hackathon directly attracted the founder who hired her."
    },
    {
      id: "story-3",
      studentName: "Vikram Malhotra",
      transition: "QA Specialist ➔ GenAI Solutions Architect",
      hike: "₹8LPA ➔ ₹28LPA (250% Hike)",
      thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "5:08",
      summary: "Vikram broke down how Nexco's LangGraph and vector search curriculum helped him transition from test automation into AI systems."
    }
  ],

  // Community Chat Messages
  communityChat: [
    {
      sender: "Siddharth Rao",
      role: "Staff Mentor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      time: "10:14 AM",
      badge: "Mentor",
      text: "Great question on pgvector index tuning @Alex! When your dataset crosses 1M rows, use `ivfflat` with `lists = rows / 1000`, or switch to `HNSW` for lower query latency at the cost of memory. Here is the query plan snippet:",
      codeSnippet: "CREATE INDEX ON documents \nUSING hnsw (embedding vector_cosine_ops)\nWITH (m = 16, ef_construction = 64);",
      reactions: ["🔥 12", "🚀 8", "💡 15"]
    },
    {
      sender: "Tanmay Joshi",
      role: "Cohort #14 Student",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
      time: "10:18 AM",
      badge: "Student",
      text: "Just benchmarked this on our Capstone DB — query latency dropped from 280ms to 9ms flat! 🤯 Thanks Sid!",
      reactions: ["👏 6", "💯 9"]
    },
    {
      sender: "Priya Sharma",
      role: "Cohort #13 Alumni",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      time: "10:25 AM",
      badge: "Placed at Uber",
      text: "GUYS! Just received the official offer letter from Uber for SDE-1! 🚗✨ 32 LPA total comp! Huge thank you to all mentors for the 10+ mock system design rounds. Nexco community is unmatched! ❤️",
      reactions: ["🎉 42", "🥳 28", "🥂 19", "❤️ 31"]
    }
  ],

  // LMS User State & Classroom
  lms: {
    student: {
      name: "Alex Rivera",
      email: "alex.rivera@nexco.dev",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      enrolledTrack: "Full Stack Web & AI Engineering",
      batch: "Cohort #14 (Winter 2026)",
      streakDays: 12,
      totalHours: 142,
      xpPoints: 4850,
      completedModules: 18,
      totalModules: 24,
      avgQuizScore: "92%",
      projectsShipped: 3,
      rank: 4
    },

    // Weekly Study Analytics (Hours per day)
    weeklyAnalytics: [
      { day: "Mon", hours: 4.2, cohortAvg: 2.8 },
      { day: "Tue", hours: 5.5, cohortAvg: 3.1 },
      { day: "Wed", hours: 3.8, cohortAvg: 2.9 },
      { day: "Thu", hours: 6.0, cohortAvg: 3.4 },
      { day: "Fri", hours: 4.5, cohortAvg: 2.7 },
      { day: "Sat", hours: 7.2, cohortAvg: 4.5 },
      { day: "Sun", hours: 5.0, cohortAvg: 3.8 }
    ],

    // Upcoming Live Mentor Sessions
    upcomingLiveSessions: [
      {
        id: "session-1",
        title: "System Design at Scale: Handling 10M WebSockets with Redis & Kafka",
        mentor: "Devin Vance (Staff Architect ex-Stripe)",
        time: "Today, 7:30 PM - 9:00 PM EST",
        status: "Starting in 2h 15m",
        tags: ["System Design", "High Concurrency", "Live Q&A"]
      },
      {
        id: "session-2",
        title: "Hands-on Code Review: Vector DB Optimization & Hybrid Search",
        mentor: "Siddharth Rao (Principal Engineer)",
        time: "Wednesday, 8:00 PM EST",
        status: "Upcoming",
        tags: ["pgvector", "RAG", "Code Review"]
      }
    ],

    // Classroom Lessons & Syllabus
    classroomModules: [
      {
        id: "mod-1",
        title: "Module 1: Modern Full Stack Architecture & TypeScript",
        completed: true,
        lessons: [
          { id: "les-1-1", title: "1.1 Deep Dive: TypeScript Type Systems & Utility Types", duration: "32:10", completed: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
          { id: "les-1-2", title: "1.2 React 19 Server Components, Actions & Suspense", duration: "45:20", completed: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
          { id: "les-1-3", title: "1.3 Enterprise State Machines with Zustand & XState", duration: "38:40", completed: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: AI Embeddings, Vector Databases & Hybrid Search",
        completed: false,
        active: true,
        lessons: [
          { 
            id: "les-2-1", 
            title: "2.1 Vector Mathematics: Cosine Similarity, Dot Product & Euclidean", 
            duration: "28:15", 
            completed: true, 
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            chapters: [
              { time: "00:00", title: "Introduction & Math Intuition" },
              { time: "06:40", title: "Dot Product vs Cosine Similarity" },
              { time: "15:20", title: "High-Dimensional Vector Embeddings" },
              { time: "22:10", title: "Interactive Python Code Demo" }
            ]
          },
          { 
            id: "les-2-2", 
            title: "2.2 Building Production Vector DBs with PostgreSQL & pgvector", 
            duration: "42:15", 
            completed: false, 
            active: true, 
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            chapters: [
              { time: "00:00", title: "Setup pgvector Extension" },
              { time: "08:15", title: "Indexing: HNSW vs IVFFlat Algorithms" },
              { time: "18:40", title: "Hands-on Live Coding with Prisma & Drizzle" },
              { time: "32:10", title: "Benchmarking 1M Vectors & Hybrid Reciprocal Rank Fusion" }
            ]
          },
          { 
            id: "les-2-3", 
            title: "2.3 Context-Aware Chunking Strategies & Metadata Filtering", 
            duration: "34:50", 
            completed: false, 
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            chapters: [
              { time: "00:00", title: "Why Fixed-Size Chunking Fails" },
              { time: "11:20", title: "Semantic & Recursive Boundary Chunking" },
              { time: "24:00", title: "Multi-tenant Metadata Filtering" }
            ]
          }
        ]
      },
      {
        id: "mod-3",
        title: "Module 3: Autonomous Agents, LangGraph & Tool Calling",
        completed: false,
        locked: false,
        lessons: [
          { id: "les-3-1", title: "3.1 Agentic Loops & The ReAct Pattern", duration: "36:00", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
          { id: "les-3-2", title: "3.2 Stateful Multi-Agent Workflows with LangGraph", duration: "48:30", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" }
        ]
      },
      {
        id: "mod-4",
        title: "Module 4: Kubernetes, Production Deployment & Zero-Downtime CI/CD",
        completed: false,
        locked: true,
        lessons: [
          { id: "les-4-1", title: "4.1 Multi-Stage Docker & Kubernetes Manifests", duration: "41:00", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
          { id: "les-4-2", title: "4.2 Canary Releases with ArgoCD & Prometheus Monitoring", duration: "52:10", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
        ]
      }
    ],

    // Default timestamped notes for active lesson
    initialNotes: [
      { id: "n-1", timestamp: "08:15", seconds: 495, text: "HNSW builds a hierarchical navigable small-world graph. Better recall than IVFFlat but requires 1.5x more RAM." },
      { id: "n-2", timestamp: "18:40", seconds: 1120, text: "Remember to configure `ef_search` dynamically inside the transaction before executing semantic search!" }
    ],

    // Interactive Assessment Quiz
    quiz: {
      id: "quiz-mod-2",
      title: "Knowledge Check: Vector Databases & RAG Optimization",
      totalQuestions: 4,
      passingScore: 75,
      questions: [
        {
          id: "q-1",
          question: "When should you choose HNSW over IVFFlat index in pgvector?",
          options: [
            "When you have strict RAM limitations on a cheap 1GB VPS",
            "When you need maximum search recall and sub-10ms query latency under high read concurrency",
            "When your table only has less than 100 rows",
            "When embeddings have only 1 dimension"
          ],
          correctIndex: 1,
          explanation: "HNSW provides superior query speed and recall because it navigates a multi-layer graph, making it the industry standard for production vector search."
        },
        {
          id: "q-2",
          question: "What is the primary benefit of Reciprocal Rank Fusion (RRF) in Hybrid Search?",
          options: [
            "It turns floating-point vectors into integers to compress disk space",
            "It merges keyword BM25 search rankings with semantic vector rankings without needing calibrated score normalization",
            "It automatically generates captions for videos",
            "It eliminates the need for any database indexing"
          ],
          correctIndex: 1,
          explanation: "Reciprocal Rank Fusion (RRF) evaluates position ranks rather than arbitrary absolute similarity scores, making hybrid search robust and reliable."
        },
        {
          id: "q-3",
          question: "In React 19 Server Components, where do database queries securely run?",
          options: [
            "In the user's browser client memory",
            "Exclusively on the server runtime, preventing sensitive DB credentials from leaking to the client bundle",
            "Inside service workers only",
            "Through third-party CDN proxies"
          ],
          correctIndex: 1,
          explanation: "React Server Components run exclusively on the server, allowing direct database queries with zero client bundle impact and maximum security."
        },
        {
          id: "q-4",
          question: "What does the `ef_construction` parameter control in HNSW indexes?",
          options: [
            "The size of the database connection pool",
            "The number of candidate neighbors evaluated during index build time (higher = better index quality, slower build)",
            "The font size of the web application",
            "The time until a cache expires"
          ],
          correctIndex: 1,
          explanation: "`ef_construction` dictates the search depth during index construction. Higher values yield a more accurate graph at the cost of longer build times."
        }
      ]
    },

    // Leaderboard
    leaderboard: [
      { rank: 1, name: "Zara Thorne", xp: 6240, streak: 28, projects: 5, badge: "Master Architect", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" },
      { rank: 2, name: "Marcus Chen", xp: 5890, streak: 24, projects: 4, badge: "Bug Hunter", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" },
      { rank: 3, name: "Elena Rostova", xp: 5120, streak: 19, projects: 4, badge: "Hackathon Winner", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" },
      { rank: 4, name: "Alex Rivera (You)", xp: 4850, streak: 12, projects: 3, badge: "Top 5% Cohort", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", isCurrentUser: true },
      { rank: 5, name: "Tariq Mansoor", xp: 4610, streak: 14, projects: 3, badge: "Consistent Coder", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" },
      { rank: 6, name: "Sophia Lin", xp: 4320, streak: 11, projects: 3, badge: "Code Reviewer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" }
    ],

    // Certificate Mock Data
    certificate: {
      id: "NEX-2026-FS-94812",
      studentName: "Alex Rivera",
      courseName: "Full Stack Web & AI Engineering Specialization",
      completionDate: "November 2026",
      grade: "Distinction (94.8%)",
      skillsVerified: ["React 19", "Next.js 15", "PostgreSQL", "pgvector", "LangGraph", "Docker", "Kubernetes", "AWS"],
      instructorSignature: "Devin Vance, Staff Architect ex-Stripe",
      credentialUrl: "https://verify.nexco.dev/cert/NEX-2026-FS-94812"
    }
  }
};
