import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { voices } from "@/lib/schema";
import { getVoiceModel } from "@/lib/fish-audio";
import { eq } from "drizzle-orm";

export async function GET(
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

    let fishModel;
    try {
      fishModel = await getVoiceModel(record.fishModelId);
    } catch (err) {
      console.error("[GET /api/voices/[id]/status] Fish Audio 查询失败:", err);
      return NextResponse.json({ error: "查询状态失败，请稍后重试" }, { status: 500 });
    }

    if (fishModel.state && fishModel.state !== record.state) {
      await db.update(voices).set({ state: fishModel.state }).where(eq(voices.id, voiceId));
    }

    return NextResponse.json({
      id: record.id,
      state: fishModel.state ?? record.state,
      fishModelId: record.fishModelId,
    });
  } catch (error) {
    console.error("[GET /api/voices/[id]/status]:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
