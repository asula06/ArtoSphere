using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArtoSphere.API.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedArtworksData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Artworks",
                columns: new[] { "Title", "Artist", "Description", "Price", "ImageUrl", "CreatedDate", "Category", "IsAvailable" },
                values: new object[,]
                {
                    { "The Night Watch", "Rembrandt van Rijn", "A famous group portrait of a city militia, known for its dramatic use of light and shadow.", 60000m, "img/f1.jpg", DateTime.UtcNow, "Painting", true },
                    { "The Annunciation", "Fra Angelico", "A beautiful depiction of the angel Gabriel announcing to the Virgin Mary that she would conceive the Son of God.", 48000m, "img/auction4.jpeg", DateTime.UtcNow, "Painting", true },
                    { "The Birth of Venus", "Sandro Botticelli", "A famous Renaissance painting depicting the goddess Venus emerging from the sea on a shell.", 8000000m, "img/auction5.jpeg", DateTime.UtcNow, "Painting", true },
                    { "Fayum Portrait", "Unknown", "This portrait, created using the encaustic technique, depicts a young aristocratic woman with a vivid gaze and a luxurious jewelry.", 500000m, "img/auction1.jpeg", DateTime.UtcNow, "Painting", true },
                    { "Villa of Mysteries Fresco-Summary", "Unknown", "This monumental fresco, painted on a vivid Pompeian red background, depicts a continuous sequence of female figures engaged in what appears to be a sacred ritual.", 1100000m, "img/auction2.jpeg", DateTime.UtcNow, "Painting", true },
                    { "Maestà", "Duccio di Buoninsegna", "A renowned altarpiece depicting the Virgin Mary enthroned with angels and saints, showcasing exquisite detail and vibrant colors.", 420000m, "img/auction3.jpeg", DateTime.UtcNow, "Painting", true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Artworks",
                keyColumn: "Id",
                keyValues: new object[] { 1, 2, 3, 4, 5, 6 });
        }
    }
}
