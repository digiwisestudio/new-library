// Form validation for Bibliophile Hub
document.addEventListener('DOMContentLoaded', function() {
    // Initialize validation for login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        initLoginValidation(loginForm);
    }
    
    // Initialize validation for registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        initRegisterValidation(registerForm);
    }
});

// Login form validation
function initLoginValidation(form) {
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
      // Real-time email validation
    emailInput.addEventListener('input', function() {
        validateEmail(emailInput);
    });
    
    // We don't add form submission handlers here anymore
    // The auth.js module will handle form submission
    // This avoids duplicate event handlers
    
    // Just add input validation for the password field
    passwordInput.addEventListener('input', function() {
        if (passwordInput.value.trim() === '') {
            setInvalid(passwordInput, 'Password is required');
        } else {
            setValid(passwordInput);
        }
    });
}

// Registration form validation
function initRegisterValidation(form) {
    const firstNameInput = form.querySelector('#first-name');
    const lastNameInput = form.querySelector('#last-name');
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirm-password');
    
    // Real-time validation
    firstNameInput.addEventListener('input', function() {
        validateNotEmpty(firstNameInput, 'First name');
    });
    
    lastNameInput.addEventListener('input', function() {
        validateNotEmpty(lastNameInput, 'Last name');
    });
    
    emailInput.addEventListener('input', function() {
        validateEmail(emailInput);
    });
    
    passwordInput.addEventListener('input', function() {
        validatePassword(passwordInput);
        // If confirm password has value, check match
        if (confirmPasswordInput.value.trim() !== '') {
            validatePasswordMatch(passwordInput, confirmPasswordInput);
        }
    });
    
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch(passwordInput, confirmPasswordInput);
    });
    
    // Form submission validation
    form.addEventListener('submit', function(event) {
        let valid = true;
        
        // Validate required fields
        if (!validateNotEmpty(firstNameInput, 'First name')) valid = false;
        if (!validateNotEmpty(lastNameInput, 'Last name')) valid = false;
        if (!validateEmail(emailInput)) valid = false;
        if (!validatePassword(passwordInput)) valid = false;
        if (!validatePasswordMatch(passwordInput, confirmPasswordInput)) valid = false;
        
        // Prevent form submission if validation fails
        if (!valid) {
            event.preventDefault();
        }
    });
}

// Validate email format
function validateEmail(input) {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value === '') {
        setInvalid(input, 'Email is required');
        return false;
    } else if (!emailRegex.test(value)) {
        setInvalid(input, 'Please enter a valid email address');
        return false;
    } else {
        setValid(input);
        return true;
    }
}

// Validate password strength
function validatePassword(input) {
    const value = input.value;
    
    if (value === '') {
        setInvalid(input, 'Password is required');
        return false;
    } else if (value.length < 8) {
        setInvalid(input, 'Password must be at least 8 characters long');
        return false;
    }
    
    // Check password strength
    let strength = 0;
    if (/[A-Z]/.test(value)) strength++; // Has uppercase
    if (/[a-z]/.test(value)) strength++; // Has lowercase
    if (/[0-9]/.test(value)) strength++; // Has number
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strength++; // Has special char
    
    if (strength < 3) {
        setInvalid(input, 'Password should include at least 3 of: uppercase, lowercase, numbers, special characters');
        return false;
    } else {
        setValid(input);
        return true;
    }
}

// Validate passwords match
function validatePasswordMatch(passwordInput, confirmInput) {
    if (passwordInput.value !== confirmInput.value) {
        setInvalid(confirmInput, 'Passwords do not match');
        return false;
    } else {
        setValid(confirmInput);
        return true;
    }
}

// Validate field is not empty
function validateNotEmpty(input, fieldName) {
    if (input.value.trim() === '') {
        setInvalid(input, `${fieldName} is required`);
        return false;
    } else {
        setValid(input);
        return true;
    }
}

// Set input as invalid with error message
function setInvalid(input, message) {
    // Get the existing feedback element or create a new one
    let feedback = input.nextElementSibling;
    if (!feedback || !feedback.classList.contains('form-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'form-feedback';
        input.parentNode.insertBefore(feedback, input.nextSibling);
    }
    
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    feedback.textContent = message;
    feedback.style.color = '#dc3545';
    feedback.style.fontSize = '0.875rem';
    feedback.style.marginTop = '4px';
}

// Set input as valid
function setValid(input) {
    // Get the existing feedback element
    let feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('form-feedback')) {
        feedback.textContent = '';
    }
    
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}