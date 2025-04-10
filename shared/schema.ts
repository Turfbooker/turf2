import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table with role
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  role: text("role", { enum: ["player", "owner"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Turfs table
export const turfs = pgTable("turfs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sportType: text("sport_type").notNull(),
  location: text("location").notNull(),
  price: integer("price").notNull(), // per hour price in cents
  imageUrl: text("image_url"),
  availableFrom: text("available_from").notNull(), // time as string (e.g., "06:00")
  availableTo: text("available_to").notNull(), // time as string (e.g., "23:00")
  ownerId: integer("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  turfId: integer("turf_id").notNull().references(() => turfs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(), // time as string (e.g., "14:00")
  endTime: text("end_time").notNull(), // time as string (e.g., "16:00") 
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  turfId: integer("turf_id").notNull().references(() => turfs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertTurfSchema = createInsertSchema(turfs).omit({
  id: true,
  createdAt: true
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  turfs: many(turfs),
  bookings: many(bookings),
  reviews: many(reviews)
}));

export const turfsRelations = relations(turfs, ({ one, many }) => ({
  owner: one(users, {
    fields: [turfs.ownerId],
    references: [users.id]
  }),
  bookings: many(bookings),
  reviews: many(reviews)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  turf: one(turfs, {
    fields: [bookings.turfId],
    references: [turfs.id]
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id]
  })
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  turf: one(turfs, {
    fields: [reviews.turfId],
    references: [turfs.id]
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  })
}));

// Types for the schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Turf = typeof turfs.$inferSelect;
export type InsertTurf = z.infer<typeof insertTurfSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
