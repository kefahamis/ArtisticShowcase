# Gallery Project Documentation

## Overview
Professional art gallery e-commerce platform with sophisticated design inspired by martinlawrence.com. Features secure admin authentication, comprehensive search functionality, and exhibition management.

## Current Architecture
- **Frontend**: React + TypeScript with Wouter routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Express.js with PostgreSQL database
- **Authentication**: JWT-based admin system (admin/gallery2024)
- **Database**: Drizzle ORM with PostgreSQL
- **State Management**: TanStack Query for API state

## Recent Changes
- **June 20, 2025**: Fixed dropdown visibility issues in admin area with proper z-index stacking (z-[9999])
- **June 20, 2025**: Fixed orders API authentication by correcting token handling in admin pages
- **June 20, 2025**: Enhanced dropdown menu styling with white backgrounds and proper hover states
- **June 20, 2025**: Added test order data to demonstrate admin functionality
- **June 20, 2025**: Fixed database connectivity issues with improved error handling and retry logic
- **June 20, 2025**: Fixed admin area bugs and added comprehensive pagination to all CRUD operations
- **June 20, 2025**: Implemented image upload functionality for artists, artworks, and blog posts
- **June 18, 2025**: Implemented social media share tracking for blog posts with analytics dashboard
- **June 18, 2025**: Enhanced modal visibility with white backgrounds for better UX
- **June 18, 2025**: Created dynamic blog system with published posts and individual post pages

## Project Status
✅ **COMPLETED**: Professional art gallery with comprehensive features
- Express backend serves frontend with full functionality (port 5000)
- Modern admin dashboard with custom header/footer and analytics
- Complete CRUD operations for artists, artworks, orders, and blog posts with pagination
- Image upload functionality for all content creation (artists, artworks, blog posts)
- Secure admin authentication with environment-based credentials
- Martin Lawrence Galleries-inspired artists grid layout with view toggles
- Dynamic blog system with social sharing, comments, and share tracking
- Professional About and Contact pages
- Functional checkout process creating real orders
- PayPal and M-Pesa payment integration with order tracking
- Blog share analytics with platform-specific tracking and visualizations
- Enhanced UI with skeleton loading states and white modal backgrounds
- Artwork preview functionality and improved navigation

## User Preferences
- Professional, sophisticated design aesthetic
- Secure admin operations with proper authentication
- Real-time search capabilities
- Mobile-responsive interface
- Production-ready deployment standards

## Technical Decisions
- **Production Backend**: Express with PostgreSQL (proven, stable)
- **Admin System**: Custom JWT-based authentication with protected CRUD operations
- **API Architecture**: RESTful endpoints with comprehensive search functionality
- **Content Management**: Built-in admin interface with real-time dashboard
- **Future Expansion**: Strapi configuration framework prepared for visual CMS if needed
- **Deployment Ready**: Complete backend tested and production-ready