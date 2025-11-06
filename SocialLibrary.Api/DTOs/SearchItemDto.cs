namespace SocialLibrary.Api.DTOs
{
    public record SearchItemDto
    (
        string ExternalId,
        string Title,
        int? Year,
        string? CoverUrl,
        string Type // "book"|"movie"
    );
}
