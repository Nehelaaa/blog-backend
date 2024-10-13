document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://blog-backend-sdx3.onrender.com'; // Replace with your backend API URL
    const form = document.getElementById('blog-form');
    const titleInput = document.getElementById('blog-title');
    const contentInput = document.getElementById('blog-content');
    const imageInput = document.getElementById('blog-image');
    const postsContainer = document.getElementById('posts-container');
    const newPostForm = document.getElementById('new-post');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    let loggedIn = false;

    // Hide posting form initially for public users
    newPostForm.style.display = 'none';

    // Fetch and display posts from backend when the page loads
    fetchPosts();

    // Login logic
    loginBtn.addEventListener('click', async () => {
        const username = prompt('Enter username');
        const password = prompt('Enter password');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                alert('Login successful');
                loggedIn = true;
                toggleLoginState();
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    });

    // Logout logic
    logoutBtn.addEventListener('click', () => {
        loggedIn = false;
        toggleLoginState();
    });

    // Toggle between login and logout state
    function toggleLoginState() {
        if (loggedIn) {
            newPostForm.style.display = 'block'; // Show the post form for Donia
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            showEditAndDeleteButtons(); // Enable edit and delete buttons for logged-in user
        } else {
            newPostForm.style.display = 'none'; // Hide the post form for public
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            hideEditAndDeleteButtons(); // Disable edit and delete buttons for public users
        }
    }

    // Form submission event to create a new post
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', titleInput.value);
        formData.append('content', contentInput.value);
        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const newPost = await response.json();
            displayPost(newPost);
            clearForm();
        } catch (error) {
            console.error('Error creating post:', error);
        }
    });

    // Fetch posts from the backend and display them
    async function fetchPosts() {
        try {
            const response = await fetch(`${API_URL}/posts`);
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const posts = await response.json();
            posts.forEach(post => displayPost(post));
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
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
                    method: 'POST'
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

        // Comment button
        const commentBtn = document.createElement('button');
        commentBtn.classList.add('comment-icon');
        commentBtn.innerHTML = '<i class="fas fa-comments"></i>';
        const commentsDiv = document.createElement('div');
        commentsDiv.classList.add('comments-section');
        commentsDiv.style.display = 'none';  // Initially hide comments section

        commentBtn.addEventListener('click', () => {
            commentsDiv.style.display = commentsDiv.style.display === 'none' ? 'block' : 'none';  // Toggle visibility
        });

        actionsDiv.appendChild(likeBtn);
        actionsDiv.appendChild(likeCounter);
        actionsDiv.appendChild(commentBtn);

        // Add edit and delete buttons for logged-in user
        if (loggedIn) {
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-icon');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => editPost(post._id)); // Edit post logic
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-icon');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deletePost(post._id)); // Delete post logic
            actionsDiv.appendChild(deleteBtn);
        }

        postDiv.appendChild(postTitle);
        postDiv.appendChild(postContent);
        postDiv.appendChild(actionsDiv);
        postsContainer.prepend(postDiv);
    }

    // Clear form inputs after submission
    function clearForm() {
        titleInput.value = '';
        contentInput.value = '';
        imageInput.value = '';
    }

    // Function to edit post (logic to be implemented)
    function editPost(postId) {
        alert(`Edit post: ${postId}`);
        // You can add the logic for fetching the post data and populating the form for editing.
    }

    // Function to delete post
    async function deletePost(postId) {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            alert('Post deleted successfully');
            location.reload(); // Reload the page to refresh posts
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }

    // Show edit and delete buttons for logged-in users
    function showEditAndDeleteButtons() {
        const editIcons = document.querySelectorAll('.edit-icon');
        const deleteIcons = document.querySelectorAll('.delete-icon');
        editIcons.forEach(icon => icon.style.display = 'block');
        deleteIcons.forEach(icon => icon.style.display = 'block');
    }

    // Hide edit and delete buttons for public users
    function hideEditAndDeleteButtons() {
        const editIcons = document.querySelectorAll('.edit-icon');
        const deleteIcons = document.querySelectorAll('.delete-icon');
        editIcons.forEach(icon => icon.style.display = 'none');
        deleteIcons.forEach(icon => icon.style.display = 'none');
    }
});
