const db = require('../config/db');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const runMigrations = require('./migrator');

dotenv.config();

// Seeder Configuration
const SEED_CONFIG = {
    user: {
        username: 'test_user',
        email: 'test@example.com',
        password: 'password123',
        level: 3,
        current_xp: 320
    },
    habits: [
        { name: 'Morning Jog 🏃', description: 'Run for 30 mins', frequency: 'daily', longest_streak: 5, current_streak: 3 },
        { name: 'Read Book 📚', description: 'Read 20 pages', frequency: 'daily', longest_streak: 10, current_streak: 10 },
        { name: 'Drink Water 💧', description: '2L per day', frequency: 'daily', longest_streak: 2, current_streak: 0 },
        { name: 'Code Project 💻', description: 'Work on side project', frequency: 'daily', longest_streak: 15, current_streak: 15 },
        { name: 'Meditation 🧘', description: '15 mins mindfulness', frequency: 'daily', longest_streak: 3, current_streak: 1 },
    ]
};

async function seed() {
    console.log('🌱 Starting Database Seeding...');
    let connection;
    try {
        // 0. Run Migrations
        await runMigrations();

        connection = await db.getConnection();

        // 1. Clear existing test data (Optional: for idempotent runs)
        console.log('🧹 Cleaning old test data...');
        const [users] = await connection.execute('SELECT id FROM users WHERE email = ?', [SEED_CONFIG.user.email]);
        if (users.length > 0) {
            const userId = users[0].id;
            await connection.execute('DELETE FROM habit_logs WHERE habit_id IN (SELECT id FROM habits WHERE user_id = ?)', [userId]);
            await connection.execute('DELETE FROM habits WHERE user_id = ?', [userId]);
            await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
            console.log('   - Removed existing test user and data.');
        }

        // 2. Create User
        console.log('👤 Creating Test User...');
        const hashedPassword = await bcrypt.hash(SEED_CONFIG.user.password, 8);
        const [userResult] = await connection.execute(
            'INSERT INTO users (username, email, password, level, current_xp) VALUES (?, ?, ?, ?, ?)',
            [SEED_CONFIG.user.username, SEED_CONFIG.user.email, hashedPassword, SEED_CONFIG.user.level, SEED_CONFIG.user.current_xp]
        );
        const userId = userResult.insertId;
        console.log(`   - User created with ID: ${userId}`);

        // 3. Create Habits
        console.log('📝 Creating Habits...');
        const habitIds = [];
        for (const habit of SEED_CONFIG.habits) {
            const [hResult] = await connection.execute(
                'INSERT INTO habits (user_id, name, description, frequency, longest_streak, current_streak) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, habit.name, habit.description, habit.frequency, habit.longest_streak, habit.current_streak]
            );
            habitIds.push({ id: hResult.insertId, ...habit });
        }
        console.log(`   - ${habitIds.length} habits created.`);

        // 4. Generate Activity Logs (Last 14 days)
        console.log('📅 Generating Activity Logs...');
        let logCount = 0;
        const today = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            for (const habit of habitIds) {
                // Randomize completion based on habit "personality"
                let shouldComplete = false;

                // Logic to match the desired streaks roughly
                if (habit.name.includes('Read')) shouldComplete = true; // High consistency
                else if (habit.name.includes('Code')) shouldComplete = true;
                else if (habit.name.includes('Jog')) shouldComplete = i < 3 || i > 5; // Recently active, gap before
                else shouldComplete = Math.random() > 0.5;

                if (shouldComplete) {
                    await connection.execute(
                        'INSERT INTO habit_logs (habit_id, completion_date, status) VALUES (?, ?, ?)',
                        [habit.id, dateStr, 'completed']
                    );
                    logCount++;
                }
            }
        }
        console.log(`   - ${logCount} activity logs generated.`);

        console.log('\n✅ Seeding Complete!');
        console.log('------------------------------------------------');
        console.log('Use the following credentials to login:');
        console.log(`Email:    ${SEED_CONFIG.user.email}`);
        console.log(`Password: ${SEED_CONFIG.user.password}`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

seed();
