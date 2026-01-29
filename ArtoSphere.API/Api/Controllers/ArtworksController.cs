using Microsoft.AspNetCore.Mvc;
using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using ArtoSphere.API.Infrastructure.Services;

namespace ArtoSphere.API.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtworksController : ControllerBase
{
    private readonly IArtworkService _artworkService;
    private readonly ILogger<ArtworksController> _logger;

    public ArtworksController(IArtworkService artworkService, ILogger<ArtworksController> logger)
    {
        _artworkService = artworkService;
        _logger = logger;
    }

    /// <summary>
    /// Get all artworks from database
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Artwork>>> GetAll()
    {
        try
        {
            var artworks = await _artworkService.GetAllArtworksAsync();
            return Ok(artworks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching artworks");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get artwork by ID from database
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Artwork>> GetById(int id)
    {
        try
        {
            var artwork = await _artworkService.GetArtworkByIdAsync(id);
            if (artwork == null)
                return NotFound();
            return Ok(artwork);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching artwork");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create new artwork in database
    /// Immediately available in API and syncs to frontend
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Artwork>> Create(Artwork artwork)
    {
        try
        {
            var createdArtwork = await _artworkService.CreateArtworkAsync(artwork);
            return CreatedAtAction(nameof(GetById), new { id = createdArtwork.Id }, createdArtwork);
        }
        catch (ArgumentNullException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating artwork");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update artwork in database
    /// Changes immediately available in API
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Artwork artwork)
    {
        try
        {
            await _artworkService.UpdateArtworkAsync(id, artwork);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating artwork");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Delete artwork from database
    /// Immediately removed from API and frontend
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _artworkService.DeleteArtworkAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting artwork");
            return StatusCode(500, "Internal server error");
        }
    }
}
