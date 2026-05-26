import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	server: {
		port: 9000,
	},
	resolve: { tsconfigPaths: true },
	plugins: [
		...(process.env.NODE_ENV !== "production" ? [devtools()] : []),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
	test: {
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
	},
});

export default config;
