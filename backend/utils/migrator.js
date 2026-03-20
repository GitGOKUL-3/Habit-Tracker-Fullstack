// v2 - includes CREATE TABLE IF NOT EXISTS for fresh Railway deploys
const pool = require('../config/db');

async function runMigrations() {
    console.log('Running migrations...');
    try {
        const connection = await pool.getConnection();

        // 0. Create base tables if they do not exist (first-time deploy)
        console.log('Creating base tables if not exist...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                level INT DEFAULT 1,
                current_xp INT DEFAULT 0,
                bio TEXT,
                avatar VARCHAR(50) DEFAULT '👤',
                role ENUM('user', 'admin') DEFAULT 'user'
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS habits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                frequency ENUM('daily', 'weekly', 'custom', 'hourly') DEFAULT 'daily',
                custom_days VARCHAR(50),
                target_count INT DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                current_streak INT DEFAULT 0,
                longest_streak INT DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS habit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                habit_id INT NOT NULL,
                completion_date DATE NOT NULL,
                status ENUM('completed', 'skipped') DEFAULT 'completed',
                notes TEXT,
                completions INT DEFAULT 1,
                FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
                UNIQUE KEY unique_log (habit_id, completion_date)
            )
        `);

        console.log('Base tables ready.');

        // 1. Add columns to users table (for older installs)
        const [usersColumns] = await connection.query("SHOW COLUMNS FROM users LIKE 'level'");
        if (usersColumns.length === 0) {
            console.log('Adding gamification columns to users table...');
            await connection.query("ALTER TABLE users ADD COLUMN level INT DEFAULT 1");
            await connection.query("ALTER TABLE users ADD COLUMN current_xp INT DEFAULT 0");
        }

        const [bioColumn] = await connection.query("SHOW COLUMNS FROM users LIKE 'bio'");
        if (bioColumn.length === 0) {
            console.log('Adding bio and avatar columns to users table...');
            await connection.query("ALTER TABLE users ADD COLUMN bio TEXT");
            await connection.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(50) DEFAULT '👤'");
        }

        const [roleColumn] = await connection.query("SHOW COLUMNS FROM users LIKE 'role'");
        if (roleColumn.length === 0) {
            console.log('Adding role column to users table...');
            await connection.query("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'");
        }

        // 2. Add columns to habits table
        await connection.query("ALTER TABLE habits MODIFY COLUMN frequency ENUM('daily', 'weekly', 'custom', 'hourly') DEFAULT 'daily'");

        const [habitsColumns] = await connection.query("SHOW COLUMNS FROM habits LIKE 'current_streak'");
        if (habitsColumns.length === 0) {
            console.log('Adding gamification columns to habits table...');
            await connection.query("ALTER TABLE habits ADD COLUMN current_streak INT DEFAULT 0");
            await connection.query("ALTER TABLE habits ADD COLUMN longest_streak INT DEFAULT 0");
        }

        const [customDaysColumn] = await connection.query("SHOW COLUMNS FROM habits LIKE 'custom_days'");
        if (customDaysColumn.length === 0) {
            console.log('Adding custom_days column to habits table...');
            await connection.query("ALTER TABLE habits ADD COLUMN custom_days VARCHAR(50)");
        }

        const [targetCountColumn] = await connection.query("SHOW COLUMNS FROM habits LIKE 'target_count'");
        if (targetCountColumn.length === 0) {
            console.log('Adding target_count column to habits table...');
            await connection.query("ALTER TABLE habits ADD COLUMN target_count INT DEFAULT 1");
        }

        const [completionsColumn] = await connection.query("SHOW COLUMNS FROM habit_logs LIKE 'completions'");
        if (completionsColumn.length === 0) {
            console.log('Adding completions column to habit_logs table...');
            await connection.query("ALTER TABLE habit_logs ADD COLUMN completions INT DEFAULT 1");
            await connection.query("UPDATE habit_logs SET completions = 1 WHERE completions IS NULL");
        }

        connection.release();
        console.log('Migrations completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

module.exports = runMigrations;
