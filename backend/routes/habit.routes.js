const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habit.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Specific routes MUST come before dynamic :id routes
router.get('/today', habitController.getTodayHabits);
router.get('/activity', habitController.getWeeklyActivity);

// CRUD operations
router.post('/', habitController.createHabit);
router.get('/', habitController.getHabits);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

// Habit-specific operations
router.post('/:id/log', habitController.logHabit);
router.get('/:id/logs', habitController.getHabitLogs);
router.get('/:id/stats', habitController.getHabitStats);

module.exports = router;
