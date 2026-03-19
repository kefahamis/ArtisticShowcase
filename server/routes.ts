import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertArtistSchema, insertArtworkSchema, insertExhibitionSchema, 
  insertOrderSchema, insertOrderItemSchema, insertNewsletterSubscriberSchema,
  insertBlogPostSchema, insertUserSchema, insertMediaFileSchema,
  insertUserAccountSchema
} from "@shared/schema";
import jwt from "jsonwebtoken";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { sendOrderReceipt, sendContactFormEmail, sendAppointmentEmail } from "./email";
import { sendArtistRegistrationApprovalRequest, sendArtistApprovalNotification,sendArtistRegistrationConfirmation } from "./admin-approval-email";
import { sendPasswordResetEmail } from "./password-reset-email";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "gallery-secret-key-2024";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gallery2024";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and documents
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype.includes('document') ||
        file.mimetype.includes('text/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

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

  // Artist authentication middleware
  const authenticateArtist = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(403).json({ message: "Invalid token" });
      }

      const artist = await storage.getArtistByUserId(user.id);
      if (!artist) {
        return res.status(403).json({ message: "Artist profile not found" });
      }

      req.user = user;
      req.artist = artist;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  };

  // Artist registration and authentication routes
  app.post("/api/artists/register", async (req, res) => {
    try {
      const { user: userData, artist: artistData } = req.body;

      // Validate input data
      const validatedUserData = insertUserSchema.parse(userData);
      const validatedArtistData = insertArtistSchema.omit({ userId: true }).parse(artistData);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedUserData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedUserData.password, 10);
      const userDataWithHashedPassword = {
        ...validatedUserData,
        password: hashedPassword
      };

      // Register artist with user account (starts as unapproved)
      const { user, artist } = await storage.registerArtist(userDataWithHashedPassword, validatedArtistData);

      // Send admin approval request email
      await sendArtistRegistrationApprovalRequest({
        artistName: artist.name,
        artistEmail: user.email,
        artistBio: artist.bio,
        artistSpecialty: artist.specialty,
        registrationDate: new Date().toLocaleDateString(),
        artistId: artist.id
      });

      await sendArtistRegistrationConfirmation({
        artistName: artist.name,
        artistEmail: user.email,
        registrationDate: new Date().toLocaleDateString(),
        artistId: artist.id,
        artistBio: artist.bio,
        artistSpecialty: artist.specialty
      });

      res.status(201).json({ 
        message: "Artist registration submitted successfully. Your account is pending admin approval. You will receive an email once approved.",
        user: { id: user.id, email: user.email, username: user.username },
        artist: { id: artist.id, name: artist.name, bio: artist.bio, specialty: artist.specialty, approved: artist.approved }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/artists/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const result = await storage.loginArtist(email, password);

      if (!result) {
        return res.status(401).json({ message: "Invalid credentials or artist account not found" });
      }

      const { user, artist } = result;
      const token = jwt.sign({ userId: user.id, artistId: artist.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ 
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, username: user.username },
        artist: { id: artist.id, name: artist.name, bio: artist.bio, specialty: artist.specialty, approved: artist.approved }
      });
    } catch (error: any) {
      if (error.message === 'ACCOUNT_PENDING_APPROVAL') {
        return res.status(403).json({ 
          message: "Your account is pending admin approval. You will receive an email once your account is approved and you can log in.",
          code: "ACCOUNT_PENDING_APPROVAL"
        });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Artist login route (singular - used by frontend)
  app.post("/api/artist/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const result = await storage.loginArtist(email, password);

      if (!result) {
        return res.status(401).json({ message: "Invalid credentials or artist account not found" });
      }

      const { user, artist } = result;
      const token = jwt.sign({ userId: user.id, artistId: artist.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ 
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, username: user.username },
        artist: { id: artist.id, name: artist.name, bio: artist.bio, specialty: artist.specialty, approved: artist.approved }
      });
    } catch (error: any) {
      if (error.message === 'ACCOUNT_PENDING_APPROVAL') {
        return res.status(403).json({ 
          message: "Your account is pending admin approval. You will receive an email once your account is approved and you can log in.",
          code: "ACCOUNT_PENDING_APPROVAL"
        });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Password reset request route
  app.post("/api/artist/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If an account with this email exists, a password reset link has been sent." });
      }

      // Check if user has an artist account
      const artist = await storage.getArtistByUserId(user.id);
      if (!artist) {
        return res.json({ message: "If an account with this email exists, a password reset link has been sent." });
      }

      // Check if artist is approved
      if (!artist.approved) {
        return res.status(400).json({ message: "Your account is pending admin approval. Password reset is not available." });
      }

      // Clean expired tokens before creating new one
      await storage.cleanExpiredPasswordResetTokens();

      // Create reset token
      const { token, expiresAt } = await storage.createPasswordResetToken(user.id);

      // Send password reset email
      const emailSent = await sendPasswordResetEmail({
        artistName: artist.name,
        artistEmail: user.email,
        resetToken: token,
        expiresAt: expiresAt.toLocaleString()
      });

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send password reset email. Please try again later." });
      }

      res.json({ message: "If an account with this email exists, a password reset link has been sent." });
    } catch (error: any) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "An error occurred. Please try again later." });
    }
  });

  // Password reset confirmation route
  app.post("/api/artist/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Verify and use the reset token
      const success = await storage.usePasswordResetToken(token, newPassword);

      if (!success) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      res.json({ message: "Password has been reset successfully. You can now log in with your new password." });
    } catch (error: any) {
      console.error("Password reset confirmation error:", error);
      res.status(500).json({ message: "An error occurred. Please try again later." });
    }
  });

  // Verify reset token route (to check if token is valid before showing reset form)
  app.get("/api/artist/verify-reset-token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      console.log(`Verifying reset token: ${token} (length: ${token?.length})`);

      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        console.log(`No valid reset token found for: ${token}`);
        return res.status(400).json({ message: "Invalid or expired reset token", valid: false });
      }

      console.log(`Valid reset token found for: ${token}`);
      res.json({ message: "Token is valid", valid: true });
    } catch (error: any) {
      console.error("Token verification error:", error);
      res.status(500).json({ message: "An error occurred", valid: false });
    }
  });

  // Artist-specific routes that frontend expects
  app.get("/api/artist/artworks", authenticateArtist, async (req: any, res) => {
    try {
      const artistId = req.artist.id;
      const artworks = await storage.getArtworksByArtist(artistId);
      res.json(artworks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/artist/orders", authenticateArtist, async (req: any, res) => {
    try {
      const artistId = req.artist.id;
      const orders = await storage.getOrdersByArtist(artistId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Artist profile routes
  app.get("/api/artists/profile", authenticateArtist, async (req: any, res) => {
    try {
      res.json({
        user: { 
          id: req.user.id, 
          email: req.user.email, 
          username: req.user.username,
          phone: req.user.phone
        },
        artist: req.artist
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/artists/profile", authenticateArtist, async (req: any, res) => {
    try {
      const { phone, ...artistData } = req.body;
      
      // Update artist information
      const artistUpdateData = insertArtistSchema.partial().parse(artistData);
      const updatedArtist = await storage.updateArtist(req.artist.id, artistUpdateData);
      
      // Update user phone if provided
      if (phone !== undefined) {
        const userUpdateData = insertUserSchema.partial().parse({ phone });
        await storage.updateUser(req.user.id, userUpdateData);
      }
      
      // Return updated data
      const updatedUser = await storage.getUser(req.user.id);
      res.json({
        artist: updatedArtist,
        user: { 
          id: updatedUser?.id, 
          email: updatedUser?.email, 
          username: updatedUser?.username,
          phone: updatedUser?.phone
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Artist artwork management routes
  app.get("/api/artists/artworks", authenticateArtist, async (req: any, res) => {
    try {
      const artworks = await storage.getArtworksByArtistUser(req.user.id);
      res.json(artworks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Artist orders route - get orders containing this artist's artworks
  app.get("/api/artists/orders", authenticateArtist, async (req: any, res) => {
    try {
      const orders = await storage.getOrdersByArtist(req.artist.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/artists/artworks", authenticateArtist, async (req: any, res) => {
    try {
      const artworkData = insertArtworkSchema.parse({
        ...req.body,
        artistId: req.artist.id
      });
      const artwork = await storage.createArtwork(artworkData);
      res.status(201).json(artwork);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/artists/artworks/:id", authenticateArtist, async (req: any, res) => {
    try {
      const artworkId = parseInt(req.params.id);

      // Verify ownership
      const existingArtwork = await storage.getArtwork(artworkId);
      if (!existingArtwork || existingArtwork.artistId !== req.artist.id) {
        return res.status(404).json({ message: "Artwork not found or access denied" });
      }

      const updateData = insertArtworkSchema.partial().parse(req.body);
      const updatedArtwork = await storage.updateArtwork(artworkId, updateData);
      res.json(updatedArtwork);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/artists/artworks/:id", authenticateArtist, async (req: any, res) => {
    try {
      const artworkId = parseInt(req.params.id);

      // Verify ownership
      const existingArtwork = await storage.getArtwork(artworkId);
      if (!existingArtwork || existingArtwork.artistId !== req.artist.id) {
        return res.status(404).json({ message: "Artwork not found or access denied" });
      }

      await storage.deleteArtwork(artworkId);
      res.json({ message: "Artwork deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Artist orders route - get orders containing this artist's artworks
  app.get("/api/artists/orders", authenticateArtist, async (req: any, res) => {
    try {
      const orders = await storage.getOrdersByArtist(req.artist.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Artist notification preferences routes
  app.get("/api/artist/notifications", authenticateArtist, async (req: any, res) => {
    try {
      const preferences = await storage.getArtistNotificationPreferences(req.artist.id);
      // Ensure dates are properly serialized
      if (preferences) {
        const serializedPreferences = {
          ...preferences,
          createdAt: preferences.createdAt?.toISOString(),
          updatedAt: preferences.updatedAt?.toISOString()
        };
        res.json(serializedPreferences);
      } else {
        res.json(null);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/artist/notifications", authenticateArtist, async (req: any, res) => {
    try {
      const preferences = await storage.updateArtistNotificationPreferences(req.artist.id, req.body);
      // Ensure dates are properly serialized
      const serializedPreferences = {
        ...preferences,
        createdAt: preferences.createdAt?.toISOString(),
        updatedAt: preferences.updatedAt?.toISOString()
      };
      res.json(serializedPreferences);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Artist profile routes for settings
  app.get("/api/artist/profile", authenticateArtist, async (req: any, res) => {
    try {
      res.json(req.artist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/artist/profile", authenticateArtist, async (req: any, res) => {
    try {
      const updatedArtist = await storage.updateArtist(req.artist.id, req.body);
      res.json(updatedArtist);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Artist password change route
  app.post("/api/artist/change-password", authenticateArtist, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      const result = await storage.changeArtistPassword(req.user.id, currentPassword, newPassword);
      
      if (!result) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 2FA Routes
  app.post("/api/artist/2fa/setup", authenticateArtist, async (req: any, res) => {
    try {
      const secret = await storage.setup2FA(req.user.id);
      res.json({ secret });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/artist/2fa/verify", authenticateArtist, async (req: any, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const result = await storage.verify2FA(req.user.id, token);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid token" });
      }

      res.json({ message: "2FA enabled successfully", backupCodes: result.backupCodes });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/artist/2fa/disable", authenticateArtist, async (req: any, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const result = await storage.disable2FA(req.user.id, password);
      
      if (!result) {
        return res.status(400).json({ message: "Invalid password" });
      }

      res.json({ message: "2FA disabled successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/artist/2fa/status", authenticateArtist, async (req: any, res) => {
    try {
      const status = await storage.get2FAStatus(req.user.id);
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Artist account closure route
  app.post("/api/artist/close-account", authenticateArtist, async (req: any, res) => {
    try {
      const { reason, confirmEmail, password } = req.body;
      
      if (!reason || !confirmEmail || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (confirmEmail !== req.user.email) {
        return res.status(400).json({ message: "Email confirmation doesn't match" });
      }

      const result = await storage.closeArtistAccount(req.user.id, password, reason);
      
      if (!result) {
        return res.status(400).json({ message: "Password is incorrect" });
      }

      res.json({ message: "Account closed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Artist media upload routes - only return files uploaded by this artist
  app.get("/api/artists/media", authenticateArtist, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const mediaFiles = await storage.getArtistMediaFiles(req.artist.id, limit, offset);
      res.json(mediaFiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/artists/media", authenticateArtist, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { description, tags } = req.body;

      const mediaData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        description: description || `Uploaded by ${req.artist.name}`,
        tags: tags ? JSON.parse(tags) : null,
        uploadedBy: 'artist',
        artistId: req.artist.id
      };

      const mediaFile = await storage.createMediaFile(mediaData);
      res.status(201).json(mediaFile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete artist media file
  app.delete("/api/artists/media/:id", authenticateArtist, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      
      // First check if the file exists and belongs to this artist
      const file = await storage.getMediaFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Artists can only delete their own files
      if (file.artistId !== req.artist.id) {
        return res.status(403).json({ message: "You can only delete your own files" });
      }
      
      await storage.deleteMediaFile(fileId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });



  app.get("/api/artist/2fa/status", authenticateArtist, async (req: any, res) => {
    try {
      const status = await storage.get2FAStatus(req.user.id);
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/artist/2fa/setup", authenticateArtist, async (req: any, res) => {
    try {
      const result = await storage.setup2FA(req.user.id);
      res.json({ secret: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/artist/2fa/verify", authenticateArtist, async (req: any, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const result = await storage.verify2FA(req.user.id, token);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid token" });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/artist/2fa/disable", authenticateArtist, async (req: any, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const result = await storage.disable2FA(req.user.id, password);
      
      if (!result) {
        return res.status(400).json({ message: "Invalid password" });
      }

      res.json({ message: "2FA disabled successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
      const query = req.query.q as string;
      if (!query || query.trim() === '') {
        return res.status(400).json({ message: "Search query required" });
      }

      // Search across different entities
      const artworks = await storage.searchArtworks(query.trim());
      // const artists = await storage.searchArtists ? await storage.searchArtists(query.trim()) : [];
      // const exhibitions = await storage.searchExhibitions ? await storage.searchExhibitions(query.trim()) : [];

      res.json({ 
        artworks: artworks || [], 
        // artists: artists || [], 
        // exhibitions: exhibitions || [] 
      });
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

  // Get artist by slug (both routes for compatibility)
  app.get("/api/artists/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        return res.status(400).json({ message: "Invalid slug parameter" });
      }

      const artist = await storage.getArtistBySlug(slug.trim());
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      res.json(artist);
    } catch (error: any) {
      console.error("Error fetching artist by slug:", error);
      res.status(500).json({ message: "Failed to fetch artist" });
    }
  });

  app.get("/api/artists/by-slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        return res.status(400).json({ message: "Invalid slug parameter" });
      }

      const artist = await storage.getArtistBySlug(slug.trim());
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      res.json(artist);
    } catch (error: any) {
      console.error("Error fetching artist by slug:", error);
      res.status(500).json({ message: "Failed to fetch artist" });
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

  // Get exhibition by slug
  app.get("/api/exhibitions/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        return res.status(400).json({ message: "Invalid slug parameter" });
      }

      const exhibition = await storage.getExhibitionBySlug(slug.trim());
      if (!exhibition) {
        return res.status(404).json({ message: "Exhibition not found" });
      }
      res.json(exhibition);
    } catch (error: any) {
      console.error("Error fetching exhibition by slug:", error);
      res.status(500).json({ message: "Failed to fetch exhibition" });
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

  // Protected admin routes for exhibitions
  app.post("/api/exhibitions", authenticateAdmin, async (req, res) => {
    try {
      console.log('Creating exhibition - request body:', req.body);
      
      // Convert string dates to Date objects
      const processedData = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      };
      
      console.log('Processed data with dates:', processedData);
      
      const exhibitionData = insertExhibitionSchema.parse(processedData);
      console.log('Validated exhibition data:', exhibitionData);
      
      const exhibition = await storage.createExhibition(exhibitionData);
      console.log('Created exhibition:', exhibition);
      
      res.status(201).json(exhibition);
    } catch (error: any) {
      console.error('Exhibition creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/exhibitions/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Convert string dates to Date objects if present
      const processedData = {
        ...req.body,
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
        ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
      };
      const exhibitionData = insertExhibitionSchema.partial().parse(processedData);
      const exhibition = await storage.updateExhibition(id, exhibitionData);
      res.json(exhibition);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/exhibitions/:id", authenticateAdmin, async (req, res) => {
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
        total: validatedData.totalAmount.toString(),
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
      const order = await storage.updateOrderStatus(id, "paid");

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

  // PayPal API routes for frontend
  app.get("/api/paypal/client-token", async (req, res) => {
    try {
      const { getClientToken } = await import("./paypal");
      const clientToken = await getClientToken();
      res.json({ client_token: clientToken });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/paypal/create-order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/capture-order", async (req, res) => {
    await capturePaypalOrder(req, res);
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

      const validStatuses = ['pending', 'completed', 'processing', 'shipped', 'delivered', 'cancelled'];
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
      // Calculate total amount from items
      let totalAmount = 0;
      if (req.body.items && Array.isArray(req.body.items)) {
        totalAmount = req.body.items.reduce((sum: number, item: any) => {
          return sum + (parseFloat(item.price) * (item.quantity || 1));
        }, 0);
      }

      const orderData = {
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        customerPhone: req.body.customerPhone,
        customerAddress: { address: req.body.shippingAddress, notes: req.body.shippingNotes || '' },
        totalAmount: totalAmount.toString(),
        total: totalAmount.toString(),
        status: "pending"
      };

      const order = await storage.createOrder(orderData);

      // Add order items
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.addOrderItem({
            orderId: order.id,
            artworkId: item.artworkId,
            quantity: item.quantity || 1,
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

  // Contact Form route
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required" });
      }

      const contactData = {
        name,
        email,
        phone: phone || '',
        subject: subject || 'General Inquiry',
        message,
        submittedAt: new Date().toLocaleString()
      };

      const emailSent = await sendContactFormEmail(contactData);

      if (emailSent) {
        res.json({ 
          message: "Contact form submitted successfully. We'll get back to you within 24 hours.",
          success: true
        });
      } else {
        res.status(500).json({ 
          message: "There was an issue sending your message. Please try again later.",
          success: false
        });
      }
    } catch (error: any) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  });

  // Appointment booking route
  app.post("/api/appointments", async (req, res) => {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        appointmentType, 
        preferredDate, 
        preferredTime, 
        message 
      } = req.body;

      if (!firstName || !lastName || !email || !appointmentType || !preferredDate || !preferredTime) {
        return res.status(400).json({ 
          message: "First name, last name, email, appointment type, preferred date, and time are required" 
        });
      }

      const appointmentData = {
        firstName,
        lastName,
        email,
        phone: phone || '',
        appointmentType,
        preferredDate,
        preferredTime,
        message: message || '',
        submittedAt: new Date().toLocaleString()
      };

      const emailSent = await sendAppointmentEmail(appointmentData);

      if (emailSent) {
        res.json({ 
          message: "Appointment request submitted successfully. We'll contact you within 24 hours to confirm.",
          success: true
        });
      } else {
        res.status(500).json({ 
          message: "There was an issue submitting your appointment request. Please try again later.",
          success: false
        });
      }
    } catch (error: any) {
      console.error("Appointment booking error:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
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

      // Update last login time
      await storage.updateUserAccount(user.id, { lastLoginAt: new Date() });

      // Log user activity
      await storage.createUserActivityLog({
        userId: user.id,
        action: "login",
        description: "User logged in",
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

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

  // Dashboard metrics endpoint
  app.get("/api/admin/dashboard/metrics", authenticateAdmin, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Recent activity endpoint
  app.get("/api/admin/dashboard/activity", authenticateAdmin, async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== MEDIA MANAGEMENT ROUTES =====

  // Get all media files
  app.get("/api/media", authenticateAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const mediaFiles = await storage.getAllMediaFiles(limit, offset);
      res.json(mediaFiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single media file
  app.get("/api/media/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mediaFile = await storage.getMediaFile(id);
      if (!mediaFile) {
        return res.status(404).json({ message: "Media file not found" });
      }
      res.json(mediaFile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload media file
  app.post("/api/media", authenticateAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const mediaFile = await storage.createMediaFile({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        description: req.body.description || null,
        tags: req.body.tags ? JSON.parse(req.body.tags) : null,
        uploadedBy: 'admin',
        artistId: null
      });

      res.status(201).json(mediaFile);
    } catch (error: any) {
      // Clean up uploaded file if database operation fails
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update media file
  app.put("/api/media/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedFile = await storage.updateMediaFile(id, req.body);
      res.json(updatedFile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete media file
  app.delete("/api/media/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mediaFile = await storage.getMediaFile(id);

      if (!mediaFile) {
        return res.status(404).json({ message: "Media file not found" });
      }

      // Delete file from filesystem
      const filePath = path.join(uploadsDir, path.basename(mediaFile.url));
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }

      await storage.deleteMediaFile(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // User activity logs endpoint
  app.get("/api/admin/users/:id/activity", authenticateAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const logs = await storage.getUserActivityLogs(userId);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk user actions endpoint
  app.post("/api/admin/users/bulk", authenticateAdmin, async (req, res) => {
    try {
      const { action, userIds } = req.body;

      if (!action || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ message: "Action and userIds are required" });
      }

      const results = [];
      for (const userId of userIds) {
        try {
          switch (action) {
            case "activate":
              await storage.updateUserAccount(userId, { isActive: true });
              results.push({ userId, success: true });
              break;
            case "deactivate":
              await storage.updateUserAccount(userId, { isActive: false });
              results.push({ userId, success: true });
              break;
            case "delete":
              await storage.deleteUserAccount(userId);
              results.push({ userId, success: true });
              break;
            default:
              results.push({ userId, success: false, error: "Unknown action" });
          }
        } catch (error: any) {
          results.push({ userId, success: false, error: error.message });
        }
      }

      res.json({ results });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes for frontend dashboard
  app.get("/api/admin/artists", authenticateAdmin, async (req, res) => {
    try {
      const artists = await storage.getAllArtists();
      res.json(artists);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/artworks", authenticateAdmin, async (req, res) => {
    try {
      const artworks = await storage.getAllArtworks();
      res.json(artworks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/orders", authenticateAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUserAccounts();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/media", authenticateAdmin, async (req, res) => {
    try {
      const mediaFiles = await storage.getAllMediaFiles();
      res.json(mediaFiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Artist Approval Management Routes
  app.get("/api/admin/artists/pending", authenticateAdmin, async (req, res) => {
    try {
      const pendingArtists = await storage.getPendingArtists();
      res.json(pendingArtists);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });



  // Approve artist
  app.post("/api/admin/artists/:id/approve", authenticateAdmin, async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const artist = await storage.approveArtist(artistId);
      
      // Get user email for notification
      if (artist.userId) {
        const user = await storage.getUser(artist.userId);
        if (user) {
          await sendArtistApprovalNotification(user.email, artist.name, true);
        }
      }
      
      res.json({ 
        message: "Artist approved successfully",
        artist: artist
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reject artist
  app.post("/api/admin/artists/:id/reject", authenticateAdmin, async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      
      // Get artist and user info before deletion
      const artist = await storage.getArtist(artistId);
      let userEmail = '';
      let artistName = '';
      
      if (artist && artist.userId) {
        const user = await storage.getUser(artist.userId);
        if (user) {
          userEmail = user.email;
          artistName = artist.name;
        }
      }
      
      await storage.rejectArtist(artistId);
      
      // Send rejection notification
      if (userEmail && artistName) {
        await sendArtistApprovalNotification(userEmail, artistName, false);
      }
      
      res.json({ message: "Artist registration rejected and account removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Favorites routes
  app.post("/api/favorites", async (req, res) => {
    try {
      const { userEmail, artworkId } = req.body;
      if (!userEmail || !artworkId) {
        return res.status(400).json({ message: "User email and artwork ID are required" });
      }
      await storage.addToFavorites(userEmail, artworkId);
      res.status(200).json({ message: "Added to favorites" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/favorites", async (req, res) => {
    try {
      const { userEmail, artworkId } = req.body;
      if (!userEmail || !artworkId) {
        return res.status(400).json({ message: "User email and artwork ID are required" });
      }
      await storage.removeFromFavorites(userEmail, artworkId);
      res.status(200).json({ message: "Removed from favorites" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/favorites/:userEmail", async (req, res) => {
    try {
      const userEmail = decodeURIComponent(req.params.userEmail);
      const favorites = await storage.getUserFavorites(userEmail);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/favorites/:userEmail/:artworkId", async (req, res) => {
    try {
      const userEmail = decodeURIComponent(req.params.userEmail);
      const artworkId = parseInt(req.params.artworkId);
      const isFavorite = await storage.isArtworkInFavorites(userEmail, artworkId);
      res.json({ isFavorite });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}