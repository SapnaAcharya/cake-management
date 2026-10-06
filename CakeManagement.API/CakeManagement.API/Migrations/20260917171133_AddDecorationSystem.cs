using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDecorationSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Decorations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Occasion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Decorations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CakeCustomizationDecoration",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeCustomizationId = table.Column<int>(type: "int", nullable: false),
                    DecorationId = table.Column<int>(type: "int", nullable: false),
                    PositionX = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PositionY = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Scale = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rotation = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Layer = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeCustomizationDecoration", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeCustomizationDecoration_CakeCustomizations_CakeCustomizationId",
                        column: x => x.CakeCustomizationId,
                        principalTable: "CakeCustomizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CakeCustomizationDecoration_Decorations_DecorationId",
                        column: x => x.DecorationId,
                        principalTable: "Decorations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CakeCustomizationDecoration_CakeCustomizationId",
                table: "CakeCustomizationDecoration",
                column: "CakeCustomizationId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeCustomizationDecoration_DecorationId",
                table: "CakeCustomizationDecoration",
                column: "DecorationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CakeCustomizationDecoration");

            migrationBuilder.DropTable(
                name: "Decorations");
        }
    }
}
