const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config(); // defaults to .env in CWD

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function seed() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to DB');

        // 1. Get or Create Test User
        const [users] = await connection.query("SELECT id FROM users WHERE email = 'test@example.com'");
        let userId;

        if (users.length > 0) {
            userId = users[0].id;
            console.log('Found existing test user ID:', userId);
        } else {
            console.log('Creating test user...');
            const hashedPassword = await bcrypt.hash('password123', 8);
            const [result] = await connection.query(
                "INSERT INTO users (username, email, password, bio, avatar) VALUES (?, ?, ?, ?, ?)",
                ['TestUser', 'test@example.com', hashedPassword, 'I test things.', '🤖']
            );
            userId = result.insertId;
            console.log('Created test user ID:', userId);
        }

        // 2. Clear existing habits for this user (optional, but good for clean slate)
        await connection.query("DELETE FROM habits WHERE user_id = ?", [userId]);
        console.log('Cleared old habits');

        // 3. Insert Habits
        const habits = [
            { name: 'Morning Jog', description: 'Run 5km every morning', frequency: 'daily' },
            { name: 'Read a Book', description: 'Read for 30 mins', frequency: 'daily' },
            { name: 'Weekly Review', description: 'Plan the upcoming week', frequency: 'weekly' },
            { name: 'Drink Water', description: 'Drink 8 glasses a day', frequency: 'hourly', target_count: 8 },
            { name: 'Stand Up', description: 'Stand up every hour', frequency: 'hourly', target_count: 12 },
            { name: 'Meditate', description: '10 mins of mindfulness', frequency: 'daily' },
            { name: 'Learn Spanish', description: 'Duolingo lesson', frequency: 'daily' },
            { name: 'No Sugar', description: 'Avoid sweet treats', frequency: 'daily' },
            { name: 'Code Project', description: 'Work on side project', frequency: 'daily' },
            { name: 'Gym', description: 'Weight lifting', frequency: 'getting_swole' } // Intentional typo fallback to daily or failure? DB has enum 'daily','weekly','custom','hourly'. Let's stick to valid ones.
        ];

        // Correcting the last one
        habits[9] = { name: 'Gym', description: 'Weight lifting', frequency: 'weekly' };

        const today = new Date();

        // 4. Generate Random Logs (Progress) & Calculate XP
        let totalXP = 0;
        const xpPerCompletion = 10;

        for (const h of habits) {
            const [res] = await connection.query(
                `INSERT INTO habits (user_id, name, description, frequency, target_count) 
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, h.name, h.description, h.frequency, h.target_count || 1]
            );
            const habitId = res.insertId;

            // Generate logs for the last 14 days
            for (let i = 0; i < 14; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                // 70% chance of completion
                if (Math.random() > 0.3) {
                    await connection.query(
                        `INSERT INTO habit_logs (habit_id, completion_date, status, completions) 
                         VALUES (?, ?, 'completed', ?)
                         ON DUPLICATE KEY UPDATE status=VALUES(status)`,
                        [habitId, dateStr, h.target_count || 1]
                    );
                    totalXP += xpPerCompletion;
                }
            }
        }

        // 5. Update User Stats
        const level = 1 + Math.floor(totalXP / 100);
        await connection.query(
            "UPDATE users SET current_xp = ?, level = ? WHERE id = ?",
            [totalXP, level, userId]
        );

        console.log(`Seeded ${habits.length} habits for user ${userId}`);
        console.log(`Calculated stats: Level ${level}, XP ${totalXP}`);

        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();
