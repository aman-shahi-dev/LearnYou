import { Dock } from "@/components/glass/dock";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-5 pb-32 pt-10 sm:px-8">{children}</div>
      <Dock />
    </>
  );
}
