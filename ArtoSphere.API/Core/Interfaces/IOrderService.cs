using ArtoSphere.API.Core.Entities;

namespace ArtoSphere.API.Core.Interfaces;

public interface IOrderService
{
    Task<List<Order>> GetUserOrdersAsync(string userId);
    Task<Order?> GetOrderByIdAsync(int orderId);
    Task<Order> CreateOrderAsync(Order order);
    Task<Order?> UpdateOrderAsync(int orderId, Order order);
    Task<bool> DeleteOrderAsync(int orderId);
    Task<Order> CreateOrderFromCartAsync(string userId);
}
