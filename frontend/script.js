document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://blog-backend-sdx3.onrender.com'; // Replace with your backend API URL
    const form = document.getElementById('blog-form');
    const titleInput = document.getElementById('blog-title');
    const contentInput = document.getElementById('blog-content');
    const imageInput = document.getElementById('blog-image');
    const postsContainer = document.getElementById('posts-container');
    
    // Variables for authentication
    let isAuthenticated = false;  // Will be set to true after successful login
    let token = '';  // Store token after successful login

    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const profileIcon = document.getElementById('profile-icon');
    const closeModal = document.querySelector('.close');
    const loginError = document.getElementById('login-error');

    // Open the login modal when the profile icon is clicked
    profileIcon.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    // Close the login modal
    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    // Form submission event for login
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            token = data.token;  // Store token for authenticated actions
            isAuthenticated = true;

            // Hide the login modal after successful login
            loginModal.style.display = 'none';
            loginError.style.display = 'none';
        } catch (error) {
            loginError.textContent = 'Invalid username or password';
            loginError.style.display = 'block';
        }
    });

    // Fetch and display posts from the backend when the page loads
    fetchPosts();

    // Form submission event to create a new post
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!isAuthenticated) {
            alert('You must be logged in to create a post.');
            return;
        }

        const formData = new FormData();
        formData.append('title', titleInput.value);
        formData.append('content', contentInput.value);
        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
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

        // Allow delete/edit only if authenticated
        if (isAuthenticated) {
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-icon');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch(`${API_URL}/posts/${post._id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        throw new Error('Failed to delete post');
                    }
                    postsContainer.removeChild(postDiv);
                } catch (error) {
                    console.error('Error deleting post:', error);
                }
            });

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-icon');
            editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            editBtn.addEventListener('click', async () => {
                const updatedTitle = prompt('Edit the title:', post.title);
                const updatedContent = prompt('Edit the content:', post.content);

                if (updatedTitle !== null && updatedContent !== null) {
                    post.title = updatedTitle;
                    post.content = updatedContent;

                    try {
                        const response = await fetch(`${API_URL}/posts/${post._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ title: updatedTitle, content: updatedContent })
                        });

                        if (!response.ok) {
                            throw new Error('Failed to update post');
                        }

                        postTitle.textContent = post.title;
                        postContent.textContent = post.content;
                    } catch (error) {
                        console.error('Error updating post:', error);
                    }
                }
            });

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
        }

        // Like button
        const likeBtn = document.createElement('button');
        likeBtn.classList.add('like-icon');
        likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        if (post.liked) {
            likeBtn.classList.add('liked');
        }
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
                post.liked = !post.liked;

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

        // Fetch and display comments
        async function fetchComments() {
            try {
                post.comments.forEach(comment => {
                    const commentDiv = document.createElement('div');
                    commentDiv.classList.add('comment');
                    commentDiv.innerHTML = `<strong>${comment.username}:</strong> ${comment.text}`;
                    commentsDiv.appendChild(commentDiv);
                });
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        }

        fetchComments();

        // Add the comment input
        const commentInput = document.createElement('input');
        commentInput.type = 'text';
        commentInput.placeholder = 'Leave a comment...';
        const commentSubmitBtn = document.createElement('button');
        commentSubmitBtn.textContent = 'Comment';

        commentSubmitBtn.addEventListener('click', async () => {
            const commentText = commentInput.value;
            if (!commentText) return;

            try {
                const response = await fetch(`${API_URL}/posts/${post._id}/comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: 'Anonymous', text: commentText })  // You can replace with real username logic
                });

                if (!response.ok) {
                    throw new Error('Failed to add comment');
                }

                const updatedPost = await response.json();
                post.comments = updatedPost.comments;

                // Add new comment to the commentsDiv
                const newCommentDiv = document.createElement('div');
                newCommentDiv.classList.add('comment');
                newCommentDiv.innerHTML = `<strong>Anonymous:</strong> ${commentText}`;
                commentsDiv.appendChild(newCommentDiv);
                commentInput.value = '';  // Clear input
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        });

        actionsDiv.appendChild(likeBtn);
        actionsDiv.appendChild(likeCounter);
        actionsDiv.appendChild(commentBtn);

        postDiv.appendChild(postTitle);
        postDiv.appendChild(postContent);
        postDiv.appendChild(actionsDiv);
        postDiv.appendChild(commentsDiv);
        postDiv.appendChild(commentInput);
        postDiv.appendChild(commentSubmitBtn);

        postsContainer.prepend(postDiv);
    }

    // Clear form inputs after submission
    function clearForm() {
        titleInput.value = '';
        contentInput.value = '';
        imageInput.value = '';
    }
});
