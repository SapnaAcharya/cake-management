using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDecorationName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
               name: "Name",
               table: "Decorations",
               type: "nvarchar(100)",
               maxLength: 100,
               nullable: false,
               oldClrType: typeof(string),
               oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Decorations_Name",
                table: "Decorations",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Decorations_Name",
                table: "Decorations");

            migrationBuilder.AlterColumn<string>(
               name: "Name",
               table: "Decorations",
               type: "nvarchar(max)",
               nullable: false,
               oldClrType: typeof(string),
               oldMaxLength: 100);
        }
    }
}
