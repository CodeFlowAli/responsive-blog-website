

        // Sample Data Storage (in real app, this would be a backend)
        let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let isAdminLoggedIn = currentUser ? true : false;

        // DOM Elements
        const mainWebsite = document.getElementById('main-website');
        const loginPage = document.getElementById('login-page');
        const adminPanel = document.getElementById('admin-panel');
        const postsContainer = document.getElementById('posts-container');
        const singlePostContainer = document.getElementById('single-post-container');
        const adminPostsList = document.getElementById('admin-posts-list');
        const noPostsMessage = document.getElementById('no-posts-message');

        // Navigation Functions
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Don't set active nav link for single post page
            if (pageId !== 'single-post-page') {
                const pageName = pageId.split('-')[0];
                const navLink = document.querySelector(`[data-page="${pageName}"]`);
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
            
            // Load posts if home page
            if (pageId === 'home-page') {
                loadPosts();
            }
        }

        // Load posts to main website
        function loadPosts() {
            postsContainer.innerHTML = '';
            const publishedPosts = posts.filter(post => post.status === 'published');
            
            if (publishedPosts.length === 0) {
                postsContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">No posts yet. Check back soon!</p>';
                return;
            }
            
            publishedPosts.forEach((post, index) => {
                const postElement = document.createElement('div');
                postElement.className = 'post-card';
                postElement.innerHTML = `
                    ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-image">` : 
                      '<div class="post-image" style="background: linear-gradient(135deg, #3498db, #2c3e50); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📝</div>'}
                    <div class="post-content">
                        <div class="post-date">${new Date(post.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</div>
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-excerpt">${post.excerpt}</p>
                        <a href="#" class="read-more" onclick="viewSinglePost(${index}); return false;">Read More →</a>
                    </div>
                `;
                postsContainer.appendChild(postElement);
            });
        }

        // View single post
        function viewSinglePost(index) {
            const post = posts[index];
            
            // Format the date
            const postDate = new Date(post.date);
            const formattedDate = postDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create single post content
            singlePostContainer.innerHTML = `
                ${post.image ? `<img src="${post.image}" alt="${post.title}" class="single-post-image">` : 
                  '<div class="single-post-image" style="background: linear-gradient(135deg, #3498db, #2c3e50); display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">📝</div>'}
                <div class="single-post-content">
                    <div class="single-post-header">
                        <h1 class="single-post-title">${post.title}</h1>
                        <div class="post-meta">
                            Published on ${formattedDate}
                            ${post.category ? `<span class="post-category">${post.category}</span>` : ''}
                        </div>
                    </div>
                    <div class="post-body">
                        ${formatPostContent(post.content)}
                    </div>
                    <button class="back-button" onclick="showPage('home-page')">← Back to All Posts</button>
                </div>
            `;
            
            // Show single post page
            showPage('single-post-page');
        }

        // Format post content (convert line breaks to paragraphs)
        function formatPostContent(content) {
            // Split content by double line breaks
            const paragraphs = content.split('\n\n');
            
            // Wrap each paragraph in <p> tags
            return paragraphs.map(para => {
                if (para.trim()) {
                    return `<p>${para}</p>`;
                }
                return '';
            }).join('');
        }

        // Load posts to admin panel
        function loadAdminPosts() {
            adminPostsList.innerHTML = '';
            
            if (posts.length === 0) {
                noPostsMessage.style.display = 'block';
                return;
            }
            
            noPostsMessage.style.display = 'none';
            
            posts.forEach((post, index) => {
                const postElement = document.createElement('div');
                postElement.className = 'post-item';
                postElement.innerHTML = `
                    <div>
                        <h4>${post.title}</h4>
                        <small>${new Date(post.date).toLocaleDateString()} • ${post.status}</small>
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-edit" onclick="editPost(${index})">Edit</button>
                        <button class="btn btn-delete" onclick="deletePost(${index})">Delete</button>
                    </div>
                `;
                adminPostsList.appendChild(postElement);
            });
        }

        // Edit post
        function editPost(index) {
            const post = posts[index];
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-excerpt').value = post.excerpt;
            document.getElementById('post-content').value = post.content;
            document.getElementById('post-image').value = post.image || '';
            document.getElementById('post-category').value = post.category || '';
            
            // Change form to edit mode
            const form = document.getElementById('post-form');
            form.dataset.editIndex = index;
            form.querySelector('button[type="submit"]').textContent = 'Update Post';
            
            // Show add post section
            showAdminSection('add-post');
        }

        // Delete post
        function deletePost(index) {
            if (confirm('Are you sure you want to delete this post?')) {
                posts.splice(index, 1);
                savePosts();
                loadAdminPosts();
                updateStats();
                
                // If we're viewing the deleted post, go back to home
                const currentPage = document.querySelector('.page.active').id;
                if (currentPage === 'single-post-page') {
                    showPage('home-page');
                }
            }
        }

        // Save posts to localStorage
        function savePosts() {
            localStorage.setItem('blogPosts', JSON.stringify(posts));
        }

        // Update dashboard stats
        function updateStats() {
            const totalPosts = posts.length;
            const publishedPosts = posts.filter(post => post.status === 'published').length;
            const draftPosts = posts.filter(post => post.status === 'draft').length;
            
            document.getElementById('total-posts').textContent = totalPosts;
            document.getElementById('published-posts').textContent = publishedPosts;
            document.getElementById('draft-posts').textContent = draftPosts;
        }

        // Admin Navigation
        function showAdminSection(sectionId) {
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${sectionId}-section`).classList.add('active');
            
            document.querySelectorAll('.admin-nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Check if user is already logged in
            if (isAdminLoggedIn) {
                mainWebsite.style.display = 'none';
                adminPanel.style.display = 'block';
                loadAdminPosts();
                updateStats();
            }
            
            // Load initial posts
            loadPosts();
            
            // Navigation event listeners
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = link.getAttribute('data-page');
                    showPage(`${page}-page`);
                });
            });
            
            // Admin login link
            document.getElementById('admin-login-link').addEventListener('click', (e) => {
                e.preventDefault();
                mainWebsite.style.display = 'none';
                loginPage.style.display = 'block';
            });
            
            // Back to blog from login
            document.getElementById('back-to-blog').addEventListener('click', (e) => {
                e.preventDefault();
                loginPage.style.display = 'none';
                mainWebsite.style.display = 'block';
            });
            
            // Login functionality
            document.getElementById('login-btn').addEventListener('click', () => {
                const username = document.getElementById('admin-username').value;
                const password = document.getElementById('admin-password').value;
                
                // Simple authentication (in real app, use secure authentication)
                if (username === 'codeflowali' && password === 'AliYameen') {
                    localStorage.setItem('currentUser', JSON.stringify({ username }));
                    loginPage.style.display = 'none';
                    adminPanel.style.display = 'block';
                    loadAdminPosts();
                    updateStats();
                } else {
                    alert(" pleas Enter A correct Password and Username")
                    // alert('Invalid credentials! Try admin/admin123');
                }
            });
            
            // Logout functionality
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                adminPanel.style.display = 'none';
                mainWebsite.style.display = 'block';
                showPage('home-page');
            });
            
            // Admin navigation
            document.querySelectorAll('.admin-nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = link.getAttribute('data-section');
                    showAdminSection(section);
                });
            });
            
            // Post form submission
            document.getElementById('post-form').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const title = document.getElementById('post-title').value;
                const excerpt = document.getElementById('post-excerpt').value;
                const content = document.getElementById('post-content').value;
                const image = document.getElementById('post-image').value;
                const category = document.getElementById('post-category').value;
                const editIndex = e.target.dataset.editIndex;
                
                const post = {
                    title,
                    excerpt,
                    content,
                    image,
                    category,
                    date: new Date().toISOString(),
                    status: 'published'
                };
                
                if (editIndex !== undefined) {
                    // Update existing post
                    posts[editIndex] = post;
                } else {
                    // Add new post
                    posts.unshift(post);
                }
                
                savePosts();
                loadAdminPosts();
                updateStats();
                loadPosts(); // Refresh main website posts
                
                // Reset form
                e.target.reset();
                delete e.target.dataset.editIndex;
                e.target.querySelector('button[type="submit"]').textContent = 'Publish Post';
                
                alert(editIndex !== undefined ? 'Post updated successfully!' : 'Post published successfully!');
                showAdminSection('manage-posts');
            });
            
            // Save as draft
            document.getElementById('save-draft').addEventListener('click', () => {
                const title = document.getElementById('post-title').value;
                const excerpt = document.getElementById('post-excerpt').value;
                const content = document.getElementById('post-content').value;
                const image = document.getElementById('post-image').value;
                const category = document.getElementById('post-category').value;
                
                if (!title || !content) {
                    alert('Please fill in at least title and content');
                    return;
                }
                
                const post = {
                    title,
                    excerpt,
                    content,
                    image,
                    category,
                    date: new Date().toISOString(),
                    status: 'draft'
                };
                
                posts.unshift(post);
                savePosts();
                loadAdminPosts();
                updateStats();
                
                document.getElementById('post-form').reset();
                alert('Post saved as draft!');
                showAdminSection('manage-posts');
            });
            
            // Contact form
            document.getElementById('send-message').addEventListener('click', () => {
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const message = document.getElementById('message').value;
                
                if (!name || !email || !message) {
                    alert('Please fill in all fields');
                    return;
                }
                
                // In a real app, this would send to a server
                alert('Thank you for your message! We\'ll get back to you soon.');
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('message').value = '';
            });
        });

        // Add some sample posts if empty
        if (posts.length === 0) {
            posts = [
                {
                    title: "Welcome to Our Blog",
                    excerpt: "This is the beginning of our journey. Join us as we explore interesting topics and share insights.",
                    content: `Welcome to SimpleBlog! We're excited to have you here as we embark on this journey of sharing knowledge, stories, and ideas.

This platform is designed for everyone who has something valuable to share with the world. Whether you're a writer, a thinker, or just someone with interesting experiences, you've found the right place.

In our blog, we'll cover a variety of topics including technology, lifestyle, health, education, and personal development. Our goal is to create content that informs, inspires, and entertains.

Stay tuned for regular updates, and don't forget to subscribe to our newsletter to never miss a post!`,
                    image: "",
                    category: "General",
                    date: new Date().toISOString(),
                    status: "published"
                },
                {
                    title: "The Importance of Web Design",
                    excerpt: "How good design can impact user experience and business success.",
                    content: `Web design is not just about making things look pretty. It's a crucial element that determines how users interact with your website and, ultimately, your business success.

First impressions matter. Studies show that users form an opinion about your website in just 0.05 seconds. That's why good web design is essential for creating a positive first impression.

A well-designed website improves user experience by making navigation intuitive and content easily accessible. When users can find what they're looking for quickly and effortlessly, they're more likely to stay on your site longer and convert into customers.

Good web design also builds trust and credibility. A professional-looking website signals to visitors that you're a legitimate business that cares about quality.

Moreover, responsive design ensures your website looks great and functions well on all devices, from desktop computers to smartphones. With mobile internet usage surpassing desktop, this is no longer optional.

Finally, good design contributes to better SEO rankings. Search engines favor websites with good user experience, fast loading times, and mobile responsiveness.

In conclusion, investing in good web design is investing in your business's success. It's not an expense, but rather a valuable asset that pays dividends in user engagement, conversions, and brand reputation.`,
                    image: "",
                    category: "Technology",
                    date: new Date().toISOString(),
                    status: "published"
                },
                {
                    title: "The Benefits of Regular Exercise",
                    excerpt: "Discover how regular physical activity can transform your physical and mental health.",
                    content: `Regular exercise is one of the most important things you can do for your health. The benefits of physical activity extend far beyond weight management and can significantly improve your quality of life.

Physical benefits of regular exercise include:

1. Weight management and prevention of obesity
2. Reduced risk of chronic diseases like heart disease, type 2 diabetes, and certain cancers
3. Stronger bones and muscles
4. Improved cardiovascular health
5. Better sleep quality
6. Increased energy levels

Mental health benefits are equally important:

1. Reduced symptoms of depression and anxiety
2. Improved mood and emotional well-being
3. Better cognitive function and memory
4. Reduced stress levels
5. Increased self-esteem and confidence

The key to reaping these benefits is consistency. The World Health Organization recommends at least 150 minutes of moderate-intensity aerobic physical activity throughout the week for adults aged 18-64.

You don't need to become a gym enthusiast overnight. Start with small, manageable goals like a 30-minute walk five days a week, and gradually increase intensity and variety.

Remember, the best exercise is the one you enjoy and can stick with long-term. Whether it's walking, cycling, swimming, dancing, or team sports, find activities that bring you joy.

Make exercise a regular part of your routine, and you'll soon experience the transformative effects on both your body and mind.`,
                    image: "",
                    category: "Health",
                    date: new Date().toISOString(),
                    status: "published"
                }
            ];
            savePosts();
        }
 