// cart.js — Manage cart from API database with real-time sync

(function(){
  // Use default guest user for all operations
  const userId = 'default-user';

  let cartItems = [];

  /**
   * Load cart from API database
   */
  async function loadCartFromAPI() {
    try {
      cartItems = await CartAPI.getCart();
      renderCart();
      updateCartCounter();
    } catch (error) {
      console.error('Error loading cart:', error);
      cartItems = [];
      renderCart();
    }
  }

  /**
   * Remove item from cart and database
   * Immediately syncs with frontend
   */
  async function removeItemFromAPI(cartItemId) {
    try {
      const success = await CartAPI.removeFromCart(cartItemId);
      if (success) {
        cartItems = cartItems.filter(item => item.id !== cartItemId);
        renderCart();
        updateCartCounter();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item');
    }
  }

  /**
   * Update cart item quantity
   */
  async function updateItemQuantity(cartItemId, newQuantity) {
    try {
      if (newQuantity < 1) {
        await removeItemFromAPI(cartItemId);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (!response.ok) throw new Error("Failed to update quantity");
      
      const updatedItem = await response.json();
      const index = cartItems.findIndex(item => item.id === cartItemId);
      if (index !== -1) {
        cartItems[index] = updatedItem;
      }
      renderCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  }

  /**
   * Clear entire cart
   */
  async function clearCartFromAPI() {
    try {
      const success = await CartAPI.clearCart();
      if (success) {
        cartItems = [];
        renderCart();
        updateCartCounter();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  }

  function formatPrice(p) {
    const n = Number(p) || 0;
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function updateCartCounter() {
    const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartLinks = document.querySelectorAll('a[href="cart.html"]');
    cartLinks.forEach(link => {
      const originalText = link.textContent.includes('(')
        ? link.textContent.split('(')[0].trim()
        : link.textContent.trim();
      link.textContent = cartCount > 0 ? `${originalText} (${cartCount})` : originalText;
    });
  }

  function renderCart() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotal');
    if (!list || !totalEl) return;

    list.innerHTML = '';

    if (cartItems.length === 0) {
      list.innerHTML = '<p>Your cart is empty.</p>';
      totalEl.textContent = '0';
      return;
    }

    let total = 0;
    cartItems.forEach((item) => {
      const price = item.priceAtTime || 0;
      const qty = item.quantity || 1;
      const artwork = item.artwork;
      
      if (!artwork) return;
      
      total += price * qty;

      // Get proper image URL
      const hasUploadedImage = artwork.imageData && artwork.imageData !== null;
      let imageUrl;
      if (hasUploadedImage) {
          imageUrl = `${API_BASE_URL}/upload/artwork/${artwork.id}?t=${Date.now()}`;
      } else if (artwork.imageUrl) {
          imageUrl = artwork.imageUrl;
      } else {
          imageUrl = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
      }

      const product = document.createElement('div');
      product.className = 'cart-item';
      
      // Create image element
      const img = document.createElement('img');
      img.className = 'cart-item-image';
      img.src = imageUrl;
      img.alt = artwork.title;
      img.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
      };
      product.appendChild(img);
      
      // Create body section
      const body = document.createElement('div');
      body.className = 'cart-item-body';
      
      const title = document.createElement('h4');
      title.className = 'cart-item-title';
      title.textContent = artwork.title;
      body.appendChild(title);
      
      const artist = document.createElement('div');
      artist.className = 'cart-item-sub';
      artist.textContent = artwork.artist || '';
      body.appendChild(artist);
      
      const priceDiv = document.createElement('div');
      priceDiv.className = 'cart-item-price';
      priceDiv.textContent = `$${formatPrice(price)} × `;
      const qtySpan = document.createElement('strong');
      qtySpan.className = 'qty';
      qtySpan.textContent = qty;
      priceDiv.appendChild(qtySpan);
      body.appendChild(priceDiv);
      
      const subtotal = document.createElement('div');
      subtotal.className = 'cart-item-subtotal';
      subtotal.textContent = `Subtotal: $${formatPrice(price * qty)}`;
      body.appendChild(subtotal);
      
      product.appendChild(body);
      
      // Create actions section
      const actions = document.createElement('div');
      actions.className = 'cart-item-actions';
      
      const decreaseBtn = document.createElement('button');
      decreaseBtn.className = 'qty-decrease';
      decreaseBtn.dataset.id = item.id;
      decreaseBtn.setAttribute('aria-label', 'Decrease quantity');
      decreaseBtn.textContent = '−';
      actions.appendChild(decreaseBtn);
      
      const increaseBtn = document.createElement('button');
      increaseBtn.className = 'qty-increase';
      increaseBtn.dataset.id = item.id;
      increaseBtn.setAttribute('aria-label', 'Increase quantity');
      increaseBtn.textContent = '+';
      actions.appendChild(increaseBtn);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.dataset.id = item.id;
      removeBtn.setAttribute('aria-label', 'Remove item');
      removeBtn.textContent = 'Remove';
      actions.appendChild(removeBtn);
      
      product.appendChild(actions);

      list.appendChild(product);
    });

    totalEl.textContent = formatPrice(total);

    // Attach event handlers
    list.querySelectorAll('.qty-increase').forEach(btn => btn.addEventListener('click', () => {
      const itemId = Number(btn.dataset.id);
      const item = cartItems.find(i => i.id === itemId);
      if (item) updateItemQuantity(itemId, item.quantity + 1);
    }));

    list.querySelectorAll('.qty-decrease').forEach(btn => btn.addEventListener('click', () => {
      const itemId = Number(btn.dataset.id);
      const item = cartItems.find(i => i.id === itemId);
      if (item) updateItemQuantity(itemId, item.quantity - 1);
    }));

    list.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', () => {
      const itemId = Number(btn.dataset.id);
      if (confirm('Remove this item from your cart?')) {
        removeItemFromAPI(itemId);
      }
    }));
  }

  // Handle checkout form
  function attachCheckout() {
    const form = document.getElementById('formCheckout');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (cartItems.length === 0) {
        alert('Your cart is empty. Add items before checking out.');
        return;
      }

      const data = new FormData(form);
      const order = {
        name: data.get('name'),
        surname: data.get('surname'),
        phone: data.get('phone'),
        email: data.get('email'),
        city: data.get('city'),
        payment: data.get('payment'),
        items: cartItems,
        total: document.getElementById('cartTotal')?.textContent || '0'
      };

      // Store order and clear cart
      try {
        localStorage.setItem('artoSphereLastOrder', JSON.stringify(order));
      } catch (e) {
        console.error('Error storing order:', e);
      }

      clearCartFromAPI();
      form.reset();
      alert('Order placed successfully! Thank you.');
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    loadCartFromAPI();
    attachCheckout();

    // Toggle payment card details
    const paymentSelect = document.getElementById('payment');
    const cardDetails = document.getElementById('creditCardDetails');
    if (paymentSelect && cardDetails) {
      paymentSelect.addEventListener('change', (e) => {
        cardDetails.style.display = e.target.value === 'credit' ? 'block' : 'none';
      });
    }
  });

})();

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile hamburger + nav active behavior
document.addEventListener('DOMContentLoaded', () => {
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
                a.classList.add('active');
                closeMobile();
            });
        });
    }

    function setActiveByPath() {
        const currentFile = window.location.pathname.split('/').pop() || 'cart.html';
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === currentFile);
        });
        mobileLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === currentFile);
        });
    }
    setActiveByPath();
});