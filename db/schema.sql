-- 📋 CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    status TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 🔁 LEADS
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    contact_id INTEGER,
    channel TEXT,
    funnel_stage TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
);

-- ✅ TASKS
CREATE TABLE IF NOT EXISTS tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK(type IN ('QA', 'bugfix', 'development', 'content', 'followup')) DEFAULT 'development',
    assigned_to TEXT,
    due_date TEXT,
    status TEXT CHECK(status IN ('open', 'in_progress', 'delayed', 'done')) DEFAULT 'open',
    priority TEXT CHECK(priority IN ('low', 'normal', 'high')) DEFAULT 'normal',
    related_to TEXT CHECK(related_to IN ('lead', 'contact', 'project', 'agent')),
    related_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 📅 MEETINGS
CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    title TEXT,
    datetime DATETIME,
    location TEXT,
    status TEXT,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
);

-- 💰 QUOTES
CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    amount REAL,
    status TEXT CHECK(status IN ('draft', 'sent', 'approved', 'rejected')),
    file_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
);

-- 🤖 AGENT REQUESTS
CREATE TABLE IF NOT EXISTS agent_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name TEXT,
    action TEXT CHECK(action IN ('create', 'update', 'summarize', 'classify')),
    target_table TEXT,
    target_id INTEGER,
    input_prompt TEXT,
    output TEXT,
    status TEXT CHECK(status IN ('success', 'error')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 💳 PAYMENTS (updated)
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER,
    amount REAL,
    status TEXT CHECK(status IN ('paid', 'pending', 'late')),
    due_date DATE,
    paid_at DATE,
    invoice_link TEXT,
    reminder_count INTEGER DEFAULT 0,
    last_reminder_at DATETIME,
    client_email TEXT,
    notes TEXT,
    FOREIGN KEY(quote_id) REFERENCES quotes(id)
);

-- 👤 יצירת טבלת USERS
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('admin', 'agent', 'viewer')) NOT NULL,
    api_key TEXT UNIQUE NOT NULL
);

-- 👤 הוספת משתמש דיפולטיבי
INSERT INTO users (name, email, role, api_key)
VALUES ('Admin', 'admin@agentcrm.com', 'admin', 'my-secret-key');

-- 👨‍💻 FREELANCERS
CREATE TABLE IF NOT EXISTS freelancers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    skill TEXT CHECK(skill IN ('GPT', 'Make', 'UI', 'QA', 'Voice', 'Integration', 'Design')) NOT NULL,
    contact_email TEXT,
    whatsapp TEXT,
    is_available BOOLEAN DEFAULT 1,
    current_load INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 📁 PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN (
        'new', 'scoping', 'assigned', 'in_progress', 'qa', 'delivered', 'paid', 'archived'
    )) DEFAULT 'new',
    stage TEXT CHECK(stage IN (
        'intake', 'scoped', 'dev', 'qa', 'delivery', 'support', 'growth'
    )) DEFAULT 'intake',
    current_agent TEXT,
    next_action TEXT,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    full_spec TEXT,
    admin_notes TEXT,
    tags TEXT, -- JSON string (e.g. '["urgent","ai-agent"]')
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
);

-- 📦 PROJECT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS project_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    freelancer_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    status TEXT CHECK(status IN ('assigned', 'in_progress', 'late', 'done', 'cancelled')) DEFAULT 'assigned',
    delivery_link TEXT,
    notes TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id),
    FOREIGN KEY(freelancer_id) REFERENCES freelancers(id)
);
-- ✅ QA REVIEWS – בדיקות QA
CREATE TABLE IF NOT EXISTS qa_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    reviewer TEXT,
    status TEXT CHECK(status IN ('approved', 'rejected')) NOT NULL,
    notes TEXT,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
);
-- 📦 DELIVERIES – Client Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    delivery_link TEXT,
    delivered_at DATETIME,
    delivered_by TEXT,
    followup_status TEXT CHECK(followup_status IN ('pending', 'completed', 'no_response', 'support_needed')),
    feedback TEXT,
    notes TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id)
);
-- 📚 SUPPORT ARTICLES – מאגר תשובות
CREATE TABLE IF NOT EXISTS support_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_keywords TEXT, -- מילות מפתח
    answer_text TEXT,        -- תשובה מוכנה
    related_agent TEXT CHECK(related_agent IN ('SupportAgent', 'DeliveryAgent', 'BillingAgent')) NOT NULL,
    category TEXT CHECK(category IN ('usage', 'bug', 'change', 'onboarding', 'general')) NOT NULL,
    media_link TEXT,         -- קישור
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    times_used INTEGER DEFAULT 0
);
-- 🚀 GROWTH OPPORTUNITIES – שדרוגים
CREATE TABLE IF NOT EXISTS growth_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    suggested_offer TEXT,
    status TEXT CHECK(status IN ('sent', 'interested', 'rejected', 'closed')) DEFAULT 'sent',
    response_date DATETIME,
    next_step TEXT,
    sent_by TEXT,
    notes TEXT,
    FOREIGN KEY(client_id) REFERENCES contacts(id),
    FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE TABLE IF NOT EXISTS marketing_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP, -- מועד התובנה
    client_segment TEXT, -- קהל יעד / פרסונה
    insight_type TEXT CHECK(insight_type IN (
        'engagement', 'conversion', 'content', 'ad_performance', 'cta', 'general'
    )) NOT NULL,
    insight_text TEXT, -- תובנה מילולית
    source_type TEXT CHECK(source_type IN (
        'post', 'campaign', 'funnel', 'quote', 'lead'
    )),
    source_id INTEGER, -- מזהה מקור
    impact_score INTEGER CHECK(impact_score BETWEEN 0 AND 100), -- דירוג השפעה
    recommendation TEXT, -- מה לעשות
    used_in_strategy BOOLEAN DEFAULT 0, -- האם יושם
    used_by_agent TEXT, -- שם סוכן
    notes TEXT -- הערות פנימיות
);
CREATE TABLE IF NOT EXISTS system_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reason TEXT,
    affected_agents TEXT, -- JSON: ["SupportAgent", "BillingAgent"]
    proposed_structure TEXT,
    impact_risks TEXT,
    testing_plan TEXT,
    status TEXT CHECK(status IN ('draft', 'under_review', 'approved', 'executed')) DEFAULT 'draft',
    approved_by TEXT,
    version TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE content_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT, -- instagram / facebook / linkedin / tiktok / blog / email
  post_type TEXT, -- story / reel / post / article / email / ad
  title TEXT,
  content_text TEXT,
  media_link TEXT,
  cta_text TEXT,
  posted_at DATETIME,
  created_by TEXT,
  related_campaign_id INTEGER,
  notes TEXT
);
CREATE TABLE content_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  feedback_text TEXT,
  rating TEXT CHECK(rating IN ('positive', 'neutral', 'negative')) DEFAULT 'neutral',
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (post_id) REFERENCES content_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES contacts(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS content_ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_text TEXT NOT NULL,
    source TEXT CHECK(source IN ('trend', 'client', 'competitor', 'ai', 'user_feedback')) NOT NULL,
    status TEXT CHECK(status IN ('draft', 'reviewed', 'approved', 'rejected')) DEFAULT 'draft',
    intended_platform TEXT CHECK(intended_platform IN ('all', 'instagram', 'blog', 'email', 'facebook', 'linkedin', 'tiktok')) DEFAULT 'all',
    created_by TEXT,
    used_in_post_id INTEGER, -- ✅ קישור לפוסט שנוצר מהרעיונות
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(used_in_post_id) REFERENCES content_posts(id)
);
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- שם הקמפיין
  goal TEXT CHECK(goal IN ('awareness', 'leads', 'retargeting', 'launch')), -- מטרת הקמפיין
  platform TEXT CHECK(platform IN ('facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'email')), -- פלטפורמה
  start_date TEXT, -- תאריך התחלה
  end_date TEXT, -- תאריך סיום
  budget REAL, -- תקציב כולל
  status TEXT CHECK(status IN ('draft', 'running', 'completed', 'paused')), -- סטטוס
  owner_agent INTEGER, -- מזהה של סוכן שיזם (user)
  project_id INTEGER, -- מזהה של פרויקט אם יש
  summary TEXT, -- תיאור כללי
  results_json TEXT, -- תוצאות בפורמט JSON (כמו CTR, CPC וכו')
  FOREIGN KEY (owner_agent) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
-- טבלת פרסונות שיווק
CREATE TABLE IF NOT EXISTS persona_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pain_points TEXT,
  goals TEXT,
  triggers TEXT,
  tone TEXT CHECK(tone IN ('funny', 'serious', 'technical', 'friendly')),
  platforms TEXT,
  tags TEXT,
  updated_at TEXT
);

-- טבלת קישור בין קמפיינים לפרסונות (many-to-many)
CREATE TABLE IF NOT EXISTS marketing_campaigns_personas (
  campaign_id INTEGER NOT NULL,
  persona_id INTEGER NOT NULL,
  PRIMARY KEY (campaign_id, persona_id),
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id),
  FOREIGN KEY (persona_id) REFERENCES persona_library(id)
);
CREATE TABLE IF NOT EXISTS trend_scanner_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATETIME NOT NULL DEFAULT (datetime('now')),
  source TEXT CHECK(source IN ('google_trends', 'tiktok', 'twitter', 'reddit', 'youtube', 'ai_blogs')) NOT NULL,
  title TEXT NOT NULL,
  relevance_score INTEGER CHECK(relevance_score >= 0 AND relevance_score <= 100),
  category TEXT CHECK(category IN ('ai', 'business', 'productivity', 'design', 'marketing', 'other')),
  insight_text TEXT,
  used_in_campaign_id INTEGER,
  used_in_post_id INTEGER,
  FOREIGN KEY (used_in_campaign_id) REFERENCES marketing_campaigns(id),
  FOREIGN KEY (used_in_post_id) REFERENCES content_posts(id)
);
-- 🧪 CAMPAIGN TESTS – ניסויי A/B לקמפיינים
CREATE TABLE IF NOT EXISTS campaign_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL, -- קישור לקמפיין
  test_type TEXT CHECK(test_type IN ('headline', 'image', 'CTA', 'audience', 'timing')) NOT NULL,
  version_a TEXT NOT NULL, -- גרסה A
  version_b TEXT NOT NULL, -- גרסה B
  result TEXT CHECK(result IN ('a_wins', 'b_wins', 'inconclusive')), -- תוצאה
  tested_at DATETIME, -- מועד הבדיקה
  notes TEXT, -- הערות נוספות
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS content_remixes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_post_id INTEGER NOT NULL,
    platform TEXT CHECK(platform IN ('instagram', 'email', 'tiktok', 'blog', 'facebook', 'linkedin', 'whatsapp')) NOT NULL,
    remix_type TEXT CHECK(remix_type IN ('reel', 'story', 'email', 'post', 'article')) NOT NULL,
    title TEXT NOT NULL,
    content_text TEXT,
    media_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (source_post_id) REFERENCES content_posts(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS support_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  project_id INTEGER,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('question', 'bug', 'change', 'upgrade')) NOT NULL,
  emotion TEXT CHECK(emotion IN ('calm', 'frustrated', 'angry', 'confused')) DEFAULT 'calm',
  status TEXT CHECK(status IN ('new', 'in_progress', 'closed', 'escalated')) DEFAULT 'new',
  handled_by TEXT, -- יכול להיות שם של סוכן או סוכן אוטומטי
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (client_id) REFERENCES contacts(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
