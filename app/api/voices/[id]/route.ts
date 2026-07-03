import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { voices } from "@/lib/schema";
import { deleteVoiceModel } from "@/lib/fish-audio";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const voiceId = Number(id);
    if (isNaN(voiceId)) {
      return NextResponse.json({ error: "无效的 id 参数" }, { status: 400 });
    }

    const db = getDb();
    const [record] = await db.select().from(voices).where(eq(voices.id, voiceId));
    if (!record) {
      return NextResponse.json({ error: "声音模型不存在" }, { status: 404 });
    }

    await db.delete(voices).where(eq(voices.id, voiceId));

    try {
      await deleteVoiceModel(record.fishModelId);
    } catch (err) {
      console.error("[DELETE /api/voices] Fish Audio 删除失败（忽略）:", err);
    }

    if (record.sampleAudioPath) {
      try {
        const { env } = getCloudflareContext();
        await env.R2.delete(record.sampleAudioPath);
      } catch (err) {
        console.error("[DELETE /api/voices] R2 删除失败（忽略）:", err);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/voices/[id]]:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
