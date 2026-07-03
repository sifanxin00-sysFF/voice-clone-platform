"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Voice {
  id: number;
  name: string;
  fishModelId: string;
  description: string | null;
  state: string;
  sampleAudioPath: string | null;
  createdAt: string;
}

function StateBadge({ state }: { state: string }) {
  if (state === "trained") {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400">
        已训练
      </Badge>
    );
  }
  if (state === "training" || state === "created") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">
        训练中
      </Badge>
    );
  }
  if (state === "failed") {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400">
        失败
      </Badge>
    );
  }
  return <Badge variant="outline">{state}</Badge>;
}

const quickStartTips = [
  {
    color: "bg-blue-500",
    title: "准备清晰的音频",
    desc: "使用高质量录音设备，确保音频清晰无噪音",
  },
  {
    color: "bg-green-500",
    title: "控制音频时长",
    desc: "音频时长建议在 30-90 秒之间，内容丰富",
  },
  {
    color: "bg-purple-500",
    title: "选择合适内容",
    desc: "包含丰富的音素和语调变化",
  },
  {
    color: "bg-orange-500",
    title: "优化训练效果",
    desc: "保持稳定的语速和音量",
  },
];

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [helpMsg, setHelpMsg] = useState(false);
  const [videoMsg, setVideoMsg] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pollRefs = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());

  const fetchVoices = useCallback(async () => {
    try {
      const res = await fetch("/api/voices");
      if (!res.ok) throw new Error("获取声音列表失败");
      const data = await res.json() as { voices: Voice[] };
      setVoices(data.voices);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }, []);

  const startPolling = useCallback((id: number) => {
    if (pollRefs.current.has(id)) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/voices/${id}/status`);
        if (!res.ok) return;
        const data = await res.json() as { state: string; fishModelId: string };
        setVoices((prev) =>
          prev.map((v) => (v.id === id ? { ...v, state: data.state, fishModelId: data.fishModelId } : v))
        );
        if (data.state === "trained" || data.state === "failed") {
          clearInterval(pollRefs.current.get(id));
          pollRefs.current.delete(id);
        }
      } catch {
        // 忽略轮询错误
      }
    }, 3000);
    pollRefs.current.set(id, interval);
  }, []);

  useEffect(() => { fetchVoices(); }, [fetchVoices]);

  useEffect(() => {
    voices.forEach((v) => {
      if (v.state !== "trained" && v.state !== "failed") startPolling(v.id);
    });
  }, [voices, startPolling]);

  useEffect(() => {
    return () => { pollRefs.current.forEach((interval) => clearInterval(interval)); };
  }, []);

  const validateAndSetFile = (f: File) => {
    setError(null);
    const allowed = ["audio/mpeg", "audio/wav"];
    if (!allowed.includes(f.type) && !f.name.match(/\.(mp3|wav)$/i)) {
      setError("只支持 MP3、WAV 格式");
      return;
    }
    const url = URL.createObjectURL(f);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      if (audio.duration < 30 || audio.duration > 90) {
        setError(`音频时长须在 30～90 秒之间（当前 ${audio.duration.toFixed(1)} 秒）`);
        return;
      }
      setFile(f);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      setError("无法读取音频时长，请确认文件完整");
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;
    if (voices.some((v) => v.name === name.trim())) {
      setError("已存在同名声音，请换一个名称");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      const res = await fetch("/api/voices", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error || "上传失败");
      }
      setName("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchVoices();
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/voices/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("删除失败");
      const interval = pollRefs.current.get(id);
      if (interval) { clearInterval(interval); pollRefs.current.delete(id); }
      setVoices((prev) => prev.filter((v) => v.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <h1 className="text-2xl font-bold">语音克隆</h1>

      {/* 顶部两栏：创建新模型 + 快速开始 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 左：创建新模型 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-purple-500">✦</span> 创建新模型
            </CardTitle>
            <p className="text-sm text-muted-foreground">上传音频文件，创建专属的声音模型</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              {/* 模型名称 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">模型名称 <span className="text-destructive">*</span></label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="给你的声音模型起个名字"
                  required
                />
                <p className="text-xs text-muted-foreground">请输入一个易于识别的名称，用于区分不同的声音模型</p>
              </div>

              {/* 描述 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">描述（可选）</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简短描述声音特征"
                />
              </div>

              {/* 音频文件 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">音频文件</label>
                {file ? (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-4 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { setFile(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    >
                      删除
                    </Button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
                    )}
                  >
                    <svg className="h-8 w-8 text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="text-sm text-muted-foreground">拖拽音频文件到此处，或点击选择文件</p>
                    <p className="text-xs text-muted-foreground mt-1">MP3、WAV 格式 · 30-90秒 · 最大 50MB</p>
                    <p className="text-xs text-primary mt-1 cursor-pointer hover:underline">选中文件后将自动上传</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) validateAndSetFile(f);
                    e.target.value = "";
                  }}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                disabled={uploading || !file || !name.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    上传中，请稍候...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>✦</span> 开始创建模型
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 右：快速开始 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-green-500">⬡</span> 快速开始
            </CardTitle>
            <p className="text-sm text-muted-foreground">了解如何创建高质量的声音模型</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {quickStartTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={cn("mt-0.5 h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold", tip.color)}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => { setHelpMsg(true); setVideoMsg(false); }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                帮助文档
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => { setVideoMsg(true); setHelpMsg(false); }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                视频教程
              </Button>
            </div>
            {helpMsg && (
              <p className="text-sm text-destructive font-medium pt-1">很简单，不需要！</p>
            )}
            {videoMsg && (
              <p className="text-sm text-yellow-500 font-medium pt-1">真的很简单，不需要教程！</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 底部：我的声音模型 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-blue-500">🎙</span>
          <h2 className="text-lg font-semibold">我的声音模型</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">管理您创建的所有声音模型</p>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            加载中...
          </div>
        ) : voices.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 py-12 text-center">
            <p className="text-muted-foreground text-sm">暂无声音模型，请先上传音频创建模型</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {voices.map((voice) => (
              <Card key={voice.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{voice.name}</CardTitle>
                    <StateBadge state={voice.state} />
                  </div>
                  {voice.description && (
                    <p className="text-xs text-muted-foreground mt-1">{voice.description}</p>
                  )}
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(voice.createdAt).toLocaleString("zh-CN")}
                  </span>
                  {confirmDeleteId === voice.id ? (
                    <div className="flex gap-1.5">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(voice.id)}>
                        确认删除
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                        取消
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => { setError(null); setConfirmDeleteId(voice.id); }}
                    >
                      删除
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
