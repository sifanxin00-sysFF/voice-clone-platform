"use client";

import { ExternalLink, Github } from "lucide-react";

export default function AuthorPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/50">
          <Github className="h-8 w-8" aria-hidden="true" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">sifanxin00-sysFF</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Full-stack developer focused on AI applications and product prototypes.
          </p>
        </div>

        <a
          href="https://github.com/sifanxin00-sysFF"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
          View GitHub profile
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
