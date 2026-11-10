using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTemplateSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Slug column was added manually and backfilled, so only create the index
            migrationBuilder.CreateIndex(
                name: "IX_CakeTemplates_Slug",
                table: "CakeTemplates",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CakeTemplates_Slug",
                table: "CakeTemplates");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "CakeTemplates");
        }
    }
}