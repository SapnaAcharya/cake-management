using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCakeFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsBestSeller",
                table: "Cakes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                table: "Cakes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTrending",
                table: "Cakes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBestSeller",
                table: "Cakes");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "Cakes");

            migrationBuilder.DropColumn(
                name: "IsTrending",
                table: "Cakes");
        }
    }
}
