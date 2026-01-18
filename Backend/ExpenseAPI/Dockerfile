# Use the specific .NET 8 SDK image
FROM mcr.microsoft.com/dotnet/sdk:8.0

# Set the working directory inside the container
WORKDIR /app

# Expose the ports the app listens on
EXPOSE 8080
EXPOSE 8081

# Copy the project files
COPY . .

# Restore dependencies
RUN dotnet restore

# Command to run the application with hot reload
CMD ["dotnet", "watch", "run", "--no-launch-profile", "--urls", "http://+:8080"]
