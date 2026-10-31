import { z } from "zod";

/* ----------------------------- Enums ----------------------------- */

export const ItemType = z.enum(["pdf", "doc", "file", "link", "youtube_video", "note", "video"]);
export type ItemType = z.infer<typeof ItemType>;

/* ----------------------------- Limits (free-tier guards) ----------------------------- */

export const LIMITS = {
  maxUploadBytes: 200 * 1024 * 1024, // 200 MB per file
  storageQuotaBytes: 10 * 1024 * 1024 * 1024, // R2 free tier: 10 GB
  storageWarnRatio: 0.8,
  ytDailyQuotaUnits: 10_000,
  ytSearchCost: 100,
  ytSearchCacheHours: 24,
} as const;

/* ----------------------------- Schemas ----------------------------- */

const uuid = z.string().uuid();
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const Folder = z.object({
  id: uuid,
  user_id: uuid,
  parent_id: uuid.nullable(),
  name: z.string().min(1).max(120),
  color: hexColor,
  icon: z.string().max(40).nullable(),
  position: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Folder = z.infer<typeof Folder>;

export const FolderInput = Folder.pick({ name: true, color: true, icon: true, parent_id: true }).partial({
  icon: true,
  parent_id: true,
});
export type FolderInput = z.infer<typeof FolderInput>;

export const Item = z.object({
  id: uuid,
  user_id: uuid,
  folder_id: uuid.nullable(),
  type: ItemType,
  title: z.string().min(1).max(500),
  description: z.string().max(10_000).nullable(),
  source_url: z.string().url().nullable(),
  storage_key: z.string().nullable(),
  mime: z.string().nullable(),
  size_bytes: z.number().int().nonnegative().nullable(),
  thumbnail_url: z.string().url().nullable(),
  duration_seconds: z.number().int().nonnegative().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
  last_opened_at: z.string().nullable(),
});
export type Item = z.infer<typeof Item>;

export const ItemInput = Item.pick({
  folder_id: true,
  type: true,
  title: true,
  description: true,
  source_url: true,
  storage_key: true,
  mime: true,
  size_bytes: true,
  thumbnail_url: true,
  duration_seconds: true,
  metadata: true,
}).partial({
  folder_id: true,
  description: true,
  source_url: true,
  storage_key: true,
  mime: true,
  size_bytes: true,
  thumbnail_url: true,
  duration_seconds: true,
  metadata: true,
});
export type ItemInput = z.infer<typeof ItemInput>;

/* ----------------------------- Folder tree ----------------------------- */

export interface FolderNode extends Folder {
  children: FolderNode[];
  depth: number;
}

/** Builds a sorted tree from a flat folder list. Orphans (missing parent) become roots. */
export function buildFolderTree(folders: Folder[]): FolderNode[] {
  const byId = new Map<string, FolderNode>();
  for (const f of folders) byId.set(f.id, { ...f, children: [], depth: 0 });

  const roots: FolderNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parent_id ? byId.get(node.parent_id) : undefined;
    (parent ? parent.children : roots).push(node);
  }

  const sortAndDepth = (nodes: FolderNode[], depth: number) => {
    nodes.sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
    for (const n of nodes) {
      n.depth = depth;
      sortAndDepth(n.children, depth + 1);
    }
  };
  sortAndDepth(roots, 0);
  return roots;
}

/** True if moving `folderId` under `newParentId` would create a cycle. */
export function wouldCreateCycle(folders: Folder[], folderId: string, newParentId: string | null): boolean {
  const parentOf = new Map(folders.map((f) => [f.id, f.parent_id]));
  let cur: string | null | undefined = newParentId;
  while (cur) {
    if (cur === folderId) return true;
    cur = parentOf.get(cur);
  }
  return false;
}

/* ----------------------------- Browsing ----------------------------- */

export const SortKey = z.enum(["created_desc", "created_asc", "name_asc", "name_desc", "opened_desc"]);
export type SortKey = z.infer<typeof SortKey>;

export const LibraryFilter = z.object({
  q: z.string().max(200).optional(),
  folderId: uuid.nullable().optional(),
  types: z.array(ItemType).optional(),
  tagIds: z.array(uuid).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: SortKey.default("created_desc"),
});
export type LibraryFilter = z.infer<typeof LibraryFilter>;

export type DateBucket = "Today" | "Yesterday" | "This week" | "This month" | string;

/** Groups items into timeline buckets ("Today", "This week", "March 2026"...). */
export function groupByDate<T extends { created_at: string }>(items: T[], now = new Date()): [DateBucket, T[]][] {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOfDay(now);
  const day = 86_400_000;
  const weekStart = today - ((now.getDay() + 6) % 7) * day; // Monday
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const fmt = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

  const groups = new Map<DateBucket, T[]>();
  for (const item of items) {
    const d = new Date(item.created_at);
    const t = startOfDay(d);
    const bucket: DateBucket =
      t === today
        ? "Today"
        : t === today - day
          ? "Yesterday"
          : t >= weekStart
            ? "This week"
            : t >= monthStart
              ? "This month"
              : fmt.format(d);
    const list = groups.get(bucket);
    if (list) list.push(item);
    else groups.set(bucket, [item]);
  }
  return [...groups.entries()];
}

/** Infers an item type from a MIME type / filename for uploads. */
export function inferItemType(mime: string, filename = ""): ItemType {
  if (mime === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (
    mime.includes("word") ||
    mime.includes("officedocument") ||
    mime.startsWith("text/") ||
    /\.(docx?|md|txt|pptx?|xlsx?|rtf)$/i.test(filename)
  )
    return "doc";
  return "file";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
