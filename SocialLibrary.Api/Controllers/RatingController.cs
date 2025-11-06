using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.Api.DTOs;
using SocialLibrary.Api.Infrastructure;

namespace SocialLibrary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RatingsController(AppDbContext db) => _db = db;

    // POST /api/ratings
    // body: { "type":"movie","externalId":"27205","score":9 }
    [Authorize]
    [HttpPost]
    public async Task<ActionResult> Rate([FromBody] RateRequest req)
    {
        if (req.Score < 1 || req.Score > 10)
            return BadRequest(new { message = "Puan 1–10 arası olmalı." });

        var contentKey = $"{req.Type.ToLower()}:{req.ExternalId}";
        var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value
                     ?? User.Claims.FirstOrDefault(c => c.Type.EndsWith("/nameidentifier"))?.Value
                     ?? User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var existing = await _db.Ratings
            .FirstOrDefaultAsync(r => r.UserId == userId && r.ContentKey == contentKey);

        if (existing is null)
        {
            _db.Ratings.Add(new Domain.Rating
            {
                UserId = userId!,
                ContentKey = contentKey,
                Score = req.Score
            });
        }
        else
        {
            existing.Score = req.Score;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    // GET /api/ratings/{type}/{externalId}
    // özet: ortalama + adet
    [HttpGet("{type}/{externalId}")]
    public async Task<ActionResult<RatingSummary>> GetSummary(string type, string externalId)
    {
        var contentKey = $"{type.ToLower()}:{externalId}";
        var q = _db.Ratings.Where(r => r.ContentKey == contentKey);
        var count = await q.CountAsync();
        if (count == 0) return Ok(new RatingSummary(0, 0));
        var avg = await q.AverageAsync(r => r.Score);
        return Ok(new RatingSummary(Math.Round(avg, 2), count));
    }
}
