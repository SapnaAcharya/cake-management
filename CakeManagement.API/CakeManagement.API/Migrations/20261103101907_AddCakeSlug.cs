using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCakeSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add the column (every row starts as empty)
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Cakes",
                type: "text",
                nullable: false,
                defaultValue: "");

            // 2. Fill slugs from the cake name
            migrationBuilder.Sql(@"
                UPDATE ""Cakes""
                SET ""Slug"" = LOWER(TRIM(BOTH '-' FROM
                    REGEXP_REPLACE(TRIM(""Name""), '[^a-zA-Z0-9]+', '-', 'g')))
                WHERE ""Slug"" = '';");

            // 3. Fallback if a name produced an empty slug
            migrationBuilder.Sql(@"
                UPDATE ""Cakes""
                SET ""Slug"" = 'cake-' || ""Id""
                WHERE ""Slug"" = '';");

            // 4. Make duplicates unique by appending the Id
            migrationBuilder.Sql(@"
                UPDATE ""Cakes"" c
                SET ""Slug"" = c.""Slug"" || '-' || c.""Id""
                WHERE EXISTS (
                    SELECT 1 FROM ""Cakes"" d
                    WHERE d.""Slug"" = c.""Slug"" AND d.""Id"" < c.""Id"");");

            // 5. Only now create the unique index
            migrationBuilder.CreateIndex(
                name: "IX_Cakes_Slug",
                table: "Cakes",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Cakes_Slug",
                table: "Cakes");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Cakes");
        }
    }
}
