import {
	createCsrfMiddleware,
	createMiddleware,
	createStart,
} from "@tanstack/react-start";
import { db } from "~/db/index.ts";
import { createLockRepo } from "~/lib/db/lock.ts";
import { destroySession, getSession } from "~/lib/server/session-store.ts";

const csrfMiddleware = createCsrfMiddleware({
	filter: (ctx) => ctx.handlerType === "serverFn",
});

const sessionMiddleware = createMiddleware().server(
	async ({ next, request, handlerType }) => {
		if (handlerType !== "serverFn") return next();

		const lockRepo = createLockRepo(db);
		const lock = lockRepo.getLock();
		if (!lock?.enabled) return next();

		const cookies = parseCookies(request?.headers?.get("cookie") ?? "");
		const sid = cookies["joborbit-session"];
		if (!sid) return next();

		const session = getSession(sid);
		if (!session) return next();

		if (lock.session_ttl_hours !== null) {
			const elapsed = Date.now() - session.createdAt;
			if (elapsed > lock.session_ttl_hours * 60 * 60 * 1000) {
				destroySession(sid);
				return next();
			}
		}

		return next({ context: { authenticated: true } });
	},
);

export const startInstance = createStart(() => ({
	requestMiddleware: [csrfMiddleware, sessionMiddleware],
}));

function parseCookies(header: string): Record<string, string> {
	return Object.fromEntries(
		header.split(";").map((c) => {
			const [key, ...rest] = c.trim().split("=");
			return [key, rest.join("=")];
		}),
	);
}
