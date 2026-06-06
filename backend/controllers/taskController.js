const db = require('../config/db');

// Create new task (Only managers)
const createTask = (req, res) => {
    // Check if user is manager
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Only managers can create tasks' });
    }
    
    const { title, description, priority, assigned_to, due_date } = req.body;
    const assigned_by = req.user.id;
    
    if (!title || !assigned_to) {
        return res.status(400).json({ message: 'Title and assigned_to are required' });
    }
    
    const query = `
        INSERT INTO tasks (title, description, priority, assigned_to, assigned_by, due_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [title, description, priority || 'medium', assigned_to, assigned_by, due_date], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error creating task', error: err });
        }
        
        res.status(201).json({
            message: 'Task created successfully',
            taskId: result.insertId,
            title,
            assigned_to,
            assigned_by: req.user.username
        });
    });
};

// Get all tasks (Managers see all, Employees see only their tasks)
const getTasks = (req, res) => {
    let query;
    let params;
    
    if (req.user.role === 'manager') {
        // Managers see all tasks with user details
        query = `
            SELECT t.*, 
                   assigned_user.username as assigned_to_name,
                   creator.username as assigned_by_name
            FROM tasks t
            LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id
            LEFT JOIN users creator ON t.assigned_by = creator.id
            ORDER BY t.created_at DESC
        `;
        params = [];
    } else {
        // Employees see only tasks assigned to them
        query = `
            SELECT t.*, 
                   assigned_user.username as assigned_to_name,
                   creator.username as assigned_by_name
            FROM tasks t
            LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id
            LEFT JOIN users creator ON t.assigned_by = creator.id
            WHERE t.assigned_to = ?
            ORDER BY t.created_at DESC
        `;
        params = [req.user.id];
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching tasks', error: err });
        }
        
        res.json({
            tasks: results,
            count: results.length
        });
    });
};

// Update task status (Employees can update their own tasks to completed)
const updateTaskStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Valid status (pending/completed) is required' });
    }
    
    // First check if employee has permission
    let query;
    let params;
    
    if (req.user.role === 'manager') {
        // Managers can update any task
        query = 'UPDATE tasks SET status = ? WHERE id = ?';
        params = [status, id];
    } else {
        // Employees can only update their own tasks
        query = 'UPDATE tasks SET status = ? WHERE id = ? AND assigned_to = ?';
        params = [status, id, req.user.id];
    }
    
    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating task', error: err });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found or you don\'t have permission' });
        }
        
        res.json({ message: 'Task status updated successfully' });
    });
};

// Delete task (Only managers)
const deleteTask = (req, res) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Only managers can delete tasks' });
    }
    
    const { id } = req.params;
    
    const query = 'DELETE FROM tasks WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting task', error: err });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.json({ message: 'Task deleted successfully' });
    });
};

// Get all users (for task assignment - only managers)
const getUsers = (req, res) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const query = 'SELECT id, username, email, role FROM users';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching users', error: err });
        }
        
        res.json({ users: results });
    });
};

module.exports = { createTask, getTasks, updateTaskStatus, deleteTask, getUsers };