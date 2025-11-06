using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.Api.DTOs;
using SocialLibrary.Api.Infrastructure;

namespace SocialLibrary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReviewsController(AppDbContext db) => _db = db;

    // POST /api/reviews
    // body: { "type":"movie","externalId":"27205","text":"Çok iyi film!" }
    [Authorize]
    [HttpPost]
    public async Task<ActionResult> Add([FromBody] AddReviewRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Text) || req.Text.Length > 2000)
            return BadRequest(new { message = "Yorum 1–2000 karakter olmalı." });

        var contentKey = $"{req.Type.ToLower()}:{req.ExternalId}";
        var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value
                     ?? User.Claims.FirstOrDefault(c => c.Type.EndsWith("/nameidentifier"))?.Value
                     ?? User.Identity?.Name;

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        _db.Reviews.Add(new Domain.Review
        {
            UserId = userId!,
            ContentKey = contentKey,
            Text = req.Text.Trim()
        });

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    // GET /api/reviews/{type}/{externalId}?page=1&pageSize=10
    [AllowAnonymous]
    [HttpGet("{type}/{externalId}")]
    public async Task<ActionResult<IEnumerable<ReviewItem>>> List(
        string type, string externalId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var contentKey = $"{type.ToLower()}:{externalId}";

        var q = _db.Reviews
            .Where(r => r.ContentKey == contentKey)
            .OrderByDescending(r => r.CreatedAt);

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(r => new ReviewItem(r.Id, r.UserId, r.Text, r.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }
}
