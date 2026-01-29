using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;

namespace ArtoSphere.API.Core.Interfaces;

/// <summary>
/// Service interface for Cart operations
/// All database operations go through Entity Framework via this service
/// </summary>
public interface ICartService
{
    Task<IEnumerable<CartItem>> GetUserCartAsync(string userId);
    Task<CartItem> AddToCartAsync(CartItem cartItem);
    Task<bool> RemoveFromCartAsync(int cartItemId);
    Task<bool> ClearCartAsync(string userId);
    Task<CartItem> UpdateCartItemAsync(int id, int quantity);
}
