const db = require('../config/db');

// Create a new habit
exports.createHabit = async (req, res) => {
    try {
        console.log('Create Habit Body:', req.body);
        const { name, description, frequency, custom_days, target_count } = req.body;
        const userId = req.userId; // From auth middleware

        if (!name) {
            return res.status(400).json({ message: 'Habit name is required' });
        }

        const [result] = await db.execute(
            'INSERT INTO habits (user_id, name, description, frequency, custom_days, target_count) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, description || null, frequency || 'daily', custom_days || null, target_count || 1]
        );

        res.status(201).json({
            message: 'Habit created successfully',
            habitId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all habits for the logged-in user
exports.getHabits = async (req, res) => {
    try {
        const userId = req.userId;

        const [habits] = await db.execute(
            'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.status(200).json(habits);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a habit
exports.updateHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, frequency, custom_days, target_count } = req.body;
        const userId = req.userId;

        // Verify ownership
        const [check] = await db.execute('SELECT user_id FROM habits WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).json({ message: 'Habit not found' });
        if (check[0].user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        await db.execute(
            'UPDATE habits SET name = ?, description = ?, frequency = ?, custom_days = ?, target_count = ? WHERE id = ?',
            [name, description, frequency, custom_days || null, target_count || 1, id]
        );

        res.status(200).json({ message: 'Habit updated' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a habit
exports.deleteHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const [check] = await db.execute('SELECT user_id FROM habits WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).json({ message: 'Habit not found' });
        if (check[0].user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        await db.execute('DELETE FROM habits WHERE id = ?', [id]);

        // Recalculate XP
        const [totalUserCompletions] = await db.execute(
            'SELECT SUM(l.completions) as total FROM habit_logs l JOIN habits h ON l.habit_id = h.id WHERE h.user_id = ? AND l.status = \'completed\'',
            [userId]
        );

        const totalXP = (totalUserCompletions[0].total || 0) * 10;
        const newLevel = Math.floor(totalXP / 100) + 1;

        await db.execute('UPDATE users SET current_xp = ?, level = ? WHERE id = ?', [totalXP, newLevel, userId]);

        res.status(200).json({
            message: 'Habit deleted',
            xp: totalXP,
            level: newLevel
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Log a habit completion
exports.logHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, status, notes } = req.body; // date in YYYY-MM-DD
        const userId = req.userId;

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Invalid or missing date' });
        }

        // Verify ownership
        const [check] = await db.execute('SELECT * FROM habits WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).json({ message: 'Habit not found' });
        const habit = check[0];
        if (habit.user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        // Insert or Update log
        let query = '';
        if (habit.frequency === 'hourly') {
            // Check if limit reached for today
            const today = date; // date from body
            const [existing] = await db.execute(
                'SELECT completions FROM habit_logs WHERE habit_id = ? AND completion_date = ?',
                [id, today]
            );

            const currentCompletions = existing.length > 0 ? existing[0].completions : 0;
            if (currentCompletions >= habit.target_count) {
                return res.status(400).json({ message: 'Daily target reached for this habit.' });
            }

            query = `INSERT INTO habit_logs (habit_id, completion_date, status, notes, completions) 
                     VALUES (?, ?, ?, ?, 1) 
                     ON DUPLICATE KEY UPDATE completions = COALESCE(completions, 0) + 1, status = VALUES(status)`;
        } else {
            query = `INSERT INTO habit_logs (habit_id, completion_date, status, notes, completions) 
                     VALUES (?, ?, ?, ?, 1) 
                     ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)`;
            // Added 'completions' to daily insert as well to ensure consistency and avoid NULLs
        }

        await db.execute(query, [id, date, status || 'completed', notes || null]);

        // GAMIFICATION LOGIC
        if (status === 'completed' || !status) {

            // Recalculate streak
            const [logs] = await db.execute(
                'SELECT completion_date FROM habit_logs WHERE habit_id = ? AND status = \'completed\' ORDER BY completion_date DESC',
                [id]
            );

            // Simple streak calculation
            let currentStreak = 0;
            if (logs.length > 0) {
                const dates = logs.map(l => new Date(l.completion_date).toISOString().split('T')[0]);
                
                // Use user's local date sent in the request instead of server time 
                const userLocalToday = new Date(date);
                const userLocalYesterday = new Date(userLocalToday);
                userLocalYesterday.setDate(userLocalToday.getDate() - 1);
                
                const todayDate = userLocalToday.toISOString().split('T')[0];
                const yesterdayDate = userLocalYesterday.toISOString().split('T')[0];

                // If the most recent log is today or yesterday, streak is alive
                if (dates[0] === todayDate || dates[0] === yesterdayDate) {
                    currentStreak = 1;
                    for (let i = 0; i < dates.length - 1; i++) {
                        const curr = new Date(dates[i]);
                        const next = new Date(dates[i + 1]); // prev in time
                        const diffDays = Math.ceil(Math.abs(curr - next) / (1000 * 60 * 60 * 24));
                        if (diffDays === 1) {
                            currentStreak++;
                        } else {
                            break;
                        }
                    }
                }
            }

            // Update Habit Streak
            const longestStreak = Math.max(habit.longest_streak || 0, currentStreak);
            await db.execute('UPDATE habits SET current_streak = ?, longest_streak = ? WHERE id = ?', [currentStreak, longestStreak, id]);

            // Calculate Total XP
            const [totalUserCompletions] = await db.execute(
                'SELECT SUM(l.completions) as total FROM habit_logs l JOIN habits h ON l.habit_id = h.id WHERE h.user_id = ? AND l.status = \'completed\'',
                [userId]
            );

            const totalXP = (totalUserCompletions[0].total || 0) * 10;
            const newLevel = Math.floor(totalXP / 100) + 1;

            await db.execute('UPDATE users SET current_xp = ?, level = ? WHERE id = ?', [totalXP, newLevel, userId]);

            res.status(200).json({
                message: 'Habit logged successfully',
                streak: currentStreak,
                xp_gained: 10,
                total_xp: totalXP,
                level: newLevel
            });
            return;
        }

        res.status(200).json({ message: 'Habit logged successfully' });

    } catch (error) {
        console.error('Error in logHabit:', error);
        res.status(500).json({ message: 'Server error: ' + error.message, stack: error.stack });
    }
};

// Get logs for a specific habit
exports.getHabitLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const [check] = await db.execute('SELECT user_id FROM habits WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).json({ message: 'Habit not found' });
        if (check[0].user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        const [logs] = await db.execute(
            'SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY completion_date DESC',
            [id]
        );

        res.status(200).json(logs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get today's habits with logs
exports.getTodayHabits = async (req, res) => {
    try {
        const userId = req.userId;
        const today = new Date().toISOString().split('T')[0];
        const dayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday...

        // Join habits with today's log if it exists
        // Filter by frequency: 
        // - 'daily' always shows
        // - 'custom' only shows if today is in custom_days
        const query = `
            SELECT h.*, l.status as today_status, l.id as log_id, l.completions as completions_today 
            FROM habits h 
            LEFT JOIN habit_logs l ON h.id = l.habit_id AND l.completion_date = ? 
            WHERE h.user_id = ? 
            AND (
                h.frequency = 'daily' 
                OR h.frequency = 'weekly'
                OR (h.frequency = 'custom' AND FIND_IN_SET(?, h.custom_days))
                OR h.frequency = 'hourly'
            )
        `;

        const [results] = await db.execute(query, [today, userId, dayOfWeek]);

        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get stats for a habit (Streaks, Completion)
exports.getHabitStats = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verify ownership
        const [check] = await db.execute('SELECT user_id FROM habits WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).json({ message: 'Habit not found' });
        if (check[0].user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        // Get all logs
        const [logs] = await db.execute(
            'SELECT completion_date FROM habit_logs WHERE habit_id = ? ORDER BY completion_date ASC',
            [id]
        );

        // Calculate Streak (JS Logic)
        let currentStreak = 0;
        let maxStreak = 0;
        let daysLogged = logs.length;

        if (logs.length > 0) {
            const dates = logs.map(l => new Date(l.completion_date).toISOString().split('T')[0]);
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // simple iter loop
            // Note: This logic assumes 1 entry per day, which unique constraint ensures.
            // However, gaps break streak.

            let tempStreak = 0;
            // We need to iterate day by day or check gaps.
            // Easier: check consecutive dates.

            // To do this strictly correct, we need to parse dates.
            for (let i = 0; i < dates.length; i++) {
                if (i === 0) {
                    tempStreak = 1;
                } else {
                    const prev = new Date(dates[i - 1]);
                    const curr = new Date(dates[i]);
                    const diffTime = Math.abs(curr - prev);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        tempStreak++;
                    } else {
                        tempStreak = 1;
                    }
                }
                if (tempStreak > maxStreak) maxStreak = tempStreak;
            }

            // Check current streak (must include today or yesterday)
            const lastLogDate = dates[dates.length - 1];
            if (lastLogDate === today || lastLogDate === yesterday) {
                // We need to re-calculate backwards from end to find current active streak
                currentStreak = 1;
                for (let i = dates.length - 1; i > 0; i--) {
                    const curr = new Date(dates[i]);
                    const prev = new Date(dates[i - 1]);
                    const diffTime = Math.abs(curr - prev);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            } else {
                currentStreak = 0;
            }
        }

        res.status(200).json({
            total_completions: daysLogged,
            current_streak: currentStreak,
            max_streak: maxStreak
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Get weekly activity for chart
exports.getWeeklyActivity = async (req, res) => {
    try {
        const userId = req.userId;

        // Get logs for the last 7 days for this user
        const query = `
            SELECT DATE(l.completion_date) as date, COUNT(*) as count 
            FROM habit_logs l
            JOIN habits h ON l.habit_id = h.id
            WHERE h.user_id = ? AND l.status = 'completed'
            AND l.completion_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(l.completion_date)
            ORDER BY date ASC
        `;

        const [results] = await db.execute(query, [userId]);

        // Format for frontend (ensure all 7 days are present, even if 0)
        const activity = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const found = results.find(r => {
                // Handle various date formats returned by driver (Date object or string)
                let rDate = r.date;
                if (typeof rDate === 'string') rDate = rDate.split('T')[0];
                else rDate = rDate.toISOString().split('T')[0];
                return rDate === dateStr;
            });

            activity.push({
                date: dateStr,
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                count: found ? found.count : 0
            });
        }

        res.status(200).json(activity);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
