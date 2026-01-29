# ArtoSphere API

C# ASP.NET Core backend for the ArtoSphere art gallery application.

## Prerequisites
- .NET 8 SDK
- Rider or Visual Studio

## Getting Started

### 1. Run the API
```bash
cd ArtoSphere.API
dotnet run
```

The API will start on `https://localhost:5001` and `http://localhost:5000`

### 2. View Swagger Documentation
Navigate to `https://localhost:5001/swagger` to see all endpoints

### 3. API Endpoints

#### Artworks
- `GET /api/artworks` - Get all artworks
- `GET /api/artworks/{id}` - Get artwork by ID
- `POST /api/artworks` - Create new artwork
- `PUT /api/artworks/{id}` - Update artwork
- `DELETE /api/artworks/{id}` - Delete artwork

#### Cart
- `GET /api/cart/{userId}` - Get user's cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/{id}` - Remove from cart
- `DELETE /api/cart/user/{userId}` - Clear cart

#### Favorites
- `GET /api/favorites/{userId}` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/{id}` - Remove from favorites

## Database
Currently using in-memory database. To use SQL Server:
1. Update `Program.cs` to use SQL Server
2. Create migrations: `dotnet ef migrations add Initial`
3. Update database: `dotnet ef database update`

## CORS
The API is configured to accept requests from the frontend at any origin (for development).
