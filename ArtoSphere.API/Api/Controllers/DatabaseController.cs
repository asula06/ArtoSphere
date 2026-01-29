using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ArtoSphere.API.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatabaseController : ControllerBase
{
    private readonly AppDbContext _context;

    public DatabaseController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("seed")]
    public async Task<IActionResult> SeedDatabase()
    {
        // Check if data already exists
        if (_context.Artworks.Any())
            return BadRequest("Database already seeded");

        var artworks = new List<Artwork>
        {
            // Gallery Auction Items
            new()
            {
                Title = "The Night Watch",
                Artist = "Rembrandt van Rijn",
                Description = "A famous group portrait of a city militia, known for its dramatic use of light and shadow.",
                Price = 60000,
                ImageUrl = "img/f1.jpg",
                CreatedDate = new DateTime(1642, 1, 1),
                Category = "Painting",
                IsAvailable = true
            },
            new()
            {
                Title = "The Annunciation",
                Artist = "Fra Angelico",
                Description = "A beautiful depiction of the angel Gabriel announcing to the Virgin Mary that she would conceive the Son of God.",
                Price = 48000,
                ImageUrl = "img/auction4.jpeg",
                CreatedDate = new DateTime(1437, 1, 1),
                Category = "Painting",
                IsAvailable = true
            },
            new()
            {
                Title = "The Birth of Venus",
                Artist = "Sandro Botticelli",
                Description = "A famous Renaissance painting depicting the goddess Venus emerging from the sea on a shell.",
                Price = 8000000,
                ImageUrl = "img/auction5.jpeg",
                CreatedDate = new DateTime(1484, 1, 1),
                Category = "Painting",
                IsAvailable = true
            },
            new()
            {
                Title = "Fayum Portrait",
                Artist = "Unknown",
                Description = "This portrait, created using the encaustic technique, depicts a young aristocratic woman with a vivid gaze and a luxurious jewelry.",
                Price = 500000,
                ImageUrl = "img/auction1.jpeg",
                CreatedDate = new DateTime(100, 1, 1),
                Category = "Painting",
                IsAvailable = true
            },
            new()
            {
                Title = "Villa of Mysteries Fresco-Summary",
                Artist = "Unknown",
                Description = "This monumental fresco, painted on a vivid Pompeian red background, depicts a continuous sequence of female figures engaged in what appears to be a sacred ritual.",
                Price = 1100000,
                ImageUrl = "img/auction2.jpeg",
                CreatedDate = new DateTime(100, 1, 1),
                Category = "Painting",
                IsAvailable = true
            },
            new()
            {
                Title = "Maestà",
                Artist = "Duccio di Buoninsegna",
                Description = "A renowned altarpiece depicting the Virgin Mary enthroned with angels and saints, showcasing exquisite detail and vibrant colors.",
                Price = 420000,
                ImageUrl = "img/auction3.jpeg",
                CreatedDate = new DateTime(1308, 1, 1),
                Category = "Painting",
                IsAvailable = true
            },
            // Additional Collection Items
            new()
            {
                Title = "The Creation of Adam",
                Artist = "Michelangelo",
                Description = "One of the most iconic images of the Renaissance, painted on the ceiling of the Sistine Chapel.",
                Price = 1500000,
                ImageUrl = "/img/creation.jpg",
                CreatedDate = new DateTime(1508, 1, 1),
                Category = "Renaissance",
                IsAvailable = true
            },
            new()
            {
                Title = "The Persistence of Memory",
                Artist = "Salvador Dalí",
                Description = "A surrealist masterpiece featuring melting clocks in a dreamlike landscape.",
                Price = 750000,
                ImageUrl = "/img/persistence.jpg",
                CreatedDate = new DateTime(1931, 1, 1),
                Category = "Surrealism",
                IsAvailable = true
            },
            new()
            {
                Title = "The Tower of Babel",
                Artist = "Pieter Bruegel the Elder",
                Description = "A detailed biblical scene depicting the construction of the Tower of Babel.",
                Price = 500000,
                ImageUrl = "/img/babel.jpg",
                CreatedDate = new DateTime(1563, 1, 1),
                Category = "Renaissance",
                IsAvailable = true
            },
            new()
            {
                Title = "Starry Night",
                Artist = "Vincent van Gogh",
                Description = "An oil painting of the sky during the night from the Saint-Paul-de-Mausole asylum in France.",
                Price = 2000000,
                ImageUrl = "/img/starry-night.jpg",
                CreatedDate = new DateTime(1889, 1, 1),
                Category = "Post-Impressionism",
                IsAvailable = true
            },
            new()
            {
                Title = "Girl with a Pearl Earring",
                Artist = "Johannes Vermeer",
                Description = "An oil painting of a girl wearing an exotic dress and an unusual large pearl earring.",
                Price = 900000,
                ImageUrl = "/img/pearl-earring.jpg",
                CreatedDate = new DateTime(1665, 1, 1),
                Category = "Golden Age",
                IsAvailable = true
            }
        };

        await _context.Artworks.AddRangeAsync(artworks);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Database seeded successfully", count = artworks.Count });
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearDatabase()
    {
        _context.Artworks.RemoveRange(_context.Artworks);
        _context.CartItems.RemoveRange(_context.CartItems);
        _context.Favorites.RemoveRange(_context.Favorites);
        _context.Orders.RemoveRange(_context.Orders);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Database cleared" });
    }

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var artworkCount = _context.Artworks.Count();
        var cartCount = _context.CartItems.Count();
        var favoriteCount = _context.Favorites.Count();
        var orderCount = _context.Orders.Count();

        return Ok(new
        {
            artworks = artworkCount,
            cartItems = cartCount,
            favorites = favoriteCount,
            orders = orderCount
        });
    }
}
