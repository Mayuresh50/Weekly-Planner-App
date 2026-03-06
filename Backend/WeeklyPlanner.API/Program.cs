using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using WeeklyPlanner.Application;
using WeeklyPlanner.Infrastructure;
using WeeklyPlanner.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// --------------------
// Add Application Layers
// --------------------
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// --------------------
// Controllers & JSON
// --------------------
builder.Services.AddControllers()
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddEndpointsApiExplorer();

// --------------------
// CORS (Angular)
// --------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "https://calm-ground-05bf86c00.1.azurestaticapps.net"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// --------------------
// Swagger + JWT Support
// --------------------
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Weekly Planner API",
        Version = "v1",
        Description = "Enterprise Weekly Planning System API"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token. Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

});

// --------------------
// JWT Authentication
// --------------------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
                builder.Configuration["Jwt:Key"] 
                ?? builder.Configuration["Jwt:Secret"] 
                ?? "A_VERY_SECURE_AND_LONG_KEY_FOR_JWT_TOKEN_GENERATION_12345"
            )
        )
    };


});

// --------------------
// Build App
// --------------------
var app = builder.Build();

// --------------------
// Middleware Pipeline
// --------------------
app.UseMiddleware<ExceptionMiddleware>();

// Enable Swagger globally (including Production)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Weekly Planner API V1");
    c.RoutePrefix = "swagger"; // Standard access at /swagger
});

// Root Health Check
app.MapGet("/", () => "Weekly Planner API running on Azure");

app.UseCors("AllowAngular");

// Https is handled by Azure App Service SSL termination usually, 
// but we can uncomment if required for strict HSTS.
// app.UseHttpsRedirection(); 

app.UseAuthentication();
app.UseAuthorization();

// --------------------
// Routes
// --------------------
app.MapControllers();

// --------------------
// Seed Data & Run
// --------------------
try
{
    using (var scope = app.Services.CreateScope())
    {
        await WeeklyPlanner.API.DbInitializer.SeedAsync(app.Services);
    }

    app.Run();
}
catch (Exception ex)
{
    Console.Error.WriteLine("CRITICAL: Application failed to start.");
    Console.Error.WriteLine(ex.Message);
    throw;
}
