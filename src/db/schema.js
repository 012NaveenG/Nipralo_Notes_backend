import { relations } from "drizzle-orm";
import {
  datetime,
  int,
  longtext,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const Users = mysqlTable("users", {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 50 }).notNull().default("viewer"),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().onUpdateNow(),
});

export const Notes = mysqlTable("notes", {
  id: int().primaryKey().autoincrement(),
  title: text().notNull(),
  content: longtext().notNull(),
  createdBy: int()
    .notNull()
    .references(() => Users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().onUpdateNow(),
});

export const ActivityLogs = mysqlTable("activity_logs", {
  id: int().primaryKey().autoincrement(),
  type: varchar({ length: 100 }).notNull(),
  user: varchar({ length: 100 }).notNull().default("viewer"),
  user_id: int(),
  log: text().notNull(),
  ip_adress: varchar({ length: 50 }).notNull(),
  user_agent: varchar({ length: 50 }).notNull(),
  created_at: timestamp().notNull().defaultNow(),
});

export const UsersRelations = relations(Users, ({ many }) => ({
  notes: many(Notes), // One user -> many Notes
  activity_logs: many(ActivityLogs),
}));

export const NotesRelations = relations(Notes, ({ one }) => ({
  users: one(Users, {
    fields: [Notes.createdBy], // FK field in Notes
    references: [Users.id], // PK in Users
  }),
}));
export const ActivityLogsRelations = relations(ActivityLogs, ({ one }) => ({
  users: one(Users, {
    fields: [ActivityLogs.user_id], // FK field in ActivityLogs
    references: [Users.id], // PK in Users
  }),
}));
