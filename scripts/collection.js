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
                mobileLinks.forEach(x => x.classList.remove('active'));
                a.classList.add('active');
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
});

// Category synonyms
const CATEGORY_SYNONYMS = {
  all: ["all", "të gjitha", "te gjitha"],
  ancient: ["ancient", "lashtë", "lashtё", "antike"],
  medieval: ["medieval", "mesjetë", "mesjeta", "middle ages", "moyen age"],
  renaissance: ["renaissance", "rilindja"],
  baroque: ["baroque", "barok"],
  neoclassicism: ["neoclassicism", "neoclassical", "neoklasicizëm"],
  romanticism: ["romanticism", "romantizëm", "romantic"],
  impressionism: ["impressionism", "impresionizëm"],
  expressionism: ["expressionism", "ekspresionizëm"],
  surrealism: ["surrealism", "surealizëm"],
  abstract: ["abstract art", "abstract", "abstrakt"],
  contemporary: ["contemporary art", "contemporary", "modern"],
  realism: ["realism", "realisem", "realist"]
};

// Normalize text for category matching
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

function findCategoryKey(label) {
  const normalizedLabel = normalize(label);
  for (const [key, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some(syn => normalize(syn) === normalizedLabel)) {
      return key;
    }
  }
  return null;
}

// Setup card icons (heart + cart buttons) - Uses API for favorites and cart
function setupCardIcons() {
  const userId = "default-user";
  const cards = document.querySelectorAll(".photo-card");

  cards.forEach(card => {
    const thumbEl = card.querySelector(".thumb");

    if (thumbEl && !card.querySelector(".card-actions")) {
      const actions = document.createElement("div");
      actions.className = "card-actions";
      const artworkId = Number(card.dataset.id);

      // Heart button - add/remove from favorites via API
      const heartBtn = document.createElement("button");
      heartBtn.type = "button";
      heartBtn.className = "icon-btn heart-btn";
      heartBtn.innerHTML = "&#9829;";
      heartBtn.setAttribute("aria-label", "Add to favorites");

      // Check if in favorites
      if (card.dataset.isFavorite === 'true') {
        heartBtn.classList.add('is-active');
      }

      heartBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        
        if (heartBtn.classList.contains('is-active')) {
          // Remove from favorites - need favoriteId from server
          const favoriteId = card.dataset.favoriteId;
          if (favoriteId) {
            try {
              await FavoritesAPI.removeFromFavorites(Number(favoriteId));
              heartBtn.classList.remove('is-active');
              card.dataset.isFavorite = 'false';
            } catch (error) {
              console.error('Error removing from favorites:', error);
              alert('Failed to remove from favorites');
            }
          }
        } else {
          // Add to favorites via API
          try {
            const favorite = await FavoritesAPI.addToFavorites(artworkId);
            heartBtn.classList.add('is-active');
            card.dataset.isFavorite = 'true';
            card.dataset.favoriteId = favorite.id;
          } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('Failed to add to favorites');
          }
        }
        updateFavoritesCounter();
      });

      // Cart button - add to cart via API
      const cartBtn = document.createElement("button");
      cartBtn.type = "button";
      cartBtn.className = "icon-btn cart-btn";
      cartBtn.innerHTML = "&#128717;";
      cartBtn.setAttribute("aria-label", "Add to cart");

      cartBtn.addEventListener("click", async (e) => {
        e.stopPropagation();

        try {
          await CartAPI.addToCart(artworkId, 1);
          
          // Visual feedback
          cartBtn.classList.add('is-active');
          setTimeout(() => cartBtn.classList.remove('is-active'), 500);

          // Update cart counter
          updateCartCounter();
          alert('Added to cart!');
        } catch (error) {
          console.error('Error adding to cart:', error);
          alert('Failed to add to cart');
        }
      });

      actions.appendChild(heartBtn);
      actions.appendChild(cartBtn);
      thumbEl.appendChild(actions);
    }
  });
}

// Update cart counter in navigation
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('artoSphereCart')) || [];
  // Count total quantity across items
  const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

  // Update cart link text
  const cartLinks = document.querySelectorAll('a[href="cart.html"]');
  cartLinks.forEach(link => {
    const originalText = link.textContent.includes('(')
      ? link.textContent.split('(')[0].trim()
      : link.textContent.trim();
    link.textContent = cartCount > 0
      ? `${originalText} (${cartCount})`
      : originalText;
  });
}

// Update favorites counter - will be called after API sync
function updateFavoritesCounter(){
  // This will be updated when favorites sync with API
  // For now, just update from current DOM state
  const cards = document.querySelectorAll('.photo-card[data-is-favorite="true"]');
  const count = cards.length;
  const links = document.querySelectorAll('a[href="favourites.html"]');
  links.forEach(link => {
    const base = link.textContent.split('(')[0].trim();
    link.textContent = count > 0 ? `${base} (${count})` : base;
  });
}

// Setup modal icons - Uses API for favorites and cart
function setupModalIcons() {
  const userId = "default-user";
  const modalHeartBtn = document.querySelector("#artModal .art-modal__actions .heart-btn");
  const modalCartBtn = document.querySelector("#artModal .art-modal__actions .cart-btn");
  const artworkId = Number(document.getElementById("artModalTitle")?.dataset.artworkId || 0);

  if (modalHeartBtn) {
    // Set initial state
    const card = document.querySelector(`.photo-card[data-id="${artworkId}"]`);
    if (card?.dataset.isFavorite === 'true') {
      modalHeartBtn.classList.add('is-active');
    } else {
      modalHeartBtn.classList.remove('is-active');
    }

    modalHeartBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      
      if (modalHeartBtn.classList.contains('is-active')) {
        // Remove from favorites
        const card = document.querySelector(`.photo-card[data-id="${artworkId}"]`);
        const favoriteId = card?.dataset.favoriteId;
        if (favoriteId) {
          try {
            await FavoritesAPI.removeFromFavorites(Number(favoriteId));
            modalHeartBtn.classList.remove('is-active');
            if (card) {
              card.dataset.isFavorite = 'false';
            }
          } catch (error) {
            console.error('Error removing from favorites:', error);
            alert('Failed to remove from favorites');
          }
        }
      } else {
        // Add to favorites
        try {
          const favorite = await FavoritesAPI.addToFavorites(artworkId);
          modalHeartBtn.classList.add('is-active');
          const card = document.querySelector(`.photo-card[data-id="${artworkId}"]`);
          if (card) {
            card.dataset.isFavorite = 'true';
            card.dataset.favoriteId = favorite.id;
          }
        } catch (error) {
          console.error('Error adding to favorites:', error);
          alert('Failed to add to favorites');
        }
      }
      updateFavoritesCounter();
    });
  }

  if (modalCartBtn) {
    modalCartBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      
      try {
        await CartAPI.addToCart(artworkId, 1);
        
        // Visual feedback
        modalCartBtn.classList.add('is-active');
        setTimeout(() => modalCartBtn.classList.remove('is-active'), 500);

        // Update cart counter
        updateCartCounter();
        alert('Added to cart!');
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add to cart');
      }
    });
  }
}

// Open modal on card click
function openModal(card) {
  const modal = document.getElementById("artModal");
  
  // Store image source in card dataset for modal access
  card.dataset.image = card.querySelector("img").src;
  
  document.getElementById("artModalImage").src = card.dataset.image || card.querySelector("img").src;
  document.getElementById("artModalTitle").textContent = card.dataset.title || "Unknown";
  document.getElementById("artModalPeriod").textContent = card.dataset.period || "";
  document.getElementById("artModalDate").textContent = card.dataset.date || "";
  document.getElementById("artModalArtist").textContent = card.dataset.artist || "";
  document.getElementById("artModalPrice").textContent = card.dataset.price || "";
  document.getElementById("artModalClassification").textContent = card.dataset.classification || "";
  document.getElementById("artModalDimensions").textContent = card.dataset.dimensions || "";
  document.getElementById("artModalLocation").textContent = card.dataset.location || "";
  document.getElementById("artModalText").textContent = card.dataset.text || "";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  setupModalIcons();
}

// Close modal
function closeModal() {
  const modal = document.getElementById("artModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  setupCardIcons();
  updateCartCounter();
  try{ updateFavoritesCounter(); }catch(e){}

  // Card click to open modal
  document.querySelectorAll(".photo-card").forEach(card => {
    card.addEventListener("click", (e) => {
      // Don't open modal if clicking on action buttons
      if (!e.target.closest('.card-actions') && !e.target.closest('.icon-btn')) {
        openModal(card);
      }
    });
  });

  // Close modal
  document.getElementById("artModalClose").addEventListener("click", closeModal);
  document.getElementById("artModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("artModal")) closeModal();
  });

  // Filter functionality
  const navLinks = document.querySelectorAll(".nav a");
  const cards = document.querySelectorAll(".photo-card");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const categoryLabel = link.textContent.trim();
      const categoryKey = findCategoryKey(categoryLabel);

      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      cards.forEach(card => {
        const cardCategory = card.dataset.category || "";
        if (categoryKey === "all" || cardCategory === categoryKey) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Set "All" as active initially
  if (navLinks[0]) {
    navLinks[0].classList.add("active");
  }
});
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    function onScroll() {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }

    onScroll(); // set initial state
    window.addEventListener('scroll', onScroll, { passive: true });
});