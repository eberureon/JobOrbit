import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AppLayout } from "~/components/Sidebar";
import { Toaster } from "~/components/ui/toaster";
import appCss from "~/styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}else if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{var p=window.matchMedia('(prefers-color-scheme:dark)');if(p.matches){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}}}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JobOrbit — Job Application Tracker" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
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
  ),
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /> */}
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] bg-background text-foreground">
        <AppLayout>{children}</AppLayout>
        <Toaster />
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
