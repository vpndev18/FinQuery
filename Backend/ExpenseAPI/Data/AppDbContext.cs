using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ExpenseAPI.Models;

namespace ExpenseAPI.Data
{
    public class AppDbContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration configuration)
            : base(options)
        {
            _configuration = configuration;
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Expense> Expenses { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                optionsBuilder.UseSqlServer(connectionString);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserId);
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // Category entity
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(c => c.CategoryId);
                entity.HasOne(c => c.User)
                      .WithMany(u => u.Categories)
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Cascade); // Keep cascade here
            });

            // Expense entity
            modelBuilder.Entity<Expense>(entity =>
            {
                entity.HasKey(e => e.ExpenseId);

                // FIX: Changed Cascade to NoAction to prevent circular delete paths
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Expenses)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Expenses)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Cascade); // Expense will still be deleted if Category is deleted

                entity.Property(e => e.Amount)
                      .HasPrecision(10, 2);
            });
        }
    }
}