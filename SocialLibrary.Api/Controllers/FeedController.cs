using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.Api.Infrastructure;

namespace SocialLibrary.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedController : ControllerBase
    {
        private readonly AppDbContext _db;
        public FeedController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetFeed([FromQuery] int take = 20)
        {
            take = Math.Clamp(take, 1, 50);

            var ratingFeed = await _db.Ratings
                .OrderByDescending(r => r.UpdatedAt ?? r.CreatedAt)
                .Take(take)
                .Join(_db.Users, r => r.UserId, u => u.Id, (r, u) => new FeedItem
                {
                    Type = "rating",
                    UserId = r.UserId,
                    UserDisplayName = u.DisplayName ?? u.UserName ?? u.Email ?? r.UserId,
                    ContentKey = r.ContentKey,
                    Message = $"puan verdi: {r.Score}/10",
                    CreatedAt = r.UpdatedAt ?? r.CreatedAt
                })
                .ToListAsync();

            var reviewFeed = await _db.Reviews
                .OrderByDescending(r => r.UpdatedAt ?? r.CreatedAt)
                .Take(take)
                .Join(_db.Users, r => r.UserId, u => u.Id, (r, u) => new FeedItem
                {
                    Type = "review",
                    UserId = r.UserId,
                    UserDisplayName = u.DisplayName ?? u.UserName ?? u.Email ?? r.UserId,
                    ContentKey = r.ContentKey,
                    Message = $"yorum yaptı: \"{r.Text}\"",
                    CreatedAt = r.UpdatedAt ?? r.CreatedAt
                })
                .ToListAsync();

            var all = ratingFeed
                .Concat(reviewFeed)
                .OrderByDescending(x => x.CreatedAt)
                .Take(take)
                .ToList();

            return Ok(all);
        }

        private class FeedItem
        {
            public string Type { get; set; } = "";
            public string UserId { get; set; } = "";
            public string UserDisplayName { get; set; } = "";
            public string ContentKey { get; set; } = "";
            public string Message { get; set; } = "";
            public DateTime CreatedAt { get; set; }
        }
    }
}
