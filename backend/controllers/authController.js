const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Register new user
const register = async (req, res) => {
    const { username, email, password, role } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email and password' });
    }
    
    try {
        // Check if user already exists
        const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
        db.query(checkQuery, [email, username], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ message: 'User already exists with this email or username' });
            }
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Insert new user
            const insertQuery = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
            const userRole = role || 'employee'; // Default role is employee
            
            db.query(insertQuery, [username, email, hashedPassword, userRole], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error creating user', error: err });
                }
                
                res.status(201).json({ 
                    message: 'User registered successfully',
                    userId: result.insertId,
                    username: username,
                    email: email,
                    role: userRole
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register };