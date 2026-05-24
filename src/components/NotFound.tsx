import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center py-24 px-4 text-center">
			<div className="text-6xl font-mono-num text-muted-foreground/30 font-semibold">
				404
			</div>
			<h1 className="mt-4 text-xl font-semibold text-foreground">
				Page not found
			</h1>
			<p className="mt-2 text-sm text-muted-foreground max-w-sm">
				This page doesn't exist or was moved.
			</p>
			<Link
				to="/"
				className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
			>
				Back to dashboard
			</Link>
		</div>
	);
}
