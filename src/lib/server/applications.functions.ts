import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { insertApplicationSchema } from "~/db/schema.ts";
import * as db from "~/lib/db/applications.ts";
import { listByApplicationId } from "~/lib/db/status-history.ts";

export const listApplications = createServerFn({ method: "GET" }).handler(
  async () => {
    return db.listAll();
  },
);

export const getApplication = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return db.getById(data.id);
  });

export const createApplication = createServerFn({ method: "POST" })
  .inputValidator(insertApplicationSchema)
  .handler(async ({ data }) => {
    return db.insert(data);
  });

export const updateApplication = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
      data: insertApplicationSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    return db.update(data.id, data.data);
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    db.remove(data.id);
    return { success: true };
  });

export const getStats = createServerFn({ method: "GET" }).handler(async () => {
  return db.stats();
});

export const getStatusHistory = createServerFn({ method: "GET" })
  .inputValidator((data: { applicationId: number }) => data)
  .handler(async ({ data }) => {
    return listByApplicationId(data.applicationId);
  });
