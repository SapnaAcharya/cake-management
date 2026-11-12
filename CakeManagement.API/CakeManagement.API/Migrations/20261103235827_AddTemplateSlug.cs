using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTemplateSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Works on a brand-new database and on one where Slug was already added manually
            migrationBuilder.Sql(@"ALTER TABLE ""CakeTemplates"" ADD COLUMN IF NOT EXISTS ""Slug"" character varying(200) NOT NULL DEFAULT '';");

            migrationBuilder.Sql(@"
                UPDATE ""CakeTemplates""
                SET ""Slug"" = LOWER(TRIM(BOTH '-' FROM
                    REGEXP_REPLACE(TRIM(""Name""), '[^a-zA-Z0-9]+', '-', 'g')))
                WHERE ""Slug"" = '';");

            migrationBuilder.Sql(@"
                UPDATE ""CakeTemplates""
                SET ""Slug"" = 'template-' || ""Id""
                WHERE ""Slug"" = '';");

            migrationBuilder.Sql(@"
                UPDATE ""CakeTemplates"" c
                SET ""Slug"" = c.""Slug"" || '-' || c.""Id""
                WHERE EXISTS (
                    SELECT 1 FROM ""CakeTemplates"" d
                    WHERE d.""Slug"" = c.""Slug"" AND d.""Id"" < c.""Id"");");

            migrationBuilder.Sql(@"CREATE UNIQUE INDEX IF NOT EXISTS ""IX_CakeTemplates_Slug"" ON ""CakeTemplates"" (""Slug"");");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CakeTemplates_Slug",
                table: "CakeTemplates");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "CakeTemplates");
        }
    }
}