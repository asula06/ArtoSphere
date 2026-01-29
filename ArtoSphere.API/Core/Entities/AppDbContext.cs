using Microsoft.EntityFrameworkCore;

namespace ArtoSphere.API.Core.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Artwork> Artworks { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Favorite> Favorites { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Seeding moved to DatabaseController
    }
}
