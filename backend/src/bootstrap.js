module.exports = async () => {
  // Seed initial data if database is empty
  const artistCount = await strapi.entityService.count('api::artist.artist');
  
  if (artistCount === 0) {
    console.log('Seeding initial data...');
    
    // Create sample artists
    const elena = await strapi.entityService.create('api::artist.artist', {
      data: {
        name: 'Elena Rodriguez',
        bio: 'Elena Rodriguez is a contemporary painter known for her vibrant abstract expressionist works that explore themes of identity and cultural heritage.',
        specialty: 'Abstract Expressionism',
        imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
        featured: true,
        publishedAt: new Date(),
      },
    });
    
    const marcus = await strapi.entityService.create('api::artist.artist', {
      data: {
        name: 'Marcus Chen',
        bio: 'Marcus Chen creates stunning landscape photography and mixed media installations that capture the intersection of urban environments and natural spaces.',
        specialty: 'Photography & Mixed Media',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        featured: true,
        publishedAt: new Date(),
      },
    });
    
    // Create sample artworks
    await strapi.entityService.create('api::artwork.artwork', {
      data: {
        title: 'Rhythms of Heritage',
        description: 'A vibrant abstract expressionist piece that explores the artist\'s Spanish roots through bold colors and dynamic brushstrokes.',
        medium: 'Oil on Canvas',
        dimensions: '48" x 36"',
        price: 12500.00,
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
        category: 'painting',
        availability: 'available',
        featured: true,
        artist: elena.id,
        publishedAt: new Date(),
      },
    });
    
    await strapi.entityService.create('api::artwork.artwork', {
      data: {
        title: 'Urban Confluence',
        description: 'A stunning landscape photograph showing the meeting point of nature and city architecture.',
        medium: 'Archival Pigment Print',
        dimensions: '30" x 20"',
        price: 3200.00,
        imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop',
        category: 'photography',
        availability: 'available',
        featured: true,
        artist: marcus.id,
        publishedAt: new Date(),
      },
    });
    
    // Create current exhibition
    await strapi.entityService.create('api::exhibition.exhibition', {
      data: {
        title: 'Contemporary Visions',
        description: 'A curated collection showcasing the intersection of traditional techniques and modern perspectives.',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2025-12-31'),
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop',
        featured: true,
        publishedAt: new Date(),
      },
    });
    
    console.log('Initial data seeded successfully');
  }
};