# Use an official Node.js runtime as a parent image
FROM node:16-slim

# Set the working directory in the container
WORKDIR /frontend

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Expose port 3000 for the frontend app
EXPOSE 3000

# Fix permissions for frontend files
RUN chmod -R 777 /frontend

# Run the app
CMD ["npm", "start"]

