using Microsoft.AspNetCore.Mvc;
using SocialLibrary.Api.DTOs;
using System.Net.Http.Json;

namespace SocialLibrary.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContentController : ControllerBase
    {
        private readonly IHttpClientFactory _http;
        private readonly IConfiguration _cfg;

        public ContentController(IHttpClientFactory http, IConfiguration cfg)
        {
            _http = http;
            _cfg = cfg;
        }

        // GET /api/content/{type}/{externalId}
        [HttpGet("{type}/{externalId}")]
        public async Task<ActionResult<object>> GetContent(string type, string externalId)
        {
            if (string.IsNullOrWhiteSpace(type) || string.IsNullOrWhiteSpace(externalId))
                return BadRequest();

            if (type.Equals("book", StringComparison.OrdinalIgnoreCase))
                return Ok(await GetBookDetail(externalId));

            if (type.Equals("movie", StringComparison.OrdinalIgnoreCase))
                return Ok(await GetMovieDetail(externalId));

            return NotFound();
        }

        // --- Google Books ---
        private async Task<object?> GetBookDetail(string id)
        {
            var http = _http.CreateClient();
            var url = $"https://www.googleapis.com/books/v1/volumes/{id}";
            using var resp = await http.GetAsync(url);
            if (!resp.IsSuccessStatusCode) return new { error = "book_not_found" };

            var book = await resp.Content.ReadFromJsonAsync<GoogleBookDetail>();
            var v = book?.volumeInfo;
            return new
            {
                type = "book",
                id,
                title = v?.title,
                authors = v?.authors,
                year = v?.publishedDate,
                pageCount = v?.pageCount,
                description = v?.description,
                coverUrl = v?.imageLinks?.thumbnail ?? v?.imageLinks?.smallThumbnail
            };
        }

        private class GoogleBookDetail
        {
            public VolumeInfo? volumeInfo { get; set; }
        }

        private class VolumeInfo
        {
            public string? title { get; set; }
            public string? publishedDate { get; set; }
            public List<string>? authors { get; set; }
            public int? pageCount { get; set; }
            public string? description { get; set; }
            public ImageLinks? imageLinks { get; set; }
        }

        private class ImageLinks
        {
            public string? smallThumbnail { get; set; }
            public string? thumbnail { get; set; }
        }

        // --- TMDb ---
        private async Task<object?> GetMovieDetail(string id)
        {
            var tmdbKey = _cfg["Tmdb:ApiKey"];
            var http = _http.CreateClient();

            if (string.IsNullOrWhiteSpace(tmdbKey))
            {
                // Mock
                return new
                {
                    type = "movie",
                    id,
                    title = "Inception",
                    year = 2010,
                    overview = "A thief who steals corporate secrets through dream-sharing tech is given an inverse mission.",
                    posterUrl = "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
                    runtime = 148,
                    genres = new[] { "Sci-Fi", "Thriller" }
                };
            }

            var url = $"https://api.themoviedb.org/3/movie/{id}?language=en-US";
            using var req = new HttpRequestMessage(HttpMethod.Get, url);
            req.Headers.Add("Authorization", $"Bearer {tmdbKey}");
            req.Headers.Add("Accept", "application/json");

            using var resp = await http.SendAsync(req);
            if (!resp.IsSuccessStatusCode) return new { error = "movie_not_found" };

            var movie = await resp.Content.ReadFromJsonAsync<TmdbMovieDetail>();
            var genres = movie?.genres?.Select(g => g.name).ToList();
            return new
            {
                type = "movie",
                id = movie?.id,
                title = movie?.title,
                year = movie?.release_date?.Length >= 4 ? movie.release_date[..4] : null,
                overview = movie?.overview,
                posterUrl = string.IsNullOrWhiteSpace(movie?.poster_path)
                    ? null
                    : $"https://image.tmdb.org/t/p/w500{movie.poster_path}",
                runtime = movie?.runtime,
                genres
            };
        }

        private class TmdbMovieDetail
        {
            public int? id { get; set; }
            public string? title { get; set; }
            public string? overview { get; set; }
            public string? release_date { get; set; }
            public string? poster_path { get; set; }
            public int? runtime { get; set; }
            public List<TmdbGenre>? genres { get; set; }
        }

        private class TmdbGenre
        {
            public int id { get; set; }
            public string? name { get; set; }
        }
    }
}
