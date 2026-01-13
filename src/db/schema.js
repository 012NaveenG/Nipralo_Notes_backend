import { relations } from 'drizzle-orm';
import { datetime, int, longtext, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const Users = mysqlTable('users', {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password:varchar({length:255}).notNull(),
  role:varchar({length:50}).notNull().default('viewer'),
  createdAt:timestamp().notNull().defaultNow(),
  updatedAt:timestamp().notNull().defaultNow()
});


export const Notes = mysqlTable('notes',{
  id:int().primaryKey().autoincrement(),
  title:text().notNull(),
  content:longtext().notNull(),
  createdBy:int().notNull(),
  createdAt:timestamp().notNull().defaultNow(),
  updatedAt:timestamp().notNull().defaultNow()
})

export const UsersRelations = relations(Users, ({ many }) => ({
  notes: many(Notes), // One user -> many Notes
}));

export const NotesRelations = relations(Notes, ({ one }) => ({
  users: one(Users, {
    fields: [Notes.createdBy],      // FK field in Notes
    references: [Users.id],      // PK in Users
  }),
}));