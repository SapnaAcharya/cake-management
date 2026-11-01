using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CakeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddVerificationToEmailVerificationCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "VerificationTokenExpiresAt",
                table: "EmailVerificationCodes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationTokenHash",
                table: "EmailVerificationCodes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "VerificationTokenUsed",
                table: "EmailVerificationCodes",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VerificationTokenExpiresAt",
                table: "EmailVerificationCodes");

            migrationBuilder.DropColumn(
                name: "VerificationTokenHash",
                table: "EmailVerificationCodes");

            migrationBuilder.DropColumn(
                name: "VerificationTokenUsed",
                table: "EmailVerificationCodes");
        }
    }
}
