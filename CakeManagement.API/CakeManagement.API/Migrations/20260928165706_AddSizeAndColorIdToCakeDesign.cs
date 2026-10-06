using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSizeAndColorIdToCakeDesign : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CakeDesignDecoration_CakeDesigns_CakeDesignId",
                table: "CakeDesignDecoration");

            migrationBuilder.DropForeignKey(
                name: "FK_CakeDesignDecoration_Decorations_DecorationId",
                table: "CakeDesignDecoration");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CakeDesignDecoration",
                table: "CakeDesignDecoration");

            migrationBuilder.RenameTable(
                name: "CakeDesignDecoration",
                newName: "CakeDesignDecorations");

            migrationBuilder.RenameIndex(
                name: "IX_CakeDesignDecoration_DecorationId",
                table: "CakeDesignDecorations",
                newName: "IX_CakeDesignDecorations_DecorationId");

            migrationBuilder.RenameIndex(
                name: "IX_CakeDesignDecoration_CakeDesignId",
                table: "CakeDesignDecorations",
                newName: "IX_CakeDesignDecorations_CakeDesignId");

            migrationBuilder.AddColumn<string>(
                name: "ColorId",
                table: "CakeDesigns",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Size",
                table: "CakeDesigns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CakeDesignDecorations",
                table: "CakeDesignDecorations",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CakeDesignDecorations_CakeDesigns_CakeDesignId",
                table: "CakeDesignDecorations",
                column: "CakeDesignId",
                principalTable: "CakeDesigns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CakeDesignDecorations_Decorations_DecorationId",
                table: "CakeDesignDecorations",
                column: "DecorationId",
                principalTable: "Decorations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CakeDesignDecorations_CakeDesigns_CakeDesignId",
                table: "CakeDesignDecorations");

            migrationBuilder.DropForeignKey(
                name: "FK_CakeDesignDecorations_Decorations_DecorationId",
                table: "CakeDesignDecorations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CakeDesignDecorations",
                table: "CakeDesignDecorations");

            migrationBuilder.DropColumn(
                name: "ColorId",
                table: "CakeDesigns");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "CakeDesigns");

            migrationBuilder.RenameTable(
                name: "CakeDesignDecorations",
                newName: "CakeDesignDecoration");

            migrationBuilder.RenameIndex(
                name: "IX_CakeDesignDecorations_DecorationId",
                table: "CakeDesignDecoration",
                newName: "IX_CakeDesignDecoration_DecorationId");

            migrationBuilder.RenameIndex(
                name: "IX_CakeDesignDecorations_CakeDesignId",
                table: "CakeDesignDecoration",
                newName: "IX_CakeDesignDecoration_CakeDesignId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CakeDesignDecoration",
                table: "CakeDesignDecoration",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CakeDesignDecoration_CakeDesigns_CakeDesignId",
                table: "CakeDesignDecoration",
                column: "CakeDesignId",
                principalTable: "CakeDesigns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CakeDesignDecoration_Decorations_DecorationId",
                table: "CakeDesignDecoration",
                column: "DecorationId",
                principalTable: "Decorations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
