using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;

namespace ArtoSphere.API.Core.Interfaces;

/// <summary>
/// Service interface for Favorites operations
/// All database operations go through Entity Framework via this service
/// </summary>
public interface IFavoritesService
{
    Task<IEnumerable<Favorite>> GetUserFavoritesAsync(string userId);
    Task<Favorite> AddToFavoritesAsync(Favorite favorite);
    Task<bool> RemoveFromFavoritesAsync(int favoriteId);
    Task<bool> IsFavoriteAsync(string userId, int artworkId);
}
