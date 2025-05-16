/**
 * Member Portal JavaScript
 * Handles all functionality for the member portal including notes, reading list,
 * daily quotes, journal, and user preferences
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the member portal
    initMemberPortal();
    
    // Set up event listeners for all interactive elements
    setupEventListeners();
    
    // Load member portal preferences (auth.js handles the userData loading)
    loadPortalPreferences();
    
    // Initialize UI components
    initComponents();
});

// Global variables for portal functionality
const memberPortal = {
    activeNote: null,
    activeJournalEntry: null,
    selectedAvatar: 'default',
    themePreference: 'light',
    dailyQuote: null,
    journalPrompts: [
        "How did today's reading connect to your personal experiences?",
        "Which character do you relate to the most and why?",
        "What's one idea from your reading that changed how you think?",
        "If you could ask the author one question, what would it be?",
        "What emotions did today's reading evoke in you?",
        "How does this book compare to others you've read recently?",
        "What was the most surprising thing you discovered in today's reading?",
        "Describe a scene that stood out to you and explain why.",
        "What themes are emerging in your reading?",
        "If you could step into the book, what role would you play?"
    ]
};

/**
 * Initialize the member portal based on login status
 */
function initMemberPortal() {
    console.group('Member Portal Initialization');
    
    // Get DOM elements
    const memberLoginRequired = document.getElementById('member-login-required');
    const memberPortalContent = document.getElementById('member-portal-content');
    
    // Check if userData is properly defined
    if (typeof userData === 'undefined') {
        console.error('⚠️ userData is undefined - authentication will fail');
    }
    
    // Log current auth status
    console.log('Member Portal Init - Auth Status:', 
        isUserLoggedIn() ? 'LOGGED IN' : 'NOT LOGGED IN');
    
    // Check if user is logged in using auth.js function
    if (isUserLoggedIn()) {
        console.log('✅ User is logged in - showing member portal content');
        
        if (memberLoginRequired && memberPortalContent) {
            memberLoginRequired.classList.add('hidden');
            memberPortalContent.classList.remove('hidden');
            
            // Update reading streak when user visits the portal
            updateReadingStreak();
        } else {
            console.error('❌ Missing portal elements:', {
                loginRequired: !!memberLoginRequired,
                portalContent: !!memberPortalContent
            });
        }
    } else {
        console.log('❌ User is not logged in - redirecting to login page');
        // Redirect to login page if not logged in
        window.location.href = 'login.html?redirect=member-portal';
    }
      console.groupEnd();
}

/**
 * Update reading streak when user visits the portal
 */
function updateReadingStreak() {
    if (!userData.readingStats || !userData.readingStats.lastActive) {
        // Initialize reading stats if they don't exist
        userData.readingStats = userData.readingStats || {};
        userData.readingStats.readingStreak = 1;
        userData.readingStats.lastActive = new Date().toISOString();
        userData.readingStats.highestStreak = 1;
        saveUserData();
        showNotificationWithIcon('Welcome to your reading journey! Your streak starts today.', 'fas fa-book-open', 'streak');
        return;
    }
    
    const lastActive = new Date(userData.readingStats.lastActive);
    const today = new Date();
    
    // Reset time portion to compare dates only
    lastActive.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const daysDifference = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    // Set highest streak if not already set
    if (!userData.readingStats.highestStreak) {
        userData.readingStats.highestStreak = userData.readingStats.readingStreak || 1;
    }
    
    if (daysDifference === 1) {
        // User returned the next day - increase streak
        userData.readingStats.readingStreak += 1;
        
        // Check if this is a new personal best
        if (userData.readingStats.readingStreak > userData.readingStats.highestStreak) {
            userData.readingStats.highestStreak = userData.readingStats.readingStreak;
            showNotificationWithIcon(`New personal best! ${userData.readingStats.readingStreak} day streak achieved!`, 'fas fa-trophy', 'streak-milestone');
        } 
        // Check if this is a milestone (multiple of 5)
        else if (userData.readingStats.readingStreak % 5 === 0) {
            showNotificationWithIcon(`Impressive! You've reached a ${userData.readingStats.readingStreak} day reading streak!`, 'fas fa-medal', 'streak-milestone');
        } else {
            showNotificationWithIcon(`Reading streak: ${userData.readingStats.readingStreak} days! Keep it up!`, 'fas fa-fire', 'streak');
        }
    } else if (daysDifference > 1) {
        // User missed days - reset streak
        const oldStreak = userData.readingStats.readingStreak;
        userData.readingStats.readingStreak = 1;
        
        if (oldStreak > 1) {
            showNotificationWithIcon(`Your ${oldStreak}-day streak has been reset. Let's start again!`, 'fas fa-undo', 'streak-broken');
        } else {
            showNotificationWithIcon(`Welcome back to Bibliophile Hub! Your new streak starts today.`, 'fas fa-book', 'streak');
        }
    } else if (daysDifference === 0) {
        // User already visited today
        // No change to streak, but show welcome back message
        showNotificationWithIcon(`Welcome back today! Your streak is currently ${userData.readingStats.readingStreak} days.`, 'fas fa-book-reader', 'streak');
    }
    
    // Update the last active date
    userData.readingStats.lastActive = today.toISOString();
    
    // Save user data
    saveUserData();
    
    // Update streak display
    const streakDaysElement = document.getElementById('streak-days');
    if (streakDaysElement) {
        streakDaysElement.textContent = userData.readingStats.readingStreak || '0';
    }
}

/**
 * Setup all event listeners for the member portal
 */
function setupEventListeners() {
    // Theme switcher buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
        });
    });
    
    // Avatar change button
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', openAvatarModal);
    }
    
    // Save avatar button
    const saveAvatarBtn = document.getElementById('save-avatar-btn');
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', saveAvatarSelection);
    }
    
    // Avatar selection options
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
            // Store the selected avatar
            memberPortal.selectedAvatar = this.getAttribute('data-avatar');
        });
    });
    
    // Quote actions
    const refreshQuoteBtn = document.getElementById('refresh-quote-btn');
    if (refreshQuoteBtn) {
        refreshQuoteBtn.addEventListener('click', generateDailyQuote);
    }
    
    const saveQuoteBtn = document.getElementById('save-quote-btn');
    if (saveQuoteBtn) {
        saveQuoteBtn.addEventListener('click', saveQuote);
    }
    
    const shareQuoteBtn = document.getElementById('share-quote-btn');
    if (shareQuoteBtn) {
        shareQuoteBtn.addEventListener('click', shareQuote);
    }
    
    const viewSavedQuotesBtn = document.getElementById('view-saved-quotes-btn');
    if (viewSavedQuotesBtn) {
        viewSavedQuotesBtn.addEventListener('click', openSavedQuotesModal);
    }
    
    // Reading list buttons
    const addBookBtn = document.getElementById('add-book-btn');
    if (addBookBtn) {
        addBookBtn.addEventListener('click', function() {
            window.location.href = 'free-ebooks.html';
        });
    }
    
    const setReminderBtn = document.getElementById('set-reminder-btn');
    if (setReminderBtn) {
        setReminderBtn.addEventListener('click', openReminderModal);
    }
    
    // Note actions
    const createNoteBtn = document.getElementById('create-note-btn');
    if (createNoteBtn) {
        createNoteBtn.addEventListener('click', createNewNote);
    }
    
    const organizeNotesBtn = document.getElementById('organize-notes-btn');
    if (organizeNotesBtn) {
        organizeNotesBtn.addEventListener('click', organizeNotes);
    }
    
    const saveNoteBtn = document.getElementById('save-note-btn');
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', saveNote);
    }
    
    // Note editor toolbar buttons
    const toolbarButtons = document.querySelectorAll('.tool-btn');
    toolbarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            formatText(format);
        });
    });
    
    // Journal actions
    const newEntryBtn = document.getElementById('new-entry-btn');
    if (newEntryBtn) {
        newEntryBtn.addEventListener('click', createNewJournalEntry);
    }
    
    const saveJournalBtn = document.getElementById('save-journal-btn');
    if (saveJournalBtn) {
        saveJournalBtn.addEventListener('click', saveJournalEntry);
    }
    
    // Mood selector
    const moodIcons = document.querySelectorAll('.mood-icon');
    moodIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            moodIcons.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Mood tags filter
    const moodTags = document.querySelectorAll('.mood-tag');
    moodTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            
            if (isActive) {
                this.classList.remove('active');
                // Show all entries
                filterJournalEntries();
            } else {
                moodTags.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                // Filter by selected mood
                const mood = this.getAttribute('data-mood');
                filterJournalEntries(mood);
            }
        });
    });
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Reminder form submission
    const reminderForm = document.getElementById('reminder-form');
    if (reminderForm) {
        reminderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveReadingReminder();
            closeModal(document.getElementById('reminder-modal'));
        });
    }
    
    // Note search
    const noteSearchInput = document.getElementById('note-search-input');
    if (noteSearchInput) {
        noteSearchInput.addEventListener('input', searchNotes);
    }
}

/**
 * Initialize UI components
 */
function initComponents() {
    // Update user information
    updateUserInfo();
    
    // Generate daily quote
    generateDailyQuote();
    
    // Load reading list
    loadReadingList();
    
    // Load notes
    loadNotes();
    
    // Load downloaded books
    loadDownloadedBooks();
    
    // Setup journal
    setupJournal();
    
    // Apply saved theme
    applyTheme();
}

/**
 * Load portal preferences for the member from userData
 */
function loadPortalPreferences() {
    // userData should already be loaded by auth.js
    if (!userData) {
        console.error('Unable to load portal preferences: userData not defined');
        return;
    }
    
    // Check if user has portal preferences
    if (userData.portalPreferences) {
        memberPortal.themePreference = userData.portalPreferences.theme || 'light';
        memberPortal.selectedAvatar = userData.portalPreferences.avatar || 'default';
    } else {
        // Initialize portal preferences
        userData.portalPreferences = {
            theme: 'light',
            avatar: 'default'
        };
        saveUserData();
    }
    
    // Apply loaded preferences
    setAvatar(memberPortal.selectedAvatar);
}

/**
 * Update user information display
 */
function updateUserInfo() {
    if (!isUserLoggedIn()) return;
    
    const userNameElement = document.getElementById('user-name');
    const membershipBadgeElement = document.getElementById('membership-level');
    const streakDaysElement = document.getElementById('streak-days');
    
    if (userNameElement) {
        userNameElement.textContent = userData.userName || 'Reader';
    }
    
    if (membershipBadgeElement) {
        membershipBadgeElement.textContent = userData.isDonor ? 'Premium' : 'Standard';
    }
    
    if (streakDaysElement && userData.readingStats) {
        streakDaysElement.textContent = userData.readingStats.readingStreak || '0';
    }
}

/**
 * Set user avatar
 * @param {string} avatar - The avatar identifier
 */
function setAvatar(avatar) {
    const userAvatarElement = document.getElementById('user-avatar');
    
    if (!userAvatarElement) return;
    
    // Clear previous avatar
    userAvatarElement.innerHTML = '';
    
    // Set new avatar based on selection
    switch (avatar) {
        case 'reader':
            userAvatarElement.innerHTML = '<i class="fas fa-book-reader"></i>';
            break;
        case 'scholar':
            userAvatarElement.innerHTML = '<i class="fas fa-user-graduate"></i>';
            break;
        case 'writer':
            userAvatarElement.innerHTML = '<i class="fas fa-pen-fancy"></i>';
            break;
        case 'bookworm':
            userAvatarElement.innerHTML = '<i class="fas fa-glasses"></i>';
            break;
        case 'wizard':
            userAvatarElement.innerHTML = '<i class="fas fa-hat-wizard"></i>';
            break;
        default:
            userAvatarElement.innerHTML = '<i class="fas fa-user"></i>';
            break;
    }
    
    // Save preference to userData
    if (isUserLoggedIn()) {
        savePortalPreference('avatar', avatar);
    }
}

/**
 * Set theme
 * @param {string} theme - The theme name (light, dark, sepia)
 */
function setTheme(theme) {
    // Remove all theme buttons active state
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active state to selected theme button
    const activeThemeBtn = document.querySelector(`.theme-btn[data-theme="${theme}"]`);
    if (activeThemeBtn) {
        activeThemeBtn.classList.add('active');
    }
    
    // Apply theme
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
    document.body.classList.add(`theme-${theme}`);
    
    // Save preference to userData
    if (isUserLoggedIn()) {
        savePortalPreference('theme', theme);
        memberPortal.themePreference = theme;
    }
}

/**
 * Apply saved theme
 */
function applyTheme() {
    setTheme(memberPortal.themePreference);
}

/**
 * Save portal preference to user data
 * @param {string} key - The preference key
 * @param {*} value - The preference value
 */
function savePortalPreference(key, value) {
    const storedUserData = localStorage.getItem('libraryUserData');
    
    if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        
        if (!parsedData.portalPreferences) {
            parsedData.portalPreferences = {};
        }
        
        parsedData.portalPreferences[key] = value;
        localStorage.setItem('libraryUserData', JSON.stringify(parsedData));
    }
}

/**
 * Generate a daily quote
 */
function generateDailyQuote() {
    const quotes = [
        { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
        { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
        { text: "Books are a uniquely portable magic.", author: "Stephen King" },
        { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
        { text: "A book is a dream that you hold in your hand.", author: "Neil Gaiman" },
        { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
        { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
        { text: "The person who deserves most pity is a lonesome one on a rainy day who doesn't know how to read.", author: "Benjamin Franklin" },
        { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass" },
        { text: "A book must be the axe for the frozen sea within us.", author: "Franz Kafka" },
        { text: "The reading of all good books is like a conversation with the finest minds of past centuries.", author: "René Descartes" },
        { text: "Books are mirrors: you only see in them what you already have inside you.", author: "Carlos Ruiz Zafón" }
    ];
    
    // Get random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    memberPortal.dailyQuote = randomQuote;
    
    // Update UI
    const quoteText = document.querySelector('#daily-quote p');
    const quoteAuthor = document.querySelector('#daily-quote cite');
    
    if (quoteText && quoteAuthor) {
        quoteText.textContent = randomQuote.text;
        quoteAuthor.textContent = `— ${randomQuote.author}`;
    }
    
    // Update save button status
    updateSaveQuoteButton();
}

/**
 * Update save quote button to show if the current quote is already saved
 */
function updateSaveQuoteButton() {
    const saveQuoteBtn = document.getElementById('save-quote-btn');
    
    if (!saveQuoteBtn || !memberPortal.dailyQuote) return;
    
    // Check if quote is already saved
    const isSaved = isQuoteSaved(memberPortal.dailyQuote);
    
    if (isSaved) {
        saveQuoteBtn.innerHTML = '<i class="fas fa-heart"></i>';
        saveQuoteBtn.title = 'Remove from Favorites';
    } else {
        saveQuoteBtn.innerHTML = '<i class="far fa-heart"></i>';
        saveQuoteBtn.title = 'Save Quote';
    }
}

/**
 * Check if a quote is already saved
 * @param {Object} quote - The quote to check
 * @returns {boolean} - True if quote is saved
 */
function isQuoteSaved(quote) {
    if (!userData.favoriteQuotes || !Array.isArray(userData.favoriteQuotes)) {
        return false;
    }
    
    return userData.favoriteQuotes.some(
        savedQuote => savedQuote.text === quote.text && savedQuote.author === quote.author
    );
}

/**
 * Save current quote to favorites
 */
function saveQuote() {
    if (!isUserLoggedIn() || !memberPortal.dailyQuote) return;
    
    const isSaved = isQuoteSaved(memberPortal.dailyQuote);
    
    if (isSaved) {
        // Remove from favorites
        userData.favoriteQuotes = userData.favoriteQuotes.filter(
            quote => !(quote.text === memberPortal.dailyQuote.text && quote.author === memberPortal.dailyQuote.author)
        );
    } else {
        // Add to favorites
        if (!userData.favoriteQuotes) {
            userData.favoriteQuotes = [];
        }
        
        userData.favoriteQuotes.push({
            text: memberPortal.dailyQuote.text,
            author: memberPortal.dailyQuote.author,
            savedAt: new Date().toISOString()
        });
        
        // Update reading stats
        if (userData.readingStats) {
            userData.readingStats.quotesSaved = (userData.readingStats.quotesSaved || 0) + 1;
        }
    }
    
    // Save to localStorage
    saveUserData();
    
    // Update button status
    updateSaveQuoteButton();
    
    // Show notification
    showNotification(isSaved ? 'Quote removed from favorites' : 'Quote saved to favorites');
}

/**
 * Share the current quote
 */
function shareQuote() {
    if (!memberPortal.dailyQuote) return;
    
    // Create share text
    const shareText = `"${memberPortal.dailyQuote.text}" — ${memberPortal.dailyQuote.author}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Literary Quote',
            text: shareText,
            url: window.location.href
        })
        .then(() => showNotification('Quote shared successfully'))
        .catch(() => {
            // Fallback to copy to clipboard
            copyToClipboard(shareText);
        });
    } else {
        // Fallback to copy to clipboard
        copyToClipboard(shareText);
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 */
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Quote copied to clipboard');
    } catch (err) {
        showNotification('Failed to copy quote');
    }
    
    document.body.removeChild(textarea);
}

/**
 * Load reading list from user data
 */
function loadReadingList() {
    const readingListContainer = document.getElementById('reading-list-container');
    const emptyReadingList = document.getElementById('empty-reading-list');
    
    if (!readingListContainer) return;
    
    // Check if user has reading list
    if (!userData.readingList || userData.readingList.length === 0) {
        if (emptyReadingList) {
            emptyReadingList.style.display = 'block';
        }
        return;
    }
    
    // Hide empty message
    if (emptyReadingList) {
        emptyReadingList.style.display = 'none';
    }
    
    // Clear container
    readingListContainer.innerHTML = '';
    
    // Add reading list items
    userData.readingList.forEach((book, index) => {
        const bookItem = createReadingListItem(book, index);
        readingListContainer.appendChild(bookItem);
    });
    
    // Update reminder book options
    updateReminderBookOptions();
}

/**
 * Create a reading list item element
 * @param {Object} book - The book data
 * @param {number} index - The index in the reading list
 * @returns {HTMLElement} - The reading list item element
 */
function createReadingListItem(book, index) {
    const item = document.createElement('div');
    item.className = 'reading-list-item';
    item.dataset.index = index;
    
    const coverURL = book.cover || 'https://via.placeholder.com/50x70?text=Book';
    
    item.innerHTML = `
        <img src="${coverURL}" alt="${book.title}" class="book-thumbnail">
        <div class="book-info">
            <div class="book-title">${book.title}</div>
            <div class="book-author">by ${book.author}</div>
        </div>
        <div class="book-actions">
            <button class="btn-icon remove-book-btn" data-index="${index}" title="Remove from List">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add event listener to remove button
    const removeButton = item.querySelector('.remove-book-btn');
    if (removeButton) {
        removeButton.addEventListener('click', function() {
            removeBookFromReadingList(index);
        });
    }
    
    return item;
}

/**
 * Remove a book from the reading list
 * @param {number} index - The index of the book to remove
 */
function removeBookFromReadingList(index) {
    if (!userData.readingList || index < 0 || index >= userData.readingList.length) return;
    
    // Remove book from array
    userData.readingList.splice(index, 1);
    
    // Save user data
    saveUserData();
    
    // Reload reading list
    loadReadingList();
    
    // Show notification
    showNotification('Book removed from reading list');
}

/**
 * Update reminder book options in the reminder modal
 */
function updateReminderBookOptions() {
    const reminderBookSelect = document.getElementById('reminder-book');
    
    if (!reminderBookSelect) return;
    
    // Clear options
    reminderBookSelect.innerHTML = '';
    
    // Add options from reading list
    if (userData.readingList && userData.readingList.length > 0) {
        userData.readingList.forEach((book, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = book.title;
            reminderBookSelect.appendChild(option);
        });
    } else {
        // Add placeholder if no books in reading list
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No books in your reading list';
        option.disabled = true;
        option.selected = true;
        reminderBookSelect.appendChild(option);
    }
}

/**
 * Save reading reminder
 */
function saveReadingReminder() {
    const bookSelect = document.getElementById('reminder-book');
    const timeInput = document.getElementById('reminder-time');
    const dayCheckboxes = document.querySelectorAll('.day-checkbox input:checked');
    
    if (!bookSelect || !timeInput || dayCheckboxes.length === 0) {
        showNotification('Please fill in all reminder fields');
        return;
    }
    
    const bookIndex = parseInt(bookSelect.value);
    const reminderTime = timeInput.value;
    const days = Array.from(dayCheckboxes).map(cb => cb.value);
    
    // Create reminder object
    const reminder = {
        bookIndex: bookIndex,
        time: reminderTime,
        days: days,
        enabled: true,
        createdAt: new Date().toISOString()
    };
    
    // Add reminder to user data
    if (!userData.reminders) {
        userData.reminders = [];
    }
    
    userData.reminders.push(reminder);
    
    // Save user data
    saveUserData();
    
    // Show notification
    showNotification('Reading reminder set successfully');
}

/**
 * Load notes from user data
 */
function loadNotes() {
    const noteList = document.getElementById('note-list');
    const emptyNotes = document.getElementById('empty-notes');
    
    if (!noteList) return;
    
    // Check if user has notes
    if (!userData.notes || userData.notes.length === 0) {
        if (emptyNotes) {
            emptyNotes.style.display = 'block';
        }
        return;
    }
    
    // Hide empty message
    if (emptyNotes) {
        emptyNotes.style.display = 'none';
    }
    
    // Clear list
    noteList.innerHTML = '';
    
    // Add note items
    userData.notes.forEach((note, index) => {
        const noteItem = createNoteListItem(note, index);
        noteList.appendChild(noteItem);
        
        // Add click event to show note content
        noteItem.addEventListener('click', function() {
            showNoteContent(index);
        });
    });
}

/**
 * Create a note list item element
 * @param {Object} note - The note data
 * @param {number} index - The index in the notes array
 * @returns {HTMLElement} - The note list item element
 */
function createNoteListItem(note, index) {
    const item = document.createElement('div');
    item.className = 'note-item';
    item.dataset.index = index;
    
    // Get preview text (first 50 characters)
    let previewText = note.content.replace(/<\/?[^>]+(>|$)/g, '');
    previewText = previewText.substring(0, 50) + (previewText.length > 50 ? '...' : '');
    
    item.innerHTML = `
        <h3>${note.title}</h3>
        <p>${formatDate(new Date(note.updatedAt || note.createdAt))}</p>
    `;
    
    return item;
}

/**
 * Show note content in the editor
 * @param {number} index - The index of the note to show
 */
function showNoteContent(index) {
    if (!userData.notes || index < 0 || index >= userData.notes.length) return;
    
    const note = userData.notes[index];
    const noteContent = document.getElementById('note-content');
    
    if (!noteContent) return;
    
    // Set active note
    memberPortal.activeNote = index;
    
    // Update active state in list
    const noteItems = document.querySelectorAll('.note-item');
    noteItems.forEach(item => item.classList.remove('active'));
    
    const activeItem = document.querySelector(`.note-item[data-index="${index}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Set content
    noteContent.innerHTML = note.content;
}

/**
 * Create a new note
 */
function createNewNote() {
    // Check if user is logged in
    if (!isUserLoggedIn()) return;
    
    // Create new note object
    const newNote = {
        title: `Note ${(userData.notes?.length || 0) + 1}`,
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to user data
    if (!userData.notes) {
        userData.notes = [];
    }
    
    userData.notes.unshift(newNote); // Add to beginning
    
    // Save user data
    saveUserData();
    
    // Update reading stats
    if (userData.readingStats) {
        userData.readingStats.notesSaved = (userData.readingStats.notesSaved || 0) + 1;
    }
    
    // Reload notes
    loadNotes();
    
    // Show the new note
    showNoteContent(0);
    
    // Focus on editor
    const noteContent = document.getElementById('note-content');
    if (noteContent) {
        noteContent.focus();
    }
}

/**
 * Save the current note
 */
function saveNote() {
    // Check if user is logged in and has an active note
    if (!isUserLoggedIn() || memberPortal.activeNote === null) return;
    
    // Get note content
    const noteContent = document.getElementById('note-content');
    
    if (!noteContent) return;
    
    // Update note object
    userData.notes[memberPortal.activeNote].content = noteContent.innerHTML;
    userData.notes[memberPortal.activeNote].updatedAt = new Date().toISOString();
    
    // Save user data
    saveUserData();
    
    // Show notification
    showNotification('Note saved successfully');
    
    // Reload notes to update preview
    loadNotes();
    
    // Keep the note active
    showNoteContent(memberPortal.activeNote);
}

/**
 * Format text in the note editor
 * @param {string} command - The formatting command
 */
function formatText(command) {
    // Check if an editor exists
    const editor = document.getElementById('note-content');
    if (!editor) return;
    
    // Apply formatting based on command
    switch (command) {
        case 'bold':
            document.execCommand('bold', false, null);
            break;
        case 'italic':
            document.execCommand('italic', false, null);
            break;
        case 'underline':
            document.execCommand('underline', false, null);
            break;
        case 'heading':
            document.execCommand('formatBlock', false, '<h2>');
            break;
        case 'list-ul':
            document.execCommand('insertUnorderedList', false, null);
            break;
        case 'list-ol':
            document.execCommand('insertOrderedList', false, null);
            break;
    }
    
    // Focus back on the editor
    editor.focus();
}

/**
 * Search notes by title
 */
function searchNotes() {
    const searchInput = document.getElementById('note-search-input');
    
    if (!searchInput || !userData.notes) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const noteItems = document.querySelectorAll('.note-item');
    
    noteItems.forEach(item => {
        const index = parseInt(item.dataset.index);
        const note = userData.notes[index];
        
        if (note.title.toLowerCase().includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Organize notes (sort by date)
 */
function organizeNotes() {
    if (!userData.notes || userData.notes.length === 0) return;
    
    // Sort notes by update date (newest first)
    userData.notes.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
    });
    
    // Save user data
    saveUserData();
    
    // Reload notes
    loadNotes();
    
    // Show notification
    showNotification('Notes organized by date');
}

/**
 * Setup journal with calendar and prompt
 */
function setupJournal() {
    // Set random journal prompt
    setRandomJournalPrompt();
}

/**
 * Set a random journal prompt
 */
function setRandomJournalPrompt() {
    const promptElement = document.getElementById('prompt-text');
    
    if (!promptElement) return;
    
    // Get random prompt
    const randomPrompt = memberPortal.journalPrompts[
        Math.floor(Math.random() * memberPortal.journalPrompts.length)
    ];
    
    promptElement.textContent = randomPrompt;
}

/**
 * Create a new journal entry
 */
function createNewJournalEntry() {
    // Reset text area
    const journalText = document.getElementById('journal-text');
    
    if (journalText) {
        journalText.value = '';
    }
    
    // Reset mood selection
    const moodIcons = document.querySelectorAll('.mood-icon');
    moodIcons.forEach(icon => {
        icon.classList.remove('active');
    });
    
    // Set new prompt
    setRandomJournalPrompt();
    
    // Focus on text area
    if (journalText) {
        journalText.focus();
    }
}

/**
 * Save a journal entry
 */
function saveJournalEntry() {
    // Check if user is logged in
    if (!isUserLoggedIn()) return;
    
    // Get journal text and selected mood
    const journalText = document.getElementById('journal-text');
    const activeMood = document.querySelector('.mood-icon.active');
    
    if (!journalText || !journalText.value.trim()) {
        showNotification('Please write something in your journal');
        return;
    }
    
    // Create journal entry object
    const journalEntry = {
        text: journalText.value.trim(),
        prompt: document.getElementById('prompt-text')?.textContent || '',
        mood: activeMood ? activeMood.getAttribute('data-mood') : null,
        date: new Date().toISOString()
    };
    
    // Add to user data
    if (!userData.journalEntries) {
        userData.journalEntries = [];
    }
    
    userData.journalEntries.push(journalEntry);
    
    // Save user data
    saveUserData();
    
    // Show notification
    showNotification('Journal entry saved successfully');
    
    // Create new entry (reset form)
    createNewJournalEntry();
}

/**
 * Filter journal entries by mood
 * @param {string} mood - The mood to filter by (optional)
 */
function filterJournalEntries(mood) {
    // This would be implemented to filter the journal entries display
    // Since we don't have a journal entries display yet, this is a placeholder
    console.log('Filtering journal entries by mood:', mood || 'all');
}

/**
 * Open avatar selection modal
 */
function openAvatarModal() {
    const modal = document.getElementById('avatar-modal');
    if (!modal) return;
    
    // Pre-select the current avatar
    const avatarOptions = modal.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-avatar') === memberPortal.selectedAvatar) {
            option.classList.add('selected');
        }
    });
    
    modal.style.display = 'block';
}

/**
 * Open saved quotes modal
 */
function openSavedQuotesModal() {
    const modal = document.getElementById('saved-quotes-modal');
    const quotesList = document.getElementById('saved-quotes-list');
    const emptyQuotes = document.getElementById('empty-quotes');
    
    if (!modal || !quotesList) return;
    
    // Check if user has saved quotes
    if (!userData.favoriteQuotes || userData.favoriteQuotes.length === 0) {
        if (emptyQuotes) {
            emptyQuotes.style.display = 'block';
        }
        
        modal.style.display = 'block';
        return;
    }
    
    // Hide empty message
    if (emptyQuotes) {
        emptyQuotes.style.display = 'none';
    }
    
    // Clear list
    quotesList.innerHTML = '';
    
    // Add saved quotes
    userData.favoriteQuotes.forEach((quote, index) => {
        const quoteItem = document.createElement('div');
        quoteItem.className = 'saved-quote-item';
        
        quoteItem.innerHTML = `
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-author">— ${quote.author}</div>
            <button class="delete-quote" data-index="${index}">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        
        // Add delete event listener
        const deleteBtn = quoteItem.querySelector('.delete-quote');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                removeSavedQuote(index);
            });
        }
        
        quotesList.appendChild(quoteItem);
    });
    
    modal.style.display = 'block';
}

/**
 * Remove a saved quote
 * @param {number} index - The index of the quote to remove
 */
function removeSavedQuote(index) {
    if (!userData.favoriteQuotes || index < 0 || index >= userData.favoriteQuotes.length) return;
    
    // Remove quote from array
    userData.favoriteQuotes.splice(index, 1);
    
    // Save user data
    saveUserData();
    
    // Update quote button if it's the current quote
    updateSaveQuoteButton();
    
    // Reload quotes in modal
    openSavedQuotesModal();
    
    // Show notification
    showNotification('Quote removed from favorites');
}

/**
 * Open reading reminder modal
 */
function openReminderModal() {
    const modal = document.getElementById('reminder-modal');
    if (!modal) return;
    
    // Update book options
    updateReminderBookOptions();
    
    modal.style.display = 'block';
}

/**
 * Close modal
 * @param {HTMLElement} modal - The modal element to close
 */
function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
}

/**
 * Save avatar selection
 */
function saveAvatarSelection() {
    setAvatar(memberPortal.selectedAvatar);
    closeModal(document.getElementById('avatar-modal'));
    showNotification('Avatar updated successfully');
}

/**
 * Show notification
 * @param {string} message - The notification message
 */
function showNotification(message) {
    // Use our new icon-based notification function with default icon
    showNotificationWithIcon(message, 'fas fa-bell');
}

/**
 * Show a notification with an icon
 * @param {string} message - The message to display
 * @param {string} iconClass - Font Awesome icon class
 * @param {string} type - Notification type (streak, streak-milestone, streak-broken, etc.)
 */
function showNotificationWithIcon(message, iconClass = 'fas fa-bell', type = '') {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    // Create if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon
    const icon = document.createElement('i');
    icon.className = iconClass;
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

/**
 * Format date to readable string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Load and display user's downloaded books
 */
function loadDownloadedBooks() {
    const downloadsContainer = document.getElementById('downloads-container');
    const emptyDownloadsMessage = document.getElementById('empty-downloads');
    
    // Check if containers exist
    if (!downloadsContainer) return;
    
    // Clear previous content
    downloadsContainer.innerHTML = '';
    
    // Check if user has any downloaded books
    if (!userData.downloadedBooks || userData.downloadedBooks.length === 0) {
        // Show empty state message
        if (emptyDownloadsMessage) {
            emptyDownloadsMessage.style.display = 'flex';
        }
        return;
    }
    
    // Hide empty state message
    if (emptyDownloadsMessage) {
        emptyDownloadsMessage.style.display = 'none';
    }
    
    // Sort downloads by date (newest first)
    const sortedDownloads = [...userData.downloadedBooks].sort((a, b) => {
        return new Date(b.downloadedAt) - new Date(a.downloadedAt);
    });
    
    // Generate HTML for each downloaded book
    sortedDownloads.forEach(book => {
        // Format the download date
        const downloadDate = new Date(book.downloadedAt);
        const formattedDate = downloadDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Create download item element
        const downloadItem = document.createElement('div');
        downloadItem.className = 'download-item';
        
        // Premium badge if applicable
        const premiumBadge = book.isPremium ? 
            '<span class="download-badge premium">Premium</span>' : '';
        
        // Set the HTML content
        downloadItem.innerHTML = `
            <div class="download-cover">
                <img src="${book.cover}" alt="${book.title} cover">
            </div>
            <div class="download-info">
                <div class="download-title">${book.title} ${premiumBadge}</div>
                <div class="download-author">by ${book.author}</div>
                <div class="download-date">Downloaded on ${formattedDate}</div>
            </div>
            <div class="download-actions">
                <button class="download-btn" title="Download Again" data-id="${book.id}">
                    <i class="fas fa-cloud-download-alt"></i>
                </button>
            </div>
        `;
        
        // Add to container
        downloadsContainer.appendChild(downloadItem);
    });
      // Add event listeners to download buttons
    const downloadButtons = downloadsContainer.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookId = parseInt(this.getAttribute('data-id'));
            const book = books.find(b => b.id === bookId);
            
            if (book) {
                // Mark this as a re-download from history
                this.setAttribute('data-redownload', 'true');
                
                // Execute download function with this button as event target
                handleBookDownload({ target: this });
                
                // Show notification
                showNotification(`Re-downloading "${book.title}"...`);
            }
        });
    });
}
