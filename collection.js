// Mobile hamburger + nav active behavior
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = Array.from(document.querySelectorAll('.navbar a:not(.nav-center)'));
    const mobileLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll('a')) : [];
    const navbar = document.querySelector('.navbar');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('open')) return;
            if (e.target === hamburger || hamburger.contains(e.target)) return;
            if (mobileMenu.contains(e.target)) return;
            closeMobile();
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobile();
        });

        // close mobile when a mobile link is clicked (and mark active)
        mobileLinks.forEach(a => {
            a.addEventListener('click', () => {
                navLinks.forEach(x => x.classList.remove('active'));
                // mark the corresponding desktop link active if present
                const match = navLinks.find(x => x.getAttribute('href') === a.getAttribute('href'));
                if (match) match.classList.add('active');
                a.classList.add('active');
                closeMobile();
            });
        });
    }

    // mark current page link active on load (works across pages)
    function setActiveByPath() {
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === currentFile);
        });
        mobileLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === currentFile);
        });
    }
    setActiveByPath();
});
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
//sistemi mos ngaterrohet nga shkronjat apo hapsirat
function normalize(text) {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}
function findCategoryKey(label) {
  let norm = normalize(label);
  if (norm.startsWith("-")) norm = norm.slice(1).trim();
  for (const key in CATEGORY_SYNONYMS) {
    const synonyms = CATEGORY_SYNONYMS[key];
    if (synonyms.some(s => normalize(s) === norm)) return key;
  }
  return null;
}
document.addEventListener("DOMContentLoaded", () => {
  const cards = Array.from(document.querySelectorAll(".photo-card"));
  const navLinks = document.querySelectorAll(".nav > a, .dropdown-menu a");

  function showAllCards() {
    cards.forEach(card => card.style.display = "");
  }

  function filterByCategoryKey(categoryKey) {
    const body = document.body;
    if (!categoryKey || categoryKey === "all") {
      body.classList.remove("category-view");
      showAllCards();
      return;
    }
    body.classList.add("category-view");
    const synonyms = CATEGORY_SYNONYMS[categoryKey] || [];
    cards.forEach(card => {
      const cardCategory = normalize(card.dataset.category || "");
      const matches = synonyms.some(s => cardCategory === normalize(s));
      card.style.display = matches ? "" : "none";
    });
  }

  function setActiveLink(clicked) {
    navLinks.forEach(link => link.classList.remove("is-active"));
    clicked.classList.add("is-active");
  }

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const label = link.textContent;
      const categoryKey = findCategoryKey(label);
      setActiveLink(link);
      filterByCategoryKey(categoryKey);
    });
  });

  // therrasim funksionin që krijon dhe vendos ikonat e kartave
  setupCardIcons();

  // therrasim funksionin që lidh butonat modal-it
  setupModalIcons();
});
const modal = document.getElementById("artModal");
const modalImg = document.getElementById("artModalImage");
const modalTitle = document.getElementById("artModalTitle");
const modalPeriod = document.getElementById("artModalPeriod");
const modalDate = document.getElementById("artModalDate");
const modalArtist = document.getElementById("artModalArtist");
const modalClass = document.getElementById("artModalClassification");
const modalDim = document.getElementById("artModalDimensions");
const modalLoc = document.getElementById("artModalLocation");
const modalPrice = document.getElementById("artModalPrice");
const modalText = document.getElementById("artModalText");
const modalClose = document.getElementById("artModalClose");
function openArtModal(card) {
  const img = card.querySelector("img");
  if (img) {
    modalImg.src = img.src;
    modalImg.alt = card.dataset.title || "";
  }
  modalTitle.textContent = card.dataset.title || "";
  modalPeriod.textContent = card.dataset.period || "";
  modalDate.textContent = card.dataset.date || "";
  modalArtist.textContent = card.dataset.artist || "";
  modalClass.textContent = card.dataset.classification || "";
  modalDim.textContent = card.dataset.dimensions || "";
  modalLoc.textContent = card.dataset.location || "";
  modalPrice.textContent = card.dataset.price || "";
  modalText.textContent = card.dataset.text || "";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeArtModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll(".photo-card").forEach(card => {
  const overlay = card.querySelector(".overlay");
  if (!overlay) return;

  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openArtModal(card);
  });
});

if (modalClose) modalClose.addEventListener("click", closeArtModal);

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeArtModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeArtModal();
});

function setupCardIcons() {
  const cards = document.querySelectorAll(".photo-card");

  cards.forEach(card => {
    const thumbEl = card.querySelector(".thumb");

    if (thumbEl && !card.querySelector(".card-actions")) {
      const actions = document.createElement("div");
      actions.className = "card-actions";
// buton normal, me ikonën e zemres
      const heartBtn = document.createElement("button");
      heartBtn.type = "button";
      heartBtn.className = "icon-btn heart-btn";
      heartBtn.innerHTML = "&#9829;";

   heartBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  window.location.href = "favorites.html"; //dergon perdoruesin te faqja e favorites.
});

      const cartBtn = document.createElement("button");
      cartBtn.type = "button";
      cartBtn.className = "icon-btn cart-btn";
      cartBtn.innerHTML = "&#128717;";

      cartBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  window.location.href = "card.html"; //dergon perdoruesin te faqja e cart.
});

      actions.appendChild(heartBtn);
      actions.appendChild(cartBtn);
      thumbEl.parentNode.insertBefore(actions, thumbEl.nextSibling);
    }
  });
}
function setupModalIcons() {
  const modalHeartBtn = document.querySelector("#artModal .art-modal__actions .heart-btn");//brenda modal-it
  const modalCartBtn  = document.querySelector("#artModal .art-modal__actions .cart-btn");

  if (modalHeartBtn) {
    modalHeartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = "favorites.html";
    });
  }

  if (modalCartBtn) {
    modalCartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = "card.html";
    });
  }
}