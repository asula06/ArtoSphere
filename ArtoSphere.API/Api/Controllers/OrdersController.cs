using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ArtoSphere.API.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Get all orders for a user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<Order>>> GetUserOrders(string userId)
    {
        var orders = await _orderService.GetUserOrdersAsync(userId);
        return Ok(orders);
    }

    /// <summary>
    /// Get a specific order by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
            return NotFound(new { message = "Order not found" });

        return Ok(order);
    }

    /// <summary>
    /// Create an order from cart items
    /// </summary>
    [HttpPost("from-cart")]
    public async Task<ActionResult<Order>> CreateOrderFromCart([FromQuery] string userId)
    {
        try
        {
            var order = await _orderService.CreateOrderFromCartAsync(userId);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create a manual order
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder([FromBody] Order order)
    {
        var createdOrder = await _orderService.CreateOrderAsync(order);
        return CreatedAtAction(nameof(GetOrder), new { id = createdOrder.Id }, createdOrder);
    }

    /// <summary>
    /// Update order status
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<Order>> UpdateOrder(int id, [FromBody] Order order)
    {
        var updatedOrder = await _orderService.UpdateOrderAsync(id, order);
        if (updatedOrder == null)
            return NotFound(new { message = "Order not found" });

        return Ok(updatedOrder);
    }

    /// <summary>
    /// Delete an order
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var success = await _orderService.DeleteOrderAsync(id);
        if (!success)
            return NotFound(new { message = "Order not found" });

        return NoContent();
    }
}
