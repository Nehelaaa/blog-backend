document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://blog-backend-sdx3.onrender.com'; // Replace with your backend API URL
    const form = document.getElementById('blog-form');
    const titleInput = document.getElementById('blog-title');
    const contentInput = document.getElementById('blog-content');
    const imageInput = document.getElementById('blog-image');
    const postsContainer = document.getElementById('posts-container');

    // Fetch and display posts from backend when the page loads
    fetchPosts();

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
            postImage.src = post.image;
            postDiv.appendChild(postImage);
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('post-actions');

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-icon');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_URL}/posts/${post._id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    throw new Error('Failed to delete post');
                }
                postsContainer.removeChild(postDiv);
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        });

        // Add a "View Comments" button
        const viewCommentsBtn = document.createElement('button');
        viewCommentsBtn.textContent = 'View Comments';
        viewCommentsBtn.addEventListener('click', () => {
            showCommentsOverlay(post);
        });

        actionsDiv.appendChild(deleteBtn);
        actionsDiv.appendChild(viewCommentsBtn);

        postDiv.appendChild(postTitle);
        postDiv.appendChild(postContent);
        postDiv.appendChild(actionsDiv);

        postsContainer.prepend(postDiv);
    }

    // Show an overlay for comments
    function showCommentsOverlay(post) {
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');

        const postTitle = document.createElement('h3');
        postTitle.textContent = post.title;

        const postContent = document.createElement('p');
        postContent.textContent = post.content;

        const commentsDiv = document.createElement('div');
        commentsDiv.classList.add('comments');
        post.comments.forEach(comment => {
            const commentElement = document.createElement('p');
            commentElement.textContent = `${comment.username}: ${comment.text}`;
            commentsDiv.appendChild(commentElement);
        });

        const addCommentInput = document.createElement('input');
        addCommentInput.placeholder = 'Leave a comment';

        const submitCommentBtn = document.createElement('button');
        submitCommentBtn.textContent = 'Submit';
        submitCommentBtn.addEventListener('click', async () => {
            const newComment = { username: 'Guest', text: addCommentInput.value };
            try {
                const response = await fetch(`${API_URL}/posts/${post._id}/comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newComment)
                });

                if (!response.ok) {
                    throw new Error('Failed to add comment');
                }

                const updatedPost = await response.json();
                commentsDiv.innerHTML = '';
                updatedPost.comments.forEach(comment => {
                    const commentElement = document.createElement('p');
                    commentElement.textContent = `${comment.username}: ${comment.text}`;
                    commentsDiv.appendChild(commentElement);
                });
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        });

        overlay.appendChild(postTitle);
        overlay.appendChild(postContent);
        overlay.appendChild(commentsDiv);
        overlay.appendChild(addCommentInput);
        overlay.appendChild(submitCommentBtn);

        document.body.appendChild(overlay);

        // Close overlay when clicked outside
        overlay.addEventListener('click', () => {
            overlay.remove();
        });
    }

    // Clear form inputs after submission
    function clearForm() {
        titleInput.value = '';
        contentInput.value = '';
        imageInput.value = '';
    }
});
