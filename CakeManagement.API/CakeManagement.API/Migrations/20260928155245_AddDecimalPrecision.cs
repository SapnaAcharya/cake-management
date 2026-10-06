using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDecimalPrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "CakeDesigns",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalPrice",
                table: "CakeDesigns",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "CakeDesignDecoration",
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
                    table.PrimaryKey("PK_CakeDesignDecoration", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CakeDesignDecoration_CakeDesigns_CakeDesignId",
                        column: x => x.CakeDesignId,
                        principalTable: "CakeDesigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CakeDesignDecoration_Decorations_DecorationId",
                        column: x => x.DecorationId,
                        principalTable: "Decorations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CakeDesigns_TemplateId",
                table: "CakeDesigns",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeDesignDecoration_CakeDesignId",
                table: "CakeDesignDecoration",
                column: "CakeDesignId");

            migrationBuilder.CreateIndex(
                name: "IX_CakeDesignDecoration_DecorationId",
                table: "CakeDesignDecoration",
                column: "DecorationId");

            migrationBuilder.AddForeignKey(
                name: "FK_CakeDesigns_CakeTemplates_TemplateId",
                table: "CakeDesigns",
                column: "TemplateId",
                principalTable: "CakeTemplates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CakeDesigns_CakeTemplates_TemplateId",
                table: "CakeDesigns");

            migrationBuilder.DropTable(
                name: "CakeDesignDecoration");

            migrationBuilder.DropIndex(
                name: "IX_CakeDesigns_TemplateId",
                table: "CakeDesigns");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "CakeDesigns");

            migrationBuilder.DropColumn(
                name: "TotalPrice",
                table: "CakeDesigns");
        }
    }
}
