import { users, type User, type InsertUser, turfs, type Turf, type InsertTurf, bookings, type Booking, type InsertBooking, reviews, type Review, type InsertReview } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User-related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Turf-related methods
  createTurf(turf: InsertTurf): Promise<Turf>;
  getTurf(id: number): Promise<Turf | undefined>;
  getTurfs(): Promise<Turf[]>;
  getTurfsByOwner(ownerId: number): Promise<Turf[]>;
  updateTurf(id: number, turf: Partial<InsertTurf>): Promise<Turf | undefined>;
  deleteTurf(id: number): Promise<boolean>;
  
  // Booking-related methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByTurf(turfId: number): Promise<Booking[]>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: "pending" | "confirmed" | "cancelled"): Promise<Booking | undefined>;
  
  // Review-related methods
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByTurf(turfId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private turfs: Map<number, Turf>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  
  private userIdCounter: number;
  private turfIdCounter: number;
  private bookingIdCounter: number;
  private reviewIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.turfs = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.turfIdCounter = 1;
    this.bookingIdCounter = 1;
    this.reviewIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add some sample data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }
  
  // Turf methods
  async createTurf(insertTurf: InsertTurf): Promise<Turf> {
    const id = this.turfIdCounter++;
    const timestamp = new Date();
    const turf: Turf = { ...insertTurf, id, createdAt: timestamp };
    this.turfs.set(id, turf);
    return turf;
  }
  
  async getTurf(id: number): Promise<Turf | undefined> {
    return this.turfs.get(id);
  }
  
  async getTurfs(): Promise<Turf[]> {
    return Array.from(this.turfs.values());
  }
  
  async getTurfsByOwner(ownerId: number): Promise<Turf[]> {
    return Array.from(this.turfs.values()).filter(
      (turf) => turf.ownerId === ownerId
    );
  }
  
  async updateTurf(id: number, turfUpdate: Partial<InsertTurf>): Promise<Turf | undefined> {
    const turf = this.turfs.get(id);
    if (!turf) return undefined;
    
    const updatedTurf = { ...turf, ...turfUpdate };
    this.turfs.set(id, updatedTurf);
    return updatedTurf;
  }
  
  async deleteTurf(id: number): Promise<boolean> {
    return this.turfs.delete(id);
  }
  
  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const timestamp = new Date();
    const booking: Booking = { ...insertBooking, id, createdAt: timestamp };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByTurf(turfId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.turfId === turfId
    );
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }
  
  async updateBookingStatus(id: number, status: "pending" | "confirmed" | "cancelled"): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  // Review methods
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const timestamp = new Date();
    const review: Review = { ...insertReview, id, createdAt: timestamp };
    this.reviews.set(id, review);
    return review;
  }
  
  async getReviewsByTurf(turfId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.turfId === turfId
    );
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId
    );
  }
  
  // Helper method to seed some initial data
  private seedData() {
    // We'll leave this empty as per the guidelines to not generate mock data
    // The application will start with empty collections and get populated as users interact with it
  }
}

export const storage = new MemStorage();
