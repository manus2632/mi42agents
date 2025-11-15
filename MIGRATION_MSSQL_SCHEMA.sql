-- Mi42 Agentensystem - MS-SQL Datenbank-Schema
-- Version: 1.0
-- Datum: 2025-11-10
-- Kompatibilität: MS-SQL Server 2016+

-- ========================================
-- 1. USERS TABELLE
-- ========================================
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  open_id VARCHAR(64) UNIQUE,  -- Optional für Migration, kann NULL sein
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255),  -- Für Standard-Auth
  name NVARCHAR(255),
  login_method VARCHAR(64) DEFAULT 'password',
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at DATETIME DEFAULT GETDATE() NOT NULL,
  updated_at DATETIME DEFAULT GETDATE() NOT NULL,
  last_signed_in DATETIME DEFAULT GETDATE() NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- 2. USER SESSIONS
-- ========================================
CREATE TABLE user_sessions (
  session_id VARCHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT GETDATE() NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- ========================================
-- 3. CREDIT SYSTEM
-- ========================================
CREATE TABLE credit_balances (
  user_id INT PRIMARY KEY,
  balance INT DEFAULT 5000 NOT NULL CHECK (balance >= 0),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE credit_packages (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  credits INT NOT NULL,
  price_eur DECIMAL(10,2) NOT NULL,
  description NVARCHAR(MAX),
  active BIT DEFAULT 1
);

-- Standard-Pakete einfügen
INSERT INTO credit_packages (name, credits, price_eur, description) VALUES
('Starter', 1000, 9.99, 'Perfekt für erste Analysen'),
('Professional', 5000, 39.99, 'Für regelmäßige Marktforschung'),
('Enterprise', 20000, 149.99, 'Umfassende Analysen für große Teams'),
('Ultimate', 100000, 599.99, 'Unbegrenzte Möglichkeiten');

CREATE TABLE credit_transactions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  amount INT NOT NULL,  -- Positiv für Kauf, negativ für Verbrauch
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  reference_id INT,  -- Task-ID bei usage
  created_at DATETIME DEFAULT GETDATE() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_transactions_date ON credit_transactions(created_at DESC);

-- ========================================
-- 4. AGENT TASKS
-- ========================================
CREATE TABLE agent_tasks (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('market_analyst', 'trend_scout', 'survey_assistant', 'strategy_advisor')),
  prompt NVARCHAR(MAX) NOT NULL,
  estimated_cost INT NOT NULL,
  task_status VARCHAR(20) DEFAULT 'pending' CHECK (task_status IN ('pending', 'running', 'completed', 'failed')),
  error_message NVARCHAR(MAX),
  created_at DATETIME DEFAULT GETDATE() NOT NULL,
  started_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user ON agent_tasks(user_id);
CREATE INDEX idx_tasks_status ON agent_tasks(task_status);
CREATE INDEX idx_tasks_type ON agent_tasks(agent_type);
CREATE INDEX idx_tasks_created ON agent_tasks(created_at DESC);

-- ========================================
-- 5. AGENT BRIEFINGS
-- ========================================
CREATE TABLE agent_briefings (
  id INT IDENTITY(1,1) PRIMARY KEY,
  task_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  response NVARCHAR(MAX) NOT NULL,  -- LLM-Response (Markdown)
  user_notes NVARCHAR(MAX),  -- JSON: {"chapter1": "Notiz...", "chapter2": "..."}
  created_at DATETIME DEFAULT GETDATE() NOT NULL,
  FOREIGN KEY (task_id) REFERENCES agent_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_briefings_user ON agent_briefings(user_id);
CREATE INDEX idx_briefings_type ON agent_briefings(agent_type);
CREATE INDEX idx_briefings_created ON agent_briefings(created_at DESC);

-- ========================================
-- 6. COMPANY PROFILES (Onboarding)
-- ========================================
CREATE TABLE company_profiles (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  domain VARCHAR(255) NOT NULL,
  company_name NVARCHAR(255),
  industry NVARCHAR(100),
  description NVARCHAR(MAX),
  competitors NVARCHAR(MAX),  -- JSON-Array
  analysis_data NVARCHAR(MAX),  -- JSON mit Wettbewerbsanalyse
  created_at DATETIME DEFAULT GETDATE() NOT NULL,
  updated_at DATETIME DEFAULT GETDATE() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_profiles_domain ON company_profiles(domain);

-- ========================================
-- 7. AGENT MODEL CONFIG
-- ========================================
CREATE TABLE agent_model_config (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,  -- z.B. 'gpt-oss:120b', 'gpt-4o', 'gemini-2.5-flash'
  created_at DATETIME DEFAULT GETDATE() NOT NULL,
  updated_at DATETIME DEFAULT GETDATE() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, agent_type)
);

CREATE INDEX idx_model_config_user ON agent_model_config(user_id);

-- ========================================
-- 8. TRIGGER FÜR UPDATED_AT
-- ========================================
GO
CREATE TRIGGER trg_users_updated_at
ON users
AFTER UPDATE
AS
BEGIN
  UPDATE users
  SET updated_at = GETDATE()
  FROM users u
  INNER JOIN inserted i ON u.id = i.id;
END;
GO

CREATE TRIGGER trg_company_profiles_updated_at
ON company_profiles
AFTER UPDATE
AS
BEGIN
  UPDATE company_profiles
  SET updated_at = GETDATE()
  FROM company_profiles cp
  INNER JOIN inserted i ON cp.id = i.id;
END;
GO

CREATE TRIGGER trg_model_config_updated_at
ON agent_model_config
AFTER UPDATE
AS
BEGIN
  UPDATE agent_model_config
  SET updated_at = GETDATE()
  FROM agent_model_config mc
  INNER JOIN inserted i ON mc.id = i.id;
END;
GO

-- ========================================
-- 9. VIEWS FÜR REPORTING
-- ========================================
CREATE VIEW v_user_statistics AS
SELECT 
  u.id AS user_id,
  u.email,
  u.name,
  cb.balance AS current_credits,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.task_status = 'completed' THEN t.id END) AS completed_tasks,
  COUNT(DISTINCT b.id) AS total_briefings,
  SUM(CASE WHEN ct.transaction_type = 'usage' THEN ABS(ct.amount) ELSE 0 END) AS total_credits_spent,
  MAX(t.created_at) AS last_task_date
FROM users u
LEFT JOIN credit_balances cb ON u.id = cb.user_id
LEFT JOIN agent_tasks t ON u.id = t.user_id
LEFT JOIN agent_briefings b ON u.id = b.user_id
LEFT JOIN credit_transactions ct ON u.id = ct.user_id
GROUP BY u.id, u.email, u.name, cb.balance;
GO

CREATE VIEW v_agent_usage_stats AS
SELECT 
  agent_type,
  COUNT(*) AS total_executions,
  COUNT(CASE WHEN task_status = 'completed' THEN 1 END) AS successful_executions,
  COUNT(CASE WHEN task_status = 'failed' THEN 1 END) AS failed_executions,
  AVG(DATEDIFF(SECOND, started_at, completed_at)) AS avg_execution_time_seconds,
  SUM(estimated_cost) AS total_credits_consumed
FROM agent_tasks
WHERE task_status IN ('completed', 'failed')
GROUP BY agent_type;
GO

-- ========================================
-- 10. STORED PROCEDURES
-- ========================================
GO
CREATE PROCEDURE sp_deduct_credits
  @user_id INT,
  @amount INT,
  @task_id INT
AS
BEGIN
  SET NOCOUNT ON;
  
  DECLARE @current_balance INT;
  
  -- Aktuelles Guthaben prüfen
  SELECT @current_balance = balance FROM credit_balances WHERE user_id = @user_id;
  
  IF @current_balance < @amount
  BEGIN
    RAISERROR('Insufficient credits', 16, 1);
    RETURN;
  END
  
  BEGIN TRANSACTION;
  
  -- Credits abziehen
  UPDATE credit_balances
  SET balance = balance - @amount
  WHERE user_id = @user_id;
  
  -- Transaktion erfassen
  INSERT INTO credit_transactions (user_id, amount, transaction_type, reference_id)
  VALUES (@user_id, -@amount, 'usage', @task_id);
  
  COMMIT TRANSACTION;
END;
GO

CREATE PROCEDURE sp_add_credits
  @user_id INT,
  @amount INT,
  @transaction_type VARCHAR(20) = 'purchase'
AS
BEGIN
  SET NOCOUNT ON;
  
  BEGIN TRANSACTION;
  
  -- Credits hinzufügen
  UPDATE credit_balances
  SET balance = balance + @amount
  WHERE user_id = @user_id;
  
  -- Transaktion erfassen
  INSERT INTO credit_transactions (user_id, amount, transaction_type)
  VALUES (@user_id, @amount, @transaction_type);
  
  COMMIT TRANSACTION;
END;
GO

CREATE PROCEDURE sp_create_user_with_credits
  @email VARCHAR(320),
  @password_hash VARCHAR(255),
  @name NVARCHAR(255),
  @initial_credits INT = 5000
AS
BEGIN
  SET NOCOUNT ON;
  
  DECLARE @new_user_id INT;
  
  BEGIN TRANSACTION;
  
  -- User erstellen
  INSERT INTO users (email, password_hash, name, login_method)
  VALUES (@email, @password_hash, @name, 'password');
  
  SET @new_user_id = SCOPE_IDENTITY();
  
  -- Credit-Balance initialisieren
  INSERT INTO credit_balances (user_id, balance)
  VALUES (@new_user_id, @initial_credits);
  
  -- Bonus-Transaktion erfassen
  INSERT INTO credit_transactions (user_id, amount, transaction_type)
  VALUES (@new_user_id, @initial_credits, 'bonus');
  
  COMMIT TRANSACTION;
  
  SELECT @new_user_id AS user_id;
END;
GO

-- ========================================
-- 11. CLEANUP JOB (Optional)
-- ========================================
-- Alte Sessions löschen (sollte als SQL Server Agent Job konfiguriert werden)
GO
CREATE PROCEDURE sp_cleanup_expired_sessions
AS
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < GETDATE();
END;
GO

-- ========================================
-- 12. INITIAL DATA
-- ========================================
-- Admin-User erstellen (Passwort: admin123 - BITTE ÄNDERN!)
EXEC sp_create_user_with_credits 
  @email = 'admin@mi42.local',
  @password_hash = '$2a$10$rOzJqKlXQxKd5Z9Z5Z9Z5eOzJqKlXQxKd5Z9Z5Z9Z5eOzJqKlXQxK',  -- Placeholder
  @name = 'Administrator',
  @initial_credits = 100000;

UPDATE users SET role = 'admin' WHERE email = 'admin@mi42.local';

-- ========================================
-- MIGRATION NOTES
-- ========================================
/*
1. Bestehende User-Tabelle:
   Falls bereits eine users-Tabelle existiert, können Sie:
   - Spalten hinzufügen: ALTER TABLE users ADD password_hash VARCHAR(255);
   - Oder: Mapping-Tabelle erstellen zwischen bestehenden Users und Mi42-System

2. Session-Management:
   - Session-Timeout: 24 Stunden (expires_at = DATEADD(HOUR, 24, GETDATE()))
   - Cleanup-Job alle 6 Stunden ausführen

3. Performance-Optimierung:
   - Für > 10.000 Users: Partitionierung von agent_tasks nach created_at
   - Für > 100.000 Briefings: Archivierung alter Briefings in separate Tabelle

4. Backup-Strategie:
   - Tägliches Full Backup
   - Stündliches Transaction Log Backup
   - Besonders wichtig: credit_balances und credit_transactions

5. Monitoring:
   - Index-Fragmentierung wöchentlich prüfen
   - Execution Plans für sp_deduct_credits optimieren
   - Deadlock-Monitoring aktivieren
*/
