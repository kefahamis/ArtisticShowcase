import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertArtistSchema, insertArtworkSchema, insertExhibitionSchema, 
  insertOrderSchema, insertOrderItemSchema, insertNewsletterSubscriberSchema,
  insertBlogPostSchema, insertUserSchema
} from "@shared/schema";
import jwt from "jsonwebtoken";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { sendOrderReceipt } from "./email";

const JWT_SECRET = process.env.JWT_SECRET || "gallery-secret-key-2024";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gallery2024";

// Admin authentication middleware
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User registration route
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ 
        message: "User created successfully", 
        user: { id: user.id, email: user.email, username: user.username }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const subscriberData = insertNewsletterSubscriberSchema.parse(req.body);
      const subscriber = await storage.subscribeNewsletter(subscriberData);
      res.status(201).json(subscriber);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search functionality
  app.get("/api/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const artworks = await storage.searchArtworks(query);
      res.json(artworks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Artists routes
  app.get("/api/artists", async (req, res) => {
    try {
      const artists = await storage.getAllArtists();
      res.json(artists);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/artists/featured", async (req, res) => {
    try {
      const artists = await storage.getFeaturedArtists();
      res.json(artists);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/artists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artist = await storage.getArtist(id);
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      res.json(artist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Protected admin routes for artists
  app.post("/api/artists", authenticateAdmin, async (req, res) => {
    try {
      const artistData = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(artistData);
      res.status(201).json(artist);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/artists/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artistData = insertArtistSchema.partial().parse(req.body);
      const artist = await storage.updateArtist(id, artistData);
      res.json(artist);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/artists/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArtist(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Artworks routes
  app.get("/api/artworks", async (req, res) => {
    try {
      const { category, artist, search } = req.query;
      
      let artworks;
      if (search) {
        artworks = await storage.searchArtworks(search as string);
      } else if (category) {
        artworks = await storage.getArtworksByCategory(category as string);
      } else if (artist) {
        artworks = await storage.getArtworksByArtist(parseInt(artist as string));
      } else {
        artworks = await storage.getAllArtworks();
      }
      
      res.json(artworks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/artworks/featured", async (req, res) => {
    try {
      const artworks = await storage.getFeaturedArtworks();
      res.json(artworks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/artworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      res.json(artwork);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Protected admin routes for artworks
  app.post("/api/artworks", authenticateAdmin, async (req, res) => {
    try {
      const artworkData = insertArtworkSchema.parse(req.body);
      const artwork = await storage.createArtwork(artworkData);
      res.status(201).json(artwork);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/artworks/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artworkData = insertArtworkSchema.partial().parse(req.body);
      const artwork = await storage.updateArtwork(id, artworkData);
      res.json(artwork);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/artworks/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArtwork(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Exhibitions routes
  app.get("/api/exhibitions", async (req, res) => {
    try {
      const exhibitions = await storage.getAllExhibitions();
      res.json(exhibitions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/exhibitions/current", async (req, res) => {
    try {
      const exhibition = await storage.getCurrentExhibition();
      if (!exhibition) {
        return res.status(404).json({ message: "No current exhibition found" });
      }
      res.json(exhibition);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/exhibitions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exhibition = await storage.getExhibition(id);
      if (!exhibition) {
        return res.status(404).json({ message: "Exhibition not found" });
      }
      res.json(exhibition);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/exhibitions", async (req, res) => {
    try {
      const exhibitionData = insertExhibitionSchema.parse(req.body);
      const exhibition = await storage.createExhibition(exhibitionData);
      res.status(201).json(exhibition);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/exhibitions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exhibitionData = insertExhibitionSchema.partial().parse(req.body);
      const exhibition = await storage.updateExhibition(id, exhibitionData);
      res.json(exhibition);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/exhibitions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExhibition(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const subscriberData = insertNewsletterSubscriberSchema.parse(req.body);
      const subscriber = await storage.subscribeNewsletter(subscriberData);
      res.status(201).json({ message: "Successfully subscribed to newsletter" });
    } catch (error: any) {
      if (error.message.includes('unique constraint')) {
        return res.status(400).json({ message: "Email already subscribed" });
      }
      res.status(400).json({ message: error.message });
    }
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog", async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Orders (payment processing temporarily disabled)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, orderData } = req.body;
      
      // Create order in database
      const orderSchema = insertOrderSchema.extend({
        items: insertOrderItemSchema.array()
      });
      const validatedData = orderSchema.parse(orderData);
      
      const order = await storage.createOrder({
        customerEmail: validatedData.customerEmail,
        customerName: validatedData.customerName,
        customerAddress: validatedData.customerAddress,
        totalAmount: validatedData.totalAmount.toString(),
        status: "pending"
      });

      // Add order items
      for (const item of validatedData.items) {
        await storage.addOrderItem({
          orderId: order.id,
          artworkId: item.artworkId,
          price: item.price.toString()
        });
      }

      // Stripe payment integration temporarily disabled
      // Mock response for development
      res.json({ 
        clientSecret: "mock_client_secret",
        orderId: order.id
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/orders/:id/confirm", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.updateOrderStatus(id, "completed");
      
      // Mark artworks as sold
      const fullOrder = await storage.getOrder(id);
      if (fullOrder) {
        for (const item of fullOrder.items) {
          await storage.updateArtwork(item.artworkId, { availability: "sold" });
        }
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PayPal payment routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // M-Pesa payment routes (simulation for demo)
  app.post("/api/payments/mpesa", async (req, res) => {
    try {
      const { phoneNumber, amount } = req.body;
      
      if (!phoneNumber || !amount) {
        return res.status(400).json({ error: "Phone number and amount required" });
      }

      // Simulate M-Pesa API call
      const transactionId = `MPESA${Date.now()}`;
      
      res.json({
        success: true,
        transactionId,
        message: "Payment request sent successfully"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Order management routes
  app.get("/api/orders", authenticateAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", authenticateAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = parseInt(req.params.id);
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send order receipt via email
  app.post("/api/orders/:id/send-receipt", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Prepare order data for email
      const orderData = {
        orderId: order.id,
        customerName: order.customerName || 'Valued Customer',
        customerEmail: order.customerEmail || req.body.email,
        orderTotal: order.total,
        items: order.items.map(item => ({
          title: item.artwork.title,
          price: item.artwork.price,
          quantity: item.quantity
        })),
        orderDate: new Date(order.createdAt).toLocaleDateString(),
        paymentMethod: order.paymentMethod || 'Online Payment'
      };

      const emailSent = await sendOrderReceipt(orderData);
      
      if (emailSent) {
        res.json({ 
          message: "Receipt sent successfully",
          orderId: orderId,
          email: orderData.customerEmail
        });
      } else {
        res.status(500).json({ 
          message: "Failed to send receipt email",
          orderId: orderId
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Add order items
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.addOrderItem({
            orderId: order.id,
            artworkId: item.artworkId,
            quantity: item.quantity,
            price: item.price
          });
        }
      }
      
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/orders/:id/payment", async (req, res) => {
    try {
      const { paymentId, paymentMethod } = req.body;
      const orderId = parseInt(req.params.id);
      
      const order = await storage.updateOrderPayment(orderId, paymentId, paymentMethod);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
// Media Files routes (Admin only)
app.get("/api/media", authenticateAdmin, async (req, res) => {
  try {
    const files = await storage.getAllMediaFiles();
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/media", authenticateAdmin, async (req, res) => {
  try {
    const fileData = insertMediaFileSchema.parse(req.body);
    const file = await storage.createMediaFile(fileData);
    res.status(201).json(file);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/media/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fileData = insertMediaFileSchema.partial().parse(req.body);
    const file = await storage.updateMediaFile(id, fileData);
    res.json(file);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/media/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteMediaFile(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// User Account routes
app.get("/api/user-accounts", authenticateAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUserAccounts();
    // Remove password from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/user-accounts", async (req, res) => {
  try {
    const userData = insertUserAccountSchema.parse(req.body);
    
    // Check if email already exists
    const existingUser = await storage.getUserAccountByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await storage.createUserAccount({
      ...userData,
      password: hashedPassword
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/user-accounts/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userData = insertUserAccountSchema.partial().parse(req.body);
    
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const user = await storage.updateUserAccount(id, userData);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/user-accounts/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteUserAccount(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// User login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await storage.getUserAccountByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is disabled" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
  const httpServer = createServer(app);
  return httpServer;
}
