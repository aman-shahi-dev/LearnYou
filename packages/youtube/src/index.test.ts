import { describe, expect, it } from "vitest";
import { parseIsoDuration, parseTimestamp, parseYouTube, uploadsPlaylistId } from "./index";

describe("parseYouTube", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", { kind: "video", videoId: "dQw4w9WgXcQ" }],
    ["youtu.be/dQw4w9WgXcQ?t=1m30s", { kind: "video", videoId: "dQw4w9WgXcQ", startSeconds: 90 }],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", { kind: "video", videoId: "dQw4w9WgXcQ" }],
    ["https://m.youtube.com/embed/dQw4w9WgXcQ", { kind: "video", videoId: "dQw4w9WgXcQ" }],
    [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG",
      { kind: "video", videoId: "dQw4w9WgXcQ", playlistId: "PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG" },
    ],
    [
      "https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG",
      { kind: "playlist", playlistId: "PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG" },
    ],
    [
      "https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw",
      { kind: "channel", channelId: "UC_x5XG1OV2P6uZZ5FSM9Ttw" },
    ],
    ["https://www.youtube.com/@Fireship", { kind: "handle", handle: "Fireship" }],
    ["@Fireship", { kind: "handle", handle: "Fireship" }],
    ["https://www.youtube.com/c/Traversy", { kind: "legacy-channel", name: "Traversy" }],
    ["dQw4w9WgXcQ", { kind: "video", videoId: "dQw4w9WgXcQ" }],
  ])("%s", (input, expected) => {
    expect(parseYouTube(input)).toEqual(expected);
  });

  it.each(["", "hello world", "https://vimeo.com/123", "https://youtube.com/watch?v=short"])(
    "rejects %s",
    (input) => expect(parseYouTube(input)).toBeNull(),
  );
});

describe("helpers", () => {
  it("parses timestamps", () => {
    expect(parseTimestamp("1h2m3s")).toBe(3723);
    expect(parseTimestamp("45")).toBe(45);
    expect(parseTimestamp("abc")).toBeUndefined();
  });
  it("parses ISO durations", () => {
    expect(parseIsoDuration("PT1H2M3S")).toBe(3723);
    expect(parseIsoDuration("PT45S")).toBe(45);
  });
  it("derives uploads playlist", () => {
    expect(uploadsPlaylistId("UC_x5XG1OV2P6uZZ5FSM9Ttw")).toBe("UU_x5XG1OV2P6uZZ5FSM9Ttw");
  });
});
