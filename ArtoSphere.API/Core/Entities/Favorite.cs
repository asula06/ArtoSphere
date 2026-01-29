namespace ArtoSphere.API.Core.Entities;

public class Favorite
{
    public int Id { get; set; }
    public int ArtworkId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime AddedDate { get; set; } = DateTime.UtcNow;
    
    public Artwork? Artwork { get; set; }
}
