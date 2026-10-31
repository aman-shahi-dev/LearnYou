import type { ComponentPropsWithoutRef, CSSProperties, ElementType } from "react";
import { cn } from "@/lib/cn";

type Props<T extends ElementType> = {
  as?: T;
  strong?: boolean;
  /** Folder accent (hex) — tints the glass and adds a soft colored glow. */
  tint?: string;
} & ComponentPropsWithoutRef<T>;

export function GlassPanel<T extends ElementType = "div">({
  as,
  strong,
  tint,
  className,
  style,
  ...rest
}: Props<T>) {
  const Comp = (as ?? "div") as ElementType;
  const tintStyle: CSSProperties | undefined = tint
    ? {
        backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${tint} 18%, transparent), transparent 60%)`,
      }
    : undefined;
  return (
    <Comp
      className={cn(strong ? "glass-strong" : "glass", "rounded-xl", className)}
      style={{ ...tintStyle, ...style }}
      {...rest}
    />
  );
}
