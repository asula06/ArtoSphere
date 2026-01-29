using ArtoSphere.API.Core.Entities;
using ArtoSphere.API.Core.Interfaces;
using ArtoSphere.API.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS for frontend communication
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()  // Allow any origin for development
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add DbContext with MySQL database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Register services for dependency injection
// Controllers will use these services instead of accessing DbContext directly
builder.Services.AddScoped<IArtworkService, ArtworkService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IFavoritesService, FavoritesService>();
builder.Services.AddScoped<IOrderService, OrderService>();

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
// CORS must be used before routing
app.UseCors("AllowFrontend");

// Enable Swagger for both Development and Production
app.UseSwagger();
app.UseSwaggerUI();

// Serve static files from wwwroot
app.UseStaticFiles();

// HTTPS redirection disabled for now because no HTTPS endpoint is configured
// app.UseHttpsRedirection();
app.MapControllers();

// Root endpoint
app.MapGet("/", () => new { message = "ArtoSphere API is running!", version = "1.0", swagger = "/swagger" });

// Handle CORS preflight requests
app.MapMethods("/{**route}", new[] { "OPTIONS" }, (HttpContext context) =>
{
    context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
    return Results.Ok();
});

app.Run();
