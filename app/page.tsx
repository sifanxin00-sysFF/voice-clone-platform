"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>

        {/* ── Hero ── */}
        <section
          className="animate-fade-up delay-1"
          style={{ textAlign: "center", paddingTop: "80px", paddingBottom: "80px" }}
        >
          {/* 徽章 */}
          <div
            className="animate-fade-up delay-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(30,33,56,0.8)",
              border: "1px solid rgba(108,111,238,0.25)",
              fontSize: "12px",
              fontWeight: 500,
              color: "#a5b4fc",
              marginBottom: "40px",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            AI 声音克隆平台
          </div>

          {/* 主标题 */}
          <h1
            className="animate-fade-up delay-2"
            style={{
              fontSize: "clamp(52px, 7vw, 80px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "0",
            }}
          >
            <span style={{ color: "#ffffff", display: "block" }}>克隆任意声音</span>
            <span className="text-gradient-purple" style={{ display: "block" }}>生成自然语音</span>
          </h1>

          {/* 副标题 */}
          <p
            className="animate-fade-up delay-3"
            style={{
              fontSize: "15px",
              color: "#c7d2fe",
              margin: "24px auto 0",
              textAlign: "center",
            }}
          >
            一键克隆你的声音做有声书
          </p>
        </section>

        {/* ── 两张大功能卡 ── */}
        <div
          className="animate-fade-up delay-4"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* 声音管理 */}
          <Link href="/voices" style={{ textDecoration: "none" }}>
            <div className="feature-card">
              <div className="icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "10px" }}>
                声音管理
              </h3>
              <p style={{ fontSize: "13px", color: "#c7d2fe", lineHeight: 1.7, marginBottom: "20px" }}>
                上传参考音频，创建并训练专属声音模型。支持 MP3 / WAV 格式，30～90 秒。
              </p>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#818cf8" }}>
                开始创建 →
              </span>
            </div>
          </Link>

          {/* TTS 合成 */}
          <Link href="/tts" style={{ textDecoration: "none" }}>
            <div className="feature-card">
              <div className="icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "10px" }}>
                TTS 合成
              </h3>
              <p style={{ fontSize: "13px", color: "#c7d2fe", lineHeight: 1.7, marginBottom: "20px" }}>
                选择已训练的声音模型，输入文字，一键生成可播放、可下载的语音文件。
              </p>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#818cf8" }}>
                立即合成 →
              </span>
            </div>
          </Link>
        </div>

        {/* ── 三张小特性卡 ── */}
        <div
          className="animate-fade-up delay-5"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
            paddingBottom: "60px",
          }}
        >
          {[
            {
              href: "/voices",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              ),
              title: "异步训练",
              desc: "提交后可离开页面，系统自动完成训练并更新状态",
            },
            {
              href: "/tts",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
              title: "多格式支持",
              desc: "输出 MP3 / WAV / OPUS 三种格式，满足不同使用场景",
            },
            {
              href: "/history",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              ),
              title: "历史记录",
              desc: "自动保存最近 50 条合成记录，随时回放或下载",
            },
          ].map((item, i) => (
            <Link key={i} href={item.href} style={{ textDecoration: "none" }}>
              <div className="feature-card" style={{ padding: "22px" }}>
                <div className="icon-box-sm">
                  {item.icon}
                </div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", marginBottom: "6px" }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: "12px", color: "#c7d2fe", lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
