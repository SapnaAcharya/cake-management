using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingBatchToEnrollment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrainingRegistrations");

            migrationBuilder.DropColumn(
                name: "PreferredDate",
                table: "TrainingEnrollments");

            migrationBuilder.AddColumn<int>(
                name: "TrainingBatchId",
                table: "TrainingEnrollments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_TrainingEnrollments_TrainingBatchId",
                table: "TrainingEnrollments",
                column: "TrainingBatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingEnrollments_TrainingBatches_TrainingBatchId",
                table: "TrainingEnrollments",
                column: "TrainingBatchId",
                principalTable: "TrainingBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrainingEnrollments_TrainingBatches_TrainingBatchId",
                table: "TrainingEnrollments");

            migrationBuilder.DropIndex(
                name: "IX_TrainingEnrollments_TrainingBatchId",
                table: "TrainingEnrollments");

            migrationBuilder.DropColumn(
                name: "TrainingBatchId",
                table: "TrainingEnrollments");

            migrationBuilder.AddColumn<DateTime>(
                name: "PreferredDate",
                table: "TrainingEnrollments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TrainingRegistrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TrainingBatchId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false),
                    RegisteredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingRegistrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingRegistrations_TrainingBatches_TrainingBatchId",
                        column: x => x.TrainingBatchId,
                        principalTable: "TrainingBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrainingRegistrations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRegistrations_TrainingBatchId",
                table: "TrainingRegistrations",
                column: "TrainingBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRegistrations_UserId_TrainingBatchId",
                table: "TrainingRegistrations",
                columns: new[] { "UserId", "TrainingBatchId" },
                unique: true);
        }
    }
}
