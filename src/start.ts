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

const AUTH_WHITELIST = [
	"checkSession",
	"unlock",
	"getLock",
	"upsertLock",
	"lockApp",
];

const sessionMiddleware = createMiddleware().server(
	async ({ next, request, handlerType }) => {
		if (handlerType !== "serverFn") return next();

		const url = new URL(request?.url ?? "http://localhost");
		const serverFnId = url.pathname.split("/").pop() ?? "";
		if (AUTH_WHITELIST.some((p) => serverFnId === p)) return next();

		const lockRepo = createLockRepo(db);
		const lock = lockRepo.getLock();
		if (!lock?.enabled) return next();

		const cookies = parseCookies(request?.headers?.get("cookie") ?? "");
		const sid = cookies["joborbit-session"];
		if (!sid) throw new Error("Not authenticated");

		const session = getSession(sid);
		if (!session) throw new Error("Session expired");

		if (lock.session_ttl_hours !== null) {
			const elapsed = Date.now() - session.createdAt;
			if (elapsed > lock.session_ttl_hours * 60 * 60 * 1000) {
				destroySession(sid);
				throw new Error("Session expired");
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
