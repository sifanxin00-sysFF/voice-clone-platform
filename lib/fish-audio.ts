const BASE_URL = "https://api.fish.audio";

function getApiKey(): string {
  const key = process.env.FISH_AUDIO_API_KEY;
  if (!key) throw new Error("FISH_AUDIO_API_KEY is not set");
  return key;
}

async function checkResponse(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fish Audio API error ${res.status}: ${text}`);
  }
}

/**
 * 上传音频文件，创建声音克隆模型
 */
export async function createVoiceModel(
  audioBuffer: ArrayBuffer,
  filename: string,
  name: string,
  description?: string
): Promise<{ id: string; state: string }> {
  const mimeType = filename.toLowerCase().endsWith(".wav")
    ? "audio/wav"
    : filename.toLowerCase().endsWith(".flac")
    ? "audio/flac"
    : filename.toLowerCase().endsWith(".m4a")
    ? "audio/mp4"
    : "audio/mpeg";

  const formData = new FormData();
  formData.append("type", "tts");
  formData.append("title", name);
  formData.append("train_mode", "fast");
  formData.append("visibility", "private");
  if (description) formData.append("description", description);

  const blob = new Blob([audioBuffer], { type: mimeType });
  formData.append("voices", blob, filename);

  const res = await fetch(`${BASE_URL}/model`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getApiKey()}` },
    body: formData,
  });

  await checkResponse(res);
  const json = (await res.json()) as { _id: string; state: string };
  return { id: json._id, state: json.state };
}

/**
 * 查询声音模型状态
 */
export async function getVoiceModel(
  modelId: string
): Promise<{ id: string; state: string; title: string }> {
  const res = await fetch(`${BASE_URL}/model/${modelId}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  await checkResponse(res);
  const json = (await res.json()) as { _id: string; state: string; title: string };
  return { id: json._id, state: json.state, title: json.title };
}

/**
 * 删除声音模型
 */
export async function deleteVoiceModel(modelId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/model/${modelId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  await checkResponse(res);
}

/**
 * 文字转语音，返回 ArrayBuffer
 */
export async function generateSpeech(
  text: string,
  referenceId: string,
  options?: { format?: string; speed?: number; latency?: string }
): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE_URL}/v1/tts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      model: "s2-pro",
    },
    body: JSON.stringify({
      text,
      reference_id: referenceId,
      format: options?.format ?? "mp3",
      prosody: { speed: options?.speed ?? 1 },
      latency: options?.latency ?? "normal",
    }),
  });

  await checkResponse(res);
  return res.arrayBuffer();
}
