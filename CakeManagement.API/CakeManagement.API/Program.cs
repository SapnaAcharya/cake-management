using CakeManagementAPI.Data;
using CakeManagementAPI.DTOs;
using CakeManagementAPI.DTOs.PhoneVerification;
using CakeManagementAPI.Filters;
using CakeManagementAPI.Services;
using CakeManagementAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

// Add cors to the container
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();

//builder.Services.AddSwaggerGen();
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
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
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
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"]!))
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

// ---- TEMPORARY DEBUG (delete after testing) ----
Console.WriteLine($"ENV = {builder.Environment.EnvironmentName}");
Console.WriteLine($"CONN = '{builder.Configuration.GetConnectionString("DefaultConnection")}'");
Console.WriteLine($"Files in: {builder.Environment.ContentRootPath}");

// Debug
Console.WriteLine($"ENV = {builder.Environment.EnvironmentName}");
Console.WriteLine(
    $"CONN = '{builder.Configuration.GetConnectionString("DefaultConnection")}'"
);
Console.WriteLine($"Files in: {builder.Environment.ContentRootPath}");

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await context.Database.MigrateAsync();
    await DbSeeder.SeedAdminAsync(context, builder.Configuration);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

// CORS
app.UseCors("ReactPolicy");

app.UseStaticFiles();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();