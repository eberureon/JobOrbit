import { Toast } from "@heroui/react";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NotFound } from "~/components/NotFound";
import { RootComponent } from "~/components/RootComponent";
import { ErrorComponent } from "~/components/ErrorComponent";
import { SettingsProvider } from "~/lib/use-settings";
import { INLINE_THEME_SCRIPT } from "~/lib/theme";
import "~/styles.css";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "JobOrbit — Job Application Tracker" },
		],
	}),
	shellComponent: DocumentShell,
	component: RootComponent,
	errorComponent: ErrorComponent,
	notFoundComponent: NotFound,
});

function DocumentShell({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />

				<script
					dangerouslySetInnerHTML={{
						__html: INLINE_THEME_SCRIPT,
					}}
				/>
			</head>
			<body>
				<Toast.Provider />
				<SettingsProvider>{children}</SettingsProvider>
				<Devtools />
				<Scripts />
			</body>
		</html>
	);
}

function Devtools() {
	const [node, setNode] = useState<ReactNode>(null);

	useEffect(() => {
		if (!import.meta.env.DEV) return;
		let mounted = true;
		const load = async () => {
			const [{ TanStackDevtools }, { TanStackRouterDevtoolsPanel }, query] =
				await Promise.all([
					import("@tanstack/react-devtools"),
					import("@tanstack/react-router-devtools"),
					import("../integrations/tanstack-query/devtools"),
				]);
			if (!mounted) return;
			setNode(
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						query.default,
					]}
				/>,
			);
		};
		load();
		return () => {
			mounted = false;
		};
	}, []);

	return import.meta.env.DEV ? node : null;
}
