import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  specialty: text("specialty").notNull(),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const exhibitions = pgTable("exhibitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  openingReception: text("opening_reception"),
  current: boolean("current").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerAddress: json("customer_address").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, shipped, delivered
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  artworkId: integer("artwork_id").notNull(),
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


// Relations
export const artistsRelations = relations(artists, ({ many }) => ({
  artworks: many(artworks),
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

export const insertArtworkSchema = createInsertSchema(artworks).omit({
  id: true,
  createdAt: true,
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