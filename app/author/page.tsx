"use client";

export default function AuthorPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="rounded-2xl border border-border bg-card backdrop-blur-xl p-8 flex flex-col items-center gap-6">

        {/* 头像 */}
        <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-purple-500/60 ring-offset-2 ring-offset-transparent">
          <img src="/avatar.jpg" alt="作者头像" className="w-full h-full object-cover" />
        </div>

        {/* 名字 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">繁大帅</h2>
          <p className="text-sm text-muted-foreground mt-1">全栈开发者 / AI 爱好者</p>
        </div>

        {/* 微信图标 */}
        <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5 10.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm4.5 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM2 12c0-4.4 4.5-8 10-8s10 3.6 10 8-4.5 8-10 8c-1.2 0-2.3-.2-3.4-.5L4 21l1.2-3.6C3.1 16 2 14.1 2 12zm14.5 1.5c.4 0 .8-.3.8-.8s-.3-.8-.8-.8-.8.3-.8.8.4.8.8.8zm-5 0c.4 0 .8-.3.8-.8s-.3-.8-.8-.8-.8.3-.8.8.4.8.8.8z" />
          </svg>
        </div>

        <div className="w-full border-t border-border" />

        {/* 微信二维码 */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.5 10.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm4.5 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM2 12c0-4.4 4.5-8 10-8s10 3.6 10 8-4.5 8-10 8c-1.2 0-2.3-.2-3.4-.5L4 21l1.2-3.6C3.1 16 2 14.1 2 12zm14.5 1.5c.4 0 .8-.3.8-.8s-.3-.8-.8-.8-.8.3-.8.8.4.8.8.8zm-5 0c.4 0 .8-.3.8-.8s-.3-.8-.8-.8-.8.3-.8.8.4.8.8.8z" />
            </svg>
            扫码添加微信好友
          </p>
          <div className="rounded-xl overflow-hidden border border-border bg-white p-2">
            <img src="/wechat-qr.png" alt="微信二维码" className="w-48 h-48 rounded-lg object-contain" />
          </div>
          <p className="text-xs text-muted-foreground">扫一扫上面的二维码，加我为朋友</p>
        </div>

      </div>
    </div>
  );
}
