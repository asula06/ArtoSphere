// API Service - Centralized API calls for ArtoSphere
// Note: API_BASE_URL should ideally be set from environment variable
const API_BASE_URL = window.location.hostname === 'localhost' ? 
    "http://localhost:5000/api" : 
    `${window.location.protocol}//${window.location.host.replace(':8080', ':5000')}/api`;

// Sanitize user input to prevent XSS
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Artworks API
const ArtworkAPI = {
    async getAllArtworks() {
        try {
            const response = await fetch(`${API_BASE_URL}/artworks`);
            if (!response.ok) throw new Error("Failed to fetch artworks");
            return await response.json();
        } catch (error) {
            console.error("Error fetching artworks:", error);
            return [];
        }
    },

    async getArtworkById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/artworks/${id}`);
            if (!response.ok) throw new Error("Failed to fetch artwork");
            return await response.json();
        } catch (error) {
            console.error("Error fetching artwork:", error);
            return null;
        }
    },

    async createArtwork(artwork) {
        try {
            // Create a copy without imageData (imageData should be uploaded separately)
            const artworkData = { ...artwork };
            delete artworkData.imageData;
            
            const response = await fetch(`${API_BASE_URL}/artworks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(artworkData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to create artwork: ${JSON.stringify(errorData.errors)}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error creating artwork:", error);
            return null;
        }
    }
};

// Cart API
const CartAPI = {
    userId: "default-user", // Guest user

    async getCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${this.userId}`);
            if (!response.ok) throw new Error("Failed to fetch cart");
            return await response.json();
        } catch (error) {
            console.error("Error fetching cart:", error);
            return [];
        }
    },

    async addToCart(artworkId, quantity = 1) {
        try {
            const artwork = await ArtworkAPI.getArtworkById(artworkId);
            if (!artwork) throw new Error("Artwork not found");

            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ArtworkId: artworkId,
                    UserId: this.userId,
                    Quantity: quantity,
                    PriceAtTime: artwork.price
                })
            });

            if (response.ok) {
                return { status: "added", data: await response.json() };
            }

            // Try to parse error response
            let errorMessage = "Failed to add to cart";
            try {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
                } else {
                    errorMessage = await response.text() || errorMessage;
                }
            } catch (e) {
                // If parsing fails, use generic message
            }

            return { status: "error", message: errorMessage };
        } catch (error) {
            console.error("Error adding to cart:", error);
            return { status: "error", message: error.message || "Failed to add to cart" };
        }
    },

    async removeFromCart(cartItemId) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Failed to remove from cart");
            return true;
        } catch (error) {
            console.error("Error removing from cart:", error);
            return false;
        }
    },

    async clearCart() {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/user/${this.userId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Failed to clear cart");
            return true;
        } catch (error) {
            console.error("Error clearing cart:", error);
            return false;
        }
    }
};

// Favorites API
const FavoritesAPI = {
    userId: "default-user", // Guest user

    async getFavorites() {
        try {
            const response = await fetch(`${API_BASE_URL}/favorites/${this.userId}`);
            if (!response.ok) throw new Error("Failed to fetch favorites");
            return await response.json();
        } catch (error) {
            console.error("Error fetching favorites:", error);
            return [];
        }
    },

    async addToFavorites(artworkId) {
        try {
            const response = await fetch(`${API_BASE_URL}/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ArtworkId: artworkId,
                    UserId: this.userId
                })
            });

            if (response.ok) {
                return { status: "added", data: await response.json() };
            }

            // Try to parse error response
            let errorMessage = "Failed to add to favorites";
            try {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
                } else {
                    errorMessage = await response.text() || errorMessage;
                }
            } catch (e) {
                // If parsing fails, use generic message
            }

            if (response.status === 400 && errorMessage.toLowerCase().includes("already in favorites")) {
                return { status: "exists", message: errorMessage };
            }

            return { status: "error", message: errorMessage };
        } catch (error) {
            console.error("Error adding to favorites:", error);
            return { status: "error", message: error.message || "Failed to add to favorites" };
        }
    },

    async removeFromFavorites(favoriteId) {
        try {
            const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Failed to remove from favorites");
            return true;
        } catch (error) {
            console.error("Error removing from favorites:", error);
            return false;
        }
    }
};

// Database API (Admin)
const DatabaseAPI = {
    async seedDatabase() {
        try {
            const response = await fetch(`${API_BASE_URL}/database/seed`, {
                method: "POST"
            });
            if (!response.ok) throw new Error("Failed to seed database");
            return await response.json();
        } catch (error) {
            console.error("Error seeding database:", error);
            return null;
        }
    },

    async getDatabaseStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/database/status`);
            if (!response.ok) throw new Error("Failed to get database status");
            return await response.json();
        } catch (error) {
            console.error("Error getting database status:", error);
            return null;
        }
    }
};

// Upload API for images
const UploadAPI = {
    async uploadArtworkImage(artworkId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/upload/artwork/${artworkId}`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }
            return await response.json();
        } catch (error) {
            console.error("Error uploading image:", error);
            return null;
        }
    },

    getArtworkImageUrl(artworkId) {
        return `${API_BASE_URL}/upload/artwork/${artworkId}`;
    },

    async deleteArtworkImage(artworkId) {
        try {
            const response = await fetch(`${API_BASE_URL}/upload/artwork/${artworkId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Delete failed");
            return await response.json();
        } catch (error) {
            console.error("Error deleting image:", error);
            return null;
        }
    }
};

console.log("API Service loaded successfully");
