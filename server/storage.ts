import { 
  users, artists, artworks, exhibitions, orders, orderItems, 
  newsletterSubscribers, blogPosts, blogShares,
  type User, type InsertUser,
  type Artist, type InsertArtist,
  type Artwork, type InsertArtwork, type ArtworkWithArtist,
  type Exhibition, type InsertExhibition,
  type Order, type InsertOrder, type OrderWithItems,
  type OrderItem, type InsertOrderItem,
  type NewsletterSubscriber, type InsertNewsletterSubscriber,
  type BlogPost, type InsertBlogPost, type BlogPostWithShares,
  type BlogShare, type InsertBlogShare
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, sql, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Artists
  getAllArtists(): Promise<Artist[]>;
  getFeaturedArtists(): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: number, artist: Partial<InsertArtist>): Promise<Artist>;
  deleteArtist(id: number): Promise<void>;

  // Artworks
  getAllArtworks(): Promise<ArtworkWithArtist[]>;
  getFeaturedArtworks(): Promise<ArtworkWithArtist[]>;
  getArtworksByCategory(category: string): Promise<ArtworkWithArtist[]>;
  getArtworksByArtist(artistId: number): Promise<ArtworkWithArtist[]>;
  getArtwork(id: number): Promise<ArtworkWithArtist | undefined>;
  searchArtworks(query: string): Promise<ArtworkWithArtist[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: number, artwork: Partial<InsertArtwork>): Promise<Artwork>;
  deleteArtwork(id: number): Promise<void>;

  // Exhibitions
  getAllExhibitions(): Promise<Exhibition[]>;
  getCurrentExhibition(): Promise<Exhibition | undefined>;
  getExhibition(id: number): Promise<Exhibition | undefined>;
  createExhibition(exhibition: InsertExhibition): Promise<Exhibition>;
  updateExhibition(id: number, exhibition: Partial<InsertExhibition>): Promise<Exhibition>;
  deleteExhibition(id: number): Promise<void>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  getAllOrders(): Promise<OrderWithItems[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderPayment(id: number, paymentId: string, paymentMethod: string): Promise<Order>;

  // Newsletter
  subscribeNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getAllSubscribers(): Promise<NewsletterSubscriber[]>;

  // Blog
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostWithShares(id: number): Promise<BlogPostWithShares | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

  // Blog Shares
  recordBlogShare(share: InsertBlogShare): Promise<BlogShare>;
  getBlogShareStats(blogPostId: number): Promise<any>;
  getAllBlogShareStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Artists
  async getAllArtists(): Promise<Artist[]> {
    return await db.select().from(artists).orderBy(desc(artists.createdAt));
  }

  async getFeaturedArtists(): Promise<Artist[]> {
    return await db.select().from(artists).where(eq(artists.featured, true)).orderBy(desc(artists.createdAt));
  }

  async getArtist(id: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist || undefined;
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const [artist] = await db.insert(artists).values(insertArtist).returning();
    return artist;
  }

  async updateArtist(id: number, updateArtist: Partial<InsertArtist>): Promise<Artist> {
    const [artist] = await db.update(artists).set(updateArtist).where(eq(artists.id, id)).returning();
    return artist;
  }

  async deleteArtist(id: number): Promise<void> {
    await db.delete(artists).where(eq(artists.id, id));
  }

  // Artworks
  async getAllArtworks(): Promise<ArtworkWithArtist[]> {
    return await db.select({
      id: artworks.id,
      title: artworks.title,
      description: artworks.description,
      medium: artworks.medium,
      dimensions: artworks.dimensions,
      price: artworks.price,
      imageUrl: artworks.imageUrl,
      category: artworks.category,
      availability: artworks.availability,
      featured: artworks.featured,
      artistId: artworks.artistId,
      createdAt: artworks.createdAt,
      artist: artists,
    })
    .from(artworks)
    .leftJoin(artists, eq(artworks.artistId, artists.id))
    .orderBy(desc(artworks.createdAt));
  }

  async getFeaturedArtworks(): Promise<ArtworkWithArtist[]> {
    return await db.select({
      id: artworks.id,
      title: artworks.title,
      description: artworks.description,
      medium: artworks.medium,
      dimensions: artworks.dimensions,
      price: artworks.price,
      imageUrl: artworks.imageUrl,
      category: artworks.category,
      availability: artworks.availability,
      featured: artworks.featured,
      artistId: artworks.artistId,
      createdAt: artworks.createdAt,
      artist: artists,
    })
    .from(artworks)
    .leftJoin(artists, eq(artworks.artistId, artists.id))
    .where(eq(artworks.featured, true))
    .orderBy(desc(artworks.createdAt));
  }

  async getArtworksByCategory(category: string): Promise<ArtworkWithArtist[]> {
    return await db.select({
      id: artworks.id,
      title: artworks.title,
      description: artworks.description,
      medium: artworks.medium,
      dimensions: artworks.dimensions,
      price: artworks.price,
      imageUrl: artworks.imageUrl,
      category: artworks.category,
      availability: artworks.availability,
      featured: artworks.featured,
      artistId: artworks.artistId,
      createdAt: artworks.createdAt,
      artist: artists,
    })
    .from(artworks)
    .leftJoin(artists, eq(artworks.artistId, artists.id))
    .where(eq(artworks.category, category))
    .orderBy(desc(artworks.createdAt));
  }

  async getArtworksByArtist(artistId: number): Promise<ArtworkWithArtist[]> {
    return await db.select({
      id: artworks.id,
      title: artworks.title,
      description: artworks.description,
      medium: artworks.medium,
      dimensions: artworks.dimensions,
      price: artworks.price,
      imageUrl: artworks.imageUrl,
      category: artworks.category,
      availability: artworks.availability,
      featured: artworks.featured,
      artistId: artworks.artistId,
      createdAt: artworks.createdAt,
      artist: artists,
    })
    .from(artworks)
    .leftJoin(artists, eq(artworks.artistId, artists.id))
    .where(eq(artworks.artistId, artistId))
    .orderBy(desc(artworks.createdAt));
  }

  async getArtwork(id: number): Promise<ArtworkWithArtist | undefined> {
    const [artwork] = await db.select({
      id: artworks.id,
      title: artworks.title,
      description: artworks.description,
      medium: artworks.medium,
      dimensions: artworks.dimensions,
      price: artworks.price,
      imageUrl: artworks.imageUrl,
      category: artworks.category,
      availability: artworks.availability,
      featured: artworks.featured,
      artistId: artworks.artistId,
      createdAt: artworks.createdAt,
      artist: artists,
    })
    .from(artworks)
    .leftJoin(artists, eq(artworks.artistId, artists.id))
    .where(eq(artworks.id, id));
    return artwork || undefined;
  }

  async searchArtworks(query: string): Promise<ArtworkWithArtist[]> {
    return await db.select({
      id: artworks.id,
      title: artworks.title,
      description: artworks.description,
      medium: artworks.medium,
      dimensions: artworks.dimensions,
      price: artworks.price,
      imageUrl: artworks.imageUrl,
      category: artworks.category,
      availability: artworks.availability,
      featured: artworks.featured,
      artistId: artworks.artistId,
      createdAt: artworks.createdAt,
      artist: artists,
    })
    .from(artworks)
    .leftJoin(artists, eq(artworks.artistId, artists.id))
    .where(
      sql`${artworks.title} ILIKE ${`%${query}%`} OR ${artworks.description} ILIKE ${`%${query}%`} OR ${artists.name} ILIKE ${`%${query}%`}`
    )
    .orderBy(desc(artworks.createdAt));
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const [artwork] = await db.insert(artworks).values(insertArtwork).returning();
    return artwork;
  }

  async updateArtwork(id: number, updateArtwork: Partial<InsertArtwork>): Promise<Artwork> {
    const [artwork] = await db.update(artworks).set(updateArtwork).where(eq(artworks.id, id)).returning();
    return artwork;
  }

  async deleteArtwork(id: number): Promise<void> {
    await db.delete(artworks).where(eq(artworks.id, id));
  }

  // Exhibitions
  async getAllExhibitions(): Promise<Exhibition[]> {
    return await db.select().from(exhibitions).orderBy(desc(exhibitions.createdAt));
  }

  async getCurrentExhibition(): Promise<Exhibition | undefined> {
    const [exhibition] = await db.select().from(exhibitions).where(eq(exhibitions.current, true));
    return exhibition || undefined;
  }

  async getExhibition(id: number): Promise<Exhibition | undefined> {
    const [exhibition] = await db.select().from(exhibitions).where(eq(exhibitions.id, id));
    return exhibition || undefined;
  }

  async createExhibition(insertExhibition: InsertExhibition): Promise<Exhibition> {
    const [exhibition] = await db.insert(exhibitions).values(insertExhibition).returning();
    return exhibition;
  }

  async updateExhibition(id: number, updateExhibition: Partial<InsertExhibition>): Promise<Exhibition> {
    const [exhibition] = await db.update(exhibitions).set(updateExhibition).where(eq(exhibitions.id, id)).returning();
    return exhibition;
  }

  async deleteExhibition(id: number): Promise<void> {
    await db.delete(exhibitions).where(eq(exhibitions.id, id));
  }

  // Orders
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async addOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const orderData = await db.select({
      order: orders,
      item: orderItems,
      artwork: artworks,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(artworks, eq(orderItems.artworkId, artworks.id))
    .where(eq(orders.id, id));

    if (orderData.length === 0) return undefined;

    const order = orderData[0].order;
    const items = orderData
      .filter(row => row.item && row.artwork)
      .map(row => ({
        ...row.item!,
        artwork: row.artwork!,
      }));

    return { ...order, items };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order;
  }

  async updateOrderPayment(id: number, paymentId: string, paymentMethod: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ 
        paymentId,
        paymentMethod,
        status: "paid",
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Newsletter
  async subscribeNewsletter(insertSubscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [subscriber] = await db.insert(newsletterSubscribers).values(insertSubscriber).returning();
    return subscriber;
  }

  async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    return await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
  }

  // Blog
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  async updateBlogPost(id: number, updatePost: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [post] = await db.update(blogPosts).set(updatePost).where(eq(blogPosts.id, id)).returning();
    return post;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getAllOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db.query.orders.findMany({
      with: {
        items: {
          with: {
            artwork: true
          }
        }
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)]
    });
    return allOrders;
  }
}

export const storage = new DatabaseStorage();
