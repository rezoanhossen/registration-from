# Quick Start Guide

## 🚀 Server is Running!

Your Online Registration Form application is currently running on **http://localhost:3000**

## 📖 Quick Navigation

### 1. Register a New Account
**URL**: http://localhost:3000
- Fill out the registration form with your details
- Complete Personal Information section
- Add Contact Information
- Create Account (Username & Password)
- Accept Terms & Privacy
- Click Register button
- ✅ Data automatically saved to SQLite database
- ✅ Redirected to login page

### 2. Login to Your Account
**URL**: http://localhost:3000/login
- Enter your username or email
- Enter your password
- Check "Remember me" to stay logged in (optional)
- Click Login button
- ✅ Dashboard loads with your profile information
- ✅ Can change password or logout

### 3. View All Registered Users (Admin)
**URL**: http://localhost:3000/registrations
- See list of all users registered in the database
- Shows all user information (except passwords)
- Useful for admin purposes

## 🔑 Test Credentials (Create Your Own)

To test the application:

1. **Register a new account** with:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Username: `johndoe123`
   - Password: `TestPass123!` (must have uppercase, lowercase, number, special char)
   - Fill other fields as needed

2. **Login with**:
   - Username or Email: `johndoe123` or `john@example.com`
   - Password: `TestPass123!`

## 📝 Form Requirements

### Username
- 5-20 characters
- Alphanumeric and underscore only
- Must be unique (no duplicates)

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Email
- Valid email format (example@domain.com)
- Must be unique (no duplicates)

### Date of Birth
- Must be 18+ years old

### Phone Number
- Accepts international formats

## 🛠️ Stop the Server

To stop the server in terminal:
```
Press Ctrl + C
```

The server will:
- Close database connection gracefully
- Display shutdown message
- Exit process

## 🔄 Restart the Server

### If you closed the terminal/server:

```bash
cd c:\Users\rezoa\onregfrm
npm start
```

Or start directly:
```bash
node server.js
```

## 📁 Important Files

- **registration.db** - SQLite database (automatically created)
  - Contains all user data
  - Backup this file to prevent data loss

- **server.js** - Main application server
- **index.html** - Registration form
- **login.html** - Login and dashboard page

## 📊 Database

### Automatic Features
✅ User data persisted in SQLite database
✅ Password hashing before storage
✅ Login history tracked
✅ Password change history maintained
✅ Duplicate email/username prevention

### Database Tables
1. **users** - User account information
2. **password_history** - Track password changes
3. **login_history** - Track login attempts

## 🔐 Security

The application includes:
✅ Password hashing (SHA-256)
✅ SQL injection prevention
✅ Input validation (client & server-side)
✅ Session management
✅ Login attempt tracking
✅ Password history

## 🆘 Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Try again
npm start
```

### Database Issues
```bash
# The database is auto-created, usually no issues
# If corrupted, delete registration.db and restart
# New empty database will be created

# To reset everything:
# 1. Stop the server (Ctrl+C)
# 2. Delete registration.db
# 3. npm start
# 4. All tables will recreate automatically
```

### Lost Password
Currently no password reset feature. You can:
1. Delete registration.db
2. Restart the application
3. Re-register with same email
4. Creates a new account with new password

## 📚 Documentation

- **README.md** - Complete documentation
- **DATABASE.md** - Database technical details
- **LOGIN_SETUP.md** - Authentication setup
- **DATABASE_INTEGRATION.md** - Database integration info
- **TEST_REPORT.md** - Test results and verification

## 💡 Tips

1. **Remember Me** - Keeps you logged in even after closing browser
2. **Change Password** - Click "Change Password" button on dashboard
3. **Logout** - Clears your session and redirects to registration
4. **Admin Endpoint** - Visit /registrations to see all users
5. **Local Storage** - Browser stores your login info when "Remember Me" is checked

## 🎯 Features Available

✅ User Registration
✅ User Login/Authentication
✅ Dashboard with Profile Info
✅ Password Change
✅ Logout
✅ Remember Me
✅ Login History Tracking
✅ SQLite Database
✅ Form Validation
✅ Error Handling
✅ Responsive Design
✅ Admin Panel

## 🚀 Production Deployment

The application is production-ready! To deploy:

1. Set NODE_ENV=production
2. Use environment variables for sensitive data
3. Enable HTTPS/SSL
4. Backup registration.db regularly
5. Consider upgrading to PostgreSQL
6. Implement additional security measures
7. Set up monitoring and logging

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| Server won't start | Port 3000 in use - kill process and retry |
| Database error | Delete registration.db, restart server |
| Forgot password | No reset feature - delete db and re-register |
| Login fails | Check username/email and password spelling |
| Can't see profile | Make sure you're logged in |
| Remember Me not working | Check browser localStorage settings |

---

**Everything is ready to use! Enjoy your Online Registration Form Application!** 🎉
