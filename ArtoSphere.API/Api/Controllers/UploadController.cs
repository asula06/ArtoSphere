using Microsoft.AspNetCore.Mvc;
using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;

namespace ArtoSphere.API.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<UploadController> _logger;

    public UploadController(AppDbContext context, ILogger<UploadController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Upload an image for an artwork (max 5MB)
    /// </summary>
    [HttpPost("artwork/{artworkId}")]
    public async Task<IActionResult> UploadArtworkImage(int artworkId, IFormFile file)
    {
        try
        {
            // Validate file
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            const long maxFileSize = 5 * 1024 * 1024; // 5MB
            if (file.Length > maxFileSize)
                return BadRequest($"File size exceeds {maxFileSize / (1024 * 1024)}MB limit");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Only image files are allowed (jpg, png, gif, webp)");

            // Find artwork
            var artwork = await _context.Artworks.FindAsync(artworkId);
            if (artwork == null)
                return NotFound("Artwork not found");

            // Read file into byte array
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                artwork.ImageData = memoryStream.ToArray();
            }

            // Update artwork
            _context.Artworks.Update(artwork);
            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                message = "Image uploaded successfully",
                artworkId = artwork.Id,
                fileSize = file.Length,
                fileName = file.FileName
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image");
            return StatusCode(500, "Error uploading image");
        }
    }

    /// <summary>
    /// Get image for an artwork
    /// </summary>
    [HttpGet("artwork/{artworkId}")]
    public async Task<IActionResult> GetArtworkImage(int artworkId)
    {
        try
        {
            var artwork = await _context.Artworks.FindAsync(artworkId);
            if (artwork == null)
                return NotFound("Artwork not found");

            if (artwork.ImageData == null || artwork.ImageData.Length == 0)
                return NotFound("No image available for this artwork");

            // Determine content type
            var contentType = "image/jpeg"; // default
            if (artwork.ImageUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                contentType = "image/png";
            else if (artwork.ImageUrl.EndsWith(".gif", StringComparison.OrdinalIgnoreCase))
                contentType = "image/gif";
            else if (artwork.ImageUrl.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
                contentType = "image/webp";

            return File(artwork.ImageData, contentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving image");
            return StatusCode(500, "Error retrieving image");
        }
    }

    /// <summary>
    /// Delete image for an artwork
    /// </summary>
    [HttpDelete("artwork/{artworkId}")]
    public async Task<IActionResult> DeleteArtworkImage(int artworkId)
    {
        try
        {
            var artwork = await _context.Artworks.FindAsync(artworkId);
            if (artwork == null)
                return NotFound("Artwork not found");

            artwork.ImageData = null;
            _context.Artworks.Update(artwork);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Image deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image");
            return StatusCode(500, "Error deleting image");
        }
    }
}
