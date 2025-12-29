using PdfToolsApi.Core.Services;
using PdfSharp.Fonts;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Politicas de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:1420")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// Servicios
builder.Services.AddScoped<IPdfMergeService, PdfMergeService>();
builder.Services.AddScoped<InterfaceIsPdf, IsPdf>();
builder.Services.AddScoped<IIsValidImage, IsValidImage>();
builder.Services.AddScoped<IPdfSplitService, PdfSplitService>();
builder.Services.AddScoped<IPdfDeletePagesService, PdfDeletePagesService>();
builder.Services.AddScoped<IPdfTextService, PdfTextService>();
builder.Services.AddScoped<IPdfImageToPdfService, PdfImageToPdfService>();
builder.Services.AddScoped<IPdfToImageService, PdfToImageService>();

var app = builder.Build();

GlobalFontSettings.FontResolver ??= new CustomFontResolver();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
