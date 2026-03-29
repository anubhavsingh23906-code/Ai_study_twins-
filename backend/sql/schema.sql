CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    class VARCHAR(50) NOT NULL,
    exam_goal VARCHAR(120) NOT NULL,
    preferred_learning_style VARCHAR(50) DEFAULT 'step-by-step',
    selected_subjects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS performance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(120) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    accuracy FLOAT DEFAULT 0,
    avg_time FLOAT DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_performance_user_topic ON performance(user_id, topic);

CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(120) NOT NULL,
    topic VARCHAR(120) NOT NULL,
    interaction_type VARCHAR(50) DEFAULT 'quiz',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    correct BOOLEAN DEFAULT FALSE,
    time_taken FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interactions_user_created_at ON interactions(user_id, created_at DESC);
