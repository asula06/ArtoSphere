using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArtoSphere.API.Infrastructure.Services;

/// <summary>
/// Service for Cart operations
/// Handles all database communication through Entity Framework
/// </summary>
public class CartService : ICartService
{
    private readonly AppDbContext _context;
    private readonly ILogger<CartService> _logger;

    public CartService(AppDbContext context, ILogger<CartService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<CartItem>> GetUserCartAsync(string userId)
    {
        try
        {
            _logger.LogInformation("Fetching cart for user: {UserId}", userId);
            return await _context.CartItems
                .Where(c => c.UserId == userId)
                .Include(c => c.Artwork)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cart for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<CartItem> AddToCartAsync(CartItem cartItem)
    {
        try
        {
            if (cartItem == null)
                throw new ArgumentNullException(nameof(cartItem));

            _logger.LogInformation("Adding artwork {ArtworkId} to cart for user {UserId}", 
                cartItem.ArtworkId, cartItem.UserId);

            // Check if artwork exists
            var artwork = await _context.Artworks.FindAsync(cartItem.ArtworkId);
            if (artwork == null)
                throw new KeyNotFoundException($"Artwork with ID {cartItem.ArtworkId} not found");

            // Check if item already in cart
            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == cartItem.UserId && c.ArtworkId == cartItem.ArtworkId);

            if (existingItem != null)
            {
                _logger.LogInformation("Item already in cart, updating quantity");
                existingItem.Quantity += cartItem.Quantity;
                _context.CartItems.Update(existingItem);
                await _context.SaveChangesAsync();
                return existingItem;
            }

            // Add new item
            cartItem.AddedDate = DateTime.UtcNow;
            _context.CartItems.Add(cartItem);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Item added to cart successfully");
            return cartItem;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to cart");
            throw;
        }
    }

    public async Task<bool> RemoveFromCartAsync(int cartItemId)
    {
        try
        {
            _logger.LogInformation("Removing item {CartItemId} from cart", cartItemId);

            var item = await _context.CartItems.FindAsync(cartItemId);
            if (item == null)
                throw new KeyNotFoundException($"Cart item with ID {cartItemId} not found");

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Item removed from cart successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing from cart");
            throw;
        }
    }

    public async Task<bool> ClearCartAsync(string userId)
    {
        try
        {
            _logger.LogInformation("Clearing cart for user: {UserId}", userId);

            var items = await _context.CartItems.Where(c => c.UserId == userId).ToListAsync();
            if (items.Any())
            {
                _context.CartItems.RemoveRange(items);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("Cart cleared successfully for user: {UserId}", userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cart for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<CartItem> UpdateCartItemAsync(int id, int quantity)
    {
        try
        {
            _logger.LogInformation("Updating cart item {CartItemId} with quantity {Quantity}", id, quantity);

            var item = await _context.CartItems.FindAsync(id);
            if (item == null)
                throw new KeyNotFoundException($"Cart item with ID {id} not found");

            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0", nameof(quantity));

            item.Quantity = quantity;
            _context.CartItems.Update(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Cart item updated successfully");
            return item;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cart item");
            throw;
        }
    }
}
