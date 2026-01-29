using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArtoSphere.API.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Artworks (Title, Artist, Description, Price, ImageUrl, CreatedDate, Category, IsAvailable) VALUES
                ('The Night Watch', 'Rembrandt van Rijn', 'A famous group portrait of a city militia, known for its dramatic use of light and shadow.', 60000, 'img/f1.jpg', '1642-01-01', 'Painting', 1),
                ('The Annunciation', 'Fra Angelico', 'A beautiful depiction of the angel Gabriel announcing to the Virgin Mary that she would conceive the Son of God.', 48000, 'img/auction4.jpeg', '1437-01-01', 'Painting', 1),
                ('The Birth of Venus', 'Sandro Botticelli', 'A famous Renaissance painting depicting the goddess Venus emerging from the sea on a shell.', 8000000, 'img/auction5.jpeg', '1484-01-01', 'Painting', 1),
                ('Fayum Portrait', 'Unknown', 'This portrait, created using the encaustic technique, depicts a young aristocratic woman with a vivid gaze and luxurious jewelry.', 500000, 'img/auction1.jpeg', '0100-01-01', 'Painting', 1),
                ('Villa of Mysteries Fresco', 'Unknown', 'This monumental fresco, painted on a vivid Pompeian red background, depicts a continuous sequence of female figures engaged in what appears to be a sacred ritual.', 1100000, 'img/auction2.jpeg', '0100-01-01', 'Painting', 1),
                ('Maestà', 'Duccio di Buoninsegna', 'A renowned altarpiece depicting the Virgin Mary enthroned with angels and saints, showcasing exquisite detail and vibrant colors.', 420000, 'img/auction3.jpeg', '1308-01-01', 'Painting', 1),
                ('The Creation of Adam', 'Michelangelo', 'One of the most iconic images of the Renaissance, painted on the ceiling of the Sistine Chapel.', 1500000, '/img/creation.jpg', '1508-01-01', 'Renaissance', 1),
                ('The Persistence of Memory', 'Salvador Dalí', 'A surrealist masterpiece featuring melting clocks in a dreamlike landscape.', 750000, '/img/persistence.jpg', '1931-01-01', 'Surrealism', 1),
                ('The Tower of Babel', 'Pieter Bruegel the Elder', 'A detailed biblical scene depicting the construction of the Tower of Babel.', 500000, '/img/babel.jpg', '1563-01-01', 'Renaissance', 1),
                ('Starry Night', 'Vincent van Gogh', 'An oil painting of the sky during the night from the Saint-Paul-de-Mausole asylum in France.', 2000000, '/img/starry-night.jpg', '1889-01-01', 'Post-Impressionism', 1),
                ('Girl with a Pearl Earring', 'Johannes Vermeer', 'An oil painting of a girl wearing an exotic dress and an unusual large pearl earring.', 900000, '/img/pearl-earring.jpg', '1665-01-01', 'Golden Age', 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
