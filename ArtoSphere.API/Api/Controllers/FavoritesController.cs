using Microsoft.AspNetCore.Mvc;
using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using ArtoSphere.API.Infrastructure.Services;

namespace ArtoSphere.API.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly IFavoritesService _favoritesService;
    private readonly ILogger<FavoritesController> _logger;

    public FavoritesController(IFavoritesService favoritesService, ILogger<FavoritesController> logger)
    {
        _favoritesService = favoritesService;
        _logger = logger;
    }

    /// <summary>
    /// Get user's favorites from database
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<IEnumerable<Favorite>>> GetUserFavorites(string userId)
    {
        try
        {
            var favorites = await _favoritesService.GetUserFavoritesAsync(userId);
            return Ok(favorites);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching favorites");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Check if artwork is in user's favorites
    /// </summary>
    [HttpGet("{userId}/check/{artworkId}")]
    public async Task<ActionResult<bool>> IsFavorite(string userId, int artworkId)
    {
        try
        {
            var isFavorite = await _favoritesService.IsFavoriteAsync(userId, artworkId);
            return Ok(isFavorite);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking favorite status");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Add artwork to favorites and save to database
    /// Immediately syncs to API and frontend
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Favorite>> AddToFavorites([FromBody] Favorite favorite)
    {
        try
        {
            if (favorite == null)
                return BadRequest("Request body is required");
            
            if (string.IsNullOrWhiteSpace(favorite.UserId))
                return BadRequest("UserId is required");
            
            // Validate UserId format
            if (!System.Text.RegularExpressions.Regex.IsMatch(favorite.UserId, @"^[a-zA-Z0-9\-_]{1,100}$"))
                return BadRequest("Invalid UserId format");
            
            // Validate ArtworkId
            if (favorite.ArtworkId <= 0)
                return BadRequest("Invalid ArtworkId");

            var addedFavorite = await _favoritesService.AddToFavoritesAsync(favorite);
            return CreatedAtAction(nameof(GetUserFavorites), new { userId = favorite.UserId }, addedFavorite);
        }
        catch (ArgumentNullException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to favorites");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Remove artwork from favorites and database
    /// Immediately syncs to API and frontend
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFromFavorites(int id)
    {
        try
        {
            await _favoritesService.RemoveFromFavoritesAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing from favorites");
            return StatusCode(500, "Internal server error");
        }
    }
}
