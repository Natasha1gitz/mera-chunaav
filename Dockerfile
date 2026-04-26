# Use the official Nginx lightweight alpine image
FROM nginx:alpine

# Copy the static website files to the default Nginx public directory
COPY . /usr/share/nginx/html

# Expose port 80 (required for Cloud Run)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
