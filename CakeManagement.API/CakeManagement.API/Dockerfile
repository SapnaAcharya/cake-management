# =========================
# Build stage
# =========================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy project file first
COPY CakeManagementAPI.csproj ./

# Restore NuGet packages
RUN dotnet restore "CakeManagementAPI.csproj"

# Copy the rest of the application
COPY . .

# Publish the application
RUN dotnet publish "CakeManagementAPI.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore


# =========================
# Runtime stage
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# ASP.NET Core listens on port 8080
EXPOSE 8080

# Start the API
ENTRYPOINT ["dotnet", "CakeManagementAPI.dll"]