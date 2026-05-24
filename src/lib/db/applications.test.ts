import { describe, expect, it } from "vitest";
import { getById, insert, listAll, remove, update } from "./applications";
import { listByApplicationId } from "./status-history";

const validApp = {
  company: "Acme Inc",
  role: "Engineer",
  applied_date: "2026-05-20",
};

describe("listAll", () => {
  it("returns empty array when no applications exist", () => {
    expect(listAll()).toEqual([]);
  });

  it("returns all applications ordered by date desc then id desc", () => {
    const a = insert({
      ...validApp,
      company: "Oldest",
      applied_date: "2026-05-01",
    });
    const b = insert({
      ...validApp,
      company: "Middle",
      applied_date: "2026-05-15",
    });
    const c = insert({
      ...validApp,
      company: "Newest",
      applied_date: "2026-05-20",
    });
    const result = listAll();
    expect(result.map((r) => r.id)).toEqual([c.id, b.id, a.id]);
  });
});

describe("getById", () => {
  it("returns the application for a valid id", () => {
    const created = insert(validApp);
    const result = getById(created.id);
    expect(result).toBeDefined();
    expect(result!.company).toBe("Acme Inc");
  });

  it("returns undefined for a nonexistent id", () => {
    expect(getById(999)).toBeUndefined();
  });
});

describe("insert", () => {
  it("inserts and returns the application with id and created_at", () => {
    const result = insert(validApp);
    expect(result.id).toBeGreaterThan(0);
    expect(result.company).toBe("Acme Inc");
    expect(result.role).toBe("Engineer");
    expect(result.applied_date).toBe("2026-05-20");
    expect(result.created_at).toBeDefined();
  });
});

describe("update", () => {
  it("updates specified fields and returns updated row", () => {
    const created = insert(validApp);
    const updated = update(created.id, {
      company: "Updated Corp",
      role: "Senior Engineer",
    });
    expect(updated.company).toBe("Updated Corp");
    expect(updated.role).toBe("Senior Engineer");
    expect(updated.applied_date).toBe("2026-05-20");
  });

  it("returns existing row when update data is empty", () => {
    const created = insert(validApp);
    const result = update(created.id, {});
    expect(result.company).toBe("Acme Inc");
  });

  it("rejects invalid fields", () => {
    const created = insert(validApp);
    expect(() => update(created.id, { company: "" })).toThrow();
  });
});

describe("remove", () => {
  it("removes the application", () => {
    const created = insert(validApp);
    remove(created.id);
    expect(getById(created.id)).toBeUndefined();
  });

  it("succeeds for nonexistent id", () => {
    expect(() => remove(999)).not.toThrow();
  });
});

describe("status history side-effects", () => {
  it("creates an initial history entry on insert", () => {
    const app = insert(validApp);
    const entries = listByApplicationId(app.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].old_status).toBeNull();
    expect(entries[0].new_status).toBe("Applied");
  });

  it("creates a history entry when status is updated", () => {
    const app = insert(validApp);
    update(app.id, { status: "Interview" });
    const entries = listByApplicationId(app.id);
    expect(entries).toHaveLength(2);
    expect(entries[0].old_status).toBe("Applied");
    expect(entries[0].new_status).toBe("Interview");
  });

  it("does not create a history entry when non-status fields are updated", () => {
    const app = insert(validApp);
    update(app.id, { company: "New Corp" });
    const entries = listByApplicationId(app.id);
    expect(entries).toHaveLength(1);
  });

  it("does not create a history entry when status stays the same", () => {
    const app = insert(validApp);
    update(app.id, { status: "Applied" });
    const entries = listByApplicationId(app.id);
    expect(entries).toHaveLength(1);
  });

  it("cascades delete history entries on remove", () => {
    const app = insert(validApp);
    update(app.id, { status: "Interview" });
    update(app.id, { status: "Offer" });
    remove(app.id);
    expect(listByApplicationId(app.id)).toEqual([]);
  });
});
