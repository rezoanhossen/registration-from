# SQLite Database Documentation

## Overview

The Online Registration Form application now uses **SQLite3** as the persistent database backend instead of JSON files. SQLite provides:

- ✅ Structured data storage
- ✅ ACID compliance
- ✅ Relationship integrity with foreign keys
- ✅ Query optimization
- ✅ No separate server installation needed
- ✅ Easy backup and portability
- ✅ Suitable for production use

## Database Setup

### Automatic Initialization

The database is automatically initialized on server startup:

1. **Database file created**: `registration.db` in the project root
2. **Tables created** with schema
3. **Ready for operations**: Register, login, password changes all use database

### No Manual Setup Required

Simply run `npm install` and `npm start`. The database is ready to use!

## Database Architecture

### Tables

#### 1. Users Table
Stores user account information.

**Schema:**
```sql
CREATE TABLE users (
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
);
```

**Fields:**
- `id`: Unique identifier for each user
- `firstName, lastName`: User's name
- `email`: Unique email address (enforced)
- `username`: Unique username (enforced)
- `password`: Hashed password (SHA-256)
- `phone, address, city, state, zipcode, country`: Address information
- `dateOfBirth, gender`: Personal information
- `newsletter`: Subscription preference
- `registrationDate`: When account was created
- `lastLogin`: Timestamp of last login
- `createdAt, updatedAt`: Audit timestamps

#### 2. Password History Table
Tracks password changes for security audit.

**Schema:**
```sql
CREATE TABLE password_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    passwordHash TEXT NOT NULL,
    changedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

**Fields:**
- `id`: Record identifier
- `userId`: Reference to user
- `passwordHash`: The password hash at time of change
- `changedAt`: When password was set

#### 3. Login History Table
Records login attempts for security auditing.

**Schema:**
```sql
CREATE TABLE login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    loginTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ipAddress TEXT,
    userAgent TEXT,
    success BOOLEAN DEFAULT 1,
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

**Fields:**
- `id`: Record identifier
- `userId`: Reference to user
- `loginTime`: When login was attempted
- `ipAddress`: Client IP address
- `userAgent`: Browser/client information
- `success`: Whether login was successful

## Database Operations

### User Registration

**Operation**: INSERT INTO users
```javascript
// From db.js
await db.registerUser({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'SecurePass123!', // Gets hashed
    phone: '+1234567890',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipcode: '10001',
    country: 'USA',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    newsletter: true
});
```

**Process**:
1. Check for duplicate email/username
2. Hash password using SHA-256
3. Insert into users table
4. Record initial password in password_history
5. Return user ID

### User Login

**Operation**: SELECT from users + verify password
```javascript
// From db.js
const user = await db.getUserByUsernameOrEmail('johndoe');
const isValid = db.verifyPassword('SecurePass123!', user.password);

if (isValid) {
    await db.updateLastLogin(user.id);
    await db.recordLoginAttempt(user.id, ipAddress, userAgent, true);
}
```

**Process**:
1. Query users table by username or email
2. Compare provided password with stored hash
3. Update lastLogin timestamp
4. Record login in login_history

### Password Change

**Operation**: UPDATE users + INSERT password_history
```javascript
// From db.js
await db.changePassword(userId, newPassword);
```

**Process**:
1. Verify current password matches
2. Hash new password
3. Update users table password field
4. Record new password hash in password_history

### Query Examples

#### Find user by username
```sql
SELECT * FROM users WHERE username = 'johndoe' LIMIT 1;
```

#### Find user by email
```sql
SELECT * FROM users WHERE email = 'john@example.com' LIMIT 1;
```

#### Get all users (admin)
```sql
SELECT id, firstName, lastName, email, username, 
       phone, registrationDate, lastLogin 
FROM users 
ORDER BY registrationDate DESC;
```

#### Get user's last 10 logins
```sql
SELECT * FROM login_history 
WHERE userId = 1 
ORDER BY loginTime DESC 
LIMIT 10;
```

#### Get user's password history
```sql
SELECT * FROM password_history 
WHERE userId = 1 
ORDER BY changedAt DESC;
```

#### Count failed login attempts (last hour)
```sql
SELECT COUNT(*) as failed_attempts 
FROM login_history 
WHERE userId = 1 
  AND success = 0 
  AND loginTime > datetime('now', '-1 hour');
```

## Database Module (db.js)

The `db.js` file provides an abstraction layer for all database operations:

### Exported Functions

#### `initDatabase()`
Initialize and create database/tables
```javascript
await db.initDatabase();
```

#### `registerUser(userData)`
Register a new user
```javascript
const result = await db.registerUser(userData);
// Returns: { id: 1, username: 'johndoe' }
```

#### `getUserByUsernameOrEmail(usernameOrEmail)`
Find user by username or email
```javascript
const user = await db.getUserByUsernameOrEmail('johndoe');
```

#### `getUserById(userId)`
Find user by ID
```javascript
const user = await db.getUserById(1);
```

#### `updateLastLogin(userId)`
Update user's last login timestamp
```javascript
await db.updateLastLogin(1);
```

#### `changePassword(userId, newPassword)`
Change user password
```javascript
await db.changePassword(1, 'NewPass456!');
```

#### `getAllUsers()`
Get all users (admin endpoint)
```javascript
const users = await db.getAllUsers();
```

#### `getLoginHistory(userId, limit = 10)`
Get user's login history
```javascript
const history = await db.getLoginHistory(1, 10);
```

#### `recordLoginAttempt(userId, ipAddress, userAgent, success)`
Record a login attempt
```javascript
await db.recordLoginAttempt(1, '192.168.1.1', 'Mozilla/5.0...', true);
```

#### `verifyPassword(password, hash)`
Verify password against hash
```javascript
const isValid = db.verifyPassword('SecurePass123!', hashedPassword);
```

#### `closeDatabase()`
Close database connection
```javascript
db.closeDatabase();
```

## Performance Considerations

### Indexes
Consider adding indexes for frequently queried fields:

```sql
-- Username and email lookups (already unique)
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);

-- Login history queries
CREATE INDEX idx_login_history_userId ON login_history(userId);
CREATE INDEX idx_login_history_loginTime ON login_history(loginTime);

-- Password history queries
CREATE INDEX idx_password_history_userId ON password_history(userId);
```

### Query Optimization
- ✅ Uses parameterized queries (prevents SQL injection)
- ✅ Indexes on primary keys
- ✅ Unique constraints on email/username
- ✅ Foreign key relationships

## Backup & Recovery

### Backing Up Database

**Method 1**: Copy the file
```bash
cp registration.db registration.db.backup
```

**Method 2**: SQLite dump
```bash
sqlite3 registration.db ".dump" > backup.sql
```

### Restoring Database

**From file copy**:
```bash
cp registration.db.backup registration.db
```

**From SQL dump**:
```bash
sqlite3 registration.db < backup.sql
```

### Scheduled Backups
Consider adding automatic backups:

```javascript
// Add to server.js
const schedule = require('node-schedule');
const fs = require('fs');

// Backup every day at 2 AM
schedule.scheduleJob('0 2 * * *', () => {
    const date = new Date().toISOString().split('T')[0];
    fs.copyFileSync('registration.db', `backups/registration.db.${date}`);
});
```

## Maintenance

### Checking Database Integrity
```bash
sqlite3 registration.db "PRAGMA integrity_check;"
```

### Optimizing Database
```bash
sqlite3 registration.db "VACUUM;"
```

### Getting Database Stats
```bash
sqlite3 registration.db "SELECT COUNT(*) as user_count FROM users;"
```

## Migration from JSON

The application was previously using `users.json` files. The new SQLite database:

1. **Eliminates file I/O overhead**
2. **Provides better concurrency handling**
3. **Enables relational data (history tables)**
4. **Better security with proper queries**
5. **Easier to backup and recover**

### Data Migration
To migrate old JSON data to SQLite:

```javascript
// One-time migration script
const oldUsers = JSON.parse(fs.readFileSync('users.json', 'utf8'));

for (const user of oldUsers) {
    await db.registerUser(user);
}
```

## Troubleshooting

### Database Locked Error
**Cause**: Multiple processes accessing database simultaneously
**Solution**: Use proper connection pooling or queue requests

### Disk Space Issues
**Cause**: Large history tables
**Solution**: Archive old records periodically

```javascript
// Archive login history older than 90 days
await db.run(`
    DELETE FROM login_history 
    WHERE loginTime < datetime('now', '-90 days')
`);
```

### Password Hashing Mismatch
**Cause**: Password hash not matching during login
**Solution**: Verify salt is consistent in verifyPassword function

## Future Enhancements

1. **Connection pooling** for better performance
2. **Read replicas** for scaling reads
3. **Encryption at rest** for sensitive data
4. **Audit logging** for compliance
5. **Data retention policies** for GDPR compliance
6. **Analytics** on user behavior
7. **Caching layer** (Redis) for frequently accessed data
8. **Migration to PostgreSQL** for production

## Database File Location

- **Development**: `c:\Users\rezoa\onregfrm\registration.db`
- **Size**: Grows as users register (roughly 1KB per user + history)
- **Permissions**: Read/write required for Node.js process

---

**Your SQLite database is ready for production use!** 🚀
