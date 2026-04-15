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
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<ExpenseSplit> ExpenseSplits { get; set; }

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

                // Group & PaidBy relationships
                entity.HasOne(e => e.Group)
                      .WithMany(g => g.Expenses)
                      .HasForeignKey(e => e.GroupId)
                      .OnDelete(DeleteBehavior.ClientSetNull); // Prevent multiple cascade paths

                entity.HasOne(e => e.PaidByUser)
                      .WithMany()
                      .HasForeignKey(e => e.PaidByUserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Group Member configuration
            modelBuilder.Entity<GroupMember>(entity =>
            {
                entity.HasKey(gm => new { gm.GroupId, gm.UserId }); // Composite Key

                entity.Property(gm => gm.Balance).HasPrecision(18, 2);

                entity.HasOne(gm => gm.Group)
                      .WithMany(g => g.Members)
                      .HasForeignKey(gm => gm.GroupId)
                      .OnDelete(DeleteBehavior.Cascade); // If group deleted, members linkage deleted

                entity.HasOne(gm => gm.User)
                      .WithMany()
                      .HasForeignKey(gm => gm.UserId)
                      .OnDelete(DeleteBehavior.NoAction); // Prevent cycles
            });

            // Expense Split configuration
            modelBuilder.Entity<ExpenseSplit>(entity =>
            {
                entity.Property(es => es.Amount).HasPrecision(18, 2);

                entity.HasOne(es => es.Expense)
                      .WithMany() // Expense might have navigation to splits, but let's keep it simple for now or add if needed
                      .HasForeignKey(es => es.ExpenseId)
                      .OnDelete(DeleteBehavior.Cascade); // If expense deleted, splits deleted

                entity.HasOne(es => es.User)
                      .WithMany()
                      .HasForeignKey(es => es.UserId)
                      .OnDelete(DeleteBehavior.NoAction); // Prevent cycles
            });
        }
    }
}