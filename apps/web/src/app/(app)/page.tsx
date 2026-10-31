import { Suspense } from "react";
import { FileText, PlaySquare, Radio, Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { getCurrentUser } from "@/lib/auth";

export default function HomePage() {
  return (
    <main className="space-y-10">
      <header>
        <Suspense fallback={<GreetingSkeleton />}>
          <Greeting />
        </Suspense>
      </header>

      {/* Bento dashboard — wired to live data in Phase 3. */}
      <section className="grid auto-rows-[160px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BentoCard className="lg:col-span-2 lg:row-span-2" tint="#7C5CFF" icon={<PlaySquare />} title="Continue watching" hint="Pick up where you left off on any device." />
        <BentoCard tint="#2DE2C4" icon={<FileText />} title="Recent files" hint="PDFs and docs you opened lately." />
        <BentoCard tint="#5B8CFF" icon={<Radio />} title="New from channels" hint="Fresh uploads from your subscriptions." />
        <BentoCard className="sm:col-span-2" tint="#FF6FAE" icon={<Sparkles />} title="Add anything" hint="Paste a link, a playlist, a channel, or drop a file. Press ⌘K." />
      </section>
    </main>
  );
}

async function Greeting() {
  const user = await getCurrentUser();
  const first = user.name.split(" ")[0];
  return (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">Your library</p>
      <h1 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">
        Welcome back, <em className="text-muted">{first}.</em>
      </h1>
    </>
  );
}

function GreetingSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-3 w-28 rounded bg-white/10" />
      <div className="mt-4 h-14 w-80 max-w-full animate-pulse rounded-xl bg-white/[0.06]" />
    </div>
  );
}

function BentoCard({
  title,
  hint,
  icon,
  tint,
  className,
}: {
  title: string;
  hint: string;
  icon: React.ReactNode;
  tint: string;
  className?: string;
}) {
  return (
    <GlassPanel
      tint={tint}
      className={`group relative flex flex-col justify-between overflow-hidden p-5 transition-transform duration-500 ease-glass hover:-translate-y-0.5 ${className ?? ""}`}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.07] [&>svg]:size-5" style={{ color: tint }}>
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-medium tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted">{hint}</p>
      </div>
    </GlassPanel>
  );
}
