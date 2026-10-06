using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCakeTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CakeTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsPopular = table.Column<bool>(type: "bit", nullable: false),
                    Tiers = table.Column<int>(type: "int", nullable: false),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MinPrepHours = table.Column<int>(type: "int", nullable: false),
                    MaxPrepHours = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CakeTemplateColors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeTemplateId = table.Column<int>(type: "int", nullable: false),
                    ColorName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeTemplateColors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeTemplateColors_CakeTemplates_CakeTemplateId",
                        column: x => x.CakeTemplateId,
                        principalTable: "CakeTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CakeTemplateFeatures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeTemplateId = table.Column<int>(type: "int", nullable: false),
                    FeatureName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeTemplateFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeTemplateFeatures_CakeTemplates_CakeTemplateId",
                        column: x => x.CakeTemplateId,
                        principalTable: "CakeTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CakeTemplateImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeTemplateId = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeTemplateImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeTemplateImages_CakeTemplates_CakeTemplateId",
                        column: x => x.CakeTemplateId,
                        principalTable: "CakeTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CakeTemplateSizes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CakeTemplateId = table.Column<int>(type: "int", nullable: false),
                    SizeInInches = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CakeTemplateSizes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeTemplateSizes_CakeTemplates_CakeTemplateId",
                        column: x => x.CakeTemplateId,
                        principalTable: "CakeTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CakeTemplateColors_CakeTemplateId",
                table: "CakeTemplateColors",
                column: "CakeTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeTemplateFeatures_CakeTemplateId",
                table: "CakeTemplateFeatures",
                column: "CakeTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeTemplateImages_CakeTemplateId",
                table: "CakeTemplateImages",
                column: "CakeTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeTemplateSizes_CakeTemplateId",
                table: "CakeTemplateSizes",
                column: "CakeTemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CakeTemplateColors");

            migrationBuilder.DropTable(
                name: "CakeTemplateFeatures");

            migrationBuilder.DropTable(
                name: "CakeTemplateImages");

            migrationBuilder.DropTable(
                name: "CakeTemplateSizes");

            migrationBuilder.DropTable(
                name: "CakeTemplates");
        }
    }
}
