const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blogDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define the Post schema
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    image: String,
    likes: { type: Number, default: 0 },
    comments: [{ username: String, text: String }],
});

// Post model
const Post = mongoose.model('Post', postSchema);

// Create a new post
app.post('/posts', async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
});

// Get all posts
app.get('/posts', async (req, res) => {
    const posts = await Post.find();
    res.status(200).json(posts);
});

// Like a post
app.post('/posts/:id/like', async (req, res) => {
    const post = await Post.findById(req.params.id);
    post.likes += 1;
    await post.save();
    res.status(200).json(post);
});

// Comment on a post
app.post('/posts/:id/comment', async (req, res) => {
    const post = await Post.findById(req.params.id);
    post.comments.push(req.body);
    await post.save();
    res.status(200).json(post);
});

// Start the server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
