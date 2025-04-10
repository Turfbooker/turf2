import { db, pool } from "./db";
import { users, turfs, bookings, reviews } from "@shared/schema";
import type { User, InsertUser, Turf, InsertTurf, Booking, InsertBooking, Review, InsertReview } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createTurf(insertTurf: InsertTurf): Promise<Turf> {
    const [turf] = await db.insert(turfs).values(insertTurf).returning();
    return turf;
  }

  async getTurf(id: number): Promise<Turf | undefined> {
    const [turf] = await db.select().from(turfs).where(eq(turfs.id, id));
    return turf;
  }

  async getTurfs(): Promise<Turf[]> {
    return await db.select().from(turfs);
  }

  async getTurfsByOwner(ownerId: number): Promise<Turf[]> {
    return await db.select().from(turfs).where(eq(turfs.ownerId, ownerId));
  }

  async updateTurf(id: number, turfUpdate: Partial<InsertTurf>): Promise<Turf | undefined> {
    const [turf] = await db.update(turfs)
      .set(turfUpdate)
      .where(eq(turfs.id, id))
      .returning();
    return turf;
  }

  async deleteTurf(id: number): Promise<boolean> {
    const result = await db.delete(turfs).where(eq(turfs.id, id));
    return result.rowCount > 0;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByTurf(turfId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.turfId, turfId));
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async updateBookingStatus(id: number, status: "pending" | "confirmed" | "cancelled"): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getReviewsByTurf(turfId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.turfId, turfId));
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId));
  }
}

export const storage = new DatabaseStorage();