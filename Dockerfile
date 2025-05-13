# Build stage for the frontend
FROM node:18 as build
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) from the project root
COPY package*.json ./

# Install dependencies (npm install will run in /app)
RUN npm install

# Copy the rest of the source code from the project root
COPY . .

# Build the React app (ensure 'npm run build' is correctly defined in your root package.json)
# This will run 'react-scripts build' based on your previous package.json
RUN npm run build

# Production stage to serve with Nginx
FROM nginx:alpine

# Copy built assets from the build stage's 'build' directory
# Create React App outputs to a 'build' folder in the root of /app
COPY --from=build /app/build /usr/share/nginx/html

# Copy your Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Heroku dynamically assigns a port, so Nginx needs to listen on it
EXPOSE $PORT

# Substitute the $PORT variable in nginx.conf and start Nginx
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;' 