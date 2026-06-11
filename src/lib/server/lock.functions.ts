import { createServerFn } from "@tanstack/react-start";
import {
	deleteCookie,
	getCookie,
	setCookie,
} from "@tanstack/start-server-core";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { db } from "~/db/index.ts";
import { createLockRepo } from "~/lib/db/lock.ts";
import {
	createSession,
	destroyAllSessions,
	destroySession,
	getSession,
} from "./session-store.ts";

const lockRepo = createLockRepo(db);

function hashPassword(password: string): string {
	const salt = randomBytes(16).toString("hex");
	const buf = scryptSync(password, salt, 64);
	return `${buf.toString("hex")}:${salt}`;
}

function verifyPassword(password: string, stored: string): boolean {
	const [hashHex, salt] = stored.split(":");
	if (!hashHex || !salt) return false;
	const buf = scryptSync(password, salt, 64);
	const storedBuf = Buffer.from(hashHex, "hex");
	return storedBuf.length === buf.length && timingSafeEqual(buf, storedBuf);
}

const COOKIE_NAME = "joborbit-session";
const COOKIE_OPTS = {
	httpOnly: true,
	path: "/",
	sameSite: "strict" as const,
};

export const getLock = createServerFn({ method: "GET" }).handler(async () =>
	lockRepo.getLock(),
);

export const checkSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const lock = lockRepo.getLock();
		if (!lock?.enabled) return { authenticated: true };

		const sid = getCookie(COOKIE_NAME);
		if (!sid) return { authenticated: false };

		const session = getSession(sid);
		if (!session) return { authenticated: false };

		if (lock.session_ttl_hours !== null) {
			const elapsed = Date.now() - session.createdAt;
			if (elapsed > lock.session_ttl_hours * 60 * 60 * 1000) {
				destroySession(sid);
				return { authenticated: false };
			}
		}

		return { authenticated: true };
	},
);

export const unlock = createServerFn({ method: "POST" })
	.inputValidator(z.object({ password: z.string() }))
	.handler(async ({ data }) => {
		const lock = lockRepo.getLock();
		if (!lock.enabled || !lock.hash) {
			return { success: true };
		}
		if (!verifyPassword(data.password, lock.hash)) {
			throw new Error("Invalid password");
		}
		const sessionId = createSession();
		setCookie(COOKIE_NAME, sessionId, COOKIE_OPTS);
		return { success: true };
	});

export const lockApp = createServerFn({ method: "POST" }).handler(async () => {
	const sid = getCookie(COOKIE_NAME);
	if (sid) destroySession(sid);
	deleteCookie(COOKIE_NAME, COOKIE_OPTS);
	return { success: true };
});

export const upsertLock = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			enabled: z.boolean().optional(),
			password: z.string().optional(),
			currentPassword: z.string().optional(),
			session_ttl_hours: z.number().int().nullable().optional(),
		}),
	)
	.handler(async ({ data }) => {
		const current = lockRepo.getLock();

		if (current.enabled && current.hash) {
			if (!data.currentPassword) {
				throw new Error("Current password is required");
			}
			if (!verifyPassword(data.currentPassword, current.hash)) {
				throw new Error("Current password is incorrect");
			}
		}

		if (data.enabled === true && !current.hash && !data.password) {
			throw new Error("Password is required to enable the lock");
		}

		if (data.password !== undefined && data.password.length < 4) {
			throw new Error("Password must be at least 4 characters");
		}

		const update: {
			enabled?: boolean;
			hash?: string | null;
			session_ttl_hours?: number | null;
		} = {};

		if (current.enabled && data.enabled === false) {
			update.enabled = false;
			update.hash = null;
			destroyAllSessions();
		} else if (data.enabled !== undefined) {
			update.enabled = data.enabled;
		}

		if (data.password !== undefined) {
			update.hash = data.password ? hashPassword(data.password) : null;
		}

		if (data.session_ttl_hours !== undefined) {
			update.session_ttl_hours = data.session_ttl_hours;
		}

		return lockRepo.upsertLock(update);
	});
