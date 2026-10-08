using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.PhoneVerification;
using CakeManagementAPI.Filters;
using CakeManagementAPI.Services;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// CORS: localhost for dev + AllowedOrigins (comma-separated) from config/env
var allowedOrigins = (builder.Configuration["AllowedOrigins"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Concat(new[] { "http://localhost:5173", "http://localhost:3000" })
    .Select(o => o.TrimEnd('/'))
    .Distinct()
    .ToArray();

// Add cors to the container
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token."
    });

    options.AddSecurityRequirement(document =>
    {
        var scheme = new OpenApiSecuritySchemeReference("Bearer", document);

        return new OpenApiSecurityRequirement
        {
            [scheme] = []
        };
    });

    options.OperationFilter<GuestIdHeaderFilter>();
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(BuildConnectionString(
        builder.Configuration.GetConnectionString("DefaultConnection"))));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
    throw new InvalidOperationException("Jwt:Key must be set and at least 32 characters long.");

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Add category service to the container
builder.Services.AddScoped<ICategoryService, CategoryService>();

// Add cake services to the container
builder.Services.AddScoped<ICakeService, CakeService>();

// Add auth service to the container
builder.Services.AddScoped<IAuthService, AuthService>();

// Add cart services to the container
builder.Services.AddScoped<ICartService, CartService>();

// Add order services to the container
builder.Services.AddScoped<IOrderService, OrderService>();

// Add admin order service to the container
builder.Services.AddScoped<IAdminOrderService, AdminOrderService>();

// Add user service to the container
builder.Services.AddScoped<IUserService, UserService>();

// Add admin user services to the container
builder.Services.AddScoped<IAdminUserService, AdminUserService>();

// Add phone verification to the container
builder.Services.AddScoped<IPhoneVerificationService, PhoneVerificationService>();

// Add decoration to the container
builder.Services.AddScoped<IDecorationService, DecorationService>();

// Add cake template service to the container
builder.Services.AddScoped<ICakeTemplateService, CakeTemplateService>();

// Add cake pricing service to the container
builder.Services.AddScoped<CakePricingService>();

// Add Customization snapshot service to the container.
builder.Services.AddScoped<ICustomizationSnapshotService, CustomizationSnapshotService>();

// Add Customization Service to the container
builder.Services.AddScoped<ICustomizationService, CustomizationService>();

var app = builder.Build();

// Render sits behind a proxy that terminates HTTPS
var forwardedOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
forwardedOptions.KnownNetworks.Clear();
forwardedOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedOptions);

// Migrate + seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await context.Database.MigrateAsync();
    await DbSeeder.SeedAdminAsync(context, builder.Configuration);
}

// Swagger: always in Development, or in production only if EnableSwagger=true
if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("EnableSwagger"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Render terminates HTTPS, so no UseHttpsRedirection

// CORS
app.UseCors("ReactPolicy");

app.UseStaticFiles();

app.UseAuthentication();

app.UseAuthorization();

app.MapGet("/health", () => Results.Ok("ok"));

app.MapControllers();

app.Run();

// Accepts both Render's postgres://user:pass@host/db URL and a normal Npgsql string
static string BuildConnectionString(string? raw)
{
    if (string.IsNullOrWhiteSpace(raw))
        throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not set.");

    if (!raw.StartsWith("postgres://") && !raw.StartsWith("postgresql://"))
        return raw;

    var uri = new Uri(raw);
    var userInfo = uri.UserInfo.Split(':', 2);

    return new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = Uri.UnescapeDataString(userInfo[1]),
        Database = uri.AbsolutePath.TrimStart('/'),
        SslMode = Npgsql.SslMode.Prefer
    }.ConnectionString;
}