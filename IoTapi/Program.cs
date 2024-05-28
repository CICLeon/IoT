using System.Text.Json.Serialization;
using Interfaces;
using IoT;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.DateFormatHandling = DateFormatHandling.IsoDateFormat;
        options.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;
        options.SerializerSettings.Culture = System.Globalization.CultureInfo.InvariantCulture;
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
    })
    .AddJsonOptions(option => {
        option.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Add configurations DbContext
builder.Services.AddDbContext<Contex>(option => {
    option.UseSqlServer(builder.Configuration.GetConnectionString("defaultConnections"));
});

// Add Services
builder.Services.AddScoped<IStoreFiles, StoreFile>();
builder.Services.AddSignalR();
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("all", builder => {
        builder
        .AllowAnyHeader()
        .AllowAnyMethod()
        .SetIsOriginAllowed((Host) => true)
        .AllowCredentials()
        .WithExposedHeaders();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("all");

app.UseRouting();

app.UseAuthorization();

app.UseAuthentication();

#pragma warning disable ASP0014
app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<IoTHub>("data");
    endpoints.MapControllers();
});
#pragma warning restore ASP0014

app.Run();