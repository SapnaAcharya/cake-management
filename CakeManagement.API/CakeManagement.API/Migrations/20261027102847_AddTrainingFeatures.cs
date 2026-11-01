using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrainingBatches_Trainers_TrainerId",
                table: "TrainingBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingBatches_TrainingPackages_TrainingPackageId",
                table: "TrainingBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingRegistrations_TrainingBatches_TrainingBatchId",
                table: "TrainingRegistrations");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingRegistrations_Users_UserId",
                table: "TrainingRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_TrainingRegistrations_UserId",
                table: "TrainingRegistrations");

            migrationBuilder.AlterColumn<decimal>(
                name: "Fee",
                table: "TrainingPackages",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRegistrations_UserId_TrainingBatchId",
                table: "TrainingRegistrations",
                columns: new[] { "UserId", "TrainingBatchId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingBatches_Trainers_TrainerId",
                table: "TrainingBatches",
                column: "TrainerId",
                principalTable: "Trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingBatches_TrainingPackages_TrainingPackageId",
                table: "TrainingBatches",
                column: "TrainingPackageId",
                principalTable: "TrainingPackages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingRegistrations_TrainingBatches_TrainingBatchId",
                table: "TrainingRegistrations",
                column: "TrainingBatchId",
                principalTable: "TrainingBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingRegistrations_Users_UserId",
                table: "TrainingRegistrations",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrainingBatches_Trainers_TrainerId",
                table: "TrainingBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingBatches_TrainingPackages_TrainingPackageId",
                table: "TrainingBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingRegistrations_TrainingBatches_TrainingBatchId",
                table: "TrainingRegistrations");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingRegistrations_Users_UserId",
                table: "TrainingRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_TrainingRegistrations_UserId_TrainingBatchId",
                table: "TrainingRegistrations");

            migrationBuilder.AlterColumn<decimal>(
                name: "Fee",
                table: "TrainingPackages",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRegistrations_UserId",
                table: "TrainingRegistrations",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingBatches_Trainers_TrainerId",
                table: "TrainingBatches",
                column: "TrainerId",
                principalTable: "Trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingBatches_TrainingPackages_TrainingPackageId",
                table: "TrainingBatches",
                column: "TrainingPackageId",
                principalTable: "TrainingPackages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingRegistrations_TrainingBatches_TrainingBatchId",
                table: "TrainingRegistrations",
                column: "TrainingBatchId",
                principalTable: "TrainingBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingRegistrations_Users_UserId",
                table: "TrainingRegistrations",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
