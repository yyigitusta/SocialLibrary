namespace SocialLibrary.Api.Domain;

public class Rating
{
    public int Id { get; set; }
    public string UserId { get; set; } = default!;

    // içerik anahtarı: "movie:27205" veya "book:zyTCAlFPjgYC"
    public string ContentKey { get; set; } = default!;

    // 1–10 arası
    public int Score { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
