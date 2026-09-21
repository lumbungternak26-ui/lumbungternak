# Container Nginx Ringan untuk Aplikasi Lumbung Ternak
FROM nginx:alpine

# Copy seluruh file aplikasi ke direktori publik Nginx
COPY . /usr/share/nginx/html

# Ekspos port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
