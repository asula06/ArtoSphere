namespace ArtoSphere.API.Core.Entities;

public class Order
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Completed, Cancelled
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ArtworkId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    
    public Artwork? Artwork { get; set; }
    public Order? Order { get; set; }
}
