# Use the official Node.js 20 image as a base
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (as per .env)
EXPOSE 3001

# Command to run the application
# We use npm start which runs seeds and then the app using tsx
CMD ["npm", "start"]
