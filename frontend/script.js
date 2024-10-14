document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://blog-backend-sdx3.onrender.com'; // Backend API URL
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
    let token = '';  // Store session token
    let loggedIn = false;

    // Hide posting form for public users initially
    if (newPostForm) newPostForm.style.display = 'none';

    // Fetch and display posts on page load
    fetchPosts();

    // Open login modal when profile icon is clicked
    if (profileIcon) {
        profileIcon.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    // Close login modal
    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }

    // Handle login
    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', async () => {
            const username = document.getElementById('modal-username').value;
            const password = document.getElementById('modal-password').value;
            await login(username, password);
        });
    }

    // Submit login on Enter keypress
    const passwordField = document.getElementById('modal-password');
    if (passwordField) {
        passwordField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') loginSubmitBtn.click();
        });
    }

    async function login(username, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                token = data.token;  // Store session token
                console.log('Token received:', token);  // Debug token reception
                alert('Login successful');
                loggedIn = true;
                loginModal.style.display = 'none';  // Close modal after login
                toggleLoginState();
            } else {
                const errorData = await response.json();
                alert(`Login failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            loggedIn = false;
            token = '';  // Clear token
            toggleLoginState();
        });
    }

    // Toggle login/logout UI state
    function toggleLoginState() {
        if (loggedIn) {
            if (newPostForm) newPostForm.style.display = 'block'; // Show post form for logged-in users
            if (profileIcon) profileIcon.style.display = 'none';  // Hide profile icon
            if (logoutBtn) logoutBtn.style.display = 'block';  // Show logout button
        } else {
            if (newPostForm) newPostForm.style.display = 'none';  // Hide post form for public users
            if (profileIcon) profileIcon.style.display = 'block';  // Show profile icon
            if (logoutBtn) logoutBtn.style.display = 'none';  // Hide logout button
        }
    }

    // Fetch posts from backend
    async function fetchPosts() {
        try {
            const response = await fetch(`${API_URL}/posts`);
            if (!response.ok) throw new Error('Failed to fetch posts');
            const posts = await response.json();
            postsContainer.innerHTML = '';  // Clear previous posts
            posts.forEach(post => displayPost(post));
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    // Add new post
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();  // Prevent default form submission

            const formData = new FormData();
            formData.append('title', titleInput.value);
            formData.append('content', contentInput.value);
            formData.append('image', imageInput.files[0]);

            try {
                const response = await fetch(`${API_URL}/posts`, {
                    method: 'POST',
                    headers: {
                        'Session-Token': token  // Use the token as Session-Token
                    },
                    body: formData
                });

                if (response.ok) {
                    const newPost = await response.json();
                    displayPost(newPost);  // Display the newly added post
                    form.reset();  // Reset the form
                    alert('Post added successfully!');
                } else {
                    const errorData = await response.json();
                    console.error('Failed to add post:', errorData.message);
                    alert(`Failed to add post: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error adding post:', error);
                alert('Error adding post. Check console for details.');
            }
        });
    }

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
                    headers: { 'Session-Token': token }
                });

                if (!response.ok) throw new Error('Failed to like post');

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

        // Add edit and delete buttons for logged-in users
        if (loggedIn) {
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-icon');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => editPost(post._id));

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-icon');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deletePost(post._id));

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
        }

        postDiv.appendChild(postTitle);
        postDiv.appendChild(postContent);
        postDiv.appendChild(actionsDiv);
        postsContainer.prepend(postDiv);
    }

    // Placeholder functions for editing and deleting posts
    function editPost(postId) {
        alert(`Edit post: ${postId}`);
    }

    async function deletePost(postId) {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Session-Token': token }
            });

            if (!response.ok) throw new Error('Failed to delete post');

            alert('Post deleted successfully');
            location.reload();  // Reload the page
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }
});
