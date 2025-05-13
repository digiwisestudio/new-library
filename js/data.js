// Book data with Open Library cover URLs
const books = [
    {        id: 1,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "9780061120084",
        cover: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
        topic: "Fiction",
        isPremium: false,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "A classic of modern American literature, this novel explores themes of racial injustice and moral growth through the eyes of a young girl in Alabama."
    },
    {        id: 2,
        title: "1984",
        author: "George Orwell",
        isbn: "9780451524935",
        cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
        topic: "Fiction",
        isPremium: false,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "A dystopian social science fiction novel that examines the consequences of government overreach, totalitarianism, and mass surveillance."
    },
    {        id: 3,
        title: "Accidental Genius",
        author: "Mark Levy",
        isbn: "9781605096476",
        cover: "https://covers.openlibrary.org/b/isbn/9781605096476-L.jpg",
        topic: "Fiction",
        isPremium: false,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "Set in the Jazz Age, this novel depicts the tragic story of Jay Gatsby and his pursuit of the American Dream."
    },
    {        id: 4,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        isbn: "9780141439518",
        cover: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
        topic: "Romance",
        isPremium: false,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "A romantic novel of manners that follows the character development of Elizabeth Bennet in early 19th century England."
    },
    {        id: 5,
        title: "The Power of Habit",
        author: "Charles Duhigg",
        isbn: "9781400069286",
        cover: "https://covers.openlibrary.org/b/isbn/9781400069286-L.jpg",
        topic: "Self-Help",
        isPremium: true,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "Explores the science behind habit formation and how to change habits in our lives, businesses, and societies."
    },
    {        id: 6,
        title: "Sapiens",
        author: "Yuval Noah Harari",
        isbn: "9780062316097",
        cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
        topic: "History",
        isPremium: true,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "A brief history of humankind, exploring the development of Homo sapiens from ancient history to the present."
    },
    {        id: 7,
        title: "The Alchemist",
        author: "Paulo Coelho",
        isbn: "9780061122415",
        cover: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg",
        topic: "Fiction",
        isPremium: false,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "A philosophical novel about a young Andalusian shepherd who follows his dreams and searches for treasure."
    },
    {        id: 8,
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        isbn: "9780374533557",
        cover: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
        topic: "Psychology",
        isPremium: true,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "Explores the two systems that drive the way we think: System 1 (fast, intuitive) and System 2 (slow, deliberate)."
    },
    {        id: 9,
        title: "Harry Potter and the Philosopher's Stone",
        author: "J.K. Rowling",
        isbn: "9780747532743",
        cover: "https://covers.openlibrary.org/b/isbn/9780747532743-L.jpg",
        topic: "Fiction",
        isPremium: false,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "The first novel in the Harry Potter series, following a young wizard's adventures at Hogwarts School of Witchcraft and Wizardry."
    },
    {        id: 10,
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        isbn: "9780618640157",
        cover: "https://covers.openlibrary.org/b/isbn/9780618640157-L.jpg",
        topic: "Fiction",
        isPremium: true,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "An epic high-fantasy novel that follows the quest to destroy the One Ring, a powerful artifact created by the Dark Lord Sauron."
    },
    {        id: 11,
        title: "Atomic Habits",
        author: "James Clear",
        isbn: "9780735211292",
        cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        topic: "Self-Help",
        isPremium: true,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "Provides practical strategies for forming good habits, breaking bad ones, and mastering the tiny behaviors that lead to remarkable results."
    },
    {        id: 12,
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        isbn: "9780547928227",
        cover: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
        topic: "Fiction",
        isPremium: false,
        downloadUrl: "https://drive.google.com/uc?export=download&id=1jElN1UNxOJq29HrlH8bgMs7HAbgmA7RT",
        description: "A fantasy novel about the adventures of hobbit Bilbo Baggins, who is hired as a 'burglar' by a group of dwarves seeking to reclaim their treasure."
    }
];

// Topics/Genres
const topics = [
    "Fiction",
    "Romance",
    "Self-Help",
    "History",
    "Psychology",
    "Science",
    "Biography",
    "Business",
    "Philosophy",
    "Travel"
];

// Authors (alphabetically sorted)
const authors = [
    "Charles Duhigg",
    "Daniel Kahneman",
    "F. Scott Fitzgerald",
    "George Orwell",
    "Harper Lee",
    "J.K. Rowling",
    "J.R.R. Tolkien",
    "James Clear",
    "Jane Austen",
    "Paulo Coelho",
    "Yuval Noah Harari"
];

// Inspirational Book Quotes
const bookQuotes = [
    {
        quote: "It is our choices, Harry, that show what we truly are, far more than our abilities.",
        book: "Harry Potter and the Chamber of Secrets",
        author: "J.K. Rowling"
    },
    {
        quote: "Not all those who wander are lost.",
        book: "The Fellowship of the Ring",
        author: "J.R.R. Tolkien"
    },
    {
        quote: "It is only with the heart that one can see rightly; what is essential is invisible to the eye.",
        book: "The Little Prince",
        author: "Antoine de Saint-Exupéry"
    },
    {
        quote: "You never really understand a person until you consider things from his point of view... Until you climb inside of his skin and walk around in it.",
        book: "To Kill a Mockingbird",
        author: "Harper Lee"
    },
    {
        quote: "When you want something, all the universe conspires in helping you to achieve it.",
        book: "The Alchemist",
        author: "Paulo Coelho"
    },
    {
        quote: "It's the possibility of having a dream come true that makes life interesting.",
        book: "The Alchemist",
        author: "Paulo Coelho"
    },
    {
        quote: "So we beat on, boats against the current, borne back ceaselessly into the past.",
        book: "The Great Gatsby",
        author: "F. Scott Fitzgerald"
    },
    {
        quote: "The world breaks everyone, and afterward, many are strong at the broken places.",
        book: "A Farewell to Arms",
        author: "Ernest Hemingway"
    },
    {
        quote: "It does not do to dwell on dreams and forget to live.",
        book: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling"
    },
    {
        quote: "Beware; for I am fearless, and therefore powerful.",
        book: "Frankenstein",
        author: "Mary Shelley"
    },
    {
        quote: "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.",
        book: "Harry Potter and the Prisoner of Azkaban",
        author: "J.K. Rowling"
    },
    {
        quote: "Whatever our souls are made of, his and mine are the same.",
        book: "Wuthering Heights",
        author: "Emily Brontë"
    }
];

// User data structure (for local storage simulation)
const userData = {
    isLoggedIn: false,
    isDonor: false,
    userName: "",
    email: "",
    membership: "free",
    notes: [],    readingList: [],
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