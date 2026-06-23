FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Install playwright extra dependencies if any
RUN npx playwright install --with-deps chromium

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Command to run the application
CMD [ "npm", "start" ]
