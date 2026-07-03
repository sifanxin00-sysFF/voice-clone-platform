import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const CONTENT_TYPE_MAP: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  opus: "audio/ogg",
  ogg: "audio/ogg",
  aac: "audio/aac",
  flac: "audio/flac",
  m4a: "audio/mp4",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    if (!segments?.length) {
      return NextResponse.json({ error: "无效的文件路径" }, { status: 400 });
    }

    const r2Key = segments.join("/");

    if (!["uploads/", "outputs/"].some((p) => r2Key.startsWith(p))) {
      return NextResponse.json({ error: "禁止访问该路径" }, { status: 403 });
    }

    const { env } = getCloudflareContext();
    const obj = await env.R2.get(r2Key);

    if (!obj) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    const ext = r2Key.split(".").pop()?.toLowerCase() ?? "";
    const contentType =
      obj.httpMetadata?.contentType ??
      CONTENT_TYPE_MAP[ext] ??
      "application/octet-stream";

    return new NextResponse(await obj.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(obj.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[GET /api/audio]:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
