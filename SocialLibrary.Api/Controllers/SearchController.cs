using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using SocialLibrary.Api.DTOs;

namespace SocialLibrary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _cfg;

    public SearchController(IHttpClientFactory httpFactory, IConfiguration cfg)
    {
        _httpFactory = httpFactory;
        _cfg = cfg;
    }

    // GOOGLE BOOKS (anahtarsız çalışır)
    // GET /api/search/books?q=harry%20potter
    [HttpGet("books")]
    public async Task<ActionResult<List<SearchItemDto>>> SearchBooks([FromQuery] string q, [FromQuery] int take = 10)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(new List<SearchItemDto>());
        var http = _httpFactory.CreateClient();

        var url = $"https://www.googleapis.com/books/v1/volumes?q={Uri.EscapeDataString(q)}&maxResults={Math.Clamp(take, 1, 20)}";
        using var resp = await http.GetAsync(url);
        if (!resp.IsSuccessStatusCode) return Ok(new List<SearchItemDto>());

        var json = await resp.Content.ReadFromJsonAsync<GoogleBooksResponse>();
        var items = (json?.items ?? new()).Select(it =>
        {
            var vi = it.volumeInfo ?? new VolumeInfo();
            int? year = null;
            if (!string.IsNullOrWhiteSpace(vi.publishedDate))
            {
                // publishedDate bazen "YYYY-MM-DD" geliyor; ilk 4 haneyi al
                if (vi.publishedDate!.Length >= 4 && int.TryParse(vi.publishedDate[..4], out var y)) year = y;
            }
            string? cover = vi.imageLinks?.thumbnail ?? vi.imageLinks?.smallThumbnail;
            return new SearchItemDto(
                ExternalId: it.id ?? "",
                Title: vi.title ?? "(No title)",
                Year: year,
                CoverUrl: cover,
                Type: "book"
            );
        }).ToList();

        return Ok(items);
    }

    // TMDb (anahtar varsa gerçek, yoksa mock)
    // GET /api/search/movies?q=inception
    [HttpGet("movies")]
    public async Task<ActionResult<List<SearchItemDto>>> SearchMovies([FromQuery] string q, [FromQuery] int take = 10)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(new List<SearchItemDto>());

        var tmdbKey = _cfg["Tmdb:ApiKey"];
        if (string.IsNullOrWhiteSpace(tmdbKey))
        {
            // Anahtar yoksa basit mock dön (MVP’yi bloklamasın)
            return Ok(new List<SearchItemDto>
            {
                new("tt1375666", "Inception", 2010, "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg", "movie"),
                new("tt0816692", "Interstellar", 2014, "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", "movie")
            });
        }

        var http = _httpFactory.CreateClient();
        var url = $"https://api.themoviedb.org/3/search/movie?query={Uri.EscapeDataString(q)}&include_adult=false&language=en-US&page=1";
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        req.Headers.Add("Authorization", $"Bearer {tmdbKey}");
        req.Headers.Add("Accept", "application/json");

        using var resp = await http.SendAsync(req);
        if (!resp.IsSuccessStatusCode) return Ok(new List<SearchItemDto>());

        var json = await resp.Content.ReadFromJsonAsync<TmdbSearchResponse>();
        var items = (json?.results ?? new()).Take(Math.Clamp(take, 1, 20)).Select(m =>
        {
            int? year = null;
            if (!string.IsNullOrWhiteSpace(m.release_date) && m.release_date!.Length >= 4
                && int.TryParse(m.release_date[..4], out var y)) year = y;

            string? poster = string.IsNullOrWhiteSpace(m.poster_path) ? null
                : $"https://image.tmdb.org/t/p/w500{m.poster_path}";

            return new SearchItemDto(
                ExternalId: (m.id ?? 0).ToString(),
                Title: m.title ?? "(No title)",
                Year: year,
                CoverUrl: poster,
                Type: "movie"
            );
        }).ToList();

        return Ok(items);
    }

    // --- Google Books response modelleri (kısaltılmış) ---
    private class GoogleBooksResponse { public List<Item> items { get; set; } = new(); }
    private class Item { public string? id { get; set; } public VolumeInfo? volumeInfo { get; set; } }
    private class VolumeInfo
    {
        public string? title { get; set; }
        public string? publishedDate { get; set; }
        public ImageLinks? imageLinks { get; set; }
    }
    private class ImageLinks { public string? smallThumbnail { get; set; } public string? thumbnail { get; set; } }

    // --- TMDb response modelleri (kısaltılmış) ---
    private class TmdbSearchResponse { public List<TmdbMovie> results { get; set; } = new(); }
    private class TmdbMovie
    {
        public int? id { get; set; }
        public string? title { get; set; }
        public string? release_date { get; set; }
        public string? poster_path { get; set; }
    }
}
