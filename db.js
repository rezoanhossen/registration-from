const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'registration.db');

let db = null;

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
            } else {
                console.log('Connected to SQLite database');
                createTables().then(resolve).catch(reject);
            }
        });
    });
}

// Create tables
function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    firstName TEXT NOT NULL,
                    lastName TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    address TEXT NOT NULL,
                    city TEXT NOT NULL,
                    state TEXT NOT NULL,
                    zipcode TEXT NOT NULL,
                    country TEXT NOT NULL,
                    dateOfBirth TEXT NOT NULL,
                    gender TEXT NOT NULL,
                    newsletter BOOLEAN DEFAULT 0,
                    registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    lastLogin DATETIME,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    reject(err);
                } else {
                    console.log('Users table ready');
                    
                    // Password history table for tracking password changes
                    db.run(`
                        CREATE TABLE IF NOT EXISTS password_history (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            userId INTEGER NOT NULL,
                            passwordHash TEXT NOT NULL,
                            changedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (userId) REFERENCES users(id)
                        )
                    `, (err) => {
                        if (err) {
                            console.error('Error creating password_history table:', err);
                            reject(err);
                        } else {
                            console.log('Password history table ready');
                            
                            // Login history table
                            db.run(`
                                CREATE TABLE IF NOT EXISTS login_history (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    userId INTEGER NOT NULL,
                                    loginTime DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    ipAddress TEXT,
                                    userAgent TEXT,
                                    success BOOLEAN DEFAULT 1,
                                    FOREIGN KEY (userId) REFERENCES users(id)
                                )
                            `, (err) => {
                                if (err) {
                                    console.error('Error creating login_history table:', err);
                                    reject(err);
                                } else {
                                    console.log('Login history table ready');
                                    resolve();
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}

// User functions
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        const hashedPassword = hashPassword(userData.password);
        
        const query = `
            INSERT INTO users (
                firstName, lastName, email, username, password,
                phone, address, city, state, zipcode, country,
                dateOfBirth, gender, newsletter
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            userData.firstName,
            userData.lastName,
            userData.email,
            userData.username,
            hashedPassword,
            userData.phone,
            userData.address,
            userData.city,
            userData.state,
            userData.zipcode,
            userData.country,
            userData.dateOfBirth,
            userData.gender,
            userData.newsletter ? 1 : 0
        ];

        db.run(query, params, function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    if (err.message.includes('email')) {
                        reject({ message: 'Email already registered', code: 'DUPLICATE_EMAIL' });
                    } else if (err.message.includes('username')) {
                        reject({ message: 'Username already exists', code: 'DUPLICATE_USERNAME' });
                    }
                } else {
                    reject(err);
                }
            } else {
                // Store initial password in history
                const historyQuery = `INSERT INTO password_history (userId, passwordHash) VALUES (?, ?)`;
                db.run(historyQuery, [this.lastID, hashedPassword], (err) => {
                    if (err) {
                        console.error('Error saving password history:', err);
                    }
                    resolve({ id: this.lastID, username: userData.username });
                });
            }
        });
    });
}

function getUserByUsernameOrEmail(usernameOrEmail) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM users 
            WHERE username = ? OR email = ?
            LIMIT 1
        `;
        
        db.get(query, [usernameOrEmail, usernameOrEmail], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

function getUserById(userId) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE id = ? LIMIT 1`;
        
        db.get(query, [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

function updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE users 
            SET lastLogin = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(query, [userId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function changePassword(userId, newPassword) {
    return new Promise((resolve, reject) => {
        const hashedPassword = hashPassword(newPassword);
        
        const query = `
            UPDATE users 
            SET password = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(query, [hashedPassword, userId], (err) => {
            if (err) {
                reject(err);
            } else {
                // Store in password history
                const historyQuery = `INSERT INTO password_history (userId, passwordHash) VALUES (?, ?)`;
                db.run(historyQuery, [userId, hashedPassword], (err) => {
                    if (err) {
                        console.error('Error saving password history:', err);
                    }
                    resolve();
                });
            }
        });
    });
}

function updateProfile(userId, profileData) {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE users 
            SET firstName = ?, lastName = ?, email = ?, phone = ?, 
                address = ?, city = ?, state = ?, zipcode = ?, country = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const params = [
            profileData.firstName,
            profileData.lastName,
            profileData.email,
            profileData.phone,
            profileData.address,
            profileData.city,
            profileData.state,
            profileData.zipcode,
            profileData.country,
            userId
        ];
        
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function getAllUsers() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                id, firstName, lastName, email, username, 
                phone, address, city, state, zipcode, country,
                dateOfBirth, gender, newsletter, registrationDate, 
                lastLogin, createdAt, updatedAt
            FROM users 
            ORDER BY registrationDate DESC
        `;
        
        db.all(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
}

function getLoginHistory(userId, limit = 10) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM login_history 
            WHERE userId = ? 
            ORDER BY loginTime DESC 
            LIMIT ?
        `;
        
        db.all(query, [userId, limit], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
}

function recordLoginAttempt(userId, ipAddress, userAgent, success) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO login_history (userId, ipAddress, userAgent, success)
            VALUES (?, ?, ?, ?)
        `;
        
        db.run(query, [userId, ipAddress, userAgent, success ? 1 : 0], (err) => {
            if (err) {
                console.error('Error recording login attempt:', err);
                // Don't reject, just log it
                resolve();
            } else {
                resolve();
            }
        });
    });
}

// Password utility functions
function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'salt').digest('hex');
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// Close database
function closeDatabase() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

module.exports = {
    initDatabase,
    registerUser,
    getUserByUsernameOrEmail,
    getUserById,
    updateLastLogin,
    changePassword,
    updateProfile,
    getAllUsers,
    getLoginHistory,
    recordLoginAttempt,
    verifyPassword,
    closeDatabase
};
