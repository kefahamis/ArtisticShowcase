# Strapi CMS Integration Demo

## Architecture Overview

The gallery now operates with a **dual-backend architecture**:

### Express Backend (Port 5000) - Current Production
- Serves the main gallery frontend
- Handles all current API endpoints
- JWT authentication for admin operations
- PostgreSQL database with existing data
- **Status**: ✅ Running and serving frontend

### Strapi CMS (Port 1337) - Content Management
- Headless CMS for enhanced content management
- Visual admin interface for non-technical users
- SQLite database (separate from Express)
- RESTful API with same endpoint structure
- **Status**: ⚙️ Ready to start

## Key Features Added

### 1. API Adapter Pattern
```typescript
// Switch backends via environment variable
const USE_STRAPI = import.meta.env.VITE_USE_STRAPI === 'true';

// Unified API interface works with both backends
await api.getArtworks(); // Routes to Express or Strapi
```

### 2. Content Type Mapping
- **Artists**: Bio, specialty, featured status, artworks relationship
- **Artworks**: Title, description, pricing, availability, artist relationship
- **Exhibitions**: Duration, description, featured status

### 3. Custom Controllers
- Featured content filtering
- Search functionality across content types
- Current exhibition logic
- Populated relationships (artist with artworks)

## Starting Strapi CMS

To demonstrate the Strapi integration:

```bash
cd backend
npm install --legacy-peer-deps
npx strapi develop
```

Then access:
- **Strapi Admin**: http://localhost:1337/admin
- **Strapi API**: http://localhost:1337/api/
- **Express API**: http://localhost:5000/api/ (current)

## Benefits

1. **Content Management**: Visual interface for managing gallery content
2. **API Flexibility**: Switch between backends without frontend changes
3. **Scalability**: Strapi provides advanced CMS features
4. **Backwards Compatibility**: Express backend remains unchanged
5. **Developer Experience**: Rich admin interface for content editing

## Migration Path

1. **Phase 1**: ✅ Dual backend setup (completed)
2. **Phase 2**: Populate Strapi with existing content
3. **Phase 3**: Switch frontend to use Strapi APIs
4. **Phase 4**: Migrate admin operations to Strapi