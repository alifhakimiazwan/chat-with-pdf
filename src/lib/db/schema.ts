import {
  integer,
  pgTable,
  serial,
  text,
  pgEnum,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const userSystemEnum = pgEnum("user_system_enum", ["system", "user"]);

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(),
});

export type DrizzleChat = typeof chats.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chats.id, { onDelete: "cascade" }) // Cascade delete
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: userSystemEnum("role").notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type DrizzleFlashcard = typeof flashcards.$inferSelect;

export const flashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
});

export const flashcardsSchema = z.array(flashcardSchema);

export const mcqs = pgTable("mcqs", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),

  question: text("question").notNull(),
  options: text("options").notNull(), // Store as JSON stringified array
  correctAnswer: text("correct_answer").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DrizzleMCQ = typeof mcqs.$inferSelect;

export const mcqSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

export const mcqsSchema = z.array(mcqSchema);
