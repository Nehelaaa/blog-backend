document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://blog-backend-sdx3.onrender.com'; // Replace with your backend API URL
    const form = document.getElementById('blog-form');
    const titleInput = document.getElementById('blog-title');
    const contentInput = document.getElementById('blog-content');
    const imageInput = document.getElementById('blog-image');
    const postsContainer = document.getElementById('posts-container');

    // Check if the DOM content is loaded
    console.log('DOM Content Loaded');

    // Fetch and display posts from backend when the page loads
    fetchPosts();

    // Form submission event to create a new post
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        console.log('Form submitted');

        const formData = new FormData();
        formData.append('title', titleInput.value);
        formData.append('content', contentInput.value);
        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        console.log('Form data:', formData);

        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const newPost = await response.json();
            console.log('Post created:', newPost);

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
            console.log('Posts fetched:', posts);
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
                            'Content-Type': 'application/json'
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

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        actionsDiv.appendChild(likeBtn);
        actionsDiv.appendChild(likeCounter);

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
});
