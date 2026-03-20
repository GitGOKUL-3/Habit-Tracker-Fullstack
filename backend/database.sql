CREATE DATABASE IF NOT EXISTS habit_tracker;
USE habit_tracker;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    level INT DEFAULT 1,
    current_xp INT DEFAULT 0,
    -- Added role column for Admin feature
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    frequency ENUM('daily', 'weekly') DEFAULT 'daily',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habit_id INT NOT NULL,
    completion_date DATE NOT NULL,
    status ENUM('completed', 'skipped') DEFAULT 'completed',
    notes TEXT,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE KEY unique_log (habit_id, completion_date)
);

-- Note: In a real production migration, we would use ALTER TABLE if the table exists,
-- but for this dev setup we can assume manual handling or direct ALTER commands.
-- I'll send a direct ALTER command via a script or let the user run it if they prefer,
-- but for now updating this file reflects the desired state.
