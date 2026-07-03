import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { voices, ttsHistory } from "@/lib/schema";
import { generateSpeech } from "@/lib/fish-audio";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const VALID_FORMATS = ["mp3", "wav", "opus"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { voiceId: number; text: string; format?: string; speed?: number; latency?: string };
    const { voiceId, text, format = "mp3", speed, latency } = body;

    if (!voiceId) return NextResponse.json({ error: "缺少 voiceId" }, { status: 400 });
    if (!text?.trim()) return NextResponse.json({ error: "text 不能为空" }, { status: 400 });
    if (text.length > 500) return NextResponse.json({ error: "text 不能超过 500 字符" }, { status: 400 });
    if (!VALID_FORMATS.includes(format)) return NextResponse.json({ error: "format 必须是 mp3、wav 或 opus" }, { status: 400 });

    const db = getDb();
    const [record] = await db.select().from(voices).where(eq(voices.id, voiceId));
    if (!record) return NextResponse.json({ error: "声音模型不存在" }, { status: 404 });
    if (record.state !== "trained") return NextResponse.json({ error: "声音模型尚未训练完成" }, { status: 400 });

    let audioBuffer: ArrayBuffer;
    try {
      audioBuffer = await generateSpeech(text, record.fishModelId, { format, speed, latency });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Fish Audio 生成失败：${msg}` }, { status: 500 });
    }

    const outputFilename = `${Date.now()}_${randomUUID()}.${format}`;
    const r2Key = `outputs/${outputFilename}`;
    const contentType = format === "mp3" ? "audio/mpeg" : format === "wav" ? "audio/wav" : "audio/ogg";

    const { env } = getCloudflareContext();
    await env.R2.put(r2Key, audioBuffer, { httpMetadata: { contentType } });

    const inserted = await db
      .insert(ttsHistory)
      .values({ voiceId: record.id, voiceName: record.name, text, format, outputPath: r2Key })
      .returning();

    return NextResponse.json(
      { outputUrl: `/api/audio/outputs/${outputFilename}`, id: inserted[0].id },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/tts]:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
