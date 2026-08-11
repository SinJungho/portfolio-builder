import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/EditorClient.tsx"),
  "utf8",
);

describe("published snapshot recovery", () => {
  it("keeps the latest snapshot in memory even when browser storage fails", () => {
    expect(source.indexOf("setPublishedSnapshot(snapshot)")).toBeLessThan(
      source.indexOf("window.localStorage.setItem"),
    );
  });

  it("preserves the live custom domain while restoring snapshot content", () => {
    const restoreHandler = source.slice(
      source.indexOf("const handleRestorePublished"),
      source.indexOf("const handleUnpublish"),
    );
    const initializeStart = restoreHandler.indexOf("initialize({");
    const initializeCall = restoreHandler.slice(
      initializeStart,
      restoreHandler.indexOf("});", initializeStart),
    );

    expect(initializeCall).toContain("customDomain,");
    expect(initializeCall).toContain("blocks: publishedSnapshot.blocks");
  });
});

describe("project editor state", () => {
  it("remounts on every open so saved selections cannot be replaced by stale local state", () => {
    expect(source).toContain('key={`project-editor-${editingBlockId ?? "new"}-${isEditingProjects ? "open" : "closed"}`}');
  });
});
