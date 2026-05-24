import { describe, expect, it } from "vitest";
import { insert as insertApp } from "./applications";
import { deleteByApplicationId, insertEntry, listByApplicationId } from "./status-history";

const validApp = {
  company: "Acme Inc",
  role: "Engineer",
  applied_date: "2026-05-20",
};

describe("insertEntry", () => {
  it("inserts a status history entry with old and new status", () => {
    const app = insertApp(validApp);
    const entry = insertEntry(app.id, "Interview", "Applied");
    expect(entry.application_id).toBe(app.id);
    expect(entry.old_status).toBe("Applied");
    expect(entry.new_status).toBe("Interview");
    expect(entry.changed_at).toBeDefined();
  });

  it("inserts an initial entry with null old_status", () => {
    const app = insertApp(validApp);
    const entry = insertEntry(app.id, "Applied", null);
    expect(entry.old_status).toBeNull();
    expect(entry.new_status).toBe("Applied");
  });
});

describe("listByApplicationId", () => {
  it("returns entries newest first for the given application", () => {
    const app = insertApp(validApp);
    insertEntry(app.id, "Interview", "Applied");
    insertEntry(app.id, "Offer", "Interview");
    const entries = listByApplicationId(app.id);
    expect(entries).toHaveLength(3);
    expect(entries[0].new_status).toBe("Offer");
    expect(entries[1].new_status).toBe("Interview");
    expect(entries[2].new_status).toBe("Applied");
  });

  it("returns the initial entry created on insert", () => {
    const app = insertApp(validApp);
    const entries = listByApplicationId(app.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].old_status).toBeNull();
    expect(entries[0].new_status).toBe("Applied");
  });

  it("does not return entries for other applications", () => {
    const a = insertApp(validApp);
    const b = insertApp(validApp);
    insertEntry(a.id, "Interview", "Applied");
    const aEntries = listByApplicationId(a.id);
    expect(aEntries).toHaveLength(2);
    expect(aEntries[0].new_status).toBe("Interview");
    expect(aEntries[1].new_status).toBe("Applied");
  });
});

describe("deleteByApplicationId", () => {
  it("removes all history entries for the application", () => {
    const app = insertApp(validApp);
    insertEntry(app.id, "Applied", null);
    insertEntry(app.id, "Interview", "Applied");
    deleteByApplicationId(app.id);
    expect(listByApplicationId(app.id)).toEqual([]);
  });

  it("succeeds when no history exists", () => {
    expect(() => deleteByApplicationId(999)).not.toThrow();
  });
});
