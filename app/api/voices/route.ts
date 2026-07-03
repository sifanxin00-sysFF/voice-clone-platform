import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { voices } from "@/lib/schema";
import { createVoiceModel } from "@/lib/fish-audio";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const db = getDb();
    const allVoices = await db.select().from(voices).orderBy(desc(voices.createdAt));
    return NextResponse.json({ voices: allVoices });
  } catch (error) {
    console.error("[GET /api/voices]:", error);
    return NextResponse.json({ error: "查询声音模型失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const name = formData.get("name") as string | null;
    const description = (formData.get("description") as string | null) ?? undefined;

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json({ error: "缺少 audio 文件" }, { status: 400 });
    }
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "文件不能超过 50MB" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "缺少 name 字段" }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();

    const ext = audioFile.type.includes("wav")
      ? "wav"
      : audioFile.type.includes("mp4") || audioFile.type.includes("m4a")
      ? "m4a"
      : audioFile.type.includes("flac")
      ? "flac"
      : "mp3";
    const filename = `${Date.now()}_${randomUUID()}.${ext}`;
    const r2Key = `uploads/${filename}`;

    const { env } = getCloudflareContext();
    const mimeType = audioFile.type || "audio/mpeg";
    await env.R2.put(r2Key, audioBuffer, {
      httpMetadata: { contentType: mimeType },
    });

    let fishResult;
    try {
      fishResult = await createVoiceModel(audioBuffer, filename, name, description);
    } catch (err) {
      await env.R2.delete(r2Key).catch(() => {});
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Fish Audio 调用失败：${msg}` }, { status: 500 });
    }

    const db = getDb();
    const inserted = await db
      .insert(voices)
      .values({
        name,
        description: description ?? null,
        fishModelId: fishResult.id,
        sampleAudioPath: r2Key,
        state: fishResult.state ?? "created",
      })
      .returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error("[POST /api/voices]:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
