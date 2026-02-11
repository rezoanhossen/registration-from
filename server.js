const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Initialize database on startup
let dbReady = false;

db.initDatabase()
    .then(() => {
        dbReady = true;
        console.log('Database initialized successfully');
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

// Helper function to generate simple tokens
function generateToken(userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `token_${userId}_${timestamp}_${random}`;
}

// Helper function to generate reset tokens
function generateResetToken(userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `reset_${userId}_${timestamp}_${random}`;
}

// Route: Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Route: Submit registration form
app.post('/submit', async (req, res) => {
    if (!dbReady) {
        return res.status(503).json({
            success: false,
            message: 'Database not ready. Please try again later.'
        });
    }

    const formData = req.body;

    console.log('Registration form received for:', formData.username);

    // Validate required fields
    const requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'gender',
        'email', 'phone', 'address', 'city', 'state', 'zipcode', 'country',
        'username', 'password', 'confirmPassword', 'terms', 'privacy'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            missingFields: missingFields
        });
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
        });
    }

    try {
        // Register user in database
        const result = await db.registerUser(formData);
        console.log(`User ${formData.username} registered successfully with ID: ${result.id}`);
        
        res.json({
            success: true,
            message: 'Registration successful! You can now login with your credentials.',
            userId: result.id
        });
    } catch (err) {
        console.error('Registration error:', err);
        
        if (err.code === 'DUPLICATE_EMAIL') {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        } else if (err.code === 'DUPLICATE_USERNAME') {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error during registration. Please try again.'
        });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    if (!dbReady) {
        return res.status(503).json({
            success: false,
            message: 'Database not ready. Please try again later.'
        });
    }

    const { username, password, rememberMe } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    try {
        // Find user in database
        const user = await db.getUserByUsernameOrEmail(username);

        if (!user) {
            await db.recordLoginAttempt(null, req.ip, req.get('user-agent'), false);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Verify password
        if (!db.verifyPassword(password, user.password)) {
            await db.recordLoginAttempt(user.id, req.ip, req.get('user-agent'), false);
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Update last login
        await db.updateLastLogin(user.id);
        await db.recordLoginAttempt(user.id, req.ip, req.get('user-agent'), true);

        // Generate token
        const token = generateToken(user.id);

        // Return user data (without password)
        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            zipcode: user.zipcode,
            country: user.country,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            registrationDate: user.registrationDate,
            lastLogin: user.lastLogin
        };

        console.log(`User ${username} logged in successfully`);

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: userData
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
});

// Change password endpoint
app.post('/change-password', async (req, res) => {
    if (!dbReady) {
        return res.status(503).json({
            success: false,
            message: 'Database not ready. Please try again later.'
        });
    }

    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        // Extract userId from token (simple parsing)
        const tokenParts = token.split('_');
        if (tokenParts.length < 2 || tokenParts[0] !== 'token') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        const userId = parseInt(tokenParts[1]);
        
        // Get user from database
        const user = await db.getUserById(userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        if (!db.verifyPassword(currentPassword, user.password)) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Change password
        await db.changePassword(userId, newPassword);

        console.log(`Password changed for user ID: ${userId}`);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({
            success: false,
            message: 'An error occurred while changing password'
        });
    }
});

// Forgot Password endpoint - verify email
app.post('/forgot-password', async (req, res) => {
    if (!dbReady) {
        return res.status(503).json({
            success: false,
            message: 'Database not ready. Please try again later.'
        });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }

    try {
        // Find user by email
        const user = await db.getUserByUsernameOrEmail(email);

        if (!user) {
            // For security, don't reveal if email exists
            return res.status(400).json({
                success: false,
                message: 'Email not found in our system'
            });
        }

        // Generate reset token (simple implementation)
        const resetToken = generateResetToken(user.id);
        
        // In a real application, you would:
        // 1. Send this token via email
        // 2. Store it in database with expiration time
        // For this demo, we'll return it directly (NOT secure for production)
        
        console.log(`Password reset requested for user: ${email}, Reset Token: ${resetToken}`);

        res.json({
            success: true,
            message: 'Email verified successfully',
            resetToken: resetToken,
            userId: user.id
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again.'
        });
    }
});

// Reset Password endpoint
app.post('/reset-password', async (req, res) => {
    if (!dbReady) {
        return res.status(503).json({
            success: false,
            message: 'Database not ready. Please try again later.'
        });
    }

    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        // Find user by email
        const user = await db.getUserByUsernameOrEmail(email);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify reset token (simple validation)
        const tokenParts = resetToken.split('_');
        if (tokenParts.length < 2 || tokenParts[0] !== 'reset' || parseInt(tokenParts[1]) !== user.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password in database
        await db.changePassword(user.id, newPassword);

        console.log(`Password reset successfully for user: ${email}`);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting password'
        });
    }
});

// Get all registrations (admin endpoint)
app.get('/registrations', async (req, res) => {
    if (!dbReady) {
        return res.status(503).json({
            success: false,
            message: 'Database not ready. Please try again later.'
        });
    }

    try {
        const users = await db.getAllUsers();

        res.json({
            count: users.length,
            registrations: users
        });
    } catch (err) {
        console.error('Error reading registrations:', err);
        res.status(500).json({
            success: false,
            message: 'Error reading registrations'
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║  Online Registration Form Web Application      ║
║  With SQLite Database & Authentication         ║
║  Server running at http://localhost:${PORT}    ║
║  Register: http://localhost:${PORT}            ║
║  Login:    http://localhost:${PORT}/login      ║
║  Users:    http://localhost:${PORT}/registrations
║  Database: registration.db                     ║
║  Press Ctrl+C to stop the server               ║
╚════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        db.closeDatabase();
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        db.closeDatabase();
        process.exit(0);
    });
});
