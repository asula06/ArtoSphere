using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArtoSphere.API.Infrastructure.Services;

/// <summary>
/// Service for Favorites operations
/// Handles all database communication through Entity Framework
/// </summary>
public class FavoritesService : IFavoritesService
{
    private readonly AppDbContext _context;
    private readonly ILogger<FavoritesService> _logger;

    public FavoritesService(AppDbContext context, ILogger<FavoritesService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Favorite>> GetUserFavoritesAsync(string userId)
    {
        try
        {
            _logger.LogInformation("Fetching favorites for user: {UserId}", userId);
            return await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Artwork)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching favorites for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<Favorite> AddToFavoritesAsync(Favorite favorite)
    {
        try
        {
            if (favorite == null)
                throw new ArgumentNullException(nameof(favorite));

            _logger.LogInformation("Adding artwork {ArtworkId} to favorites for user {UserId}", 
                favorite.ArtworkId, favorite.UserId);

            // Check if artwork exists
            var artwork = await _context.Artworks.FindAsync(favorite.ArtworkId);
            if (artwork == null)
                throw new KeyNotFoundException($"Artwork with ID {favorite.ArtworkId} not found");

            // Check if already in favorites
            var existingFavorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == favorite.UserId && f.ArtworkId == favorite.ArtworkId);

            if (existingFavorite != null)
                throw new InvalidOperationException("This artwork is already in favorites");

            // Add to favorites
            favorite.AddedDate = DateTime.UtcNow;
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Artwork added to favorites successfully");
            return favorite;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to favorites");
            throw;
        }
    }

    public async Task<bool> RemoveFromFavoritesAsync(int favoriteId)
    {
        try
        {
            _logger.LogInformation("Removing favorite {FavoriteId}", favoriteId);

            var favorite = await _context.Favorites.FindAsync(favoriteId);
            if (favorite == null)
                throw new KeyNotFoundException($"Favorite with ID {favoriteId} not found");

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Favorite removed successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing from favorites");
            throw;
        }
    }

    public async Task<bool> IsFavoriteAsync(string userId, int artworkId)
    {
        try
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ArtworkId == artworkId);
            return favorite != null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking favorite status");
            throw;
        }
    }
}
