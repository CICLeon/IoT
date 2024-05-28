using Microsoft.EntityFrameworkCore;

namespace IoT
{
    public class Contex : DbContext
    {
        public Contex(DbContextOptions<Contex> options) : base(options) { }
        public DbSet<Data> Data { get; set; } = null!;
        public DbSet<Resource> Resources { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                var table = entityType.GetTableName();
                if (table!.StartsWith("AspNet"))
                {
                entityType.SetTableName(table.Substring(6));
                }
            };
        }
    }
}