import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTurfSchema, insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // ===== Turf Routes =====
  
  // Get all turfs
  app.get("/api/turfs", async (req, res) => {
    try {
      const turfs = await storage.getTurfs();
      res.json(turfs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch turfs" });
    }
  });
  
  // Get single turf
  app.get("/api/turfs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const turf = await storage.getTurf(id);
      
      if (!turf) {
        return res.status(404).json({ message: "Turf not found" });
      }
      
      res.json(turf);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch turf" });
    }
  });
  
  // Create turf (protected route for turf owners)
  app.post("/api/turfs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Verify user is a turf owner
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Only turf owners can create turfs" });
    }
    
    try {
      // Validate request body
      try {
        insertTurfSchema.parse(req.body);
      } catch (error) {
        const validationError = fromZodError(error as ZodError);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Set owner ID to current user
      const turfData = { 
        ...req.body, 
        ownerId: req.user.id,
        // Ensure these required fields are present
        name: req.body.name,
        location: req.body.location,
        sportType: req.body.sportType,
        pricePerHour: req.body.pricePerHour,
        availableFrom: req.body.availableFrom,
        availableTo: req.body.availableTo
      };
      
      const turf = await storage.createTurf(turfData);
      res.status(201).json(turf);
    } catch (error) {
      res.status(500).json({ message: "Failed to create turf" });
    }
  });
  
  // Update turf (protected route for turf owners)
  app.put("/api/turfs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const turf = await storage.getTurf(id);
      
      if (!turf) {
        return res.status(404).json({ message: "Turf not found" });
      }
      
      // Check if user is the owner
      if (turf.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own turfs" });
      }
      
      const updatedTurf = await storage.updateTurf(id, req.body);
      res.json(updatedTurf);
    } catch (error) {
      res.status(500).json({ message: "Failed to update turf" });
    }
  });
  
  // Delete turf (protected route for turf owners)
  app.delete("/api/turfs/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const turf = await storage.getTurf(id);
      
      if (!turf) {
        return res.status(404).json({ message: "Turf not found" });
      }
      
      // Check if user is the owner
      if (turf.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You can only delete your own turfs" });
      }
      
      const success = await storage.deleteTurf(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete turf" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete turf" });
    }
  });
  
  // Get turfs by owner
  app.get("/api/users/:userId/turfs", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const turfs = await storage.getTurfsByOwner(userId);
      res.json(turfs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch turfs" });
    }
  });
  
  // ===== Booking Routes =====
  
  // Get all bookings for a turf
  app.get("/api/turfs/:turfId/bookings", async (req, res) => {
    try {
      const turfId = parseInt(req.params.turfId);
      const turf = await storage.getTurf(turfId);
      
      if (!turf) {
        return res.status(404).json({ message: "Turf not found" });
      }
      
      // If user is not authenticated or not owner, don't show user details
      const bookings = await storage.getBookingsByTurf(turfId);
      
      // If the user is not authenticated or not the owner of the turf
      if (!req.isAuthenticated() || req.user.id !== turf.ownerId) {
        const sanitizedBookings = bookings.map(booking => {
          const { userId, ...rest } = booking;
          return { ...rest, isBooked: true };
        });
        return res.json(sanitizedBookings);
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  // Get user's bookings (protected route)
  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const bookings = await storage.getBookingsByUser(req.user.id);
      
      // Fetch turf details for each booking
      const bookingsWithTurfs = await Promise.all(
        bookings.map(async (booking) => {
          const turf = await storage.getTurf(booking.turfId);
          return { ...booking, turf };
        })
      );
      
      res.json(bookingsWithTurfs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  // Create booking (protected route)
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Validate request body
      try {
        insertBookingSchema.parse(req.body);
      } catch (error) {
        const validationError = fromZodError(error as ZodError);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Check if turf exists
      const turf = await storage.getTurf(req.body.turfId);
      if (!turf) {
        return res.status(404).json({ message: "Turf not found" });
      }
      
      // Set user ID to current user
      const bookingData = { ...req.body, userId: req.user.id };
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  // Update booking status (protected route)
  app.patch("/api/bookings/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get turf to check ownership
      const turf = await storage.getTurf(booking.turfId);
      
      // Check if user is authorized (either the booking user or turf owner)
      const isBookingUser = booking.userId === req.user.id;
      const isTurfOwner = turf && turf.ownerId === req.user.id;
      
      if (!isBookingUser && !isTurfOwner) {
        return res.status(403).json({ message: "Unauthorized to update this booking" });
      }
      
      // Only turf owners can confirm bookings
      if (status === "confirmed" && !isTurfOwner) {
        return res.status(403).json({ message: "Only turf owners can confirm bookings" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(id, status);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });
  
  // ===== Review Routes =====
  
  // Get reviews for a turf
  app.get("/api/turfs/:turfId/reviews", async (req, res) => {
    try {
      const turfId = parseInt(req.params.turfId);
      const turf = await storage.getTurf(turfId);
      
      if (!turf) {
        return res.status(404).json({ message: "Turf not found" });
      }
      
      const reviews = await storage.getReviewsByTurf(turfId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  // Create review (protected route)
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Validate request body
      try {
        insertReviewSchema.parse(req.body);
      } catch (error) {
        const validationError = fromZodError(error as ZodError);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Check if turf exists
      const turf = await storage.getTurf(req.body.turfId);
      if (!turf) {
        return res.status(404).json({ message: "Turf not found" });
      }
      
      // Set user ID to current user
      const reviewData = { ...req.body, userId: req.user.id };
      
      // Check if user has already reviewed this turf
      const existingReviews = await storage.getReviewsByTurf(req.body.turfId);
      const hasReviewed = existingReviews.some(review => review.userId === req.user.id);
      
      if (hasReviewed) {
        return res.status(400).json({ message: "You have already reviewed this turf" });
      }
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
