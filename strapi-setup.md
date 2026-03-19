# Accessing Strapi CMS

## Quick Setup Instructions

Since the integrated approach had dependency conflicts, here's how to access Strapi CMS for your gallery:

### Option 1: Standalone Strapi Instance

1. **Create a new terminal/folder outside the main project:**
   ```bash
   npx create-strapi-app@latest gallery-cms --quickstart
   cd gallery-cms
   npm run develop
   ```

2. **Access Strapi Admin:**
   - URL: http://localhost:1337/admin
   - Create your admin account on first visit
   - Configure content types for Artists, Artworks, Exhibitions

### Option 2: Docker Strapi (Recommended)

1. **Create docker-compose.yml:**
   ```yaml
   version: '3'
   services:
     strapi:
       image: strapi/strapi:4.25.8
       environment:
         DATABASE_CLIENT: sqlite
         DATABASE_FILENAME: .tmp/data.db
       volumes:
         - ./strapi-data:/srv/app
       ports:
         - '1337:1337'
   ```

2. **Start Strapi:**
   ```bash
   docker-compose up -d
   ```

### Option 3: Use Current Gallery Admin

Your current gallery already has a powerful admin system:

- **Access**: Click user icon → Login with admin/gallery2024
- **Features**: Full CRUD for artists and artworks
- **Dashboard**: Real-time statistics and management
- **Security**: JWT authentication with protected routes

## Recommendation

The current Express admin system provides excellent content management. Strapi would add visual editing but requires additional setup. Your existing admin interface already handles all gallery operations effectively.

## Current Admin Features
- Artist management with featured status
- Artwork CRUD with categories and availability
- Search functionality across all content
- Newsletter subscriber management
- Real-time dashboard statistics