# Protect /admin on the existing server

Do not apply until approved. This does not stop the public web or API.

On the existing Nginx, add before the general API location:

    location /admin/ {
        # Allow only the gateway WireGuard IP
        allow 10.10.0.2;
        deny all;
        proxy_pass http://api:8000/admin/;
    }

Public routes (/events, /auth/login for customers, etc.) stay unchanged.
