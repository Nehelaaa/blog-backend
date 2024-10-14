document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://blog-backend-sdx3.onrender.com'; // Replace with your backend API URL
    const form = document.getElementById('blog-form');
    const titleInput = document.getElementById('blog-title');
    const contentInput = document.getElementById('blog-content');
    const imageInput = document.getElementById('blog-image');
    const postsContainer = document.getElementById('posts-container');
    const newPostForm = document.getElementById('new-post');
    const profileIcon = document.getElementById('profile-icon');
    const loginModal = document.getElementById('login-modal');
    const loginSubmitBtn = document.getElementById('login-submit');
    const logoutBtn = document.getElementById('logout-btn');
    let token = '';  // Store token or session

    let loggedIn = false;

    // Check if all necessary elements are present before proceeding
    if (!form || !newPostForm || !profileIcon || !loginModal || !loginSubmitBtn || !logoutBtn) {
        console.error('One or more required elements are missing from the DOM.');
        return;
    }

    // Hide posting form initially for public users
    newPostForm.style.display = 'none';

    // Fetch and display posts from backend when the page loads
    fetchPosts();  // Ensure posts are fetched for everyone

    // Profile Icon triggers login modal
    profileIcon.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    // Close login modal
    document.querySelector('.close').addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    // Login logic
    loginSubmitBtn.addEventListener('click', async () => {
        const username = document.getElementById('modal-username').value;
        const password = document.getElementById('modal-password').value;

        await login(username, password);
    });

    // Trigger login on 'Enter' keypress in password field
    document.getElementById('modal-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            loginSubmitBtn.click();
        }
    });

    async function login(username, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                token = data.token;  // Store the token for further authenticated requests
                alert('Login successful');
                loggedIn = true;
                loginModal.style.display = 'none';  // Hide login modal after successful login
                toggleLoginState();
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    // Logout logic
    logoutBtn.addEventListener('click', () => {
        loggedIn = false;
        token = '';  // Clear token on logout
        toggleLoginState();
    });

    // Toggle between login and logout state
    function toggleLoginState() {
        if (newPostForm && profileIcon && logoutBtn) {
            if (loggedIn) {
                newPostForm.style.display = 'block'; // Show the post form for logged-in users
                profileIcon.style.display = 'none';  // Hide profile icon when logged in
                logoutBtn.style.display = 'block';   // Show logout button
            } else {
                newPostForm.style.display = 'none';  // Hide the post form for public users
                profileIcon.style.display = 'block';  // Show profile icon
                logoutBtn.style.display = 'none';     // Hide logout button
            }
        } else {
            console.error('Cannot toggle login state. Missing elements.');
        }
    }

    // Fetch posts from the backend and display them for public and logged-in users
    async function fetchPosts() {
        try {
            const response = await fetch(`${API_URL}/posts`);
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const posts = await response.json();
            posts.forEach(post => displayPost(post));  // Display posts for everyone
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    // Add post logic (Updated with preventDefault and token authentication)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();  // Prevent the default form submission (page reload)

        const formData = new FormData();
        formData.append('title', titleInput.value);
        formData.append('content', contentInput.value);
        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`  // Pass the token for authentication
                },
                body: formData
            });

            if (response.ok) {
                const newPost = await response.json();
                displayPost(newPost);  // Add the new post to the display
                form.reset();  // Clear the form after adding post
                alert('Post added successfully!');  // Provide feedback to user
            } else {
                alert('Failed to add post');
            }
        } catch (error) {
            console.error('Error adding post:', error);
        }
    });

    // Display a single post
    function displayPost(post) {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');

        const postTitle = document.createElement('h3');
        postTitle.classList.add('post-title');
        postTitle.textContent = post.title;

        const postContent = document.createElement('p');
        postContent.classList.add('post-content');
        postContent.textContent = post.content;

        if (post.image) {
            const postImage = document.createElement('img');
            postImage.classList.add('post-image');
            postImage.src = `${API_URL}/${post.image}`;
            postDiv.appendChild(postImage);
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('post-actions');

        // Like button
        const likeBtn = document.createElement('button');
        likeBtn.classList.add('like-icon');
        likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        const likeCounter = document.createElement('span');
        likeCounter.classList.add('like-counter');
        likeCounter.textContent = `${post.likes} like${post.likes !== 1 ? 's' : ''}`;

        likeBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_URL}/posts/${post._id}/like`, {
                    method: 'POST',
                    headers: loggedIn ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (!response.ok) {
                    throw new Error('Failed to like post');
                }

                const updatedPost = await response.json();
                post.likes = updatedPost.likes;
                likeCounter.textContent = `${post.likes} like${post.likes !== 1 ? 's' : ''}`;
                likeBtn.classList.toggle('liked');
            } catch (error) {
                console.error('Error liking post:', error);
            }
        });

        actionsDiv.appendChild(likeBtn);
        actionsDiv.appendChild(likeCounter);

        // Add edit and delete buttons if logged in
        if (loggedIn) {
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-icon');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => editPost(post._id));  // Edit post logic
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-icon');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deletePost(post._id));  // Delete post logic
            actionsDiv.appendChild(deleteBtn);
        }

        postDiv.appendChild(postTitle);
        postDiv.appendChild(postContent);
        postDiv.appendChild(actionsDiv);
        postsContainer.prepend(postDiv);  // Add the new post to the top of the container
    }

    // Function to edit post (logic to be implemented)
    function editPost(postId) {
        alert(`Edit post: ${postId}`);
        // Logic for editing the post can be added here
    }

    // Function to delete post
    async function deletePost(postId) {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            alert('Post deleted successfully');
            location.reload();  // Reload the page to refresh posts
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }
});
