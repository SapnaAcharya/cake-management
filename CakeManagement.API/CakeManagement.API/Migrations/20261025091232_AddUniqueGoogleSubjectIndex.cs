using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueGoogleSubjectIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_GoogleSubject",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_GoogleSubject",
                table: "Users",
                column: "GoogleSubject",
                unique: true,
                filter: "\"GoogleSubject\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_GoogleSubject",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_GoogleSubject",
                table: "Users",
                column: "GoogleSubject",
                unique: true);
        }
    }
}
