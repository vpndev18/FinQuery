# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
# Note: For strict dev setup with volumes, this COPY is technically overriden by the bind mount,
# but it's good practice to have it for the image build itself.
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
