using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomizationToCartAndOrderItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CakeTemplateId",
                table: "OrderItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomizationJson",
                table: "OrderItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CakeTemplateId",
                table: "CartItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CustomUnitPrice",
                table: "CartItems",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomizationJson",
                table: "CartItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_CakeTemplateId",
                table: "OrderItems",
                column: "CakeTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CakeTemplateId",
                table: "CartItems",
                column: "CakeTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_CakeTemplates_CakeTemplateId",
                table: "CartItems",
                column: "CakeTemplateId",
                principalTable: "CakeTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_CakeTemplates_CakeTemplateId",
                table: "OrderItems",
                column: "CakeTemplateId",
                principalTable: "CakeTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_CakeTemplates_CakeTemplateId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_CakeTemplates_CakeTemplateId",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_CakeTemplateId",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CakeTemplateId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "CakeTemplateId",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "CustomizationJson",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "CakeTemplateId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "CustomUnitPrice",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "CustomizationJson",
                table: "CartItems");
        }
    }
}
