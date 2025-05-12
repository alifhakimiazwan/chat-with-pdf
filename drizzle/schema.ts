import { pgTable, serial, text, timestamp, varchar, foreignKey, integer, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const userSystemEnum = pgEnum("user_system_enum", ['system', 'user'])



export const chats = pgTable("chats", {
	id: serial().primaryKey().notNull(),
	pdfName: text("pdf_name").notNull(),
	pdfUrl: text("pdf_url").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	userId: varchar("user_id", { length: 256 }).notNull(),
	fileKey: text("file_key").notNull(),
});

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	chatId: integer("chat_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	role: userSystemEnum().notNull(),
},
(table) => {
	return {
		messagesChatIdChatsIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chats.id],
			name: "messages_chat_id_chats_id_fk"
		}).onDelete("cascade"),
	}
});
