using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCakeDesigns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CakeDesigns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Font = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tiers = table.Column<int>(type: "int", nullable: false),
                    Sponge = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Frosting = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pen = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Candles = table.Column<int>(type: "int", nullable: false),
                    Lit = table.Column<bool>(type: "bit", nullable: false),
                    Sprinkles = table.Column<bool>(type: "bit", nullable: false),
                    Cherries = table.Column<bool>(type: "bit", nullable: false),
                    Drips = table.Column<bool>(type: "bit", nullable: false),
                    Seed = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeDesigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeDesigns_Cakes_CakeId",
                        column: x => x.CakeId,
                        principalTable: "Cakes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CakeDesigns_CakeId",
                table: "CakeDesigns",
                column: "CakeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CakeDesigns");
        }
    }
}
