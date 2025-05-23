CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    status TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    status TEXT,
    due_date DATE,
    related_to TEXT,
    related_id INTEGER
);

CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    title TEXT,
    datetime DATETIME,
    location TEXT,
    status TEXT,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
);

CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    amount REAL,
    status TEXT CHECK(status IN ('draft', 'sent', 'approved', 'rejected')),
    file_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
);

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

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER,
    amount REAL,
    status TEXT CHECK(status IN ('paid', 'pending', 'late')),
    due_date DATE,
    paid_at DATE,
    FOREIGN KEY(quote_id) REFERENCES quotes(id)
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('admin', 'agent', 'viewer')) NOT NULL,
    api_key TEXT UNIQUE NOT NULL
);
