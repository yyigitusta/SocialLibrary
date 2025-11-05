using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SocialLibrary.Api.Domain;
using SocialLibrary.Api.DTOs;

namespace SocialLibrary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _cfg;

    public AuthController(UserManager<ApplicationUser> userManager, IConfiguration cfg)
    {
        _userManager = userManager;
        _cfg = cfg;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        var exists = await _userManager.FindByEmailAsync(req.Email);
        if (exists != null)
            return BadRequest(new { message = "Bu e-posta zaten kullanımda." });

        var user = new ApplicationUser
        {
            UserName = req.Email,
            Email = req.Email,
            DisplayName = req.DisplayName
        };

        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        var resp = await BuildToken(user);
        return Ok(resp);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user == null) return Unauthorized(new { message = "E-posta veya şifre hatalı." });

        var ok = await _userManager.CheckPasswordAsync(user, req.Password);
        if (!ok) return Unauthorized(new { message = "E-posta veya şifre hatalı." });

        var resp = await BuildToken(user);
        return Ok(resp);
    }

    private Task<AuthResponse> BuildToken(ApplicationUser user)
    {
        var jwt = _cfg.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new("displayName", user.DisplayName ?? "")
        };

        var expiresDays = int.TryParse(jwt["ExpiresDays"], out var d) ? d : 7;

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiresDays),
            signingCredentials: creds
        );

        string tokenStr = new JwtSecurityTokenHandler().WriteToken(token);
        return Task.FromResult(new AuthResponse(tokenStr, user.Id, user.DisplayName, user.Email ?? ""));
    }
}
