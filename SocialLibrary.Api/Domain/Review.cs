namespace SocialLibrary.Api.Domain;

public class Review
{
    public int Id { get; set; }
    public string UserId { get; set; } = default!;
    public string ContentKey { get; set; } = default!; // "movie:27205" / "book:xyz"
    public string Text { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
