using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ArtoSphere.API.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Order>> GetUserOrdersAsync(string userId)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(oi => oi.Artwork)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderByIdAsync(int orderId)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(oi => oi.Artwork)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }

    public async Task<Order> CreateOrderAsync(Order order)
    {
        order.OrderDate = DateTime.UtcNow;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> UpdateOrderAsync(int orderId, Order order)
    {
        var existingOrder = await _context.Orders.FindAsync(orderId);
        if (existingOrder == null)
            return null;

        existingOrder.Status = order.Status;
        existingOrder.TotalAmount = order.TotalAmount;

        _context.Orders.Update(existingOrder);
        await _context.SaveChangesAsync();
        return existingOrder;
    }

    public async Task<bool> DeleteOrderAsync(int orderId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return false;

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Order> CreateOrderFromCartAsync(string userId)
    {
        var cartItems = await _context.CartItems
            .Include(ci => ci.Artwork)
            .Where(ci => ci.UserId == userId)
            .ToListAsync();

        if (!cartItems.Any())
            throw new Exception("Cart is empty");

        var order = new Order
        {
            UserId = userId,
            Status = "Pending",
            TotalAmount = cartItems.Sum(ci => ci.PriceAtTime * ci.Quantity)
        };

        foreach (var cartItem in cartItems)
        {
            order.Items.Add(new OrderItem
            {
                ArtworkId = cartItem.ArtworkId,
                Quantity = cartItem.Quantity,
                Price = cartItem.PriceAtTime
            });
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Clear cart after order creation
        _context.CartItems.RemoveRange(cartItems);
        await _context.SaveChangesAsync();

        return order;
    }
}
