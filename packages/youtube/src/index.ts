/**
 * YouTube URL parsing — detects what a pasted URL/ID points to.
 * Pure functions, shared by web, mobile and Edge Functions.
 */

export type YouTubeRef =
  | { kind: "video"; videoId: string; startSeconds?: number; playlistId?: string }
  | { kind: "playlist"; playlistId: string }
  | { kind: "channel"; channelId: string }
  | { kind: "handle"; handle: string } // @name — resolve to channelId server-side
  | { kind: "legacy-channel"; name: string }; // /c/Name or /user/Name

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;
const PLAYLIST_ID = /^(PL|UU|LL|FL|OL|RD)[A-Za-z0-9_-]{10,}$/;

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/** Parses `t=1h2m3s`, `t=90`, `start=90`. */
export function parseTimestamp(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return Number(raw);
  const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m || (!m[1] && !m[2] && !m[3])) return undefined;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

export function parseYouTube(input: string): YouTubeRef | null {
  const raw = input.trim();
  if (!raw) return null;

  // Bare IDs / handles
  if (raw.startsWith("@") && /^@[\w.-]{3,30}$/.test(raw)) return { kind: "handle", handle: raw.slice(1) };
  if (CHANNEL_ID.test(raw)) return { kind: "channel", channelId: raw };
  if (PLAYLIST_ID.test(raw)) return { kind: "playlist", playlistId: raw };
  if (VIDEO_ID.test(raw)) return { kind: "video", videoId: raw };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  const segs = url.pathname.split("/").filter(Boolean);
  const start = parseTimestamp(url.searchParams.get("t") ?? url.searchParams.get("start"));
  const list = url.searchParams.get("list") ?? undefined;

  if (host === "youtu.be") {
    const id = segs[0];
    return id && VIDEO_ID.test(id) ? withOpt({ kind: "video", videoId: id }, start, list) : null;
  }
  if (!YT_HOSTS.has(host)) return null;

  const [first, second] = segs;

  if (first === "watch") {
    const v = url.searchParams.get("v");
    if (v && VIDEO_ID.test(v)) return withOpt({ kind: "video", videoId: v }, start, list);
    if (list) return { kind: "playlist", playlistId: list };
    return null;
  }
  if (first === "playlist" && list) return { kind: "playlist", playlistId: list };
  if ((first === "shorts" || first === "embed" || first === "live" || first === "v") && second && VIDEO_ID.test(second)) {
    return withOpt({ kind: "video", videoId: second }, start, list);
  }
  if (first === "channel" && second && CHANNEL_ID.test(second)) return { kind: "channel", channelId: second };
  if (first?.startsWith("@")) return { kind: "handle", handle: decodeURIComponent(first.slice(1)) };
  if ((first === "c" || first === "user") && second) return { kind: "legacy-channel", name: second };

  return null;
}

function withOpt(
  ref: { kind: "video"; videoId: string },
  startSeconds?: number,
  playlistId?: string,
): YouTubeRef {
  return {
    ...ref,
    ...(startSeconds !== undefined && { startSeconds }),
    ...(playlistId && { playlistId }),
  };
}

/** A channel's uploads playlist is its ID with UC → UU (1 quota unit to page vs 100 for search). */
export function uploadsPlaylistId(channelId: string): string {
  return CHANNEL_ID.test(channelId) ? `UU${channelId.slice(2)}` : channelId;
}

export function thumbnailUrl(videoId: string, quality: "mq" | "hq" | "maxres" = "hq"): string {
  const name = quality === "maxres" ? "maxresdefault" : `${quality}default`;
  return `https://i.ytimg.com/vi/${videoId}/${name}.jpg`;
}

/** Parses ISO-8601 durations from the Data API (e.g. PT1H2M3S) to seconds. */
export function parseIsoDuration(iso: string): number {
  const m = iso.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 86400 + Number(m[2] ?? 0) * 3600 + Number(m[3] ?? 0) * 60 + Number(m[4] ?? 0);
}
