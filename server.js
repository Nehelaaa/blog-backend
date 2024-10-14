require('dotenv').config();  // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize session middleware with enhanced security options
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  // Prevents client-side JS from reading the cookie
        secure: process.env.NODE_ENV === 'production',  // Only send cookie over HTTPS in production
        sameSite: 'strict'  // Helps prevent CSRF attacks
    }
}));

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();  // Proceed if authenticated
    } else {
        return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
    }
}

// Storage configuration for multer (file uploads)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer with the defined storage
const upload = multer({ storage: storage });

// Connect to MongoDB using the connection string from .env
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);  // Exit the process if there’s a connection error
});

// Define the Post schema
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    likes: { type: Number, default: 0 },
    comments: [{ username: String, text: String }]
});

// Post model
const Post = mongoose.model('Post', postSchema);

// Create a new post with image upload (only accessible to authenticated users)
app.post('/posts', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            image: req.file ? req.file.path : null
        });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post. Please try again later.' });
    }
});

// Get all posts (public)
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts. Please try again later.' });
    }
});

// Like a post (public)
app.post('/posts/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        post.likes += 1;
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post. Please try again later.' });
    }
});

// Comment on a post (public)
app.post('/posts/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        post.comments.push(req.body);
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment. Please try again later.' });
    }
});

// Edit a post (only accessible to authenticated users)
app.put('/posts/:id', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post. Please try again later.' });
    }
});

// Delete a post (only accessible to authenticated users)
app.delete('/posts/:id', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post. Please try again later.' });
    }
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Hardcoded credentials for testing
    const hardcodedUsername = 'Donia';
    const hardcodedPassword = 'securepassword';

    if (username === hardcodedUsername && password === hardcodedPassword) {
        req.session.user = username;  // Store the username in session
        return res.status(200).json({ message: 'Login successful' });
    } else {
        return res.status(401).json({ message: 'Invalid username or password' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
