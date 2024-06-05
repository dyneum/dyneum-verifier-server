# Use an official Node.js runtime as a parent image
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm -v
RUN node -v

# Install the app dependencies
RUN npm install --omit=dev

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the app
CMD ["node", "index.js"]
