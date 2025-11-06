using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SocialLibrary.Api.Domain;
namespace SocialLibrary.Api.Infrastructure
{
    public class AppDbContext:IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Rating> Ratings => Set<Rating>();
        public DbSet<Review> Reviews => Set<Review>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<Rating>(e =>
            {
                e.Property(x => x.ContentKey).HasMaxLength(200).IsRequired();
                e.Property(x => x.Score).IsRequired();
                e.HasIndex(x => new { x.UserId, x.ContentKey }).IsUnique();
                e.HasIndex(x => x.ContentKey);

            });
            builder.Entity<Review>(e =>
            {
                e.Property(x => x.ContentKey).HasMaxLength(200).IsRequired();
                e.Property(x => x.Text).HasMaxLength(2000).IsRequired();
                e.HasIndex(x => x.ContentKey);
                e.HasIndex(x => new { x.UserId, x.ContentKey });
            });
        }
    }
}
