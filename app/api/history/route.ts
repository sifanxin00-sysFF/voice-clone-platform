import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ttsHistory } from "@/lib/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const records = await db
      .select()
      .from(ttsHistory)
      .orderBy(desc(ttsHistory.createdAt))
      .limit(50);

    const history = records.map((record) => ({
      ...record,
      outputUrl: record.outputPath ? `/api/audio/${record.outputPath}` : null,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[GET /api/history]:", error);
    return NextResponse.json({ error: "查询历史记录失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body as { id: number };
    if (!id) return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 });

    const db = getDb();
    const [record] = await db.select().from(ttsHistory).where(eq(ttsHistory.id, id));
    if (!record) return NextResponse.json({ error: "历史记录不存在" }, { status: 404 });

    await db.delete(ttsHistory).where(eq(ttsHistory.id, id));

    if (record.outputPath) {
      try {
        const { env } = getCloudflareContext();
        await env.R2.delete(record.outputPath);
      } catch (err) {
        console.error("[DELETE /api/history] R2 删除失败（忽略）:", err);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/history]:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
