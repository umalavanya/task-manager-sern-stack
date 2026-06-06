const express = require('express');
const {
    createTask,
    getTasks,
    updateTaskStatus,
    deleteTask,
    getUsers
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Task routes
router.post('/tasks', authorize('manager'), createTask);
router.get('/tasks', getTasks);
router.put('/tasks/:id/status', updateTaskStatus);
router.delete('/tasks/:id', authorize('manager'), deleteTask);
router.get('/users', authorize('manager'), getUsers);

module.exports = router;