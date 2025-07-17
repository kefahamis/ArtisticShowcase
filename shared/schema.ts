import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  backupCodes: text("backup_codes").array(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  specialty: text("specialty").notNull(),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
  userId: integer("user_id").unique(), // Link to user account for artist login
  approved: boolean("approved").default(false), // Admin approval status
  approvedAt: timestamp("approved_at"), // When approved by admin
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  medium: text("medium").notNull(),
  dimensions: text("dimensions").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(), // painting, sculpture, photography, mixed-media
  availability: text("availability").notNull().default("available"), // available, sold, reserved
  featured: boolean("featured").default(false),
  artistId: integer("artist_id").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exhibitions = pgTable("exhibitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  location: text("location"),
  venue: text("venue"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  openingReception: text("opening_reception"),
  current: boolean("current").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  customerAddress: json("customer_address"), // Made nullable to handle legacy orders
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, shipped, delivered
  stripePaymentId: text("stripe_payment_id"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  artworkId: integer("artwork_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogShares = pgTable("blog_shares", {
  id: serial("id").primaryKey(),
  blogPostId: integer("blog_post_id").references(() => blogPosts.id),
  platform: text("platform").notNull(), // facebook, twitter, linkedin, copy
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  tags: text("tags").array(),
  uploadedBy: text("uploaded_by").notNull().default("admin"), // "admin" or "artist"
  artistId: integer("artist_id").references(() => artists.id), // null for admin uploads
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userAccounts = pgTable("user_accounts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").default("user"), // user, admin
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userActivityLogs = pgTable("user_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => userAccounts.id),
  action: text("action").notNull(),
  description: text("description"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dashboardMetrics = pgTable("dashboard_metrics", {
  id: serial("id").primaryKey(),
  metricName: text("metric_name").notNull(),
  metricValue: integer("metric_value").notNull(),
  metricType: text("metric_type").notNull(), // count, revenue, percentage
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const artistNotificationPreferences = pgTable("artist_notification_preferences", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").notNull(),
  orderNotifications: boolean("order_notifications").default(true),
  exhibitionNotifications: boolean("exhibition_notifications").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  newsLetters: boolean("news_letters").default(false),
  profileUpdates: boolean("profile_updates").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userEmail: text("user_email").notNull(), // Store by email for guest users
  artworkId: integer("artwork_id").notNull().references(() => artworks.id),
  createdAt: timestamp("created_at").defaultNow(),
});



// Relations
export const artistsRelations = relations(artists, ({ many, one }) => ({
  artworks: many(artworks),
  user: one(users, {
    fields: [artists.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  artist: one(artists, {
    fields: [users.id],
    references: [artists.userId],
  }),
}));

export const artworksRelations = relations(artworks, ({ one }) => ({
  artist: one(artists, {
    fields: [artworks.artistId],
    references: [artists.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  artwork: one(artworks, {
    fields: [orderItems.artworkId],
    references: [artworks.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ many }) => ({
  shares: many(blogShares),
}));

export const blogSharesRelations = relations(blogShares, ({ one }) => ({
  blogPost: one(blogPosts, {
    fields: [blogShares.blogPostId],
    references: [blogPosts.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});


export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
  createdAt: true,
});

export const insertArtworkSchema = createInsertSchema(artworks, {
  // Customize fields as needed
  price: z.coerce.number().positive(), // Ensures price is a positive number
  featured: z.boolean().default(false),
  availability: z.enum(["available", "sold", "reserved"]).default("available"),
}).omit({
  id: true,
  createdAt: true,
});

export const artworkFormSchema = insertArtworkSchema.extend({
  price: z.string().transform((val) => parseFloat(val)),
  artistId: z.string().transform((val) => parseInt(val)),
});

export const insertExhibitionSchema = createInsertSchema(exhibitions).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscribedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
});

export const insertBlogShareSchema = createInsertSchema(blogShares).omit({
  id: true,
  createdAt: true,
});

export const insertMediaFileSchema = createInsertSchema(mediaFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAccountSchema = createInsertSchema(userAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserActivityLogSchema = createInsertSchema(userActivityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardMetricSchema = createInsertSchema(dashboardMetrics).omit({
  id: true,
  recordedAt: true,
});

export const insertArtistNotificationPreferencesSchema = createInsertSchema(artistNotificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;

export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;

export type Exhibition = typeof exhibitions.$inferSelect;
export type InsertExhibition = z.infer<typeof insertExhibitionSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type BlogShare = typeof blogShares.$inferSelect;
export type InsertBlogShare = z.infer<typeof insertBlogShareSchema>;

// Extended types for queries with relations
export type ArtworkWithArtist = Artwork & {
  artist: Artist | null;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { artwork: Artwork })[];
};

export type BlogPostWithShares = BlogPost & {
  shares: BlogShare[];
  shareCount?: {
    facebook: number;
    twitter: number;
    linkedin: number;
    copy: number;
    total: number;
  };
};

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;

export type UserAccount = typeof userAccounts.$inferSelect;
export type InsertUserAccount = z.infer<typeof insertUserAccountSchema>;

export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;

export type DashboardMetric = typeof dashboardMetrics.$inferSelect;
export type InsertDashboardMetric = z.infer<typeof insertDashboardMetricSchema>;

export type ArtistNotificationPreferences = typeof artistNotificationPreferences.$inferSelect;
export type InsertArtistNotificationPreferences = z.infer<typeof insertArtistNotificationPreferencesSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

// Favorites schema
export const insertFavoriteSchema = createInsertSchema(favorites);
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;