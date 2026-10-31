import type { Metadata } from "next";
import { GlassPanel } from "@/components/glass/glass-panel";
import { OAuthButtons } from "./oauth-buttons";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-[440px]">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-muted">LearnYou</p>
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          Everything you&apos;ve learned,
          <br />
          <em className="bg-gradient-to-r from-violet via-iris to-teal bg-clip-text text-transparent">
            finally in one place.
          </em>
        </h1>
        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
          Docs, PDFs, links, playlists and channels, organized by folder and date. Synced across all your
          devices.
        </p>

        <GlassPanel strong className="mt-10 p-2">
          <OAuthButtons />
        </GlassPanel>

        <p className="mt-6 text-xs text-muted">
          By continuing you agree to keep learning. We only read your public profile.
        </p>
      </div>
    </main>
  );
}
