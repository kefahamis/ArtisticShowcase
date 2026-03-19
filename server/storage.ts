import { 
  users, artists, artworks, exhibitions, orders, orderItems, 
  newsletterSubscribers, blogPosts, blogShares, mediaFiles, 
  userAccounts, userActivityLogs, dashboardMetrics,
  artistNotificationPreferences, passwordResetTokens,
  type User, type InsertUser,
  type Artist, type InsertArtist,
  type Artwork, type InsertArtwork, type ArtworkWithArtist,
  type Exhibition, type InsertExhibition,
  type Order, type InsertOrder, type OrderWithItems,
  type OrderItem, type InsertOrderItem,
  type NewsletterSubscriber, type InsertNewsletterSubscriber,
  type BlogPost, type InsertBlogPost, type BlogPostWithShares,
  type BlogShare, type InsertBlogShare,
  type MediaFile, type InsertMediaFile,
  type UserAccount, type InsertUserAccount,
  type UserActivityLog, type InsertUserActivityLog,
  type DashboardMetric, type InsertDashboardMetric,
  type ArtistNotificationPreferences,
  type InsertArtistNotificationPreferences,
  type PasswordResetToken, type InsertPasswordResetToken
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, sql, ilike, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Artists
  getAllArtists(): Promise<Artist[]>;
  getFeaturedArtists(): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistBySlug(slug: string): Promise<Artist | undefined>;
  getArtistByUserId(userId: number): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: number, artist: Partial<InsertArtist>): Promise<Artist>;
  deleteArtist(id: number): Promise<void>;
  
  // Artist Authentication
  registerArtist(userData: InsertUser, artistData: Omit<InsertArtist, 'userId'>): Promise<{ user: User; artist: Artist }>;
  loginArtist(email: string, password: string): Promise<{ user: User; artist: Artist } | null>;
  
  // Artist Approval
  approveArtist(artistId: number): Promise<Artist>;
  rejectArtist(artistId: number): Promise<void>;
  getPendingArtists(): Promise<Artist[]>;

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
  
  // Artist-specific artwork operations
  getArtworksByArtistUser(userId: number): Promise<ArtworkWithArtist[]>;
  getArtistOrdersForArtworks(userId: number): Promise<OrderWithItems[]>;

  // Artist settings operations
  getArtistNotificationPreferences(artistId: number): Promise<ArtistNotificationPreferences | null>;
  updateArtistNotificationPreferences(artistId: number, preferences: Partial<InsertArtistNotificationPreferences>): Promise<ArtistNotificationPreferences>;
  changeArtistPassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean>;
  closeArtistAccount(userId: number, password: string, reason: string): Promise<boolean>;
  
  // 2FA operations
  setup2FA(userId: number): Promise<{ secret: string; qrCode: string }>;
  verify2FA(userId: number, token: string): Promise<{ success: boolean; backupCodes?: string[] }>;
  disable2FA(userId: number, password: string): Promise<boolean>;
  
  // Password reset operations
  createPasswordResetToken(userId: number): Promise<{ token: string; expiresAt: Date }>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | null>;
  usePasswordResetToken(token: string, newPassword: string): Promise<boolean>;
  cleanExpiredPasswordResetTokens(): Promise<void>;
  get2FAStatus(userId: number): Promise<{ enabled: boolean; hasBackupCodes: boolean }>;

  // Exhibitions
  getAllExhibitions(): Promise<Exhibition[]>;
  getCurrentExhibition(): Promise<Exhibition | undefined>;
  getExhibition(id: number): Promise<Exhibition | undefined>;
  getExhibitionBySlug(slug: string): Promise<Exhibition | undefined>;
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

  // Media Files
  getAllMediaFiles(limit?: number, offset?: number): Promise<MediaFile[]>;
  getArtistMediaFiles(artistId: number, limit?: number, offset?: number): Promise<MediaFile[]>;
  getMediaFile(id: number): Promise<MediaFile | undefined>;
  createMediaFile(file: InsertMediaFile): Promise<MediaFile>;
  updateMediaFile(id: number, file: Partial<InsertMediaFile>): Promise<MediaFile>;
  deleteMediaFile(id: number): Promise<void>;

  // User Accounts
  getAllUserAccounts(): Promise<UserAccount[]>;
  getUserAccount(id: number): Promise<UserAccount | undefined>;
  getUserAccountByEmail(email: string): Promise<UserAccount | undefined>;
  createUserAccount(user: InsertUserAccount): Promise<UserAccount>;
  updateUserAccount(id: number, user: Partial<InsertUserAccount>): Promise<UserAccount>;
  deleteUserAccount(id: number): Promise<void>;
  getUserStats(): Promise<any>;

  // User Activity Logs
  getAllUserActivityLogs(): Promise<UserActivityLog[]>;
  getUserActivityLogs(userId: number): Promise<UserActivityLog[]>;
  createUserActivityLog(log: InsertUserActivityLog): Promise<UserActivityLog>;

  // Dashboard Metrics
  getDashboardMetrics(): Promise<any>;
  createDashboardMetric(metric: InsertDashboardMetric): Promise<DashboardMetric>;
  getRecentActivity(): Promise<any[]>;

  // Favorites
  addToFavorites(userEmail: string, artworkId: number): Promise<void>;
  removeFromFavorites(userEmail: string, artworkId: number): Promise<void>;
  getUserFavorites(userEmail: string): Promise<number[]>;
  isArtworkInFavorites(userEmail: string, artworkId: number): Promise<boolean>;
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

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();
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

  async getArtistBySlug(slug: string): Promise<Artist | undefined> {
    // Create slug from artist name and compare
    const allArtists = await db.select().from(artists);
    const artist = allArtists.find(a => 
      a.name.toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') === slug
    );
    return artist;
  }

  async getArtistByUserId(userId: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
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

  // Artist Authentication
  async registerArtist(userData: InsertUser, artistData: Omit<InsertArtist, 'userId'>): Promise<{ user: User; artist: Artist }> {
    const [user] = await db.insert(users).values(userData).returning();
    const [artist] = await db.insert(artists).values({
      ...artistData,
      userId: user.id,
    }).returning();
    return { user, artist };
  }

  async loginArtist(email: string, password: string): Promise<{ user: User; artist: Artist } | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return null;
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const [artist] = await db.select().from(artists).where(eq(artists.userId, user.id));
    if (!artist) return null;

    // Check if artist is approved
    if (!artist.approved) {
      throw new Error('ACCOUNT_PENDING_APPROVAL');
    }

    return { user, artist };
  }

  // Artist Approval Methods
  async approveArtist(artistId: number): Promise<Artist> {
    const [artist] = await db.update(artists)
      .set({ 
        approved: true, 
        approvedAt: new Date() 
      })
      .where(eq(artists.id, artistId))
      .returning();
    return artist;
  }

  async rejectArtist(artistId: number): Promise<void> {
    // Delete the artist and associated user account
    const [artist] = await db.select().from(artists).where(eq(artists.id, artistId));
    if (artist && artist.userId) {
      await db.delete(users).where(eq(users.id, artist.userId));
    }
    await db.delete(artists).where(eq(artists.id, artistId));
  }

  async getPendingArtists(): Promise<Artist[]> {
    return await db.select().from(artists)
      .where(eq(artists.approved, false))
      .orderBy(desc(artists.createdAt));
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

  // Artist-specific artwork operations
  async getArtworksByArtistUser(userId: number): Promise<ArtworkWithArtist[]> {
    const artist = await this.getArtistByUserId(userId);
    if (!artist) return [];
    
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
    .where(eq(artworks.artistId, artist.id))
    .orderBy(desc(artworks.createdAt));
  }

  async getArtistOrdersForArtworks(userId: number): Promise<OrderWithItems[]> {
    const artist = await this.getArtistByUserId(userId);
    if (!artist) return [];

    try {
      // Get all orders that contain artworks by this artist
      const ordersQuery = await db.select({
        id: orders.id,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        total: orders.total,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        paymentId: orders.paymentId,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(artworks, eq(orderItems.artworkId, artworks.id))
      .where(eq(artworks.artistId, artist.id))
      .groupBy(orders.id, orders.customerName, orders.customerEmail, orders.total, orders.status, orders.paymentMethod, orders.paymentId, orders.createdAt)
      .orderBy(desc(orders.createdAt));

      // For each order, get the items
      const ordersWithItems = await Promise.all(
        ordersQuery.map(async (order) => {
          const items = await db.select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            artworkId: orderItems.artworkId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            artwork: artworks,
          })
          .from(orderItems)
          .innerJoin(artworks, eq(orderItems.artworkId, artworks.id))
          .where(and(
            eq(orderItems.orderId, order.id),
            eq(artworks.artistId, artist.id)
          ));

          return {
            ...order,
            items,
          };
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error("Error fetching artist orders:", error);
      return [];
    }
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

  async getExhibitionBySlug(slug: string): Promise<Exhibition | undefined> {
    // Create slug from exhibition title and compare
    const allExhibitions = await db.select().from(exhibitions);
    const exhibition = allExhibitions.find(e => 
      e.title.toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') === slug
    );
    return exhibition;
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
        stripePaymentId: paymentId,
        paymentMethod,
        status: "paid"
      })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getOrdersByArtist(artistId: number): Promise<OrderWithItems[]> {
    // Get all orders that contain items from this artist's artworks
    const artistOrders = await db.select({
      orderId: orderItems.orderId,
    })
    .from(orderItems)
    .leftJoin(artworks, eq(orderItems.artworkId, artworks.id))
    .where(eq(artworks.artistId, artistId))
    .groupBy(orderItems.orderId);

    if (artistOrders.length === 0) {
      return [];
    }

    const orderIds = artistOrders.map(o => o.orderId);
    
    const allOrders = await db.select({
      id: orders.id,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      customerAddress: orders.customerAddress,
      totalAmount: orders.totalAmount,
      total: orders.total,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      stripePaymentId: orders.stripePaymentId,
      createdAt: orders.createdAt,
    })
      .from(orders)
      .where(sql`${orders.id} IN (${sql.join(orderIds, sql`, `)})`)
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          artworkId: orderItems.artworkId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          artwork: artworks,
        })
        .from(orderItems)
        .leftJoin(artworks, eq(orderItems.artworkId, artworks.id))
        .where(eq(orderItems.orderId, order.id));

        return { ...order, items };
      })
    );

    return ordersWithItems;
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

  // Blog shares
  async recordBlogShare(share: InsertBlogShare): Promise<BlogShare> {
    const [newShare] = await db.insert(blogShares).values(share).returning();
    return newShare;
  }

  async getBlogShareStats(blogPostId: number): Promise<any> {
    const shares = await db.select().from(blogShares).where(eq(blogShares.blogPostId, blogPostId));
    const stats = {
      facebook: shares.filter(s => s.platform === 'facebook').length,
      twitter: shares.filter(s => s.platform === 'twitter').length,
      linkedin: shares.filter(s => s.platform === 'linkedin').length,
      copy: shares.filter(s => s.platform === 'copy').length,
      total: shares.length
    };
    return stats;
  }

  async getAllBlogShareStats(): Promise<any> {
    const shares = await db.select().from(blogShares);
    const statsByPost = shares.reduce((acc, share) => {
      if (share.blogPostId && !acc[share.blogPostId]) {
        acc[share.blogPostId] = { facebook: 0, twitter: 0, linkedin: 0, copy: 0, total: 0 };
      }
      if (share.blogPostId) {
        acc[share.blogPostId][share.platform]++;
        acc[share.blogPostId].total++;
      }
      return acc;
    }, {} as Record<number, any>);
    return statsByPost;
  }

  async getBlogPostWithShares(id: number): Promise<BlogPostWithShares | undefined> {
    const post = await this.getBlogPost(id);
    if (!post) return undefined;
    
    const shares = await db.select().from(blogShares).where(eq(blogShares.blogPostId, id));
    const shareCount = {
      facebook: shares.filter(s => s.platform === 'facebook').length,
      twitter: shares.filter(s => s.platform === 'twitter').length,
      linkedin: shares.filter(s => s.platform === 'linkedin').length,
      copy: shares.filter(s => s.platform === 'copy').length,
      total: shares.length
    };
    
    return { ...post, shares, shareCount };
  }

  // Media Files
  async getAllMediaFiles(limit?: number, offset?: number): Promise<MediaFile[]> {
    const query = db.select().from(mediaFiles).orderBy(desc(mediaFiles.createdAt));
    
    if (limit !== undefined) {
      query.limit(limit);
    }
    
    if (offset !== undefined) {
      query.offset(offset);
    }
    
    return await query;
  }

  async getArtistMediaFiles(artistId: number, limit?: number, offset?: number): Promise<MediaFile[]> {
    // Return files uploaded by this artist OR admin uploads (artistId null)
    const query = db.select().from(mediaFiles)
      .where(or(
        eq(mediaFiles.artistId, artistId),
        eq(mediaFiles.artistId, null)
      ))
      .orderBy(desc(mediaFiles.createdAt));
    
    if (limit !== undefined) {
      query.limit(limit);
    }
    
    if (offset !== undefined) {
      query.offset(offset);
    }
    
    return await query;
  }

  async getMediaFile(id: number): Promise<MediaFile | undefined> {
    const [file] = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id));
    return file || undefined;
  }

  async createMediaFile(file: InsertMediaFile): Promise<MediaFile> {
    const [newFile] = await db.insert(mediaFiles).values(file).returning();
    return newFile;
  }

  async updateMediaFile(id: number, file: Partial<InsertMediaFile>): Promise<MediaFile> {
    const [updatedFile] = await db.update(mediaFiles).set(file).where(eq(mediaFiles.id, id)).returning();
    return updatedFile;
  }

  async deleteMediaFile(id: number): Promise<void> {
    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
  }

  // User Accounts
  async getAllUserAccounts(): Promise<UserAccount[]> {
    return await db.select().from(userAccounts).orderBy(desc(userAccounts.createdAt));
  }

  async getUserAccount(id: number): Promise<UserAccount | undefined> {
    const [user] = await db.select().from(userAccounts).where(eq(userAccounts.id, id));
    return user || undefined;
  }

  async getUserAccountByEmail(email: string): Promise<UserAccount | undefined> {
    const [user] = await db.select().from(userAccounts).where(eq(userAccounts.email, email));
    return user || undefined;
  }

  async createUserAccount(user: InsertUserAccount): Promise<UserAccount> {
    const [newUser] = await db.insert(userAccounts).values(user).returning();
    return newUser;
  }

  async updateUserAccount(id: number, user: Partial<InsertUserAccount>): Promise<UserAccount> {
    const [updatedUser] = await db.update(userAccounts).set(user).where(eq(userAccounts.id, id)).returning();
    return updatedUser;
  }

  async deleteUserAccount(id: number): Promise<void> {
    await db.delete(userAccounts).where(eq(userAccounts.id, id));
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await db.select({ count: sql`count(*)` }).from(userAccounts);
    const activeUsers = await db.select({ count: sql`count(*)` }).from(userAccounts).where(eq(userAccounts.isActive, true));
    const adminUsers = await db.select({ count: sql`count(*)` }).from(userAccounts).where(eq(userAccounts.role, 'admin'));
    
    const totalCount = Number(totalUsers[0]?.count) || 0;
    const activeCount = Number(activeUsers[0]?.count) || 0;
    const adminCount = Number(adminUsers[0]?.count) || 0;
    
    return {
      total: totalCount,
      active: activeCount,
      admins: adminCount,
      inactive: totalCount - activeCount
    };
  }

  // User Activity Logs
  async getAllUserActivityLogs(): Promise<UserActivityLog[]> {
    return await db.select().from(userActivityLogs).orderBy(desc(userActivityLogs.createdAt));
  }

  async getUserActivityLogs(userId: number): Promise<UserActivityLog[]> {
    return await db.select().from(userActivityLogs)
      .where(eq(userActivityLogs.userId, userId))
      .orderBy(desc(userActivityLogs.createdAt));
  }

  async createUserActivityLog(log: InsertUserActivityLog): Promise<UserActivityLog> {
    const [newLog] = await db.insert(userActivityLogs).values(log).returning();
    return newLog;
  }

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<any> {
    // Get basic counts
    const [artistCount] = await db.select({ count: sql`count(*)` }).from(artists);
    const [artworkCount] = await db.select({ count: sql`count(*)` }).from(artworks);
    const [orderCount] = await db.select({ count: sql`count(*)` }).from(orders);
    const [blogPostCount] = await db.select({ count: sql`count(*)` }).from(blogPosts);
    const [userCount] = await db.select({ count: sql`count(*)` }).from(userAccounts);
    
    // Get revenue from orders
    const [revenue] = await db.select({ total: sql`sum(${orders.total})` }).from(orders);
    
    // Get recent activity counts
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentOrders] = await db.select({ count: sql`count(*)` })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${thirtyDaysAgo}`);
    
    const [recentUsers] = await db.select({ count: sql`count(*)` })
      .from(userAccounts)
      .where(sql`${userAccounts.createdAt} >= ${thirtyDaysAgo}`);

    return {
      totalArtists: artistCount.count || 0,
      totalArtworks: artworkCount.count || 0,
      totalOrders: orderCount.count || 0,
      totalRevenue: revenue.total || 0,
      totalBlogPosts: blogPostCount.count || 0,
      totalUsers: userCount.count || 0,
      recentOrders: recentOrders.count || 0,
      recentUsers: recentUsers.count || 0
    };
  }

  async createDashboardMetric(metric: InsertDashboardMetric): Promise<DashboardMetric> {
    const [newMetric] = await db.insert(dashboardMetrics).values(metric).returning();
    return newMetric;
  }

  async getRecentActivity(): Promise<any[]> {
    // Get recent orders
    const recentOrders = await db.query.orders.findMany({
      limit: 5,
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      columns: { id: true, customerEmail: true, total: true, createdAt: true }
    });

    // Get recent user registrations
    const recentUsers = await db.query.userAccounts.findMany({
      limit: 5,
      orderBy: (userAccounts, { desc }) => [desc(userAccounts.createdAt)],
      columns: { id: true, email: true, firstName: true, lastName: true, createdAt: true }
    });

    // Get recent blog posts
    const recentPosts = await db.query.blogPosts.findMany({
      limit: 5,
      orderBy: (blogPosts, { desc }) => [desc(blogPosts.createdAt)],
      columns: { id: true, title: true, createdAt: true, published: true }
    });

    // Combine and format activities
    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        id: order.id,
        description: `New order from ${order.customerEmail}`,
        amount: order.total,
        timestamp: order.createdAt
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        id: user.id,
        description: `New user registration: ${user.firstName} ${user.lastName}`,
        email: user.email,
        timestamp: user.createdAt
      })),
      ...recentPosts.map(post => ({
        type: 'blog',
        id: post.id,
        description: `${post.published ? 'Published' : 'Created'} blog post: ${post.title}`,
        timestamp: post.createdAt
      }))
    ];

    // Sort by timestamp and return latest 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  // Artist settings methods
  async getArtistNotificationPreferences(artistId: number): Promise<ArtistNotificationPreferences | null> {
    const [preferences] = await db
      .select()
      .from(artistNotificationPreferences)
      .where(eq(artistNotificationPreferences.artistId, artistId));
    
    // If no preferences exist, create default ones
    if (!preferences) {
      const defaultPreferences = {
        artistId,
        orderNotifications: true,
        exhibitionNotifications: true,
        marketingEmails: false,
        newsLetters: false,
        profileUpdates: true,
      };
      
      const [newPreferences] = await db
        .insert(artistNotificationPreferences)
        .values(defaultPreferences)
        .returning();
      
      return newPreferences;
    }
    
    return preferences;
  }

  async updateArtistNotificationPreferences(
    artistId: number, 
    preferences: Partial<InsertArtistNotificationPreferences>
  ): Promise<ArtistNotificationPreferences> {
    const [updatedPreferences] = await db
      .update(artistNotificationPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(artistNotificationPreferences.artistId, artistId))
      .returning();
    
    return updatedPreferences;
  }

  async changeArtistPassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return false;
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return false;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, userId));

    return true;
  }

  // 2FA Methods
  async setup2FA(userId: number): Promise<{ secret: string; qrCode: string }> {
    const speakeasy = await import('speakeasy');
    const QRCode = await import('qrcode');
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `Gallery (${user.email})`,
      issuer: 'Talanta Art Gallery',
      length: 20
    });

    // Store the secret temporarily (not enabled yet)
    await db.update(users)
      .set({ twoFactorSecret: secret.base32 })
      .where(eq(users.id, userId));

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode
    };
  }

  async verify2FA(userId: number, token: string): Promise<{ success: boolean; backupCodes?: string[] }> {
    const speakeasy = await import('speakeasy');
    const crypto = await import('crypto');
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.twoFactorSecret) {
      return { success: false };
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (verified) {
      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      await db.update(users)
        .set({
          twoFactorEnabled: true,
          backupCodes
        })
        .where(eq(users.id, userId));

      return { success: true, backupCodes };
    }

    return { success: false };
  }

  async disable2FA(userId: number, password: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return false;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return false;
    }

    await db.update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null
      })
      .where(eq(users.id, userId));

    return true;
  }

  async get2FAStatus(userId: number): Promise<{ enabled: boolean; hasBackupCodes: boolean }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return { enabled: false, hasBackupCodes: false };
    }

    return {
      enabled: user.twoFactorEnabled || false,
      hasBackupCodes: (user.backupCodes?.length || 0) > 0
    };
  }

  async closeArtistAccount(userId: number, password: string, reason: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return false;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return false;
    }

    // Create activity log for account closure
    await db.insert(userActivityLogs).values({
      userId,
      action: 'account_closed',
      description: `Account closed. Reason: ${reason}`,
      ipAddress: null,
      userAgent: null,
    });

    // Deactivate user account instead of deleting
    await db
      .update(users)
      .set({ 
        email: `deleted_${Date.now()}_${user.email}`,
        password: 'account_closed',
      })
      .where(eq(users.id, userId));

    return true;
  }

  // Password Reset Methods
  async createPasswordResetToken(userId: number): Promise<{ token: string; expiresAt: Date }> {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
      used: false
    });

    return { token, expiresAt };
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false)
        )
      );

    if (!resetToken) {
      console.log(`No reset token found for token: ${token}`);
      return null;
    }

    // Check if token has expired
    const now = new Date();
    if (resetToken.expiresAt < now) {
      console.log(`Reset token expired. Expires: ${resetToken.expiresAt}, Now: ${now}`);
      return null;
    }

    console.log(`Valid reset token found for token: ${token}`);
    return resetToken;
  }

  async usePasswordResetToken(token: string, newPassword: string): Promise<boolean> {
    const resetToken = await this.getPasswordResetToken(token);
    
    if (!resetToken) {
      return false;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    try {
      await db.transaction(async (tx) => {
        // Update the user's password
        await tx
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, resetToken.userId));

        // Mark the token as used
        await tx
          .update(passwordResetTokens)
          .set({ used: true })
          .where(eq(passwordResetTokens.token, token));
      });

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  async cleanExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(sql`${passwordResetTokens.expiresAt} < NOW() OR ${passwordResetTokens.used} = true`);
  }

  // Favorites implementation
  async addToFavorites(userEmail: string, artworkId: number): Promise<void> {
    await db.execute(sql`
      INSERT INTO favorites (user_email, artwork_id) 
      VALUES (${userEmail}, ${artworkId}) 
      ON CONFLICT (user_email, artwork_id) DO NOTHING
    `);
  }

  async removeFromFavorites(userEmail: string, artworkId: number): Promise<void> {
    await db.execute(sql`
      DELETE FROM favorites 
      WHERE user_email = ${userEmail} AND artwork_id = ${artworkId}
    `);
  }

  async getUserFavorites(userEmail: string): Promise<number[]> {
    const result = await db.execute(sql`
      SELECT artwork_id FROM favorites WHERE user_email = ${userEmail}
    `);
    return result.rows.map((row: any) => row.artwork_id);
  }

  async isArtworkInFavorites(userEmail: string, artworkId: number): Promise<boolean> {
    const result = await db.execute(sql`
      SELECT 1 FROM favorites 
      WHERE user_email = ${userEmail} AND artwork_id = ${artworkId}
    `);
    return result.rows.length > 0;
  }
}

export const storage = new DatabaseStorage();
