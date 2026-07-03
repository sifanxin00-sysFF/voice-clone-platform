import type { voices, ttsHistory } from "@/lib/schema";

export type VoiceRecord = typeof voices.$inferSelect;
export type TtsHistoryRecord = typeof ttsHistory.$inferSelect;
