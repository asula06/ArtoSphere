namespace ArtoSphere.API.Core.Entities;

public class CartItem
{
    public int Id { get; set; }
    public int ArtworkId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal PriceAtTime { get; set; }
    public DateTime AddedDate { get; set; } = DateTime.UtcNow;
    
    public Artwork? Artwork { get; set; }
}
