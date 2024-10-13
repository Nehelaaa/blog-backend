document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('blog-form');
    const titleInput = document.getElementById('blog-title');
    const contentInput = document.getElementById('blog-content');
    const imageInput = document.getElementById('blog-image');
    const postsContainer = document.getElementById('posts-container');

    const savedPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    savedPosts.forEach(post => displayPost(post));

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (imageInput.files.length > 0) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPost = {
                    id: Date.now(),
                    title: titleInput.value,
                    content: contentInput.value,
                    image: reader.result,
                    likes: 0
                };
                savedPosts.push(newPost);
                localStorage.setItem('blogPosts', JSON.stringify(savedPosts));
                displayPost(newPost);
                clearForm();
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            const newPost = {
                id: Date.now(),
                title: titleInput.value,
                content: contentInput.value,
                image: null,
                likes: 0
            };
            savedPosts.push(newPost);
            localStorage.setItem('blogPosts', JSON.stringify(savedPosts));
            displayPost(newPost);
            clearForm();
        }
    });

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
        deleteBtn.addEventListener('click', () => {
            postsContainer.removeChild(postDiv);
            const updatedPosts = savedPosts.filter(p => p.id !== post.id);
            localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
        });

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-icon');
        editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editBtn.addEventListener('click', () => {
            const updatedTitle = prompt('Edit the title:', post.title);
            const updatedContent = prompt('Edit the content:', post.content);

            if (updatedTitle !== null) post.title = updatedTitle;
            if (updatedContent !== null) post.content = updatedContent;

            postTitle.textContent = post.title;
            postContent.textContent = post.content;

            const updatedPosts = savedPosts.map(p => p.id === post.id ? post : p);
            localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
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

        likeBtn.addEventListener('click', () => {
            if (post.liked) {
                post.likes -= 1;
                post.liked = false;
                likeBtn.classList.remove('liked');
            } else {
                post.likes += 1;
                post.liked = true;
                likeBtn.classList.add('liked');
            }

            likeCounter.textContent = `${post.likes} like${post.likes !== 1 ? 's' : ''}`;

            const updatedPosts = savedPosts.map(p => p.id === post.id ? post : p);
            localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
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

    function clearForm() {
        titleInput.value = '';
        contentInput.value = '';
        imageInput.value = '';
    }
});