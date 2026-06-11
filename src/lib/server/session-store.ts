import { randomBytes } from "node:crypto";

interface SessionEntry {
	createdAt: number;
}

const sessions = new Map<string, SessionEntry>();

export function createSession(): string {
	const id = randomBytes(32).toString("hex");
	sessions.set(id, { createdAt: Date.now() });
	return id;
}

export function getSession(id: string): SessionEntry | null {
	return sessions.get(id) ?? null;
}

export function destroySession(id: string): void {
	sessions.delete(id);
}

export function destroyAllSessions(): void {
	sessions.clear();
}
