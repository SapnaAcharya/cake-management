using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixTrainingPackageSlug : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        ALTER TABLE ""TrainingPackages""
        ADD COLUMN IF NOT EXISTS ""Slug"" text NOT NULL DEFAULT '';

        UPDATE ""TrainingPackages""
        SET ""Slug"" = trim(both '-' from regexp_replace(lower(""Name""), '[^a-z0-9]+', '-', 'g'))
        WHERE ""Slug"" = '';

        UPDATE ""TrainingPackages""
        SET ""Slug"" = 'course-' || ""Id""
        WHERE ""Slug"" = '';

        UPDATE ""TrainingPackages"" t
        SET ""Slug"" = t.""Slug"" || '-' || t.""Id""
        FROM (
            SELECT ""Id"",
                   ROW_NUMBER() OVER (PARTITION BY ""Slug"" ORDER BY ""Id"") AS rn
            FROM ""TrainingPackages""
        ) d
        WHERE t.""Id"" = d.""Id"" AND d.rn > 1;

        ALTER TABLE ""TrainingPackages"" ALTER COLUMN ""Slug"" DROP DEFAULT;

        CREATE UNIQUE INDEX IF NOT EXISTS ""IX_TrainingPackages_Slug""
        ON ""TrainingPackages"" (""Slug"");
    ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        DROP INDEX IF EXISTS ""IX_TrainingPackages_Slug"";
        ALTER TABLE ""TrainingPackages"" DROP COLUMN IF EXISTS ""Slug"";
    ");
        }
    }
}
