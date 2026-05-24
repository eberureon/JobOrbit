import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ErrorComponentProps } from "@tanstack/react-router";

export function RootError({ error, reset }: ErrorComponentProps) {
	return (
		<div className="flex flex-col items-center justify-center py-24 px-4 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
				<AlertTriangle className="h-6 w-6 text-destructive" />
			</div>
			<h1 className="mt-4 text-xl font-semibold text-foreground">
				Something went wrong
			</h1>
			<p className="mt-2 text-sm text-muted-foreground max-w-sm">
				{error?.message ?? "An unexpected error occurred."}
			</p>
			<button
				type="button"
				onClick={reset}
				className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
			>
				<RefreshCw className="h-4 w-4" />
				Try again
			</button>
		</div>
	);
}
