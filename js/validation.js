// Form Validation Script
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Password toggle functionality
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

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear all previous error messages
        clearAllErrors();
        
        // Validate all fields
        if (validateForm()) {
            // Collect form data
            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                dateOfBirth: document.getElementById('dateOfBirth').value,
                gender: document.getElementById('gender').value,
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                zipcode: document.getElementById('zipcode').value.trim(),
                country: document.getElementById('country').value,
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value,
                terms: document.getElementById('terms').checked,
                privacy: document.getElementById('privacy').checked,
                newsletter: document.getElementById('newsletter') ? document.getElementById('newsletter').checked : false
            };
            
            // Send data to server
            fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showSuccessMessage();
                    
                    // Reset form after redirect
                    setTimeout(() => {
                        form.reset();
                    }, 2500);
                } else {
                    // Show error messages from server
                    if (data.missingFields && data.missingFields.length > 0) {
                        data.missingFields.forEach(field => {
                            showError(field, `${field} is required`);
                        });
                    } else {
                        alert(data.message || 'Registration failed. Please try again.');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during registration. Please try again.');
            });
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        input.addEventListener('change', function() {
            validateField(this);
        });
    });
});

// Validation Functions
function validateForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipcode = document.getElementById('zipcode').value.trim();
    const country = document.getElementById('country').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const privacy = document.getElementById('privacy').checked;

    let isValid = true;

    // Validate First Name
    if (!firstName) {
        showError('firstName', 'First name is required');
        isValid = false;
    } else if (!validateName(firstName)) {
        showError('firstName', 'First name must contain only letters and spaces');
        isValid = false;
    }

    // Validate Last Name
    if (!lastName) {
        showError('lastName', 'Last name is required');
        isValid = false;
    } else if (!validateName(lastName)) {
        showError('lastName', 'Last name must contain only letters and spaces');
        isValid = false;
    }

    // Validate Date of Birth
    if (!dateOfBirth) {
        showError('dateOfBirth', 'Date of birth is required');
        isValid = false;
    } else if (!validateDoB(dateOfBirth)) {
        showError('dateOfBirth', 'You must be at least 18 years old');
        isValid = false;
    }

    // Validate Gender
    if (!gender) {
        showError('gender', 'Please select a gender');
        isValid = false;
    }

    // Validate Email
    if (!email) {
        showError('email', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate Phone
    if (!phone) {
        showError('phone', 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(phone)) {
        showError('phone', 'Please enter a valid phone number');
        isValid = false;
    }

    // Validate Address
    if (!address) {
        showError('address', 'Address is required');
        isValid = false;
    }

    // Validate City
    if (!city) {
        showError('city', 'City is required');
        isValid = false;
    }

    // Validate State
    if (!state) {
        showError('state', 'State/Province is required');
        isValid = false;
    }

    // Validate Zipcode
    if (!zipcode) {
        showError('zipcode', 'Zip code is required');
        isValid = false;
    }

    // Validate Country
    if (!country) {
        showError('country', 'Please select a country');
        isValid = false;
    }

    // Validate Username
    if (!username) {
        showError('username', 'Username is required');
        isValid = false;
    } else if (username.length < 5 || username.length > 20) {
        showError('username', 'Username must be between 5 and 20 characters');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showError('username', 'Username can only contain letters, numbers, and underscores');
        isValid = false;
    }

    // Validate Password
    if (!password) {
        showError('password', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('password', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
        isValid = false;
    }

    // Validate Confirm Password
    if (!confirmPassword) {
        showError('confirmPassword', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }

    // Validate Terms
    if (!terms) {
        showError('terms', 'You must agree to the Terms & Conditions');
        isValid = false;
    }

    // Validate Privacy
    if (!privacy) {
        showError('privacy', 'You must agree to the Privacy Policy');
        isValid = false;
    }

    return isValid;
}

function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();

    switch(fieldName) {
        case 'firstName':
        case 'lastName':
            if (!value) {
                showError(fieldName, `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`);
            } else if (!validateName(value)) {
                showError(fieldName, `${fieldName === 'firstName' ? 'First' : 'Last'} name must contain only letters and spaces`);
            } else {
                clearError(fieldName);
            }
            break;

        case 'email':
            if (!value) {
                showError(fieldName, 'Email is required');
            } else if (!validateEmail(value)) {
                showError(fieldName, 'Please enter a valid email address');
            } else {
                clearError(fieldName);
            }
            break;

        case 'phone':
            if (!value) {
                showError(fieldName, 'Phone number is required');
            } else if (!validatePhone(value)) {
                showError(fieldName, 'Please enter a valid phone number');
            } else {
                clearError(fieldName);
            }
            break;

        case 'password':
            if (!value) {
                showError(fieldName, 'Password is required');
            } else if (!validatePassword(value)) {
                showError(fieldName, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            } else {
                clearError(fieldName);
            }
            break;

        case 'confirmPassword':
            const password = document.getElementById('password').value;
            if (!value) {
                showError(fieldName, 'Please confirm your password');
            } else if (value !== password) {
                showError(fieldName, 'Passwords do not match');
            } else {
                clearError(fieldName);
            }
            break;

        case 'username':
            if (!value) {
                showError(fieldName, 'Username is required');
            } else if (value.length < 5 || value.length > 20) {
                showError(fieldName, 'Username must be between 5 and 20 characters');
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                showError(fieldName, 'Username can only contain letters, numbers, and underscores');
            } else {
                clearError(fieldName);
            }
            break;

        default:
            if (!value && field.required) {
                showError(fieldName, `${field.labels ? field.labels[0].textContent : 'This field'} is required`);
            } else {
                clearError(fieldName);
            }
    }
}

// Regex Validators
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    // Accepts various phone formats
    return /^[\d\s\-\+\(\)]{7,}$/.test(phone) && /\d/.test(phone);
}

function validatePassword(password) {
    // At least 8 characters, uppercase, lowercase, number, special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

function validateName(name) {
    return /^[a-zA-Z\s'-]+$/.test(name);
}

function validateDoB(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age >= 18;
}

// Error/Success Display Functions
function showError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const field = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    if (field) {
        field.classList.add('invalid');
        field.classList.remove('valid');
    }
}

function clearError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const field = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    
    if (field) {
        field.classList.remove('invalid');
        field.classList.add('valid');
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const inputs = document.querySelectorAll('input, select');
    
    errorElements.forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
    
    inputs.forEach(input => {
        input.classList.remove('invalid', 'valid');
    });
}

function showSuccessMessage() {
    const form = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');
    
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Redirect to login page after 3 seconds
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 3000);
}
