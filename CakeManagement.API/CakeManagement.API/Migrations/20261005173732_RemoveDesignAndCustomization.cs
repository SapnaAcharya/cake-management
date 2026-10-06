using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDesignAndCustomization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CakeCustomizationDecoration");

            migrationBuilder.DropTable(
                name: "CakeDesignDecorations");

            migrationBuilder.DropTable(
                name: "CakeCustomizations");

            migrationBuilder.DropTable(
                name: "CakeDesigns");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CakeCustomizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    BaseColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BaseShape = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CanvasData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Flavor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GuestId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Occasion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreviewImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TierCount = table.Column<int>(type: "int", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
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

            migrationBuilder.CreateTable(
                name: "CakeDesigns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeId = table.Column<int>(type: "int", nullable: false),
                    TemplateId = table.Column<int>(type: "int", nullable: true),
                    Candles = table.Column<int>(type: "int", nullable: false),
                    Cherries = table.Column<bool>(type: "bit", nullable: false),
                    ColorId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Drips = table.Column<bool>(type: "bit", nullable: false),
                    Font = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Frosting = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Lit = table.Column<bool>(type: "bit", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderId = table.Column<int>(type: "int", nullable: true),
                    Pen = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Seed = table.Column<long>(type: "bigint", nullable: false),
                    Size = table.Column<int>(type: "int", nullable: false),
                    Sponge = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Sprinkles = table.Column<bool>(type: "bit", nullable: false),
                    Tiers = table.Column<int>(type: "int", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeDesigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeDesigns_CakeTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "CakeTemplates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CakeDesigns_Cakes_CakeId",
                        column: x => x.CakeId,
                        principalTable: "Cakes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CakeCustomizationDecoration",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeCustomizationId = table.Column<int>(type: "int", nullable: false),
                    DecorationId = table.Column<int>(type: "int", nullable: false),
                    Layer = table.Column<int>(type: "int", nullable: false),
                    PositionX = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    PositionY = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Rotation = table.Column<decimal>(type: "decimal(10,4)", precision: 10, scale: 4, nullable: false),
                    Scale = table.Column<decimal>(type: "decimal(10,4)", precision: 10, scale: 4, nullable: false)
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

            migrationBuilder.CreateTable(
                name: "CakeDesignDecorations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeDesignId = table.Column<int>(type: "int", nullable: false),
                    DecorationId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeDesignDecorations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeDesignDecorations_CakeDesigns_CakeDesignId",
                        column: x => x.CakeDesignId,
                        principalTable: "CakeDesigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CakeDesignDecorations_Decorations_DecorationId",
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

            migrationBuilder.CreateIndex(
                name: "IX_CakeCustomizations_CakeId",
                table: "CakeCustomizations",
                column: "CakeId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeCustomizations_UserId",
                table: "CakeCustomizations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeDesignDecorations_CakeDesignId",
                table: "CakeDesignDecorations",
                column: "CakeDesignId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeDesignDecorations_DecorationId",
                table: "CakeDesignDecorations",
                column: "DecorationId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeDesigns_CakeId",
                table: "CakeDesigns",
                column: "CakeId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeDesigns_TemplateId",
                table: "CakeDesigns",
                column: "TemplateId");
        }
    }
}
