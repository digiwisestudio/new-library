/**
 * Authentication Module for Bibliophile Hub
 * 
 * This file contains functions to handle user authentication, including:
 * - Login functionality
 * - Authentication state verification
 * - User session management
 * - Login persistence
 */

// Initialize the auth system
function initAuth() {
    console.log("Initializing authentication system...");
    
    // Load user data on page load
    loadUserData();
    
    // Set up login form if present
    setupLoginForm();
    
    // Set up registration form if present
    setupRegistrationForm();
    
    // Update UI based on login state
    updateUIForLoginState();
    
    console.log("Authentication system initialized");
}

/**
 * Set up login form and attach event listeners
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    console.log("Setting up login form...");
    
    // Remove any existing event listeners
    const newLoginForm = loginForm.cloneNode(true);
    loginForm.parentNode.replaceChild(newLoginForm, loginForm);
    
    // Add new event listener
    newLoginForm.addEventListener('submit', handleLogin);
    
    // Find password toggle if it exists
    const passwordField = document.getElementById('password');
    const passwordToggle = document.querySelector('.show-password');
    
    if (passwordField && passwordToggle) {
        passwordToggle.addEventListener('click', togglePasswordVisibility);
    }
}

/**
 * Toggle password field visibility
 */
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const passwordIcon = document.getElementById('password-toggle-icon');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        passwordIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordField.type = 'password';
        passwordIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

/**
 * Set up registration form and attach event listeners
 */
function setupRegistrationForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    console.log("Setting up registration form...");
    
    // Remove any existing event listeners
    const newRegisterForm = registerForm.cloneNode(true);
    registerForm.parentNode.replaceChild(newRegisterForm, registerForm);
    
    // Add new event listener
    newRegisterForm.addEventListener('submit', handleRegistration);
    
    // Add password confirmation validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity("Passwords don't match");
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });
    }
}

/**
 * Handle login form submission
 * @param {Event} event - The form submission event
 */
function handleLogin(event) {
    event.preventDefault();
    
    console.log("Processing login...");
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const rememberMe = document.getElementById('remember')?.checked || false;
    
    // Update UI to show loading state
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    }
    
    // Simple validation
    if (!email || !password) {
        showLoginMessage('Please enter both email and password.', 'error');
        resetLoginButton();
        return;
    }
    
    // Get stored users from localStorage
    let users = JSON.parse(localStorage.getItem('libraryUsers')) || [];
    
    // Find user with matching email
    const user = users.find(u => u.email === email);
    
    // Check if user exists and password matches
    if (!user) {
        showLoginMessage('User does not exist. Please check your email or create an account.', 'error');
        resetLoginButton();
        return;
    }
    
    if (user.password !== password) {
        showLoginMessage('Incorrect password. Please try again.', 'error');
        resetLoginButton();
        return;
    }
    
    // Set user session
    userData.isLoggedIn = true;
    userData.userName = user.firstName;
    userData.isDonor = user.membership !== 'free';
    userData.email = user.email;
    userData.membership = user.membership;
    
    // Update reading stats for streak calculation
    if (!userData.readingStats) {
        userData.readingStats = {
            booksDownloaded: 0,
            notesSaved: 0,
            quotesSaved: 0,
            readingStreak: 1,
            lastActive: new Date().toISOString()
        };
    } else {
        // Call updateReadingStreak to handle streak calculation
        updateReadingStreak();
    }
    
    // Save the updated user data to localStorage
    saveUserData();
    console.log("Login successful - User data saved:", userData);
    
    // Check if there's a redirect parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect');
    
    // Show success message
    showLoginMessage('Login Successful! Redirecting...', 'success');
    
    // Redirect to appropriate page after short delay
    setTimeout(function() {
        if (redirectTo) {
            window.location.href = redirectTo + '.html';
        } else {
            window.location.href = 'member-portal.html';
        }
    }, 1500);
}

/**
 * Handle registration form submission
 * @param {Event} event - The form submission event
 */
function handleRegistration(event) {
    event.preventDefault();
    
    console.log("Processing registration...");
    
    // Get form values
    const firstName = document.getElementById('first-name')?.value.trim();
    const lastName = document.getElementById('last-name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const confirmPassword = document.getElementById('confirm-password')?.value.trim();
    const membership = document.querySelector('input[name="membership"]:checked')?.value || 'free';
    
    // Update UI to show loading state
    const registerButton = document.getElementById('register-button');
    if (registerButton) {
        registerButton.disabled = true;
        registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    }
    
    // Simple validation
    if (!firstName || !lastName || !email || !password) {
        showRegistrationMessage('Please fill in all required fields.', 'error');
        resetRegisterButton();
        return;
    }
    
    // Check passwords match
    if (password !== confirmPassword) {
        showRegistrationMessage('Passwords do not match.', 'error');
        resetRegisterButton();
        return;
    }
    
    // Get stored users from localStorage
    let users = JSON.parse(localStorage.getItem('libraryUsers')) || [];
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        showRegistrationMessage('An account with this email already exists.', 'error');
        resetRegisterButton();
        return;
    }
    
    // Create new user object
    const newUser = {
        firstName,
        lastName,
        email,
        password,
        membership,
        registrationDate: new Date().toISOString()
    };
    
    // Add new user to users array
    users.push(newUser);
    localStorage.setItem('libraryUsers', JSON.stringify(users));
    
    // Set up user session
    userData.isLoggedIn = true;
    userData.userName = firstName;
    userData.isDonor = membership !== 'free';
    userData.email = email;
    userData.membership = membership;
    
    // Initialize reading stats
    userData.readingStats = {
        booksDownloaded: 0,
        notesSaved: 0,
        quotesSaved: 0,
        readingStreak: 1,
        lastActive: new Date().toISOString()
    };
    
    // Initialize other user data properties
    userData.notes = [];
    userData.readingList = [];
    userData.favoriteQuotes = [];
    userData.journalEntries = [];
    
    // Save the updated user data to localStorage
    saveUserData();
    console.log("Registration successful - User data saved:", userData);
    
    // Show success message and redirect to member portal
    showRegistrationMessage('Account created successfully! Redirecting...', 'success');
    
    // Redirect after short delay
    setTimeout(() => {
        window.location.href = 'member-portal.html';
    }, 1500);
}

/**
 * Save user data to localStorage
 * @returns {boolean} - Whether the save was successful
 */
function saveUserData() {
    try {
        // Ensure userData exists and has required properties
        if (!userData) {
            userData = {
                isLoggedIn: false,
                userName: '',
                isDonor: false,
                email: '',
                membership: 'free'
            };
        }
        
        // Save to localStorage
        localStorage.setItem('libraryUserData', JSON.stringify(userData));
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        return false;
    }
}

/**
 * Load user data from localStorage
 */
function loadUserData() {
    try {
        // Ensure userData is defined - if not, check global scope or create it
        if (typeof userData === 'undefined') {
            // Check if it's defined in the global scope
            if (typeof window.userData === 'undefined') {
                console.warn('userData not defined, creating default structure');
                // Create the userData object if it doesn't exist at all
                window.userData = {
                    isLoggedIn: false,
                    isDonor: false,
                    userName: "",
                    email: "",
                    membership: "free",
                    notes: [],
                    readingList: [],
                    favoriteQuotes: [],
                    journalEntries: [],
                    downloadedBooks: [],
                    reminders: [],
                    portalPreferences: {
                        theme: "light",
                        avatar: "default",
                        notifications: true
                    },
                    readingStats: {
                        booksDownloaded: 0,
                        notesSaved: 0,
                        quotesSaved: 0,
                        readingStreak: 0,
                        lastActive: null
                    }
                };
                // Make it available in the current scope
                userData = window.userData;
            } else {
                // Use the global userData
                userData = window.userData;
            }
        }
        
        const storedUserData = localStorage.getItem('libraryUserData');
        
        if (storedUserData) {
            // Merge stored data with userData object
            Object.assign(userData, JSON.parse(storedUserData));
            
            // Check and update reading streak
            if (userData.readingStats && userData.readingStats.lastActive) {
                updateReadingStreak();
            }
            
            console.log("User data loaded from localStorage:", userData.isLoggedIn ? "LOGGED IN" : "NOT LOGGED IN");
        } else {
            console.log("No user data found in localStorage");
            // Initialize userData with default values
            userData.isLoggedIn = false;
            userData.isDonor = false;
            userData.userName = "";
            userData.email = "";
            userData.membership = "free";
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

/**
 * Check if user is logged in
 * @returns {boolean} - Whether the user is logged in
 */
function isUserLoggedIn() {
    // Check if userData is completely undefined
    if (typeof userData === 'undefined') {
        // Try to load user data first
        loadUserData();
        // If still undefined, return false
        if (typeof userData === 'undefined') {
            console.error('userData is still undefined after loadUserData attempt');
            return false;
        }
    }
    
    // If userData doesn't exist or isLoggedIn is undefined, try to load from localStorage
    if (!userData || typeof userData.isLoggedIn === 'undefined') {
        try {
            const storedData = localStorage.getItem('libraryUserData');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                if (parsedData && parsedData.isLoggedIn) {
                    // Recover login state from localStorage
                    Object.assign(userData, parsedData);
                    return true;
                }
            }
        } catch (error) {
            console.error('Error checking login state:', error);
        }
        
        return false;
    }
    
    return userData.isLoggedIn;
}

/**
 * Check if user is a donor/premium member
 * @returns {boolean} - Whether the user is a donor
 */
function isUserDonor() {
    // Check if userData is completely undefined
    if (typeof userData === 'undefined') {
        // Try to load user data first
        loadUserData();
        // If still undefined, return false
        if (typeof userData === 'undefined') {
            return false;
        }
    }
    
    if (!userData || typeof userData.isDonor === 'undefined') {
        return false;
    }
    return userData.isDonor;
}

/**
 * Update UI elements based on login state
 */
function updateUIForLoginState() {
    // Update navigation links
    const loginLink = document.querySelector('.login-btn');
    const membershipBtn = document.querySelector('.membership-btn');
    const userWelcome = document.getElementById('user-welcome');
    
    if (isUserLoggedIn()) {
        // User is logged in
        if (loginLink) {
            loginLink.textContent = 'My Account';
            loginLink.href = 'member-portal.html';
        }
        
        if (membershipBtn) {
            membershipBtn.textContent = 'Logout';
            membershipBtn.href = '#';
            membershipBtn.addEventListener('click', handleLogout);
        }
        
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${userData.userName}!`;
            userWelcome.style.display = 'block';
        }
    } else {
        // User is not logged in
        if (loginLink) {
            loginLink.textContent = 'Login';
            loginLink.href = 'login.html';
        }
        
        if (membershipBtn) {
            membershipBtn.textContent = 'Join Now';
            membershipBtn.href = 'register.html';
            
            // Remove logout event listener if present
            const newMembershipBtn = membershipBtn.cloneNode(true);
            membershipBtn.parentNode.replaceChild(newMembershipBtn, membershipBtn);
        }
        
        if (userWelcome) {
            userWelcome.style.display = 'none';
        }
    }
}

/**
 * Handle user logout
 * @param {Event} event - The click event
 */
function handleLogout(event) {
    if (event) event.preventDefault();
    
    console.log("Processing logout...");
    
    // Clear user session data
    userData.isLoggedIn = false;
    
    // Keep other user data for when they log back in
    
    // Save updated state to localStorage
    saveUserData();
    
    // Show logout message
    console.log("User logged out successfully");
    
    // Redirect to home page
    window.location.href = 'index.html';
}

/**
 * Show message on login page
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('error' or 'success')
 */
function showLoginMessage(message, type) {
    const loginStatus = document.getElementById('login-status');
    if (loginStatus) {
        loginStatus.textContent = message;
        loginStatus.className = 'login-status ' + type;
    }
}

/**
 * Show message on registration page
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('error' or 'success')
 */
function showRegistrationMessage(message, type) {
    const registrationStatus = document.getElementById('registration-status');
    if (registrationStatus) {
        registrationStatus.textContent = message;
        registrationStatus.className = 'registration-status ' + type;
    }
}

/**
 * Reset login button to original state
 */
function resetLoginButton() {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Sign In';
    }
}

/**
 * Reset registration button to original state
 */
function resetRegisterButton() {
    const registerButton = document.getElementById('register-button');
    if (registerButton) {
        registerButton.disabled = false;
        registerButton.innerHTML = 'Create Account';
    }
}

// Initialize auth system on page load
document.addEventListener('DOMContentLoaded', initAuth);
