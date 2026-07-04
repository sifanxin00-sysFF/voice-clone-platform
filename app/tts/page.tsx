"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Voice {
  id: number;
  name: string;
  fishModelId: string;
  description: string | null;
  state: string;
  sampleAudioPath: string | null;
  createdAt: string;
}

interface HistoryItem {
  id: number;
  text: string;
  voiceId: number | null;
  voiceName: string | null;
  outputUrl: string;
  format: string;
  createdAt: string;
}

export default function TtsPage() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voiceId, setVoiceId] = useState<string>("");
  const [text, setText] = useState("");
  const [format, setFormat] = useState<string>("mp3");
  const [speed, setSpeed] = useState<string>("1");
  const [generating, setGenerating] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const charCount = text.length;
  const charLimit = 500;

  useEffect(() => {
    fetch("/api/voices")
      .then((r) => r.json())
      .then((data: unknown) => {
        const trained = ((data as { voices: Voice[] }).voices).filter((v) => v.state === "trained");
        setVoices(trained);
      })
      .catch(() => setTtsError("获取声音列表失败"))
      .finally(() => setVoicesLoading(false));
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("获取历史记录失败");
      const data = await res.json() as { history: HistoryItem[] };
      setHistory(data.history);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleGenerate = async () => {
    if (generating || !voiceId || !text.trim()) return;
    setGenerating(true);
    setTtsError(null);
    setOutputUrl(null);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId: Number(voiceId),
          text: text.trim(),
          format,
          speed: Number(speed),
          latency: "normal",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error || "当前生成服务暂不可用，请稍后重试");
      }
      const data = await res.json() as { outputUrl: string };
      setOutputUrl(data.outputUrl);
      fetchHistory();
    } catch (e) {
      setTtsError(e instanceof Error ? e.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok && res.status !== 204) throw new Error("删除失败");
      if (playingId === id) setPlayingId(null);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      setHistoryError(null);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : "删除失败");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">文字转语音</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── 左：TTS 合成 ── */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-purple-400">
                <svg className="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </span>
              TTS 合成
            </CardTitle>
            <p className="text-sm text-muted-foreground">选择声音模型，输入文字，一键生成语音</p>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">选择声音</label>
              {voicesLoading ? (
                <p className="text-sm text-muted-foreground">加载声音列表...</p>
              ) : voices.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无已训练的声音，请先前往声音模型页面训练</p>
              ) : (
                <Select value={voiceId} onValueChange={(v) => setVoiceId(v ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择声音模型">
                      {voiceId ? (voices.find((v) => String(v.id) === voiceId)?.name ?? "选择声音模型") : "选择声音模型"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">输入文字</label>
                <span className={["text-xs", charCount > charLimit ? "text-destructive" : "text-muted-foreground"].join(" ")}>
                  {charCount} / {charLimit}
                </span>
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此输入要转换的文字..."
                className="min-h-36 resize-y"
                maxLength={charLimit}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">输出格式</label>
                <Select value={format} onValueChange={(v) => setFormat(v ?? "mp3")}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                    <SelectItem value="opus">OPUS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">语速</label>
                <Select value={speed} onValueChange={(v) => setSpeed(v ?? "1")}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x（很慢）</SelectItem>
                    <SelectItem value="0.75">0.75x（慢）</SelectItem>
                    <SelectItem value="1">1x（正常）</SelectItem>
                    <SelectItem value="1.25">1.25x（快）</SelectItem>
                    <SelectItem value="1.5">1.5x（很快）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ttsError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {ttsError}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={generating || !voiceId || !text.trim() || charCount > charLimit}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  生成中，请稍候...
                </span>
              ) : "生成语音"}
            </Button>

            {outputUrl && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">生成结果</p>
                <audio controls src={outputUrl} className="w-full" />
                <a href={outputUrl} download className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载音频
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── 右：历史记录 ── */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-blue-400">
                <svg className="h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              历史记录
            </CardTitle>
            <p className="text-sm text-muted-foreground">最近生成的语音记录</p>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            {historyError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive mb-3">
                {historyError}
              </div>
            )}
            {historyLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                加载中...
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="h-10 w-10 text-muted-foreground/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-muted-foreground">暂无历史记录</p>
                <p className="text-xs text-muted-foreground mt-1">生成语音后会自动出现在这里</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate" title={item.text}>
                          {item.text.length > 40 ? item.text.slice(0, 40) + "…" : item.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.voiceName ?? "—"} · {item.format.toUpperCase()} · {new Date(item.createdAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                          onClick={() => setPlayingId((prev) => prev === item.id ? null : item.id)}>
                          {playingId === item.id ? "收起" : "播放"}
                        </Button>
                        <a href={item.outputUrl} download>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">下载</Button>
                        </a>
                        <Button variant="destructive" size="sm" className="h-7 px-2 text-xs"
                          onClick={() => handleDelete(item.id)}>
                          删除
                        </Button>
                      </div>
                    </div>
                    {playingId === item.id && (
                      <audio controls src={item.outputUrl} className="w-full" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
