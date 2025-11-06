namespace SocialLibrary.Api.DTOs;

public record AddReviewRequest(string Type, string ExternalId, string Text);

public record ReviewItem(
    int Id,
    string UserId,
    string Text,
    DateTime CreatedAt
);
