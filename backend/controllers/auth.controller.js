const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Insert user
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find user
        const [users] = await db.execute(
            'SELECT id, username, email, password, level, current_xp, bio, avatar, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Check password
        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate value
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            level: user.level,
            current_xp: user.current_xp,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role,
            accessToken: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { username, bio, avatar } = req.body;

        // Check uniqueness if username changes
        if (username) {
            const [existing] = await db.execute('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        const [currentUser] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (currentUser.length === 0) return res.status(404).json({ message: 'User not found' });

        const newUsername = username || currentUser[0].username;
        const newBio = bio !== undefined ? bio : (currentUser[0].bio || '');
        const newAvatar = avatar || currentUser[0].avatar || '👤';

        await db.execute(
            'UPDATE users SET username = ?, bio = ?, avatar = ? WHERE id = ?',
            [newUsername, newBio, newAvatar, userId]
        );

        res.json({
            message: 'Profile updated',
            user: {
                ...currentUser[0],
                username: newUsername,
                bio: newBio,
                avatar: newAvatar
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const isValid = await bcrypt.compare(oldPassword, user.password);

        if (!isValid) {
            return res.status(401).json({ message: 'Incorrect old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
