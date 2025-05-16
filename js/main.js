// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }
    
    // Book filter functionality
    initializeFilters();
    
    // Initialize book animations
    initializeBookAnimations();
    
    // Daily Quote Generator
    displayDailyQuote();
    
    // Initialize membership features if user is logged in
    if (isUserLoggedIn()) {
        initMembershipFeatures();
    }
    
    // Donation Form Handling
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonation);
    }
      
    // Book Download Buttons - Only for button elements
    const downloadButtonElements = document.querySelectorAll('button.download-btn');
    downloadButtonElements.forEach(btn => {
        btn.addEventListener('click', handleBookDownload);
    });
    
    // Handle download links with download-btn class but not already handled as buttons
    const downloadLinkElements = document.querySelectorAll('a.download-btn:not([handled])');
    downloadLinkElements.forEach(link => {
        // For link elements, we'll let the natural link behavior work
        // but we'll still track analytics
        link.addEventListener('click', handleBookDownload);
        link.setAttribute('handled', 'true');
        console.log("Added click handler to download link:", link.href);
    });
    
    // Add to Reading List Buttons
    const addToListButtons = document.querySelectorAll('.add-to-list-btn');
    addToListButtons.forEach(btn => {
        btn.addEventListener('click', function(event) {
            const bookId = event.target.getAttribute('data-id');
            const book = books.find(b => b.id === parseInt(bookId));
            if (book) {
                addBookToReadingList(book);
            }
        });
    });
});

// App Initialization
function initApp() {
    try {
        // Check if userData is defined, if not create it
        if (typeof userData === 'undefined') {
            console.warn('Creating userData in initApp because it was undefined');
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
            userData = window.userData;
        }
        
        // Load user data from localStorage
        loadUserData();
        
        // Ensure all books have download URLs (will be skipped if books is undefined)
        ensureBookDownloadURLs();
          // Update UI based on login state
        updateUIForLoginState();
    } catch (error) {
        console.error("Error during initialization:", error);
    }
    
    // Display featured books on homepage
    if (document.querySelector('.featured-books-container')) {
        displayFeaturedBooks();
    }
    
    // Initialize login form if present
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialize registration form if present
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        
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
    
    // Initialize page-specific functions
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'index':
            // Homepage specific initialization
            break;
        case 'authors':
            // Authors page initialization
            loadAuthorsPage();
            break;
        case 'topics':
            // Topics page initialization
            loadTopicsPage();
            break;
        case 'free-ebooks':
            // Free eBooks page initialization
            loadFreeEbooks();
            break;
        case 'premium-ebooks':
            // Premium eBooks page initialization
            loadPremiumEbooks();
            break;
        case 'membership':
            // Membership portal initialization
            loadMembershipPortal();
            break;
        case 'donation':
            // Donation page initialization
            loadDonationPage();
            break;
        case 'member-portal':
            // Member portal initialization
            // No need to call any function here since it's handled by member-portal.js
            break;
    }
}

// Get current page identifier from filename
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'index';
}

// Load User Data from localStorage
function loadUserData() {
    const storedUserData = localStorage.getItem('libraryUserData');
    
    if (storedUserData) {
        Object.assign(userData, JSON.parse(storedUserData));
        
        // Check reading streak
        if (userData.readingStats && userData.readingStats.lastActive) {
            updateReadingStreak();
        }
    } else {
        // Initialize userData with default values if it doesn't exist
        userData.isLoggedIn = false;
        userData.isDonor = false;
        userData.userName = "";
        userData.email = "";
        userData.membership = "free";
        userData.notes = [];
        userData.readingList = [];
        userData.favoriteQuotes = [];
        userData.journalEntries = [];
        userData.downloadedBooks = [];
        userData.reminders = [];
        userData.portalPreferences = {
            theme: "light",
            avatar: "default",
            notifications: true
        };
        userData.readingStats = {
            booksDownloaded: 0,
            notesSaved: 0,
            quotesSaved: 0,
            readingStreak: 0
        };
        
        // Save the initialized userData
        saveUserData();
    }
    
    // Initialize users array in localStorage if it doesn't exist yet
    if (!localStorage.getItem('libraryUsers')) {
        localStorage.setItem('libraryUsers', JSON.stringify([]));
    }
}

// Save User Data to localStorage
function saveUserData() {
    localStorage.setItem('libraryUserData', JSON.stringify(userData));
}

// Update reading streak based on user activity
function updateReadingStreak() {
    const lastActive = new Date(userData.readingStats.lastActive);
    const today = new Date();
    
    // Reset time portion to compare dates only
    lastActive.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const daysDifference = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 1) {
        // User returned the next day - increase streak
        userData.readingStats.readingStreak += 1;
    } else if (daysDifference > 1) {
        // User missed days - reset streak
        userData.readingStats.readingStreak = 1;
    }
    
    // Update the last active date
    userData.readingStats.lastActive = today.toISOString();
}

// Check if user is logged in
function isUserLoggedIn() {
    // Defensive check to prevent errors
    if (!userData || typeof userData.isLoggedIn === 'undefined') {
        console.warn('isUserLoggedIn called but userData or isLoggedIn property is undefined');
        return false;
    }
    return userData.isLoggedIn;
}

// Check if user is a donor
function isUserDonor() {
    // Defensive check to prevent errors
    if (!userData || typeof userData.isDonor === 'undefined') {
        console.warn('isUserDonor called but userData or isDonor property is undefined');
        return false;
    }
    return userData.isDonor;
}

// Update UI elements based on login state
function updateUIForLoginState() {
    const loginBtn = document.querySelector('.login-btn');
    const membershipBtn = document.querySelector('.membership-btn');
    const userWelcome = document.querySelector('.user-welcome');
    
    if (loginBtn && membershipBtn) {
        if (isUserLoggedIn()) {
            loginBtn.textContent = 'Logout';
            loginBtn.setAttribute('href', '#');
            loginBtn.addEventListener('click', handleLogout);
              if (isUserLoggedIn()) {
                membershipBtn.textContent = 'My Portal';
                membershipBtn.setAttribute('href', 'member-portal.html');
            } else {
                membershipBtn.textContent = 'Become a Member';
                membershipBtn.setAttribute('href', 'donation.html');
            }
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.setAttribute('href', 'login.html');
            membershipBtn.textContent = 'Join Now';
            membershipBtn.setAttribute('href', 'register.html');
        }
    }
      if (userWelcome && isUserLoggedIn()) {
        // Show user name and reading streak if available
        let welcomeText = `Welcome, ${userData.userName}!`;
        
        if (userData.readingStats && userData.readingStats.readingStreak > 0) {
            welcomeText += ` <span class="streak-badge" title="Your reading streak"><i class="fas fa-fire"></i> ${userData.readingStats.readingStreak}</span>`;
        }
        
        userWelcome.innerHTML = welcomeText;
    }
    
    // Update premium content visibility
    updatePremiumContentVisibility();
}

// Update premium content visibility based on donor status
function updatePremiumContentVisibility() {
    const premiumElements = document.querySelectorAll('.premium-only');
    const nonPremiumElements = document.querySelectorAll('.non-premium-only');
    
    if (isUserDonor()) {
        premiumElements.forEach(el => el.classList.remove('hidden'));
        nonPremiumElements.forEach(el => el.classList.add('hidden'));
    } else {
        premiumElements.forEach(el => el.classList.add('hidden'));
        nonPremiumElements.forEach(el => el.classList.remove('hidden'));
    }
}

// Initialize Book Filters
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.querySelector('.search-input');
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Filter books based on selected filter
                const filter = this.getAttribute('data-filter');
                filterBooks(filter);
            });
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            searchBooks(searchTerm);
        });
    }
}

// Filter books based on selected category
function filterBooks(filter) {
    const bookCards = document.querySelectorAll('.book-card');
    let visibleCount = 0;
    
    bookCards.forEach(card => {
        const bookTopic = card.getAttribute('data-topic');
        const bookAuthor = card.getAttribute('data-author');
        
        if (filter === 'all' || bookTopic === filter || bookAuthor === filter) {
            card.style.display = 'block';
            visibleCount++;
            
            // Re-attach event listeners to the buttons inside this card
            const downloadBtn = card.querySelector('.download-btn');
            if (downloadBtn) {
                // Remove old event listeners to avoid duplicates
                downloadBtn.replaceWith(downloadBtn.cloneNode(true));
                // Add fresh event listener
                card.querySelector('.download-btn').addEventListener('click', handleBookDownload);
            }
            
            const addToListBtn = card.querySelector('.add-to-list-btn');
            if (addToListBtn) {
                addToListBtn.replaceWith(addToListBtn.cloneNode(true));
                card.querySelector('.add-to-list-btn').addEventListener('click', function(event) {
                    const bookId = event.target.getAttribute('data-id');
                    const book = books.find(b => b.id === parseInt(bookId));
                    if (book) {
                        addBookToReadingList(book);
                    }
                });
            }
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`Filtered books: ${visibleCount} visible`);
}

// Search books based on input
function searchBooks(searchTerm) {
    const bookCards = document.querySelectorAll('.book-card');
    let visibleCount = 0;
    
    bookCards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        const author = card.getAttribute('data-author').toLowerCase();
        
        if (title.includes(searchTerm) || author.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++;
            
            // Re-attach event listeners to the buttons inside this card
            const downloadBtn = card.querySelector('.download-btn');
            if (downloadBtn) {
                // Remove old event listeners to avoid duplicates
                downloadBtn.replaceWith(downloadBtn.cloneNode(true));
                // Add fresh event listener
                card.querySelector('.download-btn').addEventListener('click', handleBookDownload);
            }
            
            const addToListBtn = card.querySelector('.add-to-list-btn');
            if (addToListBtn) {
                addToListBtn.replaceWith(addToListBtn.cloneNode(true));
                card.querySelector('.add-to-list-btn').addEventListener('click', function(event) {
                    const bookId = event.target.getAttribute('data-id');
                    const book = books.find(b => b.id === parseInt(bookId));
                    if (book) {
                        addBookToReadingList(book);
                    }
                });
            }
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`Search results: ${visibleCount} books visible`);
}

// Display featured books on homepage
function displayFeaturedBooks() {
    const featuredBooksContainer = document.querySelector('.featured-books-container');
    if (!featuredBooksContainer) return;
    
    // Check if books array is defined
    if (typeof books === 'undefined' || !books) {
        console.warn('Books array is undefined when trying to display featured books');
        featuredBooksContainer.innerHTML = '<p>Books are currently being loaded. Please refresh the page in a moment.</p>';
        return;
    }
    
    // Get a mix of premium and free books
    const featuredBooks = books
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);
    
    let booksHTML = '';
    
    featuredBooks.forEach(book => {
        booksHTML += createBookCardHTML(book);
    });
    
    featuredBooksContainer.innerHTML = booksHTML;
    
    // Attach event listeners to the download buttons
    const downloadButtons = featuredBooksContainer.querySelectorAll('.download-btn');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', handleBookDownload);
    });
    
    // Attach event listeners to add to list buttons
    const addToListButtons = featuredBooksContainer.querySelectorAll('.add-to-list-btn');
    addToListButtons.forEach(btn => {
        btn.addEventListener('click', function(event) {
            const bookId = event.target.getAttribute('data-id');
            const book = books.find(b => b.id === parseInt(bookId));
            if (book) {
                addBookToReadingList(book);
            }
        });
    });
}

// Create HTML for a book card
function createBookCardHTML(book) {
    const premiumBadge = book.isPremium ? 
        '<span class="book-badge premium-badge">Premium</span>' : 
        '<span class="book-badge">Free</span>';
    
    return `
        <div class="book-card" data-title="${book.title}" data-author="${book.author}" data-topic="${book.topic}">
            <div class="book-container">
                <div class="book">
                    <span class="shadow"></span>
                    <div class="back"></div>
                    <div class="cover-end"></div>
                    <div class="page last">
                        <button class="btn-tale download-btn" data-id="${book.id}">${book.isPremium ? 'Unlock Now' : 'Download'}</button>
                        <button class="btn-tale add-to-list-btn" data-id="${book.id}">Add to List</button>
                    </div>
                    <div class="page third"></div>
                    <div class="page second"></div>
                    <div class="page first"></div>
                    <div class="cover">
                        <img src="${book.cover}" alt="${book.title}">
                        ${premiumBadge}
                    </div>
                </div>
            </div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
            </div>
        </div>
    `;
}

// Load Authors Page
function loadAuthorsPage() {
    const authorsList = document.querySelector('.authors-list');
    const authorBooksContainer = document.querySelector('.author-books-container');
    
    if (!authorsList || !authorBooksContainer) return;
    
    // Create author filter buttons
    let authorsHTML = '<button class="filter-btn active" data-filter="all">All Authors</button>';
    
    authors.forEach(author => {
        authorsHTML += `<button class="filter-btn" data-filter="${author}">${author}</button>`;
    });
    
    authorsList.innerHTML = authorsHTML;
    
    // Display all books initially
    let booksHTML = '';
    
    books.forEach(book => {
        booksHTML += createBookCardHTML(book);
    });
    
    authorBooksContainer.innerHTML = booksHTML;
      // Add event listeners to filter buttons
    const filterButtons = authorsList.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const author = this.getAttribute('data-filter');
            if (author === 'all') {
                // Show all books
                booksHTML = '';
                books.forEach(book => {
                    booksHTML += createBookCardHTML(book);
                });
            } else {
                // Filter books by author
                const authorBooks = books.filter(book => book.author === author);
                booksHTML = '';
                authorBooks.forEach(book => {
                    booksHTML += createBookCardHTML(book);
                });
            }
            
            authorBooksContainer.innerHTML = booksHTML;
            
            // Reattach event listeners to download buttons
            const downloadButtons = authorBooksContainer.querySelectorAll('.download-btn');
            downloadButtons.forEach(btn => {
                btn.addEventListener('click', handleBookDownload);
            });
            
            // Reattach event listeners to add-to-list buttons
            const addToListButtons = authorBooksContainer.querySelectorAll('.add-to-list-btn');
            addToListButtons.forEach(btn => {
                btn.addEventListener('click', function(event) {
                    const bookId = event.target.getAttribute('data-id');
                    const book = books.find(b => b.id === parseInt(bookId));
                    if (book) {
                        addBookToReadingList(book);
                    }
                });
            });
        });
    });
}

// Load Topics Page
function loadTopicsPage() {
    const topicsList = document.querySelector('.topics-list');
    const topicBooksContainer = document.querySelector('.topic-books-container');
    
    if (!topicsList || !topicBooksContainer) return;
    
    // Create topic filter buttons
    let topicsHTML = '<button class="filter-btn active" data-filter="all">All Topics</button>';
    
    topics.forEach(topic => {
        topicsHTML += `<button class="filter-btn" data-filter="${topic}">${topic}</button>`;
    });
    
    topicsList.innerHTML = topicsHTML;
    
    // Display all books initially
    let booksHTML = '';
    
    books.forEach(book => {
        booksHTML += createBookCardHTML(book);
    });
    
    topicBooksContainer.innerHTML = booksHTML;
      // Add event listeners to filter buttons
    const filterButtons = topicsList.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const topic = this.getAttribute('data-filter');
            if (topic === 'all') {
                // Show all books
                booksHTML = '';
                books.forEach(book => {
                    booksHTML += createBookCardHTML(book);
                });
            } else {
                // Filter books by topic
                const topicBooks = books.filter(book => book.topic === topic);
                booksHTML = '';
                topicBooks.forEach(book => {
                    booksHTML += createBookCardHTML(book);
                });
            }
            
            topicBooksContainer.innerHTML = booksHTML;
            
            // Reattach event listeners to download buttons
            const downloadButtons = topicBooksContainer.querySelectorAll('.download-btn');
            downloadButtons.forEach(btn => {
                btn.addEventListener('click', handleBookDownload);
            });
            
            // Reattach event listeners to add-to-list buttons
            const addToListButtons = topicBooksContainer.querySelectorAll('.add-to-list-btn');
            addToListButtons.forEach(btn => {
                btn.addEventListener('click', function(event) {
                    const bookId = event.target.getAttribute('data-id');
                    const book = books.find(b => b.id === parseInt(bookId));
                    if (book) {
                        addBookToReadingList(book);
                    }
                });
            });
        });
    });
}

// Load Free eBooks Page
function loadFreeEbooks() {
    const freeBooksContainer = document.querySelector('.free-books-container');
    if (!freeBooksContainer) return;
    
    const freeBooks = books.filter(book => !book.isPremium);
    let booksHTML = '';
    
    freeBooks.forEach(book => {
        booksHTML += createBookCardHTML(book);
    });
    
    freeBooksContainer.innerHTML = booksHTML;
    
    // Attach event listeners to the download buttons
    const downloadButtons = freeBooksContainer.querySelectorAll('.download-btn');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', handleBookDownload);
    });
    
    // Attach event listeners to add to list buttons
    const addToListButtons = freeBooksContainer.querySelectorAll('.add-to-list-btn');
    addToListButtons.forEach(btn => {
        btn.addEventListener('click', function(event) {
            const bookId = event.target.getAttribute('data-id');
            const book = books.find(b => b.id === parseInt(bookId));
            if (book) {
                addBookToReadingList(book);
            }
        });
    });
    
    // Check if we're on a specific book page
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (bookId) {
        const book = books.find(b => b.id === parseInt(bookId));
        if (book && !book.isPremium) {
            displayBookDetails(book);
        }
    }
}

// Load Premium eBooks Page
function loadPremiumEbooks() {
    const premiumBooksContainer = document.querySelector('.premium-books-container');
    if (!premiumBooksContainer) return;
    
    const premiumBooks = books.filter(book => book.isPremium);
    let booksHTML = '';
    
    premiumBooks.forEach(book => {
        booksHTML += createBookCardHTML(book);
    });
    
    premiumBooksContainer.innerHTML = booksHTML;
    
    // Attach event listeners to the download buttons
    const downloadButtons = premiumBooksContainer.querySelectorAll('.download-btn');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', handleBookDownload);
    });
    
    // Attach event listeners to add to list buttons
    const addToListButtons = premiumBooksContainer.querySelectorAll('.add-to-list-btn');
    addToListButtons.forEach(btn => {
        btn.addEventListener('click', function(event) {
            const bookId = event.target.getAttribute('data-id');
            const book = books.find(b => b.id === parseInt(bookId));
            if (book) {
                addBookToReadingList(book);
            }
        });
    });
    
    // Check if we're on a specific book page
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (bookId) {
        const book = books.find(b => b.id === parseInt(bookId));
        if (book && book.isPremium) {
            displayBookDetails(book);
        }
    }
    
    // Show different content based on donor status
    const premiumContent = document.querySelector('.premium-content');
    const nonPremiumContent = document.querySelector('.non-premium-content');
    
    if (premiumContent && nonPremiumContent) {
        if (isUserDonor()) {
            premiumContent.classList.remove('hidden');
            nonPremiumContent.classList.add('hidden');
        } else {
            premiumContent.classList.add('hidden');
            nonPremiumContent.classList.remove('hidden');
        }
    }
}

// Display Book Details
function displayBookDetails(book) {
    const bookDetailsContainer = document.querySelector('.book-details-container');
    if (!bookDetailsContainer) return;
    
    const downloadButton = book.isPremium && !isUserDonor() ?        `<button class="btn-tale">Donate to Unlock</button>` :
        `<button class="btn-tale download-btn" data-id="${book.id}">Download</button>`;
    
    const bookDetailsHTML = `
        <div class="book-details">
            <div class="book-animation">
                <div class="book-container">
                    <div class="book">
                        <span class="shadow"></span>
                        <div class="back"></div>
                        <div class="cover-end"></div>
                        <div class="page last">
                            ${downloadButton}
                        </div>
                        <div class="page third"></div>
                        <div class="page second"></div>
                        <div class="page first"></div>
                        <div class="cover">
                            <img src="${book.cover}" alt="${book.title}">
                            <span class="book-badge ${book.isPremium ? 'premium-badge' : ''}">
                                ${book.isPremium ? 'Premium' : 'Free'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="book-details-info">
                <h2>${book.title}</h2>
                <p class="book-author-large">by ${book.author}</p>
                <p class="book-description">${book.description}</p>
                <div class="book-meta">
                    <span class="book-meta-item">Topic: ${book.topic}</span>
                    <span class="book-meta-item">ISBN: ${book.isbn}</span>
                </div>
                <p class="book-instructions">Hover over the book and click the button inside to download.</p>
            </div>
        </div>
    `;
    
    bookDetailsContainer.innerHTML = bookDetailsHTML;
    bookDetailsContainer.style.display = "block";
    
    // Add event listener to download button
    const downloadBtn = bookDetailsContainer.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', handleBookDownload);
    }
    
    // Add event listener to donate button for premium content
    const donateBtn = bookDetailsContainer.querySelector('.btn-tale:not(.download-btn)');
    if (donateBtn) {
        donateBtn.addEventListener('click', function() {
            window.location.href = 'donation.html';
        });
    }
}

// Handle Book Download
function handleBookDownload(event) {
    // Skip normal handling if this is an <a> tag with href (direct download)
    if (event.target.tagName === 'A' && event.target.href) {
        console.log("Direct download link clicked:", event.target.href);
        // We still want to count downloads but don't need to create another link
        // Just update the analytics after a successful download
        setTimeout(() => {
            const bookId = event.target.getAttribute('data-id');
            const book = books.find(b => b.id === parseInt(bookId));
            if (book) {
                updateDownloadStats(book);
                console.log(`Download started for book: ${book.title}`);
            }
        }, 1000);
        // Allow the default link behavior to proceed
        return;
    }
    
    // Regular button handling follows
    const bookId = event.target.getAttribute('data-id');
    const book = books.find(b => b.id === parseInt(bookId));
    
    if (!book) return;
    
    if (book.isPremium && !isUserDonor()) {
        window.location.href = 'donation.html';
        return;
    }
      // Save original button text
    const originalText = event.target.textContent;
    
    // Check if this is a re-download from download history
    const isRedownload = event.target.getAttribute('data-redownload') === 'true';
    
    // Show download progress
    event.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    event.target.disabled = true;
    
    // Simulate download process with a slight delay (shorter for re-downloads)
    setTimeout(() => {
        // Use the downloadUrl property if available, otherwise fallback to cover image
        const link = document.createElement('a');
        
        // Check if downloadUrl exists, otherwise fallback to cover image
        link.href = book.downloadUrl || book.cover;
        link.download = `${book.title}.epub`;
          // Append to body, trigger click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update user statistics
        updateDownloadStats(book);
        if (isUserLoggedIn()) {
            // Check if this is a re-download from download history
            const isRedownload = event.target.getAttribute('data-redownload') === 'true';
            
            if (!isRedownload) {
                // Only increment download count for new downloads, not re-downloads
                userData.readingStats.booksDownloaded += 1;
            }
            
            // Initialize downloadedBooks array if it doesn't exist
            if (!userData.downloadedBooks) {
                userData.downloadedBooks = [];
            }
            
            // Check if book is already in download history
            const downloadIndex = userData.downloadedBooks.findIndex(
                downloaded => downloaded.id === book.id
            );
            
            if (downloadIndex === -1) {
                // If not already in history, add it
                userData.downloadedBooks.push({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    cover: book.cover,
                    isPremium: book.isPremium,
                    downloadedAt: new Date().toISOString()
                });
            } else if (isRedownload) {
                // If it's a re-download, update the timestamp
                userData.downloadedBooks[downloadIndex].downloadedAt = new Date().toISOString();
                
                // Move it to the top of the list (most recent)
                const redownloadedBook = userData.downloadedBooks.splice(downloadIndex, 1)[0];
                userData.downloadedBooks.unshift(redownloadedBook);
            }
            
            saveUserData();
            
            // Show appropriate notification based on whether it's a re-download
            if (isRedownload) {
                showNotification(`"${book.title}" has been re-downloaded successfully.`);
            } else {
                showNotification(`"${book.title}" has been downloaded successfully.`);
            }
        }
          // Change the button text to indicate success
        event.target.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
        
        // Reset button after a delay
        setTimeout(() => {
            event.target.innerHTML = originalText;
            event.target.disabled = false;
            
            // If this was a re-download from history in the member portal, refresh the download list
            if (event.target.getAttribute('data-redownload') === 'true' && 
                window.location.pathname.includes('member-portal')) {
                // Check if loadDownloadedBooks function exists (defined in member-portal.js)
                if (typeof loadDownloadedBooks === 'function') {
                    loadDownloadedBooks();
                }
            }
        }, 3000);
    }, isRedownload ? 800 : 1500); // Faster download time for re-downloads
}

// Ensure all books have download URLs
function ensureBookDownloadURLs() {
    // Check if books array exists before trying to use it
    if (typeof books === 'undefined' || !books) {
        console.warn('Books array is not defined when attempting to ensure download URLs');
        return;
    }
    
    books.forEach(book => {
        // If book doesn't have a downloadUrl, create one based on the book title
        if (!book.downloadUrl) {
            // Create a URL-friendly version of the title
            const titleSlug = book.title
                .toLowerCase()
                .replace(/[^\w\s]/gi, '') // Remove special characters
                .replace(/\s+/g, '-');    // Replace spaces with hyphens
                
            // Set the downloadUrl
            book.downloadUrl = `https://bibliophilehub.com/downloads/${titleSlug}.epub`;
        }
    });
}

// Load Membership Portal
function loadMembershipPortal() {
    if (!isUserLoggedIn() || !isUserDonor()) {
        window.location.href = 'donation.html';
        return;
    }
    
    // Load user welcome message
    const userGreeting = document.querySelector('.user-greeting');
    if (userGreeting) {
        userGreeting.textContent = userData.userName;
    }
    
    // Load reading statistics
    displayUserStats();
    
    // Display daily quote
    displayDailyQuote();
    
    // Load notes
    loadUserNotes();
    
    // Load reading list
    loadReadingList();
    
    // Load favorite quotes
    loadFavoriteQuotes();
    
    // Initialize note editor
    initializeNoteEditor();
    
    // Initialize reading list form
    initializeReadingListForm();
}

// Display User Statistics
function displayUserStats() {
    const statsContainer = document.querySelector('.reading-stats');
    if (!statsContainer) return;
    
    const { booksDownloaded, notesSaved, quotesSaved, readingStreak } = userData.readingStats;
    
    const statsHTML = `
        <div class="stats-item">
            <span class="stats-number">${booksDownloaded}</span>
            <span class="stats-label">Books Downloaded</span>
        </div>
        <div class="stats-item">
            <span class="stats-number">${notesSaved}</span>
            <span class="stats-label">Notes Saved</span>
        </div>
        <div class="stats-item">
            <span class="stats-number">${quotesSaved}</span>
            <span class="stats-label">Quotes Saved</span>
        </div>
        <div class="stats-item">
            <span class="stats-number">${readingStreak}</span>
            <span class="stats-label">Day Streak</span>
        </div>
    `;
    
    statsContainer.innerHTML = statsHTML;
}

// Initialize book animations
function initializeBookAnimations() {
    // Featured book animation for homepage
    const featuredBookContainer = document.querySelector('.featured-book');
    
    if (featuredBookContainer) {
        // If the featured-book element already has content (like in hero section)
        if (featuredBookContainer.querySelector('.book')) {
            console.log("Hero book animation found");
            
            // Find any download links with btn-tale class but missing download-btn class
            // This is for backwards compatibility with existing links
            const downloadLinks = featuredBookContainer.querySelectorAll('a.btn-tale');
            downloadLinks.forEach(link => {
                // Ensure the link has the download-btn class for styling consistency
                if (!link.classList.contains('download-btn')) {
                    link.classList.add('download-btn');
                }
                
                // Make sure the download attribute is present
                if (!link.hasAttribute('download')) {
                    link.setAttribute('download', 'book.epub');
                }
                
                console.log("Found download link in hero section:", link.href);
            });
        } else {
            // If it's an empty container, populate it with the first book from data.js
            const bookHTML = `
                <div class="book-container">
                    <div class="book">
                        <span class="shadow"></span>
                        <div class="back"></div>
                        <div class="cover-end"></div>
                        <div class="page last">
                            <a href="${books[0].downloadUrl}" download="${books[0].title}.epub" class="btn-tale download-btn" data-id="${books[0].id}">Download</a>
                        </div>
                        <div class="page third"></div>
                        <div class="page second"></div>
                        <div class="page first"></div>
                        <div class="cover">
                            <img src="${books[0].cover}" alt="${books[0].title}">
                        </div>
                    </div>
                </div>
            `;
            
            featuredBookContainer.innerHTML = bookHTML;
            
            // Add event listener to the download button
            const downloadBtn = featuredBookContainer.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', handleBookDownload);
            }
        }
    }
}

// Display daily quote
function displayDailyQuote() {
    const quoteContainer = document.querySelector('.daily-quote');
    if (!quoteContainer) return;
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * bookQuotes.length);
    const quote = bookQuotes[randomIndex];
    
    const quoteHTML = `
        <blockquote>
            <p>"${quote.quote}"</p>
            <footer>— ${quote.author}, <cite>${quote.book}</cite></footer>
        </blockquote>
        <button class="btn-save-quote" data-index="${randomIndex}">
            <i class="fas fa-heart"></i> Save Quote
        </button>
    `;
    
    quoteContainer.innerHTML = quoteHTML;
    
    // Add event listener to save quote button
    const saveQuoteBtn = quoteContainer.querySelector('.btn-save-quote');
    if (saveQuoteBtn) {
        saveQuoteBtn.addEventListener('click', function() {
            const quoteIndex = parseInt(this.getAttribute('data-index'));
            saveQuote(quoteIndex);
        });
    }
}

// Save a quote to user's favorites
function saveQuote(index) {
    if (!isUserLoggedIn() || !isUserDonor()) {
        showModal('Membership Required', 'Please become a member to save quotes.');
        return;
    }
    
    const quote = bookQuotes[index];
    
    // Check if quote is already saved
    const alreadySaved = userData.favoriteQuotes.some(q => 
        q.quote === quote.quote && q.author === quote.author
    );
    
    if (alreadySaved) {
        showModal('Already Saved', 'This quote is already in your favorites.');
        return;
    }
    
    // Add to favorites
    userData.favoriteQuotes.push(quote);
    userData.readingStats.quotesSaved += 1;
    saveUserData();
    
    showModal('Quote Saved', 'Quote added to your favorites!');
    
    // Update stats display if on membership page
    displayUserStats();
    loadFavoriteQuotes();
}

// Load user's favorite quotes
function loadFavoriteQuotes() {
    const favoritesContainer = document.querySelector('.favorite-quotes');
    if (!favoritesContainer) return;
    
    if (userData.favoriteQuotes.length === 0) {
        favoritesContainer.innerHTML = '<p>No favorite quotes yet. Save some quotes to see them here!</p>';
        return;
    }
    
    let quotesHTML = '';
    
    userData.favoriteQuotes.forEach((quote, index) => {
        quotesHTML += `
            <div class="quote-card">
                <blockquote>
                    <p>"${quote.quote}"</p>
                    <footer>— ${quote.author}, <cite>${quote.book}</cite></footer>
                </blockquote>
                <button class="btn-remove-quote" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    favoritesContainer.innerHTML = quotesHTML;
    
    // Add event listeners to remove buttons
    const removeButtons = favoritesContainer.querySelectorAll('.btn-remove-quote');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeQuote(index);
        });
    });
}

// Remove a quote from favorites
function removeQuote(index) {
    userData.favoriteQuotes.splice(index, 1);
    userData.readingStats.quotesSaved = userData.favoriteQuotes.length;
    saveUserData();
    
    loadFavoriteQuotes();
    displayUserStats();
}

// Initialize note editor
function initializeNoteEditor() {
    const noteForm = document.querySelector('.note-form');
    if (!noteForm) return;
    
    noteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const noteEditor = this.querySelector('.note-editor');
        const noteText = noteEditor.value.trim();
        
        if (!noteText) {
            showModal('Empty Note', 'Please enter some text for your note.');
            return;
        }
        
        saveNote(noteText);
        noteEditor.value = '';
    });
}

// Save a note
function saveNote(text) {
    const date = new Date();
    const noteId = date.getTime();
    
    const newNote = {
        id: noteId,
        text: text,
        date: date.toISOString()
    };
    
    userData.notes.unshift(newNote);
    userData.readingStats.notesSaved += 1;
    saveUserData();
    
    loadUserNotes();
    displayUserStats();
    
    showModal('Note Saved', 'Your note has been saved successfully!');
}

// Load user's notes
function loadUserNotes() {
    const notesContainer = document.querySelector('.notes-list');
    if (!notesContainer) return;
    
    if (userData.notes.length === 0) {
        notesContainer.innerHTML = '<p>No notes yet. Use the editor above to create your first note!</p>';
        return;
    }
    
    let notesHTML = '';
    
    userData.notes.forEach(note => {
        const date = new Date(note.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        notesHTML += `
            <div class="note-card">
                <div class="note-date">${formattedDate}</div>
                <div class="note-content">${note.text}</div>
                <button class="btn-delete-note" data-id="${note.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    notesContainer.innerHTML = notesHTML;
    
    // Add event listeners to delete buttons
    const deleteButtons = notesContainer.querySelectorAll('.btn-delete-note');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const noteId = parseInt(this.getAttribute('data-id'));
            deleteNote(noteId);
        });
    });
}

// Delete a note
function deleteNote(id) {
    const noteIndex = userData.notes.findIndex(note => note.id === id);
    
    if (noteIndex !== -1) {
        userData.notes.splice(noteIndex, 1);
        userData.readingStats.notesSaved = userData.notes.length;
        saveUserData();
        
        loadUserNotes();
        displayUserStats();
    }
}

// Initialize reading list form
function initializeReadingListForm() {
    const readingForm = document.querySelector('.reading-list-form');
    if (!readingForm) return;
    
    readingForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const titleInput = this.querySelector('#book-title');
        const authorInput = this.querySelector('#book-author');
        const reminderDateInput = this.querySelector('#reminder-date');
        
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const reminderDate = reminderDateInput.value;
        
        if (!title) {
            showModal('Missing Information', 'Please enter a book title.');
            return;
        }
        
        addToReadingList(title, author, reminderDate);
        
        titleInput.value = '';
        authorInput.value = '';
        reminderDateInput.value = '';
    });
}

// Add a book to reading list
function addToReadingList(title, author, reminderDate) {
    const bookId = Date.now();
    
    const newBook = {
        id: bookId,
        title: title,
        author: author || 'Unknown',
        reminderDate: reminderDate || null,
        completed: false,
        dateAdded: new Date().toISOString()
    };
    
    userData.readingList.push(newBook);
    saveUserData();
    
    loadReadingList();
    
    showModal('Book Added', `"${title}" has been added to your reading list.`);
}

// Add Book to Reading List
function addBookToReadingList(book) {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        showModal('Login Required', 'Please log in to add books to your reading list.', function() {
            window.location.href = 'login.html';
        });
        return;
    }
    
    // Initialize reading list if it doesn't exist
    if (!userData.readingList) {
        userData.readingList = [];
    }
    
    // Check if book is already in the reading list
    const isInList = userData.readingList.some(item => item.id === book.id);
    
    if (isInList) {
        showModal('Already in List', 'This book is already in your reading list.');
        return;
    }
    
    // Add book to reading list
    userData.readingList.push({
        id: book.id,
        title: book.title,
        author: book.author,
        cover: book.cover,
        isPremium: book.isPremium,
        addedAt: new Date().toISOString()
    });
    
    // Save user data
    saveUserData();
    
    // Show confirmation
    showModal('Success', 'Book added to your reading list.', function() {
        // If on member portal, reload the reading list
        if (getCurrentPage() === 'member-portal') {
            loadReadingList();
        }
    });
}

// Load reading list
function loadReadingList() {
    const listContainer = document.querySelector('.reading-list');
    if (!listContainer) return;
    
    if (userData.readingList.length === 0) {
        listContainer.innerHTML = '<p>Your reading list is empty. Add books you plan to read!</p>';
        return;
    }
    
    let listHTML = '';
    
    userData.readingList.forEach(book => {
        const reminderText = book.reminderDate ? 
            `<span class="reading-reminder">Reminder: ${book.reminderDate}</span>` : '';
        
        const completedClass = book.completed ? 'completed' : '';
        
        listHTML += `
            <div class="reading-list-item ${completedClass}">
                <div class="reading-item-info">
                    <span class="reading-item-title">${book.title}</span>
                    <span class="reading-item-author">by ${book.author}</span>
                    ${reminderText}
                </div>
                <div class="reading-item-controls">
                    <button class="btn-toggle-status" data-id="${book.id}" title="${book.completed ? 'Mark as Unread' : 'Mark as Read'}">
                        <i class="fas fa-${book.completed ? 'times' : 'check'}"></i>
                    </button>
                    <button class="btn-remove-book" data-id="${book.id}" title="Remove from List">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = listHTML;
    
    // Add event listeners
    const toggleButtons = listContainer.querySelectorAll('.btn-toggle-status');
    const removeButtons = listContainer.querySelectorAll('.btn-remove-book');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            toggleBookStatus(bookId);
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            removeFromReadingList(bookId);
        });
    });
}

// Toggle book read status
function toggleBookStatus(id) {
    const bookIndex = userData.readingList.findIndex(book => book.id === id);
    
    if (bookIndex !== -1) {
        userData.readingList[bookIndex].completed = !userData.readingList[bookIndex].completed;
        saveUserData();
        loadReadingList();
    }
}

// Remove book from reading list
function removeFromReadingList(id) {
    const bookIndex = userData.readingList.findIndex(book => book.id === id);
    
    if (bookIndex !== -1) {
        userData.readingList.splice(bookIndex, 1);
        saveUserData();
        loadReadingList();
    }
}

// Handle donation form submission
function handleDonation(event) {
    event.preventDefault();
    
    const amountInput = document.querySelector('#donation-amount');
    const emailInput = document.querySelector('#donation-email');
    
    if (!amountInput || !emailInput) return;
    
    const amount = amountInput.value;
    const email = emailInput.value;
    
    if (!amount || !email) {
        showModal('Missing Information', 'Please fill in all required fields.');
        return;
    }
    
    // In a real app, this would process the payment
    // For demo, we'll simulate successful donation
    simulateDonationProcess(amount, email);
}

// Simulate donation processing
function simulateDonationProcess(amount, email) {
    showModal('Processing...', 'Please wait while we process your donation...');
    
    // Simulate processing delay
    setTimeout(() => {
        // Update user status to donor
        userData.isDonor = true;
        userData.isLoggedIn = true; // Automatically log in
        
        // If no username, use email as username
        if (!userData.userName) {
            userData.userName = email.split('@')[0];
        }
        
        // Initialize reading streak
        const today = new Date();
        userData.readingStats.lastActive = today.toISOString();
        userData.readingStats.readingStreak = 1;
        
        // Save updated user data
        saveUserData();
          // Show success message and redirect to member portal
        showModal('Thank You!', `Your donation of $${amount} has been processed. You now have access to all premium content!`, function() {
            window.location.href = 'member-portal.html';
        });
    }, 2000);
}

// Handle logout
function handleLogout(event) {
    event.preventDefault();
    
    userData.isLoggedIn = false;
    saveUserData();
    
    showModal('Logged Out', 'You have been successfully logged out.', function() {
        window.location.href = 'index.html';
    });
}

// Show a modal with message
function showModal(title, message, callback) {
    const modalContainer = document.querySelector('.modal-container');
    
    // If modal container doesn't exist, create it
    if (!modalContainer) {
        const newModalContainer = document.createElement('div');
        newModalContainer.className = 'modal-container';
        document.body.appendChild(newModalContainer);
        
        // Add modal styles if not in CSS
        const modalStyles = `
            .modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            .modal-header {
                margin-bottom: 20px;
            }
            .modal-footer {
                margin-top: 30px;
                text-align: right;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = modalStyles;
        document.head.appendChild(style);
        
        createModal(newModalContainer, title, message, callback);
    } else {
        createModal(modalContainer, title, message, callback);
    }
}

// Create modal content
function createModal(container, title, message, callback) {
    container.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-content">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn modal-close">OK</button>
            </div>
        </div>
    `;
    
    const closeButton = container.querySelector('.modal-close');
    closeButton.addEventListener('click', function() {
        container.remove();
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

// Show notification (simple version for use outside of member portal)
function showNotification(message) {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    // Create if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add notification styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 10px;
                }
                .notification {
                    background-color: var(--primary, #8B7D6B);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
                    transition: all 0.3s;
                    opacity: 0;
                    transform: translateX(50px);
                    max-width: 350px;
                    font-size: 0.95rem;
                    border-left: 4px solid var(--accent, #A67B5B);
                    display: flex;
                    align-items: center;
                }
                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }
                .notification i {
                    margin-right: 10px;
                    font-size: 1.2rem;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Add icon
    const icon = document.createElement('i');
    icon.className = 'fas fa-book';
    notification.appendChild(icon);
    
    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    notification.appendChild(messageSpan);
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300); // Wait for fade-out animation to complete
    }, 5000);
}

// Initialize membership features
function initMembershipFeatures() {
    // Update reading streak
    updateReadingStreak();
    
    // Initialize theme switcher if available
    initThemeSwitcher();
}

// Update reading streak
function updateReadingStreak() {
    if (!userData.readingStats.lastActive) return;
    
    const today = new Date();
    const lastActive = new Date(userData.readingStats.lastActive);
    
    // Reset day to midnight for comparison
    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // Already visited today, do nothing
    } else if (diffDays === 1) {
        // Consecutive day, increment streak
        userData.readingStats.readingStreak += 1;
    } else {
        // Streak broken
        userData.readingStats.readingStreak = 1;
    }
    
    // Update last active date
    userData.readingStats.lastActive = new Date().toISOString();
    saveUserData();
}

// Initialize theme switcher
function initThemeSwitcher() {
    const themeSwitcher = document.querySelector('.theme-switcher');
    if (!themeSwitcher) return;
    
    const themeOptions = themeSwitcher.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
            
            // Update active class
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Set theme
function setTheme(theme) {
    const root = document.documentElement;
    
    switch (theme) {
        case 'light':
            root.style.setProperty('--primary', '#8B7D6B');
            root.style.setProperty('--secondary', '#D2B48C');
            root.style.setProperty('--accent', '#A67B5B');
            root.style.setProperty('--light', '#FFFAF0');
            root.style.setProperty('--dark', '#4A4031');
            break;
        case 'dark':
            root.style.setProperty('--primary', '#6B594A');
            root.style.setProperty('--secondary', '#A67B5B');
            root.style.setProperty('--accent', '#D2B48C');
            root.style.setProperty('--light', '#2E2E2E');
            root.style.setProperty('--dark', '#F5F5DC');
            document.body.style.backgroundColor = '#1E1E1E';
            break;
        case 'cozy':
            root.style.setProperty('--primary', '#9B8579');
            root.style.setProperty('--secondary', '#E6CCB3');
            root.style.setProperty('--accent', '#C8A98D');
            root.style.setProperty('--light', '#FFF8E7');
            root.style.setProperty('--dark', '#5A4A41');
            break;
    }
}

// Validate password strength
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
        return {
            valid: false,
            message: 'Password must be at least 8 characters long.'
        };
    }
    
    // Count the requirements met
    let requirementsMet = 0;
    if (hasUpperCase) requirementsMet++;
    if (hasLowerCase) requirementsMet++;
    if (hasNumbers) requirementsMet++;
    if (hasSpecialChars) requirementsMet++;
    
    // Need to meet at least 3 out of 4 requirements for a strong password
    if (requirementsMet < 3) {
        return {
            valid: false,
            message: 'Password must include at least 3 of the following: uppercase letters, lowercase letters, numbers, and special characters.'
        };
    }
    
    return { valid: true };
}

// User Login Handler
function handleLogin(event) {
    event.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const rememberMe = document.getElementById('remember')?.checked || false;
      // Simple validation
    if (!email || !password) {
        showModal('Login Error', 'Please enter both email and password.');
        return;
    }
    
    // Get stored users from localStorage
    let users = JSON.parse(localStorage.getItem('libraryUsers')) || [];
    
    // Find user with matching email
    const user = users.find(u => u.email === email);
    
    // Check if user exists and password matches
    if (!user) {
        showModal('Login Error', 'User does not exist. Please check your email or create an account.');
        return;
    }
    
    if (user.password !== password) {
        showModal('Login Error', 'Incorrect password. Please try again.');
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
      // Check if there's a redirect parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect');
    
    // Show success message and redirect to appropriate page
    showModal('Login Successful', 'Welcome back, ' + user.firstName + '!', function() {
        if (redirectTo) {
            window.location.href = redirectTo + '.html';
        } else {
            window.location.href = 'member-portal.html';
        }
    });
}

// User Registration Handler
function handleRegistration(event) {
    event.preventDefault();
    
    // Get form values
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    
    // Get selected membership type
    const membershipOptions = document.querySelectorAll('input[name="membership"]');
    let membership = 'free';
    
    for (const option of membershipOptions) {
        if (option.checked) {
            membership = option.value;
            break;
        }
    }
    
    // Validate form inputs
    if (!firstName || !lastName || !email || !password) {
        showModal('Registration Error', 'Please fill in all required fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        showModal('Registration Error', 'Passwords do not match.');
        return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showModal('Registration Error', passwordValidation.message);
        return;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showModal('Registration Error', 'Please enter a valid email address.');
        return;
    }
    
    // Get existing users or create empty array
    let users = JSON.parse(localStorage.getItem('libraryUsers')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        showModal('Registration Error', 'This email is already registered. Please use a different email or login.');
        return;
    }
    
    // Create new user object
    const newUser = {
        firstName,
        lastName,
        email,
        password,
        membership,
        registrationDate: new Date().toISOString(),
        favoriteBooks: [],
        readingList: [],
        notes: []
    };
    
    // Add new user to users array
    users.push(newUser);
    
    // Save updated users array to localStorage
    localStorage.setItem('libraryUsers', JSON.stringify(users));
    
    // Set user data for current session
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
    
    // Save user data to localStorage
    saveUserData();
      // Show success message and redirect to member portal
    let message = 'Your account has been created successfully!';
    
    if (membership !== 'free') {
        message += ' You now have premium access to our entire library collection.';
    }
    
    showModal('Registration Successful', message, function() {
        window.location.href = 'member-portal.html';
    });
}