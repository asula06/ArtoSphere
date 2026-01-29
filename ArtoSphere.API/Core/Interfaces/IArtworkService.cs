using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;

namespace ArtoSphere.API.Core.Interfaces;

/// <summary>
/// Service interface for Artwork operations
/// All database operations go through Entity Framework via this service
/// </summary>
public interface IArtworkService
{
    Task<IEnumerable<Artwork>> GetAllArtworksAsync();
    Task<Artwork?> GetArtworkByIdAsync(int id);
    Task<Artwork> CreateArtworkAsync(Artwork artwork);
    Task<Artwork> UpdateArtworkAsync(int id, Artwork artwork);
    Task<bool> DeleteArtworkAsync(int id);
}
