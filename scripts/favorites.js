// favorites.js — Manage favorites from API database with real-time sync

(function(){
  // Use default guest user for all operations
  const userId = 'default-user';

  let favoritesList = [];

  /**
   * Load favorites from API database
   */
  async function loadFavoritesFromAPI() {
    try {
      favoritesList = await FavoritesAPI.getFavorites();
      render();
    } catch (error) {
      console.error('Error loading favorites:', error);
      favoritesList = [];
      render();
    }
  }

  /**
   * Remove favorite from database and API
   * Immediately syncs with frontend
   */
  async function removeFavoriteFromAPI(favoriteId) {
    try {
      const success = await FavoritesAPI.removeFromFavorites(favoriteId);
      if (success) {
        // Update local list and re-render
        favoritesList = favoritesList.filter(f => f.id !== favoriteId);
        render();
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove from favorites');
    }
  }

  /**
   * Add to cart from favorites
   */
  async function addToCartFromFavorite(artwork) {
    try {
      await CartAPI.addToCart(artwork.id, 1);
      alert(`${artwork.title} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  }

  function updateFavsCounter() {
    const count = favoritesList.length;
    const links = document.querySelectorAll('a[href="favourites.html"]');
    links.forEach(link => {
      const base = link.textContent.split('(')[0].trim();
      link.textContent = count > 0 ? `${base} (${count})` : base;
    });
  }

  function buildCard(favorite) {
    const artwork = favorite.artwork;
    if (!artwork) return null;

    // Get proper image URL
    const hasUploadedImage = artwork.imageData && artwork.imageData !== null;
    let imageUrl;
    if (hasUploadedImage) {
        imageUrl = `${API_BASE_URL}/upload/artwork/${artwork.id}?t=${Date.now()}`;
    } else if (artwork.imageUrl) {
        imageUrl = artwork.imageUrl;
    } else {
        imageUrl = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-family=%22Arial%22 font-size=%2220%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E';
    }

    const el = document.createElement('article');
    el.className = 'photo-card';
    el.setAttribute('data-id', artwork.id);
    
    // Create thumbnail section
    const thumb = document.createElement('a');
    thumb.className = 'thumb';
    
    const img = document.createElement('img');
    img.className = 'artwork-image';
    img.src = imageUrl;
    img.alt = artwork.title;
    img.onerror = function() {
      this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-family=%22Arial%22 font-size=%2220%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E';
    };
    thumb.appendChild(img);
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const viewText = document.createElement('span');
    viewText.className = 'view-text';
    viewText.textContent = 'VIEW';
    overlay.appendChild(viewText);
    thumb.appendChild(overlay);
    
    el.appendChild(thumb);
    
    // Create card info section
    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';
    
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = artwork.title;
    cardInfo.appendChild(title);
    
    const artist = document.createElement('p');
    artist.className = 'card-artist';
    artist.textContent = `by ${artwork.artist}`;
    cardInfo.appendChild(artist);
    
    const category = document.createElement('p');
    category.className = 'card-category';
    category.textContent = artwork.category;
    cardInfo.appendChild(category);
    
    const description = document.createElement('p');
    description.className = 'card-description';
    description.textContent = artwork.description;
    cardInfo.appendChild(description);
    
    const price = document.createElement('p');
    price.className = 'card-price';
    price.textContent = `$${artwork.price.toLocaleString()}`;
    cardInfo.appendChild(price);
    
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    
    const heartBtn = document.createElement('button');
    heartBtn.className = 'heart-btn is-active';
    heartBtn.setAttribute('aria-label', 'Remove from favorites');
    heartBtn.setAttribute('title', 'Remove from favorites');
    heartBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    
    // Handle remove from favorites
    heartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Remove this item from favourites?')) {
        removeFavoriteFromAPI(favorite.id);
      }
    });
    actions.appendChild(heartBtn);
    
    const cartBtn = document.createElement('button');
    cartBtn.className = 'cart-btn';
    cartBtn.setAttribute('aria-label', 'Add to cart');
    cartBtn.setAttribute('title', 'Add to cart');
    cartBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>';
    
    // Handle add to cart
    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCartFromFavorite(artwork);
    });
    actions.appendChild(cartBtn);
    
    cardInfo.appendChild(actions);
    el.appendChild(cardInfo);

    return el;
  }

  function render() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (favoritesList.length === 0) {
      grid.innerHTML = '<p>No favourites yet. Click the heart on any artwork to save it here.</p>';
      updateFavsCounter();
      return;
    }

    favoritesList.forEach(favorite => {
      const card = buildCard(favorite);
      if (card) grid.appendChild(card);
    });

    updateFavsCounter();
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadFavoritesFromAPI();
  });

})();

// Navbar scroll effect
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    function onScroll() {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
});