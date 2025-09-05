// src/lib/db/schema.ts

import {
  pgTable,
  text,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

// Renamed from 'chatsSchema' to 'chats' to match your API route's import.
// Removed the redundant uniqueIndex.
export const chats = pgTable(
  'chats',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  }
);

// Renamed from 'messagesSchema' to 'messages'.
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  // Updated the reference to point to the renamed 'chats' variable.
  chatId: integer('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  role: text('role', { enum: ['user', 'assistant'] })
    .notNull()
    .default('assistant'),
});