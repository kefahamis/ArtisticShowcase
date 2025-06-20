
import { db } from './db';
import { artists, artworks, exhibitions, blogPosts, users } from '@shared/schema';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [adminUser] = await db.insert(users).values({
      username: 'admin',
      email: 'admin@gallery.com',
      password: hashedPassword,
      isAdmin: true,
    }).returning();

    console.log('✅ Created admin user');

    // Create artists
    const [elena] = await db.insert(artists).values({
      name: 'Elena Rodriguez',
      bio: 'Elena Rodriguez is a contemporary painter known for her vibrant abstract expressionist works that explore themes of identity and cultural heritage. Her work has been featured in galleries across Europe and the Americas.',
      specialty: 'Abstract Expressionism',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      featured: true,
    }).returning();

    const [marcus] = await db.insert(artists).values({
      name: 'Marcus Chen',
      bio: 'Marcus Chen creates stunning landscape photography and mixed media installations that capture the intersection of urban environments and natural spaces. His work explores the relationship between human development and nature.',
      specialty: 'Photography & Mixed Media',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      featured: true,
    }).returning();

    const [sophia] = await db.insert(artists).values({
      name: 'Sophia Williams',
      bio: 'Sophia Williams is a sculptor who works primarily in bronze and marble. Her pieces often explore themes of movement and emotion, creating dynamic works that seem to capture moments in time.',
      specialty: 'Sculpture',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      featured: false,
    }).returning();

    console.log('✅ Created artists');

    // Create artworks
    await db.insert(artworks).values([
      {
        title: 'Rhythms of Heritage',
        description: 'A vibrant abstract expressionist piece that explores the artist\'s Spanish roots through bold colors and dynamic brushstrokes. The piece captures the energy and passion of traditional flamenco dance.',
        medium: 'Oil on Canvas',
        dimensions: '48" x 36"',
        price: '12500.00',
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
        category: 'painting',
        availability: 'available',
        featured: true,
        artistId: elena.id,
      },
      {
        title: 'Urban Confluence',
        description: 'A stunning landscape photograph showing the meeting point of nature and city architecture. This piece captures the delicate balance between urban development and natural preservation.',
        medium: 'Archival Pigment Print',
        dimensions: '30" x 20"',
        price: '3200.00',
        imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop',
        category: 'photography',
        availability: 'available',
        featured: true,
        artistId: marcus.id,
      },
      {
        title: 'Memories in Motion',
        description: 'An elegant bronze sculpture that captures the fluidity of human movement. The piece represents the artist\'s exploration of how memories shape our physical presence in the world.',
        medium: 'Bronze',
        dimensions: '24" x 18" x 12"',
        price: '8500.00',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        category: 'sculpture',
        availability: 'available',
        featured: true,
        artistId: sophia.id,
      },
      {
        title: 'Digital Dreams',
        description: 'A contemporary mixed media installation combining photography, digital projection, and sound. This piece explores our relationship with technology in the modern world.',
        medium: 'Mixed Media Installation',
        dimensions: '96" x 72" x 48"',
        price: '15000.00',
        imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a04?w=800&h=600&fit=crop',
        category: 'mixed-media',
        availability: 'available',
        featured: false,
        artistId: marcus.id,
      },
      {
        title: 'Sunset Reflections',
        description: 'A serene abstract painting inspired by Mediterranean sunsets. Warm oranges and deep purples blend seamlessly to create a sense of peace and tranquility.',
        medium: 'Acrylic on Canvas',
        dimensions: '36" x 24"',
        price: '4200.00',
        imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
        category: 'painting',
        availability: 'sold',
        featured: false,
        artistId: elena.id,
      },
      {
        title: 'Eternal Grace',
        description: 'A marble sculpture depicting the timeless beauty of classical form with a contemporary twist. The piece explores themes of permanence and change.',
        medium: 'Carrara Marble',
        dimensions: '36" x 24" x 18"',
        price: '22000.00',
        imageUrl: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop',
        category: 'sculpture',
        availability: 'reserved',
        featured: false,
        artistId: sophia.id,
      },
    ]);

    console.log('✅ Created artworks');

    // Create current exhibition
    await db.insert(exhibitions).values({
      title: 'Contemporary Visions',
      subtitle: 'A Journey Through Modern Art',
      description: 'A curated collection showcasing the intersection of traditional techniques and modern perspectives. This exhibition features works from our most celebrated contemporary artists, exploring themes of identity, technology, and human connection in the 21st century.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-12-31'),
      openingReception: 'January 15th, 2024 at 6:00 PM',
      current: true,
    });

    console.log('✅ Created current exhibition');

    // Create blog posts
    await db.insert(blogPosts).values([
      {
        title: 'The Evolution of Contemporary Art',
        content: 'Contemporary art continues to evolve and challenge our perceptions of creativity, beauty, and meaning. In this exploration, we delve into how modern artists are pushing boundaries and creating new forms of expression that speak to our current cultural moment.\n\nFrom digital installations to traditional paintings with modern themes, today\'s artists are finding innovative ways to connect with audiences and address pressing social issues. The gallery space itself has become a canvas for experimentation and dialogue.\n\nOur recent exhibitions have showcased this evolution beautifully, featuring artists who blend traditional techniques with contemporary themes. Each piece tells a story that resonates with modern viewers while honoring the rich history of artistic expression.',
        excerpt: 'Exploring how modern artists are pushing boundaries and creating new forms of expression in contemporary gallery spaces.',
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
        published: true,
      },
      {
        title: 'Behind the Scenes: Artist Studio Visits',
        content: 'There\'s something magical about stepping into an artist\'s studio. It\'s where creativity comes alive, where ideas transform into tangible works of art, and where the true personality of the artist shines through.\n\nRecently, we had the privilege of visiting the studios of several featured artists. Elena Rodriguez\'s space is filled with vibrant canvases and paint-splattered easels, each corner telling a story of passionate creation. The walls are covered with color studies and experimental pieces that never make it to the gallery but are essential to her artistic process.\n\nMarcus Chen\'s studio is a fascinating blend of traditional darkroom equipment and cutting-edge digital tools. His mixed media approach requires a diverse workspace where photography meets sculpture, and technology enhances rather than replaces traditional artistic methods.',
        excerpt: 'An intimate look into the creative spaces where our featured artists bring their visions to life.',
        imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a04?w=800&h=600&fit=crop',
        published: true,
      },
      {
        title: 'The Art of Collecting: A Beginner\'s Guide',
        content: 'Starting an art collection can feel overwhelming, but it\'s one of the most rewarding journeys you can embark upon. Whether you\'re drawn to paintings, sculptures, or photography, the key is to start with what speaks to you personally.\n\nMany new collectors make the mistake of focusing solely on investment potential or following trends. While these factors can be important, the most successful collectors are those who develop their own aesthetic sensibility and collect pieces that genuinely move them.\n\nOur gallery offers various programs for new collectors, including private viewings, artist talks, and consultation services. We believe that collecting art should be an educational and enjoyable experience that enriches your life and surroundings.',
        excerpt: 'Essential tips for new art collectors on building a meaningful collection that reflects personal taste and vision.',
        imageUrl: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop',
        published: true,
      },
    ]);

    console.log('✅ Created blog posts');
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
const isMain = import.meta.url === `file://${process.argv[1]}`;

if (isMain) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

