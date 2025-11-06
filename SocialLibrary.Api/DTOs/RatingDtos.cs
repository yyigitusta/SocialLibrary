namespace SocialLibrary.Api.DTOs;

public record RateRequest(string Type, string ExternalId, int Score);
public record RatingSummary(double Average, int Count);
