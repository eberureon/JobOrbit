import { Toast } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { SettingsProvider } from "~/lib/use-settings";

export function createWrapper() {
	return function Wrapper({ children }: { children: ReactNode }) {
		const [queryClient] = useState(
			() =>
				new QueryClient({
					defaultOptions: {
						queries: { retry: false },
					},
				}),
		);
		return (
			<QueryClientProvider client={queryClient}>
				<SettingsProvider>
					<Toast.Provider />
					{children}
				</SettingsProvider>
			</QueryClientProvider>
		);
	};
}
