import { describe, expect, it } from "vitest";
import { buildFolderTree, formatBytes, groupByDate, inferItemType, wouldCreateCycle, type Folder } from "./index";

const f = (id: string, parent_id: string | null, name: string, position = 0): Folder => ({
  id,
  user_id: "00000000-0000-4000-8000-000000000000",
  parent_id,
  name,
  color: "#7C5CFF",
  icon: null,
  position,
  created_at: "",
  updated_at: "",
});

describe("folder tree", () => {
  const folders = [f("a", null, "Web"), f("b", "a", "React", 1), f("c", "a", "CSS", 0), f("d", "missing", "Orphan")];

  it("builds nested, sorted tree with orphans as roots", () => {
    const tree = buildFolderTree(folders);
    expect(tree.map((n) => n.name)).toEqual(["Orphan", "Web"]);
    const web = tree.find((n) => n.id === "a")!;
    expect(web.children.map((n) => n.name)).toEqual(["CSS", "React"]);
    expect(web.children[0]!.depth).toBe(1);
  });

  it("detects cycles", () => {
    expect(wouldCreateCycle(folders, "a", "b")).toBe(true);
    expect(wouldCreateCycle(folders, "b", "c")).toBe(false);
    expect(wouldCreateCycle(folders, "a", null)).toBe(false);
  });
});

describe("groupByDate", () => {
  it("buckets items", () => {
    const now = new Date("2026-10-31T12:00:00"); // Saturday
    const groups = groupByDate(
      [
        { created_at: "2026-10-31T09:00:00" },
        { created_at: "2026-10-30T09:00:00" },
        { created_at: "2026-10-27T09:00:00" },
        { created_at: "2026-10-02T09:00:00" },
        { created_at: "2026-03-02T09:00:00" },
      ],
      now,
    );
    expect(groups.map(([b]) => b)).toEqual(["Today", "Yesterday", "This week", "This month", "March 2026"]);
  });
});

describe("misc", () => {
  it("infers item types", () => {
    expect(inferItemType("application/pdf")).toBe("pdf");
    expect(inferItemType("video/mp4")).toBe("video");
    expect(inferItemType("application/octet-stream", "notes.md")).toBe("doc");
    expect(inferItemType("application/zip", "a.zip")).toBe("file");
  });
  it("formats bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(10 * 1024 ** 3)).toBe("10 GB");
  });
});
