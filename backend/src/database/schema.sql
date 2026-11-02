-- EMPLOYEE ASSESSMENT SYSTEM DATABASE SCHEMA

-- 1. Bo'limlar (Departments)
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    test_duration_minutes INT DEFAULT 30,
    total_questions INT DEFAULT 30,
    closed_questions_count INT DEFAULT 25,
    open_questions_count INT DEFAULT 5,
    passing_score INT DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Foydalanuvchilar (Users: Admin & Xodim)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'xodim', -- 'admin' yoki 'xodim'
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    level VARCHAR(20) DEFAULT 'Middle', -- 'Junior', 'Middle', 'Senior'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Hujjatlar (Documents)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT DEFAULT 0,
    mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded', 'processing', 'learned', 'error'
    chunks_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Savollar banki (Questions)
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    document_id INT REFERENCES documents(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL DEFAULT 'closed', -- 'closed' yoki 'open'
    level VARCHAR(20) DEFAULT 'Middle',
    difficulty VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'approved', -- 'draft', 'approved', 'rejected'
    explanation TEXT,
    evaluation_criteria TEXT,
    sample_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Yopiq savollar variantlari (Question Options)
CREATE TABLE IF NOT EXISTS question_options (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

-- 6. Test Sessiyalari (Test Sessions & Server Timer)
CREATE TABLE IF NOT EXISTS test_sessions (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR(100) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'timed_out', 'cancelled_cheat'
    total_questions INT NOT NULL DEFAULT 30,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    cheat_warnings_count INT DEFAULT 0,
    total_score FLOAT DEFAULT 0,
    closed_score FLOAT DEFAULT 0,
    open_score FLOAT DEFAULT 0,
    percentage FLOAT DEFAULT 0,
    is_passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Sessiyaga biriktirilgan savollar nusxasi (Session Questions Snapshot)
CREATE TABLE IF NOT EXISTS session_questions (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES test_sessions(id) ON DELETE CASCADE,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    question_snapshot JSONB NOT NULL
);

-- 8. Xodim javoblari (Answers & AI Evaluations)
CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES test_sessions(id) ON DELETE CASCADE,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id INT REFERENCES question_options(id) ON DELETE SET NULL,
    answer_text TEXT,
    is_correct BOOLEAN,
    score FLOAT DEFAULT 0,
    ai_evaluation JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Anti-cheat hodisalari jurnali (Anti-Cheat Logs)
CREATE TABLE IF NOT EXISTS anti_cheat_logs (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES test_sessions(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'tab_hidden', 'window_blur', 'copy_attempt', 'paste_attempt', 'devtools_key', 'fullscreen_exit'
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users (department_id);
CREATE INDEX IF NOT EXISTS idx_questions_dept_type ON questions (department_id, question_type, status);
CREATE INDEX IF NOT EXISTS idx_test_sessions_user ON test_sessions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_answers_session ON answers (session_id);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_session ON anti_cheat_logs (session_id);

