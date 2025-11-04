db = db.getSiblingDB('mush-social');

// Create users collection and add example users
db.createCollection('users');
db.users.insertMany([
    {
        username: "john_doe",
        email: "john@example.com",
        // Password is "password123" - you should hash this in production
        password: "$2b$10$6jXRP4NP8DZJXEoOG9RYzOzRp4kIwNZP9Ym9fJ9M0o3p1XQ1K1d2W",
        blockedUsers: [],
        description: "Hi, I'm John! I love sharing interesting content.",
        isPrivate: false,
        createdAt: new Date()
    },
    {
        username: "jane_smith",
        email: "jane@example.com",
        // Password is "password123"
        password: "$2b$10$6jXRP4NP8DZJXEoOG9RYzOzRp4kIwNZP9Ym9fJ9M0o3p1XQ1K1d2W",
        blockedUsers: [],
        description: "Tech enthusiast and coffee lover ☕",
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
        userId: db.users.findOne({username: "john_doe"})._id,
        content: "Hello world! This is my first post on MUSH!",
        images: [],
        likes: 0,
        createdAt: new Date()
    },
    {
        userId: db.users.findOne({username: "jane_smith"})._id,
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
        postId: db.posts.findOne({userId: db.users.findOne({username: "john_doe"})._id})._id,
        userId: db.users.findOne({username: "jane_smith"})._id,
        content: "Welcome to MUSH! 🎉",
        createdAt: new Date()
    }
]);