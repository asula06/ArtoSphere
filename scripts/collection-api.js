// Collection page - Load artworks from API and display with images
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Collection page loaded');
    
    // Add icons to static HTML cards that don't have them
    addIconsToStaticCards();
    
    // Load artworks from API
    await loadArtworksFromAPI();
    
    // Setup navigation
    setupNavigation();
    
    // Setup card interactions
    setupCardIcons();
    
    // Setup image modal
    setupImageModal();
});

// Add heart and cart icons to static HTML cards
function addIconsToStaticCards() {
    const cards = document.querySelectorAll('.photo-card');
    let cardIdCounter = 1;
    
    cards.forEach(card => {
        // Check if card already has card-actions
        if (card.querySelector('.card-actions')) {
            return; // Skip if already has icons
        }
        
        // Ensure card has a data-id attribute
        if (!card.getAttribute('data-id')) {
            card.setAttribute('data-id', cardIdCounter++);
        }
        
        // Create card actions
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        
        const heartBtn = document.createElement('button');
        heartBtn.className = 'heart-btn';
        heartBtn.setAttribute('aria-label', 'Add to favorites');
        heartBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
        actions.appendChild(heartBtn);
        
        const cartBtn = document.createElement('button');
        cartBtn.className = 'cart-btn add-to-cart-btn';
        cartBtn.setAttribute('aria-label', 'Add to cart');
        cartBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>';
        actions.appendChild(cartBtn);
        
        // Insert after thumb, before card-body
        const thumb = card.querySelector('.thumb');
        const cardBody = card.querySelector('.card-body');
        if (thumb && cardBody) {
            cardBody.parentNode.insertBefore(actions, cardBody);
        } else if (thumb) {
            thumb.parentNode.insertBefore(actions, thumb.nextSibling);
        }
    });
}

// Load artworks from API
async function loadArtworksFromAPI() {
    try {
        console.log('Starting to load artworks from API');
        console.log('API_BASE_URL:', typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'NOT DEFINED');
        const gallery = document.getElementById('gallery');
        console.log('Gallery element:', gallery);
        
        if (!gallery) {
            console.error('Gallery element not found!');
            return;
        }
        
        // Get artworks from API
        console.log('Calling ArtworkAPI.getAllArtworks()...');
        const artworks = await ArtworkAPI.getAllArtworks();
        console.log('Artworks received:', artworks);
        
        if (!artworks || artworks.length === 0) {
            console.warn('No artworks returned from API - keeping static HTML cards');
            // Don't clear gallery - keep the static HTML cards
            return;
        }
        
        // Clear existing static cards only if we have API data
        gallery.innerHTML = '';
        
        // Create cards for each artwork
        artworks.forEach(artwork => {
            console.log('Creating card for artwork:', artwork.title);
            const card = createArtworkCard(artwork);
            gallery.appendChild(card);
        });
        
        console.log(`Successfully loaded ${artworks.length} artworks from API`);
    } catch (error) {
        console.error('Error loading artworks:', error);
        console.error('Error stack:', error.stack);
        console.warn('API failed - keeping static HTML cards as fallback');
        // Don't clear the gallery on error - keep static cards
    }
}

// Create artwork card element
function createArtworkCard(artwork) {
    const card = document.createElement('article');
    card.className = 'photo-card';
    card.setAttribute('data-category', artwork.category.toLowerCase());
    card.setAttribute('data-id', artwork.id);
    
    // Get image URL - prefer uploaded image, fallback to imageUrl
    const hasUploadedImage = artwork.imageData && artwork.imageData !== null;
    let imageUrl;
    if (hasUploadedImage) {
        imageUrl = `${API_BASE_URL}/upload/artwork/${artwork.id}?t=${Date.now()}`;
    } else if (artwork.imageUrl) {
        imageUrl = artwork.imageUrl.startsWith('http') ? artwork.imageUrl : artwork.imageUrl;
    } else {
        imageUrl = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/%3E%3C/svg%3E';
    }
    
    // Create thumbnail section
    const thumb = document.createElement('a');
    thumb.className = 'thumb';
    
    const img = document.createElement('img');
    img.className = 'artwork-image';
    img.src = imageUrl;
    img.alt = artwork.title;
    img.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/%3E%3C/svg%3E';
    };
    thumb.appendChild(img);
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const viewText = document.createElement('span');
    viewText.className = 'view-text';
    viewText.textContent = 'VIEW';
    overlay.appendChild(viewText);
    thumb.appendChild(overlay);
    
    card.appendChild(thumb);
    
    // Create card body wrapper
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    // Create title
    const titleEl = document.createElement('h3');
    titleEl.className = 'card-title';
    titleEl.textContent = artwork.title;
    cardBody.appendChild(titleEl);
    
    // Create category
    const categoryEl = document.createElement('p');
    categoryEl.className = 'card-category';
    categoryEl.textContent = artwork.category;
    cardBody.appendChild(categoryEl);
    
    card.appendChild(cardBody);
    
    // Create card actions
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    
    const heartBtn = document.createElement('button');
    heartBtn.className = 'heart-btn';
    heartBtn.setAttribute('aria-label', 'Add to favorites');
    heartBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    actions.appendChild(heartBtn);
    
    const cartBtn = document.createElement('button');
    cartBtn.className = 'cart-btn add-to-cart-btn';
    cartBtn.dataset.id = artwork.id;
    cartBtn.setAttribute('aria-label', 'Add to cart');
    cartBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>';
    actions.appendChild(cartBtn);
    
    card.appendChild(actions);
    
    return card;
}

// Mobile hamburger + nav
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = Array.from(document.querySelectorAll('.navbar a:not(.nav-center)'));
    const mobileLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll('a')) : [];

    function closeMobile() {
        if (!hamburger || !mobileMenu) return;
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
    }
    
    function openMobile() {
        if (!hamburger || !mobileMenu) return;
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
    }

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', (e) => {
            const isOpen = hamburger.classList.contains('open');
            isOpen ? closeMobile() : openMobile();
        });

        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('open')) return;
            if (e.target === hamburger || hamburger.contains(e.target)) return;
            if (mobileMenu.contains(e.target)) return;
            closeMobile();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobile();
        });

        mobileLinks.forEach(a => {
            a.addEventListener('click', () => {
                navLinks.forEach(x => x.classList.remove('active'));
                const match = navLinks.find(x => x.getAttribute('href') === a.getAttribute('href'));
                if (match) match.classList.add('active');
                closeMobile();
            });
        });
    }

    function setActiveByPath() {
        const currentFile = window.location.pathname.split('/').pop() || 'collection.html';
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === currentFile));
        mobileLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === currentFile));
    }
    setActiveByPath();
}

// Setup card interactions
function setupCardIcons() {
    const gallery = document.getElementById('gallery');
    if (!gallery) {
        console.log('Gallery not found for card setup');
        return;
    }
    
    console.log('Setting up card interactions');
    
    // Use event delegation for dynamically added cards
    gallery.addEventListener('click', async (e) => {
        const heartBtn = e.target.closest('.heart-btn');
        const cartBtn = e.target.closest('.cart-btn');
        
        // Handle heart button click
        if (heartBtn) {
            e.preventDefault();
            e.stopPropagation();
            const card = heartBtn.closest('.photo-card');
            const artworkId = card.getAttribute('data-id');
            
            if (!artworkId) {
                console.error('No artwork ID found on card');
                alert('❌ Error: Artwork ID not found');
                return;
            }
            
            // Disable button to prevent double clicks
            heartBtn.disabled = true;
            
            try {
                console.log('Adding to favorites, artwork ID:', artworkId);
                const result = await FavoritesAPI.addToFavorites(parseInt(artworkId));

                if (result?.status === 'added') {
                    heartBtn.classList.add('is-favorite');
                    alert('✅ Added to favorites! ❤️');
                } else if (result?.status === 'exists') {
                    heartBtn.classList.add('is-favorite');
                    alert('ℹ️ This artwork is already in your favorites');
                } else {
                    alert('❌ ' + (result?.message || 'Error adding to favorites'));
                    console.error('Favorites error:', result);
                }
            } catch (error) {
                console.error('Favorites error:', error);
                alert('❌ Error adding to favorites. Please make sure the API is running.');
            } finally {
                // Re-enable button
                heartBtn.disabled = false;
            }
        }
        
        // Handle cart button click
        if (cartBtn) {
            e.preventDefault();
            e.stopPropagation();
            const card = cartBtn.closest('.photo-card');
            const artworkId = card.getAttribute('data-id');
            
            if (!artworkId) {
                console.error('No artwork ID found on card');
                alert('❌ Error: Artwork ID not found');
                return;
            }
            
            // Disable button to prevent double clicks
            cartBtn.disabled = true;
            
            try {
                console.log('Adding to cart, artwork ID:', artworkId);
                const result = await CartAPI.addToCart(parseInt(artworkId), 1);
                if (result?.status === 'added') {
                    alert('✅ Added to cart! 🛒');
                    // Update cart counter if function exists
                    if (typeof updateCartCounter === 'function') {
                        updateCartCounter();
                    }
                } else {
                    alert('❌ ' + (result?.message || 'Error adding to cart'));
                    console.error('Cart error:', result);
                }
            } catch (error) {
                console.error('Cart error:', error);
                alert('❌ Error adding to cart. Please make sure the API is running.');
            } finally {
                // Re-enable button
                cartBtn.disabled = false;
            }
        }
    });
}

// Image modal functionality
function setupImageModal() {
    const modal = document.getElementById('artModal');
    const modalImage = document.getElementById('artModalImage');
    const modalClose = document.getElementById('artModalClose');
    
    if (!modal) return;
    
    // Store artworks for reference
    let allArtworks = [];
    
    // Get the gallery to find all cards
    const gallery = document.getElementById('gallery');
    
    // Load artworks data when cards are created
    (async () => {
        allArtworks = await ArtworkAPI.getAllArtworks();
    })();
    
    // Click on image or VIEW button to open modal
    gallery.querySelectorAll('.thumb').forEach(thumb => {
        thumb.style.cursor = 'pointer';
        thumb.addEventListener('click', (e) => {
            e.preventDefault();
            const card = thumb.closest('.photo-card');
            const img = thumb.querySelector('img');
            const title = card.querySelector('.card-title');
            const artworkId = parseInt(card.getAttribute('data-id'));
            
            // Find artwork data
            const artwork = allArtworks.find(a => a.id === artworkId);
            
            if (artwork && img && img.src) {
                // Set modal image
                if (modalImage) {
                    modalImage.src = img.src;
                    modalImage.alt = artwork.title;
                }
                
                // Set modal title
                const modalTitle = document.getElementById('artModalTitle');
                if (modalTitle) {
                    modalTitle.textContent = artwork.title;
                }
                
                // Set modal artist
                const modalArtist = document.getElementById('artModalArtist');
                if (modalArtist) {
                    modalArtist.textContent = artwork.artist || 'Unknown';
                }
                
                // Set modal price
                const modalPrice = document.getElementById('artModalPrice');
                if (modalPrice) {
                    modalPrice.textContent = `$${artwork.price.toLocaleString()}`;
                }
                
                // Set modal category (as classification)
                const modalCategory = document.getElementById('artModalClassification');
                if (modalCategory) {
                    modalCategory.textContent = artwork.category || 'N/A';
                }
                
                // Set modal date (createdDate)
                const modalDate = document.getElementById('artModalDate');
                if (modalDate) {
                    const dateStr = artwork.createdDate ? new Date(artwork.createdDate).getFullYear() : 'N/A';
                    modalDate.textContent = dateStr;
                }
                
                // Set modal description
                const modalText = document.getElementById('artModalText');
                if (modalText) {
                    modalText.textContent = artwork.description || 'No description available';
                }
                
                // Open modal
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
            }
        });
    });
    
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        });
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
});
