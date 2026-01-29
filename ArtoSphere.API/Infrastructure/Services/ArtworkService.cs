using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArtoSphere.API.Infrastructure.Services;

/// <summary>
/// Service for Artwork operations
/// Handles all database communication through Entity Framework
/// </summary>
public class ArtworkService : IArtworkService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ArtworkService> _logger;

    public ArtworkService(AppDbContext context, ILogger<ArtworkService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Artwork>> GetAllArtworksAsync()
    {
        try
        {
            _logger.LogInformation("Fetching all artworks from database");
            return await _context.Artworks.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching artworks");
            throw;
        }
    }

    public async Task<Artwork?> GetArtworkByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Fetching artwork with ID: {ArtworkId}", id);
            return await _context.Artworks.FindAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching artwork with ID: {ArtworkId}", id);
            throw;
        }
    }

    public async Task<Artwork> CreateArtworkAsync(Artwork artwork)
    {
        try
        {
            if (artwork == null)
                throw new ArgumentNullException(nameof(artwork));

            _logger.LogInformation("Creating new artwork: {Title}", artwork.Title);
            
            artwork.CreatedDate = DateTime.UtcNow;
            _context.Artworks.Add(artwork);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Artwork created successfully with ID: {ArtworkId}", artwork.Id);
            return artwork;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating artwork");
            throw;
        }
    }

    public async Task<Artwork> UpdateArtworkAsync(int id, Artwork artwork)
    {
        try
        {
            if (artwork == null)
                throw new ArgumentNullException(nameof(artwork));

            if (id != artwork.Id)
                throw new ArgumentException("ID mismatch", nameof(id));

            _logger.LogInformation("Updating artwork with ID: {ArtworkId}", id);
            
            var existingArtwork = await _context.Artworks.FindAsync(id);
            if (existingArtwork == null)
                throw new KeyNotFoundException($"Artwork with ID {id} not found");

            // Update fields
            existingArtwork.Title = artwork.Title;
            existingArtwork.Artist = artwork.Artist;
            existingArtwork.Description = artwork.Description;
            existingArtwork.Price = artwork.Price;
            existingArtwork.ImageUrl = artwork.ImageUrl;
            existingArtwork.Category = artwork.Category;
            existingArtwork.IsAvailable = artwork.IsAvailable;

            _context.Artworks.Update(existingArtwork);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Artwork updated successfully with ID: {ArtworkId}", id);
            return existingArtwork;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating artwork with ID: {ArtworkId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteArtworkAsync(int id)
    {
        try
        {
            _logger.LogInformation("Deleting artwork with ID: {ArtworkId}", id);
            
            var artwork = await _context.Artworks.FindAsync(id);
            if (artwork == null)
                throw new KeyNotFoundException($"Artwork with ID {id} not found");

            _context.Artworks.Remove(artwork);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Artwork deleted successfully with ID: {ArtworkId}", id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting artwork with ID: {ArtworkId}", id);
            throw;
        }
    }
}
