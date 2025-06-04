import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required").min(3, "Username must be at least 3 characters long"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters long"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
