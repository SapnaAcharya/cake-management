using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueTemplateName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "CakeTemplates",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_CakeTemplates_Name",
                table: "CakeTemplates",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CakeTemplates_Name",
                table: "CakeTemplates");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "CakeTemplates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
