using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCakeCustomizations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CakeCustomizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    GuestId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Occassion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BaseShape = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TierCount = table.Column<int>(type: "int", nullable: false),
                    Flavor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BaseColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CanvasData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreviewImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeCustomizations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeCustomizations_Cakes_CakeId",
                        column: x => x.CakeId,
                        principalTable: "Cakes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CakeCustomizations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CakeCustomizations_CakeId",
                table: "CakeCustomizations",
                column: "CakeId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeCustomizations_UserId",
                table: "CakeCustomizations",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CakeCustomizations");
        }
    }
}
