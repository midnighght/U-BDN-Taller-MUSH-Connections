db = db.getSiblingDB('mush-social');

// Create users collection and add example users
db.createCollection('users');
db.users.insertMany([
    {
        username: "mul",
        email: "nighght@example.com",
        // Password is "password123" - you should hash this in production
        password: "$2b$10$6jXRP4NP8DZJXEoOG9RYzOzRp4kIwNZP9Ym9fJ9M0o3p1XQ1K1d2W",
        blockedUsers: [],
        description: "ola soy mul",
        isPrivate: false,
        createdAt: new Date()
    },
    {
        username: "ardilla",
        email: "ema@example.com",
        // Password is "password123"
        password: "$2b$10$6jXRP4NP8DZJXEoOG9RYzOzRp4kIwNZP9Ym9fJ9M0o3p1XQ1K1d2W",
        blockedUsers: [],
        description: "squeak squeak 🐿️",
        isPrivate: false,
        createdAt: new Date()
    },
    {
        username: "martin",
        email: "martin@example.com",
        // Password is "password123"
        password: "$2b$10$6jXRP4NP8DZJXEoOG9RYzOzRp4kIwNZP9Ym9fJ9M0o3p1XQ1K1d2W",
        blockedUsers: [],
        description: "Hola mundo",
        isPrivate: false,
        createdAt: new Date()
    },
    {
        username: "test_user",
        email: "test@example.com",
        // Password is "password123"
        password: "$2b$10$6jXRP4NP8DZJXEoOG9RYzOzRp4kIwNZP9Ym9fJ9M0o3p1XQ1K1d2W",
        blockedUsers: [],
        description: "This is a test account",
        isPrivate: false,
        createdAt: new Date()
    }
]);

// Create some example posts
db.createCollection('posts');
db.posts.insertMany([
    {
        userId: db.users.findOne({username: "mul"})._id,
        content: "Hello world! This is my first post on MUSH!",
        images: [],
        likes: 0,
        createdAt: new Date()
    },
    {
        userId: db.users.findOne({username: "ardilla"})._id,
        content: "Just joined this amazing platform! Looking forward to connecting with everyone 😊",
        images: [],
        likes: 0,
        createdAt: new Date()
    }
]);

// Create some example comments
db.createCollection('comments');
db.comments.insertMany([
    {
        postId: db.posts.findOne({userId: db.users.findOne({username: "mul"})._id})._id,
        userId: db.users.findOne({username: "martin"})._id,
        content: "Welcome to MUSH! 🎉",
        createdAt: new Date()
    }
]);