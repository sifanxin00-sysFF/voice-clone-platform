/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    R2: R2Bucket;
    FISH_AUDIO_API_KEY: string;
  }
}

export {};
