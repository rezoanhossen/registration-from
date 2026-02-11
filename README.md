# Online Registration Form Web Application

A fully functional web application for online user registration and authentication with **SQLite database**, client-side and server-side validation.

## Features

### Frontend
- **Responsive Design**: Desktop, tablet, and mobile-friendly interface
- **Registration Page**:
  - Personal Information (First Name, Last Name, DoB, Gender)
  - Contact Information (Email, Phone, Address, City, State, Zip, Country)
  - Account Information (Username, Password)
  - Preferences (Newsletter, Terms, Privacy)

- **Login Page**:
  - Username/Email login
  - Remember me functionality
  - Password visibility toggle
  - Change password functionality
  - User dashboard with profile information
  - Login history tracking
  - Logout functionality

- **Client-Side Validation**:
  - Real-time validation on registration
  - Comprehensive error messages
  - Password strength validation
  - Email format validation
  - Phone number validation
  - Age verification (18+ required)
  - Password confirmation matching
  - Terms & Privacy agreement enforcement
  - Login field validation

- **User Experience**:
  - Password visibility toggle
  - Color-coded input fields (valid/invalid)
  - Smooth animations and transitions
  - Success and error notifications
  - Form reset functionality
  - Persistent login (Remember Me option)

### Backend with SQLite Database
- **Express.js Server with Authentication**:
  - User registration with duplicate checking (email & username)
  - Secure login with password hashing
  - JWT-style token generation
  - Change password functionality
  - **SQLite Database** for persistent data storage
  - Login history tracking
  - Password history tracking
  - Admin endpoint for viewing registrations

## Project Structure

```
onregfrm/
├── index.html              # Registration form
├── login.html              # Login & dashboard page
├── server.js              # Express.js server with auth
├── db.js                  # SQLite database operations
├── package.json           # Node.js dependencies
├── registration.db        # SQLite database file (auto-created)
├── README.md              # This file
├── LOGIN_SETUP.md         # Authentication documentation
├── css/
│   ├── styles.css         # Main styling
│   └── login.css          # Login & dashboard styling
├── js/
│   ├── validation.js      # Registration validation
│   └── login.js           # Login & dashboard logic
└── public/                # Static files
```

## Database Schema

The application uses SQLite with the following tables:

### Users Table
```
- id (PRIMARY KEY)
- firstName, lastName
- email (UNIQUE)
- username (UNIQUE)
- password (hashed)
- phone, address, city, state, zipcode, country
- dateOfBirth, gender
- newsletter (boolean)
- registrationDate, lastLogin
- createdAt, updatedAt
```

### Password History Table
```
- id (PRIMARY KEY)
- userId (FOREIGN KEY)
- passwordHash
- changedAt
```

### Login History Table
```
- id (PRIMARY KEY)
- userId (FOREIGN KEY)
- loginTime
- ipAddress
- userAgent
- success (boolean)
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   - Registration: `http://localhost:3000`
   - Login: `http://localhost:3000/login`
   - Admin (view registrations): `http://localhost:3000/registrations`

## Validation Rules

### First Name / Last Name
- Required field
- Only letters, spaces, hyphens, and apostrophes allowed

### Date of Birth
- Required field
- User must be at least 18 years old

### Email
- Required field
- Valid email format required (example@domain.com)

### Phone Number
- Required field
- Accepts various international formats

### Username
- Required field
- 5-20 characters long
- Alphanumeric and underscore only

### Password
- Required field
- Minimum 8 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)

### Address Information
- All address fields (Address, City, State, Zip, Country) are required

### Terms & Privacy
- Must accept both Terms & Conditions and Privacy Policy

## API Endpoints

### Registration Endpoint

**POST `/submit`**
Submits registration form data and creates a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipcode": "10001",
  "country": "usa",
  "username": "johndoe123",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "newsletter": "on",
  "terms": "on",
  "privacy": "on"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Registration successful! You can now login with your credentials.",
  "userId": "token-here"
}
```

### Login Endpoint

**POST `/login`**
Authenticates a user and returns an authentication token and user data.

**Request Body:**
```json
{
  "username": "johndoe123",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "token-here",
  "user": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "username": "johndoe123",
    "phone": "+1 (555) 123-4567",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipcode": "10001",
    "country": "usa",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "registrationDate": "2025-01-01T12:00:00.000Z",
    "lastLogin": "2025-01-01T12:00:00.000Z"
  }
}
```

### Change Password Endpoint

**POST `/change-password`**
Changes the password for the authenticated user.

**Headers:**
```
Authorization: Bearer token-here
```

**Request Body:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewPass456!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Get All Users Endpoint

**GET `/registrations`**
Returns all registered users (admin endpoint).

**Response:**
```json
{
  "count": 5,
  "registrations": [
    {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "username": "johndoe123",
      ...other fields (password excluded)
    }
  ]
}
```

## How It Works

### Registration Flow
1. User fills out the registration form
2. Client-side validation checks all fields and formats
3. Form is submitted to `/submit` endpoint
4. Server validates all data again
5. Server checks if username/email already exists in database
6. Password is hashed using SHA-256
7. User account is inserted into SQLite database
8. Initial password is recorded in password_history table
9. User is redirected to login page

### Login Flow
1. User enters username/email and password
2. Client-side validation checks fields
3. Login request sent to `/login` endpoint
4. Server queries database to find user by username or email
5. Server verifies password hash
6. Login attempt is recorded in login_history table
7. Last login timestamp is updated in database
8. Server generates authentication token
9. User data and token stored in browser (localStorage or sessionStorage)
10. User sees dashboard with their profile information
11. "Remember Me" option persists login using localStorage

### Database Operations
- **Registration**: INSERT INTO users table with hashed password
- **Login**: SELECT user by username/email, verify password hash
- **Password Change**: UPDATE password in users table, log in password_history
- **Duplicate Check**: SELECT COUNT to verify email/username uniqueness
- **Login History**: INSERT login attempt records for audit trail

### Dashboard Features
- View complete profile information
- Change password (requires current password verification)
- Logout button to clear authentication

## Workflow Example

1. **Register**
   - Go to `http://localhost:3000`
   - Fill registration form with:
     - Username: `john_doe`
     - Password: `SecurePass123!`
   - Submit form
   - Data saved to SQLite database

2. **Login**
   - Automatically redirected to `http://localhost:3000/login`
   - Enter username: `john_doe`
   - Enter password: `SecurePass123!`
   - Click Login
   - Database validates credentials
   - See personalized dashboard

## Security Considerations

✅ **Currently Implemented with Database:**
- Passwords are hashed using SHA-256 before storing ✓
- SQLite database with structured schema ✓
- Duplicate email/username prevention ✓
- Server-side validation on all inputs ✓
- Login/password change history tracking ✓
- Separate password history table ✓
- Session tokens with user ID binding ✓
- Parameterized database queries (SQL injection protection) ✓

⚠️ **Important for Production:**
1. Use bcrypt instead of SHA-256 for password hashing
2. Use HTTPS for secure data transmission
3. Implement CSRF protection
4. Add rate limiting on login attempts
5. Validate and sanitize all inputs more thoroughly
6. Use industry-standard JWT library instead of simple tokens
7. Implement proper session management
8. Add password expiration policies
9. Implement email verification
10. Add reCAPTCHA or similar bot protection
11. Add backup and recovery procedures
12. Implement database encryption for sensitive data

## Customization

### Change Port
Edit `server.js` and change the `PORT` variable:
```javascript
const PORT = 5000; // Change to desired port
```

### Add Custom Fields
1. Add input field to `index.html`
2. Add validation logic to `js/validation.js`
3. Add to form submission handler in `server.js`

### Modify Styling
Edit `css/styles.css` to customize colors, fonts, and layout

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Permission Denied
On macOS/Linux, you may need to run with `sudo`:
```bash
sudo npm start
```

## Future Enhancements

- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Database integration (MongoDB, PostgreSQL)
- [ ] Admin dashboard
- [ ] User login system
- [ ] Profile management
- [ ] Email notifications
- [ ] Password reset functionality
- [ ] Captcha verification
- [ ] User roles and permissions

## License

MIT License - Feel free to use and modify

## Support

For issues or improvements, please feel free to contribute!
