// Login Page Script
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const passwordModal = document.getElementById('passwordModal');
    const editProfileModal = document.getElementById('editProfileModal');
    const editProfileForm = document.getElementById('editProfileForm');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Check if user is already logged in
    checkLoginStatus();

    // Password toggle
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else {
                input.type = 'password';
                this.textContent = '👁️';
            }
        });
    });

    // Forgot Password Link Click
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (forgotPasswordModal) {
                forgotPasswordModal.style.display = 'flex';
                console.log('Forgot password modal opened');
            }
        });
    }

    // Forgot Password Form Submission (Email Verification)
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value.trim();
            
            clearAllErrors();
            
            if (!email) {
                showError('resetEmail', 'Email is required');
                return;
            }
            
            if (!validateEmail(email)) {
                showError('resetEmail', 'Please enter a valid email address');
                return;
            }

            // Send request to verify email
            fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store the reset token and show reset password form
                    sessionStorage.setItem('resetToken', data.resetToken);
                    sessionStorage.setItem('resetEmail', email);
                    
                    showSuccessAlert('Email verified! Please create a new password.');
                    
                    // Close forgot password modal and open reset password modal
                    setTimeout(() => {
                        forgotPasswordModal.style.display = 'none';
                        forgotPasswordForm.reset();
                        resetPasswordModal.style.display = 'flex';
                    }, 1500);
                } else {
                    showErrorAlert(data.message || 'Email not found. Please check and try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorAlert('An error occurred. Please try again.');
            });
        });
    }

    // Reset Password Form Submission
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('newResetPassword').value;
            const confirmPassword = document.getElementById('confirmResetPassword').value;
            const resetToken = sessionStorage.getItem('resetToken');
            const resetEmail = sessionStorage.getItem('resetEmail');
            
            clearAllErrors();
            
            // Validate
            let isValid = true;
            if (!newPassword) {
                showError('newResetPassword', 'New password is required');
                isValid = false;
            } else if (!validatePassword(newPassword)) {
                showError('newResetPassword', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
                isValid = false;
            }
            
            if (!confirmPassword) {
                showError('confirmResetPassword', 'Please confirm your password');
                isValid = false;
            } else if (newPassword !== confirmPassword) {
                showError('confirmResetPassword', 'Passwords do not match');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Send reset password request
            fetch('/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: resetEmail,
                    resetToken: resetToken,
                    newPassword: newPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Clear session storage
                    sessionStorage.removeItem('resetToken');
                    sessionStorage.removeItem('resetEmail');
                    
                    showSuccessAlert('Password reset successfully! Redirecting to login...');
                    
                    setTimeout(() => {
                        resetPasswordModal.style.display = 'none';
                        resetPasswordForm.reset();
                        
                        // Reload page to show login form
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    showErrorAlert(data.message || 'Failed to reset password. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorAlert('An error occurred. Please try again.');
            });
        });
    }

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Clear error messages
        document.getElementById('loginUsernameError').textContent = '';
        document.getElementById('loginPasswordError').textContent = '';

        // Validate
        let isValid = true;
        if (!username) {
            showError('loginUsername', 'Username or email is required');
            isValid = false;
        }
        if (!password) {
            showError('loginPassword', 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        // Send login request
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                rememberMe: rememberMe
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Save token to localStorage or sessionStorage
                if (rememberMe) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem('authToken', data.token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                }

                // Show success message
                showSuccessAlert('Login successful! Redirecting to dashboard...');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showErrorAlert(data.message || 'Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorAlert('An error occurred. Please try again.');
        });
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            
            showSuccessAlert('You have been logged out. Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }

    // Change password button
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            passwordModal.style.display = 'flex';
        });
    }

    // Edit profile button
    if (editProfileBtn) {
        console.log('Edit Profile Button found and attaching click handler');
        editProfileBtn.addEventListener('click', function() {
            console.log('Edit Profile Button clicked');
            if (editProfileModal) {
                // Populate form with current user data
                const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    document.getElementById('editFirstName').value = user.firstName;
                    document.getElementById('editLastName').value = user.lastName;
                    document.getElementById('editEmail').value = user.email;
                    document.getElementById('editPhone').value = user.phone;
                    document.getElementById('editAddress').value = user.address;
                    document.getElementById('editCity').value = user.city;
                    document.getElementById('editState').value = user.state;
                    document.getElementById('editZipcode').value = user.zipcode;
                    document.getElementById('editCountry').value = user.country;
                }
                editProfileModal.style.display = 'flex';
            }
        });
    } else {
        console.log('Edit Profile Button NOT found');
    }

    // Edit profile form submission
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('editFirstName').value.trim();
            const lastName = document.getElementById('editLastName').value.trim();
            const email = document.getElementById('editEmail').value.trim();
            const phone = document.getElementById('editPhone').value.trim();
            const address = document.getElementById('editAddress').value.trim();
            const city = document.getElementById('editCity').value.trim();
            const state = document.getElementById('editState').value.trim();
            const zipcode = document.getElementById('editZipcode').value.trim();
            const country = document.getElementById('editCountry').value.trim();
            
            clearAllErrors();
            
            // Validate
            let isValid = true;
            if (!firstName) {
                showError('editFirstName', 'First name is required');
                isValid = false;
            }
            if (!lastName) {
                showError('editLastName', 'Last name is required');
                isValid = false;
            }
            if (!email) {
                showError('editEmail', 'Email is required');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError('editEmail', 'Please enter a valid email address');
                isValid = false;
            }
            if (!phone) {
                showError('editPhone', 'Phone number is required');
                isValid = false;
            }
            if (!address) {
                showError('editAddress', 'Address is required');
                isValid = false;
            }
            if (!city) {
                showError('editCity', 'City is required');
                isValid = false;
            }
            if (!state) {
                showError('editState', 'State is required');
                isValid = false;
            }
            if (!zipcode) {
                showError('editZipcode', 'Zip code is required');
                isValid = false;
            }
            if (!country) {
                showError('editCountry', 'Country is required');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Get auth token
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            // Send update profile request
            fetch('/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                    address: address,
                    city: city,
                    state: state,
                    zipcode: zipcode,
                    country: country
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update user data in storage
                    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
                    const user = JSON.parse(userStr);
                    const updatedUser = {
                        ...user,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        phone: phone,
                        address: address,
                        city: city,
                        state: state,
                        zipcode: zipcode,
                        country: country
                    };
                    
                    if (localStorage.getItem('user')) {
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    } else {
                        sessionStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                    
                    // Update dashboard display
                    displayDashboard(updatedUser);
                    
                    showSuccessAlert('Profile updated successfully!');
                    setTimeout(() => {
                        editProfileModal.style.display = 'none';
                        editProfileForm.reset();
                    }, 1500);
                } else {
                    showErrorAlert(data.message || 'Failed to update profile');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorAlert('An error occurred. Please try again.');
            });
        });
    }

    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Find which modal this button belongs to
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                // Reset the form in this modal if it exists
                const form = modal.querySelector('form');
                if (form) form.reset();
                clearAllErrors();
            }
        });
    });

    // Close modal on outside click - Password Modal
    if (passwordModal) {
        passwordModal.addEventListener('click', function(e) {
            if (e.target === passwordModal) {
                passwordModal.style.display = 'none';
                changePasswordForm.reset();
                clearAllErrors();
            }
        });
    }

    // Close modal on outside click - Forgot Password Modal
    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener('click', function(e) {
            if (e.target === forgotPasswordModal) {
                forgotPasswordModal.style.display = 'none';
                forgotPasswordForm.reset();
                clearAllErrors();
            }
        });
    }

    // Close modal on outside click - Reset Password Modal
    if (resetPasswordModal) {
        resetPasswordModal.addEventListener('click', function(e) {
            if (e.target === resetPasswordModal) {
                resetPasswordModal.style.display = 'none';
                resetPasswordForm.reset();
                clearAllErrors();
            }
        });
    }

    // Close modal on outside click - Edit Profile Modal
    if (editProfileModal) {
        editProfileModal.addEventListener('click', function(e) {
            if (e.target === editProfileModal) {
                editProfileModal.style.display = 'none';
                editProfileForm.reset();
                clearAllErrors();
            }
        });
    }

    // Change password form submission
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        clearAllErrors();

        // Validate
        let isValid = true;
        if (!currentPassword) {
            showError('currentPassword', 'Current password is required');
            isValid = false;
        }
        if (!newPassword) {
            showError('newPassword', 'New password is required');
            isValid = false;
        } else if (!validatePassword(newPassword)) {
            showError('newPassword', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            isValid = false;
        }
        if (!confirmNewPassword) {
            showError('confirmNewPassword', 'Please confirm your new password');
            isValid = false;
        } else if (newPassword !== confirmNewPassword) {
            showError('confirmNewPassword', 'Passwords do not match');
            isValid = false;
        }

        if (!isValid) return;

        // Get auth token
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        // Send change password request
        fetch('/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessAlert('Password changed successfully!');
                setTimeout(() => {
                    passwordModal.style.display = 'none';
                    changePasswordForm.reset();
                }, 1500);
            } else {
                showErrorAlert(data.message || 'Failed to change password');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorAlert('An error occurred. Please try again.');
        });
        });
    }
});

// Helper Functions
function checkLoginStatus() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            displayDashboard(user);
        } catch (e) {
            console.error('Error parsing user data:', e);
            showLoginForm();
        }
    } else {
        showLoginForm();
    }
}

function displayDashboard(user) {
    const loginForm = document.querySelector('.login-wrapper');
    const dashboard = document.getElementById('dashboard');
    
    if (loginForm) loginForm.style.display = 'none';
    dashboard.style.display = 'block';

    // Populate user data
    document.getElementById('userName').textContent = user.firstName;
    document.getElementById('fullName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('email').textContent = user.email;
    document.getElementById('phone').textContent = user.phone;
    document.getElementById('location').textContent = `${user.city}, ${user.state} ${user.zipcode}, ${user.country}`;
    document.getElementById('registrationDate').textContent = new Date(user.registrationDate).toLocaleDateString();
}

function showLoginForm() {
    const loginForm = document.querySelector('.login-wrapper');
    const dashboard = document.getElementById('dashboard');
    
    if (loginForm) loginForm.style.display = 'block';
    dashboard.style.display = 'none';
}

function validatePassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function showErrorAlert(message) {
    const alertDiv = document.getElementById('errorMessage');
    if (alertDiv) {
        alertDiv.textContent = message;
        alertDiv.style.display = 'block';
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccessAlert(message) {
    const alertDiv = document.getElementById('successMessage');
    if (alertDiv) {
        alertDiv.textContent = message;
        alertDiv.style.display = 'block';
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
}
