import { Toast as ToastPrimitive } from "@base-ui/react/toast";
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
import { RootError } from "~/components/RootError";
import { Toaster } from "~/components/ui/toaster";
import { toastManager } from "~/hooks/use-toast";
import { SettingsProvider } from "~/lib/use-settings";
import appCss from "~/styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const INIT_THEME =
	`(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else if(t==="light"){document.documentElement.style.colorScheme="light"}else if(!t||t==="system"){var m=window.matchMedia("(prefers-color-scheme:dark)");if(m.matches){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}else{document.documentElement.style.colorScheme="light"}}}catch(e){}})()` as const;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "JobOrbit — Job Application Tracker" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: DocumentShell,
	component: RootComponent,
	errorComponent: RootError,
	notFoundComponent: NotFound,
});

function DocumentShell({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />

				<script
					dangerouslySetInnerHTML={{
						__html: INIT_THEME,
					}}
				/>
			</head>
			<body className="font-sans antialiased wrap-anywhere bg-background text-foreground">
				<ToastPrimitive.Provider toastManager={toastManager}>
					<SettingsProvider>
						{children}
						<Toaster />
					</SettingsProvider>
				</ToastPrimitive.Provider>
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
