using Microsoft.AspNetCore.Mvc;
using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using ArtoSphere.API.Infrastructure.Services;

namespace ArtoSphere.API.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private readonly ILogger<CartController> _logger;

    public CartController(ICartService cartService, ILogger<CartController> logger)
    {
        _cartService = cartService;
        _logger = logger;
    }

    /// <summary>
    /// Get user's cart from database
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<IEnumerable<CartItem>>> GetUserCart(string userId)
    {
        try
        {
            var cartItems = await _cartService.GetUserCartAsync(userId);
            return Ok(cartItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cart");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Add item to cart and save to database
    /// Immediately syncs to API and frontend
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CartItem>> AddToCart([FromBody] CartItem cartItem)
    {
        try
        {
            if (cartItem == null)
                return BadRequest("Request body is required");
            
            if (string.IsNullOrWhiteSpace(cartItem.UserId))
                return BadRequest("UserId is required");
            
            // Validate UserId format (should be alphanumeric or 'default-user')
            if (!System.Text.RegularExpressions.Regex.IsMatch(cartItem.UserId, @"^[a-zA-Z0-9\-_]{1,100}$"))
                return BadRequest("Invalid UserId format");
            
            // Validate Quantity
            if (cartItem.Quantity < 1 || cartItem.Quantity > 1000)
                return BadRequest("Quantity must be between 1 and 1000");
            
            // Validate ArtworkId
            if (cartItem.ArtworkId <= 0)
                return BadRequest("Invalid ArtworkId");

            var addedItem = await _cartService.AddToCartAsync(cartItem);
            return CreatedAtAction(nameof(GetUserCart), new { userId = cartItem.UserId }, addedItem);
        }
        catch (ArgumentNullException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to cart");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Update cart item quantity
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<CartItem>> UpdateCartItem(int id, [FromBody] UpdateQuantityRequest request)
    {
        try
        {
            var updatedItem = await _cartService.UpdateCartItemAsync(id, request.Quantity);
            return Ok(updatedItem);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cart item");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Remove item from cart and database
    /// Immediately syncs to API and frontend
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFromCart(int id)
    {
        try
        {
            await _cartService.RemoveFromCartAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing from cart");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Clear entire cart for user
    /// Removes all items from database
    /// </summary>
    [HttpDelete("user/{userId}")]
    public async Task<IActionResult> ClearCart(string userId)
    {
        try
        {
            await _cartService.ClearCartAsync(userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cart");
            return StatusCode(500, "Internal server error");
        }
    }
}

public class UpdateQuantityRequest
{
    public int Quantity { get; set; }
}
