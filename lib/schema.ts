import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// voices 表：存储克隆的声音模型
export const voices = sqliteTable("voices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  fishModelId: text("fish_model_id").notNull().unique(),
  description: text("description"),
  state: text("state").notNull().default("created"), // created/training/trained/failed
  sampleAudioPath: text("sample_audio_path"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// tts_history 表：存储生成记录
export const ttsHistory = sqliteTable("tts_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  voiceId: integer("voice_id").references(() => voices.id, {
    onDelete: "set null",
  }),
  voiceName: text("voice_name"), // 冗余存储，防止 voice 被删后丢失名称
  outputPath: text("output_path"),
  format: text("format").notNull().default("mp3"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Voice = typeof voices.$inferSelect;
export type NewVoice = typeof voices.$inferInsert;
export type TtsHistory = typeof ttsHistory.$inferSelect;
export type NewTtsHistory = typeof ttsHistory.$inferInsert;
